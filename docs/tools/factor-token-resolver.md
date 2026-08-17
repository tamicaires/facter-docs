---
title: Factor Token Resolver (uso pessoal)
sidebar_position: 99
tags: [tools, pessoal, senha, kdf]
---

# Factor Token Resolver — notas

> ⚠️ **Ferramenta pessoal**, não é feature do produto Facter. Doc só para registro
> do desenho e das decisões. Não indexar/divulgar. Código mora fora do monorepo.

Micro-app Next.js (App Router) + Tailwind + lucide-react, hospedado em domínio próprio.
Fachada de **"Design System — Color Specs & Extraction Tokens"** sobre um gerador
determinístico de senhas. Tudo roda **client-side**; nada é enviado a servidor.

## Dois modos

### 1. Static Extraction (fachada + esquema fraco)
Deriva um **sufixo** do nome do serviço + uma "cor" (regras de string). A senha final seria
`raiz + sufixo + "!"`.

| Cor | Regra | Ex. |
|-----|-------|-----|
| Red | 3 últimas letras | bradesco → `Sco` |
| Green | 3 primeiras invertidas | spotify → `Ops` |
| Blue | 1ª + última + tamanho | linkedin → `Ln8` |
| Yellow | vogais distintas | amazon → `Ao` |
| Default | 3 primeiras consoantes | github → `Gth` |

**Fraqueza fatal (não usar para valer):** o sufixo vem só de dado **público**. Se uma única
senha vazar, `raiz = senha − sufixo` → a raiz é recuperada → todas as senhas caem.

### 2. Runtime Resolver (KDF — recomendado)
Modelo *master password* (LessPass): `senha = PBKDF2(seed, salt = path#revisão, 200k it)`,
mapeado para o charset escolhido.

- **Determinístico:** mesma `seed` + `path` → sempre a mesma senha. Regenera na hora, sem cofre.
- **Mão única + lento:** da senha não se recupera a seed; brute force offline é caro.
- **Seed só em memória** (nível sessão), nunca persistida. O **registro de paths** (não-secreto)
  fica em `localStorage` por conveniência.
- **Perfis:** Full (garante 1 de cada classe), Alphanumeric, Hex, **Numeric (PIN)** com presets
  4/6 dígitos.
- Comprimento 4–64; `revisão` permite rotacionar a senha sem trocar a seed.

**Por que "mesma seed em tudo" é seguro aqui:** o `path` entra como salt → cada site gera
senha diferente e sem relação; um vazamento não revela a seed nem as outras senhas. Reusa-se
o **segredo**, nunca a **senha**.

## Disfarce (mapa fachada → real)

| Real | Aparece como |
|------|--------------|
| Senha-mestra (raiz) | `Root Seed` (session-scoped) |
| Nome do serviço | `Token Path / Namespace` (ex.: `brand/bradesco`) |
| Senha gerada | `resolved value` → `--resolved: …;` |
| Lista de sites | `Token Registry` |
| Comprimento/charset/rotação | `length` / `charset` / `revision` |

## Guia da seed (raiz)
- 5–6 palavras **aleatórias** com imagem mental; gerar **offline**, exclusiva, nunca digitar
  fora do app.
- ~64–77 bits. Evitar dados pessoais, substituições óbvias, reuso.
- **Risco:** esquecer = perder tudo → gravar por repetição (2–3 semanas) + backup em papel no
  cofre.

## Notas de segurança
- **`NEXT_PUBLIC_*` vaza no bundle** — nunca pôr a seed em env de client. Auth da fachada
  (hash client-side) é só obscuridade, não barreira real.
- Env de servidor guardaria a seed em terceiro (Vercel) → contraria o "só na cabeça"; não usar.
- Melhor conveniência sem guardar a seed: digitar 1× por sessão (em memória), ou cofre do
  navegador/OS.

## Rodar / deploy
`npm i` → gerar `NEXT_PUBLIC_GATE_HASH` (SHA-256 da senha da fachada) → `npm run dev`.
Deploy: `vercel` + env no projeto. Estrutura: `app/`, `components/` (access-gate, spec-sheet,
playground, token-resolver, token-console), `lib/` (extract.ts, kdf.ts, hash.ts).
