# [FACTBP-INFRA-002] Docker Setup

> Dockerfiles e docker-compose para desenvolvimento e produção.

---

## Status: ⏳ Pendente

## Contexto

**Estratégia:**
- Multi-stage builds para imagens menores
- Development target com hot reload
- Production target otimizado
- docker-compose para orquestração local

---

## Tasks

### Task 2.1: Criar Dockerfile (Backend)

**Arquivo:** `facter-boilerplate-api/Dockerfile`

**Implementação:**
```dockerfile
# ============================================
# Base
# ============================================
FROM node:20-alpine AS base

RUN corepack enable && corepack prepare pnpm@9.15.5 --activate

WORKDIR /app

# ============================================
# Dependencies
# ============================================
FROM base AS deps

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

RUN pnpm install --frozen-lockfile

# Generate Prisma client
RUN pnpm prisma generate

# ============================================
# Development
# ============================================
FROM base AS development

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=development

EXPOSE 3001

CMD ["pnpm", "start:dev"]

# ============================================
# Builder
# ============================================
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm build

# ============================================
# Production
# ============================================
FROM base AS production

ENV NODE_ENV=production

# Copy only production dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY package.json ./

# Remove dev dependencies
RUN pnpm prune --prod

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs
USER nestjs

EXPOSE 3001

CMD ["node", "dist/main.js"]
```

**Commit:** `[FACTBP-API] chore(docker): add Dockerfile with multi-stage build`

**Status:** ⏳

---

### Task 2.2: Criar Dockerfile (Frontend)

**Arquivo:** `facter-boilerplate-web/Dockerfile`

**Implementação:**
```dockerfile
# ============================================
# Base
# ============================================
FROM node:20-alpine AS base

RUN corepack enable && corepack prepare pnpm@9.15.5 --activate

WORKDIR /app

# ============================================
# Dependencies
# ============================================
FROM base AS deps

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

# ============================================
# Development
# ============================================
FROM base AS development

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

EXPOSE 3000

CMD ["pnpm", "dev"]

# ============================================
# Builder
# ============================================
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build args for env vars
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_NAME

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_NAME=$NEXT_PUBLIC_APP_NAME
ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm build

# ============================================
# Production
# ============================================
FROM base AS production

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy build output
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

**Nota:** Requer `output: 'standalone'` no `next.config.js`.

**Commit:** `[FACTBP-WEB] chore(docker): add Dockerfile with multi-stage build`

**Status:** ⏳

---

### Task 2.3: Criar .dockerignore

**Arquivo:** `facter-boilerplate-api/.dockerignore`

```
node_modules
.git
.gitignore
.env*
!.env.example
dist
coverage
.nyc_output
*.log
.DS_Store
Thumbs.db
```

**Arquivo:** `facter-boilerplate-web/.dockerignore`

```
node_modules
.git
.gitignore
.env*
!.env.example
.next
out
coverage
.nyc_output
*.log
.DS_Store
Thumbs.db
```

**Status:** ⏳

---

### Task 2.4: Criar docker-compose.yml (Development)

**Arquivo:** `docker-compose.yml` (na raiz do monorepo)

**Implementação:**
```yaml
version: '3.8'

services:
  # ============================================
  # Database
  # ============================================
  postgres:
    image: postgres:16-alpine
    container_name: facter-postgres
    environment:
      POSTGRES_USER: facter
      POSTGRES_PASSWORD: facter123
      POSTGRES_DB: facter_boilerplate
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U facter -d facter_boilerplate"]
      interval: 5s
      timeout: 5s
      retries: 5

  # ============================================
  # Redis (para cache/sessions)
  # ============================================
  redis:
    image: redis:7-alpine
    container_name: facter-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

  # ============================================
  # Backend API
  # ============================================
  api:
    build:
      context: ./facter-boilerplate-api
      target: development
    container_name: facter-api
    volumes:
      - ./facter-boilerplate-api:/app
      - /app/node_modules
    ports:
      - "3001:3001"
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://facter:facter123@postgres:5432/facter_boilerplate
      REDIS_URL: redis://redis:6379
      JWT_SECRET: dev-secret-change-in-production
      JWT_REFRESH_SECRET: dev-refresh-secret-change-in-production
      JWT_EXPIRES_IN: 15m
      JWT_REFRESH_EXPIRES_IN_DAYS: 7
      PORT: 3001
      FRONTEND_URL: http://localhost:3000
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

  # ============================================
  # Frontend Web
  # ============================================
  web:
    build:
      context: ./facter-boilerplate-web
      target: development
    container_name: facter-web
    volumes:
      - ./facter-boilerplate-web:/app
      - /app/node_modules
      - /app/.next
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: development
      NEXT_PUBLIC_API_URL: http://localhost:3001/api
      NEXT_PUBLIC_APP_NAME: Facter
    depends_on:
      - api

volumes:
  postgres_data:
  redis_data:

networks:
  default:
    name: facter-network
```

**Commit:** `[FACTBP-INFRA] chore(docker): add docker-compose for development`

**Status:** ⏳

---

### Task 2.5: Criar docker-compose.prod.yml

**Arquivo:** `docker-compose.prod.yml`

**Implementação:**
```yaml
version: '3.8'

services:
  # ============================================
  # Database (produção usa managed database)
  # ============================================
  # postgres:
  #   Em produção, usar um serviço gerenciado como:
  #   - AWS RDS
  #   - Google Cloud SQL
  #   - Azure Database
  #   - Supabase
  #   - Neon

  # ============================================
  # Backend API
  # ============================================
  api:
    build:
      context: ./facter-boilerplate-api
      target: production
    container_name: facter-api-prod
    restart: unless-stopped
    ports:
      - "3001:3001"
    environment:
      NODE_ENV: production
      DATABASE_URL: ${DATABASE_URL}
      REDIS_URL: ${REDIS_URL}
      JWT_SECRET: ${JWT_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
      JWT_EXPIRES_IN: ${JWT_EXPIRES_IN:-15m}
      JWT_REFRESH_EXPIRES_IN_DAYS: ${JWT_REFRESH_EXPIRES_IN_DAYS:-7}
      PORT: 3001
      FRONTEND_URL: ${FRONTEND_URL}
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # ============================================
  # Frontend Web
  # ============================================
  web:
    build:
      context: ./facter-boilerplate-web
      target: production
      args:
        NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL}
        NEXT_PUBLIC_APP_NAME: ${NEXT_PUBLIC_APP_NAME:-Facter}
    container_name: facter-web-prod
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
    depends_on:
      api:
        condition: service_healthy

  # ============================================
  # Nginx Reverse Proxy (opcional)
  # ============================================
  # nginx:
  #   image: nginx:alpine
  #   ports:
  #     - "80:80"
  #     - "443:443"
  #   volumes:
  #     - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
  #     - ./nginx/ssl:/etc/nginx/ssl:ro
  #   depends_on:
  #     - web
  #     - api

networks:
  default:
    name: facter-network-prod
```

**Commit:** `[FACTBP-INFRA] chore(docker): add docker-compose for production`

**Status:** ⏳

---

### Task 2.6: Criar Makefile

**Arquivo:** `Makefile`

**Implementação:**
```makefile
.PHONY: help dev up down build logs shell-api shell-web db-push db-seed db-studio clean

# Default target
help:
	@echo "Facter Boilerplate - Available commands:"
	@echo ""
	@echo "  make dev        - Start development environment"
	@echo "  make up         - Start containers in background"
	@echo "  make down       - Stop and remove containers"
	@echo "  make build      - Build all containers"
	@echo "  make logs       - View container logs"
	@echo "  make shell-api  - Open shell in API container"
	@echo "  make shell-web  - Open shell in Web container"
	@echo "  make db-push    - Push Prisma schema to database"
	@echo "  make db-seed    - Run database seed"
	@echo "  make db-studio  - Open Prisma Studio"
	@echo "  make clean      - Remove all containers, volumes and images"
	@echo ""

# Development
dev:
	docker compose up

up:
	docker compose up -d

down:
	docker compose down

build:
	docker compose build

logs:
	docker compose logs -f

# Shell access
shell-api:
	docker compose exec api sh

shell-web:
	docker compose exec web sh

# Database
db-push:
	docker compose exec api pnpm prisma db push

db-seed:
	docker compose exec api pnpm prisma db seed

db-studio:
	docker compose exec api pnpm prisma studio

# Cleanup
clean:
	docker compose down -v --rmi all --remove-orphans
```

**Status:** ⏳

---

## Critérios de Aceite

- [ ] `docker compose up` inicia toda a stack
- [ ] Hot reload funciona no desenvolvimento
- [ ] Build de produção é otimizado
- [ ] Imagens de produção são pequenas
- [ ] Health checks funcionam
- [ ] Volumes persistem dados
- [ ] Makefile facilita comandos comuns

---

*Task de [Sprint 7](../sprint-07.md)*
