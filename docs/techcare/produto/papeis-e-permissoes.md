---
title: Papéis e Permissões
sidebar_position: 3
tags: [techcare, produto, permissoes, papeis, seguranca]
---

# Papéis e Permissões

> Cinco cargos. O que separa um do outro não é hierarquia: é o que a pessoa faz na oficina. O técnico não vê dinheiro porque não é ele quem cobra.

---

## Os cargos

| Cargo | Na oficina |
|-------|-----------|
| **OWNER** | O dono. Pode tudo, inclusive trocar o modo da empresa |
| **ADMIN** | Administrador. Opera tudo e cadastra usuários; da empresa, só lê e edita dados |
| **MANAGER** | Gerente. Opera tudo e distribui ordens; usuários, só consulta |
| **ATTENDANT** | Atendente de balcão. Recebe, cadastra, orça e cobra |
| **TECHNICIAN** | Técnico de bancada. Diagnostica, executa e julga garantia |

O cargo não fica na pessoa: fica no **vínculo entre a pessoa e a empresa**. O mesmo e-mail pode ser dono de uma oficina e técnico de outra — e é assim que se testa permissão sem trocar de login.

---

## O que cada um pode

| | OWNER | ADMIN | MANAGER | ATTENDANT | TECHNICIAN |
|---|:---:|:---:|:---:|:---:|:---:|
| **Ordens de serviço** | tudo | tudo | tudo | criar, ver, editar | ver, editar |
| **Clientes** | tudo | tudo | tudo | tudo | ver |
| **Aparelhos** | tudo | tudo | tudo | criar, ver, editar | ver, editar |
| **Orçamentos** | tudo | tudo | tudo | criar, ver | ver |
| **Peças** | tudo | tudo | tudo | ver | ver |
| **Movimentação de estoque** | tudo | tudo | tudo | — | criar |
| **Pagamentos** | tudo | tudo | tudo | criar, ver | — |
| **Garantias** | tudo | tudo | tudo | ver | ver |
| **Acionamentos de garantia** | tudo | tudo | tudo | **criar**, ver | ver, **julgar** |
| **Usuários** | tudo | tudo | ver, atribuir | ver | — |
| **Relatórios** | tudo | tudo | ver | — | — |
| **Configurações** | tudo | tudo | ver | — | — |
| **Empresa** | tudo | ver, editar | — | — | — |
| **Cobrança da plataforma** | tudo | — | — | — | — |

"tudo" inclui excluir.

---

## As três decisões que explicam a tabela

### O técnico não vê dinheiro

TECHNICIAN não tem acesso a pagamento nenhum, e em orçamento só lê. Quem conserta não precisa saber quanto foi cobrado para consertar, e numa loja pequena essa separação é o que permite dar acesso ao sistema a alguém que não é sócio.

### Quem abre o acionamento não é quem julga

| Etapa | Quem faz |
|-------|----------|
| Cliente volta reclamando → abre o acionamento | **ATTENDANT** (balcão) |
| Cobre ou não cobre? | **TECHNICIAN** (bancada) |

A pergunta "o defeito é do que eu fiz, ou é coisa nova?" é técnica. E quem nega a cobertura não deve ser quem vai negociar o preço logo depois.

### O atendente não mexe no estoque, o técnico mexe

ATTENDANT lê peças mas não registra movimentação; TECHNICIAN registra. Quem tira a peça da gaveta é quem está na bancada.

---

## Como isso aparece na tela

- **O menu lateral muda** conforme o cargo: o que a pessoa não pode fazer não aparece.
- **O painel lateral da ordem muda por capacidade, não por cargo**: quem cobra vê o bloco de dinheiro, quem conserta vê o bloco de bancada, quem distribui vê o responsável.
- Esconder o botão é cortesia, não segurança: **quem barra de verdade é o servidor**. Se uma chamada chegar sem permissão, ela é recusada mesmo que a tela tenha deixado clicar.

---

## O que observar ao testar

- Entre com o técnico e procure qualquer valor em reais numa ordem: **não deve aparecer nenhum**.
- Com o atendente, tente julgar um acionamento de garantia: a ação não deve existir.
- Trocando de empresa (mesmo login, cargos diferentes), o menu e os botões devem mudar **sem precisar sair e entrar de novo**.

---

## Documentos relacionados

- [Garantia e retorno](./fluxos/garantia-e-retorno) — a divisão balcão × bancada em detalhe
- [Como testar](../projeto/como-testar) — o cenário que dá quatro cargos ao mesmo login
