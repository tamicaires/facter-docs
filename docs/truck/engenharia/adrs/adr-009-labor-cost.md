---
title: "ADR-009: Custeio de Mão de Obra na OS"
sidebar_position: 9
tags: [adr, custo, mao-de-obra, os, colaborador, cargo, permissoes]
---

# ADR-009: Custeio de Mão de Obra na OS

**Status:** Aprovado (Agosto 2026)

---

## Contexto

O custo de uma OS é `Peças + Mão de obra`. As peças já são materializadas (custo real da
solicitação), mas a **mão de obra é um valor de _seed_** (fixo, não real) — todo custo e
relatório que envolve MO está incorreto.

As **horas já existem** (`ServiceExecutionLog.actualDurationHours`, horas-homem por colaborador
por serviço). Falta só o **valor/hora** para `custo de MO = horas × valor/hora`. A decisão é
sobre a origem do valor/hora e como cadastrá-lo com segurança.

Detalhes de pesquisa e opções na proposta [Custeio de Mão de Obra](../../produto/propostas/labour-cost).

---

## Decisão

**Valor/hora com _default no cargo_ e _override opcional por colaborador_**, cadastrado numa
área protegida pela permissão de custo. Custo materializado numa segunda fase.

---

## Decisões Arquiteturais

| # | Decisão | Justificativa |
|---|---------|---------------|
| 1 | Valor/hora **default no `Job` (cargo)** + **override opcional no `Employee`** | Pouca manutenção de cadastro (poucos cargos) e não expõe salário individual. Padrão Limble (categoria por função). |
| 2 | Resolução `employee.hourlyLaborRate ?? job.hourlyLaborRate` | Override prevalece quando preenchido; senão herda o cargo. |
| 3 | Rate cadastrado é o **custo carregado** (salário + encargos) | Salário bruto subestima o custo real em ~20–40%. |
| 4 | Cadastro do rate por **endpoint dedicado gateado por `Manage/CostCenter`** (não gate de campo) | O sistema não tem gate por campo; gatear o endpoint inteiro é o padrão existente. Protege dado quase-salarial atrás do financeiro, mantendo o campo nos forms de cargo/colaborador só para quem tem custo. |
| 5 | Custo materializado a partir do **tempo líquido** (não do `actualDurationHours` bruto) | O campo atual é `fim − início` (inclui pausas) → superfaturaria (~+28%). Tempo líquido vem das transições de estado (`pauseReason`). |
| 6 | Custo snapshotado na OS ao lançar | Reajuste futuro não reescreve o custo de OS já fechadas. Casa com o fechamento de competência (rateio). |
| 7 | Grava em `WorkOrder.labourCost`; oficina **terceirizada** fica fora (usa `externalCost`) | Terceirizada é outro modelo (cobra por preço/tabela, não pela nossa hora) → fase futura. |

---

## Escopo (fases)

- **Fase 1 (aprovada):** cadastro do valor/hora — campo no cargo + override no colaborador,
  gateado por `CostCenter` (endpoints dedicados). Só persiste e resolve o valor.
- **Fase 2:** materialização `horas líquidas × valor/hora → WorkOrder.labourCost` (evento,
  análogo à materialização de peças, FACTRK-8), resolvendo antes a dívida técnica do tempo
  bruto.
- **Fora de escopo:** oficina terceirizada (ver [Backlog & Ideias](../../produto/backlog)).

---

## Consequências

**Positivas**
- Custo de MO real, com pouca fricção de cadastro e privacidade salarial.
- Base comum com a análise de produtividade (mesma hora-homem).
- Não fecha porta para terceirizada (costura via `externalCost`).

**Negativas / dívidas**
- Depende de resolver o tempo **líquido** antes da Fase 2 (dívida técnica do `ServiceExecution`).
- Rate por cargo é um proxy — dispersão salarial dentro do cargo só é capturada via override.

---

## Referências

- Proposta: [Custeio de Mão de Obra](../../produto/propostas/labour-cost)
- Backlog (terceirizada, tempário, dívida técnica): [Backlog & Ideias](../../produto/backlog)
- Relacionado: ADR-007 (Cost Center System)
