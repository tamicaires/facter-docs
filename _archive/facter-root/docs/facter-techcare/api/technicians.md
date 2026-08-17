# API - Technicians (Técnicos)

> **Endpoints para gestão de técnicos.**

---

## Endpoints

### Listar Técnicos

```http
GET /technicians
```

**Query Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| specialty | string | Filtrar por especialidade |
| available | boolean | Apenas disponíveis |
| status | string | ACTIVE, INACTIVE |

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Carlos Técnico",
      "email": "carlos@empresa.com",
      "avatar": "https://...",
      "specialties": ["SMARTPHONE", "TABLET"],
      "status": "ACTIVE",
      "stats": {
        "activeOrders": 5,
        "completedToday": 3,
        "avgRating": 4.8
      }
    }
  ]
}
```

---

### Buscar Técnico

```http
GET /technicians/:id
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "name": "Carlos Técnico",
    "email": "carlos@empresa.com",
    "phone": "(11) 98888-8888",
    "avatar": "https://...",
    "specialties": ["SMARTPHONE", "TABLET"],
    "availability": {
      "monday": { "start": "08:00", "end": "18:00" },
      "tuesday": { "start": "08:00", "end": "18:00" }
    },
    "status": "ACTIVE",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### OS do Técnico

```http
GET /technicians/:id/orders
```

**Query Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| status | string | Filtrar por status da OS |
| startDate | date | Data inicial |
| endDate | date | Data final |

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "number": "OS-202501-00001",
      "status": "IN_PROGRESS",
      "customer": { "name": "João Silva" },
      "equipment": { "brand": "Apple", "model": "iPhone 13" },
      "priority": "NORMAL",
      "createdAt": "2025-01-10T00:00:00Z"
    }
  ],
  "meta": { "total": 25 }
}
```

---

### Métricas de Performance

```http
GET /technicians/:id/performance
```

**Query Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| period | string | today, week, month, year |
| startDate | date | Data inicial (custom) |
| endDate | date | Data final (custom) |

**Response:**
```json
{
  "data": {
    "period": {
      "start": "2025-01-01",
      "end": "2025-01-31"
    },
    "orders": {
      "received": 45,
      "completed": 42,
      "pending": 3,
      "completionRate": 93.3
    },
    "time": {
      "avgDiagnosis": "2h 15min",
      "avgRepair": "4h 30min",
      "avgTotal": "6h 45min",
      "slaCompliance": 91.5
    },
    "quality": {
      "warrantyReturns": 2,
      "returnRate": 4.4,
      "avgRating": 4.8,
      "totalReviews": 38
    },
    "financial": {
      "totalRevenue": 12500.00,
      "avgTicket": 297.62,
      "commission": {
        "earned": 3750.00,
        "paid": 3000.00,
        "pending": 750.00
      }
    },
    "byEquipmentType": [
      { "type": "SMARTPHONE", "count": 35, "percentage": 77.8 },
      { "type": "TABLET", "count": 7, "percentage": 15.6 },
      { "type": "NOTEBOOK", "count": 3, "percentage": 6.6 }
    ]
  }
}
```

---

### Disponibilidade

```http
GET /technicians/:id/availability
```

**Query Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| date | date | Data específica |

**Response:**
```json
{
  "data": {
    "date": "2025-01-15",
    "schedule": {
      "start": "08:00",
      "end": "18:00",
      "breaks": [{ "start": "12:00", "end": "13:00" }]
    },
    "appointments": [
      { "time": "09:00", "duration": 60, "type": "TECHNICAL_VISIT" }
    ],
    "activeOrders": 3,
    "capacity": "AVAILABLE"
  }
}
```

---

### Bloquear Horário

```http
POST /technicians/:id/block
```

**Request Body:**
```json
{
  "date": "2025-01-20",
  "startTime": "08:00",
  "endTime": "18:00",
  "reason": "Férias"
}
```

---

### Ranking de Técnicos

```http
GET /technicians/ranking
```

**Query Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| period | string | month, quarter, year |
| metric | string | orders, revenue, rating |

**Response:**
```json
{
  "data": [
    {
      "position": 1,
      "technician": { "id": "uuid", "name": "Carlos" },
      "ordersCompleted": 45,
      "revenue": 15000.00,
      "avgRating": 4.9,
      "returnRate": 2.2
    },
    {
      "position": 2,
      "technician": { "id": "uuid", "name": "Ana" },
      "ordersCompleted": 42,
      "revenue": 14200.00,
      "avgRating": 4.8,
      "returnRate": 3.5
    }
  ]
}
```

---

### Comissões do Técnico

```http
GET /technicians/:id/commissions
```

**Query Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| status | string | PENDING, AVAILABLE, PAID |
| startDate | date | Data inicial |
| endDate | date | Data final |

**Response:**
```json
{
  "data": {
    "summary": {
      "available": 1500.00,
      "pending": 350.00,
      "paidThisMonth": 3000.00
    },
    "entries": [
      {
        "id": "uuid",
        "serviceOrder": { "number": "OS-202501-00001" },
        "orderValue": 350.00,
        "commissionRate": 30,
        "commissionValue": 105.00,
        "status": "AVAILABLE",
        "createdAt": "2025-01-14T00:00:00Z"
      }
    ]
  }
}
```

---

## Permissões

| Endpoint | Permissão |
|----------|-----------|
| GET /technicians | `read:Technician` |
| GET /technicians/:id | `read:Technician` |
| GET /technicians/:id/orders | `read:Technician` |
| GET /technicians/:id/performance | `read:Technician` (próprio) ou Manager+ |
| GET /technicians/:id/commissions | `read:Commission` (próprio) ou Manager+ |
| POST /technicians/:id/block | `update:Technician` (próprio) ou Manager+ |

---

**Voltar para** [API](./README.md)
