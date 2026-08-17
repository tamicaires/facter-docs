# DataTable

> **Tabela de dados avançada usando Compound Components pattern.**
> Construída sobre TanStack Table v8.

---

## Import

```tsx
import { DataTable, useDataTable } from '@facter/ds-core';
import type { ColumnDef } from '@tanstack/react-table';
```

---

## Uso Básico

```tsx
interface User {
  id: string;
  name: string;
  email: string;
}

const columns: ColumnDef<User>[] = [
  { accessorKey: 'name', header: 'Nome' },
  { accessorKey: 'email', header: 'Email' },
];

function UsersTable() {
  const data = [
    { id: '1', name: 'John', email: 'john@example.com' },
    { id: '2', name: 'Jane', email: 'jane@example.com' },
  ];

  return (
    <DataTable data={data} columns={columns}>
      <DataTable.Content />
    </DataTable>
  );
}
```

---

## Compound Components

A DataTable usa o padrão Compound Components para composição flexível:

```tsx
<DataTable data={data} columns={columns}>
  {/* Toolbar com busca e filtros */}
  <DataTable.Toolbar>
    <DataTable.Search placeholder="Buscar..." />
    <DataTable.Filters />
    <DataTable.ColumnVisibility />
    <DataTable.DensityToggle />
    <DataTable.Export />
  </DataTable.Toolbar>

  {/* Estado de loading */}
  <DataTable.Loading visible={isLoading} />

  {/* Conteúdo da tabela */}
  <DataTable.Content />

  {/* Estado vazio */}
  <DataTable.EmptyState
    title="Nenhum registro"
    description="Não há dados para exibir."
  />

  {/* Paginação */}
  <DataTable.Pagination />
</DataTable>
```

---

## Subcomponentes

### DataTable.Toolbar

Container para ações da tabela:

```tsx
<DataTable.Toolbar className="flex items-center gap-2">
  {children}
</DataTable.Toolbar>
```

### DataTable.Search

Campo de busca:

```tsx
<DataTable.Search
  placeholder="Buscar usuários..."
  debounceMs={300}
/>
```

### DataTable.Filters

Filtros da tabela:

```tsx
<DataTable.Filters>
  <DataTable.Filter
    column="status"
    title="Status"
    options={[
      { label: 'Ativo', value: 'active' },
      { label: 'Inativo', value: 'inactive' },
    ]}
  />
</DataTable.Filters>
```

### DataTable.Loading

Indicador de carregamento:

```tsx
<DataTable.Loading visible={isLoading} message="Carregando dados..." />
```

### DataTable.Content

Corpo da tabela:

```tsx
<DataTable.Content />
```

### DataTable.EmptyState

Estado vazio customizável:

```tsx
<DataTable.EmptyState
  icon={FileQuestion}
  title="Nenhum resultado"
  description="Tente ajustar os filtros."
/>
```

### DataTable.Pagination

Paginação com suporte a server-side:

```tsx
// Client-side (padrão)
<DataTable.Pagination />

// Server-side
<DataTable.Pagination
  mode="server"
  pageCount={totalPages}
  onPageChange={handlePageChange}
/>
```

---

## Colunas

### Definição Básica

```tsx
const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: 'Nome',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
];
```

### Com Header Sortable

```tsx
import { DataTable } from '@facter/ds-core';

const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTable.ColumnHeader column={column} title="Nome" />
    ),
  },
];
```

### Com Cell Customizada

```tsx
const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant={row.original.status === 'active' ? 'success' : 'secondary'}>
        {row.original.status}
      </Badge>
    ),
  },
];
```

### Com Ações

```tsx
const columns: ColumnDef<User>[] = [
  // ... outras colunas
  {
    id: 'actions',
    cell: ({ row }) => (
      <DataTable.RowActions>
        <Button variant="ghost" size="icon-sm" onClick={() => handleEdit(row.original)}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(row.original)}>
          <Trash className="h-4 w-4" />
        </Button>
      </DataTable.RowActions>
    ),
  },
];
```

---

## Seleção de Linhas

```tsx
const columns: ColumnDef<User>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
  },
  // ... outras colunas
];

// Com bulk actions
<DataTable data={data} columns={columns}>
  <DataTable.BulkActions>
    {(selectedRows) => (
      <>
        <Button variant="outline" onClick={() => handleBulkExport(selectedRows)}>
          Exportar ({selectedRows.length})
        </Button>
        <Button variant="destructive" onClick={() => handleBulkDelete(selectedRows)}>
          Excluir ({selectedRows.length})
        </Button>
      </>
    )}
  </DataTable.BulkActions>
  <DataTable.Content />
</DataTable>
```

---

## Densidade

```tsx
<DataTable.DensityToggle />
```

| Densidade | Descrição |
|-----------|-----------|
| `comfortable` | Espaçamento padrão |
| `compact` | Espaçamento reduzido |
| `spacious` | Espaçamento aumentado |

---

## Exportação

```tsx
<DataTable.Export
  filename="usuarios"
  formats={['csv', 'xlsx', 'pdf']}
/>
```

---

## Server-Side

Para paginação, busca e filtros server-side:

```tsx
function UsersTable() {
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20 });
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});

  const { data, isLoading } = useQuery({
    queryKey: ['users', pagination, search, filters],
    queryFn: () => fetchUsers({ ...pagination, search, ...filters }),
  });

  return (
    <DataTable
      data={data?.items ?? []}
      columns={columns}
      manualPagination
      manualFiltering
      pageCount={data?.totalPages}
      onPaginationChange={setPagination}
      onGlobalFilterChange={setSearch}
    >
      <DataTable.Toolbar>
        <DataTable.Search
          value={search}
          onChange={setSearch}
          debounceMs={500}
        />
      </DataTable.Toolbar>
      <DataTable.Loading visible={isLoading} />
      <DataTable.Content />
      <DataTable.Pagination mode="server" />
    </DataTable>
  );
}
```

---

## Hooks

### useDataTable

Hook principal para acessar o contexto da tabela:

```tsx
function CustomComponent() {
  const { table, state } = useDataTable();

  const selectedCount = table.getSelectedRowModel().rows.length;

  return <span>{selectedCount} selecionados</span>;
}
```

### useDataTablePagination

```tsx
const { page, pageSize, pageCount, goToPage, nextPage, previousPage } = useDataTablePagination();
```

### useDataTableSelection

```tsx
const { selectedRows, clearSelection, selectAll } = useDataTableSelection();
```

---

## API

### DataTable Props

```typescript
interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  manualPagination?: boolean;
  manualFiltering?: boolean;
  manualSorting?: boolean;
  pageCount?: number;
  onPaginationChange?: (pagination: PaginationState) => void;
  onGlobalFilterChange?: (filter: string) => void;
  onSortingChange?: (sorting: SortingState) => void;
  children: React.ReactNode;
}
```

---

## Exemplo Completo

```tsx
import { DataTable, Badge, Button } from '@facter/ds-core';
import { Edit, Trash, Plus, FileDown } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  createdAt: Date;
}

const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTable.ColumnHeader column={column} title="Nome" />,
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'role',
    header: 'Cargo',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant={row.original.status === 'active' ? 'success' : 'secondary'}>
        {row.original.status === 'active' ? 'Ativo' : 'Inativo'}
      </Badge>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <div className="flex gap-1">
        <Button variant="ghost" size="icon-sm">
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon-sm">
          <Trash className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];

function UsersPage() {
  const { data, isLoading } = useUsers();

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h1>Usuários</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      <DataTable data={data ?? []} columns={columns}>
        <DataTable.Toolbar>
          <DataTable.Search placeholder="Buscar usuários..." />
          <DataTable.Filters>
            <DataTable.Filter
              column="status"
              title="Status"
              options={[
                { label: 'Ativo', value: 'active' },
                { label: 'Inativo', value: 'inactive' },
              ]}
            />
            <DataTable.Filter
              column="role"
              title="Cargo"
              options={[
                { label: 'Admin', value: 'admin' },
                { label: 'Usuário', value: 'user' },
              ]}
            />
          </DataTable.Filters>
          <DataTable.ColumnVisibility />
          <DataTable.DensityToggle />
          <DataTable.Export filename="usuarios" />
        </DataTable.Toolbar>

        <DataTable.Loading visible={isLoading} />
        <DataTable.Content />
        <DataTable.EmptyState
          title="Nenhum usuário encontrado"
          description="Tente ajustar os filtros ou adicione um novo usuário."
        />
        <DataTable.Pagination />
      </DataTable>
    </div>
  );
}
```

---

**Voltar para** [Componentes](./README.md)
