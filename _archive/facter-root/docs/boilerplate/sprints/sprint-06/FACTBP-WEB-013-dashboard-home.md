# [FACTBP-WEB-013] Dashboard Home

> Página inicial do dashboard.

---

## Status: ✅ Concluído (2025-12-17)

## Contexto

**Dashboard Home:**
- Welcome message personalizado
- Cards de métricas
- Atividades recentes (placeholder)
- Quick actions

---

## Tasks

### Task 13.1: Criar Dashboard Page

**Arquivo:** `src/app/(main)/dashboard/page.tsx`

**Implementação:**
```typescript
import { Metadata } from 'next';
import { WelcomeCard } from './_components/welcome-card';
import { StatsCards } from './_components/stats-cards';
import { QuickActions } from './_components/quick-actions';
import { RecentActivity } from './_components/recent-activity';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Visão geral do sistema',
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <WelcomeCard />
      <StatsCards />
      <div className="grid gap-6 md:grid-cols-2">
        <QuickActions />
        <RecentActivity />
      </div>
    </div>
  );
}
```

**Commit:** `[FACTBP-WEB] feat(dashboard): add dashboard page`

**Status:** ⏳

---

### Task 13.2: Criar Welcome Card

**Arquivo:** `src/app/(main)/dashboard/_components/welcome-card.tsx`

**Implementação:**
```typescript
'use client';

import { useAuth } from '@/features/auth';
import { Card, CardContent } from '@facter/ds-core';

export function WelcomeCard() {
  const { user, currentMembership } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              {getGreeting()}, {user?.name?.split(' ')[0]}!
            </h1>
            <p className="text-muted-foreground mt-1">
              {currentMembership?.companyName} &middot;{' '}
              <span className="capitalize">{currentMembership?.role}</span>
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString('pt-BR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

**Status:** ⏳

---

### Task 13.3: Criar Stats Cards

**Arquivo:** `src/app/(main)/dashboard/_components/stats-cards.tsx`

**Implementação:**
```typescript
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@facter/ds-core';
import { Users, Building2, TrendingUp, Activity } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  description?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

function StatCard({ title, value, description, icon, trend }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div
            className={`text-xs flex items-center mt-2 ${
              trend.isPositive ? 'text-success' : 'text-destructive'
            }`}
          >
            <TrendingUp
              className={`h-3 w-3 mr-1 ${!trend.isPositive && 'rotate-180'}`}
            />
            {trend.value}% em relação ao mês anterior
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function StatsCards() {
  // TODO: Buscar dados reais da API
  const stats = [
    {
      title: 'Total de Usuários',
      value: '24',
      description: 'Usuários ativos na empresa',
      icon: <Users className="h-4 w-4" />,
      trend: { value: 12, isPositive: true },
    },
    {
      title: 'Membros Ativos',
      value: '18',
      description: 'Acessaram nos últimos 7 dias',
      icon: <Activity className="h-4 w-4" />,
    },
    {
      title: 'Empresas',
      value: '1',
      description: 'Empresas vinculadas',
      icon: <Building2 className="h-4 w-4" />,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
}
```

**Status:** ⏳

---

### Task 13.4: Criar Quick Actions

**Arquivo:** `src/app/(main)/dashboard/_components/quick-actions.tsx`

**Implementação:**
```typescript
'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@facter/ds-core';
import { usePermission } from '@/features/auth';
import { UserPlus, Settings, Building2, Shield } from 'lucide-react';
import { ROUTES } from '@/config/routes';

interface QuickAction {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  permission?: { action: string; subject: string };
}

export function QuickActions() {
  const router = useRouter();
  const { can } = usePermission();

  const actions: QuickAction[] = [
    {
      title: 'Novo Usuário',
      description: 'Adicionar membro à equipe',
      icon: <UserPlus className="h-4 w-4" />,
      href: ROUTES.USER_CREATE,
      permission: { action: 'create', subject: 'User' },
    },
    {
      title: 'Configurações',
      description: 'Ajustar preferências',
      icon: <Settings className="h-4 w-4" />,
      href: ROUTES.SETTINGS,
    },
    {
      title: 'Empresa',
      description: 'Gerenciar dados da empresa',
      icon: <Building2 className="h-4 w-4" />,
      href: ROUTES.COMPANY_SETTINGS,
      permission: { action: 'update', subject: 'Company' },
    },
  ];

  const visibleActions = actions.filter((action) => {
    if (!action.permission) return true;
    return can(action.permission.action as any, action.permission.subject as any);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">
        {visibleActions.map((action) => (
          <Button
            key={action.href}
            variant="outline"
            className="justify-start h-auto py-3"
            onClick={() => router.push(action.href)}
          >
            <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center text-primary mr-3">
              {action.icon}
            </div>
            <div className="text-left">
              <div className="font-medium">{action.title}</div>
              <div className="text-xs text-muted-foreground">
                {action.description}
              </div>
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
```

**Status:** ⏳

---

### Task 13.5: Criar Recent Activity

**Arquivo:** `src/app/(main)/dashboard/_components/recent-activity.tsx`

**Implementação:**
```typescript
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@facter/ds-core';
import { User, Settings, LogIn } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

interface Activity {
  id: string;
  type: 'login' | 'update' | 'create';
  description: string;
  timestamp: Date;
}

export function RecentActivity() {
  // TODO: Buscar dados reais da API
  const activities: Activity[] = [
    {
      id: '1',
      type: 'login',
      description: 'Você fez login no sistema',
      timestamp: new Date(),
    },
    {
      id: '2',
      type: 'update',
      description: 'Perfil atualizado',
      timestamp: new Date(Date.now() - 3600000),
    },
    {
      id: '3',
      type: 'create',
      description: 'Conta criada',
      timestamp: new Date(Date.now() - 86400000),
    },
  ];

  const getIcon = (type: Activity['type']) => {
    switch (type) {
      case 'login':
        return <LogIn className="h-4 w-4" />;
      case 'update':
        return <Settings className="h-4 w-4" />;
      case 'create':
        return <User className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Atividade Recente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                {getIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">{activity.description}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDateTime(activity.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

**Commit:** `[FACTBP-WEB] feat(dashboard): add dashboard components`

**Status:** ⏳

---

## Critérios de Aceite

- [ ] Welcome card com nome e empresa
- [ ] Stats cards com métricas
- [ ] Quick actions filtradas por permissão
- [ ] Recent activity com histórico
- [ ] Layout responsivo
- [ ] Dados placeholder (pode ser estático inicialmente)

---

*Task de [Sprint 6](../sprint-06.md)*
