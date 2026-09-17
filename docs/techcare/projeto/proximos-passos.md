---
title: Próximos Passos
sidebar_position: 3
tags: [techcare, projeto, roadmap, prioridade]
---

# Próximos Passos

> A fila de trabalho do TechCare, decidida em 17/09/2026. A ordem importa mais que a lista: tudo junto são 35 a 50 dias, e nem tudo vale agora.

---

## Aceito e a fazer

Três propostas aprovadas, nesta ordem:

| # | Proposta | Tamanho | Dias | Por que primeiro |
|---|----------|:---:|:---:|---|
| 1 | [Tela de equipe](../produto/propostas/tela-de-equipe) | M | 3–4 | **É o único bloqueante real.** Sem ela não há como cadastrar um técnico pela interface, e nenhuma oficina com equipe consegue operar |
| 2 | [Busca do balcão](../produto/propostas/busca-do-balcao) | M | 2–3 | É o gesto mais repetido do dia |
| 3 | [Conciliação do dinheiro](../produto/propostas/conciliacao-financeira) | M | 2–3 | Dinheiro que não entrou é invisível hoje |

Junto da primeira vai a correção do `PATCH /users/me`, que hoje dá 404 e deixa a tela de perfil quebrada — ver [Débito técnico](./debito-tecnico).

---

## Na fila, depois das três

### Revisar a listagem de ordens de serviço

Perguntar se a tela, como está, **faz sentido para cada pessoa que a usa** — e não só se funciona.

| O que examinar | Pergunta |
|---|---|
| **Por persona** | O que a atendente precisa ver ali é o mesmo que o técnico? E a dona? Hoje a lista é uma só para todos |
| **Usabilidade** | Quantos cliques até a ação mais comum? O que a pessoa procura primeiro ao abrir? |
| **Modo rápido** | Existe um caminho curto para quem já sabe o que quer, sem passar pela tela inteira? |

Fica para depois de propósito: as três aprovadas mudam quem usa o sistema — com a tela de equipe passa a haver técnico de verdade cadastrado, e com a busca o caminho até uma ordem deixa de ser a listagem. Revisar antes seria desenhar para um uso que está prestes a mudar.

---

## Adiado, com motivo

| Item | Dias | Por que não agora |
|---|:---:|---|
| **Notificações (e-mail)** | 4–5 | O envio manual funciona e a doc já explica. Ganho real é orçamento sem resposta e aparelho esquecido |
| **Notificações (WhatsApp)** | +5–8 | Exige provedor com custo mensal |
| **Upload de foto** | 3–5 | Alto valor no balcão, mas exige escolher e configurar storage |
| **Expiração de orçamento** | 0,5–1 | Barato; entra junto de qualquer rodada |
| **Relatórios** | 5–7 | Uma oficina de duas pessoas não lê relatório — lê "O Dia". É para vender, não para operar |
| **Reserva de peça** | 4–6 | Com oito peças em estoque, o saldo negativo resolve e é visível. Vira problema com volume |
| **Permissões por empresa** | 5–8 | Os cinco cargos fixos atendem. Antes disso, resolver a matriz duplicada entre API e web |

---

## Em paralelo, sem depender de nada

Subir o **homologação** para o teste com usuário externo. O obstáculo está mapeado: o `@facter/ds-core` não resolve por link — nem em CI, nem localmente — e hoje vive como cópia dentro do `node_modules`. Ver [Débito técnico](./debito-tecnico).

Junto disso, rodar o seed no ambiente: sem ele as contas de [Como testar](./como-testar) não existem.

---

## Documentos relacionados

- [Limites conhecidos](../produto/limites-conhecidos) — o que falta, visto por quem usa
- [Débito técnico](./debito-tecnico) — o que custa pedágio em toda alteração
- [Como testar](./como-testar)
