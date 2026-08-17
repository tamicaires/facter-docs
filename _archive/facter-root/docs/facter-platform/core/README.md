# Facter Core

> **Serviços compartilhados da plataforma Facter.**

---

## Visão Geral

O Facter Core é o backbone da plataforma, fornecendo serviços que são compartilhados entre todos os produtos do ecossistema.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FACTER CORE                                     │
│                           api.facter.app                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │                          API Gateway                                 │  │
│   │                     (Rate Limiting, Auth)                           │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                      │                                      │
│   ┌──────────┬──────────┬──────────┬┴─────────┬──────────┬──────────┐     │
│   │          │          │          │          │          │          │     │
│   ▼          ▼          ▼          ▼          ▼          ▼          ▼     │
│ ┌────────┐┌────────┐┌────────┐┌────────┐┌────────┐┌────────┐┌────────┐   │
│ │Identity││Billing ││Products││Features││Notific.││Analytics│Webhook │   │
│ │Service ││Service ││Service ││Service ││  Hub   ││Service ││Service │   │
│ └────────┘└────────┘└────────┘└────────┘└────────┘└────────┘└────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Serviços

### [Identity Service](./servicos/identity.md)
Gerenciamento de identidade e autenticação.
- Registro de FacterCustomers
- Autenticação (login, MFA)
- Tokens JWT cross-product
- PlatformAdmins

### [Billing Service](./servicos/billing.md)
Integração centralizada com gateway de pagamento.
- Stripe integration
- Assinaturas e planos
- Faturas consolidadas
- Webhooks de pagamento

### [Products Service](./servicos/products.md)
Registro e configuração de produtos.
- Catálogo de produtos
- Planos por produto
- Métricas por produto
- Health checks

### [Features Service](./servicos/features.md)
Sistema de feature flags global.
- Features por produto
- Overrides por customer
- A/B testing
- Rollout gradual

### [Notification Hub](./servicos/notifications.md)
Central de notificações.
- Templates globais
- Roteamento para produtos
- Histórico unificado
- Preferências de usuário

### [Analytics Service](./servicos/analytics.md)
Coleta e agregação de métricas.
- Eventos de produtos
- Métricas de negócio
- Dashboards
- Exports

### [Webhook Service](./servicos/webhooks.md)
Gerenciamento de webhooks.
- Registro de endpoints
- Retry com backoff
- Logs e debugging
- Assinatura de payloads

---

## Entidades

| Entidade | Descrição |
|----------|-----------|
| [FacterCustomer](./entidades/facter-customer.md) | Cliente da plataforma |
| [Product](./entidades/product.md) | Produto do ecossistema |
| [ProductPlan](./entidades/product-plan.md) | Plano de um produto |
| [ProductSubscription](./entidades/product-subscription.md) | Assinatura ativa |
| [ProductFeature](./entidades/product-feature.md) | Feature de um produto |
| [PlatformAdmin](./entidades/platform-admin.md) | Admin da plataforma |
| [CoreEvent](./entidades/core-event.md) | Eventos do sistema |

---

## API Endpoints

### Base URL
```
https://api.facter.app/v1
```

### Autenticação
```http
# Para usuários finais (FacterCustomers)
Authorization: Bearer <jwt_token>

# Para produtos (service-to-service)
X-Facter-API-Key: <api_key>
X-Facter-Product: <product_key>

# Para admins (PlatformAdmins)
Authorization: Bearer <admin_jwt>
```

### Principais Rotas

| Prefixo | Descrição |
|---------|-----------|
| `/auth` | Autenticação |
| `/customers` | Gestão de clientes |
| `/products` | Produtos e planos |
| `/subscriptions` | Assinaturas |
| `/features` | Feature flags |
| `/billing` | Faturamento |
| `/admin` | Área administrativa |

---

## Integração com Produtos

### SDK

```typescript
import { FacterCore } from '@facter/core-sdk';

const core = new FacterCore({
  apiKey: process.env.FACTER_CORE_API_KEY,
  productKey: 'techcare',
});

// Verificar token de usuário
const customer = await core.auth.verifyToken(token);

// Verificar features
const hasFeature = await core.features.isEnabled(
  customer.subscriptionId,
  'whatsapp_notifications'
);

// Registrar evento
await core.analytics.track({
  event: 'os_completed',
  customerId: customer.id,
  properties: { osId, value },
});
```

### Webhooks Recebidos

O Core envia webhooks para produtos nos seguintes eventos:

| Evento | Descrição |
|--------|-----------|
| `subscription.created` | Nova assinatura criada |
| `subscription.updated` | Assinatura atualizada |
| `subscription.cancelled` | Assinatura cancelada |
| `payment.succeeded` | Pagamento confirmado |
| `payment.failed` | Pagamento falhou |
| `feature.toggled` | Feature habilitada/desabilitada |

---

## Configuração

### Variáveis de Ambiente

```env
# Database
DATABASE_URL=postgresql://...
REDIS_URL=redis://...

# Auth
JWT_SECRET=...
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Products (API Keys)
PRODUCT_TECHCARE_API_KEY=pk_...
PRODUCT_PROJETO2_API_KEY=pk_...

# Email
SENDGRID_API_KEY=...
EMAIL_FROM=noreply@facter.app
```

---

**Próximo**: [Entidades](./entidades/README.md)
