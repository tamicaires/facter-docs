---
title: Visão Geral
sidebar_position: 1
tags: [vagas, produto, visao-geral, estrategia]
---

# Facter Vagas — Visão Geral

> **Status:** Fase 0 (MVP) em construção · **Meta:** site no ar em 1 semana

## O que é

Portal de vagas de emprego com curadoria. Produto de **duas pontas**:

| Ponta | O que faz | Paga? |
|-------|-----------|-------|
| **Candidato** | Busca, filtra, vê detalhe e se candidata | Candidatura sempre grátis; recursos opcionais pagos previstos |
| **Empresa** | Anuncia vagas e (Fase 3) acompanha candidatos | Sim, eventualmente |

A doc antiga do ecossistema (`_archive/facter-root/docs/empresa/ecossistema.md`) descrevia o
Facter Vagas como um **ATS para RH** — pipeline, entrevistas, contratações. Aquilo continua de
pé, mas virou **Fase 3**. O produto **começa como job board** porque é isso que a distribuição
que já existe pede: audiência de candidatos, não de recrutadores.

---

## A vantagem que já existe

Todo job board novo morre do mesmo jeito: **problema do ovo e da galinha**. Sem vagas não vem
candidato, sem candidato nenhuma empresa anuncia. Quem lança gasta meses (e dinheiro) comprando
os dois lados.

Aqui **um dos lados já está comprado**: uma conta de Instagram com **13k+ seguidores**,
construída ao longo de anos postando vagas manualmente. Isso não é um detalhe de marketing — é
a razão pela qual este produto tem chance e um clone genérico não tem.

Consequência prática: **cada decisão de produto deve ser avaliada por quanto alimenta esse
loop**, não por quão completa deixa o sistema.

---

## O loop de crescimento

```
   ┌──────────────────────────────────────────────────────────┐
   │                                                          │
   ▼                                                          │
Vaga cadastrada no admin                                      │
   │                                                          │
   ├──▶ Sistema gera arte (story + feed) e legenda            │
   │         │                                                │
   │         ▼                                                │
   │    Post no Instagram (13k) ──▶ pico de tráfego no dia    │
   │                                      │                   │
   ├──▶ Página SSR + JSON-LD JobPosting   │                   │
   │         │                            │                   │
   │         ▼                            │                   │
   │    Google Jobs ──▶ cauda longa ──────┤                   │
   │                                      │                   │
   │                                      ▼                   │
   │                            Volume de candidatos          │
   │                                      │                   │
   │                                      ▼                   │
   └──────────── Empresas querem anunciar ────────────────────┘
                          │
                          ▼
                Receita + mais vagas
```

Os dois canais são **complementares, não redundantes**:

- **Instagram** dá o pico — muito acesso no dia do post, some em 48h.
- **Google Jobs** dá a cauda — pouco acesso por dia, mas por semanas, e sem esforço recorrente.

O Instagram é o canal que ela controla. O Google é o que compõe. A 15 vagas/dia, são ~5.400
páginas de vaga em 12 meses, cada uma um ponto de entrada permanente — por isso **SEO é
prioridade máxima**, tratado como decisão de arquitetura e não como otimização posterior. As
entidades `Role` e `City` e o desenho das rotas existem por causa dele. Ver
**[SEO](../engenharia/seo)**.

---

## Princípios de produto

1. **O site é o produto; o Instagram é o canal.** A arte gerada existe pra levar gente ao site,
   não pra substituí-lo. Toda arte carrega o caminho de volta.
2. **Curadoria é o diferencial, não o volume.** Não competimos com agregador que raspa 50 mil
   vagas. Competimos com vaga real, verificada, descrita direito.
3. **Mobile-first, sem negociação.** Boa parte deste público **não tem computador** — o celular
   é o único dispositivo, e o acesso chega pelo navegador interno do Instagram. Excelente no
   celular, bonito no desktop, nessa ordem quando houver conflito. Detalhes e consequências
   técnicas em [Mobile-first](./mobile-first).
4. **Nunca prometer gratuidade perpétua em copy.** Recursos opcionais pagos ao candidato estão
   previstos ([Monetização](./monetizacao)). Afirmar sempre no presente e com escopo: "ver e se
   candidatar é gratuito", nunca "não cobramos nada".
5. **Candidato nunca esbarra em cadastro pra ver vaga.** Fricção antes do valor mata conversão
   de tráfego social. Cadastro só quando ele já quiser algo (salvar, alerta, candidatura de
   um clique).
6. **Nada de vaga fantasma.** Vaga expirada sai do ar. Vale por respeito ao candidato e porque
   o Google penaliza (ver [Modelo de Dados](../engenharia/modelo-de-dados)).

---

## Modelo de negócio

> **Hipótese, não decidido.** Registrado aqui pra que o schema não feche portas.

O caminho natural com audiência própria é a empresa pagar por **visibilidade**, não por
software:

- **Vaga em destaque** — sobe no topo da listagem por um período.
- **Publicação no Instagram** — a empresa paga pra vaga virar story/feed no perfil.
- **Plano de empresa** — X vagas ativas por mês, com painel próprio (Fase 2).

Por isso `featured` no modelo de dados nasce com **`featuredUntil`** (destaque tem prazo,
prazo tem preço) e não como um booleano solto. Cobrar é decisão futura; **poder cobrar sem
migração** é decisão de agora.

---

## Fora de escopo (por enquanto)

Registrado pra não voltar como surpresa:

- Raspagem/importação automática de vagas de outros portais.
- Match algorítmico candidato × vaga.
- Testes e avaliações dentro da plataforma.
- App nativo.
- Multi-idioma / vagas fora do Brasil.

---

## Decisões fechadas

| Decisão | Resolução |
|---------|-----------|
| **Marca** | **Facter Vagas.** O perfil do Instagram já se chamava "focus vagas" e foi renomeado pra Facter Vagas há um bom tempo — a audiência já conhece a marca atual, então o site herda o nome sem custo de reconhecimento. |
| **Design System** | Consome `@facter/ds-core` desde a Fase 0, com o tema `vagas.css` que já está publicado no pacote. Componente novo nasce estruturado pra ser promovido ao DS — ver [Componentes & Design System](../engenharia/componentes). |
| **Nicho e região** | **Sul do Maranhão.** Mercado majoritariamente presencial — filtro de cidade pesa muito mais que filtro de remoto. Gera páginas de cidade pra SEO local. |
| **Volume** | **~15 vagas/dia**, com expectativa de crescer bastante. O sistema é dimensionado pra milhares de vagas, não centenas. |
| **Monetização** | **Começa junto com o site**, em venda manual (ver [Monetização](./monetizacao)). Checkout automático fica pra Fase 2. |
| **Domínio** | **`vagas.facter.com.br`** — consistente com a convenção do ecossistema (`tasks.facter.com.br`). Implicação de SEO registrada em [SEO](../engenharia/seo). |

---

## O que o volume muda

15 vagas/dia é ~450 vagas ativas em regime (com validade de 30 dias). Isso não é um portal
pequeno, e três coisas deixam de ser opcionais:

1. **A velocidade do admin é feature, não conforto.** A 15/dia, cada minuto a mais no cadastro
   são 7 horas por mês. Duplicar vaga, autocomplete de empresa e atalhos de teclado entram na
   Fase 0.
2. **Não dá pra postar 15 vezes por dia no Instagram.** O formato principal passa a ser o
   **carrossel "vagas de hoje"**, com story individual reservado pras vagas em destaque — que
   são justamente as pagas. Isso puxa a geração em lote pra Fase 0.
3. **Busca, paginação e expiração automática** deixam de ser refinamento. Com centenas de vagas
   ativas, filtro ruim é o mesmo que não ter vaga, e vaga vencida no ar derruba o ranqueamento
   no Google.

---

## Decisões em aberto

| # | Decisão | Por que importa |
|---|---------|-----------------|
| 1 | **Seed de cidades e cargos** | A lista proposta em [Plano da Semana 1](../projeto/plano-semana-1) foi montada sem conhecimento local. Cada cidade e cargo vira URL de SEO, e slug não muda depois — precisa ser revisada antes do Dia 1. |

---

## Documentos relacionados

- [Mobile-first](./mobile-first)
- [Monetização](./monetizacao)
- [Roadmap por fases](../projeto/roadmap)
- [Plano da semana 1](../projeto/plano-semana-1)
- [Arquitetura](../engenharia/arquitetura)
- [Modelo de dados](../engenharia/modelo-de-dados)
- [SEO](../engenharia/seo)
- [Componentes & Design System](../engenharia/componentes)
