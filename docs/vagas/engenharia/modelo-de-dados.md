---
title: Modelo de Dados
sidebar_position: 3
tags: [vagas, engenharia, prisma, schema, dados]
---

# Facter Vagas — Modelo de Dados

> **A UI nasce pequena; o schema nasce inteiro.** Depois que o Instagram mandar tráfego e o
> Google indexar as vagas, migração de dado real vira operação de risco. Campo não usado não
> custa nada. Campo faltando custa caro.

O schema abaixo é o da **Fase 0**. Os modelos das fases seguintes estão ao final, já desenhados,
pra que o de agora não feche portas.

---

## Fase 0 — o que vai pro banco na semana 1

```prisma
// ---------- Empresa ----------

model Company {
  id        String        @id @default(cuid())
  name      String
  slug      String        @unique
  logoUrl   String?
  website   String?
  about     String?       @db.Text

  // MANAGED  = cadastrada por nós (Fase 0)
  // CLAIMED  = a própria empresa assumiu o perfil (Fase 2)
  status    CompanyStatus @default(MANAGED)

  jobs      Job[]
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt

  @@index([slug])
}

enum CompanyStatus {
  MANAGED
  CLAIMED
}

// ---------- Área / categoria ----------

model Category {
  id    String @id @default(cuid())
  name  String @unique   // "Administrativo", "Logística", "Saúde", "TI"...
  slug  String @unique
  icon  String?
  jobs  Job[]
}

// ---------- Vaga ----------

model Job {
  id              String         @id @default(cuid())
  slug            String         @unique   // IMUTÁVEL — ver nota abaixo

  title           String
  description     String         @db.Text
  responsibilities String?       @db.Text
  requirements    String?        @db.Text
  benefits        String?        @db.Text

  companyId       String
  company         Company        @relation(fields: [companyId], references: [id])
  categoryId      String?
  category        Category?      @relation(fields: [categoryId], references: [id])
  roleId          String?
  role            Role?          @relation(fields: [roleId], references: [id])

  // Classificação
  employmentType  EmploymentType
  workModel       WorkModel
  seniority       Seniority?
  vacancies       Int            @default(1)
  pcd             Boolean        @default(false)  // vaga afirmativa para PcD
  tags            String[]       @default([])

  // Localização — normalizada, ver nota sobre volume
  cityId          String?
  city            City?          @relation(fields: [cityId], references: [id])
  country         String         @default("BR")

  // Salário — em centavos, pra não usar float
  salaryMin       Int?
  salaryMax       Int?
  salaryPeriod    SalaryPeriod   @default(MONTH)
  salaryVisible   Boolean        @default(true)   // "a combinar" é comum no Brasil

  // Candidatura
  applyType       ApplyType
  applyWhatsapp   String?
  applyUrl        String?
  applyEmail      String?

  // Ciclo de vida
  status          JobStatus      @default(DRAFT)
  publishedAt     DateTime?
  expiresAt       DateTime                        // obrigatório — validThrough do Google

  // Destaque (prepara monetização)
  featured        Boolean        @default(false)
  featuredUntil   DateTime?
  priority        Int            @default(0)

  // Métricas
  viewCount       Int            @default(0)
  applyClickCount Int            @default(0)

  createdById     String?
  socialPosts     SocialPost[]

  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  promotions      Promotion[]

  @@index([status, publishedAt])
  @@index([status, featured, priority])
  @@index([status, expiresAt])
  @@index([categoryId])
  @@index([roleId])
  @@index([cityId])
  @@index([roleId, cityId])  // página cargo × cidade — a mais valiosa do site
}

enum EmploymentType {
  CLT
  PJ
  ESTAGIO
  TEMPORARIO
  FREELANCER
  TRAINEE
  APRENDIZ
}

enum WorkModel {
  PRESENCIAL
  HIBRIDO
  REMOTO
}

enum Seniority {
  ESTAGIO
  JUNIOR
  PLENO
  SENIOR
  ESPECIALISTA
  LIDERANCA
}

enum SalaryPeriod {
  HOUR
  DAY
  MONTH
  YEAR
}

enum ApplyType {
  WHATSAPP
  EXTERNAL_URL
  EMAIL
  INTERNAL        // Fase 1 — candidatura dentro do site
}

enum JobStatus {
  DRAFT
  PENDING_REVIEW  // Fase 2 — fila de moderação
  PUBLISHED
  PAUSED
  CLOSED
  EXPIRED
}

// ---------- Cargo ----------

model Role {
  id       String @id @default(cuid())
  name     String @unique   // "Auxiliar Administrativo", "Motorista Carreteiro"
  slug     String @unique   // vira /vagas/cargo/auxiliar-administrativo
  synonyms String[] @default([])  // "aux. administrativo", "auxiliar adm"
  jobs     Job[]
}

// ---------- Cidade ----------

model City {
  id    String @id @default(cuid())
  name  String
  slug  String @unique   // "imperatriz-ma" — vira /vagas/cidade/imperatriz-ma
  state String            // UF
  jobs  Job[]

  @@unique([name, state])
}

// ---------- Comercial ----------

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

// ---------- Divulgação ----------

model SocialPost {
  id        String      @id @default(cuid())
  jobId     String
  job       Job         @relation(fields: [jobId], references: [id], onDelete: Cascade)
  channel   SocialChannel
  caption   String?     @db.Text
  imageUrl  String?
  status    PostStatus  @default(GENERATED)
  postedAt  DateTime?
  createdAt DateTime    @default(now())

  @@index([jobId])
}

enum SocialChannel {
  INSTAGRAM_STORY
  INSTAGRAM_FEED
  INSTAGRAM_CAROUSEL   // "vagas de hoje" — formato principal a 15 vagas/dia
}

enum PostStatus {
  GENERATED   // arte gerada
  SCHEDULED   // Fase 4
  POSTED
  FAILED
}

// ---------- Auth (Fase 0: só o admin) ----------

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  emailVerified DateTime?
  image         String?
  role          UserRole  @default(CANDIDATE)
  createdAt     DateTime  @default(now())
  // + Account e Session, conforme o adapter do Auth.js
}

enum UserRole {
  ADMIN
  CANDIDATE   // Fase 1
  COMPANY     // Fase 2
}
```

---

## As onze decisões que evitam migração depois

| # | Decisão | O que ela evita |
|---|---------|-----------------|
| 1 | **`Company` é entidade, não string** | Na Fase 2 a empresa reivindica o perfil que já existe (`MANAGED → CLAIMED`), com o histórico de vagas junto. Converter string em entidade com dado real é retrabalho e duplicata. |
| 2 | **`JobStatus` já inclui `PENDING_REVIEW`** | A moderação da Fase 2 entra sem alterar o enum nem revisar as queries de listagem. |
| 3 | **`ApplyType` é enum, não booleano** | A candidatura interna da Fase 1 entra como `INTERNAL` e convive com o redirecionamento — vaga velha continua funcionando como está. |
| 4 | **`featured` + `featuredUntil`** | Destaque com prazo é o que se vende. Booleano solto obrigaria migração no dia de cobrar. |
| 5 | **`expiresAt` obrigatório** | É o `validThrough` que o Google Jobs exige, e o que permite expirar vaga automaticamente em vez de deixar vaga fantasma no ar. |
| 6 | **Salário em `Int` de centavos + `salaryVisible`** | Float em dinheiro dá diferença de arredondamento; e "a combinar" é a maioria das vagas no Brasil — sem a flag, vira `0` e polui filtro e schema.org. |
| 7 | **`UserRole` com os três papéis desde já** | Fase 1 e 2 só passam a usar valores que já existem. |
| 8 | **`SocialPost` desde a Fase 0** | O agendamento e a publicação automática da Fase 4 preenchem `status` e `postedAt` numa tabela que já tem o histórico. |
| 9 | **`City` é entidade, não texto livre** | A 15 vagas/dia digitadas à mão, "Imperatriz", "imperatriz" e "Imperatriz-MA" viram três cidades diferentes. Isso quebra o filtro **e** fragmenta as páginas de cidade, que são justamente o ativo de SEO local. Normalizar depois exige de-duplicar dado sujo já indexado. |
| 10 | **`Promotion` desde a Fase 0** | A venda começa manual, mas registrada no banco. Quando o checkout automático chegar na Fase 2, o histórico de receita já está lá — muda quem cria o registro, não o modelo. |
| 11 | **`Role` (cargo) é entidade** | A página `/vagas/cargo/auxiliar-administrativo/imperatriz-ma` é a de maior conversão do site (ver [SEO](./seo)), e ela só existe se o cargo for normalizado. Com o título digitado livre, "Aux. Administrativo" e "Auxiliar Administrativo" viram duas páginas fracas em vez de uma forte. O campo `synonyms` absorve as variações no cadastro. |

### Nota sobre o `slug`

O `slug` é gerado **uma vez**, na criação, e **nunca muda** — nem se o título for corrigido.
Formato sugerido:

```
auxiliar-administrativo-imperatriz-ma-a1b2c3
└──────── título ────────┘└── cidade ──┘└ id curto ┘
```

O sufixo curto garante unicidade sem expor contagem. A imutabilidade é o que impede quebrar,
de uma vez só, o link que já foi pro story e a URL que o Google já indexou.

---

## O que 15 vagas/dia exige do banco

~450 vagas ativas em regime, com expectativa de crescer bastante. Nada disso é exótico nesse
volume, mas tudo custa caro se for retrofitado:

**Busca full-text de verdade.** `LIKE '%palavra%'` não usa índice e degrada de forma visível
conforme a base cresce. Usar `tsvector` do Postgres com índice GIN — mas **não como coluna
`GENERATED`**:

```sql
CREATE OR REPLACE FUNCTION job_search_vector(title text, description text, requirements text)
RETURNS tsvector LANGUAGE sql IMMUTABLE STRICT PARALLEL SAFE AS $$
  SELECT setweight(to_tsvector('portuguese', coalesce(title, '')), 'A')
      || setweight(to_tsvector('portuguese', coalesce(description, '')), 'B')
      || setweight(to_tsvector('portuguese', coalesce(requirements, '')), 'C')
$$;

CREATE INDEX "Job_search_idx"
  ON "Job" USING GIN (job_search_vector("title", "description", "requirements"));
```

> **Por que função + índice de expressão, e não coluna gerada** — verificado na prática no Dia 1:
> o Prisma não consegue expressar `GENERATED ALWAYS AS`. Com a coluna no banco, todo
> `prisma migrate dev` passa a propor `ALTER COLUMN "search" DROP DEFAULT`, que destrói a
> geração. Declarar o campo como `Unsupported("tsvector")` **não resolve** — alinha a coluna e o
> índice, mas o `DROP DEFAULT` continua sendo proposto. Função e índice de expressão o Prisma não
> compara, então schema e banco convivem sem drift (`migrate diff` volta vazio).

Consulta com ranqueamento:

```sql
SELECT * FROM "Job"
WHERE job_search_vector("title", "description", "requirements")
      @@ plainto_tsquery('portuguese', $1)
ORDER BY ts_rank(job_search_vector("title", "description", "requirements"),
                 plainto_tsquery('portuguese', $1)) DESC;
```

Fazer no Dia 1 custa 20 minutos; fazer depois custa uma migration com a tabela em produção.

**Expiração automática.** Vaga vencida no ar derruba ranqueamento no Google Jobs e engana o
candidato. Um cron diário (Vercel Cron) muda `PUBLISHED → EXPIRED` onde `expiresAt < now()`, e o
sitemap e a listagem passam a excluí-las. O índice `[status, expiresAt]` existe pra isso.

**Paginação sempre.** Nenhuma query pública sem `take`. Listagem por cursor ou offset, nunca
carregando tudo pra filtrar no cliente.

**Contadores sem contenção.** `viewCount` com `increment` do Prisma resolve nesse volume. Se a
mesma vaga viralizar num story e receber milhares de acessos em minutos, migrar pra escrita
agregada — não é problema hoje, mas é o primeiro lugar que dói.

**Duplicata.** A mesma vaga chega por WhatsApp de duas fontes. Não vale construir detecção
automática agora; vale o admin avisar quando já existir vaga com título parecido na mesma
empresa nos últimos 30 dias. Uma query, não um sistema.

---

## Fases seguintes — já desenhado

### Fase 1 — candidato

```prisma
model CandidateProfile {
  id           String   @id @default(cuid())
  userId       String   @unique
  headline     String?
  phone        String?
  city         String?
  state        String?
  about        String?  @db.Text
  resumeUrl    String?
  linkedinUrl  String?
  categoryIds  String[] @default([])
  applications Application[]
  savedJobs    SavedJob[]
  alerts       JobAlert[]
}

model Application {
  id          String            @id @default(cuid())
  jobId       String
  candidateId String
  source      ApplicationSource @default(INTERNAL)
  status      ApplicationStatus @default(RECEIVED)
  message     String?           @db.Text
  createdAt   DateTime          @default(now())

  @@unique([jobId, candidateId])
}

enum ApplicationSource {
  INTERNAL
  EXTERNAL_REDIRECT   // clique registrado, sem dado do candidato
}

enum ApplicationStatus {
  RECEIVED
  SCREENING
  INTERVIEW
  OFFER
  HIRED
  REJECTED
  WITHDRAWN
}

model SavedJob  { /* candidateId, jobId, createdAt */ }
model JobAlert  { /* candidateId, filtros salvos, frequência, lastSentAt */ }
```

`ApplicationStatus` já é o pipeline da Fase 3 — o ATS ganha a tela, não o schema.

### Fase 2 — empresa

```prisma
model CompanyUser {
  id        String          @id @default(cuid())
  userId    String
  companyId String
  role      CompanyUserRole @default(MEMBER)

  @@unique([userId, companyId])
}

enum CompanyUserRole { OWNER  ADMIN  MEMBER }

model Subscription { /* companyId, plano, período, integração com o Facter Hub */ }
```

### Fase 3 — ATS

```prisma
model Interview  { /* applicationId, scheduledAt, tipo, local/link, notas */ }
model Evaluation { /* applicationId, avaliador, critérios, nota, parecer */ }
model StageEvent { /* applicationId, de → para, quem, quando — histórico do funil */ }
```

`StageEvent` é o que permite responder "quanto tempo a vaga leva entre triagem e entrevista" —
métrica de processo que o relatório da Fase 3 precisa e que não dá pra reconstruir depois se o
histórico não tiver sido gravado desde o início do pipeline.
