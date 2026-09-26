---
title: Abertura e Triagem
sidebar_position: 2
tags: [techcare, produto, ordem-servico, balcao, triagem]
---

# Abertura e Triagem

> O aparelho chegou. Este é o momento em que o sistema registra o que entrou — e é o registro que sustenta a conversa na hora da entrega.

---

## Abrir a ordem

Três passos, nesta ordem:

```
1. Cliente  ──▶  2. Aparelho  ──▶  3. Problema
```

**1. Cliente** — busca por cliente já cadastrado ou cadastra ali mesmo, sem sair da tela. Pessoa física ou jurídica; categoria comum, VIP ou atacado.

**2. Aparelho** — escolhe um aparelho do cliente ou cadastra um novo. Campos que importam: categoria, marca (obrigatória), modelo, número de série, cor, acessórios e **senha do aparelho**.

**3. Problema** — o problema relatado pelo cliente (obrigatório), a condição física, prioridade e, se já der para prometer, o prazo.

Ao salvar, a ordem nasce em **Recebido**, com número no formato `OS-202609-00001`. No modo autônomo, já nasce com o técnico atribuído.

---

## O reconhecimento de garantia

É o comportamento mais importante desta tela.

Assim que o aparelho é escolhido, o sistema consulta se **aquele aparelho** tem garantia vigente da própria oficina. Se tiver, o passo **segura ali** e pergunta:

| Resposta | O que acontece |
|----------|----------------|
| **É retorno** | Abre uma OS de retorno com valores zerados e registra um acionamento de garantia |
| **É serviço novo** | Segue a abertura normal |

Existe porque, sem isso, o retrabalho de garantia entra como ordem comum e fica invisível — ninguém consegue responder depois quantos aparelhos voltaram nem por quê.

Detalhe do que acontece depois em [Garantia e retorno](./garantia-e-retorno).

---

## Impressão

Dois documentos, com públicos diferentes:

| Documento | Para quem | O que traz |
|-----------|-----------|------------|
| **Comprovante** | O cliente | Dados da ordem, aparelho, problema relatado e linha de assinatura |
| **Etiqueta** | A bancada | Identificação para colar no aparelho, com aviso **"SEM SENHA"** quando a senha não foi informada |

---

## A triagem

Conferir o que entrou, item por item.

### O que se registra

| Campo | Como é preenchido | Por que assim |
|-------|-------------------|---------------|
| **Avarias de entrada** | Lista de marcas para selecionar | A entrega confere contra a **mesma lista**. Texto livre não dá para conferir |
| **Acessórios** | Lista de itens para selecionar | Idem — "devolvi o carregador?" precisa de resposta binária |
| **Tipo de problema** | Hardware, software, os dois, ou ainda não sei | Ajuda a direcionar para quem vai olhar |

### As regras

- **Só pode ser feita em Recebido ou Triagem.** Conferir depois do diagnóstico não faz sentido: o aparelho já foi aberto, e qualquer marca nova pode ter sido feita ali dentro.
- **Pode ser salva pela metade.** O balcão é interrompido o tempo todo. A conferência guarda o que já foi marcado e continua depois.
- **Começar move o status sozinho** de Recebido para Triagem.
- **Retomar não zera o tempo**: a hora em que a conferência começou é carimbada uma vez só.
- Uma conferência começada e não terminada **vira pendência** no painel — ver [Pendências](../regras-negocio/pendencias).

---

## Atribuir o técnico e diagnosticar

| Ação | O que exige | O que grava |
|------|-------------|-------------|
| **Atribuir técnico** | O técnico precisa ter vínculo ativo na mesma empresa. Ordem já encerrada não aceita | Evento na linha do tempo |
| **Registrar diagnóstico** | Técnico atribuído; ordem em Recebido, Triagem ou Diagnóstico | Diagnóstico, data e evento |

Registrado o diagnóstico, a ordem está pronta para virar orçamento.

---

## O que observar ao testar

- Abra uma ordem para um aparelho que **já saiu de lá com garantia**: a pergunta "é retorno?" tem que aparecer antes de deixar continuar.
- Comece uma triagem, marque duas avarias, **saia da tela** e volte: o que foi marcado deve estar lá, e a ordem deve estar listada como conferência não terminada.
- Cadastre um aparelho **sem senha** e imprima a etiqueta: o aviso "SEM SENHA" deve aparecer.
- Tente registrar diagnóstico sem técnico atribuído: deve ser recusado.

---

## Documentos relacionados

- [Ciclo de vida da OS](./ciclo-de-vida-da-os)
- [Orçamento e aprovação](./orcamento-e-aprovacao)
- [Garantia e retorno](./garantia-e-retorno)
