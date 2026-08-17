# Facter Boilerplate - Arquitetura Completa

> Documento de referência para arquitetura, patterns e decisões técnicas do Facter Boilerplate.

---

## Sumário

1. [Visão Geral](#1-visão-geral)
2. [Estrutura de Pastas](#2-estrutura-de-pastas)
3. [Multi-tenancy](#3-multi-tenancy)
4. [Autenticação](#4-autenticação)
5. [Autorização (RBAC)](#5-autorização-rbac)
6. [Event-Driven Architecture](#6-event-driven-architecture)
7. [API Patterns](#7-api-patterns)
8. [Caching Strategy](#8-caching-strategy)
9. [Error Handling](#9-error-handling)
10. [Testing Strategy](#10-testing-strategy)
11. [Performance](#11-performance)
12. [Observability](#12-observability)

---

## 1. Visão Geral

### 1.1 Princípios Arquiteturais

```
┌─────────────────────────────────────────────────────────────────┐
│                      PRINCÍPIOS FACTER                          │
├─────────────────────────────────────────────────────────────────┤
│  1. Multi-tenancy First    - Toda feature considera empresa     │
│  2. Type-Safety            - TypeScript strict + Zod runtime    │
│  3. Event-Driven           - Comunicação desacoplada            │
│  4. Cache Aggressive       - Performance é prioridade           │
│  5. Feature-Based          - Código organizado por domínio      │
│  6. DRY but Pragmatic      - Reutiliza, mas não over-engineer   │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Stack Tecnológica

#### Frontend (Next.js)

| Categoria | Tecnologia | Versão | Propósito |
|-----------|------------|--------|-----------|
| Framework | Next.js | 14+ | App Router, SSR, API Routes |
| UI | @facter/ds-core | latest | Design System |
| Estilo | Tailwind CSS | 3.4+ | Utility-first CSS |
| Forms | React Hook Form | 7+ | Form state management |
| Validação | Zod | 3+ | Schema validation |
| Estado | Zustand | 4+ | Global state |
| Fetching | TanStack Query | 5+ | Server state |
| HTTP | Axios | 1+ | HTTP client |

#### Backend (NestJS)

| Categoria | Tecnologia | Versão | Propósito |
|-----------|------------|--------|-----------|
| Framework | NestJS | 10+ | Modular backend |
| ORM | Prisma | 5+ | Database access |
| Validação | class-validator | 0.14+ | DTO validation |
| Cache | Redis | - | Distributed cache |
| Queue | BullMQ | 5+ | Background jobs |
| Events | EventEmitter2 | 3+ | Domain events |
| Docs | Swagger | - | API documentation |

---

## 2. Estrutura de Pastas

### 2.1 Frontend (Next.js)

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Route group: páginas públicas
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   ├── forgot-password/
│   │   │   └── page.tsx
│   │   ├── reset-password/
│   │   │   └── page.tsx
│   │   └── layout.tsx            # AuthLayout
│   │
│   ├── (main)/                   # Route group: páginas protegidas
│   │   ├── select-company/
│   │   │   └── page.tsx          # SelectionLayout
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── settings/
│   │   │   ├── profile/
│   │   │   ├── security/
│   │   │   ├── company/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── members/
│   │   │   │   └── roles/
│   │   │   └── layout.tsx
│   │   ├── [domain]/             # Rotas do domínio específico
│   │   └── layout.tsx            # DashboardLayout
│   │
│   ├── api/                      # API Routes (BFF)
│   │   └── [...]/
│   │
│   ├── layout.tsx                # Root layout (providers)
│   ├── not-found.tsx
│   └── error.tsx
│
├── components/
│   ├── ui/                       # Re-exports do DS (se override)
│   ├── common/                   # Componentes globais
│   │   ├── command-palette/
│   │   ├── file-upload/
│   │   └── data-export/
│   └── layouts/
│       └── dashboard/
│           ├── sidebar.tsx
│           ├── header.tsx
│           ├── breadcrumbs.tsx
│           └── index.tsx
│
├── features/                     # Feature modules
│   ├── auth/
│   │   ├── components/
│   │   │   ├── login-form.tsx
│   │   │   ├── register-form.tsx
│   │   │   └── forgot-password-form.tsx
│   │   ├── hooks/
│   │   │   ├── use-auth.ts
│   │   │   ├── use-login.ts
│   │   │   └── use-logout.ts
│   │   ├── services/
│   │   │   └── auth.service.ts
│   │   ├── stores/
│   │   │   └── auth.store.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── schemas/
│   │   │   └── login.schema.ts
│   │   └── index.ts              # Barrel export
│   │
│   ├── company/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── index.ts
│   │
│   ├── membership/
│   │   └── ...
│   │
│   ├── permissions/
│   │   ├── components/
│   │   │   ├── can.tsx
│   │   │   └── permission-gate.tsx
│   │   ├── hooks/
│   │   │   └── use-can.ts
│   │   ├── context/
│   │   │   └── permissions.context.tsx
│   │   ├── ability.ts
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   └── notifications/
│       └── ...
│
├── lib/                          # Core utilities
│   ├── api/
│   │   ├── client.ts             # Axios instance
│   │   ├── interceptors.ts       # Auth, error interceptors
│   │   └── endpoints.ts          # API endpoints constants
│   ├── query/
│   │   └── client.ts             # TanStack Query config
│   ├── events/
│   │   └── emitter.ts            # Frontend event emitter
│   └── utils/
│       ├── cn.ts                 # classNames helper
│       ├── format.ts             # Formatters
│       └── storage.ts            # LocalStorage helpers
│
├── providers/
│   ├── app-providers.tsx         # Combines all providers
│   ├── query-provider.tsx
│   ├── auth-provider.tsx
│   └── company-provider.tsx
│
├── stores/                       # Global stores
│   └── app.store.ts
│
├── hooks/                        # Global hooks
│   ├── use-media-query.ts
│   ├── use-debounce.ts
│   └── use-local-storage.ts
│
├── types/                        # Global types
│   ├── api.ts                    # ApiResponse, PaginatedResponse
│   ├── common.ts
│   └── index.ts
│
├── config/
│   ├── env.ts                    # Environment validation
│   ├── routes.ts                 # Route constants
│   ├── features.ts               # Feature flags
│   └── navigation.ts             # Menu config
│
├── middleware.ts                 # Next.js middleware
└── globals.css
```

### 2.2 Backend (NestJS)

```
src/
├── core/                         # Domain layer
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── user.ts
│   │   │   ├── company.ts
│   │   │   ├── membership.ts
│   │   │   ├── role.ts
│   │   │   └── permission.ts
│   │   ├── value-objects/
│   │   │   ├── email.ts
│   │   │   └── password.ts
│   │   ├── events/
│   │   │   ├── user-created.event.ts
│   │   │   ├── membership-created.event.ts
│   │   │   └── index.ts
│   │   └── repositories/
│   │       ├── user.repository.interface.ts
│   │       └── company.repository.interface.ts
│   │
│   ├── enums/
│   │   ├── action.enum.ts
│   │   ├── subject.enum.ts       # Base subjects
│   │   └── role.enum.ts          # Base roles
│   │
│   └── company/
│       └── company-instance.ts   # Multi-tenant context
│
├── application/                  # Use cases layer
│   ├── auth/
│   │   ├── use-cases/
│   │   │   ├── login.use-case.ts
│   │   │   ├── register.use-case.ts
│   │   │   ├── refresh-token.use-case.ts
│   │   │   └── logout.use-case.ts
│   │   ├── dto/
│   │   │   ├── login.dto.ts
│   │   │   └── register.dto.ts
│   │   └── auth.module.ts
│   │
│   ├── user/
│   │   ├── use-cases/
│   │   ├── dto/
│   │   └── user.module.ts
│   │
│   ├── company/
│   │   ├── use-cases/
│   │   ├── dto/
│   │   └── company.module.ts
│   │
│   ├── membership/
│   │   ├── use-cases/
│   │   │   ├── create-membership.use-case.ts
│   │   │   ├── invite-member.use-case.ts
│   │   │   └── check-user-membership.use-case.ts
│   │   ├── dto/
│   │   └── membership.module.ts
│   │
│   └── permissions/
│       ├── use-cases/
│       │   └── get-user-permissions.use-case.ts
│       ├── permissions.service.ts
│       └── permissions.module.ts
│
├── infra/                        # Infrastructure layer
│   ├── http/
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── user.controller.ts
│   │   │   ├── company.controller.ts
│   │   │   └── membership.controller.ts
│   │   │
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── company.guard.ts
│   │   │   ├── permission.guard.ts
│   │   │   └── throttle.guard.ts
│   │   │
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   ├── current-company.decorator.ts
│   │   │   ├── permission.decorator.ts
│   │   │   └── public.decorator.ts
│   │   │
│   │   ├── interceptors/
│   │   │   ├── logging.interceptor.ts
│   │   │   ├── transform.interceptor.ts
│   │   │   └── timeout.interceptor.ts
│   │   │
│   │   ├── filters/
│   │   │   ├── http-exception.filter.ts
│   │   │   └── all-exceptions.filter.ts
│   │   │
│   │   ├── pipes/
│   │   │   └── validation.pipe.ts
│   │   │
│   │   └── middlewares/
│   │       └── company.middleware.ts
│   │
│   ├── database/
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── migrations/
│   │   │   └── seed.ts
│   │   ├── repositories/
│   │   │   ├── prisma-user.repository.ts
│   │   │   ├── prisma-company.repository.ts
│   │   │   └── prisma-membership.repository.ts
│   │   └── database.module.ts
│   │
│   ├── cache/
│   │   ├── cache.service.ts
│   │   ├── cache.module.ts
│   │   └── keys.ts               # Cache key patterns
│   │
│   ├── queue/
│   │   ├── queue.module.ts
│   │   ├── processors/
│   │   │   ├── email.processor.ts
│   │   │   └── notification.processor.ts
│   │   └── jobs/
│   │       ├── send-email.job.ts
│   │       └── send-notification.job.ts
│   │
│   ├── mail/
│   │   ├── mail.service.ts
│   │   ├── mail.module.ts
│   │   └── templates/
│   │       ├── welcome.hbs
│   │       ├── reset-password.hbs
│   │       └── invite.hbs
│   │
│   └── storage/
│       ├── storage.service.ts    # S3/R2
│       └── storage.module.ts
│
├── shared/
│   ├── types/
│   │   ├── authenticated-user.ts
│   │   └── paginated-response.ts
│   ├── utils/
│   │   ├── hash.ts
│   │   └── token.ts
│   └── constants/
│       └── index.ts
│
├── config/
│   ├── app.config.ts
│   ├── database.config.ts
│   ├── jwt.config.ts
│   ├── redis.config.ts
│   └── mail.config.ts
│
├── events/
│   ├── events.module.ts
│   ├── event-emitter.service.ts
│   └── handlers/
│       ├── user-created.handler.ts
│       ├── membership-created.handler.ts
│       └── index.ts
│
├── app.module.ts
└── main.ts
```

---

## 3. Multi-tenancy

### 3.1 Modelo de Dados

```
┌─────────────┐     ┌─────────────────┐     ┌─────────────┐
│    users    │     │   memberships   │     │  companies  │
├─────────────┤     ├─────────────────┤     ├─────────────┤
│ id          │────▶│ id              │◀────│ id          │
│ name        │     │ user_id (FK)    │     │ name        │
│ email       │     │ company_id (FK) │     │ slug        │
│ password    │     │ role_ids[]      │     │ settings    │
│ created_at  │     │ status          │     │ created_at  │
└─────────────┘     │ invited_by      │     └─────────────┘
                    │ created_at      │
                    └─────────────────┘
```

### 3.2 Fluxo de Seleção de Empresa

```
┌──────────┐     ┌───────────┐     ┌────────────────┐     ┌───────────┐
│  Login   │────▶│ Get User  │────▶│ Has Companies? │────▶│ Dashboard │
│          │     │ Companies │     │                │     │           │
└──────────┘     └───────────┘     └───────┬────────┘     └───────────┘
                                           │
                                    Only 1 │ Multiple
                                           │
                              ┌────────────▼────────────┐
                              │   Select Company Page   │
                              │   /select-company       │
                              └─────────────────────────┘
```

### 3.3 Company Context (Backend)

```typescript
// core/company/company-instance.ts
export class CompanyInstance {
  constructor(
    private readonly companyId: string,
    private readonly companySlug: string,
  ) {}

  getCompanyId(): string {
    return this.companyId
  }

  getCompanySlug(): string {
    return this.companySlug
  }
}

// infra/http/middlewares/company.middleware.ts
@Injectable()
export class CompanyMiddleware implements NestMiddleware {
  constructor(private readonly companyService: CompanyService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const companyId = req.headers['x-company-id'] as string

    if (!companyId) {
      throw new BadRequestException('Company ID is required')
    }

    const company = await this.companyService.findById(companyId)

    if (!company) {
      throw new NotFoundException('Company not found')
    }

    req['companyInstance'] = new CompanyInstance(company.id, company.slug)
    next()
  }
}

// infra/http/decorators/current-company.decorator.ts
export const CurrentCompany = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): CompanyInstance => {
    const request = ctx.switchToHttp().getRequest()
    return request.companyInstance
  },
)
```

### 3.4 Company Context (Frontend)

```typescript
// providers/company-provider.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'

interface Company {
  id: string
  name: string
  slug: string
}

interface CompanyContextType {
  company: Company | null
  companies: Company[]
  isLoading: boolean
  selectCompany: (company: Company) => void
  clearCompany: () => void
}

const CompanyContext = createContext<CompanyContextType | null>(null)

const COMPANY_COOKIE_KEY = 'facter_company_id'

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [company, setCompany] = useState<Company | null>(null)
  const [companies, setCompanies] = useState<Company[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Carrega empresa do cookie
    const savedCompanyId = Cookies.get(COMPANY_COOKIE_KEY)
    if (savedCompanyId) {
      // Busca dados da empresa
      loadCompany(savedCompanyId)
    } else {
      setIsLoading(false)
    }
  }, [])

  const selectCompany = (company: Company) => {
    setCompany(company)
    Cookies.set(COMPANY_COOKIE_KEY, company.id, { expires: 30 })
    router.push('/dashboard')
  }

  const clearCompany = () => {
    setCompany(null)
    Cookies.remove(COMPANY_COOKIE_KEY)
    router.push('/select-company')
  }

  return (
    <CompanyContext.Provider value={{
      company,
      companies,
      isLoading,
      selectCompany,
      clearCompany,
    }}>
      {children}
    </CompanyContext.Provider>
  )
}

export function useCompany() {
  const context = useContext(CompanyContext)
  if (!context) {
    throw new Error('useCompany must be used within CompanyProvider')
  }
  return context
}
```

### 3.5 API Client com Company Header

```typescript
// lib/api/client.ts
import axios from 'axios'
import Cookies from 'js-cookie'

const COMPANY_COOKIE_KEY = 'facter_company_id'

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
})

// Interceptor para adicionar company header
api.interceptors.request.use((config) => {
  const companyId = Cookies.get(COMPANY_COOKIE_KEY)

  if (companyId) {
    config.headers['X-Company-ID'] = companyId
  }

  return config
})
```

---

## 4. Autenticação

### 4.1 Fluxo de Autenticação

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          FLUXO DE AUTENTICAÇÃO                          │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────────────────┐
│  Login   │────▶│  Valida  │────▶│  Gera    │────▶│  Retorna             │
│  Request │     │  Creds   │     │  Tokens  │     │  Access + Refresh    │
└──────────┘     └──────────┘     └──────────┘     └──────────────────────┘

                 ┌────────────────────────────────────────────────────────┐
                 │  Access Token                                          │
                 │  - Curta duração (15min)                               │
                 │  - Enviado em Authorization header                     │
                 │  - Contém: userId, email                               │
                 ├────────────────────────────────────────────────────────┤
                 │  Refresh Token                                         │
                 │  - Longa duração (7 dias)                              │
                 │  - Armazenado em HTTP-only cookie                      │
                 │  - Usado apenas para renovar access token              │
                 └────────────────────────────────────────────────────────┘
```

### 4.2 Token Structure

```typescript
// Access Token Payload
interface AccessTokenPayload {
  sub: string        // userId
  email: string
  type: 'access'
  iat: number
  exp: number
}

// Refresh Token Payload
interface RefreshTokenPayload {
  sub: string        // userId
  type: 'refresh'
  jti: string        // unique token id (for revocation)
  iat: number
  exp: number
}
```

### 4.3 Auth Service (Backend)

```typescript
// application/auth/use-cases/login.use-case.ts
@Injectable()
export class LoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly hashService: HashService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(dto: LoginDto): Promise<AuthResult> {
    // 1. Busca usuário
    const user = await this.userRepository.findByEmail(dto.email)

    if (!user) {
      throw new UnauthorizedException('Invalid credentials')
    }

    // 2. Verifica senha
    const isValidPassword = await this.hashService.compare(
      dto.password,
      user.password,
    )

    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid credentials')
    }

    // 3. Gera tokens
    const tokens = await this.generateTokens(user)

    // 4. Emite evento
    this.eventEmitter.emit('auth.login', new UserLoggedInEvent(user.id))

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    }
  }

  private async generateTokens(user: User): Promise<TokenPair> {
    const accessToken = this.jwtService.sign(
      { sub: user.id, email: user.email, type: 'access' },
      { expiresIn: '15m' },
    )

    const refreshTokenId = crypto.randomUUID()
    const refreshToken = this.jwtService.sign(
      { sub: user.id, type: 'refresh', jti: refreshTokenId },
      { expiresIn: '7d' },
    )

    // Salva refresh token id para revogação
    await this.cacheService.set(
      `refresh:${user.id}:${refreshTokenId}`,
      true,
      7 * 24 * 60 * 60, // 7 days
    )

    return { accessToken, refreshToken }
  }
}
```

### 4.4 Auth Middleware (Frontend)

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
]

const AUTH_ROUTES = ['/login', '/register']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const accessToken = request.cookies.get('access_token')?.value
  const companyId = request.cookies.get('facter_company_id')?.value

  // Rotas públicas
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    // Se já autenticado, redireciona
    if (accessToken && AUTH_ROUTES.some(route => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/select-company', request.url))
    }
    return NextResponse.next()
  }

  // Rotas protegidas - verifica token
  if (!accessToken) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Verifica se tem empresa selecionada (exceto /select-company)
  if (!companyId && pathname !== '/select-company') {
    return NextResponse.redirect(new URL('/select-company', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

### 4.5 Token Refresh Flow

```typescript
// lib/api/interceptors.ts
import { api } from './client'

let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: Error) => void
}> = []

const processQueue = (error: Error | null, token: string | null) => {
  failedQueue.forEach(promise => {
    if (error) {
      promise.reject(error)
    } else {
      promise.resolve(token!)
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Aguarda refresh em andamento
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`
          return api(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const { data } = await api.post('/auth/refresh')
        const { accessToken } = data

        processQueue(null, accessToken)

        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError as Error, null)

        // Redirect to login
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)
```

---

## 5. Autorização (RBAC)

### 5.1 Modelo de Dados

```
┌─────────────────┐     ┌───────────────────┐     ┌─────────────────┐
│      roles      │     │  role_permissions │     │   permissions   │
├─────────────────┤     ├───────────────────┤     ├─────────────────┤
│ id              │────▶│ role_id           │◀────│ id              │
│ name            │     │ permission_id     │     │ action          │
│ description     │     │ conditions        │     │ subject         │
│ company_id (FK) │     └───────────────────┘     │ description     │
│ parent_id (FK)  │                               │ is_system       │
│ level           │                               └─────────────────┘
│ is_system       │
└─────────────────┘

┌─────────────────┐     ┌───────────────────┐
│   memberships   │     │ membership_roles  │
├─────────────────┤     ├───────────────────┤
│ id              │────▶│ membership_id     │
│ user_id         │     │ role_id           │
│ company_id      │     └───────────────────┘
└─────────────────┘
```

### 5.2 Ability Class

```typescript
// Shared entre frontend e backend
// packages/shared/ability.ts

export type Action = 'manage' | 'create' | 'read' | 'update' | 'delete' | string

export interface PermissionRule<S extends string = string> {
  action: Action
  subject: S
  conditions?: Record<string, unknown>
  inverted?: boolean
}

export class Ability<S extends string = string> {
  private rules: PermissionRule<S>[] = []
  private rulesIndex: Map<string, PermissionRule<S>[]> = new Map()

  constructor(rules: PermissionRule<S>[] = []) {
    this.update(rules)
  }

  update(rules: PermissionRule<S>[]): void {
    this.rules = rules
    this.buildIndex()
  }

  can(action: Action, subject: S, data?: Record<string, unknown>): boolean {
    // Check inverted (cannot) rules first
    if (this.matchesRule(action, subject, data, true)) {
      return false
    }
    return this.matchesRule(action, subject, data, false)
  }

  cannot(action: Action, subject: S, data?: Record<string, unknown>): boolean {
    return !this.can(action, subject, data)
  }

  canAll(checks: Array<[Action, S]>, data?: Record<string, unknown>): boolean {
    return checks.every(([action, subject]) => this.can(action, subject, data))
  }

  canAny(checks: Array<[Action, S]>, data?: Record<string, unknown>): boolean {
    return checks.some(([action, subject]) => this.can(action, subject, data))
  }

  getRules(): PermissionRule<S>[] {
    return [...this.rules]
  }

  private buildIndex(): void {
    this.rulesIndex.clear()
    for (const rule of this.rules) {
      const key = `${rule.action}:${rule.subject}`
      const existing = this.rulesIndex.get(key) || []
      this.rulesIndex.set(key, [...existing, rule])
    }
  }

  private matchesRule(
    action: Action,
    subject: S,
    data?: Record<string, unknown>,
    inverted = false,
  ): boolean {
    // Check manage:All (super admin)
    const manageAll = this.rulesIndex.get('manage:All')
    if (manageAll?.some(r => r.inverted === inverted && this.checkConditions(r, data))) {
      return true
    }

    // Check manage:Subject
    const manageSubject = this.rulesIndex.get(`manage:${subject}`)
    if (manageSubject?.some(r => r.inverted === inverted && this.checkConditions(r, data))) {
      return true
    }

    // Check specific action:subject
    const specific = this.rulesIndex.get(`${action}:${subject}`)
    return specific?.some(r => r.inverted === inverted && this.checkConditions(r, data)) ?? false
  }

  private checkConditions(
    rule: PermissionRule<S>,
    data?: Record<string, unknown>,
  ): boolean {
    if (!rule.conditions) return true
    if (!data) return false

    return Object.entries(rule.conditions).every(([key, value]) => {
      const dataValue = data[key]
      if (typeof value === 'object' && value !== null && typeof dataValue === 'object') {
        return this.checkConditions(
          { ...rule, conditions: value as Record<string, unknown> },
          dataValue as Record<string, unknown>,
        )
      }
      return dataValue === value
    })
  }
}
```

### 5.3 Permission Guard (Backend)

```typescript
// infra/http/guards/permission.guard.ts
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionsService: PermissionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.getAllAndOverride<RequiredPermission>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    )

    if (!requiredPermission) return true

    const request = context.switchToHttp().getRequest()
    const { user, companyInstance } = request

    if (!user?.id || !companyInstance) {
      throw new UnauthorizedException()
    }

    // Busca ability (cached)
    const ability = await this.permissionsService.getAbility(
      user.id,
      companyInstance.getCompanyId(),
    )

    const hasPermission = Array.isArray(requiredPermission)
      ? requiredPermission.some(r => ability.can(r.action, r.subject))
      : ability.can(requiredPermission.action, requiredPermission.subject)

    if (!hasPermission) {
      throw new ForbiddenException('Permission denied')
    }

    // Attach ability to request
    request.ability = ability

    return true
  }
}
```

### 5.4 Permission Components (Frontend)

```typescript
// features/permissions/components/can.tsx
import { useAbility } from '../hooks/use-ability'
import type { Action, Subject } from '../types'

interface CanProps {
  action: Action
  subject: Subject
  data?: Record<string, unknown>
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function Can({ action, subject, data, children, fallback = null }: CanProps) {
  const ability = useAbility()

  if (!ability.can(action, subject, data)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

// Uso
<Can action="create" subject="WorkOrder">
  <Button>Nova OS</Button>
</Can>

<Can
  action="delete"
  subject="User"
  fallback={<Tooltip content="Sem permissão"><Button disabled>Excluir</Button></Tooltip>}
>
  <Button variant="destructive">Excluir</Button>
</Can>
```

---

## 6. Event-Driven Architecture

### 6.1 Visão Geral

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         EVENT-DRIVEN FLOW                               │
└─────────────────────────────────────────────────────────────────────────┘

  ┌──────────┐     ┌──────────────┐     ┌────────────────┐
  │ Use Case │────▶│ Event        │────▶│ Event Handlers │
  │          │     │ Emitter      │     │                │
  └──────────┘     └──────────────┘     └───────┬────────┘
                                                │
                    ┌───────────────────────────┼───────────────────────────┐
                    │                           │                           │
              ┌─────▼─────┐              ┌──────▼──────┐             ┌──────▼──────┐
              │  Send     │              │  Update     │             │   Log       │
              │  Email    │              │  Cache      │             │  Activity   │
              └───────────┘              └─────────────┘             └─────────────┘
```

### 6.2 Domain Events

```typescript
// core/domain/events/base.event.ts
export abstract class DomainEvent {
  public readonly occurredAt: Date
  public readonly eventId: string

  constructor() {
    this.occurredAt = new Date()
    this.eventId = crypto.randomUUID()
  }

  abstract get eventName(): string
}

// core/domain/events/user-created.event.ts
export class UserCreatedEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly name: string,
  ) {
    super()
  }

  get eventName(): string {
    return 'user.created'
  }
}

// core/domain/events/membership-created.event.ts
export class MembershipCreatedEvent extends DomainEvent {
  constructor(
    public readonly membershipId: string,
    public readonly userId: string,
    public readonly companyId: string,
    public readonly roleIds: string[],
    public readonly invitedBy?: string,
  ) {
    super()
  }

  get eventName(): string {
    return 'membership.created'
  }
}

// core/domain/events/index.ts
export const DomainEvents = {
  // Auth
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',
  USER_LOGGED_IN: 'auth.login',
  USER_LOGGED_OUT: 'auth.logout',
  PASSWORD_RESET_REQUESTED: 'auth.password_reset_requested',
  PASSWORD_RESET_COMPLETED: 'auth.password_reset_completed',

  // Company
  COMPANY_CREATED: 'company.created',
  COMPANY_UPDATED: 'company.updated',

  // Membership
  MEMBERSHIP_CREATED: 'membership.created',
  MEMBERSHIP_UPDATED: 'membership.updated',
  MEMBERSHIP_DELETED: 'membership.deleted',
  MEMBER_INVITED: 'membership.invited',
  INVITE_ACCEPTED: 'membership.invite_accepted',

  // Permissions
  ROLE_CREATED: 'role.created',
  ROLE_UPDATED: 'role.updated',
  ROLE_DELETED: 'role.deleted',
  PERMISSIONS_CHANGED: 'permissions.changed',
} as const
```

### 6.3 Event Handlers

```typescript
// events/handlers/user-created.handler.ts
import { OnEvent } from '@nestjs/event-emitter'
import { Injectable } from '@nestjs/common'
import { UserCreatedEvent } from '@/core/domain/events'
import { MailService } from '@/infra/mail/mail.service'
import { QueueService } from '@/infra/queue/queue.service'

@Injectable()
export class UserCreatedHandler {
  constructor(
    private readonly mailService: MailService,
    private readonly queueService: QueueService,
  ) {}

  @OnEvent('user.created')
  async handleUserCreated(event: UserCreatedEvent) {
    // Enfileira email de boas-vindas
    await this.queueService.add('email', {
      to: event.email,
      template: 'welcome',
      data: {
        name: event.name,
      },
    })
  }
}

// events/handlers/membership-created.handler.ts
@Injectable()
export class MembershipCreatedHandler {
  constructor(
    private readonly cacheService: CacheService,
    private readonly notificationService: NotificationService,
  ) {}

  @OnEvent('membership.created')
  async handleMembershipCreated(event: MembershipCreatedEvent) {
    // Invalida cache de permissões
    await this.cacheService.del(`ability:${event.userId}:${event.companyId}`)

    // Notifica o usuário
    if (event.invitedBy) {
      await this.notificationService.create({
        userId: event.userId,
        type: 'membership_invite',
        data: {
          companyId: event.companyId,
          invitedBy: event.invitedBy,
        },
      })
    }
  }

  @OnEvent('permissions.changed')
  async handlePermissionsChanged(event: PermissionsChangedEvent) {
    // Invalida cache de todos os usuários da empresa
    await this.cacheService.delPattern(`ability:*:${event.companyId}`)
  }
}
```

### 6.4 Event Emitter Service

```typescript
// events/event-emitter.service.ts
import { Injectable } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { DomainEvent } from '@/core/domain/events/base.event'

@Injectable()
export class EventEmitterService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  emit<T extends DomainEvent>(event: T): boolean {
    return this.eventEmitter.emit(event.eventName, event)
  }

  emitAsync<T extends DomainEvent>(event: T): Promise<any[]> {
    return this.eventEmitter.emitAsync(event.eventName, event)
  }
}

// Uso no Use Case
@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventEmitter: EventEmitterService,
  ) {}

  async execute(dto: CreateUserDto): Promise<User> {
    const user = await this.userRepository.create(dto)

    // Emite evento após criação
    this.eventEmitter.emit(new UserCreatedEvent(
      user.id,
      user.email,
      user.name,
    ))

    return user
  }
}
```

### 6.5 Frontend Events

```typescript
// lib/events/emitter.ts
type EventCallback<T = unknown> = (data: T) => void

class EventEmitter {
  private events: Map<string, Set<EventCallback>> = new Map()

  on<T>(event: string, callback: EventCallback<T>): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set())
    }
    this.events.get(event)!.add(callback as EventCallback)

    // Return unsubscribe function
    return () => this.off(event, callback)
  }

  off<T>(event: string, callback: EventCallback<T>): void {
    this.events.get(event)?.delete(callback as EventCallback)
  }

  emit<T>(event: string, data?: T): void {
    this.events.get(event)?.forEach(callback => callback(data))
  }

  once<T>(event: string, callback: EventCallback<T>): void {
    const unsubscribe = this.on<T>(event, (data) => {
      callback(data)
      unsubscribe()
    })
  }
}

export const eventEmitter = new EventEmitter()

// Frontend Events
export const FrontendEvents = {
  // Auth
  LOGGED_IN: 'auth:logged_in',
  LOGGED_OUT: 'auth:logged_out',
  TOKEN_REFRESHED: 'auth:token_refreshed',

  // Company
  COMPANY_CHANGED: 'company:changed',

  // Permissions
  PERMISSIONS_UPDATED: 'permissions:updated',

  // UI
  SIDEBAR_TOGGLED: 'ui:sidebar_toggled',
  THEME_CHANGED: 'ui:theme_changed',

  // Data
  DATA_INVALIDATED: 'data:invalidated',
} as const

// Uso
// Emitir
eventEmitter.emit(FrontendEvents.COMPANY_CHANGED, { companyId: '123' })

// Escutar
useEffect(() => {
  const unsubscribe = eventEmitter.on(FrontendEvents.COMPANY_CHANGED, ({ companyId }) => {
    // Invalida queries
    queryClient.invalidateQueries()
  })

  return unsubscribe
}, [])
```

---

## 7. API Patterns

### 7.1 Response Format

```typescript
// Sucesso
{
  "data": { ... },
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "requestId": "uuid"
  }
}

// Sucesso com paginação
{
  "data": [...],
  "meta": {
    "pagination": {
      "page": 1,
      "perPage": 20,
      "total": 100,
      "totalPages": 5,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "timestamp": "2024-01-01T00:00:00.000Z",
    "requestId": "uuid"
  }
}

// Erro
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "requestId": "uuid"
  }
}
```

### 7.2 Transform Interceptor

```typescript
// infra/http/interceptors/transform.interceptor.ts
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest()
    const requestId = request.headers['x-request-id'] || crypto.randomUUID()

    return next.handle().pipe(
      map(data => ({
        data,
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
        },
      })),
    )
  }
}
```

### 7.3 Pagination

```typescript
// shared/types/paginated-response.ts
export interface PaginationMeta {
  page: number
  perPage: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    pagination: PaginationMeta
  }
}

// shared/dto/pagination.dto.ts
export class PaginationDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value, 10))
  page?: number = 1

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value, 10))
  perPage?: number = 20

  @IsOptional()
  @IsString()
  sortBy?: string

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc'
}

// Helper function
export function paginate<T>(
  data: T[],
  total: number,
  pagination: PaginationDto,
): PaginatedResponse<T> {
  const { page = 1, perPage = 20 } = pagination
  const totalPages = Math.ceil(total / perPage)

  return {
    data,
    meta: {
      pagination: {
        page,
        perPage,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    },
  }
}
```

### 7.4 Error Codes

```typescript
// shared/constants/error-codes.ts
export const ErrorCodes = {
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',

  // Auth
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',

  // Resources
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',

  // Business Logic
  BUSINESS_RULE_VIOLATION: 'BUSINESS_RULE_VIOLATION',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',

  // System
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
} as const
```

---

## 8. Caching Strategy

### 8.1 Cache Layers

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CACHE LAYERS                                  │
└─────────────────────────────────────────────────────────────────────────┘

  ┌───────────────────┐
  │  Browser Cache    │  → HTTP Cache headers, Service Worker
  └─────────┬─────────┘
            │
  ┌─────────▼─────────┐
  │  TanStack Query   │  → Client-side cache, stale-while-revalidate
  └─────────┬─────────┘
            │
  ┌─────────▼─────────┐
  │  API Response     │  → Cache-Control headers
  └─────────┬─────────┘
            │
  ┌─────────▼─────────┐
  │  Redis            │  → Server-side distributed cache
  └─────────┬─────────┘
            │
  ┌─────────▼─────────┐
  │  Database         │  → Query cache, connection pool
  └───────────────────┘
```

### 8.2 Cache Keys Pattern

```typescript
// infra/cache/keys.ts
export const CacheKeys = {
  // User
  user: (userId: string) => `user:${userId}`,
  userByEmail: (email: string) => `user:email:${email}`,

  // Company
  company: (companyId: string) => `company:${companyId}`,
  companyBySlug: (slug: string) => `company:slug:${slug}`,

  // Membership
  membership: (userId: string, companyId: string) =>
    `membership:${userId}:${companyId}`,
  userMemberships: (userId: string) => `user:${userId}:memberships`,

  // Permissions
  ability: (userId: string, companyId: string) =>
    `ability:${userId}:${companyId}`,
  companyRoles: (companyId: string) => `company:${companyId}:roles`,

  // Sessions
  refreshToken: (userId: string, tokenId: string) =>
    `refresh:${userId}:${tokenId}`,
  userSessions: (userId: string) => `user:${userId}:sessions`,
}

// TTL constants (in seconds)
export const CacheTTL = {
  SHORT: 60,           // 1 minute
  MEDIUM: 300,         // 5 minutes
  LONG: 3600,          // 1 hour
  DAY: 86400,          // 24 hours
  WEEK: 604800,        // 7 days
}
```

### 8.3 Cache Service

```typescript
// infra/cache/cache.service.ts
@Injectable()
export class CacheService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  async get<T>(key: string): Promise<T | null> {
    return this.cache.get<T>(key)
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.cache.set(key, value, ttl)
  }

  async del(key: string): Promise<void> {
    await this.cache.del(key)
  }

  async delPattern(pattern: string): Promise<void> {
    const keys = await this.cache.store.keys(pattern)
    if (keys.length > 0) {
      await Promise.all(keys.map(key => this.cache.del(key)))
    }
  }

  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    const cached = await this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    const value = await factory()
    await this.set(key, value, ttl)
    return value
  }

  async invalidateUserCache(userId: string): Promise<void> {
    await this.delPattern(`user:${userId}:*`)
    await this.delPattern(`ability:${userId}:*`)
  }

  async invalidateCompanyCache(companyId: string): Promise<void> {
    await this.delPattern(`company:${companyId}:*`)
    await this.delPattern(`ability:*:${companyId}`)
  }
}
```

### 8.4 TanStack Query Config (Frontend)

```typescript
// lib/query/client.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30,   // 30 minutes (was cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,
    },
  },
})

// Query Keys factory
export const queryKeys = {
  // Auth
  auth: {
    me: ['auth', 'me'] as const,
    permissions: (companyId: string) => ['auth', 'permissions', companyId] as const,
  },

  // Users
  users: {
    all: ['users'] as const,
    list: (filters: UserFilters) => ['users', 'list', filters] as const,
    detail: (id: string) => ['users', 'detail', id] as const,
  },

  // Companies
  companies: {
    all: ['companies'] as const,
    list: () => ['companies', 'list'] as const,
    detail: (id: string) => ['companies', 'detail', id] as const,
    members: (id: string) => ['companies', id, 'members'] as const,
  },
}
```

---

## 9. Error Handling

### 9.1 Exception Hierarchy

```typescript
// shared/exceptions/base.exception.ts
export abstract class BaseException extends Error {
  abstract readonly code: string
  abstract readonly statusCode: number

  constructor(
    message: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message)
    this.name = this.constructor.name
  }
}

// shared/exceptions/validation.exception.ts
export class ValidationException extends BaseException {
  readonly code = ErrorCodes.VALIDATION_ERROR
  readonly statusCode = 400

  constructor(
    public readonly errors: Array<{ field: string; message: string }>,
  ) {
    super('Validation failed')
  }
}

// shared/exceptions/not-found.exception.ts
export class NotFoundException extends BaseException {
  readonly code = ErrorCodes.NOT_FOUND
  readonly statusCode = 404

  constructor(resource: string, identifier?: string) {
    super(
      identifier
        ? `${resource} with identifier '${identifier}' not found`
        : `${resource} not found`
    )
  }
}

// shared/exceptions/business.exception.ts
export class BusinessException extends BaseException {
  readonly code = ErrorCodes.BUSINESS_RULE_VIOLATION
  readonly statusCode = 422

  constructor(message: string, details?: Record<string, unknown>) {
    super(message, details)
  }
}
```

### 9.2 Global Exception Filter

```typescript
// infra/http/filters/all-exceptions.filter.ts
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly logger: LoggerService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    const requestId = request.headers['x-request-id'] || crypto.randomUUID()

    let status = 500
    let code = ErrorCodes.INTERNAL_ERROR
    let message = 'Internal server error'
    let details: unknown = undefined

    if (exception instanceof BaseException) {
      status = exception.statusCode
      code = exception.code
      message = exception.message
      details = exception.details
    } else if (exception instanceof HttpException) {
      status = exception.getStatus()
      const response = exception.getResponse()

      if (typeof response === 'object') {
        message = (response as any).message || exception.message
        code = (response as any).code || this.statusToCode(status)
      }
    }

    // Log error
    this.logger.error({
      requestId,
      path: request.url,
      method: request.method,
      status,
      code,
      message,
      stack: exception instanceof Error ? exception.stack : undefined,
    })

    response.status(status).json({
      error: {
        code,
        message,
        ...(details && { details }),
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId,
      },
    })
  }

  private statusToCode(status: number): string {
    switch (status) {
      case 400: return ErrorCodes.INVALID_INPUT
      case 401: return ErrorCodes.UNAUTHORIZED
      case 403: return ErrorCodes.FORBIDDEN
      case 404: return ErrorCodes.NOT_FOUND
      case 409: return ErrorCodes.CONFLICT
      case 429: return ErrorCodes.RATE_LIMIT_EXCEEDED
      default: return ErrorCodes.INTERNAL_ERROR
    }
  }
}
```

### 9.3 Frontend Error Handling

```typescript
// lib/api/error.ts
export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }

  static fromResponse(response: any, status: number): ApiError {
    return new ApiError(
      response.error?.code || 'UNKNOWN_ERROR',
      response.error?.message || 'An error occurred',
      status,
      response.error?.details,
    )
  }

  isValidation(): boolean {
    return this.code === 'VALIDATION_ERROR'
  }

  isUnauthorized(): boolean {
    return this.code === 'UNAUTHORIZED' || this.status === 401
  }

  isForbidden(): boolean {
    return this.code === 'FORBIDDEN' || this.status === 403
  }

  isNotFound(): boolean {
    return this.code === 'NOT_FOUND' || this.status === 404
  }
}

// Error interceptor
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      throw ApiError.fromResponse(error.response.data, error.response.status)
    }
    throw new ApiError('NETWORK_ERROR', 'Network error', 0)
  }
)
```

---

## 10. Testing Strategy

### 10.1 Testing Pyramid

```
                    ┌───────────┐
                    │    E2E    │  ← Poucos, críticos
                    │   Tests   │
                    └─────┬─────┘
                          │
                  ┌───────┴───────┐
                  │  Integration  │  ← Moderados, APIs
                  │    Tests      │
                  └───────┬───────┘
                          │
            ┌─────────────┴─────────────┐
            │        Unit Tests         │  ← Muitos, rápidos
            │                           │
            └───────────────────────────┘
```

### 10.2 Unit Tests

```typescript
// Backend - Use Case Test
describe('LoginUseCase', () => {
  let useCase: LoginUseCase
  let userRepository: MockType<UserRepository>
  let jwtService: MockType<JwtService>

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        LoginUseCase,
        { provide: UserRepository, useFactory: mockUserRepository },
        { provide: JwtService, useFactory: mockJwtService },
      ],
    }).compile()

    useCase = module.get(LoginUseCase)
    userRepository = module.get(UserRepository)
    jwtService = module.get(JwtService)
  })

  it('should return tokens for valid credentials', async () => {
    const user = createMockUser()
    userRepository.findByEmail.mockResolvedValue(user)
    jwtService.sign.mockReturnValue('token')

    const result = await useCase.execute({
      email: 'test@test.com',
      password: 'password',
    })

    expect(result).toHaveProperty('accessToken')
    expect(result).toHaveProperty('refreshToken')
  })

  it('should throw for invalid credentials', async () => {
    userRepository.findByEmail.mockResolvedValue(null)

    await expect(
      useCase.execute({ email: 'wrong@test.com', password: 'wrong' })
    ).rejects.toThrow(UnauthorizedException)
  })
})

// Frontend - Component Test
describe('LoginForm', () => {
  it('should call onSubmit with form data', async () => {
    const onSubmit = vi.fn()

    render(<LoginForm onSubmit={onSubmit} />)

    await userEvent.type(screen.getByLabelText(/email/i), 'test@test.com')
    await userEvent.type(screen.getByLabelText(/senha/i), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password123',
      })
    })
  })

  it('should show validation errors', async () => {
    render(<LoginForm onSubmit={vi.fn()} />)

    await userEvent.click(screen.getByRole('button', { name: /entrar/i }))

    expect(await screen.findByText(/email inválido/i)).toBeInTheDocument()
  })
})
```

### 10.3 Integration Tests

```typescript
// Backend - Controller Integration Test
describe('AuthController (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = module.createNestApplication()
    prisma = module.get(PrismaService)
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    await prisma.user.deleteMany()
  })

  describe('POST /auth/login', () => {
    it('should return tokens for valid credentials', async () => {
      // Arrange
      await prisma.user.create({
        data: {
          email: 'test@test.com',
          password: await hash('password123'),
          name: 'Test User',
        },
      })

      // Act
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@test.com', password: 'password123' })

      // Assert
      expect(response.status).toBe(200)
      expect(response.body.data).toHaveProperty('accessToken')
      expect(response.body.data).toHaveProperty('user')
    })

    it('should return 401 for invalid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'wrong@test.com', password: 'wrong' })

      expect(response.status).toBe(401)
      expect(response.body.error.code).toBe('INVALID_CREDENTIALS')
    })
  })
})
```

---

## 11. Performance

### 11.1 Frontend Performance

```typescript
// Lazy loading de rotas
const Dashboard = lazy(() => import('./pages/dashboard'))
const Settings = lazy(() => import('./pages/settings'))

// Memoização de componentes pesados
const HeavyList = memo(function HeavyList({ items }: Props) {
  return (
    <VirtualList
      height={600}
      itemCount={items.length}
      itemSize={50}
    >
      {({ index, style }) => (
        <div style={style}>{items[index].name}</div>
      )}
    </VirtualList>
  )
})

// Debounce de buscas
function useSearch(query: string) {
  const debouncedQuery = useDebounce(query, 300)

  return useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => searchApi(debouncedQuery),
    enabled: debouncedQuery.length > 2,
  })
}

// Prefetch de dados
function CompanySelector() {
  const queryClient = useQueryClient()

  const prefetchCompany = (companyId: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.companies.detail(companyId),
      queryFn: () => getCompany(companyId),
    })
  }

  return (
    <Select onValueChange={selectCompany}>
      {companies.map(company => (
        <SelectItem
          key={company.id}
          value={company.id}
          onMouseEnter={() => prefetchCompany(company.id)}
        >
          {company.name}
        </SelectItem>
      ))}
    </Select>
  )
}
```

### 11.2 Backend Performance

```typescript
// Database indexes (Prisma schema)
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  // ...

  @@index([email])
  @@index([createdAt])
}

model Membership {
  id        String   @id @default(uuid())
  userId    String
  companyId String
  // ...

  @@unique([userId, companyId])
  @@index([userId])
  @@index([companyId])
}

// Query optimization
async findUserWithMemberships(userId: string) {
  return this.prisma.user.findUnique({
    where: { id: userId },
    include: {
      memberships: {
        include: {
          company: {
            select: { id: true, name: true, slug: true }
          },
          roles: {
            select: { id: true, name: true }
          }
        }
      }
    }
  })
}

// Batch operations
async createManyUsers(users: CreateUserDto[]) {
  return this.prisma.$transaction(
    users.map(user =>
      this.prisma.user.create({ data: user })
    )
  )
}
```

---

## 12. Observability

### 12.1 Logging

```typescript
// infra/logging/logger.service.ts
@Injectable()
export class LoggerService {
  private readonly logger: pino.Logger

  constructor() {
    this.logger = pino({
      level: process.env.LOG_LEVEL || 'info',
      transport: process.env.NODE_ENV === 'development'
        ? { target: 'pino-pretty' }
        : undefined,
    })
  }

  info(message: string, context?: Record<string, unknown>) {
    this.logger.info(context, message)
  }

  error(message: string, error?: Error, context?: Record<string, unknown>) {
    this.logger.error({
      ...context,
      err: error,
    }, message)
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.logger.warn(context, message)
  }

  debug(message: string, context?: Record<string, unknown>) {
    this.logger.debug(context, message)
  }
}

// Uso
this.logger.info('User created', { userId: user.id, email: user.email })
this.logger.error('Failed to create user', error, { email: dto.email })
```

### 12.2 Request Logging

```typescript
// infra/http/interceptors/logging.interceptor.ts
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest()
    const { method, url, body, headers } = request
    const requestId = headers['x-request-id'] || crypto.randomUUID()
    const startTime = Date.now()

    this.logger.info('Incoming request', {
      requestId,
      method,
      url,
      body: this.sanitizeBody(body),
    })

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime
          this.logger.info('Request completed', {
            requestId,
            method,
            url,
            duration,
            status: 'success',
          })
        },
        error: (error) => {
          const duration = Date.now() - startTime
          this.logger.error('Request failed', error, {
            requestId,
            method,
            url,
            duration,
            status: 'error',
          })
        },
      }),
    )
  }

  private sanitizeBody(body: any): any {
    if (!body) return body
    const sanitized = { ...body }
    const sensitiveFields = ['password', 'token', 'secret']
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]'
      }
    })
    return sanitized
  }
}
```

### 12.3 Health Checks

```typescript
// infra/health/health.controller.ts
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: PrismaHealthIndicator,
    private readonly redis: RedisHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.redis.pingCheck('redis'),
    ])
  }

  @Get('ready')
  readiness() {
    return { status: 'ok' }
  }

  @Get('live')
  liveness() {
    return { status: 'ok' }
  }
}
```

---

## Próximos Passos

1. **Criar DashboardLayout** no Design System
2. **Criar repositório** facter-boilerplate
3. **Implementar Core** seguindo esta documentação
4. **Criar CLI** para geração de features
5. **Escrever testes** para todos os módulos
6. **Documentar APIs** com Swagger

---

*Documento vivo - atualizar conforme evolução do projeto*
