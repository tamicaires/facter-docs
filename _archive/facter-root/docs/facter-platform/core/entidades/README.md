# Entidades - Facter Core

> **Modelo de dados central da plataforma.**

---

## Diagrama ER

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FACTER CORE DB                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌──────────────────┐                    ┌──────────────────┐             │
│   │  FacterCustomer  │                    │     Product      │             │
│   ├──────────────────┤                    ├──────────────────┤             │
│   │ id               │                    │ id               │             │
│   │ email            │                    │ key              │             │
│   │ name             │                    │ name             │             │
│   │ stripeCustomerId │                    │ serviceUrl       │             │
│   └────────┬─────────┘                    └────────┬─────────┘             │
│            │                                       │                        │
│            │ 1:N                                   │ 1:N                    │
│            │                                       │                        │
│            ▼                                       ▼                        │
│   ┌────────────────────────────────────────────────────────────────────┐  │
│   │                     ProductSubscription                             │  │
│   ├────────────────────────────────────────────────────────────────────┤  │
│   │ id              │ customerId        │ productId        │ planId    │  │
│   │ externalId      │ status            │ stripeSubId      │ ...       │  │
│   └────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│   ┌──────────────────┐                    ┌──────────────────┐             │
│   │   ProductPlan    │◀───────────────────│ ProductFeature   │             │
│   ├──────────────────┤     N:M            ├──────────────────┤             │
│   │ id               │                    │ id               │             │
│   │ productId        │                    │ productId        │             │
│   │ name             │                    │ key              │             │
│   │ price            │                    │ name             │             │
│   │ stripePriceId    │                    │ plans[]          │             │
│   └──────────────────┘                    └──────────────────┘             │
│                                                                              │
│   ┌──────────────────┐                    ┌──────────────────┐             │
│   │  PlatformAdmin   │────────────────────│  AdminAuditLog   │             │
│   ├──────────────────┤        1:N         ├──────────────────┤             │
│   │ id               │                    │ id               │             │
│   │ email            │                    │ adminId          │             │
│   │ role             │                    │ action           │             │
│   └──────────────────┘                    └──────────────────┘             │
│                                                                              │
│   ┌──────────────────┐                    ┌──────────────────┐             │
│   │    CoreEvent     │                    │ FeatureOverride  │             │
│   ├──────────────────┤                    ├──────────────────┤             │
│   │ id               │                    │ id               │             │
│   │ productKey       │                    │ subscriptionId   │             │
│   │ eventType        │                    │ featureId        │             │
│   │ payload          │                    │ enabled          │             │
│   └──────────────────┘                    └──────────────────┘             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Entidades

| Entidade | Descrição |
|----------|-----------|
| [FacterCustomer](./facter-customer.md) | Cliente da plataforma Facter |
| [Product](./product.md) | Produto do ecossistema |
| [ProductPlan](./product-plan.md) | Plano de assinatura |
| [ProductSubscription](./product-subscription.md) | Assinatura ativa |
| [ProductFeature](./product-feature.md) | Feature de um produto |
| [FeatureOverride](./feature-override.md) | Override de feature |
| [PlatformAdmin](./platform-admin.md) | Administrador da plataforma |
| [AdminAuditLog](./admin-audit-log.md) | Log de auditoria |
| [CoreEvent](./core-event.md) | Eventos do sistema |

---

## Schema Prisma Completo

```prisma
// ============================================
// CUSTOMERS
// ============================================

model FacterCustomer {
  id                String    @id @default(uuid())

  // Identificação
  email             String    @unique
  name              String
  phone             String?
  document          String?   // CPF/CNPJ
  documentType      DocumentType?

  // Stripe
  stripeCustomerId  String?   @unique

  // Billing
  billingEmail      String?
  billingAddress    Json?

  // Assinaturas
  subscriptions     ProductSubscription[]

  // Metadados
  metadata          Json?

  // Status
  status            CustomerStatus @default(ACTIVE)

  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  @@index([email])
  @@index([stripeCustomerId])
}

enum CustomerStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
}

enum DocumentType {
  CPF
  CNPJ
}

// ============================================
// PRODUCTS
// ============================================

model Product {
  id                String    @id @default(uuid())

  // Identificação
  key               String    @unique  // 'techcare', 'projeto2'
  name              String
  description       String?
  logo              String?

  // URLs
  serviceUrl        String    // https://techcare.app
  apiUrl            String    // https://api.techcare.app
  adminUrl          String?   // https://admin.techcare.app

  // Configuração
  webhookUrl        String?   // URL para receber webhooks do Core
  webhookSecret     String?   // Secret para assinar webhooks

  // API Key para comunicação
  apiKey            String    @unique

  // Planos e Features
  plans             ProductPlan[]
  features          ProductFeature[]

  // Assinaturas
  subscriptions     ProductSubscription[]

  // Métricas (cache)
  activeSubscriptions Int     @default(0)
  totalRevenue      Decimal   @default(0) @db.Decimal(12, 2)

  // Status
  active            Boolean   @default(true)

  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  @@index([key])
}

model ProductPlan {
  id                String    @id @default(uuid())

  productId         String
  product           Product   @relation(fields: [productId], references: [id])

  // Identificação
  key               String    // 'free', 'starter', 'professional'
  name              String
  description       String?

  // Preço
  price             Decimal   @db.Decimal(10, 2)
  currency          String    @default("BRL")
  billingPeriod     BillingPeriod @default(MONTHLY)

  // Stripe
  stripePriceId     String?   @unique

  // Features incluídas
  features          ProductFeature[] @relation("PlanFeatures")

  // Limites
  limits            Json?     // { maxUsers: 10, maxOrders: -1 }

  // Trial
  trialDays         Int       @default(0)

  // Visibilidade
  isPublic          Boolean   @default(true)
  isDefault         Boolean   @default(false)
  sortOrder         Int       @default(0)

  // Assinaturas
  subscriptions     ProductSubscription[]

  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  @@unique([productId, key])
  @@index([productId])
}

model ProductFeature {
  id                String    @id @default(uuid())

  productId         String
  product           Product   @relation(fields: [productId], references: [id])

  // Identificação
  key               String    // 'whatsapp', 'inventory'
  name              String
  description       String?
  category          String?

  // Planos que incluem esta feature
  plans             ProductPlan[] @relation("PlanFeatures")

  // Overrides
  overrides         FeatureOverride[]

  // Flags
  isBeta            Boolean   @default(false)
  isDeprecated      Boolean   @default(false)

  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  @@unique([productId, key])
  @@index([productId])
}

model FeatureOverride {
  id                String    @id @default(uuid())

  subscriptionId    String
  subscription      ProductSubscription @relation(fields: [subscriptionId], references: [id])

  featureId         String
  feature           ProductFeature @relation(fields: [featureId], references: [id])

  // Override
  enabled           Boolean?  // null = usar padrão do plano

  // Motivo
  reason            String?

  // Expiração
  expiresAt         DateTime?

  // Quem aplicou
  appliedById       String?
  appliedAt         DateTime  @default(now())

  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  @@unique([subscriptionId, featureId])
  @@index([subscriptionId])
  @@index([expiresAt])
}

enum BillingPeriod {
  MONTHLY
  YEARLY
}

// ============================================
// SUBSCRIPTIONS
// ============================================

model ProductSubscription {
  id                String    @id @default(uuid())

  // Relacionamentos
  customerId        String
  customer          FacterCustomer @relation(fields: [customerId], references: [id])

  productId         String
  product           Product   @relation(fields: [productId], references: [id])

  planId            String
  plan              ProductPlan @relation(fields: [planId], references: [id])

  // Referência externa (ID no produto)
  externalId        String    // companyId no TechCare

  // Status
  status            SubscriptionStatus @default(TRIALING)

  // Stripe
  stripeSubscriptionId String? @unique

  // Datas
  trialEndsAt       DateTime?
  currentPeriodStart DateTime?
  currentPeriodEnd  DateTime?
  cancelledAt       DateTime?
  cancelAtPeriodEnd Boolean   @default(false)

  // Feature overrides
  featureOverrides  FeatureOverride[]

  // Metadados
  metadata          Json?

  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  @@unique([productId, externalId])
  @@index([customerId])
  @@index([productId])
  @@index([status])
  @@index([stripeSubscriptionId])
}

enum SubscriptionStatus {
  TRIALING
  ACTIVE
  PAST_DUE
  CANCELLED
  PAUSED
}

// ============================================
// PLATFORM ADMINS
// ============================================

model PlatformAdmin {
  id                String    @id @default(uuid())

  email             String    @unique
  password          String
  name              String

  role              PlatformRole @default(SUPPORT)
  permissions       String[]

  mfaEnabled        Boolean   @default(true)
  mfaSecret         String?

  status            AdminStatus @default(ACTIVE)

  lastLoginAt       DateTime?
  lastLoginIp       String?

  auditLogs         AdminAuditLog[]

  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  @@index([email])
}

model AdminAuditLog {
  id                String    @id @default(uuid())

  adminId           String
  admin             PlatformAdmin @relation(fields: [adminId], references: [id])

  action            String
  targetType        String?
  targetId          String?
  details           Json?

  ipAddress         String?
  userAgent         String?

  createdAt         DateTime  @default(now())

  @@index([adminId])
  @@index([createdAt])
}

enum PlatformRole {
  SUPER_ADMIN
  ADMIN
  SUPPORT
  BILLING
}

enum AdminStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
}

// ============================================
// EVENTS
// ============================================

model CoreEvent {
  id                String    @id @default(uuid())

  // Origem
  productKey        String?
  customerId        String?
  subscriptionId    String?

  // Evento
  eventType         String    // 'subscription.created', 'payment.received'
  payload           Json

  // Processamento
  processed         Boolean   @default(false)
  processedAt       DateTime?
  error             String?

  createdAt         DateTime  @default(now())

  @@index([eventType])
  @@index([productKey])
  @@index([createdAt])
  @@index([processed])
}
```

---

**Voltar para** [Facter Core](../README.md)
