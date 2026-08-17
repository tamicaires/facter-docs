# Padrões de Resposta da API

> **Estruturas padronizadas de resposta para uso no Design System.**

---

## Estrutura Base

Todas as respostas seguem uma estrutura consistente:

```typescript
interface ApiResponse<T> {
  data: T;
  meta?: ResponseMeta;
  error?: ApiError;
}
```

---

## Paginação e Metadados de Tabela

### Resposta de Lista Paginada

```typescript
interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

interface PaginationMeta {
  // Paginação básica
  total: number;           // Total de registros
  page: number;            // Página atual (1-indexed)
  perPage: number;         // Itens por página
  totalPages: number;      // Total de páginas

  // Navegação
  hasNextPage: boolean;    // Tem próxima página
  hasPrevPage: boolean;    // Tem página anterior

  // Ordenação atual
  sortBy?: string;         // Campo de ordenação
  sortOrder?: 'asc' | 'desc';

  // Filtros ativos (para UI mostrar filtros aplicados)
  filters?: Record<string, any>;

  // Resumo/Agregações (específico por recurso)
  summary?: Record<string, any>;
}
```

### Exemplo Real - Lista de OS

```json
{
  "data": [
    {
      "id": "uuid-1",
      "number": "OS-202501-00001",
      "status": "IN_PROGRESS",
      "customerName": "João Silva",
      "equipmentDescription": "iPhone 14 Pro",
      "priority": "HIGH",
      "createdAt": "2024-01-15T10:00:00Z"
    },
    {
      "id": "uuid-2",
      "number": "OS-202501-00002",
      "status": "AWAITING_APPROVAL",
      "customerName": "Maria Santos",
      "equipmentDescription": "MacBook Pro",
      "priority": "NORMAL",
      "createdAt": "2024-01-15T11:00:00Z"
    }
  ],
  "meta": {
    "total": 156,
    "page": 1,
    "perPage": 20,
    "totalPages": 8,
    "hasNextPage": true,
    "hasPrevPage": false,
    "sortBy": "createdAt",
    "sortOrder": "desc",
    "filters": {
      "status": ["IN_PROGRESS", "AWAITING_APPROVAL"],
      "priority": "HIGH"
    },
    "summary": {
      "byStatus": {
        "RECEIVED": 12,
        "IN_DIAGNOSIS": 8,
        "IN_PROGRESS": 25,
        "AWAITING_APPROVAL": 15,
        "COMPLETED": 96
      },
      "totalValue": 45750.00
    }
  }
}
```

---

## Query Parameters Padrão

### Paginação

| Param | Tipo | Default | Descrição |
|-------|------|---------|-----------|
| `page` | number | 1 | Página atual (1-indexed) |
| `perPage` | number | 20 | Itens por página (max: 100) |

```
GET /service-orders?page=2&perPage=50
```

### Ordenação

| Param | Tipo | Default | Descrição |
|-------|------|---------|-----------|
| `sortBy` | string | `createdAt` | Campo para ordenação |
| `sortOrder` | string | `desc` | Direção: `asc` ou `desc` |

```
GET /service-orders?sortBy=priority&sortOrder=asc
```

### Busca

| Param | Tipo | Descrição |
|-------|------|-----------|
| `search` | string | Busca textual em múltiplos campos |
| `q` | string | Alias para `search` |

```
GET /customers?search=joao silva
```

### Filtros

Filtros são passados como query params diretos:

```
GET /service-orders?status=IN_PROGRESS&priority=HIGH&technicianId=uuid
```

Para múltiplos valores, usar array:

```
GET /service-orders?status[]=IN_PROGRESS&status[]=AWAITING_APPROVAL
```

Ou separados por vírgula:

```
GET /service-orders?status=IN_PROGRESS,AWAITING_APPROVAL
```

### Período

| Param | Tipo | Descrição |
|-------|------|-----------|
| `startDate` | date | Data inicial (ISO 8601) |
| `endDate` | date | Data final (ISO 8601) |
| `dateField` | string | Campo de data para filtro (default: `createdAt`) |

```
GET /service-orders?startDate=2024-01-01&endDate=2024-01-31&dateField=completedAt
```

---

## Resposta com Summary para Tabelas

O campo `summary` no meta pode conter agregações úteis para a UI:

### Contadores por Status

```typescript
interface StatusSummary {
  byStatus: Record<string, number>;
  byPriority?: Record<string, number>;
}
```

```json
{
  "meta": {
    "summary": {
      "byStatus": {
        "RECEIVED": 12,
        "IN_DIAGNOSIS": 8,
        "AWAITING_PARTS": 5,
        "IN_PROGRESS": 25,
        "COMPLETED": 96,
        "CANCELLED": 10
      }
    }
  }
}
```

### Totalizadores Financeiros

```typescript
interface FinancialSummary {
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  averageTicket: number;
}
```

```json
{
  "meta": {
    "summary": {
      "totalAmount": 45750.00,
      "paidAmount": 38500.00,
      "pendingAmount": 7250.00,
      "averageTicket": 385.00
    }
  }
}
```

### Por Método de Pagamento

```json
{
  "meta": {
    "summary": {
      "byMethod": {
        "PIX": 25500.00,
        "CREDIT_CARD": 12500.00,
        "CASH": 7750.00
      }
    }
  }
}
```

---

## Estrutura para Componentes de Tabela

### Hook useTableData (React)

```typescript
interface UseTableDataOptions {
  endpoint: string;
  initialParams?: TableParams;
  refetchInterval?: number;
}

interface TableParams {
  page: number;
  perPage: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  filters: Record<string, any>;
  search: string;
}

interface UseTableDataReturn<T> {
  // Dados
  data: T[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;

  // Paginação
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };

  // Summary
  summary: Record<string, any>;

  // Ações
  setPage: (page: number) => void;
  setPerPage: (perPage: number) => void;
  setSort: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  setFilter: (key: string, value: any) => void;
  setFilters: (filters: Record<string, any>) => void;
  clearFilters: () => void;
  setSearch: (search: string) => void;
  refetch: () => void;
}
```

### Exemplo de Uso no Design System

```tsx
// components/ServiceOrdersTable.tsx
import { DataTable, useTableData } from '@facter/ds-core';

export function ServiceOrdersTable() {
  const {
    data,
    isLoading,
    pagination,
    summary,
    setPage,
    setPerPage,
    setSort,
    setFilter,
    setSearch,
  } = useTableData<ServiceOrder>({
    endpoint: '/service-orders',
    initialParams: {
      page: 1,
      perPage: 20,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      filters: {},
      search: '',
    },
  });

  return (
    <DataTable
      data={data}
      loading={isLoading}
      pagination={pagination}
      onPageChange={setPage}
      onPerPageChange={setPerPage}
      onSort={setSort}
      onSearch={setSearch}
      summary={summary}
      columns={[
        { key: 'number', label: 'Número', sortable: true },
        { key: 'customerName', label: 'Cliente', sortable: true },
        { key: 'status', label: 'Status', sortable: true, filterable: true },
        { key: 'priority', label: 'Prioridade', sortable: true, filterable: true },
        { key: 'createdAt', label: 'Data', sortable: true },
      ]}
      filters={[
        {
          key: 'status',
          label: 'Status',
          type: 'multiselect',
          options: Object.entries(summary?.byStatus || {}).map(([key, count]) => ({
            value: key,
            label: statusLabels[key],
            count,
          })),
        },
        {
          key: 'priority',
          label: 'Prioridade',
          type: 'select',
          options: priorityOptions,
        },
        {
          key: 'technicianId',
          label: 'Técnico',
          type: 'async-select',
          endpoint: '/technicians',
        },
      ]}
    />
  );
}
```

---

## Resposta de Item Único

```typescript
interface SingleItemResponse<T> {
  data: T;
}
```

```json
{
  "data": {
    "id": "uuid",
    "number": "OS-202501-00001",
    "status": "IN_PROGRESS",
    "customer": {
      "id": "customer-uuid",
      "name": "João Silva"
    }
  }
}
```

---

## Resposta de Criação

```typescript
interface CreateResponse<T> {
  data: T;
  message?: string;
}
```

**Status**: `201 Created`

```json
{
  "data": {
    "id": "new-uuid",
    "number": "OS-202501-00156",
    "status": "RECEIVED",
    "createdAt": "2024-01-15T16:00:00Z"
  }
}
```

---

## Resposta de Atualização

```typescript
interface UpdateResponse<T> {
  data: T;
  changes?: Record<string, { from: any; to: any }>;
}
```

**Status**: `200 OK`

```json
{
  "data": {
    "id": "uuid",
    "status": "IN_PROGRESS",
    "updatedAt": "2024-01-15T16:30:00Z"
  },
  "changes": {
    "status": {
      "from": "RECEIVED",
      "to": "IN_PROGRESS"
    }
  }
}
```

---

## Resposta de Exclusão

**Status**: `204 No Content` (sem body)

Ou com confirmação:

**Status**: `200 OK`

```json
{
  "data": {
    "deleted": true,
    "id": "uuid"
  }
}
```

---

## Resposta de Erro

```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: ValidationError[];
    stack?: string; // Apenas em desenvolvimento
  };
}

interface ValidationError {
  field: string;
  message: string;
  rule?: string;
  value?: any;
}
```

### Erro de Validação (422)

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados inválidos",
    "details": [
      {
        "field": "email",
        "message": "Email inválido",
        "rule": "email",
        "value": "invalid-email"
      },
      {
        "field": "phone",
        "message": "Telefone deve ter 10 ou 11 dígitos",
        "rule": "phone"
      }
    ]
  }
}
```

### Erro de Negócio (400)

```json
{
  "error": {
    "code": "CANNOT_DELETE_WITH_ACTIVE_ORDERS",
    "message": "Cliente não pode ser excluído pois possui ordens de serviço ativas"
  }
}
```

### Erro de Autenticação (401)

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Token inválido ou expirado"
  }
}
```

### Erro de Autorização (403)

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Sem permissão para acessar este recurso"
  }
}
```

### Não Encontrado (404)

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Ordem de serviço não encontrada"
  }
}
```

---

## Códigos de Erro Comuns

| Código | HTTP | Descrição |
|--------|------|-----------|
| `VALIDATION_ERROR` | 422 | Dados de entrada inválidos |
| `UNAUTHORIZED` | 401 | Não autenticado |
| `FORBIDDEN` | 403 | Sem permissão |
| `NOT_FOUND` | 404 | Recurso não encontrado |
| `CONFLICT` | 409 | Conflito (ex: email já existe) |
| `RATE_LIMITED` | 429 | Limite de requisições |
| `INTERNAL_ERROR` | 500 | Erro interno |
| `SERVICE_UNAVAILABLE` | 503 | Serviço indisponível |

---

## Headers de Resposta

```http
X-Request-Id: uuid          # ID único da requisição
X-Response-Time: 45ms       # Tempo de processamento
X-RateLimit-Limit: 100      # Limite de requisições
X-RateLimit-Remaining: 95   # Requisições restantes
X-RateLimit-Reset: 1640995200  # Reset timestamp
```

---

## Tipos TypeScript Compartilhados

```typescript
// types/api.ts

export interface ApiResponse<T> {
  data: T;
  meta?: ResponseMeta;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, unknown>;
  summary?: Record<string, unknown>;
}

export interface ApiError {
  code: string;
  message: string;
  details?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  rule?: string;
  value?: unknown;
}

// Hook types
export interface TableParams {
  page: number;
  perPage: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  filters: Record<string, unknown>;
  search: string;
}
```

---

**Voltar para** [API](./README.md)
