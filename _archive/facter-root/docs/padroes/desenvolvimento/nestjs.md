# Padrões NestJS

> **Padrões e boas práticas para desenvolvimento backend com NestJS nos projetos Facter.**

---

## Arquitetura

### Clean Architecture

```
src/
├── modules/
│   └── [domain]/
│       ├── application/           # Casos de uso
│       │   ├── use-cases/
│       │   ├── factories/
│       │   └── exceptions/
│       ├── domain/                # Entidades e contratos
│       │   ├── entities/
│       │   └── repositories/
│       ├── infra/                 # Implementações
│       │   └── prisma/
│       └── presentation/          # HTTP layer
│           ├── controllers/
│           ├── dtos/
│           └── view-models/
├── core/                          # Infraestrutura compartilhada
│   ├── auth/
│   ├── database/
│   ├── http/
│   └── logging/
└── shared/                        # Utilitários compartilhados
```

---

## Modules

### Estrutura de Módulo

```typescript
// users.module.ts
@Module({
  imports: [DatabaseModule],
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
  exports: [GetUserById], // Exportar apenas o necessário
})
export class UsersModule {}
```

---

## Controllers

### Estrutura

```typescript
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(
    private readonly createUser: CreateUser,
    private readonly getUserById: GetUserById,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: CreateUserDto): Promise<UserViewModel> {
    const user = await this.createUser.execute(body);
    return UserViewModel.toHTTP(user);
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<UserViewModel> {
    const user = await this.getUserById.execute(id);
    return UserViewModel.toHTTP(user);
  }
}
```

### Decorators Customizados

```typescript
// Para obter usuário atual
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

// Para obter empresa atual (multi-tenant)
export const CurrentCompany = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): CompanyInstance => {
    const request = ctx.switchToHttp().getRequest();
    return request.companyInstance;
  },
);

// Uso
@Get('profile')
async getProfile(@CurrentUser() user: User) {
  return user;
}
```

---

## DTOs

### Validação com class-validator

```typescript
// create-user.dto.ts
export class CreateUserDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain uppercase, lowercase and number',
  })
  password: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
```

### DTO com Zod (Alternativa)

```typescript
// create-user.dto.ts
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const createUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  role: z.nativeEnum(UserRole).optional(),
});

export class CreateUserDto extends createZodDto(createUserSchema) {}
```

---

## Use Cases

### Interface

```typescript
// use-case.interface.ts
export interface IUseCase<TRequest, TResponse> {
  execute(request: TRequest): Promise<TResponse>;
}
```

### Implementação

```typescript
// create-user.use-case.ts
@Injectable()
export class CreateUser implements IUseCase<CreateUserRequest, User> {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly hashService: HashService,
  ) {}

  async execute(request: CreateUserRequest): Promise<User> {
    // 1. Validações de negócio
    const existingUser = await this.userRepository.findByEmail(request.email);
    if (existingUser) {
      throw new UserAlreadyExistsException(request.email);
    }

    // 2. Criar entidade
    const hashedPassword = await this.hashService.hash(request.password);
    const user = new User({
      ...request,
      password: hashedPassword,
    });

    // 3. Persistir
    await this.userRepository.create(user);

    return user;
  }
}
```

---

## Entities

### Com Zod

```typescript
// user.entity.ts
import { z } from 'zod';
import { randomUUID } from 'crypto';

export const userSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.nativeEnum(UserRole).default(UserRole.USER),
  isActive: z.boolean().default(true),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type UserProps = z.infer<typeof userSchema>;

export class User {
  public readonly id: string;
  public name: string;
  public email: string;
  public password: string;
  public role: UserRole;
  public isActive: boolean;
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
    this.createdAt = validated.createdAt ?? new Date();
    this.updatedAt = validated.updatedAt ?? new Date();
  }

  deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  updateName(name: string): void {
    this.name = userSchema.shape.name.parse(name);
    this.updatedAt = new Date();
  }
}
```

---

## Repositories

### Interface (Contrato)

```typescript
// user.repository.ts
export interface UserRepository {
  create(user: User): Promise<void>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findMany(filters: UserFilters): Promise<User[]>;
  update(user: User): Promise<void>;
  delete(id: string): Promise<void>;
}
```

### Implementação Prisma

```typescript
// prisma-user.repository.ts
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
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    const data = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!data) return null;

    return new User(data);
  }

  async findByEmail(email: string): Promise<User | null> {
    const data = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!data) return null;

    return new User(data);
  }
}
```

### Implementação In-Memory (Testes)

```typescript
// in-memory-user.repository.ts
export class InMemoryUserRepository implements UserRepository {
  public users: User[] = [];

  async create(user: User): Promise<void> {
    this.users.push(user);
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find(user => user.id === id) ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find(user => user.email === email) ?? null;
  }
}
```

---

## Exceptions

### Custom Exceptions

```typescript
// domain.exception.ts
export class DomainException extends HttpException {
  constructor(
    public readonly message: string,
    public readonly code: string,
    statusCode: number = HttpStatus.BAD_REQUEST,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message, statusCode);
  }
}

// user-not-found.exception.ts
export class UserNotFoundException extends DomainException {
  constructor(userId: string) {
    super(
      `User with id ${userId} not found`,
      'USER_NOT_FOUND',
      HttpStatus.NOT_FOUND,
    );
  }
}

// user-already-exists.exception.ts
export class UserAlreadyExistsException extends DomainException {
  constructor(email: string) {
    super(
      `User with email ${email} already exists`,
      'USER_ALREADY_EXISTS',
      HttpStatus.CONFLICT,
    );
  }
}
```

### Global Exception Filter

```typescript
// global-exception.filter.ts
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLogger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorResponse = this.buildErrorResponse(exception, request);

    this.logger.error('Request failed', {
      ...errorResponse,
      path: request.url,
      method: request.method,
    });

    response.status(errorResponse.statusCode).json(errorResponse);
  }

  private buildErrorResponse(exception: unknown, request: Request) {
    if (exception instanceof DomainException) {
      return {
        statusCode: exception.getStatus(),
        code: exception.code,
        message: exception.message,
        details: exception.details,
        timestamp: new Date().toISOString(),
      };
    }

    if (exception instanceof HttpException) {
      return {
        statusCode: exception.getStatus(),
        code: 'HTTP_ERROR',
        message: exception.message,
        timestamp: new Date().toISOString(),
      };
    }

    // Erro não esperado
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
    };
  }
}
```

---

## Guards

### JWT Auth Guard

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}
```

### Permission Guard

```typescript
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      'permissions',
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return requiredPermissions.every(permission =>
      user.permissions.includes(permission),
    );
  }
}

// Decorator
export const Permissions = (...permissions: string[]) =>
  SetMetadata('permissions', permissions);

// Uso
@Get('admin')
@Permissions('admin:read')
async adminOnly() { ... }
```

---

## Testing

### Use Case Test

```typescript
describe('CreateUser', () => {
  let createUser: CreateUser;
  let userRepository: InMemoryUserRepository;
  let hashService: HashService;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    hashService = new BcryptHashService();
    createUser = new CreateUser(userRepository, hashService);
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
});
```

### Factory para Testes

```typescript
// make-user.ts
export function makeUser(override: Partial<UserProps> = {}): User {
  return new User({
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedPassword123',
    role: UserRole.USER,
    ...override,
  });
}
```

---

## Checklist NestJS

- [ ] Módulos bem delimitados
- [ ] Use Cases para lógica de negócio
- [ ] Entities com validação Zod
- [ ] Repository pattern para acesso a dados
- [ ] DTOs validados (class-validator ou Zod)
- [ ] ViewModels para respostas HTTP
- [ ] Custom exceptions com códigos
- [ ] Guards para autenticação/autorização
- [ ] Global exception filter
- [ ] Testes para use cases
- [ ] In-memory repositories para testes

---

**Relacionados:**
- [Código](./codigo.md) - Clean Code, SOLID
- [Backend Architecture](../arquitetura/backend.md) - Arquitetura detalhada
- [Testes](./testes.md) - Padrões de testes

**Voltar para** [Padrões](../README.md)
