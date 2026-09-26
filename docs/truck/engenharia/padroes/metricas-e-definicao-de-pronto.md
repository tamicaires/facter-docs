---
title: "Métricas e definição de pronto"
sidebar_position: 3
tags: [metricas, definicao-de-pronto, pr, padroes]
---

# Métricas e definição de pronto

:::note Documento vivo
Origem: [auditoria de 2026-09](../auditoria-2026-09.md). Esta página evolui com o projeto; mudança de padrão exige ADR. Vale para todo código novo da v2.
:::

Cada métrica tem meta, forma de medir e consequência. Métrica sem consequência vira decoração.

### Métricas

| Métrica | Meta | Como mede | Se não atingir |
| --- | --- | --- | --- |
| Lint, type-check e build | 0 erros | CI em todo PR | Merge bloqueado |
| Testes | 100% passando, zero `skip` sem issue | CI | Merge bloqueado |
| Rotas sem permissão declarada | 0 | Teste que varre as rotas | Merge bloqueado |
| Rotas sem teste de isolamento entre empresas | 0 | Suíte gerada da lista de rotas | Merge bloqueado |
| Use cases com teste de integração | 100% | Relatório do CI | Merge bloqueado |
| Mutation score do domínio | ≥ 80% | Stryker semanal | Tarefa no sprint seguinte |
| Invariantes violados em homologação | 0 | Job diário de consultas | Alerta, correção antes de novas features |
| p95 de leitura de agregado (detalhe) | &lt; 100 ms com 100 mil ordens | k6 no pipeline de release | Release bloqueado |
| p95 de lista paginada | &lt; 200 ms | k6 | Release bloqueado |
| p95 de comando (transição, aprovação) | &lt; 300 ms | k6 | Release bloqueado |
| p95 de indicador | &lt; 300 ms sem depender de cache | k6 com cache frio | Release bloqueado |
| Taxa de erro 5xx | &lt; 0,1% das requisições | Métricas de produção | Alerta imediato |
| Payload máximo de lista | &lt; 100 KB por página, com gzip | Teste de contrato | Revisão obrigatória |
| Bundle inicial do app | &lt; 300 KB gzip | CI | Revisão obrigatória |
| Dependências com CVE alta | 0 | Auditoria no CI | Merge bloqueado |
| Tempo de CI | &lt; 10 min | CI | Otimizar antes de crescer a suíte |

**Metas de uso (atrito)**, medidas nas jornadas E2E e por telemetria no app:

| Métrica | Meta |
| --- | --- |
| Iniciar, pausar ou concluir serviço no celular | ≤ 2 toques |
| Abrir uma ordem de serviço completa | &lt; 60 s |
| Campos obrigatórios para abrir uma ordem | ≤ 4 |
| Responsividade da interface (INP, p75) | &lt; 200 ms |
| Tela de detalhe da ordem pronta para uso (LCP, p75, 4G) | &lt; 2,5 s |

Funcionalidade nova que piora uma meta de uso volta para o desenho.

Métricas de processo, acompanhadas sem meta rígida no início: lead time do PR, frequência de deploy em homologação, taxa de rollback e bugs em produção por módulo.

### Definição de pronto

Uma entrega só está pronta quando todos os itens valem. Este checklist vai no template de PR.

- [ ] Regra de negócio no agregado, com um único caminho de escrita
- [ ] Invariantes novos escritos no documento de invariantes e garantidos no banco quando possível (CHECK, unique, FK)
- [ ] Escritas condicionais ou com versão onde há estado anterior
- [ ] `company_id` e RLS em tabela nova; permissão por ação declarada na rota
- [ ] Teste de integração do use case (feliz, recusas, efeito no banco)
- [ ] Teste de concorrência quando duas pessoas podem agir ao mesmo tempo
- [ ] Teste de isolamento e de permissão gerado para a rota nova
- [ ] Contrato OpenAPI atualizado e tipos do app regenerados
- [ ] Migration nomeada e revisada; nada destrutivo sem ADR
- [ ] Logs e métricas no caminho novo; erros com código estável
- [ ] ADR escrito se houve decisão de arquitetura ou exceção a um padrão
- [ ] Rodando em homologação e validado pela arquiteta antes de produção
