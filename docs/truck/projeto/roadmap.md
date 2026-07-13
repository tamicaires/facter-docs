---
title: Roadmap
sidebar_position: 1
tags: [projeto, roadmap, planejamento]
---

# Roadmap Q1 2026

Plano de implementacao para o primeiro trimestre de 2026.

---

## Objetivo

Implementar **Cost Center**, **Supplier** e **Tire Evolution** como funcionalidades integradas ao sistema.

- **Periodo:** Fevereiro - Abril 2026
- **Total:** ~95 tasks

---

## Timeline

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ROADMAP Q1 2026                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  FEV                        MAR                        ABR                 │
│  ===                        ===                        ===                 │
│                                                                             │
│  ┌─────────────┐                                                           │
│  │ SPRINT CC-1 │  Cost Center Foundation                                   │
│  │   8 tasks   │                                                           │
│  └──────┬──────┘                                                           │
│         │                                                                   │
│         ▼                                                                   │
│  ┌─────────────┐                                                           │
│  │ SPRINT CC-2 │  Cost Center Integration                                  │
│  │   10 tasks  │                                                           │
│  └──────┬──────┘                                                           │
│         │                                                                   │
│         ▼                                                                   │
│         │         ┌─────────────┐                                          │
│         └────────>│ SPRINT SUP  │  Supplier (Generic)                      │
│                   │   12 tasks  │                                          │
│                   └──────┬──────┘                                          │
│                          │                                                  │
│                          ▼                                                  │
│                   ┌─────────────┐                                          │
│                   │ SPRINT TF-1 │  Tire Foundation                         │
│                   │   12 tasks  │                                          │
│                   └──────┬──────┘                                          │
│                          │                                                  │
│                          ▼                                                  │
│                          │         ┌─────────────┐                         │
│                          └────────>│ SPRINT TF-2 │  Tire Core              │
│                                    │   15 tasks  │                         │
│                                    └──────┬──────┘                         │
│                                           │                                 │
│                                           ▼                                 │
│                                    ┌─────────────┐                         │
│                                    │ SPRINT TF-3 │  Tire Lifecycle         │
│                                    │   14 tasks  │                         │
│                                    └──────┬──────┘                         │
│                                           │                                 │
│                                           ▼                                 │
│                                           │         ┌─────────────┐        │
│                                           └────────>│ SPRINT TF-4 │ UI    │
│                                                     │   16 tasks  │        │
│                                                     └──────┬──────┘        │
│                                                            │                │
│                                                            ▼                │
│                                                     ┌─────────────┐        │
│                                                     │ SPRINT CC-3 │ Adv.  │
│                                                     │   8 tasks   │        │
│                                                     └─────────────┘        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Sprints

| Sprint | Nome | Tasks | Dependencia | Entregas |
|--------|------|-------|-------------|----------|
| **CC-1** | Cost Center Foundation | 8 | - | Model, Entity, CRUD, API |
| **CC-2** | Cost Center Integration | 10 | CC-1 | Integracao em WO, Fleet, UI |
| **SUP** | Supplier Generic | 12 | CC-2 | Supplier completo com tipos |
| **TF-1** | Tire Foundation | 12 | SUP | Models, Entities, Repositories |
| **TF-2** | Tire Core | 15 | TF-1 | CRUD, TireEvent, History |
| **TF-3** | Tire Lifecycle | 14 | TF-2 | Mount/Dismount, Recap, Condemn |
| **TF-4** | Tire UI & Analytics | 16 | TF-3 | Frontend completo, CPK, Dashboard |
| **CC-3** | Cost Center Advanced | 8 | TF-4 | Forecast, Budget, Reports |

**Total: 95 tasks**

---

## Dependencias

```
CC-1 --> CC-2 --> SUP --> TF-1 --> TF-2 --> TF-3 --> TF-4 --> CC-3
                  |                                    |
                  |                                    |
                  └────────────────────────────────────┘
                        Supplier usado em Tire
                        CC usado em todos
```

---

## Metricas de Sucesso

### Ao final de CC-2

- Cost Center CRUD funcionando
- WorkOrder com costCenterId
- Fleet com defaultCostCenterId
- Relatorio basico de custos por CC

### Ao final de SUP

- Supplier generico com types[]
- CRUD completo
- Migracao de TireSupplier (se existir dados)

### Ao final de TF-4

- Tire Manager completo
- Lifecycle funcionando (mount/dismount/recap)
- CPK calculado
- Dashboard de pneus

### Ao final de CC-3

- Previsao de custos funcionando
- Budget vs Actual
- Alertas de orcamento
- Export para SAP/ERP

---

## Riscos e Mitigacoes

| Risco | Impacto | Mitigacao |
|-------|---------|-----------|
| Migracao de dados existentes | Alto | Scripts de migracao testados em staging |
| Performance com muitos pneus | Medio | Indices adequados, paginacao |
| Complexidade do lifecycle | Medio | Testes extensivos, state machine clara |
| Integracao SAP | Baixo | Deixar para CC-3, apos estabilizacao |

---

## Documentos de Referencia

| Documento | Descricao |
|-----------|-----------|
| ADR-007 | Especificacao completa de Cost Center |
| [ADR-006](../engenharia/adrs/adr-006-dialog-architecture) | Contexto de integracao e manutencao |
| Tire Management Evolution | Especificacao tecnica de Tire |
| Sprint Wireframes | Wireframes das telas de Tire |
