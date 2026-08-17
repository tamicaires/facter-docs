# [FACTBP-WEB-002] API Client

> API client robusto com Result pattern, Zod validation e suporte a httpOnly cookies.

---

## Status: ✅ Concluído (2025-12-16)

## Contexto

**Arquitetura:**
- httpOnly cookies (tokens gerenciados pelo browser)
- Result pattern para error handling explícito
- Zod validation em responses
- Retry logic e request deduplication

**Dependências:**
- FACTBP-API-017 (httpOnly cookies no backend)

---

## Tasks

### Task 2.1: Criar Result Pattern

**Arquivo:** `src/lib/result.ts`

```typescript
export type Result<T, E = Error> =
  | { ok: true; data: T }
  | { ok: false; error: E };

export const Ok = <T>(data: T): Result<T, never> => ({
  ok: true,
  data,
});

export const Err = <E>(error: E): Result<never, E> => ({
  ok: false,
  error,
});

export function isOk<T, E>(result: Result<T, E>): result is { ok: true; data: T } {
  return result.ok;
}

export function isErr<T, E>(result: Result<T, E>): result is { ok: false; error: E } {
  return !result.ok;
}
```

**Status:** ✅

---

### Task 2.2: Criar API Error Types

**Arquivo:** `src/lib/api/types.ts`

```typescript
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    fields?: Record<string, string[]>;
  };
}

export interface ApiSuccessResponse<T> {
  data: T;
  meta?: {
    total?: number;
    page?: number;
    perPage?: number;
    totalPages?: number;
  };
}

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
    public readonly fields?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static fromResponse(status: number, data: ApiErrorResponse): ApiError {
    return new ApiError(
      data.error.code,
      data.error.message,
      status,
      data.error.fields,
    );
  }

  static network(message = 'Erro de conexão'): ApiError {
    return new ApiError('NETWORK_ERROR', message, 0);
  }

  static unknown(message = 'Erro inesperado'): ApiError {
    return new ApiError('UNKNOWN_ERROR', message, 500);
  }
}
```

**Status:** ✅

---

### Task 2.3: Criar API Client

**Arquivo:** `src/lib/api/client.ts`

```typescript
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { env } from '@/config/env';
import { ApiError, ApiErrorResponse, ApiSuccessResponse } from './types';
import { Result, Ok, Err } from '../result';

function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: env.NEXT_PUBLIC_API_URL,
    timeout: 30000,
    withCredentials: true,
  });

  client.interceptors.request.use((config) => {
    const companyId = getCompanyId();
    if (companyId && !isAuthRoute(config.url)) {
      config.headers['X-Company-ID'] = companyId;
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ApiErrorResponse>) => {
      if (error.response?.status === 401 && !isAuthRoute(error.config?.url)) {
        const refreshed = await attemptRefresh();
        if (refreshed && error.config) {
          return client.request(error.config);
        }
        redirectToLogin();
      }
      return Promise.reject(error);
    },
  );

  return client;
}

function isAuthRoute(url?: string): boolean {
  if (!url) return false;
  return url.includes('/auth/login') ||
         url.includes('/auth/register') ||
         url.includes('/auth/refresh');
}

function getCompanyId(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('company_id');
}

let refreshPromise: Promise<boolean> | null = null;

async function attemptRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = api
    .post('/auth/refresh')
    .then(() => true)
    .catch(() => false)
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

function redirectToLogin(): void {
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

export const api = createApiClient();
```

**Status:** ✅

---

### Task 2.4: Criar Request Helpers

**Arquivo:** `src/lib/api/request.ts`

```typescript
import { z } from 'zod';
import { AxiosRequestConfig, AxiosError } from 'axios';
import { api } from './client';
import { ApiError, ApiErrorResponse, ApiSuccessResponse } from './types';
import { Result, Ok, Err } from '../result';

export async function request<T>(
  config: AxiosRequestConfig,
  schema?: z.ZodType<T>,
): Promise<Result<T, ApiError>> {
  try {
    const response = await api.request<ApiSuccessResponse<T>>(config);
    const data = response.data.data;

    if (schema) {
      const parsed = schema.safeParse(data);
      if (!parsed.success) {
        return Err(ApiError.unknown('Invalid response format'));
      }
      return Ok(parsed.data);
    }

    return Ok(data);
  } catch (error) {
    return Err(handleError(error));
  }
}

export async function get<T>(
  url: string,
  schema?: z.ZodType<T>,
  config?: AxiosRequestConfig,
): Promise<Result<T, ApiError>> {
  return request({ ...config, method: 'GET', url }, schema);
}

export async function post<T, D = unknown>(
  url: string,
  data?: D,
  schema?: z.ZodType<T>,
  config?: AxiosRequestConfig,
): Promise<Result<T, ApiError>> {
  return request({ ...config, method: 'POST', url, data }, schema);
}

export async function put<T, D = unknown>(
  url: string,
  data?: D,
  schema?: z.ZodType<T>,
  config?: AxiosRequestConfig,
): Promise<Result<T, ApiError>> {
  return request({ ...config, method: 'PUT', url, data }, schema);
}

export async function del<T>(
  url: string,
  schema?: z.ZodType<T>,
  config?: AxiosRequestConfig,
): Promise<Result<T, ApiError>> {
  return request({ ...config, method: 'DELETE', url }, schema);
}

function handleError(error: unknown): ApiError {
  if (error instanceof AxiosError) {
    if (!error.response) {
      return ApiError.network();
    }
    return ApiError.fromResponse(
      error.response.status,
      error.response.data as ApiErrorResponse,
    );
  }
  return ApiError.unknown();
}
```

**Status:** ✅

---

### Task 2.5: Criar API Routes

**Arquivo:** `src/config/api-routes.ts`

```typescript
export const API_ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    PERMISSIONS: '/auth/permissions',
    SWITCH_COMPANY: '/auth/switch-company',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },

  USERS: {
    LIST: '/users',
    GET: (id: string) => `/users/${id}`,
    CREATE: '/users',
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
  },

  COMPANIES: {
    LIST: '/companies',
    GET: (id: string) => `/companies/${id}`,
    UPDATE: (id: string) => `/companies/${id}`,
  },
} as const;
```

**Status:** ✅

---

### Task 2.6: Criar Company Storage

**Arquivo:** `src/lib/company-storage.ts`

```typescript
const COMPANY_KEY = 'company_id';

export const companyStorage = {
  get: (): string | null => {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(COMPANY_KEY);
  },

  set: (companyId: string): void => {
    sessionStorage.setItem(COMPANY_KEY, companyId);
  },

  remove: (): void => {
    sessionStorage.removeItem(COMPANY_KEY);
  },
};
```

**Status:** ✅

---

### Task 2.7: Criar Index Export

**Arquivo:** `src/lib/api/index.ts`

```typescript
export { api } from './client';
export { get, post, put, del, request } from './request';
export { ApiError, type ApiSuccessResponse, type ApiErrorResponse } from './types';
```

**Status:** ✅

---

## Critérios de Aceite

- [x] Result pattern implementado
- [x] ApiError com tipos estruturados
- [x] withCredentials: true para cookies
- [x] X-Company-ID adicionado automaticamente
- [x] Refresh automático em 401
- [x] Request deduplication no refresh
- [x] Zod validation opcional em responses
- [x] Helpers get/post/put/del
- [x] API routes centralizadas

---

## Uso

```typescript
import { get, post } from '@/lib/api';
import { userSchema } from '@/features/auth/schemas';
import { API_ROUTES } from '@/config/api-routes';

// Com validação Zod
const result = await get(API_ROUTES.AUTH.ME, userSchema);

if (result.ok) {
  console.log(result.data); // User tipado e validado
} else {
  console.error(result.error.message);
}

// Sem validação (confia no backend)
const loginResult = await post(API_ROUTES.AUTH.LOGIN, credentials);
```

---

*Task de [Sprint 4](../sprint-04.md)*
