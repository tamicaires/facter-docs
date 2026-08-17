# Arquitetura Frontend

> **Arquitetura padrão para aplicações frontend nos projetos Facter.**

---

## Stack

| Tecnologia | Propósito |
|------------|-----------|
| **React 18** | UI Library |
| **TypeScript** | Type safety |
| **Vite** | Build tool |
| **TailwindCSS** | Styling |
| **React Query** | Server state |
| **Zustand** | UI state |
| **React Hook Form** | Forms |
| **Zod** | Validation |
| **React Router** | Routing |
| **@facter/ds-core** | Design System |

---

## Estrutura de Pastas

```
src/
├── app/                      # Setup da aplicação
│   ├── App.tsx               # Componente raiz
│   ├── providers.tsx         # Providers (Query, Theme, etc)
│   └── router.tsx            # Configuração de rotas
│
├── features/                 # Módulos de feature
│   └── [feature]/
│       ├── api/              # React Query hooks
│       │   ├── queries.ts    # useQuery hooks
│       │   └── mutations.ts  # useMutation hooks
│       ├── components/       # Componentes da feature
│       ├── hooks/            # Hooks específicos
│       ├── schemas/          # Zod schemas
│       ├── stores/           # Zustand stores (UI state)
│       ├── types/            # TypeScript types
│       └── index.ts          # Public exports
│
├── shared/                   # Código compartilhado
│   ├── components/           # Componentes genéricos
│   │   ├── layouts/          # Layouts (Sidebar, Header)
│   │   └── ui/               # UI components (se não usar DS)
│   ├── hooks/                # Hooks compartilhados
│   ├── lib/                  # Configurações de libs
│   │   ├── api.ts            # Axios instance
│   │   ├── query-client.ts   # React Query client
│   │   └── auth.ts           # Auth utilities
│   ├── stores/               # Stores globais
│   ├── types/                # Types globais
│   └── utils/                # Funções utilitárias
│
├── assets/                   # Arquivos estáticos
│   ├── images/
│   └── icons/
│
└── test/                     # Configuração de testes
    ├── setup.ts
    ├── utils.tsx             # Test utilities
    └── mocks/                # MSW handlers
```

---

## Feature Module

### Estrutura Completa

```
features/users/
├── api/
│   ├── queries.ts            # useUsers, useUser
│   ├── mutations.ts          # useCreateUser, useUpdateUser
│   └── index.ts
├── components/
│   ├── UserList/
│   │   ├── UserList.tsx
│   │   ├── UserList.test.tsx
│   │   └── index.ts
│   ├── UserForm/
│   │   ├── UserForm.tsx
│   │   └── index.ts
│   └── index.ts
├── hooks/
│   ├── useUserFilters.ts
│   └── index.ts
├── schemas/
│   ├── create-user.schema.ts
│   └── index.ts
├── stores/
│   ├── user-dialog.store.ts  # UI state para dialogs
│   └── index.ts
├── types/
│   ├── user.types.ts
│   └── index.ts
├── pages/                    # Opcional - se usar file-based routing
│   ├── UsersPage.tsx
│   └── UserDetailPage.tsx
└── index.ts                  # Public API
```

### Public API

```typescript
// features/users/index.ts
// Components
export { UserList } from './components/UserList';
export { UserForm } from './components/UserForm';

// Hooks
export { useUsers, useUser } from './api/queries';
export { useCreateUser, useUpdateUser } from './api/mutations';
export { useUserFilters } from './hooks/useUserFilters';

// Stores
export { useUserDialogStore } from './stores/user-dialog.store';

// Types
export type { User, CreateUserData } from './types';

// Schemas
export { createUserSchema } from './schemas';
```

---

## Gerenciamento de Estado

### Decisão de Estado

```
┌─────────────────────────────────────────────────────────────────┐
│                      QUAL ESTADO USAR?                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Dado vem do servidor?                                          │
│  ├── SIM → React Query                                          │
│  │         (cache, refetch, invalidation)                       │
│  │                                                              │
│  └── NÃO → Estado de UI                                         │
│            │                                                    │
│            ├── Usado só neste componente?                       │
│            │   └── SIM → useState                               │
│            │                                                    │
│            └── Compartilhado entre componentes?                 │
│                └── SIM → Zustand                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### React Query (Server State)

```typescript
// features/users/api/queries.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/lib/api';
import type { User } from '../types';

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: UserFilters) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

export function useUsers(filters: UserFilters = {}) {
  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: () => api.get<User[]>('/users', { params: filters }),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => api.get<User>(`/users/${id}`),
    enabled: !!id,
  });
}
```

```typescript
// features/users/api/mutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/lib/api';
import { userKeys } from './queries';
import type { CreateUserData, User } from '../types';

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserData) => api.post<User>('/users', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserData }) =>
      api.put<User>(`/users/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}
```

### Zustand (UI State)

```typescript
// features/users/stores/user-dialog.store.ts
import { create } from 'zustand';
import type { User } from '../types';

interface UserDialogState {
  isOpen: boolean;
  mode: 'create' | 'edit';
  user: User | null;
  open: (mode: 'create' | 'edit', user?: User) => void;
  close: () => void;
}

export const useUserDialogStore = create<UserDialogState>((set) => ({
  isOpen: false,
  mode: 'create',
  user: null,
  open: (mode, user = null) => set({ isOpen: true, mode, user }),
  close: () => set({ isOpen: false, user: null }),
}));
```

```typescript
// shared/stores/auth.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/shared/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) =>
        set({ user, token, isAuthenticated: true }),
      logout: () =>
        set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }),
    }
  )
);
```

---

## API Client

```typescript
// shared/lib/api.ts
import axios, { AxiosError } from 'axios';
import { useAuthStore } from '@/shared/stores/auth.store';

const API_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - adiciona token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - trata erros
api.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## Query Client

```typescript
// shared/lib/query-client.ts
import { QueryClient } from '@tanstack/react-query';
import { toast } from '@facter/ds-core';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      onError: (error) => {
        const message = error instanceof Error
          ? error.message
          : 'Erro inesperado';
        toast.error(message);
      },
    },
  },
});
```

---

## Forms

```typescript
// features/users/components/UserForm/UserForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input } from '@facter/ds-core';
import { createUserSchema, type CreateUserData } from '../../schemas';
import { useCreateUser } from '../../api/mutations';

interface UserFormProps {
  onSuccess?: () => void;
}

export function UserForm({ onSuccess }: UserFormProps) {
  const { mutate: createUser, isPending } = useCreateUser();

  const form = useForm<CreateUserData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    createUser(data, {
      onSuccess: () => {
        form.reset();
        onSuccess?.();
      },
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        label="Nome"
        error={form.formState.errors.name?.message}
        {...form.register('name')}
      />
      <Input
        label="Email"
        type="email"
        error={form.formState.errors.email?.message}
        {...form.register('email')}
      />
      <Button type="submit" loading={isPending}>
        Salvar
      </Button>
    </form>
  );
}
```

---

## Routing

```typescript
// app/router.tsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { RootLayout } from '@/shared/components/layouts/RootLayout';
import { AuthGuard } from '@/shared/components/guards/AuthGuard';
import { Loading } from '@facter/ds-core';

// Lazy loading de páginas
const Dashboard = lazy(() => import('@/features/dashboard/pages/DashboardPage'));
const Users = lazy(() => import('@/features/users/pages/UsersPage'));
const Login = lazy(() => import('@/features/auth/pages/LoginPage'));

const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<Loading />}>{children}</Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <SuspenseWrapper>
        <Login />
      </SuspenseWrapper>
    ),
  },
  {
    path: '/',
    element: (
      <AuthGuard>
        <RootLayout />
      </AuthGuard>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      {
        path: 'dashboard',
        element: (
          <SuspenseWrapper>
            <Dashboard />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'users',
        element: (
          <SuspenseWrapper>
            <Users />
          </SuspenseWrapper>
        ),
      },
    ],
  },
]);
```

---

## Providers

```typescript
// app/providers.tsx
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider, Toaster } from '@facter/ds-core';
import { queryClient } from '@/shared/lib/query-client';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system">
        {children}
        <Toaster />
        <ReactQueryDevtools initialIsOpen={false} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
```

---

## Checklist de Arquitetura

- [ ] Features isoladas e independentes
- [ ] React Query para server state
- [ ] Zustand para UI state compartilhado
- [ ] API client configurado com interceptors
- [ ] Query keys organizadas por feature
- [ ] Forms com React Hook Form + Zod
- [ ] Lazy loading em rotas
- [ ] Error boundaries em pontos críticos
- [ ] Design System integrado

---

**Relacionados:**
- [React](../desenvolvimento/react.md) - Padrões React
- [TypeScript](../desenvolvimento/typescript.md) - Padrões TypeScript

**Voltar para** [Padrões](../README.md)
