# TechCare - Planejamento de MVP

> Análise completa da documentação e planejamento do MVP.

---

## Sumário Executivo

### Visão do Produto

O TechCare é um sistema de gestão de assistência técnica que permite:
- Gestão completa de ordens de serviço (OS)
- Cadastro de clientes e equipamentos
- Orçamentos e aprovações
- Controle de estoque de peças
- Gestão financeira básica
- Dashboards e métricas

### Público-Alvo

| Modo | Público | Características |
|------|---------|-----------------|
| **Individual** | Técnico autônomo | 1 usuário, fluxo simplificado, preço acessível |
| **Empresa** | Assistências técnicas | Múltiplos usuários, hierarquia, relatórios avançados |

### Stack Tecnológica

| Camada | Tecnologia | Justificativa |
|--------|------------|---------------|
| Frontend | Next.js 15+ (App Router) | Já usado no boilerplate |
| UI | @facter/ds-core, TailwindCSS | Design System Facter |
| Estado | Zustand + TanStack Query | Padrão estabelecido |
| Backend | NestJS + TypeScript | Padrão Facter |
| Banco | PostgreSQL + Prisma | Padrão Facter |
| Auth | Hub Integration (OAuth 2.0) | Centralizado via Hub |
| Cache | Redis | Performance |

---

## Análise da Documentação

### Documentação Existente - Resumo

| Categoria | Arquivos | Status |
|-----------|----------|--------|
| Regras de Negócio | 28 | ✅ Completa |
| Entidades | 37 | ✅ Completa |
| API | 16 | ✅ Completa |
| Fluxos | 5 | ✅ Completa |
| Backend/Frontend | 2 | ✅ Completa |
| **Total** | **67 arquivos** | **Pronta para desenvolvimento** |

### Módulos Identificados

#### Core (Obrigatório para MVP)
1. **Ordens de Serviço** - Centro do sistema
2. **Clientes** - Cadastro e histórico
3. **Equipamentos** - Tipos, marcas, modelos
4. **Orçamentos** - Geração e aprovação básica

#### Operacional (MVP Estendido)
5. **Estoque** - Controle de peças
6. **Pagamentos** - Registro básico
7. **Timeline/Eventos** - Histórico da OS

#### Avançado (Pós-MVP)
8. **Garantias** - Controle de garantias
9. **Comissões** - Cálculo para técnicos
10. **Agendamentos** - Scheduling
11. **Relatórios Avançados** - BI
12. **Integrações** - WhatsApp, NFe, PIX

### Complexidade por Módulo

| Módulo | Complexidade | Estimativa | Dependências |
|--------|--------------|------------|--------------|
| Auth (Hub) | Média | Base do boilerplate | Hub |
| Clientes | Baixa | Sprint 1 | - |
| Equipamentos | Baixa | Sprint 1 | Clientes |
| OS Básica | Alta | Sprint 2-3 | Clientes, Equipamentos |
| Timeline | Média | Sprint 3 | OS |
| Orçamentos | Alta | Sprint 4 | OS |
| Estoque Básico | Média | Sprint 5 | - |
| Pagamentos | Média | Sprint 6 | OS, Orçamentos |
| Dashboard | Média | Sprint 6 | OS, Pagamentos |

---

## Definição do MVP

### Critérios de Sucesso do MVP

1. **Usuário pode criar uma OS** do início ao fim
2. **Fluxo completo**: Recebimento → Diagnóstico → Orçamento → Execução → Entrega
3. **Gestão básica de clientes e equipamentos**
4. **Orçamento simples** com aprovação do cliente
5. **Registro de pagamento**
6. **Dashboard com métricas básicas**

### Escopo do MVP

#### Incluído no MVP ✅

| Funcionalidade | Detalhes |
|----------------|----------|
| Autenticação | Via Hub (OAuth 2.0, SSO) |
| Multi-tenancy | Isolamento por companyId |
| Clientes | CRUD completo, busca, cadastro rápido |
| Equipamentos | CRUD, categorias, marcas |
| Ordens de Serviço | Criação, status básicos, timeline |
| Status OS | RECEIVED → TRIAGE → DIAGNOSIS → AWAITING_APPROVAL → APPROVED/REJECTED → IN_PROGRESS → COMPLETED → DELIVERED |
| Orçamentos | Criação, itens (serviço + peça), envio, aprovação |
| Estoque Básico | Cadastro de peças, entrada/saída manual |
| Pagamentos | Registro manual (dinheiro, PIX, cartão) |
| Dashboard | Cards de resumo, lista de OS recentes |
| Perfis | Admin, Gerente, Atendente, Técnico |
| Modo Individual | Interface simplificada para autônomo |

#### Excluído do MVP ❌

| Funcionalidade | Motivo | Versão Futura |
|----------------|--------|---------------|
| Integração WhatsApp | Complexidade + custo API | v1.1 |
| Emissão NFe | Requer certificado digital | v1.2 |
| PIX automático | Requer integração bancária | v1.1 |
| Comissões | Pode ser manual inicialmente | v1.1 |
| Garantias | Pode ser anotação na OS | v1.2 |
| Agendamentos | Não bloqueante | v1.2 |
| Relatórios avançados | Dashboard básico atende | v1.1 |
| Multi-filial | Apenas 1 empresa por tenant | v2.0 |
| API pública | Apenas uso interno | v2.0 |
| App mobile | PWA básico | v1.2 |

---

## Arquitetura do MVP

### Modelo de Dados (Simplificado para MVP)

```prisma
// === CORE ===
model Company {
  id           String   @id @default(cuid())
  hubCompanyId String   @unique
  name         String
  slug         String   @unique
  document     String?  // CNPJ ou CPF
  mode         CompanyMode @default(BUSINESS)
  logo         String?
  settings     Json     @default("{}")
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  users         User[]
  customers     Customer[]
  equipments    Equipment[]
  serviceOrders ServiceOrder[]
  parts         Part[]

  @@map("companies")
}

model User {
  id        String   @id @default(cuid())
  hubUserId String   @unique
  companyId String
  company   Company  @relation(fields: [companyId], references: [id])
  email     String   @unique
  name      String
  avatar    String?
  role      Role     @default(TECHNICIAN)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  createdOrders    ServiceOrder[] @relation("CreatedOrders")
  assignedOrders   ServiceOrder[] @relation("AssignedOrders")
  createdQuotes    Quote[]
  registeredPayments Payment[]

  @@index([companyId])
  @@map("users")
}

// === CLIENTES E EQUIPAMENTOS ===
model Customer {
  id           String       @id @default(cuid())
  companyId    String
  company      Company      @relation(fields: [companyId], references: [id])
  type         CustomerType @default(PF)
  name         String
  document     String?      // CPF ou CNPJ
  email        String?
  phone        String
  phoneAlt     String?
  whatsapp     String?
  address      Json?
  category     CustomerCategory @default(REGULAR)
  notes        String?
  isActive     Boolean      @default(true)
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt

  equipments    Equipment[]
  serviceOrders ServiceOrder[]

  @@unique([companyId, document])
  @@index([companyId])
  @@map("customers")
}

model Equipment {
  id           String            @id @default(cuid())
  companyId    String
  customerId   String
  customer     Customer          @relation(fields: [customerId], references: [id])
  category     EquipmentCategory
  brand        String
  model        String
  serialNumber String?
  imei         String?
  color        String?
  notes        String?
  createdAt    DateTime          @default(now())
  updatedAt    DateTime          @updatedAt

  serviceOrders ServiceOrder[]

  @@index([companyId])
  @@index([customerId])
  @@map("equipments")
}

// === ORDENS DE SERVIÇO ===
model ServiceOrder {
  id              String             @id @default(cuid())
  companyId       String
  number          String             // OS-202501-00001
  customerId      String
  customer        Customer           @relation(fields: [customerId], references: [id])
  equipmentId     String
  equipment       Equipment          @relation(fields: [equipmentId], references: [id])
  createdById     String
  createdBy       User               @relation("CreatedOrders", fields: [createdById], references: [id])
  technicianId    String?
  technician      User?              @relation("AssignedOrders", fields: [technicianId], references: [id])

  status          ServiceOrderStatus @default(RECEIVED)
  priority        Priority           @default(NORMAL)

  reportedIssue   String
  physicalCondition String?
  accessories     String[]
  password        String?

  diagnosis       String?
  diagnosedAt     DateTime?

  laborCost       Decimal?           @db.Decimal(10, 2)
  partsCost       Decimal?           @db.Decimal(10, 2)
  discount        Decimal?           @db.Decimal(10, 2)
  total           Decimal?           @db.Decimal(10, 2)

  approvedAt      DateTime?
  completedAt     DateTime?
  deliveredAt     DateTime?

  createdAt       DateTime           @default(now())
  updatedAt       DateTime           @updatedAt
  deletedAt       DateTime?

  quote      Quote?
  payments   Payment[]
  events     ServiceOrderEvent[]
  attachments Attachment[]

  @@unique([companyId, number])
  @@index([companyId])
  @@index([status])
  @@index([customerId])
  @@index([technicianId])
  @@map("service_orders")
}

model ServiceOrderEvent {
  id             String       @id @default(cuid())
  serviceOrderId String
  serviceOrder   ServiceOrder @relation(fields: [serviceOrderId], references: [id])
  type           EventType
  description    String
  userId         String?
  metadata       Json?
  createdAt      DateTime     @default(now())

  @@index([serviceOrderId])
  @@map("service_order_events")
}

model Attachment {
  id             String       @id @default(cuid())
  serviceOrderId String
  serviceOrder   ServiceOrder @relation(fields: [serviceOrderId], references: [id])
  type           AttachmentType
  url            String
  filename       String
  size           Int
  createdAt      DateTime     @default(now())

  @@index([serviceOrderId])
  @@map("attachments")
}

// === ORÇAMENTOS ===
model Quote {
  id             String      @id @default(cuid())
  companyId      String
  serviceOrderId String      @unique
  serviceOrder   ServiceOrder @relation(fields: [serviceOrderId], references: [id])
  number         String      // ORC-202501-00001
  status         QuoteStatus @default(DRAFT)

  createdById    String
  createdBy      User        @relation(fields: [createdById], references: [id])

  subtotalServices Decimal   @db.Decimal(10, 2)
  subtotalParts    Decimal   @db.Decimal(10, 2)
  discountType     DiscountType?
  discountValue    Decimal?  @db.Decimal(10, 2)
  total            Decimal   @db.Decimal(10, 2)

  validUntil     DateTime
  notes          String?

  approvedAt     DateTime?
  rejectedAt     DateTime?
  rejectionReason String?

  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt

  items QuoteItem[]

  @@unique([companyId, number])
  @@index([companyId])
  @@map("quotes")
}

model QuoteItem {
  id          String    @id @default(cuid())
  quoteId     String
  quote       Quote     @relation(fields: [quoteId], references: [id], onDelete: Cascade)
  type        QuoteItemType
  description String
  quantity    Int       @default(1)
  unitPrice   Decimal   @db.Decimal(10, 2)
  total       Decimal   @db.Decimal(10, 2)
  partId      String?
  part        Part?     @relation(fields: [partId], references: [id])
  warrantyDays Int?

  @@index([quoteId])
  @@map("quote_items")
}

// === ESTOQUE ===
model Part {
  id           String       @id @default(cuid())
  companyId    String
  company      Company      @relation(fields: [companyId], references: [id])
  sku          String
  name         String
  description  String?
  category     PartCategory
  brand        String?
  cost         Decimal      @db.Decimal(10, 2)
  price        Decimal      @db.Decimal(10, 2)
  quantity     Int          @default(0)
  minQuantity  Int          @default(0)
  location     String?
  warrantyDays Int          @default(90)
  isActive     Boolean      @default(true)
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt

  quoteItems   QuoteItem[]
  movements    StockMovement[]

  @@unique([companyId, sku])
  @@index([companyId])
  @@map("parts")
}

model StockMovement {
  id          String        @id @default(cuid())
  companyId   String
  partId      String
  part        Part          @relation(fields: [partId], references: [id])
  type        MovementType
  quantity    Int
  unitCost    Decimal?      @db.Decimal(10, 2)
  reason      String?
  serviceOrderId String?
  userId      String
  createdAt   DateTime      @default(now())

  @@index([companyId])
  @@index([partId])
  @@map("stock_movements")
}

// === PAGAMENTOS ===
model Payment {
  id             String        @id @default(cuid())
  companyId      String
  serviceOrderId String
  serviceOrder   ServiceOrder  @relation(fields: [serviceOrderId], references: [id])
  amount         Decimal       @db.Decimal(10, 2)
  method         PaymentMethod
  installments   Int           @default(1)
  status         PaymentStatus @default(PAID)
  registeredById String
  registeredBy   User          @relation(fields: [registeredById], references: [id])
  notes          String?
  paidAt         DateTime      @default(now())
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  @@index([companyId])
  @@index([serviceOrderId])
  @@map("payments")
}

// === ENUMS ===
enum CompanyMode {
  BUSINESS
  INDIVIDUAL
}

enum Role {
  OWNER
  ADMIN
  MANAGER
  ATTENDANT
  TECHNICIAN
}

enum CustomerType {
  PF
  PJ
}

enum CustomerCategory {
  REGULAR
  PREMIUM
  VIP
  CORPORATE
}

enum EquipmentCategory {
  SMARTPHONE
  TABLET
  NOTEBOOK
  DESKTOP
  PRINTER
  MONITOR
  CONSOLE
  OTHER
}

enum ServiceOrderStatus {
  RECEIVED
  TRIAGE
  DIAGNOSIS
  AWAITING_APPROVAL
  APPROVED
  REJECTED
  AWAITING_PARTS
  IN_PROGRESS
  COMPLETED
  DELIVERED
  ARCHIVED
  CANCELLED
}

enum Priority {
  NORMAL
  HIGH
  URGENT
}

enum EventType {
  STATUS_CHANGED
  TECHNICIAN_ASSIGNED
  QUOTE_GENERATED
  QUOTE_APPROVED
  QUOTE_REJECTED
  PAYMENT_REGISTERED
  NOTE_ADDED
  ATTACHMENT_ADDED
}

enum AttachmentType {
  PHOTO_RECEIPT
  PHOTO_DAMAGE
  PHOTO_REPAIR
  PHOTO_DELIVERY
  DOCUMENT
}

enum QuoteStatus {
  DRAFT
  SENT
  VIEWED
  APPROVED
  REJECTED
  EXPIRED
  CANCELLED
}

enum QuoteItemType {
  SERVICE
  PART
}

enum DiscountType {
  PERCENT
  FIXED
}

enum PartCategory {
  SCREENS
  BATTERIES
  CONNECTORS
  BUTTONS
  CAMERAS
  SMD
  FLEX
  HOUSING
  OTHER
}

enum MovementType {
  IN
  OUT_SERVICE
  OUT_SALE
  ADJUST_IN
  ADJUST_OUT
  RETURN
  LOSS
}

enum PaymentMethod {
  CASH
  PIX
  DEBIT
  CREDIT_1X
  CREDIT_INSTALLMENT
  TRANSFER
}

enum PaymentStatus {
  PENDING
  PAID
  REFUNDED
  CANCELLED
}
```

### Estrutura de Módulos (Backend)

```
src/
├── config/
│   ├── app.config.ts
│   ├── env.config.ts
│   └── hub.config.ts
│
├── core/
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── customer.ts
│   │   │   ├── equipment.ts
│   │   │   ├── service-order.ts
│   │   │   ├── quote.ts
│   │   │   ├── part.ts
│   │   │   └── payment.ts
│   │   └── repositories/
│   │       ├── customer.repository.ts
│   │       ├── equipment.repository.ts
│   │       ├── service-order.repository.ts
│   │       ├── quote.repository.ts
│   │       ├── part.repository.ts
│   │       └── payment.repository.ts
│   └── exceptions/
│
├── infra/
│   ├── database/prisma/
│   ├── hub/
│   └── repositories/
│       ├── prisma-customer.repository.ts
│       ├── prisma-service-order.repository.ts
│       └── ...
│
├── application/
│   ├── auth/              # Hub integration
│   ├── customers/
│   │   ├── use-cases/
│   │   │   ├── create-customer.use-case.ts
│   │   │   ├── update-customer.use-case.ts
│   │   │   ├── list-customers.use-case.ts
│   │   │   └── get-customer.use-case.ts
│   │   ├── dto/
│   │   └── customers.controller.ts
│   │
│   ├── equipments/
│   ├── service-orders/
│   │   ├── use-cases/
│   │   │   ├── create-service-order.use-case.ts
│   │   │   ├── change-status.use-case.ts
│   │   │   ├── assign-technician.use-case.ts
│   │   │   ├── add-diagnosis.use-case.ts
│   │   │   └── list-service-orders.use-case.ts
│   │   ├── dto/
│   │   └── service-orders.controller.ts
│   │
│   ├── quotes/
│   ├── stock/
│   ├── payments/
│   └── dashboard/
│
└── app.module.ts
```

### Estrutura de Features (Frontend)

```
src/
├── features/
│   ├── auth/              # Hub integration (do boilerplate)
│   │
│   ├── customers/
│   │   ├── components/
│   │   │   ├── customer-form.tsx
│   │   │   ├── customer-list.tsx
│   │   │   ├── customer-card.tsx
│   │   │   └── customer-search.tsx
│   │   ├── hooks/
│   │   │   ├── use-customers.ts
│   │   │   ├── use-create-customer.ts
│   │   │   └── use-customer.ts
│   │   ├── services/
│   │   ├── types/
│   │   └── index.ts
│   │
│   ├── equipments/
│   │
│   ├── service-orders/
│   │   ├── components/
│   │   │   ├── service-order-form.tsx
│   │   │   ├── service-order-list.tsx
│   │   │   ├── service-order-card.tsx
│   │   │   ├── service-order-timeline.tsx
│   │   │   ├── service-order-status-badge.tsx
│   │   │   └── status-change-dialog.tsx
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   │
│   ├── quotes/
│   │   ├── components/
│   │   │   ├── quote-form.tsx
│   │   │   ├── quote-items-table.tsx
│   │   │   ├── quote-approval-page.tsx  # Página pública
│   │   │   └── quote-preview.tsx
│   │   └── ...
│   │
│   ├── stock/
│   │
│   ├── payments/
│   │
│   └── dashboard/
│       ├── components/
│       │   ├── stats-cards.tsx
│       │   ├── recent-orders.tsx
│       │   ├── pending-actions.tsx
│       │   └── status-chart.tsx
│       └── ...
│
└── app/
    ├── (auth)/
    │   └── callback/
    │
    └── (main)/
        ├── dashboard/
        ├── customers/
        │   ├── page.tsx
        │   ├── new/page.tsx
        │   └── [id]/page.tsx
        ├── equipments/
        ├── service-orders/
        │   ├── page.tsx
        │   ├── new/page.tsx
        │   └── [id]/
        │       ├── page.tsx
        │       └── quote/page.tsx
        ├── stock/
        ├── payments/
        └── settings/
```

---

## Sprints do MVP

### Sprint 0: Setup e Infraestrutura (1 semana)

**Objetivo:** Base do projeto a partir do boilerplate

| Task | Descrição | Prioridade |
|------|-----------|------------|
| TC-001 | Criar projeto a partir do boilerplate refatorado | Alta |
| TC-002 | Configurar Prisma schema inicial | Alta |
| TC-003 | Configurar rotas e menu (sidebar) | Alta |
| TC-004 | Criar página de dashboard (placeholder) | Média |
| TC-005 | Configurar permissões por role | Alta |

**Entregáveis:**
- [ ] Projeto rodando com auth via Hub
- [ ] Sidebar com menu básico
- [ ] Permissões configuradas

---

### Sprint 1: Clientes e Equipamentos (2 semanas)

**Objetivo:** CRUD completo de clientes e equipamentos

| Task | Descrição | Prioridade |
|------|-----------|------------|
| TC-010 | Backend: Entities Customer e Equipment | Alta |
| TC-011 | Backend: Repositories Customer e Equipment | Alta |
| TC-012 | Backend: Use cases CRUD Customer | Alta |
| TC-013 | Backend: Use cases CRUD Equipment | Alta |
| TC-014 | Backend: Controllers e validação Zod | Alta |
| TC-015 | Frontend: Lista de clientes com busca | Alta |
| TC-016 | Frontend: Formulário de cliente | Alta |
| TC-017 | Frontend: Detalhe do cliente com histórico | Média |
| TC-018 | Frontend: Lista de equipamentos | Média |
| TC-019 | Frontend: Formulário de equipamento | Média |
| TC-020 | Validação CPF/CNPJ | Alta |

**Entregáveis:**
- [ ] CRUD completo de clientes
- [ ] CRUD completo de equipamentos
- [ ] Busca de clientes por nome, CPF, telefone
- [ ] Vínculo equipamento ↔ cliente

---

### Sprint 2: Ordens de Serviço - Criação (2 semanas)

**Objetivo:** Criar OS com cliente, equipamento e defeito

| Task | Descrição | Prioridade |
|------|-----------|------------|
| TC-030 | Backend: Entity ServiceOrder | Alta |
| TC-031 | Backend: Gerador de número de OS | Alta |
| TC-032 | Backend: Use case CreateServiceOrder | Alta |
| TC-033 | Backend: Use case ListServiceOrders | Alta |
| TC-034 | Backend: Use case GetServiceOrder | Alta |
| TC-035 | Frontend: Lista de OS com filtros | Alta |
| TC-036 | Frontend: Formulário de nova OS | Alta |
| TC-037 | Frontend: Busca/criação de cliente inline | Alta |
| TC-038 | Frontend: Cadastro de equipamento inline | Alta |
| TC-039 | Frontend: Upload de fotos do equipamento | Média |
| TC-040 | Frontend: Badge de status | Alta |

**Entregáveis:**
- [ ] Criar OS com cliente novo ou existente
- [ ] Cadastrar equipamento na criação
- [ ] Lista de OS com status
- [ ] Upload de fotos

---

### Sprint 3: Ordens de Serviço - Fluxo (2 semanas)

**Objetivo:** Fluxo de status e timeline

| Task | Descrição | Prioridade |
|------|-----------|------------|
| TC-050 | Backend: Use case ChangeStatus com validações | Alta |
| TC-051 | Backend: Use case AssignTechnician | Alta |
| TC-052 | Backend: Use case AddDiagnosis | Alta |
| TC-053 | Backend: ServiceOrderEvent (timeline) | Alta |
| TC-054 | Backend: Validações de transição de status | Alta |
| TC-055 | Frontend: Detalhe da OS completo | Alta |
| TC-056 | Frontend: Timeline de eventos | Alta |
| TC-057 | Frontend: Ações por status (botões) | Alta |
| TC-058 | Frontend: Atribuir técnico | Alta |
| TC-059 | Frontend: Registrar diagnóstico | Alta |
| TC-060 | Frontend: Modal de mudança de status | Alta |

**Entregáveis:**
- [ ] Fluxo de status funcional
- [ ] Timeline de eventos
- [ ] Atribuição de técnico
- [ ] Registro de diagnóstico

---

### Sprint 4: Orçamentos (2 semanas)

**Objetivo:** Criar e aprovar orçamentos

| Task | Descrição | Prioridade |
|------|-----------|------------|
| TC-070 | Backend: Entity Quote e QuoteItem | Alta |
| TC-071 | Backend: Use case CreateQuote | Alta |
| TC-072 | Backend: Use case ApproveQuote | Alta |
| TC-073 | Backend: Use case RejectQuote | Alta |
| TC-074 | Backend: Calcular totais com desconto | Alta |
| TC-075 | Frontend: Formulário de orçamento | Alta |
| TC-076 | Frontend: Adicionar itens (serviço/peça) | Alta |
| TC-077 | Frontend: Preview do orçamento | Média |
| TC-078 | Frontend: Página pública de aprovação | Alta |
| TC-079 | Frontend: Link de aprovação | Alta |
| TC-080 | Integração OS ↔ Quote | Alta |

**Entregáveis:**
- [ ] Criar orçamento com itens
- [ ] Página pública para cliente aprovar
- [ ] Aprovação/rejeição atualiza OS

---

### Sprint 5: Estoque Básico (1 semana)

**Objetivo:** Controle básico de peças

| Task | Descrição | Prioridade |
|------|-----------|------------|
| TC-090 | Backend: Entity Part e StockMovement | Alta |
| TC-091 | Backend: Use cases CRUD Part | Alta |
| TC-092 | Backend: Use case RegisterMovement | Alta |
| TC-093 | Frontend: Lista de peças | Alta |
| TC-094 | Frontend: Formulário de peça | Alta |
| TC-095 | Frontend: Entrada de estoque | Média |
| TC-096 | Frontend: Alerta estoque baixo | Média |
| TC-097 | Integração peças com orçamento | Alta |

**Entregáveis:**
- [ ] CRUD de peças
- [ ] Entrada/saída de estoque
- [ ] Usar peças no orçamento

---

### Sprint 6: Pagamentos e Dashboard (2 semanas)

**Objetivo:** Registro de pagamento e dashboard básico

| Task | Descrição | Prioridade |
|------|-----------|------------|
| TC-110 | Backend: Entity Payment | Alta |
| TC-111 | Backend: Use case RegisterPayment | Alta |
| TC-112 | Backend: Dashboard metrics endpoint | Alta |
| TC-113 | Frontend: Registrar pagamento na OS | Alta |
| TC-114 | Frontend: Seleção de forma de pagamento | Alta |
| TC-115 | Frontend: Dashboard com cards | Alta |
| TC-116 | Frontend: Lista OS recentes no dashboard | Alta |
| TC-117 | Frontend: Pendências (orçamentos, entregas) | Média |
| TC-118 | Frontend: Gráfico básico de status | Média |

**Entregáveis:**
- [ ] Registrar pagamento
- [ ] Dashboard com métricas
- [ ] Lista de pendências

---

### Sprint 7: Modo Individual e Polimento (1 semana)

**Objetivo:** Adaptar para técnico autônomo e ajustes finais

| Task | Descrição | Prioridade |
|------|-----------|------------|
| TC-130 | Backend: CompanyMode (BUSINESS/INDIVIDUAL) | Alta |
| TC-131 | Backend: Regras simplificadas para Individual | Alta |
| TC-132 | Frontend: Interface simplificada | Alta |
| TC-133 | Frontend: Onboarding de modo | Média |
| TC-134 | Testes E2E fluxo completo | Alta |
| TC-135 | Bug fixes e polimento | Alta |
| TC-136 | Documentação de uso | Média |

**Entregáveis:**
- [ ] Modo individual funcionando
- [ ] Fluxo completo testado
- [ ] Pronto para deploy

---

## Cronograma Resumido

| Sprint | Duração | Foco |
|--------|---------|------|
| Sprint 0 | 1 semana | Setup |
| Sprint 1 | 2 semanas | Clientes e Equipamentos |
| Sprint 2 | 2 semanas | OS - Criação |
| Sprint 3 | 2 semanas | OS - Fluxo |
| Sprint 4 | 2 semanas | Orçamentos |
| Sprint 5 | 1 semana | Estoque |
| Sprint 6 | 2 semanas | Pagamentos e Dashboard |
| Sprint 7 | 1 semana | Modo Individual e Polimento |
| **Total** | **13 semanas** | **MVP Completo** |

---

## Roadmap Pós-MVP

### v1.1 - Comunicação e Relatórios

| Feature | Descrição |
|---------|-----------|
| Notificações Email | Envio de emails transacionais |
| Relatórios Básicos | PDF de OS, relatório mensal |
| Comissões | Cálculo básico para técnicos |
| Impressão de OS | Comprovante para cliente |

### v1.2 - Integrações

| Feature | Descrição |
|---------|-----------|
| WhatsApp API | Notificações via WhatsApp Business |
| PIX Integrado | QR Code dinâmico |
| Garantias | Módulo de garantia completo |
| Agendamentos | Agenda de atendimentos |
| PWA | App mobile básico |

### v2.0 - Enterprise

| Feature | Descrição |
|---------|-----------|
| Multi-filial | Múltiplas unidades |
| NFe | Emissão de nota fiscal |
| API Pública | Integrações externas |
| BI Avançado | Dashboards customizáveis |
| White Label | Personalização de marca |

---

## Riscos e Mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Hub não pronto | Alto | Baixa | Boilerplate já integrado |
| Design System incompleto | Médio | Média | Usar componentes base + criar localmente |
| Escopo creep | Alto | Alta | MVP bem definido, revisão semanal |
| Performance com muitas OS | Médio | Baixa | Paginação, índices, cache |

---

## Definição de Pronto (DoD)

Cada task é considerada pronta quando:

- [ ] Código implementado seguindo padrões do CLAUDE.md
- [ ] Testes unitários passando
- [ ] Lint sem erros
- [ ] Build sem erros
- [ ] Funcionalidade testada manualmente
- [ ] Code review aprovado (se aplicável)
- [ ] Documentação atualizada (se necessário)

---

## Próximos Passos

1. **Aprovar este planejamento** - Revisar escopo e cronograma
2. **Criar projeto** - Copiar boilerplate, configurar ambiente
3. **Iniciar Sprint 0** - Setup e infraestrutura
4. **Configurar tracking** - TASK-TRACKER.md para acompanhamento

---

*Criado: 2024-12-29*
*Versão: 1.0*
