# [FACTBP-WEB-006] Auth Services e Hooks

> Criar serviços e hooks para autenticação.

---

## Status: ⏳ Pendente

## Contexto

**Padrão:**
- **Service:** Chamadas à API (wrapper do Axios)
- **Hook:** TanStack Query para cache e estados

---

## Tasks

### Task 6.1: Criar Auth Service

**Arquivo:** `src/features/auth/services/auth-service.ts`

**Implementação:**
```typescript
import { api } from '@/lib/api';
import { API_ROUTES } from '@/config/api-routes';
import type {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  PermissionsResponse,
} from '../types';
import type { ApiResponse } from '@/types/api';

export const authService = {
  // Login
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>(
      API_ROUTES.AUTH.LOGIN,
      credentials,
    );
    return response.data.data;
  },

  // Register
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>(
      API_ROUTES.AUTH.REGISTER,
      data,
    );
    return response.data.data;
  },

  // Refresh Token
  async refresh(refreshToken: string): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>(
      API_ROUTES.AUTH.REFRESH,
      { refreshToken },
    );
    return response.data.data;
  },

  // Logout
  async logout(refreshToken?: string): Promise<void> {
    await api.post(API_ROUTES.AUTH.LOGOUT, { refreshToken });
  },

  // Get Me
  async getMe(): Promise<AuthResponse['user']> {
    const response = await api.get<ApiResponse<AuthResponse['user']>>(
      API_ROUTES.AUTH.ME,
    );
    return response.data.data;
  },

  // Get Permissions
  async getPermissions(): Promise<PermissionsResponse> {
    const response = await api.get<ApiResponse<PermissionsResponse>>(
      API_ROUTES.AUTH.PERMISSIONS,
    );
    return response.data.data;
  },

  // Switch Company
  async switchCompany(
    companyId: string,
    refreshToken?: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    currentCompany: {
      id: string;
      name: string;
      slug: string;
      role: string;
      isOwner: boolean;
    };
  }> {
    const response = await api.post(API_ROUTES.AUTH.SWITCH_COMPANY, {
      companyId,
      refreshToken,
    });
    return response.data.data;
  },

  // Forgot Password
  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  },

  // Reset Password
  async resetPassword(token: string, password: string): Promise<void> {
    await api.post('/auth/reset-password', { token, password });
  },
};
```

**Commit:** `[FACTBP-WEB] feat(auth): add auth service`

**Status:** ⏳

---

### Task 6.2: Criar useLogin Hook

**Arquivo:** `src/features/auth/hooks/use-login.ts`

**Implementação:**
```typescript
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authService } from '../services/auth-service';
import { useAuthStore } from '../stores/auth-store';
import { ROUTES } from '@/config/routes';
import type { LoginCredentials } from '../types';

export function useLogin() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      authService.login(credentials),

    onSuccess: (data) => {
      const { accessToken, refreshToken, user } = data;

      setAuth({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
        },
        memberships: user.memberships,
        accessToken,
        refreshToken,
      });

      toast.success('Login realizado com sucesso!');

      // Redirecionar
      if (user.memberships.length === 1) {
        router.push(ROUTES.DASHBOARD);
      } else {
        router.push('/select-company');
      }
    },

    onError: (error: any) => {
      const message =
        error.response?.data?.error?.message || 'Erro ao fazer login';
      toast.error(message);
    },
  });
}
```

**Commit:** `[FACTBP-WEB] feat(auth): add useLogin hook`

**Status:** ⏳

---

### Task 6.3: Criar useRegister Hook

**Arquivo:** `src/features/auth/hooks/use-register.ts`

**Implementação:**
```typescript
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authService } from '../services/auth-service';
import { useAuthStore } from '../stores/auth-store';
import { ROUTES } from '@/config/routes';
import type { RegisterData } from '../types';

export function useRegister() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (data: RegisterData) => authService.register(data),

    onSuccess: (data) => {
      const { accessToken, refreshToken, user } = data;

      setAuth({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
        },
        memberships: user.memberships,
        accessToken,
        refreshToken,
      });

      toast.success('Conta criada com sucesso!');
      router.push(ROUTES.DASHBOARD);
    },

    onError: (error: any) => {
      const message =
        error.response?.data?.error?.message || 'Erro ao criar conta';
      toast.error(message);
    },
  });
}
```

**Commit:** `[FACTBP-WEB] feat(auth): add useRegister hook`

**Status:** ⏳

---

### Task 6.4: Criar useLogout Hook

**Arquivo:** `src/features/auth/hooks/use-logout.ts`

**Implementação:**
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authService } from '../services/auth-service';
import { useAuthStore } from '../stores/auth-store';
import { getStoredRefreshToken } from '@/lib/auth-storage';
import { ROUTES } from '@/config/routes';

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: async () => {
      const refreshToken = getStoredRefreshToken();
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    },

    onSettled: () => {
      // Sempre limpar estado local, mesmo se API falhar
      logout();
      queryClient.clear();
      router.push(ROUTES.LOGIN);
    },
  });
}
```

**Status:** ⏳

---

### Task 6.5: Criar usePermissions Hook

**Arquivo:** `src/features/auth/hooks/use-permissions.ts`

**Implementação:**
```typescript
import { useQuery } from '@tanstack/react-query';
import { authService } from '../services/auth-service';
import { useAuthStore } from '../stores/auth-store';

export function usePermissions() {
  const currentCompanyId = useAuthStore((state) => state.currentCompanyId);
  const setPermissions = useAuthStore((state) => state.setPermissions);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ['permissions', currentCompanyId],
    queryFn: async () => {
      const data = await authService.getPermissions();
      setPermissions(data.permissions);
      return data;
    },
    enabled: isAuthenticated && !!currentCompanyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

**Status:** ⏳

---

### Task 6.6: Criar useSwitchCompany Hook

**Arquivo:** `src/features/auth/hooks/use-switch-company.ts`

**Implementação:**
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authService } from '../services/auth-service';
import { useAuthStore } from '../stores/auth-store';
import {
  setStoredToken,
  setStoredRefreshToken,
  getStoredRefreshToken,
} from '@/lib/auth-storage';
import { ROUTES } from '@/config/routes';

export function useSwitchCompany() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setCompany = useAuthStore((state) => state.setCompany);

  return useMutation({
    mutationFn: (companyId: string) => {
      const refreshToken = getStoredRefreshToken();
      return authService.switchCompany(companyId, refreshToken || undefined);
    },

    onSuccess: (data) => {
      // Atualizar tokens
      setStoredToken(data.accessToken);
      setStoredRefreshToken(data.refreshToken);

      // Atualizar store
      setCompany(data.currentCompany.id);

      // Invalidar queries de permissões
      queryClient.invalidateQueries({ queryKey: ['permissions'] });

      toast.success(`Empresa alterada para ${data.currentCompany.name}`);
      router.push(ROUTES.DASHBOARD);
    },

    onError: (error: any) => {
      const message =
        error.response?.data?.error?.message || 'Erro ao trocar de empresa';
      toast.error(message);
    },
  });
}
```

**Commit:** `[FACTBP-WEB] feat(auth): add auth hooks`

**Status:** ⏳

---

### Task 6.7: Atualizar Barrel Export

**Arquivo:** `src/features/auth/index.ts`

**Implementação:**
```typescript
// Stores
export { useAuthStore } from './stores/auth-store';

// Hooks
export { useAuth } from './hooks/use-auth';
export { useLogin } from './hooks/use-login';
export { useRegister } from './hooks/use-register';
export { useLogout } from './hooks/use-logout';
export { usePermission } from './hooks/use-permission';
export { usePermissions } from './hooks/use-permissions';
export { useSwitchCompany } from './hooks/use-switch-company';

// Services
export { authService } from './services/auth-service';

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

**Status:** ⏳

---

## Critérios de Aceite

- [ ] Auth service com todas as operações
- [ ] useLogin com redirect correto
- [ ] useRegister cria conta
- [ ] useLogout limpa estado
- [ ] usePermissions carrega e cacheia
- [ ] useSwitchCompany troca empresa
- [ ] Toast de feedback em todas as operações

---

*Task de [Sprint 5](../sprint-05.md)*
