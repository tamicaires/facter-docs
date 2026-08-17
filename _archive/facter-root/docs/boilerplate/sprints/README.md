# Facter Boilerplate - Planejamento de Sprints

> Planejamento do desenvolvimento do Facter Boilerplate.

---

## Status Atual

```
┌─────────────────────────────────────────────────────────────┐
│  ⏸️  SPRINTS PAUSADAS - AGUARDANDO FACTER HUB               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Sprints 1-5: ✅ Concluídas                                 │
│  Sprint 6: ⏸️ Pausada (80% concluído)                       │
│  Sprint 7: ⏳ Pendente                                       │
│                                                             │
│  O boilerplate será refatorado após o Hub MVP para         │
│  integrar via @facter/hub-sdk.                             │
│                                                             │
│  Ver: docs/facter-hub/ROADMAP.md                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Visão Geral

| Sprint | Foco | Histórias | Status |
|--------|------|-----------|--------|
| [Sprint 1](./sprint-01.md) | Fundação Backend | 4 | ✅ Concluído |
| [Sprint 2](./sprint-02.md) | Autenticação Backend | 8 | ✅ Concluído |
| [Sprint 3](./sprint-03.md) | Multi-tenancy & RBAC | 5 | ✅ Concluído |
| [Sprint 4](./sprint-04.md) | Fundação Frontend | 5 | ✅ Concluído |
| [Sprint 5](./sprint-05.md) | Autenticação Frontend | 5 | ✅ Concluído |
| [Sprint 6](./sprint-06.md) | Dashboard & Settings | 5 | ⏸️ Pausado (80%) |
| [Sprint 7](./sprint-07.md) | Infra & Testes | 5 | ⏳ Pendente |

---

## Sprint 6 - Status Detalhado

| História | Status | Observação |
|----------|--------|------------|
| FACTBP-WEB-011 Company Feature | ✅ | Concluído |
| FACTBP-WEB-012 Dashboard Layout | ✅ | Concluído |
| FACTBP-WEB-013 Dashboard Home | ✅ | Concluído |
| FACTBP-WEB-014 Settings Pages | ✅ | Concluído |
| FACTBP-WEB-015 RBAC Components | ⏸️ | Pausado - será refeito com Hub |

**Nota:** RBAC Components será refatorado para usar Entitlements do Hub ao invés de RBAC local.

---

## Legenda

### Status
- ✅ Concluído
- ⏸️ Pausado
- 🔄 Em Progresso
- ⏳ Pendente
- ❌ Bloqueado

### Prefixos de Commit
| Prefixo | Sistema |
|---------|---------|
| `[FACTBP-API]` | Backend (NestJS) |
| `[FACTBP-WEB]` | Frontend (Next.js) |
| `[FACTBP-INFRA]` | Infraestrutura |
| `[FACTBP-DOCS]` | Documentação |

---

## Roadmap Visual

```
SPRINT 1          SPRINT 2          SPRINT 3
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│  FUNDAÇÃO   │──▶│    AUTH     │──▶│   MULTI-    │
│  BACKEND    │   │   BACKEND   │   │  TENANCY    │
│     ✅      │   │     ✅      │   │     ✅      │
└─────────────┘   └─────────────┘   └─────────────┘
                                          │
    ┌─────────────────────────────────────┘
    │
    ▼
SPRINT 4          SPRINT 5          SPRINT 6
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│  FUNDAÇÃO   │──▶│    AUTH     │──▶│  DASHBOARD  │
│  FRONTEND   │   │  FRONTEND   │   │  & SETTINGS │
│     ✅      │   │     ✅      │   │     ⏸️      │
└─────────────┘   └─────────────┘   └─────────────┘
                                          │
                    ┌─────────────────────┘
                    │
                    ▼
              SPRINT 7          REFACTOR
              ┌─────────────┐   ┌─────────────┐
              │   INFRA &   │──▶│  INTEGRAR   │
              │   TESTES    │   │    HUB      │
              │     ⏳      │   │     ⏳      │
              └─────────────┘   └─────────────┘
```

---

## Métricas

| Métrica | Valor |
|---------|-------|
| Total de Sprints | 7 |
| Sprints Concluídas | 5 |
| Sprints Pausadas | 1 |
| Sprints Pendentes | 1 |
| Progresso | ~75% |

---

## Próximos Passos (Pós-Hub)

1. **Criar SDK** - @facter/hub-sdk
2. **Refatorar Auth** - Remover auth próprio, usar SSO
3. **Refatorar Models** - User/Company com hubId
4. **Implementar Entitlements** - Substituir RBAC local
5. **Finalizar Sprint 6** - RBAC Components com Hub
6. **Sprint 7** - Infra & Testes

---

*Última atualização: 2024-12-17*
