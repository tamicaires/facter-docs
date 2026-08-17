# ServiceOrder (Ordem de Serviço)

> **Entidade central do sistema TechCare.**

---

## Schema Prisma

```prisma
model ServiceOrder {
  id                String              @id @default(uuid())
  number            String              @unique // OS-202501-00001
  companyId         String
  company           Company             @relation(fields: [companyId], references: [id])

  // Relacionamentos principais
  customerId        String
  customer          Customer            @relation(fields: [customerId], references: [id])
  equipmentId       String
  equipment         Equipment           @relation(fields: [equipmentId], references: [id])
  technicianId      String?
  technician        User?               @relation("TechnicianOrders", fields: [technicianId], references: [id])
  createdById       String
  createdBy         User                @relation("CreatedOrders", fields: [createdById], references: [id])

  // Status e prioridade
  status            ServiceOrderStatus  @default(RECEIVED)
  priority          Priority            @default(NORMAL)

  // Informações do equipamento
  reportedIssue     String              // Defeito relatado pelo cliente
  physicalCondition PhysicalCondition   // Condição física na entrada
  accessories       String[]            // Acessórios entregues
  password          String?             // Senha do equipamento (criptografada)

  // Diagnóstico
  diagnosisId       String?             @unique
  diagnosis         Diagnosis?          @relation(fields: [diagnosisId], references: [id])

  // Orçamento
  quoteId           String?             @unique
  quote             Quote?              @relation(fields: [quoteId], references: [id])

  // Pagamento
  payments          Payment[]

  // Garantia
  warrantyId        String?
  warranty          Warranty?           @relation(fields: [warrantyId], references: [id])

  // Timeline
  events            ServiceOrderEvent[]
  attachments       Attachment[]
  notes             Note[]

  // Datas importantes
  receivedAt        DateTime            @default(now())
  diagnosedAt       DateTime?
  approvedAt        DateTime?
  completedAt       DateTime?
  deliveredAt       DateTime?

  // Valores
  laborCost         Decimal?            @db.Decimal(10, 2)
  partsCost         Decimal?            @db.Decimal(10, 2)
  discount          Decimal?            @db.Decimal(10, 2)
  total             Decimal?            @db.Decimal(10, 2)

  // Metadata
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt
  deletedAt         DateTime?

  @@index([companyId])
  @@index([customerId])
  @@index([technicianId])
  @@index([status])
  @@index([number])
}

enum ServiceOrderStatus {
  RECEIVED            // Recebido
  TRIAGE              // Em triagem
  DIAGNOSIS           // Em diagnóstico
  AWAITING_APPROVAL   // Aguardando aprovação
  APPROVED            // Aprovado
  REJECTED            // Rejeitado
  AWAITING_PARTS      // Aguardando peças
  IN_PROGRESS         // Em execução
  COMPLETED           // Finalizado
  DELIVERED           // Entregue
  ARCHIVED            // Arquivado
  CANCELLED           // Cancelado
}

enum Priority {
  NORMAL
  HIGH
  URGENT
}

enum PhysicalCondition {
  EXCELLENT
  GOOD
  FAIR
  POOR
  BAD
}
```

---

## Relacionamentos

```
ServiceOrder
├── Company (N:1)
├── Customer (N:1)
├── Equipment (N:1)
├── Technician/User (N:1)
├── CreatedBy/User (N:1)
├── Diagnosis (1:1)
├── Quote (1:1)
├── Payments (1:N)
├── Events (1:N)
├── Attachments (1:N)
└── Notes (1:N)
```

---

## DTOs

### CreateServiceOrderDto

```typescript
interface CreateServiceOrderDto {
  // Cliente (existente ou novo)
  customerId?: string;
  newCustomer?: CreateCustomerDto;

  // Equipamento
  equipment: {
    category: EquipmentCategory;
    brand: string;
    model: string;
    serialNumber?: string;
    imei?: string;
    color?: string;
    capacity?: string;
  };

  // Informações da OS
  reportedIssue: string;
  physicalCondition: PhysicalCondition;
  accessories?: string[];
  password?: string;
  priority?: Priority;
  notes?: string;
}
```

### UpdateServiceOrderDto

```typescript
interface UpdateServiceOrderDto {
  technicianId?: string;
  priority?: Priority;
  notes?: string;
}
```

### ServiceOrderResponseDto

```typescript
interface ServiceOrderResponseDto {
  id: string;
  number: string;
  status: ServiceOrderStatus;
  priority: Priority;

  customer: {
    id: string;
    name: string;
    phone: string;
  };

  equipment: {
    id: string;
    category: string;
    brand: string;
    model: string;
  };

  technician?: {
    id: string;
    name: string;
  };

  reportedIssue: string;
  diagnosis?: DiagnosisDto;
  quote?: QuoteDto;

  receivedAt: Date;
  completedAt?: Date;
  total?: number;
}
```

---

## Use Cases

### CreateServiceOrderUseCase

```typescript
@Injectable()
export class CreateServiceOrderUseCase {
  constructor(
    private serviceOrderRepository: ServiceOrderRepository,
    private customerRepository: CustomerRepository,
    private equipmentRepository: EquipmentRepository,
    private numberGenerator: ServiceOrderNumberGenerator,
  ) {}

  async execute(dto: CreateServiceOrderDto, userId: string): Promise<ServiceOrder> {
    // 1. Resolver cliente
    let customerId = dto.customerId;
    if (!customerId && dto.newCustomer) {
      const customer = await this.customerRepository.create(dto.newCustomer);
      customerId = customer.id;
    }

    // 2. Criar equipamento
    const equipment = await this.equipmentRepository.create({
      ...dto.equipment,
      customerId,
    });

    // 3. Gerar número da OS
    const number = await this.numberGenerator.generate();

    // 4. Criar OS
    const serviceOrder = await this.serviceOrderRepository.create({
      number,
      customerId,
      equipmentId: equipment.id,
      createdById: userId,
      ...dto,
    });

    // 5. Registrar evento
    await this.eventService.create({
      serviceOrderId: serviceOrder.id,
      type: 'STATUS_CHANGED',
      description: 'Ordem de serviço criada',
      userId,
    });

    return serviceOrder;
  }
}
```

### ChangeStatusUseCase

```typescript
@Injectable()
export class ChangeStatusUseCase {
  private transitions: Record<ServiceOrderStatus, ServiceOrderStatus[]> = {
    RECEIVED: ['TRIAGE', 'CANCELLED'],
    TRIAGE: ['DIAGNOSIS', 'CANCELLED'],
    // ... resto das transições
  };

  async execute(id: string, newStatus: ServiceOrderStatus, userId: string): Promise<ServiceOrder> {
    const order = await this.repository.findById(id);

    if (!order) {
      throw new NotFoundException('Ordem de serviço não encontrada');
    }

    // Validar transição
    const allowedTransitions = this.transitions[order.status];
    if (!allowedTransitions.includes(newStatus)) {
      throw new BadRequestException(
        `Transição de ${order.status} para ${newStatus} não permitida`
      );
    }

    // Validações específicas por status
    await this.validateStatusChange(order, newStatus);

    // Atualizar
    const updated = await this.repository.update(id, {
      status: newStatus,
      [this.getDateField(newStatus)]: new Date(),
    });

    // Registrar evento
    await this.eventService.create({
      serviceOrderId: id,
      type: 'STATUS_CHANGED',
      description: `Status alterado para ${newStatus}`,
      userId,
      metadata: { previousStatus: order.status, newStatus },
    });

    return updated;
  }
}
```

---

## Queries Comuns

### Listar OS com Filtros

```typescript
async findMany(filters: ServiceOrderFilters): Promise<ServiceOrder[]> {
  return this.prisma.serviceOrder.findMany({
    where: {
      companyId: filters.companyId,
      deletedAt: null,
      ...(filters.status && { status: filters.status }),
      ...(filters.technicianId && { technicianId: filters.technicianId }),
      ...(filters.customerId && { customerId: filters.customerId }),
      ...(filters.search && {
        OR: [
          { number: { contains: filters.search } },
          { customer: { name: { contains: filters.search, mode: 'insensitive' } } },
          { equipment: { model: { contains: filters.search, mode: 'insensitive' } } },
        ],
      }),
    },
    include: {
      customer: { select: { id: true, name: true, phone: true } },
      equipment: { select: { id: true, category: true, brand: true, model: true } },
      technician: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
    skip: filters.skip,
    take: filters.take,
  });
}
```

### Dashboard Counts

```typescript
async getDashboardCounts(companyId: string): Promise<DashboardCounts> {
  const [received, inProgress, completed, delivered] = await Promise.all([
    this.prisma.serviceOrder.count({
      where: { companyId, status: 'RECEIVED', deletedAt: null },
    }),
    this.prisma.serviceOrder.count({
      where: { companyId, status: { in: ['DIAGNOSIS', 'IN_PROGRESS'] }, deletedAt: null },
    }),
    this.prisma.serviceOrder.count({
      where: { companyId, status: 'COMPLETED', deletedAt: null },
    }),
    this.prisma.serviceOrder.count({
      where: { companyId, status: 'DELIVERED', deletedAt: null },
    }),
  ]);

  return { received, inProgress, completed, delivered };
}
```

---

## Índices

```prisma
@@index([companyId])              // Multi-tenant
@@index([customerId])             // Busca por cliente
@@index([technicianId])           // Busca por técnico
@@index([status])                 // Filtro por status
@@index([number])                 // Busca por número
@@index([createdAt])              // Ordenação
@@index([companyId, status])      // Dashboard
```

---

**Voltar para** [Entidades](./README.md)
