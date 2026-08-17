# Frontend Standards & Architecture

> Arquitetura e padrões de código para o frontend Next.js do Facter Boilerplate.
> Este documento é a referência principal para desenvolvimento frontend.

---

## Princípios

1. **Security First** - httpOnly cookies para tokens, nunca localStorage
2. **Type Safety** - TypeScript strict, nunca `any`, Zod para runtime validation
3. **Explicit Error Handling** - Result pattern em vez de try/catch espalhado
4. **Testability** - Arquitetura em camadas permite testes isolados
5. **Clean Code** - Código autoexplicativo, comentários apenas para decisões não óbvias
6. **Feature-First** - Organização por features, não por tipo de arquivo

---

## Arquitetura

### Visão Geral

```
src/
├── core/                        # Infraestrutura (não muda entre features)
│   ├── api/                     # HTTP client, interceptors, Result pattern
│   ├── config/                  # Env, routes, constants
│   └── providers/               # React context providers
│
├── shared/                      # Compartilhado entre features
│   ├── components/              # UI components genéricos
│   ├── hooks/                   # Hooks utilitários
│   ├── types/                   # Types globais
│   └── utils/                   # Funções utilitárias
│
├── features/                    # Feature modules (Domain-Driven)
│   └── [feature]/
│       ├── domain/              # Entities e Schemas
│       ├── data/                # Repository + Service
│       ├── presentation/        # Hooks + Components
│       ├── stores/              # Zustand stores
│       └── index.ts             # Public API
│
├── app/                         # Next.js App Router (routing only)
│
└── tests/                       # Test utilities e mocks
    └── mocks/                   # MSW handlers
```

### Fluxo de Dados

```
[Component] → [Hook] → [Repository Interface] → [Service] → [API]
     ↑                                                         ↓
     └────────────────── Result<T, Error> ←───────────────────┘
```

---

## Camadas e Responsabilidades

### 1. Domain Layer (`feature/domain/`)

**Responsabilidade:** Tipos, entidades e validação.

```
domain/
├── entities/
│   └── user.ts          # Interfaces de domínio
└── schemas/
    └── auth.schema.ts   # Zod schemas para validação
```

**Entities:**
```typescript
// domain/entities/user.ts
export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
}

export interface Membership {
  id: string;
  companyId: string;
  companyName: string;
  role: string;
  isOwner: boolean;
}
```

**Schemas:**
```typescript
// domain/schemas/auth.schema.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  avatar: z.string().nullable(),
});
```

---

### 2. Data Layer (`feature/data/`)

**Responsabilidade:** Acesso a dados via Repository pattern.

```
data/
├── repositories/
│   └── auth.repository.ts   # Interface abstrata
└── services/
    └── auth.service.ts      # Implementação (API calls)
```

**Repository (Interface):**
```typescript
// data/repositories/auth.repository.ts
import type { Result } from '@/core/api';
import type { ApiError } from '@/core/api';
import type { User, Membership } from '../domain/entities/user';
import type { LoginInput } from '../domain/schemas/auth.schema';

export interface AuthResponse {
  user: User & { memberships: Membership[] };
}

export interface PermissionsResponse {
  role: string;
  isOwner: boolean;
  permissions: Permission[];
}

export interface AuthRepository {
  login(input: LoginInput): Promise<Result<AuthResponse, ApiError>>;
  register(input: RegisterInput): Promise<Result<AuthResponse, ApiError>>;
  logout(): Promise<Result<void, ApiError>>;
  getMe(): Promise<Result<AuthResponse, ApiError>>;
  getPermissions(): Promise<Result<PermissionsResponse, ApiError>>;
  switchCompany(companyId: string): Promise<Result<SwitchCompanyResponse, ApiError>>;
}
```

**Service (Implementação):**
```typescript
// data/services/auth.service.ts
import { post, get } from '@/core/api';
import { API_ROUTES } from '@/core/config';
import type { AuthRepository } from '../repositories/auth.repository';
import { authResponseSchema, permissionsSchema } from '../domain/schemas/auth.schema';

export const authService: AuthRepository = {
  login: (input) =>
    post(API_ROUTES.AUTH.LOGIN, input, authResponseSchema),

  logout: () =>
    post(API_ROUTES.AUTH.LOGOUT, {}),

  getMe: () =>
    get(API_ROUTES.AUTH.ME, authResponseSchema),

  getPermissions: () =>
    get(API_ROUTES.AUTH.PERMISSIONS, permissionsSchema),

  switchCompany: (companyId) =>
    post(API_ROUTES.AUTH.SWITCH_COMPANY, { companyId }, switchCompanySchema),
};
```

---

### 3. Presentation Layer (`feature/presentation/`)

**Responsabilidade:** UI e integração com React.

```
presentation/
├── hooks/
│   ├── use-login.ts
│   ├── use-auth.ts
│   └── index.ts
└── components/
    ├── login-form.tsx
    └── index.ts
```

**Hooks (TanStack Query):**
```typescript
// presentation/hooks/use-login.ts
'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authService } from '../../data/services/auth.service';
import { useAuthStore } from '../../stores/auth.store';
import { ROUTES } from '@/core/config';
import { isOk } from '@/core/api';
import type { LoginInput } from '../../domain/schemas/auth.schema';

export function useLogin() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (input: LoginInput) => authService.login(input),

    onSuccess: (result) => {
      if (isOk(result)) {
        setAuth({
          user: result.data.user,
          memberships: result.data.user.memberships,
        });
        toast.success('Login realizado com sucesso!');

        if (result.data.user.memberships.length === 1) {
          router.push(ROUTES.DASHBOARD);
        } else {
          router.push(ROUTES.SELECT_COMPANY);
        }
      } else {
        toast.error(result.error.message);
      }
    },
  });
}
```

**Components:**
```typescript
// presentation/components/login-form.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, FormInput } from '@facter/ds-core';
import { useLogin } from '../hooks';
import { loginSchema, type LoginInput } from '../../domain/schemas/auth.schema';

export function LoginForm() {
  const { mutate: login, isPending } = useLogin();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginInput) => login(data);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FormInput
        label="Email"
        type="email"
        error={form.formState.errors.email?.message}
        {...form.register('email')}
      />
      <FormInput
        label="Senha"
        type="password"
        error={form.formState.errors.password?.message}
        {...form.register('password')}
      />
      <Button type="submit" isLoading={isPending}>
        Entrar
      </Button>
    </form>
  );
}
```

---

### 4. Stores (`feature/stores/`)

**Responsabilidade:** Estado global da feature (Zustand).

```typescript
// stores/auth.store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, Membership, Permission } from '../domain/entities/user';
import { companyStorage } from '@/core/api';

interface AuthState {
  user: User | null;
  memberships: Membership[];
  currentCompanyId: string | null;
  permissions: Permission[];
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  setAuth: (data: { user: User; memberships: Membership[] }) => void;
  setCompany: (companyId: string) => void;
  setPermissions: (permissions: Permission[]) => void;
  logout: () => void;
}

const initialState: AuthState = {
  user: null,
  memberships: [],
  currentCompanyId: null,
  permissions: [],
  isAuthenticated: false,
  isLoading: true,
};

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      setAuth: ({ user, memberships }) => {
        const companyId = memberships.length === 1 ? memberships[0].companyId : null;
        if (companyId) companyStorage.set(companyId);

        set({
          user,
          memberships,
          currentCompanyId: companyId,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      setCompany: (companyId) => {
        const { memberships } = get();
        if (!memberships.find((m) => m.companyId === companyId)) return;

        companyStorage.set(companyId);
        set({ currentCompanyId: companyId, permissions: [] });
      },

      setPermissions: (permissions) => set({ permissions }),

      logout: () => {
        companyStorage.remove();
        set({ ...initialState, isLoading: false });
      },
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        memberships: state.memberships,
        currentCompanyId: state.currentCompanyId,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
```

---

### 5. Public API (`feature/index.ts`)

**Responsabilidade:** Exportar apenas o que outras features podem usar.

```typescript
// features/auth/index.ts

// Stores
export { useAuthStore } from './stores/auth.store';

// Hooks
export { useAuth, useLogin, useRegister, useLogout } from './presentation/hooks';
export { usePermission, usePermissions } from './presentation/hooks';

// Components
export { LoginForm, RegisterForm } from './presentation/components';

// Types (domain)
export type { User, Membership, Permission } from './domain/entities/user';
export type { LoginInput, RegisterInput } from './domain/schemas/auth.schema';
```

---

## Core Layer

### API Client (`core/api/`)

```
core/api/
├── client.ts        # Axios instance
├── request.ts       # get, post com Result pattern
├── result.ts        # Result<T, E> type
├── types.ts         # ApiError class
└── index.ts         # Barrel export
```

**Result Pattern:**
```typescript
// core/api/result.ts
export type Result<T, E = Error> =
  | { ok: true; data: T }
  | { ok: false; error: E };

export const Ok = <T>(data: T): Result<T, never> => ({ ok: true, data });
export const Err = <E>(error: E): Result<never, E> => ({ ok: false, error });

export function isOk<T, E>(result: Result<T, E>): result is { ok: true; data: T } {
  return result.ok;
}

export function isErr<T, E>(result: Result<T, E>): result is { ok: false; error: E } {
  return !result.ok;
}
```

**API Client:**
```typescript
// core/api/client.ts
import axios from 'axios';
import { env } from '@/core/config';

export const apiClient = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
  timeout: 30000,
  withCredentials: true, // httpOnly cookies
});
```

---

## Testes

### Estratégia

| Camada | Tipo | Ferramenta | Cobertura |
|--------|------|------------|-----------|
| Schemas | Unit | Vitest | 100% |
| Services | Integration | Vitest + MSW | 90%+ |
| Hooks | Integration | RTL + MSW | 80%+ |
| Components | Component | RTL | 70%+ |
| E2E | End-to-End | Playwright | Críticos |

### MSW para Mocks

```typescript
// tests/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post('*/auth/login', async ({ request }) => {
    const body = await request.json();

    if (body.email === 'test@test.com') {
      return HttpResponse.json({
        data: { user: { id: '1', email: 'test@test.com', name: 'Test' } },
      });
    }

    return HttpResponse.json(
      { error: { message: 'Invalid credentials' } },
      { status: 401 }
    );
  }),
];
```

### Exemplo de Teste

```typescript
// data/services/__tests__/auth.service.test.ts
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { server } from '@/tests/mocks/server';
import { authService } from '../auth.service';
import { isOk } from '@/core/api';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('authService.login', () => {
  it('should return user on success', async () => {
    const result = await authService.login({
      email: 'test@test.com',
      password: '123456',
    });

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.data.user.email).toBe('test@test.com');
    }
  });
});
```

---

## Next.js App Router

### Estrutura

```
app/
├── (auth)/                  # Route group - sem layout de dashboard
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── layout.tsx           # AuthLayout
├── (dashboard)/             # Route group - com sidebar
│   ├── dashboard/page.tsx
│   ├── settings/page.tsx
│   └── layout.tsx           # DashboardLayout
├── layout.tsx               # Root layout (providers)
└── page.tsx                 # Home/redirect
```

### Pages são finas

```typescript
// app/(auth)/login/page.tsx
import { LoginForm } from '@/features/auth';

export default function LoginPage() {
  return <LoginForm />;
}
```

---

## Checklist de Qualidade

- [ ] Sem `any` no código
- [ ] Schemas Zod para todas as validações
- [ ] Result pattern para operações async
- [ ] Repository interface + Service implementation
- [ ] Testes para schemas, services e hooks críticos
- [ ] Barrel exports nas features
- [ ] Components usam Design System

---

*Última atualização: 2025-12-16*
