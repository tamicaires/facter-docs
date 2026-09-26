---
title: "ADR-013: Prisma 7 como ORM da v2"
sidebar_position: 13
tags: [adr, orm, prisma, performance, v2]
---

# ADR-013: Prisma 7 como ORM da v2

**Status:** Aprovado (26/09/2026)

## Contexto

O schema v2 depende de regras do banco (`check`, índices únicos parciais, `exclude using gist`, RLS) e a meta é performance altíssima. A escolha era entre Prisma, que o time já conhece, e Drizzle, uma camada mais fina sobre o SQL. Em vez de decidir por opinião, foi feita uma prova com os dois contra o banco da auditoria com volume realista.

## Prova

- **Banco:** `facter_truck_perf` (schema do v1): 100 mil OS, 400 mil serviços, 800 mil execuções, 200 mil requisições de peça. Postgres 17 local.
- **Versões estáveis:** Prisma 7.10.0 (com `@prisma/adapter-pg`), Drizzle ORM 0.45.3 e drizzle-kit 0.31.11, `pg` 8.23 como referência de SQL puro. Os dois leram o schema do banco (`prisma db pull`, `drizzle-kit pull`), sem mapeamento escrito à mão.
- **Consultas:** detalhe da OS (frota, serviços, executores, peças), lista paginada (20 OS com frota e número de serviços) e agregação (OS por status em 12 meses).
- **Medição:** 30 execuções de aquecimento; 200 a 300 em sequência e 200 a 300 com 20 simultâneas; p50 e p95 em ms e requisições por segundo. Uma segunda rodada passou por um proxy com atraso de rede (~1,5 a 3 ms por ida e volta), para simular API e banco em máquinas diferentes.
- **Código:** `docs/truck/engenharia/schema-v2/_prova-orm/` (fora do site, versionado).

### Resultados sem atraso de rede, 20 pedidos simultâneos

| Consulta | Prisma 7 (`relationJoins`) | Drizzle | SQL puro |
| --- | --- | --- | --- |
| Detalhe da OS | p50 6,0 · p95 14,3 · **3.035 req/s** | p50 11,0 · p95 37,1 · 1.463 req/s | p50 1,8 · p95 8,0 · 7.762 req/s |
| Lista de 20 OS | p50 3,3 · p95 5,8 · **5.033 req/s** | p50 6,5 · p95 7,4 · 3.054 req/s | p50 1,7 · p95 2,4 · 10.404 req/s |
| Contagem por status | p50 2,9 · p95 3,6 · 6.742 req/s | p50 2,6 · p95 3,7 · **7.215 req/s** | p50 2,4 · p95 3,3 · 7.676 req/s |

Com atraso de rede, os três ficam entre 5 e 6 ms de p50 em todas as consultas: a rede passa a dominar.

### Achados

1. **Prisma sem `relationJoins`:** o `_count` de uma lista gera uma subconsulta que agrega a tabela inteira (400 mil linhas) antes de filtrar: 77 ms de p50 em sequência e **25 req/s** sob carga. Com `relationJoins` ligado, 0,37 ms e 5.033 req/s.
2. **Drizzle:** as consultas com relações montam JSON aninhado no banco e pesam mais sob carga (p95 de 37 ms no detalhe). O `drizzle-kit pull` gerou código inválido para colunas de array de enum.
3. **SQL puro** é 2 a 3 vezes mais rápido sob carga que os dois ORMs nas consultas com relações.
4. O ORM custa milissegundos. Região, índices, tabelas de agregação e frontend pesam mais (ver [auditoria](../auditoria-2026-09.md#performance-medida)).

## Decisão

Usar **Prisma 7** na v2, com quatro regras obrigatórias:

1. **`relationJoins` sempre ligado**, com teste que falha se uma consulta de lista varrer a tabela inteira (checagem do plano de execução nas rotas quentes).
2. **Consultas quentes em SQL tipado** (TypedSQL): detalhe da OS, listas do kanban e agregações dos indicadores. É onde o SQL puro rende 2 a 3 vezes mais.
3. **Constraints e RLS em migrations SQL** (`check`, índices parciais, `exclude`, políticas), cada uma com teste de integração que tenta violá-la, porque o `schema.prisma` não as mostra.
4. **Lint que exige `@map`/`@@map` em snake_case** em todo campo e tabela.

## Alternativas consideradas

| Alternativa | Por que não |
| --- | --- |
| Drizzle | Declara `check`, índice parcial e RLS no schema, mas foi mais lento nas consultas com relações sob carga, teve bug na introspecção e o time não conhece |
| SQL puro com query builder (Kysely, `pg`) | Mais rápido, mas perde a produtividade do ORM no CRUD, que é a maior parte do código; o SQL puro entra só nas rotas quentes |

## Consequências

- **Positivas:** produtividade imediata (o time conhece), melhor desempenho medido nas consultas com relações, SQL tipado para o que precisa de mais velocidade.
- **Negativas:** regras do banco ficam fora do `schema.prisma` e dependem de testes para não se perderem; mapeamento snake_case exige disciplina.
- **Rever se:** a v2 precisar de algo que o Prisma não faça bem, ou se as rotas quentes não atingirem as metas de p95 mesmo com TypedSQL.
