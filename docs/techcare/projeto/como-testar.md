---
title: Como Testar
sidebar_position: 1
tags: [techcare, projeto, teste, homologacao, contas]
---

# Como Testar

> Ambiente de homologação, contas prontas e uma semana de oficina já simulada. Nada precisa ser instalado.

:::note[Endereço]

**Homologação:** `<URL a definir>` — este endereço será preenchido quando o ambiente subir.

:::

---

## Antes de começar

Leia [Limites conhecidos](../produto/limites-conhecidos). Boa parte do que parece quebrado é escopo não feito, e a página lista item por item.

---

## As contas

O cenário principal é a **Bit & Byte Informática**, uma assistência de bairro de duas pessoas. É o mais parecido com um dia real.

| Quem | E-mail | Senha | Cargo |
|------|--------|-------|-------|
| **Sandra Moreira** | `sandra@bitebyte.com.br` | `Bitebyte@123` | Dona — atende, orça e cobra |
| **Éder Pimentel** | `eder@bitebyte.com.br` | `Tecnico@123` | Técnico — conserta, **não vê dinheiro** |

Entre com os dois. A diferença entre as duas telas é metade do produto.

### Outros cenários

| Empresa | Conta | Para quê |
|---------|-------|----------|
| **TechCare Demo** | `admin@facter.com` / `Admin@123` | Loja grande: ~18 clientes, 47 ordens, 16 orçamentos. Serve para ver volume, lista cheia, paginação |
| **TechCare Autônomo** | `autonomo@facter.com` / `Autonomo@123` | Modo autônomo: sem triagem, sem atribuição de técnico. A ordem já nasce no nome de quem abriu |

---

## O que já está semeado na Bit & Byte

A loja foi montada para reproduzir uma semana real, com os problemas incluídos:

| O que existe | Por que está lá |
|--------------|-----------------|
| **9 clientes** (7 pessoas físicas, 2 empresas da rua) | Cobrir PF e PJ |
| **11 aparelhos**, quase todos notebook | É o que uma assistência de bairro recebe |
| **6 serviços** com preço, garantia e tempo estimado | Formatação, limpeza, troca de tela, troca de bateria, upgrade de SSD, avaliação técnica |
| **8 peças**, três delas no limite ou zeradas | Ver o alerta de estoque mínimo e a baixa com saldo negativo |
| **14 ordens de serviço** | A semana inteira, descrita abaixo |

Entre as 14 ordens, de propósito:

- **duas atrasadas** e **duas para hoje** → devem aparecer em "O Dia";
- **um aparelho pronto há mais de uma semana** e não retirado;
- **uma entrega sem pagamento registrado**;
- **duas conferências de triagem largadas pela metade**;
- **ordens sem técnico atribuído**.

Tudo isso deve aparecer no painel **no primeiro acesso**, sem você fazer nada. Se não aparecer, é achado.

---

## Um roteiro de meia hora

Se você tiver pouco tempo, este caminho passa pelo produto inteiro:

1. **Entre como Sandra** e abra "O Dia". Confira se as pendências batem com a lista acima.
2. **Abra uma ordem nova**: cliente novo, aparelho novo, problema relatado.
3. **Faça a triagem** marcando avarias e acessórios. Saia no meio e volte — o que foi marcado deve estar lá.
4. **Atribua o Éder** e registre um diagnóstico.
5. **Monte um orçamento** com um serviço e uma peça. Repare no prazo sugerido e na conta que ele mostra.
6. **Envie** e copie o link.
7. **Abra o link numa janela anônima** e aprove como se fosse o cliente.
8. **Entre como Éder**: execute, registre a solução, conclua. Confira o estoque antes e depois.
9. **Volte como Sandra**: entregue conferindo a lista, assine e registre o pagamento.
10. **Abra a garantia emitida** e veja os prazos por item. Abra `/g/<código>` anônimo.
11. **Simule um retorno**: abra nova ordem para o mesmo aparelho — o sistema deve perguntar se é retorno.
12. **Como Éder, julgue** o acionamento. Tente marcar "coberto" com motivo "queda": deve ser recusado.

---

## Como reportar

O que ajuda mais:

| Campo | Exemplo |
|-------|---------|
| **Onde** | Tela, ou número da OS (`OS-202609-00007`) |
| **Com qual conta** | Sandra ou Éder — permissão muda o que aparece |
| **O que eu esperava** | "esperava que recusasse sem a solução" |
| **O que aconteceu** | "concluiu normalmente" |
| **Dá para repetir?** | Aconteceu de novo ao refazer |

Print ajuda. Se a tela mostrou mensagem de erro, copie o texto exato dela.

E o mais valioso de tudo, que só quem conhece o balcão consegue dizer: **onde o sistema está pedindo trabalho demais para uma coisa que na oficina se resolve em dez segundos**.

---

## Documentos relacionados

- [Limites conhecidos](../produto/limites-conhecidos)
- [Visão geral](../produto/visao-geral)
- [Papéis e permissões](../produto/papeis-e-permissoes)
