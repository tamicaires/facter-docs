---
title: "Estoque"
sidebar_position: 10
tags: [produto, estoque]
---

# Estoque

As peças que a oficina consome, como se agrupam e quanto custam — o cadastro que sustenta requisição, movimentação e custo por veículo. Quem cuida é o **almoxarife**.

**Status:** Em construção · **Desde:** 2026-09 (task 2.5)

## Para quem

| Papel | O que faz aqui |
| --- | --- |
| Almoxarife | Cadastra peças e categorias, define custo e mínimo, vê saldo e o que está abaixo do mínimo |
| Gestor / Admin | Vê o catálogo e os indicadores de estoque (itens, valor, abaixo do mínimo) |
| Mecânico / Consultor | Vê a peça para pedir na OS; **não** vê o custo (sem `cost.view`) |

## Fluxos

1. **Nova peça** — nome, categoria, unidade de estoque × unidade de consumo × fator, **custo por unidade de consumo** e **saldo mínimo**. Entra no catálogo; o saldo começa em zero.
2. **Categorias de peça** — agrupam as peças e dizem se o custo é direto ou rateado.
3. **Fornecedores** — cadastro leve (nome + CNPJ opcional + contato). O **CNPJ** é o que casa a NF-e ao fornecedor na entrada, sem digitar; sem ele, vincula-se à mão. Criação/edição/desativação, busca por nome ou CNPJ, lista paginada por cursor.
4. **Buscar e filtrar** — busca por nome ou SKU (no servidor), filtro por categoria e por "abaixo do mínimo"; a lista rola infinito (paginação por cursor).
5. Entrada de compra, requisições, depósitos e movimentações: **a seguir** (o botão e as abas já aparecem como próximo passo).

## Regras de negócio

- **Custo por unidade de consumo** (Opção A): o custo é o do litro/kg/un consumido; o valor de estoque aplica o fator. Uma peça, um custo, um mínimo.
- **Abaixo do mínimo** salta em âmbar. Hoje, sem movimentações, o saldo é 0, então "abaixo do mínimo" é toda peça com mínimo definido; quando a movimentação entrar, passa a comparar o saldo real.
- **Preço congela na entrada** (STK-6): reajuste depois não muda OS nem movimento passado.
- **Histórico não se apaga**: peça desativada some das escolhas mas o histórico fica; correção será estorno.

## Permissões

| Ação | Papéis padrão |
| --- | --- |
| Ver peças (`part.view`) | Almoxarife, gestor, admin, mecânico, consultor |
| Cadastrar/editar peças e categorias (`part.manage`) | Almoxarife, admin |
| Ver fornecedores (`supplier.view`) | Almoxarife, gestor, admin |
| Cadastrar/editar fornecedores (`supplier.manage`) | Almoxarife, gestor, admin |
| Ver **custo** da peça (`cost.view`) | Almoxarife, gestor, admin, financeiro |
| Ver **valor em estoque** (`stock.value_view`) | Almoxarife, gestor, admin, financeiro |

Sem `cost.view`/`stock.value_view`, o custo e o valor **não saem da API** (vêm nulos, ver [PLT-13](../../engenharia/invariantes.md)).

## Indicadores

Painel do almoxarife: **itens em catálogo**, **valor em estoque**, **abaixo do mínimo**, **requisições abertas**. As contagens vêm de `GET /parts/summary`; o valor de estoque será mantido por evento quando as movimentações existirem (definição em [engenharia/estoque](../../engenharia/modulos/estoque.md)).

## Limites conhecidos

- Sem saldo real ainda (depende das movimentações); saldo mostra 0.
- Entrada por nota fiscal, requisições, depósitos e movimentações ainda não implementados (desenhados no [mockup de entrada por NF](/telas/truck/entrada-nf)).

## Histórico

| Data | Mudança | PR / ADR |
| --- | --- | --- |
| 2026-09 | Catálogo de peças e categorias; custo/mínimo na peça (Opção A); paginação por cursor; gate de custo/valor | task 2.5 |
| 2026-09 | Fornecedores (cadastro: nome + CNPJ único + contato), aba no Estoque | frente Entrada por NF-e |
