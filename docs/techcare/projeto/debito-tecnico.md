---
title: Débito Técnico
sidebar_position: 2
tags: [techcare, projeto, debito-tecnico, qualidade, convencoes]
---

# Débito Técnico

> O que está registrado aqui não impede o produto de funcionar, mas cobra pedágio em toda alteração futura. Levantado em 17/09/2026.

---

## Alto · Duas convenções de idioma no código

**Não existe padrão de nomenclatura.** O código mistura português e inglês em identificadores, e a divisão não é por camada nem por módulo — é por **idade**. O que foi escrito primeiro está em inglês; o que foi escrito depois, em português.

### Onde está cada uma

| Camada | Convenção | Exemplos |
|--------|-----------|----------|
| Pastas e nomes de feature | **Inglês**, sem exceção | `payment`, `warranty`, `service-order`, `quote` |
| Features antigas (payment, customer, part, quote) | **Inglês** | `serviceOrderId`, `totalPaid`, `canCreate`, `paymentKeys` |
| Código de domínio recente (web) | **Português** | `podeVerDinheiro`, `podeDistribuir`, `minhaBancada`, `naPagina`, `diasDesde` |
| Módulo de garantia (api) | **Português dentro de arquivo inglês** | `issue-warranty.service.ts` usa `acionamento`, `orcamento`, `itens`, `maiorPrazo`, `emitidaEm` |

### Volume

Ocorrências de identificadores em português no `web/src`:

| Termo | Ocorrências |
|-------|-------------|
| `dias` / `diasDesde` / `diasDecorridos` | 152 |
| `garantia` / `garantias` | 127 |
| `ordem` / `ordens` | 109 |
| `orcamento` / `orcamentos` | 108 |
| `etapa` / `etapas` | 64 |
| `motivo` | 54 |
| `prazo` | 46 |
| `pode*` (`podeVerDinheiro`, `podeDistribuir`, `podeIrPara`) | 38 |
| `aba` / `abas` | 44 |
| `pendencia` / `pendencias` | 31 |
| `acionamento` | 19 |

Na `api/src`, o módulo de garantia concentra o resto: 103 `garantia`, 52 `ordem`, 16 `orcamento`, 12 `acionamento`.

Seis arquivos têm **nome** em português, todos recentes:

```
web/src/features/dashboard/components/o-dia.tsx
web/src/features/dashboard/hooks/use-o-dia.ts
web/src/features/quote/lib/prazo-sugerido.ts
web/src/features/service-order/lib/pendencias.ts
web/src/features/service-order/components/service-order-conteudo.tsx
web/src/features/service-order/components/service-order-trilho.tsx
```

### Por que custa

- **Quem entra não tem regra para seguir.** Sem padrão escrito, cada arquivo novo herda o idioma do arquivo vizinho, e a mistura se aprofunda sozinha. Foi exatamente assim que `habilitado` entrou num arquivo 100% inglês (`use-payments.ts`) e precisou ser revertido para `enabled`.
- **Busca fica pela metade.** Procurar `payment` não acha `pagamentos`; procurar `warranty` não acha `garantia`. Em refatoração, some coisa.
- **O mesmo conceito tem dois nomes** no mesmo fluxo: `quote` e `orcamento`, `warranty` e `garantia`, `serviceOrder` e `ordem` convivem em arquivos que se chamam.

### Encaminhamento proposto

Decidir a regra **antes** de renomear qualquer coisa — renomear sem regra só troca uma mistura por outra.

| Opção | O que implica |
|-------|---------------|
| **Tudo em inglês** | Consistente com as pastas, as features antigas e o ecossistema Facter. Renomeia o código recente, que é o mais vivo |
| **Inglês na estrutura, português no domínio** | Oficializa o que já acontece: `payment`/`Payment` como tipo e rota, `podeVerDinheiro` como regra de negócio. Renomeia pouco, mas exige a fronteira escrita para não virar preferência de quem digita |

Seja qual for, o passo seguinte é o mesmo: escrever a regra no `CLAUDE.md` do repositório e só então renomear, módulo por módulo, sem misturar com mudança de comportamento.

---

## Médio · READMEs são resíduo de boilerplate

`api/README.md` e `web/README.md` ainda descrevem o "Facter Boilerplate", com uma estrutura `src/modules/...` que não existe mais. Quem clona e lê o README é orientado errado no primeiro minuto.

A documentação real do produto está nos comentários do `schema.prisma`, nos use-cases, e agora [nesta seção](../produto/visao-geral).

---

## Médio · Campo novo some sem erro

Armadilha que já apareceu três vezes: o Zod das entidades **descarta chave desconhecida em silêncio**, e o `create`/`update` dos repositórios Prisma enumera coluna por coluna.

Campo novo precisa ser adicionado em **três lugares** — entidade, repositório e tipos do web. Esquecer um não gera erro: o valor simplesmente não é gravado.

---

## Baixo · Infraestrutura sem consumidor

| O que | Situação |
|-------|----------|
| **Entitlements** (`CompanyFeature`) | Guard, decorator, repositório e endpoint prontos; `@RequireEntitlement` não decora nenhuma rota |
| **`nodemailer`** | Está nas dependências da API e não é usado em lugar nenhum |
| **Throttler** | Registrado só em produção, e quase todo controller usa `@SkipThrottle()` |

Não atrapalham, mas cada um parece funcionalidade existente para quem lê o código de fora.

---

## Documentos relacionados

- [Limites conhecidos](../produto/limites-conhecidos) — o que falta no produto, visto por quem usa
- [Como testar](./como-testar)
