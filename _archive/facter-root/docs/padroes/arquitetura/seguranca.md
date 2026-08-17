# Segurança

> **Padrões e práticas de segurança nos projetos Facter.**

---

## Princípios

1. **Defense in Depth** - Múltiplas camadas de proteção
2. **Least Privilege** - Mínimo de permissões necessárias
3. **Fail Secure** - Em caso de erro, negar acesso
4. **Security by Design** - Segurança desde o início

---

## Autenticação

### JWT (JSON Web Token)

```typescript
// Estrutura do token
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "user-uuid",
    "email": "user@example.com",
    "companyId": "company-uuid",
    "role": "ADMIN",
    "iat": 1640000000,
    "exp": 1640003600
  }
}
```

### Configurações Recomendadas

| Configuração | Valor |
|--------------|-------|
| Access Token TTL | 15 minutos |
| Refresh Token TTL | 7 dias |
| Algoritmo | RS256 (produção) ou HS256 (dev) |

### Refresh Token Flow

```typescript
// 1. Login retorna access + refresh tokens
POST /auth/login
Response: {
  accessToken: "...",
  refreshToken: "...",
  expiresIn: 900
}

// 2. Usar access token nas requisições
GET /users
Authorization: Bearer {accessToken}

// 3. Quando access token expira, usar refresh
POST /auth/refresh
Body: { refreshToken: "..." }
Response: {
  accessToken: "...",  // Novo
  expiresIn: 900
}
```

### Armazenamento de Tokens

| Ambiente | Access Token | Refresh Token |
|----------|--------------|---------------|
| Web | Memory (variável JS) | HttpOnly Cookie |
| Mobile | Secure Storage | Secure Storage |

---

## Senhas

### Hashing

```typescript
// ✅ Usar bcrypt com salt rounds adequado
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

### Requisitos de Senha

```typescript
const passwordSchema = z.string()
  .min(8, 'Mínimo 8 caracteres')
  .regex(/[a-z]/, 'Deve conter letra minúscula')
  .regex(/[A-Z]/, 'Deve conter letra maiúscula')
  .regex(/[0-9]/, 'Deve conter número')
  .regex(/[^a-zA-Z0-9]/, 'Deve conter caractere especial');
```

---

## Autorização

### RBAC (Role-Based Access Control)

```typescript
enum Role {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  OPERATOR = 'OPERATOR',
  VIEWER = 'VIEWER',
}

// Permissões por role
const permissions = {
  ADMIN: ['*'], // Tudo
  MANAGER: ['users:read', 'users:write', 'orders:*'],
  OPERATOR: ['orders:read', 'orders:write'],
  VIEWER: ['orders:read'],
};
```

### Permission Guard

```typescript
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler(),
    );

    if (!requiredPermissions) return true;

    const { user } = context.switchToHttp().getRequest();
    return this.hasPermissions(user, requiredPermissions);
  }

  private hasPermissions(user: User, required: string[]): boolean {
    const userPermissions = permissions[user.role];

    if (userPermissions.includes('*')) return true;

    return required.every(perm =>
      userPermissions.some(userPerm => this.matchPermission(userPerm, perm))
    );
  }
}

// Uso
@Get()
@Permissions('orders:read')
async listOrders() { ... }
```

---

## Multi-Tenant Security

### Isolamento de Dados

```typescript
// ❌ NUNCA - vazamento de dados
const users = await prisma.user.findMany();

// ✅ SEMPRE - filtrar por tenant
const users = await prisma.user.findMany({
  where: { companyId: currentUser.companyId },
});
```

### Validação de Acesso

```typescript
// Verificar se recurso pertence ao tenant
async function validateResourceOwnership(
  resourceId: string,
  companyId: string,
): Promise<void> {
  const resource = await prisma.resource.findFirst({
    where: { id: resourceId, companyId },
  });

  if (!resource) {
    throw new ForbiddenException('Resource not found or access denied');
  }
}
```

---

## Validação de Input

### Sempre Validar

```typescript
// Backend - DTO com Zod
const createUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8),
});

// Sanitização
const sanitizedInput = {
  name: sanitizeHtml(input.name),
  email: input.email.toLowerCase().trim(),
};
```

### SQL Injection

```typescript
// ❌ NUNCA - query raw sem parametrização
await prisma.$queryRaw`SELECT * FROM users WHERE email = '${email}'`;

// ✅ SEMPRE - usar Prisma queries ou parametrização
await prisma.user.findUnique({ where: { email } });

// Ou com parametrização
await prisma.$queryRaw`SELECT * FROM users WHERE email = ${email}`;
```

### XSS (Cross-Site Scripting)

```typescript
// React escapa automaticamente, mas cuidado com:
// ❌ NUNCA
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ Se necessário, sanitizar primeiro
import DOMPurify from 'dompurify';
const clean = DOMPurify.sanitize(userInput);
<div dangerouslySetInnerHTML={{ __html: clean }} />
```

---

## CORS

### Configuração NestJS

```typescript
// main.ts
app.enableCors({
  origin: [
    'https://app.facter.com.br',
    'https://admin.facter.com.br',
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

---

## Rate Limiting

```typescript
// NestJS com @nestjs/throttler
@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,      // 60 segundos
      limit: 100,   // 100 requests
    }),
  ],
})
export class AppModule {}

// Por endpoint
@Throttle(5, 60) // 5 requests por 60 segundos
@Post('login')
async login() { ... }
```

---

## Headers de Segurança

```typescript
// NestJS com helmet
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
  },
}));
```

### Headers Importantes

| Header | Propósito |
|--------|-----------|
| `Strict-Transport-Security` | Forçar HTTPS |
| `Content-Security-Policy` | Prevenir XSS |
| `X-Content-Type-Options` | Prevenir MIME sniffing |
| `X-Frame-Options` | Prevenir clickjacking |
| `X-XSS-Protection` | Filtro XSS do browser |

---

## Secrets Management

### Variáveis de Ambiente

```typescript
// ❌ NUNCA
const JWT_SECRET = 'my-secret-key'; // Hardcoded

// ✅ SEMPRE
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is required');
}
```

### .env Seguro

```bash
# .env (NUNCA commitar)
JWT_SECRET=ultra-secure-random-string-256-bits
DATABASE_URL=postgresql://user:password@host:5432/db
```

```bash
# .env.example (pode commitar)
JWT_SECRET=your-jwt-secret-here
DATABASE_URL=postgresql://user:password@localhost:5432/db
```

---

## Logging de Segurança

### O Que Logar

| Evento | Prioridade |
|--------|------------|
| Login/Logout | Alta |
| Falha de autenticação | Alta |
| Mudança de senha | Alta |
| Acesso negado | Alta |
| Alteração de permissões | Alta |
| Criação/deleção de recursos | Média |

### O Que NÃO Logar

- Senhas (mesmo hasheadas)
- Tokens completos
- Dados sensíveis (CPF, cartão)
- PII desnecessário

### Exemplo

```typescript
// Log de segurança
logger.warn('Authentication failed', {
  event: 'AUTH_FAILURE',
  email: maskEmail(email), // j***@example.com
  ip: request.ip,
  userAgent: request.headers['user-agent'],
  reason: 'Invalid password',
});
```

---

## OWASP Top 10

| Vulnerabilidade | Mitigação |
|-----------------|-----------|
| **Injection** | Prisma ORM, validação de input |
| **Broken Auth** | JWT, bcrypt, MFA |
| **Sensitive Data Exposure** | HTTPS, encryption at rest |
| **XXE** | Desabilitar XML parsing |
| **Broken Access Control** | RBAC, tenant isolation |
| **Security Misconfiguration** | Helmet, CORS, env vars |
| **XSS** | React escaping, CSP |
| **Insecure Deserialization** | Zod validation |
| **Using Components with Vulnerabilities** | npm audit, Dependabot |
| **Insufficient Logging** | Winston, audit logs |

---

## Checklist de Segurança

### Autenticação
- [ ] JWT com expiração curta
- [ ] Refresh token com rotação
- [ ] Senhas com bcrypt (12+ rounds)
- [ ] Requisitos de senha fortes

### Autorização
- [ ] RBAC implementado
- [ ] Multi-tenant isolation
- [ ] Validação de ownership

### Input
- [ ] Validação com Zod
- [ ] Sanitização de HTML
- [ ] Proteção contra SQL injection

### HTTP
- [ ] HTTPS obrigatório
- [ ] CORS configurado
- [ ] Rate limiting
- [ ] Security headers (helmet)

### Secrets
- [ ] Variáveis de ambiente
- [ ] .env no .gitignore
- [ ] Secrets rotacionados

### Monitoring
- [ ] Logging de eventos de segurança
- [ ] Alertas para anomalias
- [ ] Audit trail

---

**Relacionados:**
- [API Design](./api-design.md) - Segurança em APIs
- [Backend](./backend.md) - Arquitetura backend

**Voltar para** [Padrões](../README.md)
