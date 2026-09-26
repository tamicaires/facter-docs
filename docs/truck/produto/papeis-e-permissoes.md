---
title: "Papéis e permissões"
sidebar_position: 2
tags: [permissoes, papeis, rbac, v2]
---

# Papéis e permissões

:::caution[Em definição]
Os papéis da v2 ainda não foram decididos. Esta página registra os papéis do v1, os problemas encontrados e o modelo da v2. A tabela de "quem pode o quê" é preenchida quando o time decidir os papéis padrão.
:::

## Como funciona na v2

- **Permissão por ação de negócio**, não por CRUD: `work_order.finish`, `part_request.approve`, `service.adjust_time`.
- **Papéis são conjuntos de permissões guardados como dados.** O sistema traz papéis padrão, e cada empresa pode ajustar.
- **Negação por padrão:** o que não foi concedido é proibido.
- **Condição de dono:** o mecânico vê e altera só as ordens designadas a ele; o motorista vê só o que é do veículo dele.
- **Segregação de função:** quem solicita peça ou pneu não aprova o próprio pedido.
- **O frontend não decide:** recebe do servidor o que o usuário pode fazer.

Detalhes técnicos em [padrões de engenharia](../engenharia/padroes/padroes-de-engenharia.md#multiempresa-e-permissões) e nos invariantes PLT-4 e PLT-5.

## Papéis do v1

`ADMIN`, `SUPER_ADMIN`, `MAINTENANCE_MANAGER`, `MAINTENANCE_CONSULTANT`, `PARTS_MANAGER`, `PARTS_CONSULTANT`, `TIRE_CONSULTANT`, `REPORT_MANAGER`, `REPORT_VIEWER`, `GENERAL_VIEWER`, `MECHANIC`, `DRIVER`, `GUEST`.

Problemas do v1 (detalhes na [auditoria](../engenharia/auditoria-2026-09.md#permissões-rbac)): regras de negação nunca funcionam, todo papel lê tudo, os papéis especializados quase não têm regras, e não existe condição de dono.

## Quem pode o quê

| Ação | Papéis padrão |
| --- | --- |
| *A definir com o time* | |
