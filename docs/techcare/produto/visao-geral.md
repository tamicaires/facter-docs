---
title: Visão Geral
sidebar_position: 1
tags: [techcare, produto, visao-geral, assistencia-tecnica]
---

# Facter TechCare — Visão Geral

> Sistema de gestão para assistência técnica de eletrônicos. Transforma o caderno, o WhatsApp e a memória da oficina em ordens de serviço rastreadas.

## O problema

Uma assistência técnica de bairro recebe um aparelho e, a partir daí, precisa lembrar de tudo sem anotar quase nada:

- o que veio junto (carregador, capa) e como o aparelho chegou (tela trincada, tampa amassada);
- qual é a senha do aparelho;
- o que o técnico descobriu e quanto vai custar;
- se o cliente aprovou — e quando ele aprovou;
- quais peças saíram da gaveta;
- quanto tempo de garantia foi prometido, e sobre o quê;
- quem já pagou e quem levou o aparelho sem pagar.

Quando isso vive na cabeça de duas pessoas, o prejuízo aparece em lugares específicos: aparelho entregue sem cobrar, peça que sumiu do estoque sem registro, discussão no balcão sobre "isso aqui já estava quebrado quando eu trouxe", e retrabalho de garantia que ninguém contabiliza.

O TechCare existe para que cada um desses momentos deixe um registro.

---

## Quem usa

| Papel | Quem é na oficina | O que faz no sistema |
|-------|-------------------|----------------------|
| **OWNER** | O dono | Tudo, inclusive configurações da empresa |
| **ADMIN** | Administrador | Tudo na operação; não mexe em cobrança da plataforma |
| **MANAGER** | Gerente | Opera tudo e distribui ordens; não cadastra usuário |
| **ATTENDANT** | Atendente de balcão | Recebe aparelho, cadastra cliente, abre OS, orça, cobra |
| **TECHNICIAN** | Técnico de bancada | Diagnostica, executa, julga retorno em garantia. **Não vê dinheiro** |
| *(sem conta)* | **Cliente da oficina** | Abre o link do orçamento e aprova ou recusa; consulta a garantia pelo código |

O cliente final não tem login. Ele recebe dois tipos de link público: o do orçamento e o da consulta de garantia.

Detalhe em [Papéis e permissões](./papeis-e-permissoes).

---

## Os dois tamanhos de oficina

A empresa tem um **modo**, e ele muda o comportamento do sistema:

| Modo | Para quem | O que muda |
|------|-----------|------------|
| **BUSINESS** | Oficina com equipe | Fluxo completo: triagem, atribuição de técnico, troca de empresa |
| **INDIVIDUAL** | Técnico autônomo | A ordem já nasce atribuída a quem a criou; o sistema para de exigir técnico |

Só o dono troca o modo, e virar INDIVIDUAL só é permitido quando existe **um único membro ativo** na empresa — não faz sentido uma oficina de três pessoas operar como autônomo.

---

## O que o sistema cobre

```
   Cliente chega com o aparelho
            │
            ▼
   ┌──────────────────┐
   │   Recebimento    │  cliente → aparelho → problema relatado
   │   + Triagem      │  avarias e acessórios conferidos na entrada
   └────────┬─────────┘
            ▼
   ┌──────────────────┐
   │   Diagnóstico    │  técnico atribuído, achado registrado
   └────────┬─────────┘
            ▼
   ┌──────────────────┐
   │    Orçamento     │  serviços + peças, link enviado ao cliente
   │                  │  cliente aprova ou recusa sem login
   └────────┬─────────┘
            ▼
   ┌──────────────────┐
   │    Execução      │  conserto; ao concluir: baixa de estoque
   │                  │  e emissão automática da garantia
   └────────┬─────────┘
            ▼
   ┌──────────────────┐
   │     Entrega      │  confere a mesma lista da entrada, assina
   └────────┬─────────┘
            ▼
     Garantia vigente  ──▶  se voltar: acionamento e julgamento
```

Em volta desse ciclo: cadastro de clientes e aparelhos, catálogo de serviços, estoque de peças, registro de pagamento e o painel **"O Dia"**.

---

## "O Dia" é a tela inicial

A home não é um dashboard de métricas — é `/hoje`, uma lista do que precisa de alguém:

- de manhã: o que passou do prazo, o que vence hoje, o que está travado, o que está sem técnico;
- à noite: quanto entrou, o que ficou para amanhã.

Isso existe porque **o TechCare ainda não avisa ninguém de nada**: por enquanto nenhum e-mail sai e nenhum orçamento expira sozinho. Enquanto o envio automático não existe, o sistema não cobra o cliente nem lembra o técnico — ele mostra numa tela o que foi esquecido, e alguém age.

Notificação está no plano; a tela não vai embora quando ela chegar, porque a lista do que está parado continua útil mesmo com aviso automático.

Ver [Pendências: o que o sistema considera esquecido](./regras-negocio/pendencias).

---

## Como ler esta documentação

| Se você quer saber... | Vá para |
|-----------------------|---------|
| O que cada palavra significa | [Glossário](./glossario) |
| Quem pode fazer o quê | [Papéis e permissões](./papeis-e-permissoes) |
| Os status da OS e o que trava cada passagem | [Ciclo de vida da OS](./fluxos/ciclo-de-vida-da-os) |
| Como um aparelho entra na oficina | [Abertura e triagem](./fluxos/abertura-e-triagem) |
| Como o cliente aprova um orçamento | [Orçamento e aprovação](./fluxos/orcamento-e-aprovacao) |
| O que acontece ao concluir e entregar | [Execução e entrega](./fluxos/execucao-e-entrega) |
| Como funciona a garantia e o retorno | [Garantia e retorno](./fluxos/garantia-e-retorno) |
| **O que ainda não existe** | [Limites conhecidos](./limites-conhecidos) |
| Como entrar e testar | [Como testar](../projeto/como-testar) |

---

## Documentos relacionados

- [Limites conhecidos](./limites-conhecidos) — leia antes de reportar qualquer coisa como defeito
- [Como testar](../projeto/como-testar) — contas e cenários
