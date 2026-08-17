---
title: Backlog & Ideias (parking lot)
sidebar_position: 20
tags: [truck, produto, backlog, ideias, decisoes]
---

# Backlog & Ideias — parking lot

Lugar pra **não perder ideias e decisões** que surgem nas discussões mas ainda **não entram**
numa proposta/task específica. Cada item diz **o quê**, **por que foi adiado** e **o gatilho**
pra retomar — pra quando voltar, ninguém precisar reconstruir o raciocínio.

> Não é backlog de execução (isso é o [facter-tasks](https://tasks.facter.com.br)). É o
> **caderno de "guardar pra depois com contexto"**.

---

## 1. Mão de obra — oficina terceirizada (Fase 2)

**O quê:** o app pode gerenciar oficinas **terceirizadas** (a contratante manda serviço pra
fora). A peça é da contratante (mesma conta), mas a **MO muda**: a terceirizada cobra por
**preço fechado / tabela por serviço / nota fiscal**, não pela nossa hora. Exigiria: cadastro de
oficina externa, tabela de preço por serviço, possível aprovação de orçamento, e marcar a
**origem** de cada OS (própria vs qual terceirizada).

**Por que adiado:** cada empresa do ramo cobra terceirizada diferente → construir agora é
chutar a abstração (boa abstração vem de **2–3 casos reais**). MO própria é o 80% que todo
cliente precisa; a estrutura externa é grande e atrasaria o valor.

**Costura atual (já existe):** o campo `externalCost` na OS aceita a fatura da terceirizada como
número manual — sem estrutura nova, sem fechar porta.

**Gatilho pra retomar:** um cliente real pedir controle estruturado de terceirizada (aí a gente
tem as regras dele na mão pra generalizar).

**Origem:** discussão da proposta [Custeio de Mão de Obra](propostas/labour-cost).

---

## 2. Tempo / valor padrão por serviço (tempário)

**O quê:** cada serviço ter um **tempo padrão** ("troca de embreagem = 4h") ou um **preço de
referência**. Serve pra: (a) **orçar a OS antes** de executar, (b) **medir eficiência** (horas
reais vs padrão) e (c) ser a base de preço pra **terceirizada**.

**Por que adiado:** o **custo real próprio não precisa disso** — ele sai de `horas reais ×
R$/hora`. Tempo padrão é uma **camada a mais**, de estimativa/eficiência, não de custo realizado.

**Gatilho pra retomar:** quando quiserem **orçamento pré-OS** ou **indicador de eficiência**; ou
junto da Fase 2 (terceirizada), onde a tabela de preço por serviço é o modelo natural.

**Origem:** discussão sobre "valor do serviço" vs custo real (intuição de produto que estava
certa — só era pro caso da terceirizada).

---

## 3. Dívida técnica — modelagem do `ServiceExecution`

**O quê:** limpezas na família `ServiceExecution` (encontradas ao analisar as horas de MO):

1. **`actualDurationHours` é bruto** (inclui pausas) — pro custo/produtividade precisa do
   **líquido**. Calculado em 2 lugares (`change-assigments-status.ts`,
   `service-execution-logger.listener.ts`).
2. **Duas tabelas de transição** quase idênticas (execução vs colaborador) — status da execução
   parece derivável do dos colaboradores.
3. **`status` duplicado** (na execução e no colaborador) — definir a fonte da verdade.
4. **Colunas legadas** `service_assignment_id` (do rename `ServiceAssignment → ServiceExecution`).

**Por que adiado:** não bloqueia nada hoje; o item (1) vira requisito **quando** o custo de MO
for implementado.

**Gatilho pra retomar:** implementação do custo de MO (precisa do tempo líquido) — resolver (1)
junto; (2)–(4) quando tocar nessa área.

**Origem:** [proposta de MO — Nota técnica](propostas/labour-cost).

---

## 4. Custo por unidade — bug de conversão (#10)

**O quê:** peças com `conversionFactor ≠ 1` (estoque em balde, consumo em litro) têm o custo de
consumo inconsistente — hoje `approvedQuantity × costPrice` vs valor de estoque
`stockQuantity × costPrice`. Corrigir para uma convenção única.

**Status:** tem **proposta própria** em discussão → [Convenção de Custo por
Unidade](propostas/part-cost-convention). Aguarda a decisão de produto (costPrice por estoque
ou por consumo).

**Origem:** análise que precede o custo real (afeta peças já no ar).

---

## 5. RBAC de custo (junto do #9)

**O quê:** gatear **valor/hora** e **custo de MO** por permissão de custo (padrão de mercado —
custo por OS quase revela salário). Implementar junto do custeio de MO.

**Gatilho:** implementação do #9.
