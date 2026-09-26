---
title: "Contexto e documentação"
sidebar_position: 4
tags: [documentacao, adr, contexto, processo]
---

# Contexto e documentação

:::note Documento vivo
Origem: [auditoria de 2026-09](../auditoria-2026-09.md). Esta página evolui com o projeto; mudança de padrão exige ADR. Vale para todo código novo da v2.
:::

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
