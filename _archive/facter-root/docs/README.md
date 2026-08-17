# Facter Soluções - Central de Documentação

> **Portal oficial de documentação técnica e de negócio do ecossistema Facter.**

---

## Navegação Rápida

| Seção | Descrição | Status |
|-------|-----------|--------|
| [Empresa](./empresa/) | Visão, missão, ecossistema | ✅ |
| [Padrões](./padroes/) | Padrões globais de desenvolvimento | ✅ |
| [Design System](./design-system/) | Componentes e tokens UI | ✅ |
| [Boilerplate](./boilerplate/) | Base para novos projetos | 🔄 |
| [Facter Truck](./facter-truck/) | Sistema de Gestão de Manutenção 360 | 🔄 |
| [Facter TechCare](./facter-techcare/) | Sistema de Assistência Técnica | 🔄 |
| [Facter Vagas](./facter-vagas/) | Sistema de Gestão de Vagas | 📋 |

**Legenda:** ✅ Documentado | 🔄 Em desenvolvimento | 📋 Planejado

---

## Ecossistema Facter

```
┌─────────────────────────────────────────────────────────────────┐
│                      FACTER SOLUÇÕES                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│   │   TRUCK     │  │  TECHCARE   │  │    VAGAS    │            │
│   │  Manutenção │  │ Assistência │  │   Emprego   │            │
│   │     360     │  │   Técnica   │  │             │            │
│   └──────┬──────┘  └──────┬──────┘  └──────┬──────┘            │
│          │                │                │                    │
│          └────────────────┼────────────────┘                    │
│                           │                                     │
│                    ┌──────┴──────┐                              │
│                    │   DESIGN    │                              │
│                    │   SYSTEM    │                              │
│                    └──────┬──────┘                              │
│                           │                                     │
│                    ┌──────┴──────┐                              │
│                    │ BOILERPLATE │                              │
│                    └─────────────┘                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Estrutura da Documentação

Cada produto segue uma estrutura padronizada com 3 pilares:

### 1. Negócio (`negocio/`)
- Visão geral do produto
- Personas e jornadas de usuário
- Regras de negócio detalhadas
- Casos de uso

**Público:** Product Owners, Stakeholders, Desenvolvedores

### 2. Técnico (`tecnico/`)
- Arquitetura e decisões técnicas
- Stack tecnológica
- Banco de dados (modelo ER, entidades)
- API (endpoints, contratos)
- Frontend (rotas, estado, features)

**Público:** Desenvolvedores, Tech Leads

### 3. Operacional (`operacional/`)
- Guias de deploy
- Configurações de ambiente
- Troubleshooting
- Runbooks

**Público:** DevOps, Suporte, SRE

---

## Como Contribuir

### Criando Nova Documentação

1. Use os [templates](./templates/) disponíveis
2. Siga os [padrões de escrita](./padroes/processos/documentacao.md)
3. Mantenha a estrutura de pastas padrão

### Convenções

- **Arquivos:** kebab-case (`regra-negocio.md`)
- **Títulos:** Português brasileiro
- **Código:** Inglês
- **Commits:** Conventional Commits

---

## Links Úteis

### Repositórios
- [facter-truck](../facter-truck/) - Sistema de Manutenção
- [facter-design-system](../facter-design-system/) - Design System
- [facter-techcare](../facter-techcare/) - Assistência Técnica (futuro)
- [facter-vagas](../facter-vagas/) - Gestão de Vagas (futuro)

### Recursos Externos
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
- [React Docs](https://react.dev/)
- [NestJS Docs](https://docs.nestjs.com/)
- [Prisma Docs](https://www.prisma.io/docs)

---

## Contato

**Facter Soluções**
- Website: [facter.com.br](https://facter.com.br)
- Email: contato@facter.com.br

---

*Última atualização: Dezembro 2025*
