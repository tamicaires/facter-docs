# API - Customers (Clientes)

> **Endpoints para gestão de clientes.**

---

## Endpoints

### Listar Clientes

```http
GET /customers
```

**Query Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| page | number | Página (default: 1) |
| perPage | number | Itens por página (default: 20) |
| search | string | Busca por nome, documento ou telefone |
| category | string | Filtrar por categoria |
| sortBy | string | Campo de ordenação |
| sortOrder | string | asc / desc |

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "João Silva",
      "document": "123.456.789-00",
      "email": "joao@email.com",
      "phone": "(11) 99999-9999",
      "category": "REGULAR",
      "ordersCount": 5,
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "perPage": 20,
    "totalPages": 5
  }
}
```

---

### Buscar Cliente

```http
GET /customers/:id
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "name": "João Silva",
    "document": "123.456.789-00",
    "documentType": "CPF",
    "email": "joao@email.com",
    "phone": "(11) 99999-9999",
    "phone2": null,
    "type": "INDIVIDUAL",
    "category": "REGULAR",
    "address": {
      "street": "Rua das Flores",
      "number": "123",
      "complement": "Apto 45",
      "neighborhood": "Centro",
      "city": "São Paulo",
      "state": "SP",
      "zipCode": "01234-567"
    },
    "notes": "Cliente antigo",
    "equipment": [
      {
        "id": "uuid",
        "type": "SMARTPHONE",
        "brand": "Apple",
        "model": "iPhone 13"
      }
    ],
    "stats": {
      "totalOrders": 5,
      "completedOrders": 4,
      "totalSpent": 1250.00,
      "lastOrderAt": "2025-01-15T00:00:00Z"
    },
    "createdAt": "2024-06-01T00:00:00Z"
  }
}
```

---

### Criar Cliente

```http
POST /customers
```

**Request Body:**
```json
{
  "name": "Maria Santos",
  "document": "987.654.321-00",
  "email": "maria@email.com",
  "phone": "(11) 98888-8888",
  "type": "INDIVIDUAL",
  "address": {
    "street": "Av. Brasil",
    "number": "456",
    "neighborhood": "Centro",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01234-000"
  }
}
```

**Validações:**
- `name`: obrigatório, 2-200 caracteres
- `document`: opcional, CPF ou CNPJ válido
- `phone`: obrigatório, formato válido
- `email`: opcional, formato válido

**Response:** `201 Created`

---

### Atualizar Cliente

```http
PATCH /customers/:id
```

**Request Body:** (campos parciais)
```json
{
  "phone": "(11) 97777-7777",
  "category": "VIP"
}
```

**Response:** `200 OK`

---

### Excluir Cliente

```http
DELETE /customers/:id
```

**Response:** `204 No Content`

> Soft delete - cliente é marcado como deletado, não excluído permanentemente.

---

### OS do Cliente

```http
GET /customers/:id/orders
```

**Query Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| status | string | Filtrar por status |
| page | number | Página |
| perPage | number | Itens por página |

---

### Equipamentos do Cliente

```http
GET /customers/:id/equipment
```

---

### Busca Rápida

```http
GET /customers/search?q=joao
```

Busca em nome, documento e telefone. Retorna até 10 resultados para autocomplete.

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "João Silva",
      "phone": "(11) 99999-9999",
      "document": "123.456.789-00"
    }
  ]
}
```

---

## Permissões

| Endpoint | Permissão |
|----------|-----------|
| GET /customers | `read:Customer` |
| GET /customers/:id | `read:Customer` |
| POST /customers | `create:Customer` |
| PATCH /customers/:id | `update:Customer` |
| DELETE /customers/:id | `delete:Customer` |

---

**Voltar para** [API](./README.md)
