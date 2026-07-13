---
title: Saude da Frota
sidebar_position: 1
tags: [features, saude-frota, dashboard, produto]
---

# Saude da Frota

Dashboard de visualizacao da saude de manutencao da frota em tempo real.

---

## Problema vs Solucao

| Antes | Depois |
|-------|--------|
| Planilhas manuais para controlar vencimentos | Dashboard automatizado com alertas |
| Nao sabe quando trocar oleo ou filtro | Sistema calcula baseado em km/horas/tempo |
| Quebras inesperadas geram custo alto | Manutencao preventiva reduz quebras |
| Sem visibilidade do estado da frota | Health score por veiculo e por frota |

---

## Conceito: Triggers

Um **trigger** e uma regra que define quando uma manutencao deve ser feita. Pode ser baseado em:

| Tipo | Exemplo | Unidade |
|------|---------|---------|
| Quilometragem | A cada 10.000 km | km |
| Horimetro | A cada 500 horas | horas |
| Tempo | A cada 6 meses | dias |

Cada plano de manutencao pode ter **multiplos triggers**. O sistema verifica todos e alerta quando qualquer um atingir o limite.

---

## Niveis de Alerta

```
Saudavel     [████████████████████░░░░] 80%    Verde
Atencao      [████████████████░░░░░░░░] 65%    Amarelo
Critico      [████████░░░░░░░░░░░░░░░░] 30%    Vermelho
Vencido      [████████████████████████] 100%+  Vermelho escuro
```

| Nivel | Condicao | Acao sugerida |
|-------|----------|---------------|
| Saudavel | Abaixo de 70% do limite | Nenhuma |
| Atencao | Entre 70% e 90% do limite | Planejar manutencao |
| Critico | Acima de 90% do limite | Priorizar manutencao |
| Vencido | Limite ultrapassado | Manutencao imediata |

---

## Exemplo Pratico

**Troca de oleo configurada a cada 10.000 km**

1. Veiculo ABC-1234 fez ultima troca em 50.000 km
2. Veiculo esta com 57.000 km (70% do intervalo)
3. Status: **Atencao** - planejar troca de oleo

```
Troca de Oleo - ABC-1234
Ultimo servico: 50.000 km
Proximo servico: 60.000 km
Atual: 57.000 km
Progresso: [██████████████████░░░░░░] 70% - ATENCAO
```

---

## Dashboard

### Cards de Resumo

| Card | Descricao |
|------|-----------|
| Total de veiculos | Quantidade de veiculos ativos na frota |
| Saudaveis | Veiculos sem alertas |
| Em atencao | Veiculos proximos do limite |
| Criticos/vencidos | Veiculos que precisam de manutencao urgente |

### Health Score (0-100)

Pontuacao calculada com base na media de proximidade de todos os triggers ativos para um veiculo ou frota.

- **90-100**: Frota em otimo estado
- **70-89**: Frota com alguns itens a planejar
- **50-69**: Frota com itens criticos
- **0-49**: Frota com manutencoes vencidas

### Outros Elementos

- **Lista de alertas**: Ordenada por criticidade
- **Distribuicao por status**: Grafico de barras (saudavel/atencao/critico/vencido)
- **KPIs**: Contadores de equipamentos, veiculos, OS abertas

---

## Consolidacao de Multiplos Triggers

Quando um veiculo tem multiplos triggers, o sistema consolida em dois modos:

| Modo | Logica | Exemplo |
|------|--------|---------|
| **Qualquer** (default) | Alerta se QUALQUER trigger atingir o limite | Troca de oleo OU 6 meses |
| **Todos** | Alerta se TODOS os triggers atingirem o limite | Troca de oleo E 6 meses |

O modo "Qualquer" e mais conservador (recomendado para seguranca). O modo "Todos" e mais economico.

---

## Configuracao

1. **Criar template de manutencao**: Definir servicos e triggers (km, horas, tempo)
2. **Aplicar a veiculos**: Vincular template a veiculos da frota
3. **Atualizar contadores**: Via telemetria automatica ou registro manual
4. **Monitorar dashboard**: Acompanhar alertas e planejar manutencoes

---

## Fluxos de Uso

| Quem | Quando | O que |
|------|--------|-------|
| Gestor de frota | Diariamente | Verificar alertas, priorizar manutencoes |
| Diretor | Semanalmente | Avaliar health score, custos, tendencias |
| Mecanico | Ao receber OS | Verificar historico do veiculo |

---

## FAQ

**Como o sistema sabe a quilometragem do veiculo?**
Via integracao com telemetria (Sascar, Autotrac, Cobli) ou registro manual pelo operador.

**Posso ter triggers diferentes para veiculos diferentes?**
Sim. Templates de manutencao podem ser aplicados individualmente a cada veiculo.

**O que acontece quando o trigger vence?**
O veiculo aparece como "vencido" no dashboard. Opcionalmente, o sistema pode criar uma OS automaticamente.

---

## Glossario

| Termo | Descricao |
|-------|-----------|
| **Trigger** | Regra que define quando uma manutencao e necessaria |
| **Template** | Modelo de manutencao preventiva com servicos e triggers |
| **Counter** | Contador de equipamento (km, horas) |
| **Health Score** | Pontuacao de saude (0-100) baseada nos triggers |
| **Threshold** | Limite percentual para mudar de nivel de alerta |

---

## Roadmap

- Notificacoes push (email, SMS)
- Predicao com IA baseada em historico
- Integracao automatica com ERP (SAP)
- Relatorios automaticos periodicos
- App mobile para borracheiros

---

## Referencias

- [ADR-006: Evolucao do Planejamento](../../engenharia/adrs/adr-006-dialog-architecture) -- Decisao arquitetural
- [Glossario](../glossario) -- Termos do dominio
