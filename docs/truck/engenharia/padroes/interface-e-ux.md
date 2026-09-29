# Interface: UI e UX

Toda tela do Truck segue este arquivo. É regra, não sugestão — do mesmo jeito que o [`COPY.md`](https://github.com/tamicaires/facter-truck/blob/main/COPY.md) manda no texto, este manda no comportamento visual e de interação. O texto de tela vive no `COPY.md`; aqui é o resto: componentes, estados, diálogos, cor, campos, densidade.

Na dúvida entre o que está aqui e o que parece mais rápido, vale o que está aqui. Mudar uma regra exige combinar com a arquiteta e atualizar este arquivo no mesmo ciclo.

## 1. A tela segue o mockup

- A tela codada **bate com o mockup aprovado** (em `facter-docs`, ver [Como fazer mockups](../../produto/como-fazer-mockups.md)), não é um CRUD genérico. A divergência entre mockup e tela quase nunca é de pixel — é de **componente escolhido**.
- Mudou a tela depois de aprovada? **Atualiza o mockup antes do código.**

## 2. Componentes: só o design system, e compostos

- Só `@facter/ds-core`. Componente que falta ou não serve é **criado ou melhorado no DS**, nunca local (um conjunto de ícones, um sistema de toast, um seletor).
- Peça com partes vira **compound** no DS (`Sidebar.Header`, `ActionDialog.Footer`). Componente novo **nasce organizado no DS** — "depois eu separo" não existe.
- Antes de criar, confira se não é variação do que já existe. Quando for padrão novo de verdade, crie o componente — não aproxime com o que existe.

## 3. O componente não ensina a regra

- A interface diz **só o essencial** pra pessoa decidir e agir. O **porquê** e o **invariante** vão pra anotação/doc, nunca pra copy da tela. Cuidado com palavra que confunde conceito (dizer "peças" num componente fez a pessoa achar que era kit de peças).

## 4. Diálogos

- **Lideram pelo título** (verbo + objeto: "Registrar ajuste"). **Não** usar `ActionDialog.Context` (aquele eyebrow com ícone que repete o que está sendo mexido) por reflexo — só quando agrega significado de verdade, e aí é exceção.
- Seguem o **mockup de diálogos aprovado** (`/telas/truck/dialogos`): seções com rótulo, **erro no campo**, **consequência ao vivo** no rodapé, **Cancelar** (contorno) à esquerda e a **ação** à direita (o botão nomeia a ação, nunca "Confirmar"), **folha de baixo** no celular, **confirmação** com a lista do que sai/fica/volta, e **bloqueio que leva ao que resolve**.
- O botão principal fica desabilitado até o formulário estar válido.

## 5. Estados: entregar todos de uma vez

Toda lista/tela nasce completa, não em pedaços:

- **skeleton** de carregamento
- **vazio** (o que falta + por que importa + a ação, se puder agir)
- **busca/filtro sem resultado** (texto próprio, com "Limpar")
- **sem permissão**
- **erro** (com o que fazer)
- **paginação por cursor**

"Depois eu faço os estados" não existe.

## 6. Carregamento

- **Skeleton é o padrão** — é melhor UX que spinner. `Loader` (spinner) só quando não há layout pra desenhar o esqueleto; sempre `variant="dots"`.
- No **scroll infinito**, "Carregando mais" com os dots.

## 7. Tabelas pequenas

- Card com **cabeçalho**, **linhas divididas** e os estados. Caret **só nas linhas-pai**, e que **expande de verdade** — nada de caret decorativo.

## 8. Texto truncado tem tooltip

- Todo texto que pode cortar (`truncate`/ellipsis) tem **tooltip com o valor inteiro** (`title` no elemento, ou o Tooltip do DS quando for rico). Nome de peça, depósito, fornecedor, qualquer célula que encurta.

## 9. Cor com significado, e discreta

- **Cor só onde decide.** O resto é neutro.
- Tom por tipo/estado sempre por **token de tom** (`primary`, `success`, `warning`, `danger`, `info` + `-ink`/`-soft`), **nunca literal do Tailwind** (`text-green-600`) — senão o modo escuro não acompanha e a mesma ideia ganha tons diferentes em telas diferentes.
- **Tons discretos**: fundo `bg-<tom>/10` + ícone `text-<tom>-ink`. A **direção** (+/−, entrou/saiu) fica no **valor**; o **ícone/chip** carrega o **tipo** (ex.: no extrato de estoque — compra/devolução verde, saída pra OS vermelho, transferência azul, ajuste âmbar, saldo inicial neutro). O tom acompanha o tipo do menu ao diálogo ao extrato.

## 10. Filtros

- **Chip-style** consistente entre todas as listas — o mesmo filtro tem o mesmo jeito em toda tela.
- A opção **"geral"** (Todos os X) aparece em **muted** — ela não é um valor real, é o "sem filtro". **"Limpar filtros"** é `primary`.
- Filtro de status (ativo/inativo) é um **segmented claro**, não um link escondido.

## 11. Campos

- **Campo numérico só aceita número** (sem letras). **Campo de busca** com `type="search"` e `autocomplete` desligado — o navegador não pode oferecer autofill de senha.
- **Campo apagado nunca mostra erro técnico** (ver os campos de `shared/form-fields`). Erro de campo aparece **no campo**, ao sair ou ao enviar.

## 12. Densidade e dispositivo

- **Mobile-first não é mobile-only**: o desktop do painel é **projetado**, não a tela de tablet esticada. A gestão no notebook é **densa e comparativa**.
- **FAB** no celular para a ação de criar (o botão do topo rola pra fora); ele **não colide** com o "voltar ao topo".

## 13. Não repetir a tela

- Não repetir em texto o que **asterisco, cor, ícone, posição, estado desabilitado e o próprio valor** já comunicam. Nem na interface, nem no chat com a pessoa.

## Definição de "tela pronta"

Antes de dizer que uma tela está pronta:

- [ ] Todos os estados da seção 5 existem.
- [ ] Copy revisada contra o [`COPY.md`](https://github.com/tamicaires/facter-truck/blob/main/COPY.md) (título, botão, rótulo, dica, vazio, erro, confirmação, tooltip).
- [ ] Todo texto que trunca tem tooltip.
- [ ] Funciona no **notebook e no celular**, no caminho feliz, em cada erro de campo e com o campo apagado.
- [ ] Nenhum texto em outro idioma, nenhum valor técnico cru (`undefined`, código de erro) na tela.
- [ ] Cor só por token de tom; nada de literal do Tailwind.
- [ ] Bate com o mockup aprovado.
- [ ] Sem `as`/`any`/`!` de não-nulo; erro no campo; idioma certo (revisar o diff contra o `CLAUDE.md`).
