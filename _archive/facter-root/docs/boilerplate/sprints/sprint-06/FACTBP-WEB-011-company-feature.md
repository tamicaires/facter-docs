# [FACTBP-WEB-011] Company Feature

> Feature de empresa com store, hooks e services.

---

## Status: ✅ Concluído (2025-12-17)

## Contexto

**Company Context:**
- Armazenado em Zustand + Cookie
- Header X-Company-ID em requests
- Seleção persiste entre sessões

---

## Tasks

### Task 11.1: Criar Company Types

**Arquivo:** `src/features/company/types/index.ts`

**Implementação:**
```typescript
export interface Company {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  settings?: CompanySettings;
}

export interface CompanySettings {
  timezone?: string;
  currency?: string;
  language?: string;
}

export interface UpdateCompanyData {
  name?: string;
  slug?: string;
  logo?: string;
  settings?: CompanySettings;
}
```

**Status:** ⏳

---

### Task 11.2: Criar Company Service

**Arquivo:** `src/features/company/services/company-service.ts`

**Implementação:**
```typescript
import { api } from '@/lib/api';
import { API_ROUTES } from '@/config/api-routes';
import type { Company, UpdateCompanyData } from '../types';
import type { ApiResponse } from '@/types/api';

export const companyService = {
  // Get company by ID
  async getById(id: string): Promise<Company> {
    const response = await api.get<ApiResponse<Company>>(
      API_ROUTES.COMPANIES.GET(id),
    );
    return response.data.data;
  },

  // Update company
  async update(id: string, data: UpdateCompanyData): Promise<Company> {
    const response = await api.patch<ApiResponse<Company>>(
      API_ROUTES.COMPANIES.UPDATE(id),
      data,
    );
    return response.data.data;
  },

  // Upload logo
  async uploadLogo(id: string, file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<ApiResponse<{ url: string }>>(
      `${API_ROUTES.COMPANIES.GET(id)}/logo`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return response.data.data;
  },
};
```

**Commit:** `[FACTBP-WEB] feat(company): add company service`

**Status:** ⏳

---

### Task 11.3: Criar Company Hooks

**Arquivo:** `src/features/company/hooks/use-company.ts`

**Implementação:**
```typescript
import { useQuery } from '@tanstack/react-query';
import { companyService } from '../services/company-service';
import { useAuthStore } from '@/features/auth';

export function useCompany() {
  const currentCompanyId = useAuthStore((state) => state.currentCompanyId);

  return useQuery({
    queryKey: ['company', currentCompanyId],
    queryFn: () => {
      if (!currentCompanyId) {
        throw new Error('No company selected');
      }
      return companyService.getById(currentCompanyId);
    },
    enabled: !!currentCompanyId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
```

**Arquivo:** `src/features/company/hooks/use-update-company.ts`

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { companyService } from '../services/company-service';
import { useAuthStore } from '@/features/auth';
import type { UpdateCompanyData } from '../types';

export function useUpdateCompany() {
  const queryClient = useQueryClient();
  const currentCompanyId = useAuthStore((state) => state.currentCompanyId);

  return useMutation({
    mutationFn: (data: UpdateCompanyData) => {
      if (!currentCompanyId) {
        throw new Error('No company selected');
      }
      return companyService.update(currentCompanyId, data);
    },

    onSuccess: (data) => {
      queryClient.setQueryData(['company', currentCompanyId], data);
      queryClient.invalidateQueries({ queryKey: ['company'] });
      toast.success('Empresa atualizada com sucesso!');
    },

    onError: (error: any) => {
      const message =
        error.response?.data?.error?.message || 'Erro ao atualizar empresa';
      toast.error(message);
    },
  });
}
```

**Commit:** `[FACTBP-WEB] feat(company): add company hooks`

**Status:** ⏳

---

### Task 11.4: Criar Barrel Export

**Arquivo:** `src/features/company/index.ts`

**Implementação:**
```typescript
// Services
export { companyService } from './services/company-service';

// Hooks
export { useCompany } from './hooks/use-company';
export { useUpdateCompany } from './hooks/use-update-company';

// Types
export type { Company, CompanySettings, UpdateCompanyData } from './types';
```

**Status:** ⏳

---

## Critérios de Aceite

- [ ] Company service com CRUD
- [ ] useCompany carrega dados
- [ ] useUpdateCompany atualiza dados
- [ ] Cache de 10 minutos
- [ ] Toast de feedback
- [ ] Barrel exports funcionando

---

*Task de [Sprint 6](../sprint-06.md)*
