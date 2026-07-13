---
title: Fleet
sidebar_position: 3
tags: [fleet, modulos, ativos, backend]
---

# Fleet (Frota)

Modulo de gestao de ativos do Facter Truck. Gerencia frotas, veiculos, carretas, eixos e posicoes de roda.

---

## Modelo de Dados

```
                              ┌──────────┐
                              │  Company │
                              └────┬─────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         │                         │                         │
         ▼                         ▼                         ▼
    ┌─────────┐              ┌──────────┐              ┌──────────┐
    │  Fleet  │              │ Vehicle  │              │ Trailer  │
    └─────────┘              └──────────┘              └────┬─────┘
                                                           │
                                                           ▼
                                                      ┌─────────┐
                                                      │  Axle   │
                                                      └────┬────┘
                                                           │
                                                           ▼
                                                   ┌──────────────┐
                                                   │WheelPosition │
                                                   └──────────────┘
```

---

## Entidades

### Fleet

Agrupamento logico de veiculos e carretas pertencentes a uma empresa.

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `id` | string (cuid) | Identificador |
| `companyId` | string | Tenant |
| `name` | string | Nome da frota |
| `description` | string? | Descricao |
| `isActive` | boolean | Ativo/inativo |

### Vehicle

Veiculos motorizados (caminhoes, cavalos mecanicos).

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `id` | string (cuid) | Identificador |
| `companyId` | string | Tenant |
| `fleetId` | string? | Frota (opcional) |
| `plate` | string | Placa (unica por empresa) |
| `model` | string? | Modelo |
| `brand` | string? | Marca |
| `year` | int? | Ano |
| `chassisNumber` | string? | Chassi |
| `currentKm` | int | Quilometragem atual |
| `currentHours` | int | Horimetro atual |
| `isActive` | boolean | Ativo/inativo |

### Trailer (Carreta)

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `id` | string (cuid) | Identificador |
| `companyId` | string | Tenant |
| `fleetId` | string? | Frota |
| `plate` | string | Placa (unica por empresa) |
| `type` | TrailerType | Tipo de carreta |
| `axleCount` | int | Numero de eixos (default: 3) |

### Axle (Eixo)

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `id` | string (cuid) | Identificador |
| `trailerId` | string | Carreta |
| `position` | int | Posicao (1, 2, 3...) |
| `type` | AxleType | Tipo de eixo |

### WheelPosition (Posicao de Roda)

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `id` | string (cuid) | Identificador |
| `axleId` | string | Eixo |
| `side` | WheelSide | Lado (LEFT, RIGHT) |
| `position` | WheelPos | Posicao (INNER, OUTER) |
| `tireId` | string? | Pneu montado (opcional) |

---

## Enums

### TrailerType

| Valor | Descricao |
|-------|-----------|
| `BITREM` | Combinacao com 2 semirreboques |
| `RODOTREM` | Combinacao com 2+ reboques |
| `CARRETA` | Semirreboque simples |
| `DOLLY` | Eixo auxiliar para acoplar reboques |

### AxleType

| Valor | Descricao |
|-------|-----------|
| `SIMPLES` | Eixo simples |
| `DUPLO` | Eixo duplo |
| `TANDEM` | Eixo tandem |

---

## Multi-Tenancy

Todos os queries sao filtrados por `companyId`. Constraints de unicidade:

- `@@unique([companyId, plate])` em Vehicle e Trailer
- Indices compostos em `[companyId]` para performance

---

## Modulos do Dominio

| Modulo | Descricao | Status |
|--------|-----------|--------|
| fleet | Frotas de veiculos | Documentado |
| vehicle | Veiculos (caminhoes) | Operacional |
| trailer | Carretas | Operacional |
| axle | Eixos de carretas | Operacional |
| wheel-position | Posicoes de rodas | Operacional |
| carrier | Transportadoras | Operacional |

---

## Relacionamentos com Outros Modulos

| Modulo | Relacao |
|--------|---------|
| **WorkOrder** | OS vinculada a Vehicle ou Trailer |
| **MaintenancePlan** | Planos preventivos aplicados a veiculos |
| **Tire** | Pneus montados em WheelPositions |
| **Checklist** | Checklists executados em veiculos/carretas |
| **Counter** | Contadores de km/horas dos veiculos |

---

## Indices e Performance

```
Vehicle:
  @@index([companyId])
  @@index([fleetId])
  @@unique([companyId, plate])

Trailer:
  @@index([companyId])
  @@unique([companyId, plate])

Axle:
  @@index([trailerId])
  @@unique([trailerId, position])

WheelPosition:
  @@index([axleId])
  @@unique([axleId, side, position])
```

---

## Referencias

- [Visao Geral da Arquitetura](../arquitetura/visao-geral) -- Diagrama de modulos
- [Work Order](./work-order) -- OS vinculadas a ativos
- [Glossario](../../produto/glossario) -- Termos do dominio de frota
