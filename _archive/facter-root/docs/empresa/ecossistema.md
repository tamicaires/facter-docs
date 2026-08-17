# Ecossistema Facter

> **Visão completa dos produtos e como se conectam.**

---

## Arquitetura do Ecossistema

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CAMADA DE APLICAÇÃO                           │
├─────────────────┬─────────────────┬─────────────────┬───────────────────┤
│                 │                 │                 │                   │
│  FACTER TRUCK   │ FACTER TECHCARE │  FACTER VAGAS   │    [FUTUROS]      │
│                 │                 │                 │                   │
│  • Frotas       │  • Clientes     │  • Vagas        │                   │
│  • Manutenção   │  • Equipamentos │  • Candidatos   │                   │
│  • OS           │  • OS           │  • Processos    │                   │
│  • Checklists   │  • Orçamentos   │  • Entrevistas  │                   │
│  • Peças        │  • Garantias    │  • Contratações │                   │
│                 │                 │                 │                   │
├─────────────────┴─────────────────┴─────────────────┴───────────────────┤
│                           CAMADA COMPARTILHADA                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    │
│   │  DESIGN SYSTEM  │    │   BOILERPLATE   │    │    PADRÕES      │    │
│   │                 │    │                 │    │                 │    │
│   │  • Componentes  │    │  • Estrutura    │    │  • Código       │    │
│   │  • Tokens       │    │  • Config       │    │  • Arquitetura  │    │
│   │  • Utilidades   │    │  • Receitas     │    │  • Processos    │    │
│   └─────────────────┘    └─────────────────┘    └─────────────────┘    │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                           CAMADA DE FUNDAÇÃO                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   React + TypeScript │ NestJS │ PostgreSQL │ Prisma │ Docker            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Produtos

### Facter Truck
**Sistema de Gestão de Manutenção 360**

| Aspecto | Descrição |
|---------|-----------|
| **Público-alvo** | Empresas com frotas de veículos |
| **Problema que resolve** | Gestão descentralizada de manutenção, falta de visibilidade |
| **Diferenciais** | Manutenção preventiva, checklists, controle de peças |

**Módulos principais:**
- Gestão de Frotas (veículos, reboques, pneus)
- Ordens de Serviço
- Manutenção Preventiva
- Checklists de Inspeção
- Controle de Peças e Estoque
- Dashboard e Relatórios

---

### Facter TechCare
**Sistema de Gerenciamento para Assistências Técnicas**

| Aspecto | Descrição |
|---------|-----------|
| **Público-alvo** | Assistências técnicas, oficinas especializadas |
| **Problema que resolve** | Controle manual de OS, perda de histórico, gestão de garantias |
| **Diferenciais** | Histórico completo do equipamento, controle de garantias, orçamentos |

**Módulos planejados:**
- Cadastro de Clientes
- Cadastro de Equipamentos
- Ordens de Serviço
- Orçamentos
- Gestão de Garantias
- Controle de Peças e Estoque
- Relatórios e Métricas

---

### Facter Vagas
**Sistema de Gestão de Vagas de Emprego**

| Aspecto | Descrição |
|---------|-----------|
| **Público-alvo** | RH de empresas, agências de emprego |
| **Problema que resolve** | Processo seletivo desorganizado, perda de candidatos |
| **Diferenciais** | Pipeline visual, histórico de candidatos, métricas de processo |

**Módulos planejados:**
- Gestão de Vagas
- Banco de Candidatos
- Pipeline de Seleção
- Agendamento de Entrevistas
- Avaliações
- Contratações
- Relatórios

---

## Componentes Compartilhados

### Design System (@facter/ds-*)

Biblioteca de componentes UI que garante consistência visual:

```typescript
// Uso em qualquer produto Facter
import { Button, Input, DataTable } from '@facter/ds-core'
import { formatCurrency, validateCPF } from '@facter/ds-utils'
```

**Packages:**
- `@facter/ds-core` - Componentes base
- `@facter/ds-utils` - Utilitários e formatters

---

### Boilerplate

Template base para novos projetos com:
- Estrutura de pastas padronizada
- Configurações pré-definidas (ESLint, TypeScript, etc)
- Receitas para funcionalidades comuns
- Integração com Design System

---

### Padrões

Documentação de padrões que todos os projetos seguem:
- Padrões de código (Clean Code, SOLID)
- Padrões de arquitetura
- Padrões de infraestrutura
- Processos de desenvolvimento

---

## Integrações Futuras

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   TRUCK     │────▶│  TECHCARE   │────▶│    VAGAS    │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────┐
│                  PORTAL UNIFICADO                   │
│           (SSO, Dashboard Consolidado)              │
└─────────────────────────────────────────────────────┘
```

**Possibilidades:**
- SSO (Single Sign-On) entre produtos
- Dashboard consolidado
- Relatórios cross-product
- API Gateway unificada

---

## Roadmap de Integração

| Fase | Objetivo | Produtos |
|------|----------|----------|
| **1** | Produtos independentes | Truck, TechCare |
| **2** | Design System consolidado | Todos |
| **3** | Boilerplate maduro | Novos projetos |
| **4** | Integrações cross-product | Truck + TechCare |
| **5** | Portal unificado | Todos |

---

*Documento vivo - atualizado conforme evolução do ecossistema*
