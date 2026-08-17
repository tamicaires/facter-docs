# Arquitetura de Autenticação - Facter Boilerplate

> Documento técnico detalhando a arquitetura de autenticação do boilerplate.

---

## Análise do Facter Truck (Referência)

### Problemas Identificados

| # | Problema | Arquivo | Impacto |
|---|----------|---------|---------|
| 1 | **Sem Refresh Token** | `signInUseCase.ts` | Usuário reloga frequentemente |
| 2 | **Token muito grande** | `signInUseCase.ts` | Headers pesados (~500 bytes) |
| 3 | **2 queries no login** | `validateUserUseCase.ts` | Latência aumentada |
| 4 | **Config hardcoded** | `jwtStrategy.ts` | `process.env.JWT_SECRET` direto |
| 5 | **Ability custom bugado** | `ability.ts` | Bug no `some()` sem return |
| 6 | **Roles hardcoded** | `permissions.ts` | Enum TRole, não database-driven |
| 7 | **Cache 1 hora** | `policy.guard.ts` | Permissões desatualizadas |
| 8 | **getMe expõe tudo** | `auth.controller.ts` | Pode vazar dados sensíveis |

### O Que Funciona Bem

- Separação em Use Cases
- Guards para JWT e Company
- Decorator @CurrentUser
- Validação de empresa via X-Company-ID

---

## Arquitetura Proposta

### Estrutura de Pastas

```
src/
├── core/                           # Domínio Puro
│   ├── entities/
│   │   ├── user.entity.ts
│   │   └── token.entity.ts
│   ├── repositories/               # Interfaces
│   │   ├── user.repository.ts
│   │   └── refresh-token.repository.ts
│   └── exceptions/
│       ├── domain.exception.ts
│       ├── invalid-credentials.exception.ts
│       └── user-not-found.exception.ts
│
├── application/                    # Casos de Uso
│   └── auth/
│       ├── use-cases/
│       │   ├── login.use-case.ts
│       │   ├── register.use-case.ts
│       │   ├── refresh-token.use-case.ts
│       │   ├── logout.use-case.ts
│       │   ├── forgot-password.use-case.ts
│       │   └── reset-password.use-case.ts
│       ├── dto/
│       │   ├── login.dto.ts
│       │   ├── register.dto.ts
│       │   └── token-response.dto.ts
│       └── auth.module.ts
│
├── infra/                          # Implementações
│   ├── http/
│   │   ├── controllers/
│   │   │   └── auth.controller.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── company.guard.ts
│   │   │   └── permissions.guard.ts
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   ├── current-company.decorator.ts
│   │   │   └── require-permission.decorator.ts
│   │   └── filters/
│   │       └── http-exception.filter.ts
│   │
│   ├── database/
│   │   ├── prisma/
│   │   │   ├── prisma.service.ts
│   │   │   └── prisma.module.ts
│   │   └── repositories/
│   │       ├── prisma-user.repository.ts
│   │       └── prisma-refresh-token.repository.ts
│   │
│   ├── auth/
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts
│   │   └── services/
│   │       ├── token.service.ts
│   │       ├── password.service.ts
│   │       └── ability.service.ts
│   │
│   └── cache/
│       ├── cache.service.ts
│       └── cache.module.ts
│
├── config/
│   ├── env.config.ts
│   ├── jwt.config.ts
│   └── cache.config.ts
│
└── shared/
    ├── types/
    │   ├── api-response.type.ts
    │   └── authenticated-user.type.ts
    └── utils/
        └── hash.util.ts
```

---

## Fluxo de Autenticação

### Login Flow

```
┌─────────┐     ┌──────────────┐     ┌─────────────────────────────────┐
│  Client │────▶│  /auth/login │────▶│  LoginUseCase                   │
│         │     │              │     │  ├─ Validate credentials        │
│         │     │              │     │  ├─ Check user.isActive         │
│         │     │              │     │  ├─ Generate Access Token (15m) │
│         │     │              │     │  └─ Generate Refresh Token (7d) │
└─────────┘     └──────────────┘     └─────────────────────────────────┘
                                                    │
                                                    ▼
                ┌──────────────────────────────────────────────────────┐
                │  Response                                            │
                │  {                                                   │
                │    accessToken: "..." (header),                      │
                │    refreshToken: "..." (httpOnly cookie),            │
                │    user: { id, email, name, memberships }            │
                │  }                                                   │
                └──────────────────────────────────────────────────────┘
```

### Refresh Flow

```
Token expirado ──▶ /auth/refresh ──▶ RefreshTokenUseCase
                                     ├─ Validate refresh token
                                     ├─ Check not revoked
                                     ├─ Check family (detect reuse)
                                     ├─ Delete old, create new
                                     └─ Return new token pair
```

---

## Token Strategy

### Access Token (JWT)

```typescript
interface AccessTokenPayload {
  sub: string         // userId
  email: string
  type: 'access'
  iat: number
  exp: number         // 15 minutes
}
```

**Características:**
- Payload mínimo (~100 bytes vs ~500 no Truck)
- Expiração curta (15 minutos)
- Não contém roles/permissions (buscar sob demanda)
- Stateless (não precisa validar no banco)

### Refresh Token (Opaque)

```typescript
interface RefreshToken {
  id: string          // cuid
  token: string       // crypto.randomBytes(64).toString('hex')
  userId: string
  family: string      // para detectar token reuse attack
  expiresAt: Date     // now + 7 days
  createdAt: Date
}
```

**Características:**
- Armazenado no banco (pode revogar)
- Token opaco (não é JWT)
- Família para detectar reuso
- Rotação obrigatória a cada uso
- HTTP-only cookie (proteção XSS)

---

## Endpoints

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/auth/login` | Login com email/senha | - |
| POST | `/auth/register` | Registro + criar empresa | - |
| POST | `/auth/refresh` | Renovar tokens | Cookie |
| POST | `/auth/logout` | Invalidar sessão | JWT |
| GET | `/auth/me` | Dados do usuário | JWT |
| POST | `/auth/switch-company` | Trocar empresa ativa | JWT |
| POST | `/auth/forgot-password` | Solicitar reset | - |
| POST | `/auth/reset-password` | Redefinir senha | Token |
| POST | `/auth/change-password` | Alterar senha | JWT |
| GET | `/auth/permissions` | Permissões do usuário | JWT |

---

## RBAC com CASL

### Por que CASL?

- Biblioteca madura e battle-tested
- Suporte a conditions complexas
- Integração com NestJS
- Serialização para frontend

### Implementação

```typescript
// ability.service.ts
import { AbilityBuilder, createMongoAbility } from '@casl/ability'

@Injectable()
export class AbilityService {
  constructor(private prisma: PrismaService) {}

  async buildAbilityFor(userId: string, companyId: string) {
    // 1 query para buscar todas as permissions
    const permissions = await this.prisma.rolePermission.findMany({
      where: {
        role: {
          memberships: {
            some: { userId, companyId }
          }
        }
      },
      include: { permission: true }
    })

    const { can, build } = new AbilityBuilder(createMongoAbility)

    permissions.forEach(rp => {
      can(rp.permission.action, rp.permission.subject)
    })

    return build()
  }
}
```

### Guard

```typescript
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private abilityService: AbilityService,
    private cacheService: CacheService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permission = this.reflector.get<string>('permission', context.getHandler())
    if (!permission) return true

    const request = context.switchToHttp().getRequest()
    const { userId, companyId } = request.user

    // Cache por 5 minutos
    const cacheKey = `ability:${userId}:${companyId}`
    let ability = await this.cacheService.get(cacheKey)

    if (!ability) {
      ability = await this.abilityService.buildAbilityFor(userId, companyId)
      await this.cacheService.set(cacheKey, ability, 300) // 5 min
    }

    const [action, subject] = permission.split(':')
    return ability.can(action, subject)
  }
}
```

### Uso

```typescript
@Controller('users')
export class UsersController {
  @Get()
  @RequirePermission('read:User')
  findAll() {}

  @Post()
  @RequirePermission('create:User')
  create() {}

  @Delete(':id')
  @RequirePermission('delete:User')
  remove() {}
}
```

---

## Configuração

### Environment Validation

```typescript
// config/env.config.ts
import { z } from 'zod'

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),

  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('15m'),
  REFRESH_TOKEN_EXPIRES_DAYS: z.coerce.number().default(7),

  // Redis
  REDIS_URL: z.string().url().optional(),

  // App
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.coerce.number().default(3001),
})

export type EnvConfig = z.infer<typeof envSchema>

export const validateEnv = () => {
  const result = envSchema.safeParse(process.env)
  if (!result.success) {
    console.error('Invalid environment:', result.error.format())
    process.exit(1)
  }
  return result.data
}
```

---

## Segurança

| Aspecto | Implementação |
|---------|---------------|
| Password Hashing | bcrypt, cost 12 |
| Rate Limiting | 5 req/min por IP no login |
| Brute Force | Lock após 5 falhas |
| Token Reuse | Família de refresh tokens |
| XSS | Refresh token em httpOnly cookie |
| CSRF | SameSite=Strict |
| Headers | Helmet |
| Validation | class-validator + Zod |

---

## Comparativo Final

| Aspecto | Truck (Atual) | Boilerplate |
|---------|---------------|-------------|
| Refresh Token | Não tem | Com rotação |
| Token Size | ~500 bytes | ~100 bytes |
| Queries/Login | 2 | 1 |
| Config | Hardcoded | Zod validated |
| RBAC | Custom bugado | CASL |
| Roles | Enum | Database-driven |
| Cache | 1h fixo | 5min + invalidação |
| Logout | Não revoga | Revoga tokens |
| Password Reset | Não tem | Completo |

---

## Ordem de Implementação

1. **Core** - Entities, Exceptions, Repository interfaces
2. **Config** - Env validation, JWT config
3. **Database** - PrismaService, Repositories
4. **Auth Services** - TokenService, PasswordService, AbilityService
5. **Use Cases** - Login, Register, Refresh, Logout
6. **HTTP Layer** - Controller, Guards, Decorators
7. **Tests** - Unit + Integration

---

*Última atualização: 2024-12-14*
