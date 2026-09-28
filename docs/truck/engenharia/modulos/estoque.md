---
title: "Estoque"
sidebar_position: 10
tags: [engenharia, estoque]
---

# Estoque

O contexto `stock`: catálogo de peças e categorias, unidades e fornecedores, e a fundação de saldo (depósitos + saldo por depósito). Movimentações, requisições e saldo real vêm depois. Produto: [Estoque](../../produto/modulos/estoque.md). Esquema completo: [schema-v2/estoque](../schema-v2/estoque.md).

## Modelo de dados

Entregue nesta fatia: `part_categories`, `units` (referência global, só leitura), `suppliers` (só tabela), `parts` e — como fundação, sem escrita ainda — `depots` e `stock_balances`.

- **`parts`**: o SKU. `part_number` é opcional; `cost_price numeric(14,2)` é o custo de referência **por unidade de consumo** (Opção A), `currency char(3)`, `minimum_qty numeric(14,4)` o ponto de reposição. `unique (id, org_id)` para as FKs compostas; SKU único por `parts_org_number_key (org_id, lower(part_number))` (nulos não colidem).
- **`stock_balances`**: `quantity`, `reserved_qty`, `average_cost` (custo médio móvel), `version`; PK `(depot_id, part_id)`; FKs compostas para `depots` e `parts` por `(id, org_id)` garantem mesma organização. RLS forçado.
- **Saldo** = soma de `stock_balances.quantity` por peça (0 hoje). **Custo de referência** (peça) × **custo médio do saldo** (`average_cost`) são coisas diferentes.

## Agregados e comandos

| Comando | Rota | Permissão | Invariantes |
| --- | --- | --- | --- |
| Cadastrar peça | `POST /parts` | `part.manage` | PLT-8, PLT-9 |
| Editar peça | `POST /parts/:id/edit` | `part.manage` | PLT-9 |
| Ativar/desativar peça | `POST /parts/:id/(deactivate\|reactivate)` | `part.manage` | PLT-9 |
| Listar/buscar peças | `GET /parts` | `part.view` | PLT-13 (custo) |
| Resumo (KPIs) | `GET /parts/summary` | `part.view` | PLT-13 (valor) |
| Categorias de peça | `POST /part-categories…` | `part.manage` | PLT-8, PLT-9 |

Custo e mínimo não vêm do cliente como estado inicial arbitrário: o DTO valida `cost_price`/`minimum_qty` ≥ 0. Toda escrita condicional por `version` (409 no conflito).

## Invariantes

- **PLT-13** (em produção aqui): `cost_price` só sai com `cost.view`; `stockValue` só com `stock.value_view` — senão, nulo. Gate no DTO de saída, testado em `parts.http.spec.ts`.
- **PLT-1/2/4/8/9/10** valem como em todo módulo (RLS, rota com permissão, idempotência, concorrência).
- Futuros (movimentações/requisições): STK-1 a STK-13, PLT-5.

## Eventos

| Evento | Quando | Consumidores |
| --- | --- | --- |
| — | (movimentações ainda não implementadas) | agregação de valor de estoque, alerta de reposição |

## Leitura e performance

`GET /parts` é **keyset por `(name, id)`** (`limit` máx 100, `nextCursor`), filtros no servidor (`status`, `q`, `categoryId`, `belowMinimum`). Índices `parts_org_active_name_idx (org_id, active, name, id)` e `parts_org_active_category_name_idx (org_id, active, category_id, name, id)` servem ordenação e filtro **sem `Seq Scan` e sem `Sort`** — provado em `parts.query-plans.spec.ts` (também para busca, categoria, abaixo do mínimo, cursor e summary). KPIs por contagens indexadas; **valor de estoque nunca é somado por varredura na requisição** (fica 0 até as movimentações e depois vira agregado por evento). Front usa `useInfiniteQuery` (scroll infinito) e um `GET /parts/summary` para as KPIs.

## Testes

`apps/api/test/stock/`: `parts.http.spec.ts` (CRUD, paginação por cursor, filtros, summary, gate de custo/valor), `parts.constraints.spec.ts` (checks e FKs compostas de `stock_balances`/`depots`), `parts.query-plans.spec.ts` (planos sem full scan), `part-catalog.http.spec.ts`. Isolamento/permissão por `test/platform/role-matrix.spec.ts`; RLS por `rls-coverage.spec.ts`. E2E `apps/web/e2e/stock.e2e.ts` (notebook e celular, com acessibilidade).

## Decisões

- [Convenção de custo por unidade](../../produto/propostas/part-cost-convention.mdx) — Opção A, custo por unidade de consumo, na peça.
- [ADR-013](../adrs/adr-013-orm-prisma.md) (Prisma, constraints e RLS em migration), [ADR-014](../adrs/adr-014-multiempresa-banco-compartilhado.md) (banco compartilhado com RLS).
