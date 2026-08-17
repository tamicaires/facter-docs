# Feature (Feature Flags)

> **Entidade que gerencia as feature flags do sistema, permitindo controle granular de funcionalidades por plano e por empresa.**

---

## Schema Prisma

```prisma
// Definição das features disponíveis na plataforma
model Feature {
  id              String          @id @default(uuid())

  // Identificação
  key             String          @unique  // 'appointments', 'whatsapp', etc
  name            String                   // 'Agenda', 'WhatsApp', etc
  description     String?

  // Categorização
  category        FeatureCategory

  // Configuração padrão
  enabledByDefault Boolean        @default(false)

  // Planos que têm acesso (se vazio, disponível para todos)
  plans           Plan[]          @relation("PlanFeatures")

  // Dependências (features que precisam estar ativas)
  dependsOn       Feature[]       @relation("FeatureDependencies")
  dependedBy      Feature[]       @relation("FeatureDependencies")

  // Overrides por empresa
  companyOverrides CompanyFeature[]

  // Beta/Experimental
  isBeta          Boolean         @default(false)
  isExperimental  Boolean         @default(false)

  // Datas
  releasedAt      DateTime?
  deprecatedAt    DateTime?

  // Metadados
  metadata        Json?           // Configs extras, limites, etc

  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  @@index([key])
  @@index([category])
}

// Override de feature por empresa
model CompanyFeature {
  id              String          @id @default(uuid())

  companyId       String
  company         Company         @relation(fields: [companyId], references: [id])

  featureId       String
  feature         Feature         @relation(fields: [featureId], references: [id])

  // Override: true = forçar ativo, false = forçar inativo, null = usar padrão do plano
  enabled         Boolean?

  // Motivo do override
  reason          String?

  // Quem aplicou
  appliedById     String?
  appliedBy       User?           @relation(fields: [appliedById], references: [id])
  appliedAt       DateTime        @default(now())

  // Expiração do override (para trials, promoções)
  expiresAt       DateTime?

  // Configurações específicas da feature para esta empresa
  config          Json?

  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  @@unique([companyId, featureId])
  @@index([companyId])
  @@index([featureId])
  @@index([expiresAt])
}

// Planos da plataforma
model Plan {
  id              String          @id @default(uuid())

  // Identificação
  name            String          @unique  // 'FREE', 'STARTER', etc
  displayName     String                   // 'Gratuito', 'Inicial', etc
  description     String?

  // Preço
  price           Decimal         @db.Decimal(10, 2)
  billingPeriod   BillingPeriod   @default(MONTHLY)

  // Features incluídas
  features        Feature[]       @relation("PlanFeatures")

  // Limites
  limits          Json?           // PlanLimits

  // Configurações
  trialDays       Int             @default(0)
  isPublic        Boolean         @default(true)  // Visível na página de preços
  isDefault       Boolean         @default(false) // Plano padrão para novos

  // Ordem de exibição
  sortOrder       Int             @default(0)

  // Empresas neste plano
  companies       Company[]

  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  @@index([name])
  @@index([isPublic, sortOrder])
}

enum FeatureCategory {
  CORE            // Funcionalidades básicas
  COMMUNICATION   // Notificações, WhatsApp, etc
  INVENTORY       // Estoque avançado
  FINANCIAL       // Financeiro avançado
  REPORTS         // Relatórios
  INTEGRATIONS    // Integrações externas
  AUTOMATION      // Automações
  ADVANCED        // Recursos avançados
}

enum BillingPeriod {
  MONTHLY
  YEARLY
}
```

---

## Lógica de Resolução

```typescript
// services/feature.service.ts

interface FeatureState {
  enabled: boolean;
  source: 'plan' | 'override' | 'default' | 'dependency';
  expiresAt?: Date;
  config?: Record<string, any>;
}

class FeatureService {
  // Cache em memória (invalidado por webhook/evento)
  private cache = new Map<string, Map<string, FeatureState>>();

  /**
   * Verifica se uma feature está habilitada para uma empresa
   */
  async isEnabled(companyId: string, featureKey: string): Promise<boolean> {
    const state = await this.getFeatureState(companyId, featureKey);
    return state.enabled;
  }

  /**
   * Retorna o estado completo de uma feature
   */
  async getFeatureState(companyId: string, featureKey: string): Promise<FeatureState> {
    // Verificar cache
    const cached = this.cache.get(companyId)?.get(featureKey);
    if (cached) return cached;

    const feature = await prisma.feature.findUnique({
      where: { key: featureKey },
      include: {
        plans: true,
        dependsOn: true,
        companyOverrides: {
          where: { companyId },
        },
      },
    });

    if (!feature) {
      return { enabled: false, source: 'default' };
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: { plan: true },
    });

    // 1. Verificar override da empresa
    const override = feature.companyOverrides[0];
    if (override && override.enabled !== null) {
      // Verificar expiração
      if (override.expiresAt && override.expiresAt < new Date()) {
        // Override expirado, remover
        await prisma.companyFeature.delete({ where: { id: override.id } });
      } else {
        const state: FeatureState = {
          enabled: override.enabled,
          source: 'override',
          expiresAt: override.expiresAt ?? undefined,
          config: override.config as Record<string, any>,
        };
        this.setCache(companyId, featureKey, state);
        return state;
      }
    }

    // 2. Verificar se o plano inclui a feature
    const planHasFeature = feature.plans.some(p => p.id === company?.plan?.id);
    if (planHasFeature) {
      const state: FeatureState = { enabled: true, source: 'plan' };
      this.setCache(companyId, featureKey, state);
      return state;
    }

    // 3. Verificar dependências (se feature X depende de Y, e Y está inativo)
    for (const dep of feature.dependsOn) {
      const depState = await this.getFeatureState(companyId, dep.key);
      if (!depState.enabled) {
        const state: FeatureState = { enabled: false, source: 'dependency' };
        this.setCache(companyId, featureKey, state);
        return state;
      }
    }

    // 4. Usar valor padrão
    const state: FeatureState = {
      enabled: feature.enabledByDefault,
      source: 'default',
    };
    this.setCache(companyId, featureKey, state);
    return state;
  }

  /**
   * Retorna todas as features e seus estados para uma empresa
   */
  async getAllFeatures(companyId: string): Promise<Record<string, FeatureState>> {
    const features = await prisma.feature.findMany({
      orderBy: { category: 'asc' },
    });

    const result: Record<string, FeatureState> = {};

    for (const feature of features) {
      result[feature.key] = await this.getFeatureState(companyId, feature.key);
    }

    return result;
  }

  /**
   * Aplica um override de feature para uma empresa
   */
  async setOverride(params: {
    companyId: string;
    featureKey: string;
    enabled: boolean | null;
    reason?: string;
    expiresAt?: Date;
    config?: Record<string, any>;
    appliedById: string;
  }): Promise<void> {
    const feature = await prisma.feature.findUnique({
      where: { key: params.featureKey },
    });

    if (!feature) {
      throw new Error(`Feature ${params.featureKey} não encontrada`);
    }

    await prisma.companyFeature.upsert({
      where: {
        companyId_featureId: {
          companyId: params.companyId,
          featureId: feature.id,
        },
      },
      create: {
        companyId: params.companyId,
        featureId: feature.id,
        enabled: params.enabled,
        reason: params.reason,
        expiresAt: params.expiresAt,
        config: params.config,
        appliedById: params.appliedById,
      },
      update: {
        enabled: params.enabled,
        reason: params.reason,
        expiresAt: params.expiresAt,
        config: params.config,
        appliedById: params.appliedById,
        appliedAt: new Date(),
      },
    });

    // Invalidar cache
    this.invalidateCache(params.companyId, params.featureKey);

    // Registrar auditoria
    await audit({
      entityType: 'CompanyFeature',
      entityId: `${params.companyId}:${params.featureKey}`,
      action: 'UPDATE',
      changes: { enabled: { old: null, new: params.enabled } },
      metadata: { reason: params.reason },
    });
  }

  /**
   * Remove override (volta ao padrão do plano)
   */
  async removeOverride(companyId: string, featureKey: string): Promise<void> {
    const feature = await prisma.feature.findUnique({
      where: { key: featureKey },
    });

    if (!feature) return;

    await prisma.companyFeature.deleteMany({
      where: {
        companyId,
        featureId: feature.id,
      },
    });

    this.invalidateCache(companyId, featureKey);
  }

  // Cache helpers
  private setCache(companyId: string, featureKey: string, state: FeatureState) {
    if (!this.cache.has(companyId)) {
      this.cache.set(companyId, new Map());
    }
    this.cache.get(companyId)!.set(featureKey, state);
  }

  private invalidateCache(companyId: string, featureKey?: string) {
    if (featureKey) {
      this.cache.get(companyId)?.delete(featureKey);
    } else {
      this.cache.delete(companyId);
    }
  }
}

export const featureService = new FeatureService();
```

---

## Endpoints da API

### Features (Admin da Plataforma)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/admin/features` | Listar todas features |
| GET | `/admin/features/:key` | Buscar feature |
| POST | `/admin/features` | Criar feature |
| PUT | `/admin/features/:key` | Atualizar feature |
| DELETE | `/admin/features/:key` | Remover feature |

### Overrides por Empresa (Admin da Plataforma)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/admin/companies/:id/features` | Features da empresa |
| PUT | `/admin/companies/:id/features/:key` | Aplicar override |
| DELETE | `/admin/companies/:id/features/:key` | Remover override |

### Features da Empresa Atual

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/features` | Minhas features |
| GET | `/features/:key` | Estado de uma feature |

---

## Seed de Features

```typescript
// prisma/seeds/features.ts

const FEATURES: Prisma.FeatureCreateInput[] = [
  // Core
  {
    key: 'service_orders',
    name: 'Ordens de Serviço',
    category: 'CORE',
    enabledByDefault: true,
  },
  {
    key: 'customers',
    name: 'Clientes',
    category: 'CORE',
    enabledByDefault: true,
  },
  {
    key: 'quotes',
    name: 'Orçamentos',
    category: 'CORE',
    enabledByDefault: true,
  },

  // Communication
  {
    key: 'email_notifications',
    name: 'Notificações por Email',
    category: 'COMMUNICATION',
    enabledByDefault: true,
  },
  {
    key: 'whatsapp_notifications',
    name: 'Notificações por WhatsApp',
    category: 'COMMUNICATION',
    enabledByDefault: false,
  },
  {
    key: 'sms_notifications',
    name: 'Notificações por SMS',
    category: 'COMMUNICATION',
    enabledByDefault: false,
  },

  // Inventory
  {
    key: 'inventory',
    name: 'Controle de Estoque',
    category: 'INVENTORY',
    enabledByDefault: false,
  },
  {
    key: 'suppliers',
    name: 'Fornecedores',
    category: 'INVENTORY',
    enabledByDefault: false,
  },
  {
    key: 'purchase_orders',
    name: 'Pedidos de Compra',
    category: 'INVENTORY',
    enabledByDefault: false,
  },

  // Financial
  {
    key: 'commissions',
    name: 'Comissões',
    category: 'FINANCIAL',
    enabledByDefault: false,
  },
  {
    key: 'financial_reports',
    name: 'Relatórios Financeiros',
    category: 'FINANCIAL',
    enabledByDefault: false,
  },

  // Advanced
  {
    key: 'appointments',
    name: 'Agenda',
    category: 'ADVANCED',
    enabledByDefault: false,
  },
  {
    key: 'technical_visits',
    name: 'Visitas Técnicas',
    category: 'ADVANCED',
    enabledByDefault: false,
  },
  {
    key: 'multi_user',
    name: 'Múltiplos Usuários',
    category: 'ADVANCED',
    enabledByDefault: false,
  },
  {
    key: 'api_access',
    name: 'Acesso à API',
    category: 'INTEGRATIONS',
    enabledByDefault: false,
  },
  {
    key: 'webhooks',
    name: 'Webhooks',
    category: 'INTEGRATIONS',
    enabledByDefault: false,
  },
  {
    key: 'nfe',
    name: 'Emissão de NF-e',
    category: 'INTEGRATIONS',
    enabledByDefault: false,
  },
];

const PLANS: Prisma.PlanCreateInput[] = [
  {
    name: 'FREE',
    displayName: 'Gratuito',
    description: 'Para começar',
    price: 0,
    isDefault: true,
    sortOrder: 0,
    limits: {
      maxUsers: 1,
      maxServiceOrders: 50,
      maxCustomers: 100,
    },
  },
  {
    name: 'STARTER',
    displayName: 'Inicial',
    description: 'Para pequenas assistências',
    price: 49.90,
    trialDays: 14,
    sortOrder: 1,
    limits: {
      maxUsers: 3,
      maxServiceOrders: 500,
      maxCustomers: 1000,
    },
  },
  {
    name: 'PROFESSIONAL',
    displayName: 'Profissional',
    description: 'Para assistências em crescimento',
    price: 99.90,
    trialDays: 14,
    sortOrder: 2,
    limits: {
      maxUsers: 10,
      maxServiceOrders: -1, // ilimitado
      maxCustomers: -1,
    },
  },
  {
    name: 'ENTERPRISE',
    displayName: 'Empresarial',
    description: 'Para grandes operações',
    price: 249.90,
    trialDays: 14,
    sortOrder: 3,
    limits: {
      maxUsers: -1,
      maxServiceOrders: -1,
      maxCustomers: -1,
    },
  },
];

// Features por plano
const PLAN_FEATURES: Record<string, string[]> = {
  FREE: [
    'service_orders',
    'customers',
    'quotes',
    'email_notifications',
  ],
  STARTER: [
    'service_orders',
    'customers',
    'quotes',
    'email_notifications',
    'whatsapp_notifications',
    'inventory',
    'multi_user',
  ],
  PROFESSIONAL: [
    'service_orders',
    'customers',
    'quotes',
    'email_notifications',
    'whatsapp_notifications',
    'sms_notifications',
    'inventory',
    'suppliers',
    'purchase_orders',
    'commissions',
    'financial_reports',
    'appointments',
    'technical_visits',
    'multi_user',
    'api_access',
  ],
  ENTERPRISE: [
    // Todas as features
    ...Object.keys(FEATURES.map(f => f.key)),
  ],
};

async function seedFeatures() {
  // Criar features
  for (const feature of FEATURES) {
    await prisma.feature.upsert({
      where: { key: feature.key },
      create: feature,
      update: feature,
    });
  }

  // Criar planos
  for (const plan of PLANS) {
    await prisma.plan.upsert({
      where: { name: plan.name },
      create: plan,
      update: plan,
    });
  }

  // Associar features aos planos
  for (const [planName, featureKeys] of Object.entries(PLAN_FEATURES)) {
    const plan = await prisma.plan.findUnique({ where: { name: planName } });
    if (!plan) continue;

    for (const key of featureKeys) {
      const feature = await prisma.feature.findUnique({ where: { key } });
      if (!feature) continue;

      await prisma.plan.update({
        where: { id: plan.id },
        data: {
          features: {
            connect: { id: feature.id },
          },
        },
      });
    }
  }
}
```

---

## Hook no Frontend

```typescript
// hooks/useFeatures.ts
import { useQuery } from '@tanstack/react-query';
import { createContext, useContext } from 'react';

interface FeaturesContextValue {
  features: Record<string, FeatureState>;
  isEnabled: (key: string) => boolean;
  isLoading: boolean;
}

const FeaturesContext = createContext<FeaturesContextValue | null>(null);

export function FeaturesProvider({ children }: { children: React.ReactNode }) {
  const { data: features, isLoading } = useQuery({
    queryKey: ['features'],
    queryFn: () => api.get<Record<string, FeatureState>>('/features'),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const isEnabled = (key: string) => {
    return features?.[key]?.enabled ?? false;
  };

  return (
    <FeaturesContext.Provider value={{ features: features ?? {}, isEnabled, isLoading }}>
      {children}
    </FeaturesContext.Provider>
  );
}

export function useFeatures() {
  const context = useContext(FeaturesContext);
  if (!context) {
    throw new Error('useFeatures must be used within FeaturesProvider');
  }
  return context;
}

export function useFeature(key: string) {
  const { features, isEnabled } = useFeatures();
  return {
    enabled: isEnabled(key),
    state: features[key],
  };
}
```

---

## Componente FeatureGate

```tsx
// components/FeatureGate.tsx
interface FeatureGateProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function FeatureGate({ feature, children, fallback = null }: FeatureGateProps) {
  const { enabled } = useFeature(feature);

  if (!enabled) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Uso
function Sidebar() {
  return (
    <nav>
      <NavItem to="/os" icon={FileText}>Ordens de Serviço</NavItem>
      <NavItem to="/customers" icon={Users}>Clientes</NavItem>

      <FeatureGate feature="inventory">
        <NavItem to="/stock" icon={Package}>Estoque</NavItem>
      </FeatureGate>

      <FeatureGate feature="appointments">
        <NavItem to="/appointments" icon={Calendar}>Agenda</NavItem>
      </FeatureGate>

      <FeatureGate feature="commissions">
        <NavItem to="/commissions" icon={DollarSign}>Comissões</NavItem>
      </FeatureGate>

      <FeatureGate
        feature="financial_reports"
        fallback={
          <UpgradePrompt
            title="Relatórios Financeiros"
            plan="PROFESSIONAL"
          />
        }
      >
        <NavItem to="/reports/financial" icon={BarChart}>
          Relatórios Financeiros
        </NavItem>
      </FeatureGate>
    </nav>
  );
}
```

---

## Relacionamento com Company

```prisma
model Company {
  id              String          @id @default(uuid())
  // ... outros campos

  // Plano
  planId          String
  plan            Plan            @relation(fields: [planId], references: [id])

  // Overrides de features
  featureOverrides CompanyFeature[]

  // ...
}
```

---

## Regras de Negócio

### Hierarquia de Resolução
1. **Override da empresa** (mais específico)
2. **Features do plano**
3. **Valor padrão da feature**

### Overrides
- Admin da plataforma pode aplicar overrides
- Overrides podem ter data de expiração (trials, promoções)
- Motivo do override é obrigatório para auditoria

### Dependências
- Features podem depender de outras
- Se dependência estiver inativa, feature fica inativa
- Exemplo: `technical_visits` depende de `appointments`

### Cache
- Features são cacheadas em memória
- Cache invalidado ao alterar override
- TTL de 5 minutos no frontend

### Planos
- Cada plano define quais features inclui
- Upgrade de plano libera features automaticamente
- Downgrade mantém dados mas esconde funcionalidades

---

**Voltar para** [Entidades](./README.md)
