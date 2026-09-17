---
title: Ciclo de Vida da OS
sidebar_position: 1
tags: [techcare, produto, ordem-servico, status, regras-negocio]
---

# Ciclo de Vida da Ordem de Serviço

> São 11 status no sistema e 5 etapas na tela. Esta página explica os dois, quais passagens são permitidas e o que cada uma exige.

---

## Os 11 status

| Status | O que significa | Encerra a ordem? |
|--------|-----------------|:---:|
| **Recebido** | OS criada, aparelho no balcão | não |
| **Triagem** | Conferência de entrada em andamento | não |
| **Diagnóstico** | Em análise técnica | não |
| **Aguardando aprovação** | Orçamento enviado, esperando o cliente | não |
| **Aprovado** | Cliente aprovou | não |
| **Recusado** | Cliente recusou | **sim** |
| **Aguardando peça** | Peça encomendada, serviço parado | não |
| **Em execução** | Técnico trabalhando | não |
| **Concluído** | Serviço terminado, aparelho pronto na prateleira | não |
| **Entregue** | Cliente retirou | **sim** |
| **Arquivado** | Histórico. Estado final, não sai mais daqui | **sim** |

---

## As 5 etapas na tela

Um passo por status seria ilegível, então a trilha da ordem agrupa:

| Etapa | Status que ela representa |
|-------|---------------------------|
| **Recebimento** | Recebido, Triagem |
| **Diagnóstico** | Diagnóstico |
| **Orçamento** | Aguardando aprovação, Aprovado, Recusado |
| **Execução** | Em execução, Aguardando peça |
| **Entrega** | Concluído, Entregue, Arquivado |

Os status que **não avançam** o fluxo aparecem como situação da etapa: "Aguardando aprovação" e "Aguardando peça" marcam a etapa como **em espera**, e "Recusado" **interrompe** a trilha onde estiver.

---

## Passagens permitidas

```
RECEBIDO ──┬──▶ TRIAGEM ──┬──▶ DIAGNÓSTICO ──┬──▶ AGUARDANDO APROVAÇÃO
           │              │                  │            │
           │              └──────────────────┘            ├──▶ APROVADO
           └──▶ DIAGNÓSTICO                               └──▶ RECUSADO
                                                                  │
   APROVADO ──┬──▶ AGUARDANDO PEÇA ──▶ EM EXECUÇÃO                │
              └──▶ EM EXECUÇÃO ◀────────────┘  │                  │
                                               ▼                  ▼
                                          CONCLUÍDO ──▶ ENTREGUE ◀┘
                                                            │
   (RECEBIDO, TRIAGEM, DIAGNÓSTICO, RECUSADO) ──────────▶ ARQUIVADO ◀┘
```

Em forma de tabela:

| De | Pode ir para |
|----|--------------|
| Recebido | Triagem, Diagnóstico, Arquivado |
| Triagem | Diagnóstico, Aguardando aprovação, Arquivado |
| Diagnóstico | Aguardando aprovação, Em execução, Arquivado |
| Aguardando aprovação | Aprovado, Recusado |
| Aprovado | Aguardando peça, Em execução |
| Recusado | Arquivado, **Entregue** |
| Aguardando peça | Em execução |
| Em execução | Concluído, Aguardando peça |
| Concluído | Entregue |
| Entregue | Arquivado |
| Arquivado | *(nada)* |

Duas passagens que surpreendem à primeira vista:

- **Recusado → Entregue** existe porque o aparelho tem que voltar para o dono mesmo sem conserto.
- **Diagnóstico → Em execução** pula o orçamento: é o serviço de balcão, resolvido na hora sem orçar. Tem consequência — ver [Garantia e retorno](./garantia-e-retorno).

Qualquer outra tentativa é recusada com a mensagem *"Não é possível alterar o status de X para Y"*.

---

## O que cada passagem exige

| Para entrar em | Exige |
|----------------|-------|
| **Diagnóstico** | Técnico atribuído |
| **Em execução** | Técnico atribuído |
| **Aguardando aprovação** | Diagnóstico preenchido |
| **Concluído** | Solução preenchida |

A exigência de técnico **não vale no modo autônomo**: lá a ordem já nasce atribuída a quem a criou.

---

## O que acontece sozinho

| Quando | O que o sistema faz |
|--------|---------------------|
| Qualquer mudança de status | Grava um evento na linha do tempo, com a observação digitada |
| Começa a triagem | O status vai de **Recebido** para **Triagem** automaticamente |
| Orçamento é enviado | A ordem vai para **Aguardando aprovação** |
| Cliente aprova / recusa | A ordem vai para **Aprovado** / **Recusado** |
| Entra em **Concluído** | Dá **baixa no estoque** das peças do orçamento aprovado **e emite a garantia** |
| Entra em Em execução, Concluído, Entregue | Carimba a data da etapa — e **não sobrescreve** se a ordem voltar e passar de novo |

O status da triagem é consequência do trabalho, não uma escolha: ninguém marca "Triagem" à mão, isso acontece quando alguém começa a conferir.

---

## O que observar ao testar

- Tente concluir uma ordem sem escrever a solução: deve ser recusado com mensagem clara.
- Tente enviar para aprovação sem diagnóstico: idem.
- Mude o status com uma observação escrita e confira se ela aparece na linha do tempo.
- Numa ordem que voltou de "Em execução" para "Aguardando peça" e avançou de novo: a data de início **não** deve ter mudado.

---

## Documentos relacionados

- [Abertura e triagem](./abertura-e-triagem)
- [Orçamento e aprovação](./orcamento-e-aprovacao)
- [Execução e entrega](./execucao-e-entrega)
