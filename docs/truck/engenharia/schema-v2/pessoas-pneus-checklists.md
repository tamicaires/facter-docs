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
  id                 uuid primary key,
  org_id             uuid not null references organizations(id),
  name               text not null,
  auto_pause_breaks  boolean not null default false,   -- pausa sozinha as sessões no intervalo; "Voltar" retoma
  unique (org_id, name)
);

create table shift_segments (                  -- trechos do turno: trabalho e intervalos
  id            uuid primary key,
  org_id        uuid not null references organizations(id),
  shift_id      uuid not null references shifts(id),
  weekday       smallint not null check (weekday between 1 and 7),   -- ISO: 1 = segunda
  starts_at     time not null,
  ends_at       time not null,                 -- menor que starts_at = termina no dia seguinte (turno da noite)
  kind          text not null check (kind in ('work','meal_break','rest_break')),
  check (starts_at <> ends_at)
);

create table org_holidays (                    -- feriados: sem horas disponíveis e com adicional de feriado
  id            uuid primary key,
  org_id        uuid not null references organizations(id),
  day           date not null,
  base_id       uuid references bases(id),     -- feriado municipal só numa base; null = todas
  name          text not null,
  unique nulls not distinct (org_id, day, base_id)
);

create table labor_premiums (                  -- adicionais sobre o custo/hora do cargo
  id            uuid primary key,
  org_id        uuid not null references organizations(id),
  kind          text not null check (kind in ('overtime','night','sunday_holiday')),
  multiplier    numeric(5,2) not null check (multiplier >= 1),   -- ex.: 1.50 hora extra, 1.20 noturno
  window_start  time,                          -- só para night (padrão CLT: 22:00)
  window_end    time,                          -- só para night (padrão CLT: 05:00)
  valid_during  daterange not null,
  exclude using gist (org_id with =, kind with =, valid_during with &&)
);
```

- **Horas disponíveis** do mecânico no dia = soma dos trechos `work` do turno, sem os intervalos, e zero em feriado (indicador 11).
- **Intervalo não é tempo perdido:** as pausas `meal_break` e `rest_break` são planejadas (ver `pause_reasons` em [manutenção](./manutencao.md#executores-e-sessões-de-trabalho)). Para o **veículo**, o tempo parado conta tudo, inclusive o almoço, porque ele continua fora de operação.
- **Custo de mão de obra de uma sessão** = minutos × custo/hora do cargo × adicional de cada trecho: fora dos trechos `work` do turno é hora extra, dentro da janela noturna é noturno, em domingo ou feriado é o adicional de feriado (o maior vale quando se sobrepõem). Calculado e congelado ao fechar a sessão (SVC-10).

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
  id                uuid primary key,
  org_id            uuid not null references organizations(id),
  item_id           uuid not null references tires(item_id),
  vehicle_id        uuid references vehicles(id),          -- onde estava na inspeção (null = em estoque)
  wheel_position_id uuid references wheel_positions(id),
  meter_value       numeric(12,1),                          -- km do pneu na inspeção: base do desgaste por km
  tread_points_mm   numeric(4,1)[] not null check (cardinality(tread_points_mm) between 1 and 4),  -- sulcos medidos
  tread_min_mm      numeric(4,1) generated always as (least(tread_points_mm[1], tread_points_mm[2], tread_points_mm[3], tread_points_mm[4])) stored,
  pressure_psi      numeric(5,1),
  inspected_at      timestamptz not null,
  actor_id          uuid not null references actors(id)
);
```

- Status e localização do pneu são os do `serialized_items`: um campo cada (TIR-3), sem a versão legada paralela do v1.
- **Km do pneu:** soma do km do veículo em que esteve instalado, período a período. Em implemento, o km vem do próprio hodômetro de cubo ou dos engates (AST-12). Base do CPK de pneu.
- **Desgaste por km** (mm por 1.000 km) = queda do sulco mínimo entre duas inspeções ÷ km rodado entre elas. Por isso a inspeção guarda posição e km.
- **Estepe** é uma posição do veículo ([ativos](./ativos.md#eixos-e-posições-de-roda)): pneu no estepe continua rastreado.
- **Recapagem:** envio e retorno são eventos com o fornecedor de recapagem e o custo; o retorno incrementa `life_number` na mesma transação.

## Checklists

```sql
create table checklist_templates (
  id            uuid primary key,
  org_id        uuid not null references organizations(id),
  name          text not null,
  applies_to    text[] not null,               -- tipos de veículo
  active        boolean not null default true
);

create table checklist_template_versions (     -- publicar uma mudança cria versão nova; a antiga não muda (CHK-1)
  id            uuid primary key,
  org_id        uuid not null references organizations(id),
  template_id   uuid not null references checklist_templates(id),
  version_no    int not null,
  published_by  uuid not null references actors(id),
  published_at  timestamptz not null default now(),
  unique (template_id, version_no)
);

create table checklist_template_items (        -- itens pertencem a uma versão e nunca são editados
  id            uuid primary key,
  org_id        uuid not null references organizations(id),
  template_version_id uuid not null references checklist_template_versions(id),
  position      smallint not null,
  label         text not null,
  component_id  uuid references components(id),
  safety        boolean not null default false,        -- item de segurança: base de indicador de ESG
  suggested_service_type_id uuid references service_types(id),   -- serviço criado se não conforme
  requires_photo boolean not null default false,
  unique (template_version_id, position)
);

create table checklists (                      -- execução
  id            uuid primary key,
  org_id        uuid not null references organizations(id),   -- no v1 não tinha org
  template_version_id uuid not null references checklist_template_versions(id),
  work_order_id uuid references work_orders(id),
  vehicle_id    uuid references vehicles(id),
  trailer_set_id uuid references trailer_sets(id),
  status        text not null check (status in ('in_progress','completed','canceled')),
  started_by    uuid not null references actors(id),
  started_at    timestamptz not null default now(),
  completed_at  timestamptz,
  version       int not null default 0
);
create unique index on checklists (work_order_id, template_version_id) where status <> 'canceled';

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

A foto de um item vai em `attachments.checklist_result_id` ([manutenção](./manutencao.md#serviços-externos-custos-e-fotos)). Item com `requires_photo` não fecha sem foto (CHK-2). A execução aponta a versão usada, e os itens daquela versão nunca mudam: o histórico mostra exatamente o que foi perguntado (CHK-1).

## Decidido em 26/09/2026

- **Checklist sem OS** é permitido (inspeção de pátio, saída de viagem); a OS nasce só se houver não conformidade.
- **Foto obrigatória** é definida pelo modelo; itens de segurança exigem foto por padrão.
