---
title: Monetização
sidebar_position: 3
tags: [vagas, produto, monetizacao, receita]
---

# Monetização

> **Decisão:** a receita começa junto com o site, não numa fase futura. O que fica pra depois é
> o **checkout automático** — não a cobrança.

A venda na Fase 0 é **manual**: a empresa combina no WhatsApp, paga no Pix, e o destaque é
marcado no admin. Isso custa zero de desenvolvimento e já valida a coisa mais importante — se
alguém paga, e quanto.

---

## Duas pontas pagantes, não uma

> **Correção de premissa (2026-08-31).** A versão anterior desta doc afirmava que o candidato
> nunca pagaria. Está errado: há intenção de oferecer **recursos opcionais pagos ao candidato** —
> alerta de vaga nova, acesso privilegiado e indicação do perfil para empresas.

Isso impõe uma **regra de copy** que vale para o site inteiro:

- **Nunca prometer gratuidade perpétua.** Nada de "sem taxa", "nunca cobramos", "o candidato não
  paga nada". Promessa em copy vira compromisso, e voltar atrás custa mais confiança do que
  nunca ter prometido.
- **Afirmar no presente e com escopo.** "Ver as vagas e se candidatar é gratuito" continua
  verdadeiro mesmo depois de existir alerta pago.
- **A linha que não se cruza:** o que for pago é sempre **opcional e adicional**. Ver a vaga e
  se candidatar não pode ficar atrás de paywall — é o que sustenta o tráfego do Instagram e do
  Google, e é o que diferencia o produto dos portais que cobram do desempregado.
- **O aviso antigolpe permanece**, e não conflita: "não pedimos dinheiro por Direct ou WhatsApp
  em nome de uma vaga" segue verdadeiro havendo ou não recurso pago.

### Receita do lado do candidato (Fase 1+, hipótese)

| Produto | O que entrega |
|---------|---------------|
| **Alerta de vaga** | Escolhe cidade e área, recebe assim que publicar — chegar primeiro decide a vaga |
| **Perfil em destaque** | O perfil aparece para as empresas que anunciam |
| **Indicação** | Encaminhamos o perfil para vagas compatíveis |

Nenhum deles bloqueia a candidatura. São atalhos, não pedágio.

---

## O que se vende para a empresa

O produto não é software: é **atenção**. A empresa não quer um painel, quer que a vaga dela seja
vista. São quatro coisas vendáveis, em ordem de valor percebido:

| Produto | O que a empresa recebe | Por que ela paga |
|---------|------------------------|------------------|
| **Story dedicado** | A vaga vira um story individual no perfil (13k seguidores) | É o que ela já enxerga e entende. Maior valor percebido, e o mais escasso — daí o preço |
| **Vaga em destaque** | Topo da listagem e selo, por N dias | Com ~450 vagas ativas, estar no topo é a diferença entre ser vista e não ser |
| **Capa do carrossel** | Primeiro slide do post "vagas de hoje" | Posição única por dia |
| **Empresa parceira** | Pacote mensal: X destaques + Y stories | Previsibilidade pros dois lados |

A escassez é real e é o que sustenta o preço: **um story dedicado por dia**, **uma capa de
carrossel por dia**, **um teto de destaques por página**.

---

## O limite que protege o produto

> Máximo de **3 vagas em destaque** no topo de cada página de listagem.

Sem teto, a listagem vira mural de anúncio, o candidato para de confiar e o inventário inteiro
perde valor. O destaque só vale dinheiro enquanto for escasso — vender destaque demais é vender
o próprio ativo. Vale a mesma lógica pro story: uma sequência de 15 stories patrocinados por dia
queima a audiência que levou anos pra construir.

---

## Como funciona na Fase 0 (zero desenvolvimento extra)

1. Empresa procura pelo WhatsApp ou Direct
2. Combina o pacote e paga no Pix
3. No admin, marca-se a vaga como destaque com data de validade
4. Registra-se a venda numa tabela `Promotion` — **não em planilha à parte**

O passo 4 é o único que exige código, e é pouco: um formulário com valor, período e tipo. Ele
existe pra que, no dia do checkout automático (Fase 2), o histórico de receita já esteja no
banco e não precise ser importado de lugar nenhum.

```prisma
model Promotion {
  id         String        @id @default(cuid())
  jobId      String
  job        Job           @relation(fields: [jobId], references: [id])
  kind       PromotionKind
  priceCents Int
  startsAt   DateTime
  endsAt     DateTime
  paidAt     DateTime?
  buyerName  String?       // enquanto Company não tem conta própria
  note       String?
  createdAt  DateTime      @default(now())

  @@index([jobId])
  @@index([endsAt])
}

enum PromotionKind {
  FEATURED_LISTING
  INSTAGRAM_STORY
  CAROUSEL_COVER
  MONTHLY_PACKAGE
}
```

`Job.featured` e `Job.featuredUntil` continuam sendo o que a listagem lê — rápido, sem join. A
`Promotion` é o registro comercial por trás. Um alimenta o outro no momento de marcar.

---

## Preço

Não está definido, e não deve ser chutado aqui. O que dá pra registrar são as alavancas:

- **Antes de ter tráfego**, o que se vende é a audiência — 13k seguidores é número real e
  verificável, e é o argumento honesto do primeiro mês.
- **Depois do primeiro mês**, o argumento vira métrica própria: visualizações da vaga e cliques
  em candidatar-se, que a Fase 0 já registra. É muito mais forte, porque é resultado e não
  alcance.
- **Referência de mercado local** vale mais que tabela de portal nacional. Sul do Maranhão tem
  outro patamar de preço, e a comparação errada trava a venda.

Sugestão: definir o preço **com os três primeiros clientes**, não antes deles.

---

## O que fica pra Fase 2

- Checkout automático (Pix e cartão) com plano recorrente
- Empresa comprando destaque sozinha, sem passar pelo WhatsApp
- Emissão e histórico de nota
- Integração com o **Facter Hub** pra billing e assinatura

Nada disso muda o modelo de dados acima — a `Promotion` só passa a ser criada por um fluxo
automático em vez de por um formulário no admin.

---

## O risco a vigiar

Monetizar cedo é certo, mas tem um jeito de dar errado: **encher o portal de vaga paga ruim**.
Se a empresa pagante puder publicar qualquer coisa, a curadoria — que é o diferencial declarado
na [Visão Geral](./visao-geral) — evapora, e junto vai a razão de alguém seguir o perfil.

Regra: **pagar compra posição, nunca aprovação.** Vaga paga passa pelo mesmo crivo de qualidade
que vaga gratuita, e a que não passa tem o dinheiro devolvido.
