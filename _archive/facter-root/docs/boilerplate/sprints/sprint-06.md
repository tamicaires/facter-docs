# Sprint 6 - Dashboard & Settings

> Dashboard layout, seleção de empresa e páginas de configurações.

---

## Resumo

| Item | Valor |
|------|-------|
| **Objetivo** | Dashboard funcional com settings |
| **Histórias** | 5 |
| **Tasks** | 23 |
| **Status** | 🔄 Em Progresso |
| **Dependências** | Sprint 3, Sprint 5 |

---

## Histórias

### [FACTBP-WEB-011] Company Feature

**Descrição:** Feature de empresa com types, service e hooks.

**Tasks:**

| # | Task | Status |
|---|------|--------|
| 11.1 | Criar `features/company/types/index.ts` | ✅ |
| 11.2 | Criar `features/company/services/company-service.ts` | ✅ |
| 11.3 | Criar `features/company/hooks/use-company.ts` | ✅ |
| 11.4 | Criar `features/company/hooks/use-update-company.ts` | ✅ |

**Commits esperados:**
```
[FACTBP-WEB] feat(company): add company store
[FACTBP-WEB] feat(company): add useCompanies hook
[FACTBP-WEB] feat(company): add select-company page
```

---

### [FACTBP-WEB-012] Dashboard Layout

**Descrição:** Layout principal usando DashboardLayout do DS.

**Tasks:**

| # | Task | Status |
|---|------|--------|
| 12.1 | Criar `app/(main)/layout.tsx` com DashboardLayout | ✅ |
| 12.2 | Configurar sidebar navigation | ✅ |
| 12.3 | Configurar header com user menu | ✅ |
| 12.4 | Implementar theme toggle | ⏳ (opcional) |

**Commits esperados:**
```
[FACTBP-WEB] feat(layout): add main layout with DashboardLayout
[FACTBP-WEB] feat(layout): configure sidebar navigation
[FACTBP-WEB] feat(layout): add header with user menu
```

**Navigation Config:**
```typescript
// config/navigation.ts
export const navigation = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    title: 'Configurações',
    href: '/settings',
    icon: Settings,
    children: [
      { title: 'Perfil', href: '/settings/profile' },
      { title: 'Segurança', href: '/settings/security' },
      { title: 'Empresa', href: '/settings/company' },
    ],
  },
]
```

---

### [FACTBP-WEB-013] Dashboard Home

**Descrição:** Página inicial do dashboard.

**Tasks:**

| # | Task | Status |
|---|------|--------|
| 13.1 | Criar `app/(main)/dashboard/page.tsx` | ✅ |
| 13.2 | Criar componentes de welcome/stats | ✅ |

**Commits esperados:**
```
[FACTBP-WEB] feat(dashboard): add dashboard home page
[FACTBP-WEB] feat(dashboard): add welcome and stats components
```

---

### [FACTBP-WEB-014] Settings Pages

**Descrição:** Páginas de configurações (perfil, segurança, empresa).

**Tasks:**

| # | Task | Status |
|---|------|--------|
| 14.1 | Criar `app/(main)/settings/layout.tsx` | ✅ |
| 14.2 | Criar `app/(main)/settings/profile/page.tsx` | ✅ |
| 14.3 | Criar `app/(main)/settings/security/page.tsx` | ✅ |
| 14.4 | Criar `app/(main)/settings/company/page.tsx` | ✅ |

**Commits esperados:**
```
[FACTBP-WEB] feat(settings): add settings layout
[FACTBP-WEB] feat(settings): add profile page
[FACTBP-WEB] feat(settings): add security page (change password)
[FACTBP-WEB] feat(settings): add company settings page
```

---

### [FACTBP-WEB-015] RBAC Components

**Descrição:** Componentes e hooks de permissões no frontend.

**Tasks:**

| # | Task | Status |
|---|------|--------|
| 15.1 | Criar types de permissões | ⏳ |
| 15.2 | Criar permissions store | ⏳ |
| 15.3 | Criar permissions service | ⏳ |
| 15.4 | Criar usePermissions hook | ⏳ |
| 15.5 | Criar useCan, useCanAny, useCanAll hooks | ⏳ |
| 15.6 | Criar Can, CanAny, CanAll components | ⏳ |
| 15.7 | Criar PermissionsProvider | ⏳ |
| 15.8 | Criar barrel export | ⏳ |
| 15.9 | Integrar no layout principal | ⏳ |

**Arquivo detalhado:** [FACTBP-WEB-015](./sprint-06/FACTBP-WEB-015-rbac-components.md)

---

## Critérios de Aceite

- [ ] Seleção de empresa funciona
- [ ] Company salva em cookie e header
- [ ] Sidebar navigation funcional
- [ ] Theme toggle (light/dark)
- [ ] Breadcrumbs automáticos
- [ ] Profile: editar nome, email, avatar
- [ ] Security: alterar senha
- [ ] Company: editar dados da empresa
- [ ] Can component renderiza condicionalmente
- [ ] useCan hook funciona corretamente
- [ ] PermissionsProvider sincroniza com backend

---

## Arquivos a Criar

```
src/
├── app/
│   └── (main)/
│       ├── layout.tsx
│       ├── select-company/
│       │   └── page.tsx
│       ├── dashboard/
│       │   └── page.tsx
│       └── settings/
│           ├── layout.tsx
│           ├── profile/
│           │   └── page.tsx
│           ├── security/
│           │   └── page.tsx
│           └── company/
│               └── page.tsx
├── config/
│   └── navigation.ts
└── features/
    ├── company/
    │   ├── stores/
    │   │   └── company-store.ts
    │   ├── hooks/
    │   │   └── use-companies.ts
    │   ├── services/
    │   │   └── company-service.ts
    │   └── index.ts
    └── user/
        ├── hooks/
        │   ├── use-update-profile.ts
        │   └── use-change-password.ts
        └── services/
            └── user-service.ts
```

---

*Sprint 6 de 7*
