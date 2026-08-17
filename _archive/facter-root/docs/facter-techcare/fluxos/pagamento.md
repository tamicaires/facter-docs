# Fluxo de Pagamento

> **Processo de recebimento e registro de pagamentos.**

---

## Diagrama

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FLUXO DE PAGAMENTO                                 │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌───────────────────┐
    │  OS Concluída     │
    │  (COMPLETED)      │
    └─────────┬─────────┘
              │
              ▼
    ┌───────────────────┐
    │  Cliente notifi-  │
    │  cado para buscar │
    └─────────┬─────────┘
              │
              ▼
    ┌───────────────────────────────────────────┐
    │              BALCÃO/ENTREGA                │
    │  ┌─────────────────────────────────────┐  │
    │  │ • Conferir equipamento com cliente  │  │
    │  │ • Demonstrar serviço realizado      │  │
    │  │ • Apresentar valor final            │  │
    │  └─────────────────────────────────────┘  │
    └───────────────────┬───────────────────────┘
                        │
                        ▼
              ┌─────────────────┐
              │ Forma de        │
              │ Pagamento?      │
              └────────┬────────┘
                       │
    ┌──────────────────┼──────────────────┐
    │                  │                  │
    ▼                  ▼                  ▼
┌─────────┐     ┌───────────┐     ┌───────────┐
│  PIX    │     │ CARTÃO    │     │ DINHEIRO  │
└────┬────┘     └─────┬─────┘     └─────┬─────┘
     │                │                 │
     ▼                ▼                 ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ QR Code     │ │ Maquininha  │ │ Conferir    │
│ Dinâmico    │ │ À vista/    │ │ Troco       │
│             │ │ Parcelado   │ │             │
└──────┬──────┘ └──────┬──────┘ └──────┬──────┘
       │               │               │
       └───────────────┼───────────────┘
                       │
                       ▼
              ┌─────────────────┐
              │ Pagamento       │
              │ Confirmado?     │
              └────────┬────────┘
                       │
          ┌────────────┴────────────┐
          │                         │
          ▼                         ▼
    ┌───────────┐           ┌───────────────┐
    │    SIM    │           │      NÃO      │
    └─────┬─────┘           └───────┬───────┘
          │                         │
          │                         ▼
          │                 ┌───────────────┐
          │                 │ Tentar outro  │
          │                 │ método        │
          │                 └───────────────┘
          │
          ▼
    ┌───────────────────────────────────────────┐
    │              REGISTRO DO PAGAMENTO         │
    │  ┌─────────────────────────────────────┐  │
    │  │ • Valor recebido                    │  │
    │  │ • Método de pagamento               │  │
    │  │ • Detalhes (parcelas, transação)    │  │
    │  │ • Quem recebeu                      │  │
    │  └─────────────────────────────────────┘  │
    └───────────────────┬───────────────────────┘
                        │
                        ▼
              ┌─────────────────┐
              │ Pagamento       │
              │ Total?          │
              └────────┬────────┘
                       │
          ┌────────────┴────────────┐
          │                         │
          ▼                         ▼
    ┌───────────┐           ┌───────────────┐
    │  TOTAL    │           │   PARCIAL     │
    └─────┬─────┘           └───────┬───────┘
          │                         │
          ▼                         ▼
    ┌───────────────┐       ┌───────────────┐
    │ Gerar Recibo  │       │ Registrar     │
    │ Emitir Nota   │       │ Pendência     │
    └───────┬───────┘       └───────┬───────┘
            │                       │
            ▼                       │
    ┌───────────────┐               │
    │ Entregar      │               │
    │ Equipamento   │◀──────────────┘
    └───────┬───────┘
            │
            ▼
    ┌───────────────┐
    │   DELIVERED   │
    └───────────────┘
```

---

## Estados de Pagamento da OS

| Estado | Descrição |
|--------|-----------|
| `PENDING` | Pagamento pendente |
| `PARTIAL` | Pago parcialmente |
| `PAID` | Pago integralmente |
| `REFUNDED` | Reembolsado |

---

## Métodos de Pagamento

### PIX

```typescript
interface PixPayment {
  method: 'PIX';
  pixKey: string;           // Chave PIX da empresa
  qrCode: string;           // QR Code dinâmico
  transactionId: string;    // ID da transação
  confirmedAt: Date;
}
```

**Fluxo:**
1. Sistema gera QR Code com valor exato
2. Cliente escaneia e paga
3. Sistema confirma via webhook do banco
4. Pagamento registrado automaticamente

### Cartão de Crédito

```typescript
interface CardPayment {
  method: 'CREDIT_CARD';
  brand: string;            // Visa, Master, etc
  lastDigits: string;       // Últimos 4 dígitos
  installments: number;     // Número de parcelas
  installmentValue: number; // Valor da parcela
  authorizationCode: string;
  nsu: string;              // NSU da transação
}
```

**Regras de Parcelamento:**
- Mínimo por parcela: R$ 50,00
- Máximo de parcelas: 12x
- Juros: Configurável (absorvido ou repassado)

### Cartão de Débito

```typescript
interface DebitPayment {
  method: 'DEBIT_CARD';
  brand: string;
  lastDigits: string;
  authorizationCode: string;
  nsu: string;
}
```

### Dinheiro

```typescript
interface CashPayment {
  method: 'CASH';
  amountReceived: number;   // Valor recebido
  change: number;           // Troco dado
}
```

### Transferência

```typescript
interface TransferPayment {
  method: 'BANK_TRANSFER';
  bankName: string;
  transactionId: string;
  confirmedAt: Date;
}
```

---

## Pagamento Parcial

Quando o cliente não paga o valor total:

```typescript
// Situação: OS de R$ 450, cliente paga R$ 200

// POST /payments
{
  "serviceOrderId": "order-uuid",
  "amount": 200.00,
  "method": "CASH"
}

// Response
{
  "data": {
    "payment": {
      "id": "payment-uuid",
      "amount": 200.00,
      "status": "CONFIRMED"
    },
    "serviceOrder": {
      "total": 450.00,
      "paidAmount": 200.00,
      "remainingAmount": 250.00,
      "paymentStatus": "PARTIAL"
    }
  }
}
```

**Regras:**
- Equipamento pode ser entregue com pagamento parcial (configurável)
- Pendência registrada no cadastro do cliente
- Alertas para follow-up de cobrança

---

## Pagamentos Múltiplos

Cliente pode pagar com mais de uma forma:

```typescript
// R$ 450 total: R$ 200 PIX + R$ 250 Cartão

// 1º Pagamento
POST /payments
{
  "serviceOrderId": "order-uuid",
  "amount": 200.00,
  "method": "PIX"
}

// 2º Pagamento
POST /payments
{
  "serviceOrderId": "order-uuid",
  "amount": 250.00,
  "method": "CREDIT_CARD",
  "methodDetails": {
    "installments": 2
  }
}
```

---

## Geração de Recibo

```typescript
// GET /payments/:id/receipt

interface Receipt {
  number: string;           // REC-2024-00001
  date: Date;
  company: {
    name: string;
    document: string;
    address: string;
  };
  customer: {
    name: string;
    document: string;
  };
  serviceOrder: {
    number: string;
    description: string;
  };
  payments: {
    method: string;
    amount: number;
    details: string;
  }[];
  total: number;
}
```

---

## Relatório de Caixa

Fechamento diário:

```typescript
// GET /payments/daily-report?date=2024-01-15

{
  "date": "2024-01-15",
  "summary": {
    "totalReceived": 4500.00,
    "transactionCount": 12,
    "byMethod": {
      "PIX": { "amount": 2500.00, "count": 7 },
      "CREDIT_CARD": { "amount": 1500.00, "count": 4 },
      "CASH": { "amount": 500.00, "count": 1 }
    }
  },
  "transactions": [
    {
      "id": "payment-uuid",
      "time": "09:30",
      "customer": "João Silva",
      "orderNumber": "OS-202501-00001",
      "amount": 450.00,
      "method": "PIX",
      "receivedBy": "Maria"
    }
  ]
}
```

---

## Comissão do Técnico

Ao confirmar pagamento, comissão é calculada:

```typescript
// Evento disparado após pagamento total
{
  "event": "payment.completed",
  "data": {
    "serviceOrderId": "order-uuid",
    "technicianId": "tech-uuid",
    "orderTotal": 450.00,
    "laborValue": 150.00,
    "commissionRate": 15,
    "commissionValue": 22.50,
    "status": "PENDING"  // Liberada após período
  }
}
```

---

## Regras de Negócio

1. **Entrega condicionada**: Equipamento só entregue após pagamento (configurável)
2. **Limite de crédito**: Pagamento parcial só se cliente tiver crédito
3. **Desconto no caixa**: Máximo 5% sem aprovação
4. **Estorno**: Até 24h sem justificativa, após precisa aprovação
5. **Comprovante**: Obrigatório envio por WhatsApp/Email

---

## Notificações

| Evento | Destinatário | Canal |
|--------|--------------|-------|
| Pagamento recebido | Cliente | WhatsApp, Email |
| Pagamento parcial | Atendente, Gerente | Sistema |
| Estorno realizado | Cliente, Gerente | Email |

---

**Voltar para** [Fluxos](./README.md)
