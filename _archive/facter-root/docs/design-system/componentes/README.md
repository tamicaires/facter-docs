# Componentes

> **Documentação de todos os componentes do Facter Design System.**

---

## Inputs & Forms

| Componente | Descrição |
|------------|-----------|
| [Button](./button.md) | Botões com variantes e tamanhos |
| [Input](./input.md) | Campo de texto com label, ícone e erro |
| [Select](./select.md) | Dropdown de seleção |
| [Checkbox](./checkbox.md) | Caixa de seleção |
| [Switch](./switch.md) | Toggle on/off |
| [Textarea](./textarea.md) | Área de texto multilinha |

---

## Data Display

| Componente | Descrição |
|------------|-----------|
| [Badge](./badge.md) | Tags e labels coloridos |
| [DataTable](./data-table.md) | Tabela de dados avançada (Compound Component) |
| [EmptyState](./empty-state.md) | Estado vazio para listas e tabelas |

---

## Feedback

| Componente | Descrição |
|------------|-----------|
| [Loader](./loader.md) | Indicadores de carregamento (5 variantes) |
| [Toast](./toast.md) | Notificações toast |
| [Dialog](./dialog.md) | Modais e dialogs |

---

## Layout

| Componente | Descrição |
|------------|-----------|
| [Tabs](./tabs.md) | Navegação em abas |

---

## Efeitos

| Componente | Descrição |
|------------|-----------|
| [RippleEffect](./ripple-effect.md) | Efeito de clique estilo Material |

---

## Providers

| Provider | Descrição |
|----------|-----------|
| ThemeProvider | Gerencia tema dark/light/system |
| LoaderProvider | Contexto global para loader |

---

## Padrões de Uso

### Import

```tsx
// Individual (recomendado)
import { Button } from '@facter/ds-core';

// Múltiplo
import { Button, Input, Select } from '@facter/ds-core';
```

### Tipagem

```tsx
// Todos os componentes exportam seus tipos
import { Button, type ButtonProps } from '@facter/ds-core';

// Usar em componentes customizados
interface MyButtonProps extends ButtonProps {
  isLoading?: boolean;
}
```

### Customização

```tsx
// Via className
<Button className="w-full">Full Width</Button>

// Via cn() para merge inteligente
<Button className={cn('custom-class', isActive && 'active')}>
  Custom
</Button>
```

---

**Voltar para** [Design System](../README.md)
