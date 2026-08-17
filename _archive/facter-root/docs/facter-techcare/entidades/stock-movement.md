# StockMovement (Movimentação de Estoque)

> **Entidade que registra todas as movimentações de estoque.**

---

## Schema Prisma

```prisma
model StockMovement {
  id              String          @id @default(uuid())
  companyId       String
  company         Company         @relation(fields: [companyId], references: [id])

  // Peça movimentada
  partId          String
  part            Part            @relation(fields: [partId], references: [id])

  // Tipo de movimentação
  type            MovementType

  // Quantidades
  quantity        Int             // Positivo = entrada, Negativo = saída
  previousStock   Int             // Estoque antes
  newStock        Int             // Estoque depois

  // Custo (para entradas)
  unitCost        Decimal?        @db.Decimal(10, 2)
  totalCost       Decimal?        @db.Decimal(12, 2)

  // Referências
  serviceOrderId  String?
  serviceOrder    ServiceOrder?   @relation(fields: [serviceOrderId], references: [id])
  quoteId         String?
  quote           Quote?          @relation(fields: [quoteId], references: [id])
  supplierId      String?
  supplier        Supplier?       @relation(fields: [supplierId], references: [id])
  purchaseOrderId String?
  purchaseOrder   PurchaseOrder?  @relation(fields: [purchaseOrderId], references: [id])

  // Lote (se aplicável)
  batchNumber     String?
  expirationDate  DateTime?

  // Localização
  locationFrom    String?         // Prateleira/gaveta origem
  locationTo      String?         // Prateleira/gaveta destino

  // Motivo (para ajustes)
  reason          String?

  // Quem realizou
  createdById     String
  createdBy       Membership      @relation(fields: [createdById], references: [id])

  // Aprovação (se necessário)
  requiresApproval Boolean        @default(false)
  approvedById    String?
  approvedBy      Membership?     @relation("ApprovedBy", fields: [approvedById], references: [id])
  approvedAt      DateTime?

  // Documento fiscal
  invoiceNumber   String?
  invoiceDate     DateTime?

  // Observações
  notes           String?

  createdAt       DateTime        @default(now())

  @@index([companyId])
  @@index([companyId, partId])
  @@index([companyId, type])
  @@index([companyId, createdAt])
  @@index([companyId, serviceOrderId])
}

enum MovementType {
  // Entradas
  PURCHASE        // Compra de fornecedor
  RETURN          // Devolução de cliente
  ADJUSTMENT_IN   // Ajuste de inventário (entrada)
  TRANSFER_IN     // Transferência de outra unidade
  INITIAL         // Estoque inicial

  // Saídas
  SALE            // Venda/uso em OS
  LOSS            // Perda/dano
  ADJUSTMENT_OUT  // Ajuste de inventário (saída)
  TRANSFER_OUT    // Transferência para outra unidade
  WARRANTY        // Devolução garantia fornecedor

  // Reservas
  RESERVE         // Reservado para OS/orçamento
  RELEASE         // Liberação de reserva
}
```

---

## Fluxo de Movimentações

```
┌─────────────────────────────────────────────────────────────────┐
│                    TIPOS DE MOVIMENTAÇÃO                        │
└─────────────────────────────────────────────────────────────────┘

COMPRA (PURCHASE)
┌──────────┐     ┌──────────┐     ┌──────────┐
│ Pedido   │ ──▶ │ Receber  │ ──▶ │ Estoque  │
│ Compra   │     │ Material │     │    +N    │
└──────────┘     └──────────┘     └──────────┘

USO EM OS (SALE)
┌──────────┐     ┌──────────┐     ┌──────────┐
│ Orçamento│ ──▶ │ Aprovar  │ ──▶ │ Estoque  │
│ Aprovado │     │ Baixa    │     │    -N    │
└──────────┘     └──────────┘     └──────────┘

RESERVA (RESERVE/RELEASE)
┌──────────┐     ┌──────────┐     ┌──────────┐
│ Orçamento│ ──▶ │ Reservar │ ──▶ │ Estoque  │
│ Criado   │     │ Peças    │     │ Reservado│
└──────────┘     └──────────┘     └──────────┘
       │                                │
       │         ┌──────────┐           │
       └────────▶│ Recusado │◀──────────┘
                 │ Liberar  │
                 └──────────┘

AJUSTE (ADJUSTMENT_IN/OUT)
┌──────────┐     ┌──────────┐     ┌──────────┐
│ Contagem │ ──▶ │ Ajustar  │ ──▶ │ Estoque  │
│ Física   │     │ Sistema  │     │  ±N      │
└──────────┘     └──────────┘     └──────────┘
```

---

## Serviço de Estoque

```typescript
// services/stock.service.ts
class StockService {
  // Entrada de estoque (compra)
  async registerPurchase(params: {
    partId: string;
    quantity: number;
    unitCost: number;
    supplierId?: string;
    invoiceNumber?: string;
    invoiceDate?: Date;
    batchNumber?: string;
    expirationDate?: Date;
    notes?: string;
  }) {
    const part = await prisma.part.findUnique({
      where: { id: params.partId },
    });

    if (!part) throw new Error('Peça não encontrada');

    const previousStock = part.quantity;
    const newStock = previousStock + params.quantity;

    // Transação
    return prisma.$transaction(async (tx) => {
      // Criar movimentação
      const movement = await tx.stockMovement.create({
        data: {
          companyId: part.companyId,
          partId: params.partId,
          type: 'PURCHASE',
          quantity: params.quantity,
          previousStock,
          newStock,
          unitCost: params.unitCost,
          totalCost: params.unitCost * params.quantity,
          supplierId: params.supplierId,
          invoiceNumber: params.invoiceNumber,
          invoiceDate: params.invoiceDate,
          batchNumber: params.batchNumber,
          expirationDate: params.expirationDate,
          notes: params.notes,
          createdById: getCurrentMembershipId(),
        },
      });

      // Atualizar estoque
      await tx.part.update({
        where: { id: params.partId },
        data: {
          quantity: newStock,
          // Atualizar custo médio
          costPrice: this.calculateAverageCost(
            previousStock,
            part.costPrice,
            params.quantity,
            params.unitCost
          ),
          lastPurchasePrice: params.unitCost,
          lastPurchaseDate: new Date(),
        },
      });

      return movement;
    });
  }

  // Saída de estoque (uso em OS)
  async registerSale(params: {
    partId: string;
    quantity: number;
    serviceOrderId: string;
    quoteId?: string;
  }) {
    const part = await prisma.part.findUnique({
      where: { id: params.partId },
    });

    if (!part) throw new Error('Peça não encontrada');

    const previousStock = part.quantity;
    const newStock = previousStock - params.quantity;

    // Verificar estoque
    const config = await getInventoryConfig(part.companyId);
    if (newStock < 0 && !config.allowNegativeStock) {
      throw new Error('Estoque insuficiente');
    }

    return prisma.$transaction(async (tx) => {
      const movement = await tx.stockMovement.create({
        data: {
          companyId: part.companyId,
          partId: params.partId,
          type: 'SALE',
          quantity: -params.quantity,
          previousStock,
          newStock,
          unitCost: part.costPrice,
          totalCost: part.costPrice.mul(params.quantity),
          serviceOrderId: params.serviceOrderId,
          quoteId: params.quoteId,
          createdById: getCurrentMembershipId(),
        },
      });

      await tx.part.update({
        where: { id: params.partId },
        data: { quantity: newStock },
      });

      // Verificar estoque mínimo
      if (newStock <= part.minQuantity) {
        await this.notifyLowStock(part);
      }

      return movement;
    });
  }

  // Reservar estoque
  async reserve(params: {
    partId: string;
    quantity: number;
    quoteId: string;
  }) {
    const part = await prisma.part.findUnique({
      where: { id: params.partId },
    });

    if (!part) throw new Error('Peça não encontrada');

    const availableStock = part.quantity - part.reserved;
    if (params.quantity > availableStock) {
      throw new Error('Estoque disponível insuficiente');
    }

    return prisma.$transaction(async (tx) => {
      await tx.stockMovement.create({
        data: {
          companyId: part.companyId,
          partId: params.partId,
          type: 'RESERVE',
          quantity: params.quantity,
          previousStock: part.quantity,
          newStock: part.quantity, // Não altera estoque físico
          quoteId: params.quoteId,
          createdById: getCurrentMembershipId(),
        },
      });

      await tx.part.update({
        where: { id: params.partId },
        data: { reserved: { increment: params.quantity } },
      });
    });
  }

  // Liberar reserva
  async release(params: {
    partId: string;
    quantity: number;
    quoteId: string;
    reason?: string;
  }) {
    const part = await prisma.part.findUnique({
      where: { id: params.partId },
    });

    return prisma.$transaction(async (tx) => {
      await tx.stockMovement.create({
        data: {
          companyId: part.companyId,
          partId: params.partId,
          type: 'RELEASE',
          quantity: -params.quantity,
          previousStock: part.quantity,
          newStock: part.quantity,
          quoteId: params.quoteId,
          reason: params.reason,
          createdById: getCurrentMembershipId(),
        },
      });

      await tx.part.update({
        where: { id: params.partId },
        data: { reserved: { decrement: params.quantity } },
      });
    });
  }

  // Ajuste de estoque
  async adjust(params: {
    partId: string;
    newQuantity: number;
    reason: string;
  }) {
    const part = await prisma.part.findUnique({
      where: { id: params.partId },
    });

    const difference = params.newQuantity - part.quantity;
    const type = difference > 0 ? 'ADJUSTMENT_IN' : 'ADJUSTMENT_OUT';

    // Verificar se precisa aprovação
    const config = await getInventoryConfig(part.companyId);
    const requiresApproval = config.requireApprovalForAdjustment;

    return prisma.$transaction(async (tx) => {
      const movement = await tx.stockMovement.create({
        data: {
          companyId: part.companyId,
          partId: params.partId,
          type,
          quantity: difference,
          previousStock: part.quantity,
          newStock: params.newQuantity,
          reason: params.reason,
          requiresApproval,
          createdById: getCurrentMembershipId(),
        },
      });

      // Se não precisa aprovação, atualiza imediatamente
      if (!requiresApproval) {
        await tx.part.update({
          where: { id: params.partId },
          data: { quantity: params.newQuantity },
        });
      }

      return movement;
    });
  }

  // Calcular custo médio
  private calculateAverageCost(
    currentQty: number,
    currentCost: Decimal,
    newQty: number,
    newCost: number
  ): Decimal {
    const totalCurrentValue = currentCost.mul(currentQty);
    const totalNewValue = new Decimal(newCost).mul(newQty);
    const totalQty = currentQty + newQty;

    if (totalQty === 0) return new Decimal(0);

    return totalCurrentValue.add(totalNewValue).div(totalQty);
  }

  // Notificar estoque baixo
  private async notifyLowStock(part: Part) {
    // Criar notificação
    await createNotification({
      companyId: part.companyId,
      type: 'LOW_STOCK',
      title: 'Estoque baixo',
      message: `A peça "${part.name}" está com estoque baixo (${part.quantity} unidades)`,
      data: { partId: part.id },
    });
  }
}
```

---

## Endpoints da API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/stock/movements` | Listar movimentações |
| GET | `/stock/movements/:id` | Detalhes da movimentação |
| POST | `/stock/purchase` | Registrar compra |
| POST | `/stock/adjust` | Ajustar estoque |
| POST | `/stock/reserve` | Reservar estoque |
| POST | `/stock/release` | Liberar reserva |
| GET | `/stock/report` | Relatório de movimentações |
| POST | `/stock/movements/:id/approve` | Aprovar ajuste |

### Filtros

```http
GET /stock/movements?partId=xxx&type=PURCHASE&from=2025-01-01&to=2025-01-31

{
  "data": [
    {
      "id": "...",
      "type": "PURCHASE",
      "quantity": 10,
      "previousStock": 5,
      "newStock": 15,
      "unitCost": 50.00,
      "totalCost": 500.00,
      "supplier": { "name": "Fornecedor X" },
      "invoiceNumber": "NF-12345",
      "createdBy": { "name": "João" },
      "createdAt": "2025-01-15T10:00:00Z"
    }
  ],
  "summary": {
    "totalEntries": 150,
    "totalExits": 120,
    "netMovement": 30,
    "totalCost": 7500.00
  }
}
```

---

## Regras de Negócio

### Entradas
- Compras requerem fornecedor e/ou nota fiscal
- Custo unitário obrigatório para cálculo de custo médio
- Lote e validade opcionais (para peças com controle)

### Saídas
- Verificar disponibilidade antes de baixar
- Estoque negativo só se configurado
- Vincula à OS/orçamento automaticamente

### Reservas
- Automática ao criar orçamento (configurável)
- Liberada se orçamento recusado
- Convertida em saída se orçamento aprovado

### Ajustes
- Requer justificativa
- Pode requerer aprovação (configurável)
- Auditoria completa

### Métodos de Custeio
- **AVERAGE**: Custo médio ponderado (padrão)
- **FIFO**: Primeiro a entrar, primeiro a sair
- **LIFO**: Último a entrar, primeiro a sair

---

## Relatório de Movimentações

```tsx
function StockMovementReport() {
  const [filters, setFilters] = useState({
    partId: null,
    type: null,
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  const { data } = useQuery({
    queryKey: ['stock-movements-report', filters],
    queryFn: () => api.get('/stock/report', { params: filters }),
  });

  return (
    <div className="space-y-6">
      <FiltersBar filters={filters} onChange={setFilters} />

      {/* Resumo */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          title="Entradas"
          value={data?.summary.totalEntries}
          icon={ArrowDownCircle}
          color="green"
        />
        <MetricCard
          title="Saídas"
          value={data?.summary.totalExits}
          icon={ArrowUpCircle}
          color="red"
        />
        <MetricCard
          title="Saldo"
          value={data?.summary.netMovement}
          icon={Scale}
        />
        <MetricCard
          title="Valor Total"
          value={formatCurrency(data?.summary.totalCost)}
          icon={DollarSign}
        />
      </div>

      {/* Tabela */}
      <DataTable
        columns={columns}
        data={data?.data}
        pagination
      />
    </div>
  );
}
```

---

**Voltar para** [Entidades](./README.md)
