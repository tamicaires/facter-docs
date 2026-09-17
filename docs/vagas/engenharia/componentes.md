---
title: Componentes & Design System
sidebar_position: 4
tags: [vagas, engenharia, design-system, componentes, ds-core]
---

# Componentes & Design System

> **Regra de ouro:** existe no DS, usa do DS. Não existe, cria **como se já fosse do DS** — e
> promove depois. Nenhum componente genérico nasce acoplado ao domínio de vagas.

O Facter Vagas consome **`@facter/ds-core`** (v1.38.1, público no npm) e usa o tema
**`vagas.css`**, que já está publicado no pacote — roxo `262 83% 58%`, com light e dark.

---

## Consumo do DS: três restrições reais

Levantadas lendo o `facter-design-system`. **As três são débito do DS, não característica dele**
— estão registradas como `DS-DEBT-002` a `DS-DEBT-005` em `facter-design-system/docs/TECH-DEBT.md`.
O que está aqui embaixo são os **contornos temporários** do Vagas enquanto elas não são
resolvidas; quando forem, estas regras caem.

### 1. Tailwind v3, não v4 — `DS-DEBT-005`

O `facterPreset` usa o mecanismo de `presets` do **Tailwind v3**. O Tailwind v4 substituiu isso
por `@theme` no CSS e **não aceita preset**. Como o `create-next-app` já scaffolda com v4 por
padrão, o Vagas precisa **fixar Tailwind v3** explicitamente. Migrar o app pra v4 antes do DS
migrar quebra o tema inteiro.

```ts
// tailwind.config.ts
import { facterPreset } from '@facter/ds-core/themes/tailwind-preset'

export default {
  presets: [facterPreset],
  content: [
    './src/**/*.{ts,tsx}',
    './node_modules/@facter/ds-core/dist/**/*.{js,mjs}', // obrigatório: sem isso as classes do DS somem no build
  ],
}
```

```css
/* app/globals.css */
@import '@facter/ds-core/themes/base.css';
@import '@facter/ds-core/themes/vagas.css';
```

### 2. O barrel do DS é um único módulo `"use client"` — `DS-DEBT-002`

O build (`tsup`) injeta `"use client"` no topo de `dist/index.js` e `dist/index.mjs`, e roda com
`splitting: false`. Ou seja: **a granularidade de fronteira cliente/servidor do DS é o pacote,
não o componente**. Funciona no App Router — um Server Component pode importar e renderizar —
mas nenhum componente do DS consegue ficar no servidor, nem os que não têm interatividade
(`Badge`, `Skeleton`, `Separator`).

**Medido no scaffold do Dia 1** (Next 16.3.3): uma página com **um `Badge` e dois `Button`**
gera **~1,5 MB de JS de cliente** não comprimido, sendo 920 KB num único chunk — que contém
`recharts`, `vaul` e `sonner`. O `sideEffects: false` não salva: com `splitting: false` o módulo
é um arquivo só, e o `"use client"` no topo o torna uma entrada de cliente inteira.

> **Efeito colateral descoberto na medição:** os peers marcados como opcionais
> (`recharts`, `react-hook-form`) **não são opcionais**. Sem `recharts` instalado o build do
> consumidor falha com `Module not found`. O projeto instala `recharts` só pra conseguir
> renderizar um botão — está no `package.json` por essa razão, não por uso.

Isso torna a regra abaixo obrigatória, não preventiva. **Regra de consumo:**

- Páginas e layouts públicos ficam **Server Components**, sem importar do DS.
- Import do DS acontece nas **folhas interativas** (filtro, busca, botão de candidatar,
  compartilhar) — que já seriam client de qualquer jeito.
- Conteúdo estático da vaga (título, descrição, requisitos, JSON-LD) é HTML no servidor: melhor
  pro SEO e não custa bundle.

No admin a preocupação não existe — pode usar o DS à vontade, não é indexado nem é rota quente.

### 3. Os subpaths granulares não estão buildados — `DS-DEBT-003`

O `exports` do `package.json` declara `@facter/ds-core/button` → `./dist/components/Button/index.mjs`,
mas o `tsup.config.ts` só tem quatro entradas: `index`, `icons/index`, `themes/index` e
`themes/tailwind-preset`. **`dist/components/Button` nunca é gerado**, então esse subpath quebra
na importação. Também vale notar que o `"use client"` é injetado só em `dist/index.*` — não em
`dist/icons/index.*`.

**Enquanto isso não é corrigido no DS:** importar sempre do barrel raiz (`@facter/ds-core`) e
nunca dos subpaths de componente.

Gerar as entries por componente resolve `DS-DEBT-002`, `DS-DEBT-003` e `DS-DEBT-004` de uma vez
— é a mesma mudança no `tsup.config.ts`. Vale como tarefa única no DS, e o Vagas é o primeiro
consumidor com incentivo real pra puxá-la, por ser o primeiro produto do ecossistema em RSC.

---

## O que já vem pronto do DS

São 41 componentes. Mapeados pelo uso no Vagas:

| Uso no Vagas | Componentes do DS |
|--------------|-------------------|
| **Busca e filtro** | `FilterChip`, `Input`, `Select`, `Checkbox`, `Switch`, `Popover` |
| **Listagem** | `Card`, `Badge`, `Skeleton`, `EmptyState`, `ItemCard`, `ScrollArea` |
| **Detalhe da vaga** | `Breadcrumb`, `Avatar`, `Tabs`, `Separator`, `Tooltip`, `Button` |
| **Admin — formulários** | `Form`, `FormInput`, `FormSelect`, `FormTextarea`, `FormCheckbox`, `FormSwitch`, `FormRadioGroup`, `Textarea`, `NumberStepper`, `Wizard` |
| **Admin — navegação** | `Sidebar` (standalone), `Navbar`, `MobileNav`, `PageHeader`, `SectionHeader` |
| **Admin — dados** | `Table`, `DataTable`, `DropdownMenu`, `Dialog`, `Toast` |
| **Admin — métricas** | `StatsCard`, `BigNumberCard`, `Chart` |
| **Fase 3 (ATS)** | `Kanban` — já existe, o pipeline de seleção herda de graça |

> Usar `Sidebar` **standalone**, nunca `DashboardLayout.Sidebar` — convenção registrada no
> `CLAUDE.md` do DS.

---

## O que precisa ser criado

Dividido pelo destino, porque é isso que define onde o arquivo mora.

### Candidatos ao DS — genéricos, sem domínio

Lacunas reais do DS que o Vagas vai preencher. Nascem em `src/components/ui/`:

| Componente | Por que o DS não tem | Uso no Vagas |
|------------|----------------------|--------------|
| `Pagination` | — | Listagem de vagas |
| `Combobox` | O DS só tem `Select` (sem busca) | Cidade, empresa, área |
| `MultiSelect` | — | Filtro de múltiplas áreas |
| `RangeSlider` | — | Faixa salarial |
| `Accordion` | — | FAQ, filtros colapsáveis no mobile |
| `Sheet` | `vaul` já é dependência do DS, mas não há `Sheet` exportado | Painel de filtros no mobile |
| `SearchBar` | — | Busca com sugestão e histórico |
| `ImageUpload` | — | Logo da empresa; currículo na Fase 1 |
| `CopyButton` | — | Copiar legenda e link da vaga |
| `MarkdownContent` | — | Renderizar descrição da vaga |

### Domínio — nunca vão pro DS

Ficam em `src/components/job/` e podem falar de vaga à vontade:

`JobCard` · `JobList` · `JobFilters` · `JobDetail` · `ApplyButton` · `SalaryDisplay` ·
`JobStatusBadge` · `CompanyHeader` · `JobShare` · `RelatedJobs` · `JobSeoJsonLd`

### Templates de arte — categoria à parte

Ficam em `src/components/og/` e **não usam o DS nem componentes de `ui/`**. São renderizados
pelo Satori, que suporta só um subconjunto de CSS (flexbox sim, grid não) e não roda Radix nem
React client. São JSX puro com estilo inline, lendo os tokens do tema como valores literais.

---

## Estrutura de pastas

```
src/components/
├── ui/      # CANDIDATOS AO DS — genéricos, zero domínio, prontos pra migrar
├── job/     # domínio Vagas — nunca migram
└── og/      # templates Satori — restrição de CSS própria, nunca migram
```

A separação é o que torna a promoção um **`git mv` mais um export**, e não uma refatoração.

---

## Regras pra um componente nascer promovível

Todo arquivo em `src/components/ui/` obedece:

1. **Zero domínio.** Não importa tipo, enum, constante ou helper de vaga. Se o nome do
   componente só faz sentido num job board, ele não é `ui/`, é `job/`.
2. **Zero dado.** Nada de `fetch`, Prisma, server action ou store. Recebe tudo por prop.
3. **Zero Next.** Sem `next/link`, `next/image`, `next/navigation`. Precisa navegar? Recebe
   `onSelect` ou aceita um `asChild`/`render` que o `job/` preenche com o `Link`.
4. **Tokens, nunca cor literal.** `bg-primary`, `text-muted-foreground` — nunca `bg-purple-600`.
   É o que faz o componente funcionar em Truck, TechCare e Vagas sem tocar em nada.
5. **Light e dark** verificados nos dois.
6. **API igual à do DS.** `cva` pras variantes, `forwardRef`, `className` mesclada com `cn`,
   props estendendo o elemento HTML nativo.
7. **`"use client"` só se precisar** de estado, efeito ou evento.
8. **Acessível.** Navegação por teclado, `aria-*`, foco visível. Se houver primitivo Radix
   equivalente, usar — é o padrão do DS.

Antipadrão que quebra a promoção:

```tsx
// ❌ ui/SalaryFilter.tsx — sabe o que é salário e de onde vem
import { formatSalary } from '@/lib/job'
export function SalaryFilter() {
  const { data } = useJobFilters()
  return <input onChange={e => setSalary(+e.target.value)} />
}

// ✅ ui/RangeSlider.tsx — genérico
export const RangeSlider = forwardRef<HTMLDivElement, RangeSliderProps>(
  ({ min, max, value, onChange, format, className, ...props }, ref) => { /* ... */ }
)

// ✅ job/JobSalaryFilter.tsx — o domínio compõe
<RangeSlider min={0} max={20000} value={salary} onChange={setSalary} format={formatSalary} />
```

---

## Como promover pro DS

Quando o componente provar valor em produção (usado, estável, sem `TODO` pendente):

1. `git mv` de `src/components/ui/X` pra `packages/core/src/components/X` no
   `facter-design-system`
2. Adicionar ao `src/index.ts` do DS
3. Story no Storybook (`apps/docs`) com as variantes
4. Teste com Vitest + Testing Library
5. `pnpm changeset` — patch pra correção, minor pra componente novo
6. Publicar, subir a versão do `@facter/ds-core` no Vagas e **apagar a cópia local**
7. Se o componente cobre uma lacuna que Truck ou TechCare também têm, avisar — é o ganho real

> Promoção **não** é obrigação de fim de fase. Componente que ainda muda toda semana fica local:
> publicar API instável no DS cobra o preço em todos os produtos de uma vez.

---

## O que o Vagas devolve pro ecossistema

Se os dez candidatos acima forem promovidos, o DS ganha a camada que hoje falta pra **conteúdo
público** — até agora ele foi construído pra painel interno logado. `Pagination`, `Combobox`,
`Sheet`, `Accordion` e `SearchBar` são exatamente o que o Truck vai querer quando tiver portal
do cliente, e o TechCare quando tiver portal de acompanhamento de OS.
