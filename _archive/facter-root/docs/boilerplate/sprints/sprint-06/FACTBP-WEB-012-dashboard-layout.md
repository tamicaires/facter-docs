# [FACTBP-WEB-012] Dashboard Layout

> Layout principal usando DashboardLayout do DS.

---

## Status: ✅ Concluído (2025-12-17)

## Contexto

**Design System:**
- Usar `DashboardLayout` do @facter/ds-core
- Sidebar colapsável
- Header com user menu
- Breadcrumbs automáticos

---

## Tasks

### Task 12.1: Criar Navigation Config

**Arquivo:** `src/config/navigation.ts`

**Implementação:**
```typescript
import {
  Home,
  Users,
  Settings,
  Building2,
  Shield,
  User,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon?: LucideIcon;
  children?: NavItem[];
  permission?: {
    action: string;
    subject: string;
  };
}

export const navigation: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    title: 'Usuários',
    href: '/users',
    icon: Users,
    permission: { action: 'read', subject: 'User' },
  },
  {
    title: 'Configurações',
    href: '/settings',
    icon: Settings,
    children: [
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
    ],
  },
];

// Filtrar navegação por permissões
export function filterNavByPermissions(
  items: NavItem[],
  can: (action: string, subject: string) => boolean,
): NavItem[] {
  return items
    .filter((item) => {
      if (!item.permission) return true;
      return can(item.permission.action, item.permission.subject);
    })
    .map((item) => ({
      ...item,
      children: item.children
        ? filterNavByPermissions(item.children, can)
        : undefined,
    }))
    .filter((item) => !item.children || item.children.length > 0);
}
```

**Commit:** `[FACTBP-WEB] feat(config): add navigation config`

**Status:** ⏳

---

### Task 12.2: Criar Main Layout

**Arquivo:** `src/app/(main)/layout.tsx`

**Implementação:**
```typescript
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { DashboardLayout } from '@facter/ds-core';
import { useAuth, usePermission, usePermissions, useLogout } from '@/features/auth';
import { navigation, filterNavByPermissions } from '@/config/navigation';
import { ROUTES } from '@/config/routes';
import {
  Building2,
  LogOut,
  Moon,
  Sun,
  User,
  ChevronDown,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Button,
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '@facter/ds-core';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    user,
    isAuthenticated,
    isLoading,
    currentCompanyId,
    currentMembership,
    memberships,
  } = useAuth();
  const { can } = usePermission();
  const { mutate: logout } = useLogout();

  // Carregar permissões
  usePermissions();

  // Redirect se não autenticado
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(ROUTES.LOGIN);
    }
  }, [isLoading, isAuthenticated, router]);

  // Redirect se sem empresa
  useEffect(() => {
    if (!isLoading && isAuthenticated && !currentCompanyId) {
      router.push('/select-company');
    }
  }, [isLoading, isAuthenticated, currentCompanyId, router]);

  if (isLoading || !isAuthenticated || !currentCompanyId) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Filtrar navegação por permissões
  const filteredNav = filterNavByPermissions(navigation, can);

  // Mapear para formato do DS
  const sidebarItems = filteredNav.map((item) => ({
    title: item.title,
    href: item.href,
    icon: item.icon,
    isActive: pathname === item.href || pathname.startsWith(item.href + '/'),
    children: item.children?.map((child) => ({
      title: child.title,
      href: child.href,
      icon: child.icon,
      isActive: pathname === child.href,
    })),
  }));

  // User initials for avatar
  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <DashboardLayout
      sidebar={{
        logo: (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">F</span>
            </div>
            <span className="font-semibold">Facter</span>
          </div>
        ),
        items: sidebarItems,
        footer: (
          <div className="px-3 py-2">
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground"
              onClick={() => logout()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        ),
      }}
      header={{
        breadcrumbs: [], // Auto-generated by DashboardLayout
        rightContent: (
          <div className="flex items-center gap-4">
            {/* Company Selector */}
            {memberships.length > 1 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Building2 className="mr-2 h-4 w-4" />
                    {currentMembership?.companyName}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Trocar empresa</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {memberships.map((m) => (
                    <DropdownMenuItem
                      key={m.id}
                      onClick={() => router.push('/select-company')}
                      className={m.companyId === currentCompanyId ? 'bg-accent' : ''}
                    >
                      {m.companyName}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user?.avatar || undefined} alt={user?.name} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push(ROUTES.PROFILE)}>
                  <User className="mr-2 h-4 w-4" />
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      }}
    >
      {children}
    </DashboardLayout>
  );
}
```

**Commit:** `[FACTBP-WEB] feat(layout): add main layout with DashboardLayout`

**Status:** ⏳

---

### Task 12.3: Criar Theme Toggle (se necessário)

**Arquivo:** `src/components/theme-toggle.tsx`

**Implementação:**
```typescript
'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@facter/ds-core';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
```

**Status:** ⏳

---

## Critérios de Aceite

- [ ] DashboardLayout do DS funcionando
- [ ] Sidebar com navegação filtrada por permissões
- [ ] Header com user menu
- [ ] Company selector (se múltiplas empresas)
- [ ] Logout funciona
- [ ] Redirect correto se não autenticado
- [ ] Loading state enquanto carrega

---

*Task de [Sprint 6](../sprint-06.md)*
