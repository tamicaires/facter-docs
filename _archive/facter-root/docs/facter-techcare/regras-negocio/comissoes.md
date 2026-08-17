# Comissões

> **Sistema de cálculo e gestão de comissões de técnicos.**

---

## Conceito

O módulo de comissões permite:
- Calcular comissão sobre serviços realizados
- Diferentes regras por tipo de serviço
- Acompanhamento de valores a receber
- Relatórios de produtividade

---

## Modelos de Comissão

| Modelo | Descrição | Uso |
|--------|-----------|-----|
| **Percentual Fixo** | X% sobre valor do serviço | Mais comum |
| **Percentual Variável** | % varia por tipo de serviço | Incentivo específico |
| **Valor Fixo** | R$ fixo por OS concluída | Simplicidade |
| **Escalonado** | % aumenta conforme volume | Incentivo produtividade |
| **Misto** | Fixo + percentual | Garantia + incentivo |

---

## Estrutura

```prisma
model TechnicianCommission {
  id              String          @id @default(uuid())
  companyId       String
  company         Company         @relation(fields: [companyId], references: [id])

  technicianId    String
  technician      User            @relation(fields: [technicianId], references: [id])

  // Configuração
  model           CommissionModel @default(PERCENTAGE)
  basePercentage  Decimal?        @db.Decimal(5, 2)  // Ex: 30.00 = 30%
  fixedAmount     Decimal?        @db.Decimal(10, 2) // Valor fixo por OS

  // Regras específicas por tipo
  rules           CommissionRule[]

  // Configurações
  includesParts   Boolean         @default(false)  // Comissão sobre peças?
  minOrderValue   Decimal?        @db.Decimal(10, 2) // Valor mínimo para comissão

  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  @@unique([companyId, technicianId])
}

model CommissionRule {
  id              String              @id @default(uuid())
  commissionId    String
  commission      TechnicianCommission @relation(fields: [commissionId], references: [id])

  // Tipo de regra
  type            CommissionRuleType

  // Critério
  serviceType     String?             // Tipo de serviço específico
  minValue        Decimal?            @db.Decimal(10, 2) // Valor mínimo (escalonado)
  maxValue        Decimal?            @db.Decimal(10, 2) // Valor máximo (escalonado)

  // Valor da comissão para esta regra
  percentage      Decimal?            @db.Decimal(5, 2)
  fixedAmount     Decimal?            @db.Decimal(10, 2)

  // Prioridade (maior = aplicada primeiro)
  priority        Int                 @default(0)
}

enum CommissionModel {
  PERCENTAGE      // Percentual sobre valor
  FIXED           // Valor fixo por OS
  TIERED          // Escalonado por volume
  MIXED           // Fixo + percentual
}

enum CommissionRuleType {
  SERVICE_TYPE    // Por tipo de serviço
  VALUE_RANGE     // Por faixa de valor
  PRIORITY        // Por prioridade da OS
  EQUIPMENT_TYPE  // Por tipo de equipamento
}

// Registro de comissão calculada
model CommissionEntry {
  id              String          @id @default(uuid())
  companyId       String
  company         Company         @relation(fields: [companyId], references: [id])

  technicianId    String
  technician      User            @relation(fields: [technicianId], references: [id])

  // Referência
  serviceOrderId  String
  serviceOrder    ServiceOrder    @relation(fields: [serviceOrderId], references: [id])
  paymentId       String?
  payment         Payment?        @relation(fields: [paymentId], references: [id])

  // Valores
  orderValue      Decimal         @db.Decimal(10, 2) // Valor da OS
  laborValue      Decimal         @db.Decimal(10, 2) // Valor só de serviço
  commissionBase  Decimal         @db.Decimal(10, 2) // Base de cálculo
  commissionRate  Decimal         @db.Decimal(5, 2)  // % aplicado
  commissionValue Decimal         @db.Decimal(10, 2) // Valor da comissão

  // Status
  status          CommissionStatus @default(PENDING)

  // Pagamento ao técnico
  paidAt          DateTime?
  paidById        String?
  paymentMethod   String?
  paymentNotes    String?

  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  @@index([companyId, technicianId, status])
  @@index([companyId, createdAt])
}

enum CommissionStatus {
  PENDING         // Aguardando pagamento da OS
  AVAILABLE       // Disponível para saque
  PROCESSING      // Em processamento
  PAID            // Pago ao técnico
  CANCELLED       // Cancelado (OS cancelada/estorno)
}
```

---

## Cálculo de Comissão

### Fluxo

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    PAGAMENTO DA OS CONFIRMADO                           │
└────────┬────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    IDENTIFICAR TÉCNICO(S) DA OS                         │
├─────────────────────────────────────────────────────────────────────────┤
│ • Técnico principal (assignedTo)                                        │
│ • Técnicos auxiliares (se houver)                                       │
└────────┬────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    BUSCAR CONFIGURAÇÃO DE COMISSÃO                      │
├─────────────────────────────────────────────────────────────────────────┤
│ • Modelo (%, fixo, escalonado)                                          │
│ • Regras específicas                                                    │
│ • Inclui peças?                                                         │
└────────┬────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    CALCULAR BASE DE COMISSÃO                            │
├─────────────────────────────────────────────────────────────────────────┤
│ Se includesParts:                                                       │
│   base = valorTotal                                                     │
│ Senão:                                                                  │
│   base = valorServicos (sem peças)                                      │
└────────┬────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    APLICAR REGRAS                                       │
├─────────────────────────────────────────────────────────────────────────┤
│ • Verificar regras por tipo de serviço                                  │
│ • Verificar faixas de valor (escalonado)                                │
│ • Aplicar % ou valor fixo                                               │
└────────┬────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    CRIAR REGISTRO DE COMISSÃO                           │
├─────────────────────────────────────────────────────────────────────────┤
│ • Status: AVAILABLE                                                     │
│ • Disponível para visualização/saque                                    │
└─────────────────────────────────────────────────────────────────────────┘
```

### Implementação

```typescript
// RN-COM-001: Calcular comissão de uma OS
interface CalculateCommissionResult {
  technicianId: string;
  orderValue: number;
  laborValue: number;
  commissionBase: number;
  commissionRate: number;
  commissionValue: number;
  appliedRules: string[];
}

async function calculateCommission(
  serviceOrderId: string
): Promise<CalculateCommissionResult | null> {
  const serviceOrder = await getServiceOrder(serviceOrderId, {
    include: {
      quote: { include: { items: true } },
      payments: true,
    },
  });

  // Verificar se OS está paga
  const totalPaid = serviceOrder.payments
    .filter(p => p.status === 'PAID')
    .reduce((sum, p) => sum + p.amount, 0);

  if (totalPaid < serviceOrder.total) {
    return null; // Não gera comissão se não está pago
  }

  // Identificar técnico
  const technicianId = serviceOrder.assignedToId;
  if (!technicianId) {
    return null; // Sem técnico atribuído
  }

  // Buscar configuração de comissão
  const commissionConfig = await getCommissionConfig(
    serviceOrder.companyId,
    technicianId
  );

  if (!commissionConfig) {
    return null; // Técnico sem comissão configurada
  }

  // Calcular valores
  const laborValue = serviceOrder.quote.items
    .filter(item => item.type === 'SERVICE')
    .reduce((sum, item) => sum + item.total, 0);

  const orderValue = serviceOrder.total;
  const commissionBase = commissionConfig.includesParts ? orderValue : laborValue;

  // Verificar valor mínimo
  if (commissionConfig.minOrderValue && orderValue < commissionConfig.minOrderValue) {
    return null;
  }

  // Calcular comissão
  const { rate, value, appliedRules } = applyCommissionRules(
    commissionConfig,
    serviceOrder,
    commissionBase
  );

  return {
    technicianId,
    orderValue,
    laborValue,
    commissionBase,
    commissionRate: rate,
    commissionValue: value,
    appliedRules,
  };
}

function applyCommissionRules(
  config: TechnicianCommission,
  serviceOrder: ServiceOrder,
  base: number
): { rate: number; value: number; appliedRules: string[] } {
  const appliedRules: string[] = [];

  // Ordenar regras por prioridade
  const rules = [...config.rules].sort((a, b) => b.priority - a.priority);

  // Verificar regras específicas
  for (const rule of rules) {
    const matches = checkRuleMatch(rule, serviceOrder);
    if (matches) {
      appliedRules.push(`${rule.type}: ${rule.percentage || rule.fixedAmount}`);

      if (rule.percentage) {
        return {
          rate: rule.percentage,
          value: base * (rule.percentage / 100),
          appliedRules,
        };
      } else if (rule.fixedAmount) {
        return {
          rate: 0,
          value: rule.fixedAmount,
          appliedRules,
        };
      }
    }
  }

  // Usar configuração padrão
  appliedRules.push('Padrão');

  switch (config.model) {
    case 'PERCENTAGE':
      return {
        rate: config.basePercentage,
        value: base * (config.basePercentage / 100),
        appliedRules,
      };

    case 'FIXED':
      return {
        rate: 0,
        value: config.fixedAmount,
        appliedRules,
      };

    case 'MIXED':
      return {
        rate: config.basePercentage,
        value: config.fixedAmount + (base * (config.basePercentage / 100)),
        appliedRules,
      };

    default:
      return { rate: 0, value: 0, appliedRules };
  }
}

function checkRuleMatch(rule: CommissionRule, serviceOrder: ServiceOrder): boolean {
  switch (rule.type) {
    case 'SERVICE_TYPE':
      return serviceOrder.serviceType === rule.serviceType;

    case 'VALUE_RANGE':
      const value = serviceOrder.total;
      return value >= (rule.minValue || 0) && value <= (rule.maxValue || Infinity);

    case 'PRIORITY':
      return serviceOrder.priority === rule.serviceType;

    case 'EQUIPMENT_TYPE':
      return serviceOrder.equipment.type === rule.serviceType;

    default:
      return false;
  }
}
```

### Criar Entrada de Comissão

```typescript
// RN-COM-010: Registrar comissão quando OS é paga
async function createCommissionEntry(
  serviceOrderId: string,
  paymentId: string
): Promise<CommissionEntry | null> {
  const result = await calculateCommission(serviceOrderId);

  if (!result) {
    return null;
  }

  const serviceOrder = await getServiceOrder(serviceOrderId);

  return prisma.commissionEntry.create({
    data: {
      companyId: serviceOrder.companyId,
      technicianId: result.technicianId,
      serviceOrderId,
      paymentId,
      orderValue: result.orderValue,
      laborValue: result.laborValue,
      commissionBase: result.commissionBase,
      commissionRate: result.commissionRate,
      commissionValue: result.commissionValue,
      status: 'AVAILABLE',
    },
  });
}

// Listener de pagamento
onPaymentConfirmed(async (payment) => {
  await createCommissionEntry(payment.serviceOrderId, payment.id);
});
```

---

## Comissão Escalonada

```typescript
// RN-COM-020: Configuração de comissão escalonada (por volume)
const TIERED_COMMISSION_EXAMPLE = {
  model: 'TIERED',
  rules: [
    // Até R$ 5.000/mês: 20%
    { type: 'VALUE_RANGE', minValue: 0, maxValue: 5000, percentage: 20 },
    // R$ 5.001 a R$ 10.000: 25%
    { type: 'VALUE_RANGE', minValue: 5001, maxValue: 10000, percentage: 25 },
    // Acima de R$ 10.000: 30%
    { type: 'VALUE_RANGE', minValue: 10001, maxValue: null, percentage: 30 },
  ],
};

// Calcular comissão escalonada mensal
async function calculateTieredCommission(
  technicianId: string,
  month: Date
): Promise<TieredCommissionResult> {
  const startOfMonth = startOfMonth(month);
  const endOfMonth = endOfMonth(month);

  // Buscar todas as OS do mês
  const entries = await prisma.commissionEntry.findMany({
    where: {
      technicianId,
      createdAt: { gte: startOfMonth, lte: endOfMonth },
      status: { in: ['AVAILABLE', 'PAID'] },
    },
  });

  const totalLabor = entries.reduce((sum, e) => sum + e.laborValue, 0);

  // Determinar faixa
  const config = await getCommissionConfig(technicianId);
  const applicableRule = config.rules
    .filter(r => r.type === 'VALUE_RANGE')
    .find(r =>
      totalLabor >= (r.minValue || 0) &&
      totalLabor <= (r.maxValue || Infinity)
    );

  const rate = applicableRule?.percentage || config.basePercentage;

  return {
    totalLabor,
    rate,
    commission: totalLabor * (rate / 100),
    tier: applicableRule ? `R$ ${applicableRule.minValue} - ${applicableRule.maxValue || '∞'}` : 'Padrão',
  };
}
```

---

## Interface de Comissões

### Dashboard do Técnico

```tsx
function TechnicianCommissionDashboard() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<Date>(new Date());

  const { data: summary } = useCommissionSummary(user.id, period);
  const { data: entries } = useCommissionEntries(user.id, period);

  return (
    <div className="space-y-6">
      {/* Cards de resumo */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(summary?.available)}
            </div>
            <p className="text-sm text-muted-foreground">Disponível</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {formatCurrency(summary?.pending)}
            </div>
            <p className="text-sm text-muted-foreground">Pendente</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {formatCurrency(summary?.paidThisMonth)}
            </div>
            <p className="text-sm text-muted-foreground">Pago este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {summary?.ordersCount}
            </div>
            <p className="text-sm text-muted-foreground">OS concluídas</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico mensal */}
      <Card>
        <CardHeader>
          <CardTitle>Comissões por Mês</CardTitle>
        </CardHeader>
        <CardContent>
          <CommissionChart data={summary?.monthlyData} />
        </CardContent>
      </Card>

      {/* Lista de comissões */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhamento</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={[
              { header: 'OS', accessor: 'serviceOrder.number' },
              { header: 'Cliente', accessor: 'serviceOrder.customer.name' },
              { header: 'Valor OS', accessor: 'orderValue', cell: CurrencyCell },
              { header: 'Base', accessor: 'commissionBase', cell: CurrencyCell },
              { header: '%', accessor: 'commissionRate', cell: PercentCell },
              { header: 'Comissão', accessor: 'commissionValue', cell: CurrencyCell },
              { header: 'Status', accessor: 'status', cell: StatusBadge },
            ]}
            data={entries}
          />
        </CardContent>
      </Card>
    </div>
  );
}
```

### Gestão (Gerente/Admin)

```tsx
function CommissionManagement() {
  const [selectedTechnician, setSelectedTechnician] = useState<string | null>(null);
  const [period, setPeriod] = useState<DateRange>({ from: startOfMonth(new Date()), to: new Date() });

  const { data: technicians } = useTechnicians();
  const { data: summary } = useAllCommissionsSummary(period);
  const markAsPaid = useMarkCommissionPaidMutation();

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex gap-4">
        <Select value={selectedTechnician} onValueChange={setSelectedTechnician}>
          <SelectTrigger className="w-60">
            <SelectValue placeholder="Todos os técnicos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            {technicians?.map((tech) => (
              <SelectItem key={tech.id} value={tech.id}>{tech.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DateRangePicker value={period} onChange={setPeriod} />
      </div>

      {/* Resumo por técnico */}
      <Card>
        <CardHeader>
          <CardTitle>Comissões por Técnico</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={[
              {
                header: 'Técnico',
                accessor: 'technician.name',
                cell: ({ row }) => (
                  <div className="flex items-center gap-2">
                    <Avatar src={row.technician.avatar} size="sm" />
                    <span>{row.technician.name}</span>
                  </div>
                ),
              },
              { header: 'OS Realizadas', accessor: 'ordersCount' },
              { header: 'Valor Total', accessor: 'totalValue', cell: CurrencyCell },
              { header: 'Comissão', accessor: 'totalCommission', cell: CurrencyCell },
              { header: 'Disponível', accessor: 'available', cell: CurrencyCell },
              { header: 'Pago', accessor: 'paid', cell: CurrencyCell },
              {
                header: 'Ações',
                cell: ({ row }) => (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => viewDetails(row.technician.id)}
                    >
                      Detalhes
                    </Button>
                    {row.available > 0 && (
                      <Button
                        size="sm"
                        onClick={() => openPaymentModal(row.technician.id, row.available)}
                      >
                        Pagar
                      </Button>
                    )}
                  </div>
                ),
              },
            ]}
            data={summary}
          />
        </CardContent>
      </Card>
    </div>
  );
}
```

### Configuração de Comissão

```tsx
function CommissionConfigForm({ technicianId }: { technicianId: string }) {
  const { data: config } = useCommissionConfig(technicianId);
  const saveConfig = useSaveCommissionConfigMutation();

  const form = useForm({
    defaultValues: config || {
      model: 'PERCENTAGE',
      basePercentage: 30,
      includesParts: false,
      rules: [],
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(saveConfig.mutate)} className="space-y-6">
        {/* Modelo de comissão */}
        <FormField
          control={form.control}
          name="model"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Modelo de Comissão</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENTAGE">Percentual Fixo</SelectItem>
                  <SelectItem value="FIXED">Valor Fixo por OS</SelectItem>
                  <SelectItem value="TIERED">Escalonado por Volume</SelectItem>
                  <SelectItem value="MIXED">Misto (Fixo + %)</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        {/* Campos condicionais por modelo */}
        {['PERCENTAGE', 'MIXED'].includes(form.watch('model')) && (
          <FormField
            control={form.control}
            name="basePercentage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Percentual Base (%)</FormLabel>
                <Input type="number" step="0.5" {...field} />
              </FormItem>
            )}
          />
        )}

        {['FIXED', 'MIXED'].includes(form.watch('model')) && (
          <FormField
            control={form.control}
            name="fixedAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor Fixo (R$)</FormLabel>
                <Input type="number" step="0.01" {...field} />
              </FormItem>
            )}
          />
        )}

        {/* Incluir peças */}
        <FormField
          control={form.control}
          name="includesParts"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2">
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <FormLabel>Incluir valor de peças no cálculo</FormLabel>
            </FormItem>
          )}
        />

        {/* Regras específicas */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <FormLabel>Regras Específicas</FormLabel>
            <Button type="button" size="sm" variant="outline" onClick={addRule}>
              <Plus className="h-4 w-4 mr-1" /> Adicionar Regra
            </Button>
          </div>

          {form.watch('rules').map((rule, index) => (
            <CommissionRuleForm
              key={index}
              index={index}
              control={form.control}
              onRemove={() => removeRule(index)}
            />
          ))}
        </div>

        <Button type="submit" disabled={saveConfig.isPending}>
          Salvar Configuração
        </Button>
      </form>
    </Form>
  );
}
```

---

## Pagamento de Comissões

```typescript
// RN-COM-030: Registrar pagamento de comissão
interface PayCommissionDto {
  technicianId: string;
  entryIds: string[];  // IDs das comissões a pagar
  method: string;      // PIX, TRANSFER, CASH
  notes?: string;
}

async function payCommissions(
  dto: PayCommissionDto,
  paidById: string
): Promise<void> {
  // Validar que todas as entries são do técnico e estão disponíveis
  const entries = await prisma.commissionEntry.findMany({
    where: {
      id: { in: dto.entryIds },
      technicianId: dto.technicianId,
      status: 'AVAILABLE',
    },
  });

  if (entries.length !== dto.entryIds.length) {
    throw new Error('Algumas comissões não estão disponíveis para pagamento');
  }

  const totalValue = entries.reduce((sum, e) => sum + e.commissionValue, 0);

  // Atualizar status
  await prisma.commissionEntry.updateMany({
    where: { id: { in: dto.entryIds } },
    data: {
      status: 'PAID',
      paidAt: new Date(),
      paidById,
      paymentMethod: dto.method,
      paymentNotes: dto.notes,
    },
  });

  // Registrar no financeiro (saída)
  await createFinancialEntry({
    type: 'EXPENSE',
    category: 'COMMISSION',
    description: `Comissão - ${entries.length} OS`,
    amount: totalValue,
    relatedTo: dto.technicianId,
  });

  // Notificar técnico
  await notifyTechnician(dto.technicianId, 'COMMISSION_PAID', {
    amount: totalValue,
    count: entries.length,
  });
}
```

---

## Permissões

| Ação | Atendente | Técnico | Gerente | Admin |
|------|-----------|---------|---------|-------|
| Ver próprias comissões | ❌ | ✅ | ✅ | ✅ |
| Ver todas comissões | ❌ | ❌ | ✅ | ✅ |
| Configurar comissões | ❌ | ❌ | ❌ | ✅ |
| Pagar comissões | ❌ | ❌ | ✅ | ✅ |
| Relatórios | ❌ | ❌ | ✅ | ✅ |

---

**Voltar para** [Regras de Negócio](./README.md)
