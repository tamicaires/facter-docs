# [FACTBP-WEB-014] Settings Pages

> Páginas de configurações (perfil, segurança, empresa).

---

## Status: ✅ Concluído (2025-12-17)

## Contexto

**Páginas de Settings:**
- Profile: nome, email, avatar
- Security: alterar senha
- Company: dados da empresa (com permissão)

---

## Tasks

### Task 14.1: Criar User Service

**Arquivo:** `src/features/user/services/user-service.ts`

**Implementação:**
```typescript
import { api } from '@/lib/api';
import type { ApiResponse } from '@/types/api';

export interface UpdateProfileData {
  name?: string;
  email?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export const userService = {
  // Update profile
  async updateProfile(data: UpdateProfileData) {
    const response = await api.patch<ApiResponse<{ success: boolean }>>(
      '/users/me',
      data,
    );
    return response.data.data;
  },

  // Change password
  async changePassword(data: ChangePasswordData) {
    const response = await api.post<ApiResponse<{ success: boolean }>>(
      '/users/me/change-password',
      data,
    );
    return response.data.data;
  },

  // Upload avatar
  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<ApiResponse<{ url: string }>>(
      '/users/me/avatar',
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

**Status:** ⏳

---

### Task 14.2: Criar User Hooks

**Arquivo:** `src/features/user/hooks/use-update-profile.ts`

**Implementação:**
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { userService, type UpdateProfileData } from '../services/user-service';
import { useAuthStore } from '@/features/auth';

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: (data: UpdateProfileData) => userService.updateProfile(data),

    onSuccess: (_, variables) => {
      // Atualizar store local
      if (user) {
        useAuthStore.setState({
          user: {
            ...user,
            name: variables.name ?? user.name,
            email: variables.email ?? user.email,
          },
        });
      }

      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
      toast.success('Perfil atualizado com sucesso!');
    },

    onError: (error: any) => {
      const message =
        error.response?.data?.error?.message || 'Erro ao atualizar perfil';
      toast.error(message);
    },
  });
}
```

**Arquivo:** `src/features/user/hooks/use-change-password.ts`

```typescript
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { userService, type ChangePasswordData } from '../services/user-service';

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordData) => userService.changePassword(data),

    onSuccess: () => {
      toast.success('Senha alterada com sucesso!');
    },

    onError: (error: any) => {
      const message =
        error.response?.data?.error?.message || 'Erro ao alterar senha';
      toast.error(message);
    },
  });
}
```

**Commit:** `[FACTBP-WEB] feat(user): add user service and hooks`

**Status:** ⏳

---

### Task 14.3: Criar Settings Layout

**Arquivo:** `src/app/(main)/settings/layout.tsx`

**Implementação:**
```typescript
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { usePermission } from '@/features/auth';
import { User, Shield, Building2 } from 'lucide-react';

interface SettingsLayoutProps {
  children: React.ReactNode;
}

const settingsNav = [
  {
    title: 'Perfil',
    href: '/settings/profile',
    icon: User,
  },
  {
    title: 'Segurança',
    href: '/settings/security',
    icon: Shield,
  },
  {
    title: 'Empresa',
    href: '/settings/company',
    icon: Building2,
    permission: { action: 'update', subject: 'Company' },
  },
];

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = usePathname();
  const { can } = usePermission();

  const visibleNav = settingsNav.filter((item) => {
    if (!item.permission) return true;
    return can(item.permission.action as any, item.permission.subject as any);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie suas configurações de conta e empresa
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Navigation */}
        <nav className="w-full md:w-56 shrink-0">
          <ul className="space-y-1">
            {visibleNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Content */}
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
```

**Commit:** `[FACTBP-WEB] feat(settings): add settings layout`

**Status:** ⏳

---

### Task 14.4: Criar Profile Page

**Arquivo:** `src/app/(main)/settings/profile/page.tsx`

**Implementação:**
```typescript
import { Metadata } from 'next';
import { ProfileForm } from './_components/profile-form';

export const metadata: Metadata = {
  title: 'Perfil | Configurações',
  description: 'Gerencie suas informações pessoais',
};

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Perfil</h2>
        <p className="text-sm text-muted-foreground">
          Atualize suas informações pessoais
        </p>
      </div>
      <ProfileForm />
    </div>
  );
}
```

**Arquivo:** `src/app/(main)/settings/profile/_components/profile-form.tsx`

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardFooter,
  Button,
  Input,
  Label,
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '@facter/ds-core';
import { useAuth } from '@/features/auth';
import { useUpdateProfile } from '@/features/user/hooks/use-update-profile';

const profileSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(100),
  email: z.string().email('Email inválido'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProfileForm() {
  const { user } = useAuth();
  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    updateProfile(data);
  };

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6 pt-6">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user?.avatar || undefined} />
              <AvatarFallback className="text-xl">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <Button type="button" variant="outline" size="sm">
                Alterar foto
              </Button>
              <p className="text-xs text-muted-foreground mt-1">
                JPG, PNG ou GIF. Máximo 2MB.
              </p>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome completo</Label>
            <Input
              id="name"
              {...register('name')}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="border-t px-6 py-4">
          <Button type="submit" disabled={!isDirty || isPending}>
            {isPending ? 'Salvando...' : 'Salvar alterações'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
```

**Commit:** `[FACTBP-WEB] feat(settings): add profile page`

**Status:** ⏳

---

### Task 14.5: Criar Security Page

**Arquivo:** `src/app/(main)/settings/security/page.tsx`

**Implementação:**
```typescript
import { Metadata } from 'next';
import { ChangePasswordForm } from './_components/change-password-form';

export const metadata: Metadata = {
  title: 'Segurança | Configurações',
  description: 'Gerencie a segurança da sua conta',
};

export default function SecurityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Segurança</h2>
        <p className="text-sm text-muted-foreground">
          Atualize sua senha e configurações de segurança
        </p>
      </div>
      <ChangePasswordForm />
    </div>
  );
}
```

**Arquivo:** `src/app/(main)/settings/security/_components/change-password-form.tsx`

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
} from '@facter/ds-core';
import { useChangePassword } from '@/features/user/hooks/use-change-password';

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
    newPassword: z
      .string()
      .min(8, 'Nova senha deve ter no mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Deve ter pelo menos uma letra maiúscula')
      .regex(/[a-z]/, 'Deve ter pelo menos uma letra minúscula')
      .regex(/[0-9]/, 'Deve ter pelo menos um número'),
    confirmPassword: z.string().min(1, 'Confirme a nova senha'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Senhas não conferem',
    path: ['confirmPassword'],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export function ChangePasswordForm() {
  const { mutate: changePassword, isPending } = useChangePassword();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = (data: ChangePasswordFormData) => {
    changePassword(
      {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      },
      {
        onSuccess: () => reset(),
      },
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alterar senha</CardTitle>
        <CardDescription>
          Escolha uma senha forte com pelo menos 8 caracteres
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Senha atual</Label>
            <Input
              id="currentPassword"
              type="password"
              {...register('currentPassword')}
              aria-invalid={!!errors.currentPassword}
            />
            {errors.currentPassword && (
              <p className="text-sm text-destructive">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Nova senha</Label>
            <Input
              id="newPassword"
              type="password"
              {...register('newPassword')}
              aria-invalid={!!errors.newPassword}
            />
            {errors.newPassword && (
              <p className="text-sm text-destructive">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword')}
              aria-invalid={!!errors.confirmPassword}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="border-t px-6 py-4">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Alterando...' : 'Alterar senha'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
```

**Commit:** `[FACTBP-WEB] feat(settings): add security page`

**Status:** ⏳

---

### Task 14.6: Criar Company Settings Page

**Arquivo:** `src/app/(main)/settings/company/page.tsx`

**Implementação:**
```typescript
import { Metadata } from 'next';
import { CompanyForm } from './_components/company-form';

export const metadata: Metadata = {
  title: 'Empresa | Configurações',
  description: 'Gerencie as configurações da empresa',
};

export default function CompanySettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Empresa</h2>
        <p className="text-sm text-muted-foreground">
          Atualize as informações da sua empresa
        </p>
      </div>
      <CompanyForm />
    </div>
  );
}
```

**Arquivo:** `src/app/(main)/settings/company/_components/company-form.tsx`

```typescript
'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardFooter,
  Button,
  Input,
  Label,
  Skeleton,
} from '@facter/ds-core';
import { useCompany, useUpdateCompany } from '@/features/company';

const companySchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(100),
  slug: z
    .string()
    .min(2, 'Slug deve ter no mínimo 2 caracteres')
    .max(50)
    .regex(
      /^[a-z0-9-]+$/,
      'Slug deve conter apenas letras minúsculas, números e hífens',
    ),
});

type CompanyFormData = z.infer<typeof companySchema>;

export function CompanyForm() {
  const { data: company, isLoading } = useCompany();
  const { mutate: updateCompany, isPending } = useUpdateCompany();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
  });

  // Atualizar form quando company carregar
  useEffect(() => {
    if (company) {
      reset({
        name: company.name,
        slug: company.slug,
      });
    }
  }, [company, reset]);

  const onSubmit = (data: CompanyFormData) => {
    updateCompany(data);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="space-y-4 pt-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da empresa</Label>
            <Input
              id="name"
              {...register('name')}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              {...register('slug')}
              aria-invalid={!!errors.slug}
            />
            <p className="text-xs text-muted-foreground">
              Usado na URL. Apenas letras minúsculas, números e hífens.
            </p>
            {errors.slug && (
              <p className="text-sm text-destructive">{errors.slug.message}</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="border-t px-6 py-4">
          <Button type="submit" disabled={!isDirty || isPending}>
            {isPending ? 'Salvando...' : 'Salvar alterações'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
```

**Commit:** `[FACTBP-WEB] feat(settings): add company settings page`

**Status:** ⏳

---

## Estrutura Final Sprint 6

```
src/
├── app/(main)/
│   ├── layout.tsx
│   ├── dashboard/
│   │   ├── page.tsx
│   │   └── _components/
│   │       ├── welcome-card.tsx
│   │       ├── stats-cards.tsx
│   │       ├── quick-actions.tsx
│   │       └── recent-activity.tsx
│   └── settings/
│       ├── layout.tsx
│       ├── profile/
│       │   ├── page.tsx
│       │   └── _components/
│       │       └── profile-form.tsx
│       ├── security/
│       │   ├── page.tsx
│       │   └── _components/
│       │       └── change-password-form.tsx
│       └── company/
│           ├── page.tsx
│           └── _components/
│               └── company-form.tsx
├── config/
│   └── navigation.ts
└── features/
    ├── company/
    │   ├── index.ts
    │   ├── types/index.ts
    │   ├── services/company-service.ts
    │   └── hooks/
    │       ├── use-company.ts
    │       └── use-update-company.ts
    └── user/
        ├── index.ts
        ├── services/user-service.ts
        └── hooks/
            ├── use-update-profile.ts
            └── use-change-password.ts
```

---

## Critérios de Aceite

- [ ] Dashboard layout funcional
- [ ] Navigation filtrada por permissões
- [ ] Profile page edita nome e email
- [ ] Security page altera senha
- [ ] Company page edita dados (com permissão)
- [ ] Forms validados com Zod
- [ ] Toast de feedback
- [ ] Loading states

---

*Task de [Sprint 6](../sprint-06.md)*
