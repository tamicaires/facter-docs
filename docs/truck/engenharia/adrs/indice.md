---
title: "Índice de ADRs"
sidebar_position: 0
tags: [adr, indice]
---

# Índice de ADRs

Toda decisão de arquitetura do Truck tem um ADR com número sequencial. Um ADR aceito não é editado: uma decisão nova cria outro ADR que substitui o anterior.

| ADR | Decisão | Status | Onde está |
| --- | --- | --- | --- |
| 001 | Unificação da localização: `ServiceExecution` como fonte única | Implementado (v1) | Não migrado. Análise original em `facter-api/docs/location-position-analysis/` ([resumo](../legado-v1/docs-nos-repositorios.md)) |
| 002 | Análise do sistema de eventos | Concluído (v1) | Não migrado. `facter-api/docs/architecture-analysis/02-EVENTS.md` |
| 003 | Activity System: eventos de domínio com metadata desnormalizada | Parcial (~40%, v1) | Não migrado. Descrição do módulo em [Activity System (v1)](../legado-v1/modulos/activity-system.md) |
| 004 | [Refactoring do checklist](./adr-004-checklist-refactoring.md) | Implementado (v1) | Aqui |
| 005 | Melhoria de UX da ordem de serviço | Implementado (v1) | Arquivo perdido |
| 006 | [Evolução do planejamento de manutenção](./adr-006-planejamento-de-manutencao.md) (multi-trigger, telemática, SAP) | Parcial (v1) | Aqui |
| 007 | Centro de custo + consolidação do histórico por transições | Implementado (v1) | Arquivo perdido; o schema cita "ADR-007" nas tabelas de transição |
| 008 | Refactoring do sistema de autenticação | Planejado, não executado | Arquivo perdido |
| 009 | [Custeio de mão de obra na OS](./adr-009-labor-cost.md) | Aprovado; implementação em `feat/factrk-9-labor-rate`, fora da `homolog` | Aqui |
| 010 | [v2 do núcleo com corte de escopo](./adr-010-v2-do-nucleo.md) | Aprovado (26/09/2026) | Aqui |
| 011 | [Ecossistema de organizações e compartilhamento de dados](./adr-011-ecossistema-e-compartilhamento.md) | Aprovado com ajustes (26/09/2026) | Aqui |

Os ADRs 001–008 são decisões do v1. Os que o código cita como justificativa (003, 006, 007) importam para quem for portar comportamento. A lista acima veio de uma tabela no arquivo antigo da documentação; os arquivos 005, 007 e 008 não foram encontrados em nenhum repositório.

**A partir do ADR-010, todo ADR vive nesta pasta.** Nenhuma decisão fica só em README de repositório, plano solto ou conversa.
