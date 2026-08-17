# Facter Hub

> **Painel administrativo central da plataforma Facter.**

---

## Visão Geral

O Facter Hub é a interface administrativa que permite gerenciar todos os produtos do ecossistema, clientes, assinaturas e configurações globais.

**URL**: `hub.facter.app`

---

## Módulos

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FACTER HUB                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │  Dashboard  │ │  Customers  │ │  Products   │ │   Billing   │           │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘           │
│                                                                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │  Features   │ │  Analytics  │ │   Admins    │ │  Settings   │           │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Dashboard

Visão consolidada de todos os produtos.

```tsx
function HubDashboard() {
  const { data: metrics } = usePlatformMetrics();
  const { data: products } = useProducts();

  return (
    <div className="space-y-6">
      {/* Métricas Globais */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          title="MRR Total"
          value={formatCurrency(metrics.mrr)}
          trend={metrics.mrrGrowth}
          icon={DollarSign}
        />
        <MetricCard
          title="Clientes Ativos"
          value={metrics.activeCustomers}
          trend={metrics.customerGrowth}
          icon={Users}
        />
        <MetricCard
          title="Assinaturas"
          value={metrics.activeSubscriptions}
          icon={CreditCard}
        />
        <MetricCard
          title="Churn Rate"
          value={`${metrics.churnRate}%`}
          trend={-metrics.churnChange}
          invertTrend
          icon={TrendingDown}
        />
      </div>

      {/* Cards por Produto */}
      <div className="grid grid-cols-3 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>MRR por Produto</CardTitle>
          </CardHeader>
          <CardContent>
            <MRRByProductChart data={metrics.mrrByProduct} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Crescimento de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <CustomerGrowthChart data={metrics.customerGrowth} />
          </CardContent>
        </Card>
      </div>

      {/* Clientes Cross-Product */}
      <Card>
        <CardHeader>
          <CardTitle>Clientes com Múltiplos Produtos</CardTitle>
          <CardDescription>
            {metrics.multiProductCustomers} clientes usam 2 ou mais produtos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CrossProductCustomersList />
        </CardContent>
      </Card>

      {/* Atividade Recente */}
      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentActivityFeed />
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 2. Customers (Clientes)

Gestão centralizada de clientes Facter.

### Listagem

```tsx
function CustomersPage() {
  const [filters, setFilters] = useState({
    search: '',
    product: '',
    status: '',
    hasMultipleProducts: false,
  });

  const { data: customers } = useCustomers(filters);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <Button onClick={() => navigate('/customers/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="flex gap-4 pt-6">
          <Input
            placeholder="Buscar por nome, email..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-64"
          />
          <Select
            value={filters.product}
            onValueChange={(v) => setFilters({ ...filters, product: v })}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Produto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              <SelectItem value="techcare">TechCare</SelectItem>
              <SelectItem value="projeto2">Projeto 2</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.status}
            onValueChange={(v) => setFilters({ ...filters, status: v })}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              <SelectItem value="ACTIVE">Ativo</SelectItem>
              <SelectItem value="INACTIVE">Inativo</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Switch
              checked={filters.hasMultipleProducts}
              onCheckedChange={(v) => setFilters({ ...filters, hasMultipleProducts: v })}
            />
            <Label>Apenas multi-produto</Label>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <DataTable
        columns={[
          {
            header: 'Cliente',
            accessor: 'name',
            cell: ({ row }) => (
              <div>
                <p className="font-medium">{row.name}</p>
                <p className="text-sm text-muted-foreground">{row.email}</p>
              </div>
            ),
          },
          {
            header: 'Produtos',
            cell: ({ row }) => (
              <div className="flex gap-1">
                {row.subscriptions.map((sub) => (
                  <Badge key={sub.id} variant="outline">
                    {sub.product.name}
                  </Badge>
                ))}
              </div>
            ),
          },
          {
            header: 'MRR',
            accessor: 'mrr',
            cell: ({ value }) => formatCurrency(value),
          },
          {
            header: 'Status',
            accessor: 'status',
            cell: StatusBadge,
          },
          {
            header: 'Desde',
            accessor: 'createdAt',
            cell: DateCell,
          },
          {
            header: '',
            cell: CustomerActions,
          },
        ]}
        data={customers}
      />
    </div>
  );
}
```

### Detalhes do Cliente

```tsx
function CustomerDetailsPage({ customerId }: { customerId: string }) {
  const { data: customer } = useCustomer(customerId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">{customer.name}</h1>
          <p className="text-muted-foreground">{customer.email}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => editCustomer(customerId)}>
            Editar
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Ações</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Enviar Email</DropdownMenuItem>
              <DropdownMenuItem>Ver no Stripe</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                Suspender Cliente
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="subscriptions">Assinaturas</TabsTrigger>
          <TabsTrigger value="billing">Faturamento</TabsTrigger>
          <TabsTrigger value="activity">Atividade</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-3 gap-4">
            {/* Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <InfoRow label="Email" value={customer.email} />
                <InfoRow label="Telefone" value={customer.phone} />
                <InfoRow label="Documento" value={formatDocument(customer.document)} />
                <InfoRow label="Cliente desde" value={formatDate(customer.createdAt)} />
              </CardContent>
            </Card>

            {/* Métricas */}
            <Card>
              <CardHeader>
                <CardTitle>Métricas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <InfoRow label="MRR Total" value={formatCurrency(customer.mrr)} />
                <InfoRow label="LTV" value={formatCurrency(customer.ltv)} />
                <InfoRow label="Produtos" value={customer.subscriptions.length} />
              </CardContent>
            </Card>

            {/* Produtos Ativos */}
            <Card>
              <CardHeader>
                <CardTitle>Produtos</CardTitle>
              </CardHeader>
              <CardContent>
                {customer.subscriptions.map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium">{sub.product.name}</p>
                      <p className="text-sm text-muted-foreground">{sub.plan.name}</p>
                    </div>
                    <Badge variant={sub.status === 'ACTIVE' ? 'success' : 'secondary'}>
                      {sub.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="subscriptions">
          <CustomerSubscriptions customerId={customerId} />
        </TabsContent>

        <TabsContent value="billing">
          <CustomerBillingHistory customerId={customerId} />
        </TabsContent>

        <TabsContent value="activity">
          <CustomerActivityLog customerId={customerId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

---

## 3. Products (Produtos)

Gestão de produtos do ecossistema.

```tsx
function ProductsPage() {
  const { data: products } = useProducts();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Produtos</h1>
        <Button onClick={() => navigate('/products/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                {product.logo && (
                  <img src={product.logo} alt={product.name} className="h-10 w-10 rounded" />
                )}
                <div>
                  <CardTitle>{product.name}</CardTitle>
                  <code className="text-xs text-muted-foreground">{product.key}</code>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Métricas */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Assinaturas</p>
                    <p className="font-medium">{product.activeSubscriptions}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">MRR</p>
                    <p className="font-medium">{formatCurrency(product.mrr)}</p>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    product.active ? "bg-green-500" : "bg-red-500"
                  )} />
                  <span className="text-sm">
                    {product.active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                {/* URLs */}
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>App: {product.serviceUrl}</p>
                  <p>API: {product.apiUrl}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/50 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => navigate(`/products/${product.key}`)}
              >
                Gerenciar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(product.adminUrl, '_blank')}
              >
                Admin
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

### Detalhes do Produto

```tsx
function ProductDetailsPage({ productKey }: { productKey: string }) {
  const { data: product } = useProduct(productKey);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          {product.logo && (
            <img src={product.logo} alt={product.name} className="h-12 w-12 rounded" />
          )}
          <div>
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <p className="text-muted-foreground">{product.description}</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => window.open(product.adminUrl, '_blank')}>
          Abrir Admin do Produto
          <ExternalLink className="h-4 w-4 ml-2" />
        </Button>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="plans">Planos</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="subscriptions">Assinaturas</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <ProductOverview product={product} />
        </TabsContent>

        <TabsContent value="plans">
          <ProductPlansManager productId={product.id} />
        </TabsContent>

        <TabsContent value="features">
          <ProductFeaturesManager productId={product.id} />
        </TabsContent>

        <TabsContent value="subscriptions">
          <ProductSubscriptionsList productId={product.id} />
        </TabsContent>

        <TabsContent value="settings">
          <ProductSettings product={product} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

---

## 4. Billing (Faturamento)

### Dashboard de Faturamento

```tsx
function BillingDashboard() {
  const { data: billing } = useBillingMetrics();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Faturamento</h1>

      {/* Métricas */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard title="MRR" value={formatCurrency(billing.mrr)} />
        <MetricCard title="ARR" value={formatCurrency(billing.arr)} />
        <MetricCard title="Faturas este mês" value={billing.invoicesThisMonth} />
        <MetricCard title="Inadimplência" value={`${billing.delinquencyRate}%`} />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Evolução do MRR</CardTitle>
          </CardHeader>
          <CardContent>
            <MRREvolutionChart data={billing.mrrHistory} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Receita por Produto</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueByProductChart data={billing.revenueByProduct} />
          </CardContent>
        </Card>
      </div>

      {/* Faturas Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Faturas Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentInvoicesList />
        </CardContent>
      </Card>

      {/* Pagamentos Pendentes */}
      <Card>
        <CardHeader>
          <CardTitle>Pagamentos Pendentes</CardTitle>
        </CardHeader>
        <CardContent>
          <PendingPaymentsList />
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 5. Estrutura de Rotas

```
/hub
├── /                           → Dashboard
├── /customers                  → Lista de clientes
│   ├── /new                    → Criar cliente
│   └── /:id                    → Detalhes do cliente
├── /products                   → Lista de produtos
│   ├── /new                    → Registrar produto
│   └── /:key                   → Detalhes do produto
│       ├── /plans              → Gerenciar planos
│       ├── /features           → Gerenciar features
│       └── /settings           → Configurações
├── /billing                    → Dashboard de faturamento
│   ├── /invoices               → Lista de faturas
│   └── /invoices/:id           → Detalhes da fatura
├── /analytics                  → Analytics global
├── /admins                     → Gerenciar admins
│   ├── /new                    → Criar admin
│   └── /:id                    → Detalhes do admin
├── /audit-logs                 → Logs de auditoria
└── /settings                   → Configurações globais
```

---

## 6. Permissões

| Módulo | Support | Billing | Admin | Super Admin |
|--------|---------|---------|-------|-------------|
| Dashboard | Visualizar | Visualizar | Visualizar | Visualizar |
| Customers | Visualizar | Visualizar | CRUD | CRUD |
| Products | Visualizar | - | CRUD | CRUD |
| Plans | - | Visualizar | CRUD | CRUD |
| Features | - | - | Toggle | CRUD |
| Billing | - | CRUD | Visualizar | CRUD |
| Analytics | Visualizar | Visualizar | Visualizar | Visualizar |
| Admins | - | - | Visualizar | CRUD |
| Settings | - | - | - | CRUD |

---

**Voltar para** [Facter Platform](../README.md)
