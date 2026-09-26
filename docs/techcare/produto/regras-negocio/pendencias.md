---
title: Pendências e "O Dia"
sidebar_position: 2
tags: [techcare, produto, regras-negocio, painel, pendencias]
---

# Pendências e "O Dia"

> O TechCare **ainda** não avisa ninguém de nada: por enquanto nenhum e-mail sai, nenhum orçamento expira sozinho, nenhum lembrete chega. Enquanto isso não existe, esta tela é a compensação — em vez de notificar, o sistema mostra numa lista tudo o que foi esquecido.

---

## O que é "O Dia"

A tela inicial (`/hoje`) responde duas perguntas em momentos diferentes:

| Quando | O que mostra |
|--------|--------------|
| **De manhã** | O que passou do prazo, o que vence hoje, o que está travado, o que está sem técnico |
| **À noite** | Quanto entrou, o que ficou para amanhã, para quem ainda dá tempo de ligar |

---

## Os oito motivos de pendência

Em ordem de urgência — que não é alfabética nem cronológica: é a ordem em que uma pessoa resolveria.

| # | Motivo | Quando entra na lista | Ação sugerida |
|---|--------|----------------------|---------------|
| 1 | **Atrasada** | O prazo prometido já passou | ligar |
| 2 | **Vence hoje** | O prazo prometido é hoje | priorizar |
| 3 | **Orçamento vencido** | Passou da validade e continua enviado | refazer |
| 4 | **Orçamento sem resposta** | Enviado há **3 dias** ou mais, sem resposta | copiar link |
| 5 | **Conferência aberta** | A triagem foi começada e não foi terminada | retomar |
| 6 | **Não retirado** | Concluído há **3 dias** ou mais e ninguém buscou | avisar |
| 7 | **Sem técnico** | Aberta há **1 dia** ou mais e ninguém assumiu | atribuir |
| 8 | **Esperando peça** | Parada em aguardando peça | cobrar |

Prazo estourado vem primeiro porque tem cliente contando os dias do outro lado. Peça vem por último porque depende de terceiro e não adianta olhar toda hora.

---

## Uma ordem aparece uma vez só

Uma ordem atrasada, sem técnico e com orçamento vencido entra na lista **uma vez**, pelo motivo mais urgente dos três.

Se cada ordem aparecesse por todos os seus problemas, o painel viraria uma lista de sintomas em vez de uma lista de tarefas — e a mesma OS ocuparia quatro linhas.

---

## Ordens encerradas não entram

Entregue, arquivada e recusada saem da conta. A exceção é **concluída**: ela não está encerrada, e é exatamente ela que vira "não retirado" depois de três dias na prateleira.

---

## As entregas

Um segundo bloco organiza as ordens abertas pelo prazo prometido:

| Grupo | O que é |
|-------|---------|
| **Atrasadas** | Prazo já passou |
| **Hoje** | Vence hoje |
| **Próximas** | Ainda dá tempo |
| **Sem prazo** | Só a **contagem** |

O prazo é opcional na abertura, e boa parte das ordens nasce sem ele. Em vez de fingir que essas ordens não existem, o painel conta quantas são — uma agenda pela metade engana mais do que ajuda.

---

## Orçamentos parados

Os enviados sem resposta, do mais esquecido para o mais recente, marcando quais já venceram.

Lembrando o que "enviado" quer dizer aqui: **alguém marcou como enviado**. Pode ser que o link nunca tenha saído da oficina.

---

## O que observar ao testar

- O cenário semeado já tem ordens atrasadas, aparelho na prateleira há mais de uma semana e conferências largadas pela metade. Elas devem aparecer aqui **no primeiro acesso**, sem precisar fazer nada.
- Confira se alguma ordem aparece **duas vezes** na lista de pendências: não deve.
- Entre como técnico: as seções que ele não pode executar devem sumir.
- Os botões de ação dos blocos hoje levam à lista de ordens **sem filtro aplicado** — defeito conhecido, já mapeado.

---

## Documentos relacionados

- [Ciclo de vida da OS](../fluxos/ciclo-de-vida-da-os)
- [Limites conhecidos](../limites-conhecidos)
