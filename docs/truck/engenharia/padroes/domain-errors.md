---
title: Domain Errors
sidebar_position: 3
tags: [domain-errors, error-handling, backend, padroes]
---

# Domain Errors

Sistema de erros de dominio do Facter Truck. Substitui o antigo `AppException`/`ExceptionHandler` por erros tipados e estruturados.

---

## Por que DomainErrors?

O padrao antigo usava `ExceptionHandler` com mensagens hardcoded e sem estrutura. Problemas: sem codigo de erro, frontend precisa parsear strings, dificil internacionalizacao.

O padrao atual usa **DomainError** que:

- Nao tem conhecimento de HTTP (separacao de camadas)
- Carrega dados contextuais tipados
- E convertido para HTTP pelo `GlobalExceptionFilter`
- Permite o frontend usar `switch(errorCode)` em vez de regex

---

## Estrutura de Arquivos

```
src/core/domain/errors/
├── domain-error.ts                 # Classe base
├── work-order.errors.ts            # Erros de WorkOrder
├── part-request.errors.ts          # Erros de PartRequest
├── vehicle.errors.ts               # Erros de Vehicle
└── index.ts                        # Re-exports

src/core/exceptions/
├── error-codes.ts                  # Enum ErrorCode + ErrorMetadata

src/infra/http/filters/
└── global-exception.filter.ts      # Converte DomainError -> HTTP
```

---

## Classe Base

```typescript
// src/core/domain/errors/domain-error.ts
export abstract class DomainError extends Error {
  public readonly context?: Record<string, unknown>;
  public readonly timestamp: Date;

  constructor(message: string, context?: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
    this.context = context;
    this.timestamp = new Date();
  }
}
```

Caracteristicas: sem conhecimento HTTP, `context` para dados dinamicos, `timestamp` automatico, `name` automatico via `constructor.name`.

---

## Como Criar um Novo Domain Error

### Passo 1: Criar a classe de erro

```typescript
// src/core/domain/errors/vehicle.errors.ts
import { DomainError } from './domain-error';

export class VehicleNotFoundError extends DomainError {
  constructor(vehicleId: string) {
    super(`Vehicle not found: ${vehicleId}`, { vehicleId });
  }
}

export class DuplicatePlateError extends DomainError {
  constructor(plate: string) {
    super(`Vehicle with plate ${plate} already exists`, { plate });
  }
}
```

### Passo 2: Adicionar ErrorCode e metadata PT-BR

```typescript
// src/core/exceptions/error-codes.ts
export enum ErrorCode {
  VEHICLE_NOT_FOUND = 'VEHICLE_NOT_FOUND',
  VEHICLE_DUPLICATE_PLATE = 'VEHICLE_DUPLICATE_PLATE',
}

export interface ErrorMetadata {
  title: string;
  description: string;
  suggestedActions?: string[];
  severity: 'error' | 'warning' | 'info';
  retryable: boolean;
}

export const ERROR_METADATA: Record<ErrorCode, ErrorMetadata> = {
  [ErrorCode.VEHICLE_NOT_FOUND]: {
    title: 'Veiculo Nao Encontrado',
    description: 'O veiculo solicitado nao foi encontrado no sistema.',
    severity: 'error',
    retryable: false,
  },
  [ErrorCode.VEHICLE_DUPLICATE_PLATE]: {
    title: 'Placa Duplicada',
    description: 'Ja existe um veiculo cadastrado com esta placa.',
    suggestedActions: ['Verifique a placa informada', 'Busque o veiculo existente'],
    severity: 'warning',
    retryable: false,
  },
};
```

### Passo 3: Mapear no GlobalExceptionFilter

```typescript
// src/infra/http/filters/global-exception.filter.ts
const DOMAIN_ERROR_MAP: Record<string, { status: number; code: ErrorCode }> = {
  VehicleNotFoundError: { status: 404, code: ErrorCode.VEHICLE_NOT_FOUND },
  DuplicatePlateError: { status: 409, code: ErrorCode.VEHICLE_DUPLICATE_PLATE },
};
```

### Passo 4: Exportar

```typescript
// src/core/domain/errors/index.ts
export * from './vehicle.errors';
```

---

## Resposta HTTP Estruturada

Quando um DomainError e capturado pelo `GlobalExceptionFilter`, a resposta segue este formato:

```json
{
  "statusCode": 404,
  "timestamp": "2026-01-24T10:30:00.000Z",
  "path": "/api/vehicles/abc-123",
  "errorCode": "VEHICLE_NOT_FOUND",
  "title": "Veiculo Nao Encontrado",
  "message": "Vehicle not found: abc-123",
  "description": "O veiculo solicitado nao foi encontrado no sistema.",
  "severity": "error",
  "retryable": false,
  "context": { "vehicleId": "abc-123" }
}
```

---

## Uso no Frontend

```typescript
switch (error.response?.data?.errorCode) {
  case 'VEHICLE_NOT_FOUND':
    toast.error(error.response.data.title);
    router.push('/vehicles');
    break;
  case 'VEHICLE_DUPLICATE_PLATE':
    toast.warning(error.response.data.title);
    break;
  default:
    toast.error(error.response.data.message);
}
```

---

## Regra de Migracao

Ao tocar em um use case que ainda usa `AppException` ou `ExceptionHandler`, **migrar para DomainError**. Status atual: 32 arquivos ainda usam o padrao antigo. Veja [Tech Debt](../../projeto/tech-debt) para detalhes.

---

## Referencias

- [Clean Architecture](./clean-architecture) -- Separacao de camadas
- [Testes](./testes) -- Como testar erros de dominio
- [Tech Debt](../../projeto/tech-debt) -- Status da migracao
