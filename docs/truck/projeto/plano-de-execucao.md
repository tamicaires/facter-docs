---
sidebar_position: 1.5
---

# Plano de execução

As fases do [roadmap](./roadmap.md) quebradas em tasks. Cada fase fecha uma **fatia vertical**: API, tela e teste juntos, rodando em homologação, para alguém de fora usar. Nenhuma fase começa sem a anterior cumprir o critério de saída.

Semana 1 = 1º/10/2026. Lançamento na semana 24 (meados de março de 2027). Prazos em ordem de grandeza, com a arquiteta em par com o Claude.

**Status:** ✅ feito · 🟡 em andamento ou esperando decisão · ⬜ a fazer

## Fase 0 · Alicerce (semanas 1–2)

Saída: CI verde com teste de integração; schema do núcleo aprovado.

| ID | Task | Pronto quando | Status |
| --- | --- | --- | --- |
| 0.1 | Monorepo pnpm + turbo, TS strict, lint com tipos | `pnpm lint typecheck` zerados | ✅ |
| 0.2 | API NestJS + Prisma 7 + RLS | Testes de isolamento passando com papel sem BYPASSRLS | ✅ |
| 0.3 | Web Vite + React + ds-core, contrato OpenAPI tipado | Tela lê a API pelo cliente tipado | ✅ |
| 0.4 | CI: lint, typecheck, testes com Postgres, drift do OpenAPI, build | Verde no GitHub | ✅ |
| 0.5 | ds-core: um arquivo por componente e vocabulário de tons | Merge e versão minor publicada no npm | 🟡 merge feito; falta publicar |
| 0.6 | Schema do núcleo aprovado | As 8 páginas do [schema v2](../engenharia/schema-v2/visao-geral.md) revisadas e os "pontos para decidir" fechados | ✅ aprovado em 26/09/2026, com as correções da revisão crítica |
| 0.7 | Invariantes revisados | [Invariantes](../engenharia/invariantes.md) com id estável e dono, sem pendência | ✅ 78 invariantes, todos decididos |
| 0.8 | Padrão de módulo no código | Um módulo exemplo com a estrutura do CLAUDE.md: erro com código, paginação, `Idempotency-Key`, teste de rota gerado | ✅ `assets/vehicles`, 38 testes |
| 0.9 | Congelar o escopo | Decisão registrada no roadmap | 🟡 decisão |

## Fase 1 · Plataforma e ativos (semanas 3–6)

Saída: **fatia 1 em homologação**. Empresa B não lê nem altera nada da empresa A em nenhuma rota, e o time de teste cadastra a frota real.

| ID | Task | Pronto quando | Status |
| --- | --- | --- | --- |
| 1.1 | Identidade: login, sessão em cookie httpOnly ([ADR-015](../engenharia/adrs/adr-015-sessao-opaca-em-cookie.md)), convite, primeiro acesso, redefinir senha | Fluxos com teste de integração; senha nunca volta na resposta | 🟡 login, sessão, troca de empresa e saída feitos; convite e senha esperam o e-mail (1.8) |
| 1.2 | Organização, grupo econômico, membros e bases | Troca de empresa sem vazar cache; RLS em toda tabela nova (teste de cobertura) | ⬜ |
| 1.3 | Permissões v2: 12 papéis padrão, escopos E/B/P, negar por padrão | Teste gerado por rota e papel conforme a [matriz](../produto/papeis-e-permissoes.md) | ⬜ |
| 1.4 | Matrícula + PIN no tablet compartilhado | Troca de pessoa em segundos; toda ação com autor | ⬜ |
| 1.5 | Hospedagem (ADR-012) e deploy automatizado em homologação | Push na `main` publica em homologação, em região no Brasil | ⬜ prazo: fim da fase |
| 1.6 | Outbox, fila e jobs com lock | Evento gravado na mesma transação; reenvio não duplica | ⬜ |
| 1.7 | Observabilidade | Log estruturado com id da requisição, p95 por rota, alerta de erro | ⬜ |
| 1.8 | E-mail transacional e notificação no app (mínimo) | Convite e redefinição chegam por e-mail | ⬜ |
| 1.9 | Revisão curta do DS para as telas do lançamento | Lista priorizada de melhorias (API, acessibilidade, tablet) | ⬜ |
| 1.10 | Casca da web: auth, layout, troca de empresa, permissões na tela, i18n | Menu e ações seguem o papel; nenhum texto fora do arquivo de tradução | ⬜ |
| 1.11 | Ativos: veículos por tipo do CTB, eixos e posições, conjuntos, engate (CVC) com histórico, operador, hodômetro | Cadastro e engate pela tela; km do implemento calculado pelo engate | ⬜ |
| 1.12 | Importação de planilha de veículos e conjuntos | Frota real do piloto importada, com relatório de linhas recusadas | ⬜ |
| 1.13 | Linha de base de performance: base com 100 mil OS e veículos, p95 por rota medido a cada push na `main` | Metas de p95 do CLAUDE.md verificadas desde a fatia 1, não só na fase 4 | ⬜ |

**Quem testa a fatia 1:** o marido da arquiteta, com a frota real. Login, empresa, membros com papéis diferentes (tentando ver o que não devia) e cadastro de ativos.

## Fase 2 · Oficina (semanas 7–11)

Saída: **fatia 2 em homologação**. Uma OS real feita do começo ao fim no tablet, com custo de mão de obra e de peça.

| ID | Task | Pronto quando | Status |
| --- | --- | --- | --- |
| 2.1 | Catálogos: tipos de serviço, componentes, causas, motivos de parada | Sugestão de componente e causa pelo tipo de serviço | ⬜ |
| 2.2 | Pessoas: funcionários, cargos, turnos, boxes | Executor escolhido por cargo e turno | ⬜ |
| 2.3 | Ordem de serviço: abertura no conjunto, implemento ou posição; km na entrada; kanban | Invariantes da OS com teste, incluindo concorrência | ⬜ |
| 2.4 | Serviços, executores e sessões de trabalho (iniciar, pausar com motivo, concluir) | Tempo trabalhado conforme SVC-7 (pausa nunca conta); horário vem do servidor | ⬜ |
| 2.5 | Estoque: catálogo, depósitos (dono e local, consignado), livro de movimentações, saldo | Saldo sempre igual à soma do livro (teste) | ⬜ |
| 2.6 | Requisição com aprovação segregada e consumo na OS com preço congelado | Quem pede não aprova; custo da OS não muda quando o preço muda | ⬜ |
| 2.7 | Itens serializados e transferência entre depósitos | Um serializado nunca está em dois lugares | ⬜ |
| 2.8 | Notas, anexos (storage de objetos) e OS em PDF | PDF com veículo, km, serviços, peças, custos e assinatura | ⬜ |
| 2.9 | PWA: instalável, fila local de ações, uso com sinal ruim | Ação offline sincroniza sem duplicar; conflito volta como 409 e aparece | ⬜ |
| 2.10 | Metas de uso medidas num tablet Android intermediário | Metas de [métricas](../engenharia/padroes/metricas-e-definicao-de-pronto.md) atingidas | ⬜ |

## Fase 3 · Pneus, checklists e ecossistema (semanas 12–17)

Saída: **fatia 3 em homologação**. A Suzano e um parceiro (ex.: Vale das Carretas) operam juntos, cada um com seus dados, com compartilhamento concedido.

| ID | Task | Pronto quando | Status |
| --- | --- | --- | --- |
| 3.1 | Pneus: ciclo de vida, vidas e recapagem, montagem por posição, inspeções, km pelo engate | Eventos idempotentes; custo por km do pneu | ⬜ espera a doc de pneus |
| 3.2 | Checklists: modelos, execução no tablet, não conformidade gera serviço | Não conformidade vira serviço na OS | ⬜ |
| 3.3 | Ecossistema: compartilhamento por nível, solicitação de manutenção entre organizações, oficina por tipo de ativo | Parceiro vê só o que foi concedido (teste por nível) | ⬜ |
| 3.4 | Planos, módulos contratáveis e feature flags; "Em breve" e "Quero isso" | Módulo desligado some da API e da tela | ⬜ |
| 3.5 | Configurações da empresa, idioma e moeda | Tela de configurações; valor monetário guarda a moeda | ⬜ |
| 3.6 | Importação do restante: peças, estoque inicial, funcionários, SmartQuestion, Excel de pneus | Dados do piloto importados e conferidos com o cliente | ⬜ |
| 3.7 | Confiança: SSO OIDC, termos com aceite, auditoria administrativa, revisão de acessos | Login com Entra ID; relatório de acessos exportável | ⬜ |
| 3.8 | Backoffice mínimo e organização de demonstração | Time cria empresa, plano e flags sem mexer no banco | ⬜ |

## Fase 4 · Indicadores e endurecimento (semanas 18–22)

Saída: metas de performance atingidas e nenhum achado crítico aberto.

| ID | Task | Pronto quando | Status |
| --- | --- | --- | --- |
| 4.1 | Tabelas de agregação e os 13 [indicadores de decisão](../produto/indicadores-de-decisao.md) | Clique no número chega às ordens que o compõem | ⬜ |
| 4.2 | Telas de gestão no notebook: filtros por frota, veículo e período, exportação CSV | Nunca é a tela do tablet esticada | ⬜ |
| 4.3 | Rateio completo com fechamento de período | Custo por veículo inclui o compartilhado; período fechado não muda | ⬜ |
| 4.4 | Resumo semanal por e-mail para donos e chefias | Chega toda segunda com os números da semana | ⬜ |
| 4.5 | Playwright nas jornadas críticas | Rodando no CI | ⬜ |
| 4.6 | Teste de carga com usuários simultâneos sobre a base de 100 mil OS | p95 dentro das metas com a carga do piloto × 3 | ⬜ |
| 4.7 | Revisão de segurança e pentest por terceiro | Nenhum achado crítico aberto | ⬜ |
| 4.8 | Backup com restauração testada, SLA, página de status, processo de incidente e continuidade | Restauração cronometrada e documentada | ⬜ |

## Lançamento (semanas 23–24)

| ID | Task | Pronto quando | Status |
| --- | --- | --- | --- |
| 5.1 | Migração final dos dados da Suzano e parceiros | Números conferidos com o cliente | ⬜ |
| 5.2 | Treinamento da oficina e das chefias | Cada papel fez sua jornada sozinho | ⬜ |
| 5.3 | Virada para produção | Deploy aprovado em homologação | ⬜ |

## Decisões que travam tasks

| Decisão | Trava | Prazo |
| --- | --- | --- |
| Hospedagem (ADR-012) | 1.5 | Fim da fase 1 |
| Doc de pneus (resposta aos comentários) | 3.1 | Semana 11 |
| Preço por módulo | 3.4 | Semana 12 |
| Unidade em que o custo da peça é guardado ([proposta](../produto/propostas/part-cost-convention.mdx)) | 2.5 | Semana 6 |
