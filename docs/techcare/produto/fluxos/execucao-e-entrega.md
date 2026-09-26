---
title: Execução e Entrega
sidebar_position: 4
tags: [techcare, produto, execucao, entrega, estoque]
---

# Execução e Entrega

> Concluir uma ordem é o momento em que mais coisa acontece sozinha no TechCare: a peça sai do estoque e a garantia começa a correr.

---

## Execução

```
APROVADO ──┬──▶ AGUARDANDO PEÇA ──▶ EM EXECUÇÃO ──▶ CONCLUÍDO
           └──▶ EM EXECUÇÃO ──┬──▶ CONCLUÍDO
                              └──▶ AGUARDANDO PEÇA  (voltou a travar)
```

| Passo | O que exige |
|-------|-------------|
| Entrar em **Em execução** | Técnico atribuído (não vale no modo autônomo) |
| Registrar a **solução** | Técnico atribuído; ordem em execução ou já concluída |
| Entrar em **Concluído** | Solução preenchida |

A solução pode ser editada depois de concluída — é comum perceber que faltou detalhe só na hora de entregar.

Ir e voltar entre execução e espera de peça é esperado, e a data de início da execução **não é sobrescrita** quando isso acontece.

---

## O que acontece ao concluir

### 1. Baixa de estoque

As peças do **orçamento aprovado** saem do estoque como saída para OS.

| Comportamento | Detalhe |
|---------------|---------|
| **Não repete** | Concluir duas vezes (reabrir e fechar de novo) não dá baixa duas vezes |
| **Sem orçamento aprovado, nada sai** | Serviço de balcão não movimenta estoque |
| **Saldo negativo é permitido** | Se a peça não estava cadastrada direito, o estoque fica negativo em vez de bloquear |

O saldo negativo é proposital: **a peça saiu de fato**. Travar a conclusão por causa de um cadastro errado impediria o trabalho real; um número negativo na tela é um sinal visível de que o cadastro precisa de correção.

Detalhes em [Estoque e pagamento](../regras-negocio/estoque-e-pagamento).

### 2. Emissão da garantia

A garantia é criada automaticamente, **desde que exista orçamento aprovado**. Cada item aprovado vira um item de garantia com seu próprio prazo.

Serviço de balcão feito sem orçar **fica sem garantia registrada** — melhor que inventar um prazo que ninguém prometeu.

Detalhes em [Garantia e retorno](./garantia-e-retorno).

---

## A entrega

A entrega fecha o ciclo que a entrada abriu: **a mesma lista de avarias e acessórios da triagem** volta na tela, agora para conferir.

| Elemento | Como funciona |
|----------|---------------|
| **Lista de conferência** | Os itens registrados na entrada, para marcar o que está voltando |
| **Observações de entrega** | O que ficou desmarcado vira texto aqui |
| **Assinatura** | Assinada na tela, com o dedo ou o mouse |

**Nada disso é obrigatório.** Entregar sem conferir continua possível — a loja pequena tem pressa, e travar a entrega faria as pessoas contornarem o sistema. Mas quem conferiu tem o registro.

Concluído → Entregue é a única passagem a partir de Concluído. De Entregue, a ordem só vai para Arquivado.

---

## O pagamento

O pagamento é registrado **à parte**, não faz parte da entrega.

| Campo | Opções |
|-------|--------|
| **Forma** | Dinheiro, Pix, débito, crédito à vista, crédito parcelado, transferência |
| **Parcelas** | Obrigatório 2 ou mais quando a forma é crédito parcelado |
| **Valor** | Precisa ser maior que zero |

O pagamento nasce como pago.

**Nada concilia o orçamento aprovado com o que foi recebido.** Dá para entregar o aparelho sem registrar pagamento nenhum, e o sistema não reclama. Quem percebe é o painel de dinheiro de "O Dia" — e essa é uma lacuna conhecida, não um defeito.

---

## O que observar ao testar

- Conclua uma ordem com peça no orçamento e confira o estoque antes e depois: a quantidade tem que cair.
- Conclua uma ordem cuja peça está com **estoque zero**: deve concluir mesmo assim, e o saldo deve ficar negativo.
- Conclua uma ordem **sem orçamento aprovado**: não deve sair peça nem ser emitida garantia.
- Entregue marcando parte dos acessórios: o que ficou desmarcado deve aparecer nas observações.
- Entregue **sem assinar**: deve ser aceito.
- Entregue **sem registrar pagamento**: deve ser aceito, e a ordem deve aparecer no painel de dinheiro como não recebida.

---

## Documentos relacionados

- [Garantia e retorno](./garantia-e-retorno)
- [Estoque e pagamento](../regras-negocio/estoque-e-pagamento)
- [Limites conhecidos](../limites-conhecidos)
