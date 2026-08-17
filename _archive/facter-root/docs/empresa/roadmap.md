# Roadmap Facter Soluções

> **Planejamento estratégico de evolução dos produtos.**

---

## Visão Geral 2025

```
Q1 2025          Q2 2025          Q3 2025          Q4 2025
────────────────────────────────────────────────────────────
   │                │                │                │
   ▼                ▼                ▼                ▼
┌──────┐        ┌──────┐        ┌──────┐        ┌──────┐
│TRUCK │        │TECH  │        │VAGAS │        │PORTAL│
│ v1.0 │        │CARE  │        │ v1.0 │        │ v1.0 │
│      │        │ v1.0 │        │      │        │      │
└──────┘        └──────┘        └──────┘        └──────┘
   │                │                │                │
   └────────────────┴────────────────┴────────────────┘
                         │
                    DESIGN SYSTEM
                    EVOLUINDO
```

---

## Facter Truck

### ✅ Concluído
- [x] Arquitetura base (Clean Architecture)
- [x] Módulo de Frotas
- [x] Módulo de Manutenção
- [x] Ordens de Serviço
- [x] Checklists
- [x] Autenticação e Autorização
- [x] Multi-tenant

### 🔄 Em Desenvolvimento
- [ ] Refinamentos de UX
- [ ] Dashboard avançado
- [ ] Relatórios exportáveis
- [ ] Melhorias de performance

### 📋 Planejado
- [ ] App mobile (PWA)
- [ ] Notificações push
- [ ] Integrações externas
- [ ] API pública

---

## Facter TechCare

### 📋 Fase 1 - Fundação
- [ ] Documentação completa de negócio
- [ ] Arquitetura técnica
- [ ] Setup do projeto (boilerplate)
- [ ] Módulo de Clientes
- [ ] Módulo de Equipamentos

### 📋 Fase 2 - Core
- [ ] Ordens de Serviço
- [ ] Orçamentos
- [ ] Gestão de Garantias
- [ ] Controle de Peças

### 📋 Fase 3 - Avançado
- [ ] Dashboard e Relatórios
- [ ] Notificações
- [ ] Portal do Cliente
- [ ] Integrações

---

## Facter Vagas

### 📋 Backlog
- [ ] Documentação de negócio
- [ ] Arquitetura
- [ ] Módulo de Vagas
- [ ] Módulo de Candidatos
- [ ] Pipeline de Seleção
- [ ] Relatórios

---

## Design System

### ✅ Concluído
- [x] Estrutura de monorepo
- [x] @facter/ds-core (14 componentes)
- [x] @facter/ds-utils (formatters, validators)
- [x] ThemeProvider (dark/light mode)
- [x] DataTable com Compound Components

### 🔄 Em Desenvolvimento
- [ ] Testes unitários
- [ ] Storybook

### 📋 Planejado
- [ ] @facter/ds-forms
- [ ] @facter/ds-layouts
- [ ] @facter/ds-charts
- [ ] Documentação interativa

---

## Boilerplate

### 📋 Planejado
- [ ] Estrutura base frontend
- [ ] Estrutura base backend
- [ ] Configurações padrão
- [ ] Receitas documentadas
- [ ] CLI para scaffolding

---

## Infraestrutura

### 🔄 Em Desenvolvimento
- [ ] CI/CD padronizado
- [ ] Docker compose para dev
- [ ] Ambientes (dev, staging, prod)

### 📋 Planejado
- [ ] Monitoramento centralizado
- [ ] Log aggregation
- [ ] APM (Application Performance Monitoring)

---

## Marcos Importantes

| Data | Marco | Status |
|------|-------|--------|
| Q1 2025 | Facter Truck v1.0 | 🔄 |
| Q1 2025 | Design System v1.0 | 🔄 |
| Q1 2025 | Documentação centralizada | 🔄 |
| Q2 2025 | Facter TechCare v1.0 | 📋 |
| Q2 2025 | Boilerplate v1.0 | 📋 |
| Q3 2025 | Facter Vagas v1.0 | 📋 |
| Q4 2025 | Portal Unificado | 📋 |

---

## Métricas de Sucesso

### Qualidade
- Cobertura de testes > 80%
- Zero vulnerabilidades críticas
- Lighthouse score > 90

### Desenvolvimento
- Tempo de setup novo projeto < 1h
- Reutilização de código > 60%
- Documentação 100% atualizada

### Produto
- NPS > 8
- Tempo médio de resolução de bugs < 48h
- Uptime > 99.9%

---

*Roadmap atualizado em: Dezembro 2025*
*Próxima revisão: Março 2025*
