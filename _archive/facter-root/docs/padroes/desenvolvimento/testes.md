# Padrões de Testes

> **Estratégia e padrões de testes para os projetos Facter.**

---

## Pirâmide de Testes

```
        /\
       /  \     E2E (poucos - fluxos críticos)
      /----\
     /      \   Integration (alguns - APIs, hooks)
    /--------\
   /          \ Unit (muitos - funções, use cases)
  /------------\
```

| Tipo | Quantidade | Foco | Ferramentas |
|------|------------|------|-------------|
| **Unit** | Muitos | Lógica isolada | Vitest, Jest |
| **Integration** | Alguns | Componentes + APIs | Testing Library, Supertest |
| **E2E** | Poucos | Fluxos críticos | Playwright |

---

## O Que Testar

### ✅ TESTAR

| Categoria | Exemplos |
|-----------|----------|
| Lógica de negócio | Use cases, validações, cálculos |
| Comportamento do usuário | Cliques, formulários, navegação |
| Edge cases | Valores nulos, listas vazias, erros |
| Estados de erro | API falha, validação falha |
| Integração entre módulos | Hook + API, Component + Store |

### ❌ NÃO TESTAR

| Categoria | Motivo |
|-----------|--------|
| Implementação interna | Quebradiço, não agrega valor |
| Bibliotecas externas | Já são testadas |
| Código trivial | Getters simples, constants |
| Estilos CSS | Testes visuais são melhores |
| Tipos TypeScript | Compilador já verifica |

---

## Padrão AAA

```typescript
it('should calculate total with discount', () => {
  // Arrange - preparar dados
  const items = [{ price: 100 }, { price: 50 }];
  const discount = 0.1;

  // Act - executar ação
  const total = calculateTotal(items, discount);

  // Assert - verificar resultado
  expect(total).toBe(135); // (100 + 50) * 0.9
});
```

---

## Frontend (React)

### Setup

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'src/test/'],
    },
  },
});
```

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock de APIs globais
vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));
```

### Teste de Componente

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { UserCard } from './UserCard';

describe('UserCard', () => {
  const mockUser = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
  };

  it('renders user information', () => {
    render(<UserCard user={mockUser} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('calls onSelect when clicked', async () => {
    const onSelect = vi.fn();
    render(<UserCard user={mockUser} onSelect={onSelect} />);

    await fireEvent.click(screen.getByRole('article'));

    expect(onSelect).toHaveBeenCalledWith(mockUser);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<UserCard user={mockUser} isLoading />);

    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
  });
});
```

### Teste de Hook

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUsers } from './useUsers';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

describe('useUsers', () => {
  it('fetches users successfully', async () => {
    const mockUsers = [{ id: '1', name: 'John' }];
    vi.mocked(api.get).mockResolvedValue({ data: mockUsers });

    const { result } = renderHook(() => useUsers(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockUsers);
  });

  it('handles error', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useUsers(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe('Network error');
  });
});
```

### Teste de Store (Zustand)

```typescript
import { act, renderHook } from '@testing-library/react';
import { useUserStore } from './user-store';

describe('useUserStore', () => {
  beforeEach(() => {
    // Reset store entre testes
    useUserStore.setState({ user: null, isAuthenticated: false });
  });

  it('sets user on login', () => {
    const { result } = renderHook(() => useUserStore());

    act(() => {
      result.current.setUser({ id: '1', name: 'John' });
    });

    expect(result.current.user).toEqual({ id: '1', name: 'John' });
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('clears user on logout', () => {
    const { result } = renderHook(() => useUserStore());

    act(() => {
      result.current.setUser({ id: '1', name: 'John' });
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});
```

---

## Backend (NestJS)

### Teste de Use Case

```typescript
import { CreateUser } from './create-user.use-case';
import { InMemoryUserRepository } from '../repositories/in-memory-user.repository';
import { UserAlreadyExistsException } from '../exceptions';
import { makeUser } from '@/test/factories/make-user';

describe('CreateUser', () => {
  let createUser: CreateUser;
  let userRepository: InMemoryUserRepository;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    createUser = new CreateUser(userRepository);
  });

  it('should create a new user', async () => {
    const request = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Password123',
    };

    const user = await createUser.execute(request);

    expect(user.id).toBeDefined();
    expect(user.name).toBe(request.name);
    expect(user.email).toBe(request.email);
    expect(userRepository.users).toHaveLength(1);
  });

  it('should throw if user already exists', async () => {
    const existingUser = makeUser({ email: 'john@example.com' });
    userRepository.users.push(existingUser);

    const request = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Password123',
    };

    await expect(createUser.execute(request)).rejects.toThrow(
      UserAlreadyExistsException,
    );
  });

  it('should hash password before saving', async () => {
    const request = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Password123',
    };

    const user = await createUser.execute(request);

    expect(user.password).not.toBe(request.password);
    expect(user.password).toMatch(/^\$2[aby]?\$/); // bcrypt pattern
  });
});
```

### Teste de Controller (E2E)

```typescript
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { PrismaService } from '@/infra/database/prisma.service';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    prisma = moduleRef.get(PrismaService);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Limpar banco entre testes
    await prisma.user.deleteMany();
  });

  describe('POST /users', () => {
    it('should create a user', async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'Password123',
        })
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        name: 'John Doe',
        email: 'john@example.com',
      });
      expect(response.body.password).toBeUndefined();
    });

    it('should return 400 for invalid data', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({
          name: '',
          email: 'invalid-email',
        })
        .expect(400);
    });

    it('should return 409 for duplicate email', async () => {
      await prisma.user.create({
        data: {
          name: 'Existing User',
          email: 'john@example.com',
          password: 'hash',
        },
      });

      await request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'Password123',
        })
        .expect(409);
    });
  });
});
```

---

## Factories

### Pattern

```typescript
// make-user.ts
interface Override {
  id?: string;
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
}

export function makeUser(override: Override = {}): User {
  return new User({
    id: override.id ?? randomUUID(),
    name: override.name ?? faker.person.fullName(),
    email: override.email ?? faker.internet.email(),
    password: override.password ?? 'HashedPassword123',
    role: override.role ?? UserRole.USER,
  });
}
```

### Uso

```typescript
// Criar user padrão
const user = makeUser();

// Criar user customizado
const admin = makeUser({ role: UserRole.ADMIN });

// Criar múltiplos
const users = Array.from({ length: 10 }, () => makeUser());
```

---

## Mocks

### API Mock

```typescript
// Vitest
vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

// Uso no teste
vi.mocked(api.get).mockResolvedValue({ data: mockData });
vi.mocked(api.get).mockRejectedValue(new Error('Network error'));
```

### Service Mock (NestJS)

```typescript
const mockUserService = {
  findById: jest.fn(),
  create: jest.fn(),
};

const moduleRef = await Test.createTestingModule({
  controllers: [UserController],
  providers: [
    {
      provide: UserService,
      useValue: mockUserService,
    },
  ],
}).compile();
```

---

## Coverage

### Metas

| Tipo | Meta |
|------|------|
| Statements | > 80% |
| Branches | > 75% |
| Functions | > 80% |
| Lines | > 80% |

### Configuração

```json
// package.json
{
  "scripts": {
    "test": "vitest",
    "test:cov": "vitest run --coverage",
    "test:watch": "vitest watch"
  }
}
```

---

## E2E com Playwright

### Setup

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Teste E2E

```typescript
import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('/login');

    await page.fill('[name="email"]', 'user@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText('Welcome')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('[name="email"]', 'wrong@example.com');
    await page.fill('[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    await expect(page.getByText('Invalid credentials')).toBeVisible();
    await expect(page).toHaveURL('/login');
  });
});
```

---

## Checklist de Testes

### Antes de Commitar

- [ ] Todos os testes passam
- [ ] Novos testes para novas features
- [ ] Coverage não diminuiu
- [ ] Testes são significativos (não só coverage)

### Por Tipo de Código

| Código | Testes Necessários |
|--------|-------------------|
| Use Case | Unit tests para happy path + edge cases |
| Component | Render test + interaction tests |
| Hook | Render hook tests |
| Store | State mutation tests |
| API Endpoint | E2E ou integration test |
| Fluxo crítico | E2E test |

---

**Relacionados:**
- [React](./react.md) - Padrões React
- [NestJS](./nestjs.md) - Padrões NestJS

**Voltar para** [Padrões](../README.md)
