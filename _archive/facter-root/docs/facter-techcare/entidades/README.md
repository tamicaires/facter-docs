# Entidades - TechCare

> **Modelo de dados do sistema TechCare.**

---

## Diagrama ER

```
┌─────────────┐                           ┌─────────────┐
│    User     │                           │   Company   │
├─────────────┤                           ├─────────────┤
│ id          │◀─────┐                    │ id          │
│ email       │      │                    │ name        │
│ name        │      │      ┌─────────────│ mode        │
│ password    │      │      │             │ planId      │
└─────────────┘      │      │             └─────────────┘
                     │      │                    │
              ┌──────┴──────┴──────┐             │
              │    Membership      │◀────────────┘
              ├────────────────────┤
              │ userId             │
              │ companyId          │
              │ role               │
              │ status             │
              │ technicianProfile? │
              └────────────────────┘
                        │
                        ▼
              ┌─────────────────────┐
              │  TechnicianProfile  │
              ├─────────────────────┤
              │ specialties         │
              │ commissionConfig    │
              └─────────────────────┘

              ┌─────────────┐
              │  Customer   │
              ├─────────────┤
     Company──▶ companyId   │◀──────┐
              │ name        │       │
              │ document    │       │
              │ phone       │       │
              └─────────────┘       │
                     │              │
                     ▼              │
              ┌─────────────┐       │
              │  Equipment  │       │
              ├─────────────┤       │
              │ customerId  │───────┘
              │ type        │
              │ brand/model │
              │ imei        │
              └─────────────┘
                     │
                     └──────────────┐
                                    ▼
                            ┌─────────────┐
                            │ServiceOrder │
                            ├─────────────┤
                            │ customerId  │
                            │ equipmentId │
                            │ assignedToId│──▶ Membership
                            │ status      │
                            │ priority    │
                            └─────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        ▼                           ▼                           ▼
┌─────────────┐             ┌─────────────┐             ┌─────────────┐
│  Diagnosis  │             │    Quote    │             │   Payment   │
├─────────────┤             ├─────────────┤             ├─────────────┤
│ issues[]    │             │ items[]     │             │ method      │
│ result      │             │ status      │             │ amount      │
│ isRepairable│             │ total       │             │ status      │
└─────────────┘             └──────┬──────┘             └─────────────┘
                                   │
                                   ▼
                            ┌─────────────┐
                            │  QuoteItem  │───────▶┌─────────────┐
                            ├─────────────┤        │    Part     │
                            │ type        │        ├─────────────┤
                            │ partId?     │        │ sku         │
                            │ quantity    │        │ quantity    │
                            │ price       │        │ costPrice   │
                            └─────────────┘        │ sellPrice   │
                                                   └─────────────┘
                                                          │
                                                          ▼
                                                   ┌─────────────┐
                                                   │  Supplier   │
                                                   └─────────────┘
```

---

## Entidades Principais

| Entidade | Descrição |
|----------|-----------|
| [User](./user.md) | Usuários (dados globais) |
| [Membership](./membership.md) | Vínculo Usuário-Empresa-Role |
| [Company](./company.md) | Empresa/Tenant do sistema |
| [CompanyConfig](./company-config.md) | Configurações por módulo |
| [Customer](./customer.md) | Clientes da assistência |
| [Equipment](./equipment.md) | Equipamentos dos clientes |
| [ServiceOrder](./service-order.md) | Ordens de Serviço |
| [Quote](./quote.md) | Orçamentos |
| [Part](./part.md) | Peças e estoque |
| [Payment](./payment.md) | Pagamentos recebidos |

---

## Entidades de Suporte

| Entidade | Descrição |
|----------|-----------|
| [Warranty](./warranty.md) | Garantias emitidas |
| [Appointment](./appointment.md) | Agendamentos e visitas |
| [AuditLog](./audit-log.md) | Logs de auditoria |
| [StockMovement](./stock-movement.md) | Movimentações de estoque |
| [Supplier](./supplier.md) | Fornecedores |
| [Feature](./feature.md) | Feature Flags e Planos |
| [Commission](./commission.md) | Comissões dos técnicos |
| [Notification](./notification.md) | Sistema de notificações |
| [PlatformAdmin](./platform-admin.md) | Admins da plataforma |
| Diagnosis | Diagnóstico técnico (em ServiceOrder) |
| TechnicianProfile | Perfil do técnico (em Membership) |

---

## Convenções

### Nomenclatura

- **Tabelas**: PascalCase singular (`ServiceOrder`, `Customer`)
- **Colunas**: camelCase (`createdAt`, `companyId`)
- **Foreign Keys**: `{entidade}Id` (`customerId`, `serviceOrderId`)
- **Enums**: SCREAMING_SNAKE_CASE (`AWAITING_APPROVAL`)

### Campos Padrão

Todas as entidades possuem:

```prisma
model Example {
  id        String   @id @default(uuid())
  companyId String   // Multi-tenant
  company   Company  @relation(fields: [companyId], references: [id])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime? // Soft delete (quando aplicável)

  @@index([companyId])
}
```

### Multi-tenancy

Todas as queries são filtradas por `companyId`:

```typescript
// Middleware Prisma automático
prisma.$use(async (params, next) => {
  if (params.action === 'findMany') {
    params.args.where = {
      ...params.args.where,
      companyId: getCurrentCompanyId(),
      deletedAt: null,
    };
  }
  return next(params);
});
```

### Soft Delete

Entidades não são excluídas permanentemente:

```typescript
// Em vez de delete
await prisma.customer.update({
  where: { id },
  data: { deletedAt: new Date() },
});

// Queries filtram automaticamente
const customers = await prisma.customer.findMany({
  where: { deletedAt: null },
});
```

---

## Modelo de Acesso

```
┌─────────────────────────────────────────────────────────────────┐
│                         USUÁRIO FAZ LOGIN                       │
│                    (credenciais globais: email/senha)           │
└────────┬────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SELECIONA EMPRESA                            │
│                    (lista de memberships)                       │
└────────┬────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CONTEXTO ATIVO                               │
│  - companyId (isolamento de dados)                              │
│  - role (permissões)                                            │
│  - permissions (extras)                                         │
└────────┬────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    TODAS AS QUERIES                             │
│                    WHERE companyId = :currentCompanyId          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Índices Recomendados

```prisma
// Índices comuns em todas as entidades
@@index([companyId])
@@index([companyId, createdAt])
@@index([companyId, status]) // onde aplicável

// Índices específicos
@@index([companyId, customerId]) // ServiceOrder, Equipment
@@index([companyId, assignedToId]) // ServiceOrder
@@index([companyId, document]) // Customer
@@index([companyId, imei]) // Equipment
@@index([companyId, sku]) // Part
@@index([userId, companyId]) // Membership
```

---

**Voltar para** [TechCare](../README.md)
