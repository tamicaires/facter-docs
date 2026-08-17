# API - Quotes (Orçamentos)

> **Endpoints para gestão de orçamentos.**

---

## Endpoints

### Listar Orçamentos

```http
GET /quotes
```

**Query Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| page | number | Página |
| perPage | number | Itens por página |
| status | string | PENDING, APPROVED, REJECTED, EXPIRED |
| serviceOrderId | string | Filtrar por OS |

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "serviceOrder": {
        "id": "uuid",
        "number": "OS-202501-00001"
      },
      "customer": {
        "id": "uuid",
        "name": "João Silva"
      },
      "total": 350.00,
      "status": "PENDING",
      "validUntil": "2025-01-20T00:00:00Z",
      "createdAt": "2025-01-13T00:00:00Z"
    }
  ],
  "meta": { "total": 50 }
}
```

---

### Buscar Orçamento

```http
GET /quotes/:id
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "serviceOrderId": "uuid",
    "serviceOrder": {
      "number": "OS-202501-00001",
      "customer": { "name": "João Silva" },
      "equipment": { "brand": "Apple", "model": "iPhone 13" }
    },
    "items": [
      {
        "id": "uuid",
        "type": "SERVICE",
        "description": "Troca de tela",
        "quantity": 1,
        "unitPrice": 150.00,
        "total": 150.00,
        "warrantyDays": 90
      },
      {
        "id": "uuid",
        "type": "PART",
        "description": "Tela iPhone 13 Original",
        "partId": "uuid",
        "quantity": 1,
        "unitPrice": 200.00,
        "total": 200.00,
        "warrantyDays": 90
      }
    ],
    "subtotal": 350.00,
    "discount": 0,
    "discountType": "FIXED",
    "total": 350.00,
    "validUntil": "2025-01-20T00:00:00Z",
    "status": "PENDING",
    "notes": "Peça original do fabricante",
    "createdBy": { "name": "Maria Atendente" },
    "createdAt": "2025-01-13T00:00:00Z"
  }
}
```

---

### Criar Orçamento

```http
POST /quotes
```

**Request Body:**
```json
{
  "serviceOrderId": "uuid",
  "items": [
    {
      "type": "SERVICE",
      "description": "Troca de tela",
      "quantity": 1,
      "unitPrice": 150.00,
      "warrantyDays": 90
    },
    {
      "type": "PART",
      "description": "Tela iPhone 13",
      "partId": "uuid",
      "quantity": 1,
      "unitPrice": 200.00,
      "warrantyDays": 90
    }
  ],
  "discount": 10,
  "discountType": "PERCENTAGE",
  "validityDays": 7,
  "notes": "Peça original"
}
```

**Response:** `201 Created`

---

### Atualizar Orçamento

```http
PATCH /quotes/:id
```

> Apenas orçamentos com status `DRAFT` ou `PENDING` podem ser editados.

---

### Enviar para Cliente

```http
POST /quotes/:id/send
```

**Request Body:**
```json
{
  "channel": "WHATSAPP",
  "message": "Segue orçamento para aprovação"
}
```

Envia notificação com link de aprovação.

---

### Aprovar Orçamento

```http
POST /quotes/:id/approve
```

**Request Body:**
```json
{
  "token": "abc123",
  "signature": "base64..."
}
```

> Endpoint público - usado pelo cliente via link de aprovação.

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "status": "APPROVED",
    "approvedAt": "2025-01-14T10:00:00Z"
  }
}
```

---

### Rejeitar Orçamento

```http
POST /quotes/:id/reject
```

**Request Body:**
```json
{
  "token": "abc123",
  "reason": "Valor muito alto"
}
```

---

### Gerar PDF

```http
GET /quotes/:id/pdf
```

**Response:** `application/pdf`

---

### Calcular Parcelas

```http
GET /quotes/:id/installments
```

**Response:**
```json
{
  "data": [
    { "installments": 1, "value": 350.00, "total": 350.00, "fees": 0 },
    { "installments": 2, "value": 182.00, "total": 364.00, "fees": 14.00 },
    { "installments": 3, "value": 123.67, "total": 371.00, "fees": 21.00 }
  ]
}
```

---

## Fluxo de Status

```
DRAFT ──▶ PENDING ──▶ APPROVED ──▶ (OS continua)
              │
              ├──▶ REJECTED
              │
              └──▶ EXPIRED (automático)
```

---

## Permissões

| Endpoint | Permissão |
|----------|-----------|
| GET /quotes | `read:Quote` |
| POST /quotes | `create:Quote` |
| PATCH /quotes/:id | `update:Quote` |
| POST /quotes/:id/send | `update:Quote` |
| POST /quotes/:id/approve | Público (com token) |
| POST /quotes/:id/reject | Público (com token) |

---

**Voltar para** [API](./README.md)
