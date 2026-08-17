# Payment (Pagamento)

> **Entidade que representa um pagamento recebido.**

---

## Schema Prisma

```prisma
model Payment {
  id              String          @id @default(uuid())
  companyId       String
  company         Company         @relation(fields: [companyId], references: [id])

  // Relacionamento
  serviceOrderId  String
  serviceOrder    ServiceOrder    @relation(fields: [serviceOrderId], references: [id])
  customerId      String
  customer        Customer        @relation(fields: [customerId], references: [id])

  // Valores
  amount          Decimal         @db.Decimal(10, 2)
  method          PaymentMethod
  installments    Int             @default(1)

  // Status
  status          PaymentStatus   @default(PENDING)

  // Detalhes por método
  details         Json?

  // PIX
  pixKey          String?
  pixQrCode       String?
  pixCopyPaste    String?
  pixExpiresAt    DateTime?

  // Cartão
  cardLastDigits  String?
  cardBrand       String?
  transactionId   String?

  // Boleto
  boletoUrl       String?
  boletoBarcode   String?
  boletoDueDate   DateTime?

  // Registro
  registeredById  String
  registeredBy    User            @relation(fields: [registeredById], references: [id])
  paidAt          DateTime?

  // Recibo
  receiptUrl      String?

  // Estorno
  refundedAt      DateTime?
  refundedById    String?
  refundReason    String?

  // Comissão gerada
  commissionEntry CommissionEntry?

  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
}

enum PaymentMethod {
  CASH                // Dinheiro
  PIX                 // PIX
  DEBIT               // Débito
  CREDIT_1X           // Crédito à vista
  CREDIT_INSTALLMENT  // Crédito parcelado
  BOLETO              // Boleto
  TRANSFER            // Transferência
}

enum PaymentStatus {
  PENDING       // Aguardando
  PROCESSING    // Processando
  PAID          // Pago
  FAILED        // Falhou
  REFUNDED      // Estornado
  CANCELLED     // Cancelado
}
```

---

## Endpoints da API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/payments` | Listar pagamentos |
| GET | `/payments/:id` | Buscar pagamento |
| POST | `/payments` | Registrar pagamento |
| POST | `/payments/:id/confirm` | Confirmar pagamento |
| POST | `/payments/:id/refund` | Estornar pagamento |
| GET | `/payments/:id/receipt` | Gerar recibo |
| POST | `/payments/pix/generate` | Gerar QR Code PIX |

---

## Taxas por Método

| Método | Taxa | Prazo Recebimento |
|--------|------|-------------------|
| Dinheiro | 0% | Imediato |
| PIX | 0% | Imediato |
| Débito | ~1.5% | D+1 |
| Crédito à Vista | ~3% | D+30 |
| Crédito Parcelado | ~4-6% | D+30 por parcela |
| Boleto | ~R$3/unidade | D+2 |

---

## Regras de Negócio

- Permite múltiplas formas de pagamento para mesma OS
- Comissão gerada automaticamente ao confirmar pagamento
- Estorno permitido até 7 dias após pagamento
- PIX com QR Code dinâmico (expira em 1 hora)

---

**Voltar para** [Entidades](./README.md)
