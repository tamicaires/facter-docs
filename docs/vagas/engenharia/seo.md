---
title: SEO (prioridade máxima)
sidebar_position: 2
tags: [vagas, engenharia, seo, google-jobs, dados-estruturados]
---

# SEO — prioridade máxima

> **Decisão:** SEO não é uma camada aplicada sobre o produto. Em job board, ele **é** a
> arquitetura de URLs e parte do modelo de dados. Nenhuma decisão de rota, slug ou entidade é
> tomada sem passar por aqui.

O Instagram traz o pico do dia; o Google traz a receita composta. Com 15 vagas/dia, em 12 meses
são ~5.400 páginas de vaga mais as páginas de agregação. Cada uma é um ponto de entrada
permanente. É o único canal que cresce sem esforço recorrente.

**Expectativa honesta de prazo:** Google Jobs indexa em dias a semanas. Autoridade orgânica pra
termos disputados leva meses. Os três primeiros meses são carregados pelo Instagram — o SEO
compõe depois, e compõe forte. Quem espera tráfego orgânico no dia 8 vai concluir errado que não
funcionou.

---

## 1. Google Jobs é a maior alavanca

Vaga com dados estruturados válidos entra na caixa de vagas do topo da busca — acima dos
resultados orgânicos, de graça. É onde o candidato regional realmente procura.

### JSON-LD `JobPosting` em toda página de vaga

Campos obrigatórios e os que mudam resultado:

| Campo | Nota |
|-------|------|
| `title` | Só o cargo. Nunca "Vaga de X na Empresa Y — Facter Vagas" |
| `description` | HTML permitido; quanto mais completa, melhor o ranqueamento |
| `datePosted` / `validThrough` | `validThrough` é o que evita vaga fantasma. Obrigatório |
| `employmentType` | `FULL_TIME`, `PART_TIME`, `CONTRACTOR`, `TEMPORARY`, `INTERN` |
| `hiringOrganization` | Nome, logo e `sameAs` da empresa |
| `jobLocation` | Com `PostalAddress` completo: cidade, UF, país |
| `baseSalary` | Aumenta CTR de forma perceptível. Quando for "a combinar", **omitir** — nunca mandar `0` |
| `identifier` | O id da vaga, estável |
| `directApply` | `true` só se a candidatura se completa no site. Com redirecionamento pra WhatsApp é **`false`** — declarar errado é violação de política |
| `jobLocationType` | `TELECOMMUTE` só em vaga realmente remota |

> `directApply` é um dos motivos pra **acelerar a candidatura interna da Fase 1**: o Google
> favorece vaga que se resolve no próprio site. Hoje o valor honesto é `false`, e assim fica.

### Indexing API — o atalho que quase ninguém usa

O Google mantém uma **Indexing API que aceita justamente `JobPosting`** (é um dos dois tipos
suportados). Em vez de esperar o crawler, dá pra notificar publicação e remoção na hora:

- Vaga publicada → `URL_UPDATED`
- Vaga encerrada ou expirada → `URL_DELETED`

Pra um portal com 15 entradas e ~15 saídas por dia, isso é a diferença entre a vaga aparecer no
mesmo dia ou três dias depois — e vaga tem prazo. **Entra na Fase 0.**

### Validação contínua

- Rich Results Test em toda vaga nova nas primeiras semanas
- Relatório específico de **"Vagas de emprego"** no Search Console — acompanhar semanalmente
- Um erro de schema derruba a vaga inteira da caixa, silenciosamente

---

## 2. Arquitetura de URLs — onde o job board ganha

O tráfego não vem de "facter vagas". Vem de **cauda longa** do tipo `vagas de auxiliar
administrativo em imperatriz`, `emprego em balsas ma`, `vaga de motorista imperatriz`.

Cada uma dessas buscas precisa de uma página própria:

```
/vagas/[slug]                                  vaga individual
/vagas/cidade/imperatriz-ma                    cidade
/vagas/area/logistica                          área
/vagas/cargo/auxiliar-administrativo           cargo          ← maior volume de busca
/vagas/cargo/auxiliar-administrativo/imperatriz-ma   cargo × cidade  ← maior conversão
/vagas/area/logistica/imperatriz-ma            área × cidade
/vagas/tipo/estagio                            tipo de contrato
/empresas/[slug]                               empresa
```

**A interseção cargo × cidade é a página mais valiosa do site.** É exatamente o que a pessoa
digita, tem concorrência fraca no interior do Maranhão e converte melhor que qualquer página
genérica. Isso é o que obriga **`Role` (cargo) a ser entidade normalizada** no banco, e não um
título digitado livremente — ver [Modelo de Dados](./modelo-de-dados).

### A regra que impede isso de virar lixo

Página programática sem conteúdo é **thin content**, e em volume vira *index bloat*: o Google
gasta o crawl budget em páginas vazias e passa a confiar menos no site inteiro.

> **Só é indexável a página de agregação com 3 ou mais vagas ativas.** Abaixo disso: `noindex`,
> mas continua navegável e útil, mostrando vagas próximas ou relacionadas.

A regra é dinâmica — a página entra e sai do índice conforme o inventário. É a diferença entre
SEO programático que funciona e SEO programático que destrói o domínio.

---

## 3. O problema específico de job board: a vaga expira

Vaga tem prazo de validade, e o que fazer com a URL depois é a decisão de SEO mais mal resolvida
do setor. Manter no ar suja o índice; apagar joga fora autoridade acumulada e quebra o link que
já foi pro story.

**Decisão:**

| Momento | Tratamento |
|---------|------------|
| Ativa | `200`, indexável, com JSON-LD, no sitemap |
| Expirada (até 6 meses) | `200`, **`noindex`**, **sem JSON-LD**, aviso de "vaga encerrada" e lista forte de vagas similares. Fora do sitemap. `URL_DELETED` na Indexing API |
| Depois de 6 meses | `410 Gone` |

O `200` com `noindex` na janela intermediária é deliberado: preserva o link antigo do Instagram e
o acesso que ainda chega da busca, e converte essa visita em outra vaga em vez de num erro. O
`410` depois limpa o índice de vez.

**Cron diário** faz a transição `PUBLISHED → EXPIRED`, remove do sitemap e dispara o
`URL_DELETED`. Sem isso, o Google penaliza o portal por vaga fantasma — e é uma penalização que
atinge o site todo, não só a vaga.

---

## 4. Navegação facetada — o maior risco técnico

Filtro que vira URL cria espaço de rastreamento infinito: `?cidade=&area=&salario=&ordenar=&pagina=`
gera milhares de combinações sem valor, e o Google consome o crawl budget nelas em vez de nas
vagas novas. É o erro que mais afunda job board.

**Regra:**

- **Combinação curada** (cargo × cidade, área × cidade) → rota real, URL limpa, indexável
- **Qualquer outro filtro** → query string, com `noindex` e `canonical` apontando pra página
  limpa correspondente
- `robots.txt` bloqueia os padrões de parâmetro que não interessam
- Nenhum link interno `<a href>` aponta pra combinação não curada — filtro extra é aplicado via
  interação, não via link rastreável

### Paginação

O Google não usa mais `rel=next/prev` pra indexação. As páginas `?pagina=2` em diante ficam
**rastreáveis e com canonical próprio** (não canonicalizadas pra página 1 — isso esconderia as
vagas do fundo), mas **fora do sitemap**. O que garante descoberta das vagas mesmo assim são os
links internos das páginas de cidade, cargo e empresa.

---

## 5. Sitemaps

Índice de sitemaps segmentado, com `lastmod` real:

```
/sitemap.xml            → índice
/sitemap/vagas-1.xml    → vagas ativas (máx. 50k por arquivo)
/sitemap/cidades.xml
/sitemap/cargos.xml
/sitemap/areas.xml
/sitemap/empresas.xml
/sitemap/conteudo.xml   → blog e páginas institucionais
```

Segmentar não é organização: é diagnóstico. O Search Console reporta cobertura **por sitemap**,
então dá pra ver que as vagas indexam bem e as páginas de cargo não — coisa impossível de
enxergar num arquivo único.

`lastmod` precisa ser verdadeiro. Data inflada em massa faz o Google passar a ignorar o campo.

---

## 6. Subdomínio: o que isso implica

O site fica em **`vagas.facter.com.br`**. O Google trata subdomínio como entidade largamente
separada pra fins de autoridade — o Vagas **não herda** o que `facter.com.br` acumulou, nem
empresta de volta.

Aqui o custo é baixo, porque `facter.com.br` é um site B2B novo com pouca autoridade orgânica
pra doar. Mas a consequência é concreta: **a autoridade do Vagas se constrói do zero**, o que
aumenta o peso de três coisas:

- **Busca por marca.** "facter vagas" precisa ranquear em primeiro. É o Instagram que gera esse
  volume, e é dos sinais de qualidade mais fortes que existem.
- **Link do site institucional.** `facter.com.br` linkando pro Vagas em lugar visível ajuda
  descoberta e associa as duas marcas.
- **Consistência de identidade** entre perfil do Instagram, site e páginas de empresa.

> Se um dia a autoridade do domínio principal crescer muito, migrar pra `facter.com.br/vagas`
> seria ganho — mas é migração com redirecionamento de milhares de URLs, e não se faz de graça.
> A decisão de agora está certa pelo custo técnico; só não se deve esperar herança de autoridade
> que não existe.

---

## 7. Confiança (E-E-A-T)

Emprego mexe com o sustento de alguém — o Google aplica um crivo de confiança mais rígido a esse
tipo de conteúdo. Sinais que custam pouco e pesam:

- **Sobre** com quem está por trás, CNPJ e contato real
- Política de privacidade e termos (também exigidos pela LGPD na Fase 1)
- **"Vaga verificada em DD/MM"** visível na página — a curadoria é o diferencial declarado do
  produto, e aqui ela vira sinal
- Perfil do Instagram com 13k linkado e vinculado à marca: gera **busca por marca**, que é dos
  sinais de qualidade mais fortes que existem
- Página de empresa com histórico de vagas publicadas

### Conteúdo de topo de funil

Blog enxuto, focado em busca local, que nenhum portal nacional cobre bem:

- "Empresas que mais contratam em Imperatriz"
- "Como fazer currículo pelo celular"
- "Quanto ganha um auxiliar administrativo no Maranhão"

Cada post linka pras páginas de cargo e cidade correspondentes. Poucos e bons — **Fase 1**, não
na primeira semana.

---

## 8. Performance é fator de ranqueamento

Já coberto em [Mobile-first](../produto/mobile-first), e reforça daqui: Core Web Vitals entram na
avaliação de página, e o público é celular modesto em rede ruim. LCP abaixo de 2,5s em 4G
simulado, num Android intermediário, é meta de SEO tanto quanto de UX.

---

## 9. A oportunidade concreta no Sul do Maranhão

Os portais nacionais (Vagas.com, Indeed, Catho, InfoJobs) dominam termos genéricos e nacionais,
mas cobrem mal a cauda longa municipal do interior — muitas dessas buscas retornam página de
cidade vazia ou resultado de outro estado. E boa parte da oferta local vive hoje em **grupos de
WhatsApp e Facebook, que não ranqueiam**.

Ou seja: existe demanda de busca real com oferta orgânica fraca. É uma janela — e ela fecha
quando alguém ocupar. Daí a prioridade.

---

## Checklist de aceite (Fase 0)

- [ ] JSON-LD `JobPosting` validado no Rich Results Test, sem erro nem aviso
- [ ] `directApply: false` enquanto a candidatura for redirecionamento
- [ ] `validThrough` em toda vaga, e cron de expiração rodando
- [ ] Indexing API disparando em publicação e em encerramento
- [ ] Páginas de cidade, área, cargo e das interseções curadas no ar
- [ ] Regra de `noindex` abaixo de 3 vagas ativas implementada
- [ ] `robots.txt` bloqueando os padrões de faceta não curada
- [ ] Índice de sitemaps segmentado, com `lastmod` verdadeiro
- [ ] Search Console verificado **antes** do lançamento, com sitemap enviado
- [ ] Bing Webmaster Tools configurado (custa 10 minutos)
- [ ] Canonical absoluto em toda página
- [ ] Nenhuma página pública dependendo de JS pra mostrar o conteúdo principal

> As especificações do Google para `JobPosting` e para a Indexing API mudam. Reconferir na
> documentação oficial no dia da implementação, em vez de confiar nesta página.
