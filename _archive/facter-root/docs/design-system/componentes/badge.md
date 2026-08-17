# Badge

> **Componente para exibir status, tags e labels.**

---

## Import

```tsx
import { Badge } from '@facter/ds-core';
```

---

## Uso Básico

```tsx
<Badge>Default</Badge>
```

---

## Variantes

```tsx
<Badge variant="default">Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="error">Error</Badge>
<Badge variant="info">Info</Badge>
<Badge variant="outline">Outline</Badge>
```

| Variante | Uso |
|----------|-----|
| `default` | Padrão, cor primária |
| `secondary` | Informação secundária |
| `success` | Status positivo (ativo, aprovado) |
| `warning` | Alerta, atenção necessária |
| `error` | Erro, status negativo |
| `info` | Informação neutra |
| `outline` | Estilo com borda |

---

## Tamanhos

```tsx
<Badge size="sm">Pequeno</Badge>
<Badge size="default">Padrão</Badge>
<Badge size="lg">Grande</Badge>
```

---

## Casos de Uso

### Status em Tabelas

```tsx
<Badge variant={status === 'active' ? 'success' : 'secondary'}>
  {status === 'active' ? 'Ativo' : 'Inativo'}
</Badge>
```

### Tags

```tsx
<div className="flex gap-1">
  <Badge variant="outline">React</Badge>
  <Badge variant="outline">TypeScript</Badge>
  <Badge variant="outline">TailwindCSS</Badge>
</div>
```

### Contadores

```tsx
<div className="relative">
  <Bell className="h-6 w-6" />
  <Badge className="absolute -top-2 -right-2" size="sm">
    5
  </Badge>
</div>
```

### Prioridade

```tsx
function PriorityBadge({ priority }: { priority: 'high' | 'medium' | 'low' }) {
  const variants = {
    high: 'error',
    medium: 'warning',
    low: 'info',
  } as const;

  const labels = {
    high: 'Alta',
    medium: 'Média',
    low: 'Baixa',
  };

  return (
    <Badge variant={variants[priority]}>
      {labels[priority]}
    </Badge>
  );
}
```

---

## API

### Props

```typescript
interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'outline';
  size?: 'default' | 'sm' | 'lg';
}
```

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `variant` | string | `"default"` | Estilo visual |
| `size` | string | `"default"` | Tamanho |
| `className` | string | - | Classes adicionais |

---

## Acessibilidade

- Usa `role` apropriado quando necessário
- Contraste de cores adequado
- Pode ser usado com `aria-label` para contexto adicional

---

**Voltar para** [Componentes](./README.md)
