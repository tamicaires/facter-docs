---
title: "Módulos e planos"
sidebar_position: 2
tags: [modulos, planos, preco, produto]
---

# Módulos e planos

Cada organização contrata os módulos que usa. A Oficina está sempre incluída e funciona sozinha; os demais se somam a ela. Corte decidido em 26/09/2026. No schema, é a tabela `org_features` ([plataforma](../engenharia/schema-v2/plataforma-e-ecossistema.md#planos-e-funcionalidades)).

| Módulo | O que tem | Depende de | Para quem |
| --- | --- | --- | --- |
| **Oficina** (sempre incluída) | Ativos e conjuntos, OS, serviços, executores e sessões, fotos, notas, OS em PDF, pessoas e turnos, indicadores essenciais | — | Todos |
| **Estoque** | Peças, depósitos, livro de movimentações, requisições, itens serializados | Oficina | Quem tem almoxarifado (ex.: Suzano, JSL) |
| **Pneus** | Ciclo de vida, vidas, recapagem, inspeções, CPK de pneu | Oficina + Estoque | Quem é dono dos pneus |
| **Checklists** | Modelos, execução, não conformidade que vira serviço | Oficina | Quem inspeciona |
| **Rateio** | Pool mensal de material compartilhado, parcelas por veículo | Estoque | Quem tem material compartilhado |
| **Ecossistema** | Compartilhamento por nível, solicitação entre organizações, estoque consignado | Oficina | Embarcadores e redes de oficinas |
| **Gestão avançada** (depois) | Analytics completo, preventiva, socorro, integrações | — | Futuro, com "Quero isso" |

**Regras:**

- A Oficina funciona sem Estoque: a OS aceita **peça avulsa** (descrição, quantidade e custo) para o custo continuar certo.
- Módulo não contratado aparece como "Disponível no plano X" ou "Em breve", com o botão "Quero isso": o sistema vende o próprio upgrade.
- Exemplo: a Vale das Carretas contrata só a Oficina e usa o almoxarifado da Suzano pelo Ecossistema, sem pagar Estoque.

**Preço (hipótese):** base da Oficina por veículo ativo (ou por frota atendida, para oficina terceira) mais adicional por módulo; o Ecossistema é um plano para embarcadores que inclui os parceiros convidados. Valores em [economia do produto](../projeto/economia-do-produto.md).
