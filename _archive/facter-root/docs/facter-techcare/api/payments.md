# API - Pagamentos

> **Endpoints para gestão de pagamentos e financeiro.**

---

## Endpoints

### GET /payments

Lista pagamentos com filtros.

**Query Parameters:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| `page` | number | Página (default: 1) |
| `perPage` | number | Itens por página (default: 20) |
| `serviceOrderId` | uuid | Filtrar por OS |
| `customerId` | uuid | Filtrar por cliente |
| `method` | string | Método de pagamento |
| `status` | string | Status do pagamento |
| `startDate` | date | Data inicial |
| `endDate` | date | Data final |

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "serviceOrderId": "order-uuid",
      "serviceOrderNumber": "OS-202501-00001",
      "customerId": "customer-uuid",
      "customerName": "João Silva",
      "amount": 450.00,
      "method": "PIX",
      "status": "CONFIRMED",
      "receivedAt": "2024-01-15T14:30:00Z",
      "receivedById": "user-uuid",
      "receivedByName": "Maria Atendente",
      "notes": null,
      "createdAt": "2024-01-15T14:30:00Z"
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "perPage": 20,
    "totalPages": 3,
    "summary": {
      "totalAmount": 15750.00,
      "byMethod": {
        "PIX": 8500.00,
        "CREDIT_CARD": 4250.00,
        "CASH": 3000.00
      }
    }
  }
}
```

---

### GET /payments/:id

Retorna detalhes do pagamento.

**Response (200):**
```json
{
  "data": {
    "id": "uuid",
    "serviceOrderId": "order-uuid",
    "serviceOrder": {
      "id": "order-uuid",
      "number": "OS-202501-00001",
      "total": 450.00
    },
    "customerId": "customer-uuid",
    "customer": {
      "id": "customer-uuid",
      "name": "João Silva",
      "document": "123.456.789-00"
    },
    "amount": 450.00,
    "method": "PIX",
    "methodDetails": {
      "pixKey": "chave@pix.com",
      "transactionId": "E123456789..."
    },
    "status": "CONFIRMED",
    "receivedAt": "2024-01-15T14:30:00Z",
    "receivedById": "user-uuid",
    "receivedBy": {
      "id": "user-uuid",
      "name": "Maria Atendente"
    },
    "notes": null,
    "receipt": {
      "number": "REC-2024-00123",
      "url": "https://storage.../receipt.pdf"
    },
    "createdAt": "2024-01-15T14:30:00Z",
    "updatedAt": "2024-01-15T14:30:00Z"
  }
}
```

---

### POST /payments

Registra novo pagamento.

**Request:**
```json
{
  "serviceOrderId": "order-uuid",
  "amount": 450.00,
  "method": "PIX",
  "methodDetails": {
    "pixKey": "chave@pix.com",
    "transactionId": "E123456789..."
  },
  "notes": "Pagamento via app do banco"
}
```

**Response (201):**
```json
{
  "data": {
    "id": "uuid",
    "serviceOrderId": "order-uuid",
    "amount": 450.00,
    "method": "PIX",
    "status": "CONFIRMED",
    "receivedAt": "2024-01-15T14:30:00Z",
    "receipt": {
      "number": "REC-2024-00123"
    }
  }
}
```

---

### POST /payments/partial

Registra pagamento parcial.

**Request:**
```json
{
  "serviceOrderId": "order-uuid",
  "amount": 200.00,
  "method": "CASH",
  "notes": "Entrada - restante no cartão"
}
```

**Response (201):**
```json
{
  "data": {
    "payment": {
      "id": "uuid",
      "amount": 200.00,
      "method": "CASH",
      "status": "CONFIRMED"
    },
    "serviceOrder": {
      "id": "order-uuid",
      "total": 450.00,
      "paidAmount": 200.00,
      "remainingAmount": 250.00,
      "paymentStatus": "PARTIAL"
    }
  }
}
```

---

### POST /payments/:id/refund

Processa reembolso.

**Request:**
```json
{
  "amount": 450.00,
  "reason": "CUSTOMER_REQUEST",
  "notes": "Cliente desistiu do serviço"
}
```

**Response (200):**
```json
{
  "data": {
    "id": "refund-uuid",
    "paymentId": "payment-uuid",
    "amount": 450.00,
    "reason": "CUSTOMER_REQUEST",
    "status": "PROCESSED",
    "processedAt": "2024-01-15T16:00:00Z"
  }
}
```

---

### DELETE /payments/:id

Cancela/estorna pagamento.

**Response (204):** No Content

**Response (400):**
```json
{
  "error": {
    "code": "CANNOT_CANCEL",
    "message": "Pagamento não pode ser cancelado após 24h"
  }
}
```

---

### GET /payments/:id/receipt

Gera recibo do pagamento.

**Query Parameters:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| `format` | string | `pdf` ou `json` (default: pdf) |

**Response (200):** PDF ou JSON do recibo

---

### GET /payments/methods

Lista métodos de pagamento disponíveis.

**Response (200):**
```json
{
  "data": [
    {
      "key": "PIX",
      "label": "PIX",
      "enabled": true,
      "requiresDetails": true
    },
    {
      "key": "CASH",
      "label": "Dinheiro",
      "enabled": true,
      "requiresDetails": false
    },
    {
      "key": "CREDIT_CARD",
      "label": "Cartão de Crédito",
      "enabled": true,
      "requiresDetails": true,
      "installments": {
        "max": 12,
        "minValue": 50.00
      }
    },
    {
      "key": "DEBIT_CARD",
      "label": "Cartão de Débito",
      "enabled": true,
      "requiresDetails": false
    },
    {
      "key": "BANK_TRANSFER",
      "label": "Transferência Bancária",
      "enabled": true,
      "requiresDetails": true
    },
    {
      "key": "CHECK",
      "label": "Cheque",
      "enabled": false,
      "requiresDetails": true
    }
  ]
}
```

---

### GET /payments/summary

Resumo financeiro do período.

**Query Parameters:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| `startDate` | date | Data inicial (obrigatório) |
| `endDate` | date | Data final (obrigatório) |
| `groupBy` | string | `day`, `week`, `month` |

**Response (200):**
```json
{
  "data": {
    "period": {
      "start": "2024-01-01",
      "end": "2024-01-31"
    },
    "totals": {
      "received": 45750.00,
      "refunded": 1200.00,
      "net": 44550.00,
      "pending": 3500.00
    },
    "byMethod": [
      { "method": "PIX", "amount": 22500.00, "count": 85 },
      { "method": "CREDIT_CARD", "amount": 15000.00, "count": 42 },
      { "method": "CASH", "amount": 8250.00, "count": 55 }
    ],
    "byDay": [
      { "date": "2024-01-01", "amount": 1250.00, "count": 5 },
      { "date": "2024-01-02", "amount": 2100.00, "count": 8 }
    ],
    "averageTicket": 375.00
  }
}
```

---

## Métodos de Pagamento

| Método | Chave | Campos Extras |
|--------|-------|---------------|
| PIX | `PIX` | pixKey, transactionId |
| Dinheiro | `CASH` | - |
| Cartão Crédito | `CREDIT_CARD` | lastDigits, installments, brand |
| Cartão Débito | `DEBIT_CARD` | lastDigits, brand |
| Transferência | `BANK_TRANSFER` | bankName, transactionId |
| Cheque | `CHECK` | checkNumber, bank, dueDate |

---

## Status de Pagamento

| Status | Descrição |
|--------|-----------|
| `PENDING` | Aguardando confirmação |
| `CONFIRMED` | Confirmado |
| `CANCELLED` | Cancelado |
| `REFUNDED` | Reembolsado |
| `PARTIAL_REFUND` | Reembolso parcial |

---

## Permissões

| Ação | Permissão |
|------|-----------|
| Listar | `read:Payment` |
| Visualizar | `read:Payment` |
| Criar | `create:Payment` |
| Cancelar | `delete:Payment` |
| Reembolsar | `refund:Payment` |

---

**Voltar para** [API](./README.md)
