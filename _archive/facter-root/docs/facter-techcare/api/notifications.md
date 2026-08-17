# API - Notificações

> **Endpoints para gestão de notificações e preferências.**

---

## Endpoints

### GET /notifications

Lista notificações do usuário.

**Query Parameters:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| `page` | number | Página (default: 1) |
| `perPage` | number | Itens por página (default: 20) |
| `read` | boolean | Filtrar por lidas/não lidas |
| `type` | string | Tipo de notificação |

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "type": "OS_STATUS_CHANGED",
      "title": "OS Finalizada",
      "message": "A ordem de serviço OS-202501-00001 foi finalizada",
      "data": {
        "serviceOrderId": "order-uuid",
        "serviceOrderNumber": "OS-202501-00001",
        "newStatus": "COMPLETED"
      },
      "read": false,
      "readAt": null,
      "createdAt": "2024-01-15T16:00:00Z"
    }
  ],
  "meta": {
    "total": 45,
    "page": 1,
    "perPage": 20,
    "totalPages": 3,
    "unreadCount": 12
  }
}
```

---

### GET /notifications/unread-count

Retorna contagem de não lidas.

**Response (200):**
```json
{
  "data": {
    "count": 12
  }
}
```

---

### PATCH /notifications/:id/read

Marca notificação como lida.

**Response (200):**
```json
{
  "data": {
    "id": "uuid",
    "read": true,
    "readAt": "2024-01-15T16:30:00Z"
  }
}
```

---

### POST /notifications/read-all

Marca todas como lidas.

**Response (200):**
```json
{
  "data": {
    "marked": 12
  }
}
```

---

### DELETE /notifications/:id

Remove notificação.

**Response (204):** No Content

---

### DELETE /notifications

Remove notificações em lote.

**Request:**
```json
{
  "ids": ["uuid-1", "uuid-2"],
  "olderThan": "2024-01-01"
}
```

**Response (200):**
```json
{
  "data": {
    "deleted": 25
  }
}
```

---

### GET /notifications/preferences

Retorna preferências de notificação.

**Response (200):**
```json
{
  "data": {
    "email": {
      "enabled": true,
      "categories": {
        "os_updates": true,
        "payment_received": true,
        "warranty_expiring": true,
        "system_alerts": true,
        "marketing": false
      }
    },
    "push": {
      "enabled": true,
      "categories": {
        "os_updates": true,
        "payment_received": true,
        "warranty_expiring": false,
        "system_alerts": true
      }
    },
    "whatsapp": {
      "enabled": true,
      "categories": {
        "os_updates": true,
        "payment_received": false
      }
    },
    "inApp": {
      "enabled": true,
      "sound": true
    },
    "quietHours": {
      "enabled": true,
      "start": "22:00",
      "end": "08:00"
    }
  }
}
```

---

### PATCH /notifications/preferences

Atualiza preferências.

**Request:**
```json
{
  "email": {
    "categories": {
      "marketing": true
    }
  },
  "quietHours": {
    "enabled": false
  }
}
```

**Response (200):**
```json
{
  "data": {
    "updated": true
  }
}
```

---

### POST /notifications/test

Envia notificação de teste.

**Request:**
```json
{
  "channel": "email",
  "type": "os_updates"
}
```

**Response (200):**
```json
{
  "data": {
    "sent": true,
    "channel": "email",
    "sentTo": "usuario@email.com"
  }
}
```

---

### POST /notifications/send

Envia notificação (admin).

**Request:**
```json
{
  "recipientType": "CUSTOMER",
  "recipientId": "customer-uuid",
  "template": "os_ready_for_pickup",
  "data": {
    "serviceOrderNumber": "OS-202501-00001",
    "total": "R$ 450,00"
  },
  "channels": ["whatsapp", "email"]
}
```

**Response (200):**
```json
{
  "data": {
    "sent": true,
    "results": {
      "whatsapp": "sent",
      "email": "sent"
    }
  }
}
```

---

### GET /notifications/templates

Lista templates disponíveis.

**Response (200):**
```json
{
  "data": [
    {
      "key": "os_created",
      "name": "OS Criada",
      "channels": ["email", "whatsapp"],
      "variables": ["customerName", "serviceOrderNumber", "equipmentDescription"]
    },
    {
      "key": "os_ready_for_pickup",
      "name": "OS Pronta para Retirada",
      "channels": ["email", "whatsapp", "sms"],
      "variables": ["customerName", "serviceOrderNumber", "total"]
    },
    {
      "key": "quote_sent",
      "name": "Orçamento Enviado",
      "channels": ["email", "whatsapp"],
      "variables": ["customerName", "quoteNumber", "total", "approvalLink"]
    }
  ]
}
```

---

## Tipos de Notificação

| Tipo | Descrição |
|------|-----------|
| `OS_CREATED` | OS criada |
| `OS_STATUS_CHANGED` | Status da OS alterado |
| `OS_ASSIGNED` | OS atribuída a técnico |
| `QUOTE_SENT` | Orçamento enviado |
| `QUOTE_APPROVED` | Orçamento aprovado |
| `QUOTE_REJECTED` | Orçamento rejeitado |
| `PAYMENT_RECEIVED` | Pagamento recebido |
| `WARRANTY_EXPIRING` | Garantia expirando |
| `APPOINTMENT_REMINDER` | Lembrete de agendamento |
| `STOCK_LOW` | Estoque baixo |
| `SYSTEM_ALERT` | Alerta do sistema |

---

## Canais

| Canal | Descrição |
|-------|-----------|
| `EMAIL` | Email |
| `WHATSAPP` | WhatsApp |
| `SMS` | SMS |
| `PUSH` | Push notification |
| `IN_APP` | Notificação no app |

---

**Voltar para** [API](./README.md)
