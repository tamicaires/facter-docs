---
title: Estoque e Pagamento
sidebar_position: 1
tags: [techcare, produto, regras-negocio, estoque, pagamento]
---

# Estoque e Pagamento

> Duas áreas em que o TechCare escolheu, de propósito, **não** travar o trabalho — e onde o que sobra é visibilidade, não bloqueio.

---

## Movimentações de estoque

| Tipo | Quando acontece |
|------|-----------------|
| **Entrada** | Compra de peça |
| **Saída para OS** | Peça usada num conserto — normalmente automática |
| **Venda direta** | Peça vendida no balcão, sem ordem |
| **Ajuste (entrada / saída)** | Correção de inventário |
| **Devolução** | Peça que voltou |
| **Perda** | Quebrou, sumiu, estragou |

Registrar movimentação exige que a peça exista e esteja ativa. Uma saída manual maior que o saldo é **recusada** com "Estoque insuficiente".

---

## A baixa automática

Quando a ordem é concluída, as peças do **orçamento aprovado** saem como "saída para OS".

| Regra | Comportamento |
|-------|---------------|
| Não repete | Se já houve saída para aquela ordem, não dá baixa de novo |
| Usa o orçamento aprovado | Sem orçamento aprovado, nada sai |
| **Permite saldo negativo** | A baixa automática não é bloqueada por falta de saldo |

### Por que o saldo pode ficar negativo

Uma saída manual é recusada sem saldo, mas a baixa automática não. A diferença é que, na conclusão, **a peça já saiu da prateleira** — o conserto foi feito. Bloquear ali só faria alguém desistir de concluir a ordem no sistema, e o registro se perderia.

O número negativo é informação: significa que o cadastro de estoque estava errado, e está na cara de quem olhar.

---

## Estoque mínimo

Cada peça tem uma quantidade mínima. Abaixo dela, a peça aparece como alerta. É só um alerta — nada é pedido automaticamente.

---

## O que não existe: reserva de peça

**Não há reserva de peça em nenhum momento.** Aprovar um orçamento não separa a peça do estoque.

Consequência prática, que aparece em teste: **duas ordens podem contar com a última peça da gaveta**. Ambos os orçamentos são aprovados, e quem concluir primeiro leva; a segunda ordem conclui do mesmo jeito e o saldo fica negativo.

Isso é uma lacuna conhecida, não um defeito a reportar. Ver [Limites conhecidos](../limites-conhecidos).

---

## Pagamento

| Campo | Regra |
|-------|-------|
| **Valor** | Maior que zero |
| **Forma** | Dinheiro, Pix, débito, crédito à vista, crédito parcelado, transferência |
| **Parcelas** | Mínimo 2 quando a forma é crédito parcelado |
| **Situação** | Nasce como **pago** |

O pagamento é vinculado à ordem, mas **não é conferido contra ela**:

- não existe "valor em aberto" calculado;
- não há bloqueio para entregar sem receber;
- registrar valor diferente do orçamento aprovado é aceito sem aviso.

O painel de dinheiro de "O Dia" mostra o que entrou no dia e quais ordens saíram sem pagamento — é a única coisa que aponta o buraco.

---

## O que observar ao testar

- Registre uma saída manual maior que o saldo: deve ser recusada.
- Conclua uma ordem cuja peça está zerada: deve concluir, e o saldo deve ficar negativo.
- Aprove **dois orçamentos** que usam a mesma última peça: os dois devem ser aprovados sem aviso nenhum — comportamento conhecido.
- Registre crédito parcelado com 1 parcela: deve ser recusado.
- Entregue uma ordem sem pagamento: deve ser aceito, e a ordem deve aparecer no painel de dinheiro.

---

## Documentos relacionados

- [Execução e entrega](../fluxos/execucao-e-entrega)
- [Limites conhecidos](../limites-conhecidos)
