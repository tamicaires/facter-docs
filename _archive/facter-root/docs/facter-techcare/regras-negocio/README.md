# Regras de Negócio - TechCare

> **Documentação das regras de negócio do sistema TechCare.**

---

## Core

| Documento | Descrição |
|-----------|-----------|
| [Ordens de Serviço](./ordens-servico.md) | Ciclo de vida, status, prioridades |
| [Clientes](./clientes.md) | Cadastro, tipos, histórico |
| [Técnicos](./tecnicos.md) | Gestão de equipe técnica |
| [Equipamentos](./equipamentos.md) | Tipos, categorias, marcas |

---

## Operacional

| Documento | Descrição |
|-----------|-----------|
| [Diagnóstico](./diagnostico.md) | Processo de avaliação |
| [Orçamentos](./orcamentos.md) | Geração e aprovação |
| [Estoque](./estoque.md) | Peças e componentes |
| [Garantia](./garantia.md) | Termos e gestão |
| [Agenda](./agenda.md) | Agendamentos e visitas técnicas |

---

## Financeiro

| Documento | Descrição |
|-----------|-----------|
| [Pagamentos](./pagamentos.md) | Formas e registro |
| [Comissões](./comissoes.md) | Cálculo e regras |

---

## Analytics

| Documento | Descrição |
|-----------|-----------|
| [Dashboard](./dashboard.md) | KPIs e métricas |
| [Relatórios](./relatorios.md) | Exportação e análise |

---

## Arquitetura

| Documento | Descrição |
|-----------|-----------|
| [Multi-tenancy](./multi-tenancy.md) | Modo Empresa vs Individual |
| [Permissões](./permissoes.md) | Sistema de Abilities/RBAC |
| [Feature Flags](./feature-flags.md) | Controle centralizado de funcionalidades |
| [Admin Panel](./admin-panel.md) | Painel administrativo da plataforma |
| [Auditoria](./auditoria.md) | Logs e histórico de alterações |

---

## Integrações

| Documento | Descrição |
|-----------|-----------|
| [Notificações](./notificacoes.md) | WhatsApp, Email, SMS |
| [Configurações](./configuracoes.md) | Parâmetros do sistema |
| [Importação/Exportação](./importacao-exportacao.md) | Migração e backup de dados |

---

## Diagrama de Relacionamentos

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              ARQUITETURA                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌────────────────┐     ┌────────────────┐     ┌────────────────┐    │
│   │  Multi-tenant  │────▶│  Feature Flags │────▶│   Abilities    │    │
│   │   (Empresa)    │     │  (O que existe)│     │ (Quem pode)    │    │
│   └────────────────┘     └────────────────┘     └────────────────┘    │
│          │                                                │            │
│          ▼                                                ▼            │
│   ┌────────────────────────────────────────────────────────────┐      │
│   │                    MÓDULOS DE NEGÓCIO                       │      │
│   ├────────────────────────────────────────────────────────────┤      │
│   │  Clientes │ Equipamentos │ OS │ Orçamentos │ Estoque │ ... │      │
│   └────────────────────────────────────────────────────────────┘      │
│          │                                                │            │
│          ▼                                                ▼            │
│   ┌────────────────┐     ┌────────────────┐     ┌────────────────┐    │
│   │  Notificações  │     │    Auditoria   │     │   Dashboard    │    │
│   │ (WhatsApp/SMS) │     │   (Histórico)  │     │   (Métricas)   │    │
│   └────────────────┘     └────────────────┘     └────────────────┘    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Fluxo de Decisão: Feature Flag + Ability

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    USUÁRIO TENTA ACESSAR FUNCIONALIDADE                 │
└────────┬────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    1. VERIFICAR FEATURE FLAG                            │
│                    "Esta feature existe para esta empresa?"             │
└────────┬────────────────────────────────────────────────────────────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
  [SIM]     [NÃO] ────▶ Mostrar "Upgrade de Plano"
    │
    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    2. VERIFICAR ABILITY                                 │
│                    "Este usuário pode executar esta ação?"              │
└────────┬────────────────────────────────────────────────────────────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
  [SIM]     [NÃO] ────▶ Ocultar botão / Mostrar "Sem permissão"
    │
    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    ✅ PERMITIR ACESSO                                   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

**Voltar para** [TechCare](../README.md)
