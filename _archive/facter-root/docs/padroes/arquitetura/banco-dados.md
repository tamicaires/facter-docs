# Padrões de Banco de Dados

> **Padrões de modelagem e uso de banco de dados nos projetos Facter.**

---

## Stack

| Tecnologia | Propósito |
|------------|-----------|
| **PostgreSQL** | Banco de dados |
| **Prisma** | ORM |

---

## Convenções de Nomenclatura

| Elemento | Convenção | Exemplo |
|----------|-----------|---------|
| Tabelas | PascalCase (singular) | `User`, `WorkOrder` |
| Colunas | camelCase | `createdAt`, `companyId` |
| Índices | `idx_{tabela}_{colunas}` | `idx_user_email` |
| Foreign Keys | `fk_{tabela}_{referencia}` | `fk_order_user` |
| Unique Constraints | `uq_{tabela}_{colunas}` | `uq_user_email_company` |

---

## Multi-Tenant

### Todas as tabelas principais devem ter `companyId`

```prisma
model User {
  id        String   @id @default(uuid())
  name      String
  email     String
  companyId String
  company   Company  @relation(fields: [companyId], references: [id])

  @@unique([companyId, email])  // Email único por empresa
  @@index([companyId])          // Índice para queries
}
```

### Sempre filtrar por companyId

```typescript
// ❌ NUNCA - vazamento de dados entre tenants
const users = await prisma.user.findMany();

// ✅ SEMPRE - isolamento de tenant
const users = await prisma.user.findMany({
  where: { companyId: company.id },
});
```

---

## Modelo Base

```prisma
// Campos padrão para todas as entidades
model BaseEntity {
  id        String   @id @default(uuid())
  companyId String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  isActive  Boolean  @default(true)
}
```

---

## Índices

### Quando criar índices

| Cenário | Índice |
|---------|--------|
| Foreign keys | Sempre |
| Campos de filtro frequente | Sempre |
| Campos de ordenação | Considerar |
| Campos únicos | Automático |
| Campos de busca textual | Considerar |

### Exemplos

```prisma
model WorkOrder {
  id        String   @id @default(uuid())
  status    String
  priority  String
  companyId String
  fleetId   String
  createdAt DateTime @default(now())

  // Índices
  @@index([companyId])                    // Multi-tenant
  @@index([companyId, status])            // Filtro comum
  @@index([companyId, createdAt(sort: Desc)]) // Ordenação
  @@index([fleetId])                      // Foreign key
}
```

---

## Relacionamentos

### One-to-Many

```prisma
model Company {
  id    String @id @default(uuid())
  name  String
  users User[]
}

model User {
  id        String  @id @default(uuid())
  name      String
  companyId String
  company   Company @relation(fields: [companyId], references: [id])
}
```

### Many-to-Many

```prisma
// Tabela intermediária explícita (preferido)
model UserRole {
  id       String @id @default(uuid())
  userId   String
  roleId   String
  user     User   @relation(fields: [userId], references: [id])
  role     Role   @relation(fields: [roleId], references: [id])

  @@unique([userId, roleId])
}

// Relação implícita (para casos simples)
model User {
  id    String @id @default(uuid())
  roles Role[]
}

model Role {
  id    String @id @default(uuid())
  users User[]
}
```

### Self-Reference

```prisma
model Category {
  id       String     @id @default(uuid())
  name     String
  parentId String?
  parent   Category?  @relation("CategoryTree", fields: [parentId], references: [id])
  children Category[] @relation("CategoryTree")
}
```

---

## Soft Delete

### Implementação

```prisma
model User {
  id        String    @id @default(uuid())
  name      String
  isActive  Boolean   @default(true)
  deletedAt DateTime?
}
```

### Queries

```typescript
// Filtrar deletados automaticamente
const users = await prisma.user.findMany({
  where: {
    companyId: company.id,
    deletedAt: null, // ou isActive: true
  },
});

// Soft delete
await prisma.user.update({
  where: { id: userId },
  data: {
    isActive: false,
    deletedAt: new Date(),
  },
});
```

---

## Enums

### Definição

```prisma
enum WorkOrderStatus {
  PENDING
  IN_PROGRESS
  WAITING_PARTS
  COMPLETED
  CANCELLED
}

enum UserRole {
  ADMIN
  MANAGER
  OPERATOR
  VIEWER
}

model WorkOrder {
  id     String          @id @default(uuid())
  status WorkOrderStatus @default(PENDING)
}
```

### No TypeScript

```typescript
// Prisma gera automaticamente
import { WorkOrderStatus } from '@prisma/client';

const order = await prisma.workOrder.create({
  data: {
    status: WorkOrderStatus.PENDING,
  },
});
```

---

## Migrations

### Comandos

```bash
# Criar migration
npx prisma migrate dev --name add_user_phone

# Aplicar migrations em produção
npx prisma migrate deploy

# Reset banco (dev only)
npx prisma migrate reset

# Ver status
npx prisma migrate status
```

### Boas Práticas

1. **Nomes descritivos** - `add_user_phone`, não `migration_001`
2. **Migrations pequenas** - Uma mudança por migration
3. **Teste antes de deploy** - Sempre em ambiente de dev/staging
4. **Backup antes de migrations destrutivas**
5. **Nunca edite migrations já aplicadas**

---

## Performance

### N+1 Problem

```typescript
// ❌ N+1 - uma query por usuário
const orders = await prisma.workOrder.findMany();
for (const order of orders) {
  const user = await prisma.user.findUnique({ where: { id: order.userId } });
}

// ✅ Include - uma query só
const orders = await prisma.workOrder.findMany({
  include: {
    user: true,
  },
});
```

### Select específico

```typescript
// ❌ Traz todos os campos
const users = await prisma.user.findMany();

// ✅ Só campos necessários
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
  },
});
```

### Paginação

```typescript
// Offset pagination (simples, mas lento em datasets grandes)
const users = await prisma.user.findMany({
  skip: (page - 1) * pageSize,
  take: pageSize,
  orderBy: { createdAt: 'desc' },
});

// Cursor pagination (mais performático)
const users = await prisma.user.findMany({
  take: pageSize,
  cursor: lastId ? { id: lastId } : undefined,
  orderBy: { createdAt: 'desc' },
});
```

---

## Transações

```typescript
// Transaction automática
const result = await prisma.$transaction([
  prisma.user.create({ data: userData }),
  prisma.profile.create({ data: profileData }),
]);

// Transaction interativa
const result = await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({ data: userData });

  if (someCondition) {
    throw new Error('Rollback!');
  }

  const profile = await tx.profile.create({
    data: { ...profileData, userId: user.id },
  });

  return { user, profile };
});
```

---

## Auditoria

### Campos de Auditoria

```prisma
model WorkOrder {
  id          String   @id @default(uuid())
  // ... outros campos

  // Auditoria
  createdAt   DateTime @default(now())
  createdBy   String
  updatedAt   DateTime @updatedAt
  updatedBy   String?

  creator     User     @relation("OrderCreator", fields: [createdBy], references: [id])
  updater     User?    @relation("OrderUpdater", fields: [updatedBy], references: [id])
}
```

### Tabela de Log (para auditoria completa)

```prisma
model AuditLog {
  id         String   @id @default(uuid())
  entityType String   // "WorkOrder", "User"
  entityId   String
  action     String   // "CREATE", "UPDATE", "DELETE"
  changes    Json     // { field: { old: x, new: y } }
  userId     String
  createdAt  DateTime @default(now())

  @@index([entityType, entityId])
  @@index([userId])
  @@index([createdAt])
}
```

---

## Checklist de Banco de Dados

- [ ] `companyId` em todas as tabelas principais
- [ ] Índice em `companyId`
- [ ] Unique constraints com `companyId` quando aplicável
- [ ] Campos de auditoria (`createdAt`, `updatedAt`)
- [ ] Soft delete onde faz sentido
- [ ] Índices em foreign keys
- [ ] Índices em campos de filtro frequente
- [ ] Enums para valores fixos
- [ ] Migrations com nomes descritivos

---

**Relacionados:**
- [Backend](./backend.md) - Arquitetura backend
- [Segurança](./seguranca.md) - Segurança de dados

**Voltar para** [Padrões](../README.md)
