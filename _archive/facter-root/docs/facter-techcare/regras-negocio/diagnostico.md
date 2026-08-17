# Diagnóstico

> **Processo de avaliação técnica do equipamento.**

---

## Conceito

O diagnóstico é a etapa onde o técnico avalia o equipamento para identificar:
- Defeitos reais vs. relatados pelo cliente
- Componentes que precisam de reparo/troca
- Viabilidade do conserto
- Estimativa de custos e tempo

---

## Fluxo de Diagnóstico

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    EQUIPAMENTO CHEGA NA TRIAGEM                         │
└────────┬────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    TRIAGEM INICIAL (Atendente/Técnico)                  │
├─────────────────────────────────────────────────────────────────────────┤
│ • Verificar estado físico externo                                       │
│ • Conferir acessórios recebidos                                         │
│ • Registrar fotos do estado atual                                       │
│ • Classificar tipo de problema (hardware/software)                      │
└────────┬────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    ATRIBUIR PARA TÉCNICO                                │
├─────────────────────────────────────────────────────────────────────────┤
│ • Baseado em especialidade                                              │
│ • Baseado em disponibilidade                                            │
│ • Ou distribuição automática                                            │
└────────┬────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    DIAGNÓSTICO TÉCNICO                                  │
├─────────────────────────────────────────────────────────────────────────┤
│ • Testes funcionais                                                     │
│ • Identificação de componentes defeituosos                              │
│ • Verificação de danos ocultos                                          │
│ • Fotos internas (se aberto)                                            │
└────────┬────────────────────────────────────────────────────────────────┘
         │
         ├──────────────────────────┐
         │                          │
         ▼                          ▼
┌─────────────────┐        ┌─────────────────┐
│ REPARO VIÁVEL   │        │ SEM CONSERTO    │
└────────┬────────┘        └────────┬────────┘
         │                          │
         ▼                          ▼
┌─────────────────┐        ┌─────────────────────┐
│ Gerar Orçamento │        │ Informar cliente    │
│ com itens       │        │ (devolução)         │
└─────────────────┘        └─────────────────────┘
```

---

## Estrutura

```prisma
model Diagnosis {
  id              String          @id @default(uuid())
  serviceOrderId  String          @unique
  serviceOrder    ServiceOrder    @relation(fields: [serviceOrderId], references: [id])

  // Técnico responsável
  technicianId    String
  technician      User            @relation(fields: [technicianId], references: [id])

  // Defeitos encontrados
  issues          DiagnosisIssue[]

  // Resultado
  result          DiagnosisResult
  resultNotes     String?

  // Viabilidade
  isRepairable    Boolean
  estimatedHours  Decimal?        @db.Decimal(4, 1)
  complexity      Complexity      @default(MEDIUM)

  // Fotos do diagnóstico
  photos          DiagnosisPhoto[]

  // Timestamps
  startedAt       DateTime        @default(now())
  completedAt     DateTime?

  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
}

model DiagnosisIssue {
  id            String      @id @default(uuid())
  diagnosisId   String
  diagnosis     Diagnosis   @relation(fields: [diagnosisId], references: [id])

  // Descrição do problema
  category      IssueCategory
  description   String
  severity      Severity    @default(MEDIUM)

  // Componente afetado
  component     String?

  // Solução proposta
  solution      String
  solutionType  SolutionType  // REPAIR, REPLACE, CLEAN, SOFTWARE

  // Peça necessária (se aplicável)
  partId        String?
  part          Part?       @relation(fields: [partId], references: [id])
  partQuantity  Int         @default(1)

  // Custo estimado
  laborCost     Decimal     @db.Decimal(10, 2)
  partCost      Decimal?    @db.Decimal(10, 2)
}

enum DiagnosisResult {
  REPAIRABLE          // Pode ser consertado
  PARTIALLY_REPAIRABLE // Conserto parcial possível
  NOT_REPAIRABLE      // Sem conserto
  NO_DEFECT_FOUND     // Nenhum defeito encontrado
  CUSTOMER_CAUSED     // Dano causado pelo cliente
}

enum IssueCategory {
  HARDWARE_DISPLAY
  HARDWARE_BATTERY
  HARDWARE_CHARGING
  HARDWARE_AUDIO
  HARDWARE_CAMERA
  HARDWARE_BUTTONS
  HARDWARE_BOARD
  HARDWARE_CONNECTOR
  SOFTWARE_OS
  SOFTWARE_APP
  SOFTWARE_VIRUS
  PHYSICAL_WATER
  PHYSICAL_IMPACT
  PHYSICAL_OXIDATION
  OTHER
}

enum SolutionType {
  REPAIR    // Reparo do componente
  REPLACE   // Troca do componente
  CLEAN     // Limpeza
  SOFTWARE  // Solução de software
}

enum Severity {
  LOW       // Funciona, mas com problema menor
  MEDIUM    // Funciona parcialmente
  HIGH      // Não funciona
  CRITICAL  // Danifica outros componentes
}

enum Complexity {
  SIMPLE    // < 30 min
  MEDIUM    // 30 min - 2h
  COMPLEX   // 2h - 4h
  ADVANCED  // > 4h ou especializado
}
```

---

## Checklist de Diagnóstico

### Por Tipo de Equipamento

```typescript
const DIAGNOSIS_CHECKLISTS = {
  SMARTPHONE: {
    name: 'Smartphone',
    categories: [
      {
        name: 'Tela/Display',
        items: [
          { id: 'display_touch', label: 'Touch funcionando', type: 'boolean' },
          { id: 'display_image', label: 'Imagem OK', type: 'boolean' },
          { id: 'display_dead_pixels', label: 'Dead pixels', type: 'boolean' },
          { id: 'display_burn', label: 'Burn-in', type: 'boolean' },
          { id: 'display_cracks', label: 'Trincas', type: 'boolean' },
        ],
      },
      {
        name: 'Bateria',
        items: [
          { id: 'battery_holds_charge', label: 'Segura carga', type: 'boolean' },
          { id: 'battery_health', label: 'Saúde da bateria', type: 'percentage' },
          { id: 'battery_swollen', label: 'Estufada', type: 'boolean' },
          { id: 'battery_charging', label: 'Carrega normalmente', type: 'boolean' },
        ],
      },
      {
        name: 'Áudio',
        items: [
          { id: 'audio_speaker', label: 'Alto-falante', type: 'boolean' },
          { id: 'audio_earpiece', label: 'Auricular', type: 'boolean' },
          { id: 'audio_mic', label: 'Microfone', type: 'boolean' },
          { id: 'audio_jack', label: 'P2 (se tiver)', type: 'boolean' },
        ],
      },
      {
        name: 'Câmeras',
        items: [
          { id: 'camera_rear', label: 'Câmera traseira', type: 'boolean' },
          { id: 'camera_front', label: 'Câmera frontal', type: 'boolean' },
          { id: 'camera_flash', label: 'Flash', type: 'boolean' },
          { id: 'camera_focus', label: 'Foco automático', type: 'boolean' },
        ],
      },
      {
        name: 'Conectividade',
        items: [
          { id: 'conn_wifi', label: 'Wi-Fi', type: 'boolean' },
          { id: 'conn_bluetooth', label: 'Bluetooth', type: 'boolean' },
          { id: 'conn_cellular', label: 'Rede móvel', type: 'boolean' },
          { id: 'conn_gps', label: 'GPS', type: 'boolean' },
          { id: 'conn_nfc', label: 'NFC', type: 'boolean' },
        ],
      },
      {
        name: 'Sensores/Botões',
        items: [
          { id: 'sensor_fingerprint', label: 'Biometria', type: 'boolean' },
          { id: 'sensor_face', label: 'Face ID', type: 'boolean' },
          { id: 'button_power', label: 'Botão power', type: 'boolean' },
          { id: 'button_volume', label: 'Botões volume', type: 'boolean' },
          { id: 'sensor_proximity', label: 'Proximidade', type: 'boolean' },
        ],
      },
      {
        name: 'Software',
        items: [
          { id: 'sw_boots', label: 'Liga normalmente', type: 'boolean' },
          { id: 'sw_os_version', label: 'Versão do SO', type: 'text' },
          { id: 'sw_frp', label: 'Conta Google/iCloud', type: 'select', options: ['Sem conta', 'Com conta do cliente', 'Bloqueado'] },
          { id: 'sw_icloud_lock', label: 'Bloqueio de ativação', type: 'boolean' },
        ],
      },
    ],
  },

  NOTEBOOK: {
    name: 'Notebook',
    categories: [
      {
        name: 'Tela',
        items: [
          { id: 'display_image', label: 'Imagem OK', type: 'boolean' },
          { id: 'display_backlight', label: 'Backlight', type: 'boolean' },
          { id: 'display_hinges', label: 'Dobradiças', type: 'boolean' },
          { id: 'display_external', label: 'Saída externa', type: 'boolean' },
        ],
      },
      {
        name: 'Teclado/Touchpad',
        items: [
          { id: 'keyboard_works', label: 'Teclado funciona', type: 'boolean' },
          { id: 'keyboard_keys_missing', label: 'Teclas faltando', type: 'text' },
          { id: 'touchpad_works', label: 'Touchpad funciona', type: 'boolean' },
          { id: 'touchpad_buttons', label: 'Botões do touchpad', type: 'boolean' },
        ],
      },
      {
        name: 'Bateria/Energia',
        items: [
          { id: 'battery_holds', label: 'Segura carga', type: 'boolean' },
          { id: 'battery_cycles', label: 'Ciclos', type: 'number' },
          { id: 'charger_works', label: 'Carregador OK', type: 'boolean' },
          { id: 'dc_jack', label: 'Conector de carga', type: 'boolean' },
        ],
      },
      {
        name: 'Hardware',
        items: [
          { id: 'hw_ram', label: 'RAM detectada', type: 'text' },
          { id: 'hw_storage', label: 'Armazenamento', type: 'text' },
          { id: 'hw_storage_health', label: 'Saúde do disco', type: 'percentage' },
          { id: 'hw_fan', label: 'Cooler funciona', type: 'boolean' },
          { id: 'hw_usb', label: 'Portas USB', type: 'text' },
        ],
      },
      // ... mais categorias
    ],
  },

  // Outros tipos de equipamento...
};
```

### Componente de Checklist

```tsx
function DiagnosisChecklist({
  equipmentType,
  onComplete,
}: {
  equipmentType: string;
  onComplete: (results: ChecklistResults) => void;
}) {
  const checklist = DIAGNOSIS_CHECKLISTS[equipmentType];
  const [results, setResults] = useState<Record<string, any>>({});

  return (
    <div className="space-y-6">
      {checklist.categories.map((category) => (
        <Card key={category.name}>
          <CardHeader>
            <CardTitle className="text-lg">{category.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {category.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <Label htmlFor={item.id}>{item.label}</Label>
                <ChecklistInput
                  item={item}
                  value={results[item.id]}
                  onChange={(value) =>
                    setResults({ ...results, [item.id]: value })
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      <Button onClick={() => onComplete(results)} className="w-full">
        Concluir Checklist
      </Button>
    </div>
  );
}

function ChecklistInput({ item, value, onChange }) {
  switch (item.type) {
    case 'boolean':
      return (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={value === true ? 'default' : 'outline'}
            onClick={() => onChange(true)}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={value === false ? 'destructive' : 'outline'}
            onClick={() => onChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={value === null ? 'secondary' : 'outline'}
            onClick={() => onChange(null)}
          >
            N/A
          </Button>
        </div>
      );

    case 'percentage':
      return (
        <div className="flex items-center gap-2">
          <Slider
            value={[value || 0]}
            onValueChange={([v]) => onChange(v)}
            max={100}
            className="w-24"
          />
          <span className="text-sm w-10">{value || 0}%</span>
        </div>
      );

    case 'select':
      return (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            {item.options.map((opt) => (
              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    case 'text':
      return (
        <Input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-40"
        />
      );

    default:
      return null;
  }
}
```

---

## Regras de Negócio

### Tempo Máximo para Diagnóstico

```typescript
// RN-DIAG-001: SLA de diagnóstico por prioridade
const DIAGNOSIS_SLA = {
  NORMAL: 48,   // 48 horas
  HIGH: 24,     // 24 horas
  URGENT: 4,    // 4 horas
};

// Verificar se está dentro do SLA
function isDiagnosisOverdue(serviceOrder: ServiceOrder): boolean {
  if (serviceOrder.status !== 'DIAGNOSIS') return false;

  const startedAt = serviceOrder.diagnosisStartedAt || serviceOrder.createdAt;
  const slaHours = DIAGNOSIS_SLA[serviceOrder.priority];
  const deadline = addHours(startedAt, slaHours);

  return new Date() > deadline;
}
```

### Diagnóstico Automático

```typescript
// RN-DIAG-010: Sugestões baseadas no defeito relatado
function suggestDiagnosis(reportedIssue: string, equipmentType: string): SuggestedIssue[] {
  const keywords = extractKeywords(reportedIssue.toLowerCase());
  const suggestions: SuggestedIssue[] = [];

  // Mapeamento de palavras-chave para problemas comuns
  const ISSUE_MAPPINGS = {
    'não liga': [
      { category: 'HARDWARE_BATTERY', description: 'Bateria descarregada ou defeituosa' },
      { category: 'HARDWARE_CHARGING', description: 'Problema no conector de carga' },
      { category: 'HARDWARE_BOARD', description: 'Problema na placa' },
    ],
    'tela quebrada': [
      { category: 'HARDWARE_DISPLAY', description: 'Display danificado' },
    ],
    'não carrega': [
      { category: 'HARDWARE_CHARGING', description: 'Conector de carga' },
      { category: 'HARDWARE_BATTERY', description: 'Bateria não aceita carga' },
    ],
    'lento': [
      { category: 'SOFTWARE_OS', description: 'Sistema operacional com problemas' },
      { category: 'HARDWARE_BOARD', description: 'Memória RAM insuficiente' },
    ],
    'molhou': [
      { category: 'PHYSICAL_WATER', description: 'Dano por líquido' },
      { category: 'PHYSICAL_OXIDATION', description: 'Possível oxidação' },
    ],
    // ... mais mapeamentos
  };

  for (const [keyword, issues] of Object.entries(ISSUE_MAPPINGS)) {
    if (keywords.some(k => k.includes(keyword) || keyword.includes(k))) {
      suggestions.push(...issues);
    }
  }

  return suggestions;
}
```

### Criar Diagnóstico

```typescript
// RN-DIAG-020: Registrar diagnóstico completo
interface CreateDiagnosisDto {
  serviceOrderId: string;
  technicianId: string;
  issues: {
    category: IssueCategory;
    description: string;
    severity: Severity;
    component?: string;
    solution: string;
    solutionType: SolutionType;
    partId?: string;
    partQuantity?: number;
    laborCost: number;
    partCost?: number;
  }[];
  result: DiagnosisResult;
  resultNotes?: string;
  isRepairable: boolean;
  estimatedHours?: number;
  complexity: Complexity;
  photos?: string[];
  checklistResults?: Record<string, any>;
}

async function createDiagnosis(dto: CreateDiagnosisDto): Promise<Diagnosis> {
  // Validar OS está no status correto
  const serviceOrder = await getServiceOrder(dto.serviceOrderId);
  if (serviceOrder.status !== 'DIAGNOSIS') {
    throw new Error('OS não está em diagnóstico');
  }

  // Criar diagnóstico
  const diagnosis = await prisma.diagnosis.create({
    data: {
      serviceOrderId: dto.serviceOrderId,
      technicianId: dto.technicianId,
      result: dto.result,
      resultNotes: dto.resultNotes,
      isRepairable: dto.isRepairable,
      estimatedHours: dto.estimatedHours,
      complexity: dto.complexity,
      completedAt: new Date(),
      issues: {
        create: dto.issues,
      },
      photos: {
        create: dto.photos?.map(url => ({ url, type: 'DIAGNOSIS' })),
      },
    },
    include: {
      issues: true,
      photos: true,
    },
  });

  // Atualizar status da OS
  if (dto.isRepairable) {
    await updateServiceOrderStatus(dto.serviceOrderId, 'AWAITING_APPROVAL');
    // Gerar orçamento automaticamente
    await generateQuoteFromDiagnosis(diagnosis);
  } else {
    await updateServiceOrderStatus(dto.serviceOrderId, 'WAITING_CUSTOMER');
    // Notificar cliente sobre inviabilidade
    await notifyCustomer(serviceOrder.customerId, 'DIAGNOSIS_NOT_REPAIRABLE', {
      reason: dto.resultNotes,
    });
  }

  return diagnosis;
}
```

### Gerar Orçamento do Diagnóstico

```typescript
// RN-DIAG-030: Converter diagnóstico em orçamento
async function generateQuoteFromDiagnosis(diagnosis: Diagnosis): Promise<Quote> {
  const serviceOrder = await getServiceOrder(diagnosis.serviceOrderId);
  const company = await getCompany(serviceOrder.companyId);

  const items: QuoteItem[] = [];

  for (const issue of diagnosis.issues) {
    // Item de mão de obra
    items.push({
      type: 'SERVICE',
      description: issue.solution,
      quantity: 1,
      unitPrice: issue.laborCost,
      total: issue.laborCost,
    });

    // Item de peça (se necessário)
    if (issue.partId) {
      const part = await getPart(issue.partId);
      const sellPrice = calculatePartSellPrice(part, company.settings);

      items.push({
        type: 'PART',
        description: part.name,
        partId: part.id,
        quantity: issue.partQuantity || 1,
        unitPrice: sellPrice,
        total: sellPrice * (issue.partQuantity || 1),
      });
    }
  }

  return createQuote({
    serviceOrderId: diagnosis.serviceOrderId,
    items,
    diagnosisId: diagnosis.id,
    validUntil: addDays(new Date(), company.settings.quote.defaultValidityDays),
  });
}
```

---

## Interface de Diagnóstico

```tsx
function DiagnosisPage({ serviceOrderId }: { serviceOrderId: string }) {
  const { data: serviceOrder } = useServiceOrder(serviceOrderId);
  const { data: suggestions } = useDiagnosisSuggestions(
    serviceOrder?.reportedIssue,
    serviceOrder?.equipment.type
  );

  const [issues, setIssues] = useState<DiagnosisIssue[]>([]);
  const [result, setResult] = useState<DiagnosisResult | null>(null);

  const createDiagnosis = useCreateDiagnosisMutation();

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Coluna 1: Info da OS */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Informações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <Label>Cliente</Label>
              <p>{serviceOrder.customer.name}</p>
            </div>
            <div>
              <Label>Equipamento</Label>
              <p>{serviceOrder.equipment.brand} {serviceOrder.equipment.model}</p>
            </div>
            <div>
              <Label>Defeito Relatado</Label>
              <p className="text-muted-foreground">{serviceOrder.reportedIssue}</p>
            </div>
          </CardContent>
        </Card>

        {/* Sugestões automáticas */}
        {suggestions?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Sugestões</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {suggestions.map((suggestion, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => addIssueFromSuggestion(suggestion)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {suggestion.description}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Fotos do recebimento */}
        <Card>
          <CardHeader>
            <CardTitle>Fotos do Recebimento</CardTitle>
          </CardHeader>
          <CardContent>
            <PhotoGallery photos={serviceOrder.photos} />
          </CardContent>
        </Card>
      </div>

      {/* Coluna 2: Checklist + Issues */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Checklist de Diagnóstico</CardTitle>
          </CardHeader>
          <CardContent>
            <DiagnosisChecklist
              equipmentType={serviceOrder.equipment.type}
              onComplete={handleChecklistComplete}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Problemas Encontrados</CardTitle>
            <Button size="sm" onClick={() => setShowAddIssue(true)}>
              <Plus className="h-4 w-4 mr-1" /> Adicionar
            </Button>
          </CardHeader>
          <CardContent>
            {issues.length === 0 ? (
              <EmptyState
                icon={Search}
                title="Nenhum problema registrado"
                description="Adicione os problemas encontrados durante o diagnóstico"
              />
            ) : (
              <div className="space-y-3">
                {issues.map((issue, index) => (
                  <IssueCard
                    key={index}
                    issue={issue}
                    onEdit={() => editIssue(index)}
                    onRemove={() => removeIssue(index)}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Coluna 3: Resultado + Fotos */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Fotos do Diagnóstico</CardTitle>
          </CardHeader>
          <CardContent>
            <PhotoUploader
              onUpload={handlePhotoUpload}
              photos={diagnosisPhotos}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resultado do Diagnóstico</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup value={result} onValueChange={setResult}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="REPAIRABLE" id="repairable" />
                <Label htmlFor="repairable">Pode ser consertado</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="PARTIALLY_REPAIRABLE" id="partial" />
                <Label htmlFor="partial">Conserto parcial possível</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="NOT_REPAIRABLE" id="not_repairable" />
                <Label htmlFor="not_repairable">Sem conserto</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="NO_DEFECT_FOUND" id="no_defect" />
                <Label htmlFor="no_defect">Nenhum defeito encontrado</Label>
              </div>
            </RadioGroup>

            <Textarea
              placeholder="Observações do diagnóstico..."
              value={resultNotes}
              onChange={(e) => setResultNotes(e.target.value)}
            />

            {result && ['REPAIRABLE', 'PARTIALLY_REPAIRABLE'].includes(result) && (
              <>
                <div className="space-y-2">
                  <Label>Complexidade</Label>
                  <Select value={complexity} onValueChange={setComplexity}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SIMPLE">Simples (&lt; 30 min)</SelectItem>
                      <SelectItem value="MEDIUM">Média (30 min - 2h)</SelectItem>
                      <SelectItem value="COMPLEX">Complexa (2h - 4h)</SelectItem>
                      <SelectItem value="ADVANCED">Avançada (&gt; 4h)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tempo estimado (horas)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(e.target.value)}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Button
          className="w-full"
          size="lg"
          onClick={handleSubmitDiagnosis}
          disabled={!result || issues.length === 0}
        >
          Finalizar Diagnóstico
        </Button>
      </div>
    </div>
  );
}
```

---

## Permissões

| Ação | Atendente | Técnico | Gerente | Admin |
|------|-----------|---------|---------|-------|
| Ver diagnósticos | ✅ | ✅ | ✅ | ✅ |
| Criar diagnóstico | ❌ | ✅ | ✅ | ✅ |
| Editar diagnóstico | ❌ | Próprios | ✅ | ✅ |
| Excluir diagnóstico | ❌ | ❌ | ✅ | ✅ |
| Ver checklists | ✅ | ✅ | ✅ | ✅ |
| Configurar checklists | ❌ | ❌ | ❌ | ✅ |

---

**Voltar para** [Regras de Negócio](./README.md)
