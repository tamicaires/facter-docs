---
title: Campos de uma vaga
sidebar_position: 4
tags: [vagas, produto, cadastro, dados]
---

# Campos de uma vaga

Referência para coletar dados de vaga **antes** de a tela de cadastro existir.
Espelha o `model Job` do [Modelo de Dados](../engenharia/modelo-de-dados).

---

## Obrigatórios

Sem estes seis, a vaga não pode ser publicada.

| Campo | O que é | Formato |
|-------|---------|---------|
| `title` | Cargo, **só o cargo** | `Auxiliar Administrativo` — nunca "Vaga de aux. adm na empresa X" |
| `company` | Nome da empresa | `Supermercado Boa Compra` |
| `description` | O que a pessoa vai fazer | 2 a 5 frases |
| `employmentType` | Tipo de contrato | `CLT` · `PJ` · `ESTAGIO` · `TEMPORARIO` · `FREELANCER` · `TRAINEE` · `APRENDIZ` |
| `workModel` | Modelo de trabalho | `PRESENCIAL` · `HIBRIDO` · `REMOTO` |
| `applyType` + contato | Como se candidatar | `WHATSAPP` → telefone · `EXTERNAL_URL` → link · `EMAIL` → e-mail |

> `expiresAt` também é obrigatório no banco, mas o sistema preenche sozinho com
> **30 dias** se você não informar. É o `validThrough` que o Google Jobs exige.

---

## Muito recomendados

Tecnicamente opcionais, mas cada um aumenta conversão ou tráfego.

| Campo | Por que importa |
|-------|-----------------|
| `city` | Filtro mais usado da região e ativo de SEO local. Sem ele a vaga some das buscas por cidade |
| `salaryMin` / `salaryMax` | Aumenta muito o clique. Aparece no schema.org e destaca no Google |
| `requirements` | O candidato se autoqualifica. **Uma exigência por linha** — o site transforma em lista |
| `role` (cargo) | Alimenta a página cargo × cidade, a de maior conversão do site |
| `category` (área) | Filtro e página de área |
| `benefits` | Uma por linha, mesmo tratamento dos requisitos |

---

## Opcionais

| Campo | Padrão | Observação |
|-------|--------|------------|
| `responsibilities` | — | Se a descrição já cobrir, não precisa |
| `seniority` | — | `ESTAGIO` · `JUNIOR` · `PLENO` · `SENIOR` · `ESPECIALISTA` · `LIDERANCA` |
| `vacancies` | `1` | Só informe se for mais de uma |
| `pcd` | `false` | `true` só se for vaga afirmativa para PcD |
| `salaryPeriod` | `MONTH` | `HOUR` · `DAY` · `MONTH` · `YEAR` |
| `salaryVisible` | `true` | `false` = mostra "a combinar" |
| `tags` | `[]` | Palavras soltas que ajudam a busca |
| `featured` | `false` | Destaque — ver [Monetização](./monetizacao) |

---

## Formato para coletar

Um bloco por vaga. Campo sem informação: **deixe em branco, não invente**.

```json
{
  "title": "Auxiliar Administrativo",
  "company": "Supermercado Boa Compra",
  "city": "Imperatriz",
  "description": "Apoio às rotinas administrativas da loja: conferência de notas fiscais, controle de planilhas e atendimento a fornecedores.",
  "requirements": [
    "Ensino médio completo",
    "Pacote Office intermediário",
    "Experiência anterior será um diferencial"
  ],
  "benefits": ["Vale-transporte", "Vale-alimentação", "Plano de saúde após 90 dias"],
  "employmentType": "CLT",
  "workModel": "PRESENCIAL",
  "seniority": null,
  "role": "Auxiliar Administrativo",
  "category": "Administrativo",
  "salaryMin": 1780,
  "salaryMax": 2100,
  "salaryPeriod": "MONTH",
  "salaryVisible": true,
  "vacancies": 1,
  "pcd": false,
  "applyType": "WHATSAPP",
  "applyWhatsapp": "5599999990000",
  "applyUrl": null,
  "applyEmail": null,
  "tags": ["escritório", "notas fiscais"]
}
```

**Salário em reais inteiros** (`1780`, não `178000` nem `1.780,00`). O sistema converte
para centavos na importação.

**WhatsApp com código do país e DDD, só dígitos**: `5599999990000`.

---

## Prompt para extrair de texto solto

Cole junto com o anúncio original (print, mensagem de WhatsApp, texto do RH):

```
Extraia os dados da vaga abaixo e devolva SÓ um JSON no formato indicado.

Regras:
- Nunca invente. Campo sem informação no texto = null (ou [] para listas).
- "title" é apenas o cargo, sem nome de empresa nem palavra "vaga".
- "requirements" e "benefits": array, um item curto por exigência/benefício.
- Salário em reais inteiros. Se disser "a combinar", salaryVisible=false e valores null.
- employmentType: CLT | PJ | ESTAGIO | TEMPORARIO | FREELANCER | TRAINEE | APRENDIZ
- workModel: PRESENCIAL | HIBRIDO | REMOTO  (se não disser, assuma PRESENCIAL)
- applyType: WHATSAPP | EXTERNAL_URL | EMAIL, conforme o contato informado.
- WhatsApp só dígitos com 55 + DDD.
- Cidade: só o nome, sem UF.

Formato: {mesmo JSON do exemplo acima}

Anúncio:
"""
<cole aqui>
"""
```

---

## O que o sistema resolve sozinho

Não colete: `slug` (gerado uma vez e imutável), `status`, `publishedAt`,
`expiresAt` (30 dias), `viewCount`, `applyClickCount`, `priority`, `country`.
