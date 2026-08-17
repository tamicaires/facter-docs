# Supplier (Fornecedor)

> **Entidade que representa fornecedores de peças e componentes.**

---

## Schema Prisma

```prisma
model Supplier {
  id              String          @id @default(uuid())
  companyId       String
  company         Company         @relation(fields: [companyId], references: [id])

  // Identificação
  name            String
  tradeName       String?         // Nome fantasia
  document        String?         // CNPJ/CPF
  documentType    DocumentType?

  // Contato principal
  email           String?
  phone           String?
  website         String?

  // Contatos adicionais
  contacts        SupplierContact[]

  // Endereço
  address         Json?           // Address

  // Categorias de produtos
  categories      PartCategory[]

  // Condições comerciais
  paymentTerms    String?         // "30/60/90 dias", "À vista"
  minOrderValue   Decimal?        @db.Decimal(10, 2)
  deliveryTime    Int?            // Dias úteis

  // Avaliação
  rating          Decimal?        @db.Decimal(3, 2)  // 1-5
  totalOrders     Int             @default(0)
  onTimeDeliveryRate Decimal?     @db.Decimal(5, 2)  // Percentual

  // Status
  status          SupplierStatus  @default(ACTIVE)

  // Relacionamentos
  parts           Part[]          @relation("PartSuppliers")
  stockMovements  StockMovement[]
  purchaseOrders  PurchaseOrder[]

  // Observações
  notes           String?

  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  deletedAt       DateTime?

  @@index([companyId])
  @@index([companyId, status])
  @@index([companyId, name])
}

model SupplierContact {
  id              String          @id @default(uuid())
  supplierId      String
  supplier        Supplier        @relation(fields: [supplierId], references: [id])

  name            String
  role            String?         // Cargo/função
  email           String?
  phone           String?
  whatsapp        String?
  isPrimary       Boolean         @default(false)

  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
}

model PurchaseOrder {
  id              String          @id @default(uuid())
  companyId       String
  company         Company         @relation(fields: [companyId], references: [id])

  // Número do pedido
  number          String          // PC-2025-00001

  // Fornecedor
  supplierId      String
  supplier        Supplier        @relation(fields: [supplierId], references: [id])

  // Itens
  items           PurchaseOrderItem[]

  // Valores
  subtotal        Decimal         @db.Decimal(12, 2)
  discount        Decimal         @default(0) @db.Decimal(12, 2)
  shipping        Decimal         @default(0) @db.Decimal(10, 2)
  total           Decimal         @db.Decimal(12, 2)

  // Datas
  expectedDelivery DateTime?
  deliveredAt     DateTime?

  // Status
  status          PurchaseOrderStatus @default(DRAFT)

  // Documento fiscal
  invoiceNumber   String?
  invoiceDate     DateTime?
  invoiceUrl      String?

  // Quem criou
  createdById     String
  createdBy       Membership      @relation(fields: [createdById], references: [id])

  // Aprovação
  approvedById    String?
  approvedBy      Membership?     @relation("PurchaseApprover", fields: [approvedById], references: [id])
  approvedAt      DateTime?

  // Observações
  notes           String?

  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  @@unique([companyId, number])
  @@index([companyId])
  @@index([companyId, supplierId])
  @@index([companyId, status])
}

model PurchaseOrderItem {
  id              String          @id @default(uuid())
  purchaseOrderId String
  purchaseOrder   PurchaseOrder   @relation(fields: [purchaseOrderId], references: [id])

  // Peça
  partId          String
  part            Part            @relation(fields: [partId], references: [id])

  // Quantidades
  quantity        Int
  receivedQty     Int             @default(0)

  // Valores
  unitCost        Decimal         @db.Decimal(10, 2)
  totalCost       Decimal         @db.Decimal(12, 2)

  createdAt       DateTime        @default(now())
}

enum SupplierStatus {
  ACTIVE          // Ativo
  INACTIVE        // Inativo
  BLOCKED         // Bloqueado (problemas)
}

enum PurchaseOrderStatus {
  DRAFT           // Rascunho
  PENDING         // Aguardando aprovação
  APPROVED        // Aprovado
  SENT            // Enviado ao fornecedor
  PARTIAL         // Parcialmente recebido
  RECEIVED        // Recebido
  CANCELLED       // Cancelado
}
```

---

## Fluxo de Pedido de Compra

```
┌─────────────────────────────────────────────────────────────────┐
│                    CRIAR PEDIDO                                 │
│                    status: DRAFT                                │
└────────┬────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ADICIONAR ITENS                              │
│                    - Peças necessárias                          │
│                    - Quantidades                                │
│                    - Preços negociados                          │
└────────┬────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ENVIAR PARA APROVAÇÃO                        │
│                    status: PENDING                              │
└────────┬────────────────────────────────────────────────────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
[APROVADO] [RECUSADO]
    │         │
    │         ▼
    │    ┌─────────────────┐
    │    │ status: DRAFT   │
    │    │ (voltar editar) │
    │    └─────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ENVIAR AO FORNECEDOR                         │
│                    status: SENT                                 │
└────────┬────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AGUARDAR ENTREGA                             │
│                    (acompanhar prazo)                           │
└────────┬────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    RECEBER MATERIAL                             │
│                    - Conferir quantidades                       │
│                    - Vincular nota fiscal                       │
│                    - Dar entrada no estoque                     │
└────────┬────────────────────────────────────────────────────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
[COMPLETO] [PARCIAL]
    │         │
    │         ▼
    │    ┌─────────────────┐
    │    │ status: PARTIAL │
    │    │ Aguardar resto  │
    │    └─────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FINALIZADO                                   │
│                    status: RECEIVED                             │
│                    Estoque atualizado                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Endpoints da API

### Fornecedores

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/suppliers` | Listar fornecedores |
| GET | `/suppliers/:id` | Buscar fornecedor |
| POST | `/suppliers` | Criar fornecedor |
| PUT | `/suppliers/:id` | Atualizar fornecedor |
| DELETE | `/suppliers/:id` | Desativar fornecedor |
| GET | `/suppliers/:id/parts` | Peças do fornecedor |
| GET | `/suppliers/:id/orders` | Pedidos do fornecedor |

### Pedidos de Compra

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/purchase-orders` | Listar pedidos |
| GET | `/purchase-orders/:id` | Buscar pedido |
| POST | `/purchase-orders` | Criar pedido |
| PUT | `/purchase-orders/:id` | Atualizar pedido |
| POST | `/purchase-orders/:id/submit` | Enviar para aprovação |
| POST | `/purchase-orders/:id/approve` | Aprovar pedido |
| POST | `/purchase-orders/:id/reject` | Recusar pedido |
| POST | `/purchase-orders/:id/send` | Marcar como enviado |
| POST | `/purchase-orders/:id/receive` | Registrar recebimento |
| DELETE | `/purchase-orders/:id` | Cancelar pedido |

---

## Componente de Cadastro

```tsx
function SupplierForm({ supplier, onSave }: Props) {
  const form = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: supplier || {
      name: '',
      document: '',
      email: '',
      phone: '',
      categories: [],
      contacts: [],
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
        {/* Identificação */}
        <Card>
          <CardHeader>
            <CardTitle>Identificação</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Razão Social</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tradeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Fantasia</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="document"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CNPJ/CPF</FormLabel>
                  <FormControl>
                    <InputMask
                      mask={form.watch('documentType') === 'CNPJ'
                        ? '99.999.999/9999-99'
                        : '999.999.999-99'}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Contato */}
        <Card>
          <CardHeader>
            <CardTitle>Contato</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <InputMask mask="(99) 99999-9999" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="https://" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Categorias */}
        <Card>
          <CardHeader>
            <CardTitle>Categorias de Produtos</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="categories"
              render={({ field }) => (
                <FormItem>
                  <div className="flex flex-wrap gap-2">
                    {PART_CATEGORIES.map((category) => (
                      <Badge
                        key={category}
                        variant={field.value.includes(category) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          const newValue = field.value.includes(category)
                            ? field.value.filter(c => c !== category)
                            : [...field.value, category];
                          field.onChange(newValue);
                        }}
                      >
                        {getCategoryLabel(category)}
                      </Badge>
                    ))}
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Condições Comerciais */}
        <Card>
          <CardHeader>
            <CardTitle>Condições Comerciais</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="paymentTerms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condição de Pagamento</FormLabel>
                  <FormControl>
                    <Input placeholder="30/60/90 dias" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="minOrderValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pedido Mínimo</FormLabel>
                  <FormControl>
                    <CurrencyInput {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deliveryTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prazo de Entrega (dias)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Contatos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Contatos</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendContact({ name: '', role: '', phone: '' })}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </CardHeader>
          <CardContent>
            {/* Lista de contatos com useFieldArray */}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline">
            Cancelar
          </Button>
          <Button type="submit">
            Salvar
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

---

## Sugestão de Compra

```typescript
// Sugerir compra baseado em estoque baixo
async function getSuggestedPurchase(companyId: string) {
  // Peças abaixo do estoque mínimo
  const lowStockParts = await prisma.part.findMany({
    where: {
      companyId,
      quantity: { lt: prisma.raw('minQuantity') },
      status: 'ACTIVE',
    },
    include: {
      suppliers: true,
    },
  });

  // Agrupar por fornecedor
  const bySupplier = new Map<string, {
    supplier: Supplier;
    items: { part: Part; suggestedQty: number }[];
  }>();

  for (const part of lowStockParts) {
    // Quantidade sugerida: estoque ideal - atual
    const suggestedQty = Math.max(
      part.maxQuantity - part.quantity,
      part.minQuantity * 2
    );

    // Pegar fornecedor principal (primeiro ou melhor preço)
    const supplier = part.suppliers[0];
    if (!supplier) continue;

    if (!bySupplier.has(supplier.id)) {
      bySupplier.set(supplier.id, {
        supplier,
        items: [],
      });
    }

    bySupplier.get(supplier.id)!.items.push({
      part,
      suggestedQty,
    });
  }

  return Array.from(bySupplier.values());
}
```

---

## Regras de Negócio

### Fornecedores
- CNPJ/CPF opcional mas recomendado
- Categorias ajudam na busca e organização
- Avaliação calculada automaticamente baseada em entregas

### Pedidos de Compra
- Numeração sequencial por empresa
- Aprovação obrigatória acima de valor configurado
- Recebimento parcial permitido
- Vinculação automática com movimentações de estoque

### Integração com Estoque
- Ao receber pedido, entrada é registrada automaticamente
- Custo médio da peça é atualizado
- Fornecedor é registrado como origem da movimentação

### Avaliação
- Taxa de entrega no prazo calculada automaticamente
- Rating pode ser ajustado manualmente
- Fornecedores com baixa avaliação são destacados

---

**Voltar para** [Entidades](./README.md)
