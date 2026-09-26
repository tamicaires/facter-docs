---
title: "Padrões de engenharia"
sidebar_position: 1
tags: [padroes, arquitetura, dados, multiempresa, permissoes, concorrencia, api, frontend, seguranca]
---

# Padrões de engenharia

:::note Documento vivo
Origem: [auditoria de 2026-09](../auditoria-2026-09.md). Esta página evolui com o projeto; mudança de padrão exige ADR. Vale para todo código novo da v2.
:::

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

### Idiomas e localização

1. **Nenhum texto fixo no código.** Todo texto de tela, e-mail, PDF e mensagem sai de arquivos de tradução. Lançamento em pt-BR; espanhol e inglês entram só com tradução.
2. **A API devolve códigos, não frases:** erros, status e motivos (`WORK_ORDER_NOT_IN_MAINTENANCE`, `WAITING_PART`). A interface traduz.
3. **Datas, números e moeda formatados pela localidade** (`Intl`), nunca concatenados à mão; período e fuso pela empresa.
4. **Organização define idioma e moeda padrão; usuário pode trocar o idioma.** Todo valor monetário guarda a moeda junto.
5. **Conteúdo digitado pelo usuário não é traduzido** (notas, descrições, nomes de peça); só o que o sistema escreve.
6. **Teste de chave faltando:** o build falha se uma chave de tradução usada não existir no pt-BR.

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
