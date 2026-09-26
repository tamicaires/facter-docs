---
title: Arquitetura
sidebar_position: 1
tags: [vagas, engenharia, arquitetura, seo, decisoes]
---

# Facter Vagas — Arquitetura

## Stack

| Camada | Escolha |
|--------|---------|
| Framework | **Next.js (App Router)** — SSR/ISR, route handlers como API |
| Linguagem | TypeScript |
| UI | **`@facter/ds-core@^1.38.1`** + Tailwind **v3**, tema `vagas.css` (roxo `262 83% 58%`) — ver [Componentes](./componentes) |
| ORM | Prisma |
| Banco | PostgreSQL gerenciado (Neon ou Supabase) |
| Auth | Auth.js (NextAuth) |
| Imagens de arte e OG | `ImageResponse` do `next/og` (Satori + resvg) |
| Storage | Vercel Blob ou Supabase Storage (logos; currículos na Fase 1) |
| Hospedagem | Vercel |

---

## Decisões e o porquê

### 1. Next.js full-stack, e não React + Vite + NestJS

O padrão do ecossistema Facter é **React + Vite no front e NestJS no back**. Aqui abrimos
exceção, por dois motivos:

- **SPA em Vite é ruim pra SEO de conteúdo público.** Job board vive de busca orgânica. Página
  de vaga precisa vir renderizada do servidor, com HTML completo, pra ser indexada e entrar no
  Google Jobs.
- **Um deploy só entrega mais rápido.** Com uma semana de prazo, manter dois serviços,
  dois deploys e um contrato de API entre eles é custo sem retorno enquanto o consumidor da API
  é o próprio site.

**Quando reconsiderar:** na Fase 2, se o painel da empresa e as integrações do Hub crescerem a
ponto de a lógica de negócio pedir casa própria. Aí o Next continua servindo o site público
(que é onde o SEO importa) e o Nest assume o domínio. Manter a lógica de negócio em
`src/server/` desde já, fora dos route handlers, deixa essa porta aberta sem esforço.

### 2. SEO é prioridade máxima, não requisito

Tratado como **decisão de arquitetura**: as rotas, os slugs e as entidades `Role` e `City`
existem por causa dele. A estratégia completa — Google Jobs, Indexing API, SEO programático,
regra de expiração, controle de faceta — está em **[SEO](./seo)**. Resumo do que amarra aqui:

O Instagram dá o pico; o Google dá a cauda. Ignorar SEO no começo é abrir mão do canal que
funciona sozinho. Requisitos:

- **JSON-LD `JobPosting`** em toda página de vaga, com `title`, `description`, `datePosted`,
  `validThrough`, `employmentType`, `hiringOrganization`, `jobLocation`, `baseSalary` e — pra
  vaga remota — `jobLocationType` e `applicantLocationRequirements`.
- **`validThrough` obrigatório.** O Google exige data de validade e trata mal portal que deixa
  vaga expirada no ar. Por isso `expiresAt` é obrigatório no modelo.
- **Vaga encerrada sai do índice** — retorna 404 ou 410 e some do sitemap.
- **URL canônica e imutável.** Depois que a vaga foi pro story e foi indexada, mudar a URL
  quebra os dois canais. O `slug` é gerado uma vez e **nunca muda**, mesmo que o título mude.
- `sitemap.xml` dinâmico, `robots.txt`, canonical tags.
- Páginas de agregação pra cauda longa: `/vagas/area/[slug]`, `/vagas/cidade/[slug]`,
  `/empresas/[slug]` — é o que capta busca do tipo "vagas de auxiliar administrativo em X".

### 3. Renderização

- **Listagem** — dinâmica (filtro e busca vêm da query string), com cache curto.
- **Detalhe da vaga** — ISR, revalidando por caminho quando a vaga é publicada ou editada.
- **Admin** — inteiramente dinâmico, sem cache.

### 4. Auth.js desde o dia 1, mesmo com um usuário

Um middleware com senha resolveria a semana 1. Mas a Fase 1 traz conta de candidato e a Fase 2
conta de empresa — e trocar o mecanismo de auth depois de ter usuários é bem pior que instalá-lo
agora. O `User.role` já nasce como enum com `ADMIN`, `CANDIDATE` e `COMPANY`, mesmo que só o
primeiro exista.

### 5. Geração de imagem com Satori

`ImageResponse` renderiza JSX/CSS em PNG no servidor. Escolhido em vez de `html2canvas` no
navegador porque o resultado é **determinístico** — nada de fonte que não carregou ou gradiente
que saiu diferente por navegador — e porque a **mesma infraestrutura serve as duas coisas**: a
arte do Instagram e a OG image do link compartilhado no WhatsApp.

**Restrição a respeitar no design:** Satori suporta um subconjunto de CSS. Flexbox sim, CSS Grid
não; fontes precisam ser carregadas explicitamente; nem todo filtro e efeito funciona. Desenhar
o template já dentro dessa caixa.

Rotas:

```
/api/og/vaga/[slug]          → 1200×630   card de link compartilhado
/api/og/story/[slug]         → 1080×1920  story do Instagram
/api/og/feed/[slug]          → 1080×1350  feed do Instagram
```

### 6. Design System: `@facter/ds-core` desde a Fase 0

O DS entra no dia 1, com o tema `vagas.css` que já está publicado no pacote. Duas restrições
de consumo saíram da leitura do repo do DS e **afetam o setup**:

- **Tailwind v3 obrigatório** — o `facterPreset` usa o mecanismo de `presets`, que o Tailwind v4
  removeu. O `create-next-app` scaffolda com v4 por padrão, então tem que ser fixado.
- **O barrel do DS é uma fronteira de cliente única** (`"use client"` injetado no build, com
  `splitting: false`). Nas páginas públicas ele fica nas folhas interativas; layout e conteúdo
  indexável continuam Server Component.

Componente que o DS não tem nasce em `src/components/ui/` **já no formato do DS**, pra ser
promovido depois com um `git mv`. Detalhes, inventário e regras em
[Componentes & Design System](./componentes).

### 7. Orçamento de performance no celular

O público majoritariamente **não tem computador** e chega pelo navegador interno do Instagram.
Isso transforma peso de página em requisito, não em polimento: LCP abaixo de 2,5s em 4G
simulado num Android intermediário, conteúdo da vaga legível antes da hidratação, e JS de
cliente tratado como orçamento fechado. Ver [Mobile-first](../produto/mobile-first).

### 8. Multi-tenant: preparado, não implementado

A Fase 2 abre a publicação pras empresas. Isolar dado por tenant depois é caro; por isso
**`Company` é entidade desde o dia 0** — nunca uma string no registro da vaga — e toda vaga
aponta pra uma empresa e pra quem a criou. O que fica pra depois é só a camada de acesso:
`CompanyUser`, sessão com empresa ativa e os filtros de autorização.

---

## Estrutura de pastas

```
src/
├── app/
│   ├── (public)/              # site público, SSR/ISR
│   │   ├── page.tsx           # home + listagem
│   │   ├── vagas/[slug]/      # detalhe da vaga
│   │   ├── empresas/[slug]/
│   │   └── vagas/area/[slug]/
│   ├── (admin)/admin/         # painel, dinâmico
│   ├── api/
│   │   └── og/                # geração de imagem
│   ├── sitemap.ts
│   └── robots.ts
├── server/                    # lógica de negócio — sem React, sem HTTP
│   ├── jobs/
│   ├── companies/
│   └── content/               # legenda, hashtags
├── components/
│   ├── ui/                    # candidatos ao DS — genéricos, sem domínio
│   ├── job/                   # domínio Vagas
│   └── og/                    # templates de arte (Satori — sem DS, CSS restrito)
├── lib/
└── prisma/
```

> `src/server/` não importa nada de React nem de Next. É o que permite, se a Fase 2 pedir,
> mover o domínio pra um NestJS sem reescrever regra.

---

## Observabilidade da Fase 0

Deliberadamente simples: contadores de visualização e de clique em candidatar-se, gravados na
própria tabela de vagas, mais o analytics da Vercel. Dashboard de verdade é Fase 2 — na semana 1
nenhuma decisão depende dele.
