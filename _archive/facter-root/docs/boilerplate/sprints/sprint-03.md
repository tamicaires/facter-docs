# Sprint 3 - Multi-tenancy & RBAC

> Sistema de multi-tenancy com empresas e permissões baseadas em roles (CASL).

---

## Resumo

| Item | Valor |
|------|-------|
| **Objetivo** | Multi-tenancy funcional + RBAC com CASL |
| **Histórias** | 5 |
| **Tasks** | 19 |
| **Status** | ✅ Concluído |
| **Dependências** | Sprint 2 |

---

## Histórias

### [FACTBP-API-010] Company Guard

**Descrição:** Guard que valida header X-Company-ID e verifica acesso do usuário.

**Tasks:**

| # | Task | Status |
|---|------|--------|
| 10.1 | Criar `CompanyGuard` | ✅ |
| 10.2 | Criar decorator `@CurrentCompany` | ✅ |
| 10.3 | Criar `CompanyService` para validação | ✅ |

**Commits esperados:**
```
[FACTBP-API] feat(company): add CompanyGuard for X-Company-ID validation
[FACTBP-API] feat(company): add CurrentCompany decorator
[FACTBP-API] feat(company): add CompanyService
```

**Fluxo:**
```
Request com header X-Company-ID
   │
   ├─▶ Extract companyId from header
   ├─▶ Find membership (userId + companyId)
   ├─▶ Check membership.isActive
   ├─▶ Attach company to request
   └─▶ Allow/Deny
```

---

### [FACTBP-API-011] RBAC com CASL

**Descrição:** Implementar sistema de permissões usando CASL.

**Tasks:**

| # | Task | Status |
|---|------|--------|
| 11.1 | Instalar @casl/ability | ✅ |
| 11.2 | Criar `AbilityService` | ✅ |
| 11.3 | Criar `PermissionsGuard` | ✅ |
| 11.4 | Criar decorator `@RequirePermission` | ✅ |

**Commits esperados:**
```
[FACTBP-API] chore(deps): add @casl/ability
[FACTBP-API] feat(rbac): add AbilityService with CASL
[FACTBP-API] feat(rbac): add PermissionsGuard
[FACTBP-API] feat(rbac): add RequirePermission decorator
```

**Uso:**
```typescript
@Controller('users')
@UseGuards(JwtAuthGuard, CompanyGuard, PermissionsGuard)
export class UsersController {
  @Get()
  @RequirePermission('read:User')
  findAll() {}

  @Post()
  @RequirePermission('create:User')
  create() {}
}
```

---

### [FACTBP-API-012] Switch Company

**Descrição:** Permitir usuário trocar de empresa ativa.

**Tasks:**

| # | Task | Status |
|---|------|--------|
| 12.1 | Criar `SwitchCompanyDTO` | ✅ |
| 12.2 | Criar `SwitchCompanyUseCase` | ✅ |
| 12.3 | Adicionar endpoint no AuthController | ✅ |

**Commits esperados:**
```
[FACTBP-API] feat(company): implement SwitchCompanyUseCase
[FACTBP-API] feat(auth): add switch-company endpoint
```

---

### [FACTBP-API-013] Permissions Endpoint

**Descrição:** Endpoint para retornar permissões do usuário na empresa.

**Tasks:**

| # | Task | Status |
|---|------|--------|
| 13.1 | Criar `GetPermissionsUseCase` | ✅ |
| 13.2 | Adicionar GET /auth/permissions | ✅ |

**Commits esperados:**
```
[FACTBP-API] feat(auth): add permissions endpoint
```

**Response:**
```json
{
  "data": {
    "role": "admin",
    "permissions": [
      { "action": "manage", "subject": "all" },
      { "action": "read", "subject": "User" },
      { "action": "create", "subject": "User" }
    ]
  }
}
```

---

### [FACTBP-API-014] Cache Service (Redis)

**Descrição:** Serviço de cache com Redis para produção e fallback em memória.

**Tasks:**

| # | Task | Status |
|---|------|--------|
| 14.1 | Instalar dependências (cache-manager, redis) | ✅ |
| 14.2 | Criar configuração de cache | ✅ |
| 14.3 | Criar interface ICacheService | ✅ |
| 14.4 | Criar MemoryCacheService | ✅ |
| 14.5 | Criar RedisCacheService | ✅ |
| 14.6 | Criar CacheModule | ✅ |
| 14.7 | Atualizar AbilityService para usar cache | ✅ |

**Arquivo detalhado:** [FACTBP-API-014](./sprint-03/FACTBP-API-014-cache-service.md)

---

## Critérios de Aceite

- [x] Header X-Company-ID obrigatório em rotas protegidas
- [x] Usuário só acessa empresas onde tem membership ativo
- [x] Permissões carregadas do banco (database-driven)
- [x] Cache de permissões por 5 minutos
- [x] @RequirePermission funciona em controllers
- [x] POST /auth/switch-company troca empresa
- [x] GET /auth/permissions retorna permissões
- [x] CacheService funciona com Redis em prod
- [x] CacheService funciona com memória em dev
- [x] AbilityService usa o CacheService

---

## Endpoints Novos

| Método | Endpoint | Auth | Descrição |
|--------|----------|------|-----------|
| POST | `/auth/switch-company` | ✅ | Trocar empresa ativa |
| GET | `/auth/permissions` | ✅ + Company | Listar permissões |

---

## Arquivos a Criar

```
src/
├── application/
│   ├── auth/
│   │   └── use-cases/
│   │       ├── switch-company.use-case.ts
│   │       └── get-permissions.use-case.ts
│   └── company/
│       └── services/
│           └── company.service.ts
├── infra/
│   ├── auth/
│   │   └── services/
│   │       └── ability.service.ts
│   └── http/
│       ├── guards/
│       │   ├── company.guard.ts
│       │   └── permissions.guard.ts
│       └── decorators/
│           ├── current-company.decorator.ts
│           └── require-permission.decorator.ts
```

---

*Sprint 3 de 7*
