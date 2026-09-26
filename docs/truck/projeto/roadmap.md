---
title: "Roadmap"
sidebar_position: 1
tags: [roadmap, v2, lancamento, planejamento]
---

# Roadmap

A meta é lançar o Facter Truck no começo de 2027 sobre a v2 do núcleo, em cerca de 19 a 22 semanas a partir da aprovação (com o ecossistema completo no lançamento), o que leva a data para o fim de fevereiro a meados de março de 2027, contando o recesso de fim de ano do [ADR-010](../engenharia/adrs/adr-010-v2-do-nucleo.md). O plano anterior (1º trimestre de 2026) está em [legado](../engenharia/legado-v1/roadmap-2026-q1.md).

## Fases

Cada fase tem um critério de saída verificável. Nenhuma fase começa sem a anterior cumprir o critério.

| Fase | Semanas | Entregas | Critério de saída | Status |
| --- | --- | --- | --- | --- |
| 0. Decisões e alicerce | 1–2 | Escopo congelado, [invariantes](../engenharia/invariantes.md) revisados, ADRs fundacionais, schema v2 do núcleo aprovado, projeto novo com CI, TS strict, testes de integração com Postgres real e OpenAPI | CI verde com um teste de integração; schema aprovado | Planejamento |
| 1. Plataforma | 3–5 | Módulo `plataforma` destacável para o futuro Hub (identidade, empresas, membros, permissões, "Quero isso", notificações), multiempresa com RLS, permissões v2, auth com cookie httpOnly e refresh, outbox + fila, jobs com lock, observabilidade, deploy automatizado | Suíte de isolamento: empresa B não lê nem altera nada da A em nenhuma rota | — |
| 2. Núcleo de domínio | 5–12 | Ativos unificados, ordem de serviço, serviços com executores e sessões de trabalho, estoque com livro de movimentações e aprovação segregada, custos em `numeric`. Pneus com ciclo de vida e recapagem sobre eventos idempotentes. Checklists com vínculo a serviço e ordem | Todos os invariantes do núcleo com teste de integração, incluindo concorrência | — |
| 3. Frontend v2 | 8–15 | App novo em `apps/web` só com `@facter/ds-core`, casca portada do app atual (HTTP, auth, permissões, mutations), tipos de `packages/contracts`, cache por empresa, telas de todos os módulos do lançamento | Jornadas críticas passando no Playwright contra a v2 | — |
| 4. Indicadores de decisão e endurecimento | 15–19 | Indicadores de decisão (custo por veículo, frota e km; disponibilidade; tempo parado por motivo; retrabalho; falhas recorrentes por componente; consumo de peças) sobre tabelas de agregação, rateio completo com fechamento de período, teste de carga, revisão de segurança, piloto com um cliente | Metas de performance atingidas; zero achado crítico aberto | — |

Prazos em ordem de grandeza, supondo a arquiteta trabalhando em par com o Claude.

## Ecossistema e piloto

A primeira meta é a Suzano, que traz os parceiros. O Truck atende um ecossistema: embarcador, transportadoras, oficinas e socorro terceirizados, cada organização dona dos próprios dados, com compartilhamento concedido por nível ([ADR-011](../engenharia/adrs/adr-011-ecossistema-e-compartilhamento.md)).

- **Lançamento único (decidido em 26/09/2026):** Suzano e parceiros (ex.: Vale das Carretas) juntos, com grupo econômico, compartilhamento por nível, solicitação de manutenção entre organizações e estoque consignado. Clientes isolados, sem ecossistema, usam o mesmo sistema sem concessões.

**Decisões de modelo tomadas em 26/09/2026**, todas no schema desde a fase 0: várias bases por organização (cada uma com boxes e depósitos, com transferência entre depósitos); histórico de engate carreta–cavalo, com custo seguindo o ativo e OS aceitando ativo avulso; histórico de operador (a frota muda de transportadora); peças serializadas opcionais (bateria, compressor…), com o pneu como caso especial; depósito com dono e local separados (consignado); oficina declara os tipos de ativo que atende (só carretas, só cavalos ou ambos), e a mesma composição pode ser mantida por duas oficinas, com custo consolidado para o dono.

**Identificação de ativos em três níveis** (26/09/2026), com os termos do [CTB, Anexo I](https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm) (definições no [glossário](../produto/glossario.md#termos-da-v2)):

| Nível | O que é | Identificação |
| --- | --- | --- |
| Veículo | Unidade física com tipo formal: caminhão-trator, caminhão, semirreboque, reboque ou dolly | Placa, chassi e Renavam (permanente) |
| Conjunto de implementos | Implementos que andam juntos, em ordem, sob um número de frota | Frota + posição (tela: "Frota 1234 · carreta 2/2 · QRT4B22") |
| Combinação (CVC) | Unidade tratora engatada num conjunto, num período | Tratora + frota, com início e fim |

Tipos de conjunto cadastráveis (bitrem, tritrem, rodotrem com dolly, hexatrem, vanderleia, Romeu e Julieta), cada veículo com seu layout de eixos. A tela usa o nome do dia a dia; cadastro e relatórios, o tipo formal. A OS mira o conjunto, um implemento ou um ponto exato (eixo, lado, roda). Histórico e custo ficam no veículo físico. O km de um implemento é calculado pelo histórico de engate, somando o que as unidades tratoras rodaram com ele: isso dá CPK de implemento e km dos pneus montados nele.

## Dados primeiro

O que o Truck vende é informação para decidir: custo por veículo e por frota, previsibilidade, saber onde investir. Por isso a v2 grava os fatos desde o primeiro dia, mesmo quando o relatório que os usa ainda não existe: km/horas em cada entrada na oficina, componente e causa de cada serviço, vínculo de retrabalho, sessões de trabalho, consumo de peça com preço congelado e data de consumo, tempo parado por motivo. Relatório se constrói depois; fato não gravado não se recupera (a issue #56 é o exemplo).

## Registrar sem atrito

Mais informação não pode custar mais trabalho: se registrar pesa, o mecânico para de registrar ou registra errado, e dado ruim é pior que nenhum.

1. O que o sistema pode inferir, ele não pergunta: horário vem do servidor, executor de quem está logado, componente e causa pré-sugeridos pelo tipo de serviço e pelo histórico do veículo.
2. Pergunta no momento natural: componente ao criar o serviço, motivo da pausa com um toque ao pausar.
3. Poucos campos obrigatórios; enriquecer depois é opcional e nunca trava o fluxo.
4. Atrito é métrica: ver metas de uso em [métricas](../engenharia/padroes/metricas-e-definicao-de-pronto.md). Funcionalidade que piora essas metas volta para o desenho.

## Dois modos: operação no tablet, gestão no notebook

A oficina produz o dado no tablet; donos e chefias, que compram o sistema e decidem com os dados, usam notebook. Um app e um design system, com duas gramáticas: **operação** (tablet primeiro, toque, captura rápida, tolerante a sinal ruim) e **gestão** (notebook primeiro, densa, comparativa, com filtro por frota, veículo e período, clique no número para chegar às ordens que o compõem e exportação). As telas de gestão são a vitrine de venda e nunca são a tela do tablet esticada.

**Operação:**


- Telas de operação (kanban, detalhe da OS, execução, requisição de peça) desenhadas primeiro para tablet: toque, retrato e paisagem, alvos grandes, nada que dependa de hover. Celular com a versão enxuta do mecânico; notebook projetado para gestão, indicadores e configuração.
- PWA instalável que abre sem rede. Ações do mecânico entram numa fila local, são enviadas quando a rede volta e aparecem como pendentes; `Idempotency-Key` e versão garantem que reenvio não duplica e conflito volta como 409.
- Tablet compartilhado: o aparelho fica logado na empresa e cada pessoa se identifica por matrícula e PIN em segundos, para que toda ação tenha autor.
- Metas de uso medidas num tablet Android intermediário, não na máquina de desenvolvimento.
- Câmera pelo navegador para fotos de peça, dano e placa. Sem app nativo no lançamento.

**Gestão:**

- Resumo semanal por e-mail para donos e chefias (custo da semana, veículos que mais pararam, retrabalho, o que mudou), sobre as tabelas de agregação. Leva a informação a quem não entra todo dia; soma cerca de 2 dias.

## Em breve para os clientes

O que fica para depois do lançamento aparece para o cliente sem prometer data:

- Aviso no lugar onde a funcionalidade vai morar, dizendo o que já está sendo coletado ("Preventiva: em breve. O histórico de km deste veículo já está sendo registrado").
- Botão "Quero isso" que registra empresa e usuário: a demanda real prioriza o que vem primeiro (ver [proposta](../produto/propostas/aprender-com-o-cliente.mdx)).
- Tela de Novidades e Em breve, sem datas.
- Nada de item de menu desabilitado espalhado pelo app nem tela vazia "em construção".

## Design system

O `@facter/ds-core` evolui puxado pela web v2, não como um projeto v2 separado.

- Toda tela da web v2 usa o ds-core. Componente que falta ou não serve é criado ou melhorado **no DS**, com versão nova, nunca como componente local em `apps/web`.
- O DS continua no próprio repositório, porque é compartilhado entre os produtos Facter. Em desenvolvimento, `apps/web` usa a cópia local (`pnpm link`); publica-se quando a mudança estabiliza.
- Antes da fase 3: revisão crítica curta do DS focada nos componentes que as telas do lançamento usam (API do componente, acessibilidade, mobile), gerando a lista priorizada de melhorias.

## Escopo do lançamento

| Módulo | Lançamento | Motivo |
| --- | --- | --- |
| Empresas, usuários, membros, permissões | Sim | Plataforma |
| Ativos (veículo, reboque, composição, eixos, posições) | Sim | Base de tudo |
| Ordem de serviço, serviços, executores | Sim | Fluxo principal |
| Peças, estoque, requisições | Sim | O custo da ordem depende disso |
| Funcionários, cargos, turnos, boxes | Sim | Necessário para executar ordens |
| Notas e anexos da ordem | Sim | Baixo custo, uso diário |
| Indicadores de decisão | Sim | 13 indicadores, ver [definições](../produto/indicadores-de-decisao.md); determinam os fatos que o schema grava |
| Resumo semanal por e-mail para donos e chefias | Sim (decidido em 26/09/2026) | Recorte semanal dos indicadores de decisão; no piloto, é a prova de valor que chega sem o dono entrar no sistema; soma cerca de 2 dias |
| Rateio de materiais compartilhados (completo) | Sim (decidido em 26/09/2026) | Sem ele o custo por veículo sai subestimado; soma 1–1,5 semana |
| Pneus e recapagem | Sim (decidido em 26/09/2026) | Reescrito sobre eventos idempotentes; soma 2–3 semanas |
| Checklists | Sim (decidido em 26/09/2026) | Com `company_id` e gerando serviço a partir de não conformidade; soma 1–2 semanas |
| Aprender com o cliente: "Quero isso", analytics de uso, feedback no contexto, Novidades | Sim, se a [proposta](../produto/propostas/aprender-com-o-cliente.mdx) for aprovada | Sem isso o roadmap pós-lançamento é decidido por intuição; soma cerca de 1 semana |
| Preventiva | Logo depois do lançamento | Reescrita completa; nasce com histórico porque km, leituras e componentes são gravados desde o primeiro dia |
| Analytics completo | Depois | Depende de tabelas de agregação |
| Centros de custo (hierarquia, orçamento) | Depois | O rateio não depende deles |
| Socorro mecânico | Depois | Independente do núcleo |
| Integrações e telemática | Depois | Nunca rodou no v1 |

## Decisões em aberto

- [x] ADR-010 aprovado (26/09/2026)
- [x] Pneus e checklists entram no lançamento: sim
- [x] Time até o lançamento: a arquiteta com o Claude
- [x] Lançamento único, sem etapa de piloto separada
- [ ] Data de lançamento: com o escopo atual, fim de fevereiro a meados de março de 2027 se a fase 0 começar em 1º/10
- [ ] Camada SaaS do lançamento (planos, importação, configurações, LGPD, backoffice, anexos): ver [Plataforma SaaS](./plataforma-saas.md); soma 2–3 semanas
- [ ] Congelar o escopo: o que vier depois de 26/09/2026 entra como primeira entrega pós-lançamento
- [x] Indicadores de decisão: 13 no lançamento, definidos em [Indicadores de decisão](../produto/indicadores-de-decisao.md)
- [ ] **Reabrir a hospedagem da API** (vira ADR-012): o Render não tem região no Brasil ([render.com/docs/regions](https://render.com/docs/regions)), e o Neon tem São Paulo ([neon.com/docs/introduction/regions](https://neon.com/docs/introduction/regions)). API e banco precisam ficar na mesma região, e dados no Brasil pesam na homologação. Avaliar Fly.io (GRU), Google Cloud Run (southamerica-east1) e AWS (sa-east-1), com Neon em São Paulo; a web pode seguir na Vercel
- [x] Tablets: Android e iPad; o PWA é desenhado para o caso mais restritivo (iPad: push só a partir do iOS 16.4, armazenamento local que o sistema pode apagar, então a fila local confirma o envio e avisa o que ficou pendente)
- [x] Repositório novo: monorepo `facter-truck` com `apps/api`, `apps/web` e `packages/contracts` (pnpm + turbo)
- [x] Frontend também na v2: app novo usando só o `@facter/ds-core`, portando o código bom do app atual
- [x] Hospedagem: web na Vercel (`apps/web`); API e worker da fila no Render (`apps/api`); Redis no Render Key Value; Postgres no Neon ou Render (com Neon, contexto de RLS via `SET LOCAL` por transação)
- [ ] Papéis padrão do produto e o que cada um pode fazer
- [ ] O que conta como tempo trabalhado ([SVC-7](../engenharia/invariantes.md))

## Enquanto a v2 não sai

Nenhuma funcionalidade nova no v1. Correção só se bloquear uma demonstração. Toda regra de negócio descoberta no v1 vira invariante ou teste para a v2.
