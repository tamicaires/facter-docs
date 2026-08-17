# Guia de Início - Design System

> **Guia completo para começar a usar o Facter Design System.**

---

## Pré-requisitos

- Node.js >= 18
- pnpm >= 8 (recomendado) ou npm/yarn
- React >= 18
- TailwindCSS >= 3.4

---

## Instalação

### 1. Instalar Pacotes

```bash
# Com pnpm (recomendado)
pnpm add @facter/ds-core @facter/ds-utils

# Com npm
npm install @facter/ds-core @facter/ds-utils

# Com yarn
yarn add @facter/ds-core @facter/ds-utils
```

### 2. Dependências Peer (se necessário)

```bash
pnpm add react react-dom
```

---

## Configuração

### TailwindCSS

Adicione o path do Design System ao `content` do Tailwind:

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    // Importante: incluir o Design System
    './node_modules/@facter/ds-core/dist/**/*.{js,mjs}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
}
```

### CSS Variables

Adicione as variáveis CSS no seu arquivo global:

```css
/* globals.css ou index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Background e Foreground */
    --background: 0 0% 100%;
    --foreground: 0 0% 3.9%;

    /* Cards */
    --card: 0 0% 100%;
    --card-foreground: 0 0% 3.9%;

    /* Popovers */
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 3.9%;

    /* Primary (Laranja Facter) */
    --primary: 24 100% 50%;
    --primary-foreground: 0 0% 98%;

    /* Secondary */
    --secondary: 0 0% 96.1%;
    --secondary-foreground: 0 0% 9%;

    /* Muted */
    --muted: 0 0% 96.1%;
    --muted-foreground: 0 0% 45.1%;

    /* Accent */
    --accent: 0 0% 96.1%;
    --accent-foreground: 0 0% 9%;

    /* Destructive */
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;

    /* Borders e Inputs */
    --border: 0 0% 89.8%;
    --input: 0 0% 89.8%;
    --ring: 24 100% 50%;

    /* Border Radius */
    --radius: 0.5rem;
  }

  .dark {
    --background: 0 0% 3.9%;
    --foreground: 0 0% 98%;
    --card: 0 0% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 0 0% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 24 100% 50%;
    --primary-foreground: 0 0% 98%;
    --secondary: 0 0% 14.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 0 0% 14.9%;
    --muted-foreground: 0 0% 63.9%;
    --accent: 0 0% 14.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 14.9%;
    --input: 0 0% 14.9%;
    --ring: 24 100% 50%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

---

## Setup do App

### Providers

Configure os providers necessários no root da aplicação:

```tsx
// main.tsx ou App.tsx
import { ThemeProvider, Toaster, LoaderProvider } from '@facter/ds-core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="facter-theme">
        <LoaderProvider>
          {/* Sua aplicação */}
          <RouterProvider router={router} />

          {/* Componentes globais */}
          <Toaster />
        </LoaderProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
```

---

## Uso Básico

### Importando Componentes

```tsx
// Import individual (recomendado para tree-shaking)
import { Button } from '@facter/ds-core';
import { Input } from '@facter/ds-core';
import { Badge } from '@facter/ds-core';

// Ou import múltiplo
import { Button, Input, Badge, Select, Dialog } from '@facter/ds-core';
```

### Exemplo Completo

```tsx
import { Button, Input, Select, SelectItem, Badge, toast } from '@facter/ds-core';
import { formatCurrency, validateEmail } from '@facter/ds-utils';

export function UserForm() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Usuário salvo com sucesso!');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-2">
        <h1>Cadastro de Usuário</h1>
        <Badge variant="info">Novo</Badge>
      </div>

      <Input
        label="Nome"
        placeholder="Digite seu nome"
        required
      />

      <Input
        label="Email"
        type="email"
        placeholder="email@exemplo.com"
      />

      <Select placeholder="Selecione o cargo">
        <SelectItem value="admin">Administrador</SelectItem>
        <SelectItem value="user">Usuário</SelectItem>
        <SelectItem value="guest">Visitante</SelectItem>
      </Select>

      <div className="flex gap-2">
        <Button variant="outline" type="button">
          Cancelar
        </Button>
        <Button type="submit">
          Salvar
        </Button>
      </div>
    </form>
  );
}
```

---

## Dark Mode

### Usando ThemeProvider

```tsx
import { ThemeProvider, useTheme } from '@facter/ds-core';

// No root
<ThemeProvider defaultTheme="system">
  <App />
</ThemeProvider>

// Em qualquer componente
function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      {theme === 'dark' ? '🌞' : '🌙'}
    </button>
  );
}
```

### Opções de Tema

| Valor | Descrição |
|-------|-----------|
| `light` | Tema claro |
| `dark` | Tema escuro |
| `system` | Segue preferência do sistema |

---

## Toast Notifications

```tsx
import { toast } from '@facter/ds-core';

// Sucesso
toast.success('Operação realizada com sucesso!');

// Erro
toast.error('Algo deu errado. Tente novamente.');

// Warning
toast.warning('Atenção: dados não salvos.');

// Info
toast.info('Nova atualização disponível.');

// Com opções
toast.success('Salvo!', {
  description: 'O usuário foi cadastrado.',
  duration: 5000,
});
```

---

## Loader Global

```tsx
import { useLoader, LoaderProvider } from '@facter/ds-core';

// No root
<LoaderProvider>
  <App />
</LoaderProvider>

// Em qualquer componente
function MyComponent() {
  const loader = useLoader();

  const handleSubmit = async () => {
    loader.show({ message: 'Salvando...' });

    try {
      await saveData();
      toast.success('Salvo!');
    } finally {
      loader.hide();
    }
  };

  return <Button onClick={handleSubmit}>Salvar</Button>;
}
```

---

## DataTable

```tsx
import { DataTable, useDataTable } from '@facter/ds-core';
import { ColumnDef } from '@tanstack/react-table';

interface User {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
}

const columns: ColumnDef<User>[] = [
  { accessorKey: 'name', header: 'Nome' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'status', header: 'Status' },
];

function UsersTable() {
  const { data, isLoading } = useUsers();

  return (
    <DataTable data={data ?? []} columns={columns}>
      <DataTable.Toolbar>
        <DataTable.Search placeholder="Buscar usuários..." />
        <DataTable.Filters />
      </DataTable.Toolbar>
      <DataTable.Loading visible={isLoading} />
      <DataTable.Content />
      <DataTable.Pagination />
    </DataTable>
  );
}
```

---

## Utilities

### formatCurrency

```tsx
import { formatCurrency } from '@facter/ds-utils';

formatCurrency(1234.56);     // "R$ 1.234,56"
formatCurrency(0);           // "R$ 0,00"
formatCurrency(1000000);     // "R$ 1.000.000,00"
```

### formatDate

```tsx
import { formatDate, formatDateTime, formatRelativeDate } from '@facter/ds-utils';

const date = new Date('2025-01-15T10:30:00');

formatDate(date);           // "15/01/2025"
formatDateTime(date);       // "15/01/2025 10:30"
formatRelativeDate(date);   // "Hoje" ou "Ontem" ou "15/01/2025"
```

### validateCPF

```tsx
import { validateCPF, validateEmail } from '@facter/ds-utils';

validateCPF('123.456.789-09');  // true/false (valida dígitos verificadores)
validateEmail('user@test.com'); // true
validateEmail('invalid');       // false
```

### cn (Class Names)

```tsx
import { cn } from '@facter/ds-core';

// Merge de classes com tailwind-merge
<div className={cn(
  'px-4 py-2 rounded',
  isActive && 'bg-primary text-white',
  isDisabled && 'opacity-50 cursor-not-allowed',
  className
)} />
```

---

## Próximos Passos

1. Explore a [documentação de componentes](./componentes/)
2. Veja os [tokens de design](./tokens/)
3. Execute o [Storybook](../../facter-design-system/apps/docs) para exemplos interativos

---

**Voltar para** [Design System](./README.md)
