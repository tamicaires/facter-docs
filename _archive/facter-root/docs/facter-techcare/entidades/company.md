# Company (Empresa)

> **Entidade que representa uma empresa/tenant no sistema.**

---

## Schema Prisma

```prisma
model Company {
  id              String          @id @default(uuid())

  // Identificação
  name            String
  tradeName       String?         // Nome fantasia
  document        String          @unique  // CNPJ ou CPF
  documentType    DocumentType

  // Contato
  email           String
  phone           String
  website         String?

  // Endereço
  address         Address

  // Logo e marca
  logo            String?
  primaryColor    String?

  // Modo de operação
  mode            CompanyMode     @default(BUSINESS)

  // Plano e assinatura
  planId          String
  plan            Plan            @relation(fields: [planId], references: [id])
  subscriptionStatus SubscriptionStatus @default(TRIAL)
  trialEndsAt     DateTime?
  subscriptionEndsAt DateTime?

  // Feature flags
  features        CompanyFeature[]

  // Configurações (relação 1:1)
  config          CompanyConfig?  // Ver company-config.md

  // Horário de funcionamento
  businessHours   Json?

  // Relacionamentos
  users           User[]
  customers       Customer[]
  equipment       Equipment[]
  serviceOrders   ServiceOrder[]
  quotes          Quote[]
  payments        Payment[]
  parts           Part[]
  warranties      Warranty[]

  // Métricas
  totalOrders     Int             @default(0)
  totalRevenue    Decimal         @default(0) @db.Decimal(12, 2)

  // Status
  status          CompanyStatus   @default(ACTIVE)

  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
}

type Address {
  street        String
  number        String
  complement    String?
  neighborhood  String
  city          String
  state         String
  zipCode       String
}

enum CompanyMode {
  BUSINESS      // Empresa com equipe
  INDIVIDUAL    // Técnico autônomo
}

enum CompanyStatus {
  ACTIVE        // Ativa
  SUSPENDED     // Suspensa (falta pagamento)
  CANCELLED     // Cancelada
}

enum SubscriptionStatus {
  TRIAL         // Período de teste
  ACTIVE        // Assinatura ativa
  PAST_DUE      // Pagamento atrasado
  CANCELLED     // Cancelada
}
```

---

## Configurações

As configurações da empresa são armazenadas em entidades separadas por módulo.
Ver **[CompanyConfig](./company-config.md)** para detalhes completos.

| Módulo | Entidade |
|--------|----------|
| Ordens de Serviço | `ServiceOrderConfig` |
| Orçamentos | `QuoteConfig` |
| Garantia | `WarrantyConfig` |
| Estoque | `InventoryConfig` |
| Pagamentos | `PaymentConfig` |
| Notificações | `NotificationConfig` |
| Impressão | `PrintConfig` |
| Integrações | `IntegrationConfig` |

---

## Endpoints da API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/companies/current` | Empresa atual |
| PUT | `/companies/current` | Atualizar empresa |
| GET | `/companies/current/settings` | Configurações |
| PUT | `/companies/current/settings` | Atualizar configurações |
| GET | `/companies/current/features` | Feature flags |
| GET | `/companies/current/usage` | Uso e limites |

---

## Diferenças por Modo

| Aspecto | BUSINESS | INDIVIDUAL |
|---------|----------|------------|
| Usuários | Múltiplos | Apenas 1 |
| Roles | Todos | Apenas ADMIN |
| Atribuição OS | Para técnicos | Automática |
| Comissões | Habilitado | Desabilitado |
| Dashboard | Completo | Simplificado |

---

**Voltar para** [Entidades](./README.md)
