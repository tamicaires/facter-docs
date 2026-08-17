# API - Stock (Estoque)

> **Endpoints para gestão de peças e estoque.**

---

## Peças

### Listar Peças

```http
GET /parts
```

**Query Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| page | number | Página |
| perPage | number | Itens por página |
| search | string | Busca por nome ou SKU |
| category | string | Categoria da peça |
| type | string | ORIGINAL, COMPATIBLE, GENERIC |
| lowStock | boolean | Apenas com estoque baixo |
| active | boolean | Apenas ativos |

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "sku": "TELA-IPH13-ORI",
      "name": "Tela iPhone 13 Original",
      "category": "DISPLAY",
      "type": "ORIGINAL",
      "quantity": 5,
      "minQuantity": 3,
      "costPrice": 180.00,
      "sellPrice": 350.00,
      "isLowStock": false,
      "active": true
    }
  ],
  "meta": { "total": 150 }
}
```

---

### Buscar Peça

```http
GET /parts/:id
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "sku": "TELA-IPH13-ORI",
    "name": "Tela iPhone 13 Original",
    "description": "Display LCD + Touch",
    "category": "DISPLAY",
    "type": "ORIGINAL",
    "compatibleWith": ["iPhone 13", "iPhone 13 Mini"],
    "quantity": 5,
    "minQuantity": 3,
    "location": "Prateleira A3",
    "costPrice": 180.00,
    "sellPrice": 350.00,
    "markup": 1.94,
    "warrantyDays": 90,
    "supplier": {
      "id": "uuid",
      "name": "Fornecedor XYZ"
    },
    "supplierCode": "XYZ-123",
    "active": true,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### Criar Peça

```http
POST /parts
```

**Request Body:**
```json
{
  "sku": "TELA-IPH13-ORI",
  "name": "Tela iPhone 13 Original",
  "description": "Display LCD + Touch",
  "category": "DISPLAY",
  "type": "ORIGINAL",
  "compatibleWith": ["iPhone 13", "iPhone 13 Mini"],
  "minQuantity": 3,
  "location": "Prateleira A3",
  "costPrice": 180.00,
  "sellPrice": 350.00,
  "warrantyDays": 90,
  "supplierId": "uuid",
  "supplierCode": "XYZ-123"
}
```

---

### Atualizar Peça

```http
PATCH /parts/:id
```

---

### Excluir Peça

```http
DELETE /parts/:id
```

> Desativa a peça (não exclui se tiver movimentações).

---

### Peças com Estoque Baixo

```http
GET /parts/low-stock
```

Retorna peças onde `quantity <= minQuantity`.

---

## Movimentações

### Entrada de Estoque

```http
POST /stock/entry
```

**Request Body:**
```json
{
  "partId": "uuid",
  "quantity": 10,
  "unitCost": 180.00,
  "reference": "NF 12345",
  "notes": "Compra mensal"
}
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "type": "PURCHASE",
    "partId": "uuid",
    "quantity": 10,
    "unitCost": 180.00,
    "totalCost": 1800.00,
    "newQuantity": 15,
    "createdAt": "2025-01-14T00:00:00Z"
  }
}
```

---

### Saída de Estoque

```http
POST /stock/exit
```

**Request Body:**
```json
{
  "partId": "uuid",
  "quantity": 1,
  "serviceOrderId": "uuid",
  "reason": "Uso em reparo"
}
```

---

### Ajuste de Estoque

```http
POST /stock/adjustment
```

**Request Body:**
```json
{
  "partId": "uuid",
  "newQuantity": 8,
  "reason": "Inventário mensal - diferença encontrada"
}
```

---

### Histórico de Movimentações

```http
GET /stock/movements
```

**Query Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| partId | string | Filtrar por peça |
| type | string | PURCHASE, SALE, ADJUSTMENT, RETURN |
| startDate | date | Data inicial |
| endDate | date | Data final |

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "type": "PURCHASE",
      "part": { "name": "Tela iPhone 13" },
      "quantity": 10,
      "unitCost": 180.00,
      "totalCost": 1800.00,
      "reference": "NF 12345",
      "user": { "name": "Admin" },
      "createdAt": "2025-01-14T00:00:00Z"
    },
    {
      "id": "uuid",
      "type": "SALE",
      "part": { "name": "Tela iPhone 13" },
      "quantity": -1,
      "serviceOrder": { "number": "OS-202501-00001" },
      "user": { "name": "Técnico" },
      "createdAt": "2025-01-15T00:00:00Z"
    }
  ]
}
```

---

### Movimentações de uma Peça

```http
GET /parts/:id/movements
```

---

## Relatórios

### Posição de Estoque

```http
GET /stock/position
```

**Response:**
```json
{
  "data": {
    "totalParts": 150,
    "totalQuantity": 1250,
    "totalCostValue": 45000.00,
    "lowStockCount": 8,
    "outOfStockCount": 2,
    "byCategory": [
      { "category": "DISPLAY", "quantity": 45, "value": 15000.00 },
      { "category": "BATTERY", "quantity": 80, "value": 8000.00 }
    ]
  }
}
```

---

## Permissões

| Endpoint | Permissão |
|----------|-----------|
| GET /parts | `read:Part` |
| POST /parts | `create:Part` |
| PATCH /parts/:id | `update:Part` |
| DELETE /parts/:id | `delete:Part` |
| POST /stock/* | `create:Stock` |
| GET /stock/movements | `read:Stock` |

---

**Voltar para** [API](./README.md)
