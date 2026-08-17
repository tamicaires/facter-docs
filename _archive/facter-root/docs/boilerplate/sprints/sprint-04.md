# Sprint 4 - Fundação Frontend + Backend Security

> Setup inicial do frontend Next.js com arquitetura robusta e segurança de autenticação.

---

## Resumo

| Item | Valor |
|------|-------|
| **Objetivo** | Base sólida do frontend + Auth seguro com cookies |
| **Histórias** | 6 |
| **Tasks** | 20 |
| **Status** | 🔄 Em Progresso |
| **Dependências** | Sprint 3 (Auth backend) |

---

## Histórias

### [FACTBP-WEB-001] Estrutura Base ✅

**Descrição:** Organizar estrutura de pastas e arquivos base.

**Tasks:**

| # | Task | Status |
|---|------|--------|
| 1.1 | Criar estrutura de pastas (features, lib, providers, etc) | ✅ |
| 1.2 | Configurar path aliases no tsconfig | ✅ |
| 1.3 | Criar `config/env.ts` com validação | ✅ |

---

### [FACTBP-API-017] Auth com httpOnly Cookies ✅

**Descrição:** Migrar autenticação de localStorage para httpOnly cookies (segurança).

**Tasks:**

| # | Task | Status |
|---|------|--------|
| 17.1 | Criar cookie utils | ✅ |
| 17.2 | Criar Cookies decorator | ✅ |
| 17.3 | Atualizar JwtAuthGuard (ler cookie ou header) | ✅ |
| 17.4 | Atualizar AuthController (setar/limpar cookies) | ✅ |
| 17.5 | Configurar cookie-parser e CORS | ✅ |
| 17.6 | Atualizar testes | ✅ |

**Arquivo detalhado:** [FACTBP-API-017](./sprint-04/FACTBP-API-017-httponly-cookies.md)

---

### [FACTBP-WEB-002] API Client ✅

**Descrição:** API client robusto com Result pattern, Zod validation e httpOnly cookies.

**Tasks:**

| # | Task | Status |
|---|------|--------|
| 2.1 | Criar Result pattern (`lib/result.ts`) | ✅ |
| 2.2 | Criar API Error types (`lib/api/types.ts`) | ✅ |
| 2.3 | Criar API client (`lib/api/client.ts`) | ✅ |
| 2.4 | Criar Request helpers (`lib/api/request.ts`) | ✅ |
| 2.5 | Criar API routes (`config/api-routes.ts`) | ✅ |
| 2.6 | Criar Company storage (`lib/company-storage.ts`) | ✅ |
| 2.7 | Criar Index export (`lib/api/index.ts`) | ✅ |

**Arquivo detalhado:** [FACTBP-WEB-002](./sprint-04/FACTBP-WEB-002-api-client.md)

---

### [FACTBP-WEB-003] Providers Setup

**Descrição:** Configurar providers (Query, Theme, Auth).

**Tasks:**

| # | Task | Status |
|---|------|--------|
| 3.1 | Criar `providers/query-provider.tsx` | ⏳ |
| 3.2 | Criar `providers/app-providers.tsx` | ⏳ |
| 3.3 | Atualizar `app/layout.tsx` com providers | ⏳ |

---

### [FACTBP-WEB-004] Auth Store

**Descrição:** Criar store Zustand para autenticação (simplificado, sem tokens).

**Tasks:**

| # | Task | Status |
|---|------|--------|
| 4.1 | Criar `features/auth/stores/auth-store.ts` | ⏳ |
| 4.2 | Criar `features/auth/schemas/index.ts` (Zod) | ⏳ |
| 4.3 | Criar `features/auth/types/index.ts` | ⏳ |
| 4.4 | Criar `features/auth/index.ts` (barrel) | ⏳ |

**Store (simplificado - tokens em cookies):**
```typescript
interface AuthState {
  user: User | null;
  companyId: string | null;
  isAuthenticated: boolean;
}
```

---

### [FACTBP-WEB-005] Types e Utils

**Descrição:** Criar tipos globais e utilitários.

**Tasks:**

| # | Task | Status |
|---|------|--------|
| 5.1 | Criar `types/api.ts` (movido para lib/api/types.ts) | ⏳ |
| 5.2 | Criar `lib/utils.ts` (cn, formatters) | ⏳ |
| 5.3 | Criar `config/routes.ts` (constantes de rotas frontend) | ⏳ |

---

## Critérios de Aceite

### Backend (FACTBP-API-017) ✅
- [x] Tokens em httpOnly cookies
- [x] Cookies secure em produção
- [x] sameSite configurado
- [x] Guard lê de cookie OU header
- [x] CORS com credentials

### Frontend
- [x] Estrutura de pastas organizada
- [x] Path aliases funcionando (@/)
- [x] Env vars validadas
- [x] Result pattern implementado
- [x] API client com withCredentials
- [x] Zod validation em responses
- [ ] TanStack Query configurado
- [ ] Auth store criado (simplificado)

---

## Arquivos a Criar

### Backend
```
src/infra/http/
├── utils/
│   └── cookie.utils.ts
└── decorators/
    └── cookies.decorator.ts
```

### Frontend
```
src/
├── config/
│   ├── env.ts ✅
│   ├── routes.ts
│   └── api-routes.ts
├── features/
│   └── auth/
│       ├── schemas/
│       │   └── index.ts
│       ├── stores/
│       │   └── auth-store.ts
│       ├── types/
│       │   └── index.ts
│       └── index.ts
├── lib/
│   ├── api/
│   │   ├── client.ts
│   │   ├── request.ts
│   │   ├── types.ts
│   │   └── index.ts
│   ├── result.ts
│   ├── company-storage.ts
│   └── utils.ts
└── providers/
    ├── query-provider.tsx
    └── app-providers.tsx
```

---

## Ordem de Execução

1. ✅ **FACTBP-WEB-001** - Estrutura Base
2. ✅ **FACTBP-API-017** - Auth httpOnly Cookies (backend primeiro!)
3. ✅ **FACTBP-WEB-002** - API Client (depende do backend)
4. 🔜 **FACTBP-WEB-003** - Providers Setup
5. ⏳ **FACTBP-WEB-004** - Auth Store
6. ⏳ **FACTBP-WEB-005** - Types e Utils

---

*Sprint 4 de 7*
