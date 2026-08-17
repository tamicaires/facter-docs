# [FACTBP-WEB-005] Types e Utils

> Criar tipos globais e utilitários.

---

## Status: ⏳ Pendente

---

## Tasks

### Task 5.1: Criar API Types

**Arquivo:** `src/types/api.ts`

**Implementação:**
```typescript
// Response padrão da API
export interface ApiResponse<T> {
  data: T;
  meta?: ApiMeta;
}

// Metadados de paginação
export interface ApiMeta {
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

// Response paginada
export interface PaginatedResponse<T> {
  data: T[];
  meta: ApiMeta;
}

// Erro da API
export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

// Parâmetros de paginação
export interface PaginationParams {
  page?: number;
  perPage?: number;
}

// Parâmetros de busca
export interface SearchParams extends PaginationParams {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Helper para extrair data de response
export type ExtractData<T> = T extends ApiResponse<infer U> ? U : never;
```

**Commit:** `[FACTBP-WEB] feat(types): add API response types`

**Status:** ⏳

---

### Task 5.2: Criar Utils

**Arquivo:** `src/lib/utils.ts`

**Implementação:**
```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Merge de classes Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formatação de data
export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {},
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...options,
  });
}

// Formatação de data e hora
export function formatDateTime(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {},
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  });
}

// Formatação de moeda
export function formatCurrency(
  value: number,
  currency: string = 'BRL',
): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(value);
}

// Formatação de número
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value);
}

// Formatação de porcentagem
export function formatPercent(value: number, decimals: number = 1): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
}

// Truncar texto
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

// Capitalizar primeira letra
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Sleep utility (para testes/dev)
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Gerar ID único
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

// Debounce
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// Throttle
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Check if running on client
export function isClient(): boolean {
  return typeof window !== 'undefined';
}

// Check if running on server
export function isServer(): boolean {
  return typeof window === 'undefined';
}
```

**Commit:** `[FACTBP-WEB] feat(utils): add utility functions`

**Status:** ⏳

---

### Task 5.3: Criar Route Constants

**Arquivo:** `src/config/routes.ts`

**Implementação:**
```typescript
// Rotas públicas (não requerem autenticação)
export const PUBLIC_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
} as const;

// Rotas autenticadas
export const PRIVATE_ROUTES = {
  DASHBOARD: '/dashboard',
  SETTINGS: '/settings',
  PROFILE: '/profile',

  // Users
  USERS: '/users',
  USER_CREATE: '/users/create',
  USER_EDIT: (id: string) => `/users/${id}/edit`,
  USER_VIEW: (id: string) => `/users/${id}`,

  // Companies
  COMPANY_SETTINGS: '/company/settings',
  COMPANY_MEMBERS: '/company/members',
  COMPANY_ROLES: '/company/roles',
} as const;

// Todas as rotas
export const ROUTES = {
  ...PUBLIC_ROUTES,
  ...PRIVATE_ROUTES,
} as const;

// Array de rotas públicas (para middleware)
export const PUBLIC_PATHS = Object.values(PUBLIC_ROUTES);

// Verificar se rota é pública
export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (route) => pathname === route || pathname.startsWith(route + '/'),
  );
}

// Rota padrão após login
export const DEFAULT_LOGIN_REDIRECT = ROUTES.DASHBOARD;

// Rota padrão após logout
export const DEFAULT_LOGOUT_REDIRECT = ROUTES.LOGIN;
```

**Commit:** `[FACTBP-WEB] feat(config): add route constants`

**Status:** ⏳

---

### Task 5.4: Criar Index Exports

**Arquivo:** `src/types/index.ts`

**Implementação:**
```typescript
export * from './api';
```

**Arquivo:** `src/lib/index.ts`

```typescript
export * from './api';
export * from './auth-storage';
export * from './utils';
```

**Arquivo:** `src/config/index.ts`

```typescript
export * from './env';
export * from './routes';
export * from './api-routes';
```

**Status:** ⏳

---

## Estrutura Final Sprint 4

```
src/
├── app/
│   ├── layout.tsx (atualizado)
│   └── globals.css
├── config/
│   ├── index.ts
│   ├── env.ts
│   ├── routes.ts
│   └── api-routes.ts
├── features/
│   └── auth/
│       ├── index.ts
│       ├── hooks/
│       │   ├── use-auth.ts
│       │   └── use-permission.ts
│       ├── stores/
│       │   └── auth-store.ts
│       └── types/
│           └── index.ts
├── lib/
│   ├── index.ts
│   ├── api.ts
│   ├── auth-storage.ts
│   └── utils.ts
├── providers/
│   ├── index.ts
│   ├── app-providers.tsx
│   ├── query-provider.tsx
│   └── toast-provider.tsx
└── types/
    ├── index.ts
    └── api.ts
```

---

## Critérios de Aceite

- [ ] API types definidos
- [ ] Utils criados e funcionando
- [ ] Route constants definidos
- [ ] Barrel exports criados
- [ ] Imports via @/ funcionando

---

*Task de [Sprint 4](../sprint-04.md)*
