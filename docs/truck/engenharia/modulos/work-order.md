---
title: Work Order
sidebar_position: 2
tags: [work-order, modulos, manutencao, backend, frontend]
---

# Work Order (Ordem de Servico)

Modulo central de gestao de manutencao do Facter Truck. Gerencia o ciclo de vida completo de ordens de servico, desde a entrada na fila ate a finalizacao.

---

## Maquina de Status

```
                    ┌─────────┐
        ┌──────────>│  Fila   │<──────────┐
        │           └────┬────┘           │
        │                │                │
        │                ▼                │
        │      ┌──────────────────┐       │
        │      │   Manutencao     │       │
        │      └────────┬─────────┘       │
        │               │                 │
        │          ┌────┴────┐            │
        │          │         │            │
        │          ▼         ▼            │
        │  ┌───────────┐  ┌──────────┐   │
        │  │ Aguardando│  │Finalizada│   │
        │  │   Peca    │  └──────────┘   │
        │  └─────┬─────┘                 │
        │        │                       │
        │        └───────────────────────┘
        │
        │           ┌──────────┐
        └───────────│ Cancelada│
                    └──────────┘
```

| Status | Descricao | Transicoes possiveis |
|--------|-----------|---------------------|
| `Fila` | Aguardando inicio | Manutencao, Cancelada |
| `Manutencao` | Em execucao | AguardandoPeca, Finalizada, Cancelada |
| `AguardandoPeca` | Parada por falta de pecas | Manutencao, Cancelada |
| `Finalizada` | Concluida (terminal) | - |
| `Cancelada` | Cancelada (terminal) | - |

---

## Entidades Principais

| Entidade | Descricao |
|----------|-----------|
| **WorkOrder** | OS principal com status, prioridade, timestamps, custos |
| **WorkOrderAsset** | Vinculo da OS com veiculos/carretas (multi-asset) |
| **ServiceAssignment** | Servico atribuido a OS com localizacao no ativo |
| **EmployeeServiceAssignment** | Funcionario alocado ao servico |
| **PartRequest** | Solicitacao de peca vinculada a OS/servico |
| **Note** | Observacoes da OS |
| **Event** | Historico de mudancas (legado, migrando para Activity) |

---

## Domain Events

| Evento | Trigger | Efeito |
|--------|---------|--------|
| `WORK_ORDER_MAINTENANCE_STARTED` | Iniciar manutencao | Activity log |
| `WORK_ORDER_MAINTENANCE_FINISHED` | Finalizar manutencao | Activity log |
| `WORK_ORDER_WAITING_PARTS` | Aguardar pecas | Activity log |
| `WORK_ORDER_CANCELLED` | Cancelar OS | Activity log |

---

## Use Cases

| Use Case | Descricao |
|----------|-----------|
| `CreateWorkOrderUseCase` | Criar OS com veiculos e servicos |
| `StartMaintenanceUseCase` | Iniciar manutencao (Fila -> Manutencao) |
| `FinishMaintenanceUseCase` | Finalizar (Manutencao -> Finalizada) |
| `WaitingPartsUseCase` | Pausar para pecas (Manutencao -> AguardandoPeca) |
| `ResumeMaintenanceUseCase` | Retomar (AguardandoPeca -> Manutencao) |
| `CancelWorkOrderUseCase` | Cancelar OS |
| `UpdateWorkOrderUseCase` | Atualizar dados da OS |

---

## Timestamps de Controle

A OS registra timestamps automaticos para calcular metricas:

| Campo | Quando preenchido |
|-------|-------------------|
| `queueEntryTime` | Ao criar a OS |
| `maintenanceStartTime` | Ao iniciar manutencao |
| `maintenanceEndTime` | Ao finalizar |
| `partsWaitStartTime` | Ao entrar em AguardandoPeca |
| `partsWaitEndTime` | Ao retomar de AguardandoPeca |

Metricas derivadas: tempo em fila, tempo de manutencao, tempo aguardando pecas, tempo total.

---

## Prioridades

| Prioridade | Descricao |
|------------|-----------|
| `BAIXA` | Pode esperar |
| `MEDIA` | Padrao |
| `ALTA` | Priorizar |
| `URGENTE` | Atender imediatamente |

---

## Integracao com Outros Modulos

| Modulo | Relacao |
|--------|---------|
| **Fleet** | OS vinculada a veiculos e carretas da frota |
| **Service** | Servicos atribuidos a OS com localizacao no ativo |
| **Part** | Solicitacoes de pecas vinculadas a OS/servico |
| **Employee** | Funcionarios alocados aos servicos |
| **Checklist** | Checklists podem gerar OS automaticamente |
| **Activity System** | Eventos de dominio para rastreabilidade |
| **Maintenance Plan** | OS gerada a partir de agendamentos preventivos |

---

## Seguranca

- Guards em cadeia: `JwtAuthGuard` -> `CompanyGuard` -> `PolicyGuard`
- Todo request filtra por `companyId` (multi-tenant)
- Policies: `work-order:create`, `work-order:read`, `work-order:update`, `work-order:delete`

---

## Frontend

### Componentes Principais

A tela de Work Order usa compound components para modularidade:

- **WorkOrderListPage**: Listagem paginada com filtros (status, prioridade, busca)
- **WorkOrderDetailsPage**: Detalhes com tabs (servicos, pecas, historico)
- **MaintenanceDataCard**: Card com dados do ativo e servicos
- **ServiceAssignmentList**: Lista de servicos com acoes inline
- **PartRequestList**: Lista de solicitacoes de pecas

### State Management

Zustand stores para gerenciamento de dialogs e estado local da feature. TanStack Query para dados do servidor.

---

## Referencias

- [Activity System](./activity-system) -- Eventos de dominio
- [Fleet](./fleet) -- Gestao de ativos
- [Checklist](./checklist) -- Integracao com checklists
- [Execucao de Servicos](../../produto/regras-negocio/service-execution) -- Regras de negocio detalhadas
