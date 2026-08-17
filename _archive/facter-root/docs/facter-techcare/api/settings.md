# API - Configurações

> **Endpoints para configurações do sistema e empresa.**

---

## Endpoints

### GET /settings

Retorna configurações da empresa.

**Response (200):**
```json
{
  "data": {
    "company": {
      "id": "uuid",
      "name": "TechFix LTDA",
      "tradeName": "TechFix Assistência",
      "document": "12.345.678/0001-90",
      "documentType": "CNPJ",
      "email": "contato@techfix.com.br",
      "phone": "+5511999999999",
      "whatsapp": "+5511999999999",
      "website": "https://techfix.com.br",
      "logo": "https://storage.../logo.png",
      "address": {
        "street": "Rua das Flores, 123",
        "number": "123",
        "complement": "Sala 1",
        "neighborhood": "Centro",
        "city": "São Paulo",
        "state": "SP",
        "zipCode": "01234-567"
      }
    },
    "subscription": {
      "plan": "professional",
      "status": "ACTIVE",
      "currentPeriodEnd": "2024-02-15"
    }
  }
}
```

---

### PATCH /settings/company

Atualiza dados da empresa.

**Request:**
```json
{
  "tradeName": "TechFix Assistência Técnica",
  "phone": "+5511988888888",
  "address": {
    "complement": "Sala 2"
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

### POST /settings/logo

Upload do logo da empresa.

**Request:** `multipart/form-data`
```
logo: File (max 2MB, png/jpg)
```

**Response (200):**
```json
{
  "data": {
    "logoUrl": "https://storage.../logo-new.png"
  }
}
```

---

### GET /settings/modules

Retorna configurações por módulo.

**Response (200):**
```json
{
  "data": {
    "serviceOrders": {
      "autoNumbering": true,
      "numberPrefix": "OS",
      "numberFormat": "YYYYMM-NNNNN",
      "defaultPriority": "NORMAL",
      "requireDiagnosis": true,
      "requireQuoteApproval": true,
      "autoCreateWarranty": true,
      "defaultWarrantyDays": 90
    },
    "quotes": {
      "validityDays": 15,
      "allowCustomerApproval": true,
      "requireManagerApproval": false,
      "managerApprovalThreshold": 1000.00
    },
    "stock": {
      "lowStockAlert": true,
      "lowStockThreshold": 5,
      "allowNegativeStock": false,
      "autoDeductOnCompletion": true
    },
    "payments": {
      "methods": ["PIX", "CASH", "CREDIT_CARD", "DEBIT_CARD"],
      "defaultMethod": "PIX",
      "allowPartialPayment": true,
      "requirePaymentOnDelivery": true
    },
    "commissions": {
      "enabled": true,
      "defaultRate": 15.00,
      "includesParts": false,
      "releaseAfterDays": 3
    },
    "notifications": {
      "osCreated": true,
      "osStatusChanged": true,
      "quoteReady": true,
      "readyForPickup": true,
      "warrantyExpiring": true,
      "channels": ["email", "whatsapp"]
    }
  }
}
```

---

### PATCH /settings/modules/:module

Atualiza configurações de um módulo.

**Request:**
```json
{
  "defaultWarrantyDays": 120,
  "requireDiagnosis": false
}
```

**Response (200):**
```json
{
  "data": {
    "updated": true,
    "module": "serviceOrders"
  }
}
```

---

### GET /settings/business-hours

Retorna horário de funcionamento.

**Response (200):**
```json
{
  "data": {
    "timezone": "America/Sao_Paulo",
    "schedule": [
      { "day": 0, "name": "Domingo", "open": false },
      { "day": 1, "name": "Segunda", "open": true, "start": "08:00", "end": "18:00", "break": { "start": "12:00", "end": "13:00" } },
      { "day": 2, "name": "Terça", "open": true, "start": "08:00", "end": "18:00", "break": { "start": "12:00", "end": "13:00" } },
      { "day": 3, "name": "Quarta", "open": true, "start": "08:00", "end": "18:00", "break": { "start": "12:00", "end": "13:00" } },
      { "day": 4, "name": "Quinta", "open": true, "start": "08:00", "end": "18:00", "break": { "start": "12:00", "end": "13:00" } },
      { "day": 5, "name": "Sexta", "open": true, "start": "08:00", "end": "18:00", "break": { "start": "12:00", "end": "13:00" } },
      { "day": 6, "name": "Sábado", "open": true, "start": "08:00", "end": "12:00" }
    ],
    "holidays": [
      { "date": "2024-01-01", "name": "Ano Novo" },
      { "date": "2024-12-25", "name": "Natal" }
    ]
  }
}
```

---

### PATCH /settings/business-hours

Atualiza horário de funcionamento.

**Request:**
```json
{
  "schedule": [
    { "day": 6, "open": false }
  ],
  "holidays": [
    { "date": "2024-02-12", "name": "Carnaval" }
  ]
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

### GET /settings/print-templates

Lista templates de impressão.

**Response (200):**
```json
{
  "data": [
    {
      "key": "service_order",
      "name": "Ordem de Serviço",
      "active": true,
      "customized": false
    },
    {
      "key": "quote",
      "name": "Orçamento",
      "active": true,
      "customized": true
    },
    {
      "key": "receipt",
      "name": "Recibo",
      "active": true,
      "customized": false
    },
    {
      "key": "warranty_certificate",
      "name": "Certificado de Garantia",
      "active": true,
      "customized": false
    },
    {
      "key": "label",
      "name": "Etiqueta",
      "active": true,
      "customized": false
    }
  ]
}
```

---

### GET /settings/print-templates/:key

Retorna template específico.

**Response (200):**
```json
{
  "data": {
    "key": "service_order",
    "name": "Ordem de Serviço",
    "html": "<html>...</html>",
    "css": ".header { ... }",
    "variables": ["companyName", "companyLogo", "serviceOrderNumber", "..."],
    "paperSize": "A4",
    "orientation": "portrait"
  }
}
```

---

### PATCH /settings/print-templates/:key

Atualiza template de impressão.

**Request:**
```json
{
  "html": "<html>...</html>",
  "css": ".header { color: #333; }"
}
```

**Response (200):**
```json
{
  "data": {
    "updated": true,
    "key": "service_order"
  }
}
```

---

### POST /settings/print-templates/:key/reset

Restaura template padrão.

**Response (200):**
```json
{
  "data": {
    "reset": true,
    "key": "service_order"
  }
}
```

---

### GET /settings/integrations

Lista integrações disponíveis.

**Response (200):**
```json
{
  "data": [
    {
      "key": "whatsapp",
      "name": "WhatsApp Business",
      "status": "CONNECTED",
      "connectedAt": "2024-01-10T10:00:00Z"
    },
    {
      "key": "email",
      "name": "Email (SMTP)",
      "status": "CONNECTED"
    },
    {
      "key": "nfe",
      "name": "Nota Fiscal Eletrônica",
      "status": "NOT_CONFIGURED"
    },
    {
      "key": "payment_gateway",
      "name": "Gateway de Pagamento",
      "status": "NOT_CONFIGURED"
    }
  ]
}
```

---

### GET /settings/integrations/:key

Retorna configuração da integração.

**Response (200):**
```json
{
  "data": {
    "key": "whatsapp",
    "name": "WhatsApp Business",
    "status": "CONNECTED",
    "config": {
      "phoneNumber": "+5511999999999",
      "businessName": "TechFix",
      "connected": true
    },
    "permissions": ["send_messages", "send_templates"]
  }
}
```

---

### PATCH /settings/integrations/:key

Atualiza configuração da integração.

**Request:**
```json
{
  "config": {
    "apiKey": "new-api-key"
  }
}
```

**Response (200):**
```json
{
  "data": {
    "updated": true,
    "status": "CONNECTED"
  }
}
```

---

### GET /settings/users

Lista usuários/membros da empresa.

**Response (200):**
```json
{
  "data": [
    {
      "membershipId": "membership-uuid",
      "userId": "user-uuid",
      "name": "João Admin",
      "email": "joao@techfix.com",
      "role": "OWNER",
      "status": "ACTIVE",
      "lastActiveAt": "2024-01-15T16:00:00Z"
    },
    {
      "membershipId": "membership-uuid-2",
      "userId": "user-uuid-2",
      "name": "Carlos Técnico",
      "email": "carlos@techfix.com",
      "role": "TECHNICIAN",
      "status": "ACTIVE",
      "lastActiveAt": "2024-01-15T15:30:00Z"
    }
  ]
}
```

---

### POST /settings/users/invite

Convida novo usuário.

**Request:**
```json
{
  "email": "novo@techfix.com",
  "name": "Novo Colaborador",
  "role": "ATTENDANT",
  "permissions": []
}
```

**Response (201):**
```json
{
  "data": {
    "inviteId": "invite-uuid",
    "email": "novo@techfix.com",
    "status": "PENDING",
    "expiresAt": "2024-01-22T10:00:00Z"
  }
}
```

---

### PATCH /settings/users/:membershipId

Atualiza membro.

**Request:**
```json
{
  "role": "MANAGER",
  "permissions": ["approve:Quote"]
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

### DELETE /settings/users/:membershipId

Remove membro da empresa.

**Response (204):** No Content

---

## Permissões

| Ação | Permissão |
|------|-----------|
| Ver configurações | `read:Settings` |
| Editar empresa | `update:Company` |
| Editar módulos | `update:Settings` |
| Gerenciar usuários | `manage:Users` |
| Gerenciar integrações | `manage:Integrations` |

---

**Voltar para** [API](./README.md)
