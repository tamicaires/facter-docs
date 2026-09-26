---
title: "<Nome do módulo>"
sidebar_position: 10
tags: [engenharia, <modulo>]
---

<!-- Modelo: copie para docs/truck/engenharia/modulos/<modulo>.md. Pastas com "_" não entram no site. -->

# <Nome do módulo>

<Uma frase: responsabilidade do módulo e seus limites.> Produto: [<nome>](../../produto/modulos/<modulo>.md).

## Modelo de dados

<Tabelas, relações e constraints relevantes. Diagrama quando ajudar.>

## Agregados e comandos

| Comando | Rota | Permissão | Invariantes |
| --- | --- | --- | --- |
| | `POST /...` | `modulo.acao` | WO-1 |

## Invariantes

<Lista dos ids de [invariantes](../invariantes.md) que este módulo garante e como (banco, domínio, verificação).>

## Eventos

| Evento | Quando | Consumidores |
| --- | --- | --- |
| | | |

## Leitura e performance

<Rotas quentes, índices que as sustentam, tabelas de agregação, metas de p95.>

## Testes

<Onde estão os testes de integração, concorrência e isolamento deste módulo; jornadas E2E que o cobrem.>

## Decisões

<ADRs que afetam o módulo.>
