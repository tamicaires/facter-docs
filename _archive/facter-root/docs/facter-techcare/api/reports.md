# API - Relatórios

> **Endpoints para geração de relatórios e exportações.**

---

## Endpoints

### GET /reports/service-orders

Relatório de ordens de serviço.

**Query Parameters:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| `startDate` | date | Data inicial (obrigatório) |
| `endDate` | date | Data final (obrigatório) |
| `status` | string | Filtrar por status |
| `technicianId` | uuid | Filtrar por técnico |
| `groupBy` | string | Agrupar por: `day`, `week`, `month`, `technician`, `status` |
| `format` | string | `json`, `csv`, `pdf` (default: json) |

**Response (200):**
```json
{
  "data": {
    "period": {
      "start": "2024-01-01",
      "end": "2024-01-31"
    },
    "summary": {
      "total": 125,
      "completed": 98,
      "inProgress": 20,
      "cancelled": 7,
      "averageCompletionTime": 48.5,
      "totalRevenue": 45750.00
    },
    "byStatus": [
      { "status": "COMPLETED", "count": 98, "percentage": 78.4 },
      { "status": "IN_PROGRESS", "count": 20, "percentage": 16.0 },
      { "status": "CANCELLED", "count": 7, "percentage": 5.6 }
    ],
    "byTechnician": [
      {
        "technicianId": "tech-uuid",
        "technicianName": "Carlos",
        "completed": 45,
        "avgTime": 36.2,
        "revenue": 18500.00
      }
    ],
    "byDay": [
      { "date": "2024-01-01", "created": 5, "completed": 3 },
      { "date": "2024-01-02", "created": 8, "completed": 6 }
    ]
  }
}
```

---

### GET /reports/revenue

Relatório financeiro.

**Query Parameters:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| `startDate` | date | Data inicial |
| `endDate` | date | Data final |
| `groupBy` | string | `day`, `week`, `month` |
| `format` | string | `json`, `csv`, `pdf` |

**Response (200):**
```json
{
  "data": {
    "period": {
      "start": "2024-01-01",
      "end": "2024-01-31"
    },
    "summary": {
      "grossRevenue": 52500.00,
      "discounts": 2100.00,
      "refunds": 850.00,
      "netRevenue": 49550.00,
      "partsRevenue": 15500.00,
      "servicesRevenue": 34050.00,
      "averageTicket": 395.60,
      "ordersCount": 125
    },
    "byPaymentMethod": [
      { "method": "PIX", "amount": 28500.00, "count": 85, "percentage": 57.5 },
      { "method": "CREDIT_CARD", "amount": 15000.00, "count": 35, "percentage": 30.3 },
      { "method": "CASH", "amount": 6050.00, "count": 25, "percentage": 12.2 }
    ],
    "byCategory": [
      { "category": "Smartphones", "revenue": 32000.00, "count": 80 },
      { "category": "Notebooks", "revenue": 12500.00, "count": 30 },
      { "category": "Outros", "revenue": 5050.00, "count": 15 }
    ],
    "trend": [
      { "date": "2024-01-01", "revenue": 1250.00, "orders": 5 },
      { "date": "2024-01-02", "revenue": 2100.00, "orders": 8 }
    ],
    "comparison": {
      "previousPeriod": {
        "revenue": 42000.00,
        "variation": 17.98,
        "variationType": "increase"
      }
    }
  }
}
```

---

### GET /reports/technicians

Relatório de performance dos técnicos.

**Query Parameters:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| `startDate` | date | Data inicial |
| `endDate` | date | Data final |
| `technicianId` | uuid | Técnico específico |
| `format` | string | `json`, `csv`, `pdf` |

**Response (200):**
```json
{
  "data": {
    "period": {
      "start": "2024-01-01",
      "end": "2024-01-31"
    },
    "technicians": [
      {
        "id": "tech-uuid",
        "name": "Carlos Técnico",
        "metrics": {
          "ordersCompleted": 45,
          "ordersInProgress": 5,
          "averageCompletionTime": 36.2,
          "onTimeDelivery": 93.3,
          "reworkRate": 2.2,
          "customerRating": 4.8,
          "revenue": 18500.00,
          "commission": 2775.00
        },
        "specialties": [
          { "type": "SMARTPHONE", "count": 30, "avgTime": 28.5 },
          { "type": "NOTEBOOK", "count": 15, "avgTime": 52.0 }
        ],
        "timeline": [
          { "week": 1, "completed": 10, "avgTime": 34.0 },
          { "week": 2, "completed": 12, "avgTime": 36.5 }
        ]
      }
    ],
    "ranking": [
      { "position": 1, "name": "Carlos", "score": 95.2 },
      { "position": 2, "name": "Ana", "score": 92.8 },
      { "position": 3, "name": "Pedro", "score": 88.5 }
    ]
  }
}
```

---

### GET /reports/stock

Relatório de estoque.

**Query Parameters:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| `startDate` | date | Data inicial |
| `endDate` | date | Data final |
| `category` | string | Categoria |
| `lowStock` | boolean | Apenas itens com estoque baixo |
| `format` | string | `json`, `csv`, `pdf` |

**Response (200):**
```json
{
  "data": {
    "summary": {
      "totalItems": 250,
      "totalValue": 125000.00,
      "lowStockItems": 15,
      "outOfStockItems": 3,
      "entriesValue": 35000.00,
      "exitsValue": 28000.00
    },
    "topSelling": [
      {
        "partId": "part-uuid",
        "name": "Tela iPhone 14",
        "sold": 25,
        "revenue": 7500.00
      }
    ],
    "lowStock": [
      {
        "partId": "part-uuid",
        "name": "Bateria Samsung S21",
        "currentStock": 3,
        "minStock": 10,
        "supplier": "Fornecedor X"
      }
    ],
    "movements": {
      "entries": 85,
      "exits": 120,
      "adjustments": 5
    },
    "byCategory": [
      { "category": "Telas", "items": 50, "value": 45000.00 },
      { "category": "Baterias", "items": 80, "value": 32000.00 }
    ],
    "turnover": [
      {
        "partId": "part-uuid",
        "name": "Tela iPhone 14",
        "turnoverRate": 4.5,
        "daysToSell": 8
      }
    ]
  }
}
```

---

### GET /reports/customers

Relatório de clientes.

**Query Parameters:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| `startDate` | date | Data inicial |
| `endDate` | date | Data final |
| `segment` | string | Segmento |
| `format` | string | `json`, `csv`, `pdf` |

**Response (200):**
```json
{
  "data": {
    "summary": {
      "totalCustomers": 450,
      "newCustomers": 35,
      "returningCustomers": 85,
      "averageTicket": 385.00,
      "averageOrdersPerCustomer": 1.8
    },
    "acquisition": [
      { "date": "2024-01-01", "new": 5 },
      { "date": "2024-01-02", "new": 3 }
    ],
    "topCustomers": [
      {
        "customerId": "customer-uuid",
        "name": "João Silva",
        "orders": 8,
        "totalSpent": 3200.00,
        "lastVisit": "2024-01-15"
      }
    ],
    "retention": {
      "rate": 42.5,
      "firstTimeOnly": 57.5,
      "returning2to5": 35.0,
      "returning5plus": 7.5
    },
    "bySource": [
      { "source": "Indicação", "count": 150, "percentage": 33.3 },
      { "source": "Google", "count": 120, "percentage": 26.7 },
      { "source": "Instagram", "count": 80, "percentage": 17.8 }
    ]
  }
}
```

---

### GET /reports/warranties

Relatório de garantias.

**Query Parameters:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| `startDate` | date | Data inicial |
| `endDate` | date | Data final |
| `format` | string | `json`, `csv`, `pdf` |

**Response (200):**
```json
{
  "data": {
    "summary": {
      "issued": 98,
      "active": 85,
      "expired": 150,
      "claimed": 12,
      "claimRate": 8.0
    },
    "claims": {
      "total": 12,
      "approved": 10,
      "rejected": 2,
      "avgResolutionTime": 48.5
    },
    "byTechnician": [
      {
        "technicianId": "tech-uuid",
        "name": "Carlos",
        "warranties": 45,
        "claims": 3,
        "claimRate": 6.7
      }
    ],
    "byService": [
      { "service": "Troca de tela", "warranties": 50, "claims": 5 },
      { "service": "Troca de bateria", "warranties": 30, "claims": 2 }
    ],
    "expiringSoon": 15
  }
}
```

---

### POST /reports/export

Agenda exportação de relatório.

**Request:**
```json
{
  "type": "service-orders",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "format": "xlsx",
  "email": "admin@techfix.com"
}
```

**Response (202):**
```json
{
  "data": {
    "exportId": "export-uuid",
    "status": "PROCESSING",
    "estimatedTime": 60
  }
}
```

---

### GET /reports/exports/:id

Verifica status da exportação.

**Response (200):**
```json
{
  "data": {
    "exportId": "export-uuid",
    "status": "COMPLETED",
    "downloadUrl": "https://storage.../report.xlsx",
    "expiresAt": "2024-01-22T10:00:00Z"
  }
}
```

---

### GET /reports/scheduled

Lista relatórios agendados.

**Response (200):**
```json
{
  "data": [
    {
      "id": "schedule-uuid",
      "name": "Relatório Mensal de Faturamento",
      "type": "revenue",
      "frequency": "MONTHLY",
      "format": "pdf",
      "recipients": ["admin@techfix.com"],
      "nextRun": "2024-02-01T08:00:00Z",
      "active": true
    }
  ]
}
```

---

### POST /reports/scheduled

Cria relatório agendado.

**Request:**
```json
{
  "name": "Relatório Semanal de OS",
  "type": "service-orders",
  "frequency": "WEEKLY",
  "dayOfWeek": 1,
  "format": "pdf",
  "recipients": ["gerente@techfix.com"]
}
```

**Response (201):**
```json
{
  "data": {
    "id": "schedule-uuid",
    "name": "Relatório Semanal de OS",
    "nextRun": "2024-01-22T08:00:00Z"
  }
}
```

---

## Formatos de Exportação

| Formato | Descrição |
|---------|-----------|
| `json` | JSON (padrão) |
| `csv` | CSV |
| `xlsx` | Excel |
| `pdf` | PDF |

---

## Frequências de Agendamento

| Frequência | Descrição |
|------------|-----------|
| `DAILY` | Diário |
| `WEEKLY` | Semanal |
| `MONTHLY` | Mensal |
| `QUARTERLY` | Trimestral |

---

**Voltar para** [API](./README.md)
