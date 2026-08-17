# Facter Boilerplate - Documentação

> Template base para produtos do ecossistema Facter (Truck, Vagas, TechCare, etc).

---

## Status do Projeto

```
┌─────────────────────────────────────────────────────────────┐
│  ⏸️  PROJETO PAUSADO - MUDANÇA DE ESTRATÉGIA                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Data: 17/12/2024                                          │
│  Motivo: Desenvolvimento do Facter Hub                      │
│                                                             │
│  O Facter Hub é um sistema centralizado que gerencia:       │
│  • SSO (Single Sign-On) para todos os produtos             │
│  • Billing centralizado (Stripe)                           │
│  • Entitlements (permissões por plano)                     │
│  • Feature Flags                                           │
│  • Analytics e Support                                      │
│                                                             │
│  Após o Hub estar pronto, o boilerplate será refatorado    │
│  para integrar com ele via SDK (@facter/hub-sdk).          │
│                                                             │
│  Ver: docs/facter-hub/                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Progresso Atual

| Sprint | Foco | Status |
|--------|------|--------|
| Sprint 1 | Fundação Backend | ✅ Concluído |
| Sprint 2 | Autenticação Backend | ✅ Concluído |
| Sprint 3 | Multi-tenancy & RBAC | ✅ Concluído |
| Sprint 4 | Fundação Frontend | ✅ Concluído |
| Sprint 5 | Autenticação Frontend | ✅ Concluído |
| Sprint 6 | Dashboard & Settings | ⏸️ Pausado (80%) |
| Sprint 7 | Infra & Testes | ⏳ Pendente |

**Progresso Geral: ~75%**

---

## O que foi feito

### Backend (facter-boilerplate-api)
- ✅ Setup NestJS 11 + Prisma
- ✅ Config validation (Zod)
- ✅ Core domain (entities, repositories)
- ✅ Auth completo (login, register, refresh token, password recovery)
- ✅ Multi-tenancy (companies, memberships)
- ✅ RBAC com CASL
- ✅ Guards (auth, company, permission)
- ✅ Cache service (Redis)
- ✅ Mail service

### Frontend (facter-boilerplate-web)
- ✅ Setup Next.js 15 + TypeScript
- ✅ Design System integrado (@facter/ds-core)
- ✅ API client com interceptors
- ✅ Auth store (Zustand)
- ✅ Auth pages (login, register, forgot/reset password)
- ✅ Auth middleware
- ✅ Dashboard layout (DashboardLayout do DS)
- ✅ Settings pages (profile, security, company)
- ⏸️ RBAC components (pendente)

---

## O que muda com o Hub

Quando o Hub estiver pronto, o boilerplate será refatorado:

| Área | Antes (Atual) | Depois (Com Hub) |
|------|---------------|------------------|
| Auth | Login próprio | SSO via Hub |
| Users | Tabela completa | User com `hubId` |
| Companies | Tabela completa | Company com `hubId` |
| Billing | Não existe | Via Hub |
| Permissões | RBAC local | Entitlements via Hub |
| Feature Flags | Não existe | Via Hub SDK |

---

## Documentação

| Arquivo | Descrição |
|---------|-----------|
| [especificacao.md](./especificacao.md) | Stack, estrutura de pastas, patterns |
| [features.md](./features.md) | Features Core e Opcionais |
| [arquitetura.md](./arquitetura.md) | Arquitetura completa |
| [checklist.md](./checklist.md) | Progresso de implementação |
| [auth-architecture.md](./auth-architecture.md) | Arquitetura de autenticação |
| [sprints/](./sprints/) | Planejamento de sprints |

---

## Repositórios

| Repo | Descrição | Stack |
|------|-----------|-------|
| facter-boilerplate-api | Backend | NestJS 11, Prisma, PostgreSQL |
| facter-boilerplate-web | Frontend | Next.js 15, TypeScript, Tailwind |

---

## Próximos Passos

1. **Aguardar Facter Hub MVP** - Identity, Companies, Entitlements
2. **Criar @facter/hub-sdk** - SDK de integração
3. **Refatorar Boilerplate** - Integrar com Hub
4. **Finalizar Sprint 6 e 7** - Com integração Hub

---

## Quick Start (Estado Atual)

```bash
# Backend
cd facter-boilerplate/facter-boilerplate-api
pnpm install
cp .env.example .env
pnpm prisma migrate dev
pnpm start:dev

# Frontend
cd facter-boilerplate/facter-boilerplate-web
pnpm install
cp .env.example .env.local
pnpm dev
```

---

*Última atualização: 2024-12-17*
