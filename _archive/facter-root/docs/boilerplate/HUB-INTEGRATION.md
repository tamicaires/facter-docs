# Boilerplate - Integração com Facter Hub

> Guia para adaptar o boilerplate para usar o Facter Hub como plataforma central de autenticação, billing e entitlements.

---

## Visão Geral

```
┌─────────────────────────────────────────────────────────────────┐
│  ANTES (Boilerplate Standalone)                                 │
├─────────────────────────────────────────────────────────────────┤
│  User → Login Local → JWT Local → App Features                  │
│  - Autenticação local (email/senha)                             │
│  - RBAC local (Role/Permission tables)                          │
│  - Billing próprio (se implementado)                            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  DEPOIS (Integrado com Hub)                                     │
├─────────────────────────────────────────────────────────────────┤
│  User → Hub SSO → Hub Token → App Features                      │
│  - Autenticação via Hub (OAuth 2.0 SSO)                         │
│  - Entitlements do Hub (feature access)                         │
│  - Billing centralizado no Hub                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## O que o Hub Fornece

| Funcionalidade | Descrição |
|----------------|-----------|
| **SSO/Auth** | Login, registro, logout, refresh tokens |
| **User Profile** | Email, nome, avatar, preferences |
| **Companies** | Multi-tenant, memberships, roles |
| **Entitlements** | Feature access baseado no plano |
| **Billing** | Stripe integration, subscriptions, invoices |
| **Feature Flags** | Rollout gradual, A/B testing |
| **Notifications** | In-app, email, push |
| **Audit Logs** | Tracking de ações |

---

## Mudanças Necessárias

### Backend (NestJS)

#### REMOVER

```
src/
├── application/auth/
│   ├── auth.controller.ts         # Endpoints de auth local
│   ├── use-cases/
│   │   ├── login.use-case.ts
│   │   ├── register.use-case.ts
│   │   ├── refresh-token.use-case.ts
│   │   ├── logout.use-case.ts
│   │   ├── forgot-password.use-case.ts
│   │   ├── reset-password.use-case.ts
│   │   └── change-password.use-case.ts
│   └── dto/
│       ├── login.dto.ts
│       ├── register.dto.ts
│       └── password.dto.ts
│
├── infra/auth/services/
│   ├── password.service.ts        # Hash de senhas
│   ├── token.service.ts           # JWT local
│   └── refresh-token.service.ts   # Refresh tokens locais
│
└── infra/mail/                    # Se password reset for só do Hub
```

**Prisma - Remover/Modificar:**
```prisma
// REMOVER
model RefreshToken { ... }
model PasswordResetToken { ... }

// MODIFICAR User
model User {
  // REMOVER
  password      String?
  emailVerified DateTime?

  // ADICIONAR
  hubUserId     String    @unique  // ID do usuário no Hub
}
```

#### ADICIONAR

```
src/
├── infra/hub/
│   ├── hub.module.ts              # Módulo de integração
│   ├── hub.service.ts             # Client para API do Hub
│   ├── hub-auth.guard.ts          # Validação de tokens do Hub
│   └── hub-webhook.controller.ts  # Receber eventos do Hub
│
├── config/
│   └── hub.config.ts              # Configurações do Hub
```

**Novo Guard de Autenticação:**
```typescript
// src/infra/hub/hub-auth.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { HubService } from './hub.service';

@Injectable()
export class HubAuthGuard implements CanActivate {
  constructor(private readonly hubService: HubService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) return false;

    // Validar token com Hub
    const user = await this.hubService.validateToken(token);
    if (!user) return false;

    request.user = user;
    return true;
  }
}
```

**Hub Service:**
```typescript
// src/infra/hub/hub.service.ts
import { Injectable } from '@nestjs/common';
import { HubClient } from '@facter/hub-sdk';

@Injectable()
export class HubService {
  private client: HubClient;

  constructor() {
    this.client = new HubClient({
      baseUrl: process.env.HUB_API_URL,
      clientId: process.env.HUB_CLIENT_ID,
      clientSecret: process.env.HUB_CLIENT_SECRET,
    });
  }

  async validateToken(token: string) {
    return this.client.auth.introspect(token);
  }

  async getEntitlements(companyId: string, productId: string) {
    return this.client.entitlements.getAll(companyId, productId);
  }

  async checkFeature(companyId: string, featureKey: string) {
    return this.client.entitlements.check(companyId, featureKey);
  }
}
```

**Variáveis de Ambiente:**
```env
# Hub Integration
HUB_API_URL=https://hub.facter.com/api
HUB_CLIENT_ID=techcare
HUB_CLIENT_SECRET=your-secret-here
HUB_WEBHOOK_SECRET=webhook-secret
```

---

### Frontend (Next.js)

#### REMOVER

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
│   │   └── forgot-password-form.tsx
│   ├── hooks/
│   │   ├── use-login.ts
│   │   ├── use-register.ts
│   │   └── use-forgot-password.ts
│   └── services/
│       └── auth-service.ts        # Chamadas de auth local
```

#### ADICIONAR

```
src/
├── app/(auth)/
│   └── callback/page.tsx          # Hub OAuth callback
│
├── features/auth/
│   ├── hooks/
│   │   └── use-hub-auth.ts        # Hook para auth via Hub
│   └── services/
│       └── hub-auth-service.ts    # Chamadas para Hub
│
├── lib/hub/
│   └── hub-client.ts              # Cliente HTTP para Hub
```

**Callback Page:**
```tsx
// src/app/(auth)/callback/page.tsx
'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { hubAuthService } from '@/features/auth/services/hub-auth-service';

export default function HubCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      hubAuthService.exchangeCode(code).then(() => {
        router.push('/dashboard');
      });
    }
  }, [searchParams, router]);

  return <div>Autenticando...</div>;
}
```

**Hub Auth Service:**
```typescript
// src/features/auth/services/hub-auth-service.ts
const HUB_URL = process.env.NEXT_PUBLIC_HUB_URL;
const APP_ID = process.env.NEXT_PUBLIC_APP_ID;

export const hubAuthService = {
  getLoginUrl() {
    const redirectUri = `${window.location.origin}/callback`;
    return `${HUB_URL}/oauth/authorize?client_id=${APP_ID}&redirect_uri=${redirectUri}&response_type=code`;
  },

  async exchangeCode(code: string) {
    const response = await fetch('/api/auth/callback', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
    return response.json();
  },

  logout() {
    window.location.href = `${HUB_URL}/logout?redirect_uri=${window.location.origin}`;
  },
};
```

**Middleware Atualizado:**
```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/callback', '/api/webhooks'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rotas públicas
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Verificar token do Hub
  const token = request.cookies.get('hub_access_token');

  if (!token) {
    // Redirecionar para Hub login
    const hubUrl = process.env.NEXT_PUBLIC_HUB_URL;
    const appId = process.env.NEXT_PUBLIC_APP_ID;
    const redirectUri = `${request.nextUrl.origin}/callback`;

    return NextResponse.redirect(
      `${hubUrl}/oauth/authorize?client_id=${appId}&redirect_uri=${redirectUri}&response_type=code`
    );
  }

  return NextResponse.next();
}
```

**Variáveis de Ambiente:**
```env
# Frontend
NEXT_PUBLIC_HUB_URL=https://hub.facter.com
NEXT_PUBLIC_APP_ID=techcare
```

---

## Fluxo de Autenticação

```
┌──────────────────────────────────────────────────────────────────────┐
│                      FLUXO SSO COM HUB                               │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. Usuário acessa TechCare (sem token)                             │
│     ↓                                                                │
│  2. Middleware detecta ausência de token                            │
│     ↓                                                                │
│  3. Redirect para Hub: /oauth/authorize?client_id=techcare&...      │
│     ↓                                                                │
│  4. Hub autentica usuário (login se necessário)                     │
│     ↓                                                                │
│  5. Hub redireciona para TechCare: /callback?code=xxx               │
│     ↓                                                                │
│  6. TechCare troca code por tokens (POST /oauth/token)              │
│     ↓                                                                │
│  7. TechCare armazena tokens em httpOnly cookies                    │
│     ↓                                                                │
│  8. Redirect para /dashboard                                        │
│     ↓                                                                │
│  9. Para cada request protegido:                                    │
│     - Backend valida token com Hub (introspect)                     │
│     - Busca entitlements se necessário                              │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Entitlements e Feature Access

Em vez de RBAC local, usar entitlements do Hub:

```typescript
// Antes (RBAC local)
@UseGuards(JwtAuthGuard, PermissionsGuard)
@CheckPermissions((ability) => ability.can('read', 'Report'))
async getReports() { ... }

// Depois (Hub entitlements)
@UseGuards(HubAuthGuard, EntitlementGuard)
@RequireEntitlement('reports')
async getReports() { ... }
```

**Entitlement Guard:**
```typescript
@Injectable()
export class EntitlementGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly hubService: HubService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const featureKey = this.reflector.get<string>('entitlement', context.getHandler());
    if (!featureKey) return true;

    const request = context.switchToHttp().getRequest();
    const { companyId } = request.user;

    const hasAccess = await this.hubService.checkFeature(companyId, featureKey);
    return hasAccess;
  }
}
```

---

## Webhooks do Hub

Receber eventos para sincronizar dados:

```typescript
// src/infra/hub/hub-webhook.controller.ts
@Controller('webhooks/hub')
export class HubWebhookController {
  constructor(private readonly syncService: SyncService) {}

  @Post()
  async handleWebhook(@Body() payload: any, @Headers('x-hub-signature') signature: string) {
    // Validar signature
    if (!this.validateSignature(payload, signature)) {
      throw new UnauthorizedException('Invalid signature');
    }

    switch (payload.event) {
      case 'user.updated':
        await this.syncService.syncUser(payload.data);
        break;
      case 'membership.created':
      case 'membership.updated':
        await this.syncService.syncMembership(payload.data);
        break;
      case 'subscription.updated':
        await this.syncService.syncSubscription(payload.data);
        break;
    }

    return { received: true };
  }
}
```

---

## Checklist de Migração

### Backend

- [ ] Instalar `@facter/hub-sdk`
- [ ] Criar `HubModule` com `HubService`
- [ ] Criar `HubAuthGuard`
- [ ] Criar `EntitlementGuard`
- [ ] Criar webhook controller
- [ ] Remover `AuthController` (endpoints locais)
- [ ] Remover use cases de auth local
- [ ] Remover `PasswordService`, `TokenService`, `RefreshTokenService`
- [ ] Atualizar Prisma schema (remover RefreshToken, PasswordResetToken)
- [ ] Adicionar `hubUserId` ao User
- [ ] Configurar variáveis de ambiente do Hub
- [ ] Atualizar guards existentes para usar Hub

### Frontend

- [ ] Remover páginas de login/register
- [ ] Criar callback page
- [ ] Criar hub-auth-service
- [ ] Atualizar middleware para Hub SSO
- [ ] Atualizar useAuthStore para dados do Hub
- [ ] Remover hooks de auth local
- [ ] Atualizar logout para Hub
- [ ] Configurar variáveis de ambiente

### Geral

- [ ] Registrar produto no Hub (client_id, redirect_uris)
- [ ] Gerar client_secret no Hub
- [ ] Configurar webhook URL no Hub
- [ ] Testar fluxo completo de SSO
- [ ] Testar entitlements
- [ ] Testar webhooks

---

## Referências

- [Hub SDK Documentation](../facter-hub/docs/modules/sdk.md)
- [Hub OAuth Flow](../facter-hub/docs/modules/sso.md)
- [Hub Entitlements API](../facter-hub/docs/modules/entitlements.md)
- [Hub Webhooks](../facter-hub/docs/modules/webhooks.md)

---

*Criado: 2024-12-28*
