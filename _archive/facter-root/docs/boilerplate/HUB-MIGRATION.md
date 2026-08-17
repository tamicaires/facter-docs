# Boilerplate - Migração para Facter Hub

> Documentação das mudanças realizadas no boilerplate para integração com o Facter Hub.

---

## Contexto

O Facter Hub é a plataforma central do ecossistema Facter que gerencia:
- **Autenticação** - SSO via OAuth 2.0
- **Usuários e Empresas** - Cadastro centralizado
- **Subscriptions** - Planos e billing via Stripe
- **Entitlements** - Permissões baseadas no plano contratado

Antes, o boilerplate tinha autenticação local (email/senha, JWT próprio, RBAC local). Agora, toda autenticação e gestão de permissões é delegada ao Hub.

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│  ANTES (Standalone)                                             │
├─────────────────────────────────────────────────────────────────┤
│  User → Login Local → JWT Local → RBAC Local → App Features     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  DEPOIS (Hub Integration)                                       │
├─────────────────────────────────────────────────────────────────┤
│  User → Hub SSO → Hub Token → Entitlements → App Features       │
│                                                                 │
│  ┌─────────┐      ┌─────────┐      ┌─────────────┐             │
│  │   Hub   │◄────►│ Backend │◄────►│  Frontend   │             │
│  │  (SSO)  │      │ (API)   │      │  (Next.js)  │             │
│  └─────────┘      └─────────┘      └─────────────┘             │
│       │                │                                        │
│       │  Webhooks      │  Token Introspection                  │
│       └────────────────┘                                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Fluxo de Autenticação

```
1. Usuário acessa o app (sem token)
   ↓
2. Middleware detecta ausência de token
   ↓
3. Redirect para Hub: /oauth/authorize?client_id=xxx&redirect_uri=xxx
   ↓
4. Hub autentica usuário (login se necessário)
   ↓
5. Hub redireciona para app: /callback?code=xxx
   ↓
6. Backend troca code por tokens (POST /oauth/token)
   ↓
7. Tokens armazenados em httpOnly cookies
   ↓
8. Redirect para /dashboard ou /select-company
   ↓
9. Para cada request protegido:
   - Backend valida token com Hub (introspect)
   - Busca entitlements se necessário
```

---

## Mudanças no Backend

### Arquivos Adicionados

```
src/
├── config/
│   └── hub.config.ts              # Configuração do Hub
│
└── infra/hub/
    ├── hub.module.ts              # Módulo NestJS
    ├── hub.service.ts             # Client para API do Hub
    ├── hub-auth.guard.ts          # Guard de autenticação
    ├── entitlement.guard.ts       # Guard de entitlements
    ├── hub-webhook.controller.ts  # Webhooks do Hub
    ├── index.ts                   # Exports
    ├── types/
    │   └── hub.types.ts           # Tipos e schemas Zod
    └── decorators/
        ├── current-user.decorator.ts    # @CurrentUser()
        └── require-entitlement.decorator.ts  # @RequireEntitlement()
```

### Arquivos Removidos

```
src/
├── application/auth/
│   ├── use-cases/
│   │   ├── login.use-case.ts
│   │   ├── register.use-case.ts
│   │   ├── refresh-token.use-case.ts
│   │   ├── logout.use-case.ts
│   │   ├── forgot-password.use-case.ts
│   │   ├── reset-password.use-case.ts
│   │   ├── change-password.use-case.ts
│   │   ├── switch-company.use-case.ts
│   │   └── get-permissions.use-case.ts
│   └── dto/
│       ├── login.dto.ts
│       ├── register.dto.ts
│       ├── password.dto.ts
│       └── ...
│
├── application/company/           # Módulo inteiro removido
│
├── infra/auth/
│   ├── services/
│   │   ├── password.service.ts
│   │   ├── token.service.ts
│   │   └── refresh-token.service.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── permissions.guard.ts
│   └── casl/                      # Módulo CASL removido
│
├── infra/mail/                    # Módulo de email removido
│
├── config/
│   ├── jwt.config.ts              # Removido
│   └── mail.config.ts             # Removido
│
└── core/domain/
    ├── entities/
    │   └── refresh-token.ts       # Removido
    └── repositories/
        └── refresh-token.repository.ts  # Removido
```

### Prisma Schema

**Antes:**
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String
  name          String
  avatar        String?
  emailVerified DateTime?
  isActive      Boolean   @default(true)
  // ... relations com RefreshToken, PasswordResetToken, Membership
}

model RefreshToken { ... }
model PasswordResetToken { ... }
model Company { ... }
model Membership { ... }
model Role { ... }
model Permission { ... }
model RolePermission { ... }
```

**Depois:**
```prisma
model User {
  id        String  @id @default(cuid())
  hubUserId String  @unique    // ID do usuário no Hub
  email     String  @unique
  name      String
  avatar    String?
  isActive  Boolean @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Company {
  id           String  @id @default(cuid())
  hubCompanyId String  @unique  // ID da empresa no Hub
  name         String
  slug         String  @unique
  logo         String?
  isActive     Boolean @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

### Auth Controller

**Antes (10 endpoints):**
- POST /auth/login
- POST /auth/register
- POST /auth/refresh
- POST /auth/logout
- GET /auth/me
- POST /auth/forgot-password
- POST /auth/reset-password
- POST /auth/change-password
- POST /auth/switch-company
- GET /auth/permissions

**Depois (6 endpoints):**
- GET /auth/login - Retorna URL de login do Hub
- POST /auth/callback - Troca code por tokens
- POST /auth/refresh - Renova tokens via Hub
- POST /auth/logout - Logout e retorna URL de logout do Hub
- GET /auth/me - Dados do usuário e memberships
- POST /auth/switch-company - Troca empresa atual
- GET /auth/entitlements - Lista entitlements da empresa

### Variáveis de Ambiente

**Antes:**
```env
DATABASE_URL="..."
JWT_SECRET="..."
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="..."
JWT_REFRESH_EXPIRES_IN="7d"
MAIL_HOST="..."
MAIL_PORT=587
# ...
```

**Depois:**
```env
DATABASE_URL="..."

# Hub Integration
HUB_API_URL="https://hub.facter.com/api"
HUB_CLIENT_ID="your-app-id"
HUB_CLIENT_SECRET="your-secret-32-chars-min"
HUB_WEBHOOK_SECRET="your-webhook-secret-32-chars"
HUB_PRODUCT_ID="your-product-id"

# Redis (opcional em dev)
REDIS_URL="redis://localhost:6379"

FRONTEND_URL="http://localhost:3000"
```

---

## Mudanças no Frontend

### Arquivos Adicionados

```
src/app/(auth)/callback/page.tsx   # Página de callback OAuth
```

### Arquivos Removidos

```
src/
├── app/(auth)/
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── forgot-password/page.tsx
│   └── reset-password/page.tsx
│
├── features/auth/
│   ├── components/
│   │   ├── login-form.tsx
│   │   ├── register-form.tsx
│   │   ├── forgot-password-form.tsx
│   │   └── reset-password-form.tsx
│   ├── hooks/
│   │   ├── use-login.ts
│   │   ├── use-register.ts
│   │   ├── use-forgot-password.ts
│   │   ├── use-reset-password.ts
│   │   ├── use-permission.ts
│   │   └── use-permissions.ts
│   └── schemas/
│       ├── login-schema.ts
│       ├── register-schema.ts
│       └── ...
│
└── app/(main)/settings/security/  # Troca de senha via Hub
```

### Middleware

**Antes:**
```typescript
const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'];

// Sem token → redirect /login
if (!token && !isPublic) {
  return NextResponse.redirect(new URL('/login', request.url));
}
```

**Depois:**
```typescript
const PUBLIC_ROUTES = ['/callback'];

// Sem token → redirect para Hub SSO
if (!token && !isPublic) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  return NextResponse.redirect(`${apiUrl}/auth/login?redirect=${pathname}`);
}
```

### Auth Store

**Antes:**
```typescript
interface AuthState {
  user: User | null;
  memberships: Membership[];
  currentCompanyId: string | null;
  permissions: Permission[];  // CASL permissions
  isAuthenticated: boolean;
  isLoading: boolean;
}
```

**Depois:**
```typescript
interface AuthState {
  user: User | null;
  memberships: Membership[];
  currentCompanyId: string | null;
  entitlements: Entitlement[];  // Hub entitlements
  isAuthenticated: boolean;
  isLoading: boolean;
}
```

### Auth Service

**Antes:**
```typescript
authService.login(credentials)
authService.register(data)
authService.forgotPassword(email)
authService.resetPassword(token, password)
authService.changePassword(current, new)
authService.getPermissions()
```

**Depois:**
```typescript
authService.getMe()
authService.logout()  // Redireciona para Hub
authService.refresh()
authService.switchCompany(companyId)
authService.getEntitlements()
authService.getLoginUrl(redirect?)  // URL do Hub SSO
```

### Types

**Antes:**
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
}

interface Permission {
  action: string;
  subject: string;
  conditions?: Record<string, unknown>;
}
```

**Depois:**
```typescript
interface User {
  id: string;
  hubUserId: string;
  email: string;
  name: string;
  avatar?: string | null;
  companyId?: string;
}

interface Entitlement {
  id: string;
  featureKey: string;
  name: string;
  enabled: boolean;
  limit?: number | null;
  usage?: number | null;
}
```

---

## Uso dos Guards

### Autenticação

```typescript
import { HubAuthGuard, CurrentUser } from '../../infra/hub';
import { HubRequestUser } from '../../infra/hub/types/hub.types';

@Controller('products')
export class ProductsController {
  @Get()
  @UseGuards(HubAuthGuard)
  async list(@CurrentUser() user: HubRequestUser) {
    // user.id - ID local do usuário
    // user.hubUserId - ID no Hub
    // user.email
    // user.companyId - Empresa atual
    // user.membership - Dados do membership
  }
}
```

### Entitlements

```typescript
import { HubAuthGuard, EntitlementGuard, RequireEntitlement } from '../../infra/hub';

@Controller('reports')
export class ReportsController {
  @Get()
  @UseGuards(HubAuthGuard, EntitlementGuard)
  @RequireEntitlement('reports')  // Feature key no Hub
  async generate() {
    // Só executa se empresa tem entitlement 'reports'
  }
}
```

### Verificar Entitlement no Código

```typescript
@Injectable()
export class SomeService {
  constructor(private readonly hubService: HubService) {}

  async doSomething(companyId: string, token: string) {
    const hasAccess = await this.hubService.checkFeature(
      companyId,
      'advanced-analytics',
      token,
    );

    if (!hasAccess) {
      throw new ForbiddenException('Feature not available in your plan');
    }
  }
}
```

---

## Webhooks

O Hub envia webhooks para sincronizar dados:

```typescript
// POST /webhooks/hub
// Header: x-hub-signature: sha256=...

{
  "id": "evt_123",
  "type": "user.updated",
  "timestamp": "2024-12-29T12:00:00Z",
  "data": {
    "id": "hub_user_123",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Eventos suportados:**
- `user.created` / `user.updated` / `user.deleted`
- `membership.created` / `membership.updated` / `membership.deleted`
- `subscription.created` / `subscription.updated` / `subscription.cancelled`
- `entitlement.updated`

---

## Configuração para Novo Produto

### 1. Registrar no Hub

1. Acesse o Hub Admin Panel
2. Vá em Products → Create Product
3. Configure:
   - Name: "TechCare"
   - Slug: "techcare"
   - Redirect URIs: `http://localhost:3000/callback`
4. Copie `client_id` e gere `client_secret`

### 2. Configurar Backend

```env
# .env
HUB_API_URL=https://hub.facter.com/api
HUB_CLIENT_ID=techcare
HUB_CLIENT_SECRET=generated-secret-here
HUB_WEBHOOK_SECRET=generated-webhook-secret
HUB_PRODUCT_ID=prod_techcare_123
```

### 3. Configurar Webhook no Hub

1. Vá em Products → TechCare → Webhooks
2. Add Webhook:
   - URL: `https://api.techcare.com/webhooks/hub`
   - Secret: (mesmo valor de `HUB_WEBHOOK_SECRET`)
   - Events: Selecione todos

### 4. Rodar Migrations

```bash
cd facter-boilerplate-api
npx prisma migrate dev --name hub-integration
```

### 5. Testar Fluxo

1. Acesse `http://localhost:3000`
2. Deve redirecionar para Hub login
3. Após login, deve voltar para `/callback`
4. Após callback, deve ir para `/dashboard` ou `/select-company`

---

## Checklist de Migração

### Backend

- [x] Criar `HubModule` com `HubService`
- [x] Criar `HubAuthGuard`
- [x] Criar `EntitlementGuard`
- [x] Criar webhook controller
- [x] Remover `AuthController` endpoints locais
- [x] Remover use cases de auth local
- [x] Remover `PasswordService`, `TokenService`, `RefreshTokenService`
- [x] Atualizar Prisma schema
- [x] Adicionar `hubUserId` ao User
- [x] Adicionar `hubCompanyId` ao Company
- [x] Remover models não usados (RefreshToken, etc.)
- [x] Configurar variáveis de ambiente do Hub
- [x] Remover módulos não usados (Mail, CASL, Company)

### Frontend

- [x] Remover páginas de login/register/password
- [x] Criar callback page
- [x] Atualizar middleware para Hub SSO
- [x] Atualizar auth-service para Hub
- [x] Atualizar auth-store (entitlements)
- [x] Remover hooks de auth local
- [x] Atualizar logout para Hub
- [x] Remover settings/security (password)
- [x] Configurar variáveis de ambiente

---

## Referências

- [Hub Integration Guide](./HUB-INTEGRATION.md)
- [Hub API Documentation](../../facter-hub/docs/modules/)
- [Hub OAuth Flow](../../facter-hub/docs/modules/sso.md)
- [Hub Entitlements](../../facter-hub/docs/modules/entitlements.md)

---

*Criado: 2024-12-29*
*Última atualização: 2024-12-29*
