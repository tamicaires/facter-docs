# Frontend - TechCare

> **Arquitetura e estrutura do frontend React.**

---

## Stack

| Tecnologia | Uso |
|------------|-----|
| React 18+ | UI Library |
| TypeScript 5+ | Linguagem |
| Vite | Build Tool |
| Zustand | Estado Global |
| TanStack Query | Server State |
| TanStack Table | Tabelas |
| React Router | Roteamento |
| @facter/ds-core | Design System |
| TailwindCSS | Estilos |
| React Hook Form | Formulários |
| Zod | Validação |

---

## Estrutura de Diretórios

```
apps/web/
├── src/
│   ├── main.tsx                     # Entry point
│   ├── App.tsx                      # Componente raiz
│   │
│   ├── components/                  # Componentes compartilhados
│   │   ├── ui/                      # Componentes base (shadcn)
│   │   ├── forms/                   # Componentes de formulário
│   │   ├── tables/                  # Componentes de tabela
│   │   ├── layout/                  # Layout components
│   │   └── common/                  # Outros componentes
│   │
│   ├── features/                    # Features por domínio
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── service-orders/
│   │   ├── customers/
│   │   ├── equipments/
│   │   ├── quotes/
│   │   ├── stock/
│   │   ├── payments/
│   │   ├── warranties/
│   │   ├── appointments/
│   │   ├── commissions/
│   │   ├── reports/
│   │   └── settings/
│   │
│   ├── hooks/                       # Hooks customizados
│   │   ├── useAuth.ts
│   │   ├── useCompany.ts
│   │   ├── useDebounce.ts
│   │   └── usePermission.ts
│   │
│   ├── stores/                      # Zustand stores
│   │   ├── auth.store.ts
│   │   ├── ui.store.ts
│   │   └── notifications.store.ts
│   │
│   ├── services/                    # API services
│   │   ├── api.ts                   # Axios instance
│   │   ├── auth.service.ts
│   │   └── service-orders.service.ts
│   │
│   ├── lib/                         # Utilitários
│   │   ├── utils.ts
│   │   ├── formatters.ts
│   │   └── validators.ts
│   │
│   ├── types/                       # Tipos TypeScript
│   │   ├── api.types.ts
│   │   ├── entities.types.ts
│   │   └── forms.types.ts
│   │
│   ├── routes/                      # Configuração de rotas
│   │   ├── index.tsx
│   │   ├── private.routes.tsx
│   │   └── public.routes.tsx
│   │
│   └── styles/                      # Estilos globais
│       ├── globals.css
│       └── themes/
│
├── public/
├── index.html
└── package.json
```

---

## Features

### Estrutura de uma Feature

```
features/service-orders/
├── index.ts                         # Exports públicos
├── components/                      # Componentes da feature
│   ├── ServiceOrderCard.tsx
│   ├── ServiceOrderForm.tsx
│   ├── ServiceOrderTimeline.tsx
│   ├── StatusBadge.tsx
│   └── AssignTechnicianModal.tsx
├── hooks/                           # Hooks específicos
│   ├── useServiceOrders.ts
│   ├── useServiceOrder.ts
│   └── useUpdateStatus.ts
├── pages/                           # Páginas
│   ├── ServiceOrdersPage.tsx
│   ├── ServiceOrderDetailsPage.tsx
│   └── CreateServiceOrderPage.tsx
├── services/                        # API calls
│   └── service-orders.api.ts
├── types/                           # Tipos locais
│   └── service-order.types.ts
└── utils/                           # Utilitários locais
    └── status-transitions.ts
```

---

## Páginas

### Dashboard

```
/dashboard
├── Resumo de OS por status
├── Gráfico de OS por período
├── OS recentes
├── Alertas (estoque baixo, garantias expirando)
└── Métricas de performance
```

### Ordens de Serviço

```
/service-orders                      # Lista com filtros
/service-orders/new                  # Criar nova OS
/service-orders/:id                  # Detalhes da OS
/service-orders/:id/edit             # Editar OS
/service-orders/:id/diagnosis        # Registrar diagnóstico
/service-orders/:id/quote            # Criar/ver orçamento
```

### Clientes

```
/customers                           # Lista de clientes
/customers/new                       # Novo cliente
/customers/:id                       # Detalhes do cliente
/customers/:id/equipments            # Equipamentos do cliente
/customers/:id/history               # Histórico de OS
```

### Estoque

```
/stock                               # Visão geral do estoque
/stock/parts                         # Lista de peças
/stock/parts/new                     # Cadastrar peça
/stock/parts/:id                     # Detalhes da peça
/stock/movements                     # Movimentações
/stock/entry                         # Entrada de estoque
/stock/suppliers                     # Fornecedores
```

### Agenda

```
/appointments                        # Calendário de agendamentos
/appointments/new                    # Novo agendamento
/appointments/:id                    # Detalhes
```

### Financeiro

```
/payments                            # Lista de pagamentos
/payments/daily                      # Caixa do dia
/commissions                         # Comissões
/commissions/pay                     # Pagar comissões
```

### Relatórios

```
/reports                             # Dashboard de relatórios
/reports/service-orders              # Relatório de OS
/reports/revenue                     # Relatório financeiro
/reports/technicians                 # Performance técnicos
/reports/stock                       # Relatório de estoque
```

### Configurações

```
/settings                            # Configurações gerais
/settings/company                    # Dados da empresa
/settings/modules                    # Configurações por módulo
/settings/users                      # Usuários/Membros
/settings/users/invite               # Convidar usuário
/settings/integrations               # Integrações
/settings/print-templates            # Templates de impressão
```

---

## Estado Global (Zustand)

### Auth Store

```typescript
// stores/auth.store.ts
interface AuthState {
  // Estado
  user: User | null;
  membership: Membership | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Ações
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  switchCompany: (companyId: string) => Promise<void>;
  refreshToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      membership: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      login: async (credentials) => {
        const response = await authService.login(credentials);
        set({
          user: response.user,
          membership: response.membership,
          token: response.token,
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({
          user: null,
          membership: null,
          token: null,
          isAuthenticated: false,
        });
      },

      switchCompany: async (companyId) => {
        const response = await authService.switchCompany(companyId);
        set({
          membership: response.membership,
          token: response.token,
        });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        membership: state.membership,
      }),
    }
  )
);
```

### UI Store

```typescript
// stores/ui.store.ts
interface UIState {
  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  // Theme
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;

  // Modals
  modals: Record<string, boolean>;
  openModal: (key: string) => void;
  closeModal: (key: string) => void;

  // Toast/Notifications
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  theme: 'system',
  setTheme: (theme) => set({ theme }),

  modals: {},
  openModal: (key) =>
    set((state) => ({ modals: { ...state.modals, [key]: true } })),
  closeModal: (key) =>
    set((state) => ({ modals: { ...state.modals, [key]: false } })),

  toasts: [],
  addToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: crypto.randomUUID() }],
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
```

---

## Server State (TanStack Query)

### Query Keys

```typescript
// lib/query-keys.ts
export const queryKeys = {
  // Service Orders
  serviceOrders: {
    all: ['service-orders'] as const,
    list: (filters: object) => [...queryKeys.serviceOrders.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.serviceOrders.all, 'detail', id] as const,
    timeline: (id: string) => [...queryKeys.serviceOrders.all, 'timeline', id] as const,
  },

  // Customers
  customers: {
    all: ['customers'] as const,
    list: (filters: object) => [...queryKeys.customers.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.customers.all, 'detail', id] as const,
    search: (query: string) => [...queryKeys.customers.all, 'search', query] as const,
  },

  // Stock
  stock: {
    parts: ['stock', 'parts'] as const,
    movements: ['stock', 'movements'] as const,
    lowStock: ['stock', 'low-stock'] as const,
  },

  // Dashboard
  dashboard: {
    counts: ['dashboard', 'counts'] as const,
    recent: ['dashboard', 'recent'] as const,
    metrics: ['dashboard', 'metrics'] as const,
  },
};
```

### Hooks de Query

```typescript
// features/service-orders/hooks/useServiceOrders.ts
export function useServiceOrders(filters: ServiceOrderFilters) {
  return useQuery({
    queryKey: queryKeys.serviceOrders.list(filters),
    queryFn: () => serviceOrdersApi.list(filters),
    staleTime: 30 * 1000, // 30 segundos
  });
}

export function useServiceOrder(id: string) {
  return useQuery({
    queryKey: queryKeys.serviceOrders.detail(id),
    queryFn: () => serviceOrdersApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateServiceOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: serviceOrdersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.serviceOrders.all,
      });
      toast.success('Ordem de serviço criada com sucesso!');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateServiceOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      serviceOrdersApi.updateStatus(id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.serviceOrders.detail(id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.serviceOrders.all,
      });
    },
  });
}
```

---

## Componentes de Exemplo

### Página de Lista

```tsx
// features/service-orders/pages/ServiceOrdersPage.tsx
export function ServiceOrdersPage() {
  const [filters, setFilters] = useState<ServiceOrderFilters>({
    page: 1,
    perPage: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const { data, isLoading } = useServiceOrders(filters);

  return (
    <PageLayout title="Ordens de Serviço">
      <PageHeader>
        <PageTitle>Ordens de Serviço</PageTitle>
        <Button asChild>
          <Link to="/service-orders/new">
            <Plus className="mr-2 h-4 w-4" />
            Nova OS
          </Link>
        </Button>
      </PageHeader>

      <FilterBar>
        <StatusFilter
          value={filters.status}
          onChange={(status) => setFilters({ ...filters, status, page: 1 })}
          counts={data?.meta.summary?.byStatus}
        />
        <SearchInput
          value={filters.search}
          onChange={(search) => setFilters({ ...filters, search, page: 1 })}
          placeholder="Buscar por número, cliente..."
        />
        <TechnicianFilter
          value={filters.technicianId}
          onChange={(technicianId) =>
            setFilters({ ...filters, technicianId, page: 1 })
          }
        />
      </FilterBar>

      <DataTable
        data={data?.data ?? []}
        columns={columns}
        loading={isLoading}
        pagination={data?.meta}
        onPageChange={(page) => setFilters({ ...filters, page })}
        onSort={(sortBy, sortOrder) =>
          setFilters({ ...filters, sortBy, sortOrder })
        }
      />
    </PageLayout>
  );
}
```

### Formulário

```tsx
// features/service-orders/components/ServiceOrderForm.tsx
const schema = z.object({
  customerId: z.string().uuid('Selecione um cliente'),
  equipmentId: z.string().uuid('Selecione um equipamento'),
  reportedIssue: z.string().min(10, 'Descreva o problema'),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  assignedToId: z.string().uuid().optional(),
  internalNotes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function ServiceOrderForm() {
  const navigate = useNavigate();
  const createMutation = useCreateServiceOrder();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      priority: 'NORMAL',
    },
  });

  const onSubmit = async (data: FormData) => {
    await createMutation.mutateAsync(data);
    navigate('/service-orders');
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="customerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cliente</FormLabel>
              <CustomerCombobox
                value={field.value}
                onChange={field.onChange}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="equipmentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Equipamento</FormLabel>
              <EquipmentSelect
                customerId={form.watch('customerId')}
                value={field.value}
                onChange={field.onChange}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reportedIssue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Defeito Relatado</FormLabel>
              <Textarea {...field} rows={4} />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prioridade</FormLabel>
              <PrioritySelect value={field.value} onChange={field.onChange} />
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancelar
          </Button>
          <Button type="submit" loading={createMutation.isPending}>
            Criar Ordem de Serviço
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

---

## Rotas

```tsx
// routes/index.tsx
export function AppRoutes() {
  return (
    <Routes>
      {/* Públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Privadas */}
      <Route element={<PrivateLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Service Orders */}
        <Route path="/service-orders" element={<ServiceOrdersPage />} />
        <Route path="/service-orders/new" element={<CreateServiceOrderPage />} />
        <Route path="/service-orders/:id" element={<ServiceOrderDetailsPage />} />

        {/* Customers */}
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/customers/new" element={<CreateCustomerPage />} />
        <Route path="/customers/:id" element={<CustomerDetailsPage />} />

        {/* Stock */}
        <Route path="/stock" element={<StockPage />} />
        <Route path="/stock/parts" element={<PartsPage />} />
        <Route path="/stock/parts/new" element={<CreatePartPage />} />

        {/* Settings */}
        <Route path="/settings" element={<SettingsLayout />}>
          <Route index element={<GeneralSettingsPage />} />
          <Route path="company" element={<CompanySettingsPage />} />
          <Route path="users" element={<UsersSettingsPage />} />
          <Route path="integrations" element={<IntegrationsPage />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
```

---

## Permissões

```tsx
// components/PermissionGate.tsx
interface PermissionGateProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGate({
  permission,
  children,
  fallback = null,
}: PermissionGateProps) {
  const { hasPermission } = usePermission();

  if (!hasPermission(permission)) {
    return fallback;
  }

  return <>{children}</>;
}

// Uso
<PermissionGate permission="delete:ServiceOrder">
  <Button variant="destructive">Excluir</Button>
</PermissionGate>
```

---

**Voltar para** [TechCare](../README.md)
