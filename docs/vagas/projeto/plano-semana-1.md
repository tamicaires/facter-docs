---
title: Plano da Semana 1 (MVP)
sidebar_position: 2
tags: [vagas, projeto, mvp, execucao]
---

# Plano da Semana 1 — MVP no ar

> Sequência pensada pra que, **se a semana acabar antes da hora, o que ficou de pé já sirva**.
> Por isso o schema vem primeiro e a arte vem depois do site: sem site, a arte não tem pra onde
> mandar ninguém.

---

## Dia 1 — Fundação

- Projeto Next.js (App Router) + TypeScript + **Tailwind v3** (v4 não aceita o preset do DS)
- `@facter/ds-core@^1.38.1` + peer deps (Radix, framer-motion, lucide, react-hook-form)
- `facterPreset` no `tailwind.config.ts` e o `content` apontando pro `dist` do DS
- Tema: `base.css` + `vagas.css` importados no `globals.css`, dark/light
- Estrutura `src/components/{ui,job,og}` conforme a [convenção de componentes](../engenharia/componentes)
- Postgres gerenciado (Neon ou Supabase) + Prisma
- **Schema completo** conforme [Modelo de Dados](../engenharia/modelo-de-dados) — inclusive os
  campos que só a Fase 1 e 2 vão usar
- Migration inicial + **coluna `tsvector` com índice GIN** pra busca (migration crua)
- Seed: cidades do **Sul do Maranhão** e áreas do mercado local (ver nota abaixo)
- Auth.js com o usuário admin
- Deploy na Vercel já no dia 1, com domínio apontado

> **Por que o schema inteiro hoje:** depois que o Instagram mandar tráfego e o Google indexar,
> migração de dado de vaga vira operação de risco. Campo não usado não custa nada; campo
> faltando custa uma migração com dado real em cima.

---

## Dia 2 — Admin

- Layout do admin
- CRUD de empresa (nome, logo, site, sobre)
- CRUD de vaga com todos os campos
- **Otimizado pra velocidade** — a meta é cadastrar uma vaga em menos de 2 minutos:
  duplicar vaga, autocomplete de empresa e cidade, foco automático, salvar com atalho
- Aviso de possível duplicata (mesma empresa, título parecido, últimos 30 dias)
- Transições de status: rascunho → publicada → pausada / encerrada
- Marcar destaque com data de validade + registro da `Promotion` (valor, período, pago em)
- Upload de logo da empresa

> A 15 vagas/dia, cada minuto a mais no formulário custa ~7 horas por mês. Este é o dia em que
> vale gastar tempo com ergonomia — é a tela mais usada do sistema inteiro.

---

## Dia 3 — Site público: listagem

- Home com grid/lista de vagas
- Card de vaga: título, empresa, local, modalidade, contrato, salário, selo de destaque
- Busca por texto
- Filtros: localização, modalidade, contrato, área, PcD
- Ordenação: destaque → mais recente
- Paginação (sempre com `take` — nenhuma query pública sem limite)
- Teto de 3 vagas em destaque no topo
- Estados de vazio e de carregamento
- **Mobile primeiro** — filtros em bottom sheet, alvo de toque de 44px, uma coluna
- Import do DS só nas folhas interativas; layout e listagem ficam Server Component

---

## Dia 4 — Detalhe da vaga e SEO

> Dia mais denso da semana. SEO é prioridade máxima ([estratégia](../engenharia/seo)) e é o que menos aceita ser retrofitado.

- Página `/vagas/[slug]` renderizada no servidor
- Descrição, requisitos, benefícios, dados da empresa, outras vagas da mesma empresa
- Botão de candidatura conforme o `applyType` (WhatsApp com mensagem pronta / link / e-mail)
- Registro do clique em candidatar-se
- Compartilhar
- **JSON-LD `JobPosting`** validado no Rich Results Test do Google
- `generateMetadata`, OG image dinâmica, `sitemap.ts`, `robots.ts`
- **Páginas programáticas**: cidade, área, cargo e interseção cargo × cidade
- Regra de `noindex` abaixo de 3 vagas ativas
- Índice de sitemaps segmentado + `robots.ts` bloqueando faceta não curada
- Cron diário de expiração + `URL_DELETED` na Indexing API
- **Indexing API** disparando na publicação
- Search Console e Bing Webmaster verificados, sitemap enviado

> Indexação no Google Jobs não é instantânea. Fazer isso no dia 4 e não no fim da semana dá ao
> Google alguns dias de vantagem.

---

## Dia 5 — Gerador de arte

- Rotas de imagem com `ImageResponse` (Satori)
- **Carrossel "vagas de hoje"** (1080×1350: capa com a contagem + 1 vaga por slide) — é o
  formato principal, porque 15 posts individuais por dia não existe
- Story individual (1080×1920) pras vagas em destaque
- Template com identidade do perfil: título, empresa, local, contrato, salário e o endereço do
  site bem visível
- Tela de seleção das vagas do dia → **geração em lote**, download de tudo de uma vez
- Gerador de legenda: texto + hashtags + chamada pro link
- Botão de copiar legenda

> Satori suporta um **subconjunto** de CSS — flexbox sim, grid não, e as fontes precisam ser
> carregadas explicitamente. Vale desenhar o template já dentro dessa restrição em vez de
> desenhar bonito e descobrir depois.

---

## Dia 6 — Polimento e conteúdo real

- Passada no [checklist mobile](../produto/mobile-first#checklist-de-aceite-vale-pra-toda-tela-da-fase-0)
- **Teste dentro do webview do Instagram**, em Android e iOS reais — não só no DevTools
- Página 404, página da empresa, sobre, política de privacidade
- Contadores de visualização e de clique funcionando
- Lighthouse e Core Web Vitals (é fator de ranqueamento, não só UX)
- Passada no [checklist de aceite de SEO](../engenharia/seo#checklist-de-aceite-fase-0)
- **Cadastro das primeiras vagas reais** — mirar um dia cheio (~15), não três de vitrine:
  é o que valida a velocidade do admin e o que faz o portal parecer vivo no lançamento

---

## Dia 7 — Lançamento

- Post de lançamento no Instagram (feed + story com link)
- Acompanhar tráfego e os contadores
- Rich Results Test em duas ou três vagas reais
- Anotar o que quebrou e o que faltou → vira o backlog da Fase 1

---

## Riscos da semana

| Risco | Mitigação |
|-------|-----------|
| Gerador de arte consumir mais que um dia | O site funciona sem ele; se estourar, posta a arte à mão no dia 7 como sempre foi e entrega o gerador na semana seguinte |
| Não ter vagas reais suficientes pra parecer vivo | Combinar as vagas antes de o site subir; portal com 3 vagas converte mal — a 15/dia dá pra subir com 30 a 50 já no ar |
| Escolha do domínio travar o lançamento | Decidir marca e domínio **antes do dia 1** — é a decisão em aberto nº 1 da [Visão Geral](../produto/visao-geral) |
| Design "profissional" virar poço sem fundo | Base no `@facter/ds-core` com o tema `vagas`; o esforço próprio vai pros componentes que o DS não tem, não em repintar o que já existe |

---

## Nota: seed de cidades e áreas

O seed do Dia 1 precisa das **cidades do Sul do Maranhão** e das **áreas do mercado local** —
cada uma vira página de SEO, então nome e slug nascem certos e não mudam depois.

Vale também um seed de **cargos** (`Role`), porque a página cargo × cidade é a de maior
conversão: começar pelos 20 a 30 cargos que mais se repetem nas vagas que você já postava.

**Cidades — proposta pra você corrigir** (você conhece a região, eu não): Imperatriz, Balsas,
Açailândia, Estreito, Carolina, Porto Franco, Grajaú, Barra do Corda, Riachão, Colinas,
São Raimundo das Mangabeiras, Presidente Dutra, João Lisboa, Senador La Rocque, Montes Altos.

**Áreas — proposta**: Administrativo · Comércio e Varejo · Vendas · Logística e Transporte ·
Agronegócio · Construção Civil · Indústria · Saúde · Educação · Alimentação e Hotelaria ·
Beleza e Estética · Serviços Gerais · Segurança · Telemarketing · TI · Financeiro · Jurídico ·
Mecânica e Manutenção

> Melhor errar por ter poucas e criar sob demanda do que abrir 40 áreas vazias — página de
> categoria sem vaga é ruim pro candidato e ruim pro Google. Vale começar com as que você já
> sabe que têm volume e adicionar conforme aparecer.
