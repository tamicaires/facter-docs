# Como fazer mockups

O mockup é a **fonte da verdade da tela antes do código**. Depois de aprovado, a implementação segue ele (ver [Interface: UI e UX](../engenharia/padroes/interface-e-ux.md), seção 1). Toda tela nova ou repensada nasce como mockup aqui, é discutida, aprovada, e só então vira código.

A galeria de tudo que já existe está em [Mockups](./mockups.mdx).

## Onde ficam os arquivos

Um mockup tem três partes:

1. **O HTML**, self-contained, em `facter-docs/static/mockups/truck/<slug>/index.html`.
2. **A página** que abre em tela cheia, em `facter-docs/src/pages/telas/truck/<slug>.tsx`, usando o `MockupScreen`:

   ```tsx
   import MockupScreen from '@site/src/components/MockupScreen';

   export default function Page() {
     return <MockupScreen title="Nome da tela" status="Em revisão · DD/MM/AAAA" file="/mockups/truck/<slug>/index.html" />;
   }
   ```

   Isso publica a rota `/telas/truck/<slug>`.
3. **A entrada na galeria**, em `docs/truck/produto/mockups.mdx`: um `### Título`, um parágrafo com o **status** no começo e a descrição, e o link `[Ver o mockup](/telas/truck/<slug>)`. Uma imagem `desktop.png` na mesma pasta serve de prévia.

## O contrato de design

- **Tokens do tema** (`--primary`, `--foreground`, `--muted`, `--border`, `--success`, `--warning`, `--danger`…) — as mesmas cores do produto. Nunca cor solta.
- **Cor só onde decide** (o dia de hoje, o item escolhido, a faixa do período). Sem arco-íris, sem tom que não faz parte. Paleta calma.
- Fontes **Inter** (texto) e **Sora** (títulos), via Google Fonts.
- Ícones **Phosphor via iconify** (`api.iconify.design/ph/...`) como máscara CSS.
- **Self-contained**: um HTML só, sem build, abre sozinho.
- **Responsivo**: mostra o notebook e o celular quando o comportamento muda entre eles.
- Segue os [padrões de UI e UX](../engenharia/padroes/interface-e-ux.md): diálogos lideram pelo título (sem contexto), estados completos, tabelas pequenas, carregamento com skeleton, filtros chip-style.
- **Mostra a interação inteira** — o que a setinha abre, o estado do dropdown aberto, o passo de confirmação. Nada pela metade.
- Texto do mockup segue o [`COPY.md`](https://github.com/tamicaires/facter-truck/blob/main/COPY.md) como qualquer tela.

## Status e aprovação

Cada mockup carrega um status, na página (`MockupScreen status=`) e no parágrafo da galeria:

- **Rascunho · DD/MM** — em desenho, ainda mudando.
- **Em revisão · DD/MM** — pronto pra discussão.
- **Aprovado em DD/MM/AAAA** — travado; a tela codada tem que bater com ele.

**A implementação segue o mockup aprovado.** Mudou a tela depois de aprovada, atualiza o mockup **antes** de mexer no código.

## Passo a passo

1. Escreve o HTML em `static/mockups/truck/<slug>/index.html`.
2. Cria a página `src/pages/telas/truck/<slug>.tsx` com o `MockupScreen`.
3. Adiciona a entrada em `produto/mockups.mdx` (com status `Em revisão`).
4. Manda o link `/telas/truck/<slug>` pra revisão.
5. Aprovado: marca o status como `Aprovado em ...` na página e na galeria, e implementa fiel.
