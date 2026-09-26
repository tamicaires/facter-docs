---
title: "Pessoas, pneus e checklists"
sidebar_position: 6
tags: [schema, v2, pessoas, cargos, turnos, pneus, checklists]
---

# Pessoas, pneus e checklists

Pessoas sustentam o custo de mão de obra (sessões × custo/hora congelado) e o indicador de horas trabalhadas × disponíveis. Pneus são itens serializados com extensões próprias. Checklists geram serviço a partir de não conformidade, o que no v1 não acontecia.

## Pessoas

```sql
create table job_titles (
  id            uuid primary key,
  org_id        uuid not null references organizations(id),
  name          text not null,
  unique (org_id, name)
);

create table job_title_rates (                 -- custo/hora com histórico (ADR-009); sessão congela o vigente
  id            uuid primary key,
  org_id        uuid not null references organizations(id),
  job_title_id  uuid not null references job_titles(id),
  hourly_cost   numeric(14,2) not null check (hourly_cost >= 0),
  currency      char(3) not null,
  valid_during  daterange not null,
  exclude using gist (job_title_id with =, valid_during with &&)
);

create table employees (
  id            uuid primary key,
  org_id        uuid not null references organizations(id),
  name          text not null,                 -- sem unique por nome: dois "José da Silva" podem existir
  registration  text,                          -- matrícula: login por PIN e busca
  job_title_id  uuid not null references job_titles(id),
  base_id       uuid references bases(id),
  shift_id      uuid references shifts(id),
  active        boolean not null default true,
  unique (org_id, registration)
);

create table shifts (
  id            uuid primary key,
  org_id        uuid not null references organizations(id),
  name          text not null,
  weekly_schedule jsonb not null,              -- dias e horários (time), base das horas disponíveis
  unique (org_id, name)
);
```

## Pneus

O pneu é um `serialized_item` ([estoque](./estoque.md#itens-serializados)) com uma extensão 1:1. Instalação, remoção, rodízio, envio e retorno de recapagem e baixa são `serialized_item_events` com chave de idempotência (TIR-2): três retornos simultâneos da recapagem viram um só.

```sql
create table tires (
  item_id           uuid primary key references serialized_items(id),
  org_id            uuid not null references organizations(id),
  fire_number       text,                      -- número de fogo
  dimension         text,
  tread_pattern     text,
  dot_week          smallint check (dot_week between 1 and 53),
  dot_year          smallint,
  life_number       smallint not null default 0 check (life_number >= 0),   -- 0 = novo; cada recapagem +1
  initial_tread_mm  numeric(4,1),
  current_tread_mm  numeric(4,1),
  purchase_cost     numeric(14,2),
  unique (org_id, fire_number)                 -- TIR-1: por organização, não global como no v1
);

create table tire_inspections (
  id              uuid primary key,
  org_id          uuid not null references organizations(id),
  item_id         uuid not null references tires(item_id),
  tread_mm        numeric(4,1) not null check (tread_mm >= 0),
  pressure_psi    numeric(5,1),
  inspected_at    timestamptz not null,
  actor_id        uuid not null references actors(id)
);
```

- Status e localização do pneu são os do `serialized_items`: um campo cada (TIR-3), sem a versão legada paralela do v1.
- **Km do pneu:** soma do km do veículo em que esteve instalado, período a período. Em implemento, o km vem dos engates (AST-12). Base do CPK de pneu.
- **Recapagem:** envio e retorno são eventos com o fornecedor de recapagem e o custo; o retorno incrementa `life_number` na mesma transação.

## Checklists

```sql
create table checklist_templates (
  id            uuid primary key,
  org_id        uuid not null references organizations(id),
  name          text not null,
  applies_to    text[] not null,               -- tipos de veículo
  active        boolean not null default true,
  version_no    int not null default 1          -- execução guarda a versão usada
);

create table checklist_template_items (
  id            uuid primary key,
  org_id        uuid not null references organizations(id),
  template_id   uuid not null references checklist_templates(id),
  position      smallint not null,
  label         text not null,
  component_id  uuid references components(id),
  safety        boolean not null default false,        -- item de segurança: base de indicador de ESG
  suggested_service_type_id uuid references service_types(id),   -- serviço criado se não conforme
  requires_photo boolean not null default false,
  unique (template_id, position)
);

create table checklists (                      -- execução
  id            uuid primary key,
  org_id        uuid not null references organizations(id),   -- no v1 não tinha org
  template_id   uuid not null references checklist_templates(id),
  template_version int not null,
  work_order_id uuid references work_orders(id),
  vehicle_id    uuid references vehicles(id),
  trailer_set_id uuid references trailer_sets(id),
  status        text not null check (status in ('in_progress','completed','canceled')),
  started_by    uuid not null references actors(id),
  started_at    timestamptz not null default now(),
  completed_at  timestamptz,
  version       int not null default 0
);
create unique index on checklists (work_order_id, template_id) where status <> 'canceled';

create table checklist_results (
  id              uuid primary key,
  org_id          uuid not null references organizations(id),
  checklist_id    uuid not null references checklists(id),
  template_item_id uuid not null references checklist_template_items(id),
  vehicle_id      uuid references vehicles(id),          -- qual implemento do conjunto
  result          text not null check (result in ('conform','non_conform','not_applicable')),
  note            text,
  generated_service_id uuid references service_executions(id),   -- não conforme → serviço na OS
  recorded_by     uuid not null references actors(id),
  recorded_at     timestamptz not null default now(),
  unique (checklist_id, template_item_id, vehicle_id)
);
```

Não conformidade com `suggested_service_type_id` cria o serviço na OS com um toque, com componente já preenchido (registrar sem atrito).

## Pontos para decidir

- **Checklist sem OS** (inspeção de pátio, saída de viagem) é permitido? A proposta permite: a OS é criada só se houver não conformidade.
- **Foto obrigatória por item** fica a critério do modelo; itens de segurança podem exigir foto por padrão.
