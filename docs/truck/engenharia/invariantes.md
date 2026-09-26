---
title: "Invariantes de domínio"
sidebar_position: 2
tags: [invariantes, dominio, regras-negocio, v2, testes]
---

# Invariantes de domínio

Um invariante é uma regra que nunca pode estar violada no banco, em nenhum momento, por nenhum caminho. Cada invariante tem um id estável: o PR que o cria ou muda cita o id, e o teste que tenta quebrá-lo leva o id no nome.

:::caution[Rascunho]
Primeira versão, montada a partir dos bugs da [auditoria de 2026-09](./auditoria-2026-09.md). Os itens marcados **(confirmar)** dependem de decisão de produto. Os demais são obrigatórios na v2.
:::

**Como ler a coluna Garantia**
- **Banco:** constraint, índice único, FK, RLS ou update condicional. O banco recusa a violação mesmo com bug no código.
- **Domínio:** método do agregado, dentro da transação do comando.
- **Verificação:** o job diário de invariantes procura violações e alerta.

Todo invariante tem teste de integração. Onde duas pessoas podem agir ao mesmo tempo, tem também teste de concorrência.

## Plataforma

| Id | Invariante | Garantia |
| --- | --- | --- |
| PLT-1 | Toda linha de tabela de negócio pertence a exatamente uma empresa (`company_id NOT NULL`, FK) | Banco |
| PLT-2 | Nenhuma query lê ou escreve linha de outra empresa; sem contexto de empresa, nada é devolvido | Banco (RLS) |
| PLT-3 | Um usuário é membro de uma empresa no máximo uma vez | Banco (unique) |
| PLT-4 | Toda rota exige permissão declarada ou é pública por decisão registrada | Teste que varre as rotas |
| PLT-5 | Quem solicita uma requisição de peça ou pneu não a aprova | Domínio + teste |
| PLT-6 | Todo registro de fato (transição, movimentação, sessão) guarda o usuário real que agiu, com FK | Banco |
| PLT-7 | Senha, hash e segredo nunca saem numa resposta | DTO de saída + teste |

## Ecossistema (`ECO`) — ver [ADR-011](./adrs/adr-011-ecossistema-e-compartilhamento.md)

| Id | Invariante | Garantia |
| --- | --- | --- |
| ECO-1 | Toda OS pertence à organização que executa; todo ativo pertence à organização dona; as duas podem ser diferentes | Modelo (FKs separadas) |
| ECO-2 | Nenhuma organização lê tabela interna de outra; o acesso entre organizações é só pela visão compartilhada | Banco (RLS) + teste |
| ECO-3 | Toda visão compartilhada existe por uma concessão ativa, dada pelo dono do dado, com escopo e nível; revogar apaga a visão | Domínio + verificação |
| ECO-4 | Nenhum evento publica campo acima do nível concedido (ex.: custo interno só no nível completo) | Teste gerado do catálogo de níveis |
| ECO-5 | O nível completo só existe entre organizações do mesmo grupo econômico | Domínio |
| ECO-6 | A OS de oficina terceira registra custo interno e valor cobrado separados | Modelo |
| ECO-7 | Um ativo tem no máximo um operador (transportadora) por vez; o histórico de operador não tem sobreposição | Banco (exclusion constraint) |

## Ativos

| Id | Invariante | Garantia |
| --- | --- | --- |
| AST-1 | Placa é única por empresa entre todos os ativos ativos | Banco (unique parcial) |
| AST-2 | Um eixo pertence a exatamente um veículo, de qualquer tipo (caminhão-trator, caminhão, semirreboque, reboque, dolly) | Banco (FK) |
| AST-3 | Uma posição de roda tem no máximo um pneu montado | Banco (unique) |
| AST-4 | Um pneu está montado em no máximo uma posição | Banco (unique) |
| AST-5 | A leitura de hodômetro/horímetro de um ativo nunca diminui, salvo correção explícita registrada | Domínio + verificação |
| AST-6 | Há uma única fonte de hodômetro por ativo (contadores + leituras) | Modelo |
| AST-7 | Um conjunto de implementos está engatado em no máximo uma unidade tratora por vez; o histórico de engate não tem sobreposição | Banco (exclusion constraint) |
| AST-8 | O custo de um período pertence ao veículo físico, não ao conjunto nem à combinação; a configuração da época é consultada pelos históricos | Modelo |
| AST-10 | Um implemento ocupa no máximo uma posição de um conjunto por vez, e cada posição tem no máximo um implemento; histórico sem sobreposição | Banco (exclusion constraint) |
| AST-11 | O número de posições de um conjunto respeita o tipo de conjunto (bitrem = 2, tritrem = 3…) | Domínio + CHECK |
| AST-12 | O km de um implemento é derivado do histórico de engate e das leituras das unidades tratoras; nunca é digitado | Modelo |
| AST-9 | Todo box pertence a uma base, e uma OS em manutenção ocupa um box da base que a executa | Banco (FK) + domínio |

## Ordem de serviço (`WO`)

| Id | Invariante | Garantia |
| --- | --- | --- |
| WO-1 | O status só muda pela máquina de estados, e toda mudança gera exatamente uma transição | Domínio (único caminho de escrita) |
| WO-2 | Uma ordem nasce em Fila | Domínio (sem status no DTO de criação) |
| WO-3 | No máximo uma ordem aberta (Fila, Manutenção, Pausada) por composição | Banco (unique parcial) |
| WO-4 | Um box tem no máximo uma ordem em Manutenção | Banco (unique parcial) |
| WO-5 | O número da ordem é único e sequencial por empresa e prefixo | Banco (contador + unique) |
| WO-6 | Ordem finalizada ou cancelada não tem serviço aberto nem sessão de trabalho aberta | Domínio + verificação |
| WO-7 | Ordem finalizada ou cancelada é imutável, salvo reabertura explícita com permissão e transição | Domínio |
| WO-8 | Duas mudanças concorrentes na mesma ordem: uma vence, a outra recebe 409 | Banco (versão) |
| WO-9 | O custo da ordem é a soma dos seus lançamentos de custo; nunca é editado direto | Modelo (derivado) |

## Serviço e executores (`SVC`)

| Id | Invariante | Garantia |
| --- | --- | --- |
| SVC-1 | O status do serviço é derivado dos executores por uma única função, na mesma transação | Domínio |
| SVC-2 | Serviço pausado não tem sessão de trabalho aberta | Domínio + verificação |
| SVC-3 | Serviço concluído ou cancelado não tem executor com sessão aberta | Domínio + verificação |
| SVC-4 | Serviço só inicia ou conclui com a ordem em Manutenção | Domínio |
| SVC-5 | Um executor tem no máximo uma sessão de trabalho aberta por serviço | Banco (unique parcial) |
| SVC-6 | Uma sessão tem `ended_at >= started_at` | Banco (CHECK) |
| SVC-7 | Tempo trabalhado = soma das sessões; pausa nunca conta como trabalho **(confirmar se alguma pausa conta)** | Modelo |
| SVC-8 | Horário informado pelo usuário só entra como ajuste explícito, dentro do limite da empresa, com permissão própria e registro de quem ajustou | Domínio |
| SVC-9 | Um serviço concluído atribui tempo a cada executor pelas suas próprias sessões | Modelo |

## Estoque e requisições (`STK`)

| Id | Invariante | Garantia |
| --- | --- | --- |
| STK-1 | O saldo de uma peça é a soma das suas movimentações | Modelo (livro append-only) |
| STK-2 | O saldo nunca fica negativo | Banco (update condicional + CHECK) |
| STK-3 | Uma requisição muda de status uma vez por transição: aprovar duas vezes é impossível | Banco (`WHERE status = ...`) |
| STK-4 | Quantidade solicitada, aprovada e devolvida é sempre positiva; aprovada ≤ solicitada; devolvida ≤ entregue | Banco (CHECK) + DTO |
| STK-5 | Uma requisição nasce Pendente | Domínio (sem status no DTO) |
| STK-6 | O custo de uma requisição usa o preço congelado no momento da entrega, não o preço atual | Modelo |
| STK-7 | Dinheiro e quantidade são `numeric`, nunca ponto flutuante | Banco (tipo) |
| STK-8 | Toda movimentação de estoque tem motivo, autor e referência (requisição, ajuste, compra) | Banco (NOT NULL + FK) |
| STK-9 | Todo saldo é por depósito; o depósito tem organização dona e local (base) — podem ser de organizações diferentes (consignado) | Modelo |
| STK-10 | Consumo de depósito consignado é custo do dono do estoque, não da oficina que aplicou | Modelo |
| STK-11 | Transferência entre depósitos é uma saída e uma entrada na mesma transação | Domínio |
| STK-12 | Item serializado está em exatamente um lugar por vez (depósito ou posição num ativo) e nunca some: sai só por baixa registrada | Banco + domínio |

## Pneus (`TIR`) — se entrar no lançamento

| Id | Invariante | Garantia |
| --- | --- | --- |
| TIR-1 | Número de série e número de fogo são únicos por empresa | Banco |
| TIR-2 | O ciclo de vida muda só pelos eventos do pneu, e cada evento é registrado uma vez | Domínio + idempotência |
| TIR-3 | O status e a localização do pneu são um campo cada, sem versão legada paralela | Modelo |

## Indicadores (`KPI`)

| Id | Invariante | Garantia |
| --- | --- | --- |
| KPI-1 | Todo indicador tem definição escrita (fórmula, unidade, fuso, fonte) e teste com números conhecidos | Processo |
| KPI-2 | Indicador nunca mistura dados de empresas | Banco (RLS) + teste |
| KPI-3 | Períodos são cortados no fuso da empresa | Domínio + teste |
