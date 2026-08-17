# Facter Platform

> **Arquitetura centralizada para o ecossistema de produtos Facter.**

---

## Visão Geral

A Facter Platform é uma camada central que conecta e gerencia todos os produtos do ecossistema Facter, fornecendo serviços compartilhados e uma experiência administrativa unificada.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FACTER PLATFORM                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌────────────────────────────────────────────────────────────────────┐   │
│   │                        FACTER HUB                                   │   │
│   │                   (Admin Central - hub.facter.app)                  │   │
│   ├────────────────────────────────────────────────────────────────────┤   │
│   │  • Dashboard Global          • Gestão de Produtos                  │   │
│   │  • Billing Unificado         • Analytics Cross-Product             │   │
│   │  • Clientes Facter           • Feature Flags Globais               │   │
│   └────────────────────────────────────────────────────────────────────┘   │
│                                      │                                      │
│   ┌──────────────────────────────────┼──────────────────────────────────┐  │
│   │                      FACTER CORE (Shared Services)                   │  │
│   │                        (api.facter.app/core)                         │  │
│   ├─────────────────────────────────────────────────────────────────────┤  │
│   │  • Identity Service    • Billing Service    • Feature Service       │  │
│   │  • Product Registry    • Notification Hub   • Analytics Service     │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                      │                                      │
│          ┌───────────────────────────┼───────────────────────────┐         │
│          │                           │                           │         │
│          ▼                           ▼                           ▼         │
│   ┌──────────────┐           ┌──────────────┐           ┌──────────────┐  │
│   │   TechCare   │           │  Produto 2   │           │  Produto N   │  │
│   │              │           │              │           │              │  │
│   │ techcare.app │           │ produto2.app │           │ produtoN.app │  │
│   ├──────────────┤           ├──────────────┤           ├──────────────┤  │
│   │ • API        │           │ • API        │           │ • API        │  │
│   │ • Database   │           │ • Database   │           │ • Database   │  │
│   │ • Admin      │           │ • Admin      │           │ • Admin      │  │
│   └──────────────┘           └──────────────┘           └──────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Componentes

### 1. [Facter Core](./core/README.md)
Serviços compartilhados entre todos os produtos:
- **Identity**: Autenticação e gestão de usuários/clientes Facter
- **Billing**: Integração com gateway de pagamento centralizado
- **Features**: Sistema de feature flags global
- **Products**: Registro e configuração de produtos
- **Notifications**: Hub central de notificações

### 2. [Facter Hub](./hub/README.md)
Painel administrativo central:
- Dashboard com métricas de todos os produtos
- Gestão de clientes cross-product
- Billing e assinaturas unificados
- Feature flags globais e por produto
- Analytics e relatórios consolidados

### 3. Produtos (Independentes)
Cada produto do ecossistema:
- Banco de dados próprio
- API própria
- Admin embutido (específico do produto)
- Integração com Facter Core via SDK/API

---

## Benefícios

| Aspecto | Sem Platform | Com Platform |
|---------|--------------|--------------|
| Login Admin | Um por produto | SSO único |
| Billing | Gateway por produto | Um gateway central |
| Cliente | Cadastro separado | Cadastro único Facter |
| Fatura | Uma por produto | Uma fatura consolidada |
| Bundles | Não possível | Descontos cross-product |
| Analytics | Isolados | Visão 360° do cliente |
| Suporte | Fragmentado | Histórico unificado |

---

## Estrutura de URLs

| Componente | URL | Descrição |
|------------|-----|-----------|
| Facter Hub | `hub.facter.app` | Admin central |
| Facter Core API | `api.facter.app` | Serviços compartilhados |
| TechCare | `techcare.app` | Produto - App principal |
| TechCare API | `api.techcare.app` | Produto - API |
| Produto 2 | `produto2.app` | Produto - App principal |

---

## Documentação

| Seção | Descrição |
|-------|-----------|
| [Arquitetura](./arquitetura.md) | Visão técnica detalhada |
| [Core - Entidades](./core/entidades/) | Modelos de dados centrais |
| [Core - Serviços](./core/servicos/) | Serviços compartilhados |
| [Hub - Interface](./hub/interface/) | Telas do admin central |
| [Hub - API](./hub/api/) | Endpoints do hub |
| [Integração](./integracao/) | Como produtos se integram |
| [SDK](./sdk/) | SDK para produtos |

---

## Roadmap de Implementação

### Fase 1: Foundation (Com 1º produto)
- [ ] TechCare funcionando standalone
- [ ] Admin do TechCare completo
- [ ] Billing no próprio TechCare

### Fase 2: Core Services (Com 2º produto)
- [ ] Extrair Identity para Facter Core
- [ ] Extrair Billing para Facter Core
- [ ] Criar Product Registry
- [ ] SDK básico de integração

### Fase 3: Hub (Com 3+ produtos)
- [ ] Facter Hub MVP
- [ ] Dashboard consolidado
- [ ] Gestão de clientes cross-product
- [ ] Billing unificado

### Fase 4: Scale
- [ ] Analytics avançado
- [ ] Bundles e promoções
- [ ] Marketplace de integrações
- [ ] White-label para parceiros

---

**Documentação dos Produtos:**
- [TechCare](../facter-techcare/README.md)
