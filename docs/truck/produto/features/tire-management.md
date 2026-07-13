---
title: Gestao de Pneus
sidebar_position: 2
tags: [features, pneus, tire-management, produto]
---

# Gestao de Pneus

Sistema completo de gestao do ciclo de vida de pneus: da compra ate o descarte, incluindo recapagem, TPMS e analise de CPK.

---

## Visao Geral

Pneus representam um dos maiores custos operacionais de frotas de transporte. O modulo de gestao de pneus do Facter Truck permite:

- Rastrear cada pneu pelo **numero de fogo** (identificador unico)
- Controlar **km rodado** por pneu
- Gerenciar **recapagem** completa (R0 ate R3)
- Monitorar **pressao e temperatura** em tempo real (TPMS)
- Calcular **CPK** (custo por quilometro) por marca/modelo
- Controlar **garantias** e suas expiracoes

---

## Personas

| Persona | Perfil | Necessidade |
|---------|--------|-------------|
| **Gestor de Frota** | Opera o sistema diariamente | Rastrear pneus, planejar trocas, analisar custos |
| **Borracheiro** | Executa montagens/desmontagens | Interface simples, poucos clicks, funciona offline |
| **Comprador** | Negocia com fornecedores | Historico de compras, CPK por marca, ROI de recapagem |
| **Financeiro** | Controla custos | Relatorios de custo por veiculo, por frota, por periodo |
| **Diretor** | Visao executiva | Gasto total, economia gerada, comparativos |

---

## Funcionalidades

### Cadastro Base

- Cadastrar pneu (numero de fogo, marca, modelo, dimensao, DOT)
- Cadastrar fornecedor e recapador
- Importar pneus em massa (Excel/CSV)
- Configurar estoque minimo/maximo por dimensao

### Operacoes Diarias

- Montar pneu em veiculo/carreta (selecao visual de posicao)
- Desmontar pneu
- Rotacionar pneus (trocar de posicao)
- Registrar medicao de sulco
- Registrar calibragem
- Registrar dano

### Recapagem

Ciclo completo de recapagem com rastreamento de cada etapa:

```
ESTOQUE -> FILA_RECAPAGEM -> ENVIADO -> NO_RECAPADOR ->
APROVADO/REJEITADO -> RECAPANDO -> CONCLUIDO -> ESTOQUE (nova vida)
```

| Etapa | Acao | Resultado |
|-------|------|-----------|
| Fila | Gestor avalia carcaca e envia para fila | Status: FILA_RECAPAGEM |
| Envio | Montar lote, selecionar recapador, gerar romaneio | Status: ENVIADO |
| Recebimento | Recapador confirma recebimento | Status: NO_RECAPADOR |
| Triagem | Recapador aprova ou rejeita carcaca | Status: APROVADO ou REJEITADO |
| Recapagem | Selecao de banda/desenho, execucao | Status: RECAPANDO |
| Conclusao | Pneu recapado retorna ao estoque | Status: ESTOQUE, vida: R1/R2/R3 |

### Fim de Vida

- Condenar pneu (motivo obrigatorio)
- Vender pneu usado
- Sucatear pneu

### TPMS (Monitoramento em Tempo Real)

- Visualizar pressao e temperatura por posicao
- Alertas automaticos de pressao baixa/alta
- Historico de leituras
- Mapeamento sensor-pneu

### Garantias

- Cadastrar garantia com prazo e condicoes
- Alertas de vencimento
- Registrar acionamento (claim)
- Anexar documentos (NF, fotos)

---

## Priorizacao (MoSCoW)

| Funcionalidade | Must | Should | Could |
|----------------|:----:|:------:|:-----:|
| Cadastro de pneu | X | | |
| Montar/desmontar | X | | |
| Historico de eventos | X | | |
| Import em massa | X | | |
| Controle de recapagem | X | | |
| Dashboard basico | X | | |
| CPK por marca | | X | |
| TPMS | | X | |
| Rotacao drag-drop | | X | |
| Garantias | | | X |
| PWA borracheiro | | | X |

---

## Jornadas Principais

### Cadastrar Pneu Novo

1. Acessar Pneus > Novo Pneu
2. Preencher dados obrigatorios: numero de fogo, marca, dimensao
3. Preencher opcionais: modelo, DOT, sulco original, preco, fornecedor, NF
4. Sistema cria registro (status: NOVO, local: ESTOQUE), carcaca e evento "Pneu comprado"

### Montar Pneu em Veiculo

1. Buscar pneu por numero de fogo
2. Clicar em "Montar"
3. Selecionar veiculo (busca por placa)
4. Selecionar posicao no diagrama visual do veiculo
5. Informar km atual do veiculo
6. Sistema atualiza status para EM_USO e registra evento

### Enviar para Recapagem

1. Pneus desmontados vao para fila de recapagem
2. Gestor monta lote de envio (seleciona pneus da fila)
3. Seleciona recapador (com metricas: taxa de aprovacao, tempo medio)
4. Confirma envio e gera romaneio PDF
5. Sistema atualiza status e registra eventos

---

## Metricas e Analytics

| Metrica | Descricao |
|---------|-----------|
| **CPK** (Custo por km) | Total gasto no pneu / total km rodados |
| **ROI de recapagem** | Economia com recapagem vs compra de pneus novos |
| **Taxa de condenacao** | % de pneus condenados por marca/modelo |
| **Vida media** | Media de km rodados por vida (R0, R1, R2, R3) |
| **Indice de recapagem** | % de pneus que vao para recapagem vs descarte |

### Dashboard

- Resumo geral da frota de pneus
- CPK comparativo por marca/modelo
- Distribuicao por status (em uso, estoque, recapagem, condenado)
- Alertas de estoque minimo por dimensao
- Export de relatorios (PDF/Excel)

---

## Regras de Negocio (Resumo)

- Numero de fogo e unico por empresa
- Pneu so pode ser montado se estiver em ESTOQUE
- Desmontagem exige registrar km atual do veiculo (para calcular km rodado)
- Condenacao exige motivo obrigatorio
- Recapagem maxima definida por configuracao (default: R3)
- DOT: formato WWAA (semana + ano de fabricacao)

---

## Referencias

- [Glossario](../glossario) -- Termos do dominio de pneus
- [Roadmap](../../projeto/roadmap) -- Sprints de implementacao de pneus
