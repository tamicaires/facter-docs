---
title: Checklist
sidebar_position: 1
tags: [checklist, modulos, backend, frontend]
---

# Checklist System

Sistema de checklists de inspecao do Facter Truck. Permite criar templates de inspecao, executar checklists em veiculos/carretas e registrar conformidades por item.

---

## Funcionalidades

| Funcionalidade | Descricao |
|----------------|-----------|
| Multi-trailer | Checklist pode cobrir veiculo + multiplas carretas |
| Templates | Templates reutilizaveis com categorias e itens |
| Conformidade (5 status) | CONFORME, NAO_CONFORME, NAO_APLICAVEL, PENDENTE, NAO_VERIFICADO |
| Acoes inline | Criar OS ou solicitar peca diretamente de um item nao conforme |
| Finalizacao | Valida que todos os itens foram verificados antes de finalizar |
| DisplayId | Formato `CHK-{ANO}-{SEQUENCIAL}` para identificacao humana |

---

## Modelo de Entidades

```
ChecklistTemplate
├── id, companyId, name, assetType, isActive
├── categories: ChecklistCategory[]
│   └── items: ChecklistItemTemplate[]
│       └── name, description, requiresPhoto, requiresNote
│
Checklist
├── id, templateId, vehicleId, trailerId, employeeId
├── status: ChecklistStatus (PENDING, IN_PROGRESS, COMPLETED, CANCELLED)
├── displayId: string (CHK-2026-00042)
├── completedAt, notes
└── items: ChecklistItem[]
    └── conformity: ConformityStatus, notes, photos
```

### ConformityStatus

| Status | Descricao | Cor |
|--------|-----------|-----|
| `PENDENTE` | Nao verificado ainda | Cinza |
| `CONFORME` | Item em conformidade | Verde |
| `NAO_CONFORME` | Item com problema | Vermelho |
| `NAO_APLICAVEL` | Item nao se aplica neste contexto | Azul |
| `NAO_VERIFICADO` | Nao foi possivel verificar | Amarelo |

---

## Fluxo de Dados

```
┌─────────────────────────────────────────────────────────────────┐
│                     ZUSTAND STORE (SSOT)                        │
│  checklistItems: Map<itemId, { conformity, notes, photos }>     │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                    Debounce 500ms
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│              BATCH API (PATCH /checklist-item/batch)             │
│  Envia apenas itens modificados desde o ultimo sync              │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND (Transacao)                          │
│  Atualiza todos os itens em uma unica transacao Prisma           │
└─────────────────────────────────────────────────────────────────┘
```

O Zustand store e a unica fonte de verdade (SSOT) durante a execucao do checklist. Updates sao otimistas: a UI atualiza imediatamente e o sync com o backend acontece via batch apos debounce.

---

## API Endpoints

### Checklist

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| POST | `/checklists` | Criar checklist a partir de template |
| GET | `/checklists` | Listar checklists (paginado) |
| GET | `/checklists/:id` | Buscar checklist por ID |
| PATCH | `/checklists/:id/finalize` | Finalizar checklist |

### Checklist Items

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| PATCH | `/checklist-item/conformity/batch` | Atualizar conformidade em batch |
| PATCH | `/checklist-item/:id` | Atualizar item individual |

### Templates

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| POST | `/checklist-templates` | Criar template |
| GET | `/checklist-templates` | Listar templates |
| GET | `/checklist-templates/:id` | Buscar template |
| PUT | `/checklist-templates/:id` | Atualizar template |
| DELETE | `/checklist-templates/:id` | Desativar template |

---

## Componentes Frontend

```
ChecklistDetailsPage
├── ChecklistHeader          # Status, displayId, acoes
├── ChecklistStatsBar        # Contadores de conformidade
├── CategoryAccordionList    # Lista de categorias expansiveis
│   └── ChecklistCategory
│       └── ChecklistItem
│           └── ConformityControl  # Botoes de conformidade
└── ChecklistActions         # Finalizar, cancelar
```

---

## Regras de Negocio

- **Finalizacao**: Todos os itens devem ter conformidade diferente de PENDENTE
- **Multi-trailer**: Um checklist pode referenciar um veiculo E uma carreta simultaneamente
- **Controle hibrido**: Combina optimistic updates (UX rapida) com batch sync (consistencia)
- **DisplayId**: Gerado automaticamente no formato `CHK-{ANO}-{SEQUENCIAL}`, sequencial por empresa

---

## Performance (Antes vs Depois do Refactoring)

| Metrica | Antes | Depois |
|---------|-------|--------|
| Latencia por click | ~200ms (HTTP roundtrip) | ~0ms (otimista) |
| Requests por checklist | N (um por item) | 1 (batch) |
| Race conditions | Possiveis com clicks rapidos | Eliminadas (debounce + batch) |
| Estado | Dividido (useState + useQuery) | Unificado (Zustand SSOT) |

---

## Integracoes

- **Work Order**: Criar OS diretamente de um item nao conforme
- **Activity System**: Eventos de criacao e finalizacao de checklists
- **Parts & Services**: Solicitar pecas ou servicos a partir de itens do checklist

---

## Referencias

- [ADR-004: Checklist Refactoring](../adrs/adr-004-checklist-refactoring) -- Decisao de refactoring
- [Activity System](./activity-system) -- Eventos de dominio
- [Work Order](./work-order) -- Integracao com OS
