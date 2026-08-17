# Facter Boilerplate - Task Tracker

> Histórico completo e status de todas as tasks do projeto.
> **Atualize este arquivo sempre que mudar o status de uma task.**

---

## Status Geral

| Métrica | Valor |
|---------|-------|
| **Total de Sprints** | 7 |
| **Total de Histórias** | 37 |
| **Total de Tasks** | ~116 |
| **Concluídas** | 32 |
| **Em Progresso** | 0 |
| **Pendentes** | 6 |

```
Progresso: [█████████████████░░░] 84%
```

---

## Task Atual

> **Task concluída:** FACTBP-WEB-014 - Settings Pages ✅
>
> **Próxima task:** [FACTBP-WEB-015 - RBAC Components](./sprints/sprint-06/FACTBP-WEB-015-rbac-components.md) (Sprint 6)

---

## Histórico de Tasks

### Formato
```
| ID | Task | Sprint | Status | Início | Fim | Notas |
```

### Legenda
- ⏳ Pendente
- 🔄 Em Progresso
- ✅ Concluído
- ❌ Bloqueado
- 🔜 Próximo

---

## Sprint 1 - Fundação Backend

| ID | Task | Status | Início | Fim | Detalhes |
|----|------|--------|--------|-----|----------|
| FACTBP-API-001 | Setup Prisma e Database | ✅ | 2025-12-15 | 2025-12-15 | [Link](./sprints/sprint-01/FACTBP-API-001-prisma-setup.md) |
| FACTBP-API-002 | Configuração com Validação | ✅ | 2025-12-15 | 2025-12-15 | [Link](./sprints/sprint-01/FACTBP-API-002-config-validation.md) |
| FACTBP-API-003 | Core Domain Layer | ✅ | 2025-12-15 | 2025-12-15 | [Link](./sprints/sprint-01/FACTBP-API-003-core-domain.md) |
| FACTBP-API-004 | HTTP Layer Base | ✅ | 2025-12-15 | 2025-12-15 | [Link](./sprints/sprint-01/FACTBP-API-004-http-layer.md) |

**Sprint 1 Progress:** `[██████████] 4/4` ✅

---

## Sprint 2 - Autenticação Backend

| ID | Task | Status | Início | Fim | Detalhes |
|----|------|--------|--------|-----|----------|
| FACTBP-API-005 | Auth Services | ✅ | 2025-12-15 | 2025-12-15 | [Link](./sprints/sprint-02/FACTBP-API-005-auth-services.md) |
| FACTBP-API-006 | Login Use Case | ✅ | 2025-12-15 | 2025-12-15 | [Link](./sprints/sprint-02/FACTBP-API-006-login-usecase.md) |
| FACTBP-API-007 | Register Use Case | ✅ | 2025-12-15 | 2025-12-15 | [Link](./sprints/sprint-02/FACTBP-API-007-register-usecase.md) |
| FACTBP-API-008 | Refresh Token Use Case | ✅ | 2025-12-15 | 2025-12-15 | [Link](./sprints/sprint-02/FACTBP-API-008-refresh-token-usecase.md) |
| FACTBP-API-009 | Auth Controller & Module | ✅ | 2025-12-15 | 2025-12-15 | [Link](./sprints/sprint-02/FACTBP-API-009-auth-controller.md) |
| FACTBP-API-014 | Password Recovery | ✅ | 2025-12-15 | 2025-12-15 | [Link](./sprints/sprint-02/FACTBP-API-014-password-recovery.md) |
| FACTBP-API-015 | Mail Service | ✅ | 2025-12-15 | 2025-12-15 | [Link](./sprints/sprint-02/FACTBP-API-015-mail-service.md) |
| FACTBP-API-016 | Throttle Guard | ✅ | 2025-12-15 | 2025-12-15 | [Link](./sprints/sprint-02/FACTBP-API-016-throttle-guard.md) |

**Sprint 2 Progress:** `[██████████] 8/8` ✅

---

## Sprint 3 - Multi-tenancy & RBAC

| ID | Task | Status | Início | Fim | Detalhes |
|----|------|--------|--------|-----|----------|
| FACTBP-API-010 | Company Guard | ✅ | 2025-12-16 | 2025-12-16 | [Link](./sprints/sprint-03/FACTBP-API-010-company-guard.md) |
| FACTBP-API-011 | RBAC com CASL | ✅ | 2025-12-16 | 2025-12-16 | [Link](./sprints/sprint-03/FACTBP-API-011-rbac-casl.md) |
| FACTBP-API-012 | Switch Company | ✅ | 2025-12-16 | 2025-12-16 | [Link](./sprints/sprint-03/FACTBP-API-012-switch-company.md) |
| FACTBP-API-013 | Permissions Endpoint | ✅ | 2025-12-16 | 2025-12-16 | [Link](./sprints/sprint-03/FACTBP-API-013-permissions-endpoint.md) |
| FACTBP-API-014 | Cache Service (Redis) | ✅ | 2025-12-16 | 2025-12-16 | [Link](./sprints/sprint-03/FACTBP-API-014-cache-service.md) |

**Sprint 3 Progress:** `[██████████] 5/5` ✅

---

## Sprint 4 - Fundação Frontend + Backend Security

| ID | Task | Status | Início | Fim | Detalhes |
|----|------|--------|--------|-----|----------|
| FACTBP-WEB-001 | Estrutura Base | ✅ | 2025-12-16 | 2025-12-16 | [Link](./sprints/sprint-04/FACTBP-WEB-001-estrutura-base.md) |
| FACTBP-API-017 | Auth httpOnly Cookies | ✅ | 2025-12-16 | 2025-12-16 | [Link](./sprints/sprint-04/FACTBP-API-017-httponly-cookies.md) |
| FACTBP-WEB-002 | API Client | ✅ | 2025-12-16 | 2025-12-16 | [Link](./sprints/sprint-04/FACTBP-WEB-002-api-client.md) |
| FACTBP-WEB-003 | Providers Setup | ✅ | 2025-12-16 | 2025-12-16 | [Link](./sprints/sprint-04/FACTBP-WEB-003-providers-setup.md) |
| FACTBP-WEB-004 | Auth Store | ✅ | 2025-12-16 | 2025-12-16 | [Link](./sprints/sprint-04/FACTBP-WEB-004-auth-store.md) |
| FACTBP-WEB-005 | Types e Utils | ✅ | 2025-12-16 | 2025-12-16 | [Link](./sprints/sprint-04/FACTBP-WEB-005-types-utils.md) |

**Sprint 4 Progress:** `[██████████] 6/6` ✅

---

## Sprint 5 - Autenticação Frontend

| ID | Task | Status | Início | Fim | Detalhes |
|----|------|--------|--------|-----|----------|
| FACTBP-WEB-006 | Auth Services e Hooks | ✅ | 2025-12-16 | 2025-12-16 | [Link](./sprints/sprint-05/FACTBP-WEB-006-auth-services-hooks.md) |
| FACTBP-WEB-007 | Login Page | ✅ | 2025-12-16 | 2025-12-16 | [Link](./sprints/sprint-05/FACTBP-WEB-007-login-page.md) |
| FACTBP-WEB-008 | Register Page | ✅ | 2025-12-16 | 2025-12-16 | [Link](./sprints/sprint-05/FACTBP-WEB-008-register-page.md) |
| FACTBP-WEB-009 | Password Recovery | ✅ | 2025-12-16 | 2025-12-16 | [Link](./sprints/sprint-05/FACTBP-WEB-009-password-recovery.md) |
| FACTBP-WEB-010 | Auth Middleware | ✅ | 2025-12-17 | 2025-12-17 | [Link](./sprints/sprint-05/FACTBP-WEB-010-auth-middleware.md) |

**Sprint 5 Progress:** `[██████████] 5/5` ✅

---

## Sprint 6 - Dashboard & Settings

| ID | Task | Status | Início | Fim | Detalhes |
|----|------|--------|--------|-----|----------|
| FACTBP-WEB-011 | Company Feature | ✅ | 2025-12-17 | 2025-12-17 | [Link](./sprints/sprint-06/FACTBP-WEB-011-company-feature.md) |
| FACTBP-WEB-012 | Dashboard Layout | ✅ | 2025-12-17 | 2025-12-17 | [Link](./sprints/sprint-06/FACTBP-WEB-012-dashboard-layout.md) |
| FACTBP-WEB-013 | Dashboard Home | ✅ | 2025-12-17 | 2025-12-17 | [Link](./sprints/sprint-06/FACTBP-WEB-013-dashboard-home.md) |
| FACTBP-WEB-014 | Settings Pages | ✅ | 2025-12-17 | 2025-12-17 | [Link](./sprints/sprint-06/FACTBP-WEB-014-settings-pages.md) |
| FACTBP-WEB-015 | RBAC Components | 🔜 | - | - | [Link](./sprints/sprint-06/FACTBP-WEB-015-rbac-components.md) |

**Sprint 6 Progress:** `[████████░░] 4/5`

---

## Sprint 7 - Infraestrutura & Testes

| ID | Task | Status | Início | Fim | Detalhes |
|----|------|--------|--------|-----|----------|
| FACTBP-INFRA-001 | Feature Toggles | ⏳ | - | - | [Link](./sprints/sprint-07/FACTBP-INFRA-001-feature-toggles.md) |
| FACTBP-INFRA-002 | Docker Setup | ⏳ | - | - | [Link](./sprints/sprint-07/FACTBP-INFRA-002-docker-setup.md) |
| FACTBP-INFRA-003 | CI/CD | ⏳ | - | - | [Link](./sprints/sprint-07/FACTBP-INFRA-003-ci-cd.md) |
| FACTBP-INFRA-004 | Testes | ⏳ | - | - | [Link](./sprints/sprint-07/FACTBP-INFRA-004-tests.md) |
| FACTBP-INFRA-005 | Health Check | ⏳ | - | - | [Link](./sprints/sprint-07/FACTBP-INFRA-005-health-check.md) |

**Sprint 7 Progress:** `[░░░░░░░░░░] 0/5`

---

## Fluxo de Trabalho

### Ao Iniciar uma Task

1. Encontre a task neste arquivo
2. Mude o status para `🔄`
3. Adicione a data de início
4. Atualize a seção "Task Atual" acima
5. Leia o arquivo de detalhes da task

```markdown
# Exemplo de atualização:
| FACTBP-API-001 | Setup Prisma | 🔄 | 2024-12-15 | - | [Link](...) |
```

### Ao Concluir uma Task

1. Mude o status para `✅`
2. Adicione a data de fim
3. Atualize a barra de progresso da sprint
4. Mude a próxima task para `🔜`
5. Commit: `[FACTBP-DOCS] chore: update task tracker`

```markdown
# Exemplo de atualização:
| FACTBP-API-001 | Setup Prisma | ✅ | 2024-12-15 | 2024-12-15 | [Link](...) |
```

### Ao Encontrar Bloqueio

1. Mude o status para `❌`
2. Adicione nota explicando o bloqueio
3. Documente a dependência

---

## Dependências entre Tasks

```
FACTBP-API-001 (Prisma)
    └──▶ FACTBP-API-002 (Config)
         └──▶ FACTBP-API-003 (Domain)
              └──▶ FACTBP-API-004 (HTTP)
                   └──▶ FACTBP-API-005 (Auth Services)
                        └──▶ FACTBP-API-006 (Login)
                             └──▶ FACTBP-API-007 (Register)
                                  └──▶ FACTBP-API-008 (Refresh)
                                       └──▶ FACTBP-API-009 (Controller)
                                            ├──▶ FACTBP-API-014 (Password Recovery)
                                            ├──▶ FACTBP-API-015 (Mail)
                                            └──▶ FACTBP-API-016 (Throttle)

FACTBP-API-009 (Auth Controller)
    └──▶ FACTBP-API-010 (Company Guard)
         └──▶ FACTBP-API-011 (CASL)
              ├──▶ FACTBP-API-012 (Switch)
              ├──▶ FACTBP-API-013 (Permissions)
              └──▶ FACTBP-API-014 (Cache) [Sprint 3]

FACTBP-WEB-001 (Estrutura)
    └──▶ FACTBP-API-017 (httpOnly Cookies)
         └──▶ FACTBP-WEB-002 (API Client)
         └──▶ FACTBP-WEB-003 (Providers)
              └──▶ FACTBP-WEB-004 (Auth Store)
                   └──▶ FACTBP-WEB-005 (Types)
                        └──▶ FACTBP-WEB-006 (Auth Hooks)
                             └──▶ FACTBP-WEB-007 (Login)
                                  └──▶ FACTBP-WEB-008 (Register)
                                       └──▶ FACTBP-WEB-009 (Recovery)
                                            └──▶ FACTBP-WEB-010 (Middleware)

FACTBP-WEB-010 (Auth Middleware) + FACTBP-API-013 (Permissions)
    └──▶ FACTBP-WEB-011 (Company)
         └──▶ FACTBP-WEB-012 (Dashboard Layout)
              └──▶ FACTBP-WEB-013 (Dashboard Home)
                   ├──▶ FACTBP-WEB-014 (Settings)
                   └──▶ FACTBP-WEB-015 (RBAC Components)

FACTBP-WEB-015 (RBAC) + Todos anteriores
    └──▶ FACTBP-INFRA-001 (Features)
         └──▶ FACTBP-INFRA-002 (Docker)
              └──▶ FACTBP-INFRA-003 (CI/CD)
                   └──▶ FACTBP-INFRA-004 (Tests)
                        └──▶ FACTBP-INFRA-005 (Health)
```

---

## Notas e Decisões

> Adicione aqui qualquer nota importante sobre decisões tomadas durante o desenvolvimento.

### 2025-12-16 - Arquitetura Frontend Definida

**Decisão:** Arquitetura em camadas com Repository pattern (sem UseCase).

**Estrutura por Feature:**
```
features/[feature]/
├── domain/           # Entities + Zod Schemas
├── data/             # Repository (interface) + Service (implementação)
├── presentation/     # Hooks + Components
├── stores/           # Zustand
└── index.ts          # Public API
```

**Decisões:**
1. **Repository pattern** - Interface abstrata + Service implementation
2. **Sem UseCase** - Hooks com TanStack Query fazem esse papel
3. **Import direto** - Services importados diretamente (não injeção DI)
4. **MSW para testes** - Mock na camada de rede
5. **Stores na feature** - Co-location com a feature

**Testes:**
- Schemas: 100% cobertura (Unit/Vitest)
- Services: 90%+ cobertura (Integration/MSW)
- Hooks: 80%+ cobertura (RTL/MSW)
- Components: 70%+ cobertura (RTL)
- E2E: Fluxos críticos (Playwright)

**Docs atualizados:**
- `docs/boilerplate/guidelines/frontend-standards.md`
- `docs/boilerplate/guidelines/testing-strategy.md`
- `CLAUDE.md`

---

### 2024-12-15
- Documentação completa criada
- 37 histórias planejadas em 7 sprints
- Próximo passo: iniciar Sprint 1

### 2025-12-15
- FACTBP-API-001: Concluída - Setup Prisma e Database
- PrismaService e PrismaModule criados
- Migration inicial executada com todas as tabelas
- Seed criado com 15 permissions padrão
- docker-compose.yml criado para dev (PostgreSQL + Redis)
- FACTBP-API-002: Concluída - Configuração com Validação
- Validação de env com Zod implementada
- ConfigModule integrado com configs tipadas (jwt, app)
- FACTBP-API-003: Concluída - Core Domain Layer
- Entities: User e RefreshToken com Zod validation
- Exceptions: AppException, NotFoundException, ConflictException, etc.
- Repositories: UserRepository, RefreshTokenRepository (abstract classes)
- Padrão Zod + Class adotado (consistente com facter-truck)
- FACTBP-API-004: Concluída - HTTP Layer Base
- GlobalExceptionFilter: trata AppException, HttpException, Prisma errors
- TransformInterceptor: padroniza responses { data, meta? }
- ValidationPipe com exceptionFactory customizada
- ErrorCodes enum para códigos padronizados
- Testes unitários criados (12 testes passando)
- **Sprint 1 concluída!** 🎉
- FACTBP-API-005: Concluída - Auth Services
- PasswordService: hash bcrypt (salt 12), comparação, validação de força
- TokenService: geração/verificação JWT com ConfigService
- RefreshTokenService: criação, rotação, revogação de tokens
- TokenExpiredException para erros de auth
- Testes unitários (20 novos testes, 32 total)
- FACTBP-API-006: Concluída - Login Use Case
- InvalidCredentialsException para erros de autenticação
- LoginDto com class-validator
- TokenResponseDto com user e memberships mapping
- LoginUseCase com single-query optimization
- Testes unitários (9 novos testes, 41 total)
- FACTBP-API-007: Concluída - Register Use Case
- UserAlreadyExistsException e CompanySlugExistsException
- RegisterDto com validação nested (user + company)
- RegisterUseCase com padrão clean code (métodos privados)
- Transação para criar user + company + role + membership
- Testes unitários (11 novos testes, 52 total)
- FACTBP-API-008: Concluída - Refresh Token Use Case
- RefreshTokenDto com validação
- RefreshTokenUseCase com padrão clean code (métodos privados)
- Rotação de token (validate + delete old + create new)
- Verifica user.isActive antes de retornar tokens
- Testes unitários (11 novos testes, 63 total)
- FACTBP-API-009: Concluída - Auth Controller & Module
- AuthController com todos os endpoints (login, register, refresh, logout, me)
- LogoutUseCase e GetMeUseCase com clean code pattern
- JwtAuthGuard para rotas protegidas
- CurrentUser decorator para extrair user do request
- AuthModule integrando tudo
- Testes unitários (16 novos testes, 79 total)
- FACTBP-API-015: Concluída - Mail Service
- MailService com Nodemailer para produção
- MailDevService para desenvolvimento (console logging)
- Templates Handlebars para emails
- Configuração via env vars (opcional)
- Global module para fácil injeção
- Testes unitários (3 novos testes, 82 total)
- FACTBP-API-014: Concluída - Password Recovery
- PasswordResetToken model com hash de token
- ForgotPasswordUseCase com envio de email
- ResetPasswordUseCase com validação de token
- ChangePasswordUseCase para usuários logados
- Password DTOs com class-validator
- Token expira em 1 hora
- Reset revoga todos refresh tokens (segurança)
- Testes unitários (17 novos testes, 99 total)
- FACTBP-API-016: Concluída - Throttle Guard (Rate Limiting)
- @nestjs/throttler para rate limiting
- Configuração com múltiplos throttlers (global, auth, forgot-password)
- Global: 100 req/min (proteção geral)
- Auth (login/register): 5 req/min (anti-brute force)
- Forgot-password: 3 req/5min (anti-enumeration)
- Skip throttle para endpoints autenticados
- **Sprint 2 Backend 100% concluída!**

### 2025-12-16
- FACTBP-API-010: Concluída - Company Guard
- CompanyService para buscar contexto de membership
- CompanyGuard valida header X-Company-ID e verifica acesso
- Validação de UUID com Zod (consistência com projeto)
- CurrentCompany decorator para extrair contexto nos controllers
- CompanyOptional decorator para rotas sem empresa obrigatória
- CompanyModule como módulo global
- Testes unitários (18 novos testes, 117 total)
- FACTBP-API-011: Concluída - RBAC com CASL
- @casl/ability para permissões dinâmicas
- AbilityFactory cria abilities de permissions/owner/empty
- AbilityService com cache de 5 minutos
- PermissionsGuard valida @RequirePermission decorator
- PureAbility usado (evita problemas de tipo com MongoAbility)
- CaslModule como módulo global
- Testes unitários (22 novos testes, 139 total)
- FACTBP-API-012: Concluída - Switch Company
- SwitchCompanyDto com validação UUID
- SwitchCompanyUseCase com padrão clean code
- Endpoint POST /auth/switch-company
- Gera novos tokens ao trocar empresa
- Retorna dados completos do usuário
- Testes unitários (7 novos testes, 146 total)
- FACTBP-API-013: Concluída - Permissions Endpoint
- GetPermissionsUseCase retorna role, isOwner, permissions
- GET /auth/permissions com JwtAuthGuard + CompanyGuard
- Usa cache do AbilityService (5 min)
- Testes unitários (5 novos testes, 151 total)
- FACTBP-API-014: Concluída - Cache Service (Redis)
- ICacheService interface com abstração unificada
- MemoryCacheService para desenvolvimento (in-memory com TTL)
- RedisCacheService para produção (redis client)
- CacheModule com factory provider para seleção dinâmica
- AbilityService atualizado para usar cache service injetado
- Configuração via env vars (CACHE_STORE=memory|redis)
- Testes unitários (1 novo teste, 152 total)
- **Sprint 3 Backend 100% concluída!** 🎉
- FACTBP-WEB-001: Concluída - Estrutura Base
- Estrutura feature-first criada (components, features, lib, providers, etc)
- Path aliases configurados no tsconfig.json
- Validação de env com Zod implementada
- .env.local.example criado
- **Decisão arquitetural:** Migrar auth para httpOnly cookies (segurança)
- Nova task FACTBP-API-017 adicionada à Sprint 4
- Frontend atualizado com Result pattern + Zod validation
- FACTBP-API-017: Concluída - Auth httpOnly Cookies
- cookie.utils.ts: setAuthCookies/clearAuthCookies com config segura
- cookies.decorator.ts: extrai cookies do request
- JwtAuthGuard: lê token de cookie OU header (flexibilidade)
- AuthController: todos endpoints setam/limpam cookies
- cookie-parser middleware configurado no main.ts
- Testes unitários (3 novos testes para cookie flow, 155 total)
- FACTBP-WEB-002: Concluída - API Client
- Result pattern implementado (Ok/Err/isOk/isErr)
- ApiError class com helpers (isValidationError, isUnauthorized, etc)
- API client com withCredentials: true e auto-refresh em 401
- Request helpers (get, post, put, patch, del) com Zod validation
- Company storage para X-Company-ID header automático
- API routes centralizadas

- FACTBP-WEB-009: Concluída - Password Recovery
- Hooks: useForgotPassword e useResetPassword com TanStack Query
- Schemas: forgotPasswordSchema e resetPasswordSchema com Zod
- ForgotPasswordForm e ResetPasswordForm components
- Pages: /forgot-password e /reset-password
- Login page atualizada com estilo Shadcn (logo top-left, patterns)
- Botão "Conectar com Google" com badge "Em breve" (disabled)
- **DS atualizado:**
  - Logo component adicionado ao @facter/ds-core
  - AuthLayout.Image com showPattern para padrões geométricos
  - AuthLayout.Header com position='top-left' | 'top-right' | 'default'

### 2025-12-17
- FACTBP-WEB-010: Concluída - Auth Middleware
- Next.js middleware para proteção de rotas
- company-storage atualizado para usar cookies (middleware access)
- Página /select-company com SelectionLayout do DS
- useLogin com suporte a callbackUrl
- Toast imports atualizados para @facter/ds-core
- Suspense wrapper para useSearchParams (Next.js 16)
- **Sprint 5 100% concluída!**
- FACTBP-WEB-011: Concluída - Company Feature
- Types: Company, CompanySettings, UpdateCompanyData
- Service: companyService com getById e update
- Hooks: useCompany (cache 10min), useUpdateCompany
- Barrel exports para feature
- FACTBP-WEB-012: Concluída - Dashboard Layout
- Navigation config criado (sidebar + mobile nav)
- Main layout com DashboardLayout do DS
- Sidebar com navegação configurável
- Header com user menu e logout
- Mobile bottom navigation
- lucide-react atualizado para v0.553.0 (match com DS)
- FACTBP-WEB-013: Concluída - Dashboard Home
- Dashboard page com welcome message
- Stats cards placeholder (--) para futuras métricas
- Recent activity section placeholder
- FACTBP-WEB-014: Concluída - Settings Pages
- User feature criada com types, service e hooks
- Settings layout com sidebar navigation
- Profile page para editar nome/email
- Security page para alterar senha
- Company page para editar dados da empresa
- Permissões verificadas para company settings

---

## Débitos Técnicos

> Melhorias a serem feitas posteriormente.

| # | Descrição | Prioridade | Referência |
|---|-----------|------------|------------|
| 1 | Corrigir sidebar e navbar segundo facter-truck com melhorias | Baixa | facter-truck/facter-app |
| 2 | Implementar theme toggle (light/dark) | Baixa | Task 12.4 |

---

## Contexto para IA

```
PROJETO: Facter Boilerplate
STACK: NestJS + Next.js + Prisma + PostgreSQL + Redis

TASK ATUAL: [ver seção "Task Atual" acima]

PARA CONTINUAR:
1. Leia o arquivo de detalhes da task atual
2. Implemente conforme especificado
3. Atualize este tracker ao concluir

ARQUIVOS IMPORTANTES:
- docs/boilerplate/START.md (guia geral)
- docs/boilerplate/TASK-TRACKER.md (este arquivo)
- docs/boilerplate/sprints/sprint-XX/FACTBP-XXX-*.md (detalhes)
```

---

## Quick Stats

| Sprint | Total | Feito | Pendente |
|--------|-------|-------|----------|
| Sprint 1 | 4 | 4 | 0 |
| Sprint 2 | 8 | 8 | 0 |
| Sprint 3 | 5 | 5 | 0 |
| Sprint 4 | 6 | 6 | 0 |
| Sprint 5 | 5 | 5 | 0 |
| Sprint 6 | 5 | 4 | 1 |
| Sprint 7 | 5 | 0 | 5 |
| **Total** | **38** | **32** | **6** |

---

*Última atualização: 2025-12-17*
