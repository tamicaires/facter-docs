---
title: Roadmap
sidebar_position: 1
tags: [vagas, projeto, roadmap, fases]
---

# Facter Vagas — Roadmap

> Cada fase entrega **valor sozinha**. Nenhuma depende da seguinte pra fazer sentido no ar.

```
FASE 0            FASE 1            FASE 2            FASE 3            FASE 4
1 semana          2–4 semanas       4–6 semanas       6–8 semanas       contínuo
─────────────────────────────────────────────────────────────────────────────────
Job board         Conta de          Conta de          ATS               Automação
+ gerador         candidato         empresa           (pipeline)        de conteúdo
de arte
─────────────────────────────────────────────────────────────────────────────────
Ela cadastra      Candidato se      Empresa           Empresa gerencia  Post no Insta
Candidato vê      candidata         publica           o processo        sem passar
e é redirecionado dentro do site    (com aprovação)   seletivo          pela mão
```

Estimativas são de **esforço**, não de calendário.

---

## Fase 0 — MVP (essa semana)

**Objetivo:** site no ar, vagas publicadas, primeiro post no Instagram apontando pra ele.

### Entra

**Site público**
- Home com listagem de vagas, ordenada por destaque e recência
- Busca por texto (título, empresa, descrição)
- Filtros: localização, modalidade (presencial/híbrido/remoto), tipo de contrato, área
- Página de detalhe da vaga
- Botão de candidatura que **redireciona**: WhatsApp com mensagem pré-preenchida, link
  externo da empresa, ou e-mail
- Compartilhar vaga
- Mobile-first

**SEO — prioridade máxima** (estratégia completa em [SEO](../engenharia/seo))
- SSR/ISR em todas as páginas públicas
- JSON-LD `JobPosting` por vaga
- `sitemap.xml` e `robots.txt` dinâmicos
- Metadata e OG image por vaga
- **Páginas programáticas**: cidade, área, cargo e as interseções curadas
  (`/vagas/cargo/auxiliar-administrativo/imperatriz-ma` é a de maior conversão)
- Regra de `noindex` em agregação com menos de 3 vagas ativas — evita thin content
- **Indexing API do Google** em publicação e encerramento — indexa no mesmo dia, não em 3
- Expiração por cron: `noindex` + sem JSON-LD + vagas similares; `410` após 6 meses
- Controle de faceta: só combinação curada vira URL indexável
- Índice de sitemaps segmentado por tipo
- Search Console e Bing Webmaster configurados **antes** do lançamento

**Admin (só ela) — velocidade é feature**
- Login
- CRUD de vaga com publicar / pausar / encerrar
- **Duplicar vaga** e autocomplete de empresa e cidade — a 15/dia, cada minuto a mais no
  cadastro custa 7 horas por mês
- Marcar destaque com data de validade
- Cadastro de empresa, cidade e área
- Aviso de possível duplicata (mesma empresa, título parecido, últimos 30 dias)

**Comercial (venda manual, zero checkout)**
- Registro de `Promotion`: tipo, valor, período, pago em — ver [Monetização](../produto/monetizacao)
- Teto de 3 destaques por página de listagem

**Gerador de arte** — dimensionado pra 15 vagas/dia
- **Carrossel "vagas de hoje"** (1080×1350, capa + 1 vaga por slide) — o formato principal:
  não dá pra fazer 15 posts individuais por dia
- Story individual (1080×1920) — reservado pras vagas em destaque, que são as pagas
- **Geração em lote**: seleciona as vagas do dia, baixa tudo de uma vez
- Legenda pronta com hashtags, pra copiar e colar

**Métricas mínimas**
- Contador de visualizações por vaga
- Contador de cliques em "candidatar-se"

### Não entra

Conta de candidato · currículo · candidatura interna · conta de empresa · moderação ·
pipeline · **checkout automático** (a venda manual entra) · e-mail transacional · alerta de
vagas · publicação automática no Instagram.

### Cortes conscientes

| Corte | Por quê | Quando volta |
|-------|---------|--------------|
| Candidatura só por redirecionamento | Candidatura interna exige conta, upload de currículo, e-mail e LGPD — sozinha é uma semana inteira | Fase 1 |
| Um único usuário admin | Ninguém mais publica ainda; RBAC sem segundo papel é código morto | Fase 2 |
| Descrição em texto/Markdown simples | Editor rich text é um rabbit hole de dias | Fase 1, se doer |
| Dois templates de arte, não seis | Um story e um feed bem feitos convertem mais que seis medianos | Fase 4 |
| Analytics por contador no banco | Dashboard de verdade não muda nenhuma decisão na semana 1 | Fase 2 |
| Checkout automático | Venda manual por Pix já gera receita e custa zero de código | Fase 2 |

### Critério de pronto

Um dia real de operação: 15 vagas cadastradas em tempo aceitável, carrossel gerado em lote,
postado, e candidatos chegando pelo link e clicando em candidatar-se — com os cliques
registrados.

---

## Fase 1 — Candidato

**Objetivo:** transformar visita em relacionamento. Hoje o candidato vem do story, olha e some.

- Conta de candidato (Auth.js — Google + e-mail)
- Perfil: dados, cidade, área de interesse, currículo em PDF
- **Candidatura facilitada**: um clique, envia o perfil pra vaga sem sair do site
  — convive com o redirecionamento externo; quem manda é o `applyType` da vaga
- Vagas salvas
- **Alerta de vagas** por e-mail: candidato salva um filtro e recebe as novas
- Histórico de candidaturas
- **Currículo gerado a partir do perfil** — quem só tem celular raramente tem PDF no aparelho;
  o upload vira atalho opcional, não requisito (ver [Mobile-first](../produto/mobile-first))
- PWA: instalação na tela inicial + notificação de vaga nova
- LGPD: política de privacidade, consentimento explícito, exclusão de conta e dados

> O alerta de vagas é o item de maior retenção da fase — é o que faz o candidato voltar sem
> depender de um novo post.

---

## Fase 2 — Empresa

**Objetivo:** parar de ser o gargalo do cadastro e abrir caminho pra receita.

- Conta de empresa e multi-tenant
- Empresa reivindica o perfil que já foi cadastrado por nós (`Company.status: MANAGED → CLAIMED`)
- Publicação com **fila de moderação** (`PENDING_REVIEW`) — curadoria continua sendo o
  diferencial
- Painel da empresa: vagas ativas, candidatos por vaga, métricas
- **Checkout automático** (Pix e cartão) e planos recorrentes → integração com o **Facter Hub** (SSO + billing). O modelo `Promotion` não muda: muda quem cria o registro
- Dashboard de métricas do portal

---

## Fase 3 — ATS

**Objetivo:** entregar o que a doc original do ecossistema descrevia.

- Pipeline de seleção (kanban por vaga)
- Banco de candidatos com busca
- Agendamento de entrevistas
- Avaliações e notas
- Registro de contratações
- Relatórios de processo (tempo por etapa, taxa de conversão, origem do candidato)

---

## Fase 4 — Automação de conteúdo

**Objetivo:** tirar a mão do processo de divulgação.

- Agendamento de posts
- Publicação automática via **Instagram Graph API**
  — exige conta Business ligada a uma Página do Facebook e **App Review da Meta** pra permissão
  de publicação de conteúdo; é burocracia de semanas, por isso fica aqui e não na fase 0
- Carrossel multi-vagas ("vagas da semana")
- Biblioteca de templates e identidade por campanha
- Relatório de desempenho por post

---

## Ligação com o ecossistema Facter

| Item | Fase |
|------|------|
| Design System `@facter/ds-core` | **Fase 0** — base de componentes, com o tema `vagas.css` já publicado no pacote |
| Componentes novos promovidos ao DS | Contínuo — nascem em `src/components/ui/` e sobem quando estabilizam ([convenção](../engenharia/componentes)) |
| Facter Hub (SSO + billing) | Fase 2, junto com a conta de empresa |
| Tema `vagas.css` (roxo, `262 83% 58%`) | Fase 0 — já publicado em `@facter/ds-core@1.38.1`, light e dark |
