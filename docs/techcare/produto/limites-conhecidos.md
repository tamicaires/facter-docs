---
title: Limites Conhecidos
sidebar_position: 6
tags: [techcare, produto, escopo, limitacoes, teste]
---

# Limites Conhecidos

> **Leia esta página antes de reportar qualquer coisa.** O que está aqui não é defeito: é escopo que ainda não foi feito, ou decisão tomada de propósito. Reportar isso como bug gasta a conversa desfazendo mal-entendido.

---

## Nada notifica ninguém **ainda**

**Por enquanto nenhuma mensagem sai do sistema.** Nem e-mail, nem SMS, nem WhatsApp. É escopo que ainda não foi feito, não uma decisão de nunca fazer.

| Você vai esperar | O que acontece hoje |
|------------------|---------------------|
| "Enviar orçamento" manda um e-mail ao cliente | Só muda o status. Alguém copia o link e manda por fora |
| O orçamento vence sozinho na data | O status continua "enviado" até alguém agir |
| O cliente é avisado quando o aparelho fica pronto | Ninguém é avisado |
| O técnico recebe aviso de ordem nova | Ninguém recebe nada |

Enquanto isso, tudo depende de alguém olhar a tela — e é por isso que "O Dia" existe.

Se você achar que a falta de aviso automático atrapalha em algum ponto específico do fluxo, **isso vale reportar**: ajuda a decidir por onde começar quando a notificação for construída.

---

## Não dá para cadastrar a equipe pela interface

**Não existe tela de equipe.** Não há como criar um técnico, convidar alguém ou mudar o cargo de um usuário pelo sistema — os usuários que existem foram criados junto com os dados de teste.

É a maior lacuna para uma oficina com equipe, e é conhecida. O item chegou a existir no menu e foi retirado porque levava a uma página inexistente.

---

## Telas planejadas e ainda não feitas

| Tela | O que seria | Por que não está |
|------|-------------|------------------|
| **Relatórios** | Números por período, gráficos | A API só sabe responder a foto de agora, não a série histórica. Sem isso, os gráficos seriam dados inventados |
| **A Bancada** | A home do técnico — o dia dele é uma fila, não o dia da loja | Enquanto não existe, "O Dia" esconde dele o que ele não pode executar |
| **Busca do balcão** | Uma busca só, por nome, telefone, número da OS ou série | Precisa de um endpoint que ainda não existe |
| **Aparelho esquecido** | Tela para tratar o que ficou na prateleira | O painel já identifica; falta o lugar de registrar o aviso dado |
| **Permissões por empresa** | Cada oficina ajustar o que cada cargo faz | Adiado por decisão; hoje os cargos são fixos |

---

## Não existe reserva de peça

Aprovar um orçamento **não separa a peça**. Duas ordens podem contar com a última peça da gaveta, e as duas serão aprovadas sem aviso.

Detalhe em [Estoque e pagamento](./regras-negocio/estoque-e-pagamento).

---

## Dinheiro não é conferido

Não existe "valor em aberto". Entregar sem receber é possível, receber valor diferente do orçamento é aceito, e nada reclama.

---

## Não dá para anexar foto de verdade

O sistema prevê fotos na ordem e no acionamento de garantia, e a tela de upload existe — mas **não há onde guardar o arquivo**. Anexo não funciona de ponta a ponta.

---

## Comportamentos que parecem defeito e não são

| Comportamento | Por que é assim |
|---------------|-----------------|
| Estoque fica **negativo** ao concluir uma ordem | A peça saiu de fato; travar impediria o trabalho real. O negativo é sinal de cadastro errado |
| Serviço de balcão sai **sem garantia** | Sem orçamento aprovado não houve prazo combinado. Melhor que inventar um |
| Dá para **entregar sem conferir** nada | A loja tem pressa; travar faria contornar o sistema |
| Ordem pode ir de **Recusado para Entregue** | O aparelho volta para o dono mesmo sem conserto |
| Garantia "vencida" não aparece como status | É calculada na hora da consulta; não há nada rodando de madrugada |
| Muitas ordens **sem prazo** | O prazo é opcional na abertura. O painel conta quantas são |

---

## Defeitos já mapeados

Não precisa reportar:

- Em "O Dia", os botões de ação dos blocos levam à lista de ordens **sem aplicar filtro** — a tela já sabia quais eram as três ordens e joga a pessoa numa lista inteira.

---

## O que vale reportar

Tudo que não está nesta página. Em especial:

- regra desta documentação que o sistema **não cumpre**;
- mensagem de erro que não explica o que fazer;
- passo do fluxo que trava sem dizer por quê;
- número que não bate com o que você acabou de fazer;
- qualquer coisa que a tela deixa clicar e depois recusa.

---

## Documentos relacionados

- [Como testar](../projeto/como-testar)
- [Visão geral](./visao-geral)
