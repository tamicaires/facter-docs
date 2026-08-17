# Sprint 1 - Fundação Backend

> Setup inicial do backend com Prisma, configuração e estrutura core.

---

## Resumo

| Item | Valor |
|------|-------|
| **Objetivo** | Estabelecer a base do backend NestJS |
| **Histórias** | 4 |
| **Tasks** | 14 |
| **Status** | ⏳ Pendente |
| **Dependências** | Nenhuma |

---

## Histórias (Detalhadas)

| ID | Título | Arquivo | Status |
|----|--------|---------|--------|
| FACTBP-API-001 | Setup Prisma e Database | [Detalhes](./sprint-01/FACTBP-API-001-prisma-setup.md) | ⏳ |
| FACTBP-API-002 | Configuração com Validação | [Detalhes](./sprint-01/FACTBP-API-002-config-validation.md) | ⏳ |
| FACTBP-API-003 | Core Domain Layer | [Detalhes](./sprint-01/FACTBP-API-003-core-domain.md) | ⏳ |
| FACTBP-API-004 | HTTP Layer Base | [Detalhes](./sprint-01/FACTBP-API-004-http-layer.md) | ⏳ |

---

## Histórias (Resumo)

### [FACTBP-API-001] Setup Prisma e Database

**Descrição:** Configurar Prisma com PostgreSQL, criar serviço e módulo.

**Tasks:**

| # | Task | Status |
|---|------|--------|
| 1.1 | Criar `prisma.service.ts` com lifecycle hooks | ⏳ |
| 1.2 | Criar `prisma.module.ts` como Global | ⏳ |
| 1.3 | Executar primeira migration | ⏳ |
| 1.4 | Criar seed com dados iniciais (permissions, roles) | ⏳ |

**Commits esperados:**
```
[FACTBP-API] feat(database): add PrismaService with lifecycle hooks
[FACTBP-API] feat(database): add PrismaModule as global module
[FACTBP-API] chore(database): run initial migration
[FACTBP-API] feat(database): add seed for permissions and roles
```

---

### [FACTBP-API-002] Configuração com Validação

**Descrição:** Implementar configuração tipada com validação Zod.

**Tasks:**

| # | Task | Status |
|---|------|--------|
| 2.1 | Criar `config/env.config.ts` com schema Zod | ⏳ |
| 2.2 | Criar `config/jwt.config.ts` | ⏳ |
| 2.3 | Criar `config/app.config.ts` | ⏳ |
| 2.4 | Integrar ConfigModule do NestJS | ⏳ |

**Commits esperados:**
```
[FACTBP-API] feat(config): add env validation with Zod
[FACTBP-API] feat(config): add JWT configuration
[FACTBP-API] feat(config): add app configuration
[FACTBP-API] chore(config): integrate NestJS ConfigModule
```

---

### [FACTBP-API-003] Core Domain Layer

**Descrição:** Criar camada de domínio puro (entities, exceptions, interfaces).

**Tasks:**

| # | Task | Status |
|---|------|--------|
| 3.1 | Criar `core/entities/user.entity.ts` | ⏳ |
| 3.2 | Criar `core/entities/token.entity.ts` | ⏳ |
| 3.3 | Criar `core/exceptions/domain.exception.ts` | ⏳ |
| 3.4 | Criar `core/repositories/` interfaces | ⏳ |

**Commits esperados:**
```
[FACTBP-API] feat(core): add User and Token entities
[FACTBP-API] feat(core): add domain exceptions
[FACTBP-API] feat(core): add repository interfaces
```

---

### [FACTBP-API-004] HTTP Layer Base

**Descrição:** Configurar interceptors, filters e pipes globais.

**Tasks:**

| # | Task | Status |
|---|------|--------|
| 4.1 | Criar `TransformInterceptor` (response format) | ⏳ |
| 4.2 | Criar `HttpExceptionFilter` (error handling) | ⏳ |
| 4.3 | Configurar ValidationPipe global | ⏳ |

**Commits esperados:**
```
[FACTBP-API] feat(http): add transform interceptor for response format
[FACTBP-API] feat(http): add HTTP exception filter
[FACTBP-API] chore(http): configure global validation pipe
```

---

## Critérios de Aceite

- [ ] Prisma conecta no PostgreSQL
- [ ] Migration inicial executada
- [ ] Seed cria permissions e roles padrão
- [ ] Env vars validadas no startup
- [ ] Responses seguem formato padrão `{ data, meta }`
- [ ] Errors seguem formato padrão `{ error: { code, message } }`

---

## Arquivos a Criar

```
src/
├── config/
│   ├── env.config.ts
│   ├── jwt.config.ts
│   └── app.config.ts
├── core/
│   ├── entities/
│   │   ├── user.entity.ts
│   │   └── token.entity.ts
│   ├── exceptions/
│   │   ├── domain.exception.ts
│   │   ├── invalid-credentials.exception.ts
│   │   └── user-not-found.exception.ts
│   └── repositories/
│       ├── user.repository.ts
│       └── refresh-token.repository.ts
├── infra/
│   ├── database/
│   │   └── prisma/
│   │       ├── prisma.service.ts
│   │       └── prisma.module.ts
│   └── http/
│       ├── interceptors/
│       │   └── transform.interceptor.ts
│       └── filters/
│           └── http-exception.filter.ts
└── shared/
    └── types/
        └── api-response.type.ts
```

---

*Sprint 1 de 7*
