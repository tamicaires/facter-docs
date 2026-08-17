# Commission (Comissão)

> **Entidades que gerenciam configuração e registro de comissões de técnicos.**

---

## Schema Prisma

```prisma
// Configuração de comissão do técnico
model TechnicianCommission {
  id              String          @id @default(uuid())
  companyId       String
  company         Company         @relation(fields: [companyId], references: [id])

  // Vinculado ao membership (técnico por empresa)
  membershipId    String          @unique
  membership      Membership      @relation(fields: [membershipId], references: [id])

  // Modelo de comissão
  model           CommissionModel @default(PERCENTAGE)
  basePercentage  Decimal?        @db.Decimal(5, 2)  // Ex: 30.00 = 30%
  fixedAmount     Decimal?        @db.Decimal(10, 2) // Valor fixo por OS

  // Regras específicas
  rules           CommissionRule[]

  // Configurações adicionais
  includesParts   Boolean         @default(false)  // Comissão sobre peças?
  minOrderValue   Decimal?        @db.Decimal(10, 2) // Valor mínimo para comissão

  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  @@index([companyId])
}

// Regras específicas de comissão
model CommissionRule {
  id              String              @id @default(uuid())
  commissionId    String
  commission      TechnicianCommission @relation(fields: [commissionId], references: [id], onDelete: Cascade)

  // Tipo de regra
  type            CommissionRuleType

  // Critérios
  serviceType     String?             // Tipo de serviço específico
  equipmentType   String?             // Tipo de equipamento
  minValue        Decimal?            @db.Decimal(10, 2) // Valor mínimo (escalonado)
  maxValue        Decimal?            @db.Decimal(10, 2) // Valor máximo (escalonado)
  priority        ServicePriority?    // Prioridade da OS

  // Valor da comissão
  percentage      Decimal?            @db.Decimal(5, 2)
  fixedAmount     Decimal?            @db.Decimal(10, 2)

  // Prioridade da regra (maior = aplica primeiro)
  rulePriority    Int                 @default(0)

  createdAt       DateTime            @default(now())
}

// Registro de comissão calculada
model CommissionEntry {
  id              String          @id @default(uuid())
  companyId       String
  company         Company         @relation(fields: [companyId], references: [id])

  // Técnico
  membershipId    String
  membership      Membership      @relation(fields: [membershipId], references: [id])

  // Referências
  serviceOrderId  String
  serviceOrder    ServiceOrder    @relation(fields: [serviceOrderId], references: [id])
  paymentId       String?
  payment         Payment?        @relation(fields: [paymentId], references: [id])

  // Valores
  orderValue      Decimal         @db.Decimal(10, 2) // Valor total da OS
  laborValue      Decimal         @db.Decimal(10, 2) // Valor de mão de obra
  commissionBase  Decimal         @db.Decimal(10, 2) // Base de cálculo
  commissionRate  Decimal         @db.Decimal(5, 2)  // % aplicado
  commissionValue Decimal         @db.Decimal(10, 2) // Valor final da comissão

  // Regras aplicadas (para auditoria)
  appliedRules    Json?           // string[]

  // Status
  status          CommissionStatus @default(PENDING)

  // Pagamento ao técnico
  paidAt          DateTime?
  paidById        String?
  paidBy          Membership?     @relation("CommissionPayer", fields: [paidById], references: [id])
  paymentMethod   String?         // PIX, TRANSFER, CASH
  paymentNotes    String?

  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  @@index([companyId])
  @@index([companyId, membershipId])
  @@index([companyId, status])
  @@index([companyId, createdAt])
  @@index([serviceOrderId])
}

enum CommissionModel {
  PERCENTAGE      // Percentual sobre valor
  FIXED           // Valor fixo por OS
  TIERED          // Escalonado por volume
  MIXED           // Fixo + percentual
}

enum CommissionRuleType {
  SERVICE_TYPE    // Por tipo de serviço
  EQUIPMENT_TYPE  // Por tipo de equipamento
  VALUE_RANGE     // Por faixa de valor
  PRIORITY        // Por prioridade da OS
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

## Fluxo de Comissão

```
┌─────────────────────────────────────────────────────────────────┐
│                    PAGAMENTO DA OS CONFIRMADO                   │
└────────┬────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    IDENTIFICAR TÉCNICO DA OS                    │
│                    (membership.role = TECHNICIAN)               │
└────────┬────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BUSCAR CONFIG DE COMISSÃO                    │
│                    (TechnicianCommission)                       │
└────────┬────────────────────────────────────────────────────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
[TEM CONFIG] [SEM CONFIG]
    │         │
    │         ▼
    │    ┌─────────────────┐
    │    │ Não gera        │
    │    │ comissão        │
    │    └─────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CALCULAR BASE                                │
│                    (com ou sem peças)                           │
└────────┬────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    APLICAR REGRAS                               │
│                    (verificar regras específicas)               │
└────────┬────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CRIAR COMMISSION ENTRY                       │
│                    status: AVAILABLE                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Serviço de Comissões

```typescript
// services/commission.service.ts
class CommissionService {
  /**
   * Calcular comissão quando OS é paga
   */
  async calculateCommission(
    serviceOrderId: string,
    paymentId: string
  ): Promise<CommissionEntry | null> {
    const serviceOrder = await prisma.serviceOrder.findUnique({
      where: { id: serviceOrderId },
      include: {
        quote: { include: { items: true } },
        assignedTo: {
          include: {
            technicianProfile: {
              include: { commissionConfig: { include: { rules: true } } },
            },
          },
        },
      },
    });

    if (!serviceOrder?.assignedTo) {
      return null; // Sem técnico atribuído
    }

    const commissionConfig =
      serviceOrder.assignedTo.technicianProfile?.commissionConfig;

    if (!commissionConfig) {
      return null; // Técnico sem configuração de comissão
    }

    // Calcular valores
    const orderValue = serviceOrder.total;
    const laborValue = serviceOrder.quote?.items
      .filter((item) => item.type === 'SERVICE')
      .reduce((sum, item) => sum.add(item.total), new Decimal(0)) ?? new Decimal(0);

    const commissionBase = commissionConfig.includesParts ? orderValue : laborValue;

    // Verificar valor mínimo
    if (
      commissionConfig.minOrderValue &&
      orderValue.lt(commissionConfig.minOrderValue)
    ) {
      return null;
    }

    // Aplicar regras e calcular
    const { rate, value, appliedRules } = this.applyRules(
      commissionConfig,
      serviceOrder,
      commissionBase
    );

    // Criar entrada de comissão
    return prisma.commissionEntry.create({
      data: {
        companyId: serviceOrder.companyId,
        membershipId: serviceOrder.assignedToId!,
        serviceOrderId,
        paymentId,
        orderValue,
        laborValue,
        commissionBase,
        commissionRate: rate,
        commissionValue: value,
        appliedRules,
        status: 'AVAILABLE',
      },
    });
  }

  /**
   * Aplicar regras de comissão
   */
  private applyRules(
    config: TechnicianCommission & { rules: CommissionRule[] },
    serviceOrder: ServiceOrder,
    base: Decimal
  ): { rate: Decimal; value: Decimal; appliedRules: string[] } {
    const appliedRules: string[] = [];

    // Ordenar regras por prioridade
    const rules = [...config.rules].sort((a, b) => b.rulePriority - a.rulePriority);

    // Verificar regras específicas
    for (const rule of rules) {
      if (this.ruleMatches(rule, serviceOrder)) {
        appliedRules.push(`${rule.type}: ${rule.percentage || rule.fixedAmount}`);

        if (rule.percentage) {
          return {
            rate: rule.percentage,
            value: base.mul(rule.percentage).div(100),
            appliedRules,
          };
        } else if (rule.fixedAmount) {
          return {
            rate: new Decimal(0),
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
          rate: config.basePercentage!,
          value: base.mul(config.basePercentage!).div(100),
          appliedRules,
        };

      case 'FIXED':
        return {
          rate: new Decimal(0),
          value: config.fixedAmount!,
          appliedRules,
        };

      case 'MIXED':
        return {
          rate: config.basePercentage!,
          value: config.fixedAmount!.add(base.mul(config.basePercentage!).div(100)),
          appliedRules,
        };

      default:
        return { rate: new Decimal(0), value: new Decimal(0), appliedRules };
    }
  }

  /**
   * Verificar se regra corresponde
   */
  private ruleMatches(rule: CommissionRule, serviceOrder: ServiceOrder): boolean {
    switch (rule.type) {
      case 'SERVICE_TYPE':
        return serviceOrder.serviceType === rule.serviceType;

      case 'EQUIPMENT_TYPE':
        return serviceOrder.equipment?.type === rule.equipmentType;

      case 'VALUE_RANGE':
        const value = serviceOrder.total;
        return (
          value.gte(rule.minValue || 0) &&
          value.lte(rule.maxValue || Decimal.MAX_VALUE)
        );

      case 'PRIORITY':
        return serviceOrder.priority === rule.priority;

      default:
        return false;
    }
  }

  /**
   * Pagar comissões
   */
  async payCommissions(params: {
    membershipId: string;
    entryIds: string[];
    method: string;
    notes?: string;
    paidById: string;
  }): Promise<void> {
    // Validar entries
    const entries = await prisma.commissionEntry.findMany({
      where: {
        id: { in: params.entryIds },
        membershipId: params.membershipId,
        status: 'AVAILABLE',
      },
    });

    if (entries.length !== params.entryIds.length) {
      throw new Error('Algumas comissões não estão disponíveis');
    }

    const totalValue = entries.reduce(
      (sum, e) => sum.add(e.commissionValue),
      new Decimal(0)
    );

    // Atualizar para PAID
    await prisma.commissionEntry.updateMany({
      where: { id: { in: params.entryIds } },
      data: {
        status: 'PAID',
        paidAt: new Date(),
        paidById: params.paidById,
        paymentMethod: params.method,
        paymentNotes: params.notes,
      },
    });

    // Registrar auditoria
    await audit({
      entityType: 'CommissionEntry',
      entityId: params.membershipId,
      action: 'UPDATE',
      metadata: {
        action: 'PAYMENT',
        count: entries.length,
        totalValue: totalValue.toNumber(),
        method: params.method,
      },
    });
  }

  /**
   * Resumo de comissões do técnico
   */
  async getTechnicianSummary(
    membershipId: string,
    period: { from: Date; to: Date }
  ) {
    const entries = await prisma.commissionEntry.findMany({
      where: {
        membershipId,
        createdAt: { gte: period.from, lte: period.to },
      },
    });

    return {
      pending: entries
        .filter((e) => e.status === 'PENDING')
        .reduce((sum, e) => sum.add(e.commissionValue), new Decimal(0)),
      available: entries
        .filter((e) => e.status === 'AVAILABLE')
        .reduce((sum, e) => sum.add(e.commissionValue), new Decimal(0)),
      paid: entries
        .filter((e) => e.status === 'PAID')
        .reduce((sum, e) => sum.add(e.commissionValue), new Decimal(0)),
      ordersCount: entries.length,
      entries,
    };
  }
}
```

---

## Endpoints da API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/commissions/config` | Minha configuração de comissão |
| GET | `/commissions/config/:membershipId` | Config de um técnico (admin) |
| PUT | `/commissions/config/:membershipId` | Atualizar config (admin) |
| GET | `/commissions` | Minhas comissões |
| GET | `/commissions/summary` | Resumo de comissões |
| GET | `/commissions/all` | Todas comissões (admin) |
| POST | `/commissions/pay` | Pagar comissões (admin) |

---

## Regras de Negócio

### Configuração
- Cada técnico pode ter configuração própria de comissão
- Configuração padrão pode ser definida na empresa
- Regras específicas têm prioridade sobre regra base

### Cálculo
- Comissão é calculada automaticamente quando pagamento é confirmado
- Base de cálculo pode incluir ou não o valor das peças
- Regras são aplicadas em ordem de prioridade

### Pagamento
- Comissões ficam "disponíveis" após pagamento da OS
- Gerente/Admin realiza pagamento ao técnico
- Registro completo de quando e como foi pago

### Cancelamento
- Se OS for cancelada/estornada, comissão é cancelada
- Comissões já pagas precisam de ajuste manual

---

**Voltar para** [Entidades](./README.md)
