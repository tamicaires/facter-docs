# Auditoria e Histórico

> **Sistema de rastreamento de ações e histórico de alterações.**

---

## Conceito

Todo sistema empresarial precisa de rastreabilidade para:
- Saber **quem** fez **o quê** e **quando**
- Reverter alterações quando necessário
- Compliance e segurança
- Resolver disputas com clientes

---

## Estrutura de Audit Log

```prisma
model AuditLog {
  id          String    @id @default(uuid())
  companyId   String
  company     Company   @relation(fields: [companyId], references: [id])

  // Quem
  userId      String
  user        User      @relation(fields: [userId], references: [id])
  userRole    String    // Role no momento da ação
  userIp      String?
  userAgent   String?

  // O quê
  action      AuditAction
  entity      String    // "ServiceOrder", "Customer", etc
  entityId    String

  // Detalhes
  oldValues   Json?     // Estado anterior
  newValues   Json?     // Novo estado
  diff        Json?     // Apenas campos alterados
  metadata    Json?     // Dados adicionais

  // Quando
  timestamp   DateTime  @default(now())

  @@index([companyId, entity, entityId])
  @@index([companyId, userId])
  @@index([companyId, timestamp])
}

enum AuditAction {
  CREATE
  UPDATE
  DELETE
  RESTORE
  VIEW
  EXPORT
  LOGIN
  LOGOUT
  PERMISSION_CHANGE
}
```

---

## Eventos Auditados

### Ordens de Serviço

| Evento | Dados Registrados |
|--------|-------------------|
| Criação | Todos os campos iniciais |
| Mudança de status | Status anterior → novo |
| Atribuição técnico | Técnico anterior → novo |
| Alteração de prioridade | Prioridade anterior → nova |
| Adição de fotos | URLs das fotos |
| Edição de defeito/diagnóstico | Texto anterior → novo |
| Cancelamento | Motivo |

### Orçamentos

| Evento | Dados Registrados |
|--------|-------------------|
| Criação | Itens, valores |
| Alteração de itens | Item alterado + valores |
| Aplicação de desconto | % ou valor, quem autorizou |
| Aprovação | Quem aprovou, timestamp |
| Rejeição | Motivo |

### Clientes

| Evento | Dados Registrados |
|--------|-------------------|
| Cadastro | Dados iniciais |
| Atualização | Campos alterados |
| Mudança de categoria | Categoria anterior → nova |
| Exclusão | Todos os dados (soft delete) |

### Estoque

| Evento | Dados Registrados |
|--------|-------------------|
| Entrada | Quantidade, fornecedor, custo |
| Saída | Quantidade, OS vinculada |
| Ajuste | Quantidade anterior → nova, motivo |
| Alteração de preço | Preço anterior → novo |

### Usuários e Permissões

| Evento | Dados Registrados |
|--------|-------------------|
| Login | IP, User Agent, sucesso/falha |
| Logout | Duração da sessão |
| Mudança de role | Role anterior → nova |
| Convite enviado | Email, role |
| Desativação | Motivo |

---

## Implementação

### Middleware Prisma

```typescript
// Middleware para capturar alterações automaticamente
prisma.$use(async (params, next) => {
  const auditableModels = [
    'ServiceOrder', 'Customer', 'Quote',
    'Payment', 'Part', 'User'
  ];

  if (!auditableModels.includes(params.model)) {
    return next(params);
  }

  // Capturar estado anterior para UPDATE/DELETE
  let oldData = null;
  if (['update', 'delete'].includes(params.action)) {
    oldData = await prisma[params.model].findUnique({
      where: params.args.where,
    });
  }

  const result = await next(params);

  // Registrar no audit log
  if (['create', 'update', 'delete'].includes(params.action)) {
    await createAuditLog({
      action: params.action.toUpperCase(),
      entity: params.model,
      entityId: result.id || params.args.where.id,
      oldValues: oldData,
      newValues: ['create', 'update'].includes(params.action) ? result : null,
    });
  }

  return result;
});
```

### Decorator NestJS

```typescript
// Decorator para endpoints sensíveis
@Audit('ServiceOrder', 'UPDATE')
@Put(':id/status')
async updateStatus(
  @Param('id') id: string,
  @Body() dto: UpdateStatusDto,
  @CurrentUser() user: User,
) {
  return this.service.updateStatus(id, dto, user);
}

// Implementação do decorator
function Audit(entity: string, action: AuditAction) {
  return applyDecorators(
    UseInterceptors(new AuditInterceptor(entity, action)),
  );
}
```

### Contexto de Usuário

```typescript
// AsyncLocalStorage para propagar contexto
const auditContext = new AsyncLocalStorage<AuditContext>();

interface AuditContext {
  userId: string;
  userRole: string;
  ip: string;
  userAgent: string;
  companyId: string;
}

// Middleware Express/NestJS
app.use((req, res, next) => {
  const context: AuditContext = {
    userId: req.user?.id,
    userRole: req.user?.role,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    companyId: req.user?.companyId,
  };

  auditContext.run(context, next);
});
```

---

## Histórico na Interface

### Timeline de OS

```typescript
interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  timestamp: Date;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  description: string;
  details?: Record<string, any>;
  icon: string;
  color: string;
}

type TimelineEventType =
  | 'STATUS_CHANGE'
  | 'QUOTE_CREATED'
  | 'QUOTE_APPROVED'
  | 'QUOTE_REJECTED'
  | 'TECHNICIAN_ASSIGNED'
  | 'PHOTO_ADDED'
  | 'NOTE_ADDED'
  | 'PAYMENT_RECEIVED'
  | 'DELIVERED';
```

### Componente de Timeline

```tsx
function ServiceOrderTimeline({ orderId }: { orderId: string }) {
  const { data: events } = useServiceOrderHistory(orderId);

  return (
    <div className="space-y-4">
      {events.map((event, index) => (
        <TimelineItem
          key={event.id}
          event={event}
          isLast={index === events.length - 1}
        />
      ))}
    </div>
  );
}

function TimelineItem({ event, isLast }: TimelineItemProps) {
  return (
    <div className="flex gap-4">
      {/* Linha vertical */}
      <div className="flex flex-col items-center">
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center",
          event.color
        )}>
          <Icon name={event.icon} size={16} />
        </div>
        {!isLast && <div className="w-px h-full bg-border" />}
      </div>

      {/* Conteúdo */}
      <div className="flex-1 pb-4">
        <p className="font-medium">{event.description}</p>
        <p className="text-sm text-muted-foreground">
          {event.user.name} • {formatRelative(event.timestamp)}
        </p>
        {event.details && (
          <EventDetails details={event.details} type={event.type} />
        )}
      </div>
    </div>
  );
}
```

---

## Consultas e Relatórios

### Buscar Histórico

```typescript
// API de histórico
interface AuditQuery {
  companyId: string;
  entity?: string;
  entityId?: string;
  userId?: string;
  action?: AuditAction;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

async function getAuditLogs(query: AuditQuery): Promise<PaginatedResult<AuditLog>> {
  return prisma.auditLog.findMany({
    where: {
      companyId: query.companyId,
      ...(query.entity && { entity: query.entity }),
      ...(query.entityId && { entityId: query.entityId }),
      ...(query.userId && { userId: query.userId }),
      ...(query.action && { action: query.action }),
      ...(query.startDate && { timestamp: { gte: query.startDate } }),
      ...(query.endDate && { timestamp: { lte: query.endDate } }),
    },
    include: {
      user: {
        select: { id: true, name: true, avatar: true },
      },
    },
    orderBy: { timestamp: 'desc' },
    skip: (query.page - 1) * query.limit,
    take: query.limit,
  });
}
```

### Exportar para Compliance

```typescript
// Exportar logs para auditoria externa
async function exportAuditLogs(
  companyId: string,
  startDate: Date,
  endDate: Date
): Promise<Buffer> {
  const logs = await prisma.auditLog.findMany({
    where: {
      companyId,
      timestamp: { gte: startDate, lte: endDate },
    },
    include: { user: true },
    orderBy: { timestamp: 'asc' },
  });

  // Gerar CSV ou Excel
  return generateReport(logs, 'xlsx');
}
```

---

## Retenção de Dados

```typescript
// Política de retenção
const RETENTION_POLICY = {
  // Logs operacionais: 1 ano
  operational: 365,
  // Logs financeiros: 5 anos (fiscal)
  financial: 1825,
  // Logs de acesso: 6 meses
  access: 180,
};

// Job de limpeza
async function cleanupAuditLogs() {
  const now = new Date();

  // Logs operacionais antigos
  await prisma.auditLog.deleteMany({
    where: {
      action: { notIn: ['PAYMENT', 'INVOICE'] },
      timestamp: {
        lt: subDays(now, RETENTION_POLICY.operational)
      },
    },
  });

  // Logs de acesso antigos
  await prisma.auditLog.deleteMany({
    where: {
      action: { in: ['LOGIN', 'LOGOUT', 'VIEW'] },
      timestamp: {
        lt: subDays(now, RETENTION_POLICY.access)
      },
    },
  });
}
```

---

## Permissões

| Ação | Atendente | Técnico | Gerente | Admin |
|------|-----------|---------|---------|-------|
| Ver histórico de OS | ✅ | ✅ | ✅ | ✅ |
| Ver histórico de cliente | ✅ | ❌ | ✅ | ✅ |
| Ver logs de sistema | ❌ | ❌ | ✅ | ✅ |
| Exportar logs | ❌ | ❌ | ❌ | ✅ |
| Ver logs de acesso | ❌ | ❌ | ❌ | ✅ |

---

**Voltar para** [Regras de Negócio](./README.md)
