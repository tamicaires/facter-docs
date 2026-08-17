# Quote (Orçamento)

> **Entidade que representa um orçamento de serviço.**

---

## Schema Prisma

```prisma
model Quote {
  id              String          @id @default(uuid())
  companyId       String
  company         Company         @relation(fields: [companyId], references: [id])

  // Relacionamento
  serviceOrderId  String          @unique
  serviceOrder    ServiceOrder    @relation(fields: [serviceOrderId], references: [id])

  // Diagnóstico que gerou o orçamento
  diagnosisId     String?
  diagnosis       Diagnosis?      @relation(fields: [diagnosisId], references: [id])

  // Itens
  items           QuoteItem[]

  // Valores
  subtotal        Decimal         @db.Decimal(10, 2)
  discount        Decimal         @default(0) @db.Decimal(10, 2)
  discountType    DiscountType    @default(FIXED)
  total           Decimal         @db.Decimal(10, 2)

  // Validade
  validUntil      DateTime

  // Status
  status          QuoteStatus     @default(PENDING)

  // Aprovação/Rejeição
  respondedAt     DateTime?
  respondedBy     String?         // 'CUSTOMER' ou userId
  responseMethod  String?         // 'LINK', 'WHATSAPP', 'PHONE', 'IN_PERSON'
  rejectionReason String?

  // Mensagens
  notes           String?         // Observações internas
  customerNotes   String?         // Observações para o cliente

  // Quem criou
  createdById     String
  createdBy       User            @relation(fields: [createdById], references: [id])

  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
}

model QuoteItem {
  id          String      @id @default(uuid())
  quoteId     String
  quote       Quote       @relation(fields: [quoteId], references: [id])

  // Tipo
  type        QuoteItemType

  // Descrição
  description String

  // Peça (se aplicável)
  partId      String?
  part        Part?       @relation(fields: [partId], references: [id])

  // Valores
  quantity    Int         @default(1)
  unitPrice   Decimal     @db.Decimal(10, 2)
  discount    Decimal     @default(0) @db.Decimal(10, 2)
  total       Decimal     @db.Decimal(10, 2)

  // Garantia
  warrantyDays Int        @default(90)

  createdAt   DateTime    @default(now())
}

enum QuoteStatus {
  DRAFT         // Rascunho
  PENDING       // Aguardando resposta
  APPROVED      // Aprovado
  REJECTED      // Rejeitado
  EXPIRED       // Expirado
  CANCELLED     // Cancelado
}

enum QuoteItemType {
  SERVICE       // Serviço/mão de obra
  PART          // Peça
  ACCESSORY     // Acessório
  OTHER         // Outro
}

enum DiscountType {
  FIXED         // Valor fixo (R$)
  PERCENTAGE    // Percentual (%)
}
```

---

## Endpoints da API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/quotes` | Listar orçamentos |
| GET | `/quotes/:id` | Buscar orçamento |
| POST | `/quotes` | Criar orçamento |
| PUT | `/quotes/:id` | Atualizar orçamento |
| POST | `/quotes/:id/send` | Enviar para cliente |
| POST | `/quotes/:id/approve` | Aprovar orçamento |
| POST | `/quotes/:id/reject` | Rejeitar orçamento |
| GET | `/quotes/:id/pdf` | Gerar PDF |

---

## Regras de Negócio

- Validade padrão: 7 dias (configurável)
- Desconto máximo sem aprovação: configurável por empresa
- Clientes VIP/Premium têm desconto automático
- Orçamento expira automaticamente após validade
- Cliente pode aprovar via link, WhatsApp ou presencial

---

**Voltar para** [Entidades](./README.md)
