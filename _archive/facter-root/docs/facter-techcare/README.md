# Facter TechCare

> **Sistema de Gestão de Assistência Técnica**
> Gerenciamento completo de ordens de serviço, clientes, técnicos e estoque para assistências técnicas.

---

## Status do Projeto

| Aspecto | Status |
|---------|--------|
| Fase | Planejamento concluído |
| Documentação | ✅ Completa |
| Desenvolvimento | Pronto para iniciar |

---

## Visão Geral

O Facter TechCare é um sistema completo para gestão de assistências técnicas, permitindo:

- **Gestão de Ordens de Serviço**: Criação, acompanhamento e finalização de OS
- **Gestão de Clientes**: Cadastro, histórico e comunicação
- **Gestão de Técnicos**: Alocação, agenda e performance
- **Controle de Estoque**: Peças, componentes e insumos
- **Financeiro**: Orçamentos, pagamentos e relatórios
- **Relatórios**: Dashboards e métricas de performance

---

## Módulos

### Core

| Módulo | Descrição | Documentação |
|--------|-----------|--------------|
| [Ordens de Serviço](./regras-negocio/ordens-servico.md) | Gestão completa de OS | ✅ |
| [Clientes](./regras-negocio/clientes.md) | Cadastro e histórico | ✅ |
| [Técnicos](./regras-negocio/tecnicos.md) | Gestão de equipe | ✅ |
| [Equipamentos](./regras-negocio/equipamentos.md) | Tipos e categorias | ✅ |

### Operacional

| Módulo | Descrição | Documentação |
|--------|-----------|--------------|
| [Diagnóstico](./regras-negocio/diagnostico.md) | Avaliação técnica | ✅ |
| [Orçamentos](./regras-negocio/orcamentos.md) | Geração e aprovação | ✅ |
| [Peças e Estoque](./regras-negocio/estoque.md) | Controle de inventário | ✅ |
| [Garantia](./regras-negocio/garantia.md) | Gestão de garantias | ✅ |

### Financeiro

| Módulo | Descrição | Documentação |
|--------|-----------|--------------|
| [Pagamentos](./regras-negocio/pagamentos.md) | Recebimentos e formas | ✅ |
| [Comissões](./regras-negocio/comissoes.md) | Cálculo para técnicos | ✅ |

### Analytics

| Módulo | Descrição | Documentação |
|--------|-----------|--------------|
| [Dashboard](./regras-negocio/dashboard.md) | Métricas e KPIs | ✅ |
| [Relatórios](./regras-negocio/relatorios.md) | Exportação e análise | ✅ |

---

## Documentação

| Seção | Descrição | Status |
|-------|-----------|--------|
| [Regras de Negócio](./regras-negocio/) | Lógica e comportamentos do sistema | ✅ |
| [API](./api/) | Endpoints REST documentados | ✅ |
| [Entidades](./entidades/) | Modelo de dados e relacionamentos | ✅ |
| [Fluxos](./fluxos/) | Diagramas de processo | ✅ |
| [Backend](./backend/) | Arquitetura e módulos NestJS | ✅ |
| [Frontend](./frontend/) | Arquitetura e páginas React | ✅ |

---

## Arquitetura

```
facter-techcare/
├── apps/
│   ├── web/                 # Frontend React
│   └── api/                 # Backend NestJS
│
├── packages/
│   └── shared/              # Tipos e schemas compartilhados
│
└── docs/                    # Esta documentação
```

### Stack Tecnológica

| Camada | Tecnologia |
|--------|------------|
| Frontend | React 18, TypeScript, Vite |
| UI | @facter/ds-core, TailwindCSS |
| Estado | Zustand (UI), TanStack Query (Server) |
| Backend | NestJS, TypeScript |
| Banco de Dados | PostgreSQL, Prisma |
| Autenticação | JWT, RBAC |
| Infra | Docker, AWS |

---

## Personas

### Atendente
- Recebe equipamentos
- Cria ordens de serviço
- Atende clientes
- Registra pagamentos

### Técnico
- Realiza diagnósticos
- Executa reparos
- Solicita peças
- Atualiza status da OS

### Gerente
- Visualiza dashboards
- Aprova orçamentos especiais
- Gerencia equipe
- Acessa relatórios

### Administrador
- Configura sistema
- Gerencia usuários
- Define parâmetros
- Acessa tudo

---

## Fluxo Principal

```
[Recebimento] → [Triagem] → [Diagnóstico] → [Orçamento]
                                                ↓
                                            [Aprovação]
                                                ↓
[Entrega] ← [Finalização] ← [Execução] ← [Aguardando Peças]
                                                ↓
                                           [Pagamento]
```

---

## Integrações

### Planejadas

| Sistema | Tipo | Uso |
|---------|------|-----|
| WhatsApp | API | Notificações ao cliente |
| NFe | API | Emissão de notas |
| Correios | API | Rastreamento |
| PagSeguro/Stripe | API | Pagamentos online |

---

## Roadmap

### MVP (v1.0)
- [ ] Cadastro de clientes
- [ ] Cadastro de equipamentos
- [ ] Ordens de serviço básicas
- [ ] Status e timeline
- [ ] Orçamento simples
- [ ] Controle de estoque básico

### v1.1
- [ ] Dashboard com métricas
- [ ] Notificações por email
- [ ] Impressão de OS
- [ ] Relatórios básicos

### v1.2
- [ ] Integração WhatsApp
- [ ] Comissões de técnicos
- [ ] Garantias
- [ ] App mobile (PWA)

### v2.0
- [ ] Multi-unidade
- [ ] Integração fiscal
- [ ] BI avançado
- [ ] API pública

---

## Links Úteis

- [Padrões de Desenvolvimento](../padroes/)
- [Design System](../design-system/)
- [Templates](../templates/)
- [Boilerplate](../boilerplate/)

---

**Voltar para** [Documentação](../README.md)
