# [FACTBP-API-013] Permissions Endpoint

> Endpoint para retornar permissões do usuário na empresa.

---

## Status: ✅ Concluído (2025-12-16)

## Contexto

**Endpoint (conforme docs/facter-techcare/api/auth.md):**
```
GET /auth/permissions
```

**Requer:**
- Header `Authorization: Bearer <token>`
- Header `X-Company-ID: <company-id>`

**Uso no Frontend:**
- Carregado no login/refresh para montar CASL no cliente
- Usado para mostrar/esconder elementos de UI
- Cachear no cliente por 5 minutos

---

## Tasks

### Task 13.1: Criar GetPermissionsUseCase

**Arquivo:** `src/application/auth/use-cases/get-permissions.use-case.ts`

**Implementação:**
```typescript
import { Injectable } from '@nestjs/common';
import { AbilityService } from '@/infra/auth/services/ability.service';
import { CompanyContext } from '@/application/company/services/company.service';
import { RawPermission } from '@/infra/auth/casl/casl.types';

export interface PermissionsResponseDto {
  role: string;
  isOwner: boolean;
  permissions: RawPermission[];
}

@Injectable()
export class GetPermissionsUseCase {
  constructor(private readonly abilityService: AbilityService) {}

  async execute(company: CompanyContext): Promise<PermissionsResponseDto> {
    const permissions = await this.abilityService.getPermissionsForMembership(
      company.membershipId,
    );

    return {
      role: company.roleName,
      isOwner: company.isOwner,
      permissions,
    };
  }
}
```

**Commit:** `[FACTBP-API] feat(auth): add GetPermissionsUseCase`

**Status:** ✅

---

### Task 13.2: Adicionar Endpoint no AuthController

**Arquivo:** `src/application/auth/auth.controller.ts` (atualização)

**Adicionar:**
```typescript
import { GetPermissionsUseCase } from './use-cases/get-permissions.use-case';
import { CompanyGuard } from '@/infra/http/guards/company.guard';
import { CurrentCompany } from '@/infra/http/decorators/current-company.decorator';
import { CompanyContext } from '@/application/company/services/company.service';

// ... no constructor
constructor(
  // ... existing
  private readonly getPermissionsUseCase: GetPermissionsUseCase,
) {}

// ... novo endpoint
@Get('permissions')
@UseGuards(JwtAuthGuard, CompanyGuard)
async getPermissions(@CurrentCompany() company: CompanyContext) {
  return this.getPermissionsUseCase.execute(company);
}
```

**Commit:** `[FACTBP-API] feat(auth): add permissions endpoint`

**Status:** ✅

---

## Response Format

**Sucesso (200):**
```json
{
  "data": {
    "role": "admin",
    "isOwner": false,
    "permissions": [
      { "action": "read", "subject": "User" },
      { "action": "create", "subject": "User" },
      { "action": "update", "subject": "User" },
      { "action": "read", "subject": "Company" },
      { "action": "update", "subject": "Company" }
    ]
  }
}
```

**Owner Response:**
```json
{
  "data": {
    "role": "owner",
    "isOwner": true,
    "permissions": [
      { "action": "manage", "subject": "all" }
    ]
  }
}
```

**Erro (400 - Bad Request):**
```json
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "Header X-Company-ID é obrigatório"
  }
}
```

---

## Uso no Frontend

```typescript
// hooks/usePermissions.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function usePermissions(companyId: string) {
  return useQuery({
    queryKey: ['permissions', companyId],
    queryFn: () => api.get('/auth/permissions', {
      headers: { 'X-Company-ID': companyId }
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Uso com CASL no frontend
import { createMongoAbility } from '@casl/ability';

const ability = createMongoAbility(permissions.permissions);

if (ability.can('create', 'User')) {
  // Mostrar botão de criar usuário
}
```

---

## Critérios de Aceite

- [x] Retorna role do usuário na empresa
- [x] Retorna flag isOwner
- [x] Retorna lista de permissões
- [x] Owner retorna `[{ action: 'manage', subject: 'all' }]`
- [x] Requer header X-Company-ID
- [x] Cache de 5 minutos no backend

---

## Estrutura Final Sprint 3

```
src/
├── application/
│   ├── auth/
│   │   ├── auth.controller.ts (atualizado)
│   │   ├── auth.module.ts (atualizado)
│   │   ├── dto/
│   │   │   └── switch-company.dto.ts
│   │   └── use-cases/
│   │       ├── switch-company.use-case.ts
│   │       └── get-permissions.use-case.ts
│   └── company/
│       ├── company.module.ts
│       └── services/
│           └── company.service.ts
└── infra/
    ├── auth/
    │   ├── casl/
    │   │   ├── casl.module.ts
    │   │   ├── casl.types.ts
    │   │   └── ability.factory.ts
    │   └── services/
    │       └── ability.service.ts
    └── http/
        ├── guards/
        │   ├── company.guard.ts
        │   └── permissions.guard.ts
        └── decorators/
            ├── current-company.decorator.ts
            ├── company-optional.decorator.ts
            └── require-permission.decorator.ts
```

---

*Task de [Sprint 3](../sprint-03.md)*
