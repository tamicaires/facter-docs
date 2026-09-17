---
title: Garantia e Retorno
sidebar_position: 5
tags: [techcare, produto, garantia, retorno, acionamento]
---

# Garantia e Retorno

> A parte mais recente do produto, e a que resolve o problema mais caro de uma oficina pequena: o aparelho que volta. Enquanto o retrabalho não é registrado, ele não aparece em lugar nenhum — só no tempo que sumiu da semana.

---

## Como a garantia nasce

Ao concluir a ordem, se existir **orçamento aprovado**, o sistema emite a garantia sozinho.

| Regra | Detalhe |
|-------|---------|
| **Uma por ordem** | Concluir duas vezes não emite duas garantias |
| **Sem orçamento aprovado, não emite** | Serviço de balcão fica sem garantia registrada |
| **Prazo por item** | Cada serviço e cada peça carrega os seus dias |
| **Item com 0 dia é ignorado** | Avaliação técnica, por exemplo, não gera cobertura |
| **Se nenhum item tem prazo** | Nenhuma garantia é emitida |
| **Vale o que o cliente aprovou** | O prazo vem do orçamento; o catálogo da peça só entra se o orçamento não trouxe nada |
| **Termina no fim do dia** | 23:59:59 — para não existir discussão de horário no balcão |

A garantia recebe um **código curto** (tipo `WRT-A7K2P`), pensado para ser digitado à mão por quem perdeu o comprovante.

### Por que prazo por item

Um notebook sai com **formatação (90 dias de mão de obra)** e **uma tela genérica (30 dias)**. Com um prazo só para a ordem inteira, a tela pegaria carona nos 90 dias da mão de obra — e a loja estaria honrando uma garantia que nunca prometeu.

A ordem também guarda a **maior** das datas, que é o que responde rápido "esse aparelho está na garantia?".

---

## Os três estados

| Estado | Como se sabe |
|--------|--------------|
| **Vigente** | Dentro do prazo e não anulada |
| **Vencida** | Passou da data. **Não é um status guardado** — é calculado no momento da consulta |
| **Anulada** | Alguém cancelou por violação, com motivo escrito obrigatório. É um status guardado |

Vencida não ser um status guardado é proposital: não existe nada rodando de madrugada para virar garantias vencidas, e uma garantia nunca "esquece" de vencer.

---

## O cliente consulta sozinho

O cliente abre `/g/<código>` sem login e vê se o aparelho está na garantia, o que está coberto e até quando — item por item.

Existe também o **termo de garantia** imprimível, para entregar junto com o aparelho.

---

## O retorno

```
Cliente volta ──▶ reconhecimento na abertura da OS
                            │
                            ▼
              OS de retorno (valores zerados)
                            │
                            ▼
              ACIONAMENTO aberto pelo BALCÃO
                            │
                            ▼
               Julgamento pela BANCADA
                    │              │
              COBERTO         NÃO COBERTO
                    │              │
          refaz sem cobrar    passa de volta ao balcão
                               para orçar normalmente
```

### Abrir o acionamento

Feito pelo **atendente**, com o relato do cliente e fotos.

| Situação | O que acontece |
|----------|----------------|
| Garantia **anulada** | Recusado |
| Garantia **vencida** | Recusado, **com mensagem diferente** |
| Abrir duas vezes a mesma | Não conta retorno em dobro |

As mensagens de anulada e vencida são diferentes de propósito: o atendente precisa saber qual das duas para explicar ao cliente na hora.

### Julgar

Feito pelo **técnico**, porque a pergunta é técnica: *o defeito é do que eu fiz, ou é coisa nova?*

| Resultado | O que significa |
|-----------|-----------------|
| **Coberto** | A oficina refaz sem cobrar |
| **Não coberto** | Vira orçamento normal |

E um **motivo**, que fica gravado como valor e não como frase — é ele que responde depois qual peça volta mais e qual fornecedor está entregando ruim:

| Motivo | Cobre? |
|--------|:---:|
| Falha na execução | **sim** |
| Defeito da peça | **sim** |
| Impacto / queda | não |
| Líquido | não |
| Mexeram em outro lugar | não |
| Desgaste natural | não |
| Fora do prazo | não |
| Não tem relação com o serviço | não |

**O sistema recusa combinações incoerentes.** "Coberto porque houve queda" não é gravável, e "não coberto por defeito de peça" também não. Não é frescura de tela: se motivo e resultado puderem divergir, a pergunta "quantos retornos foram por defeito de peça" passa a contar casos que a loja não pagou.

**Não há reanálise.** Julgado uma vez, para mudar a decisão registra-se uma nota na ordem.

---

## A passagem de bastão

Quando o técnico marca **não coberto**, a ordem de retorno mostra uma faixa passando o caso de volta para o balcão: agora é conversa de preço, e quem negocia é quem atende.

No modo autônomo não há passagem — é a mesma pessoa.

---

## O que observar ao testar

- Conclua uma ordem com **mão de obra de 90 dias e peça genérica de 30**: a garantia emitida deve mostrar os dois prazos separados, e a ordem deve exibir o maior.
- Abra `/g/<código>` numa janela anônima: deve funcionar sem login.
- Tente abrir acionamento numa garantia vencida e numa anulada: as mensagens têm que ser **diferentes**.
- Tente marcar **coberto** com o motivo "queda": deve ser recusado.
- Julgue o mesmo acionamento duas vezes: o segundo deve ser recusado.
- Abra uma OS nova para um aparelho com garantia vigente: o sistema tem que perguntar se é retorno antes de deixar seguir.

---

## Documentos relacionados

- [Execução e entrega](./execucao-e-entrega)
- [Papéis e permissões](../papeis-e-permissoes) — por que o balcão abre e a bancada julga
- [Glossário](../glossario) — origem da peça e prazos sugeridos
