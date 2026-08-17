# API: Service Orders

> **Endpoints para gestão de Ordens de Serviço.**

---

## Listar Ordens de Serviço

```http
GET /api/v1/service-orders
```

### Query Parameters

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `page` | number | Página (default: 1) |
| `perPage` | number | Itens por página (default: 20, max: 100) |
| `status` | string | Filtrar por status |
| `priority` | string | Filtrar por prioridade |
| `technicianId` | string | Filtrar por técnico |
| `customerId` | string | Filtrar por cliente |
| `search` | string | Busca (número, cliente, equipamento) |
| `dateFrom` | string | Data inicial (ISO 8601) |
| `dateTo` | string | Data final (ISO 8601) |
| `sortBy` | string | Campo para ordenação |
| `sortOrder` | string | `asc` ou `desc` |

### Response

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "number": "OS-202501-00042",
      "status": "DIAGNOSIS",
      "priority": "NORMAL",
      "customer": {
        "id": "uuid",
        "name": "João Silva",
        "phone": "(11) 99999-9999"
      },
      "equipment": {
        "id": "uuid",
        "category": "SMARTPHONE",
        "brand": "Apple",
        "model": "iPhone 13"
      },
      "technician": {
        "id": "uuid",
        "name": "Carlos Técnico"
      },
      "reportedIssue": "Tela trincada",
      "receivedAt": "2025-01-15T10:30:00Z",
      "createdAt": "2025-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "perPage": 20,
    "totalPages": 8
  }
}
```

---

## Obter Ordem de Serviço

```http
GET /api/v1/service-orders/:id
```

### Response

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "number": "OS-202501-00042",
    "status": "DIAGNOSIS",
    "priority": "NORMAL",
    "customer": {
      "id": "uuid",
      "name": "João Silva",
      "document": "123.456.789-00",
      "email": "joao@email.com",
      "phone": "(11) 99999-9999"
    },
    "equipment": {
      "id": "uuid",
      "category": "SMARTPHONE",
      "brand": "Apple",
      "model": "iPhone 13",
      "serialNumber": null,
      "imei": "123456789012345",
      "color": "Preto",
      "capacity": "128GB"
    },
    "technician": {
      "id": "uuid",
      "name": "Carlos Técnico"
    },
    "reportedIssue": "Tela trincada após queda",
    "physicalCondition": "FAIR",
    "accessories": ["Carregador", "Capinha"],
    "diagnosis": {
      "id": "uuid",
      "description": "Tela LCD danificada, necessita troca completa",
      "procedures": [
        "Desmontagem do aparelho",
        "Troca do display",
        "Teste de funcionamento"
      ],
      "createdAt": "2025-01-15T14:00:00Z"
    },
    "quote": {
      "id": "uuid",
      "status": "SENT",
      "items": [
        {
          "type": "SERVICE",
          "description": "Troca de Tela",
          "quantity": 1,
          "price": 80.00
        },
        {
          "type": "PART",
          "description": "Display iPhone 13 Original",
          "quantity": 1,
          "price": 450.00
        }
      ],
      "subtotal": 530.00,
      "discount": 0,
      "total": 530.00,
      "validUntil": "2025-01-22T23:59:59Z"
    },
    "timeline": [
      {
        "type": "STATUS_CHANGED",
        "description": "OS criada",
        "createdAt": "2025-01-15T10:30:00Z",
        "user": { "name": "Maria Atendente" }
      },
      {
        "type": "TECHNICIAN_ASSIGNED",
        "description": "Técnico atribuído: Carlos",
        "createdAt": "2025-01-15T11:00:00Z",
        "user": { "name": "Maria Atendente" }
      }
    ],
    "attachments": [
      {
        "id": "uuid",
        "type": "image",
        "category": "DEFEITO",
        "url": "https://storage.../photo1.jpg"
      }
    ],
    "receivedAt": "2025-01-15T10:30:00Z",
    "diagnosedAt": "2025-01-15T14:00:00Z",
    "approvedAt": null,
    "completedAt": null,
    "deliveredAt": null,
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-15T14:00:00Z"
  }
}
```

---

## Criar Ordem de Serviço

```http
POST /api/v1/service-orders
```

### Request Body

```json
{
  "customerId": "uuid",
  "equipment": {
    "category": "SMARTPHONE",
    "brand": "Apple",
    "model": "iPhone 13",
    "imei": "123456789012345",
    "color": "Preto",
    "capacity": "128GB"
  },
  "reportedIssue": "Tela trincada após queda",
  "physicalCondition": "FAIR",
  "accessories": ["Carregador", "Capinha"],
  "password": "1234",
  "priority": "NORMAL",
  "notes": "Cliente solicita backup antes do reparo"
}
```

### Com Novo Cliente

```json
{
  "newCustomer": {
    "name": "João Silva",
    "type": "PF",
    "document": "123.456.789-00",
    "phone": "(11) 99999-9999",
    "email": "joao@email.com"
  },
  "equipment": {
    "category": "SMARTPHONE",
    "brand": "Apple",
    "model": "iPhone 13"
  },
  "reportedIssue": "Tela trincada",
  "physicalCondition": "FAIR"
}
```

### Response (201 Created)

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "number": "OS-202501-00043",
    "status": "RECEIVED",
    "message": "Ordem de serviço criada com sucesso"
  }
}
```

---

## Atualizar Ordem de Serviço

```http
PATCH /api/v1/service-orders/:id
```

### Request Body

```json
{
  "priority": "HIGH",
  "notes": "Atualização de notas"
}
```

### Response

```json
{
  "data": {
    "id": "uuid",
    "number": "OS-202501-00042",
    "status": "RECEIVED",
    "priority": "HIGH"
  }
}
```

---

## Alterar Status

```http
PATCH /api/v1/service-orders/:id/status
```

### Request Body

```json
{
  "status": "DIAGNOSIS",
  "notes": "Iniciando diagnóstico"
}
```

### Response

```json
{
  "data": {
    "id": "uuid",
    "previousStatus": "TRIAGE",
    "currentStatus": "DIAGNOSIS",
    "updatedAt": "2025-01-15T14:00:00Z"
  }
}
```

### Erros Possíveis

```json
{
  "error": {
    "code": "INVALID_STATUS_TRANSITION",
    "message": "Transição de RECEIVED para COMPLETED não permitida"
  }
}
```

---

## Atribuir Técnico

```http
POST /api/v1/service-orders/:id/assign
```

### Request Body

```json
{
  "technicianId": "uuid"
}
```

### Response

```json
{
  "data": {
    "id": "uuid",
    "technician": {
      "id": "uuid",
      "name": "Carlos Técnico"
    },
    "assignedAt": "2025-01-15T11:00:00Z"
  }
}
```

---

## Timeline de Eventos

```http
GET /api/v1/service-orders/:id/timeline
```

### Response

```json
{
  "data": [
    {
      "id": "uuid",
      "type": "STATUS_CHANGED",
      "description": "Status alterado para DIAGNOSIS",
      "metadata": {
        "previousStatus": "TRIAGE",
        "newStatus": "DIAGNOSIS"
      },
      "user": {
        "id": "uuid",
        "name": "Maria Atendente"
      },
      "createdAt": "2025-01-15T14:00:00Z"
    },
    {
      "id": "uuid",
      "type": "QUOTE_GENERATED",
      "description": "Orçamento gerado: R$ 530,00",
      "metadata": {
        "quoteId": "uuid",
        "total": 530.00
      },
      "user": {
        "id": "uuid",
        "name": "Carlos Técnico"
      },
      "createdAt": "2025-01-15T14:30:00Z"
    }
  ]
}
```

---

## Adicionar Anexo

```http
POST /api/v1/service-orders/:id/attachments
Content-Type: multipart/form-data
```

### Form Data

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `file` | File | Arquivo (imagem, PDF, vídeo) |
| `category` | string | Categoria (DEFEITO, REPARO, etc.) |
| `description` | string | Descrição opcional |

### Response

```json
{
  "data": {
    "id": "uuid",
    "url": "https://storage.../photo.jpg",
    "category": "DEFEITO",
    "createdAt": "2025-01-15T10:35:00Z"
  }
}
```

---

## Excluir Ordem de Serviço

```http
DELETE /api/v1/service-orders/:id
```

### Response (204 No Content)

Sem corpo de resposta.

### Regras

- Apenas status `RECEIVED` ou `CANCELLED`
- Ou quando não há pagamentos registrados
- Soft delete (mantém no banco)

---

## Códigos de Erro

| Código | HTTP | Descrição |
|--------|------|-----------|
| `SERVICE_ORDER_NOT_FOUND` | 404 | OS não encontrada |
| `INVALID_STATUS_TRANSITION` | 400 | Transição inválida |
| `TECHNICIAN_REQUIRED` | 400 | Técnico obrigatório |
| `QUOTE_REQUIRED` | 400 | Orçamento obrigatório |
| `PAYMENT_REQUIRED` | 400 | Pagamento obrigatório |
| `CANNOT_DELETE` | 400 | Não pode excluir |

---

**Voltar para** [API](./README.md)
