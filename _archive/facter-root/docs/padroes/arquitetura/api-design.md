# API Design

> **Padrões de design de APIs RESTful nos projetos Facter.**

---

## Princípios

1. **Consistência** - Mesmos padrões em todos os endpoints
2. **Previsibilidade** - Comportamento esperado
3. **Documentação** - OpenAPI/Swagger
4. **Versionamento** - Evolução sem quebrar clientes

---

## URLs

### Estrutura

```
https://api.facter.com.br/v1/{resource}/{id}/{sub-resource}
```

### Convenções

| Regra | Exemplo |
|-------|---------|
| Plural para coleções | `/users`, `/work-orders` |
| Kebab-case | `/work-orders`, não `/workOrders` |
| Substantivos, não verbos | `/users`, não `/getUsers` |
| Hierarquia para relações | `/users/{id}/orders` |

### Exemplos

```
GET    /v1/users              # Listar usuários
GET    /v1/users/123          # Obter usuário
POST   /v1/users              # Criar usuário
PUT    /v1/users/123          # Atualizar usuário (completo)
PATCH  /v1/users/123          # Atualizar usuário (parcial)
DELETE /v1/users/123          # Deletar usuário

GET    /v1/users/123/orders   # Ordens do usuário
POST   /v1/users/123/orders   # Criar ordem para usuário
```

---

## Métodos HTTP

| Método | Uso | Idempotente |
|--------|-----|-------------|
| `GET` | Buscar recursos | Sim |
| `POST` | Criar recurso | Não |
| `PUT` | Substituir recurso | Sim |
| `PATCH` | Atualizar parcial | Não |
| `DELETE` | Remover recurso | Sim |

---

## Status Codes

### Sucesso (2xx)

| Código | Uso |
|--------|-----|
| `200 OK` | GET, PUT, PATCH com sucesso |
| `201 Created` | POST com sucesso |
| `204 No Content` | DELETE com sucesso |

### Erro do Cliente (4xx)

| Código | Uso |
|--------|-----|
| `400 Bad Request` | Dados inválidos |
| `401 Unauthorized` | Não autenticado |
| `403 Forbidden` | Sem permissão |
| `404 Not Found` | Recurso não existe |
| `409 Conflict` | Conflito (ex: duplicado) |
| `422 Unprocessable Entity` | Validação falhou |

### Erro do Servidor (5xx)

| Código | Uso |
|--------|-----|
| `500 Internal Server Error` | Erro inesperado |
| `503 Service Unavailable` | Serviço indisponível |

---

## Request/Response

### Headers Obrigatórios

```
Content-Type: application/json
Authorization: Bearer {token}
```

### Request Body

```json
// POST /v1/users
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

### Response Body - Sucesso

```json
// GET /v1/users/123
{
  "id": "123",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "USER",
  "isActive": true,
  "createdAt": "2025-01-15T10:30:00Z"
}
```

### Response Body - Lista

```json
// GET /v1/users
{
  "data": [
    { "id": "1", "name": "John" },
    { "id": "2", "name": "Jane" }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "pageSize": 20,
    "totalPages": 5
  }
}
```

### Response Body - Erro

```json
// 400 Bad Request
{
  "statusCode": 400,
  "code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ],
  "timestamp": "2025-01-15T10:30:00Z"
}
```

---

## Paginação

### Query Parameters

```
GET /v1/users?page=2&pageSize=20
```

| Parâmetro | Default | Máximo |
|-----------|---------|--------|
| `page` | 1 | - |
| `pageSize` | 20 | 100 |

### Response

```json
{
  "data": [...],
  "meta": {
    "total": 100,
    "page": 2,
    "pageSize": 20,
    "totalPages": 5,
    "hasNext": true,
    "hasPrevious": true
  }
}
```

---

## Filtros

### Query Parameters

```
GET /v1/work-orders?status=PENDING&priority=HIGH&createdAt[gte]=2025-01-01
```

### Operadores

| Operador | Significado | Exemplo |
|----------|-------------|---------|
| (default) | Igual | `status=PENDING` |
| `[gte]` | Maior ou igual | `createdAt[gte]=2025-01-01` |
| `[lte]` | Menor ou igual | `createdAt[lte]=2025-12-31` |
| `[contains]` | Contém | `name[contains]=john` |
| `[in]` | Em lista | `status[in]=PENDING,IN_PROGRESS` |

---

## Ordenação

### Query Parameter

```
GET /v1/users?sort=createdAt:desc,name:asc
```

### Formato

```
sort={field}:{direction},{field}:{direction}
```

- `direction`: `asc` ou `desc`
- Default: `createdAt:desc`

---

## Busca

### Full-text Search

```
GET /v1/users?search=john
```

### Campos específicos

```
GET /v1/users?name[contains]=john&email[contains]=example.com
```

---

## Versionamento

### Via URL (Preferido)

```
/v1/users
/v2/users
```

### Regras

1. **Major version na URL** - `/v1`, `/v2`
2. **Manter versão anterior** - Por pelo menos 6 meses
3. **Deprecation notice** - Header `Deprecation: true`
4. **Changelog** - Documentar mudanças

### Breaking Changes (requer nova versão)

- Remover campo de response
- Tornar campo obrigatório
- Mudar tipo de campo
- Mudar estrutura de response

### Non-Breaking Changes (mesma versão)

- Adicionar campo opcional
- Adicionar novo endpoint
- Adicionar novo valor de enum

---

## Autenticação

### JWT Bearer Token

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### Refresh Token

```
POST /v1/auth/refresh
{
  "refreshToken": "..."
}
```

### Endpoints de Auth

```
POST /v1/auth/login       # Login
POST /v1/auth/logout      # Logout
POST /v1/auth/refresh     # Refresh token
POST /v1/auth/register    # Registro
POST /v1/auth/forgot      # Esqueci senha
POST /v1/auth/reset       # Reset senha
```

---

## Rate Limiting

### Headers de Response

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

### Erro 429

```json
{
  "statusCode": 429,
  "code": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests",
  "retryAfter": 60
}
```

---

## Documentação

### OpenAPI/Swagger

```typescript
// NestJS com decorators
@ApiTags('users')
@Controller('users')
export class UserController {
  @ApiOperation({ summary: 'Create user' })
  @ApiResponse({ status: 201, type: UserViewModel })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  @Post()
  async create(@Body() body: CreateUserDto) {
    // ...
  }
}
```

### Acessar Documentação

```
GET /api/docs      # Swagger UI
GET /api/docs-json # OpenAPI JSON
```

---

## Códigos de Erro

### Formato Padrão

```typescript
enum ErrorCode {
  // Validação
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',

  // Autenticação
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',

  // Autorização
  FORBIDDEN = 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',

  // Recursos
  NOT_FOUND = 'NOT_FOUND',
  ENTITY_NOT_FOUND = 'ENTITY_NOT_FOUND',
  ENTITY_ALREADY_EXISTS = 'ENTITY_ALREADY_EXISTS',

  // Negócio
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
  INVALID_OPERATION = 'INVALID_OPERATION',

  // Sistema
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}
```

---

## Checklist de API

- [ ] URLs em kebab-case e plural
- [ ] Métodos HTTP corretos
- [ ] Status codes apropriados
- [ ] Response padronizado
- [ ] Paginação implementada
- [ ] Filtros consistentes
- [ ] Ordenação disponível
- [ ] Autenticação via Bearer token
- [ ] Rate limiting configurado
- [ ] Documentação Swagger
- [ ] Códigos de erro padronizados

---

**Relacionados:**
- [Backend](./backend.md) - Arquitetura backend
- [Segurança](./seguranca.md) - Segurança de APIs

**Voltar para** [Padrões](../README.md)
