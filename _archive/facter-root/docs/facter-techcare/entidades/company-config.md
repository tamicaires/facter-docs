# CompanyConfig (Configurações da Empresa)

> **Entidade que armazena as configurações do sistema por empresa.**

---

## Motivação

Separar configurações da entidade Company permite:
- **Performance**: Não carrega configs em toda query de empresa
- **Modularidade**: Configs organizadas por módulo/feature
- **Auditoria**: Histórico de alterações de configuração
- **Permissões**: Controle granular de quem pode alterar o quê

---

## Schema Prisma

```prisma
model CompanyConfig {
  id          String    @id @default(uuid())
  companyId   String    @unique
  company     Company   @relation(fields: [companyId], references: [id])

  // Configurações por módulo (JSON tipado)
  serviceOrder    ServiceOrderConfig?
  quote           QuoteConfig?
  warranty        WarrantyConfig?
  inventory       InventoryConfig?
  payment         PaymentConfig?
  notification    NotificationConfig?
  print           PrintConfig?
  integration     IntegrationConfig?

  // Versão (para migrações de schema)
  version     Int       @default(1)

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

// Alternativa: tabelas separadas por módulo
model ServiceOrderConfig {
  id          String    @id @default(uuid())
  companyId   String    @unique
  company     Company   @relation(fields: [companyId], references: [id])

  // Numeração
  numberPrefix      String    @default("OS")
  numberFormat      String    @default("{prefix}-{year}{month}-{seq:5}")
  numberResetPeriod ResetPeriod @default(MONTHLY)
  currentSequence   Int       @default(0)

  // Workflow
  requireTriage             Boolean @default(true)
  requirePhotosOnReceive    Boolean @default(false)
  requirePhotosOnComplete   Boolean @default(false)
  requireSignatureOnDelivery Boolean @default(true)
  autoArchiveAfterDays      Int     @default(30)

  // SLA por prioridade (horas)
  slaNormal   Int @default(72)
  slaHigh     Int @default(24)
  slaUrgent   Int @default(4)

  // Multiplicadores de preço por prioridade
  multiplierNormal  Decimal @default(1.0) @db.Decimal(3, 2)
  multiplierHigh    Decimal @default(1.2) @db.Decimal(3, 2)
  multiplierUrgent  Decimal @default(1.5) @db.Decimal(3, 2)

  // Campos customizados
  customFields  Json?   // CustomField[]

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model QuoteConfig {
  id          String    @id @default(uuid())
  companyId   String    @unique
  company     Company   @relation(fields: [companyId], references: [id])

  // Validade
  defaultValidityDays   Int @default(7)
  minValidityDays       Int @default(3)
  maxValidityDays       Int @default(30)

  // Descontos
  maxDiscountWithoutApproval  Decimal @default(10) @db.Decimal(5, 2)
  vipDiscount                 Decimal @default(10) @db.Decimal(5, 2)
  premiumDiscount             Decimal @default(15) @db.Decimal(5, 2)
  resellerDiscount            Decimal @default(20) @db.Decimal(5, 2)

  // Markup padrão por tipo de peça
  markupOriginal      Decimal @default(1.4) @db.Decimal(4, 2)
  markupCompatible    Decimal @default(1.6) @db.Decimal(4, 2)
  markupGeneric       Decimal @default(2.0) @db.Decimal(4, 2)

  // Diagnóstico
  diagnosisFee              Decimal @default(50) @db.Decimal(10, 2)
  chargeDiagnosisIfRejected Boolean @default(true)

  // Mensagens
  headerMessage   String?
  footerMessage   String?
  termsMessage    String?

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model WarrantyConfig {
  id          String    @id @default(uuid())
  companyId   String    @unique
  company     Company   @relation(fields: [companyId], references: [id])

  // Prazos padrão (dias)
  serviceDays         Int @default(90)
  originalPartDays    Int @default(90)
  compatiblePartDays  Int @default(60)
  genericPartDays     Int @default(30)

  // Comportamento
  renewOnReturn       Boolean @default(false)
  requireAcceptance   Boolean @default(true)
  autoCreateOnComplete Boolean @default(true)

  // Termos
  terms       String?   // Texto do termo de garantia
  exclusions  String[]  // Lista de exclusões

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model InventoryConfig {
  id          String    @id @default(uuid())
  companyId   String    @unique
  company     Company   @relation(fields: [companyId], references: [id])

  // Alertas
  lowStockAlertEnabled    Boolean @default(true)
  lowStockAlertThreshold  Int     @default(5)

  // Comportamento
  allowNegativeStock      Boolean @default(false)
  autoReserveOnQuote      Boolean @default(true)
  requireApprovalForAdjustment Boolean @default(true)

  // Custo
  costMethod  CostMethod @default(AVERAGE) // FIFO, LIFO, AVERAGE

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model PaymentConfig {
  id          String    @id @default(uuid())
  companyId   String    @unique
  company     Company   @relation(fields: [companyId], references: [id])

  // Métodos habilitados
  cashEnabled       Boolean @default(true)
  pixEnabled        Boolean @default(true)
  debitEnabled      Boolean @default(true)
  creditEnabled     Boolean @default(true)
  boletoEnabled     Boolean @default(false)
  transferEnabled   Boolean @default(true)

  // PIX
  pixKey            String?
  pixKeyType        PixKeyType?
  pixProvider       String?     // META, ZAPI, etc
  pixProviderConfig Json?

  // Cartão
  cardProvider      String?     // STONE, PAGSEGURO, etc
  cardProviderConfig Json?

  // Parcelamento
  maxInstallments   Int @default(12)
  minInstallmentValue Decimal @default(10) @db.Decimal(10, 2)

  // Taxas (para cálculo interno)
  feeDebit          Decimal @default(1.5) @db.Decimal(5, 2)
  feeCredit1x       Decimal @default(3.0) @db.Decimal(5, 2)
  feeCreditInstallment Decimal @default(4.5) @db.Decimal(5, 2)

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model NotificationConfig {
  id          String    @id @default(uuid())
  companyId   String    @unique
  company     Company   @relation(fields: [companyId], references: [id])

  // Canais
  emailEnabled      Boolean @default(true)
  whatsappEnabled   Boolean @default(false)
  smsEnabled        Boolean @default(false)

  // Email
  emailProvider     String?   // SENDGRID, SES, SMTP
  emailFromName     String?
  emailFromAddress  String?
  emailReplyTo      String?
  emailProviderConfig Json?

  // WhatsApp
  whatsappProvider  String?   // META, TWILIO, ZAPI, EVOLUTION
  whatsappPhone     String?
  whatsappProviderConfig Json?

  // SMS
  smsProvider       String?
  smsProviderConfig Json?

  // Eventos habilitados
  notifyOnOrderCreated      Boolean @default(true)
  notifyOnQuoteReady        Boolean @default(true)
  notifyOnQuoteReminder     Boolean @default(true)
  notifyOnOrderCompleted    Boolean @default(true)
  notifyOnReadyForPickup    Boolean @default(true)
  notifyOnPickupReminder    Boolean @default(true)

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model PrintConfig {
  id          String    @id @default(uuid())
  companyId   String    @unique
  company     Company   @relation(fields: [companyId], references: [id])

  // Recibo de recebimento
  receiptTemplate   String  @default("DEFAULT")
  receiptSize       String  @default("80MM")  // A4, 80MM, 58MM

  // Orçamento
  quoteTemplate     String  @default("DEFAULT")
  quoteShowPhotos   Boolean @default(false)

  // Termo de garantia
  warrantyTemplate  String  @default("DEFAULT")

  // Etiqueta
  labelTemplate     String  @default("DEFAULT")
  labelSize         String  @default("40x30")

  // Recibo de pagamento
  paymentReceiptTemplate String @default("DEFAULT")

  // Templates customizados (HTML/Handlebars)
  customTemplates   Json?

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model IntegrationConfig {
  id          String    @id @default(uuid())
  companyId   String    @unique
  company     Company   @relation(fields: [companyId], references: [id])

  // NF-e
  nfeEnabled        Boolean @default(false)
  nfeProvider       String?   // FOCUSNFE, NFEIO
  nfeAutoEmit       Boolean @default(false)
  nfeProviderConfig Json?

  // Webhooks
  webhooksEnabled   Boolean @default(false)
  webhooks          WebhookEndpoint[]

  // API
  apiEnabled        Boolean @default(false)
  apiKeys           ApiKey[]

  // Google Calendar (modo individual)
  googleCalendarEnabled Boolean @default(false)
  googleCalendarConfig  Json?

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

// Enums
enum ResetPeriod {
  MONTHLY
  YEARLY
  NEVER
}

enum CostMethod {
  FIFO
  LIFO
  AVERAGE
}

enum PixKeyType {
  CPF
  CNPJ
  PHONE
  EMAIL
  RANDOM
}
```

---

## Relacionamento com Company

```prisma
model Company {
  id        String    @id @default(uuid())
  // ... outros campos

  // Configurações (1:1)
  config              CompanyConfig?

  // Ou se usar tabelas separadas:
  serviceOrderConfig  ServiceOrderConfig?
  quoteConfig         QuoteConfig?
  warrantyConfig      WarrantyConfig?
  inventoryConfig     InventoryConfig?
  paymentConfig       PaymentConfig?
  notificationConfig  NotificationConfig?
  printConfig         PrintConfig?
  integrationConfig   IntegrationConfig?
}
```

---

## Endpoints da API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/config` | Todas as configurações |
| GET | `/config/:module` | Config de um módulo |
| PUT | `/config/:module` | Atualizar módulo |
| POST | `/config/reset/:module` | Restaurar padrão |

### Exemplo

```http
GET /config/quote

{
  "data": {
    "defaultValidityDays": 7,
    "maxDiscountWithoutApproval": 10,
    "markupOriginal": 1.4,
    "markupCompatible": 1.6,
    "diagnosisFee": 50,
    "chargeDiagnosisIfRejected": true
  }
}
```

```http
PUT /config/quote

{
  "defaultValidityDays": 10,
  "maxDiscountWithoutApproval": 15
}
```

---

## Valores Padrão

Quando empresa é criada, configs são inicializadas com valores padrão:

```typescript
const DEFAULT_CONFIGS = {
  serviceOrder: {
    numberPrefix: 'OS',
    numberFormat: '{prefix}-{year}{month}-{seq:5}',
    requireTriage: true,
    slaNormal: 72,
    slaHigh: 24,
    slaUrgent: 4,
  },
  quote: {
    defaultValidityDays: 7,
    maxDiscountWithoutApproval: 10,
    diagnosisFee: 50,
  },
  warranty: {
    serviceDays: 90,
    originalPartDays: 90,
    compatiblePartDays: 60,
    genericPartDays: 30,
  },
  // ...
};

async function initializeCompanyConfig(companyId: string) {
  await prisma.serviceOrderConfig.create({
    data: { companyId, ...DEFAULT_CONFIGS.serviceOrder },
  });
  await prisma.quoteConfig.create({
    data: { companyId, ...DEFAULT_CONFIGS.quote },
  });
  // ...
}
```

---

## Auditoria de Configurações

```prisma
model ConfigChangeLog {
  id          String    @id @default(uuid())
  companyId   String
  company     Company   @relation(fields: [companyId], references: [id])

  module      String    // 'quote', 'warranty', etc
  field       String    // Campo alterado
  oldValue    Json?
  newValue    Json?

  changedById String
  changedBy   User      @relation(fields: [changedById], references: [id])
  changedAt   DateTime  @default(now())

  @@index([companyId, module])
  @@index([companyId, changedAt])
}
```

---

## Hook de Uso

```typescript
// hooks/useConfig.ts
function useConfig<T>(module: ConfigModule): {
  config: T;
  isLoading: boolean;
  update: (data: Partial<T>) => Promise<void>;
} {
  const { data, isLoading } = useQuery({
    queryKey: ['config', module],
    queryFn: () => api.get(`/config/${module}`),
  });

  const mutation = useMutation({
    mutationFn: (data: Partial<T>) => api.put(`/config/${module}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['config', module]);
    },
  });

  return {
    config: data,
    isLoading,
    update: mutation.mutateAsync,
  };
}

// Uso
const { config, update } = useConfig<QuoteConfig>('quote');
```

---

## Permissões

| Módulo | Quem pode editar |
|--------|------------------|
| serviceOrder | Manager, Admin |
| quote | Manager, Admin |
| warranty | Manager, Admin |
| inventory | Manager, Admin |
| payment | Admin |
| notification | Admin |
| print | Manager, Admin |
| integration | Admin |

---

**Voltar para** [Entidades](./README.md)
