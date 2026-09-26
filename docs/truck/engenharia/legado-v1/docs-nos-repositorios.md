---
title: "Docs dentro dos repositórios"
sidebar_position: 90
tags: [legado, v1, documentacao]
---

# Docs dentro dos repositórios

Documentos do v1 que ficaram dentro de `facter-api` e `facter-app`, fora deste site. Continuam nos repositórios até o corte para a v2. Esta página diz o que cada um é e o que vale aproveitar.

## facter-api

| Documento | Data | O que é | Para a v2 |
| --- | --- | --- | --- |
| `docs/location-position-analysis/` (3 arquivos, ~3.400 linhas) | out/2024 | Análise da localização duplicada entre serviço e requisição de peça; originou o ADR-001 e o `ServiceLocationType` | **Aproveitar.** O modelo de localização (eixo, lado, posição de roda, posição estrutural) é um dos acertos do domínio |
| `docs/architecture-analysis/` (8 arquivos, ~6.000 linhas) | out/2024 | Análise de observabilidade, eventos, performance, resiliência e plano de implementação | **Consultar.** Os diagnósticos se confirmaram na auditoria; as soluções propostas já estão nos padrões v2 (outbox, fila, métricas) |
| `docs/error-handling-improvement-proposal.md` | jan/2025 | Proposta de padronizar respostas de erro | **Substituído** pelo padrão de erros v2 (RFC 9457, código estável) |
| `docs/COMMIT_GUIDELINES.md` | 2024 | Convenção de commits | **Aproveitar** se o time ainda segue; migrar para `projeto/` quando a v2 começar |
| `docs/TESTING_PROMETHEUS.md` | 2024 | Como testar as métricas Prometheus | **Descartar.** As métricas declaradas nunca são registradas (auditoria) |
| `README.md` | 2024 | Descrição genérica de 2 anos atrás | **Descartar** no corte; o README da v2 aponta para este site |

## facter-app

| Documento | Data | O que é | Para a v2 |
| --- | --- | --- | --- |
| `docs/DEBITO-TECNICO.md` | set/2026 | Débitos do frontend (ex.: quadros no Kanban antigo do DS) | **Migrar** para o backlog quando o frontend entrar na fase 3 |
| `plan.md` | dez/2025 | Plano do modo simples/avançado da OS e kanban de serviços | **Consultar** ao redesenhar as telas da OS na v2 |
| `e2e/README.md` | set/2026 | Como rodar os testes Playwright | **Aproveitar**; o harness E2E é mantido |
| `README.md` | 2024 | Descrição genérica | **Descartar** no corte |
