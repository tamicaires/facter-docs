---
title: "ADR-015: Sessão opaca em cookie, sem token com refresh"
sidebar_position: 15
tags: [adr, autenticacao, sessao, seguranca, performance]
---

# ADR-015: Sessão opaca em cookie, sem token com refresh

**Status:** Proposto (26/09/2026), implementado na task 1.1 — aguarda aprovação da arquiteta

## Contexto

O roadmap previa "auth com cookie httpOnly e refresh". Duas regras já decididas pesam contra um token assinado (JWT) com refresh:

- [Permissões](../../produto/papeis-e-permissoes.md): **mudou o papel, a sessão cai na hora.** Um token assinado vale até expirar; com vida longa, a regra não se cumpre, e com vida curta (minutos) vira refresh constante.
- O tablet da oficina é compartilhado e fica logado o turno inteiro; derrubar uma sessão específica (aparelho perdido, pessoa desligada) precisa ser imediato.

## Decisão

1. O login gera um **token aleatório de 32 bytes**, enviado num cookie `facter_session` com `HttpOnly`, `SameSite=Lax`, `Secure` fora do ambiente local e `Path=/`.
2. O banco guarda **só o SHA-256 do token** (`identity.sessions.token_hash`, único). Quem lê o banco não consegue se passar por ninguém.
3. A sessão expira por **inatividade de 12 horas** (um turno longo) e, em qualquer caso, **30 dias** depois de criada. "Visto por último" é gravado no máximo a cada 5 minutos, para não escrever no banco a cada requisição.
4. A sessão guarda a **organização e o ator ativos**: validar uma requisição é **uma consulta indexada**, sem transação, coberta por teste de plano. Suspender um membro, desativar um usuário ou mudar um papel **revoga as sessões** afetadas na mesma transação (PLT-11).
5. Identidade vive no schema `identity` (usuários, credenciais, vínculos, sessões, tentativas de login), fora do RLS por organização, porque é consultada antes de existir organização na sessão; é a parte que vai para o Hub.
6. Senha com **argon2id**; e-mail inexistente e senha errada têm a mesma resposta e o mesmo tempo; **5 falhas em 15 minutos bloqueiam** o e-mail temporariamente.

## Alternativas consideradas

| Alternativa | Por que não |
| --- | --- |
| JWT de vida longa | Não cumpre "a sessão cai na hora"; revogar exige lista de bloqueio, que é uma sessão no banco com outro nome |
| JWT curto + refresh | Duas credenciais, rotação e detecção de reuso; complexidade sem ganho sobre a sessão opaca, já que a revogação precisa do banco de qualquer forma |
| Sessão só em Redis | Perde a sessão se o Redis cair; o Redis entra depois como **cache** da consulta (task 1.6), não como fonte |

## Consequências

- Uma consulta por requisição (pela chave única do hash). Quando o Redis entrar, a sessão ganha cache com invalidação na revogação.
- `SameSite=Lax` exige que a web e a API fiquem no **mesmo site** (ex.: `app.facter.com.br` e `api.facter.com.br`). Com domínios de sites diferentes, o cookie precisaria de `SameSite=None`, e aí entra proteção contra CSRF. Isso vira requisito da hospedagem (ADR-012).
- Convite, primeiro acesso e redefinição de senha dependem do e-mail transacional (task 1.8).
