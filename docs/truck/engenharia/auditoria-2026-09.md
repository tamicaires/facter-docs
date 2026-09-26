---
title: "Auditoria técnica 2026-09"
sidebar_position: 1
tags: [auditoria, arquitetura, v2, padroes, testes, seguranca, performance]
---

# Auditoria técnica e plano de engenharia — setembro/2026

:::info Fonte
Cópia em Markdown do documento de 26/09/2026. O original, com comentários do time, é o [Claude Doc da auditoria](https://claude.ai/code/artifact/238ba063-feab-4b6e-ac9d-b124c7e59940). Se os dois divergirem, esta cópia é a versionada no repositório e prevalece.
:::

## Resumo executivo

**O Facter Truck não está pronto para lançar, e o problema é de fundação, não de acabamento.** O domínio está bem mapeado e o núcleo de ordem de serviço é bom, mas cinco falhas estruturais atravessam o sistema inteiro. A maioria dos achados foi reproduzida rodando contra a API, não só lida no código.

**As cinco causas raiz**

1. **Regras só na aplicação, com portas laterais.** O núcleo de domínio existe, mas outros endpoints o contornam (PUT troca status, create aceita "Finalizada", o cliente escolhe o status da requisição de peça). O banco não tem CHECK nem índice único parcial.
2. **Zero controle de concorrência.** Estoque ficou negativo, aprovação e devolução contaram em dobro, 6 ordens abertas na mesma frota, cancelar + iniciar terminou em "Manutenção".
3. **Isolamento entre empresas e permissões opt-in.** Vazamentos provados: lista de usuários de todas as empresas com hash de senha, escrita em dados de outra empresa, KPI misturando empresas. O motor de permissões ignora toda regra de negação, todo papel lê tudo e quem solicita peça pode aprovar o próprio pedido.
4. **Fundação do schema errada.** Ativo sem conceito próprio, cavalo mecânico sem eixo, dinheiro em `Float`, cascades que apagam histórico, conceitos duplicados, tempo de trabalho como um único par de datas.
5. **Infraestrutura nunca exercitada.** Cron não registrado, notificação em tempo real quebrada, Docker não sobe, eventos só em memória, 38 suítes de teste quebradas e zero teste de integração.

**Recomendação: v2 do núcleo com corte de escopo.** Redesenhar o schema e reescrever o backend do núcleo, portando a lógica de domínio que é boa. O frontend é refatorado no lugar e adaptado. Módulos fora do núcleo entram depois do lançamento. Como ainda não há cliente real, esta é a última janela em que redesenhar o schema não custa migração de dados.

**O que o time precisa decidir agora:** o conjunto mínimo de módulos que entra no lançamento do começo de 2027. É isso que define se o prazo fecha.

## Contexto e método

A auditoria cobriu `facter-api` e `facter-app` inteiros, em 26/09/2026, com o produto ainda sem cliente real e lançamento previsto para o começo de 2027.

**Escopo**

| Repositório | Branch | Tamanho |
| --- | --- | --- |
| `facter-api` (NestJS 10, Prisma 5, Postgres, Redis) | `fix/factrk-54-cascade-service-status-to-employees`, sobre `homolog` | \~87 mil linhas TS, 1.276 arquivos, 71 models, 73 migrations |
| `facter-app` (React 18, Vite, React Query, Zustand) | `homolog` | \~141 mil linhas TS/TSX, 1.538 arquivos |

**Frentes auditadas**

1. Execução de serviços e executores (origem: issue #56)
2. Ordem de serviço
3. Peças, estoque, pneus e custos
4. Preventiva, checklists, ativos, socorro mecânico e analytics
5. Segurança e isolamento entre empresas
6. Arquitetura, schema, testes e tooling
7. Frontend
8. Performance (medida) e escalabilidade (medida)

**Como os achados foram confirmados**

- **RODADO**: reproduzido contra a API local, com requisições reais e conferido no banco. Inclui testes de concorrência (requisições em paralelo) e de isolamento (uma segunda empresa criada para tentar ler e alterar dados da primeira).
- **LIDO**: identificado no código, com arquivo e linha, sem reprodução.
- Performance foi medida numa cópia do banco com volume realista: 100 mil ordens, 400 mil serviços, 800 mil execuções, 200 mil requisições de peça. Escalabilidade foi testada com duas instâncias da API em paralelo e carga de até 200 requisições simultâneas.

**Limitações**

- Tudo rodou em ambiente local, nunca em homologação nem produção.
- O build do frontend não foi executado (sem `node_modules`), então erros de tipo e tamanho de bundle do app vieram de leitura e de um relatório antigo.
- Alguns achados marcados como LIDO podem ter nuance que só a execução revelaria. Os marcados como RODADO não têm essa dúvida.

## As cinco causas raiz

Quase todos os achados da seção seguinte são sintomas destas cinco causas. Corrigir sintoma por sintoma não resolve: as correções das issues #47 e #54 fecharam um caminho e deixaram os paralelos abertos.

### 1. Regras só na aplicação, e com portas laterais

O domínio de ordem de serviço tem máquina de estados, métodos de comando e transições gravadas numa transação. Só que vários caminhos escrevem o mesmo estado sem passar por ele.

- `PUT /work-orders/:id` altera `status` e `fleetId` direto: reabriu uma ordem finalizada sem transição (RODADO).
- O create de ordem aceita qualquer status: nasceu uma ordem "Finalizada" com transição Finalizada→Finalizada (RODADO).
- O endpoint do executor muda o serviço sem transição, sem evento e sem validar a ordem. É o caminho que a tela mais usa (RODADO).
- `POST /part-requests` aceita `status: DELIVERED`, pulando aprovação e estoque (RODADO).
- O banco não tem nenhum CHECK constraint (XOR veículo/reboque, quantidade ≥ 0, fim ≥ início) nem índice único parcial ("uma ordem aberta por frota").

**Princípio violado:** cada estado tem um único dono, e todo caminho de escrita passa por ele. O banco garante o que não pode ser violado.

### 2. Nenhum controle de concorrência

Todo fluxo segue o padrão "lê, valida em memória, grava a linha inteira por id". Não há coluna de versão, `WHERE status = anterior`, lock de linha nem chave de idempotência.

| Cenário (todos RODADOS) | Resultado |
| --- | --- |
| 3 aprovações simultâneas com estoque 1 | estoque −2 |
| 4 aprovações da mesma requisição | 2 sucessos, estoque baixou 2 vezes |
| 4 devoluções simultâneas de 3 unidades | +12 no estoque |
| 10 creates de ordem na mesma frota, 2 instâncias | 6 ordens abertas na mesma frota |
| 3 cancelamentos + 3 inícios simultâneos | 6 × 200, histórico diz Cancelada, estado final Manutenção |
| Conclusão do único executor | executor concluído, serviço segue em andamento (corrida entre `save` e leitura em paralelo) |
| 3 retornos de recapagem simultâneos | 3 eventos, custo de recapagem triplicado |

**Princípio violado:** toda escrita que depende do estado anterior é condicional no banco, e toda operação que pode ser repetida é idempotente.

### 3. Isolamento entre empresas e permissões são opt-in

O filtro por empresa depende de um middleware Prisma (`$use`, depreciado e removido no Prisma 6) com uma lista de models escrita à mão. A lista tem erro de digitação (`'Maintenance Schedule'`), nomes que não existem e omissões. SQL cru passa por fora, e 36 de 55 `findById` não recebem empresa.

- `GET /users` devolve os usuários de todas as empresas com o hash bcrypt da senha (RODADO).
- A empresa B alterou e apagou unidades de medida da empresa A (RODADO).
- O KPI do dashboard agrega ordens de todas as empresas (RODADO).
- `GET /members/admin/all` lista membros, e-mails e CNPJs de todas as empresas para qualquer usuário logado (RODADO).
- Várias tabelas nem têm `companyId`: `part_requests`, `checklists`, `attachments`, `asset_readings`, `service_execution_logs`, `maintenance_types`.

**Princípio violado:** isolamento é garantido por construção (RLS no Postgres ou extensão que falha fechada), nunca por lembrança.

### 4. A fundação do schema está errada

O mapa do domínio é bom, mas a estrutura tem erros de quem nunca modelou banco multiempresa para produção. Detalhes na seção de achados, área Schema.

- O ativo não existe como conceito: `Vehicle` e `Trailer` são tabelas separadas, e as referências usam par XOR, `assetId` string sem FK ou lista de reboques.
- `Axle` exige `trailerId`: o cavalo mecânico não tem eixo nem posição de pneu.
- Dinheiro e quantidade em `Float` (exceto pneu e centro de custo, em `Decimal`).
- 45 `onDelete: Cascade`, e só 3 models com soft delete: apagar um funcionário apaga as horas dele.
- Conceitos duplicados: 4 campos para status/localização do pneu, 3 fontes de hodômetro, 2 prioridades na ordem, 5 mecanismos de auditoria.
- Tempo de trabalho como um par `startAt`/`endAt`, incapaz de representar pausas.

**Princípio violado:** o modelo de dados representa o domínio sem ambiguidade, e o banco preserva a história.

### 5. A infraestrutura nunca foi exercitada

Várias peças existem no código e nunca funcionaram.

- `ScheduleModule` e `SchedulerModule` são importados em `app.module.ts:23-24` mas não estão em `imports[]`: nenhum cron roda. O módulo de sync de telemática nem é alcançável.
- O SSE de notificações falha em toda conexão com "Cannot set headers after they are sent".
- O Dockerfile tem `CMD ["npm","start:prod"]` (comando inválido) e copia o `.env` para a imagem. O `vercel.json` aponta para arquivos que não existem.
- Eventos de domínio são só em memória: um crash perde atividades, notificações e o custo de peças materializado.
- 38 de 88 suítes de teste falham (28 nem compilam). Não existe teste de integração com banco.
- 6 endpoints de analytics dão 500 sempre, porque o SQL cita colunas que não existem.

**Princípio violado:** nada é considerado pronto sem estar rodando e coberto por um teste que prova o comportamento.

## Achados por área

Severidade: **Crítico** impede lançar ou corrompe dado; **Alto** gera erro visível ou relatório errado; **Médio** é dívida que vira bug com uso. Caminhos relativos a `facter-api/` ou `facter-app/`.

### Execução de serviços e executores

O status mora em dois lugares (serviço e executor) e é derivado nos dois sentidos, por dois use cases com garantias diferentes. `ChangeStatus` usa domínio, transação, transição e evento. `ChangeEmployeeServiceExecutionStatus` escreve direto, sem nada disso, e é o caminho que a tela mais usa: "Iniciar" com um executor e "Retomar" chamam o endpoint do executor (`facter-app/.../service-execution-item.tsx:99-120`).

| Sev | Achado | Evidência | Local |
| --- | --- | --- | --- |
| Crítico | Iniciar pelo executor não gera transição, evento nem valida a ordem | RODADO (0 transições) | `employee-service-execution/change-assigments-status.ts` |
| Crítico | "Retomar" com um executor deixa o serviço PAUSADO com o executor rodando | RODADO | `change-assigments-status.ts:219-225` |
| Crítico | Concluir o único executor não conclui o serviço (save e leitura em `Promise.all`) | RODADO | `change-assigments-status.ts:68-77` |
| Crítico | Cancelar o serviço deixa o executor rodando para sempre (cascata sem CANCELED) | RODADO | `service-execution-transition.service.ts:101-116` |
| Crítico | Serviço inicia e conclui com executor que nunca começou; o log credita o trabalho a ele | RODADO | cascata + `change-status.ts:315-341` |
| Crítico | `transitionedBy` grava o id da empresa, não do usuário | RODADO (todas as transições) | `change-status.ts:83` |
| Crítico | Datas do cliente sem validação: fim antes do início gerou log de −59.048 h | RODADO | `change-status.ts`, DTO |
| Alto | `endAt` tem dois significados: pausa pelo executor grava e não limpa; pausa por cascata não grava. A tela congela ou conta a pausa como trabalho (issue #56) | RODADO | `service-execution-executor-item.tsx:37` |
| Alto | Um log de produtividade por serviço (unique), só para o primeiro executor, com tempo decorrido. O listener tenta gravar outro a cada conclusão e falha | RODADO | `service-execution-logger.listener.ts` |
| Alto | A tabela `service_execution_employee_transitions` existe e ninguém escreve nela | RODADO (0 linhas) | `unit-of-work.ts:106` |
| Médio | Pausa do executor não pede motivo; executor cancelado pode reiniciar; log gravado sem `await` com `assetId ?? ''` | LIDO | `change-assigments-status.ts:128-138, 214` |

### Ordem de serviço

O núcleo é o melhor código do sistema: matriz de estados, métodos de comando, `MaintenanceTimeTracking` e `WorkOrderTransitionService.saveWithTransition` numa transação real. O problema são as portas laterais e a concorrência.

| Sev | Achado | Evidência | Local |
| --- | --- | --- | --- |
| Crítico | `PUT /work-orders/:id` muda status e frota sem máquina de estados; `status:"Bogus"` dá 500 | RODADO | `shared/utils/workOrderUtils.ts:7-46`, `updateWorkOrder.ts:65` |
| Crítico | Create aceita qualquer status, inclusive Finalizada | RODADO | `create-work-order.ts:138` |
| Crítico | "Uma ordem aberta por frota" é check-then-insert: 5 creates paralelos criaram 5 ordens | RODADO | `create-work-order.ts:79-89` |
| Crítico | Transições sem controle de concorrência: 4 inícios paralelos gravaram 4 transições e 4 notificações | RODADO | `transition-work-order.ts:77-117` |
| Crítico | Numeração ordena `displayId` como texto: depois de CO-9999 toda criação falha para sempre | RODADO | `prisma-work-order-repository.ts:220-226` |
| Alto | Finalizar sem `releasedById` grava o id do usuário numa FK de funcionário: o "Finalizar em lote" sempre falha | RODADO | `transition-work-order.ts:245`, `bulk-update-status.ts:60` |
| Alto | Erros em lote expõem erro Prisma cru com caminho absoluto do servidor | RODADO | `bulk-update-status.ts:69` |
| Alto | Create não é atômico: ordem, ativos, leituras e transição são 4 escritas separadas | LIDO | `create-work-order.ts:144-200` |
| Alto | Um box aceita várias ordens ao mesmo tempo | RODADO | `transition-work-order.ts:166-178` |
| Alto | Cancelar a ordem não valida nem fecha serviços e executores abertos | LIDO | `transition-work-order.ts` |
| Médio | Colunas de tempo guardam só a última pausa; o dashboard diário usa essas colunas | RODADO | `get-daily-work-orders-data.ts:174-177` |
| Médio | Cache de duração prevista preenchido com uma ordem e servido para todas do tipo | LIDO | `get-predicted-duration.ts:30-62` |
| Médio | `@Get('id')` literal: get-by-id de tipo e categoria de manutenção inalcançável; `sla-metrics` e `technician-productivity` sombreados por `:id` | LIDO/RODADO | `maintenance-type.controller.ts`, `workOrder.controller.ts:130` |
| Médio | `DELETE /service-executions` sem id apaga todos os serviços da empresa | LIDO | `service-execution.controller.ts:82-85` |

### Peças, estoque, pneus e custos

É a área com pior integridade de dado. O padrão é sempre o mesmo: checa em memória e depois grava sem condição, alterando o saldo no lugar, sem livro de movimentações.

| Sev | Achado | Evidência | Local |
| --- | --- | --- | --- |
| Crítico | Aprovações simultâneas deixam o estoque negativo (1 → −2) | RODADO | `prisma-part-request-repository.ts:379-404`, `approve-part-request.ts:87` |
| Crítico | A mesma requisição é aprovada mais de uma vez (update só por id, sem `status = PENDING`) | RODADO | `prisma-part-request-repository.ts:383-387` |
| Crítico | Aprovação em lote não checa saldo (22 → −78); quantidade −1000 somou 1000 ao estoque; "abc" deu 500 | RODADO | `prisma-part-request-repository.ts:451-513`, `batch-approve-body.ts` |
| Crítico | Aprovar −5 aumenta o estoque em 5; aprovar 3 numa requisição de 1 é aceito | RODADO | `dto/approve-part-request.ts` |
| Crítico | Devoluções simultâneas somam em dobro (+12 com 4 × 3) | RODADO | `prisma-part-request-repository.ts:686-720` |
| Crítico | Unidades e categorias de unidade de outra empresa podem ser alteradas e apagadas | RODADO | `update-unit.ts:33`, `delete-unit.ts:16`, `delete-unit-category.ts:20` |
| Alto | Kit aceita peça de outra empresa e expõe nome e série dela | RODADO | `create-part-kit.ts:37-50` |
| Alto | O cliente define o status inicial e o `handledById` da requisição | RODADO | `dto/part-request-body.ts:25` |
| Alto | Estoque negativo trava a peça: a entidade valida `min(0)` em toda leitura e só SQL resolve | RODADO | `entities/part/part.ts:54` |
| Alto | `partsCost` da ordem fica errado depois de operações em lote (listener ignora eventos `PART_BATCH_*`) | RODADO | `work-order-parts-cost.listener.ts:26-38` |
| Alto | Recapagem não é atômica nem idempotente: 400 deixa o pneu RECAPPED sem evento; 3 retornos = custo triplicado | RODADO | `return-tire-from-recap.ts`, `send-tire-to-recap.ts` |
| Alto | Custo histórico usa o preço atual: editar o preço reescreve ordens antigas e rateios fechados; fator de conversão ignorado | LIDO | `queries/part-request.queries.ts:99-101` |
| Alto | Detector de divergência do rateio nunca dispara (`updated_at` sem `@updatedAt`) | RODADO | `schema.prisma:724`, `allocation.queries.ts` |
| Alto | Dinheiro em `Float`: estoque 0,3 com fator 10 recusa a última unidade (0,0999… &lt; 0,1) | RODADO | `schema.prisma:542, 621` |
| Médio | Métrica de inventário conta requisições de todas as empresas; `totalCostValue` soma preço sem multiplicar pelo estoque | LIDO | `PrismaPartRepository.ts:170-206` |
| Médio | Rateio corta o mês em UTC, usa data da requisição e não do consumo, parcelas não fecham o pool; possível dupla contagem de material RATEIO (não confirmado) | LIDO | `allocation/period-range.ts`, `allocation.queries.ts:53` |
| Médio | Sem livro de movimentação; 9 use cases de pneu gravam `performedById: null`; lote devolve 201 para ids inexistentes | LIDO/RODADO | `application/tire/useCases/*` |

### Preventiva, checklists, ativos e socorro mecânico

O motor de preventiva não funciona como produto: não roda sozinho, não recorre, duplica e gera ordens erradas. É a única área em que o auditor recomendou reescrever mesmo com o sistema em uso.

| Sev | Achado | Evidência | Local |
| --- | --- | --- | --- |
| Crítico | O cron diário de agendamentos nunca roda (módulo fora de `imports[]`) | RODADO | `app.module.ts:23-24, 47` |
| Crítico | Preventiva não recorre: nada avança a referência de data/km depois da manutenção; planos por km nunca geram agendamento | RODADO | `apply-maintenance-plan.use-case.ts:43`, `km-calculation.strategy.ts:19` |
| Crítico | Geração não idempotente: 3 chamadas = 3 agendamentos do mesmo plano (chave com milissegundos) | RODADO | `calendar-calculation-strategy.ts:21`, `schedule-creation.service.ts:33, 61` |
| Crítico | Agendamento vira ordem CORRETIVA, sem número, sem ativo, sem vínculo; duas chamadas = duas ordens; "transação" que não cobre as escritas | RODADO | `generate-order-from-schedule.ts:45-140` |
| Alto | Um ativo inválido derruba a geração da empresa inteira | RODADO | `generate-maintenance-schedules.use-case.ts:26, 36` |
| Alto | Três fontes de hodômetro divergentes; gatilho não avaliável vira "OK" (caminhão com 195 mil km apareceu OK) | RODADO | `trigger-evaluation.service.ts:355` |
| Alto | Socorro pode ir para RESOLVIDO pelo PATCH genérico, sem diagnóstico, data nem evento | RODADO | `update-emergency-status.ts:100-103` |
| Alto | Checklists, agendamentos e templates sem filtro de empresa (tabela `checklists` sem `company_id`) | LIDO | `prisma-checklist.ts:19, 27`, `prisma-maintenance-schedule-repository.ts:94` |
| Médio | Dois motores de preventiva paralelos (`intervalType` legado e triggers), estratégias duplicadas em arquivos com nomes quase iguais | LIDO | `maintenance-plan/strategies/*` |
| Médio | Reboque e horímetro stubados (`currentKm = 0`); unique de posição de roda não impede duplicata (NULL distinto) | LIDO | `km-calculation.strategy.ts:25`, `schema.prisma:528` |
| Médio | Não conformidade de checklist não gera serviço nem ordem; checklist e itens sem transação; numeração de socorro com colisão possível | LIDO | `create-checklist.ts:52-80`, `create-emergency-request.ts:104` |
| Médio | `DeleteTrailer` não aguarda o delete (arquivo chamado `delete-carrier.ts`) | LIDO | `trailer/useCases/delete-carrier.ts:17` |

### Analytics e indicadores

Os números exibidos estão errados por definição, não por arredondamento. Qualquer decisão de cliente tomada sobre eles seria errada.

| Sev | Achado | Evidência | Local |
| --- | --- | --- | --- |
| Crítico | 6 endpoints dão 500 sempre (colunas inexistentes: `recap_price`, `event_date`, `wo_number`, `applied_plan_id`, `description`, `bucket`) | RODADO | `prisma-analytics-hub-repository.ts` |
| Crítico | KPI do dashboard agrega todas as empresas (SQL cru sem `company_id`) | RODADO | `prisma-kpi-repository.ts:153-170` |
| Alto | Disponibilidade divide frotas por veículos: 66,7% exibido contra 73,3% real | RODADO | `analytics-hub.queries.ts:556-563` |
| Alto | Filtro de data termina à meia-noite UTC: o último dia some (13 ordens no período, 6 exibidas) | RODADO | `analytics-query.dto.ts:22, 30` |
| Alto | MTBF sem partição por veículo e contando preventiva como falha; CPK conta custo duas vezes em ordem com vários ativos | LIDO | `analytics-hub.queries.ts:549-570, 662` |
| Alto | Conformidade de preventiva marca concluído quando a ordem é gerada, não executada | LIDO | `generate-order-from-schedule.ts:139` |
| Alto | Produtividade de técnico soma tempo decorrido, só do primeiro executor | RODADO | `get-technician-productivity.ts` |

### Segurança e multiempresa

As entidades principais resistiram ao teste entre empresas (ordem, serviço, frota, peça, pneu devolveram 404/403). O problema é que a proteção depende de lista manual e de decorators opcionais.

| Sev | Achado | Evidência | Local |
| --- | --- | --- | --- |
| Crítico | `GET /users` e `/users/:id` devolvem usuários de todas as empresas com hash bcrypt (8 de 8 com hash) | RODADO | `user.controller.ts:37-45`, `PrismaUserRepository.list()` |
| Crítico | `POST /users` é `@Public()`: qualquer pessoa cria conta, sem rate limit | LIDO | `user.controller.ts:24-26` |
| Crítico | XSS armazenado nas notas: conteúdo vai para `dangerouslySetInnerHTML` sem escape, backend não sanitiza, token em `localStorage` | LIDO | `facter-app/src/features/note/components/note-item.tsx:143`, `utils/parse-mentions.ts` |
| Crítico | Escrita entre empresas em unidades de medida | RODADO | `update-unit.ts:33` |
| Alto | `GET /members/admin/all` lista membros de todas as empresas para qualquer usuário logado | RODADO | `member.controller.ts:44-56` |
| Alto | Lista do middleware com erros e omissões (Unit, Supplier, CostCenter, EmergencyRequest, Notification, IntegrationConfig…); SQL cru não é filtrado | LIDO | `prisma.service.ts:21-45` |
| Alto | Autorização opt-in: rota sem `@Permissions` passa. 19 de 304 handlers sem guarda | LIDO/RODADO | `policy.guard.ts:29-31` |
| Alto | Permissão em cache por 1 h sem invalidação; `UpdateUserRole` inteiro comentado | LIDO | `updateUserRole.ts:13-20`, `policy.guard.ts:48-56` |
| Alto | Sem rate limiting, helmet ou CSRF | LIDO | `package.json`, `main.ts` |
| Médio | JWT aceito por query string (`?token=`) | LIDO | `jwtStrategy.ts` |
| Médio | Credenciais de integração em texto puro num campo JSON | LIDO | `schema.prisma:2141` |
| Médio | Segredos com default silencioso (`JWT_SECRET ?? ''`, `'DEFAULT_SESSION_SECRET'`); env não validado no boot | LIDO | `core/config/constants.ts:6, 11` |
| Médio | JWT de 7 dias sem refresh nem revogação; reset de senha não invalida tokens | LIDO | `jwtKeys`, auth |
| Baixo | Reset de senha devolve a senha temporária no corpo, com 32 bits de entropia | LIDO | `reset-member-password.ts` |

### Permissões (RBAC)

O motor de permissões é caseiro (não é CASL, apesar dos nomes), tem um bug que anula toda regra de negação, e o modelo não tem noção de dono do registro. Junto com o isolamento entre empresas, é o outro pilar de segurança a redesenhar.

| Sev | Achado | Evidência | Local |
| --- | --- | --- | --- |
| Crítico | Regras `cannot` nunca funcionam: o `some` usa arrow com chaves e sem `return`, então `denied` é sempre falso. Qualquer restrição escrita como `cannot` é ignorada em silêncio | LIDO (semântica de JS, sem ambiguidade) | `infra/http/ability/ability.ts`, método `can` |
| Crítico | `Manage` e `'All'` são comparados por igualdade exata, sem expansão: `can(Manage, 'All')` do ADMIN não concede nada. O modelo parece ter curinga e não tem | LIDO | `ability.ts`, `permissions.ts` |
| Alto | Todo papel lê tudo: 36 de 42 arquivos de regra começam com `can(Read, X)` antes de qualquer checagem de papel. GUEST e DRIVER leem ordens, custos, estoque, funcionários | LIDO | `infra/http/ability/subjects/*.ts` |
| Alto | Sem segregação de função: aprovar, rejeitar e entregar peça exigem só `Update`, a mesma permissão de quem cria a requisição. Quem pede aprova o próprio pedido, e não há checagem de solicitante ≠ aprovador | LIDO | `part-request.controller.ts:121-206`, `subjects/part-request.ts` |
| Alto | Sem regra de dono: o mecânico tem `Update` em qualquer ordem da empresa (inclusive o `PUT` que troca status), não só nas designadas a ele; o motorista lê todas as ordens, não só as do veículo dele | LIDO | `subjects/work-order.ts` |
| Alto | Verbos genéricos demais: CRUD + `View_Report`, `Export`, `Return`. Ações de negócio (aprovar, finalizar ordem, fechar período de rateio, ajustar horário) não têm permissão própria | LIDO | `ability.ts` (enum `Action`) |
| Alto | Papéis desiguais: MAINTENANCE\_\* aparecem em \~40 arquivos; PARTS\_MANAGER em 3, TIRE\_CONSULTANT em 2, GUEST em 1. Os papéis especializados não têm o que precisam, então na prática todo mundo vira ADMIN | LIDO | `subjects/*.ts` |
| Alto | Autorização opt-in e cache de 1 h sem invalidação (ver Segurança) | LIDO/RODADO | `policy.guard.ts` |
| Médio | 42 arquivos de regra com o mesmo bloco copiado por papel (\~2.100 linhas) e uma matriz de 729 linhas copiada à mão no frontend: vão divergir | LIDO | `subjects/*.ts`, `facter-app/.../role-permissions-map.ts` |
| Médio | Papéis são enum fixo no schema: nenhuma empresa cria papel próprio nem ajusta permissões | LIDO | `schema.prisma` (`RoleType`) |

**Como deve ser na v2:** permissões como dados, não como código copiado. Catálogo de permissões por ação de negócio (`work_order.finish`, `part_request.approve`), papéis padrão definidos uma vez e editáveis por empresa, negação por padrão, condições de dono ("só ordens designadas a mim") avaliadas no backend e filtradas na query, segregação de função explícita onde há dinheiro ou estoque, e o frontend recebendo as permissões do servidor em vez de manter cópia. Usar uma biblioteca madura (CASL de verdade) em vez de motor próprio.

### Schema

O mapa do domínio é rico e correto. A estrutura precisa ser redesenhada.

**Fundações**

- **Multiempresa inconsistente.** Sem `companyId`: `Attachment`, `AssetReading`, `ServiceExecutionLog`, `Checklist`, `ChecklistItem`, `MaintenanceType`, `PartRequest`, `TireRequest`, `WorkOrderAsset`, `CounterReading`. Com `companyId` sem FK: `Notification`, `AllocationPeriod`, as três de transição. `Tire.serialNumber` e `fireNumber` únicos globalmente. `Membership` sem `@@unique([userId, companyId])`.
- **Identidade e tempo.** Três estratégias de id (string da aplicação, `cuid`, `uuid`); `@id @unique` redundante em \~12 models. `createdAt` sem default em `User`, `Note`, `Vehicle`, `Employee`, `ServiceExecution` e outros. \~20 `updatedAt` sem `@updatedAt`. `Shift.startTime` é `DateTime` para hora do dia; `Vehicle.year` é `String`.
- **Tipos.** 45 `Float` (dinheiro, estoque, km) contra 3 `Decimal`. Strings onde deveria haver enum (`Activity.verb`, `Notification.type`, `Allocation.base`); enum fixo onde deveria haver cadastro (`ServiceCategory` com 6 opções e acento no `@map`).
- **Nomes.** Tabela `carries`, coluna `perfomed_at`, `service_assignment_id` em 5 tabelas, model `Events` sem `@map` com colunas camelCase, 31 colunas camelCase sem `@map`. Enums misturando português e inglês (`Fila`/`Manutencao` ao lado de `PENDING`).
- **Integridade.** Nenhum CHECK. Nenhum índice único parcial. Sem coluna de versão. 45 cascades, só 3 models com soft delete. 33 FKs sem índice.

**Modelagem de domínio**

1. **Ativo sem conceito.** `Vehicle` e `Trailer` duplicam campos. Referências: par XOR em 6 models, `assetId` string sem FK em 3, e `MaintenanceSchedule` com `assetIdentifier` + `vehicleId` + lista de `trailers[]`. `AssetType` inclui `FLEET`.
2. **`Axle` exige `trailerId`.** Cavalo mecânico não tem eixo nem posição de pneu.
3. **`Part` mistura catálogo e item físico.** `serialNumber` único por empresa na mesma linha que `stockQuantity`, `location` e `status`. `supplier` é string apesar de existir o model `Supplier`.
4. **Conceitos duplicados.** Pneu com `status`/`location` legados e `tireStatus`/`tireLocation` novos, mais `TireHistory` e `TireEvent`. Três hodômetros. Ordem com `priority` (português) e `orderPriority` (inglês), `isCancelled` e status `Cancelada`. Checklist com `isCanceled` e `CANCELED`. Intervalo de preventiva em 3 lugares. Auditoria em 5 mecanismos, `transitionedBy` sem FK.
5. **Tempo de trabalho** como um par `startAt`/`endAt` por executor.
6. **`Employee @@unique([companyId, name])`**: a empresa não pode ter dois "José da Silva".

### Arquitetura, testes e tooling

| Métrica | Valor |
| --- | --- |
| Use cases com algum teste | 78 de 298 (26%) |
| Suítes Jest | 88: 50 passam, 38 falham (28 não compilam, 8 importam `src/modules/` que não existe) |
| Testes de integração com banco | 0 (`test/app.e2e-spec.ts` é o "Hello World" do Nest) |
| `tsc` produção / com specs | 0 erros / 2.276 erros |
| ESLint | 241 erros; `no-explicit-any` desligado |
| TypeScript strict | Só `strictNullChecks`; `noImplicitAny: false` |
| Arquivos de aplicação/domínio importando `src/infra` ou `@prisma/client` | 39 / 33 |
| Entidades sem comportamento | 45 de 59 (76%) |
| `findById` sem empresa / deletes sem empresa | 36 de 55 / 38 de 47 |
| `findMany` sem `take` | 117 de 167 |
| Mecanismos de erro | 6, e 76 `throw new Error` que viram 500 com a mensagem |
| Lockfiles | 3 (yarn, npm, pnpm) |

- **Clean architecture nominal.** `UnitOfWork` é `Scope.REQUEST` (torna tudo que o injeta request-scoped) e expõe classes Prisma concretas. 4 repositórios abstratos têm `withTransaction(tx: PrismaClient)`. 23 métodos retornam `Promise<any>`.
- **Transações falsas.** Use cases abrem `uow.transaction(repos => …)` e usam os repositórios injetados no construtor, fora da transação. 8 use cases com várias escritas sem transação (rodízio de pneu, criação de membro).
- **Erros.** `global-exception.filter.ts` tem 1.261 linhas e \~110 `instanceof`.
- **Deploy.** Dockerfile com CMD inválido; `.dockerignore` não exclui `.env`; `vercel.json` morto; Node sem versão fixa (Docker 20, local 26); `nvm` como dependência de runtime.
- **Nomes.** `maitenance` ×35, `vechicle` ×17, `assigments` ×10, `sucess` ×15; 238 arquivos camelCase contra 792 kebab-case; \~306 linhas de comentário em português.

### Frontend

A espinha dorsal é melhor do que o histórico sugere: TypeScript strict (53 `any`, 0 `@ts-ignore`), camada HTTP limpa, wrapper de mutations usado em 147 arquivos, auth com portas e adaptadores, permissões vindas do servidor, 65 rotas lazy. Os problemas se concentram em poucos pontos.

| Sev | Achado | Evidência | Local |
| --- | --- | --- | --- |
| Crítico | Cache do React Query persistido por 24 h em `localStorage`, sem `companyId` nas chaves e sem limpeza no logout nem na troca de empresa: dados de uma empresa/usuário aparecem para o próximo | LIDO (confirmado) | `main.tsx:28`, `shared/services/query-persister.ts` |
| Alto | 401 reenvia a requisição, inclusive POST, até 3 vezes; não existe refresh token | LIDO | `interceptor-guards.ts:43`, `api-client.ts:111-114` |
| Alto | Dois `QueryClient`: o configurado nunca é usado; o montado roda com `staleTime` 0, refetch no foco e 3 retries | LIDO | `core/api/hooks/use-query.ts:11`, `shared/services/query-client.ts:3` |
| Alto | Chaves de invalidação que não batem com a fábrica: detalhe e timeline da ordem não atualizam; 10 chamadas ignoram a fábrica | LIDO | `use-change-service-execution-status.ts:60`, `use-edit-note.ts:33` |
| Alto | Tela do mecânico engole erros (`catch {}`) e usa o relógio do celular como horário oficial | LIDO | `mechanic/pages/mechanic-home.tsx:76-106` |
| Alto | Mudança no serviço não invalida a lista de executores (`staleTime` 5 min) | LIDO | `use-service-execution-employees.ts:10` |
| Médio | Regras de domínio duplicadas no cliente: máquina de estados da ordem, matriz de permissões de 729 linhas copiada à mão | LIDO | `shared/domain/work-order/rules.ts:10`, `member/constants/role-permissions-map.ts` |
| Médio | Permissões não recarregam na troca de empresa sem reload | LIDO | `permissions-provider.tsx:48-57` |
| Médio | Tipos da API escritos à mão (53 arquivos) e zod paralelo aos DTOs do backend em 98 arquivos | LIDO | `shared/types/*` |
| Médio | \~2.300 linhas de código morto, telas v1 e v2 convivendo, 7 dependências não usadas, `xlsx@0.18.5` com CVEs, 3 bibliotecas de ícones, 2 sistemas de toast, 2 design systems | LIDO | `components/WorkOrder`, `package.json` |
| Médio | 74 stores Zustand, um por diálogo | LIDO | `tire-manager/store/*` |
| Médio | 1 teste unitário sem runner; 9 testes Playwright; sem CI | LIDO | `e2e/`, sem `.github` |

### Performance (medida)

Medida com 100 mil ordens, 400 mil serviços e 800 mil execuções. **As leituras principais aguentam bem; os gargalos são locais, com uma exceção estrutural (indicadores).**

| Endpoint | p50 / p95 | Queries | Payload |
| --- | --- | --- | --- |
| `GET /work-orders/:id` | 3 / 5 ms | 4 | 2,5 KB |
| `GET /work-orders/:id/timeline` | 4 / 6 ms | 6 | 4,3 KB |
| `GET /work-orders?perPage=20` | 20 / 36 ms | 2 | 127 KB |
| `GET /work-orders/daily` (kanban) | 16 / 18 ms | 1 | 472 KB, 305 ordens, sem paginação |
| `GET /work-orders?perPage=100&employeeId=` (mecânico) | 62 / 68 ms | 2 | 622 KB (47 KB com gzip) |
| `GET /part-requests` (a cada 30 s) | 74 / 79 ms; sob carga 2,2 s | 2 | 32 KB |
| `GET /part-requests/grouped` | 699 / 823 ms | 3 | 36 KB |
| `GET /dashboard/kpis` (frio) | 510 ms | 12–15 | 0,5 KB |

- **Requisições de peça desabam sob carga** (10 req/s): sem `company_id` e sem índice por data, a query varre o histórico e ordena em disco. Um índice levou a 265 req/s (26×).
- **KPI do dashboard** varre transições de todas as empresas (sort de 22 MB em disco) e o cache é limpo a cada transição.
- **Analytics agregado na requisição**, custo proporcional ao período; só o TTL de 120 s esconde. Invalidação `del('…:*')` não faz nada (Redis `DEL` não aceita curinga). Sem proteção contra estouro de cache: 30 requisições frias rodaram 186 queries.
- **Over-fetching:** a lista de ordens inclui frota → reboques → eixos → posições → pneus (4,2 KB de 6 KB por linha). Sem compressão HTTP.
- **Frontend:** cada card do kanban tem seu `setInterval` de 1 s; nenhuma lista virtualizada; maior chunk 1,33 MB gzip; lucide inteiro (424 KB gzip).

### Escalabilidade (medida)

Duas instâncias em paralelo, carga até 200 concorrentes. Sem erros de pool: a latência sobe proporcional à concorrência (1 instância: \~300 req/s; 2 instâncias: \~525 req/s).

| Dimensão | Situação | Motivo |
| --- | --- | --- |
| API sem estado | Precisa de trabalho | SSE guarda conexões num `Map` em memória; não funciona com 2+ instâncias |
| Jobs | Bloqueante | Cron não registrado; quando registrado, rodaria N vezes (sem lock distribuído) |
| Eventos | Bloqueante | Só em memória, sem outbox, fila, retry ou dead-letter |
| Concorrência | Bloqueante | Ver causa raiz 2 |
| Crescimento do banco | Precisa de trabalho | Históricos sem retenção; 45 listas com paginação por offset sem limite de `perPage` |
| Multiempresa | Precisa de trabalho | Sem rate limit por empresa; middleware que some no Prisma 6 |
| Observabilidade | Precisa de trabalho | Métricas declaradas e nunca registradas; `/metrics` público; logs em arquivo local; sem tracing |
| Deploy | Bloqueante | Dockerfile quebrado, sem migrations no deploy, sem validação de env, sem graceful shutdown |

Outros: readiness check dá 31% de 503 falsos sob carga (todas as instâncias escrevem a mesma chave no Redis); pool Prisma padrão de 21 conexões por instância sem `connection_limit` (2 instâncias chegaram a 51 de 100).

## O que está sadio e sobrevive

O trabalho feito até aqui não se perde: os conceitos e boa parte da lógica de domínio vão para a v2. O que muda é a estrutura em volta deles.

**Domínio (portar para a v2)**

- Mapa do domínio: composição (frota), eixos e posições de roda, `ServiceLocationType`, ciclo de vida do pneu com recapagem, rateio, centro de custo hierárquico com `path`, socorro mecânico, campos de integração `externalId`/`externalSource`.
- Entidades com comportamento real: `WorkOrder` (22 métodos, matriz de estados, `MaintenanceTimeTracking`), `ServiceExecution`, `EmergencyRequest` (tabela de transições com guardas), `Tire`.
- Serviços de domínio com teste: `transition-duration-calculator.service.ts`, `trigger-evaluation.service.ts`, `location-type-rules.ts`, `location-type-combination-rules.ts`, `work-order-sla.service.ts`.
- Modelo de transições com `previousStateDurationMinutes`, `pauseReason` e metadata como fatos.
- Erros de domínio tipados (`src/core/domain/errors/*`, 17 arquivos, base `DomainError`, catálogo `ERROR_METADATA`).
- Os contextos delimitados visíveis em `database.module.ts` (identidade, ativo, manutenção, planejamento, inventário, pneu, pessoal, checklist, integração, emergência, analytics, auditoria): servem de mapa de módulos da v2.
- O seed e seus dados de exemplo.

**Frontend (manter e refatorar)**

- `core/api/http.ts` e a normalização de `ApiServiceError`.
- `core/api/hooks/use-mutation.tsx`.
- A fábrica de chaves de `work-order/hooks/query-keys.ts`, estendida a tudo e com `companyId`.
- `core/auth` com portas e adaptadores (facilita trocar o token para cookie httpOnly).
- `core/permissions` (`Can`, `PermissionGate`, habilidades vindas do servidor).
- `@facter/ds-core`, as rotas lazy, o harness Playwright e o seeding via `e2e/fixtures/api.ts`.

**Performance**

- As leituras principais são uma query só graças ao `relationJoins`, e ficam abaixo de 70 ms com 100 mil ordens. O desenho de leitura por agregado funciona.

## Decisão: refatorar ou v2

**Recomendação: caminho B, v2 do núcleo com corte de escopo.**

Os oito auditores recomendaram refatorar no lugar, mas todos partiram da premissa de um sistema com clientes. Sem cliente real e sem dado para migrar, a conta muda: as causas raiz 3 e 4 são estruturais, e corrigi-las no schema atual custa quase o mesmo que redesenhar, com resultado pior.

| Caminho | O que é | Prazo aproximado | Resultado |
| --- | --- | --- | --- |
| A. Refatorar tudo no lugar | Corrigir as 5 causas raiz no schema atual via migrations | 8–10 semanas | Lança no prazo, mas leva para produção o ativo polimórfico, o eixo só em reboque e os conceitos duplicados. Toda correção futura vira migração de dado de cliente. |
| **B. v2 do núcleo + corte de escopo** | Schema e backend novos para o núcleo, portando a lógica boa. Frontend refatorado e adaptado. O resto entra depois do lançamento | 10–12 semanas | Lança com fundações certas e menos funcionalidades. Módulos seguintes são construídos sobre base sólida. |
| C. v2 de tudo | Reescrever \~87 mil linhas da API e \~141 mil do app | Não cabe antes de 2027 | — |

Prazos em ordem de grandeza, supondo a arquiteta trabalhando em par com o Claude. Mais pessoas no time mudam a conta.

**Por que B**

1. As fundações (multiempresa, ativo, dinheiro, tempo, história) atravessam todas as tabelas. Corrigir aos poucos são dezenas de migrations encadeadas, cada uma mexendo em repositórios e use cases.
2. Esta é a última janela sem dado de cliente. Depois do lançamento, qualquer uma dessas mudanças vira migração de produção.
3. Preventiva já precisa ser reescrita, e analytics precisa de tabelas de agregação. Nenhum dos dois atrapalha deixar para depois.
4. O frontend tem espinha dorsal boa. Reescrevê-lo não se paga; adaptá-lo à API nova, com tipos gerados, sim.

**Riscos do caminho B e mitigação**

- *Subestimar o núcleo.* Mitigação: escopo do núcleo congelado por escrito antes da fase 1; tudo que não está nele espera.
- *Reescrever o que funcionava.* Mitigação: portar entidades e serviços de domínio com os testes existentes; o comportamento atual correto vira teste antes de ser reescrito.
- *Frontend e backend desencontrados.* Mitigação: contrato OpenAPI gerado pelo backend e tipos gerados no app desde a primeira rota.

## Plano de execução

Cinco fases em cerca de 12 semanas, cada uma com um critério de saída verificável. Nenhuma fase começa sem a anterior cumprir o critério.

**Onde o código vive:** o backend v2 nasce num projeto novo, com a estrutura certa desde o primeiro commit. A API atual fica congelada como referência de comportamento até o corte. O frontend continua no mesmo repositório e migra tela por tela para a API nova.

| Fase | Semanas | Entregas | Critério de saída |
| --- | --- | --- | --- |
| 0. Decisões e alicerce | 1–2 | Escopo do núcleo congelado por escrito. Invariantes de domínio escritos (ver seção Padrões). ADRs fundacionais. Schema v2 do núcleo revisado. Projeto novo com lint, TS strict, CI, harness de teste de integração com Postgres real, geração de OpenAPI | CI verde rodando um teste de integração de exemplo; schema aprovado pela arquiteta |
| 1. Plataforma | 3–5 | Multiempresa com RLS. Permissões v2 (catálogo por ação, negação por padrão, condição de dono). Auth com cookie httpOnly e refresh. Outbox + fila (BullMQ) com retry e dead-letter. Jobs com lock. Logs estruturados, métricas, tracing. Pipeline de deploy com migrations, validação de env e graceful shutdown | Suíte de isolamento prova que a empresa B não lê nem altera nada da A em todas as rotas; deploy em homolog automatizado |
| 2. Núcleo de domínio | 5–9 | Ativo unificado (veículo, reboque, eixos para ambos). Ordem de serviço. Serviços, executores e sessões de trabalho. Peças com catálogo, livro de movimentações e requisições com aprovação segregada. Custos em `Decimal` com preço congelado na requisição | Todos os invariantes do núcleo cobertos por teste de integração, incluindo os cenários de concorrência desta auditoria |
| 3. Frontend no núcleo | 7–11 | Tipos gerados do OpenAPI. Cache com `companyId` e limpeza no logout. Um `QueryClient`. Telas do núcleo apontando para a v2. XSS e 401 corrigidos. Código morto removido | Jornadas críticas passando no Playwright contra a v2 |
| 4. Indicadores e endurecimento | 10–12 | Indicadores mínimos sobre tabelas de agregação. Teste de carga com volume realista. Revisão de segurança. Piloto com um cliente | Metas de performance da seção Métricas atingidas; zero achado crítico em aberto |

**Escopo proposto** (a confirmar pelo time, ver Decisões em aberto)

| Módulo | Lançamento | Motivo |
| --- | --- | --- |
| Empresas, usuários, membros, permissões | Sim | Plataforma |
| Ativos (veículo, reboque, frota, eixos, posições) | Sim | Base de tudo |
| Ordem de serviço, serviços, executores | Sim | Fluxo principal |
| Peças, estoque, requisições | Sim | Custo da ordem depende disso |
| Funcionários, cargos, turnos, boxes | Sim | Necessário para executar ordens |
| Notas e anexos da ordem | Sim | Baixo custo, uso diário |
| Indicadores essenciais (fila, tempo médio, custo por ordem) | Sim | Sobre tabelas de agregação |
| Pneus e recapagem | A decidir | Grande e com bugs de integridade |
| Checklists | A decidir | Precisa de `companyId` e vínculo com serviço |
| Preventiva | Depois | Reescrita completa |
| Analytics completo | Depois | Depende de read models |
| Rateio e centros de custo | Depois | Depende do livro de movimentações |
| Socorro mecânico | Depois | Independente do núcleo |
| Integrações e telemática | Depois | Nunca rodou |

**Enquanto a v2 não sai:** nenhuma funcionalidade nova na API atual. Correções só se bloquearem uma demonstração. Toda regra de negócio descoberta na API atual vira teste ou invariante escrito para a v2.

## Padrões de engenharia

Estas regras valem para todo código novo, sem exceção silenciosa. Uma exceção é possível, mas só registrada num ADR com o motivo. Cada regra existe porque a ausência dela gerou um achado desta auditoria.

### Arquitetura

1. **Módulos por contexto de negócio** (ativos, manutenção, estoque, pessoal, identidade). Um módulo não lê tabela de outro: conversa pela interface pública dele ou por evento.
2. **Camadas com direção única:** `domain` ← `application` ← `infra`/`http`. O domínio não importa Prisma, Nest nem nada de `infra`. Uma regra de lint quebra o build se isso acontecer.
3. **Um agregado, um dono.** Todo estado tem um único caminho de escrita: o método do agregado, chamado por um único use case por ação. Não existe `PUT` genérico que altere status, e não existem dois endpoints que mudem o mesmo estado.
4. **Entidades com comportamento.** Transição de estado é método da entidade que valida e registra o fato (`workOrder.finish(by, at)`). Setter público de status é proibido.
5. **Estado derivado é calculado, não sincronizado à mão.** Se o status do serviço depende dos executores, uma função única deriva, dentro da mesma transação.
6. **Um mecanismo de erro.** Erros de domínio tipados com código estável, mapeados para HTTP num só lugar. `throw new Error` genérico em regra de negócio é proibido.

### Dados e schema

1. **Toda tabela de negócio tem `company_id NOT NULL` com FK**, inclusive tabelas filhas. Unicidade de negócio sempre composta com a empresa: `UNIQUE(company_id, serial_number)`.
2. **Ids:** UUID v7 gerado pelo banco (ordenado por tempo, bom para índice). Um padrão só.
3. **Tempo:** `timestamptz` sempre, gravado em UTC, com `created_at DEFAULT now()` e `updated_at` mantido pelo banco. Hora do dia é `time`. Dia de negócio é calculado no fuso da empresa (`America/Sao_Paulo` por padrão, configurável).
4. **Dinheiro é `numeric(14,2)`; quantidade é `numeric(14,4)`.** `Float` é proibido para qualquer coisa que se some ou se compare.
5. **História não se apaga.** `ON DELETE RESTRICT` por padrão; soft delete (`deleted_at`) em cadastros; tabelas de fato (transições, movimentações, sessões) são append-only. `CASCADE` só em composição pura, justificado no ADR.
6. **O banco garante invariantes:** CHECK para XOR, quantidade ≥ 0, fim ≥ início; índice único parcial para "no máximo um aberto"; FK em toda referência. Nada de `assetId` string sem FK.
7. **Um conceito, um lugar.** Nenhum campo duplicado com outro nome ("legado" e "novo"). Mudou o modelo? Migra e remove o antigo na mesma entrega.
8. **Nomes:** tabelas e colunas em `snake_case` inglês, tabelas no plural; enums em inglês `UPPER_SNAKE`. Texto em português só na camada de apresentação.
9. **Cadastro configurável é tabela, não enum** (categorias de serviço, tipos de problema). Enum só para conjuntos que o código interpreta (status).
10. **Migrations:** uma por mudança, com nome descritivo, revisadas no PR, sempre para frente. Nenhuma migration destrutiva sem ADR.

### Multiempresa e permissões

1. **RLS no Postgres em toda tabela com `company_id`.** A conexão seta `app.company_id` por transação. Sem contexto de empresa, a query não devolve nada: falha fechada. Jobs e listeners abrem contexto explícito.
2. **Repositório recebe a empresa por parâmetro** mesmo com RLS: defesa em profundidade e código legível.
3. **Negação por padrão.** Rota sem permissão declarada não sobe: um teste varre todas as rotas e falha se alguma não tiver `@Permission` ou `@Public` justificado.
4. **Permissão por ação de negócio** (`work_order.finish`, `part_request.approve`), não por CRUD. Papéis são conjuntos de permissões guardados como dados, com padrões do sistema e ajuste por empresa.
5. **Condição de dono aplicada na query**, não só no guard: "mecânico vê só as ordens designadas a ele" filtra no banco.
6. **Segregação de função** onde há dinheiro ou estoque: quem solicita não aprova.
7. **Mudança de papel invalida a sessão** e o cache de permissões na hora.
8. **O frontend nunca decide permissão:** recebe do servidor o que o usuário pode fazer e só esconde botões.

### Concorrência e consistência

1. **Toda escrita que depende do estado anterior é condicional:** `UPDATE … WHERE id = $1 AND version = $2` (lock otimista, coluna `version` em todo agregado) ou `WHERE status = 'PENDING'`, conferindo linhas afetadas. Zero linhas = conflito, devolvido como 409.
2. **Estoque só muda por movimentação:** insert no livro + update condicional `WHERE quantity >= $n`, na mesma transação. Saldo nunca é editado direto.
3. **Uma transação por comando.** Tudo que o use case grava entra na mesma transação, e o repositório usado é o da transação (o tipo não permite usar outro).
4. **Idempotência:** todo POST que cria ou move algo aceita `Idempotency-Key`; jobs usam chave natural (plano + ativo + ciclo).
5. **Numeração sequencial por tabela de contador** com `UPDATE … RETURNING` na mesma transação. Nunca `max + 1`.
6. **O servidor define o tempo oficial.** Horário informado pelo usuário é um ajuste explícito, validado (limite, fim ≥ início), com permissão própria e registrado como tal.

### API

1. **Contrato OpenAPI gerado do código** e publicado no CI. O frontend gera tipos e cliente a partir dele. Tipo escrito à mão para resposta de API é proibido.
2. **DTO de entrada valida regra, não só formato:** quantidades positivas, enums fechados, datas coerentes, tamanho máximo de arrays. Campos que o cliente não pode definir (status inicial, autor) não existem no DTO.
3. **DTO de saída explícito:** nunca serializar entidade ou linha do Prisma. Senha e segredos nunca saem.
4. **Paginação por cursor** nas listas que crescem, com `limit` máximo de 100. Nenhum `findMany` sem limite.
5. **Comandos são rotas de ação** (`POST /work-orders/:id/finish`), não `PATCH` de status.
6. **Erros no formato padrão** (RFC 9457) com código estável e mensagem em português; nunca detalhe interno, caminho de arquivo ou erro do ORM.
7. **Compressão HTTP ligada; payload de lista enxuto.** Detalhe carrega o agregado; lista carrega o que a linha mostra.

### Eventos, jobs e leitura

1. **Outbox transacional:** o evento é gravado na mesma transação do comando e publicado na fila (BullMQ) por um relay. Evento só em memória é proibido para qualquer efeito que importe.
2. **Consumidores idempotentes**, com retry exponencial e dead-letter monitorada.
3. **Jobs agendados rodam uma vez só** (repeatable do BullMQ ou advisory lock) e processam empresa por empresa sem que uma falha derrube as outras.
4. **Indicadores vêm de tabelas de agregação** atualizadas por evento, nunca de agregação do histórico na requisição. Cada indicador tem definição escrita (fórmula, unidade, fuso) e teste com números conhecidos.
5. **Cache é otimização, não correção:** chave sempre com empresa, invalidação por evento, proteção contra estouro (lock ou stale-while-revalidate).
6. **Retenção definida** para toda tabela de log e histórico técnico (notificações, logs de integração), com job de limpeza.

### Frontend

1. **Estado do servidor só no React Query**, com um `QueryClient` e uma fábrica de chaves por feature, sempre começando por `companyId`. Invalidação usa a fábrica, nunca array escrito à mão.
2. **Logout e troca de empresa limpam todo o cache.** Cache persistido em disco só para dado não sensível e com chave por usuário.
3. **Regra de negócio mora no backend.** O cliente pergunta ao servidor quais ações estão disponíveis (`availableActions` na resposta) em vez de reimplementar a máquina de estados.
4. **Uma chamada, uma ação de negócio.** Nada de duas requisições em sequência sem rollback para uma intenção do usuário.
5. **Nenhum `dangerouslySetInnerHTML`** com conteúdo de usuário. Menções e formatação viram componentes.
6. **Erro nunca é engolido:** todo `catch` mostra feedback ou relança.
7. **Um design system, uma biblioteca de ícones, um sistema de toast.** Tela nova não cria variação v2 ao lado da v1: substitui.
8. **Mobile-first, mas desktop projetado.** Listas grandes são virtualizadas; cronômetros compartilham um único timer.

### Segurança

1. **Token em cookie httpOnly, `SameSite=Lax`, com refresh rotativo** e revogação no logout, na troca de senha e na mudança de papel.
2. **Rate limit** por IP no login e cadastro, e por empresa na API.
3. **Segredos:** env validado no boot com schema; sem default para segredo; credenciais de integração criptografadas em repouso.
4. **Headers de segurança** (helmet), CORS restrito, JWT nunca por query string.
5. **Dependências auditadas no CI** (`npm audit` / Dependabot); CVE alta bloqueia merge.

### Observabilidade e operação

1. **Logs estruturados em JSON** com `requestId`, `companyId` e `userId`, enviados a um coletor, nunca só para arquivo local.
2. **Métricas RED** (taxa, erros, duração) por rota e por fila, com alerta. `/metrics` protegido.
3. **Tracing** de requisição à query e ao job.
4. **Health:** liveness não depende de nada externo; readiness checa o banco sem escrever.
5. **Deploy reprodutível:** imagem construída no CI, Node fixado (`.nvmrc` e `engines`), um lockfile, migrations aplicadas no deploy, graceful shutdown.

### Código

1. **Idioma:** identificadores e comentários em inglês; textos de interface em português.
2. **Nomes de arquivo em `kebab-case`**, um padrão de pasta (`use-cases/`).
3. **TypeScript `strict: true`** no backend e no frontend; `any` proibido por lint (exceção com comentário do porquê).
4. **Lint e type-check zerados** como condição de merge, não como meta.

## Estratégia de testes

**A camada principal é o teste de integração contra Postgres real, não o unitário com mock.** A suíte atual tem 448 testes, 438 passam, e nenhum pegou a corrida do executor, o estoque negativo ou o vazamento entre empresas, porque todos mockam exatamente o que quebra: banco, transação e concorrência.

### As camadas e o que cada uma prova

| Camada | Ferramenta | O que prova | O que não deve testar |
| --- | --- | --- | --- |
| Unitário de domínio | Jest + fast-check | Regras puras: máquina de estados, cálculo de duração, custo, derivar status do serviço pelos executores. Sem mock nenhum, porque domínio não tem dependência | Repositório, controller, "chamou o método X" |
| Integração (principal) | Jest + Testcontainers (Postgres e Redis reais) + supertest | Cada use case pela API: regra + transação + RLS + permissão + resposta. Invariantes conferidos no banco depois da chamada | Detalhe de layout, texto de mensagem |
| Concorrência | Mesma base, requisições em paralelo | Os cenários desta auditoria: aprovações simultâneas, creates na mesma frota, cancelar + iniciar | — |
| Isolamento e permissão | Gerada a partir da lista de rotas | Para toda rota: empresa B não lê nem altera dado da A; cada papel recebe exatamente o que a matriz diz; nenhuma rota sem permissão | — |
| Contrato | OpenAPI + tipos gerados no app | Frontend e backend concordam; mudança que quebra o contrato quebra o build | — |
| E2E | Playwright contra API real e banco semeado | 8 a 12 jornadas críticas de ponta a ponta, no desktop e no celular | Toda variação de regra (isso é integração) |
| Carga | k6 com volume realista | Metas de latência da seção Métricas nas rotas quentes | — |

### Teste que vale e teste que enche linguiça

**Enche linguiça** (padrão comum na suíte atual):

```ts
it('calls repository.save', async () => {
  repo.findById.mockResolvedValue(order);
  await sut.execute({ id });
  expect(repo.save).toHaveBeenCalled();
});
```

Passa mesmo se a regra estiver errada, se a transação não existir e se duas chamadas simultâneas corromperem o dado. Testa a implementação, não o comportamento, e quebra em qualquer refactor.

**Vale** (prova o comportamento que importa, no banco de verdade):

```ts
it('never lets stock go negative under concurrent approvals', async () => {
  const part = await seed.part({ stock: 1 });
  const reqs = await seed.partRequests(3, { part, quantity: 1 });

  const results = await Promise.all(
    reqs.map(r => api.as(manager).post(`/part-requests/${r.id}/approve`))
  );

  expect(results.filter(r => r.status === 200)).toHaveLength(1);
  expect(results.filter(r => r.status === 409)).toHaveLength(2);
  expect(await db.stockOf(part.id)).toBe(0);
  expect(await db.movementsOf(part.id)).toHaveLength(1);
});
```

### Regras

1. **Todo use case novo nasce com teste de integração** cobrindo o caminho feliz, cada regra que recusa e o efeito no banco.
2. **Todo invariante escrito tem um teste que tenta quebrá-lo**, inclusive por concorrência quando fizer sentido.
3. **Todo bug começa com um teste que falha.** O PR da correção mostra o teste vermelho antes e verde depois.
4. **Mock só na fronteira externa** (telemática, e-mail, ERP). Banco, fila e cache são reais no teste.
5. **Máquinas de estado têm teste por propriedade** (fast-check): sequências aleatórias de comandos nunca produzem estado inválido.
6. **Qualidade medida por mutação, não por cobertura.** Stryker no módulo de domínio: se mudar um `>=` para `>` e nenhum teste falhar, o teste não protege nada. Cobertura de linha sozinha premia teste linguiça.
7. **Dados de teste por fábrica** (`seed.part({ stock: 1 })`), nunca por fixture gigante compartilhada. Cada teste cria o que usa, dentro de uma empresa própria, e pode rodar em paralelo.
8. **E2E só para jornadas**, cada uma com dono e critério claro. Teste E2E instável é corrigido ou removido na mesma semana, nunca ignorado.

### Jornadas E2E iniciais

1. Login, troca de empresa e logout sem vazar dados entre empresas.
2. Abrir ordem, colocar em manutenção, adicionar serviço e executor, iniciar, pausar com motivo, retomar, concluir, finalizar a ordem.
3. Dois executores no mesmo serviço, com tempos trabalhados corretos na tela.
4. Requisitar peça, aprovar por outro usuário, entregar, devolver, conferir estoque e custo da ordem.
5. Mecânico no celular: vê só as ordens dele, inicia e conclui o serviço.
6. Papel sem permissão não vê o botão e recebe 403 ao tentar pela API.
7. Cancelar ordem com serviços abertos e conferir que nada fica rodando.
8. Indicadores do dia batendo com as ordens criadas no teste.

### Verificação contínua de invariantes

Além dos testes, um job diário em homologação (e depois em produção) roda consultas SQL que procuram violações: serviço pausado com executor rodando, estoque negativo, sessão aberta em serviço concluído, linha sem `company_id`. Qualquer resultado gera alerta. É a rede que pega o que os testes não previram.

## Métricas e definição de pronto

Cada métrica tem meta, forma de medir e consequência. Métrica sem consequência vira decoração.

### Métricas

| Métrica | Meta | Como mede | Se não atingir |
| --- | --- | --- | --- |
| Lint, type-check e build | 0 erros | CI em todo PR | Merge bloqueado |
| Testes | 100% passando, zero `skip` sem issue | CI | Merge bloqueado |
| Rotas sem permissão declarada | 0 | Teste que varre as rotas | Merge bloqueado |
| Rotas sem teste de isolamento entre empresas | 0 | Suíte gerada da lista de rotas | Merge bloqueado |
| Use cases com teste de integração | 100% | Relatório do CI | Merge bloqueado |
| Mutation score do domínio | ≥ 80% | Stryker semanal | Tarefa no sprint seguinte |
| Invariantes violados em homologação | 0 | Job diário de consultas | Alerta, correção antes de novas features |
| p95 de leitura de agregado (detalhe) | &lt; 100 ms com 100 mil ordens | k6 no pipeline de release | Release bloqueado |
| p95 de lista paginada | &lt; 200 ms | k6 | Release bloqueado |
| p95 de comando (transição, aprovação) | &lt; 300 ms | k6 | Release bloqueado |
| p95 de indicador | &lt; 300 ms sem depender de cache | k6 com cache frio | Release bloqueado |
| Taxa de erro 5xx | &lt; 0,1% das requisições | Métricas de produção | Alerta imediato |
| Payload máximo de lista | &lt; 100 KB por página, com gzip | Teste de contrato | Revisão obrigatória |
| Bundle inicial do app | &lt; 300 KB gzip | CI | Revisão obrigatória |
| Dependências com CVE alta | 0 | Auditoria no CI | Merge bloqueado |
| Tempo de CI | &lt; 10 min | CI | Otimizar antes de crescer a suíte |

Métricas de processo, acompanhadas sem meta rígida no início: lead time do PR, frequência de deploy em homologação, taxa de rollback e bugs em produção por módulo.

### Definição de pronto

Uma entrega só está pronta quando todos os itens valem. Este checklist vai no template de PR.

- [ ] Regra de negócio no agregado, com um único caminho de escrita
- [ ] Invariantes novos escritos no documento de invariantes e garantidos no banco quando possível (CHECK, unique, FK)
- [ ] Escritas condicionais ou com versão onde há estado anterior
- [ ] `company_id` e RLS em tabela nova; permissão por ação declarada na rota
- [ ] Teste de integração do use case (feliz, recusas, efeito no banco)
- [ ] Teste de concorrência quando duas pessoas podem agir ao mesmo tempo
- [ ] Teste de isolamento e de permissão gerado para a rota nova
- [ ] Contrato OpenAPI atualizado e tipos do app regenerados
- [ ] Migration nomeada e revisada; nada destrutivo sem ADR
- [ ] Logs e métricas no caminho novo; erros com código estável
- [ ] ADR escrito se houve decisão de arquitetura ou exceção a um padrão
- [ ] Rodando em homologação e validado pela arquiteta antes de produção

## Como não perder o contexto

O sistema atual chegou aqui em parte porque as decisões ficaram na cabeça de quem escreveu e nos comentários de bugs antigos. Na v2, o contexto mora no repositório, versionado junto com o código, e é lido tanto pelo time quanto pelo Claude a cada sessão.

### O que fica no repositório

| Arquivo | Conteúdo | Quando atualiza |
| --- | --- | --- |
| `CLAUDE.md` (raiz de cada repo) | Os padrões desta página em forma de regra curta, comandos do projeto, onde fica cada coisa, o que nunca fazer | Toda vez que um padrão muda |
| `docs/adr/NNNN-titulo.md` | Uma decisão de arquitetura por arquivo: contexto, decisão, alternativas, consequências. Nunca editado depois de aceito; uma decisão nova substitui a antiga | A cada decisão ou exceção a padrão |
| `docs/domain/invariants.md` | Os invariantes de cada agregado, numerados (ex.: `WO-3: no máximo uma ordem aberta por frota`), cada um apontando para o teste e a constraint que o garantem | Junto com a regra, no mesmo PR |
| `docs/domain/glossary.md` | Termos do negócio e seus nomes no código (composição/fleet, cavalo/tractor, OS/work order, rateio/allocation) | Quando aparece termo novo |
| `docs/domain/metrics.md` | Definição de cada indicador: fórmula, unidade, fuso, fonte, teste | Junto com o indicador |
| `docs/runbooks/` | Como fazer deploy, rodar migration, restaurar backup, investigar alerta | Quando o processo muda |
| Template de PR | O checklist de definição de pronto | Quando o checklist muda |

### Regras de contexto

1. **Decisão que não está num ADR não foi tomada.** Conversa, chat e reunião geram ADR ou não valem.
2. **Todo PR referencia a issue e, quando muda regra, o invariante.** O histórico do git explica o porquê, não só o quê.
3. **Comentário no código explica o porquê não óbvio** (uma restrição, um bug que motivou a linha), nunca o que a linha faz nem a história do bug antigo.
4. **Esta auditoria vira o ADR 0001** ("Por que a v2 do núcleo"), com link para este documento.
5. **Revisão mensal de 30 minutos:** os ADRs do mês ainda valem? algum padrão está sendo ignorado? alguma métrica piorou?
6. **Sessões com o Claude começam pelo `CLAUDE.md` e pelos invariantes do módulo em questão**, e terminam atualizando-os se algo mudou.

## Decisões em aberto e próximos passos

**Decisões do time**

- [ ] Aprovar o caminho B (v2 do núcleo com corte de escopo) ou escolher outro
- [ ] Fechar o escopo do lançamento: pneus e checklists entram ou ficam para depois?
- [ ] Confirmar a data de lançamento e quem trabalha na v2 (o prazo de 10–12 semanas supõe a arquiteta em par com o Claude)
- [ ] Backend v2 em repositório novo ou em pasta nova no repositório atual
- [ ] Onde a API vai rodar em produção (container gerenciado, Vercel, VPS): isso define fila, jobs e conexões
- [ ] Papéis padrão do produto e o que cada um pode fazer, antes de escrever o catálogo de permissões

**Próximos passos (Claude)**

- [ ] Esboçar o schema v2 do núcleo para revisão: ativo, ordem, serviço, executores com sessões de trabalho, estoque com livro de movimentações, multiempresa com RLS, permissões
- [ ] Escrever o primeiro rascunho de `invariants.md` a partir desta auditoria
- [ ] Escrever o ADR 0001 e o `CLAUDE.md` da v2 com os padrões desta página
- [ ] Montar o esqueleto do projeto v2 com CI, harness de integração e o primeiro teste de isolamento

**Ambiente local:** o banco `facter_truck` ficou com dados de teste da auditoria (resetar com `yarn db:reset`); `facter_truck_perf` (1,6 GB) e `facter_truck_scale` (15 MB) podem ser apagados.
