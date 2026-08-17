# API - Equipamentos

> **Endpoints para gestão de equipamentos dos clientes.**

---

## Endpoints

### GET /equipments

Lista equipamentos com filtros.

**Query Parameters:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| `page` | number | Página (default: 1) |
| `perPage` | number | Itens por página (default: 20) |
| `customerId` | uuid | Filtrar por cliente |
| `type` | string | Tipo de equipamento |
| `brand` | string | Marca |
| `search` | string | Busca por modelo, IMEI, serial |
| `hasActiveOrder` | boolean | Com OS ativa |

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "customerId": "customer-uuid",
      "customer": {
        "id": "customer-uuid",
        "name": "João Silva"
      },
      "type": "SMARTPHONE",
      "brand": "Apple",
      "model": "iPhone 14 Pro",
      "color": "Space Black",
      "serialNumber": "C39VJ...",
      "imei": "353912...",
      "condition": "Tela trincada, sem riscos na carcaça",
      "accessories": ["Carregador", "Capa"],
      "activeOrders": 1,
      "totalOrders": 3,
      "createdAt": "2024-01-15T10:00:00Z"
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

### GET /equipments/:id

Retorna detalhes do equipamento.

**Response (200):**
```json
{
  "data": {
    "id": "uuid",
    "customerId": "customer-uuid",
    "customer": {
      "id": "customer-uuid",
      "name": "João Silva",
      "phone": "+5511999999999"
    },
    "type": "SMARTPHONE",
    "brand": "Apple",
    "model": "iPhone 14 Pro",
    "color": "Space Black",
    "serialNumber": "C39VJ...",
    "imei": "353912...",
    "imei2": null,
    "condition": "Tela trincada, sem riscos na carcaça",
    "conditionNotes": "Cliente relata que caiu no chão",
    "accessories": ["Carregador", "Capa"],
    "password": "1234",
    "hasPassword": true,
    "photos": [
      {
        "id": "photo-uuid",
        "url": "https://storage.../photo1.jpg",
        "type": "FRONT"
      }
    ],
    "orders": [
      {
        "id": "order-uuid",
        "number": "OS-202501-00001",
        "status": "IN_PROGRESS",
        "createdAt": "2024-01-15T10:00:00Z"
      }
    ],
    "warranties": [
      {
        "id": "warranty-uuid",
        "status": "ACTIVE",
        "expiresAt": "2024-07-15T10:00:00Z"
      }
    ],
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
}
```

---

### POST /equipments

Cadastra novo equipamento.

**Request:**
```json
{
  "customerId": "customer-uuid",
  "type": "SMARTPHONE",
  "brand": "Apple",
  "model": "iPhone 14 Pro",
  "color": "Space Black",
  "serialNumber": "C39VJ...",
  "imei": "353912...",
  "condition": "Tela trincada",
  "conditionNotes": "Cliente relata que caiu",
  "accessories": ["Carregador", "Capa"],
  "password": "1234"
}
```

**Response (201):**
```json
{
  "data": {
    "id": "uuid",
    "customerId": "customer-uuid",
    "type": "SMARTPHONE",
    "brand": "Apple",
    "model": "iPhone 14 Pro",
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

---

### PATCH /equipments/:id

Atualiza equipamento.

**Request:**
```json
{
  "condition": "Tela trincada, bateria inchada",
  "accessories": ["Carregador", "Capa", "Fone"]
}
```

**Response (200):**
```json
{
  "data": {
    "id": "uuid",
    "condition": "Tela trincada, bateria inchada",
    "accessories": ["Carregador", "Capa", "Fone"],
    "updatedAt": "2024-01-15T11:00:00Z"
  }
}
```

---

### DELETE /equipments/:id

Remove equipamento (soft delete).

**Response (204):** No Content

**Response (400):**
```json
{
  "error": {
    "code": "HAS_ACTIVE_ORDERS",
    "message": "Equipamento possui ordens de serviço ativas"
  }
}
```

---

### POST /equipments/:id/photos

Upload de fotos do equipamento.

**Request:** `multipart/form-data`
```
photos: File[] (max 5 arquivos, max 5MB cada)
type: "FRONT" | "BACK" | "SIDE" | "DAMAGE" | "OTHER"
```

**Response (201):**
```json
{
  "data": [
    {
      "id": "photo-uuid",
      "url": "https://storage.../photo1.jpg",
      "type": "FRONT",
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

---

### DELETE /equipments/:id/photos/:photoId

Remove foto do equipamento.

**Response (204):** No Content

---

### GET /equipments/:id/history

Histórico de serviços do equipamento.

**Response (200):**
```json
{
  "data": [
    {
      "orderId": "order-uuid",
      "orderNumber": "OS-202501-00001",
      "status": "DELIVERED",
      "services": ["Troca de tela"],
      "total": 450.00,
      "technicianName": "Carlos Técnico",
      "createdAt": "2024-01-15T10:00:00Z",
      "completedAt": "2024-01-18T15:00:00Z"
    }
  ]
}
```

---

### GET /equipments/types

Lista tipos de equipamentos disponíveis.

**Response (200):**
```json
{
  "data": [
    { "key": "SMARTPHONE", "label": "Smartphone" },
    { "key": "TABLET", "label": "Tablet" },
    { "key": "NOTEBOOK", "label": "Notebook" },
    { "key": "DESKTOP", "label": "Desktop" },
    { "key": "PRINTER", "label": "Impressora" },
    { "key": "MONITOR", "label": "Monitor" },
    { "key": "TV", "label": "TV" },
    { "key": "CONSOLE", "label": "Console" },
    { "key": "SMARTWATCH", "label": "Smartwatch" },
    { "key": "OTHER", "label": "Outro" }
  ]
}
```

---

### GET /equipments/brands

Lista marcas cadastradas.

**Query Parameters:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| `type` | string | Filtrar por tipo de equipamento |

**Response (200):**
```json
{
  "data": [
    "Apple",
    "Samsung",
    "Xiaomi",
    "Motorola",
    "LG"
  ]
}
```

---

## Tipos de Equipamento

| Tipo | Campos Específicos |
|------|-------------------|
| SMARTPHONE | imei, imei2, password |
| TABLET | imei, password |
| NOTEBOOK | serialNumber, serviceTag |
| DESKTOP | serialNumber |
| PRINTER | serialNumber |
| OTHER | serialNumber |

---

## Validações

- **IMEI**: 15 dígitos numéricos, validação do dígito verificador
- **Serial Number**: Único por empresa
- **Fotos**: Máximo 10 por equipamento
- **Cliente**: Obrigatório e deve existir

---

**Voltar para** [API](./README.md)
