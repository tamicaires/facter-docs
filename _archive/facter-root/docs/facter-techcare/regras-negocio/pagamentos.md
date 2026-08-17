# Pagamentos

> **Regras de negócio para registro e gestão de pagamentos.**

---

## Formas de Pagamento

| Forma | Código | Taxa | Prazo Recebimento |
|-------|--------|------|-------------------|
| Dinheiro | `CASH` | 0% | Imediato |
| PIX | `PIX` | 0% | Imediato |
| Débito | `DEBIT` | ~1.5% | D+1 |
| Crédito à Vista | `CREDIT_1X` | ~3% | D+30 |
| Crédito Parcelado | `CREDIT_INSTALLMENT` | ~4-6% | D+30 por parcela |
| Boleto | `BOLETO` | ~R$3/unidade | D+2 |
| Transferência | `TRANSFER` | 0% | D+0/D+1 |

---

## Estrutura

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
  details         Json?           // Específico por método

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

  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
}

enum PaymentMethod {
  CASH
  PIX
  DEBIT
  CREDIT_1X
  CREDIT_INSTALLMENT
  BOLETO
  TRANSFER
}

enum PaymentStatus {
  PENDING       // Aguardando
  PROCESSING    // Processando (PIX/Boleto)
  PAID          // Pago
  FAILED        // Falhou
  REFUNDED      // Estornado
  CANCELLED     // Cancelado
}
```

---

## Fluxo de Pagamento

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    OS FINALIZADA (Status: COMPLETED)                    │
└────────┬────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    INFORMAR VALOR TOTAL                                 │
├─────────────────────────────────────────────────────────────────────────┤
│ • Serviços: R$ XX,XX                                                    │
│ • Peças: R$ XX,XX                                                       │
│ • Desconto: - R$ XX,XX                                                  │
│ • TOTAL: R$ XX,XX                                                       │
└────────┬────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    SELECIONAR FORMA DE PAGAMENTO                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│  │ Dinheiro│ │   PIX   │ │  Débito │ │ Crédito │ │  Boleto │          │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘          │
│       │           │           │           │           │                 │
└───────┼───────────┼───────────┼───────────┼───────────┼─────────────────┘
        │           │           │           │           │
        ▼           ▼           ▼           ▼           ▼
   ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
   │Confirmar│ │ Gerar   │ │Processar│ │ Parcelas│ │ Gerar   │
   │ Valor   │ │ QR Code │ │ Maquina │ │ + Taxa  │ │ Boleto  │
   └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘
        │           │           │           │           │
        ▼           ▼           ▼           ▼           ▼
   ┌─────────────────────────────────────────────────────────┐
   │              PAGAMENTO REGISTRADO                        │
   │              Status: PAID / PENDING                      │
   └────────────────────────────┬────────────────────────────┘
                                │
                                ▼
   ┌─────────────────────────────────────────────────────────┐
   │              GERAR RECIBO / NOTA FISCAL                  │
   └────────────────────────────┬────────────────────────────┘
                                │
                                ▼
   ┌─────────────────────────────────────────────────────────┐
   │              OS PODE SER ENTREGUE                        │
   │              (se pago ou isento)                         │
   └─────────────────────────────────────────────────────────┘
```

---

## Pagamento PIX

### Geração de QR Code

```typescript
// RN-PAG-001: Gerar PIX dinâmico
async function generatePixPayment(payment: Payment): Promise<PixData> {
  const company = await getCompany(payment.companyId);
  const settings = company.settings.payments.pix;

  // Criar cobrança PIX
  const pix = await pixProvider.createCharge({
    key: settings.pixKey,
    amount: payment.amount,
    description: `OS ${payment.serviceOrder.number}`,
    expiresIn: 3600, // 1 hora
    txid: payment.id,
  });

  // Atualizar payment com dados PIX
  await updatePayment(payment.id, {
    pixQrCode: pix.qrCode,
    pixCopyPaste: pix.copyPaste,
    pixExpiresAt: pix.expiresAt,
    status: 'PROCESSING',
  });

  return pix;
}

// RN-PAG-002: Webhook de confirmação PIX
async function handlePixWebhook(payload: PixWebhook): Promise<void> {
  const payment = await findPaymentByTxId(payload.txid);

  if (payload.status === 'CONCLUIDA') {
    await confirmPayment(payment.id, {
      paidAt: new Date(payload.horario),
      transactionId: payload.endToEndId,
    });

    // Notificar
    await notifyPaymentReceived(payment);
  }
}
```

### PIX Estático (Modo Individual)

```typescript
// Para técnicos autônomos sem integração
interface StaticPixData {
  key: string;         // Chave PIX do técnico
  keyType: 'CPF' | 'PHONE' | 'EMAIL' | 'RANDOM';
  qrCode: string;      // QR Code estático
  instructions: string; // "Após pagar, me avise"
}
```

---

## Pagamento Cartão

### Integração com Maquininha

```typescript
// Opção 1: Registro manual (sem integração)
interface ManualCardPayment {
  method: 'CREDIT_1X' | 'CREDIT_INSTALLMENT' | 'DEBIT';
  amount: number;
  installments?: number;
  cardLastDigits: string;  // Digitado manualmente
  cardBrand: string;
  authorizationCode?: string;
}

// Opção 2: Integração com gateway
interface IntegratedCardPayment {
  method: 'CREDIT_1X' | 'CREDIT_INSTALLMENT' | 'DEBIT';
  amount: number;
  installments?: number;
  // Processado via gateway (Stone, PagSeguro, etc)
}
```

### Cálculo de Parcelas

```typescript
// RN-PAG-010: Calcular valor das parcelas
interface InstallmentOption {
  installments: number;
  installmentValue: number;
  totalValue: number;
  fees: number;
  feePercent: number;
}

function calculateInstallments(
  amount: number,
  maxInstallments: number = 12,
  feeTable: FeeTable
): InstallmentOption[] {
  const options: InstallmentOption[] = [];

  for (let i = 1; i <= maxInstallments; i++) {
    const feePercent = feeTable[i] || feeTable.default;
    const totalValue = amount * (1 + feePercent / 100);
    const installmentValue = totalValue / i;

    // Mínimo de R$ 10 por parcela
    if (installmentValue >= 10) {
      options.push({
        installments: i,
        installmentValue: Math.ceil(installmentValue * 100) / 100,
        totalValue: Math.ceil(totalValue * 100) / 100,
        fees: totalValue - amount,
        feePercent,
      });
    }
  }

  return options;
}
```

---

## Pagamento Parcial / Múltiplas Formas

```typescript
// RN-PAG-020: Permitir múltiplas formas de pagamento
interface MultiPayment {
  serviceOrderId: string;
  totalAmount: number;
  payments: {
    method: PaymentMethod;
    amount: number;
    installments?: number;
  }[];
}

// Exemplo: R$ 500 total
// - R$ 200 em dinheiro
// - R$ 300 em 2x no cartão

async function processMultiPayment(data: MultiPayment): Promise<void> {
  const totalPaid = data.payments.reduce((sum, p) => sum + p.amount, 0);

  if (totalPaid !== data.totalAmount) {
    throw new Error('Soma dos pagamentos difere do total');
  }

  // Criar um registro para cada forma
  for (const payment of data.payments) {
    await createPayment({
      serviceOrderId: data.serviceOrderId,
      ...payment,
    });
  }
}
```

---

## Estorno / Cancelamento

```typescript
// RN-PAG-030: Estorno de pagamento
async function refundPayment(
  paymentId: string,
  reason: string,
  userId: string
): Promise<void> {
  const payment = await getPayment(paymentId);

  // Validar se pode estornar
  if (payment.status !== 'PAID') {
    throw new Error('Apenas pagamentos confirmados podem ser estornados');
  }

  // Verificar política de estorno
  const daysSincePayment = differenceInDays(new Date(), payment.paidAt);
  if (daysSincePayment > 7) {
    throw new Error('Prazo para estorno expirado (7 dias)');
  }

  // Processar estorno por método
  switch (payment.method) {
    case 'PIX':
      await pixProvider.refund(payment.transactionId);
      break;
    case 'CREDIT_1X':
    case 'CREDIT_INSTALLMENT':
      await cardProvider.refund(payment.transactionId);
      break;
    default:
      // Dinheiro/Transferência: apenas registro
      break;
  }

  await updatePayment(paymentId, {
    status: 'REFUNDED',
    refundedAt: new Date(),
    refundReason: reason,
    refundedById: userId,
  });

  // Reabrir OS se necessário
  await reopenServiceOrderIfNeeded(payment.serviceOrderId);
}
```

---

## Relatórios Financeiros

```typescript
interface FinancialReport {
  period: { start: Date; end: Date };

  // Resumo
  summary: {
    totalReceived: number;
    totalPending: number;
    totalRefunded: number;
    orderCount: number;
    averageTicket: number;
  };

  // Por forma de pagamento
  byMethod: {
    method: PaymentMethod;
    amount: number;
    count: number;
    percentage: number;
    fees: number;
  }[];

  // Por dia
  byDay: {
    date: Date;
    amount: number;
    count: number;
  }[];

  // Detalhado
  payments: Payment[];
}
```

---

## Isenção de Pagamento

```typescript
// RN-PAG-040: Registrar entrega sem pagamento
interface PaymentExemption {
  serviceOrderId: string;
  reason: 'WARRANTY' | 'COURTESY' | 'PARTNER' | 'OTHER';
  description?: string;
  approvedById: string;  // Gerente
}

async function exemptPayment(data: PaymentExemption): Promise<void> {
  // Validar permissão (apenas gerente+)
  const user = await getUser(data.approvedById);
  if (!canExemptPayment(user)) {
    throw new Error('Sem permissão para isentar pagamento');
  }

  await createPayment({
    serviceOrderId: data.serviceOrderId,
    amount: 0,
    method: 'EXEMPTION',
    status: 'PAID',
    details: {
      exemptionReason: data.reason,
      exemptionDescription: data.description,
      approvedById: data.approvedById,
    },
  });
}
```

---

## Comissão do Técnico

Ver [Comissões](./comissoes.md) para cálculo de comissão sobre pagamentos.

---

## Permissões

| Ação | Atendente | Técnico | Gerente | Admin |
|------|-----------|---------|---------|-------|
| Registrar pagamento | ✅ | ❌ | ✅ | ✅ |
| Ver pagamentos | ✅ | Próprias OS | ✅ | ✅ |
| Estornar | ❌ | ❌ | ✅ | ✅ |
| Isentar | ❌ | ❌ | ✅ | ✅ |
| Relatórios | ❌ | ❌ | ✅ | ✅ |
| Configurar métodos | ❌ | ❌ | ❌ | ✅ |

---

**Voltar para** [Regras de Negócio](./README.md)
