# EmptyState

> **Componente para exibir estados vazios com feedback visual.**
> Inclui animações opcionais com Framer Motion.

---

## Import

```tsx
import { EmptyState } from '@facter/ds-core';
```

---

## Uso Básico

```tsx
<EmptyState />
```

Exibe: "Nenhum item encontrado" com ícone padrão.

---

## Com Mensagem Customizada

```tsx
<EmptyState
  message="Nenhum usuário cadastrado"
  description="Comece adicionando o primeiro usuário ao sistema."
/>
```

---

## Com Ícone Customizado

```tsx
import { Users, FileText, ShoppingCart } from 'lucide-react';

<EmptyState
  icon={Users}
  message="Nenhum usuário encontrado"
/>

<EmptyState
  icon={FileText}
  message="Nenhum documento"
/>

<EmptyState
  icon={ShoppingCart}
  message="Carrinho vazio"
/>
```

---

## Com Ação

```tsx
<EmptyState
  message="Nenhuma tarefa"
  description="Você ainda não tem tarefas criadas."
  actionLabel="Criar Tarefa"
  onAction={() => openCreateModal()}
/>
```

---

## Tamanhos

```tsx
<EmptyState size="default" message="Tamanho padrão" />
<EmptyState size="sm" message="Tamanho pequeno" />
```

| Size | Uso |
|------|-----|
| `default` | Páginas inteiras, seções principais |
| `sm` | Cards, sidebars, áreas menores |

---

## Layout Horizontal

Para espaços mais compactos:

```tsx
<EmptyState
  layout="horizontal"
  message="Nenhum resultado"
  description="Tente ajustar os filtros."
  size="sm"
/>
```

---

## Sem Descrição

```tsx
<EmptyState
  message="Lista vazia"
  hideDescription
/>
```

---

## Sem Animação

Para melhor performance em listas:

```tsx
<EmptyState
  message="Nenhum item"
  animated={false}
/>
```

---

## Casos de Uso

### Em Tabelas

```tsx
function UsersTable() {
  const { data: users, isLoading } = useUsers();

  if (isLoading) return <Loader />;

  if (!users?.length) {
    return (
      <EmptyState
        icon={Users}
        message="Nenhum usuário encontrado"
        description="Adicione usuários para começar."
        actionLabel="Adicionar Usuário"
        onAction={() => openModal()}
      />
    );
  }

  return <DataTable data={users} columns={columns} />;
}
```

### Em Resultados de Busca

```tsx
function SearchResults({ query, results }) {
  if (!results.length) {
    return (
      <EmptyState
        icon={Search}
        message="Nenhum resultado encontrado"
        description={`Não encontramos resultados para "${query}".`}
        actionLabel="Limpar Busca"
        onAction={clearSearch}
      />
    );
  }

  return <ResultsList results={results} />;
}
```

### Em Cards

```tsx
function NotificationsCard() {
  const { data: notifications } = useNotifications();

  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-semibold mb-4">Notificações</h3>

      {notifications?.length ? (
        <NotificationsList items={notifications} />
      ) : (
        <EmptyState
          size="sm"
          layout="horizontal"
          icon={Bell}
          message="Sem notificações"
          hideDescription
          animated={false}
        />
      )}
    </div>
  );
}
```

### Em Sidebars

```tsx
function RecentFiles() {
  const { data: files } = useRecentFiles();

  return (
    <aside className="w-64 p-4">
      <h4 className="font-medium mb-3">Arquivos Recentes</h4>

      {files?.length ? (
        <FileList files={files} />
      ) : (
        <EmptyState
          size="sm"
          icon={FileIcon}
          message="Nenhum arquivo recente"
          hideDescription
        />
      )}
    </aside>
  );
}
```

### Com Filtros

```tsx
function FilteredList({ filters }) {
  const { data } = useFilteredData(filters);
  const hasFilters = Object.values(filters).some(Boolean);

  if (!data?.length) {
    return (
      <EmptyState
        icon={Filter}
        message={hasFilters ? "Nenhum resultado com esses filtros" : "Lista vazia"}
        description={hasFilters
          ? "Tente ajustar ou remover alguns filtros."
          : "Adicione itens para começar."
        }
        actionLabel={hasFilters ? "Limpar Filtros" : "Adicionar Item"}
        onAction={hasFilters ? clearFilters : addItem}
      />
    );
  }

  return <ItemList items={data} />;
}
```

---

## API

### Props

```typescript
interface EmptyStateProps {
  message?: string;
  description?: string;
  icon?: React.ComponentType<any>;
  actionLabel?: string;
  onAction?: () => void;
  hideDescription?: boolean;
  size?: 'default' | 'sm';
  layout?: 'vertical' | 'horizontal';
  animated?: boolean;
  className?: string;
}
```

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `message` | string | `"Nenhum item encontrado"` | Título principal |
| `description` | string | Mensagem padrão | Texto descritivo |
| `icon` | Component | `Inbox` | Ícone (Lucide) |
| `actionLabel` | string | - | Texto do botão |
| `onAction` | function | - | Callback do botão |
| `hideDescription` | boolean | `false` | Oculta descrição |
| `size` | string | `"default"` | Tamanho do componente |
| `layout` | string | `"vertical"` | Orientação |
| `animated` | boolean | `true` | Ativa animações |

---

## Animações

Quando `animated={true}` (padrão):

- **Container**: Fade in + slide up (0.5s)
- **Ícone**: Scale on hover/tap

Para desabilitar (melhor performance em listas grandes):

```tsx
<EmptyState animated={false} />
```

---

## Boas Práticas

1. **Mensagem clara**: Explique o que está vazio
2. **Ação útil**: Ofereça próximo passo quando possível
3. **Contexto**: Use ícones relacionados ao conteúdo
4. **Tamanho apropriado**: `sm` para áreas menores
5. **Performance**: Desative animações em listas com muitos itens

---

**Voltar para** [Componentes](./README.md)
