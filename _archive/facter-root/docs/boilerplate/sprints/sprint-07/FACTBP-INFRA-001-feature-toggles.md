# [FACTBP-INFRA-001] Feature Toggles

> Sistema de feature flags para módulos opcionais.

---

## Status: ⏳ Pendente

## Contexto

**Feature Toggles:**
- Habilita/desabilita funcionalidades via env vars
- Permite customizar boilerplate por projeto
- Funciona em build time (env vars)

**Features Planejadas:**
- Core (sempre habilitado): auth, multiTenant
- Opcional: rbac, notifications, auditLog, globalSearch, fileUpload, webhooks, apiKeys

---

## Tasks

### Task 1.1: Criar Features Config (Frontend)

**Arquivo:** `src/config/features.ts`

**Implementação:**
```typescript
import { z } from 'zod';

const featuresSchema = z.object({
  // Core (sempre habilitado)
  auth: z.boolean().default(true),
  multiTenant: z.boolean().default(true),

  // Opcionais
  rbac: z.boolean().default(false),
  notifications: z.boolean().default(false),
  auditLog: z.boolean().default(false),
  globalSearch: z.boolean().default(false),
  fileUpload: z.boolean().default(false),
  webhooks: z.boolean().default(false),
  apiKeys: z.boolean().default(false),
});

function parseBoolean(value: string | undefined): boolean {
  return value === 'true' || value === '1';
}

export const features = featuresSchema.parse({
  // Core
  auth: true,
  multiTenant: true,

  // Opcionais (via env vars)
  rbac: parseBoolean(process.env.NEXT_PUBLIC_FEATURE_RBAC),
  notifications: parseBoolean(process.env.NEXT_PUBLIC_FEATURE_NOTIFICATIONS),
  auditLog: parseBoolean(process.env.NEXT_PUBLIC_FEATURE_AUDIT),
  globalSearch: parseBoolean(process.env.NEXT_PUBLIC_FEATURE_SEARCH),
  fileUpload: parseBoolean(process.env.NEXT_PUBLIC_FEATURE_UPLOAD),
  webhooks: parseBoolean(process.env.NEXT_PUBLIC_FEATURE_WEBHOOKS),
  apiKeys: parseBoolean(process.env.NEXT_PUBLIC_FEATURE_API_KEYS),
});

export type FeatureKey = keyof typeof features;

// Helper para verificar se feature está habilitada
export function isFeatureEnabled(feature: FeatureKey): boolean {
  return features[feature] ?? false;
}

// Lista de features habilitadas
export function getEnabledFeatures(): FeatureKey[] {
  return (Object.keys(features) as FeatureKey[]).filter(
    (key) => features[key],
  );
}
```

**Commit:** `[FACTBP-WEB] feat(config): add feature toggles configuration`

**Status:** ⏳

---

### Task 1.2: Criar Features Config (Backend)

**Arquivo:** `src/config/features.config.ts`

**Implementação:**
```typescript
import { registerAs } from '@nestjs/config';

export interface FeaturesConfig {
  rbac: boolean;
  notifications: boolean;
  auditLog: boolean;
  webhooks: boolean;
  apiKeys: boolean;
}

export default registerAs('features', (): FeaturesConfig => ({
  rbac: process.env.FEATURE_RBAC === 'true',
  notifications: process.env.FEATURE_NOTIFICATIONS === 'true',
  auditLog: process.env.FEATURE_AUDIT === 'true',
  webhooks: process.env.FEATURE_WEBHOOKS === 'true',
  apiKeys: process.env.FEATURE_API_KEYS === 'true',
}));
```

**Arquivo:** `src/infra/http/guards/feature.guard.ts`

```typescript
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

export const FEATURE_KEY = 'required_feature';
export const RequireFeature = (feature: string) =>
  SetMetadata(FEATURE_KEY, feature);

@Injectable()
export class FeatureGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredFeature = this.reflector.getAllAndOverride<string>(
      FEATURE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredFeature) {
      return true;
    }

    const isEnabled = this.configService.get<boolean>(
      `features.${requiredFeature}`,
    );

    if (!isEnabled) {
      throw new NotFoundException('Resource not found');
    }

    return true;
  }
}
```

**Commit:** `[FACTBP-API] feat(config): add feature toggles configuration`

**Status:** ⏳

---

### Task 1.3: Criar useFeature Hook

**Arquivo:** `src/hooks/use-feature.ts`

**Implementação:**
```typescript
import { features, type FeatureKey } from '@/config/features';

/**
 * Hook para verificar se uma feature está habilitada
 *
 * @example
 * const isRbacEnabled = useFeature('rbac');
 * if (isRbacEnabled) {
 *   // Mostrar UI de RBAC
 * }
 */
export function useFeature(feature: FeatureKey): boolean {
  return features[feature] ?? false;
}

/**
 * Hook para verificar múltiplas features
 *
 * @example
 * const { rbac, notifications } = useFeatures(['rbac', 'notifications']);
 */
export function useFeatures<T extends FeatureKey[]>(
  featureKeys: T,
): Record<T[number], boolean> {
  return featureKeys.reduce(
    (acc, key) => ({
      ...acc,
      [key]: features[key] ?? false,
    }),
    {} as Record<T[number], boolean>,
  );
}
```

**Commit:** `[FACTBP-WEB] feat(features): add useFeature hook`

**Status:** ⏳

---

### Task 1.4: Criar Feature Component

**Arquivo:** `src/components/common/feature.tsx`

**Implementação:**
```typescript
'use client';

import { type ReactNode } from 'react';
import { useFeature } from '@/hooks/use-feature';
import { type FeatureKey } from '@/config/features';

interface FeatureProps {
  /** Nome da feature para verificar */
  name: FeatureKey;
  /** Conteúdo a renderizar se feature estiver habilitada */
  children: ReactNode;
  /** Conteúdo alternativo se feature estiver desabilitada */
  fallback?: ReactNode;
}

/**
 * Componente para renderização condicional baseada em feature toggles
 *
 * @example
 * <Feature name="notifications">
 *   <NotificationBell />
 * </Feature>
 *
 * @example
 * <Feature name="rbac" fallback={<BasicPermissions />}>
 *   <AdvancedRbac />
 * </Feature>
 */
export function Feature({ name, children, fallback = null }: FeatureProps) {
  const isEnabled = useFeature(name);
  return isEnabled ? <>{children}</> : <>{fallback}</>;
}

/**
 * HOC para envolver componentes com feature toggle
 *
 * @example
 * const NotificationsWithFeature = withFeature('notifications')(NotificationsPanel);
 */
export function withFeature<P extends object>(feature: FeatureKey) {
  return function WithFeatureHOC(
    Component: React.ComponentType<P>,
    Fallback?: React.ComponentType<P>,
  ) {
    return function WrappedComponent(props: P) {
      const isEnabled = useFeature(feature);

      if (!isEnabled) {
        return Fallback ? <Fallback {...props} /> : null;
      }

      return <Component {...props} />;
    };
  };
}
```

**Commit:** `[FACTBP-WEB] feat(features): add Feature component`

**Status:** ⏳

---

### Task 1.5: Atualizar .env.example

**Arquivo:** `.env.example` (frontend)

```bash
# API
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Auth
NEXT_PUBLIC_AUTH_STORAGE_KEY=facter_auth_token

# App
NEXT_PUBLIC_APP_NAME=Facter
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Feature Toggles
NEXT_PUBLIC_FEATURE_RBAC=false
NEXT_PUBLIC_FEATURE_NOTIFICATIONS=false
NEXT_PUBLIC_FEATURE_AUDIT=false
NEXT_PUBLIC_FEATURE_SEARCH=false
NEXT_PUBLIC_FEATURE_UPLOAD=false
NEXT_PUBLIC_FEATURE_WEBHOOKS=false
NEXT_PUBLIC_FEATURE_API_KEYS=false
```

**Arquivo:** `.env.example` (backend)

```bash
# Database
DATABASE_URL=postgresql://facter:facter123@localhost:5432/facter_boilerplate

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
JWT_REFRESH_EXPIRES_IN_DAYS=7

# App
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Feature Toggles
FEATURE_RBAC=false
FEATURE_NOTIFICATIONS=false
FEATURE_AUDIT=false
FEATURE_WEBHOOKS=false
FEATURE_API_KEYS=false
```

**Status:** ⏳

---

## Uso

### Frontend

```typescript
// Verificar via hook
function MyComponent() {
  const hasRbac = useFeature('rbac');

  if (hasRbac) {
    return <RbacConfig />;
  }

  return <BasicConfig />;
}

// Via componente
function Sidebar() {
  return (
    <nav>
      <Link href="/dashboard">Dashboard</Link>

      <Feature name="notifications">
        <Link href="/notifications">Notificações</Link>
      </Feature>

      <Feature name="rbac">
        <Link href="/roles">Roles</Link>
      </Feature>
    </nav>
  );
}
```

### Backend

```typescript
// Controller com feature guard
@Controller('webhooks')
@UseGuards(FeatureGuard)
@RequireFeature('webhooks')
export class WebhooksController {
  // Este controller só existe se FEATURE_WEBHOOKS=true
}

// Verificar via ConfigService
@Injectable()
export class SomeService {
  constructor(private config: ConfigService) {}

  doSomething() {
    if (this.config.get<boolean>('features.notifications')) {
      // Enviar notificação
    }
  }
}
```

---

## Critérios de Aceite

- [ ] Features config no frontend funciona
- [ ] Features config no backend funciona
- [ ] useFeature hook retorna valor correto
- [ ] `<Feature>` component renderiza condicionalmente
- [ ] FeatureGuard bloqueia rotas de features desabilitadas
- [ ] .env.example documentado

---

*Task de [Sprint 7](../sprint-07.md)*
