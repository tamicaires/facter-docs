# [FACTBP-WEB-015] RBAC Components

> Implementar componentes e hooks de permissões no frontend.

---

## Status: ⏳ Pendente

## Contexto

**Funcionalidades:**
- Componentes condicionais baseados em permissão
- Hooks para verificar permissões
- Provider de permissões sincronizado com backend

**Padrão:**
```tsx
// Condicional
<Can action="create" subject="User">
  <Button>Criar Usuário</Button>
</Can>

// Hook
const canCreateUser = useCan('create', 'User');

// Multiple
<CanAny actions={['create', 'update']} subject="User">
  <EditPanel />
</CanAny>
```

---

## Tasks

### Task 15.1: Criar Types de Permissões

**Arquivo:** `src/features/permissions/types/index.ts`

**Implementação:**
```typescript
export type Action = 'manage' | 'create' | 'read' | 'update' | 'delete';

export type Subject =
  | 'all'
  | 'User'
  | 'Company'
  | 'Membership'
  | 'Role'
  | 'Permission';

export interface Permission {
  action: Action;
  subject: Subject;
  conditions?: Record<string, unknown>;
}

export interface PermissionsState {
  permissions: Permission[];
  role: string;
  isOwner: boolean;
  isLoading: boolean;
}
```

**Commit:** `[FACTBP-WEB] feat(permissions): add permission types`

**Status:** ⏳

---

### Task 15.2: Criar Permissions Store

**Arquivo:** `src/features/permissions/stores/permissions-store.ts`

**Implementação:**
```typescript
import { create } from 'zustand';
import { Permission, PermissionsState } from '../types';

interface PermissionsStore extends PermissionsState {
  setPermissions: (permissions: Permission[], role: string, isOwner: boolean) => void;
  clearPermissions: () => void;
  setLoading: (loading: boolean) => void;
  can: (action: string, subject: string) => boolean;
}

export const usePermissionsStore = create<PermissionsStore>((set, get) => ({
  permissions: [],
  role: '',
  isOwner: false,
  isLoading: true,

  setPermissions: (permissions, role, isOwner) => {
    set({ permissions, role, isOwner, isLoading: false });
  },

  clearPermissions: () => {
    set({ permissions: [], role: '', isOwner: false, isLoading: true });
  },

  setLoading: (isLoading) => {
    set({ isLoading });
  },

  can: (action, subject) => {
    const { permissions, isOwner } = get();

    // Owner pode tudo
    if (isOwner) return true;

    // Verifica se tem 'manage' em 'all'
    const hasManageAll = permissions.some(
      (p) => p.action === 'manage' && p.subject === 'all',
    );
    if (hasManageAll) return true;

    // Verifica permissão específica
    return permissions.some(
      (p) =>
        (p.action === action || p.action === 'manage') &&
        (p.subject === subject || p.subject === 'all'),
    );
  },
}));
```

**Commit:** `[FACTBP-WEB] feat(permissions): add permissions store`

**Status:** ⏳

---

### Task 15.3: Criar Permissions Service

**Arquivo:** `src/features/permissions/services/permissions-service.ts`

**Implementação:**
```typescript
import { api } from '@/lib/api';
import { Permission } from '../types';

export interface PermissionsResponse {
  role: string;
  isOwner: boolean;
  permissions: Permission[];
}

export const permissionsService = {
  async getPermissions(): Promise<PermissionsResponse> {
    const response = await api.get<{ data: PermissionsResponse }>('/auth/permissions');
    return response.data.data;
  },
};
```

**Commit:** `[FACTBP-WEB] feat(permissions): add permissions service`

**Status:** ⏳

---

### Task 15.4: Criar usePermissions Hook

**Arquivo:** `src/features/permissions/hooks/use-permissions.ts`

**Implementação:**
```typescript
import { useQuery } from '@tanstack/react-query';
import { useCompanyStore } from '@/features/company';
import { permissionsService } from '../services/permissions-service';
import { usePermissionsStore } from '../stores/permissions-store';
import { useEffect } from 'react';

export function usePermissions() {
  const { selectedCompany } = useCompanyStore();
  const { setPermissions, clearPermissions, setLoading, ...state } = usePermissionsStore();

  const query = useQuery({
    queryKey: ['permissions', selectedCompany?.id],
    queryFn: permissionsService.getPermissions,
    enabled: !!selectedCompany,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  useEffect(() => {
    if (query.data) {
      setPermissions(query.data.permissions, query.data.role, query.data.isOwner);
    }
  }, [query.data, setPermissions]);

  useEffect(() => {
    if (!selectedCompany) {
      clearPermissions();
    }
  }, [selectedCompany, clearPermissions]);

  useEffect(() => {
    setLoading(query.isLoading);
  }, [query.isLoading, setLoading]);

  return {
    ...state,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
```

**Commit:** `[FACTBP-WEB] feat(permissions): add usePermissions hook`

**Status:** ⏳

---

### Task 15.5: Criar useCan Hook

**Arquivo:** `src/features/permissions/hooks/use-can.ts`

**Implementação:**
```typescript
import { useMemo } from 'react';
import { usePermissionsStore } from '../stores/permissions-store';
import { Action, Subject } from '../types';

/**
 * Hook para verificar se o usuário tem uma permissão específica
 *
 * @example
 * const canCreateUser = useCan('create', 'User');
 * const canManageAll = useCan('manage', 'all');
 */
export function useCan(action: Action, subject: Subject): boolean {
  const { can, permissions, isOwner, isLoading } = usePermissionsStore();

  return useMemo(() => {
    if (isLoading) return false;
    return can(action, subject);
  }, [action, subject, can, permissions, isOwner, isLoading]);
}

/**
 * Hook para verificar se tem qualquer uma das permissões
 *
 * @example
 * const canEditOrDelete = useCanAny([
 *   { action: 'update', subject: 'User' },
 *   { action: 'delete', subject: 'User' },
 * ]);
 */
export function useCanAny(
  permissions: Array<{ action: Action; subject: Subject }>,
): boolean {
  const { can, isLoading } = usePermissionsStore();

  return useMemo(() => {
    if (isLoading) return false;
    return permissions.some((p) => can(p.action, p.subject));
  }, [permissions, can, isLoading]);
}

/**
 * Hook para verificar se tem todas as permissões
 *
 * @example
 * const canFullAccess = useCanAll([
 *   { action: 'create', subject: 'User' },
 *   { action: 'update', subject: 'User' },
 *   { action: 'delete', subject: 'User' },
 * ]);
 */
export function useCanAll(
  permissions: Array<{ action: Action; subject: Subject }>,
): boolean {
  const { can, isLoading } = usePermissionsStore();

  return useMemo(() => {
    if (isLoading) return false;
    return permissions.every((p) => can(p.action, p.subject));
  }, [permissions, can, isLoading]);
}
```

**Commit:** `[FACTBP-WEB] feat(permissions): add useCan hooks`

**Status:** ⏳

---

### Task 15.6: Criar Can Component

**Arquivo:** `src/features/permissions/components/can.tsx`

**Implementação:**
```typescript
'use client';

import { ReactNode } from 'react';
import { useCan, useCanAny, useCanAll } from '../hooks/use-can';
import { Action, Subject } from '../types';

interface CanProps {
  action: Action;
  subject: Subject;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Componente condicional baseado em permissão
 *
 * @example
 * <Can action="create" subject="User">
 *   <Button>Criar Usuário</Button>
 * </Can>
 *
 * <Can action="delete" subject="User" fallback={<span>Sem permissão</span>}>
 *   <Button variant="destructive">Excluir</Button>
 * </Can>
 */
export function Can({ action, subject, children, fallback = null }: CanProps) {
  const canDo = useCan(action, subject);
  return canDo ? <>{children}</> : <>{fallback}</>;
}

// ---

interface CanAnyProps {
  permissions: Array<{ action: Action; subject: Subject }>;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Renderiza se tiver qualquer uma das permissões
 *
 * @example
 * <CanAny permissions={[
 *   { action: 'update', subject: 'User' },
 *   { action: 'delete', subject: 'User' },
 * ]}>
 *   <EditPanel />
 * </CanAny>
 */
export function CanAny({ permissions, children, fallback = null }: CanAnyProps) {
  const canDo = useCanAny(permissions);
  return canDo ? <>{children}</> : <>{fallback}</>;
}

// ---

interface CanAllProps {
  permissions: Array<{ action: Action; subject: Subject }>;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Renderiza se tiver todas as permissões
 *
 * @example
 * <CanAll permissions={[
 *   { action: 'create', subject: 'User' },
 *   { action: 'delete', subject: 'User' },
 * ]}>
 *   <AdminPanel />
 * </CanAll>
 */
export function CanAll({ permissions, children, fallback = null }: CanAllProps) {
  const canDo = useCanAll(permissions);
  return canDo ? <>{children}</> : <>{fallback}</>;
}
```

**Commit:** `[FACTBP-WEB] feat(permissions): add Can components`

**Status:** ⏳

---

### Task 15.7: Criar PermissionsProvider

**Arquivo:** `src/features/permissions/providers/permissions-provider.tsx`

**Implementação:**
```typescript
'use client';

import { ReactNode, useEffect } from 'react';
import { usePermissions } from '../hooks/use-permissions';

interface PermissionsProviderProps {
  children: ReactNode;
}

/**
 * Provider que carrega as permissões quando a empresa é selecionada
 *
 * @example
 * // No layout principal
 * <PermissionsProvider>
 *   {children}
 * </PermissionsProvider>
 */
export function PermissionsProvider({ children }: PermissionsProviderProps) {
  const { isLoading, error, refetch } = usePermissions();

  useEffect(() => {
    // Refetch quando o foco voltar para a janela
    const handleFocus = () => {
      refetch();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetch]);

  // Você pode adicionar um loading state ou error boundary aqui se quiser
  return <>{children}</>;
}
```

**Commit:** `[FACTBP-WEB] feat(permissions): add PermissionsProvider`

**Status:** ⏳

---

### Task 15.8: Criar Barrel Export

**Arquivo:** `src/features/permissions/index.ts`

**Implementação:**
```typescript
// Types
export * from './types';

// Store
export { usePermissionsStore } from './stores/permissions-store';

// Hooks
export { usePermissions } from './hooks/use-permissions';
export { useCan, useCanAny, useCanAll } from './hooks/use-can';

// Components
export { Can, CanAny, CanAll } from './components/can';

// Provider
export { PermissionsProvider } from './providers/permissions-provider';

// Service
export { permissionsService } from './services/permissions-service';
```

**Commit:** `[FACTBP-WEB] feat(permissions): add barrel exports`

**Status:** ⏳

---

### Task 15.9: Integrar no Layout Principal

**Arquivo:** `src/app/(main)/layout.tsx` (atualizar)

**Implementação:**
```typescript
import { PermissionsProvider } from '@/features/permissions';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <PermissionsProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </PermissionsProvider>
  );
}
```

**Commit:** `[FACTBP-WEB] feat(layout): integrate PermissionsProvider`

**Status:** ⏳

---

## Exemplos de Uso

### Condicional Simples
```tsx
import { Can } from '@/features/permissions';

export function UserActions() {
  return (
    <div>
      <Can action="create" subject="User">
        <Button>Adicionar Usuário</Button>
      </Can>

      <Can action="delete" subject="User" fallback={<span>-</span>}>
        <Button variant="destructive">Excluir</Button>
      </Can>
    </div>
  );
}
```

### Com Hook
```tsx
import { useCan } from '@/features/permissions';

export function UserForm() {
  const canUpdate = useCan('update', 'User');
  const canDelete = useCan('delete', 'User');

  return (
    <form>
      <input disabled={!canUpdate} />
      {canDelete && <button type="button">Excluir</button>}
    </form>
  );
}
```

### Navegação Condicional
```tsx
import { useCanAny } from '@/features/permissions';

export function AdminMenu() {
  const hasAdminAccess = useCanAny([
    { action: 'manage', subject: 'User' },
    { action: 'manage', subject: 'Role' },
  ]);

  if (!hasAdminAccess) return null;

  return (
    <nav>
      <Link href="/admin/users">Usuários</Link>
      <Link href="/admin/roles">Permissões</Link>
    </nav>
  );
}
```

---

## Critérios de Aceite

- [ ] Store sincroniza com backend ao selecionar empresa
- [ ] useCan retorna boolean corretamente
- [ ] Can component renderiza condicionalmente
- [ ] CanAny funciona com múltiplas permissões
- [ ] CanAll funciona com múltiplas permissões
- [ ] Cache de 5 minutos funciona
- [ ] Refetch ao focar janela

---

## Arquivos a Criar

```
src/
└── features/
    └── permissions/
        ├── index.ts
        ├── types/
        │   └── index.ts
        ├── stores/
        │   └── permissions-store.ts
        ├── services/
        │   └── permissions-service.ts
        ├── hooks/
        │   ├── use-permissions.ts
        │   └── use-can.ts
        ├── components/
        │   └── can.tsx
        └── providers/
            └── permissions-provider.tsx
```

---

*Task de [Sprint 6](../sprint-06.md)*
