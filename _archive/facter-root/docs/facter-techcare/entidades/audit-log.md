# AuditLog (Log de Auditoria)

> **Entidade que registra todas as alterações importantes no sistema.**

---

## Schema Prisma

```prisma
model AuditLog {
  id              String          @id @default(uuid())
  companyId       String
  company         Company         @relation(fields: [companyId], references: [id])

  // Quem fez a ação
  userId          String?
  user            User?           @relation(fields: [userId], references: [id])
  membershipId    String?
  membership      Membership?     @relation(fields: [membershipId], references: [id])

  // Ação do sistema (sem usuário)
  isSystemAction  Boolean         @default(false)

  // Entidade afetada
  entityType      String          // 'ServiceOrder', 'Customer', etc
  entityId        String

  // Ação realizada
  action          AuditAction

  // Dados da alteração
  changes         Json?           // { field: { old, new } }
  metadata        Json?           // Dados extras (IP, user agent, etc)

  // Contexto
  ipAddress       String?
  userAgent       String?
  requestId       String?         // Para correlacionar múltiplas ações

  createdAt       DateTime        @default(now())

  @@index([companyId])
  @@index([companyId, entityType, entityId])
  @@index([companyId, createdAt])
  @@index([companyId, userId])
  @@index([companyId, action])
}

enum AuditAction {
  // CRUD
  CREATE
  UPDATE
  DELETE
  RESTORE         // Restaurar soft delete

  // Status
  STATUS_CHANGE

  // Autenticação
  LOGIN
  LOGOUT
  LOGIN_FAILED
  PASSWORD_CHANGE
  MFA_ENABLE
  MFA_DISABLE

  // Convites
  INVITE_SENT
  INVITE_ACCEPTED
  INVITE_REJECTED

  // OS
  OS_ASSIGNED
  OS_DIAGNOSIS
  OS_QUOTE_SENT
  OS_QUOTE_APPROVED
  OS_QUOTE_REJECTED
  OS_COMPLETED
  OS_DELIVERED

  // Pagamento
  PAYMENT_RECEIVED
  PAYMENT_REFUNDED

  // Estoque
  STOCK_ADJUSTMENT
  STOCK_RESERVED
  STOCK_RELEASED

  // Config
  CONFIG_CHANGE

  // Export/Import
  DATA_EXPORT
  DATA_IMPORT
}
```

---

## Middleware de Auditoria

```typescript
// lib/audit.ts
interface AuditContext {
  userId?: string;
  membershipId?: string;
  companyId: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
}

let auditContext: AuditContext | null = null;

export function setAuditContext(ctx: AuditContext) {
  auditContext = ctx;
}

export function clearAuditContext() {
  auditContext = null;
}

export async function audit(params: {
  entityType: string;
  entityId: string;
  action: AuditAction;
  changes?: Record<string, { old: any; new: any }>;
  metadata?: Record<string, any>;
  isSystemAction?: boolean;
}) {
  if (!auditContext) {
    console.warn('Audit context not set');
    return;
  }

  await prisma.auditLog.create({
    data: {
      companyId: auditContext.companyId,
      userId: auditContext.userId,
      membershipId: auditContext.membershipId,
      ipAddress: auditContext.ipAddress,
      userAgent: auditContext.userAgent,
      requestId: auditContext.requestId,
      isSystemAction: params.isSystemAction ?? false,
      entityType: params.entityType,
      entityId: params.entityId,
      action: params.action,
      changes: params.changes,
      metadata: params.metadata,
    },
  });
}

// Middleware Express
export function auditMiddleware(req: Request, res: Response, next: NextFunction) {
  const requestId = uuidv4();

  setAuditContext({
    userId: req.user?.id,
    membershipId: req.membership?.id,
    companyId: req.companyId,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    requestId,
  });

  res.on('finish', () => {
    clearAuditContext();
  });

  next();
}
```

---

## Prisma Extension para Auditoria Automática

```typescript
// lib/prisma-audit-extension.ts
import { Prisma } from '@prisma/client';

const AUDITED_MODELS = [
  'ServiceOrder',
  'Customer',
  'Equipment',
  'Quote',
  'Payment',
  'Part',
  'User',
  'Membership',
  'Warranty',
  'Appointment',
];

export const auditExtension = Prisma.defineExtension({
  name: 'audit',
  query: {
    $allModels: {
      async create({ model, args, query }) {
        const result = await query(args);

        if (AUDITED_MODELS.includes(model)) {
          await audit({
            entityType: model,
            entityId: result.id,
            action: 'CREATE',
            changes: { all: { old: null, new: result } },
          });
        }

        return result;
      },

      async update({ model, args, query }) {
        if (!AUDITED_MODELS.includes(model)) {
          return query(args);
        }

        // Buscar valor anterior
        const before = await prisma[model].findUnique({
          where: args.where,
        });

        const result = await query(args);

        // Calcular diferenças
        const changes: Record<string, { old: any; new: any }> = {};

        for (const key of Object.keys(args.data)) {
          if (before[key] !== result[key]) {
            changes[key] = {
              old: before[key],
              new: result[key],
            };
          }
        }

        if (Object.keys(changes).length > 0) {
          await audit({
            entityType: model,
            entityId: result.id,
            action: changes.status ? 'STATUS_CHANGE' : 'UPDATE',
            changes,
          });
        }

        return result;
      },

      async delete({ model, args, query }) {
        if (!AUDITED_MODELS.includes(model)) {
          return query(args);
        }

        const before = await prisma[model].findUnique({
          where: args.where,
        });

        const result = await query(args);

        await audit({
          entityType: model,
          entityId: before.id,
          action: 'DELETE',
          changes: { all: { old: before, new: null } },
        });

        return result;
      },
    },
  },
});

// Usar
export const prisma = new PrismaClient().$extends(auditExtension);
```

---

## Timeline da OS

```typescript
// hooks/useServiceOrderTimeline.ts
interface TimelineEvent {
  id: string;
  timestamp: Date;
  action: AuditAction;
  description: string;
  user?: {
    name: string;
    avatar?: string;
  };
  changes?: Record<string, { old: any; new: any }>;
  icon: React.ComponentType;
  color: string;
}

function useServiceOrderTimeline(serviceOrderId: string) {
  return useQuery({
    queryKey: ['service-order-timeline', serviceOrderId],
    queryFn: async () => {
      const logs = await api.get(`/audit-logs`, {
        params: {
          entityType: 'ServiceOrder',
          entityId: serviceOrderId,
        },
      });

      return logs.map(log => formatTimelineEvent(log));
    },
  });
}

function formatTimelineEvent(log: AuditLog): TimelineEvent {
  const config = ACTION_CONFIG[log.action];

  return {
    id: log.id,
    timestamp: log.createdAt,
    action: log.action,
    description: config.getDescription(log),
    user: log.user ? {
      name: log.user.name,
      avatar: log.user.avatar,
    } : undefined,
    changes: log.changes,
    icon: config.icon,
    color: config.color,
  };
}

const ACTION_CONFIG: Record<AuditAction, {
  icon: React.ComponentType;
  color: string;
  getDescription: (log: AuditLog) => string;
}> = {
  CREATE: {
    icon: PlusCircle,
    color: 'green',
    getDescription: () => 'OS criada',
  },
  STATUS_CHANGE: {
    icon: ArrowRight,
    color: 'blue',
    getDescription: (log) => {
      const oldStatus = log.changes?.status?.old;
      const newStatus = log.changes?.status?.new;
      return `Status alterado de ${getStatusLabel(oldStatus)} para ${getStatusLabel(newStatus)}`;
    },
  },
  OS_ASSIGNED: {
    icon: User,
    color: 'purple',
    getDescription: (log) => `Atribuída para ${log.metadata?.technicianName}`,
  },
  OS_DIAGNOSIS: {
    icon: Search,
    color: 'yellow',
    getDescription: () => 'Diagnóstico registrado',
  },
  OS_QUOTE_SENT: {
    icon: FileText,
    color: 'blue',
    getDescription: () => 'Orçamento enviado ao cliente',
  },
  OS_QUOTE_APPROVED: {
    icon: CheckCircle,
    color: 'green',
    getDescription: () => 'Orçamento aprovado pelo cliente',
  },
  // ... outras ações
};
```

---

## Componente Timeline

```tsx
function ServiceOrderTimeline({ serviceOrderId }: { serviceOrderId: string }) {
  const { data: events, isLoading } = useServiceOrderTimeline(serviceOrderId);

  if (isLoading) return <Skeleton className="h-64" />;

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Histórico</h3>

      <div className="relative">
        {/* Linha vertical */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-muted" />

        <div className="space-y-6">
          {events?.map((event, index) => (
            <div key={event.id} className="relative flex gap-4">
              {/* Ícone */}
              <div className={cn(
                "relative z-10 flex h-8 w-8 items-center justify-center rounded-full",
                `bg-${event.color}-100`
              )}>
                <event.icon className={cn("h-4 w-4", `text-${event.color}-600`)} />
              </div>

              {/* Conteúdo */}
              <div className="flex-1 pt-1">
                <p className="text-sm">{event.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  {event.user && (
                    <>
                      <Avatar className="h-4 w-4">
                        <AvatarImage src={event.user.avatar} />
                        <AvatarFallback>{event.user.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">
                        {event.user.name}
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                    </>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(event.timestamp, {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </span>
                </div>

                {/* Mudanças detalhadas (expandível) */}
                {event.changes && Object.keys(event.changes).length > 0 && (
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="mt-2">
                        Ver detalhes
                        <ChevronDown className="h-4 w-4 ml-1" />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="mt-2 rounded bg-muted p-3 text-xs space-y-1">
                        {Object.entries(event.changes).map(([field, { old, new: newVal }]) => (
                          <div key={field} className="flex gap-2">
                            <span className="font-medium">{field}:</span>
                            <span className="text-red-600 line-through">{String(old)}</span>
                            <span>→</span>
                            <span className="text-green-600">{String(newVal)}</span>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## Endpoints da API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/audit-logs` | Listar logs (admin) |
| GET | `/audit-logs/entity/:type/:id` | Logs de uma entidade |
| GET | `/audit-logs/user/:userId` | Logs de um usuário |
| GET | `/audit-logs/export` | Exportar logs |

### Filtros

```http
GET /audit-logs?entityType=ServiceOrder&action=STATUS_CHANGE&from=2025-01-01&to=2025-01-31

{
  "data": [...],
  "meta": {
    "total": 150,
    "page": 1,
    "perPage": 50
  }
}
```

---

## Retenção de Dados

```typescript
// jobs/cleanup-audit-logs.ts
async function cleanupAuditLogs() {
  const companies = await prisma.company.findMany({
    include: { plan: true },
  });

  for (const company of companies) {
    // Retenção baseada no plano
    const retentionDays = {
      FREE: 30,
      STARTER: 90,
      PROFESSIONAL: 365,
      ENTERPRISE: 730, // 2 anos
    }[company.plan.name];

    const cutoffDate = subDays(new Date(), retentionDays);

    await prisma.auditLog.deleteMany({
      where: {
        companyId: company.id,
        createdAt: { lt: cutoffDate },
      },
    });
  }
}

// Executar diariamente
cron.schedule('0 3 * * *', cleanupAuditLogs);
```

---

## Regras de Negócio

### O que é auditado
- Todas as operações CRUD em entidades principais
- Mudanças de status
- Ações de autenticação
- Alterações de configuração
- Exportações e importações de dados

### O que NÃO é auditado
- Queries de leitura (exceto exports)
- Dados temporários
- Cache

### Retenção
- Logs são mantidos conforme o plano
- Logs críticos (pagamentos, exclusões) têm retenção mínima de 1 ano
- Empresas podem exportar logs antes da expiração

### Acesso
- Usuários veem histórico das entidades que têm acesso
- Admins veem todos os logs da empresa
- Logs de autenticação visíveis apenas para admins

---

**Voltar para** [Entidades](./README.md)
