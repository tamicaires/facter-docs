# API - Agendamentos

> **Endpoints para gestão de agenda e agendamentos.**

---

## Endpoints

### GET /appointments

Lista agendamentos com filtros.

**Query Parameters:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| `page` | number | Página (default: 1) |
| `perPage` | number | Itens por página (default: 20) |
| `startDate` | date | Data inicial |
| `endDate` | date | Data final |
| `technicianId` | uuid | Filtrar por técnico |
| `customerId` | uuid | Filtrar por cliente |
| `type` | string | Tipo de agendamento |
| `status` | string | Status |

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "type": "PICKUP",
      "customerId": "customer-uuid",
      "customerName": "João Silva",
      "customerPhone": "+5511999999999",
      "technicianId": "tech-uuid",
      "technicianName": "Carlos Técnico",
      "scheduledAt": "2024-01-20T14:00:00Z",
      "estimatedDuration": 30,
      "status": "SCHEDULED",
      "address": {
        "street": "Rua das Flores, 123",
        "neighborhood": "Centro",
        "city": "São Paulo",
        "state": "SP",
        "zipCode": "01234-567"
      },
      "notes": "Cliente pede para ligar antes",
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "meta": {
    "total": 35,
    "page": 1,
    "perPage": 20,
    "totalPages": 2
  }
}
```

---

### GET /appointments/calendar

Retorna agendamentos em formato de calendário.

**Query Parameters:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| `month` | number | Mês (1-12) |
| `year` | number | Ano |
| `technicianId` | uuid | Filtrar por técnico |

**Response (200):**
```json
{
  "data": {
    "month": 1,
    "year": 2024,
    "days": [
      {
        "date": "2024-01-20",
        "appointments": [
          {
            "id": "uuid",
            "time": "14:00",
            "type": "PICKUP",
            "customerName": "João Silva",
            "status": "SCHEDULED"
          },
          {
            "id": "uuid2",
            "time": "16:00",
            "type": "DELIVERY",
            "customerName": "Maria Santos",
            "status": "SCHEDULED"
          }
        ]
      }
    ],
    "summary": {
      "total": 25,
      "byType": {
        "PICKUP": 10,
        "DELIVERY": 8,
        "TECHNICAL_VISIT": 5,
        "RETURN": 2
      }
    }
  }
}
```

---

### GET /appointments/:id

Retorna detalhes do agendamento.

**Response (200):**
```json
{
  "data": {
    "id": "uuid",
    "type": "PICKUP",
    "customerId": "customer-uuid",
    "customer": {
      "id": "customer-uuid",
      "name": "João Silva",
      "phone": "+5511999999999",
      "email": "joao@email.com"
    },
    "equipmentId": "equipment-uuid",
    "equipment": {
      "id": "equipment-uuid",
      "type": "NOTEBOOK",
      "brand": "Dell",
      "model": "Inspiron 15"
    },
    "serviceOrderId": null,
    "technicianId": "tech-uuid",
    "technician": {
      "id": "tech-uuid",
      "name": "Carlos Técnico",
      "phone": "+5511888888888"
    },
    "scheduledAt": "2024-01-20T14:00:00Z",
    "estimatedDuration": 30,
    "status": "SCHEDULED",
    "address": {
      "street": "Rua das Flores, 123",
      "complement": "Apto 45",
      "neighborhood": "Centro",
      "city": "São Paulo",
      "state": "SP",
      "zipCode": "01234-567",
      "coordinates": {
        "lat": -23.550520,
        "lng": -46.633308
      }
    },
    "notes": "Cliente pede para ligar antes",
    "internalNotes": "Endereço difícil acesso",
    "reminderSent": true,
    "reminderSentAt": "2024-01-19T10:00:00Z",
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
}
```

---

### POST /appointments

Cria novo agendamento.

**Request:**
```json
{
  "type": "PICKUP",
  "customerId": "customer-uuid",
  "equipmentId": "equipment-uuid",
  "technicianId": "tech-uuid",
  "scheduledAt": "2024-01-20T14:00:00Z",
  "estimatedDuration": 30,
  "address": {
    "street": "Rua das Flores, 123",
    "complement": "Apto 45",
    "neighborhood": "Centro",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01234-567"
  },
  "notes": "Cliente pede para ligar antes",
  "sendReminder": true
}
```

**Response (201):**
```json
{
  "data": {
    "id": "uuid",
    "type": "PICKUP",
    "scheduledAt": "2024-01-20T14:00:00Z",
    "status": "SCHEDULED",
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

---

### PATCH /appointments/:id

Atualiza agendamento.

**Request:**
```json
{
  "scheduledAt": "2024-01-21T10:00:00Z",
  "technicianId": "another-tech-uuid",
  "notes": "Remarcado a pedido do cliente"
}
```

**Response (200):**
```json
{
  "data": {
    "id": "uuid",
    "scheduledAt": "2024-01-21T10:00:00Z",
    "status": "RESCHEDULED",
    "updatedAt": "2024-01-16T09:00:00Z"
  }
}
```

---

### DELETE /appointments/:id

Cancela agendamento.

**Request:**
```json
{
  "reason": "Cliente cancelou",
  "notifyCustomer": true
}
```

**Response (204):** No Content

---

### PATCH /appointments/:id/status

Atualiza status do agendamento.

**Request:**
```json
{
  "status": "IN_PROGRESS",
  "notes": "Técnico a caminho"
}
```

**Response (200):**
```json
{
  "data": {
    "id": "uuid",
    "status": "IN_PROGRESS",
    "statusHistory": [
      {
        "status": "SCHEDULED",
        "changedAt": "2024-01-15T10:00:00Z"
      },
      {
        "status": "IN_PROGRESS",
        "changedAt": "2024-01-20T13:45:00Z",
        "notes": "Técnico a caminho"
      }
    ]
  }
}
```

---

### POST /appointments/:id/complete

Finaliza agendamento.

**Request:**
```json
{
  "outcome": "SUCCESS",
  "notes": "Equipamento coletado com sucesso",
  "createServiceOrder": true,
  "serviceOrderData": {
    "priority": "NORMAL",
    "reportedIssue": "Tela quebrada"
  }
}
```

**Response (200):**
```json
{
  "data": {
    "appointment": {
      "id": "uuid",
      "status": "COMPLETED",
      "completedAt": "2024-01-20T14:30:00Z"
    },
    "serviceOrder": {
      "id": "new-order-uuid",
      "number": "OS-202501-00025"
    }
  }
}
```

---

### GET /appointments/availability

Verifica disponibilidade para agendamento.

**Query Parameters:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| `date` | date | Data desejada |
| `technicianId` | uuid | Técnico específico |
| `duration` | number | Duração em minutos |

**Response (200):**
```json
{
  "data": {
    "date": "2024-01-20",
    "slots": [
      {
        "time": "08:00",
        "available": true,
        "technicians": ["tech-uuid-1", "tech-uuid-2"]
      },
      {
        "time": "09:00",
        "available": true,
        "technicians": ["tech-uuid-1"]
      },
      {
        "time": "10:00",
        "available": false,
        "technicians": []
      }
    ]
  }
}
```

---

### POST /appointments/:id/notify

Envia notificação/lembrete ao cliente.

**Request:**
```json
{
  "type": "REMINDER",
  "channels": ["whatsapp", "email"]
}
```

**Response (200):**
```json
{
  "data": {
    "sent": true,
    "channels": {
      "whatsapp": "sent",
      "email": "sent"
    }
  }
}
```

---

## Tipos de Agendamento

| Tipo | Descrição |
|------|-----------|
| `PICKUP` | Buscar equipamento |
| `DELIVERY` | Entregar equipamento |
| `TECHNICAL_VISIT` | Visita técnica |
| `RETURN` | Devolução (garantia) |
| `INSTALLATION` | Instalação |
| `MAINTENANCE` | Manutenção preventiva |

---

## Status de Agendamento

| Status | Descrição |
|--------|-----------|
| `SCHEDULED` | Agendado |
| `CONFIRMED` | Confirmado pelo cliente |
| `RESCHEDULED` | Reagendado |
| `IN_PROGRESS` | Em andamento |
| `COMPLETED` | Concluído |
| `CANCELLED` | Cancelado |
| `NO_SHOW` | Cliente ausente |

---

## Configurações de Agenda

- **Horário de funcionamento**: Configurável por empresa
- **Duração padrão**: 30 minutos
- **Intervalo entre agendamentos**: 15 minutos
- **Lembretes automáticos**: 24h e 2h antes

---

**Voltar para** [API](./README.md)
