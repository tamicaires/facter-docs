# Feature Flags

> **Sistema centralizado para controle de funcionalidades.**

---

## Conceito

Feature Flags (ou Feature Toggles) permitem:
- **Habilitar/desabilitar** funcionalidades sem deploy
- **Controle por plano** - features diferentes por assinatura
- **Controle por empresa** - features específicas para clientes
- **Rollout gradual** - liberar para X% dos usuários
- **Centralização** - um único lugar para gerenciar tudo

---

## Diferença: Feature Flags vs Abilities

| Aspecto | Feature Flags | Abilities |
|---------|---------------|-----------|
| Controla | **O que existe** no sistema | **Quem pode fazer** |
| Granularidade | Módulo/Feature | Ação específica |
| Quem define | Plataforma/Admin | Role do usuário |
| Exemplo | "Tem módulo de agenda?" | "Pode criar agendamento?" |

**Funcionam juntos:**
1. Feature Flag verifica se a feature **existe** para aquela empresa
2. Ability verifica se o usuário **pode usar** aquela feature

---

## Estrutura

```typescript
// Definição centralizada de todas as features
export const FEATURES = {
  // === Módulos principais ===
  SERVICE_ORDERS: {
    key: 'service_orders',
    name: 'Ordens de Serviço',
    description: 'Gerenciamento de OS',
    defaultEnabled: true,
    plans: ['FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE'],
  },

  QUOTES: {
    key: 'quotes',
    name: 'Orçamentos',
    description: 'Geração e aprovação de orçamentos',
    defaultEnabled: true,
    plans: ['FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE'],
  },

  INVENTORY: {
    key: 'inventory',
    name: 'Estoque',
    description: 'Controle de peças e estoque',
    defaultEnabled: true,
    plans: ['STARTER', 'PROFESSIONAL', 'ENTERPRISE'],
  },

  // === Funcionalidades avançadas ===
  APPOINTMENTS: {
    key: 'appointments',
    name: 'Agenda',
    description: 'Agendamento de atendimentos',
    defaultEnabled: false,
    plans: ['PROFESSIONAL', 'ENTERPRISE'],
  },

  TECHNICAL_VISITS: {
    key: 'technical_visits',
    name: 'Visitas Técnicas',
    description: 'Atendimento externo',
    defaultEnabled: false,
    plans: ['PROFESSIONAL', 'ENTERPRISE'],
  },

  MULTI_TECHNICIAN: {
    key: 'multi_technician',
    name: 'Múltiplos Técnicos',
    description: 'Equipe com vários técnicos',
    defaultEnabled: false,
    plans: ['PROFESSIONAL', 'ENTERPRISE'],
  },

  COMMISSIONS: {
    key: 'commissions',
    name: 'Comissões',
    description: 'Cálculo de comissão de técnicos',
    defaultEnabled: false,
    plans: ['PROFESSIONAL', 'ENTERPRISE'],
  },

  // === Integrações ===
  WHATSAPP_INTEGRATION: {
    key: 'whatsapp_integration',
    name: 'Integração WhatsApp',
    description: 'Notificações via WhatsApp Business',
    defaultEnabled: false,
    plans: ['STARTER', 'PROFESSIONAL', 'ENTERPRISE'],
  },

  NFE_INTEGRATION: {
    key: 'nfe_integration',
    name: 'Emissão de NF-e',
    description: 'Integração com nota fiscal',
    defaultEnabled: false,
    plans: ['PROFESSIONAL', 'ENTERPRISE'],
  },

  PIX_INTEGRATION: {
    key: 'pix_integration',
    name: 'PIX Integrado',
    description: 'Geração de QR Code PIX',
    defaultEnabled: false,
    plans: ['STARTER', 'PROFESSIONAL', 'ENTERPRISE'],
  },

  // === Relatórios ===
  ADVANCED_REPORTS: {
    key: 'advanced_reports',
    name: 'Relatórios Avançados',
    description: 'Relatórios detalhados e exportação',
    defaultEnabled: false,
    plans: ['PROFESSIONAL', 'ENTERPRISE'],
  },

  DASHBOARD_ANALYTICS: {
    key: 'dashboard_analytics',
    name: 'Dashboard Analytics',
    description: 'Métricas e gráficos avançados',
    defaultEnabled: false,
    plans: ['PROFESSIONAL', 'ENTERPRISE'],
  },

  // === Recursos Premium ===
  API_ACCESS: {
    key: 'api_access',
    name: 'Acesso à API',
    description: 'API pública para integrações',
    defaultEnabled: false,
    plans: ['ENTERPRISE'],
  },

  WEBHOOKS: {
    key: 'webhooks',
    name: 'Webhooks',
    description: 'Notificações para sistemas externos',
    defaultEnabled: false,
    plans: ['ENTERPRISE'],
  },

  WHITE_LABEL: {
    key: 'white_label',
    name: 'White Label',
    description: 'Personalização de marca',
    defaultEnabled: false,
    plans: ['ENTERPRISE'],
  },

  CUSTOM_FIELDS: {
    key: 'custom_fields',
    name: 'Campos Personalizados',
    description: 'Adicionar campos customizados',
    defaultEnabled: false,
    plans: ['PROFESSIONAL', 'ENTERPRISE'],
  },
} as const;

export type FeatureKey = keyof typeof FEATURES;
```

---

## Armazenamento

```prisma
// Features habilitadas por empresa
model CompanyFeature {
  id          String    @id @default(uuid())
  companyId   String
  company     Company   @relation(fields: [companyId], references: [id])

  featureKey  String
  enabled     Boolean   @default(true)

  // Override manual (admin pode liberar feature fora do plano)
  override    Boolean   @default(false)
  overrideBy  String?
  overrideAt  DateTime?
  overrideReason String?

  // Configurações específicas da feature
  config      Json?

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@unique([companyId, featureKey])
}

// Planos e suas features
model Plan {
  id          String    @id @default(uuid())
  key         String    @unique  // 'FREE', 'STARTER', etc
  name        String
  price       Decimal
  features    String[]  // Lista de feature keys

  // Limites
  limits      Json      // { maxUsers: 3, maxOrders: 100 }

  companies   Company[]
}
```

---

## Provider e Hook

### FeatureFlagProvider

```typescript
// context/feature-flags.tsx
import { createContext, useContext, useMemo } from 'react';
import { FEATURES, FeatureKey } from '@/config/features';

interface FeatureFlagContextType {
  features: Record<string, boolean>;
  hasFeature: (key: FeatureKey) => boolean;
  getFeatureConfig: <T>(key: FeatureKey) => T | null;
}

const FeatureFlagContext = createContext<FeatureFlagContextType | null>(null);

export function FeatureFlagProvider({
  children,
  companyFeatures,
  plan,
}: {
  children: React.ReactNode;
  companyFeatures: CompanyFeature[];
  plan: Plan;
}) {
  const features = useMemo(() => {
    const result: Record<string, boolean> = {};

    // Para cada feature definida
    Object.entries(FEATURES).forEach(([key, config]) => {
      // Verificar se está no plano
      const inPlan = config.plans.includes(plan.key);

      // Verificar override da empresa
      const companyOverride = companyFeatures.find(
        f => f.featureKey === config.key
      );

      if (companyOverride) {
        // Override existe - usar valor do override
        result[key] = companyOverride.enabled;
      } else {
        // Sem override - usar plano
        result[key] = inPlan && config.defaultEnabled;
      }
    });

    return result;
  }, [companyFeatures, plan]);

  const hasFeature = (key: FeatureKey): boolean => {
    return features[key] ?? false;
  };

  const getFeatureConfig = <T,>(key: FeatureKey): T | null => {
    const feature = companyFeatures.find(
      f => f.featureKey === FEATURES[key].key
    );
    return feature?.config as T | null;
  };

  return (
    <FeatureFlagContext.Provider
      value={{ features, hasFeature, getFeatureConfig }}
    >
      {children}
    </FeatureFlagContext.Provider>
  );
}

// Hook
export function useFeatureFlags() {
  const context = useContext(FeatureFlagContext);
  if (!context) {
    throw new Error('useFeatureFlags must be used within FeatureFlagProvider');
  }
  return context;
}

// Hook específico para uma feature
export function useFeature(key: FeatureKey) {
  const { hasFeature, getFeatureConfig } = useFeatureFlags();
  return {
    enabled: hasFeature(key),
    config: getFeatureConfig(key),
  };
}
```

---

## Componentes de UI

### Feature Gate

```tsx
// components/feature-gate.tsx
interface FeatureGateProps {
  feature: FeatureKey;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function FeatureGate({
  feature,
  children,
  fallback = null,
}: FeatureGateProps) {
  const { hasFeature } = useFeatureFlags();

  if (!hasFeature(feature)) {
    return fallback;
  }

  return children;
}

// Uso
<FeatureGate feature="APPOINTMENTS">
  <AgendaModule />
</FeatureGate>

<FeatureGate
  feature="WHATSAPP_INTEGRATION"
  fallback={<UpgradePrompt feature="WHATSAPP_INTEGRATION" />}
>
  <WhatsAppSettings />
</FeatureGate>
```

### Feature + Ability combinados

```tsx
// Combinar Feature Flag + Ability
interface ProtectedFeatureProps {
  feature: FeatureKey;
  action?: string;
  subject?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProtectedFeature({
  feature,
  action,
  subject,
  children,
  fallback,
}: ProtectedFeatureProps) {
  const { hasFeature } = useFeatureFlags();
  const { can } = usePermissions();

  // Primeiro verifica se a feature existe
  if (!hasFeature(feature)) {
    return fallback ?? <UpgradePrompt feature={feature} />;
  }

  // Depois verifica se o usuário tem permissão
  if (action && subject && !can(action, subject)) {
    return fallback ?? null;
  }

  return children;
}

// Uso
<ProtectedFeature
  feature="APPOINTMENTS"
  action="create"
  subject="Appointment"
>
  <Button>Novo Agendamento</Button>
</ProtectedFeature>
```

### Upgrade Prompt

```tsx
// Mostrar quando feature não está no plano
function UpgradePrompt({ feature }: { feature: FeatureKey }) {
  const featureConfig = FEATURES[feature];
  const minPlan = featureConfig.plans[0];

  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center py-8 text-center">
        <Lock className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="font-semibold mb-2">{featureConfig.name}</h3>
        <p className="text-muted-foreground mb-4">
          {featureConfig.description}
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          Disponível a partir do plano <strong>{minPlan}</strong>
        </p>
        <Button asChild>
          <Link href="/settings/billing">
            Fazer Upgrade
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
```

---

## Uso no Menu/Navegação

```tsx
// Sidebar com feature flags
const MENU_ITEMS = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Ordens de Serviço',
    href: '/service-orders',
    icon: ClipboardList,
    feature: 'SERVICE_ORDERS',
  },
  {
    label: 'Clientes',
    href: '/customers',
    icon: Users,
  },
  {
    label: 'Estoque',
    href: '/inventory',
    icon: Package,
    feature: 'INVENTORY',
  },
  {
    label: 'Agenda',
    href: '/appointments',
    icon: Calendar,
    feature: 'APPOINTMENTS',
  },
  {
    label: 'Relatórios',
    href: '/reports',
    icon: BarChart,
    feature: 'ADVANCED_REPORTS',
  },
];

function Sidebar() {
  const { hasFeature } = useFeatureFlags();

  const visibleItems = MENU_ITEMS.filter(item => {
    // Se não tem feature flag, sempre mostra
    if (!item.feature) return true;
    // Se tem, verifica se está habilitada
    return hasFeature(item.feature as FeatureKey);
  });

  return (
    <nav>
      {visibleItems.map(item => (
        <SidebarItem key={item.href} {...item} />
      ))}
    </nav>
  );
}
```

---

## Backend

### Middleware de Feature

```typescript
// middleware/feature-flag.middleware.ts
import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { FEATURES, FeatureKey } from '@/config/features';

@Injectable()
export class FeatureFlagMiddleware implements NestMiddleware {
  constructor(private readonly featureService: FeatureService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Adicionar helper ao request
    req.hasFeature = async (key: FeatureKey): Promise<boolean> => {
      const companyId = req.user?.companyId;
      if (!companyId) return false;

      return this.featureService.hasFeature(companyId, key);
    };

    next();
  }
}
```

### Guard de Feature

```typescript
// guards/feature.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const RequireFeature = (feature: FeatureKey) =>
  SetMetadata('feature', feature);

@Injectable()
export class FeatureGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private featureService: FeatureService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const feature = this.reflector.get<FeatureKey>('feature', context.getHandler());

    if (!feature) return true;

    const request = context.switchToHttp().getRequest();
    const companyId = request.user?.companyId;

    const hasFeature = await this.featureService.hasFeature(companyId, feature);

    if (!hasFeature) {
      throw new PaymentRequiredException(
        `Esta funcionalidade requer upgrade do plano`,
        { feature: FEATURES[feature].name }
      );
    }

    return true;
  }
}
```

### Uso em Controllers

```typescript
@Controller('appointments')
@RequireFeature('APPOINTMENTS')  // Toda a rota requer a feature
export class AppointmentsController {
  @Get()
  @RequirePermissions({ action: 'read', subject: 'Appointment' })
  findAll() {
    // ...
  }

  @Post()
  @RequireFeature('TECHNICAL_VISITS')  // Endpoint específico requer outra feature
  @RequirePermissions({ action: 'create', subject: 'Appointment' })
  createTechnicalVisit() {
    // ...
  }
}
```

### Service de Features

```typescript
// services/feature.service.ts
@Injectable()
export class FeatureService {
  constructor(private prisma: PrismaService) {}

  async hasFeature(companyId: string, featureKey: FeatureKey): Promise<boolean> {
    // Buscar empresa com plano e features
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      include: {
        plan: true,
        features: true,
      },
    });

    if (!company) return false;

    const featureConfig = FEATURES[featureKey];

    // Verificar override
    const override = company.features.find(
      f => f.featureKey === featureConfig.key
    );

    if (override) {
      return override.enabled;
    }

    // Verificar plano
    return featureConfig.plans.includes(company.plan.key);
  }

  async setFeature(
    companyId: string,
    featureKey: FeatureKey,
    enabled: boolean,
    adminId: string,
    reason?: string,
  ): Promise<void> {
    await this.prisma.companyFeature.upsert({
      where: {
        companyId_featureKey: {
          companyId,
          featureKey: FEATURES[featureKey].key,
        },
      },
      update: {
        enabled,
        override: true,
        overrideBy: adminId,
        overrideAt: new Date(),
        overrideReason: reason,
      },
      create: {
        companyId,
        featureKey: FEATURES[featureKey].key,
        enabled,
        override: true,
        overrideBy: adminId,
        overrideAt: new Date(),
        overrideReason: reason,
      },
    });
  }

  async getCompanyFeatures(companyId: string): Promise<FeatureStatus[]> {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      include: { plan: true, features: true },
    });

    return Object.entries(FEATURES).map(([key, config]) => {
      const override = company.features.find(
        f => f.featureKey === config.key
      );

      const inPlan = config.plans.includes(company.plan.key);
      const enabled = override ? override.enabled : inPlan;

      return {
        key,
        name: config.name,
        description: config.description,
        enabled,
        inPlan,
        hasOverride: !!override,
        minPlan: config.plans[0],
      };
    });
  }
}
```

---

## Admin Panel

```tsx
// Tela para admin gerenciar features de uma empresa
function CompanyFeaturesAdmin({ companyId }: { companyId: string }) {
  const { data: features } = useCompanyFeatures(companyId);
  const toggleFeature = useToggleFeature();

  return (
    <div className="space-y-4">
      {features?.map(feature => (
        <div
          key={feature.key}
          className="flex items-center justify-between p-4 border rounded"
        >
          <div>
            <h4 className="font-medium">{feature.name}</h4>
            <p className="text-sm text-muted-foreground">
              {feature.description}
            </p>
            {!feature.inPlan && (
              <Badge variant="outline" className="mt-1">
                Requer plano {feature.minPlan}
              </Badge>
            )}
            {feature.hasOverride && (
              <Badge variant="secondary" className="mt-1 ml-2">
                Override ativo
              </Badge>
            )}
          </div>

          <Switch
            checked={feature.enabled}
            onCheckedChange={(enabled) =>
              toggleFeature.mutate({ companyId, featureKey: feature.key, enabled })
            }
          />
        </div>
      ))}
    </div>
  );
}
```

---

## Planos e Limites

```typescript
// Configuração de planos
export const PLANS = {
  FREE: {
    key: 'FREE',
    name: 'Gratuito',
    price: 0,
    limits: {
      maxUsers: 1,
      maxOrdersPerMonth: 30,
      maxCustomers: 100,
      maxParts: 50,
      storageGB: 1,
    },
  },

  STARTER: {
    key: 'STARTER',
    name: 'Inicial',
    price: 49.90,
    limits: {
      maxUsers: 3,
      maxOrdersPerMonth: 200,
      maxCustomers: 500,
      maxParts: 200,
      storageGB: 5,
    },
  },

  PROFESSIONAL: {
    key: 'PROFESSIONAL',
    name: 'Profissional',
    price: 99.90,
    limits: {
      maxUsers: 10,
      maxOrdersPerMonth: null, // Ilimitado
      maxCustomers: null,
      maxParts: null,
      storageGB: 20,
    },
  },

  ENTERPRISE: {
    key: 'ENTERPRISE',
    name: 'Empresarial',
    price: null, // Sob consulta
    limits: {
      maxUsers: null,
      maxOrdersPerMonth: null,
      maxCustomers: null,
      maxParts: null,
      storageGB: null,
    },
  },
};
```

---

## Resumo: Feature Flag vs Ability

```tsx
// Exemplo completo combinando os dois
function ServiceOrderActions({ order }) {
  return (
    <>
      {/* Feature: existe a funcionalidade de orçamento? */}
      <FeatureGate feature="QUOTES">
        {/* Ability: o usuário pode criar orçamento? */}
        <Can action="create" subject="Quote">
          <Button onClick={() => createQuote(order.id)}>
            Criar Orçamento
          </Button>
        </Can>
      </FeatureGate>

      {/* Feature: existe integração WhatsApp? */}
      <FeatureGate feature="WHATSAPP_INTEGRATION">
        {/* Ability: o usuário pode notificar cliente? */}
        <Can action="notify" subject="Customer">
          <Button onClick={() => sendWhatsApp(order.customerId)}>
            Enviar WhatsApp
          </Button>
        </Can>
      </FeatureGate>
    </>
  );
}
```

---

**Voltar para** [Regras de Negócio](./README.md)
