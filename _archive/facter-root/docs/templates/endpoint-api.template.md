# {METHOD} /v1/{resource}

> **Módulo:** {Nome do módulo}
> **Versão:** v1
> **Autenticação:** Bearer Token

---

## Descrição

{Descrição breve do que este endpoint faz}

---

## Request

### URL

```
{METHOD} /v1/{resource}/{id?}
```

### Headers

| Header | Valor | Obrigatório |
|--------|-------|-------------|
| Authorization | Bearer {token} | Sim |
| Content-Type | application/json | Sim |

### Path Parameters

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| id | string (UUID) | Sim | Identificador do recurso |

### Query Parameters

| Parâmetro | Tipo | Obrigatório | Default | Descrição |
|-----------|------|-------------|---------|-----------|
| page | number | Não | 1 | Página atual |
| pageSize | number | Não | 20 | Itens por página |
| sort | string | Não | createdAt:desc | Ordenação |
| search | string | Não | - | Busca textual |

### Request Body

```json
{
  "field1": "string",
  "field2": 123,
  "field3": true,
  "nested": {
    "subField": "value"
  }
}
```

### Body Schema

| Campo | Tipo | Obrigatório | Validação | Descrição |
|-------|------|-------------|-----------|-----------|
| field1 | string | Sim | min: 1, max: 100 | Descrição do campo |
| field2 | number | Não | min: 0 | Descrição do campo |
| field3 | boolean | Não | - | Descrição do campo |
| nested.subField | string | Sim | - | Descrição do campo |

---

## Response

### Sucesso (200/201)

```json
{
  "id": "uuid-string",
  "field1": "value",
  "field2": 123,
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2025-01-15T10:30:00Z"
}
```

### Sucesso com Paginação (200)

```json
{
  "data": [
    {
      "id": "uuid-string",
      "field1": "value"
    }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "pageSize": 20,
    "totalPages": 5
  }
}
```

### Response Schema

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | string (UUID) | Identificador único |
| field1 | string | Descrição do campo |
| createdAt | string (ISO 8601) | Data de criação |
| updatedAt | string (ISO 8601) | Data de atualização |

---

## Erros

### 400 Bad Request

```json
{
  "statusCode": 400,
  "code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "errors": [
    {
      "field": "field1",
      "message": "Field is required"
    }
  ],
  "timestamp": "2025-01-15T10:30:00Z"
}
```

### 401 Unauthorized

```json
{
  "statusCode": 401,
  "code": "UNAUTHORIZED",
  "message": "Invalid or expired token",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

### 403 Forbidden

```json
{
  "statusCode": 403,
  "code": "FORBIDDEN",
  "message": "Insufficient permissions",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

### 404 Not Found

```json
{
  "statusCode": 404,
  "code": "NOT_FOUND",
  "message": "Resource not found",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

### 409 Conflict

```json
{
  "statusCode": 409,
  "code": "ENTITY_ALREADY_EXISTS",
  "message": "Resource already exists",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

### 500 Internal Server Error

```json
{
  "statusCode": 500,
  "code": "INTERNAL_ERROR",
  "message": "An unexpected error occurred",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

---

## Exemplos

### cURL

```bash
curl -X POST 'https://api.facter.com.br/v1/resource' \
  -H 'Authorization: Bearer {token}' \
  -H 'Content-Type: application/json' \
  -d '{
    "field1": "value",
    "field2": 123
  }'
```

### JavaScript/TypeScript

```typescript
const response = await api.post('/resource', {
  field1: 'value',
  field2: 123,
});
```

---

## Permissões

| Role | Acesso |
|------|--------|
| ADMIN | ✅ |
| MANAGER | ✅ |
| OPERATOR | ❌ |
| VIEWER | ❌ |

---

## Rate Limiting

| Limite | Valor |
|--------|-------|
| Requests/minuto | 100 |
| Requests/hora | 1000 |

---

## Changelog

| Versão | Data | Alteração |
|--------|------|-----------|
| v1 | YYYY-MM-DD | Criação do endpoint |

---

**Voltar para** [Endpoints](../README.md)
