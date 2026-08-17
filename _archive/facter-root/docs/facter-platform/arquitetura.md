# Arquitetura - Facter Platform

> **Visão técnica detalhada da arquitetura da plataforma.**

---

## Princípios

### 1. Independência dos Produtos
Cada produto é autônomo e pode funcionar sem a plataforma central (modo standalone). A integração com o Facter Core é opcional mas recomendada.

### 2. Banco de Dados Separado
Cada produto mantém seu próprio banco de dados. O Facter Core tem seu banco para dados compartilhados.

### 3. Comunicação via API
Produtos se comunicam com o Core via REST API ou eventos assíncronos.

### 4. Fallback Graceful
Se o Core estiver indisponível, produtos continuam funcionando com funcionalidades reduzidas.

---

## Diagrama de Arquitetura

```
                                    ┌─────────────────┐
                                    │   Facter Hub    │
                                    │  (React + Vite) │
                                    │  hub.facter.app │
                                    └────────┬────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FACTER CORE                                     │
│                           (api.facter.app)                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   Identity   │  │   Billing    │  │   Products   │  │   Features   │   │
│  │   Service    │  │   Service    │  │   Service    │  │   Service    │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ Notification │  │  Analytics   │  │   Webhook    │  │    Events    │   │
│  │     Hub      │  │   Service    │  │   Service    │  │     Bus      │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                            PostgreSQL (Core DB)                              │
│                          Redis (Cache + Pub/Sub)                             │
└─────────────────────────────────────────────────────────────────────────────┘
          │                           │                           │
          │         Events            │         Events            │
          ▼                           ▼                           ▼
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│     TechCare     │       │    Produto 2     │       │    Produto N     │
│  ┌────────────┐  │       │  ┌────────────┐  │       │  ┌────────────┐  │
│  │    API     │  │       │  │    API     │  │       │  │    API     │  │
│  │  (NestJS)  │  │       │  │  (NestJS)  │  │       │  │  (NestJS)  │  │
│  └────────────┘  │       │  └────────────┘  │       │  └────────────┘  │
│  ┌────────────┐  │       │  ┌────────────┐  │       │  ┌────────────┐  │
│  │  Frontend  │  │       │  │  Frontend  │  │       │  │  Frontend  │  │
│  │(React+Vite)│  │       │  │(React+Vite)│  │       │  │(React+Vite)│  │
│  └────────────┘  │       │  └────────────┘  │       │  └────────────┘  │
│  ┌────────────┐  │       │  ┌────────────┐  │       │  ┌────────────┐  │
│  │ PostgreSQL │  │       │  │ PostgreSQL │  │       │  │ PostgreSQL │  │
│  └────────────┘  │       │  └────────────┘  │       │  └────────────┘  │
└──────────────────┘       └──────────────────┘       └──────────────────┘
```

---

## Fluxos de Comunicação

### 1. Autenticação (Facter Customer)

```
┌──────────┐         ┌──────────┐         ┌──────────┐
│ TechCare │         │   Core   │         │  Stripe  │
│   App    │         │ Identity │         │          │
└────┬─────┘         └────┬─────┘         └────┬─────┘
     │                    │                    │
     │  Login Request     │                    │
     │───────────────────▶│                    │
     │                    │                    │
     │                    │ Validate           │
     │                    │◀──────────────────▶│
     │                    │                    │
     │  JWT Token         │                    │
     │◀───────────────────│                    │
     │                    │                    │
     │  Access TechCare   │                    │
     │  with JWT          │                    │
     │                    │                    │
```

### 2. Criação de Assinatura

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ TechCare │    │   Core   │    │   Core   │    │  Stripe  │
│   App    │    │ Products │    │ Billing  │    │          │
└────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘
     │               │               │               │
     │ Criar Empresa │               │               │
     │──────────────▶│               │               │
     │               │               │               │
     │               │ Get Plan Info │               │
     │               │──────────────▶│               │
     │               │               │               │
     │               │               │ Create Sub    │
     │               │               │──────────────▶│
     │               │               │               │
     │               │               │ Subscription  │
     │               │               │◀──────────────│
     │               │               │               │
     │               │ Link Company  │               │
     │               │◀──────────────│               │
     │               │               │               │
     │ Company + Sub │               │               │
     │◀──────────────│               │               │
```

### 3. Eventos Assíncronos

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ TechCare │    │  Events  │    │   Core   │    │   Core   │
│   API    │    │   Bus    │    │Analytics │    │Notificat.│
└────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘
     │               │               │               │
     │ OS Completed  │               │               │
     │──────────────▶│               │               │
     │               │               │               │
     │               │──────────────▶│               │
     │               │ Track Event   │               │
     │               │               │               │
     │               │──────────────────────────────▶│
     │               │               │    Send Email │
     │               │               │               │
```

---

## Stack Tecnológica

### Facter Core

| Componente | Tecnologia |
|------------|------------|
| Runtime | Node.js 20+ |
| Framework | NestJS |
| Database | PostgreSQL 15+ |
| Cache | Redis 7+ |
| Message Queue | BullMQ |
| ORM | Prisma |
| Auth | JWT + Passport |
| Docs | Swagger/OpenAPI |

### Facter Hub

| Componente | Tecnologia |
|------------|------------|
| Framework | React 18+ |
| Build | Vite |
| State | Zustand |
| Data Fetching | TanStack Query |
| UI | shadcn/ui + Tailwind |
| Charts | Recharts |
| Tables | TanStack Table |

### Produtos (Padrão)

| Componente | Tecnologia |
|------------|------------|
| Backend | NestJS |
| Frontend | React + Vite |
| Database | PostgreSQL |
| State | Zustand |
| UI | Design System Facter |

---

## Modelo de Dados Central

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FACTER CORE DB                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌──────────────────┐         ┌──────────────────┐                        │
│   │  FacterCustomer  │         │     Product      │                        │
│   ├──────────────────┤         ├──────────────────┤                        │
│   │ id               │         │ id               │                        │
│   │ email            │         │ key (techcare)   │                        │
│   │ name             │         │ name             │                        │
│   │ stripeCustomerId │         │ plans[]          │                        │
│   │ subscriptions[]  │         │ features[]       │                        │
│   └────────┬─────────┘         └────────┬─────────┘                        │
│            │                            │                                   │
│            │                            │                                   │
│            ▼                            ▼                                   │
│   ┌──────────────────────────────────────────────┐                         │
│   │           ProductSubscription                 │                         │
│   ├──────────────────────────────────────────────┤                         │
│   │ id                                           │                         │
│   │ customerId ──────────────▶ FacterCustomer    │                         │
│   │ productId ───────────────▶ Product           │                         │
│   │ planId ──────────────────▶ ProductPlan       │                         │
│   │ externalId (companyId no produto)            │                         │
│   │ status                                       │                         │
│   │ stripeSubscriptionId                         │                         │
│   └──────────────────────────────────────────────┘                         │
│                                                                              │
│   ┌──────────────────┐         ┌──────────────────┐                        │
│   │   ProductPlan    │         │  ProductFeature  │                        │
│   ├──────────────────┤         ├──────────────────┤                        │
│   │ id               │         │ id               │                        │
│   │ productId        │         │ productId        │                        │
│   │ name             │         │ key              │                        │
│   │ price            │         │ name             │                        │
│   │ features[]       │         │ plans[]          │                        │
│   └──────────────────┘         └──────────────────┘                        │
│                                                                              │
│   ┌──────────────────┐         ┌──────────────────┐                        │
│   │  PlatformAdmin   │         │   AdminAuditLog  │                        │
│   ├──────────────────┤         ├──────────────────┤                        │
│   │ id               │         │ id               │                        │
│   │ email            │         │ adminId          │                        │
│   │ role             │         │ action           │                        │
│   │ permissions[]    │         │ targetType       │                        │
│   └──────────────────┘         │ targetId         │                        │
│                                └──────────────────┘                        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Segurança

### Autenticação entre Serviços

```typescript
// Produtos se autenticam no Core via API Key
const coreClient = new FacterCoreClient({
  apiKey: process.env.FACTER_CORE_API_KEY,
  productKey: 'techcare',
});

// Validação no Core
@Injectable()
export class ProductAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-facter-api-key'];
    const productKey = request.headers['x-facter-product'];

    return this.validateProductCredentials(apiKey, productKey);
  }
}
```

### JWT Cross-Product

```typescript
// Token emitido pelo Core
interface FacterToken {
  // Claims padrão
  sub: string;           // FacterCustomer ID
  iat: number;
  exp: number;

  // Claims customizados
  facter: {
    customerId: string;
    email: string;
    products: {
      productKey: string;
      subscriptionId: string;
      externalId: string;  // companyId, etc
      plan: string;
    }[];
  };
}

// Produto valida e extrai info
@Injectable()
export class FacterAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    const decoded = await this.coreClient.verifyToken(token);

    // Encontrar subscription deste produto
    const subscription = decoded.facter.products.find(
      p => p.productKey === 'techcare'
    );

    if (!subscription) {
      throw new ForbiddenException('No subscription for this product');
    }

    request.facterCustomer = decoded.facter;
    request.companyId = subscription.externalId;

    return true;
  }
}
```

---

## Deploy

### Infraestrutura Recomendada

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLOUDFLARE                                      │
│                          (DNS + CDN + WAF)                                   │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           KUBERNETES / ECS                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │ Core API   │  │ TechCare   │  │ Produto 2  │  │ Hub        │           │
│  │ (3 pods)   │  │ API (2)    │  │ API (2)    │  │ Static     │           │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘           │
│                                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                            │
│  │ Workers    │  │ Workers    │  │ Workers    │                            │
│  │ (BullMQ)   │  │ (BullMQ)   │  │ (BullMQ)   │                            │
│  └────────────┘  └────────────┘  └────────────┘                            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MANAGED SERVICES                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │ RDS        │  │ RDS        │  │ ElastiCache│  │ S3         │           │
│  │ Core DB    │  │ Product DBs│  │ Redis      │  │ Storage    │           │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Monitoramento

```typescript
// Métricas centralizadas
const metrics = {
  // Core
  'core.requests.total': Counter,
  'core.requests.duration': Histogram,
  'core.subscriptions.active': Gauge,

  // Por produto
  'product.{key}.requests.total': Counter,
  'product.{key}.users.active': Gauge,
  'product.{key}.revenue.mrr': Gauge,

  // Cross-product
  'platform.customers.total': Gauge,
  'platform.customers.multi_product': Gauge,
  'platform.mrr.total': Gauge,
};

// Stack de observabilidade
// - Prometheus: Métricas
// - Grafana: Dashboards
// - Loki: Logs
// - Tempo: Traces
```

---

**Próximo**: [Core - Entidades](./core/entidades/README.md)
