# Relatórios

> **Sistema de geração e exportação de relatórios.**

---

## Tipos de Relatórios

| Categoria | Relatório | Descrição |
|-----------|-----------|-----------|
| **Operacional** | OS por período | Listagem de ordens de serviço |
| | OS por status | Distribuição por status |
| | OS por técnico | Produtividade dos técnicos |
| | Tempo médio | Análise de SLA |
| **Financeiro** | Faturamento | Receitas do período |
| | Recebimentos | Pagamentos recebidos |
| | Comissões | Comissões dos técnicos |
| | Fluxo de caixa | Entradas e saídas |
| **Estoque** | Movimentação | Entradas e saídas de peças |
| | Posição | Estoque atual |
| | Custo | Valor em estoque |
| **Clientes** | Cadastros | Novos clientes |
| | Ranking | Clientes por faturamento |
| | Retorno | Taxa de retorno |

---

## Estrutura

```typescript
interface ReportConfig {
  id: string;
  name: string;
  description: string;
  category: 'OPERATIONAL' | 'FINANCIAL' | 'INVENTORY' | 'CUSTOMER';

  // Parâmetros disponíveis
  parameters: ReportParameter[];

  // Colunas do relatório
  columns: ReportColumn[];

  // Agrupamentos possíveis
  groupBy?: string[];

  // Ordenação padrão
  defaultSort?: { field: string; direction: 'asc' | 'desc' };

  // Formatos de exportação
  exportFormats: ('xlsx' | 'csv' | 'pdf')[];

  // Permissão necessária
  requiredPermission: string;
}

interface ReportParameter {
  key: string;
  label: string;
  type: 'date' | 'dateRange' | 'select' | 'multiSelect' | 'text';
  required: boolean;
  defaultValue?: any;
  options?: { label: string; value: string }[];
}

interface ReportColumn {
  key: string;
  header: string;
  type: 'string' | 'number' | 'currency' | 'date' | 'percentage';
  width?: number;
  align?: 'left' | 'center' | 'right';
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
}
```

---

## Catálogo de Relatórios

### Relatórios Operacionais

```typescript
const OPERATIONAL_REPORTS: ReportConfig[] = [
  {
    id: 'service-orders-list',
    name: 'Ordens de Serviço',
    description: 'Listagem completa de OS do período',
    category: 'OPERATIONAL',
    parameters: [
      {
        key: 'dateRange',
        label: 'Período',
        type: 'dateRange',
        required: true,
        defaultValue: { from: startOfMonth(new Date()), to: new Date() },
      },
      {
        key: 'status',
        label: 'Status',
        type: 'multiSelect',
        required: false,
        options: SERVICE_ORDER_STATUSES,
      },
      {
        key: 'technician',
        label: 'Técnico',
        type: 'select',
        required: false,
      },
      {
        key: 'priority',
        label: 'Prioridade',
        type: 'select',
        required: false,
        options: PRIORITIES,
      },
    ],
    columns: [
      { key: 'number', header: 'Número', type: 'string' },
      { key: 'createdAt', header: 'Data', type: 'date' },
      { key: 'customer.name', header: 'Cliente', type: 'string' },
      { key: 'equipment.description', header: 'Equipamento', type: 'string' },
      { key: 'status', header: 'Status', type: 'string' },
      { key: 'technician.name', header: 'Técnico', type: 'string' },
      { key: 'total', header: 'Valor', type: 'currency', aggregation: 'sum' },
    ],
    groupBy: ['status', 'technician', 'priority'],
    exportFormats: ['xlsx', 'csv', 'pdf'],
    requiredPermission: 'report:service-orders',
  },

  {
    id: 'technician-productivity',
    name: 'Produtividade por Técnico',
    description: 'Análise de produtividade dos técnicos',
    category: 'OPERATIONAL',
    parameters: [
      { key: 'dateRange', label: 'Período', type: 'dateRange', required: true },
      { key: 'technician', label: 'Técnico', type: 'select', required: false },
    ],
    columns: [
      { key: 'technician.name', header: 'Técnico', type: 'string' },
      { key: 'ordersReceived', header: 'OS Recebidas', type: 'number', aggregation: 'sum' },
      { key: 'ordersCompleted', header: 'OS Concluídas', type: 'number', aggregation: 'sum' },
      { key: 'avgCompletionTime', header: 'Tempo Médio', type: 'string' },
      { key: 'totalRevenue', header: 'Faturamento', type: 'currency', aggregation: 'sum' },
      { key: 'avgTicket', header: 'Ticket Médio', type: 'currency' },
      { key: 'warrantyReturns', header: 'Retornos Garantia', type: 'number', aggregation: 'sum' },
      { key: 'returnRate', header: 'Taxa Retorno', type: 'percentage' },
    ],
    exportFormats: ['xlsx', 'pdf'],
    requiredPermission: 'report:productivity',
  },

  {
    id: 'sla-analysis',
    name: 'Análise de SLA',
    description: 'Tempos de atendimento e cumprimento de SLA',
    category: 'OPERATIONAL',
    parameters: [
      { key: 'dateRange', label: 'Período', type: 'dateRange', required: true },
    ],
    columns: [
      { key: 'status', header: 'Etapa', type: 'string' },
      { key: 'avgTime', header: 'Tempo Médio', type: 'string' },
      { key: 'minTime', header: 'Mínimo', type: 'string' },
      { key: 'maxTime', header: 'Máximo', type: 'string' },
      { key: 'withinSla', header: 'Dentro SLA', type: 'number' },
      { key: 'outsideSla', header: 'Fora SLA', type: 'number' },
      { key: 'slaRate', header: '% Cumprimento', type: 'percentage' },
    ],
    exportFormats: ['xlsx', 'pdf'],
    requiredPermission: 'report:sla',
  },
];
```

### Relatórios Financeiros

```typescript
const FINANCIAL_REPORTS: ReportConfig[] = [
  {
    id: 'revenue',
    name: 'Faturamento',
    description: 'Receitas do período por categoria',
    category: 'FINANCIAL',
    parameters: [
      { key: 'dateRange', label: 'Período', type: 'dateRange', required: true },
      { key: 'groupBy', label: 'Agrupar por', type: 'select', required: false,
        options: [
          { label: 'Dia', value: 'day' },
          { label: 'Semana', value: 'week' },
          { label: 'Mês', value: 'month' },
        ],
      },
    ],
    columns: [
      { key: 'period', header: 'Período', type: 'string' },
      { key: 'servicesRevenue', header: 'Serviços', type: 'currency', aggregation: 'sum' },
      { key: 'partsRevenue', header: 'Peças', type: 'currency', aggregation: 'sum' },
      { key: 'totalRevenue', header: 'Total', type: 'currency', aggregation: 'sum' },
      { key: 'ordersCount', header: 'Qtd OS', type: 'number', aggregation: 'sum' },
      { key: 'avgTicket', header: 'Ticket Médio', type: 'currency' },
    ],
    exportFormats: ['xlsx', 'csv', 'pdf'],
    requiredPermission: 'report:financial',
  },

  {
    id: 'payments-received',
    name: 'Recebimentos',
    description: 'Pagamentos recebidos por forma de pagamento',
    category: 'FINANCIAL',
    parameters: [
      { key: 'dateRange', label: 'Período', type: 'dateRange', required: true },
      { key: 'method', label: 'Forma de Pagamento', type: 'multiSelect', required: false },
    ],
    columns: [
      { key: 'date', header: 'Data', type: 'date' },
      { key: 'serviceOrder.number', header: 'OS', type: 'string' },
      { key: 'customer.name', header: 'Cliente', type: 'string' },
      { key: 'method', header: 'Forma', type: 'string' },
      { key: 'amount', header: 'Valor', type: 'currency', aggregation: 'sum' },
      { key: 'status', header: 'Status', type: 'string' },
    ],
    groupBy: ['method', 'status'],
    exportFormats: ['xlsx', 'csv', 'pdf'],
    requiredPermission: 'report:financial',
  },

  {
    id: 'commissions',
    name: 'Comissões',
    description: 'Comissões por técnico',
    category: 'FINANCIAL',
    parameters: [
      { key: 'dateRange', label: 'Período', type: 'dateRange', required: true },
      { key: 'technician', label: 'Técnico', type: 'select', required: false },
      { key: 'status', label: 'Status', type: 'select', required: false,
        options: [
          { label: 'Pendente', value: 'PENDING' },
          { label: 'Disponível', value: 'AVAILABLE' },
          { label: 'Pago', value: 'PAID' },
        ],
      },
    ],
    columns: [
      { key: 'technician.name', header: 'Técnico', type: 'string' },
      { key: 'ordersCount', header: 'OS', type: 'number', aggregation: 'sum' },
      { key: 'totalOrders', header: 'Valor OS', type: 'currency', aggregation: 'sum' },
      { key: 'commissionBase', header: 'Base Comissão', type: 'currency', aggregation: 'sum' },
      { key: 'avgRate', header: '% Médio', type: 'percentage' },
      { key: 'totalCommission', header: 'Total Comissão', type: 'currency', aggregation: 'sum' },
      { key: 'paid', header: 'Pago', type: 'currency', aggregation: 'sum' },
      { key: 'pending', header: 'Pendente', type: 'currency', aggregation: 'sum' },
    ],
    exportFormats: ['xlsx', 'pdf'],
    requiredPermission: 'report:commissions',
  },
];
```

### Relatórios de Estoque

```typescript
const INVENTORY_REPORTS: ReportConfig[] = [
  {
    id: 'stock-position',
    name: 'Posição de Estoque',
    description: 'Estoque atual de todas as peças',
    category: 'INVENTORY',
    parameters: [
      { key: 'category', label: 'Categoria', type: 'select', required: false },
      { key: 'lowStock', label: 'Apenas estoque baixo', type: 'select', required: false,
        options: [
          { label: 'Todos', value: 'all' },
          { label: 'Estoque baixo', value: 'low' },
          { label: 'Sem estoque', value: 'zero' },
        ],
      },
    ],
    columns: [
      { key: 'sku', header: 'SKU', type: 'string' },
      { key: 'name', header: 'Peça', type: 'string' },
      { key: 'category', header: 'Categoria', type: 'string' },
      { key: 'quantity', header: 'Qtd', type: 'number', aggregation: 'sum' },
      { key: 'minQuantity', header: 'Mínimo', type: 'number' },
      { key: 'costPrice', header: 'Custo Unit.', type: 'currency' },
      { key: 'totalCost', header: 'Custo Total', type: 'currency', aggregation: 'sum' },
      { key: 'sellPrice', header: 'Preço Venda', type: 'currency' },
    ],
    groupBy: ['category'],
    exportFormats: ['xlsx', 'csv', 'pdf'],
    requiredPermission: 'report:inventory',
  },

  {
    id: 'stock-movements',
    name: 'Movimentação de Estoque',
    description: 'Entradas e saídas de peças',
    category: 'INVENTORY',
    parameters: [
      { key: 'dateRange', label: 'Período', type: 'dateRange', required: true },
      { key: 'part', label: 'Peça', type: 'select', required: false },
      { key: 'type', label: 'Tipo', type: 'select', required: false,
        options: [
          { label: 'Entrada', value: 'IN' },
          { label: 'Saída', value: 'OUT' },
          { label: 'Ajuste', value: 'ADJUSTMENT' },
        ],
      },
    ],
    columns: [
      { key: 'date', header: 'Data', type: 'date' },
      { key: 'part.name', header: 'Peça', type: 'string' },
      { key: 'type', header: 'Tipo', type: 'string' },
      { key: 'quantity', header: 'Qtd', type: 'number' },
      { key: 'unitCost', header: 'Custo Unit.', type: 'currency' },
      { key: 'totalCost', header: 'Custo Total', type: 'currency', aggregation: 'sum' },
      { key: 'reference', header: 'Referência', type: 'string' },
      { key: 'user.name', header: 'Usuário', type: 'string' },
    ],
    exportFormats: ['xlsx', 'csv'],
    requiredPermission: 'report:inventory',
  },
];
```

---

## Geração de Relatórios

### Service

```typescript
// services/report.service.ts
class ReportService {
  async generate(
    reportId: string,
    parameters: Record<string, any>,
    companyId: string
  ): Promise<ReportResult> {
    const config = this.getReportConfig(reportId);

    // Validar parâmetros
    this.validateParameters(config.parameters, parameters);

    // Buscar dados
    const data = await this.fetchReportData(config, parameters, companyId);

    // Aplicar agrupamento se solicitado
    const groupedData = parameters.groupBy
      ? this.groupData(data, parameters.groupBy)
      : data;

    // Calcular agregações
    const aggregations = this.calculateAggregations(config.columns, data);

    return {
      config,
      parameters,
      data: groupedData,
      aggregations,
      generatedAt: new Date(),
      totalRows: data.length,
    };
  }

  async export(
    reportId: string,
    parameters: Record<string, any>,
    format: 'xlsx' | 'csv' | 'pdf',
    companyId: string
  ): Promise<Buffer> {
    const result = await this.generate(reportId, parameters, companyId);

    switch (format) {
      case 'xlsx':
        return this.exportToExcel(result);
      case 'csv':
        return this.exportToCsv(result);
      case 'pdf':
        return this.exportToPdf(result);
    }
  }

  private async fetchReportData(
    config: ReportConfig,
    parameters: Record<string, any>,
    companyId: string
  ): Promise<any[]> {
    // Implementação específica por relatório
    switch (config.id) {
      case 'service-orders-list':
        return this.fetchServiceOrdersReport(parameters, companyId);
      case 'revenue':
        return this.fetchRevenueReport(parameters, companyId);
      // ... outros relatórios
    }
  }

  private async fetchServiceOrdersReport(
    params: Record<string, any>,
    companyId: string
  ): Promise<any[]> {
    return this.prisma.serviceOrder.findMany({
      where: {
        companyId,
        createdAt: {
          gte: params.dateRange.from,
          lte: params.dateRange.to,
        },
        ...(params.status && { status: { in: params.status } }),
        ...(params.technician && { assignedToId: params.technician }),
        ...(params.priority && { priority: params.priority }),
      },
      include: {
        customer: { select: { name: true } },
        equipment: { select: { brand: true, model: true } },
        technician: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  private exportToExcel(result: ReportResult): Buffer {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(result.config.name);

    // Header
    const headers = result.config.columns.map(c => c.header);
    const headerRow = sheet.addRow(headers);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    // Dados
    result.data.forEach(row => {
      const values = result.config.columns.map(col => {
        const value = this.getNestedValue(row, col.key);
        return this.formatValue(value, col.type);
      });
      sheet.addRow(values);
    });

    // Agregações (rodapé)
    if (Object.keys(result.aggregations).length > 0) {
      sheet.addRow([]); // Linha vazia
      const aggRow = result.config.columns.map(col => {
        if (col.aggregation && result.aggregations[col.key]) {
          return this.formatValue(result.aggregations[col.key], col.type);
        }
        return col.aggregation ? '' : '';
      });
      const footerRow = sheet.addRow(aggRow);
      footerRow.font = { bold: true };
    }

    // Auto-width
    sheet.columns.forEach((col, i) => {
      col.width = result.config.columns[i]?.width || 15;
    });

    return workbook.xlsx.writeBuffer();
  }

  private exportToPdf(result: ReportResult): Buffer {
    const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
    const chunks: Buffer[] = [];

    doc.on('data', chunk => chunks.push(chunk));

    // Título
    doc.fontSize(16).text(result.config.name, { align: 'center' });
    doc.fontSize(10).text(
      `Período: ${formatDate(result.parameters.dateRange?.from)} a ${formatDate(result.parameters.dateRange?.to)}`,
      { align: 'center' }
    );
    doc.moveDown();

    // Tabela
    const table = {
      headers: result.config.columns.map(c => c.header),
      rows: result.data.map(row =>
        result.config.columns.map(col =>
          this.formatValue(this.getNestedValue(row, col.key), col.type)
        )
      ),
    };

    doc.table(table, {
      prepareHeader: () => doc.font('Helvetica-Bold').fontSize(8),
      prepareRow: () => doc.font('Helvetica').fontSize(8),
    });

    // Rodapé
    doc.moveDown();
    doc.fontSize(8).text(
      `Gerado em: ${formatDateTime(result.generatedAt)} | Total: ${result.totalRows} registros`,
      { align: 'right' }
    );

    doc.end();

    return Buffer.concat(chunks);
  }
}
```

---

## Interface de Relatórios

### Lista de Relatórios

```tsx
function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  const reportsByCategory = groupBy(ALL_REPORTS, 'category');

  return (
    <div className="grid grid-cols-4 gap-6">
      {/* Sidebar com lista de relatórios */}
      <div className="col-span-1 space-y-6">
        {Object.entries(reportsByCategory).map(([category, reports]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="text-sm">
                {getCategoryLabel(category)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {reports.map(report => (
                <Button
                  key={report.id}
                  variant={selectedReport === report.id ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setSelectedReport(report.id)}
                >
                  {report.name}
                </Button>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Área principal */}
      <div className="col-span-3">
        {selectedReport ? (
          <ReportViewer reportId={selectedReport} />
        ) : (
          <Card>
            <CardContent className="flex items-center justify-center h-96">
              <div className="text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4" />
                <p>Selecione um relatório para visualizar</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
```

### Visualizador de Relatório

```tsx
function ReportViewer({ reportId }: { reportId: string }) {
  const config = getReportConfig(reportId);
  const [parameters, setParameters] = useState<Record<string, any>>(
    getDefaultParameters(config)
  );
  const [result, setResult] = useState<ReportResult | null>(null);

  const generateReport = useGenerateReportMutation();
  const exportReport = useExportReportMutation();

  const handleGenerate = async () => {
    const data = await generateReport.mutateAsync({ reportId, parameters });
    setResult(data);
  };

  const handleExport = async (format: 'xlsx' | 'csv' | 'pdf') => {
    const blob = await exportReport.mutateAsync({ reportId, parameters, format });
    downloadBlob(blob, `${config.name}.${format}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold">{config.name}</h2>
          <p className="text-muted-foreground">{config.description}</p>
        </div>
        <div className="flex gap-2">
          {config.exportFormats.map(format => (
            <Button
              key={format}
              variant="outline"
              size="sm"
              onClick={() => handleExport(format)}
              disabled={!result}
            >
              <Download className="h-4 w-4 mr-1" />
              {format.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* Parâmetros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Parâmetros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {config.parameters.map(param => (
              <ReportParameterInput
                key={param.key}
                parameter={param}
                value={parameters[param.key]}
                onChange={(value) =>
                  setParameters({ ...parameters, [param.key]: value })
                }
              />
            ))}
          </div>
          <Button onClick={handleGenerate} className="mt-4">
            <Play className="h-4 w-4 mr-1" />
            Gerar Relatório
          </Button>
        </CardContent>
      </Card>

      {/* Resultado */}
      {result && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm">
              Resultado ({result.totalRows} registros)
            </CardTitle>
            {config.groupBy && (
              <Select
                value={parameters.groupBy || ''}
                onValueChange={(v) => setParameters({ ...parameters, groupBy: v })}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Agrupar por..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sem agrupamento</SelectItem>
                  {config.groupBy.map(field => (
                    <SelectItem key={field} value={field}>
                      {getFieldLabel(field)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </CardHeader>
          <CardContent>
            <DataTable
              columns={config.columns.map(col => ({
                header: col.header,
                accessor: col.key,
                cell: ({ value }) => formatReportValue(value, col.type),
                footer: col.aggregation && result.aggregations[col.key]
                  ? () => formatReportValue(result.aggregations[col.key], col.type)
                  : undefined,
              }))}
              data={result.data}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

---

## Relatórios Agendados

```typescript
// Agendar envio automático de relatório
interface ScheduledReport {
  id: string;
  companyId: string;
  reportId: string;
  parameters: Record<string, any>;

  // Agendamento
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  dayOfWeek?: number;    // Para WEEKLY (0-6)
  dayOfMonth?: number;   // Para MONTHLY (1-31)
  time: string;          // "08:00"

  // Destinatários
  recipients: string[];  // Emails
  format: 'xlsx' | 'pdf';

  // Status
  enabled: boolean;
  lastRunAt?: Date;
  nextRunAt: Date;
}

// Job de envio
async function processScheduledReports() {
  const now = new Date();

  const dueReports = await prisma.scheduledReport.findMany({
    where: {
      enabled: true,
      nextRunAt: { lte: now },
    },
  });

  for (const scheduled of dueReports) {
    try {
      // Gerar relatório
      const report = await reportService.export(
        scheduled.reportId,
        scheduled.parameters,
        scheduled.format,
        scheduled.companyId
      );

      // Enviar por email
      await emailService.sendWithAttachment({
        to: scheduled.recipients,
        subject: `Relatório: ${getReportName(scheduled.reportId)}`,
        body: `Segue em anexo o relatório gerado automaticamente.`,
        attachment: {
          filename: `relatorio.${scheduled.format}`,
          content: report,
        },
      });

      // Atualizar próxima execução
      await updateNextRun(scheduled);
    } catch (error) {
      await logScheduledReportError(scheduled.id, error);
    }
  }
}
```

---

## Permissões

| Relatório | Atendente | Técnico | Gerente | Admin |
|-----------|-----------|---------|---------|-------|
| OS por período | ✅ | ❌ | ✅ | ✅ |
| Produtividade | ❌ | Próprio | ✅ | ✅ |
| Faturamento | ❌ | ❌ | ✅ | ✅ |
| Comissões | ❌ | Próprio | ✅ | ✅ |
| Estoque | ❌ | ❌ | ✅ | ✅ |
| Clientes | ❌ | ❌ | ✅ | ✅ |
| Agendar relatórios | ❌ | ❌ | ✅ | ✅ |

---

**Voltar para** [Regras de Negócio](./README.md)
