---
title: Testes
sidebar_position: 2
tags: [testes, jest, mock, backend, padroes]
---

# Padroes de Teste

Padrao de testes unitarios para o backend do Facter Truck usando Jest.

---

## Estrutura de Arquivos

```
src/application/{domain}/__tests__/
├── factories/
│   └── make-{entity}.factory.ts    # Factories para criar entidades de teste
├── mocks/
│   └── {repository}.mock.ts        # Mocks de repositories
└── {use-case}.spec.ts              # Arquivos de teste
```

---

## Mock Pattern

Usamos `jest.fn()` para mocks de repositories. **NAO** usamos InMemory repositories.

```typescript
// __tests__/mocks/work-order-repository.mock.ts
import { WorkOrderRepository } from '@/core/domain/repositories/work-order.repository';

export function createMockWorkOrderRepository() {
  return {
    create: jest.fn(),
    findById: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  } as jest.Mocked<Record<keyof WorkOrderRepository, jest.Mock>>;
}
```

Cada metodo do repository abstrato recebe um `jest.fn()`. Isso permite:

- Verificar se o metodo foi chamado: `expect(repo.create).toHaveBeenCalledWith(...)`
- Configurar retornos: `repo.findById.mockResolvedValue(entity)`
- Verificar que metodos **NAO** foram chamados em cenarios de erro

---

## Factory Pattern

Factories criam entidades validas para testes com valores default sobreescriveis:

```typescript
// __tests__/factories/make-work-order.factory.ts
import { WorkOrder } from '@/core/domain/entities/work-order';

export function makeWorkOrder(overrides: Partial<WorkOrder> = {}): WorkOrder {
  return new WorkOrder({
    companyId: 'company-1',
    vehicleId: 'vehicle-1',
    status: MaintenanceStatus.Fila,
    priority: 'MEDIA',
    ...overrides,
  });
}
```

---

## Test Pattern (AAA)

Testes seguem **Arrange-Act-Assert** com convencoes:

- `sut` para subject under test (o use case)
- `beforeEach` recria mocks a cada teste
- Blocos separados: `describe('success scenarios')` + `describe('error scenarios')`

### Exemplo completo

```typescript
describe('StartMaintenanceUseCase', () => {
  let sut: StartMaintenanceUseCase;
  let workOrderRepository: ReturnType<typeof createMockWorkOrderRepository>;
  let eventEmitter: { emit: jest.Mock };

  beforeEach(() => {
    workOrderRepository = createMockWorkOrderRepository();
    eventEmitter = { emit: jest.fn() };

    sut = new StartMaintenanceUseCase(
      workOrderRepository as any,
      eventEmitter as any,
    );
  });

  describe('success scenarios', () => {
    it('should start maintenance for a work order in queue', async () => {
      // Arrange
      const workOrder = makeWorkOrder({ status: MaintenanceStatus.Fila });
      workOrderRepository.findById.mockResolvedValue(workOrder);

      // Act
      const result = await sut.execute({
        companyId: 'company-1',
        workOrderId: workOrder.id,
        userId: 'user-1',
      });

      // Assert
      expect(result.status).toBe(MaintenanceStatus.Manutencao);
      expect(workOrderRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({ status: MaintenanceStatus.Manutencao }),
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        DomainEvents.WORK_ORDER_MAINTENANCE_STARTED,
        expect.any(Object),
      );
    });
  });

  describe('error scenarios', () => {
    it('should throw WorkOrderNotFoundError when work order does not exist', async () => {
      workOrderRepository.findById.mockResolvedValue(null);

      await expect(
        sut.execute({
          companyId: 'company-1',
          workOrderId: 'non-existent',
          userId: 'user-1',
        }),
      ).rejects.toThrow(WorkOrderNotFoundError);

      // Verify side effects did NOT happen
      expect(workOrderRepository.update).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should throw InvalidStatusTransitionError when not in queue', async () => {
      const workOrder = makeWorkOrder({ status: MaintenanceStatus.Finalizada });
      workOrderRepository.findById.mockResolvedValue(workOrder);

      await expect(
        sut.execute({
          companyId: 'company-1',
          workOrderId: workOrder.id,
          userId: 'user-1',
        }),
      ).rejects.toThrow(InvalidStatusTransitionError);

      expect(workOrderRepository.update).not.toHaveBeenCalled();
    });
  });
});
```

---

## Regras de Teste

1. **100% de branches** no use case. Todo `if`, todo `throw`, todo cenario alternativo.
2. **Cenarios de sucesso E erro**. Ambos obrigatorios.
3. **Erros**: usar `.rejects.toThrow(SpecificDomainError)` + verificar que `repo.save` **NAO** foi chamado.
4. **Sem mocks globais**. Cada `beforeEach` recria mocks limpos.
5. **Testes isolados**. Nenhum teste depende de outro.
6. **Nomes descritivos**: `should throw X when Y`, `should create Z with correct data`.

---

## Checklist de Code Review

- [ ] Todos os branches do use case estao cobertos?
- [ ] Cenarios de erro verificam que side effects NAO ocorreram?
- [ ] Usa `sut` para o subject under test?
- [ ] Usa factories em vez de criar objetos inline?
- [ ] Mocks sao recriados no `beforeEach`?
- [ ] Erros de dominio especificos sao verificados (nao `Error` generico)?

---

## Comandos

```bash
pnpm test                                     # Rodar todos os testes
pnpm test:watch                               # Modo watch
pnpm test:cov                                 # Com coverage
pnpm test -- --testPathPattern=work-order     # Dominio especifico
```

---

## Referencias

- [Clean Architecture](./clean-architecture) -- Estrutura de use cases
- [Domain Errors](./domain-errors) -- Erros usados nos testes
