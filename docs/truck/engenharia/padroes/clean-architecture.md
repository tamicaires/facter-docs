---
title: Clean Architecture
sidebar_position: 1
tags: [arquitetura, clean-architecture, backend, padroes]
---

# Clean Architecture

Principios e regras da arquitetura limpa aplicados no Facter Truck.

---

## Camadas e Fluxo de Dependencia

```
┌──────────────────────────────────────────────────────────────┐
│                      PRESENTERS                              │
│  Controllers HTTP, ViewModels, DTOs de entrada/saida         │
├──────────────────────────────────────────────────────────────┤
│                      APPLICATION                             │
│  Use Cases, orquestracao de negocio                          │
├──────────────────────────────────────────────────────────────┤
│                         CORE                                 │
│  Entities, Repositories (abstract), DomainErrors, Enums      │
├──────────────────────────────────────────────────────────────┤
│                         INFRA                                │
│  Prisma, Redis, HTTP clients, Guards, Filters                │
└──────────────────────────────────────────────────────────────┘

Dependencias:
  Presenters -> Application -> Core <- Infrastructure
```

### Regras

1. **Core** nao tem dependencias externas. Zero imports de NestJS, Prisma, Redis ou qualquer lib de infra.
2. **Application** depende apenas de Core (repositories abstratos, entities, errors).
3. **Infrastructure** implementa as abstracoes definidas em Core.
4. **Presenters** orquestram Use Cases e transformam dados para o formato HTTP.
5. **NUNCA** pular camadas. Controller nao acessa Repository diretamente. Use Case nao acessa PrismaService.

---

## Entity Pattern

Entities validam seus dados no construtor usando Zod. O schema define a estrutura e as regras de validacao:

```typescript
// core/domain/entities/vehicle.ts
import { z } from 'zod';
import { randomUUID } from 'crypto';

export const vehicleSchema = z.object({
  id: z.string().uuid().optional(),
  companyId: z.string().uuid(),
  fleetId: z.string().uuid().optional(),
  plate: z.string().min(7).max(8),
  model: z.string().optional(),
  brand: z.string().optional(),
  year: z.number().int().optional(),
  currentKm: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type VehicleType = z.infer<typeof vehicleSchema>;

export class Vehicle implements VehicleType {
  public readonly id: string;
  public companyId: string;
  public fleetId?: string;
  public plate: string;
  public model?: string;
  public brand?: string;
  public year?: number;
  public currentKm: number;
  public isActive: boolean;

  constructor(data: VehicleType) {
    const validated = vehicleSchema.parse(data);
    Object.assign(this, validated);
    this.id = validated.id ?? randomUUID();
  }
}
```

---

## Repository Pattern

Repositories sao definidos como **classes abstratas** na camada Core. A implementacao concreta (Prisma) fica na camada Infra.

### Abstracao (Core)

```typescript
// core/domain/repositories/vehicle.repository.ts
export abstract class VehicleRepository {
  abstract create(vehicle: Vehicle): Promise<void>;
  abstract findById(companyId: string, id: string): Promise<Vehicle | null>;
  abstract findByPlate(companyId: string, plate: string): Promise<Vehicle | null>;
  abstract findMany(
    companyId: string,
    options: PaginationOptions,
  ): Promise<PaginatedResult<Vehicle>>;
  abstract update(vehicle: Vehicle): Promise<void>;
  abstract delete(companyId: string, id: string): Promise<void>;
}
```

### Implementacao (Infra)

```typescript
// infra/repositories/prisma-vehicle.repository.ts
@Injectable()
export class PrismaVehicleRepository extends VehicleRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findById(companyId: string, id: string): Promise<Vehicle | null> {
    const raw = await this.prisma.vehicle.findFirst({
      where: { id, companyId },
    });
    return raw ? new Vehicle(raw) : null;
  }

  // ... demais metodos
}
```

### Binding no Module

```typescript
// application/vehicle/vehicle.module.ts
@Module({
  providers: [
    CreateVehicleUseCase,
    {
      provide: VehicleRepository,
      useClass: PrismaVehicleRepository,
    },
  ],
})
export class VehicleModule {}
```

---

## Use Case Structure

Use cases seguem o padrao **fetch-validate-build-persist**:

```typescript
async execute(data: IRequest): Promise<Output> {
  const entities = await this.fetchEntities(data);   // fetch
  this.validateBusinessRules(entities);               // validate (throw DomainError)
  const result = this.buildResult(data, entities);    // build
  await this.repository.save(result);                 // persist
}
```

### Prefixos para metodos privados

| Prefixo | Semantica | Retorno |
|---------|-----------|---------|
| `validate*` | Valida e lanca DomainError se invalido | `void` (throws) |
| `check*` | Verifica condicao | `boolean` |
| `prepare*` / `build*` | Constroi objetos | Objeto construido |
| `create*` / `generate*` | Cria entidades | Entity |

### Exemplo completo

```typescript
@Injectable()
export class StartMaintenanceUseCase {
  constructor(
    private readonly workOrderRepository: WorkOrderRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(data: IRequest): Promise<WorkOrder> {
    // fetch
    const workOrder = await this.fetchWorkOrder(data.companyId, data.workOrderId);

    // validate
    this.validateCanStartMaintenance(workOrder);

    // build
    workOrder.startMaintenance();

    // persist
    await this.workOrderRepository.update(workOrder);

    // emit event (efeito colateral)
    this.eventEmitter.emit(
      DomainEvents.WORK_ORDER_MAINTENANCE_STARTED,
      new WorkOrderMaintenanceStartedEvent(workOrder, data.userId),
    );

    return workOrder;
  }

  private async fetchWorkOrder(companyId: string, id: string): Promise<WorkOrder> {
    const wo = await this.workOrderRepository.findById(companyId, id);
    if (!wo) throw new WorkOrderNotFoundError();
    return wo;
  }

  private validateCanStartMaintenance(wo: WorkOrder): void {
    if (wo.status !== MaintenanceStatus.Fila) {
      throw new InvalidWorkOrderStatusTransitionError(wo.status, MaintenanceStatus.Manutencao);
    }
  }
}
```

---

## Controller Pattern

Controllers sao finos. Responsabilidades:

1. Receber e validar input HTTP (DTOs com Zod/class-validator)
2. Extrair contexto do request (company, user via decorators)
3. Delegar para Use Case
4. Retornar ViewModel (nunca entity diretamente)

```typescript
@Controller('work-orders')
@UseGuards(JwtAuthGuard, CompanyGuard, PolicyGuard)
export class WorkOrderController {
  constructor(
    private readonly startMaintenance: StartMaintenanceUseCase,
  ) {}

  @Patch(':id/start')
  @Policy('work-order:update')
  async start(
    @Param('id') id: string,
    @CurrentCompany() company: CompanyInstance,
    @CurrentUser() user: UserPayload,
  ) {
    const workOrder = await this.startMaintenance.execute({
      companyId: company.id,
      workOrderId: id,
      userId: user.id,
    });

    return WorkOrderViewModel.toHttp(workOrder);
  }
}
```

---

## NestJS Module Structure

```typescript
@Module({
  imports: [PrismaModule, CacheModule],
  controllers: [WorkOrderController],
  providers: [
    // Use Cases
    CreateWorkOrderUseCase,
    StartMaintenanceUseCase,
    FinishMaintenanceUseCase,

    // Repository binding: abstract -> concrete
    {
      provide: WorkOrderRepository,
      useClass: PrismaWorkOrderRepository,
    },
  ],
  exports: [WorkOrderRepository],
})
export class WorkOrderModule {}
```

---

## Design Patterns Utilizados

| Pattern | Onde | Exemplo |
|---------|------|---------|
| **Repository** | Core/Infra | `VehicleRepository` (abstract) / `PrismaVehicleRepository` |
| **Factory** | Entities | `WorkOrder.create()` com validacao Zod |
| **Strategy** | Integracoes | `TelematicsProvider` com implementacoes por provedor |
| **Builder** | Use Cases | Metodos `build*` / `prepare*` para objetos complexos |
| **Observer** | Domain Events | `EventEmitter2` com listeners desacoplados |

---

## Naming Conventions

| Tipo | Convencao | Exemplo |
|------|-----------|---------|
| Arquivos | kebab-case | `create-work-order.use-case.ts` |
| Classes | PascalCase | `CreateWorkOrderUseCase` |
| Interfaces (request) | `IRequest` | `interface IRequest { companyId: string }` |
| Constantes | UPPER_SNAKE_CASE | `DEFAULT_PER_PAGE = 20` |
| Enums | PascalCase (valores) | `MaintenanceStatus.Fila` |

---

## Regras Obrigatorias

1. Use cases usam **APENAS** abstracoes (repositories abstratos, services injetados)
2. **NUNCA** acessar PrismaService, Redis ou HTTP clients diretamente em use cases
3. Repositories abstratos ficam em `core/domain/repositories/`, implementacao Prisma em `infra/repositories/`
4. Zero `any`, zero `@ts-ignore`, zero `value!` (non-null assertion)
5. Zod para runtime validation, DomainErrors para erros de negocio
6. Comentarios: explique **POR QUE**, nunca **O QUE**

---

## Referencias

- [Visao Geral da Arquitetura](../arquitetura/visao-geral) -- Estrutura completa do sistema
- [Testes](./testes) -- Padrao de testes com jest.fn() mocks
- [Domain Errors](./domain-errors) -- Sistema de erros de dominio
- [Performance](./performance) -- Quando usar raw queries vs ORM
