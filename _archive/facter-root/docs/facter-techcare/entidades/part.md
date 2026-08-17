# Part (Peça)

> **Entidade que representa uma peça/componente no estoque.**

---

## Schema Prisma

```prisma
model Part {
  id              String          @id @default(uuid())
  companyId       String
  company         Company         @relation(fields: [companyId], references: [id])

  // Identificação
  sku             String
  name            String
  description     String?

  // Categorização
  category        PartCategory
  type            PartType        @default(COMPATIBLE)

  // Compatibilidade
  compatibleWith  String[]        // Modelos compatíveis

  // Estoque
  quantity        Int             @default(0)
  minQuantity     Int             @default(5)
  location        String?         // Localização no estoque

  // Preços
  costPrice       Decimal         @db.Decimal(10, 2)
  sellPrice       Decimal         @db.Decimal(10, 2)
  markup          Decimal?        @db.Decimal(5, 2)

  // Fornecedor
  supplierId      String?
  supplier        Supplier?       @relation(fields: [supplierId], references: [id])
  supplierCode    String?         // Código no fornecedor

  // Garantia
  warrantyDays    Int             @default(90)

  // Movimentações
  movements       StockMovement[]

  // Uso em orçamentos
  quoteItems      QuoteItem[]

  // Status
  active          Boolean         @default(true)

  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  @@unique([companyId, sku])
  @@index([companyId, category])
  @@index([companyId, name])
}

model StockMovement {
  id            String          @id @default(uuid())
  companyId     String
  company       Company         @relation(fields: [companyId], references: [id])

  partId        String
  part          Part            @relation(fields: [partId], references: [id])

  // Tipo
  type          MovementType
  quantity      Int             // Positivo para entrada, negativo para saída

  // Valores
  unitCost      Decimal?        @db.Decimal(10, 2)
  totalCost     Decimal?        @db.Decimal(10, 2)

  // Referência
  serviceOrderId String?
  serviceOrder  ServiceOrder?   @relation(fields: [serviceOrderId], references: [id])
  reference     String?         // NF, pedido, etc

  // Motivo (para ajustes)
  reason        String?

  // Quem
  userId        String
  user          User            @relation(fields: [userId], references: [id])

  createdAt     DateTime        @default(now())
}

enum PartCategory {
  DISPLAY
  BATTERY
  CHARGING
  AUDIO
  CAMERA
  BOARD
  CONNECTOR
  BUTTON
  HOUSING
  ACCESSORY
  OTHER
}

enum PartType {
  ORIGINAL      // Peça original do fabricante
  COMPATIBLE    // Peça compatível de qualidade
  GENERIC       // Peça genérica
}

enum MovementType {
  PURCHASE      // Compra
  SALE          // Venda (uso em OS)
  ADJUSTMENT    // Ajuste manual
  RETURN        // Devolução
  TRANSFER      // Transferência
  LOSS          // Perda/quebra
}
```

---

## Endpoints da API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/parts` | Listar peças |
| GET | `/parts/:id` | Buscar peça |
| POST | `/parts` | Criar peça |
| PUT | `/parts/:id` | Atualizar peça |
| DELETE | `/parts/:id` | Desativar peça |
| POST | `/parts/:id/movement` | Registrar movimentação |
| GET | `/parts/:id/movements` | Histórico de movimentações |
| GET | `/parts/low-stock` | Peças com estoque baixo |

---

## Regras de Negócio

- SKU único por empresa
- Alerta de estoque baixo quando `quantity <= minQuantity`
- Markup automático por tipo (original/compatível/genérico)
- Garantia varia por tipo de peça
- Histórico completo de movimentações

---

**Voltar para** [Entidades](./README.md)
