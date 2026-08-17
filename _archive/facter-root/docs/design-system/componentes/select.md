# Select

> **Componente de seleção dropdown baseado em Radix UI.**
> Suporta floating label, ícones e agrupamento de opções.

---

## Import

```tsx
import {
  Select,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from '@facter/ds-core';
```

---

## Uso Básico

```tsx
<Select label="Status" placeholder="Selecione...">
  <SelectItem value="active">Ativo</SelectItem>
  <SelectItem value="inactive">Inativo</SelectItem>
  <SelectItem value="pending">Pendente</SelectItem>
</Select>
```

---

## Com Valor Controlado

```tsx
function ControlledSelect() {
  const [value, setValue] = useState('');

  return (
    <Select
      label="Categoria"
      value={value}
      onValueChange={setValue}
      placeholder="Selecione uma categoria"
    >
      <SelectItem value="electronics">Eletrônicos</SelectItem>
      <SelectItem value="clothing">Vestuário</SelectItem>
      <SelectItem value="food">Alimentos</SelectItem>
    </Select>
  );
}
```

---

## Tamanhos

```tsx
<Select selectSize="sm" label="Pequeno" placeholder="...">
  <SelectItem value="1">Opção 1</SelectItem>
</Select>

<Select selectSize="default" label="Padrão" placeholder="...">
  <SelectItem value="1">Opção 1</SelectItem>
</Select>

<Select selectSize="lg" label="Grande" placeholder="...">
  <SelectItem value="1">Opção 1</SelectItem>
</Select>
```

---

## Com Ícone

```tsx
import { User } from 'lucide-react';

<Select label="Usuário" icon={User} placeholder="Selecione...">
  <SelectItem value="john">João Silva</SelectItem>
  <SelectItem value="maria">Maria Santos</SelectItem>
</Select>
```

---

## Estado de Erro

```tsx
<Select
  label="Campo obrigatório"
  error
  required
  placeholder="Selecione..."
>
  <SelectItem value="1">Opção 1</SelectItem>
</Select>
```

---

## Com Grupos

```tsx
<Select label="Localização" placeholder="Selecione...">
  <SelectGroup>
    <SelectLabel>América do Sul</SelectLabel>
    <SelectItem value="br">Brasil</SelectItem>
    <SelectItem value="ar">Argentina</SelectItem>
    <SelectItem value="cl">Chile</SelectItem>
  </SelectGroup>

  <SelectSeparator />

  <SelectGroup>
    <SelectLabel>Europa</SelectLabel>
    <SelectItem value="pt">Portugal</SelectItem>
    <SelectItem value="es">Espanha</SelectItem>
    <SelectItem value="fr">França</SelectItem>
  </SelectGroup>
</Select>
```

---

## Itens Desabilitados

```tsx
<Select label="Plano" placeholder="Selecione um plano">
  <SelectItem value="free">Gratuito</SelectItem>
  <SelectItem value="pro">Profissional</SelectItem>
  <SelectItem value="enterprise" disabled>
    Enterprise (Em breve)
  </SelectItem>
</Select>
```

---

## Com React Hook Form

```tsx
import { useForm, Controller } from 'react-hook-form';

function FormWithSelect() {
  const { control, handleSubmit } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="status"
        control={control}
        rules={{ required: 'Status é obrigatório' }}
        render={({ field, fieldState }) => (
          <Select
            label="Status"
            placeholder="Selecione..."
            value={field.value}
            onValueChange={field.onChange}
            error={!!fieldState.error}
            required
          >
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="inactive">Inativo</SelectItem>
          </Select>
        )}
      />
    </form>
  );
}
```

---

## API

### Select Props

```typescript
interface SelectProps {
  label?: string;
  placeholder?: string;
  error?: boolean;
  required?: boolean;
  icon?: React.ComponentType<any>;
  selectSize?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'error';
  className?: string;
  containerClassName?: string;
  labelClassName?: string;
  // Props do Radix Select.Root
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
}
```

### SelectItem Props

```typescript
interface SelectItemProps {
  value: string;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}
```

---

## Subcomponentes

| Componente | Descrição |
|------------|-----------|
| `Select` | Root com trigger e dropdown |
| `SelectItem` | Item selecionável |
| `SelectGroup` | Agrupa itens relacionados |
| `SelectLabel` | Label do grupo |
| `SelectSeparator` | Linha divisória |

---

## Acessibilidade

- Navegação por teclado (setas, Enter, Escape)
- `aria-expanded` automático
- Focus management correto
- Screen reader friendly

---

**Voltar para** [Componentes](./README.md)
