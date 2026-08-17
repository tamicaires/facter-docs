# [FACTBP-INFRA-004] Testes

> Setup de testes unitários e de integração.

---

## Status: ⏳ Pendente

## Contexto

**Estratégia de Testes:**
- Backend: Jest para unit e integration
- Frontend: Vitest para unit tests
- Cobertura mínima: 70% em auth

---

## Tasks

### Task 4.1: Configurar Jest (Backend)

**Arquivo:** `facter-boilerplate-api/jest.config.js`

**Implementação:**
```javascript
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.module.ts',
    '!src/**/*.dto.ts',
    '!src/**/*.entity.ts',
    '!src/main.ts',
  ],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
};
```

**Arquivo:** `facter-boilerplate-api/test/setup.ts`

```typescript
// Global test setup
jest.setTimeout(30000);

// Mock do ConfigService para testes
jest.mock('@nestjs/config', () => ({
  ConfigService: jest.fn().mockImplementation(() => ({
    get: jest.fn((key: string) => {
      const config: Record<string, unknown> = {
        'jwt.secret': 'test-secret',
        'jwt.refreshSecret': 'test-refresh-secret',
        'jwt.expiresIn': '15m',
        'jwt.refreshExpiresInDays': 7,
      };
      return config[key];
    }),
  })),
}));
```

**Commit:** `[FACTBP-API] test: configure Jest`

**Status:** ⏳

---

### Task 4.2: Criar Testes para PasswordService

**Arquivo:** `src/infra/auth/services/password.service.spec.ts`

**Implementação:**
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { PasswordService } from './password.service';

describe('PasswordService', () => {
  let service: PasswordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PasswordService],
    }).compile();

    service = module.get<PasswordService>(PasswordService);
  });

  describe('hash', () => {
    it('should hash a password', async () => {
      const password = 'TestPassword123';
      const hash = await service.hash(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50); // bcrypt hashes are long
    });

    it('should generate different hashes for same password', async () => {
      const password = 'TestPassword123';
      const hash1 = await service.hash(password);
      const hash2 = await service.hash(password);

      expect(hash1).not.toBe(hash2); // Different salts
    });
  });

  describe('compare', () => {
    it('should return true for correct password', async () => {
      const password = 'TestPassword123';
      const hash = await service.hash(password);

      const result = await service.compare(password, hash);

      expect(result).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const password = 'TestPassword123';
      const hash = await service.hash(password);

      const result = await service.compare('WrongPassword', hash);

      expect(result).toBe(false);
    });
  });

  describe('validate', () => {
    it('should pass for valid password', () => {
      const result = service.validate('ValidPass1');

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail for short password', () => {
      const result = service.validate('Short1');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Senha deve ter no mínimo 8 caracteres');
    });

    it('should fail for password without uppercase', () => {
      const result = service.validate('lowercase1');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        'Senha deve ter pelo menos uma letra maiúscula',
      );
    });

    it('should fail for password without lowercase', () => {
      const result = service.validate('UPPERCASE1');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        'Senha deve ter pelo menos uma letra minúscula',
      );
    });

    it('should fail for password without number', () => {
      const result = service.validate('NoNumberHere');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Senha deve ter pelo menos um número');
    });
  });
});
```

**Status:** ⏳

---

### Task 4.3: Criar Testes para LoginUseCase

**Arquivo:** `src/application/auth/use-cases/login.use-case.spec.ts`

**Implementação:**
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { LoginUseCase } from './login.use-case';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { PasswordService } from '@/infra/auth/services/password.service';
import { TokenService } from '@/infra/auth/services/token.service';
import { RefreshTokenService } from '@/infra/auth/services/refresh-token.service';
import { InvalidCredentialsException } from '@/core/exceptions';

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let prismaService: jest.Mocked<PrismaService>;
  let passwordService: jest.Mocked<PasswordService>;
  let tokenService: jest.Mocked<TokenService>;
  let refreshTokenService: jest.Mocked<RefreshTokenService>;

  const mockUser = {
    id: 'user-id',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashed-password',
    avatar: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    memberships: [
      {
        id: 'membership-id',
        companyId: 'company-id',
        isOwner: true,
        isActive: true,
        company: { id: 'company-id', name: 'Test Company', slug: 'test-company' },
        role: { id: 'role-id', name: 'owner' },
      },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUseCase,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: PasswordService,
          useValue: {
            compare: jest.fn(),
          },
        },
        {
          provide: TokenService,
          useValue: {
            generateTokenPair: jest.fn(),
          },
        },
        {
          provide: RefreshTokenService,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<LoginUseCase>(LoginUseCase);
    prismaService = module.get(PrismaService);
    passwordService = module.get(PasswordService);
    tokenService = module.get(TokenService);
    refreshTokenService = module.get(RefreshTokenService);
  });

  describe('execute', () => {
    it('should login successfully', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser as any);
      passwordService.compare.mockResolvedValue(true);
      refreshTokenService.create.mockResolvedValue({
        id: 'refresh-token-id',
        token: 'refresh-token',
      });
      tokenService.generateTokenPair.mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token-jwt',
        expiresIn: 900,
      });

      const result = await useCase.execute({
        email: 'test@example.com',
        password: 'password',
      });

      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.memberships).toHaveLength(1);
    });

    it('should throw InvalidCredentialsException for non-existent user', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        useCase.execute({
          email: 'nonexistent@example.com',
          password: 'password',
        }),
      ).rejects.toThrow(InvalidCredentialsException);
    });

    it('should throw InvalidCredentialsException for inactive user', async () => {
      prismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        isActive: false,
      } as any);

      await expect(
        useCase.execute({
          email: 'test@example.com',
          password: 'password',
        }),
      ).rejects.toThrow(InvalidCredentialsException);
    });

    it('should throw InvalidCredentialsException for wrong password', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser as any);
      passwordService.compare.mockResolvedValue(false);

      await expect(
        useCase.execute({
          email: 'test@example.com',
          password: 'wrong-password',
        }),
      ).rejects.toThrow(InvalidCredentialsException);
    });
  });
});
```

**Commit:** `[FACTBP-API] test: add auth use cases tests`

**Status:** ⏳

---

### Task 4.4: Configurar Vitest (Frontend)

**Comando:**
```bash
pnpm add -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom
```

**Arquivo:** `facter-boilerplate-web/vitest.config.ts`

**Implementação:**
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'lcov'],
      exclude: [
        'node_modules/',
        'test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/index.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

**Arquivo:** `facter-boilerplate-web/test/setup.ts`

```typescript
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });
```

**Commit:** `[FACTBP-WEB] test: configure Vitest`

**Status:** ⏳

---

### Task 4.5: Criar Testes para Auth Hooks

**Arquivo:** `src/features/auth/hooks/use-login.spec.ts`

**Implementação:**
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useLogin } from './use-login';
import { authService } from '../services/auth-service';

// Mock auth service
vi.mock('../services/auth-service', () => ({
  authService: {
    login: vi.fn(),
  },
}));

// Mock auth store
const mockSetAuth = vi.fn();
vi.mock('../stores/auth-store', () => ({
  useAuthStore: () => mockSetAuth,
}));

describe('useLogin', () => {
  let queryClient: QueryClient;

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  it('should login successfully', async () => {
    const mockResponse = {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      expiresIn: 900,
      user: {
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        avatar: null,
        memberships: [
          {
            id: 'membership-id',
            companyId: 'company-id',
            companyName: 'Test Company',
            role: 'owner',
            isOwner: true,
          },
        ],
      },
    };

    vi.mocked(authService.login).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useLogin(), { wrapper });

    result.current.mutate({
      email: 'test@example.com',
      password: 'password',
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(authService.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
    });
  });

  it('should handle login error', async () => {
    vi.mocked(authService.login).mockRejectedValue(
      new Error('Invalid credentials'),
    );

    const { result } = renderHook(() => useLogin(), { wrapper });

    result.current.mutate({
      email: 'test@example.com',
      password: 'wrong-password',
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});
```

**Commit:** `[FACTBP-WEB] test: add auth hooks tests`

**Status:** ⏳

---

## Estrutura Final de Testes

**Backend:**
```
facter-boilerplate-api/
├── jest.config.js
├── test/
│   └── setup.ts
└── src/
    ├── infra/auth/services/
    │   ├── password.service.spec.ts
    │   ├── token.service.spec.ts
    │   └── refresh-token.service.spec.ts
    └── application/auth/use-cases/
        ├── login.use-case.spec.ts
        ├── register.use-case.spec.ts
        └── refresh-token.use-case.spec.ts
```

**Frontend:**
```
facter-boilerplate-web/
├── vitest.config.ts
├── test/
│   └── setup.ts
└── src/
    └── features/auth/
        ├── hooks/
        │   ├── use-login.spec.ts
        │   ├── use-register.spec.ts
        │   └── use-logout.spec.ts
        └── stores/
            └── auth-store.spec.ts
```

---

## Critérios de Aceite

- [ ] Jest configurado no backend
- [ ] Vitest configurado no frontend
- [ ] Testes de PasswordService passam
- [ ] Testes de LoginUseCase passam
- [ ] Testes de useLogin hook passam
- [ ] Cobertura > 70% em auth
- [ ] CI executa testes

---

*Task de [Sprint 7](../sprint-07.md)*
