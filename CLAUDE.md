# Facter Docs

Site de documentacao centralizada do ecossistema Facter. Docusaurus com MDX.

## Propostas de Produto

- Propostas ficam em `docs/{projeto}/produto/propostas/`
- Formato: MDX com `ProposalHeader` (status + data + botao de copiar link)
- Sempre incluir **prototipo interativo** (componente React em MDX) quando possivel, para facilitar a decisao com produto
- Componentes de prototipo ficam em `src/components/`
- Status possiveis: `em-discussao`, `aprovado`, `rejeitado`, `implementado`, `arquivado`

## Facter Truck: documentação por módulo

A documentação do Truck acompanha o código. Cada módulo entregue na v2 atualiza o facter-docs **no mesmo ciclo**, antes de ser considerado pronto.

- Produto: `docs/truck/produto/modulos/<modulo>.md`, a partir de `docs/truck/_templates/modulo-produto.md`
- Engenharia: `docs/truck/engenharia/modulos/<modulo>.md`, a partir de `docs/truck/_templates/modulo-engenharia.md`
- Regras que nunca podem ser violadas: `docs/truck/engenharia/invariantes.md` (ids estáveis como `WO-3`; testes e PRs citam o id)
- Decisões: um ADR por decisão em `docs/truck/engenharia/adrs/adr-NNN-titulo.md`, numeração sequencial, nunca editado depois de aceito
- Padrões vivos: `docs/truck/engenharia/padroes/` (padrões de engenharia, estratégia de testes, métricas e definição de pronto)
- Legado v1: `docs/truck/engenharia/legado-v1/` é o sistema atual congelado, referência para portar comportamento. Não recebe conteúdo novo; doc do v1 que precisar de correção ganha nota, não reescrita
- Índices que mudam junto com o conteúdo: `engenharia/adrs/indice.md` (todo ADR novo entra lá) e `produto/propostas/indice.md` (status e impacto na v2 de toda proposta)
- Entrada do Truck: `docs/truck/visao-geral.md`; roadmap e decisões em aberto: `docs/truck/projeto/roadmap.md`
- A auditoria de 2026-09 (`docs/truck/engenharia/auditoria-2026-09.md`) é um retrato datado: não se edita, só se referencia

Arquivos `.md` são processados como MDX: escapar `<` e `{` fora de código (`&lt;`, `\{`). Pastas começando com `_` não entram no site.

Antes de instalar ou atualizar pacote (`pnpm add`), pare o servidor de desenvolvimento: a reinstalação troca os caminhos do `node_modules` e o servidor em execução quebra. Depois, `npx docusaurus clear` e suba de novo.
