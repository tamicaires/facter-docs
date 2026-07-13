---
title: Activity System
sidebar_position: 4
tags: [activity-system, domain-events, modulos, backend]
---

# Activity System

Sistema de logging de atividades baseado em Domain Events. Substitui o antigo `EventService` por um sistema desacoplado e testavel.

---

## Fluxo

```
Controller -> Use Case -> Entity Method -> Repository.save()
                                               │
                                               ▼
                                    EventEmitter2.emit(DomainEvent)
                                               │
                                    ┌──────────┴──────────┐
                                    │                     │
                                    ▼                     ▼
                          ActivityLoggerListener    NotificationListener
                                    │                     │
                                    ▼                     ▼
                          Activity persistida      SSE para frontend
```

O use case executa a logica de negocio e persiste a entidade. Apos o persist, emite um Domain Event. Listeners desacoplados processam o evento de forma assincrona: um persiste a Activity no banco, outro envia notificacoes via SSE.

---

## Estrutura de Arquivos

```
src/core/domain/
├── activity/
│   └── activity.entity.ts           # Entidade Activity
├── entities/
│   └── work-order.ts                # Metodos de dominio que geram eventos
├── errors/
│   └── work-order.errors.ts         # Domain Errors
└── events/
    ├── event-names.ts               # Constantes de nomes
    ├── work-order.events.ts         # Event classes
    └── part-request.events.ts       # Event classes

src/application/activity/
└── listeners/
    └── activity-logger.listener.ts  # Persiste activities

src/application/notification/
└── listeners/
    └── part-request-notification.listener.ts  # SSE
```

---

## Status de Migracao

| Dominio | Status | Eventos | SSE |
|---------|--------|---------|-----|
| **Work Order** | Migrado | start/finish maintenance, waiting parts, cancel | Activity log |
| **Part Request** | Migrado | create, approve, reject, deliver, batch approve/reject | Activity log + SSE |
| Tire Request | Pendente | - | - |
| Checklist | Pendente | - | - |
| Service Assignment | Pendente | - | - |

---

## Activity Entity

```typescript
interface Activity {
  id: string;
  companyId: string;
  verb: ActivityVerb;           // CREATED, UPDATED, DELETED, STATUS_CHANGED, ...
  objectType: ActivityObjectType; // WORK_ORDER, PART_REQUEST, ...
  objectId: string;
  actorType: ActorType;         // USER, SYSTEM
  actorId: string;
  metadata: Record<string, unknown>;  // Snapshot desnormalizado
  createdAt: Date;
}
```

### Enums

```typescript
enum ActivityVerb {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  DELETED = 'DELETED',
  STATUS_CHANGED = 'STATUS_CHANGED',
  ASSIGNED = 'ASSIGNED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

enum ActivityObjectType {
  WORK_ORDER = 'WORK_ORDER',
  PART_REQUEST = 'PART_REQUEST',
  SERVICE_ASSIGNMENT = 'SERVICE_ASSIGNMENT',
}

enum ActorType {
  USER = 'USER',
  SYSTEM = 'SYSTEM',
}
```

---

## Metadata (Snapshots Desnormalizados)

Cada Activity carrega um snapshot dos dados relevantes no momento do evento. Isso garante que o historico e preservado mesmo que entidades sejam alteradas depois.

```typescript
// Exemplo: WorkOrderMetadata
{
  workOrderId: 'wo-123',
  displayId: 'OS-2026-00042',
  previousStatus: 'Fila',
  newStatus: 'Manutencao',
  vehiclePlate: 'ABC-1234',
}

// Exemplo: PartRequestMetadata
{
  partRequestId: 'pr-456',
  partName: 'Filtro de oleo',
  quantity: 2,
  approvedQuantity: 2,
  status: 'APPROVED',
  approvedBy: 'Joao Silva',
}
```

---

## Domain Events

### Naming Pattern

```
DOMAIN_OBJECT_ACTION
```

Exemplos: `WORK_ORDER_MAINTENANCE_STARTED`, `PART_REQUEST_APPROVED`, `PART_REQUEST_BATCH_REJECTED`

### Event Classes

```typescript
// src/core/domain/events/work-order.events.ts
export class WorkOrderMaintenanceStartedEvent {
  constructor(
    public readonly workOrder: WorkOrder,
    public readonly userId: string,
  ) {}
}

// src/core/domain/events/part-request.events.ts
export class PartRequestApprovedEvent {
  constructor(
    public readonly partRequest: PartRequest,
    public readonly part: Part,
    public readonly approvedById: string,
    public readonly companyId: string,
  ) {}
}
```

---

## Guia de Migracao (6 passos)

Para migrar um dominio para o Activity System:

1. **Criar Domain Errors** em `core/domain/errors/{domain}.errors.ts`
2. **Adicionar metodos de dominio** na entity (ex: `workOrder.startMaintenance()`)
3. **Atualizar Use Case** para emitir evento apos persist
4. **Criar/atualizar Listener** em `application/activity/listeners/`
5. **Adicionar ErrorCodes** em `core/exceptions/error-codes.ts` com metadata PT-BR
6. **Mapear no GlobalExceptionFilter** em `infra/http/filters/`

---

## Testando Domain Events

### Teste de Entity Method

```typescript
it('should change status to Manutencao', () => {
  const wo = makeWorkOrder({ status: MaintenanceStatus.Fila });
  wo.startMaintenance();
  expect(wo.status).toBe(MaintenanceStatus.Manutencao);
  expect(wo.maintenanceStartTime).toBeDefined();
});
```

### Teste de Emissao de Evento

```typescript
it('should emit WORK_ORDER_MAINTENANCE_STARTED event', async () => {
  const eventEmitter = { emit: jest.fn() };
  const sut = new StartMaintenanceUseCase(repo, eventEmitter);

  await sut.execute({ companyId: 'c1', workOrderId: 'wo1', userId: 'u1' });

  expect(eventEmitter.emit).toHaveBeenCalledWith(
    DomainEvents.WORK_ORDER_MAINTENANCE_STARTED,
    expect.any(WorkOrderMaintenanceStartedEvent),
  );
});
```

---

## Referencias

- [Domain Errors](../padroes/domain-errors) -- Erros usados nos eventos
- [Testes](../padroes/testes) -- Padrao de testes
- [Work Order](./work-order) -- Modulo principal com eventos
- [Checklist](./checklist) -- Integracao com checklist
