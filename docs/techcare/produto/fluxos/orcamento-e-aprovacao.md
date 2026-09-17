---
title: Orçamento e Aprovação
sidebar_position: 3
tags: [techcare, produto, orcamento, aprovacao, link-publico]
---

# Orçamento e Aprovação

> O orçamento é onde o cliente decide. Por isso ele sai da oficina: vira um link que a pessoa abre no celular, sem login, e aprova ou recusa por conta própria.

---

## O caminho

```
RASCUNHO ──▶ ENVIADO ──┬──▶ APROVADO   (a ordem vai para Aprovado)
                       └──▶ RECUSADO   (a ordem vai para Recusado)
```

| Estado | O que quer dizer |
|--------|------------------|
| **Rascunho** | Sendo montado. O cliente não vê |
| **Enviado** | Alguém marcou como enviado. O link está valendo |
| **Aprovado** | O cliente aprovou |
| **Recusado** | O cliente recusou, com motivo |
| **Vencido** | Passou da validade. **Ainda não acontece sozinho** — ver abaixo |

---

## Montar o orçamento

A ordem precisa estar em **Recebido, Triagem ou Diagnóstico**. Depois que o cliente já aprovou alguma coisa, orçar de novo é outro orçamento.

Os itens vêm de dois catálogos:

| Tipo | De onde vem | O que é copiado |
|------|-------------|-----------------|
| **Serviço** | Catálogo de serviços | Descrição, preço e dias de garantia |
| **Peça** | Estoque | Descrição, preço e dias de garantia |

**Os valores são copiados, não referenciados.** Reajustar a tabela de preços amanhã não muda o orçamento que o cliente recebeu hoje — o que ele viu é o que vale.

Cada item carrega **seus próprios dias de garantia**, e é daí que sai a garantia emitida no fim.

### Validações

| Regra | Mensagem esperada |
|-------|-------------------|
| Pelo menos um item | Recusa orçamento vazio |
| Quantidade maior que zero | Recusa |
| Preço não pode ser negativo | Recusa |
| Descrição obrigatória | Recusa |
| Desconto percentual entre 0 e 100 | Recusa fora da faixa |
| Desconto fixo não pode passar do subtotal | Recusa |

O total é `serviços + peças − desconto`, e nunca fica abaixo de zero.

---

## O prazo sugerido

Ao montar o orçamento, o sistema propõe uma data de entrega em vez de deixar alguém chutar. A conta tem duas partes, e **elas não se somam**:

| Parte | Como conta |
|-------|-----------|
| **Bancada** | Soma o tempo estimado dos serviços, a 5 horas úteis por dia |
| **Espera de peça** | 2 dias corridos, se alguma peça precisa ser pedida |

**Vale o maior dos dois.** A oficina não fica parada esperando a peça chegar para só então começar o serviço — as duas coisas acontecem em paralelo.

O cálculo pula sábado e domingo, e a tela mostra a conta em uma frase, para quem precisa negociar a data no balcão.

---

## Enviar ao cliente

Enviar exige que o orçamento esteja em **rascunho** e tenha itens. Ao enviar:

1. o orçamento vira **Enviado**;
2. a ordem vai para **Aguardando aprovação**;
3. o link público passa a valer.

**Importante:** hoje "enviar" quer dizer *marcar como enviado*. **O sistema ainda não manda nada** — alguém copia o link e manda pelo WhatsApp. O envio automático está no plano; enquanto não chega, é assim. Ver [Limites conhecidos](../limites-conhecidos).

---

## O lado do cliente

O cliente abre `/quote/<código>` sem login e vê o orçamento com os itens, os valores e a validade. Ele pode:

| Ação | O que acontece |
|------|----------------|
| **Aprovar** | Orçamento aprovado, ordem vai para **Aprovado** |
| **Recusar** | Orçamento recusado **com motivo escrito**, ordem vai para **Recusado** |

Só um orçamento **enviado e dentro da validade** aceita aprovação. Fora disso, a página recusa.

A ordem recusada não fica no limbo: de Recusado ela pode ir para **Entregue** — o aparelho volta para o dono sem conserto — ou para Arquivado.

---

## O que ainda não expira sozinho

Passada a data de validade, o orçamento **continua marcado como enviado**. Nada muda o status, porque ainda não há nada rodando no servidor para isso.

Quem percebe é o painel: um orçamento vencido aparece em "O Dia" com a ação **refazer**, e um orçamento sem resposta há 3 dias aparece com a ação **copiar link**.

---

## O que observar ao testar

- Monte um orçamento com desconto fixo maior que o total: deve ser recusado.
- Envie e abra o link **numa janela anônima**: tem que funcionar sem login.
- Aprove pelo link e volte ao sistema: a ordem tem que estar em **Aprovado**, e o evento tem que constar na linha do tempo.
- Recuse pelo link sem escrever motivo: deve ser exigido.
- Tente aprovar um orçamento **já aprovado** recarregando a página: deve ser recusado.

---

## Documentos relacionados

- [Ciclo de vida da OS](./ciclo-de-vida-da-os)
- [Execução e entrega](./execucao-e-entrega)
- [Limites conhecidos](../limites-conhecidos)
