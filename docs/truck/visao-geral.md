---
title: "Visão geral"
sidebar_position: 0
tags: [truck, visao-geral]
---

# Facter Truck

O Facter Truck é um sistema de gestão de manutenção para transportadoras: organiza a oficina (fila, boxes, ordens de serviço, mecânicos), o estoque de peças e pneus, e mostra quanto custa manter cada veículo e carreta.

**Estado em setembro de 2026:** o v1 roda em homologação e ainda não tem cliente real. A [auditoria de 2026-09](./engenharia/auditoria-2026-09.md) concluiu que o v1 não está pronto para lançar, e a proposta é construir a v2 do núcleo ([ADR-010](./engenharia/adrs/adr-010-v2-do-nucleo.md), em discussão). O lançamento está previsto para o começo de 2027.

## O que o Truck vende

Informação para decisão. Hoje o cliente controla a manutenção em vários sistemas e planilhas separados: um para serviços mal feitos, planilhas para planejamento, outro sistema para o resto. O Truck junta tudo e rastreia o máximo possível por veículo e por frota: quanto cada um custa, onde a oficina perde tempo, o que está falhando de forma recorrente, onde investir e onde não. O objetivo é previsibilidade, identificar um problema antes que vire um problema maior.

## Ecossistema

O Truck atende várias partes que se relacionam: embarcadores (ex.: Suzano), transportadoras com manutenção própria (ex.: JSL) ou terceirizada, oficinas terceirizadas (ex.: Vale das Carretas) e socorro terceirizado. Cada organização é dona dos dados que produz e decide o que compartilha com as outras ([ADR-011](./engenharia/adrs/adr-011-ecossistema-e-compartilhamento.md)). A oficina precisa ganhar com o sistema para ela mesma: é isso que evita registro ruim.

## Para quem

| Quem | O que faz no Truck | Dispositivo principal |
| --- | --- | --- |
| Gestor de manutenção | Acompanha a fila e a oficina, aprova, define prioridades, vê custos e indicadores | Notebook, às vezes tablet |
| Consultor de manutenção | Abre ordens, registra problema e diagnóstico, organiza serviços | Tablet |
| Mecânico | Vê as ordens designadas a ele, inicia, pausa e conclui serviços, pede peças | Tablet ou celular, muitas vezes compartilhado |
| Almoxarifado | Aprova e entrega peças, controla estoque e devoluções | Tablet ou notebook |
| Gestor de pneus | Controla o ciclo de vida dos pneus e a recapagem | Tablet |
| Diretoria / relatórios | Acompanha custos, disponibilidade da frota e produtividade | Notebook |

## Por onde começar

| Se você quer… | Leia |
| --- | --- |
| Entender o domínio e os termos | [Glossário](./produto/glossario.md) |
| Saber o que está sendo construído e quando | [Roadmap](./projeto/roadmap.md) |
| Escrever código para a v2 | [Padrões de engenharia](./engenharia/padroes/padroes-de-engenharia.md), [Invariantes](./engenharia/invariantes.md), [Estratégia de testes](./engenharia/padroes/estrategia-de-testes.md) |
| Saber o que está pronto de verdade | [Métricas e definição de pronto](./engenharia/padroes/metricas-e-definicao-de-pronto.md) |
| Entender por que as coisas são assim | [Índice de ADRs](./engenharia/adrs/indice.md) |
| Entender como o v1 funciona hoje | [Legado v1](./engenharia/legado-v1/arquitetura.md) (referência, não padrão) |

## Como esta documentação é organizada

- **Produto:** o que o sistema faz e as regras em linguagem de negócio, um documento por módulo.
- **Engenharia:** como o sistema é construído: padrões, invariantes, ADRs e módulos técnicos da v2.
- **Engenharia › Legado v1:** o sistema atual, congelado como referência para portar comportamento.
- **Projeto:** roadmap, decisões em aberto e como testar.

Cada módulo entregue na v2 atualiza as páginas de produto e de engenharia no mesmo ciclo: isso faz parte da definição de pronto.
