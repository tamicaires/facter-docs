# Painel Administrativo

> **Interface para gestão centralizada da plataforma (Super Admin).**

---

## Conceito

O Painel Administrativo é uma área separada da aplicação principal, acessível apenas por administradores da **plataforma** (não da empresa). Permite:

- Gerenciar **empresas/tenants**
- Controlar **Feature Flags** por empresa
- Gerenciar **planos e assinaturas**
- Monitorar **uso e métricas** da plataforma
- Configurar **features globais**

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         APLICAÇÕES SEPARADAS                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌─────────────────────────┐     ┌─────────────────────────┐         │
│   │    APP PRINCIPAL        │     │    ADMIN PANEL          │         │
│   │    (techcare.app)       │     │    (admin.techcare.app) │         │
│   ├─────────────────────────┤     ├─────────────────────────┤         │
│   │ • Multi-tenant          │     │ • Single tenant         │         │
│   │ • Usuários das empresas │     │ • Super admins apenas   │         │
│   │ • Domínio principal     │     │ • Subdomínio /admin     │         │
│   └────────────┬────────────┘     └────────────┬────────────┘         │
│                │                               │                       │
│                └───────────────┬───────────────┘                       │
│                                │                                       │
│                                ▼                                       │
│                    ┌─────────────────────────┐                        │
│                    │      API BACKEND        │                        │
│                    │   (api.techcare.app)    │                        │
│                    └─────────────────────────┘                        │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Estrutura de Dados

```prisma
// Super Admin (administrador da plataforma)
model PlatformAdmin {
  id          String    @id @default(uuid())
  email       String    @unique
  name        String
  password    String
  role        PlatformRole @default(SUPPORT)

  // Permissões específicas
  permissions String[]  // ['manage_companies', 'manage_features', 'view_billing']

  // Segurança
  mfaEnabled  Boolean   @default(true)
  mfaSecret   String?

  // Audit
  lastLoginAt DateTime?
  lastLoginIp String?

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

enum PlatformRole {
  SUPER_ADMIN   // Acesso total
  ADMIN         // Gerencia empresas e features
  SUPPORT       // Visualiza e suporte básico
  BILLING       // Apenas financeiro/assinaturas
}
```

---

## Módulos do Admin Panel

### 1. Dashboard Geral

```typescript
interface PlatformDashboard {
  // Métricas gerais
  metrics: {
    totalCompanies: number;
    activeCompanies: number;
    totalUsers: number;
    totalServiceOrders: number;
    mrr: number;  // Monthly Recurring Revenue
  };

  // Por plano
  companiesByPlan: {
    plan: string;
    count: number;
    percentage: number;
  }[];

  // Crescimento
  growth: {
    newCompaniesThisMonth: number;
    churnThisMonth: number;
    netGrowth: number;
  };

  // Uso de features
  featureUsage: {
    feature: string;
    companiesUsing: number;
    percentage: number;
  }[];
}
```

### 2. Gestão de Empresas

```tsx
// Listagem de empresas
function CompaniesListPage() {
  const [filters, setFilters] = useState({
    search: '',
    plan: '',
    status: '',
  });

  const { data: companies, isLoading } = useAdminCompanies(filters);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Empresas</h1>
        <Button onClick={() => openCreateCompanyModal()}>
          Nova Empresa
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex gap-4">
        <Input
          placeholder="Buscar por nome, CNPJ..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <Select
          value={filters.plan}
          onValueChange={(v) => setFilters({ ...filters, plan: v })}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Plano" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            <SelectItem value="FREE">Free</SelectItem>
            <SelectItem value="STARTER">Starter</SelectItem>
            <SelectItem value="PROFESSIONAL">Professional</SelectItem>
            <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
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
            <SelectItem value="TRIAL">Trial</SelectItem>
            <SelectItem value="SUSPENDED">Suspenso</SelectItem>
            <SelectItem value="CANCELLED">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabela */}
      <DataTable
        columns={[
          { header: 'Empresa', accessor: 'name' },
          { header: 'CNPJ', accessor: 'document' },
          { header: 'Plano', accessor: 'plan.name', cell: PlanBadge },
          { header: 'Status', accessor: 'status', cell: StatusBadge },
          { header: 'Usuários', accessor: '_count.users' },
          { header: 'OS/mês', accessor: 'ordersThisMonth' },
          { header: 'Desde', accessor: 'createdAt', cell: DateCell },
          { header: 'Ações', cell: CompanyActions },
        ]}
        data={companies}
        loading={isLoading}
      />
    </div>
  );
}
```

### 3. Detalhes da Empresa

```tsx
function CompanyDetailsPage({ companyId }: { companyId: string }) {
  const { data: company } = useAdminCompany(companyId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">{company.name}</h1>
          <p className="text-muted-foreground">{company.document}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => impersonateCompany(companyId)}>
            Acessar como Admin
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Ações</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => suspendCompany(companyId)}>
                Suspender
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => resetPassword(companyId)}>
                Resetar Senha Admin
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                Excluir Empresa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="features">Feature Flags</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="billing">Faturamento</TabsTrigger>
          <TabsTrigger value="usage">Uso</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <CompanyOverview company={company} />
        </TabsContent>

        <TabsContent value="features">
          <CompanyFeatureFlags companyId={companyId} />
        </TabsContent>

        <TabsContent value="users">
          <CompanyUsers companyId={companyId} />
        </TabsContent>

        <TabsContent value="billing">
          <CompanyBilling companyId={companyId} />
        </TabsContent>

        <TabsContent value="usage">
          <CompanyUsage companyId={companyId} />
        </TabsContent>

        <TabsContent value="logs">
          <CompanyAuditLogs companyId={companyId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

---

## Gestão de Feature Flags

### Tela de Features por Empresa

```tsx
function CompanyFeatureFlags({ companyId }: { companyId: string }) {
  const { data: company } = useAdminCompany(companyId);
  const { data: features } = useCompanyFeatures(companyId);
  const toggleFeature = useToggleFeatureMutation();
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

  // Agrupar features por categoria
  const groupedFeatures = groupBy(features, 'category');

  return (
    <div className="space-y-6">
      {/* Header com info do plano */}
      <Card>
        <CardContent className="flex items-center justify-between py-4">
          <div>
            <p className="text-sm text-muted-foreground">Plano atual</p>
            <p className="text-xl font-semibold">{company.plan.name}</p>
          </div>
          <Button variant="outline" onClick={() => openChangePlanModal()}>
            Alterar Plano
          </Button>
        </CardContent>
      </Card>

      {/* Lista de features por categoria */}
      {Object.entries(groupedFeatures).map(([category, categoryFeatures]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle>{getCategoryLabel(category)}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {categoryFeatures.map((feature) => (
              <div
                key={feature.key}
                className={cn(
                  "flex items-center justify-between p-4 rounded-lg border",
                  feature.hasOverride && "bg-yellow-50 border-yellow-200"
                )}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{feature.name}</h4>

                    {/* Badges de status */}
                    {feature.inPlan ? (
                      <Badge variant="success">No plano</Badge>
                    ) : (
                      <Badge variant="outline">
                        Requer {feature.minPlan}
                      </Badge>
                    )}

                    {feature.hasOverride && (
                      <Badge variant="warning">Override</Badge>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground mt-1">
                    {feature.description}
                  </p>

                  {/* Info do override */}
                  {feature.hasOverride && feature.overrideInfo && (
                    <p className="text-xs text-yellow-700 mt-2">
                      Override por {feature.overrideInfo.by} em{' '}
                      {formatDate(feature.overrideInfo.at)}
                      {feature.overrideInfo.reason && (
                        <> - {feature.overrideInfo.reason}</>
                      )}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  {/* Toggle */}
                  <Switch
                    checked={feature.enabled}
                    onCheckedChange={(enabled) => {
                      if (!feature.inPlan && enabled) {
                        // Se não está no plano, precisa criar override
                        setSelectedFeature(feature.key);
                        setShowOverrideModal(true);
                      } else {
                        toggleFeature.mutate({
                          companyId,
                          featureKey: feature.key,
                          enabled,
                        });
                      }
                    }}
                  />

                  {/* Menu de ações */}
                  {feature.hasOverride && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOverride(feature.key)}
                    >
                      Remover override
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {/* Modal de Override */}
      <FeatureOverrideModal
        open={showOverrideModal}
        onClose={() => setShowOverrideModal(false)}
        companyId={companyId}
        featureKey={selectedFeature}
      />
    </div>
  );
}
```

### Modal de Override

```tsx
function FeatureOverrideModal({
  open,
  onClose,
  companyId,
  featureKey,
}: {
  open: boolean;
  onClose: () => void;
  companyId: string;
  featureKey: string | null;
}) {
  const [reason, setReason] = useState('');
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const createOverride = useCreateOverrideMutation();

  const feature = featureKey ? FEATURES[featureKey] : null;

  const handleSubmit = async () => {
    await createOverride.mutateAsync({
      companyId,
      featureKey,
      enabled: true,
      reason,
      expiresAt,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Liberar Feature</DialogTitle>
          <DialogDescription>
            Você está liberando uma feature que não está incluída no plano atual
            da empresa.
          </DialogDescription>
        </DialogHeader>

        {feature && (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium">{feature.name}</h4>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
              <p className="text-sm mt-2">
                Plano mínimo: <strong>{feature.plans[0]}</strong>
              </p>
            </div>

            <div className="space-y-2">
              <Label>Motivo da liberação *</Label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ex: Período de teste, parceria comercial, cortesia..."
              />
            </div>

            <div className="space-y-2">
              <Label>Expiração (opcional)</Label>
              <DatePicker
                value={expiresAt}
                onChange={setExpiresAt}
                placeholder="Sem expiração"
              />
              <p className="text-xs text-muted-foreground">
                Se definido, a feature será desabilitada automaticamente na data
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!reason}>
            Liberar Feature
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### Gestão Global de Features

```tsx
// Página para gerenciar features globalmente
function GlobalFeaturesPage() {
  const { data: features } = useAllFeatures();
  const updateFeature = useUpdateFeatureMutation();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Features Globais</h1>
        <Button onClick={() => openCreateFeatureModal()}>
          Nova Feature
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Feature</TableHead>
                <TableHead>Chave</TableHead>
                <TableHead>Planos</TableHead>
                <TableHead>Empresas Usando</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {features?.map((feature) => (
                <TableRow key={feature.key}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{feature.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-sm">{feature.key}</code>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {feature.plans.map((plan) => (
                        <Badge key={plan} variant="outline">
                          {plan}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {feature.companiesCount} / {feature.totalCompanies}
                    <span className="text-muted-foreground ml-1">
                      ({Math.round(feature.adoptionRate)}%)
                    </span>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={feature.globalEnabled}
                      onCheckedChange={(enabled) =>
                        updateFeature.mutate({ key: feature.key, globalEnabled: enabled })
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => editFeature(feature)}>
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => viewUsage(feature)}>
                          Ver Uso
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => enableForAll(feature.key)}
                        >
                          Liberar para Todos
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => disableForAll(feature.key)}
                        >
                          Desabilitar para Todos
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## API do Admin Panel

### Endpoints

```typescript
// routes/admin/features.ts
@Controller('admin/features')
@UseGuards(PlatformAdminGuard)
export class AdminFeaturesController {
  // Listar todas as features
  @Get()
  @RequirePlatformPermission('view_features')
  async listFeatures(): Promise<FeatureWithStats[]> {
    return this.featureService.getAllWithStats();
  }

  // Atualizar feature global
  @Patch(':key')
  @RequirePlatformPermission('manage_features')
  async updateFeature(
    @Param('key') key: string,
    @Body() dto: UpdateFeatureDto,
  ): Promise<Feature> {
    return this.featureService.updateGlobal(key, dto);
  }

  // Features de uma empresa
  @Get('companies/:companyId')
  @RequirePlatformPermission('view_companies')
  async getCompanyFeatures(
    @Param('companyId') companyId: string,
  ): Promise<CompanyFeatureStatus[]> {
    return this.featureService.getCompanyFeatures(companyId);
  }

  // Toggle feature para empresa
  @Post('companies/:companyId/:featureKey')
  @RequirePlatformPermission('manage_features')
  async toggleCompanyFeature(
    @Param('companyId') companyId: string,
    @Param('featureKey') featureKey: string,
    @Body() dto: ToggleFeatureDto,
    @CurrentAdmin() admin: PlatformAdmin,
  ): Promise<void> {
    await this.featureService.setCompanyFeature(
      companyId,
      featureKey,
      dto.enabled,
      admin.id,
      dto.reason,
      dto.expiresAt,
    );

    // Audit log
    await this.auditService.log({
      action: 'FEATURE_TOGGLE',
      adminId: admin.id,
      targetType: 'Company',
      targetId: companyId,
      metadata: {
        featureKey,
        enabled: dto.enabled,
        reason: dto.reason,
      },
    });
  }

  // Remover override
  @Delete('companies/:companyId/:featureKey/override')
  @RequirePlatformPermission('manage_features')
  async removeOverride(
    @Param('companyId') companyId: string,
    @Param('featureKey') featureKey: string,
    @CurrentAdmin() admin: PlatformAdmin,
  ): Promise<void> {
    await this.featureService.removeOverride(companyId, featureKey);
  }

  // Liberar feature para múltiplas empresas
  @Post('bulk-enable')
  @RequirePlatformPermission('manage_features')
  async bulkEnable(
    @Body() dto: BulkEnableDto,
  ): Promise<{ success: number; failed: number }> {
    return this.featureService.bulkEnable(
      dto.companyIds,
      dto.featureKey,
      dto.reason,
    );
  }
}
```

### DTOs

```typescript
class ToggleFeatureDto {
  @IsBoolean()
  enabled: boolean;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsDateString()
  @IsOptional()
  expiresAt?: string;
}

class BulkEnableDto {
  @IsArray()
  @IsUUID('4', { each: true })
  companyIds: string[];

  @IsString()
  featureKey: string;

  @IsString()
  reason: string;
}
```

---

## Logs e Auditoria

```tsx
// Histórico de alterações de features
function FeatureAuditLogs({ companyId }: { companyId?: string }) {
  const { data: logs } = useFeatureAuditLogs({ companyId });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Alterações</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {logs?.map((log) => (
            <div key={log.id} className="flex gap-4 pb-4 border-b last:border-0">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                log.action === 'ENABLED' ? "bg-green-100" : "bg-red-100"
              )}>
                {log.action === 'ENABLED' ? (
                  <Check className="h-5 w-5 text-green-600" />
                ) : (
                  <X className="h-5 w-5 text-red-600" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium">
                  {log.admin.name}{' '}
                  {log.action === 'ENABLED' ? 'habilitou' : 'desabilitou'}{' '}
                  <strong>{log.featureName}</strong>
                  {companyId ? '' : ` para ${log.company.name}`}
                </p>
                {log.reason && (
                  <p className="text-sm text-muted-foreground">
                    Motivo: {log.reason}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {formatRelative(log.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## Permissões do Admin Panel

| Ação | Support | Billing | Admin | Super Admin |
|------|---------|---------|-------|-------------|
| Ver empresas | ✅ | ✅ | ✅ | ✅ |
| Ver features | ✅ | ❌ | ✅ | ✅ |
| Toggle features | ❌ | ❌ | ✅ | ✅ |
| Criar override | ❌ | ❌ | ✅ | ✅ |
| Alterar planos | ❌ | ✅ | ✅ | ✅ |
| Ver faturamento | ❌ | ✅ | ✅ | ✅ |
| Acessar como empresa | ❌ | ❌ | ✅ | ✅ |
| Gerenciar admins | ❌ | ❌ | ❌ | ✅ |
| Configurar features globais | ❌ | ❌ | ❌ | ✅ |

---

## Estrutura de Rotas

```
/admin
├── /                       → Dashboard geral
├── /companies              → Lista de empresas
│   ├── /new                → Criar empresa
│   └── /:id                → Detalhes da empresa
│       ├── /features       → Features da empresa
│       ├── /users          → Usuários da empresa
│       ├── /billing        → Faturamento
│       └── /logs           → Logs de auditoria
├── /features               → Features globais
│   └── /:key               → Detalhes da feature
├── /plans                  → Gerenciar planos
├── /billing                → Faturamento global
├── /admins                 → Gerenciar admins da plataforma
└── /settings               → Configurações globais
```

---

**Voltar para** [Regras de Negócio](./README.md)
