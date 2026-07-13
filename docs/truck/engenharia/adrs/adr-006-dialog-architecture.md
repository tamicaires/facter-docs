---
title: "ADR-006: Evolucao do Planejamento de Manutencao"
sidebar_position: 6
tags: [adr, manutencao, planejamento, integracao, telemetria]
---

# ADR-006: Evolucao do Planejamento de Manutencao

**Status:** Aprovado (Janeiro 2025)

---

## Contexto

O sistema de planejamento de manutencao precisava evoluir para nivel enterprise, incluindo:

- Integracao com telemetria (Sascar, Autotrac, Cobli)
- Integracao bidirecional com SAP PM
- Triggers multiplos (km, horas, tempo)
- Dashboard de saude da frota
- Alertas e notificacoes proativas

---

## Decisao

Implementar em **5 sprints** com arquitetura de integracoes baseada em **Provider Pattern**.

---

## Decisoes Arquiteturais

7 decisoes chave tomadas nesta ADR:

| # | Decisao | Justificativa |
|---|---------|---------------|
| 1 | Equipment Counters como entidades separadas | Historico de leituras, multiplas fontes |
| 2 | External ID fields em todas as entidades | Mapeamento bidirecional com sistemas externos |
| 3 | Notificacoes separadas de ordens | Alerta != OS. Permite triagem antes de criar OS |
| 4 | Provider Pattern para integracoes | Trocar provedor sem alterar logica de negocio |
| 5 | Sync estrategico por provedor | Diferentes provedores tem diferentes APIs e limites |
| 6 | Sem custos adicionais para cliente | Usa assinaturas existentes de telemetria/SAP |
| 7 | Configuracao por empresa | Cada tenant configura seus provedores |

---

## Sprints

| Sprint | Nome | Tasks | Dependencia | Entregas |
|--------|------|-------|-------------|----------|
| **A** | Foundation | 12 | - | Equipment counters, provider base, config |
| **B** | Telematics | 10 | A | Sascar, Autotrac, Cobli sync |
| **C** | Maintenance Evolution | 12 | B | Multi-triggers, dashboard, alertas |
| **D** | SAP Integration | 10 | C | Sync bidirecional SAP PM |
| **E** | Advanced Features | 8 | D | TCO, garantias, KPIs |

**Total: 52 tasks**

### Dependencias entre Sprints

```
A ──> B ──> C ──> D ──> E
```

Cada sprint depende da anterior. Sprint A estabelece a fundacao (counters, providers) que as demais utilizam.

---

## Provider Pattern

```
┌─────────────────────────────────────────────────┐
│              TelematicsProvider (abstract)        │
│  fetchVehicles()                                 │
│  fetchCounterReadings()                          │
│  fetchMaintenanceAlerts()                        │
└──────────┬──────────┬──────────┬────────────────┘
           │          │          │
           ▼          ▼          ▼
     ┌──────────┐┌──────────┐┌──────────┐
     │ Sascar   ││ Autotrac ││  Cobli   │
     │ Provider ││ Provider ││ Provider │
     └──────────┘└──────────┘└──────────┘
```

Cada provedor implementa a mesma interface. A logica de negocio nao sabe qual provedor esta sendo usado. Trocar de Sascar para Cobli requer apenas mudar a configuracao da empresa.

---

## Integracao SAP PM

Sync bidirecional com SAP Plant Maintenance:

| Direcao | Dados | API |
|---------|-------|-----|
| SAP -> Facter | Equipamentos, leituras de contadores | `API_EQUIPMENT`, `API_MEASURINGPOINT` |
| Facter -> SAP | Notificacoes de manutencao | `API_MAINTENANCENOTIFICATION` |
| SAP -> Facter | Alertas de manutencao | `API_MAINTENANCENOTIFICATION` |

Implementado com base na documentacao oficial do SAP Business Accelerator Hub.

---

## UX Vision

Dashboard de saude da frota com:

- **Health Score** (0-100) por veiculo/frota
- **Alertas** por nivel (saudavel, atencao, critico, vencido)
- **KPIs**: MTTR, MTBF, disponibilidade, custo por km
- **Triggers visuais**: Barras de progresso mostrando proximidade do proximo servico

---

## Consequencias

**Positivas:**
- Sistema pronto para integracoes enterprise
- Manutencao preventiva baseada em dados reais
- Arquitetura extensivel (novos provedores sem refatoracao)
- Sem custo adicional para o cliente

**Negativas:**
- Complexidade de sincronizacao com sistemas externos
- Provedores de telemetria ainda nao validados com APIs reais (templates)
- Dependencia de acesso a APIs de terceiros

---

## Referencias

- [Saude da Frota](../../produto/features/fleet-health) -- Feature de dashboard
- [Tech Debt](../../projeto/tech-debt) -- Status dos templates de integracao
