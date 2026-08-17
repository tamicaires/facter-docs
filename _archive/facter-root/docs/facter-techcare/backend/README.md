# Backend - TechCare

> **Arquitetura e estrutura do backend NestJS.**

---

## Stack

| Tecnologia | Uso |
|------------|-----|
| Node.js 20+ | Runtime |
| NestJS 10+ | Framework |
| TypeScript 5+ | Linguagem |
| Prisma | ORM |
| PostgreSQL | Banco de Dados |
| Redis | Cache e Filas |
| BullMQ | Job Queue |
| Passport/JWT | Autenticação |
| Zod | Validação |
| Swagger | Documentação API |

---

## Estrutura de Diretórios

```
apps/api/
├── src/
│   ├── main.ts                      # Bootstrap
│   ├── app.module.ts                # Módulo raiz
│   │
│   ├── common/                      # Recursos compartilhados
│   │   ├── decorators/              # Decorators customizados
│   │   ├── filters/                 # Exception filters
│   │   ├── guards/                  # Guards de autenticação
│   │   ├── interceptors/            # Interceptors
│   │   ├── pipes/                   # Pipes de validação
│   │   ├── middlewares/             # Middlewares
│   │   └── utils/                   # Utilitários
│   │
│   ├── config/                      # Configurações
│   │   ├── app.config.ts
│   │   ├── database.config.ts
│   │   ├── auth.config.ts
│   │   └── redis.config.ts
│   │
│   ├── modules/                     # Módulos de negócio
│   │   ├── auth/
│   │   ├── users/
│   │   ├── companies/
│   │   ├── customers/
│   │   ├── equipments/
│   │   ├── service-orders/
│   │   ├── quotes/
│   │   ├── stock/
│   │   ├── payments/
│   │   ├── warranties/
│   │   ├── appointments/
│   │   ├── commissions/
│   │   ├── notifications/
│   │   ├── reports/
│   │   ├── settings/
│   │   └── dashboard/
│   │
│   ├── jobs/                        # Background jobs
│   │   ├── notifications.job.ts
│   │   ├── reports.job.ts
│   │   └── cleanup.job.ts
│   │
│   └── prisma/                      # Prisma client
│       ├── prisma.module.ts
│       └── prisma.service.ts
│
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
│
├── test/
│   ├── e2e/
│   └── unit/
│
└── package.json
```

---

## Módulos

### Core

| Módulo | Responsabilidade |
|--------|------------------|
| `auth` | Autenticação, tokens, sessões |
| `users` | Gestão de usuários e memberships |
| `companies` | Empresas, configurações, multi-tenancy |

### Negócio

| Módulo | Responsabilidade |
|--------|------------------|
| `customers` | Clientes da assistência |
| `equipments` | Equipamentos dos clientes |
| `service-orders` | Ordens de serviço |
| `quotes` | Orçamentos |
| `stock` | Peças e estoque |
| `payments` | Pagamentos |
| `warranties` | Garantias |
| `appointments` | Agendamentos |
| `commissions` | Comissões |

### Suporte

| Módulo | Responsabilidade |
|--------|------------------|
| `notifications` | Envio de notificações |
| `reports` | Geração de relatórios |
| `settings` | Configurações do sistema |
| `dashboard` | Métricas e KPIs |

---

## Estrutura de um Módulo

```
modules/service-orders/
├── service-orders.module.ts         # Definição do módulo
├── service-orders.controller.ts     # Controllers (HTTP)
├── service-orders.service.ts        # Lógica de negócio
├── service-orders.repository.ts     # Acesso a dados
├── dto/                             # Data Transfer Objects
│   ├── create-service-order.dto.ts
│   ├── update-service-order.dto.ts
│   └── query-service-order.dto.ts
├── entities/                        # Entidades/Types
│   └── service-order.entity.ts
├── events/                          # Eventos do domínio
│   └── service-order.events.ts
├── listeners/                       # Event listeners
│   └── service-order.listener.ts
└── __tests__/                       # Testes
    ├── service-orders.service.spec.ts
    └── service-orders.e2e.spec.ts
```

---

## Padrões

### Controller

```typescript
// service-orders.controller.ts
@Controller('service-orders')
@UseGuards(AuthGuard, CompanyGuard)
@ApiTags('Service Orders')
export class ServiceOrdersController {
  constructor(private readonly service: ServiceOrdersService) {}

  @Get()
  @Permission('read:ServiceOrder')
  @ApiPaginatedResponse(ServiceOrderDto)
  async findAll(
    @Query() query: QueryServiceOrderDto,
    @CurrentCompany() companyId: string,
  ): Promise<PaginatedResponse<ServiceOrderDto>> {
    return this.service.findAll(companyId, query);
  }

  @Get(':id')
  @Permission('read:ServiceOrder')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentCompany() companyId: string,
  ): Promise<ServiceOrderDto> {
    return this.service.findOne(companyId, id);
  }

  @Post()
  @Permission('create:ServiceOrder')
  async create(
    @Body() dto: CreateServiceOrderDto,
    @CurrentCompany() companyId: string,
    @CurrentUser() user: UserContext,
  ): Promise<ServiceOrderDto> {
    return this.service.create(companyId, dto, user);
  }

  @Patch(':id')
  @Permission('update:ServiceOrder')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateServiceOrderDto,
    @CurrentCompany() companyId: string,
  ): Promise<ServiceOrderDto> {
    return this.service.update(companyId, id, dto);
  }

  @Patch(':id/status')
  @Permission('update:ServiceOrder')
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStatusDto,
    @CurrentCompany() companyId: string,
    @CurrentUser() user: UserContext,
  ): Promise<ServiceOrderDto> {
    return this.service.updateStatus(companyId, id, dto, user);
  }
}
```

### Service

```typescript
// service-orders.service.ts
@Injectable()
export class ServiceOrdersService {
  constructor(
    private readonly repository: ServiceOrdersRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly stockService: StockService,
    private readonly notificationService: NotificationService,
  ) {}

  async findAll(
    companyId: string,
    query: QueryServiceOrderDto,
  ): Promise<PaginatedResponse<ServiceOrderDto>> {
    const { data, total } = await this.repository.findMany(companyId, query);

    return {
      data: data.map(this.toDto),
      meta: {
        total,
        page: query.page,
        perPage: query.perPage,
        totalPages: Math.ceil(total / query.perPage),
        hasNextPage: query.page * query.perPage < total,
        hasPrevPage: query.page > 1,
      },
    };
  }

  async create(
    companyId: string,
    dto: CreateServiceOrderDto,
    user: UserContext,
  ): Promise<ServiceOrderDto> {
    // Gerar número da OS
    const number = await this.generateNumber(companyId);

    // Criar OS
    const order = await this.repository.create({
      companyId,
      number,
      ...dto,
      status: 'RECEIVED',
      createdById: user.membershipId,
    });

    // Emitir evento
    this.eventEmitter.emit('service-order.created', {
      order,
      user,
    });

    return this.toDto(order);
  }

  async updateStatus(
    companyId: string,
    id: string,
    dto: UpdateStatusDto,
    user: UserContext,
  ): Promise<ServiceOrderDto> {
    const order = await this.repository.findOne(companyId, id);

    if (!order) {
      throw new NotFoundException('Ordem de serviço não encontrada');
    }

    // Validar transição de status
    this.validateStatusTransition(order.status, dto.status);

    // Atualizar
    const updated = await this.repository.update(id, {
      status: dto.status,
      ...(dto.status === 'COMPLETED' && { completedAt: new Date() }),
    });

    // Criar timeline
    await this.repository.createTimelineEntry({
      serviceOrderId: id,
      type: 'STATUS_CHANGED',
      previousStatus: order.status,
      newStatus: dto.status,
      notes: dto.notes,
      createdById: user.membershipId,
    });

    // Emitir evento
    this.eventEmitter.emit('service-order.status-changed', {
      order: updated,
      previousStatus: order.status,
      user,
    });

    return this.toDto(updated);
  }
}
```

### Repository

```typescript
// service-orders.repository.ts
@Injectable()
export class ServiceOrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(
    companyId: string,
    query: QueryServiceOrderDto,
  ): Promise<{ data: ServiceOrder[]; total: number }> {
    const where = {
      companyId,
      deletedAt: null,
      ...(query.status && { status: { in: query.status } }),
      ...(query.technicianId && { assignedToId: query.technicianId }),
      ...(query.customerId && { customerId: query.customerId }),
      ...(query.search && {
        OR: [
          { number: { contains: query.search, mode: 'insensitive' } },
          { customer: { name: { contains: query.search, mode: 'insensitive' } } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.serviceOrder.findMany({
        where,
        include: {
          customer: { select: { id: true, name: true, phone: true } },
          equipment: { select: { id: true, type: true, brand: true, model: true } },
          assignedTo: { select: { id: true, user: { select: { name: true } } } },
        },
        orderBy: { [query.sortBy]: query.sortOrder },
        skip: (query.page - 1) * query.perPage,
        take: query.perPage,
      }),
      this.prisma.serviceOrder.count({ where }),
    ]);

    return { data, total };
  }

  async findOne(companyId: string, id: string): Promise<ServiceOrder | null> {
    return this.prisma.serviceOrder.findFirst({
      where: { id, companyId, deletedAt: null },
      include: {
        customer: true,
        equipment: true,
        assignedTo: { include: { user: true } },
        quote: { include: { items: true } },
        payments: true,
        timeline: { orderBy: { createdAt: 'desc' } },
      },
    });
  }
}
```

### DTO

```typescript
// dto/create-service-order.dto.ts
export class CreateServiceOrderDto {
  @ApiProperty()
  @IsUUID()
  customerId: string;

  @ApiProperty()
  @IsUUID()
  equipmentId: string;

  @ApiProperty()
  @IsString()
  @MaxLength(1000)
  reportedIssue: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority = Priority.NORMAL;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  internalNotes?: string;
}

// dto/query-service-order.dto.ts
export class QueryServiceOrderDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsEnum(ServiceOrderStatus, { each: true })
  status?: ServiceOrderStatus[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  technicianId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}
```

---

## Multi-tenancy

### Middleware

```typescript
// middlewares/company.middleware.ts
@Injectable()
export class CompanyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // CompanyId vem do JWT após autenticação
    const companyId = req.user?.membership?.companyId;

    if (companyId) {
      req.companyId = companyId;
    }

    next();
  }
}
```

### Guard

```typescript
// guards/company.guard.ts
@Injectable()
export class CompanyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const companyId = request.companyId;

    if (!companyId) {
      throw new ForbiddenException('Company context required');
    }

    return true;
  }
}
```

### Decorator

```typescript
// decorators/current-company.decorator.ts
export const CurrentCompany = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.companyId;
  },
);

// Uso
@Get()
async findAll(@CurrentCompany() companyId: string) {
  return this.service.findAll(companyId);
}
```

---

## Eventos

```typescript
// events/service-order.events.ts
export class ServiceOrderCreatedEvent {
  constructor(
    public readonly order: ServiceOrder,
    public readonly user: UserContext,
  ) {}
}

export class ServiceOrderStatusChangedEvent {
  constructor(
    public readonly order: ServiceOrder,
    public readonly previousStatus: ServiceOrderStatus,
    public readonly user: UserContext,
  ) {}
}

// listeners/service-order.listener.ts
@Injectable()
export class ServiceOrderListener {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly auditService: AuditService,
  ) {}

  @OnEvent('service-order.created')
  async handleCreated(event: ServiceOrderCreatedEvent) {
    // Notificar cliente
    await this.notificationService.send({
      type: 'OS_CREATED',
      recipientId: event.order.customerId,
      data: {
        orderNumber: event.order.number,
        equipmentDescription: '...',
      },
    });

    // Audit log
    await this.auditService.log({
      action: 'SERVICE_ORDER_CREATED',
      targetType: 'ServiceOrder',
      targetId: event.order.id,
      userId: event.user.id,
    });
  }

  @OnEvent('service-order.status-changed')
  async handleStatusChanged(event: ServiceOrderStatusChangedEvent) {
    // Notificar cliente sobre mudança de status
    await this.notificationService.send({
      type: 'OS_STATUS_CHANGED',
      recipientId: event.order.customerId,
      data: {
        orderNumber: event.order.number,
        newStatus: event.order.status,
      },
    });
  }
}
```

---

## Documentação Detalhada

| Módulo | Documentação |
|--------|--------------|
| [Auth](./modules/auth.md) | Autenticação e autorização |
| [Service Orders](./modules/service-orders.md) | Ordens de serviço |
| [Stock](./modules/stock.md) | Gestão de estoque |
| [Notifications](./modules/notifications.md) | Sistema de notificações |
| [Jobs](./modules/jobs.md) | Background jobs |

---

**Voltar para** [TechCare](../README.md)
