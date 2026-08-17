# Arquitetura Backend

> **Arquitetura padrão para aplicações backend nos projetos Facter.**

---

## Stack

| Tecnologia | Propósito |
|------------|-----------|
| **NestJS** | Framework |
| **TypeScript** | Type safety |
| **Prisma** | ORM |
| **PostgreSQL** | Database |
| **Zod** | Validation |
| **JWT** | Authentication |
| **Winston** | Logging |

---

## Clean Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         PRESENTATION                            │
│                  (Controllers, DTOs, ViewModels)                │
├─────────────────────────────────────────────────────────────────┤
│                         APPLICATION                             │
│                (Use Cases, Factories, Exceptions)               │
├─────────────────────────────────────────────────────────────────┤
│                           DOMAIN                                │
│                  (Entities, Repository Interfaces)              │
├─────────────────────────────────────────────────────────────────┤
│                        INFRASTRUCTURE                           │
│         (Prisma Repositories, Guards, Interceptors)             │
└─────────────────────────────────────────────────────────────────┘

Dependency Rule: Camadas internas NÃO conhecem camadas externas
```

---

## Estrutura de Pastas

```
src/
├── modules/                    # Módulos de domínio
│   └── [domain]/
│       ├── application/        # Casos de uso
│       │   ├── use-cases/
│       │   │   ├── create-user/
│       │   │   │   ├── create-user.use-case.ts
│       │   │   │   └── create-user.use-case.spec.ts
│       │   │   └── index.ts
│       │   ├── factories/
│       │   └── exceptions/
│       ├── domain/             # Entidades e contratos
│       │   ├── entities/
│       │   └── repositories/
│       ├── infra/              # Implementações
│       │   └── prisma/
│       │       └── prisma-user.repository.ts
│       └── presentation/       # HTTP layer
│           ├── controllers/
│           ├── dtos/
│           └── view-models/
│
├── core/                       # Infraestrutura compartilhada
│   ├── auth/
│   │   ├── guards/
│   │   ├── strategies/
│   │   └── decorators/
│   ├── database/
│   │   ├── prisma.service.ts
│   │   └── prisma.module.ts
│   ├── http/
│   │   ├── filters/
│   │   └── interceptors/
│   └── logging/
│       └── logger.service.ts
│
├── shared/                     # Utilitários compartilhados
│   ├── protocols/
│   │   └── use-case.protocol.ts
│   └── utils/
│
└── main.ts                     # Entry point
```

---

## Domain Module

### Estrutura Completa

```
modules/users/
├── application/
│   ├── use-cases/
│   │   ├── create-user/
│   │   │   ├── create-user.use-case.ts
│   │   │   ├── create-user.use-case.spec.ts
│   │   │   └── index.ts
│   │   ├── get-user-by-id/
│   │   ├── update-user/
│   │   ├── delete-user/
│   │   └── index.ts
│   ├── factories/
│   │   └── user.factory.ts
│   └── exceptions/
│       ├── user-not-found.exception.ts
│       ├── user-already-exists.exception.ts
│       └── index.ts
├── domain/
│   ├── entities/
│   │   └── user.entity.ts
│   └── repositories/
│       └── user.repository.ts
├── infra/
│   └── prisma/
│       ├── prisma-user.repository.ts
│       └── in-memory-user.repository.ts
├── presentation/
│   ├── controllers/
│   │   └── user.controller.ts
│   ├── dtos/
│   │   ├── create-user.dto.ts
│   │   ├── update-user.dto.ts
│   │   └── index.ts
│   └── view-models/
│       └── user.view-model.ts
├── users.module.ts
└── index.ts
```

---

## Entity

```typescript
// modules/users/domain/entities/user.entity.ts
import { z } from 'zod';
import { randomUUID } from 'crypto';

export const userSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['ADMIN', 'USER']).default('USER'),
  isActive: z.boolean().default(true),
  companyId: z.string().uuid(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type UserProps = z.infer<typeof userSchema>;

export class User {
  public readonly id: string;
  public name: string;
  public email: string;
  public password: string;
  public role: 'ADMIN' | 'USER';
  public isActive: boolean;
  public companyId: string;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(props: UserProps) {
    const validated = userSchema.parse(props);

    this.id = validated.id ?? randomUUID();
    this.name = validated.name;
    this.email = validated.email;
    this.password = validated.password;
    this.role = validated.role;
    this.isActive = validated.isActive;
    this.companyId = validated.companyId;
    this.createdAt = validated.createdAt ?? new Date();
    this.updatedAt = validated.updatedAt ?? new Date();
  }

  deactivate(): void {
    this.isActive = false;
    this.touch();
  }

  updateProfile(data: { name?: string; email?: string }): void {
    if (data.name) this.name = data.name;
    if (data.email) this.email = data.email;
    this.touch();
  }

  private touch(): void {
    this.updatedAt = new Date();
  }
}
```

---

## Repository

### Interface (Contrato)

```typescript
// modules/users/domain/repositories/user.repository.ts
import { User } from '../entities/user.entity';

export interface UserFilters {
  companyId: string;
  isActive?: boolean;
  role?: 'ADMIN' | 'USER';
  search?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface UserRepository {
  create(user: User): Promise<void>;
  findById(id: string, companyId: string): Promise<User | null>;
  findByEmail(email: string, companyId: string): Promise<User | null>;
  findMany(filters: UserFilters, page?: number, pageSize?: number): Promise<PaginatedResult<User>>;
  update(user: User): Promise<void>;
  delete(id: string, companyId: string): Promise<void>;
}
```

### Implementação Prisma

```typescript
// modules/users/infra/prisma/prisma-user.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';
import { User } from '../../domain/entities/user.entity';
import { UserRepository, UserFilters, PaginatedResult } from '../../domain/repositories/user.repository';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: User): Promise<void> {
    await this.prisma.user.create({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.role,
        isActive: user.isActive,
        companyId: user.companyId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  }

  async findById(id: string, companyId: string): Promise<User | null> {
    const data = await this.prisma.user.findFirst({
      where: { id, companyId },
    });

    if (!data) return null;
    return new User(data);
  }

  async findByEmail(email: string, companyId: string): Promise<User | null> {
    const data = await this.prisma.user.findFirst({
      where: { email, companyId },
    });

    if (!data) return null;
    return new User(data);
  }

  async findMany(
    filters: UserFilters,
    page = 1,
    pageSize = 20,
  ): Promise<PaginatedResult<User>> {
    const where = {
      companyId: filters.companyId,
      ...(filters.isActive !== undefined && { isActive: filters.isActive }),
      ...(filters.role && { role: filters.role }),
      ...(filters.search && {
        OR: [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { email: { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items: items.map((item) => new User(item)),
      total,
      page,
      pageSize,
    };
  }

  async update(user: User): Promise<void> {
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.role,
        isActive: user.isActive,
        updatedAt: user.updatedAt,
      },
    });
  }

  async delete(id: string, companyId: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id, companyId },
    });
  }
}
```

### In-Memory (Testes)

```typescript
// modules/users/infra/prisma/in-memory-user.repository.ts
import { User } from '../../domain/entities/user.entity';
import { UserRepository, UserFilters, PaginatedResult } from '../../domain/repositories/user.repository';

export class InMemoryUserRepository implements UserRepository {
  public users: User[] = [];

  async create(user: User): Promise<void> {
    this.users.push(user);
  }

  async findById(id: string, companyId: string): Promise<User | null> {
    return this.users.find(u => u.id === id && u.companyId === companyId) ?? null;
  }

  async findByEmail(email: string, companyId: string): Promise<User | null> {
    return this.users.find(u => u.email === email && u.companyId === companyId) ?? null;
  }

  async findMany(filters: UserFilters, page = 1, pageSize = 20): Promise<PaginatedResult<User>> {
    let filtered = this.users.filter(u => u.companyId === filters.companyId);

    if (filters.isActive !== undefined) {
      filtered = filtered.filter(u => u.isActive === filters.isActive);
    }

    if (filters.role) {
      filtered = filtered.filter(u => u.role === filters.role);
    }

    const total = filtered.length;
    const items = filtered.slice((page - 1) * pageSize, page * pageSize);

    return { items, total, page, pageSize };
  }

  async update(user: User): Promise<void> {
    const index = this.users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      this.users[index] = user;
    }
  }

  async delete(id: string, companyId: string): Promise<void> {
    this.users = this.users.filter(u => !(u.id === id && u.companyId === companyId));
  }
}
```

---

## Use Case

```typescript
// modules/users/application/use-cases/create-user/create-user.use-case.ts
import { Injectable, Inject } from '@nestjs/common';
import { IUseCase } from '@/shared/protocols/use-case.protocol';
import { User } from '../../../domain/entities/user.entity';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { UserAlreadyExistsException } from '../../exceptions';
import { HashService } from '@/core/auth/services/hash.service';

interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role?: 'ADMIN' | 'USER';
  companyId: string;
}

@Injectable()
export class CreateUser implements IUseCase<CreateUserRequest, User> {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly hashService: HashService,
  ) {}

  async execute(request: CreateUserRequest): Promise<User> {
    // 1. Verificar se já existe
    const existingUser = await this.userRepository.findByEmail(
      request.email,
      request.companyId,
    );

    if (existingUser) {
      throw new UserAlreadyExistsException(request.email);
    }

    // 2. Hash da senha
    const hashedPassword = await this.hashService.hash(request.password);

    // 3. Criar entidade
    const user = new User({
      name: request.name,
      email: request.email,
      password: hashedPassword,
      role: request.role ?? 'USER',
      companyId: request.companyId,
    });

    // 4. Persistir
    await this.userRepository.create(user);

    return user;
  }
}
```

---

## Controller

```typescript
// modules/users/presentation/controllers/user.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/core/auth/guards/jwt-auth.guard';
import { CompanyGuard } from '@/core/auth/guards/company.guard';
import { CurrentCompany } from '@/core/auth/decorators/current-company.decorator';
import { CompanyInstance } from '@/core/company/company-instance';
import { CreateUser } from '../../application/use-cases/create-user';
import { GetUserById } from '../../application/use-cases/get-user-by-id';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UserViewModel } from '../view-models/user.view-model';

@Controller('users')
@UseGuards(JwtAuthGuard, CompanyGuard)
export class UserController {
  constructor(
    private readonly createUser: CreateUser,
    private readonly getUserById: GetUserById,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() body: CreateUserDto,
    @CurrentCompany() company: CompanyInstance,
  ): Promise<UserViewModel> {
    const user = await this.createUser.execute({
      ...body,
      companyId: company.id,
    });

    return UserViewModel.toHTTP(user);
  }

  @Get(':id')
  async findById(
    @Param('id') id: string,
    @CurrentCompany() company: CompanyInstance,
  ): Promise<UserViewModel> {
    const user = await this.getUserById.execute({
      id,
      companyId: company.id,
    });

    return UserViewModel.toHTTP(user);
  }
}
```

---

## DTO

```typescript
// modules/users/presentation/dtos/create-user.dto.ts
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const createUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8).regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Senha deve conter maiúscula, minúscula e número',
  ),
  role: z.enum(['ADMIN', 'USER']).optional(),
});

export class CreateUserDto extends createZodDto(createUserSchema) {}
```

---

## ViewModel

```typescript
// modules/users/presentation/view-models/user.view-model.ts
import { User } from '../../domain/entities/user.entity';

export class UserViewModel {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: Date;

  static toHTTP(user: User): UserViewModel {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }
}
```

---

## Module

```typescript
// modules/users/users.module.ts
import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/core/database/database.module';
import { AuthModule } from '@/core/auth/auth.module';

// Controllers
import { UserController } from './presentation/controllers/user.controller';

// Use Cases
import { CreateUser } from './application/use-cases/create-user';
import { GetUserById } from './application/use-cases/get-user-by-id';
import { UpdateUser } from './application/use-cases/update-user';
import { DeleteUser } from './application/use-cases/delete-user';

// Repositories
import { PrismaUserRepository } from './infra/prisma/prisma-user.repository';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [UserController],
  providers: [
    // Use Cases
    CreateUser,
    GetUserById,
    UpdateUser,
    DeleteUser,

    // Repositories
    {
      provide: 'UserRepository',
      useClass: PrismaUserRepository,
    },
  ],
  exports: [GetUserById],
})
export class UsersModule {}
```

---

## Multi-Tenant

```typescript
// core/company/company-instance.ts
export class CompanyInstance {
  constructor(public readonly id: string) {}

  addCompanyFilter<T extends Record<string, any>>(data: T): T & { companyId: string } {
    return { ...data, companyId: this.id };
  }
}
```

```typescript
// core/auth/guards/company.guard.ts
@Injectable()
export class CompanyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.companyId) {
      throw new UnauthorizedException('Company context required');
    }

    request.companyInstance = new CompanyInstance(user.companyId);
    return true;
  }
}
```

---

## Checklist de Arquitetura

- [ ] Módulos separados por domínio
- [ ] Use Cases com responsabilidade única
- [ ] Entities com validação Zod
- [ ] Repository interfaces no domain
- [ ] Implementações no infra
- [ ] DTOs validados
- [ ] ViewModels para respostas
- [ ] Multi-tenant via CompanyInstance
- [ ] Guards para auth/authorization
- [ ] Exception filter global

---

**Relacionados:**
- [NestJS](../desenvolvimento/nestjs.md) - Padrões NestJS
- [Banco de Dados](./banco-dados.md) - Modelagem

**Voltar para** [Padrões](../README.md)
