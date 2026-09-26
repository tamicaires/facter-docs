---
title: "Rateio e leitura"
sidebar_position: 7
tags: [schema, v2, rateio, indicadores, agregacoes, leitura]
---

# Rateio e leitura

Os indicadores nunca varrem o histórico na requisição: tabelas de agregação por dia são atualizadas pelo worker a partir do outbox, e as telas leem delas. O rateio usa o livro de movimentações com data de consumo e preço congelado, cortando o mês no fuso da organização.

## Rateio

```sql
create table allocation_settings (
  org_id        uuid primary key references organizations(id),
  base          text not null default 'direct_cost' check (base in ('direct_cost','work_order_count','equal'))
);

create table allocation_periods (
  id            uuid primary key,
  org_id        uuid not null references organizations(id),
  month         date not null,                 -- primeiro dia do mês, no fuso da organização
  status        text not null check (status in ('open','closed')),
  pool          numeric(14,2),                 -- soma do consumo de categorias "shared" no mês
  base          text,
  closed_by     uuid references actors(id),
  closed_at     timestamptz,
  unique (org_id, month)
);

create table allocation_shares (               -- parcela de cada veículo no mês fechado
  period_id     uuid not null references allocation_periods(id),
  org_id        uuid not null references organizations(id),
  vehicle_id    uuid not null references vehicles(id),
  amount        numeric(14,2) not null,
  primary key (period_id, vehicle_id)
);
```

- O pool vem de `stock_movements` de categorias `shared`, pelo `consumed_at` no mês (no v1 era pela data da requisição e com preço atual).
- A última parcela absorve o arredondamento: a soma das parcelas é igual ao pool.
- Reabrir um mês fechado é um comando com autor e motivo; o fechamento anterior fica no histórico, nunca é sobrescrito.

## Agregações dos indicadores

```sql
create table daily_vehicle_facts (             -- uma linha por veículo por dia, no fuso da organização
  org_id              uuid not null references organizations(id),
  vehicle_id          uuid not null references vehicles(id),
  day                 date not null,
  km                  numeric(12,1) not null default 0,     -- derivado dos engates para implementos
  downtime_minutes    int not null default 0,               -- da entrada na fila à saída (indicador 4)
  queue_minutes       int not null default 0,
  maintenance_minutes int not null default 0,
  paused_minutes      jsonb not null default '{}',          -- por motivo (indicador 7)
  cost_parts          numeric(14,2) not null default 0,
  cost_labor          numeric(14,2) not null default 0,
  cost_external       numeric(14,2) not null default 0,
  cost_allocation     numeric(14,2) not null default 0,
  billed_amount       numeric(14,2) not null default 0,     -- ponto de vista do dono (ECO-6)
  services_completed  int not null default 0,
  services_rework     int not null default 0,
  primary key (org_id, vehicle_id, day)
);

create table daily_employee_facts (
  org_id            uuid not null references organizations(id),
  employee_id       uuid not null references employees(id),
  day               date not null,
  worked_minutes    int not null default 0,
  available_minutes int not null default 0,                -- do turno (indicador 11)
  primary key (org_id, employee_id, day)
);

create table recurring_failures (              -- indicador 6, recalculado quando um serviço é concluído
  org_id            uuid not null references organizations(id),
  vehicle_id        uuid not null references vehicles(id),
  component_id      uuid not null references components(id),
  occurrences       int not null,
  first_at          timestamptz not null,
  last_at           timestamptz not null,
  primary key (org_id, vehicle_id, component_id)
);
```

| Indicador | Fonte |
| --- | --- |
| 1 Custo por veículo e frota | `daily_vehicle_facts.cost_*` (ou `billed_amount` para o dono) |
| 2 CPK | custo ÷ `km` no período |
| 3 Composição do custo | `cost_*` por tipo |
| 4 Disponibilidade | `downtime_minutes` ÷ minutos do período |
| 5 Veículos que mais pararam | ranking de `downtime_minutes` |
| 6 Falhas recorrentes | `recurring_failures` com a janela da organização |
| 7 Tempo na oficina por motivo | `queue_minutes`, `maintenance_minutes`, `paused_minutes` |
| 8 Fila agora | `work_orders` abertas (consulta direta, poucas linhas) |
| 9 Lead time | transições da OS, agregadas por OS fechada |
| 10 Retrabalho | `services_rework` ÷ `services_completed` |
| 11 Horas trabalhadas × disponíveis | `daily_employee_facts` |
| 12 Corretiva × preventiva | `work_orders.kind` por período |
| 13 Não conformidades | `checklist_results` agregados |

- **Idempotência:** cada evento do outbox atualiza as agregações uma vez; reprocessar um dia inteiro a partir dos fatos é um comando, e o resultado tem de bater (é o teste de cada indicador).
- **Exportação CSV** (item de confiança) sai destas tabelas, filtrada pelo período e pela organização.
- **Resumo semanal por e-mail** lê destas tabelas.
- **Ponto de vista:** consultas do dono de um ativo atendido por oficina terceira leem da visão compartilhada, com `billed_amount`; consultas da oficina, com custo interno.

## Pontos para decidir

- Granularidade diária basta para os 13 indicadores; por hora só se aparecer um indicador de turno.
- Janela de falhas recorrentes vem de `organizations` (padrão 90 dias ou 20 mil km), configurável.
