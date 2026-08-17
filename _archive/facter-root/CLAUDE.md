# Facter - Contexto do Ecossistema

Ecossistema SaaS multi-tenant: **Truck** (frotas, produção), **Hub** (SSO/billing, em dev), **TechCare/Vagas/Pet** (planejados). Todos compartilham stack, DS e padrões abaixo.

## Estrutura

```
facter/
├── facter-truck/            # Em produção (API NestJS + App React/Vite)
├── facter-hub/              # Em desenvolvimento (API + Web + SDK)
├── facter-design-system/    # @facter/ds-core (npm)
├── facter-boilerplate/      # Pausado
└── CLAUDE.md                # Este arquivo
```

## Regras Obrigatórias (todos os projetos)

### Arquitetura Limpa
- Use cases usam APENAS abstrações (repositories abstratos, services injetados)
- NUNCA acessar PrismaService, Redis ou HTTP clients diretamente em use cases
- Repositories: abstract class em `core/domain/repositories/`, implementação Prisma em `infra/repositories/`

### Qualidade
- Testes obrigatórios para todo código novo (cenários de sucesso E erro)
- Zero `any`, zero `@ts-ignore`, zero `value!` (non-null assertion)
- Gambiarras proibidas: `try {} catch {}` vazio, `as any`, defaults para esconder undefined
- Zod para runtime validation, DomainErrors para erros de negócio
- Comentários: explique POR QUÊ, nunca O QUÊ

### Performance
- N+1 queries PROIBIDO — usar includes/joins
- Agregações complexas no banco (SQL), nunca em JS
- Paginação obrigatória para listas

### Design System First
- Verificar `@facter/ds-core` ANTES de criar qualquer componente UI
- Se não existe no DS mas deveria: PARAR, explicar, aguardar aprovação
- Se existe: usar. Nunca recriar localmente
- Form: usar `Form` compound component do DS (Form.Input, Form.Select, etc.)
- Dialog vs Página: 1-6 campos → Dialog, 7+ campos → Página com seções

### Desvios
Qualquer desvio dos padrões deve ser explicado, analisado e aprovado pelo usuário.

## Commits

Formato: `[PREFIXO] tipo(escopo): mensagem` (inglês, max 4 linhas)
Tipos: feat, fix, docs, refactor, test, chore
Prefixos: `[FACTRK]` Truck, `[FACTDS]` DS, `[FHUB-API]`/`[FHUB-WEB]` Hub, `[FACTBP-API]`/`[FACTBP-WEB]` Boilerplate
**NUNCA** adicionar Co-Authored-By ou mencionar IA/Claude nos commits.

## Referências

- Padrões de código: ver CLAUDE.md de cada projeto filho
- DS docs: `facter-design-system/CLAUDE.md`
- Masks disponíveis no DS: phone, cpf, cnpj, cep, money, percent, plate, date, time, datetime
