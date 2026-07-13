---
title: "ADR-004: Checklist Refactoring"
sidebar_position: 4
tags: [adr, checklist, refactoring, frontend, zustand]
---

# ADR-004: Checklist System Refactoring

**Status:** Aprovado (Janeiro 2025)

---

## Contexto

O sistema de Checklist apresentava 8 problemas criticos que impactavam UX e estabilidade:

1. **N+1 requests**: Cada click de conformidade disparava 1 request HTTP
2. **Sem optimistic updates**: ~200ms de latencia por interacao
3. **Estado fragmentado**: Dividido entre `useState` e `useQuery`
4. **Race conditions**: Clicks rapidos causavam inconsistencias
5. **Props drilling**: Dados passados por muitos niveis de componentes
6. **Features incompletas**: Batch sync nao implementado
7. **DS desatualizado**: Componentes usando `@/components/ui/*` em vez de `@facter/ds-core`
8. **Performance ruim**: Re-renders excessivos

---

## Decisao

Adotar **Zustand store como SSOT** (Single Source of Truth) com **optimistic updates** e **batch sync**.

### Arquitetura

```
┌──────────────────────────────────────────┐
│          ZUSTAND STORE (SSOT)            │
│  Map<itemId, { conformity, notes }>       │
└──────────────────┬───────────────────────┘
                   │
            Debounce 500ms
                   │
                   ▼
┌──────────────────────────────────────────┐
│  PATCH /checklist-item/conformity/batch  │
│  Envia apenas itens modificados           │
└──────────────────┬───────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────┐
│  Backend: transacao Prisma atomica        │
└──────────────────────────────────────────┘
```

### ConformityStatus

5 status possiveis: `CONFORME`, `NAO_CONFORME`, `NAO_APLICAVEL`, `PENDENTE`, `NAO_VERIFICADO`

---

## Implementacao

6 fases, 30 tasks (FACTCK-0110 a FACTCK-0139):

| Fase | Descricao | Tasks |
|------|-----------|-------|
| 1 | Backend: endpoint batch | 5 |
| 2 | Zustand store + hooks | 5 |
| 3 | Migracao de componentes | 6 |
| 4 | Migracao para DS | 5 |
| 5 | Testes | 5 |
| 6 | Cleanup | 4 |

---

## Resultados

| Metrica | Antes | Depois |
|---------|-------|--------|
| Latencia por click | ~200ms | ~0ms (otimista) |
| Requests por checklist | N (1 por item) | 1 (batch) |
| Race conditions | Possiveis | Eliminadas |
| Estado | Fragmentado (useState + useQuery) | Unificado (Zustand SSOT) |

---

## Consequencias

**Positivas:**
- UX drasticamente melhor (feedback instantaneo)
- Menos carga no backend (batch em vez de N requests)
- Estado previsivel e testavel
- Migracao para Design System

**Negativas:**
- Complexidade adicional do sync otimista
- Necessidade de tratar conflitos (checklist editado por dois usuarios)

---

## Referencias

- [Checklist Module](../modulos/checklist) -- Documentacao tecnica do modulo
