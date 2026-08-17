# Facter Design System

> **Biblioteca de componentes UI para o ecossistema Facter.**
> Garante consistência visual e experiência unificada entre todos os produtos.

---

## Status

| Package | Versão | Status |
|---------|--------|--------|
| @facter/ds-core | 1.1.1 | ✅ Produção |
| @facter/ds-utils | 1.0.0 | ✅ Produção |

---

## Componentes Disponíveis

### Inputs & Forms
| Componente | Descrição | Documentação |
|------------|-----------|--------------|
| [Button](./componentes/button.md) | Botões com variantes e tamanhos | ✅ |
| [Input](./componentes/input.md) | Campo de texto com label e erro | ✅ |
| [Select](./componentes/select.md) | Dropdown de seleção | ✅ |
| [Checkbox](./componentes/checkbox.md) | Caixa de seleção | ✅ |
| [Switch](./componentes/switch.md) | Toggle on/off | ✅ |
| [Textarea](./componentes/textarea.md) | Área de texto multilinha | ✅ |

### Data Display
| Componente | Descrição | Documentação |
|------------|-----------|--------------|
| [Badge](./componentes/badge.md) | Tags e labels | ✅ |
| [DataTable](./componentes/data-table.md) | Tabela de dados avançada | ✅ |
| [EmptyState](./componentes/empty-state.md) | Estado vazio | ✅ |

### Feedback
| Componente | Descrição | Documentação |
|------------|-----------|--------------|
| [Loader](./componentes/loader.md) | Indicadores de carregamento | ✅ |
| [Toast](./componentes/toast.md) | Notificações | ✅ |
| [Dialog](./componentes/dialog.md) | Modais e dialogs | ✅ |

### Layout
| Componente | Descrição | Documentação |
|------------|-----------|--------------|
| [Tabs](./componentes/tabs.md) | Navegação em abas | ✅ |

### Efeitos
| Componente | Descrição | Documentação |
|------------|-----------|--------------|
| [RippleEffect](./componentes/ripple-effect.md) | Efeito de clique | ✅ |

---

## Quick Start

### 1. Instalação

```bash
# Com pnpm (recomendado)
pnpm add @facter/ds-core @facter/ds-utils

# Com npm
npm install @facter/ds-core @facter/ds-utils

# Com yarn
yarn add @facter/ds-core @facter/ds-utils
```

### 2. Configurar TailwindCSS

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
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

### 3. Adicionar CSS Variables

```css
/* globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 3.9%;
    --primary: 24 100% 50%;
    --primary-foreground: 0 0% 98%;
    --secondary: 0 0% 96.1%;
    --secondary-foreground: 0 0% 9%;
    --muted: 0 0% 96.1%;
    --muted-foreground: 0 0% 45.1%;
    --accent: 0 0% 96.1%;
    --accent-foreground: 0 0% 9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 89.8%;
    --input: 0 0% 89.8%;
    --ring: 24 100% 50%;
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
```

### 4. Configurar Providers

```tsx
// App.tsx
import { ThemeProvider, Toaster } from '@facter/ds-core';

export function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <YourApp />
      <Toaster />
    </ThemeProvider>
  );
}
```

### 5. Usar Componentes

```tsx
import { Button, Input, Badge } from '@facter/ds-core';

export function MyComponent() {
  return (
    <div>
      <Badge variant="success">Ativo</Badge>
      <Input label="Nome" placeholder="Digite seu nome" />
      <Button variant="default">Salvar</Button>
    </div>
  );
}
```

---

## Documentação

| Seção | Descrição |
|-------|-----------|
| [Guia de Início](./guia-inicio.md) | Instalação e configuração detalhada |
| [Componentes](./componentes/) | Documentação de cada componente |
| [Tokens](./tokens/) | Cores, tipografia, espaçamento |
| [Padrões](./padroes/) | Acessibilidade, responsividade, dark mode |
| [Storybook](../facter-design-system/apps/docs) | Documentação interativa |

---

## Storybook

O Design System possui Storybook com documentação interativa de todos os componentes.

```bash
# Executar Storybook
cd facter-design-system
pnpm storybook
```

**Stories disponíveis:**
- Button, Badge, Input, Select
- Dialog, Tabs, Checkbox, Switch, Textarea
- Toast, Loader, EmptyState
- DataTable (avançado)
- ThemeDemo, Components-DarkMode, Components-LightMode

---

## Utilities (@facter/ds-utils)

### Formatters

```typescript
import { formatCurrency, formatDate, formatDateTime, formatRelativeDate } from '@facter/ds-utils';

formatCurrency(1234.56);        // "R$ 1.234,56"
formatDate(new Date());         // "15/01/2025"
formatDateTime(new Date());     // "15/01/2025 10:30"
formatRelativeDate(new Date()); // "Hoje"
```

### Validators

```typescript
import { validateEmail, validateCPF } from '@facter/ds-utils';

validateEmail('user@example.com'); // true
validateCPF('123.456.789-09');     // true/false (valida dígitos)
```

### Utilities

```typescript
import { cn } from '@facter/ds-core';

// Merge de classes com tailwind-merge
cn('px-4 py-2', isActive && 'bg-primary', className);
```

---

## Arquitetura

```
@facter/design-system (monorepo)
├── packages/
│   ├── core/           # Componentes principais
│   │   ├── components/
│   │   ├── providers/
│   │   └── utils/
│   └── utils/          # Formatters e validators
│
└── apps/
    └── docs/           # Storybook
```

---

## Contribuindo

### Padrões

1. **Compound Components** para componentes complexos (DataTable)
2. **CVA (Class Variance Authority)** para variantes
3. **forwardRef** em todos os componentes
4. **TypeScript strict** para tipagem
5. **Radix UI** para primitivos acessíveis

### Desenvolvimento

```bash
# Clone o repositório
git clone https://github.com/tamicaires/facter-design-system.git

# Instale dependências
pnpm install

# Desenvolva com watch
pnpm dev

# Execute Storybook
pnpm storybook

# Build
pnpm build
```

---

## Changelog

Ver [CHANGELOG](../../facter-design-system/CHANGELOG.md) para histórico de versões.

---

**Voltar para** [Documentação](../README.md)
