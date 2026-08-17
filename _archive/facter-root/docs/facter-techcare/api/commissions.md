# API - Comissões

> **Endpoints para gestão de comissões dos técnicos.**

---

## Endpoints

### GET /commissions

Lista comissões com filtros.

**Query Parameters:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| `page` | number | Página (default: 1) |
| `perPage` | number | Itens por página (default: 20) |
| `technicianId` | uuid | Filtrar por técnico |
| `status` | string | Status da comissão |
| `startDate` | date | Data inicial |
| `endDate` | date | Data final |

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "technicianId": "tech-uuid",
      "technicianName": "Carlos Técnico",
      "serviceOrderId": "order-uuid",
      "serviceOrderNumber": "OS-202501-00001",
      "orderTotal": 450.00,
      "commissionRate": 15.00,
      "commissionValue": 67.50,
      "status": "AVAILABLE",
      "availableAt": "2024-01-18T00:00:00Z",
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "perPage": 20,
    "totalPages": 8,
    "summary": {
      "totalCommission": 5250.00,
      "pending": 1200.00,
      "available": 2800.00,
      "paid": 1250.00
    }
  }
}
```

---

### GET /commissions/:id

Retorna detalhes da comissão.

**Response (200):**
```json
{
  "data": {
    "id": "uuid",
    "technicianId": "tech-uuid",
    "technician": {
      "id": "tech-uuid",
      "name": "Carlos Técnico",
      "commissionConfig": {
        "defaultRate": 15.00,
        "rules": [...]
      }
    },
    "serviceOrderId": "order-uuid",
    "serviceOrder": {
      "id": "order-uuid",
      "number": "OS-202501-00001",
      "completedAt": "2024-01-15T16:00:00Z",
      "items": [
        {
          "description": "Troca de tela",
          "type": "SERVICE",
          "price": 300.00
        },
        {
          "description": "Tela iPhone 14",
          "type": "PART",
          "price": 150.00
        }
      ],
      "total": 450.00
    },
    "baseValue": 450.00,
    "commissionableValue": 300.00,
    "commissionRate": 15.00,
    "commissionValue": 45.00,
    "bonuses": [
      {
        "type": "COMPLETION_TIME",
        "description": "Bônus por entrega rápida",
        "value": 10.00
      }
    ],
    "deductions": [],
    "finalValue": 55.00,
    "status": "AVAILABLE",
    "statusHistory": [
      {
        "status": "PENDING",
        "changedAt": "2024-01-15T16:00:00Z"
      },
      {
        "status": "AVAILABLE",
        "changedAt": "2024-01-18T00:00:00Z"
      }
    ],
    "availableAt": "2024-01-18T00:00:00Z",
    "paidAt": null,
    "paymentId": null,
    "createdAt": "2024-01-15T16:00:00Z",
    "updatedAt": "2024-01-18T00:00:00Z"
  }
}
```

---

### GET /commissions/technician/:technicianId

Resumo de comissões do técnico.

**Query Parameters:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| `startDate` | date | Data inicial |
| `endDate` | date | Data final |

**Response (200):**
```json
{
  "data": {
    "technician": {
      "id": "tech-uuid",
      "name": "Carlos Técnico"
    },
    "period": {
      "start": "2024-01-01",
      "end": "2024-01-31"
    },
    "summary": {
      "ordersCompleted": 25,
      "totalBilled": 12500.00,
      "totalCommission": 1875.00,
      "pending": 450.00,
      "available": 1125.00,
      "paid": 300.00
    },
    "byWeek": [
      {
        "week": 1,
        "orders": 5,
        "commission": 375.00
      },
      {
        "week": 2,
        "orders": 8,
        "commission": 600.00
      }
    ],
    "averagePerOrder": 75.00,
    "effectiveRate": 15.00
  }
}
```

---

### POST /commissions/calculate

Calcula comissão para uma OS (preview).

**Request:**
```json
{
  "technicianId": "tech-uuid",
  "items": [
    {
      "type": "SERVICE",
      "price": 300.00
    },
    {
      "type": "PART",
      "price": 150.00
    }
  ],
  "total": 450.00
}
```

**Response (200):**
```json
{
  "data": {
    "baseValue": 450.00,
    "commissionableValue": 300.00,
    "excludedValue": 150.00,
    "excludedReason": "Peças não comissionáveis",
    "rate": 15.00,
    "commission": 45.00,
    "possibleBonuses": [
      {
        "type": "COMPLETION_TIME",
        "description": "Entrega em até 24h",
        "value": 10.00
      }
    ],
    "estimatedTotal": 55.00
  }
}
```

---

### POST /commissions/pay

Registra pagamento de comissões.

**Request:**
```json
{
  "technicianId": "tech-uuid",
  "commissionIds": ["comm-uuid-1", "comm-uuid-2"],
  "paymentMethod": "PIX",
  "paymentDetails": {
    "pixKey": "chave@pix.com",
    "transactionId": "E123..."
  },
  "notes": "Pagamento referente a janeiro/2024"
}
```

**Response (200):**
```json
{
  "data": {
    "paymentId": "payment-uuid",
    "technicianId": "tech-uuid",
    "technicianName": "Carlos Técnico",
    "commissionsPaid": 2,
    "totalPaid": 155.00,
    "paymentMethod": "PIX",
    "paidAt": "2024-02-01T10:00:00Z"
  }
}
```

---

### GET /commissions/payments

Lista pagamentos de comissões.

**Query Parameters:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| `technicianId` | uuid | Filtrar por técnico |
| `startDate` | date | Data inicial |
| `endDate` | date | Data final |

**Response (200):**
```json
{
  "data": [
    {
      "id": "payment-uuid",
      "technicianId": "tech-uuid",
      "technicianName": "Carlos Técnico",
      "commissionsCount": 15,
      "totalPaid": 1125.00,
      "paymentMethod": "PIX",
      "paidAt": "2024-02-01T10:00:00Z",
      "paidById": "user-uuid",
      "paidByName": "Admin"
    }
  ]
}
```

---

### GET /commission-rules

Lista regras de comissão.

**Response (200):**
```json
{
  "data": {
    "defaultRate": 15.00,
    "partsCommissionable": false,
    "rules": [
      {
        "id": "rule-uuid",
        "name": "Taxa padrão",
        "type": "PERCENTAGE",
        "value": 15.00,
        "appliesTo": "SERVICE",
        "active": true
      },
      {
        "id": "rule-uuid-2",
        "name": "Bônus entrega rápida",
        "type": "FIXED",
        "value": 10.00,
        "condition": "COMPLETION_UNDER_24H",
        "active": true
      }
    ],
    "bonuses": [
      {
        "type": "COMPLETION_TIME",
        "description": "Entrega em até 24h",
        "value": 10.00
      },
      {
        "type": "CUSTOMER_RATING",
        "description": "Avaliação 5 estrelas",
        "value": 5.00
      }
    ],
    "deductions": [
      {
        "type": "REWORK",
        "description": "Retorno por retrabalho",
        "value": -20.00
      }
    ]
  }
}
```

---

### POST /commission-rules

Cria nova regra de comissão.

**Request:**
```json
{
  "name": "Bônus fim de semana",
  "type": "FIXED",
  "value": 15.00,
  "condition": "WEEKEND_COMPLETION",
  "active": true
}
```

**Response (201):**
```json
{
  "data": {
    "id": "rule-uuid",
    "name": "Bônus fim de semana",
    "type": "FIXED",
    "value": 15.00,
    "condition": "WEEKEND_COMPLETION",
    "active": true,
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

---

### PATCH /commission-rules/:id

Atualiza regra de comissão.

**Request:**
```json
{
  "value": 20.00,
  "active": true
}
```

**Response (200):**
```json
{
  "data": {
    "id": "rule-uuid",
    "value": 20.00,
    "active": true,
    "updatedAt": "2024-01-15T11:00:00Z"
  }
}
```

---

## Status de Comissão

| Status | Descrição |
|--------|-----------|
| `PENDING` | Aguardando liberação |
| `AVAILABLE` | Disponível para pagamento |
| `PROCESSING` | Em processamento |
| `PAID` | Paga |
| `CANCELLED` | Cancelada |

---

## Tipos de Regra

| Tipo | Descrição |
|------|-----------|
| `PERCENTAGE` | Percentual sobre valor |
| `FIXED` | Valor fixo |
| `TIERED` | Escalonada por faixa |

---

## Condições de Bônus

| Condição | Descrição |
|----------|-----------|
| `COMPLETION_UNDER_24H` | Finalizado em até 24h |
| `COMPLETION_UNDER_48H` | Finalizado em até 48h |
| `WEEKEND_COMPLETION` | Finalizado no fim de semana |
| `CUSTOMER_RATING_5` | Avaliação 5 estrelas |
| `NO_REWORK` | Sem retorno por retrabalho |

---

**Voltar para** [API](./README.md)
