# [FACTBP-WEB-004] Auth Store

> Criar store Zustand para autenticação.

---

## Status: ⏳ Pendente

## Contexto

**Por que Zustand:**
- Simples e leve
- TypeScript nativo
- Persiste automaticamente
- Não precisa de provider

**Estado necessário:**
- User data
- Current company
- Memberships
- Permissions (do CASL)

---

## Tasks

### Task 4.1: Instalar Zustand

**Comando:**
```bash
pnpm add zustand
```

**Status:** ⏳

---

### Task 4.2: Criar Auth Types

**Arquivo:** `src/features/auth/types/index.ts`

**Implementação:**
```typescript
// User
export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
}

// Membership
export interface Membership {
  id: string;
  companyId: string;
  companyName: string;
  role: string;
  isOwner: boolean;
}

// Permission (CASL)
export interface Permission {
  action: string;
  subject: string;
  conditions?: Record<string, unknown>;
}

// Auth Response
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User & { memberships: Membership[] };
}

// Permissions Response
export interface PermissionsResponse {
  role: string;
  isOwner: boolean;
  permissions: Permission[];
}

// Login
export interface LoginCredentials {
  email: string;
  password: string;
}

// Register
export interface RegisterData {
  user: {
    email: string;
    password: string;
    name: string;
  };
  company: {
    name: string;
    slug?: string;
  };
}
```

**Commit:** `[FACTBP-WEB] feat(auth): add auth types`

**Status:** ⏳

---

### Task 4.3: Criar Auth Store

**Arquivo:** `src/features/auth/stores/auth-store.ts`

**Implementação:**
```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, Membership, Permission } from '../types';
import {
  setStoredToken,
  setStoredRefreshToken,
  setStoredCompanyId,
  clearAuth as clearStorage,
} from '@/lib/auth-storage';

interface AuthState {
  // State
  user: User | null;
  memberships: Membership[];
  currentCompanyId: string | null;
  permissions: Permission[];
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setAuth: (data: {
    user: User;
    memberships: Membership[];
    accessToken: string;
    refreshToken: string;
  }) => void;
  setCompany: (companyId: string) => void;
  setPermissions: (permissions: Permission[]) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  reset: () => void;
}

const initialState = {
  user: null,
  memberships: [],
  currentCompanyId: null,
  permissions: [],
  isAuthenticated: false,
  isLoading: true,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setAuth: ({ user, memberships, accessToken, refreshToken }) => {
        // Armazenar tokens
        setStoredToken(accessToken);
        setStoredRefreshToken(refreshToken);

        // Se tem apenas uma empresa, seleciona automaticamente
        const companyId = memberships.length === 1
          ? memberships[0].companyId
          : null;

        if (companyId) {
          setStoredCompanyId(companyId);
        }

        set({
          user,
          memberships,
          currentCompanyId: companyId,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      setCompany: (companyId: string) => {
        const { memberships } = get();
        const membership = memberships.find(m => m.companyId === companyId);

        if (!membership) {
          console.error('User does not have access to this company');
          return;
        }

        setStoredCompanyId(companyId);
        set({ currentCompanyId: companyId });
      },

      setPermissions: (permissions) => {
        set({ permissions });
      },

      setLoading: (isLoading) => {
        set({ isLoading });
      },

      logout: () => {
        clearStorage();
        set({ ...initialState, isLoading: false });
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Não persistir loading
        user: state.user,
        memberships: state.memberships,
        currentCompanyId: state.currentCompanyId,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

// Seletores
export const selectUser = (state: AuthState) => state.user;
export const selectMemberships = (state: AuthState) => state.memberships;
export const selectCurrentCompanyId = (state: AuthState) => state.currentCompanyId;
export const selectCurrentMembership = (state: AuthState) => {
  const { memberships, currentCompanyId } = state;
  return memberships.find(m => m.companyId === currentCompanyId) || null;
};
export const selectPermissions = (state: AuthState) => state.permissions;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectIsLoading = (state: AuthState) => state.isLoading;
```

**Commit:** `[FACTBP-WEB] feat(auth): add auth store with Zustand`

**Status:** ⏳

---

### Task 4.4: Criar Hooks de Conveniência

**Arquivo:** `src/features/auth/hooks/use-auth.ts`

**Implementação:**
```typescript
import { useAuthStore, selectCurrentMembership } from '../stores/auth-store';

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const memberships = useAuthStore((state) => state.memberships);
  const currentCompanyId = useAuthStore((state) => state.currentCompanyId);
  const permissions = useAuthStore((state) => state.permissions);
  const currentMembership = useAuthStore(selectCurrentMembership);

  const setAuth = useAuthStore((state) => state.setAuth);
  const setCompany = useAuthStore((state) => state.setCompany);
  const setPermissions = useAuthStore((state) => state.setPermissions);
  const logout = useAuthStore((state) => state.logout);

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    memberships,
    currentCompanyId,
    currentMembership,
    permissions,

    // Actions
    setAuth,
    setCompany,
    setPermissions,
    logout,
  };
}
```

**Status:** ⏳

---

### Task 4.5: Criar usePermission Hook

**Arquivo:** `src/features/auth/hooks/use-permission.ts`

**Implementação:**
```typescript
import { useMemo } from 'react';
import { createMongoAbility, MongoAbility } from '@casl/ability';
import { useAuthStore } from '../stores/auth-store';
import type { Permission } from '../types';

type Action = 'manage' | 'create' | 'read' | 'update' | 'delete';
type Subject = 'all' | 'User' | 'Company' | 'Membership' | 'Role' | 'Permission';
type AppAbility = MongoAbility<[Action, Subject]>;

export function usePermission() {
  const permissions = useAuthStore((state) => state.permissions);
  const currentMembership = useAuthStore((state) => {
    const { memberships, currentCompanyId } = state;
    return memberships.find(m => m.companyId === currentCompanyId);
  });

  const ability = useMemo<AppAbility>(() => {
    // Owner tem todas as permissões
    if (currentMembership?.isOwner) {
      return createMongoAbility([{ action: 'manage', subject: 'all' }]);
    }

    return createMongoAbility(
      permissions.map((p) => ({
        action: p.action as Action,
        subject: p.subject as Subject,
        conditions: p.conditions,
      })),
    );
  }, [permissions, currentMembership?.isOwner]);

  const can = (action: Action, subject: Subject): boolean => {
    return ability.can(action, subject);
  };

  const cannot = (action: Action, subject: Subject): boolean => {
    return ability.cannot(action, subject);
  };

  return {
    ability,
    can,
    cannot,
  };
}
```

**Commit:** `[FACTBP-WEB] feat(auth): add usePermission hook with CASL`

**Status:** ⏳

---

### Task 4.6: Criar Barrel Export

**Arquivo:** `src/features/auth/index.ts`

**Implementação:**
```typescript
// Stores
export { useAuthStore } from './stores/auth-store';

// Hooks
export { useAuth } from './hooks/use-auth';
export { usePermission } from './hooks/use-permission';

// Types
export type {
  User,
  Membership,
  Permission,
  AuthResponse,
  PermissionsResponse,
  LoginCredentials,
  RegisterData,
} from './types';
```

**Commit:** `[FACTBP-WEB] feat(auth): add barrel exports`

**Status:** ⏳

---

## Uso

```typescript
// Em qualquer componente
import { useAuth, usePermission } from '@/features/auth';

function MyComponent() {
  const { user, isAuthenticated, currentMembership, logout } = useAuth();
  const { can } = usePermission();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div>
      <p>Olá, {user?.name}!</p>
      <p>Empresa: {currentMembership?.companyName}</p>

      {can('create', 'User') && (
        <button>Criar Usuário</button>
      )}

      <button onClick={logout}>Sair</button>
    </div>
  );
}
```

---

## Critérios de Aceite

- [ ] Zustand instalado
- [ ] Auth store criado e persiste
- [ ] useAuth hook funciona
- [ ] usePermission hook funciona com CASL
- [ ] Types exportados
- [ ] Barrel exports criados

---

*Task de [Sprint 4](../sprint-04.md)*
