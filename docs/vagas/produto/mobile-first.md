---
title: Mobile-first (princípio transversal)
sidebar_position: 2
tags: [vagas, produto, mobile, ux, performance, acessibilidade]
---

# Mobile-first — princípio transversal

> **Boa parte de quem procura vaga neste nicho não tem notebook nem computador.** O celular não
> é o dispositivo preferido: é o **único**. Isso não é uma restrição de layout, é uma restrição
> de produto — e algumas decisões abaixo não são óbvias a partir de "faça responsivo".

O desktop continua importando: é onde a empresa olha e onde o site é julgado. A meta é
**excelente no celular, bonito no desktop** — nessa ordem, quando houver conflito.

---

## 1. O tráfego chega pelo navegador interno do Instagram

Link de story não abre no Chrome nem no Safari: abre no **webview do próprio Instagram**. É um
ambiente com comportamento próprio, e é por onde vai passar a maioria dos primeiros acessos.

Consequências práticas:

- **Armazenamento pode ser isolado ou volátil.** Sessão iniciada dentro do webview pode não
  existir quando a pessoa abrir o site pelo navegador de verdade. Vale pra Fase 1: login tem que
  ser recuperável por e-mail/link mágico, e o fluxo não pode depender de "você já está logado".
- **Prompt de instalação de PWA não aparece** ali dentro. Se for oferecer instalação, tem que
  ser depois, com instrução de "abrir no navegador".
- **Link pra WhatsApp usa `https://wa.me/...`**, não o esquema `whatsapp://` — o formato
  universal é o que sobrevive ao webview e ao desktop.
- **Nada de recurso exótico no caminho crítico.** Ver vaga e candidatar-se tem que funcionar com
  HTML, CSS e o mínimo de JS.
- **Testar de verdade dentro do webview**, postando um story de teste — não só no DevTools.

---

## 2. Conexão ruim e aparelho modesto são o caso padrão

Não é o caso extremo, é a média do público. Isso reforça, e não apenas acompanha, as decisões
de [Arquitetura](../engenharia/arquitetura):

- **Página de vaga renderizada no servidor**, com o conteúdo em HTML. Quem tem 3G ruim lê a vaga
  antes de o JS terminar de carregar.
- **JS no cliente é orçamento, não recurso infinito.** O barrel do `@facter/ds-core` inteiro é
  uma fronteira de cliente só (ver [Componentes](../engenharia/componentes)): nas páginas
  públicas ele fica nas folhas interativas, nunca no layout.
- **Imagem é o que mais pesa.** Logo de empresa passa por `next/image` com AVIF/WebP e tamanho
  fixo; nada de PNG de 800kB direto do upload.
- **Fonte do sistema no caminho crítico**, ou fonte própria com `font-display: swap` e subset.
- **Orçamento de performance como meta explícita:** LCP abaixo de 2,5s em 4G simulado, num
  Android intermediário — não no MacBook.

---

## 3. Ergonomia de quem usa o polegar, em pé, na rua

- **Ações principais ao alcance do polegar** — parte de baixo da tela. Botão de candidatar-se
  fixo no rodapé da página da vaga, não no fim do texto.
- **Alvo de toque de no mínimo 44×44px**, com espaçamento entre alvos.
- **Texto de corpo em 16px ou mais** — abaixo disso o iOS dá zoom sozinho no foco de input.
- **Filtros em bottom sheet**, nunca em sidebar lateral espremida. Abrir, escolher, aplicar,
  com contador de filtros ativos visível.
- **Contraste alto de verdade** — muita gente usa o celular no sol.
- **Sem hover como única forma de revelar informação.** Não existe hover no toque.
- **Formulário com o teclado certo:** `inputmode`, `autocomplete`, `type="tel"` no telefone.
  Cada campo a menos é conversão a mais.

---

## 4. A implicação menos óbvia: o currículo

> **Quem só tem celular quase nunca tem um PDF de currículo no aparelho.**

Isso muda o desenho da candidatura interna da **Fase 1**. Exigir "anexe seu currículo" cria uma
barreira que boa parte do público não consegue vencer no celular — e a candidatura morre ali.

Desenho correto:

- O **perfil preenchido no site é o currículo.** Campos curtos, um passo por vez, salvando
  sozinho conforme preenche.
- O sistema **gera o PDF** a partir do perfil e é isso que a empresa recebe. Reaproveita a mesma
  infraestrutura de renderização das artes do Instagram.
- Upload de PDF existe, mas como **atalho opcional** pra quem já tem — nunca como requisito.

Isso também melhora o produto do outro lado: a empresa recebe currículos num formato só, em vez
de vinte PDFs cada um de um jeito.

---

## 5. Instalar na tela inicial vale mais aqui do que na média

Pra quem só tem celular, o ícone na tela inicial é o equivalente a ter o app — sem loja, sem
download, sem ocupar espaço. Combina bem com o alerta de vagas da Fase 1: notificação de vaga
nova é o que traz a pessoa de volta.

Fica na **Fase 1**, não na 0 — manifest, ícones e service worker não cabem na primeira semana, e
o prompt nem aparece dentro do webview do Instagram, que é de onde vem o tráfego inicial.

---

## 6. Como isso aparece no desktop

Nada acima implica site pobre no computador. Implica **ordem de construção**: o layout nasce na
largura de celular e ganha respiro conforme a tela cresce.

- Listagem: uma coluna no celular → duas ou três no desktop, com filtros fixos numa coluna
  lateral em vez de bottom sheet.
- Detalhe da vaga: coluna única → conteúdo com uma coluna lateral fixa contendo empresa e o
  botão de candidatar-se.
- Admin: é a exceção honesta — o cadastro de vaga é trabalho de mesa, otimizado pro desktop, mas
  precisa continuar **utilizável** no celular, porque cadastrar uma vaga urgente pelo telefone vai
  acontecer.

---

## Checklist de aceite (vale pra toda tela da Fase 0)

- [ ] Testada no webview do Instagram, em Android e iOS reais
- [ ] LCP < 2,5s em 4G simulado, aparelho intermediário
- [ ] Nenhum alvo de toque menor que 44px
- [ ] Sem rolagem horizontal em 360px de largura
- [ ] Legível sob luz forte (contraste AA no mínimo)
- [ ] Ação principal alcançável com o polegar
- [ ] Funciona com JS lento — o conteúdo aparece antes da hidratação
