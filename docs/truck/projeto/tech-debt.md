---
title: Tech Debt
sidebar_position: 2
tags: [projeto, tech-debt, qualidade]
---

# Tech Debt

Analise e priorizacao de debito tecnico do Facter Truck. Auditado em 2026-02-11.

---

## Resumo Executivo

| Status | Quantidade |
|--------|------------|
| Corrigido | 7 items |
| Parcial | 4 items |
| Pendente | 43 items |

### Distribuicao por Severidade (pendentes)

| Severidade | Quantidade |
|------------|------------|
| Critico | 8 issues |
| Alto | 18 issues |
| Medio | 14 issues |
| Baixo | 3 issues |

### Categorias

- **Schema/Modelagem**: 3 typos, indices parciais, timestamps parciais
- **Backend**: 1 bug critico, 32 exceptions legadas, type safety violations
- **Frontend**: 67 console.logs, 19 `as any`, zero lazy loading
- **Auth**: Recursao corrigida, 5 problemas restantes
- **Navigation**: Auth guard corrigido, 11 problemas restantes

---

## Parte 1: Schema / Modelagem

### Critico: Typos em Producao

3 typos no schema Prisma que requerem migration para correcao:

| ID | Problema | Tabela | Impacto |
|----|----------|--------|---------|
| DB-001 | `word_order_id` em vez de `work_order_id` | ServiceAssignment | FK com nome errado |
| DB-002 | `perfomed_at` em vez de `performed_at` | AxleHistory, TireHistory | Coluna com typo |
| DB-003 | `serviceAssignmets` em vez de `serviceAssignments` | Schema | Relacao com nome errado |

### Alto: Indices Faltando

Schema tem 166 indices, mas faltam indices em campos de `status` para tabelas com queries frequentes:

| Tabela | Status |
|--------|--------|
| WorkOrder | Corrigido (index composto com companyId) |
| ServiceAssignment | Pendente |
| PartRequest | Pendente |
| Checklist | Pendente |
| TireRequest | Pendente |

### Alto: Campos de Auditoria

| Modelo | Problema | Status |
|--------|----------|--------|
| User | createdAt/updatedAt | Corrigido |
| TireRequest | Falta createdAt | Pendente |
| Events | Falta createdAt/updatedAt | Pendente |

### Medio

- **Cascade Delete faltando**: Vehicle.fleet e Trailer.fleet sem `onDelete: SetNull`
- **Dados desnormalizados**: ServiceExecutionLog duplica dados de ServiceAssignment

---

## Parte 2: Backend

### Critico: Race Condition

Missing `await` em `reject-part-request.ts` -- funcao retorna antes da operacao de banco completar. Dados podem nao ser salvos.

### Critico: Domain Events Nao Emitidos

Use cases de part-request nao emitem domain events. 5 use cases afetados (approve, reject, create, createTire, updateTire). Activity System nao registra essas acoes.

### Alto: Type Safety

3 repositories abstratos ainda usam `any` em metodos (create, findMany, findById). Violacao direta das regras do projeto.

### Alto: Exceptions Legadas

32 arquivos ainda usam `ExceptionHandler` ou `AppException` em vez de `DomainError`. Veja [Domain Errors](../engenharia/padroes/domain-errors) para o padrao correto.

### Alto: Codigo Duplicado

Bloco de `include` identico repetido 3x em `prisma-part-request-repository.ts`. Deveria ser extraido em constante.

### Medio

- **Unsafe property access**: `serviceAssignment.workOrder.id` sem optional chaining
- **Transacoes inconsistentes**: Nem todos repositories implementam `withTransaction()`

---

## Parte 3: Frontend

### Critico: Zero Error Boundaries

Nenhum `ErrorBoundary` no projeto. Qualquer erro em componente filho crasha a aplicacao inteira.

### Critico: Console.logs em Producao

28+ `console.log` espalhados em componentes de producao. Deveria usar logger condicional.

### Critico: Componentes Gigantes

| Componente | Linhas |
|------------|--------|
| vehicle-card/index.tsx | 584 |
| technician-view.tsx | 574 |
| checklist/indexsd.tsx | 490 |
| part-kit-managment.tsx | 469 |
| checklist-sidebar.tsx | 435 |
| safe-company-selector.tsx | 421 |

Meta: nenhum componente acima de 200 linhas.

### Critico: Type Safety

Multiplos `as any` em componentes (part-request, technician-view, checklist-start, work-order-history-item).

### Alto

- **Hardcoded values**: Target times de manutencao, mock data de empresas, limites fixos
- **Codigo duplicado**: Formatacao de data duplicada em 5+ arquivos
- **State management inconsistente**: Alguns features usam Zustand, outros usam useState

### Medio

- **Acessibilidade**: Apenas 2 `aria-label` no projeto inteiro
- **Performance**: ~20% dos componentes usam `React.memo` (meta: 80%)
- **Design System**: ~40% das features usam `@facter/ds-core` (meta: 100%)

---

## Parte 4: Integracoes

### Provedores de Telemetria (Templates)

Provedores de telemetria (Sascar, Autotrac, Cobli) foram implementados como **templates estruturais** baseados em padroes comuns. **NAO foram validados com documentacao real das APIs.**

| Provider | Prioridade | Status |
|----------|------------|--------|
| Sascar | Alta | Template (aguardando acesso) |
| Autotrac | Media | Template (aguardando acesso) |
| Cobli | Baixa | Template (aguardando acesso) |

### SAP PM

Implementado com base na documentacao oficial do SAP Business Accelerator Hub. Status: funcional.

---

## Plano de Correcao

### Sprint A: Criticos

| Task | Tipo |
|------|------|
| Fix `await` faltando em reject-part-request | Bug |
| Fix 3 typos no schema + migration | DB |
| Adicionar Error Boundaries | Frontend |
| Remover 28 console.logs | Frontend |
| Adicionar eventos em part-request use cases | Backend |

### Sprint B: Schema e Backend

| Task | Tipo |
|------|------|
| Adicionar indices faltantes (4 tabelas) | DB |
| Fix campos de auditoria | DB |
| Padronizar exceptions para DomainError (32 arquivos) | Backend |
| Fix type safety (any -> tipos) | Backend |
| Extrair constante de include em repositories | Backend |

### Sprint C: Frontend Quality

| Task | Tipo |
|------|------|
| Decompor 6 componentes > 400 linhas | Refactor |
| Criar shared/utils/formatters.ts | Refactor |
| Padronizar state management (Zustand) | Refactor |
| Fix type safety (as any -> tipos) | Refactor |
| Adicionar acessibilidade basica | Frontend |

### Sprint D: Performance e Polish

| Task | Tipo |
|------|------|
| Adicionar useMemo/useCallback | Performance |
| Migrar para Design System | Frontend |
| Remover hardcoded values | Frontend |
| Deletar codigo comentado/mock | Cleanup |

---

## Metricas de Sucesso

| Metrica | Atual | Meta |
|---------|-------|------|
| console.log em producao | 28 | 0 |
| Componentes > 200 linhas | 10 | 0 |
| Error Boundaries | 0 | 100% features |
| Type violations (any) | 15+ | 0 |
| Indices em campos de status | 1/5 | 5/5 |
| Eventos de dominio emitidos | ~60% | 100% |
| useMemo/useCallback coverage | ~20% | 80% |
| Design System usage | ~40% | 100% |

---

## Riscos Se Nao Corrigir

| Risco | Probabilidade | Impacto |
|-------|---------------|---------|
| Race condition em rejeicao de pecas | Alta | Dados perdidos |
| Queries lentas sem indices | Alta | Performance degradada |
| Crash sem Error Boundary | Media | UX ruim |
| Auditoria incompleta | Alta | Compliance issues |
| Manutencao dificil | Alta | Velocity reduzida |
