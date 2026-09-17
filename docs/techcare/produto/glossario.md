---
title: Glossário
sidebar_position: 2
tags: [techcare, produto, glossario, vocabulario]
---

# Glossário

> As palavras que a interface usa e o que cada uma quer dizer na oficina. Onde o sistema usa um termo diferente do que se fala no balcão, os dois estão registrados.

---

## Ordem de serviço

| Termo | O que é |
|-------|---------|
| **OS / Ordem de serviço** | O registro de um aparelho que entrou na oficina. Numerada como `OS-202609-00001` — o contador reinicia em 00001 a cada mês |
| **Problema relatado** | O que o cliente disse que está acontecendo. Obrigatório na abertura |
| **Avarias de entrada** | Marcas e defeitos físicos que o aparelho **já tinha** quando chegou. É uma lista de itens marcáveis, não um texto corrido — a entrega confere contra a mesma lista |
| **Acessórios** | O que veio junto (carregador, capa, cabo). Também uma lista, pelo mesmo motivo |
| **Triagem / Conferência de entrada** | O momento de conferir avarias e acessórios. Pode ser salva pela metade e retomada |
| **Diagnóstico** | O que o técnico achou de fato |
| **Solução** | O que o técnico fez. Obrigatória para concluir |
| **Prazo prometido** | A data combinada com o cliente (`expectedAt`). É opcional, e boa parte das ordens nasce sem ele |
| **Linha do tempo / Histórico** | Os eventos da OS: criação, mudança de status, diagnóstico, orçamento, pagamento, entrega |

---

## Cadastros

| Termo | O que é |
|-------|---------|
| **Cliente** | Pessoa física (PF) ou jurídica (PJ). Tem categoria: **Comum**, **VIP** (prioridade) ou **Atacado** (desconto) |
| **Aparelho / Equipamento** | Sempre pertence a um cliente. Categorias: computador, notebook, impressora, monitor, celular, tablet, rede, periférico, outro |
| **Senha do aparelho** | Campo próprio do aparelho. É a primeira coisa que o técnico procura |
| **Serviço** | Item do catálogo de mão de obra: preço de tabela, dias de garantia e **tempo estimado** |
| **Peça** | Item de estoque: SKU, custo, preço, quantidade, quantidade mínima, localização e **origem** |

### Origem da peça

Define o risco que a loja assume e o prazo de garantia sugerido no cadastro:

| Origem | O que significa | Prazo sugerido |
|--------|-----------------|----------------|
| **Original** | Tem a garantia do fabricante por trás; a loja repassa | 90 dias |
| **Compatível** | Equivalente de fornecedor, garantia menor | 60 dias |
| **Genérica** | Muitas vezes sem garantia nenhuma; a loja assume o risco | 30 dias |

É apenas o padrão do cadastro. O que vale numa garantia já emitida é o prazo que estava no orçamento aprovado.

---

## Orçamento

| Termo | O que é |
|-------|---------|
| **Orçamento** | Numerado `ORC-202609-00001`. Nasce como **rascunho** e só vai ao cliente quando alguém **envia** |
| **Item do orçamento** | Um serviço ou uma peça. Descrição e preço são **copiados** no momento — reajustar a tabela depois não altera orçamento já enviado |
| **Link do orçamento** | Endereço público (`/quote/<token>`) que o cliente abre sem login para aprovar ou recusar |
| **Validade** | Data até quando o orçamento vale. **Por enquanto nada expira sozinho**: passada a data o status continua "enviado", e quem percebe é o painel |

---

## Garantia

| Termo | O que é |
|-------|---------|
| **Garantia** | Emitida automaticamente ao concluir a OS, **desde que exista orçamento aprovado**. Tem um código curto tipo `WRT-XXXXX` |
| **Item de garantia** | O que está coberto e por quantos dias **cada coisa**: a mão de obra pode ter 90 dias e a peça genérica 30, no mesmo aparelho |
| **Vigente** | Está dentro do prazo e não foi anulada |
| **Vencida** | Passou da data. Não é um status guardado — é calculado na hora da consulta |
| **Anulada** | Alguém cancelou a garantia por violação, com motivo escrito. É um status guardado |
| **Acionamento** | O retorno do cliente em garantia. Abre uma **OS de retorno** com valores zerados |
| **Coberto / Não coberto** | O julgamento do técnico sobre o acionamento. Coberto = refaz sem cobrar. Não coberto = vira orçamento normal |

---

## Estoque e dinheiro

| Termo | O que é |
|-------|---------|
| **Movimentação** | Entrada (compra), saída para OS, venda direta, ajuste de inventário, devolução ou perda |
| **Baixa automática** | A saída das peças do orçamento aprovado, feita sozinha quando a OS é concluída |
| **Estoque mínimo** | O ponto de alerta da peça |
| **Pagamento** | Valor, forma (dinheiro, Pix, débito, crédito à vista, crédito parcelado, transferência) e parcelas |

---

## Painel

| Termo | O que é |
|-------|---------|
| **O Dia** | A tela inicial (`/hoje`): o que precisa de alguém hoje |
| **Pendência** | Uma ordem parada esperando alguém. Cada ordem aparece **uma vez só**, pelo motivo mais urgente |
| **Empresa / Oficina** | O inquilino do sistema. Todo dado pertence a uma empresa, e um mesmo usuário pode ter cargos diferentes em empresas diferentes |

---

## Documentos relacionados

- [Ciclo de vida da OS](./fluxos/ciclo-de-vida-da-os)
- [Garantia e retorno](./fluxos/garantia-e-retorno)
