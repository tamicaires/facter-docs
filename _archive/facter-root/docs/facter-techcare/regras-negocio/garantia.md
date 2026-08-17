# Garantia

> **Regras de negócio para gestão de garantias.**

---

## Conceito

Garantia é o compromisso de refazer o serviço ou trocar a peça caso ocorra problema relacionado ao reparo realizado, dentro do prazo estipulado.

---

## Tipos de Garantia

| Tipo | Código | Descrição | Prazo Padrão |
|------|--------|-----------|--------------|
| Serviço | `SERVICE` | Mão de obra executada | 90 dias |
| Peça Original | `PART_ORIGINAL` | Peça do fabricante | 90 dias |
| Peça Compatível | `PART_COMPATIBLE` | Peça alternativa qualidade | 60 dias |
| Peça Genérica | `PART_GENERIC` | Peça genérica | 30 dias |

---

## Estrutura

```prisma
model Warranty {
  id              String          @id @default(uuid())
  companyId       String
  company         Company         @relation(fields: [companyId], references: [id])

  // Relacionamento
  serviceOrderId  String
  serviceOrder    ServiceOrder    @relation(fields: [serviceOrderId], references: [id])
  customerId      String
  customer        Customer        @relation(fields: [customerId], references: [id])

  // Tipo e prazo
  type            WarrantyType
  startDate       DateTime
  endDate         DateTime
  durationDays    Int

  // Itens cobertos
  items           WarrantyItem[]

  // Status
  status          WarrantyStatus  @default(ACTIVE)

  // Termos aceitos
  termsAccepted   Boolean         @default(false)
  termsAcceptedAt DateTime?

  // Retornos
  returns         WarrantyReturn[]

  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
}

model WarrantyItem {
  id          String    @id @default(uuid())
  warrantyId  String
  warranty    Warranty  @relation(fields: [warrantyId], references: [id])

  type        'SERVICE' | 'PART'
  description String
  partId      String?
  part        Part?     @relation(fields: [partId], references: [id])
}

enum WarrantyStatus {
  ACTIVE      // Em vigor
  EXPIRED     // Expirada
  VOIDED      // Anulada (violação)
  USED        // Utilizada (retorno)
}
```

---

## Fluxo de Retorno em Garantia

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    CLIENTE RETORNA COM PROBLEMA                         │
└────────┬────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    VERIFICAR GARANTIA (Atendente)                       │
├─────────────────────────────────────────────────────────────────────────┤
│ • Buscar OS original pelo número/cliente/equipamento                    │
│ • Verificar se está dentro do prazo                                     │
│ • Verificar status da garantia (ativa?)                                 │
└────────┬────────────────────────────────────────────────────────────────┘
         │
         ├──────────────────────────┐
         │                          │
         ▼                          ▼
┌─────────────────┐        ┌─────────────────┐
│ GARANTIA VÁLIDA │        │ GARANTIA INVÁLIDA│
└────────┬────────┘        └────────┬────────┘
         │                          │
         │                          ▼
         │                 ┌─────────────────────┐
         │                 │ • Fora do prazo     │
         │                 │ • Mau uso           │
         │                 │ • Dano físico       │
         │                 │ ──────────────────  │
         │                 │ Criar nova OS       │
         │                 │ (cobrança normal)   │
         │                 └─────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    CRIAR OS DE RETORNO (Vinculada)                      │
├─────────────────────────────────────────────────────────────────────────┤
│ • Tipo: RETORNO_GARANTIA                                                │
│ • Vinculada à OS original                                               │
│ • Valores zerados (sem custo)                                           │
└────────┬────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    ANÁLISE TÉCNICA (Técnico)                            │
├─────────────────────────────────────────────────────────────────────────┤
│ • Verificar se o problema é relacionado ao reparo anterior              │
│ • Documentar achados                                                    │
└────────┬────────────────────────────────────────────────────────────────┘
         │
         ├──────────────────────────┐
         │                          │
         ▼                          ▼
┌─────────────────┐        ┌─────────────────────┐
│ PROBLEMA        │        │ PROBLEMA NÃO        │
│ RELACIONADO     │        │ RELACIONADO         │
│ (Coberto)       │        │ (Não coberto)       │
└────────┬────────┘        └────────┬────────────┘
         │                          │
         │                          ▼
         │                 ┌─────────────────────┐
         │                 │ Comunicar cliente   │
         │                 │ Gerar orçamento     │
         │                 │ (cobrança normal)   │
         │                 └─────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    EXECUTAR REPARO (Sem custo)                          │
├─────────────────────────────────────────────────────────────────────────┤
│ • Refazer serviço ou trocar peça                                        │
│ • Registrar peças utilizadas (custo interno)                            │
└────────┬────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    ENTREGA                                              │
├─────────────────────────────────────────────────────────────────────────┤
│ • Sem cobrança ao cliente                                               │
│ • Nova garantia? (Configurável)                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Regras de Negócio

### Validação de Garantia

```typescript
// RN-GAR-001: Verificar se está no prazo
function isWarrantyValid(warranty: Warranty): boolean {
  if (warranty.status !== 'ACTIVE') return false;
  return new Date() <= warranty.endDate;
}

// RN-GAR-002: Verificar se problema é coberto
function isProblemCovered(warranty: Warranty, problem: string): boolean {
  // Verificar exclusões
  const exclusions = getWarrantyExclusions();

  for (const exclusion of exclusions) {
    if (problem.toLowerCase().includes(exclusion.toLowerCase())) {
      return false;
    }
  }

  return true;
}
```

### Exclusões de Garantia

```typescript
const DEFAULT_EXCLUSIONS = [
  'Danos causados por mau uso',
  'Quedas ou impactos',
  'Contato com líquidos',
  'Tentativa de reparo por terceiros',
  'Danos em componentes não reparados',
  'Uso de acessórios não originais',
  'Desgaste natural',
  'Oxidação',
  'Problemas de software',
  'Vírus ou malware',
];
```

### Criar Retorno

```typescript
// RN-GAR-010: Criar OS de retorno vinculada
async function createWarrantyReturn(
  warrantyId: string,
  reportedIssue: string,
  userId: string
): Promise<ServiceOrder> {
  const warranty = await getWarranty(warrantyId);

  // Validar garantia
  if (!isWarrantyValid(warranty)) {
    throw new Error('Garantia expirada ou inativa');
  }

  // Criar OS de retorno
  const returnOrder = await createServiceOrder({
    type: 'WARRANTY_RETURN',
    customerId: warranty.customerId,
    equipmentId: warranty.serviceOrder.equipmentId,
    originalOrderId: warranty.serviceOrderId,
    warrantyId: warranty.id,
    reportedIssue,
    // Valores zerados
    laborCost: 0,
    partsCost: 0,
    total: 0,
  });

  // Registrar retorno
  await createWarrantyReturnRecord({
    warrantyId,
    returnOrderId: returnOrder.id,
    reason: reportedIssue,
    status: 'PENDING_ANALYSIS',
  });

  return returnOrder;
}
```

### Análise do Técnico

```typescript
// RN-GAR-020: Técnico analisa se é coberto pela garantia
interface WarrantyAnalysis {
  returnId: string;
  isCovered: boolean;
  reason: string;
  relatedToOriginalRepair: boolean;
  evidencePhotos: string[];
  technicianNotes: string;
}

async function submitWarrantyAnalysis(analysis: WarrantyAnalysis): Promise<void> {
  const warrantyReturn = await getWarrantyReturn(analysis.returnId);

  if (analysis.isCovered) {
    // Atualizar para prosseguir sem cobrança
    await updateWarrantyReturn(analysis.returnId, {
      status: 'APPROVED',
      analysis,
    });

    // Atualizar OS para prosseguir
    await updateServiceOrder(warrantyReturn.returnOrderId, {
      status: 'APPROVED', // Pula aprovação de orçamento
    });
  } else {
    // Converter para OS normal com cobrança
    await updateWarrantyReturn(analysis.returnId, {
      status: 'REJECTED',
      analysis,
    });

    // Criar orçamento para o cliente
    await createQuoteForReturn(warrantyReturn.returnOrderId);

    // Notificar cliente
    await notifyCustomer(warrantyReturn.customerId, 'WARRANTY_NOT_COVERED', {
      reason: analysis.reason,
    });
  }
}
```

---

## Termos de Garantia

### Template Padrão

```typescript
const DEFAULT_WARRANTY_TERMS = `
TERMO DE GARANTIA

A ${company.name} garante o serviço executado e as peças instaladas
conforme especificado neste documento, pelo prazo indicado, contado
a partir da data de entrega do equipamento.

CONDIÇÕES:
1. A garantia cobre defeitos decorrentes do serviço executado ou
   das peças instaladas.
2. O prazo de garantia é específico para cada item, conforme
   discriminado no orçamento aprovado.

EXCLUSÕES - A garantia NÃO cobre:
${DEFAULT_EXCLUSIONS.map(e => `• ${e}`).join('\n')}

PROCEDIMENTO:
Em caso de problema coberto pela garantia, o cliente deve retornar
ao estabelecimento com este documento e o equipamento para análise.

IMPORTANTE:
• Guarde este documento durante todo o período de garantia.
• A violação de qualquer lacre anula a garantia.
• Reparos realizados por terceiros anulam a garantia.
`;
```

### Aceite Digital

```typescript
// Cliente aceita termos via link
interface WarrantyAcceptance {
  warrantyId: string;
  acceptedAt: Date;
  ipAddress: string;
  userAgent: string;
  signature?: string; // Assinatura digital opcional
}
```

---

## Métricas de Garantia

```typescript
interface WarrantyMetrics {
  // Taxa de retorno
  returnRate: number;           // % de OS com retorno em garantia

  // Por tipo de problema
  returnsByIssue: {
    issue: string;
    count: number;
    percentage: number;
  }[];

  // Por técnico
  returnsByTechnician: {
    technicianId: string;
    name: string;
    totalOrders: number;
    returnsCount: number;
    returnRate: number;
  }[];

  // Por tipo de peça
  returnsByPartType: {
    type: 'ORIGINAL' | 'COMPATIBLE' | 'GENERIC';
    count: number;
    percentage: number;
  }[];

  // Custo
  totalWarrantyCost: number;    // Custo total de garantias
  averageCostPerReturn: number;
}
```

---

## Impressão do Termo

```typescript
interface WarrantyPrintData {
  company: {
    name: string;
    document: string;
    address: string;
    phone: string;
  };
  customer: {
    name: string;
    document: string;
  };
  serviceOrder: {
    number: string;
    completedAt: Date;
  };
  equipment: {
    type: string;
    brand: string;
    model: string;
    serialNumber?: string;
  };
  items: {
    description: string;
    warrantyDays: number;
    expiresAt: Date;
  }[];
  terms: string;
  qrCode: string; // Link para verificação online
}
```

---

## Configurações de Garantia

| Configuração | Descrição | Default |
|--------------|-----------|---------|
| `warranty.service.days` | Garantia de serviço | 90 |
| `warranty.part.original.days` | Garantia peça original | 90 |
| `warranty.part.compatible.days` | Garantia peça compatível | 60 |
| `warranty.part.generic.days` | Garantia peça genérica | 30 |
| `warranty.renewOnReturn` | Renovar garantia após retorno | false |
| `warranty.requireAcceptance` | Exigir aceite digital | true |
| `warranty.autoCreateOnComplete` | Criar automaticamente ao finalizar | true |

---

## Permissões

| Ação | Atendente | Técnico | Gerente | Admin |
|------|-----------|---------|---------|-------|
| Ver garantias | ✅ | ✅ | ✅ | ✅ |
| Criar retorno | ✅ | ❌ | ✅ | ✅ |
| Analisar retorno | ❌ | ✅ | ✅ | ✅ |
| Anular garantia | ❌ | ❌ | ✅ | ✅ |
| Ver métricas | ❌ | ❌ | ✅ | ✅ |
| Configurar prazos | ❌ | ❌ | ❌ | ✅ |

---

**Voltar para** [Regras de Negócio](./README.md)
