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

## Baixo · "Oficina" no vocabulário interno

O TechCare é um sistema de **assistência técnica**, e "oficina" é palavra de mecânica. O termo entrou cedo e se espalhou: em 18/09/2026 havia 32 ocorrências em 20 arquivos.

As que o usuário lia foram corrigidas para **assistência** — o aviso na página pública do orçamento, o status "Equipamento na assistência", a contagem de "aparelhos na assistência" em O Dia, a ficha do cliente, o catálogo de serviços e a tela de equipe.

Restam **14 arquivos com o termo em comentários de código**, entre eles `middleware.ts`, `prazo-sugerido.ts`, `quem-segura.ts`, `service-order-stepper.tsx`, `use-service-order-actions.tsx`, `use-customer-profile.ts` e `use-o-dia.ts`.

Não muda comportamento nem aparece para ninguém de fora, mas desalinha o vocabulário de quem lê o código do vocabulário de quem usa o produto — e o próprio código já se contradiz: `service-order/types/index.ts` diz "são os itens de uma assistência de informática" poucas linhas acima de um comentário que fala em oficina.

Vale corrigir quando se passar por cada arquivo, não numa varredura própria.

---

## Médio · READMEs são resíduo de boilerplate

`api/README.md` e `web/README.md` ainda descrevem o "Facter Boilerplate", com uma estrutura `src/modules/...` que não existe mais. Quem clona e lê o README é orientado errado no primeiro minuto.

A documentação real do produto está nos comentários do `schema.prisma`, nos use-cases, e agora [nesta seção](../produto/visao-geral).

---

## Médio · Campo novo some sem erro

Armadilha que já apareceu três vezes: o Zod das entidades **descarta chave desconhecida em silêncio**, e o `create`/`update` dos repositórios Prisma enumera coluna por coluna.

Campo novo precisa ser adicionado em **três lugares** — entidade, repositório e tipos do web. Esquecer um não gera erro: o valor simplesmente não é gravado.

---

## Alto · O design system não chega no app por link

O `pnpm-workspace.yaml` do `web` declara `@facter/ds-core` como link para a pasta irmã `facter-design-system`. **Esse link não funciona.** Quando o `pnpm install` o materializa como atalho, o Next deixa de resolver o pacote e o app não sobe — `Module not found: Can't resolve '@facter/ds-core'`.

O que existe hoje em `node_modules/@facter/ds-core` é uma **cópia** do pacote, não um atalho. Não é descuido: é contorno.

Consequências:

- **Mudança no design system não chega sozinha.** É preciso `pnpm build` em `packages/core` e copiar o `dist` para dentro do `node_modules` do web, à mão. Entre 11/09 e 17/09 nenhuma alteração do DS chegou a este app.
- **Nenhum CI builda o `web`** do jeito que está. É o obstáculo direto para subir homologação.

Saídas possíveis: publicar o pacote no registro e versionar a dependência; transformar os dois repositórios num workspace de verdade; ou configurar o Next para resolver fora da raiz. A primeira é a que destrava CI.

---

## Alto · O cache não sabe de que empresa é

Nenhuma chave de consulta do React Query carrega o `companyId`. `['service-orders']` é literalmente a mesma chave nas quatro empresas, e o cache de uma vale para a outra.

Apareceu como bug na troca de empresa: a tela continuava mostrando ordens, valores e clientes da empresa anterior sob o nome da nova. A correção aplicada descarta o cache inteiro ao trocar (`removeQueries`), que resolve o sintoma — as telas voltam para "carregando", que é a verdade.

A causa continua: **duas empresas compartilham chave**. Enquanto for assim, qualquer caminho que reaproveite cache entre tenants mostra dado de quem não devia. O certo é o `companyId` entrar na chave de toda consulta, como já entra em todo `where` do servidor.

---

## Baixo · A foto de perfil ainda não tem para onde ir

**Resolvido em parte, em 18/09/2026.** `PATCH /users/me` não existia e salvar o perfil respondia 404; o endpoint foi implementado junto da tela de equipe.

O que continua: `userService.uploadAvatar` chama `/users/me/avatar`, que não existe, e o botão "Alterar foto" não tem `onClick` — não faz nada, nem o 404. Depende da funcionalidade de upload, que não existe em lugar nenhum do produto (ver [Limites conhecidos](../produto/limites-conhecidos)).

Enquanto isso, `User.avatar` e `Company.logo` são campos que a interface não tem como preencher.

---

## Médio · O dashboard responde número errado

Dois defeitos no `GetDashboardMetricsUseCase`, os dois de leitura:

| Campo | O que devolve | O que deveria |
|-------|---------------|---------------|
| `pendingAmount` | **Sempre 0** — o `getSummary` filtra `status: PAID` antes de agrupar, então `byStatus.PENDING` nunca tem nada | O que está pendente de fato |
| `completedToday` | `byStatus[COMPLETED]` — o **total histórico** de concluídas, sem filtro de data nenhum | As concluídas hoje |

Há um terceiro, mais amplo: **`startDate`/`endDate` só chegam ao repositório de pagamentos.** As métricas de ordens, clientes e equipamentos ignoram o período por completo e devolvem sempre o total histórico, mesmo quando a chamada pede um intervalo.

Nenhum desses campos tem consumidor hoje (ver abaixo), então o erro não está visível. Mas ele passa a valer no dia em que a tela de relatórios for ligada — e aí seria um número errado numa tela de números.

---

## Médio · Código morto

| O que | Tamanho | Situação |
|-------|---------|----------|
| `features/dashboard`: `metric-card`, `payment-summary-card`, `recent-orders-card`, `status-bar-chart` | ~1.100 linhas | Zero consumidores |
| `useDashboardMetrics` / `useDashboardSummary` | — | Nunca chamados |
| `stats-card` | — | Só em `/demo-stats`, com dados fixos |
| `features/service-order/components/service-order-form.tsx` | — | Nenhuma rota usa; a página `/service-orders/new` tem o seu próprio formulário |

Não é desperdício puro: os componentes de gráfico são a metade adiantada da tela de relatórios, e vale mantê-los **se** essa tela estiver no plano. O que não dá é deixá-los sem marcação — quem lê o código hoje não distingue "pronto para ligar" de "esquecido".

O `service-order-form.tsx` é caso diferente: é uma segunda versão do mesmo formulário, e nele o `PhotoUpload` está montado mas nunca entra no envio. Duplicata que confunde.

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
