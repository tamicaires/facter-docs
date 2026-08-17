# Integração - Facter Platform

> **Como produtos se integram ao Facter Core.**

---

## Visão Geral

Produtos do ecossistema Facter se integram ao Core através de:
1. **SDK oficial** (`@facter/core-sdk`)
2. **REST API** direta
3. **Webhooks** para eventos assíncronos

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              PRODUTO                                      │
│                            (TechCare)                                     │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                    FacterCoreClient (SDK)                        │   │
│   ├─────────────────────────────────────────────────────────────────┤   │
│   │  auth.verifyToken()    │  features.isEnabled()                  │   │
│   │  customers.get()       │  billing.getSubscription()             │   │
│   │  analytics.track()     │  notifications.send()                  │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                      │                                   │
│                                      │ HTTPS                             │
│                                      ▼                                   │
├──────────────────────────────────────────────────────────────────────────┤
│                            API Gateway                                    │
│                         api.facter.app                                    │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│   │ Identity │  │ Billing  │  │ Features │  │Analytics │              │
│   └──────────┘  └──────────┘  └──────────┘  └──────────┘              │
│                                                                           │
│                           FACTER CORE                                     │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Autenticação do Produto

### Credenciais

Cada produto recebe ao ser registrado:

| Credencial | Descrição |
|------------|-----------|
| `API_KEY` | Chave única do produto |
| `PRODUCT_KEY` | Identificador do produto (`techcare`) |
| `WEBHOOK_SECRET` | Secret para validar webhooks recebidos |

### Headers Obrigatórios

```http
# Toda requisição ao Core
X-Facter-API-Key: pk_live_abc123...
X-Facter-Product: techcare
```

---

## Fluxos de Integração

### 1. Registro de Novo Cliente

Quando um novo cliente se cadastra no produto:

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│ TechCare │     │   Core   │     │   Core   │     │  Stripe  │
│  (Form)  │     │ Identity │     │ Billing  │     │          │
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │                │
     │ 1. Criar       │                │                │
     │    Customer    │                │                │
     │───────────────▶│                │                │
     │                │                │                │
     │                │ 2. Create      │                │
     │                │    Stripe Cust │                │
     │                │───────────────────────────────▶│
     │                │                │                │
     │                │◀───────────────────────────────│
     │                │  stripe_cust_id                │
     │                │                │                │
     │ 3. Customer    │                │                │
     │    Created     │                │                │
     │◀───────────────│                │                │
     │                │                │                │
     │ 4. Criar       │                │                │
     │    Subscription│                │                │
     │───────────────────────────────▶│                │
     │                │                │                │
     │                │                │ 5. Create     │
     │                │                │    Stripe Sub │
     │                │                │───────────────▶│
     │                │                │                │
     │                │                │◀───────────────│
     │                │                │                │
     │ 6. Subscription│                │                │
     │    Created     │                │                │
     │◀───────────────────────────────│                │
     │                │                │                │
```

**Código no Produto:**

```typescript
// services/onboarding.service.ts
export class OnboardingService {
  constructor(
    private readonly facterCore: FacterCoreClient,
    private readonly companyService: CompanyService,
  ) {}

  async onboardNewCustomer(data: OnboardingDto): Promise<OnboardingResult> {
    // 1. Criar/buscar FacterCustomer no Core
    let facterCustomer = await this.facterCore.customers.findByEmail(data.email);

    if (!facterCustomer) {
      facterCustomer = await this.facterCore.customers.create({
        email: data.email,
        name: data.name,
        phone: data.phone,
        document: data.document,
        documentType: data.documentType,
      });
    }

    // 2. Criar empresa local
    const company = await this.companyService.create({
      name: data.companyName,
      document: data.companyDocument,
      facterCustomerId: facterCustomer.id,
    });

    // 3. Criar assinatura no Core
    const subscription = await this.facterCore.subscriptions.create({
      customerId: facterCustomer.id,
      planId: data.planId,
      externalId: company.id, // ID local da empresa
    });

    // 4. Atualizar empresa com subscriptionId
    await this.companyService.update(company.id, {
      facterSubscriptionId: subscription.id,
    });

    return {
      customer: facterCustomer,
      company,
      subscription,
    };
  }
}
```

---

### 2. Autenticação de Usuário

O Core emite JWTs que são validados pelos produtos:

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │     │ TechCare │     │   Core   │     │   Core   │
│ (Browser)│     │   API    │     │ Identity │     │   DB     │
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │                │
     │ 1. Login       │                │                │
     │───────────────▶│                │                │
     │                │                │                │
     │                │ 2. Proxy       │                │
     │                │    Login       │                │
     │                │───────────────▶│                │
     │                │                │                │
     │                │                │ 3. Validate    │
     │                │                │───────────────▶│
     │                │                │                │
     │                │                │◀───────────────│
     │                │                │                │
     │                │ 4. JWT Token   │                │
     │                │◀───────────────│                │
     │                │                │                │
     │ 5. Token       │                │                │
     │◀───────────────│                │                │
     │                │                │                │
     │ 6. Request     │                │                │
     │    + Token     │                │                │
     │───────────────▶│                │                │
     │                │                │                │
     │                │ 7. Verify      │                │
     │                │    Token       │                │
     │                │───────────────▶│                │
     │                │                │                │
     │                │ 8. Valid +     │                │
     │                │    Claims      │                │
     │                │◀───────────────│                │
     │                │                │                │
     │ 9. Response    │                │                │
     │◀───────────────│                │                │
```

**Guard no Produto:**

```typescript
// guards/facter-auth.guard.ts
@Injectable()
export class FacterAuthGuard implements CanActivate {
  constructor(private readonly facterCore: FacterCoreClient) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Token not provided');
    }

    try {
      // Verifica token no Core (com cache local)
      const decoded = await this.facterCore.auth.verifyToken(token);

      // Encontra subscription deste produto
      const productSub = decoded.facter.products.find(
        p => p.productKey === 'techcare'
      );

      if (!productSub) {
        throw new ForbiddenException('No subscription for TechCare');
      }

      // Injeta dados na request
      request.facterCustomer = decoded.facter;
      request.companyId = productSub.externalId;
      request.subscriptionId = productSub.subscriptionId;
      request.plan = productSub.plan;

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractToken(request: Request): string | null {
    const auth = request.headers.authorization;
    if (auth?.startsWith('Bearer ')) {
      return auth.substring(7);
    }
    return null;
  }
}
```

---

### 3. Verificação de Features

```typescript
// guards/feature.guard.ts
@Injectable()
export class FeatureGuard implements CanActivate {
  constructor(
    private readonly facterCore: FacterCoreClient,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredFeature = this.reflector.get<string>(
      'feature',
      context.getHandler()
    );

    if (!requiredFeature) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const subscriptionId = request.subscriptionId;

    const hasFeature = await this.facterCore.features.isEnabled(
      subscriptionId,
      requiredFeature
    );

    if (!hasFeature) {
      throw new ForbiddenException(
        `Feature "${requiredFeature}" not available in your plan`
      );
    }

    return true;
  }
}

// Decorator
export const RequireFeature = (featureKey: string) =>
  SetMetadata('feature', featureKey);

// Uso em controller
@Controller('whatsapp')
@UseGuards(FacterAuthGuard, FeatureGuard)
export class WhatsAppController {
  @Post('send')
  @RequireFeature('whatsapp_notifications')
  async sendMessage(@Body() dto: SendMessageDto) {
    // Só executa se feature habilitada
  }
}
```

---

### 4. Tracking de Eventos

```typescript
// services/analytics.service.ts
@Injectable()
export class AnalyticsService {
  constructor(private readonly facterCore: FacterCoreClient) {}

  async trackOSCompleted(os: ServiceOrder) {
    await this.facterCore.analytics.track({
      event: 'os_completed',
      customerId: os.company.facterCustomerId,
      subscriptionId: os.company.facterSubscriptionId,
      properties: {
        osId: os.id,
        totalValue: os.total,
        itemsCount: os.items.length,
        paymentMethod: os.paymentMethod,
        technicianId: os.technicianId,
      },
      timestamp: new Date(),
    });
  }

  async trackRevenueGenerated(payment: Payment) {
    await this.facterCore.analytics.track({
      event: 'revenue_generated',
      customerId: payment.company.facterCustomerId,
      subscriptionId: payment.company.facterSubscriptionId,
      properties: {
        paymentId: payment.id,
        amount: payment.amount,
        method: payment.method,
        source: 'service_order',
      },
    });
  }
}
```

---

## Webhooks Recebidos

O Core envia webhooks para o produto quando eventos relevantes ocorrem.

### Configuração

No registro do produto no Core:

```json
{
  "productKey": "techcare",
  "webhookUrl": "https://api.techcare.app/webhooks/facter",
  "webhookSecret": "whsec_abc123...",
  "subscribedEvents": [
    "subscription.created",
    "subscription.updated",
    "subscription.cancelled",
    "payment.succeeded",
    "payment.failed",
    "feature.toggled"
  ]
}
```

### Controller de Webhooks

```typescript
// controllers/facter-webhook.controller.ts
@Controller('webhooks/facter')
export class FacterWebhookController {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly companyService: CompanyService,
    private readonly featureService: FeatureService,
  ) {}

  @Post()
  async handleWebhook(
    @Headers('x-facter-signature') signature: string,
    @Body() payload: any,
    @Req() req: Request,
  ) {
    // Validar assinatura
    const isValid = this.verifySignature(
      req.rawBody,
      signature,
      process.env.FACTER_WEBHOOK_SECRET,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    // Processar por tipo de evento
    switch (payload.type) {
      case 'subscription.created':
        await this.handleSubscriptionCreated(payload.data);
        break;

      case 'subscription.updated':
        await this.handleSubscriptionUpdated(payload.data);
        break;

      case 'subscription.cancelled':
        await this.handleSubscriptionCancelled(payload.data);
        break;

      case 'payment.succeeded':
        await this.handlePaymentSucceeded(payload.data);
        break;

      case 'payment.failed':
        await this.handlePaymentFailed(payload.data);
        break;

      case 'feature.toggled':
        await this.handleFeatureToggled(payload.data);
        break;

      default:
        console.log(`Unhandled event type: ${payload.type}`);
    }

    return { received: true };
  }

  private async handleSubscriptionUpdated(data: SubscriptionUpdatedEvent) {
    const company = await this.companyService.findByFacterSubscription(
      data.subscriptionId
    );

    if (!company) {
      console.error(`Company not found for subscription ${data.subscriptionId}`);
      return;
    }

    // Atualizar plano local
    await this.companyService.update(company.id, {
      currentPlan: data.newPlan,
      subscriptionStatus: data.status,
    });

    // Invalidar cache de features
    await this.featureService.invalidateCache(company.id);
  }

  private async handlePaymentFailed(data: PaymentFailedEvent) {
    const company = await this.companyService.findByFacterSubscription(
      data.subscriptionId
    );

    if (!company) return;

    // Notificar admins da empresa
    await this.notificationService.notifyPaymentFailed(company, data);

    // Marcar empresa com problema de pagamento
    await this.companyService.update(company.id, {
      paymentStatus: 'FAILED',
      lastPaymentError: data.error,
    });
  }

  private async handleFeatureToggled(data: FeatureToggledEvent) {
    const company = await this.companyService.findByFacterSubscription(
      data.subscriptionId
    );

    if (!company) return;

    // Invalidar cache de features
    await this.featureService.invalidateCache(company.id);

    // Log para auditoria
    await this.auditService.log({
      companyId: company.id,
      action: 'FEATURE_TOGGLED',
      details: {
        feature: data.featureKey,
        enabled: data.enabled,
        source: 'facter_core',
      },
    });
  }

  private verifySignature(
    payload: string,
    signature: string,
    secret: string,
  ): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(`sha256=${expectedSignature}`),
    );
  }
}
```

---

## Eventos por Tipo

### subscription.created

```json
{
  "type": "subscription.created",
  "data": {
    "subscriptionId": "sub_123",
    "customerId": "cust_456",
    "productKey": "techcare",
    "externalId": "company_789",
    "plan": "professional",
    "status": "TRIALING",
    "trialEndsAt": "2024-02-15T00:00:00Z"
  }
}
```

### subscription.updated

```json
{
  "type": "subscription.updated",
  "data": {
    "subscriptionId": "sub_123",
    "previousPlan": "starter",
    "newPlan": "professional",
    "status": "ACTIVE",
    "effectiveAt": "2024-02-01T00:00:00Z"
  }
}
```

### payment.failed

```json
{
  "type": "payment.failed",
  "data": {
    "subscriptionId": "sub_123",
    "customerId": "cust_456",
    "invoiceId": "inv_789",
    "amount": 199.90,
    "currency": "BRL",
    "error": "card_declined",
    "nextRetryAt": "2024-02-05T00:00:00Z"
  }
}
```

### feature.toggled

```json
{
  "type": "feature.toggled",
  "data": {
    "subscriptionId": "sub_123",
    "featureKey": "whatsapp_notifications",
    "enabled": true,
    "reason": "Manual override by admin",
    "appliedBy": "admin@facter.app",
    "expiresAt": null
  }
}
```

---

## Cache e Performance

### Estratégia de Cache

```typescript
// services/feature-cache.service.ts
@Injectable()
export class FeatureCacheService {
  private readonly cache = new Map<string, CachedFeatures>();
  private readonly TTL = 5 * 60 * 1000; // 5 minutos

  constructor(private readonly facterCore: FacterCoreClient) {}

  async getFeatures(subscriptionId: string): Promise<FeatureMap> {
    const cached = this.cache.get(subscriptionId);

    if (cached && Date.now() < cached.expiresAt) {
      return cached.features;
    }

    // Buscar do Core
    const features = await this.facterCore.features.list(subscriptionId);

    // Cachear
    this.cache.set(subscriptionId, {
      features,
      expiresAt: Date.now() + this.TTL,
    });

    return features;
  }

  async isEnabled(subscriptionId: string, featureKey: string): Promise<boolean> {
    const features = await this.getFeatures(subscriptionId);
    return features[featureKey]?.enabled ?? false;
  }

  invalidate(subscriptionId: string): void {
    this.cache.delete(subscriptionId);
  }

  invalidateAll(): void {
    this.cache.clear();
  }
}
```

### Fallback quando Core indisponível

```typescript
// services/facter-core.service.ts
@Injectable()
export class FacterCoreService {
  private readonly fallbackFeatures: FeatureMap;

  constructor(
    private readonly client: FacterCoreClient,
    private readonly cache: FeatureCacheService,
  ) {
    // Features padrão quando Core está fora
    this.fallbackFeatures = {
      basic_reports: { enabled: true },
      service_orders: { enabled: true },
      inventory: { enabled: true },
      // Features premium desabilitadas por segurança
      whatsapp_notifications: { enabled: false },
      fiscal_integration: { enabled: false },
    };
  }

  async isFeatureEnabled(
    subscriptionId: string,
    featureKey: string,
  ): Promise<boolean> {
    try {
      return await this.cache.isEnabled(subscriptionId, featureKey);
    } catch (error) {
      console.error('Core unavailable, using fallback features');

      // Usar cache expirado se disponível
      const staleCache = this.cache.getStale(subscriptionId);
      if (staleCache) {
        return staleCache[featureKey]?.enabled ?? false;
      }

      // Fallback final
      return this.fallbackFeatures[featureKey]?.enabled ?? false;
    }
  }
}
```

---

## Variáveis de Ambiente

```env
# Facter Core Integration
FACTER_CORE_URL=https://api.facter.app
FACTER_CORE_API_KEY=pk_live_abc123...
FACTER_PRODUCT_KEY=techcare
FACTER_WEBHOOK_SECRET=whsec_xyz789...

# Cache
FACTER_CACHE_TTL=300000  # 5 minutos em ms

# Fallback
FACTER_ENABLE_FALLBACK=true
```

---

## Checklist de Integração

- [ ] Registrar produto no Facter Core
- [ ] Configurar variáveis de ambiente
- [ ] Implementar `FacterAuthGuard`
- [ ] Implementar `FeatureGuard`
- [ ] Configurar endpoint de webhooks
- [ ] Implementar handlers para cada evento
- [ ] Configurar cache de features
- [ ] Implementar fallback para indisponibilidade
- [ ] Testar fluxo de onboarding
- [ ] Testar fluxo de autenticação
- [ ] Testar webhooks com ngrok local
- [ ] Configurar monitoramento de erros

---

**Próximo**: [SDK](../sdk/README.md)
