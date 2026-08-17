# Button

> **Componente de botão com múltiplas variantes e tamanhos.**

---

## Import

```tsx
import { Button } from '@facter/ds-core';
```

---

## Uso Básico

```tsx
<Button>Clique aqui</Button>
```

---

## Variantes

```tsx
<Button variant="default">Default</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
```

| Variante | Uso |
|----------|-----|
| `default` | Ação principal |
| `destructive` | Ações destrutivas (deletar, remover) |
| `outline` | Ação secundária com borda |
| `secondary` | Ação secundária |
| `ghost` | Ação terciária, sem background |
| `link` | Estilo de link |

---

## Tamanhos

```tsx
<Button size="sm">Pequeno</Button>
<Button size="default">Padrão</Button>
<Button size="lg">Grande</Button>
<Button size="icon">🔍</Button>
<Button size="icon-sm">🔍</Button>
```

| Tamanho | Dimensões |
|---------|-----------|
| `sm` | h-9 px-3 |
| `default` | h-10 px-4 py-2 |
| `lg` | h-11 px-8 |
| `icon` | h-10 w-10 |
| `icon-sm` | h-9 w-9 |

---

## Com Ícone

```tsx
import { Plus, Save, Trash } from 'lucide-react';

<Button>
  <Plus className="mr-2 h-4 w-4" />
  Adicionar
</Button>

<Button variant="destructive">
  <Trash className="mr-2 h-4 w-4" />
  Remover
</Button>

<Button size="icon">
  <Save className="h-4 w-4" />
</Button>
```

---

## Estados

### Disabled

```tsx
<Button disabled>Desabilitado</Button>
```

### Loading

```tsx
<Button disabled>
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  Carregando...
</Button>
```

---

## Como Link

```tsx
<Button asChild>
  <a href="/dashboard">Ir para Dashboard</a>
</Button>

// Com React Router
<Button asChild>
  <Link to="/users">Usuários</Link>
</Button>
```

---

## API

### Props

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'icon-sm';
  asChild?: boolean;
}
```

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `variant` | string | `"default"` | Estilo visual |
| `size` | string | `"default"` | Tamanho |
| `asChild` | boolean | `false` | Renderiza como filho |
| `disabled` | boolean | `false` | Desabilita o botão |
| `className` | string | - | Classes adicionais |

---

## Acessibilidade

- Usa elemento `<button>` nativo
- Suporta `disabled` corretamente
- Focus ring visível para navegação por teclado
- Contraste de cores adequado (WCAG AA)

---

## Exemplos

### Formulário

```tsx
<form onSubmit={handleSubmit}>
  {/* campos */}
  <div className="flex gap-2">
    <Button variant="outline" type="button" onClick={onCancel}>
      Cancelar
    </Button>
    <Button type="submit">
      Salvar
    </Button>
  </div>
</form>
```

### Ações de Tabela

```tsx
<div className="flex gap-1">
  <Button variant="ghost" size="icon-sm">
    <Edit className="h-4 w-4" />
  </Button>
  <Button variant="ghost" size="icon-sm">
    <Trash className="h-4 w-4" />
  </Button>
</div>
```

---

**Voltar para** [Componentes](./README.md)
