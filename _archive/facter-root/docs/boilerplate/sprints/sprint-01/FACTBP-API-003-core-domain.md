# [FACTBP-API-003] Core Domain Layer

> Criar camada de domínio puro (entities, exceptions, interfaces).
> **Padrão:** Zod schema + Class (consistente com facter-truck)

---

## Status: ✅ Concluído

---

## Padrão Adotado

> **Decisão:** Usar padrão Zod + Class ao invés de private props + getters.
> **Motivo:** Mais pragmático, validação automática, menos boilerplate, consistente com facter-truck.

```typescript
// Padrão: Zod schema + Class implements ZodType
import { randomUUID } from 'crypto';
import { z } from 'zod';

export class Entity implements EntityType {
  public readonly id: string;
  public field: string;

  constructor(data: EntityType) {
    const validatedData = entitySchema.parse(data);
    Object.assign(this, validatedData);
    this.id = validatedData.id ?? randomUUID();
  }
}

export const entitySchema = z.object({
  id: z.string().cuid().optional(),
  field: z.string().min(1, 'Campo obrigatório'),
});

export type EntityType = z.infer<typeof entitySchema>;
```

---

## Tasks

### Task 3.1: Criar User Entity

**Arquivo:** `src/core/domain/entities/user.ts`

**Descrição:** Entidade de domínio para User com validação Zod.

**Implementação:**
```typescript
import { randomUUID } from 'crypto';
import { z } from 'zod';

export class User implements UserType {
  public readonly id: string;
  public name: string;
  public email: string;
  public password: string;
  public avatar: string | null;
  public emailVerified: Date | null;
  public isActive: boolean;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(data: UserType) {
    const validatedData = userSchema.parse(data);

    Object.assign(this, validatedData);

    this.id = validatedData.id ?? randomUUID();
    this.avatar = validatedData.avatar ?? null;
    this.emailVerified = validatedData.emailVerified ?? null;
    this.isActive = validatedData.isActive ?? true;
    this.createdAt = validatedData.createdAt ?? new Date();
    this.updatedAt = validatedData.updatedAt ?? new Date();
  }
}

export const userSchema = z.object({
  id: z.string().cuid('ID inválido.').optional(),
  name: z.string().min(1, 'O nome é obrigatório.').max(100, 'O nome deve ter no máximo 100 caracteres.'),
  email: z.string().email('Formato de e-mail inválido.'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres.'),
  avatar: z.string().url('URL do avatar inválida.').nullable().optional(),
  emailVerified: z.date().nullable().optional(),
  isActive: z.boolean().default(true).optional(),
  createdAt: z.date().default(() => new Date()).optional(),
  updatedAt: z.date().default(() => new Date()).optional(),
});

export type UserType = z.infer<typeof userSchema>;

export type CreateUserData = Omit<UserType, 'id' | 'createdAt' | 'updatedAt' | 'emailVerified' | 'isActive'>;
```

**Commit:** `[FACTBP-API] feat(core): add User entity with Zod validation`

**Status:** ✅

---

### Task 3.2: Criar RefreshToken Entity

**Arquivo:** `src/core/domain/entities/refresh-token.ts`

**Descrição:** Entidade para representar tokens de refresh.

**Implementação:**
```typescript
import { randomUUID } from 'crypto';
import { z } from 'zod';

export class RefreshToken implements RefreshTokenType {
  public readonly id: string;
  public token: string;
  public userId: string;
  public expiresAt: Date;
  public createdAt: Date;

  constructor(data: RefreshTokenType) {
    const validatedData = refreshTokenSchema.parse(data);

    Object.assign(this, validatedData);

    this.id = validatedData.id ?? randomUUID();
    this.createdAt = validatedData.createdAt ?? new Date();
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }
}

export const refreshTokenSchema = z.object({
  id: z.string().cuid('ID inválido.').optional(),
  token: z.string().min(1, 'Token é obrigatório.'),
  userId: z.string().cuid('ID do usuário inválido.'),
  expiresAt: z.date(),
  createdAt: z.date().default(() => new Date()).optional(),
});

export type RefreshTokenType = z.infer<typeof refreshTokenSchema>;

export type CreateRefreshTokenData = Omit<RefreshTokenType, 'id' | 'createdAt'>;
```

**Commit:** `[FACTBP-API] feat(core): add RefreshToken entity with Zod validation`

**Status:** ✅

---

### Task 3.3: Criar Exceptions

**Arquivos:**
- `src/core/exceptions/app.exception.ts`
- `src/core/exceptions/not-found.exception.ts`
- `src/core/exceptions/conflict.exception.ts`
- `src/core/exceptions/unauthorized.exception.ts`
- `src/core/exceptions/bad-request.exception.ts`
- `src/core/exceptions/index.ts`

**Implementação:**

```typescript
// app.exception.ts
import { HttpException, HttpStatus } from '@nestjs/common';

export interface AppExceptionProps {
  message: string;
  status: HttpStatus;
  fields?: Record<string, string>;
}

export class AppException extends HttpException {
  constructor({ message, status, fields }: AppExceptionProps) {
    super({ message, fields }, status);
  }
}

// not-found.exception.ts
import { HttpStatus } from '@nestjs/common';
import { AppException } from './app.exception';

export class NotFoundException extends AppException {
  constructor(resource: string = 'Recurso') {
    super({
      message: `${resource} não encontrado.`,
      status: HttpStatus.NOT_FOUND,
    });
  }
}

// conflict.exception.ts
import { HttpStatus } from '@nestjs/common';
import { AppException } from './app.exception';

export class ConflictException extends AppException {
  constructor(message: string = 'Recurso já existe.') {
    super({
      message,
      status: HttpStatus.CONFLICT,
    });
  }
}

// unauthorized.exception.ts
import { HttpStatus } from '@nestjs/common';
import { AppException } from './app.exception';

export class UnauthorizedException extends AppException {
  constructor(message: string = 'Credenciais inválidas.') {
    super({
      message,
      status: HttpStatus.UNAUTHORIZED,
    });
  }
}

// bad-request.exception.ts
import { HttpStatus } from '@nestjs/common';
import { AppException } from './app.exception';

export class BadRequestException extends AppException {
  constructor(message: string, fields?: Record<string, string>) {
    super({
      message,
      status: HttpStatus.BAD_REQUEST,
      fields,
    });
  }
}

// forbidden.exception.ts
import { HttpStatus } from '@nestjs/common';
import { AppException } from './app.exception';

export class ForbiddenException extends AppException {
  constructor(message: string = 'Acesso negado.') {
    super({
      message,
      status: HttpStatus.FORBIDDEN,
    });
  }
}

// index.ts
export * from './app.exception';
export * from './not-found.exception';
export * from './conflict.exception';
export * from './unauthorized.exception';
export * from './bad-request.exception';
export * from './forbidden.exception';
```

**Commit:** `[FACTBP-API] feat(core): add domain exceptions`

**Status:** ✅

---

### Task 3.4: Criar Repository Interfaces

**Arquivos:**
- `src/core/domain/repositories/user.repository.ts`
- `src/core/domain/repositories/refresh-token.repository.ts`
- `src/core/domain/repositories/index.ts`

**Implementação:**

```typescript
// user.repository.ts
import { User, CreateUserData } from '../entities/user';

export abstract class UserRepository {
  abstract create(user: User): Promise<void>;
  abstract findById(id: string): Promise<User | null>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract update(id: string, data: Partial<CreateUserData>): Promise<User>;
  abstract delete(id: string): Promise<void>;
}

// refresh-token.repository.ts
import { RefreshToken, CreateRefreshTokenData } from '../entities/refresh-token';

export abstract class RefreshTokenRepository {
  abstract create(token: RefreshToken): Promise<void>;
  abstract findByToken(token: string): Promise<RefreshToken | null>;
  abstract findByUserId(userId: string): Promise<RefreshToken[]>;
  abstract delete(id: string): Promise<void>;
  abstract deleteByToken(token: string): Promise<void>;
  abstract deleteAllByUserId(userId: string): Promise<void>;
}

// index.ts
export * from './user.repository';
export * from './refresh-token.repository';
```

**Commit:** `[FACTBP-API] feat(core): add repository interfaces`

**Status:** ✅

---

## Critérios de Aceite

- [x] Entities usam Zod para validação
- [x] Tipos inferidos do schema Zod
- [x] Exceptions estendem AppException (HttpException)
- [x] Repositories são abstract classes
- [x] Build passa sem erros

---

## Arquivos Criados

```
src/core/
├── domain/
│   ├── entities/
│   │   ├── user.ts
│   │   ├── refresh-token.ts
│   │   └── index.ts
│   └── repositories/
│       ├── user.repository.ts
│       ├── refresh-token.repository.ts
│       └── index.ts
└── exceptions/
    ├── app.exception.ts
    ├── not-found.exception.ts
    ├── conflict.exception.ts
    ├── unauthorized.exception.ts
    ├── bad-request.exception.ts
    ├── forbidden.exception.ts
    └── index.ts
```

---

*Task de [Sprint 1](../sprint-01.md)*
