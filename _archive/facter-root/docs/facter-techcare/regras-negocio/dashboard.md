# Dashboard e Métricas

> **KPIs, métricas e indicadores do sistema TechCare.**

---

## Visão Geral

O dashboard é adaptado ao modo de operação e perfil do usuário.

---

## Dashboard por Perfil

### Admin / Gerente (Modo Empresa)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           DASHBOARD GERENCIAL                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐  │
│  │  📋 15       │ │  🔧 8        │ │  ✅ 12       │ │  💰 R$ 4.520 │  │
│  │  Recebidas   │ │  Em execução │ │  Concluídas  │ │  Faturado    │  │
│  │  (hoje)      │ │  (hoje)      │ │  (hoje)      │ │  (hoje)      │  │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘  │
│                                                                         │
│  ┌────────────────────────────────┐ ┌────────────────────────────────┐ │
│  │ FATURAMENTO MENSAL             │ │ OS POR STATUS                  │ │
│  │ ████████████████ R$ 45.000     │ │ Recebidas    ████████░░ 35     │ │
│  │ Meta: R$ 50.000 (90%)          │ │ Em execução  ████░░░░░░ 18     │ │
│  │                                │ │ Concluídas   ██████████ 42     │ │
│  │ [Gráfico de linha - 30 dias]   │ │ Entregues    ████████░░ 38     │ │
│  └────────────────────────────────┘ └────────────────────────────────┘ │
│                                                                         │
│  ┌────────────────────────────────┐ ┌────────────────────────────────┐ │
│  │ PERFORMANCE DOS TÉCNICOS       │ │ TOP 5 SERVIÇOS                 │ │
│  │                                │ │                                │ │
│  │ Carlos    ██████████ 25 OS     │ │ 1. Troca de tela       42%    │ │
│  │ Ana       ████████░░ 20 OS     │ │ 2. Troca de bateria    23%    │ │
│  │ Pedro     ██████░░░░ 15 OS     │ │ 3. Formatação          15%    │ │
│  │                                │ │ 4. Conector            12%    │ │
│  │ [Ver detalhes]                 │ │ 5. Outros               8%    │ │
│  └────────────────────────────────┘ └────────────────────────────────┘ │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ OS RECENTES                                                      │   │
│  │ OS-202501-00045 | João Silva | iPhone 13 | ⏳ Aguardando Aprov. │   │
│  │ OS-202501-00044 | Maria S.   | Galaxy S21| 🔧 Em execução       │   │
│  │ OS-202501-00043 | Pedro L.   | MacBook   | ✅ Pronto retirada   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Técnico

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           MINHAS ORDENS                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐  │
│  │  📋 5        │ │  🔧 3        │ │  ✅ 8        │ │  ⭐ 4.8      │  │
│  │  Pendentes   │ │  Em execução │ │  Concluídas  │ │  Avaliação   │  │
│  │              │ │              │ │  (mês)       │ │  média       │  │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘  │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ MINHAS OS HOJE                                                   │   │
│  │                                                                  │   │
│  │ 🔴 OS-00045 | iPhone 13 | Tela quebrada | ⏰ SLA: 2h restantes  │   │
│  │ 🟡 OS-00044 | Galaxy S21| Bateria       | ⏰ SLA: 5h restantes  │   │
│  │ 🟢 OS-00043 | Notebook  | Formatação    | ⏰ SLA: 8h restantes  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌────────────────────────────────┐ ┌────────────────────────────────┐ │
│  │ MINHA META                     │ │ COMISSÃO DO MÊS                │ │
│  │ ██████████░░░░ 18/25 OS        │ │                                │ │
│  │ 72% da meta mensal             │ │ R$ 1.250,00                    │ │
│  │                                │ │ (prévia)                       │ │
│  └────────────────────────────────┘ └────────────────────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Atendente

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           ATENDIMENTO                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐  │
│  │  📋 3        │ │  ⏳ 5        │ │  📞 2        │ │  ✅ 4        │  │
│  │  Aguardando  │ │  Orçamentos  │ │  Ligar hoje  │ │  Prontos     │  │
│  │  Triagem     │ │  Pendentes   │ │              │ │  Retirar     │  │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘  │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ AÇÕES PENDENTES                                                  │   │
│  │                                                                  │   │
│  │ 📞 Ligar para João Silva - Orçamento há 2 dias sem resposta     │   │
│  │ 📞 Ligar para Maria S. - Pronto há 3 dias                       │   │
│  │ ⚠️ OS-00040 - Aguardando peça há 5 dias                         │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ EQUIPAMENTOS PRONTOS PARA RETIRADA                               │   │
│  │                                                                  │   │
│  │ OS-00043 | Pedro L. | MacBook    | Pronto há 1 dia | R$ 350    │   │
│  │ OS-00041 | Ana C.   | iPhone 12  | Pronto há 2 dias | R$ 280   │   │
│  │ OS-00038 | José M.  | Galaxy A52 | Pronto há 4 dias | R$ 150   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Técnico Autônomo (Modo Individual)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           MEU RESUMO                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐  │
│  │  📋 3        │ │  💰 R$ 850   │ │  📆 2        │ │  ⚠️ 1        │  │
│  │  Em aberto   │ │  A receber   │ │  Hoje        │ │  Estoque     │  │
│  │              │ │              │ │              │ │  baixo       │  │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘  │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ PARA HOJE                                                        │   │
│  │                                                                  │   │
│  │ ☐ OS-00012 | iPhone 13 | Trocar tela | Cliente vem às 14h       │   │
│  │ ☐ OS-00011 | Galaxy S21| Entregar    | Cliente vem às 16h       │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌────────────────────────────────┐ ┌────────────────────────────────┐ │
│  │ ESTA SEMANA                    │ │ ESTE MÊS                       │ │
│  │                                │ │                                │ │
│  │ OS concluídas: 8               │ │ Faturamento: R$ 3.200          │ │
│  │ Faturamento: R$ 1.850          │ │ OS: 25                         │ │
│  │ Ticket médio: R$ 231           │ │ Ticket médio: R$ 128           │ │
│  └────────────────────────────────┘ └────────────────────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## KPIs Principais

### Operacionais

| KPI | Descrição | Meta Sugerida |
|-----|-----------|---------------|
| Tempo Médio de Diagnóstico | Tempo entre recebimento e orçamento | < 24h |
| Tempo Médio de Execução | Tempo entre aprovação e conclusão | < 3 dias |
| Tempo Médio Total | Tempo entre recebimento e entrega | < 5 dias |
| Taxa de Aprovação | % de orçamentos aprovados | > 80% |
| Taxa de Retrabalho | % de OS com retorno em garantia | < 5% |
| Cumprimento de SLA | % de OS dentro do prazo | > 90% |

### Financeiros

| KPI | Descrição | Meta Sugerida |
|-----|-----------|---------------|
| Faturamento | Total recebido no período | Variável |
| Ticket Médio | Valor médio por OS | > R$ 150 |
| Taxa de Inadimplência | % não pago | < 2% |
| Margem de Lucro | (Receita - Custos) / Receita | > 40% |

### Satisfação

| KPI | Descrição | Meta Sugerida |
|-----|-----------|---------------|
| NPS | Net Promoter Score | > 70 |
| Avaliação Média | Nota média dos clientes | > 4.5 |
| Taxa de Retorno | Clientes que voltam | > 30% |

---

## Cálculos

### Tempo Médio

```typescript
interface TimeMetrics {
  avgDiagnosisTime: number;  // horas
  avgExecutionTime: number;  // horas
  avgTotalTime: number;      // horas
  avgWaitingApproval: number; // horas
}

async function calculateTimeMetrics(
  companyId: string,
  period: Period
): Promise<TimeMetrics> {
  const orders = await getCompletedOrders(companyId, period);

  const diagnosisTimes = orders
    .filter(o => o.diagnosedAt && o.receivedAt)
    .map(o => differenceInHours(o.diagnosedAt, o.receivedAt));

  const executionTimes = orders
    .filter(o => o.completedAt && o.approvedAt)
    .map(o => differenceInHours(o.completedAt, o.approvedAt));

  const totalTimes = orders
    .filter(o => o.deliveredAt && o.receivedAt)
    .map(o => differenceInHours(o.deliveredAt, o.receivedAt));

  return {
    avgDiagnosisTime: average(diagnosisTimes),
    avgExecutionTime: average(executionTimes),
    avgTotalTime: average(totalTimes),
    avgWaitingApproval: calculateAvgWaitingApproval(orders),
  };
}
```

### Taxa de Aprovação

```typescript
async function calculateApprovalRate(
  companyId: string,
  period: Period
): Promise<number> {
  const quotes = await getQuotes(companyId, period);

  const total = quotes.length;
  const approved = quotes.filter(q => q.status === 'APPROVED').length;

  return total > 0 ? (approved / total) * 100 : 0;
}
```

### Performance do Técnico

```typescript
interface TechnicianPerformance {
  technicianId: string;
  name: string;
  metrics: {
    totalOrders: number;
    completedOrders: number;
    avgCompletionTime: number;
    returnRate: number;
    avgRating: number;
    revenue: number;
  };
  rank: number;
}

async function getTechnicianPerformance(
  companyId: string,
  period: Period
): Promise<TechnicianPerformance[]> {
  // Buscar métricas por técnico
  // Ordenar por score composto
  // Retornar ranking
}
```

---

## Alertas e Notificações

### Alertas Automáticos

| Alerta | Condição | Destinatário |
|--------|----------|--------------|
| OS Atrasada | SLA excedido | Técnico + Gerente |
| Estoque Baixo | Quantidade < mínimo | Gerente |
| Orçamento Expirando | D-1 para vencer | Atendente |
| Cliente Aguardando | Pronto há > 3 dias | Atendente |
| Meta em Risco | < 70% faltando < 25% do mês | Gerente |
| Retrabalho Alto | Taxa > 10% | Gerente |

### Configuração de Alertas

```typescript
interface AlertConfig {
  type: AlertType;
  enabled: boolean;
  threshold?: number;
  recipients: string[];  // userIds ou 'role:MANAGER'
  channels: ('SYSTEM' | 'EMAIL' | 'WHATSAPP')[];
}
```

---

## Relatórios

### Tipos de Relatório

| Relatório | Descrição | Frequência |
|-----------|-----------|------------|
| Resumo Diário | OS do dia, faturamento | Diário |
| Performance Semanal | KPIs da semana | Semanal |
| Fechamento Mensal | Completo | Mensal |
| Comissões | Por técnico | Mensal |
| Estoque | Posição e giro | Mensal |
| Garantias | Retornos | Mensal |

### Exportação

```typescript
interface ReportExport {
  format: 'PDF' | 'EXCEL' | 'CSV';
  period: Period;
  sections: string[];  // Quais seções incluir
  schedule?: {
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    recipients: string[];
  };
}
```

---

## Widgets Customizáveis

```typescript
const AVAILABLE_WIDGETS = [
  { id: 'orders_today', name: 'OS Hoje', size: 'sm' },
  { id: 'revenue_today', name: 'Faturamento Hoje', size: 'sm' },
  { id: 'pending_approval', name: 'Aguardando Aprovação', size: 'sm' },
  { id: 'ready_pickup', name: 'Prontos Retirada', size: 'sm' },
  { id: 'revenue_chart', name: 'Gráfico Faturamento', size: 'lg' },
  { id: 'status_chart', name: 'OS por Status', size: 'md' },
  { id: 'technician_ranking', name: 'Ranking Técnicos', size: 'md' },
  { id: 'top_services', name: 'Top Serviços', size: 'md' },
  { id: 'recent_orders', name: 'OS Recentes', size: 'lg' },
  { id: 'pending_actions', name: 'Ações Pendentes', size: 'md' },
  { id: 'low_stock', name: 'Estoque Baixo', size: 'sm' },
];
```

---

**Voltar para** [Regras de Negócio](./README.md)
