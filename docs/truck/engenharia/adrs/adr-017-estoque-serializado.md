---
title: "ADR-017: Estoque serializado (rastreio de unidade)"
sidebar_position: 17
tags: [adr, estoque, rastreabilidade, pneus]
---

# ADR-017: Estoque serializado (rastreio de unidade)

**Status:** Proposto (30/09/2026), fatia 1 (fundação) implementada — aguarda aprovação da arquiteta

## Contexto

Uma peça (`parts`) já nasce com um modo de controle: `tracking` = `quantity` ou `serialized` ([schema de estoque](../schema-v2/estoque.md)). O modo `quantity` (óleo, filtro) é somado no saldo por depósito. O modo `serialized` estava só como flag — não havia onde guardar a **unidade individual**.

Mas há peças que **precisam de identidade e história próprias**: o **pneu** (vidas, recapagem, posição, custo por km — módulo de Pneus), o **eixo** montado, e peças estruturais da carreta florestal como **fueiros** e **barrotes**, que trocam de implemento, desgastam e têm garantia. A arquiteta pediu que isso fosse rastreável "de verdade" — ler a etiqueta/QR e ver onde a unidade está e o que já aconteceu com ela.

O risco de não decidir: cada frente (pneus, eixos) inventaria o próprio jeito de rastrear unidade, e o dado de rastreabilidade (o valor que se vende) ficaria fragmentado.

## Decisão

1. **Um conceito só: `serialized_items`.** Cada unidade física de uma peça `serialized` é uma linha com **identidade** (`code` — serial/etiqueta/QR, único por organização), **estado** (`in_stock`, `in_maintenance`, `retired`), **localização** (hoje `depot_id`) e custo de aquisição. `org_id not null` + **RLS forçado**, como toda tabela de negócio ([ADR-014](./adr-014-multiempresa-banco-compartilhado.md)).
2. **História append-only: `serialized_item_events`.** Cada fato (recebida, manutenção, devolvida, baixada, reetiquetada) é um insert com autor e instante; correção é um novo evento, nunca edição ([invariantes](../invariantes.md)).
3. **O Pneus é a primeira instância**, não um módulo paralelo: um pneu é uma `serialized_item` com a vida/recapagem por cima. Eixo, fueiro e barrote reaproveitam o mesmo alicerce.
4. **Invariantes no banco:** `unique (org_id, code)`; unidade ativa mora num depósito e unidade `retired` não tem depósito e registra o motivo (`check`s); FKs org-safe compostas para `parts` e `depots`; escrita de código race-safe por `on conflict (org_id, code) do nothing`.
5. **Custo é leitura sensível:** `acquisition_cost` só sai da API com `cost.view`, como o custo das movimentações.
6. **Fatiamento.** Fatia 1 (esta): unidade em depósito — registrar, listar (filtros + cursor, plano de consulta testado), ver ficha com histórico; permissões reusadas (`stock.receive` para registrar, `part.view` para ler). Fatia 2: **instalar/mover** a unidade numa posição do veículo (exige o modelo de posição e o `unique (id, org_id)` em `vehicles`) e a **planta clicável** do conjunto ([mockup de rastreabilidade](/telas/truck/rastreabilidade)). Fatia 3: o vertical de Pneus (vidas, recapagem, custo por km) sobre esta base.

## Alternativas consideradas

| Alternativa | Por que não |
| --- | --- |
| Cada módulo (pneus, eixos) com sua tabela de unidade | Fragmenta o rastreio; o valor está no dado unificado (onde está a unidade, história, custo) |
| Guardar unidade como quantidade + observação | Perde a identidade; não responde "onde está o fueiro 0472?" nem o histórico |
| Modelar já a posição no veículo (instalação) na fatia 1 | `vehicles` não tem `unique (id, org_id)` para a FK org-safe, e falta o modelo de posição; vira fatia 2 sem retrabalho de schema |

## Consequências

- Base pronta para o rastreio de unidade em todo o ecossistema (inclui cenários externos: oficina terceira sob concessão, em trânsito, consignada, garantia — a tratar nas próximas fatias).
- A planta 2D interativa do conjunto vira o componente `VehicleSchematic` do design system (SVG, sem 3D) quando a instalação existir.
- Enquanto a posição no veículo não é implementada, a unidade vive só no depósito; o mockup já mostra o destino.
