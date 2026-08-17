# API - Garantias

> **Endpoints para gestão de garantias de serviços.**

---

## Endpoints

### GET /warranties

Lista garantias com filtros.

**Query Parameters:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| `page` | number | Página (default: 1) |
| `perPage` | number | Itens por página (default: 20) |
| `status` | string | Status da garantia |
| `customerId` | uuid | Filtrar por cliente |
| `equipmentId` | uuid | Filtrar por equipamento |
| `expiringIn` | number | Expirando em X dias |
| `search` | string | Busca por número, cliente |

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "number": "GAR-2024-00001",
      "serviceOrderId": "order-uuid",
      "serviceOrderNumber": "OS-202501-00001",
      "customerId": "customer-uuid",
      "customerName": "João Silva",
      "equipmentId": "equipment-uuid",
      "equipmentDescription": "iPhone 14 Pro - Apple",
      "serviceDescription": "Troca de tela",
      "warrantyDays": 90,
      "status": "ACTIVE",
      "startDate": "2024-01-15",
      "expiresAt": "2024-04-15",
      "daysRemaining": 75,
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "meta": {
    "total": 120,
    "page": 1,
    "perPage": 20,
    "totalPages": 6,
    "summary": {
      "active": 95,
      "expiringSoon": 12,
      "expired": 25
    }
  }
}
```

---

### GET /warranties/:id

Retorna detalhes da garantia.

**Response (200):**
```json
{
  "data": {
    "id": "uuid",
    "number": "GAR-2024-00001",
    "serviceOrderId": "order-uuid",
    "serviceOrder": {
      "id": "order-uuid",
      "number": "OS-202501-00001",
      "completedAt": "2024-01-15T10:00:00Z"
    },
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
      "type": "SMARTPHONE",
      "brand": "Apple",
      "model": "iPhone 14 Pro",
      "serialNumber": "C39VJ..."
    },
    "services": [
      {
        "description": "Troca de tela",
        "partUsed": "Tela iPhone 14 Pro Original",
        "warrantyDays": 90
      }
    ],
    "warrantyDays": 90,
    "status": "ACTIVE",
    "startDate": "2024-01-15",
    "expiresAt": "2024-04-15",
    "daysRemaining": 75,
    "terms": "Garantia cobre defeitos de fabricação...",
    "exclusions": [
      "Danos por queda",
      "Contato com líquidos",
      "Uso indevido"
    ],
    "claims": [],
    "certificateUrl": "https://storage.../warranty-certificate.pdf",
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
}
```

---

### POST /warranties

Cria garantia manualmente.

**Request:**
```json
{
  "serviceOrderId": "order-uuid",
  "warrantyDays": 90,
  "services": [
    {
      "description": "Troca de tela",
      "partUsed": "Tela iPhone 14 Pro Original"
    }
  ],
  "terms": "Garantia personalizada...",
  "exclusions": ["Danos por queda"]
}
```

**Response (201):**
```json
{
  "data": {
    "id": "uuid",
    "number": "GAR-2024-00001",
    "status": "ACTIVE",
    "expiresAt": "2024-04-15",
    "certificateUrl": "https://storage.../warranty-certificate.pdf"
  }
}
```

---

### POST /warranties/:id/claim

Registra acionamento de garantia.

**Request:**
```json
{
  "issue": "Tela com manchas após 30 dias",
  "description": "Cliente relata manchas amareladas...",
  "photos": ["photo-url-1", "photo-url-2"]
}
```

**Response (201):**
```json
{
  "data": {
    "claimId": "claim-uuid",
    "warrantyId": "warranty-uuid",
    "status": "PENDING_ANALYSIS",
    "serviceOrderId": "new-order-uuid",
    "serviceOrderNumber": "OS-202502-00015",
    "message": "OS de garantia criada para análise"
  }
}
```

---

### PATCH /warranties/:id/claims/:claimId

Atualiza status do acionamento.

**Request:**
```json
{
  "status": "APPROVED",
  "resolution": "Troca da peça sem custo",
  "notes": "Defeito confirmado de fabricação"
}
```

**Response (200):**
```json
{
  "data": {
    "claimId": "claim-uuid",
    "status": "APPROVED",
    "resolution": "Troca da peça sem custo",
    "resolvedAt": "2024-02-20T14:00:00Z"
  }
}
```

---

### POST /warranties/:id/extend

Estende prazo da garantia.

**Request:**
```json
{
  "additionalDays": 30,
  "reason": "Compensação por atraso no serviço"
}
```

**Response (200):**
```json
{
  "data": {
    "id": "uuid",
    "previousExpiresAt": "2024-04-15",
    "newExpiresAt": "2024-05-15",
    "extensionDays": 30,
    "reason": "Compensação por atraso no serviço"
  }
}
```

---

### POST /warranties/:id/void

Anula garantia.

**Request:**
```json
{
  "reason": "Cliente violou termos de uso",
  "notes": "Equipamento aberto por terceiros"
}
```

**Response (200):**
```json
{
  "data": {
    "id": "uuid",
    "status": "VOIDED",
    "voidedAt": "2024-02-15T10:00:00Z",
    "voidReason": "Cliente violou termos de uso"
  }
}
```

---

### GET /warranties/:id/certificate

Gera certificado de garantia.

**Query Parameters:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| `format` | string | `pdf` ou `html` (default: pdf) |

**Response (200):** PDF ou HTML do certificado

---

### GET /warranties/validate/:number

Valida garantia pelo número (público).

**Response (200):**
```json
{
  "data": {
    "valid": true,
    "number": "GAR-2024-00001",
    "status": "ACTIVE",
    "customerName": "João S.",
    "equipmentDescription": "iPhone 14 Pro",
    "serviceDescription": "Troca de tela",
    "expiresAt": "2024-04-15",
    "daysRemaining": 75,
    "companyName": "TechFix LTDA",
    "companyPhone": "+5511999999999"
  }
}
```

---

### GET /warranties/expiring

Lista garantias próximas do vencimento.

**Query Parameters:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| `days` | number | Dias até vencimento (default: 30) |

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "number": "GAR-2024-00001",
      "customerName": "João Silva",
      "customerPhone": "+5511999999999",
      "equipmentDescription": "iPhone 14 Pro",
      "expiresAt": "2024-02-20",
      "daysRemaining": 5
    }
  ]
}
```

---

## Status de Garantia

| Status | Descrição |
|--------|-----------|
| `ACTIVE` | Garantia ativa |
| `EXPIRED` | Garantia expirada |
| `VOIDED` | Garantia anulada |
| `CLAIMED` | Em acionamento |

---

## Status de Acionamento

| Status | Descrição |
|--------|-----------|
| `PENDING_ANALYSIS` | Aguardando análise |
| `APPROVED` | Aprovado |
| `REJECTED` | Rejeitado |
| `COMPLETED` | Concluído |

---

## Regras de Negócio

1. **Criação automática**: Garantia criada ao finalizar OS (se configurado)
2. **Dias padrão**: Configurável por empresa (default: 90 dias)
3. **Acionamento**: Cria nova OS vinculada à garantia
4. **Notificações**: Alertas automáticos antes do vencimento

---

**Voltar para** [API](./README.md)
