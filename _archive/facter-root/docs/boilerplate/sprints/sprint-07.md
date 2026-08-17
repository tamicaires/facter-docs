# Sprint 7 - Infraestrutura, Feature Toggles & Testes

> Docker, CI/CD, feature toggles e testes automatizados.

---

## Resumo

| Item | Valor |
|------|-------|
| **Objetivo** | Infraestrutura pronta para deploy + qualidade |
| **Histórias** | 5 |
| **Tasks** | 24 |
| **Status** | ⏳ Pendente |
| **Dependências** | Sprint 6 |

---

## Histórias

### [FACTBP-INFRA-001] Feature Toggles

**Descrição:** Sistema de feature flags para módulos opcionais.

**Tasks:**

| # | Task | Status |
|---|------|--------|
| 1.1 | Criar `config/features.ts` no frontend | ⏳ |
| 1.2 | Criar `config/features.config.ts` no backend | ⏳ |
| 1.3 | Criar hook `useFeature` | ⏳ |
| 1.4 | Criar componente `<Feature>` | ⏳ |

**Commits esperados:**
```
[FACTBP-WEB] feat(config): add feature toggles configuration
[FACTBP-API] feat(config): add feature toggles configuration
[FACTBP-WEB] feat(features): add useFeature hook
[FACTBP-WEB] feat(features): add Feature component
```

**Frontend Config:**
```typescript
// config/features.ts
import { z } from 'zod'

const featuresSchema = z.object({
  // Core (sempre habilitado)
  auth: z.boolean().default(true),
  multiTenant: z.boolean().default(true),

  // Opcionais
  rbac: z.boolean().default(false),
  notifications: z.boolean().default(false),
  auditLog: z.boolean().default(false),
  globalSearch: z.boolean().default(false),
  fileUpload: z.boolean().default(false),
  webhooks: z.boolean().default(false),
  apiKeys: z.boolean().default(false),
})

export const features = featuresSchema.parse({
  auth: true,
  multiTenant: true,
  rbac: process.env.NEXT_PUBLIC_FEATURE_RBAC === 'true',
  notifications: process.env.NEXT_PUBLIC_FEATURE_NOTIFICATIONS === 'true',
  auditLog: process.env.NEXT_PUBLIC_FEATURE_AUDIT === 'true',
  globalSearch: process.env.NEXT_PUBLIC_FEATURE_SEARCH === 'true',
  fileUpload: process.env.NEXT_PUBLIC_FEATURE_UPLOAD === 'true',
  webhooks: process.env.NEXT_PUBLIC_FEATURE_WEBHOOKS === 'true',
  apiKeys: process.env.NEXT_PUBLIC_FEATURE_API_KEYS === 'true',
})

export type FeatureKey = keyof typeof features
```

**Hook:**
```typescript
// hooks/use-feature.ts
export function useFeature(feature: FeatureKey): boolean {
  return features[feature] ?? false
}
```

**Component:**
```typescript
// components/feature.tsx
export function Feature({
  name,
  children,
  fallback = null
}: {
  name: FeatureKey
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const enabled = useFeature(name)
  return enabled ? children : fallback
}

// Uso
<Feature name="notifications">
  <NotificationBell />
</Feature>
```

---

### [FACTBP-INFRA-002] Docker Setup

**Descrição:** Dockerfiles e docker-compose para desenvolvimento e produção.

**Tasks:**

| # | Task | Status |
|---|------|--------|
| 2.1 | Criar `Dockerfile` no backend (multi-stage) | ⏳ |
| 2.2 | Criar `Dockerfile` no frontend (multi-stage) | ⏳ |
| 2.3 | Criar `docker-compose.yml` (dev) | ⏳ |
| 2.4 | Criar `docker-compose.prod.yml` | ⏳ |
| 2.5 | Criar `.dockerignore` | ⏳ |

**Commits esperados:**
```
[FACTBP-API] chore(docker): add Dockerfile with multi-stage build
[FACTBP-WEB] chore(docker): add Dockerfile with multi-stage build
[FACTBP-INFRA] chore(docker): add docker-compose for development
[FACTBP-INFRA] chore(docker): add docker-compose for production
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: facter
      POSTGRES_PASSWORD: facter123
      POSTGRES_DB: facter_boilerplate
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  api:
    build:
      context: ./facter-boilerplate-api
      target: development
    volumes:
      - ./facter-boilerplate-api:/app
      - /app/node_modules
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://facter:facter123@postgres:5432/facter_boilerplate
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis

  web:
    build:
      context: ./facter-boilerplate-web
      target: development
    volumes:
      - ./facter-boilerplate-web:/app
      - /app/node_modules
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3001
    depends_on:
      - api

volumes:
  postgres_data:
```

---

### [FACTBP-INFRA-003] CI/CD (GitHub Actions)

**Descrição:** Workflows para lint, test e build.

**Tasks:**

| # | Task | Status |
|---|------|--------|
| 3.1 | Criar workflow `lint.yml` | ⏳ |
| 3.2 | Criar workflow `test.yml` | ⏳ |
| 3.3 | Criar workflow `build.yml` | ⏳ |
| 3.4 | Configurar branch protection rules | ⏳ |

**Commits esperados:**
```
[FACTBP-INFRA] ci: add lint workflow
[FACTBP-INFRA] ci: add test workflow
[FACTBP-INFRA] ci: add build workflow
```

**lint.yml:**
```yaml
name: Lint

on:
  pull_request:
    branches: [main, develop]

jobs:
  lint-api:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./facter-boilerplate-api
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm lint

  lint-web:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./facter-boilerplate-web
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm lint
```

---

### [FACTBP-INFRA-004] Testes

**Descrição:** Setup de testes unitários e de integração.

**Tasks:**

| # | Task | Status |
|---|------|--------|
| 4.1 | Configurar Jest no backend | ⏳ |
| 4.2 | Configurar Vitest no frontend | ⏳ |
| 4.3 | Criar testes para auth use cases | ⏳ |
| 4.4 | Criar testes para auth hooks | ⏳ |

**Commits esperados:**
```
[FACTBP-API] test: configure Jest
[FACTBP-WEB] test: configure Vitest
[FACTBP-API] test: add auth use cases tests
[FACTBP-WEB] test: add auth hooks tests
```

---

### [FACTBP-INFRA-005] Health Check

**Descrição:** Endpoints de health check para monitoramento e deploy.

**Tasks:**

| # | Task | Status |
|---|------|--------|
| 5.1 | Instalar @nestjs/terminus | ⏳ |
| 5.2 | Criar HealthController | ⏳ |
| 5.3 | Criar PrismaHealthIndicator | ⏳ |
| 5.4 | Criar RedisHealthIndicator | ⏳ |
| 5.5 | Criar HealthModule | ⏳ |
| 5.6 | Atualizar AppModule | ⏳ |
| 5.7 | Criar response types | ⏳ |
| 5.8 | Configurar skip de auth | ⏳ |

**Arquivo detalhado:** [FACTBP-INFRA-005](./sprint-07/FACTBP-INFRA-005-health-check.md)

**Endpoints:**
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/health` | Status geral (db, memory, disk) |
| GET | `/health/live` | Liveness probe (app rodando) |
| GET | `/health/ready` | Readiness probe (aceita tráfego) |

---

## Critérios de Aceite

- [ ] Feature toggles funcionam via env vars
- [ ] `<Feature>` component funciona
- [ ] Docker compose sobe toda a stack
- [ ] CI roda lint em PRs
- [ ] CI roda testes em PRs
- [ ] CI roda build em PRs
- [ ] Cobertura de testes > 70% em auth
- [ ] GET /health retorna status de todos os serviços
- [ ] GET /health/live funciona para liveness probe
- [ ] GET /health/ready funciona para readiness probe
- [ ] Health endpoints são públicos (sem auth)

---

## Arquivos a Criar

**Frontend:**
```
src/
├── config/
│   └── features.ts
├── hooks/
│   └── use-feature.ts
└── components/
    └── common/
        └── feature.tsx

.github/
└── workflows/
    └── ci.yml

Dockerfile
.dockerignore
```

**Backend:**
```
src/
└── config/
    └── features.config.ts

.github/
└── workflows/
    └── ci.yml

Dockerfile
.dockerignore
```

**Root (facter-boilerplate):**
```
docker-compose.yml
docker-compose.prod.yml
```

---

## Env Vars de Feature Toggles

```bash
# .env.example (frontend)
NEXT_PUBLIC_FEATURE_RBAC=false
NEXT_PUBLIC_FEATURE_NOTIFICATIONS=false
NEXT_PUBLIC_FEATURE_AUDIT=false
NEXT_PUBLIC_FEATURE_SEARCH=false
NEXT_PUBLIC_FEATURE_UPLOAD=false
NEXT_PUBLIC_FEATURE_WEBHOOKS=false
NEXT_PUBLIC_FEATURE_API_KEYS=false

# .env.example (backend)
FEATURE_RBAC=false
FEATURE_NOTIFICATIONS=false
FEATURE_AUDIT=false
FEATURE_WEBHOOKS=false
```

---

*Sprint 7 de 7 - Final*
