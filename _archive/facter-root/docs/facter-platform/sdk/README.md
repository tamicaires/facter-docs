# SDK - Facter Core

> **SDK oficial para integração de produtos com o Facter Core.**

---

## Instalação

```bash
npm install @facter/core-sdk
# ou
yarn add @facter/core-sdk
# ou
pnpm add @facter/core-sdk
```

---

## Configuração

### Inicialização

```typescript
// config/facter.config.ts
import { FacterCoreClient } from '@facter/core-sdk';

export const facterCore = new FacterCoreClient({
  apiKey: process.env.FACTER_CORE_API_KEY,
  productKey: process.env.FACTER_PRODUCT_KEY, // 'techcare'
  baseUrl: process.env.FACTER_CORE_URL, // opcional, default: https://api.facter.app
  timeout: 10000, // opcional, default: 10s
  retries: 3, // opcional, default: 3
});
```

### NestJS Module

```typescript
// modules/facter-core.module.ts
import { Module, Global } from '@nestjs/common';
import { FacterCoreClient } from '@facter/core-sdk';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  providers: [
    {
      provide: FacterCoreClient,
      useFactory: (config: ConfigService) => {
        return new FacterCoreClient({
          apiKey: config.get('FACTER_CORE_API_KEY'),
          productKey: config.get('FACTER_PRODUCT_KEY'),
          baseUrl: config.get('FACTER_CORE_URL'),
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [FacterCoreClient],
})
export class FacterCoreModule {}
```

---

## Módulos do SDK

### Auth

Autenticação e validação de tokens.

```typescript
// Verificar token JWT
const decoded = await facterCore.auth.verifyToken(token);
// {
//   sub: 'cust_123',
//   facter: {
//     customerId: 'cust_123',
//     email: 'user@example.com',
//     products: [
//       {
//         productKey: 'techcare',
//         subscriptionId: 'sub_456',
//         externalId: 'company_789',
//         plan: 'professional',
//       }
//     ]
//   }
// }

// Login (proxy para o Core)
const { token, refreshToken } = await facterCore.auth.login({
  email: 'user@example.com',
  password: 'secret123',
  productKey: 'techcare', // Contexto do produto
});

// Refresh token
const { token: newToken } = await facterCore.auth.refresh(refreshToken);

// Logout
await facterCore.auth.logout(token);

// Verificar MFA
const mfaResult = await facterCore.auth.verifyMFA({
  token: pendingToken,
  code: '123456',
});
```

---

### Customers

Gestão de clientes Facter.

```typescript
// Buscar por email
const customer = await facterCore.customers.findByEmail('user@example.com');

// Buscar por ID
const customer = await facterCore.customers.findById('cust_123');

// Criar novo cliente
const customer = await facterCore.customers.create({
  email: 'user@example.com',
  name: 'João Silva',
  phone: '+5511999999999',
  document: '12345678901',
  documentType: 'CPF',
});

// Atualizar cliente
const customer = await facterCore.customers.update('cust_123', {
  name: 'João Silva Santos',
  phone: '+5511888888888',
});

// Listar clientes (com filtros)
const { data, pagination } = await facterCore.customers.list({
  page: 1,
  limit: 20,
  status: 'ACTIVE',
  search: 'joao',
});
```

---

### Subscriptions

Gestão de assinaturas.

```typescript
// Criar assinatura
const subscription = await facterCore.subscriptions.create({
  customerId: 'cust_123',
  planId: 'plan_456',
  externalId: 'company_789', // ID local (companyId)
  metadata: {
    companyName: 'Tech Solutions',
  },
});

// Buscar assinatura
const subscription = await facterCore.subscriptions.findById('sub_123');

// Buscar por external ID
const subscription = await facterCore.subscriptions.findByExternalId('company_789');

// Atualizar plano (upgrade/downgrade)
const subscription = await facterCore.subscriptions.changePlan('sub_123', {
  newPlanId: 'plan_professional',
  prorate: true,
  effectiveAt: 'immediately', // ou 'next_period'
});

// Cancelar assinatura
const subscription = await facterCore.subscriptions.cancel('sub_123', {
  reason: 'customer_request',
  cancelAtPeriodEnd: true, // Mantém acesso até fim do período
  feedback: 'Muito caro para meu negócio',
});

// Reativar assinatura cancelada
const subscription = await facterCore.subscriptions.reactivate('sub_123');

// Pausar assinatura
const subscription = await facterCore.subscriptions.pause('sub_123', {
  resumeAt: new Date('2024-03-01'),
});

// Listar assinaturas do cliente
const subscriptions = await facterCore.subscriptions.listByCustomer('cust_123');
```

---

### Features

Sistema de feature flags.

```typescript
// Verificar se feature está habilitada
const isEnabled = await facterCore.features.isEnabled(
  'sub_123',
  'whatsapp_notifications'
);

// Listar todas features da assinatura
const features = await facterCore.features.list('sub_123');
// {
//   'service_orders': { enabled: true, limit: null },
//   'inventory': { enabled: true, limit: 1000 },
//   'whatsapp_notifications': { enabled: true, limit: 500 },
//   'fiscal_integration': { enabled: false, limit: null },
// }

// Verificar com limite
const canUse = await facterCore.features.checkLimit(
  'sub_123',
  'inventory',
  currentCount
);
// { allowed: true, remaining: 850, limit: 1000 }

// Obter todas features do produto (não da assinatura)
const productFeatures = await facterCore.features.listProduct();
```

---

### Billing

Faturamento e pagamentos.

```typescript
// Obter informações de billing da assinatura
const billing = await facterCore.billing.getSubscription('sub_123');
// {
//   status: 'ACTIVE',
//   plan: { id, name, price },
//   currentPeriod: { start, end },
//   nextInvoice: { amount, dueDate },
//   paymentMethod: { type: 'card', last4: '4242' },
// }

// Listar faturas
const invoices = await facterCore.billing.listInvoices('sub_123', {
  status: 'paid', // 'paid', 'open', 'draft', 'uncollectible'
  limit: 10,
});

// Obter fatura específica
const invoice = await facterCore.billing.getInvoice('inv_123');

// Gerar PDF da fatura
const pdfUrl = await facterCore.billing.getInvoicePdf('inv_123');

// Obter link para portal de billing (Stripe Customer Portal)
const portalUrl = await facterCore.billing.createPortalSession('cust_123', {
  returnUrl: 'https://techcare.app/settings/billing',
});

// Criar checkout para novo plano
const checkoutUrl = await facterCore.billing.createCheckout({
  customerId: 'cust_123',
  planId: 'plan_professional',
  successUrl: 'https://techcare.app/success',
  cancelUrl: 'https://techcare.app/pricing',
});
```

---

### Analytics

Tracking de eventos e métricas.

```typescript
// Registrar evento
await facterCore.analytics.track({
  event: 'os_completed',
  customerId: 'cust_123',
  subscriptionId: 'sub_456',
  properties: {
    osId: 'os_789',
    totalValue: 350.00,
    itemsCount: 3,
    paymentMethod: 'pix',
  },
  timestamp: new Date(),
});

// Tracking em batch
await facterCore.analytics.trackBatch([
  { event: 'os_created', customerId: 'cust_123', properties: { ... } },
  { event: 'product_sold', customerId: 'cust_123', properties: { ... } },
]);

// Identificar usuário (enrichment)
await facterCore.analytics.identify('cust_123', {
  companySize: 'small',
  industry: 'tech_repair',
  city: 'São Paulo',
});

// Registrar page view
await facterCore.analytics.page({
  customerId: 'cust_123',
  name: 'Service Order Details',
  path: '/os/123',
  referrer: '/os',
});
```

---

### Notifications

Envio de notificações.

```typescript
// Enviar notificação
await facterCore.notifications.send({
  customerId: 'cust_123',
  template: 'os_completed',
  channels: ['email', 'push'],
  data: {
    osNumber: 'OS-2024-0001',
    customerName: 'Maria Silva',
    total: 'R$ 350,00',
  },
});

// Enviar para destinatário específico
await facterCore.notifications.send({
  to: {
    email: 'customer@example.com',
    phone: '+5511999999999',
  },
  template: 'appointment_reminder',
  channels: ['whatsapp', 'email'],
  data: {
    date: '15/02/2024',
    time: '14:00',
  },
});

// Registrar template personalizado
await facterCore.notifications.registerTemplate({
  key: 'warranty_expiring',
  name: 'Garantia Expirando',
  channels: ['email', 'whatsapp'],
  subject: 'Sua garantia expira em {{days}} dias',
  body: 'Olá {{customerName}}, sua garantia...',
});
```

---

### Products

Informações do produto e planos.

```typescript
// Obter informações do produto atual
const product = await facterCore.products.current();
// {
//   id: 'prod_123',
//   key: 'techcare',
//   name: 'TechCare',
//   plans: [...],
//   features: [...],
// }

// Listar planos do produto
const plans = await facterCore.products.listPlans();
// [
//   { id, key: 'free', name: 'Gratuito', price: 0, features: [...] },
//   { id, key: 'starter', name: 'Starter', price: 99.90, features: [...] },
//   { id, key: 'professional', name: 'Professional', price: 199.90, features: [...] },
// ]

// Obter plano específico
const plan = await facterCore.products.getPlan('plan_professional');
```

---

## Tipos TypeScript

```typescript
// types/facter.types.ts
import type {
  FacterCustomer,
  FacterToken,
  ProductSubscription,
  SubscriptionStatus,
  Feature,
  FeatureMap,
  ProductPlan,
  Invoice,
  AnalyticsEvent,
  NotificationRequest,
} from '@facter/core-sdk';

// Token decodificado
interface FacterToken {
  sub: string;
  iat: number;
  exp: number;
  facter: {
    customerId: string;
    email: string;
    products: {
      productKey: string;
      subscriptionId: string;
      externalId: string;
      plan: string;
    }[];
  };
}

// Cliente
interface FacterCustomer {
  id: string;
  email: string;
  name: string;
  phone?: string;
  document?: string;
  documentType?: 'CPF' | 'CNPJ';
  stripeCustomerId?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt: Date;
  updatedAt: Date;
}

// Assinatura
interface ProductSubscription {
  id: string;
  customerId: string;
  productId: string;
  planId: string;
  externalId: string;
  status: SubscriptionStatus;
  stripeSubscriptionId?: string;
  trialEndsAt?: Date;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelledAt?: Date;
  cancelAtPeriodEnd: boolean;
}

type SubscriptionStatus =
  | 'TRIALING'
  | 'ACTIVE'
  | 'PAST_DUE'
  | 'CANCELLED'
  | 'PAUSED';
```

---

## Tratamento de Erros

```typescript
import {
  FacterError,
  FacterAuthError,
  FacterNotFoundError,
  FacterValidationError,
  FacterRateLimitError,
  FacterNetworkError,
} from '@facter/core-sdk';

try {
  const customer = await facterCore.customers.findById('cust_123');
} catch (error) {
  if (error instanceof FacterAuthError) {
    // 401 - Credenciais inválidas
    console.error('API Key inválida');
  } else if (error instanceof FacterNotFoundError) {
    // 404 - Recurso não encontrado
    console.error('Cliente não encontrado');
  } else if (error instanceof FacterValidationError) {
    // 400 - Dados inválidos
    console.error('Erros de validação:', error.errors);
  } else if (error instanceof FacterRateLimitError) {
    // 429 - Rate limit
    console.error(`Rate limit. Retry em ${error.retryAfter}s`);
  } else if (error instanceof FacterNetworkError) {
    // Timeout ou erro de rede
    console.error('Core indisponível');
  } else {
    // Outro erro
    throw error;
  }
}
```

---

## Hooks e Interceptors

```typescript
// Adicionar interceptor de request
facterCore.addRequestInterceptor((config) => {
  // Adicionar headers customizados
  config.headers['X-Request-Id'] = generateRequestId();
  return config;
});

// Adicionar interceptor de response
facterCore.addResponseInterceptor(
  (response) => {
    // Log de sucesso
    console.log(`[Facter] ${response.config.method} ${response.config.url}`);
    return response;
  },
  (error) => {
    // Log de erro
    console.error(`[Facter] Error: ${error.message}`);
    throw error;
  }
);

// Hook para eventos
facterCore.on('tokenExpired', () => {
  // Token expirou, fazer logout
  authService.logout();
});

facterCore.on('rateLimited', (retryAfter) => {
  // Rate limit atingido
  console.warn(`Rate limited. Retry in ${retryAfter}s`);
});
```

---

## Cache

```typescript
import { FacterCoreClient, MemoryCache, RedisCache } from '@facter/core-sdk';

// Cache em memória (default)
const client = new FacterCoreClient({
  apiKey: '...',
  productKey: 'techcare',
  cache: new MemoryCache({
    ttl: 5 * 60 * 1000, // 5 minutos
    maxSize: 1000,
  }),
});

// Cache com Redis
const client = new FacterCoreClient({
  apiKey: '...',
  productKey: 'techcare',
  cache: new RedisCache({
    client: redisClient,
    prefix: 'facter:',
    ttl: 5 * 60, // 5 minutos em segundos
  }),
});

// Limpar cache manualmente
await client.cache.invalidate('features:sub_123');
await client.cache.clear();
```

---

## Testing

```typescript
import { FacterCoreMock } from '@facter/core-sdk/testing';

describe('OnboardingService', () => {
  let facterMock: FacterCoreMock;
  let service: OnboardingService;

  beforeEach(() => {
    facterMock = new FacterCoreMock();

    // Configurar mocks
    facterMock.customers.findByEmail.mockResolvedValue(null);
    facterMock.customers.create.mockResolvedValue({
      id: 'cust_123',
      email: 'test@example.com',
      name: 'Test User',
    });

    facterMock.subscriptions.create.mockResolvedValue({
      id: 'sub_456',
      customerId: 'cust_123',
      status: 'TRIALING',
    });

    service = new OnboardingService(facterMock, companyService);
  });

  it('should create customer and subscription', async () => {
    const result = await service.onboardNewCustomer({
      email: 'test@example.com',
      name: 'Test User',
      planId: 'plan_starter',
    });

    expect(facterMock.customers.create).toHaveBeenCalledWith({
      email: 'test@example.com',
      name: 'Test User',
    });

    expect(facterMock.subscriptions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        customerId: 'cust_123',
        planId: 'plan_starter',
      })
    );

    expect(result.subscription.status).toBe('TRIALING');
  });
});
```

---

## Changelog

### v1.0.0
- Release inicial
- Módulos: auth, customers, subscriptions, features, billing, analytics, notifications, products
- Suporte a cache em memória e Redis
- Tratamento de erros tipado
- Suporte a interceptors

---

**Voltar para** [Integração](../integracao/README.md)
