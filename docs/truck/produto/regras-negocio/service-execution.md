---
title: Execucao de Servicos
sidebar_position: 1
tags: [regras-negocio, servicos, manutencao, produto]
---

# Regras de Negocio: Execucao de Servicos

Regras que governam a execucao de servicos dentro de uma Ordem de Servico (OS).

---

## Fluxo Geral

```
OS criada -> Servicos adicionados com localizacao -> Funcionarios atribuidos ->
Transicoes de status -> Conclusao automatica quando todos terminam
```

---

## Entidades Envolvidas

| Entidade | Descricao |
|----------|-----------|
| **WorkOrder** | Ordem de servico principal |
| **ServiceAssignment** | Servico atribuido a OS com localizacao no ativo |
| **Service** | Catalogo de servicos (tipo, categoria, tempo estimado) |
| **EmployeeServiceAssignment** | Funcionario alocado ao servico |
| **PartRequest** | Solicitacao de peca vinculada ao servico |

---

## Maquina de Status (Servico)

```
PENDENTE ──> EM_ANDAMENTO ──> CONCLUIDO
   │              │
   │              └──> PAUSADO ──> EM_ANDAMENTO
   │
   └──> CANCELADO
```

| Status | Descricao | Terminal? |
|--------|-----------|-----------|
| `PENDENTE` | Servico criado, aguardando inicio | Nao |
| `EM_ANDAMENTO` | Em execucao por ao menos um funcionario | Nao |
| `PAUSADO` | Temporariamente parado (aguardando peca, etc.) | Nao |
| `CONCLUIDO` | Finalizado | Sim |
| `CANCELADO` | Cancelado | Sim |

### Regras de Transicao

| De | Para | Condicao |
|----|------|----------|
| PENDENTE | EM_ANDAMENTO | Ao menos 1 funcionario atribuido |
| PENDENTE | CANCELADO | Pode cancelar a qualquer momento |
| EM_ANDAMENTO | PAUSADO | Motivo de pausa obrigatorio |
| EM_ANDAMENTO | CONCLUIDO | Todos os funcionarios concluiram |
| PAUSADO | EM_ANDAMENTO | Retomar apos resolucao |
| PAUSADO | CANCELADO | Pode cancelar estando pausado |

---

## Tipos de Localizacao

Cada servico tem um `ServiceLocationType` que define quais campos de localizacao sao obrigatorios:

| Tipo | Campos obrigatorios | Exemplo |
|------|---------------------|---------|
| `NONE` | Nenhum | Lavagem geral |
| `ASSET_ONLY` | Asset (veiculo/carreta) | Inspecao geral do ativo |
| `SIDE` | Asset + lado (E/D) | Reparo lateral |
| `DIRECTIONAL` | Asset + direcao (frente/traseira) | Reparo frontal |
| `AXLE` | Asset + eixo + lado | Troca de mola |
| `WHEEL` | Asset + eixo + roda | Troca de pneu |
| `STRUCTURAL` | Asset + posicao estrutural | Solda em barrote especifico |

### Regra de Unicidade

Nao podem existir dois servicos com a mesma combinacao de localizacao na mesma OS. Exemplo: nao e possivel ter dois "Troca de pneu" no mesmo eixo/roda.

---

## Atribuicao de Funcionarios

- Um servico pode ter **multiplos funcionarios** atribuidos
- Cada funcionario tem seu **proprio status** (independente do servico)
- Status do funcionario: PENDENTE, EM_ANDAMENTO, CONCLUIDO, CANCELADO

### Coordenacao Automatica (Regra Critica)

Quando **todos** os funcionarios de um servico concluem, o servico transiciona automaticamente para CONCLUIDO.

```
ServiceAssignment
├── Employee A: CONCLUIDO
├── Employee B: CONCLUIDO    -> ServiceAssignment: CONCLUIDO (automatico)
└── Employee C: CONCLUIDO
```

Se um funcionario e cancelado, ele e ignorado na contagem.

---

## Pre-condicoes para Criar Servico

1. OS deve existir e pertencer a mesma empresa
2. Servico do catalogo deve estar ativo
3. Se `locationType != NONE`, o asset deve estar vinculado a OS
4. Combinacao de localizacao deve ser unica na OS
5. Se `locationType == WHEEL`, o eixo tambem deve ser informado

---

## Solicitacao de Pecas (PartRequest)

- Pecas sao vinculadas ao **ServiceAssignment** (nao ao servico generico)
- A localizacao da peca e **herdada** do servico (SSOT)
- Nao se duplica a localizacao na PartRequest

### Status de solicitacao

| Status | Descricao |
|--------|-----------|
| `PENDING` | Aguardando aprovacao |
| `APPROVED` | Aprovada |
| `REJECTED` | Rejeitada (motivo obrigatorio) |
| `DELIVERED` | Peca entregue |

---

## Servico Especial: Consumiveis

O servico "Consumiveis Diversos" e um servico de sistema que:

- Nao pode ser deletado
- Nao pode ser editado
- Aceita solicitacoes de pecas sem localizacao no ativo
- Existe por padrao em todas as empresas

---

## Motivos de Pausa

| Motivo | Descricao |
|--------|-----------|
| `WAITING_PART` | Aguardando peca chegar |
| `WAITING_APPROVAL` | Aguardando aprovacao do gestor |
| `WAITING_EQUIPMENT` | Aguardando ferramenta/equipamento |
| `SHIFT_END` | Fim do turno |
| `LUNCH_BREAK` | Intervalo de almoco |
| `PRIORITY_CHANGE` | Servico mais urgente entrou |
| `OTHER` | Outro motivo (descricao obrigatoria) |

---

## Auditoria e Rastreabilidade

Cada transicao de status registra:

- Quem fez a transicao (userId)
- Quando (timestamp)
- De qual status para qual status
- Motivo (quando aplicavel)

---

## Metricas de Tempo

| Metrica | Calculo |
|---------|---------|
| Tempo em fila | `maintenanceStartTime - queueEntryTime` |
| Tempo de manutencao | `maintenanceEndTime - maintenanceStartTime` |
| Tempo aguardando pecas | `partsWaitEndTime - partsWaitStartTime` |
| Tempo total | `maintenanceEndTime - queueEntryTime` |

---

## Constraints de Integridade

- **Multi-tenant**: Tudo filtrado por `companyId`
- **Relacoes obrigatorias**: ServiceAssignment sempre vinculado a WorkOrder e Service
- **RBAC**: Permissoes por role (gestor pode aprovar pecas, borracheiro pode executar servico)

---

## Gaps Identificados (Perguntas para Produto)

1. Deve existir limite maximo de funcionarios por servico?
2. Servico pausado pode receber novos funcionarios?
3. Como tratar conflito quando dois funcionarios pausam/concluem simultaneamente?
4. Cancelar servico deve cancelar PartRequests pendentes automaticamente?
5. Deve ser possivel reabrir um servico concluido?
6. Servico sem funcionario pode ser iniciado?
7. Qual o comportamento quando a OS e cancelada com servicos em andamento?
8. PartRequest rejeitada pode ser reenviada?

---

## Referencias

- [Work Order](../../engenharia/modulos/work-order) -- Modulo tecnico de OS
- [Glossario](../glossario) -- Termos do dominio
