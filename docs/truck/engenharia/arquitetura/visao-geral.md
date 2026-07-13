---
title: Visao Geral da Arquitetura
sidebar_position: 1
tags: [arquitetura, backend, frontend, clean-architecture]
---

# Facter Truck - Arquitetura

Documentacao tecnica da arquitetura do sistema Facter Truck.

---

## Visao Geral

O Facter Truck segue **Clean Architecture** com separacao clara de responsabilidades:

```
┌─────────────────────────────────────────────────────────────────┐
│                         PRESENTERS                              │
│              Controllers HTTP (NestJS)                          │
│         Recebem requests, validam, delegam                      │
├─────────────────────────────────────────────────────────────────┤
│                        APPLICATION                              │
│                    Use Cases (37 modulos)                       │
│         Orquestram logica usando abstracoes                     │
├─────────────────────────────────────────────────────────────────┤
│                           CORE                                  │
│    Entities │ Repositories (abstract) │ Exceptions │ Enums     │
│              Regras de negocio puras                            │
├─────────────────────────────────────────────────────────────────┤
│                          INFRA                                  │
│     Database (Prisma) │ Cache (Redis) │ HTTP │ Logging         │
│            Implementacoes concretas                             │
└─────────────────────────────────────────────────────────────────┘
```

Cada camada tem uma responsabilidade bem definida:

- **Presenters**: Ponto de entrada HTTP. Controllers recebem requests, validam inputs e delegam para use cases.
- **Application**: Orquestracao de logica de negocio. Use cases dependem apenas de abstracoes (repositories, services injetados). Nunca acessam Prisma, Redis ou HTTP clients diretamente.
- **Core**: Camada de dominio puro. Entities com validacao Zod, repositories abstratos, excecoes de negocio e enums. Zero dependencias externas.
- **Infra**: Implementacoes concretas. Prisma para banco, Redis para cache, Winston para logging, Prometheus para metricas.

Para mais detalhes sobre os principios de Clean Architecture aplicados, veja [Clean Architecture](../padroes/clean-architecture).

---

## Estrutura de Diretorios

### Backend (facter-api)

```
src/
├── application/                    # USE CASES (37 modulos)
│   ├── auth/
│   │   ├── useCases/
│   │   │   ├── login.use-case.ts
│   │   │   ├── register.use-case.ts
│   │   │   └── refresh-token.use-case.ts
│   │   ├── __tests__/              # Testes (jest.fn() mocks, factories)
│   │   ├── exceptions/
│   │   └── auth.module.ts
│   ├── work-order/
│   ├── vehicle/
│   └── ... (37 modulos)
│
├── core/                           # DOMAIN LAYER
│   ├── domain/
│   │   ├── entities/               # 42 entidades
│   │   │   ├── user.ts
│   │   │   ├── company.ts
│   │   │   ├── work-order.ts
│   │   │   └── ...
│   │   └── repositories/           # 38+ abstracoes
│   │       ├── user.repository.ts
│   │       ├── company.repository.ts
│   │       └── ...
│   ├── enums/
│   │   ├── role-type.ts
│   │   ├── maintenance-status.ts
│   │   └── ...
│   ├── exceptions/
│   │   ├── app.exception.ts
│   │   ├── business.exception.ts
│   │   └── domain.exception.ts
│   └── types/
│
├── infra/                          # INFRASTRUCTURE
│   ├── database/
│   │   └── prisma/
│   │       ├── prisma.service.ts
│   │       └── prisma.module.ts
│   ├── cache/
│   │   ├── cache.service.ts
│   │   └── cache.module.ts
│   ├── http/
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── company.guard.ts
│   │   │   └── policy.guard.ts
│   │   ├── interceptors/
│   │   │   ├── prisma-context.interceptor.ts
│   │   │   ├── http-logger.interceptor.ts
│   │   │   └── metrics.interceptor.ts
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts
│   │   └── filters/
│   │       └── global-exception.filter.ts
│   ├── logging/                    # Winston
│   ├── metrics/                    # Prometheus
│   ├── health/                     # Health checks
│   └── scheduler/                  # Cron jobs
│
├── presenters/                     # HTTP CONTROLLERS
│   ├── company/
│   │   └── company.controller.ts
│   ├── work-order/
│   │   └── work-order.controller.ts
│   └── ...
│
├── config/
│   ├── env.ts
│   ├── jwt.config.ts
│   └── app.config.ts
│
└── app.module.ts
```

### Frontend (facter-app)

```
src/
├── core/                           # INFRAESTRUTURA
│   ├── api/
│   │   ├── client.ts               # Axios instance
│   │   └── interceptors.ts
│   ├── auth/
│   │   ├── auth.context.tsx
│   │   └── auth.provider.tsx
│   ├── config/
│   │   ├── env.ts
│   │   └── routes.ts
│   ├── permissions/
│   │   └── permission.context.tsx
│   ├── store/
│   │   └── global.store.ts
│   └── providers/
│       └── app.providers.tsx
│
├── features/                       # FEATURE MODULES (33)
│   ├── auth/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── schemas/
│   │   └── index.ts
│   ├── work-order/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── form/
│   │   ├── hooks/
│   │   ├── schemas/
│   │   ├── store/
│   │   └── index.ts
│   └── ... (33 features)
│
├── shared/                         # COMPARTILHADO
│   ├── components/
│   │   ├── ui/
│   │   └── layout/
│   ├── hooks/
│   ├── lib/
│   └── utils/
│       ├── formatters.ts
│       └── validators.ts
│
├── app/                            # PAGINAS (routing)
│   ├── (auth)/
│   ├── (dashboard)/
│   └── layout.tsx
│
└── main.tsx
```

---

## Fluxo de Requisicao (Backend)

Toda requisicao HTTP passa por uma pipeline bem definida:

```
Request HTTP
    │
    ▼
┌─────────────────┐
│   Controller    │  <- Valida input, extrai params
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│     Guards      │  <- JWT -> Company -> Policy
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Interceptors  │  <- Logging, Metrics, Context
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Use Case     │  <- Logica de negocio
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Repository    │  <- Abstracao (interface)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│     Prisma      │  <- Implementacao concreta
└────────┬────────┘
         │
         ▼
    PostgreSQL
```

---

## Fluxo de Dados (Frontend)

O frontend segue uma arquitetura feature-first com TanStack Query para gerenciamento de estado do servidor:

```
┌─────────────────┐
│    Component    │  <- UI (React)
└────────┬────────┘
         │ usa
         ▼
┌─────────────────┐
│      Hook       │  <- TanStack Query (useWorkOrders)
└────────┬────────┘
         │ chama
         ▼
┌─────────────────┐
│    Service      │  <- API client (Axios)
└────────┬────────┘
         │ valida com
         ▼
┌─────────────────┐
│   Zod Schema    │  <- Validacao runtime
└────────┬────────┘
         │
         ▼
    API Response
```

---

## Multi-Tenancy

### Isolamento por Company

O sistema e multi-tenant com isolamento por `companyId`. Toda requisicao autenticada passa por tres guards em cadeia:

```
┌─────────────────────────────────────────────────────────────────┐
│                         REQUEST                                 │
│                                                                 │
│  Headers:                                                       │
│    Authorization: Bearer <jwt>                                  │
│    X-Company-Id: <company_uuid>                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      JwtAuthGuard                               │
│  - Valida token JWT                                             │
│  - Extrai userId do payload                                     │
│  - Injeta user no request                                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CompanyGuard                               │
│  - Valida companyId do header                                   │
│  - Verifica membership do user na company                       │
│  - Injeta company e membership no request                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      PolicyGuard                                │
│  - Verifica permissoes RBAC                                     │
│  - Checa role do membership                                     │
│  - Permite ou bloqueia acesso                                   │
└─────────────────────────────────────────────────────────────────┘
```

Esse fluxo garante que:

1. O usuario esta autenticado (JWT valido)
2. O usuario pertence a empresa informada (membership ativo)
3. O usuario tem permissao para a acao requisitada (RBAC)

### Roles Disponiveis

| Role | Descricao | Acesso |
|------|-----------|--------|
| `SUPER_ADMIN` | Administrador geral | Tudo |
| `ADMIN` | Admin da empresa | Tudo na empresa |
| `MAINTENANCE_MANAGER` | Gestor de manutencao | Work orders, services |
| `TIRE_CONSULTANT` | Consultor de pneus | Pneus, solicitacoes |
| `PARTS_CONSULTANT` | Consultor de pecas | Pecas, solicitacoes |
| `REPORT_MANAGER` | Gestor de relatorios | Dashboard, analytics |
| `GENERAL_VIEWER` | Visualizador | Somente leitura |

---

## Padroes de Codigo

Os padroes abaixo ilustram a implementacao concreta da Clean Architecture. Para diretrizes completas, veja [Clean Architecture](../padroes/clean-architecture).

### Entity (Domain)

Entities validam seus dados no construtor usando Zod:

```typescript
// core/domain/entities/work-order.ts
import { z } from 'zod';
import { randomUUID } from 'crypto';

export const workOrderSchema = z.object({
  id: z.string().uuid().optional(),
  companyId: z.string().uuid(),
  vehicleId: z.string().uuid().optional(),
  trailerId: z.string().uuid().optional(),
  status: z.nativeEnum(MaintenanceStatus),
  priority: z.nativeEnum(WorkOrderPriority),
  description: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type WorkOrderType = z.infer<typeof workOrderSchema>;

export class WorkOrder implements WorkOrderType {
  public readonly id: string;
  public companyId: string;
  public vehicleId?: string;
  public status: MaintenanceStatus;

  constructor(data: WorkOrderType) {
    const validated = workOrderSchema.parse(data);
    Object.assign(this, validated);
    this.id = validated.id ?? randomUUID();
  }
}
```

### Repository (Abstract)

Repositories sao definidos como classes abstratas na camada Core:

```typescript
// core/domain/repositories/work-order.repository.ts
export abstract class WorkOrderRepository {
  abstract create(workOrder: WorkOrder): Promise<void>;
  abstract findById(id: string, companyId: string): Promise<WorkOrder | null>;
  abstract findByCompany(companyId: string): Promise<WorkOrder[]>;
  abstract update(workOrder: WorkOrder): Promise<void>;
  abstract delete(id: string, companyId: string): Promise<void>;
}
```

### Use Case

Use cases seguem o padrao fetch-validate-build-persist:

```typescript
@Injectable()
export class CreateWorkOrderUseCase {
  constructor(
    private readonly workOrderRepository: WorkOrderRepository,
    private readonly vehicleRepository: VehicleRepository,
  ) {}

  async execute(dto: CreateWorkOrderDto): Promise<WorkOrder> {
    await this.validateVehicle(dto.vehicleId, dto.companyId);

    const workOrder = new WorkOrder({
      ...dto,
      status: MaintenanceStatus.Fila,
    });

    await this.workOrderRepository.create(workOrder);
    return workOrder;
  }

  private async validateVehicle(vehicleId: string, companyId: string) {
    const vehicle = await this.vehicleRepository.findById(vehicleId, companyId);
    if (!vehicle) {
      throw new VehicleNotFoundException();
    }
  }
}
```

### Controller

Controllers sao finos -- recebem request, delegam para use case, retornam resposta:

```typescript
@Controller('work-orders')
@UseGuards(JwtAuthGuard, CompanyGuard, PolicyGuard)
export class WorkOrderController {
  constructor(
    private readonly createWorkOrder: CreateWorkOrderUseCase,
    private readonly listWorkOrders: ListWorkOrdersUseCase,
  ) {}

  @Post()
  @Policy('work-order:create')
  async create(
    @Body() dto: CreateWorkOrderDto,
    @CurrentCompany() company: Company,
  ) {
    return this.createWorkOrder.execute({ ...dto, companyId: company.id });
  }

  @Get()
  @Policy('work-order:read')
  async list(@CurrentCompany() company: Company) {
    return this.listWorkOrders.execute(company.id);
  }
}
```

---

## Modulos do Sistema

### Diagrama de Dependencias

```
                    ┌─────────┐
                    │  Auth   │
                    └────┬────┘
                         │
            ┌────────────┼────────────┐
            │            │            │
            ▼            ▼            ▼
       ┌────────┐   ┌────────┐   ┌────────┐
       │Company │   │  User  │   │Membership│
       └────┬───┘   └────────┘   └────┬────┘
            │                         │
            └────────────┬────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
    ┌────────┐      ┌────────┐      ┌────────┐
    │ Fleet  │      │WorkOrder│     │Employee │
    └───┬────┘      └────┬───┘      └────┬───┘
        │                │               │
   ┌────┴────┐      ┌────┴────┐         │
   │         │      │         │         │
   ▼         ▼      ▼         ▼         ▼
┌───────┐┌───────┐┌───────┐┌─────┐┌─────────┐
│Vehicle││Trailer││Service││Part ││ServiceAsg│
└───────┘└───┬───┘└───────┘└─────┘└─────────┘
             │
             ▼
         ┌──────┐
         │ Axle │
         └──────┘
```

Para detalhes de modulos especificos, veja [Work Order](../modulos/work-order), [Fleet](../modulos/fleet), [Checklist](../modulos/checklist) e [Activity System](../modulos/activity-system).

---

## Domain Events + Real-Time (SSE)

O sistema utiliza Domain Events para desacoplar efeitos colaterais (logs de atividade, notificacoes) da logica principal dos use cases.

### Fluxo

```
Use Case executa operacao
    │
    ▼
Repository.save() / Repository.approve() / etc.
    │
    ▼
EventEmitter2.emit(DomainEvent)
    │
    ├──> ActivityLoggerListener -> Activity persistida (historico)
    │
    └──> NotificationListener -> NotificationService.send()
                                      │
                                      ▼
                              SSE Stream (Server-Sent Events)
                                      │
                                      ▼
                              Frontend: queryClient.invalidateQueries()
```

### SSE (Server-Sent Events)

- **Backend:** `NotificationSseService` gerencia conexoes SSE por userId
- **Endpoint:** `GET /notifications/stream?token=<jwt>` (EventSource)
- **Listeners:** Escutam domain events e chamam `notificationService.send()` ou `sendToRole()`
- **Frontend:** `useNotificationStream` hook cria EventSource e invalida React Query ao receber evento

### Dominios com Domain Events

| Dominio | Eventos | SSE |
|---------|---------|-----|
| **Work Order** | start/finish maintenance, waiting parts, cancel | Activity log |
| **Part Request** | create, approve, reject, deliver, batch approve/reject | Activity log + SSE notifications |

Para mais detalhes, veja [Activity System](../modulos/activity-system).

---

## Cache Strategy (Redis)

| Dado | TTL | Descricao |
|------|-----|-----------|
| Sessoes de usuario | 7 dias | JWT refresh tokens |
| Permissoes do membership | 1 hora | Cache RBAC para evitar queries repetidas |
| Configuracoes da company | 24 horas | Settings do tenant |
| Contadores de dashboard | 5 minutos | Agregacoes de metricas |

A invalidacao do cache e feita manualmente nos use cases que alteram os dados cacheados.

Para detalhes sobre performance e raw queries vs ORM, veja [Performance](../padroes/performance).

---

## Observabilidade

### Logging (Winston)

```
logs/
├── combined.log        # Todos os logs
├── error.log           # Apenas erros
└── access.log          # Requests HTTP
```

O `HttpLoggerInterceptor` registra automaticamente todas as requisicoes HTTP com metodo, path, status code e duracao.

### Metricas (Prometheus)

```
- http_request_duration_seconds      # Histograma de latencia por rota
- http_requests_total                # Contador total de requests por status
- database_query_duration_seconds    # Latencia de queries no banco
- cache_hits_total                   # Acertos no cache Redis
- cache_misses_total                 # Falhas no cache Redis
```

### Health Checks

```
GET /health
{
  "status": "ok",
  "checks": {
    "database": "healthy",
    "cache": "healthy",
    "memory": "healthy"
  }
}
```

---

## Seguranca

### Autenticacao

- JWT com RS256 (chaves assimetricas)
- Access token: 15 minutos de validade
- Refresh token: 7 dias de validade
- Tokens armazenados em httpOnly cookies (protecao contra XSS)

### Autorizacao

- RBAC baseado em policies (recurso + acao)
- Verificacao por `@Policy('recurso:acao')` nos controllers
- Guards em cadeia: `JwtAuthGuard` -> `CompanyGuard` -> `PolicyGuard`
- Permissoes cacheadas no Redis por 1 hora

### Protecoes

- **Rate limiting** por IP para prevenir abuso
- **CORS** configurado para aceitar apenas origens permitidas
- **Helmet** para headers de seguranca (X-Frame-Options, CSP, etc.)
- **Sanitizacao de inputs** via Zod em DTOs e entities

---

## Referencias

- [Clean Architecture](../padroes/clean-architecture) -- Principios e regras
- [Padroes de Teste](../padroes/testes) -- Testes com jest.fn() mocks
- [Domain Errors](../padroes/domain-errors) -- Sistema de erros de dominio
- [Paginacao](../padroes/paginacao) -- Padrao de paginacao para listas
- [Performance](../padroes/performance) -- Raw queries, cache e otimizacoes
- [Activity System](../modulos/activity-system) -- Domain Events e atividades
- [Work Order](../modulos/work-order) -- Modulo de ordens de servico
- [Fleet](../modulos/fleet) -- Modulo de frota
