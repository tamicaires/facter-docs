# [FACTBP-INFRA-003] CI/CD (GitHub Actions)

> Workflows para lint, test e build.

---

## Status: ⏳ Pendente

## Contexto

**GitHub Actions:**
- Lint em PRs e pushes
- Testes em PRs
- Build para validar
- Caching de dependências

---

## Tasks

### Task 3.1: Criar CI Workflow

**Arquivo:** `.github/workflows/ci.yml` (na raiz do monorepo)

**Implementação:**
```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  PNPM_VERSION: 9.15.5
  NODE_VERSION: 20

jobs:
  # ============================================
  # Lint
  # ============================================
  lint-api:
    name: Lint API
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./facter-boilerplate-api

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
          cache-dependency-path: '**/pnpm-lock.yaml'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run ESLint
        run: pnpm lint

      - name: Run Prettier check
        run: pnpm format:check

      - name: TypeScript check
        run: pnpm type-check

  lint-web:
    name: Lint Web
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./facter-boilerplate-web

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
          cache-dependency-path: '**/pnpm-lock.yaml'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run ESLint
        run: pnpm lint

      - name: TypeScript check
        run: pnpm type-check

  # ============================================
  # Test
  # ============================================
  test-api:
    name: Test API
    runs-on: ubuntu-latest
    needs: lint-api
    defaults:
      run:
        working-directory: ./facter-boilerplate-api

    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
          cache-dependency-path: '**/pnpm-lock.yaml'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Generate Prisma client
        run: pnpm prisma generate

      - name: Run tests
        run: pnpm test:cov
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test
          JWT_SECRET: test-secret
          JWT_REFRESH_SECRET: test-refresh-secret

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./facter-boilerplate-api/coverage/lcov.info
          flags: api
          fail_ci_if_error: false

  test-web:
    name: Test Web
    runs-on: ubuntu-latest
    needs: lint-web
    defaults:
      run:
        working-directory: ./facter-boilerplate-web

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
          cache-dependency-path: '**/pnpm-lock.yaml'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run tests
        run: pnpm test:cov

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./facter-boilerplate-web/coverage/lcov.info
          flags: web
          fail_ci_if_error: false

  # ============================================
  # Build
  # ============================================
  build-api:
    name: Build API
    runs-on: ubuntu-latest
    needs: test-api
    defaults:
      run:
        working-directory: ./facter-boilerplate-api

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
          cache-dependency-path: '**/pnpm-lock.yaml'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Generate Prisma client
        run: pnpm prisma generate

      - name: Build
        run: pnpm build

  build-web:
    name: Build Web
    runs-on: ubuntu-latest
    needs: test-web
    defaults:
      run:
        working-directory: ./facter-boilerplate-web

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
          cache-dependency-path: '**/pnpm-lock.yaml'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm build
        env:
          NEXT_PUBLIC_API_URL: https://api.example.com
          NEXT_PUBLIC_APP_NAME: Facter
```

**Commit:** `[FACTBP-INFRA] ci: add CI workflow with lint, test and build`

**Status:** ⏳

---

### Task 3.2: Criar Scripts de Package.json

**Arquivo:** `facter-boilerplate-api/package.json` (scripts adicionais)

```json
{
  "scripts": {
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\"",
    "lint:fix": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
    "format:check": "prettier --check \"src/**/*.ts\" \"test/**/*.ts\"",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:e2e": "jest --config ./test/jest-e2e.json"
  }
}
```

**Arquivo:** `facter-boilerplate-web/package.json` (scripts adicionais)

```json
{
  "scripts": {
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:cov": "vitest --coverage"
  }
}
```

**Status:** ⏳

---

### Task 3.3: Criar Branch Protection Rules

**Configuração no GitHub:**

1. Ir em Settings > Branches > Add rule
2. Branch name pattern: `main`
3. Marcar:
   - [x] Require a pull request before merging
   - [x] Require status checks to pass before merging
     - Lint API
     - Lint Web
     - Test API
     - Test Web
     - Build API
     - Build Web
   - [x] Require branches to be up to date before merging
4. Repetir para `develop` (opcional)

**Status:** ⏳

---

## Critérios de Aceite

- [ ] CI roda em PRs para main/develop
- [ ] Lint falha se houver erros
- [ ] Testes rodam com banco PostgreSQL
- [ ] Build valida compilação
- [ ] Coverage é reportado
- [ ] Branch protection configurado

---

*Task de [Sprint 7](../sprint-07.md)*
