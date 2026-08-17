# Facter Boilerplate - Especificação

## Visão Geral

Template base para todos os sistemas Facter (Truck, Vagas, TechCare, etc).
Já vem configurado com Design System, autenticação, e estrutura padrão.

---

## Stack Tecnológica

| Categoria | Tecnologia | Justificativa |
|-----------|------------|---------------|
| Framework | Next.js 14+ (App Router) | SSR, rotas, API routes |
| Linguagem | TypeScript | Type safety |
| Estilo | Tailwind CSS | Consistência com DS |
| Componentes | @facter/ds-core | Design System |
| Forms | React Hook Form + Zod | Validação tipada |
| Estado Global | Zustand | Simples, sem boilerplate |
| Data Fetching | TanStack Query | Cache, refetch, mutations |
| HTTP Client | Axios | Interceptors, instâncias |
| Auth | JWT + Cookies | Seguro, SSR-friendly |
| Testes | Vitest + Testing Library | Rápido, compatível |

---

## Estrutura de Pastas

```
facter-boilerplate/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Rotas públicas (login, register)
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx      # AuthLayout do DS
│   │   │
│   │   ├── (dashboard)/        # Rotas protegidas
│   │   │   ├── select-company/
│   │   │   │   └── page.tsx    # SelectionLayout do DS
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx      # DashboardLayout (sidebar, header)
│   │   │
│   │   ├── api/                # API Routes (opcional)
│   │   ├── layout.tsx          # Root layout (providers)
│   │   └── globals.css         # Importa tema do DS
│   │
│   ├── components/
│   │   ├── ui/                 # Re-exports do DS (se precisar override)
│   │   ├── common/             # Componentes compartilhados do projeto
│   │   └── layouts/            # Layouts específicos (DashboardLayout)
│   │
│   ├── features/               # Módulos por domínio
│   │   ├── auth/
│   │   │   ├── components/     # Componentes específicos de auth
│   │   │   ├── hooks/          # useAuth, useLogin, etc
│   │   │   ├── services/       # authService.ts
│   │   │   ├── stores/         # authStore.ts (Zustand)
│   │   │   ├── types/          # User, LoginDTO, etc
│   │   │   └── index.ts        # Barrel export
│   │   │
│   │   └── company/            # Exemplo de feature
│   │       ├── components/
│   │       ├── hooks/
│   │       ├── services/
│   │       └── types/
│   │
│   ├── lib/                    # Utilitários e configs
│   │   ├── api.ts              # Instância Axios configurada
│   │   ├── query-client.ts     # TanStack Query config
│   │   └── utils.ts            # Helpers genéricos
│   │
│   ├── providers/              # Context providers
│   │   ├── app-providers.tsx   # Combina todos os providers
│   │   ├── auth-provider.tsx   # Contexto de autenticação
│   │   └── query-provider.tsx  # TanStack Query provider
│   │
│   ├── stores/                 # Stores globais (Zustand)
│   │   └── app-store.ts        # Estado global da app
│   │
│   ├── hooks/                  # Hooks globais
│   │   └── use-media-query.ts
│   │
│   ├── types/                  # Tipos globais
│   │   ├── api.ts              # ApiResponse, PaginatedResponse
│   │   └── index.ts
│   │
│   └── config/                 # Configurações
│       ├── env.ts              # Validação de env vars
│       ├── routes.ts           # Constantes de rotas
│       └── api-routes.ts       # Endpoints da API
│
├── public/
│   └── images/
│
├── tests/
│   ├── setup.ts
│   └── utils.tsx               # Render helpers
│
├── .env.example
├── .env.local
├── tailwind.config.ts
├── next.config.js
├── tsconfig.json
└── package.json
```

---

## Patterns e Convenções

### 1. Feature-based Architecture

Cada domínio é auto-contido:

```
features/
  auth/
    components/     # UI específica
    hooks/          # Lógica React
    services/       # Chamadas API
    stores/         # Estado local
    types/          # Tipos do domínio
    index.ts        # Exports públicos
```

**Regra**: Features não importam umas das outras diretamente.
Comunicação via stores globais ou props.

### 2. Services Pattern

```typescript
// features/auth/services/auth-service.ts
import { api } from '@/lib/api'
import type { LoginDTO, User } from '../types'

export const authService = {
  login: (data: LoginDTO) =>
    api.post<{ user: User; token: string }>('/auth/login', data),

  me: () =>
    api.get<User>('/auth/me'),

  logout: () =>
    api.post('/auth/logout'),
}
```

### 3. Hooks Pattern

```typescript
// features/auth/hooks/use-login.ts
import { useMutation } from '@tanstack/react-query'
import { authService } from '../services/auth-service'
import { useAuthStore } from '../stores/auth-store'

export function useLogin() {
  const setUser = useAuthStore((s) => s.setUser)

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setUser(data.user)
      // salva token em cookie
    },
  })
}
```

### 4. Store Pattern (Zustand)

```typescript
// features/auth/stores/auth-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../types'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    { name: 'auth-storage' }
  )
)
```

### 5. API Instance

```typescript
// lib/api.ts
import axios from 'axios'
import { env } from '@/config/env'

export const api = axios.create({
  baseURL: env.API_URL,
  withCredentials: true,
})

// Interceptor para token
api.interceptors.request.use((config) => {
  const token = getTokenFromCookie()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor para refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // tenta refresh ou redireciona para login
    }
    return Promise.reject(error)
  }
)
```

### 6. Form Pattern

```typescript
// features/auth/components/login-form.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form } from '@facter/ds-core'
import { useLogin } from '../hooks/use-login'

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

type FormData = z.infer<typeof schema>

export function LoginForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const { mutate, isPending } = useLogin()

  const onSubmit = (data: FormData) => {
    mutate(data)
  }

  return (
    <Form form={form} onSubmit={form.handleSubmit(onSubmit)}>
      <Form.Input name="email" label="Email" type="email" />
      <Form.Input name="password" label="Senha" type="password" />
      <Button type="submit" isLoading={isPending}>
        Entrar
      </Button>
    </Form>
  )
}
```

---

## Fluxo de Autenticação

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Login     │────▶│   API       │────▶│  Set Token  │
│   Page      │     │  /auth/login│     │  (Cookie)   │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                                               ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Dashboard  │◀────│  Middleware │◀────│   Select    │
│             │     │  (valida)   │     │   Company   │
└─────────────┘     └─────────────┘     └─────────────┘
```

### Middleware de Auth

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicRoutes = ['/login', '/register', '/forgot-password']

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const { pathname } = request.nextUrl

  // Rota pública - permite acesso
  if (publicRoutes.includes(pathname)) {
    // Se já logado, redireciona para dashboard
    if (token) {
      return NextResponse.redirect(new URL('/select-company', request.url))
    }
    return NextResponse.next()
  }

  // Rota protegida - verifica token
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

---

## Providers Setup

```typescript
// providers/app-providers.tsx
'use client'

import { QueryProvider } from './query-provider'
import { ThemeProvider } from '@facter/ds-core'
import { AuthProvider } from './auth-provider'
import { Toaster } from '@facter/ds-core'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryProvider>
  )
}
```

---

## Configuração de Ambiente

```typescript
// config/env.ts
import { z } from 'zod'

const envSchema = z.object({
  API_URL: z.string().url(),
  APP_NAME: z.string().default('Facter'),
  NODE_ENV: z.enum(['development', 'production', 'test']),
})

export const env = envSchema.parse({
  API_URL: process.env.NEXT_PUBLIC_API_URL,
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NODE_ENV: process.env.NODE_ENV,
})
```

---

## Convenções de Código

### Nomenclatura

| Tipo | Convenção | Exemplo |
|------|-----------|---------|
| Componentes | PascalCase | `LoginForm.tsx` |
| Hooks | camelCase com "use" | `useLogin.ts` |
| Services | camelCase com "service" | `authService.ts` |
| Stores | camelCase com "store" | `authStore.ts` |
| Types | PascalCase | `User.ts` |
| Utils | camelCase | `formatDate.ts` |

### Imports

```typescript
// Ordem de imports
1. React/Next
2. Bibliotecas externas
3. @facter/ds-core
4. @/ (aliases internos)
5. ./ (relativos)

// Exemplo
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button, Form } from '@facter/ds-core'
import { api } from '@/lib/api'
import { useLogin } from './hooks/use-login'
```

### Barrel Exports

```typescript
// features/auth/index.ts
export * from './components/login-form'
export * from './hooks/use-login'
export * from './hooks/use-auth'
export * from './stores/auth-store'
export type * from './types'
```

---

## O que já vem pronto

- [x] Estrutura de pastas
- [x] Configuração Tailwind + DS theme
- [x] Providers (Query, Theme, Auth)
- [x] API instance com interceptors
- [x] Middleware de autenticação
- [x] Tela de Login (usando AuthLayout)
- [x] Tela de Seleção de Empresa (usando SelectionLayout)
- [x] Layout de Dashboard básico
- [x] Configuração de ambiente validada
- [x] Exemplo de feature completa (auth)

---

## Perguntas em Aberto

1. **Monorepo ou repo separado?**
   - [ ] Dentro do facter-design-system (packages/boilerplate)
   - [ ] Repositório separado (facter-boilerplate)

2. **Como criar novo projeto?**
   - [ ] `npx create-facter-app` (CLI próprio)
   - [ ] `npx degit facter/boilerplate` (cópia simples)
   - [ ] Template no GitHub (Use this template)

3. **Multi-tenancy?**
   - [ ] Uma empresa por usuário (simples)
   - [ ] Múltiplas empresas por usuário (como Facter Truck)

4. **Internacionalização?**
   - [ ] Português apenas
   - [ ] next-intl para múltiplos idiomas

5. **Dashboard Layout?**
   - [ ] Criar no boilerplate
   - [ ] Adicionar no Design System primeiro

---

## Próximos Passos

1. Responder perguntas em aberto
2. Criar repositório/pasta do boilerplate
3. Implementar estrutura base
4. Implementar feature de auth completa
5. Documentar uso
