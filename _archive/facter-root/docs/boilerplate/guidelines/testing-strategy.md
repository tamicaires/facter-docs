# Testing Strategy

> Estratégia de testes para o Facter Boilerplate (Frontend e Backend).

---

## Princípios

1. **Test Pyramid** - Mais unit tests, menos E2E
2. **Test Behavior, Not Implementation** - Testar o que faz, não como faz
3. **MSW para API Mocks** - Mock na camada de rede, não em módulos
4. **Cobertura com Propósito** - Não buscar 100%, focar no crítico

---

## Frontend

### Stack de Testes

| Ferramenta | Uso |
|------------|-----|
| **Vitest** | Test runner (unit + integration) |
| **React Testing Library** | Component tests |
| **MSW** | API mocking |
| **Playwright** | E2E tests |

### Cobertura por Camada

| Camada | Tipo | Cobertura | Prioridade |
|--------|------|-----------|------------|
| Schemas (Zod) | Unit | 100% | Alta |
| Services | Integration | 90%+ | Alta |
| Hooks | Integration | 80%+ | Alta |
| Components | Component | 70%+ | Média |
| E2E | End-to-End | Fluxos críticos | Alta |

---

## Estrutura de Arquivos

```
src/
├── features/auth/
│   ├── domain/schemas/
│   │   └── __tests__/
│   │       └── auth.schema.test.ts
│   ├── data/services/
│   │   └── __tests__/
│   │       └── auth.service.test.ts
│   └── presentation/
│       ├── hooks/__tests__/
│       │   └── use-login.test.tsx
│       └── components/__tests__/
│           └── login-form.test.tsx
│
├── tests/
│   ├── mocks/
│   │   ├── handlers.ts          # MSW handlers
│   │   └── server.ts            # MSW server
│   ├── utils/
│   │   └── test-utils.tsx       # Custom render, providers
│   └── setup.ts                 # Vitest global setup
│
└── e2e/
    ├── auth.spec.ts
    └── playwright.config.ts
```

---

## Exemplos por Camada

### 1. Schemas (Unit Tests)

```typescript
// domain/schemas/__tests__/auth.schema.test.ts
import { describe, it, expect } from 'vitest';
import { loginSchema } from '../auth.schema';

describe('loginSchema', () => {
  it('should validate correct input', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: '123456',
    });

    expect(result.success).toBe(true);
  });

  it('should reject invalid email', () => {
    const result = loginSchema.safeParse({
      email: 'invalid-email',
      password: '123456',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('email');
    }
  });

  it('should reject short password', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: '123',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('password');
    }
  });

  it('should reject empty fields', () => {
    const result = loginSchema.safeParse({});

    expect(result.success).toBe(false);
  });
});
```

---

### 2. Services (Integration Tests com MSW)

```typescript
// data/services/__tests__/auth.service.test.ts
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { authService } from '../auth.service';
import { isOk, isErr } from '@/core/api';

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('authService', () => {
  describe('login', () => {
    it('should return user on successful login', async () => {
      server.use(
        http.post('*/auth/login', () => {
          return HttpResponse.json({
            data: {
              user: {
                id: '1',
                email: 'test@test.com',
                name: 'Test User',
                avatar: null,
                memberships: [
                  { id: '1', companyId: 'c1', companyName: 'Test Co', role: 'admin', isOwner: true }
                ],
              },
            },
          });
        })
      );

      const result = await authService.login({
        email: 'test@test.com',
        password: '123456',
      });

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data.user.email).toBe('test@test.com');
        expect(result.data.user.memberships).toHaveLength(1);
      }
    });

    it('should return error on invalid credentials', async () => {
      server.use(
        http.post('*/auth/login', () => {
          return HttpResponse.json(
            { error: { code: 'INVALID_CREDENTIALS', message: 'Email ou senha inválidos' } },
            { status: 401 }
          );
        })
      );

      const result = await authService.login({
        email: 'test@test.com',
        password: 'wrong',
      });

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.message).toContain('inválidos');
      }
    });

    it('should handle network error', async () => {
      server.use(
        http.post('*/auth/login', () => {
          return HttpResponse.error();
        })
      );

      const result = await authService.login({
        email: 'test@test.com',
        password: '123456',
      });

      expect(isErr(result)).toBe(true);
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      server.use(
        http.post('*/auth/logout', () => {
          return HttpResponse.json({ data: null });
        })
      );

      const result = await authService.logout();

      expect(isOk(result)).toBe(true);
    });
  });
});
```

---

### 3. Hooks (Integration Tests)

```typescript
// presentation/hooks/__tests__/use-login.test.tsx
import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { useLogin } from '../use-login';

const server = setupServer();

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  mockPush.mockClear();
});
afterAll(() => server.close());

describe('useLogin', () => {
  it('should login and redirect to dashboard', async () => {
    server.use(
      http.post('*/auth/login', () => {
        return HttpResponse.json({
          data: {
            user: {
              id: '1',
              email: 'test@test.com',
              name: 'Test',
              avatar: null,
              memberships: [{ id: '1', companyId: 'c1', companyName: 'Co', role: 'admin', isOwner: true }],
            },
          },
        });
      })
    );

    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() });

    result.current.mutate({ email: 'test@test.com', password: '123456' });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('should redirect to select-company when user has multiple companies', async () => {
    server.use(
      http.post('*/auth/login', () => {
        return HttpResponse.json({
          data: {
            user: {
              id: '1',
              email: 'test@test.com',
              name: 'Test',
              avatar: null,
              memberships: [
                { id: '1', companyId: 'c1', companyName: 'Co 1', role: 'admin', isOwner: true },
                { id: '2', companyId: 'c2', companyName: 'Co 2', role: 'user', isOwner: false },
              ],
            },
          },
        });
      })
    );

    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() });

    result.current.mutate({ email: 'test@test.com', password: '123456' });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockPush).toHaveBeenCalledWith('/select-company');
  });

  it('should handle login error', async () => {
    server.use(
      http.post('*/auth/login', () => {
        return HttpResponse.json(
          { error: { message: 'Invalid credentials' } },
          { status: 401 }
        );
      })
    );

    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() });

    result.current.mutate({ email: 'test@test.com', password: 'wrong' });

    await waitFor(() => {
      expect(result.current.isError || result.current.isSuccess).toBe(true);
    });

    expect(mockPush).not.toHaveBeenCalled();
  });
});
```

---

### 4. Components (Component Tests)

```typescript
// presentation/components/__tests__/login-form.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '../login-form';

const mockMutate = vi.fn();

vi.mock('../../hooks', () => ({
  useLogin: () => ({
    mutate: mockMutate,
    isPending: false,
  }),
}));

describe('LoginForm', () => {
  beforeEach(() => {
    mockMutate.mockClear();
  });

  it('should render all form fields', () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('should show validation errors for empty fields', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByText(/email inválido/i)).toBeInTheDocument();
    });
  });

  it('should show validation error for invalid email', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), 'invalid');
    await user.type(screen.getByLabelText(/senha/i), '123456');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByText(/email inválido/i)).toBeInTheDocument();
    });
  });

  it('should call login with valid data', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), 'test@test.com');
    await user.type(screen.getByLabelText(/senha/i), '123456');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: '123456',
      });
    });
  });
});
```

---

### 5. E2E (Playwright)

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should login successfully and redirect to dashboard', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"]', 'test@test.com');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('should show error message on invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"]', 'test@test.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Credenciais inválidas')).toBeVisible();
    await expect(page).toHaveURL('/login');
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/login');

    await page.click('button[type="submit"]');

    await expect(page.locator('text=Email inválido')).toBeVisible();
  });

  test('should redirect to select-company for multi-company user', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"]', 'multicompany@test.com');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/select-company');
  });

  test('should logout and redirect to login', async ({ page }) => {
    // First login
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@test.com');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');

    // Then logout
    await page.click('button[aria-label="Logout"]');
    await expect(page).toHaveURL('/login');
  });
});
```

---

## Configuração

### Vitest Setup

```typescript
// tests/setup.ts
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
```

### vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['node_modules', 'tests', '**/*.d.ts'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### MSW Server

```typescript
// tests/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

### MSW Handlers

```typescript
// tests/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  // Auth handlers
  http.post('*/auth/login', async ({ request }) => {
    const body = await request.json() as { email: string; password: string };

    if (body.email === 'test@test.com' && body.password === '123456') {
      return HttpResponse.json({
        data: {
          user: {
            id: '1',
            email: 'test@test.com',
            name: 'Test User',
            avatar: null,
            memberships: [
              { id: '1', companyId: 'c1', companyName: 'Test Company', role: 'admin', isOwner: true },
            ],
          },
        },
      });
    }

    return HttpResponse.json(
      { error: { code: 'INVALID_CREDENTIALS', message: 'Email ou senha inválidos' } },
      { status: 401 }
    );
  }),

  http.post('*/auth/logout', () => {
    return HttpResponse.json({ data: null });
  }),

  http.get('*/auth/me', () => {
    return HttpResponse.json({
      data: {
        user: {
          id: '1',
          email: 'test@test.com',
          name: 'Test User',
          avatar: null,
          memberships: [
            { id: '1', companyId: 'c1', companyName: 'Test Company', role: 'admin', isOwner: true },
          ],
        },
      },
    });
  }),
];
```

---

## Comandos

```bash
# Unit + Integration tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage

# E2E tests
pnpm test:e2e

# E2E with UI
pnpm test:e2e:ui
```

---

## Backend (NestJS)

### Stack

| Ferramenta | Uso |
|------------|-----|
| **Vitest** | Test runner |
| **Supertest** | HTTP testing |

### Cobertura

| Camada | Tipo | Cobertura |
|--------|------|-----------|
| Use Cases | Unit | 90%+ |
| Controllers | Integration | 80%+ |
| Guards | Unit | 100% |

> Ver exemplos em `facter-boilerplate-api/src/**/__tests__/`

---

*Última atualização: 2025-12-16*
