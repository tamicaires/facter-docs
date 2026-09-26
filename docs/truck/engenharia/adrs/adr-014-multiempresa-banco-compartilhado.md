---
title: "ADR-014: Multiempresa em banco compartilhado com RLS"
sidebar_position: 14
tags: [adr, multiempresa, rls, seguranca, banco]
---

# ADR-014: Multiempresa em banco compartilhado com RLS

**Status:** Aprovado (26/09/2026)

## Contexto

Todas as organizações precisam ficar isoladas umas das outras, mas o produto vende justamente o compartilhamento controlado entre elas (ADR-011). No v1, o isolamento dependia de um middleware com lista manual de models e vazou dados entre empresas (auditoria 2026-09).

## Decisão

Um banco compartilhado, com `org_id` em toda tabela de negócio e **Row Level Security** do Postgres:

1. A aplicação conecta com um usuário que **não é dono** das tabelas e não tem `BYPASSRLS`; as tabelas usam `force row level security`. Migrações rodam com outro usuário.
2. O contexto da organização é definido com `set local app.org_id` **dentro de cada transação** (compatível com pooler em modo transação). Sem contexto, nada é devolvido.
3. Toda rota tem teste de isolamento gerado: a organização B tenta ler e alterar dados da A, e o teste precisa falhar.
4. O compartilhamento entre organizações passa só pelas visões compartilhadas (ADR-011), nunca por exceção no RLS.

## Alternativas consideradas

| Alternativa | Por que não |
| --- | --- |
| Um schema por empresa | Migração vezes N; consultas do ecossistema e do grupo econômico cruzam schemas; catálogo do Postgres incha com milhares de tabelas |
| Um banco por empresa | Custo de infraestrutura por cliente; ecossistema ainda mais difícil |

## Consequências

- Custo e operação mínimos; ecossistema e grupo econômico são consultas normais.
- A segurança depende de fazer o RLS do jeito certo: os testes de isolamento são obrigatórios na definição de pronto.
- **Banco dedicado** pode ser oferecido depois como opção de contrato enterprise: como todo dado tem `org_id`, mover uma organização é copiar as linhas dela.
