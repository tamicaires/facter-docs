---
title: "Invariantes de domínio"
sidebar_position: 2
tags: [invariantes, dominio, regras-negocio, v2, testes]
---

# Invariantes de domínio

Um invariante é uma regra que nunca pode estar violada no banco, em nenhum momento, por nenhum caminho. Cada invariante tem um id estável: o commit que o cria ou muda cita o id, e o teste que tenta quebrá-lo leva o id no nome. Id não se reaproveita nem se renumera; invariante que deixa de valer fica riscado com o motivo.

:::info[Revisado em 26/09/2026 (task 0.7)]
Conferido contra o [schema v2](./schema-v2/visao-geral.md), as decisões de 26/09/2026 e o código do `facter-truck`. Ampliado no mesmo dia com os 19 pontos da revisão crítica do schema e os intervalos de turno. Todas as decisões pendentes foram tomadas em 26/09/2026.
:::

**Garantia**
- **Banco:** constraint, índice único, FK, RLS ou update condicional. O banco recusa a violação mesmo com bug no código.
- **Domínio:** método do agregado, dentro da transação do comando.
- **Verificação:** o job diário de invariantes procura violações e alerta.

**Situação:** ✅ garantido e testado (arquivo do teste) · ⬜ a implementar (task do [plano](../projeto/plano-de-execucao.md))

Todo invariante tem teste de integração. Onde duas pessoas podem agir ao mesmo tempo, tem também teste de concorrência.

## Plataforma (`PLT`)

| Id | Invariante | Garantia | Situação |
| --- | --- | --- | --- |
| PLT-1 | Toda linha de tabela de negócio pertence a exatamente uma organização (`org_id not null`, FK) | Banco | ✅ `rls-coverage.spec.ts` |
| PLT-2 | Nenhuma consulta lê ou escreve linha de outra organização; sem contexto de organização, nada é devolvido | Banco (RLS forçado) | ✅ `tenancy.isolation.spec.ts`, `vehicles.http.spec.ts` |
| PLT-3 | Um usuário é membro de uma organização no máximo uma vez | Banco (unique) | ⬜ 1.2 |
| PLT-4 | Toda rota declara a permissão exigida ou é pública por decisão explícita; sem isso a API não sobe | Auditoria no bootstrap + teste | ✅ `route-access.spec.ts` |
| PLT-5 | Segregação de função: quem pede não aprova (requisição de peça e de pneu, ajuste de estoque, baixa de pneu) | Banco (CHECK) + domínio | ⬜ 2.6, 3.1 |
| PLT-6 | Todo registro de fato (transição, movimentação, sessão) guarda quem agiu de verdade, com FK | Banco | ⬜ 1.1 |
| PLT-7 | Senha, hash e segredo nunca saem numa resposta | DTO de saída explícito + teste | ⬜ 1.1 |
| PLT-8 | Um comando executa no máximo uma vez por `Idempotency-Key`; a mesma chave com outro conteúdo é recusada; chave, comando e resposta são gravados na mesma transação | Banco (PK) + transação única | ✅ `vehicles.http.spec.ts` |
| PLT-9 | Duas mudanças concorrentes no mesmo agregado: uma vence, a outra recebe 409 | Banco (update condicional por `version`) | ✅ `vehicles.http.spec.ts` (veículo) |
| PLT-10 | A aplicação conecta com um papel sem `BYPASSRLS` e que não é dono das tabelas | Banco (papel) + CI com dono sem superusuário | ✅ `global-setup.ts`, `ci.yml` |

## Ecossistema (`ECO`) — ver [ADR-011](./adrs/adr-011-ecossistema-e-compartilhamento.md)

| Id | Invariante | Garantia | Situação |
| --- | --- | --- | --- |
| ECO-1 | Toda OS pertence à organização que executa; todo ativo pertence à organização dona; as duas podem ser diferentes | Modelo (FKs separadas) | ⬜ 2.3 |
| ECO-2 | Nenhuma organização lê tabela interna de outra; o acesso entre organizações é só pela visão compartilhada | Banco (RLS) + teste | ⬜ 3.3 |
| ECO-3 | Toda visão compartilhada existe por uma concessão ativa, dada pelo dono do dado, com escopo e nível; revogar apaga a visão | Domínio + verificação | ⬜ 3.3 |
| ECO-4 | Nenhum evento publica campo acima do nível concedido (ex.: custo interno só no nível completo) | Teste gerado do catálogo de níveis | ⬜ 3.3 |
| ECO-5 | O nível completo só existe entre organizações do mesmo grupo econômico | Domínio | ⬜ 3.3 |
| ECO-6 | A OS de oficina terceira registra custo interno e valor cobrado separados | Modelo | ⬜ 3.3 |
| ECO-7 | Um ativo tem no máximo um operador (transportadora) por vez; o histórico de operador não tem sobreposição | Banco (exclusion constraint) | ⬜ 1.11 |
| ECO-8 | Uma solicitação de manutenção mira exatamente um veículo avulso ou um conjunto inteiro | Banco (CHECK) | ⬜ 3.3 |

## Ativos (`AST`)

| Id | Invariante | Garantia | Situação |
| --- | --- | --- | --- |
| AST-1 | Placa é única por organização entre os veículos não excluídos, depois de normalizada (`QRT-4b22` = `QRT4B22`). Vendido ou sucateado continua com a placa reservada; o veículo que volta é o mesmo cadastro reativado (decidido em 26/09/2026) | Banco (unique parcial) + domínio | ✅ `vehicles.http.spec.ts`; `deleted_at` entra na 1.11 |
| AST-2 | Um eixo pertence a exatamente um veículo, de qualquer tipo | Banco (FK) | ⬜ 1.11 |
| AST-3 | Uma posição de roda tem no máximo um pneu montado | Banco (unique) | ⬜ 3.1 |
| AST-4 | Um pneu está montado em no máximo uma posição | Banco (unique) | ⬜ 3.1 |
| AST-5 | Dentro de um mesmo medidor instalado, a leitura nunca diminui, salvo correção explícita registrada; troca de painel é um medidor novo, não uma correção | Domínio + verificação | ⬜ 1.11 |
| AST-6 | Há uma única fonte de hodômetro por ativo | Modelo | ⬜ 1.11 |
| AST-7 | Um conjunto de implementos está engatado em no máximo uma unidade tratora por vez; o histórico de engate não tem sobreposição | Banco (exclusion constraint) | ⬜ 1.11 |
| AST-8 | O custo de um período pertence ao veículo físico, não ao conjunto nem à combinação | Modelo | ⬜ 2.3 |
| AST-9 | Todo box pertence a uma base, e uma OS em manutenção ocupa um box da base que a executa | Banco (FK) + domínio | ⬜ 2.3 |
| AST-10 | Um implemento ocupa no máximo uma posição de um conjunto por vez, e cada posição tem no máximo um implemento; histórico sem sobreposição | Banco (exclusion constraint) | ⬜ 1.11 |
| AST-11 | O número de posições de um conjunto respeita o tipo de conjunto (bitrem = 2, tritrem = 3…) | Domínio + CHECK | ⬜ 1.11 |
| AST-12 | O km de um implemento vem do hodômetro de cubo dele, ou dos engates com tratora cadastrada, ou do km informado no engate e desengate com tratora de fora; nunca é digitado solto | Modelo | ⬜ 1.11 |
| AST-13 | Unidade tratora e caminhão sempre têm hodômetro; implemento só quando tem hodômetro de cubo | Banco (CHECK) | ⬜ 1.11 |
| AST-14 | Todo veículo tem placa, exceto o dolly; placa só no formato antigo ou Mercosul | Domínio | ✅ `vehicle.spec.ts`, `vehicles.http.spec.ts` |
| AST-15 | Todo engate tem exatamente uma tratora: cadastrada na organização ou de fora (placa) | Banco (CHECK) | ⬜ 1.11 |
| AST-16 | Toda mudança de status do veículo (inativo, vendido, sucateado, reativado) fica registrada com quando e quem | Domínio (único caminho de escrita) | ⬜ 1.11 |

## Ordem de serviço (`WO`)

| Id | Invariante | Garantia | Situação |
| --- | --- | --- | --- |
| WO-1 | O status só muda pela máquina de estados, e toda mudança gera exatamente uma transição | Domínio (único caminho de escrita) | ⬜ 2.3 |
| WO-2 | Uma ordem nasce em `queued` (Fila) | Domínio (sem status no DTO de criação) | ⬜ 2.3 |
| WO-3 | Em cada organização executora, no máximo uma ordem aberta (`queued`, `in_maintenance`, `paused`) por veículo ou conjunto; a OS no conjunto trava os implementos dele e vice-versa (decidido em 26/09/2026) | Banco (trava com chave `(org_id, target_id)`, uma linha por alvo travado) | ⬜ 2.3 |
| WO-4 | Um box tem no máximo uma ordem em manutenção | Banco (unique parcial) | ⬜ 2.3 |
| WO-5 | O número da ordem é único e sequencial por organização e prefixo | Banco (tabela `sequences` + unique) | ⬜ 2.3 |
| WO-6 | Ordem finalizada ou cancelada não tem serviço aberto nem sessão de trabalho aberta | Domínio + verificação | ⬜ 2.4 |
| WO-7 | Ordem finalizada ou cancelada é imutável, salvo reabertura explícita com permissão e transição | Domínio | ⬜ 2.3 |
| WO-8 | Duas mudanças concorrentes na mesma ordem: uma vence, a outra recebe 409 | Banco (versão), caso de PLT-9 | ⬜ 2.3 |
| WO-9 | O custo da ordem é a soma dos seus lançamentos de custo; nunca é editado direto | Modelo (derivado) | ⬜ 2.6 |
| WO-10 | O tempo parado do veículo começa quando ele parou (`vehicle_stoppages.stopped_at`), não quando a OS foi aberta, e termina na liberação | Modelo | ⬜ 2.3 |

## Serviço e executores (`SVC`)

| Id | Invariante | Garantia | Situação |
| --- | --- | --- | --- |
| SVC-1 | O status do serviço é derivado dos executores por uma única função, na mesma transação | Domínio | ⬜ 2.4 |
| SVC-2 | Serviço pausado não tem sessão de trabalho aberta | Domínio + verificação | ⬜ 2.4 |
| SVC-3 | Serviço concluído ou cancelado não tem executor com sessão aberta | Domínio + verificação | ⬜ 2.4 |
| SVC-4 | Serviço só inicia ou conclui com a ordem em manutenção | Domínio | ⬜ 2.4 |
| SVC-5 | Um executor tem no máximo uma sessão de trabalho aberta por serviço | Banco (unique parcial) | ⬜ 2.4 |
| SVC-6 | Uma sessão tem `ended_at >= started_at` | Banco (CHECK) | ⬜ 2.4 |
| SVC-7 | Tempo trabalhado = soma das sessões de trabalho; nenhuma pausa conta como trabalho (decidido em 26/09/2026). O tempo parado é registrado por motivo e alimenta o indicador de tempo parado | Modelo | ⬜ 2.4 |
| SVC-8 | Horário informado pelo usuário só entra como ajuste explícito, dentro do limite da organização, com permissão própria e registro de quem ajustou | Domínio | ⬜ 2.4 |
| SVC-9 | Um serviço concluído atribui tempo a cada executor pelas suas próprias sessões | Modelo | ⬜ 2.4 |
| SVC-10 | O custo de mão de obra de uma sessão aplica os adicionais vigentes (hora extra fora do turno, noturno, domingo e feriado) e é congelado ao fechar a sessão | Domínio + teste com números conhecidos | ⬜ 2.4 |
| SVC-11 | Pausa de OS e de sessão usam a mesma lista de motivos; almoço, jantar e intervalo são pausas planejadas e nunca contam como tempo perdido | Banco (FK para `pause_reasons`) | ⬜ 2.4 |
| SVC-12 | Uma pessoa tem no máximo uma sessão de trabalho aberta; iniciar outro serviço pausa o anterior com o motivo `other_service` | Banco (exclusion constraint) + domínio | ⬜ 2.4 |

## Estoque e requisições (`STK`)

| Id | Invariante | Garantia | Situação |
| --- | --- | --- | --- |
| STK-1 | O saldo de uma peça é a soma das suas movimentações | Modelo (livro só com insert) | ⬜ 2.5 |
| STK-2 | O saldo nunca fica negativo | Banco (update condicional + CHECK) | ⬜ 2.5 |
| STK-3 | Uma requisição muda de status uma vez por transição: aprovar duas vezes é impossível | Banco (`where status = ...`) | ⬜ 2.6 |
| STK-4 | Em cada item da requisição: solicitada > 0; aprovada ≤ solicitada; entregue ≤ aprovada; devolvida ≤ entregue | Banco (CHECK) + DTO | ⬜ 2.6 |
| STK-5 | Uma requisição nasce `pending` | Domínio (sem status no DTO) | ⬜ 2.6 |
| STK-6 | O custo de uma requisição usa o preço congelado no momento da entrega, não o preço atual | Modelo | ⬜ 2.6 |
| STK-7 | Dinheiro e quantidade são `numeric`, nunca ponto flutuante | Banco (tipo) | ⬜ 2.5 |
| STK-8 | Toda movimentação de estoque tem motivo, autor e referência (requisição, ajuste, compra) | Banco (NOT NULL + FK) | ⬜ 2.5 |
| STK-9 | Todo saldo é por depósito; o depósito tem organização dona e local (base), que podem ser de organizações diferentes (consignado) | Modelo | ⬜ 2.5 |
| STK-10 | Consumo de depósito consignado é custo do dono do estoque, não da oficina que aplicou | Modelo | ⬜ 2.6 |
| STK-11 | Transferência entre depósitos é uma saída e uma entrada na mesma transação | Domínio | ⬜ 2.7 |
| STK-12 | Item serializado está em exatamente um lugar por vez (depósito ou posição num ativo) e nunca some: sai só por baixa registrada | Banco + domínio | ⬜ 2.7 |
| STK-13 | Aprovar reserva a quantidade; a reserva nunca passa do saldo, e entregar baixa saldo e reserva juntos | Banco (CHECK + update condicional) | ⬜ 2.6 |
| STK-14 | Toda entrada de compra tem nota fiscal, e a mesma nota do mesmo fornecedor não entra duas vezes | Banco (FK + unique) | ⬜ 2.5 |

## Pneus (`TIR`)

Pneus entram no lançamento (decidido em 26/09/2026). Os invariantes do ciclo de vida completo (vidas, recapagem, reserva, inspeção) entram quando a doc de pneus for incorporada.

| Id | Invariante | Garantia | Situação |
| --- | --- | --- | --- |
| TIR-1 | Número de série e número de fogo são únicos por organização | Banco | ⬜ 3.1 |
| TIR-2 | O ciclo de vida muda só pelos eventos do pneu, e cada evento é registrado uma vez | Domínio + idempotência | ⬜ 3.1 |
| TIR-3 | O status e a localização do pneu são um campo cada, sem versão legada paralela | Modelo | ⬜ 3.1 |

## Checklists (`CHK`)

| Id | Invariante | Garantia | Situação |
| --- | --- | --- | --- |
| CHK-1 | Publicar uma mudança no modelo cria versão nova; a execução aponta a versão usada, e os itens de uma versão nunca mudam | Modelo | ⬜ 3.2 |
| CHK-2 | Item que exige foto não fecha sem foto vinculada ao resultado | Domínio | ⬜ 3.2 |

## Indicadores (`KPI`)

| Id | Invariante | Garantia | Situação |
| --- | --- | --- | --- |
| KPI-1 | Todo indicador tem definição escrita (fórmula, unidade, fuso, fonte) e teste com números conhecidos | Processo | ⬜ 4.1 |
| KPI-2 | Indicador nunca mistura dados de organizações | Banco (RLS) + teste | ⬜ 4.1 |
| KPI-3 | Períodos são cortados no fuso da organização | Domínio + teste | ⬜ 4.1 |
