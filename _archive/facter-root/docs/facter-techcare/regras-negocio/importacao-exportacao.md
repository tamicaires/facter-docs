# Importação e Exportação

> **Sistema para migração de dados e backup.**

---

## Cenários de Uso

| Cenário | Direção | Formato |
|---------|---------|---------|
| Migração de sistema legado | Importação | CSV, Excel |
| Backup periódico | Exportação | JSON, Excel |
| Relatórios para contador | Exportação | Excel, PDF |
| Integração externa | Ambos | CSV, JSON |
| Troca de plataforma | Exportação | JSON completo |

---

## Importação

### Entidades Importáveis

| Entidade | Prioridade | Dependências |
|----------|------------|--------------|
| Clientes | 1 | Nenhuma |
| Equipamentos | 2 | Clientes |
| Peças/Estoque | 1 | Nenhuma |
| Serviços | 1 | Nenhuma |
| Ordens de Serviço | 3 | Clientes, Equipamentos |

### Fluxo de Importação

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    1. UPLOAD DO ARQUIVO                                 │
├─────────────────────────────────────────────────────────────────────────┤
│ • Aceitar: CSV, XLSX, XLS                                               │
│ • Limite: 10MB / 10.000 linhas                                          │
│ • Validar formato básico                                                │
└────────┬────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    2. MAPEAMENTO DE COLUNAS                             │
├─────────────────────────────────────────────────────────────────────────┤
│ • Detectar colunas automaticamente                                      │
│ • Permitir ajuste manual                                                │
│ • Mostrar preview das primeiras linhas                                  │
└────────┬────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    3. VALIDAÇÃO                                         │
├─────────────────────────────────────────────────────────────────────────┤
│ • Validar campos obrigatórios                                           │
│ • Validar formatos (email, telefone, CPF)                               │
│ • Detectar duplicatas                                                   │
│ • Mostrar erros e warnings                                              │
└────────┬────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    4. PREVIEW E CONFIRMAÇÃO                             │
├─────────────────────────────────────────────────────────────────────────┤
│ • Mostrar resumo: X registros válidos, Y com erro                       │
│ • Opção: ignorar erros ou corrigir                                      │
│ • Confirmar importação                                                  │
└────────┬────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    5. PROCESSAMENTO                                     │
├─────────────────────────────────────────────────────────────────────────┤
│ • Processar em background (job)                                         │
│ • Mostrar progresso                                                     │
│ • Gerar relatório final                                                 │
└─────────────────────────────────────────────────────────────────────────┘
```

### Template de Importação

```typescript
// Template para clientes
interface CustomerImportTemplate {
  columns: {
    name: { required: true; type: 'string'; maxLength: 200 };
    document: { required: false; type: 'cpf_cnpj' };
    email: { required: false; type: 'email' };
    phone: { required: true; type: 'phone' };
    phone2: { required: false; type: 'phone' };
    street: { required: false; type: 'string' };
    number: { required: false; type: 'string' };
    complement: { required: false; type: 'string' };
    neighborhood: { required: false; type: 'string' };
    city: { required: false; type: 'string' };
    state: { required: false; type: 'state' };
    zipCode: { required: false; type: 'cep' };
    notes: { required: false; type: 'text' };
  };

  example: `
Nome,CPF/CNPJ,Email,Telefone,Telefone 2,Rua,Número,Complemento,Bairro,Cidade,Estado,CEP,Observações
João Silva,123.456.789-00,joao@email.com,(11) 99999-9999,,(11) 3333-3333,Rua das Flores,123,Apto 45,Centro,São Paulo,SP,01234-567,Cliente antigo
Maria Santos,,,,(11) 98888-8888,,Av Brasil,456,,,São Paulo,SP,,
`;
}
```

### Processamento

```typescript
interface ImportJob {
  id: string;
  companyId: string;
  userId: string;
  entity: 'CUSTOMER' | 'PART' | 'SERVICE' | 'SERVICE_ORDER';
  fileName: string;
  totalRows: number;
  processedRows: number;
  successCount: number;
  errorCount: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  errors: ImportError[];
  startedAt?: Date;
  completedAt?: Date;
}

interface ImportError {
  row: number;
  column?: string;
  value?: string;
  error: string;
}

// Processador de importação
async function processImport(job: ImportJob): Promise<void> {
  const file = await getUploadedFile(job.id);
  const rows = await parseFile(file);

  await updateJobStatus(job.id, 'PROCESSING');

  for (let i = 0; i < rows.length; i++) {
    try {
      const data = mapRowToEntity(rows[i], job.entity);
      await validateRow(data, job.entity);
      await createEntity(job.companyId, job.entity, data);

      await incrementSuccess(job.id);
    } catch (error) {
      await addError(job.id, {
        row: i + 1,
        error: error.message,
      });
    }

    // Atualizar progresso a cada 100 registros
    if (i % 100 === 0) {
      await updateProgress(job.id, i);
    }
  }

  await updateJobStatus(job.id, 'COMPLETED');
}
```

### Tratamento de Duplicatas

```typescript
enum DuplicateStrategy {
  SKIP = 'SKIP',           // Ignorar duplicata
  UPDATE = 'UPDATE',       // Atualizar existente
  CREATE_NEW = 'CREATE_NEW', // Criar mesmo assim
}

interface ImportOptions {
  duplicateStrategy: DuplicateStrategy;
  duplicateKey: string[];  // Campos para detectar duplicata
  skipEmptyRows: boolean;
  trimValues: boolean;
}

async function handleDuplicate(
  existing: any,
  newData: any,
  strategy: DuplicateStrategy
): Promise<void> {
  switch (strategy) {
    case 'SKIP':
      throw new DuplicateError('Registro já existe');

    case 'UPDATE':
      await updateEntity(existing.id, newData);
      break;

    case 'CREATE_NEW':
      await createEntity(newData);
      break;
  }
}
```

---

## Exportação

### Formatos Disponíveis

| Formato | Uso | Características |
|---------|-----|-----------------|
| Excel (.xlsx) | Relatórios, backup | Formatado, múltiplas abas |
| CSV | Integração | Simples, universal |
| JSON | Backup completo | Estruturado, relacionamentos |
| PDF | Relatórios finais | Formatado, não editável |

### Entidades Exportáveis

```typescript
interface ExportConfig {
  entity: string;
  fields: string[];       // Campos a exportar
  filters?: any;          // Filtros aplicados
  format: 'xlsx' | 'csv' | 'json' | 'pdf';
  includeRelations?: boolean;
}

// Configurações por entidade
const EXPORT_CONFIGS = {
  customers: {
    fields: [
      'name', 'document', 'email', 'phone',
      'address', 'category', 'createdAt'
    ],
    relations: ['equipment', 'serviceOrders'],
  },

  serviceOrders: {
    fields: [
      'number', 'status', 'customer.name', 'equipment.model',
      'reportedIssue', 'diagnosis', 'total', 'createdAt', 'completedAt'
    ],
    relations: ['quote', 'payments'],
  },

  inventory: {
    fields: [
      'name', 'sku', 'quantity', 'minQuantity',
      'costPrice', 'sellPrice', 'supplier'
    ],
  },

  financial: {
    fields: [
      'date', 'type', 'description', 'amount',
      'paymentMethod', 'serviceOrder.number', 'customer.name'
    ],
  },
};
```

### Geração de Relatório

```typescript
// Exportar clientes para Excel
async function exportCustomers(
  companyId: string,
  filters: CustomerFilters,
  format: 'xlsx' | 'csv'
): Promise<Buffer> {
  const customers = await prisma.customer.findMany({
    where: {
      companyId,
      ...buildFilters(filters),
    },
    include: {
      _count: {
        select: { serviceOrders: true },
      },
    },
    orderBy: { name: 'asc' },
  });

  const rows = customers.map(c => ({
    'Nome': c.name,
    'CPF/CNPJ': formatDocument(c.document),
    'Email': c.email,
    'Telefone': formatPhone(c.phone),
    'Categoria': translateCategory(c.category),
    'Total de OS': c._count.serviceOrders,
    'Cadastrado em': formatDate(c.createdAt),
  }));

  if (format === 'xlsx') {
    return generateExcel(rows, 'Clientes');
  } else {
    return generateCSV(rows);
  }
}

// Gerar Excel com ExcelJS
async function generateExcel(
  rows: any[],
  sheetName: string
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName);

  // Header
  const headers = Object.keys(rows[0] || {});
  sheet.addRow(headers);

  // Estilizar header
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' },
  };

  // Dados
  rows.forEach(row => {
    sheet.addRow(Object.values(row));
  });

  // Auto-width
  sheet.columns.forEach(col => {
    col.width = 15;
  });

  return workbook.xlsx.writeBuffer();
}
```

### Backup Completo

```typescript
// Exportar todos os dados da empresa (para migração)
async function exportCompanyData(
  companyId: string
): Promise<CompanyBackup> {
  const [
    company,
    users,
    customers,
    equipment,
    serviceOrders,
    quotes,
    payments,
    parts,
    services,
    warranties,
  ] = await Promise.all([
    prisma.company.findUnique({ where: { id: companyId } }),
    prisma.user.findMany({ where: { companyId } }),
    prisma.customer.findMany({ where: { companyId } }),
    prisma.equipment.findMany({ where: { companyId } }),
    prisma.serviceOrder.findMany({
      where: { companyId },
      include: { items: true, photos: true },
    }),
    prisma.quote.findMany({
      where: { companyId },
      include: { items: true },
    }),
    prisma.payment.findMany({ where: { companyId } }),
    prisma.part.findMany({ where: { companyId } }),
    prisma.service.findMany({ where: { companyId } }),
    prisma.warranty.findMany({ where: { companyId } }),
  ]);

  return {
    exportedAt: new Date(),
    version: '1.0',
    company: sanitizeCompany(company),
    data: {
      users: users.map(sanitizeUser),
      customers,
      equipment,
      serviceOrders,
      quotes,
      payments,
      parts,
      services,
      warranties,
    },
  };
}

interface CompanyBackup {
  exportedAt: Date;
  version: string;
  company: Partial<Company>;
  data: {
    users: Partial<User>[];
    customers: Customer[];
    equipment: Equipment[];
    serviceOrders: ServiceOrder[];
    quotes: Quote[];
    payments: Payment[];
    parts: Part[];
    services: Service[];
    warranties: Warranty[];
  };
}
```

---

## Interface de Importação

### Componente de Upload

```tsx
function ImportWizard({ entity }: { entity: string }) {
  const [step, setStep] = useState<'upload' | 'mapping' | 'validation' | 'processing'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  return (
    <div className="space-y-6">
      {/* Progress */}
      <Steps currentStep={step}>
        <Step id="upload">Upload</Step>
        <Step id="mapping">Mapeamento</Step>
        <Step id="validation">Validação</Step>
        <Step id="processing">Processamento</Step>
      </Steps>

      {/* Content */}
      {step === 'upload' && (
        <UploadStep
          onUpload={(f) => { setFile(f); setStep('mapping'); }}
          template={getTemplate(entity)}
        />
      )}

      {step === 'mapping' && (
        <MappingStep
          file={file}
          entity={entity}
          mapping={mapping}
          onMapping={setMapping}
          onNext={() => setStep('validation')}
          onBack={() => setStep('upload')}
        />
      )}

      {step === 'validation' && (
        <ValidationStep
          file={file}
          mapping={mapping}
          entity={entity}
          onValidated={setValidationResult}
          onNext={() => setStep('processing')}
          onBack={() => setStep('mapping')}
        />
      )}

      {step === 'processing' && (
        <ProcessingStep
          file={file}
          mapping={mapping}
          entity={entity}
          validationResult={validationResult}
        />
      )}
    </div>
  );
}
```

### Mapeamento de Colunas

```tsx
function MappingStep({ file, entity, mapping, onMapping, onNext, onBack }) {
  const { columns, preview } = useParsePreview(file);
  const targetFields = getEntityFields(entity);

  return (
    <div className="space-y-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Coluna no arquivo</TableHead>
            <TableHead>Campo no sistema</TableHead>
            <TableHead>Preview</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {columns.map(col => (
            <TableRow key={col}>
              <TableCell>{col}</TableCell>
              <TableCell>
                <Select
                  value={mapping[col] || ''}
                  onValueChange={(value) =>
                    onMapping({ ...mapping, [col]: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar campo..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Ignorar</SelectItem>
                    {targetFields.map(field => (
                      <SelectItem key={field.key} value={field.key}>
                        {field.label}
                        {field.required && ' *'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {preview[0]?.[col]}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>Voltar</Button>
        <Button onClick={onNext}>Validar</Button>
      </div>
    </div>
  );
}
```

---

## Agendamento de Backup

```typescript
// Backup automático diário
const BACKUP_SCHEDULE = '0 3 * * *'; // 3:00 AM

async function scheduledBackup(companyId: string) {
  const backup = await exportCompanyData(companyId);

  // Salvar no storage
  const fileName = `backup-${companyId}-${format(new Date(), 'yyyy-MM-dd')}.json`;
  await uploadToStorage(fileName, JSON.stringify(backup));

  // Limpar backups antigos (manter últimos 30)
  await cleanupOldBackups(companyId, 30);

  // Registrar no log
  await createAuditLog({
    action: 'BACKUP',
    entity: 'Company',
    entityId: companyId,
    metadata: { fileName, size: backup.length },
  });
}
```

---

## Permissões

| Ação | Atendente | Técnico | Gerente | Admin |
|------|-----------|---------|---------|-------|
| Importar clientes | ❌ | ❌ | ✅ | ✅ |
| Importar peças | ❌ | ❌ | ✅ | ✅ |
| Exportar relatórios | ❌ | ❌ | ✅ | ✅ |
| Backup completo | ❌ | ❌ | ❌ | ✅ |
| Restaurar backup | ❌ | ❌ | ❌ | ✅ |

---

**Voltar para** [Regras de Negócio](./README.md)
