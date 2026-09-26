---
title: Glossario
sidebar_position: 10
tags: [glossario, produto, dominio]
---

# Glossario

Termos e conceitos do dominio do Facter Truck.

---

## Geral

| Termo | Descricao |
|-------|-----------|
| **Company** | Empresa (tenant). Unidade de isolamento de dados no sistema multi-tenant. |
| **Membership** | Vinculo entre um usuario e uma empresa, com role(s) associada(s). |
| **Multi-tenant** | Arquitetura onde cada empresa tem seus dados isolados, compartilhando a mesma infraestrutura. |

---

## Ativos / Frota

| Termo | Descricao |
|-------|-----------|
| **Fleet (Frota)** | Agrupamento logico de veiculos e carretas de uma empresa. |
| **Vehicle (Veiculo)** | Veiculo motorizado (caminhao, cavalo mecanico). Identificado por placa. |
| **Trailer (Carreta)** | Reboque/semirreboque. Possui eixos e posicoes de roda. |
| **Axle (Eixo)** | Eixo de uma carreta. Possui posicoes de roda (esquerda/direita, interna/externa). |
| **Wheel Position** | Posicao especifica onde um pneu pode ser montado em um eixo. |
| **Carrier (Transportadora)** | Empresa de transporte que opera os veiculos. |
| **Plate (Placa)** | Identificador unico do veiculo/carreta. Unico por empresa. |
| **Chassis (Chassi)** | Numero do chassi do veiculo. |

### Tipos de Carreta

| Tipo | Descricao |
|------|-----------|
| `BITREM` | Combinacao com 2 semirreboques |
| `RODOTREM` | Combinacao com 2+ reboques |
| `CARRETA` | Semirreboque simples |
| `DOLLY` | Eixo auxiliar para acoplar reboques |

### Tipos de Eixo

| Tipo | Descricao |
|------|-----------|
| `SIMPLES` | Eixo simples |
| `DUPLO` | Eixo duplo |
| `TANDEM` | Eixo tandem |

---

## Manutencao

| Termo | Descricao |
|-------|-----------|
| **Work Order (OS)** | Ordem de Servico. Registro de manutencao em um ou mais ativos. |
| **Service (Servico)** | Item do catalogo de servicos (ex: troca de oleo, solda, borracharia). |
| **Service Assignment** | Atribuicao de um servico a uma OS, com localizacao no ativo. |
| **Box** | Box fisico de manutencao na oficina. |
| **Service Return** | Retorno de servico. OS aberta porque um servico anterior falhou. |

### Status da OS

| Status | Descricao |
|--------|-----------|
| `Fila` | Aguardando inicio da manutencao |
| `Manutencao` | Em execucao |
| `AguardandoPeca` | Parada por falta de pecas |
| `Finalizada` | Concluida |
| `Cancelada` | Cancelada |

### Categorias de Servico

| Categoria | Descricao |
|-----------|-----------|
| `Estrutura` | Servicos estruturais (chassi, carroceria) |
| `Eletrica` | Servicos eletricos |
| `Pneumatica` | Servicos pneumaticos |
| `Freios` | Servicos de freio |
| `Soldagem` | Servicos de solda |
| `Borracharia` | Servicos de pneus e borracharia |

### Prioridades

| Prioridade | Descricao |
|------------|-----------|
| `BAIXA` | Pode esperar |
| `MEDIA` | Padrao |
| `ALTA` | Priorizar |
| `URGENTE` | Atender imediatamente |

---

## Estoque

| Termo | Descricao |
|-------|-----------|
| **Part (Peca)** | Item de estoque (filtro, correia, parafuso, etc.). |
| **Part Category** | Categoria de peca (eletrica, mecanica, etc.). |
| **Part Kit** | Conjunto pre-definido de pecas (kit de revisao). |
| **Part Request** | Solicitacao de peca vinculada a uma OS/servico. |
| **Min Stock (Estoque minimo)** | Quantidade minima de uma peca em estoque. Gera alerta quando atingido. |
| **Location (Localizacao)** | Localizacao fisica no almoxarifado (ex: "Prateleira A3"). |

### Status de Solicitacao de Peca

| Status | Descricao |
|--------|-----------|
| `PENDING` | Aguardando aprovacao |
| `APPROVED` | Aprovada |
| `REJECTED` | Rejeitada |
| `DELIVERED` | Peca entregue |

---

## Pneus

| Termo | Descricao |
|-------|-----------|
| **Tire (Pneu)** | Pneu individual, identificado por numero de fogo. |
| **Tire Request** | Solicitacao de pneu vinculada a uma OS. |
| **DOT** | Codigo de fabricacao (formato WWAA: semana + ano). Ex: 4523 = semana 45, ano 2023. |
| **Sulco** | Profundidade do desenho do pneu (mm). Indica desgaste. |
| **Recape (Recapagem)** | Processo de renovar a banda de rodagem de um pneu usado. |
| **Numero de Fogo** | Identificador unico gravado no pneu pela fabrica. |
| **CPK** | Custo por Quilometro. Total gasto no pneu dividido pelo total de km rodados. |

### Condicao do Pneu

| Condicao | Descricao |
|----------|-----------|
| `NOVO` | Pneu novo, primeira vida (R0) |
| `EM_USO` | Montado em um veiculo/carreta |
| `ESTOQUE` | No estoque, disponivel para montagem |
| `RECAPAGEM` | Em processo de recapagem |
| `CONDENADO` | Descartado (fim de vida) |
| `VENDIDO` | Vendido como usado |

---

## Planejamento

| Termo | Descricao |
|-------|-----------|
| **Maintenance Plan (Plano de Manutencao)** | Template de manutencao preventiva com servicos e intervalos. |
| **Maintenance Type** | Tipo de manutencao (preventiva, corretiva, preditiva). |
| **Maintenance Schedule** | Agendamento gerado a partir de um plano aplicado a um veiculo. |
| **Planned Task** | Tarefa planejada dentro de um template de manutencao. |

### Intervalos de Manutencao

| Tipo | Unidade | Exemplo |
|------|---------|---------|
| Quilometragem | km | A cada 10.000 km |
| Horimetro | horas | A cada 500 horas |
| Tempo | dias | A cada 180 dias |

### Status do Agendamento

| Status | Descricao |
|--------|-----------|
| `PENDING` | Agendado, aguardando execucao |
| `SCHEDULED` | Vinculado a uma OS |
| `COMPLETED` | Executado |
| `OVERDUE` | Vencido (nao executado no prazo) |
| `SKIPPED` | Pulado |

---

## Checklist

| Termo | Descricao |
|-------|-----------|
| **Checklist Template** | Modelo de checklist com categorias e itens. |
| **Checklist Category** | Agrupamento de itens no template (ex: "Parte eletrica"). |
| **Checklist Item** | Item individual de verificacao. |
| **Checklist** | Execucao de um template em um veiculo/carreta. |

### Status do Checklist

| Status | Descricao |
|--------|-----------|
| `PENDING` | Criado, nao iniciado |
| `IN_PROGRESS` | Em execucao |
| `COMPLETED` | Finalizado |
| `CANCELLED` | Cancelado |

---

## RH

| Termo | Descricao |
|-------|-----------|
| **Employee (Funcionario)** | Funcionario da empresa (mecanico, borracheiro, etc.). |
| **Job (Cargo)** | Cargo do funcionario (mecanico, eletricista, borracheiro). |
| **Shift (Turno)** | Turno de trabalho (ex: 08:00-17:00). |

### Roles (Papeis)

| Role | Descricao |
|------|-----------|
| `SUPER_ADMIN` | Administrador geral do sistema |
| `ADMIN` | Administrador da empresa |
| `MAINTENANCE_MANAGER` | Gestor de manutencao |
| `TIRE_CONSULTANT` | Consultor de pneus |
| `PARTS_CONSULTANT` | Consultor de pecas |
| `REPORT_MANAGER` | Gestor de relatorios |
| `GENERAL_VIEWER` | Visualizador (somente leitura) |

---

## Localizacao de Peca/Servico

| Termo | Descricao |
|-------|-----------|
| **Asset Type** | Tipo de ativo: VEHICLE, TRAILER, FLEET |
| **Structural Side** | Lado estrutural: esquerdo, direito |
| **Structural Hint** | Posicao estrutural livre: "barrote 3", "longarina direita" |
| **Consumable** | Peca consumivel (nao requer localizacao no ativo) |

---

## Metricas

| Metrica | Descricao |
|---------|-----------|
| **Queue Time** | Tempo que a OS ficou na fila |
| **Maintenance Time** | Tempo de execucao da manutencao |
| **Parts Wait Time** | Tempo aguardando pecas |
| **MTTR** | Mean Time To Repair (tempo medio de reparo) |
| **MTBF** | Mean Time Between Failures (tempo medio entre falhas) |

---

## Abreviacoes

| Sigla | Significado |
|-------|-------------|
| **OS** | Ordem de Servico |
| **KM** | Quilometros |
| **CPF** | Cadastro de Pessoa Fisica |
| **CNPJ** | Cadastro Nacional de Pessoa Juridica |
| **RBAC** | Role-Based Access Control |
| **JWT** | JSON Web Token |
| **SSE** | Server-Sent Events |
| **SSOT** | Single Source of Truth |
| **CPK** | Custo por Quilometro |
| **TPMS** | Tire Pressure Monitoring System |
| **DOT** | Department of Transportation (codigo de fabricacao do pneu) |
| **NF** | Nota Fiscal |

## Termos da v2

| Termo | Definição |
| --- | --- |
| **Organização** | Cliente do Truck identificado por CNPJ; é o tenant. Embarcador, transportadora, oficina ou socorro |
| **Grupo econômico** | Organizações do mesmo grupo (ex.: Suzano e a oficina própria, com outro CNPJ), com acesso completo entre si |
| **Organização executora** | Quem faz a manutenção; dona da OS |
| **Organização proprietária** | Dona do ativo |
| **Operador** | Transportadora que roda com o ativo num período; muda ao longo do tempo |
| **Concessão de compartilhamento** | Acordo em que o dono do dado libera outra organização a ver um escopo, num nível, com validade e revogação |
| **Solicitação de manutenção** | Pedido do dono do ativo a uma oficina prestadora, que vira OS na oficina |
| **Custo interno / valor cobrado** | O que a OS custou à oficina / o que a oficina cobrou do dono |
| **Base** | Local físico de uma organização, com boxes e depósitos |
| **Depósito** | Onde fica o estoque; tem organização dona e base (local), que podem ser de organizações diferentes |
| **Consignado** | Estoque de uma organização guardado na base de outra (ex.: almoxarifado da Suzano dentro da Vale) |
| **Livro de movimentações** | Registro de toda entrada, saída, transferência e ajuste de estoque; o saldo é a soma dele |
| **Item serializado** | Unidade rastreada por número de série (bateria, compressor, pneu) |
| **Veículo** | Unidade física identificada por placa, chassi e Renavam, com um tipo formal (abaixo) |
| **Caminhão-trator** | Veículo automotor feito para tracionar outro; no dia a dia, "cavalo" ([CTB, Anexo I](https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm)) |
| **Caminhão** | Veículo de carga com carroceria própria, que pode puxar reboque ("truck", "toco") |
| **Semirreboque** | Apoia-se na unidade tratora pela quinta roda, sem eixo dianteiro próprio; no dia a dia, "carreta" ([CTB, Anexo I](https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm)) |
| **Reboque** | Tem eixo dianteiro próprio e é engatado atrás de outro veículo (ex.: a "Julieta") ([CTB, Anexo I](https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm)) |
| **Dolly** | Equipamento que acopla um semirreboque como reboque, usado no rodotrem |
| **Implemento rodoviário** | Termo do setor para semirreboque, reboque e dolly |
| **Conjunto de implementos** | Implementos que andam juntos, em ordem, sob um número de frota. Tipos: bitrem, tritrem, rodotrem, hexatrem, vanderleia, Romeu e Julieta |
| **Frota (número de frota)** | Código que identifica um conjunto de implementos no dia a dia; é por ele que o mecânico procura |
| **Posição no conjunto** | Ordem do implemento dentro do conjunto (1, 2, 3…) |
| **Combinação (CVC)** | Combinação de veículos de carga: caminhão-trator (ou caminhão) mais o conjunto de implementos, num período. Substitui "composição" |
| **Engate** | Período em que um conjunto de implementos está acoplado a uma unidade tratora; base do cálculo de km dos implementos |
| **Nome na tela × tipo formal** | A tela usa o nome do dia a dia ("Frota 1234 · carreta 2/2 · QRT4B22"); cadastro e relatórios usam o tipo formal. No código: `power_unit`, `rigid_truck`, `semi_trailer`, `full_trailer`, `dolly`, `trailer_set`, `combination` |
| **Sessão de trabalho** | Intervalo em que um mecânico trabalhou de fato num serviço; o tempo trabalhado é a soma delas |
| **Retrabalho** | Serviço marcado como retorno de um serviço anterior no mesmo componente |
| **Invariante** | Regra que nunca pode estar violada no banco (ver [invariantes](../engenharia/invariantes.md)) |
