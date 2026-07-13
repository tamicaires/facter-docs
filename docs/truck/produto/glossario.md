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
