# Checkbox

> **Componente de checkbox acessível baseado em Radix UI.**
> Suporta múltiplas variantes e tamanhos.

---

## Import

```tsx
import { Checkbox } from '@facter/ds-core';
```

---

## Uso Básico

```tsx
<Checkbox />
```

---

## Com Label

```tsx
<div className="flex items-center gap-2">
  <Checkbox id="terms" />
  <label htmlFor="terms" className="text-sm">
    Aceito os termos de uso
  </label>
</div>
```

---

## Variantes

```tsx
<Checkbox variant="default" />
<Checkbox variant="secondary" />
<Checkbox variant="outline" />
```

| Variante | Descrição |
|----------|-----------|
| `default` | Cor primária (laranja) |
| `secondary` | Cor secundária |
| `outline` | Borda com check colorido |

---

## Tamanhos

```tsx
<Checkbox size="sm" />  {/* 16px */}
<Checkbox size="md" />  {/* 20px - padrão */}
<Checkbox size="lg" />  {/* 24px */}
```

---

## Controlado

```tsx
function ControlledCheckbox() {
  const [checked, setChecked] = useState(false);

  return (
    <Checkbox
      checked={checked}
      onCheckedChange={setChecked}
    />
  );
}
```

---

## Indeterminado

```tsx
function IndeterminateCheckbox() {
  const [checked, setChecked] = useState<boolean | 'indeterminate'>('indeterminate');

  return (
    <Checkbox
      checked={checked}
      onCheckedChange={(value) => setChecked(value)}
    />
  );
}
```

---

## Desabilitado

```tsx
<Checkbox disabled />
<Checkbox disabled checked />
```

---

## Com React Hook Form

```tsx
import { useForm, Controller } from 'react-hook-form';

function FormWithCheckbox() {
  const { control, handleSubmit } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="acceptTerms"
        control={control}
        rules={{ required: 'Você deve aceitar os termos' }}
        render={({ field }) => (
          <div className="flex items-center gap-2">
            <Checkbox
              id="acceptTerms"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
            <label htmlFor="acceptTerms" className="text-sm">
              Aceito os termos e condições
            </label>
          </div>
        )}
      />
    </form>
  );
}
```

---

## Lista de Seleção

```tsx
function CheckboxList() {
  const [selected, setSelected] = useState<string[]>([]);

  const items = ['React', 'Vue', 'Angular', 'Svelte'];

  const handleChange = (item: string, checked: boolean) => {
    if (checked) {
      setSelected([...selected, item]);
    } else {
      setSelected(selected.filter((i) => i !== item));
    }
  };

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item} className="flex items-center gap-2">
          <Checkbox
            id={item}
            checked={selected.includes(item)}
            onCheckedChange={(checked) => handleChange(item, !!checked)}
          />
          <label htmlFor={item} className="text-sm">
            {item}
          </label>
        </div>
      ))}
    </div>
  );
}
```

---

## Selecionar Todos

```tsx
function SelectAllExample() {
  const items = ['Item 1', 'Item 2', 'Item 3'];
  const [selected, setSelected] = useState<string[]>([]);

  const allSelected = selected.length === items.length;
  const someSelected = selected.length > 0 && selected.length < items.length;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Checkbox
          checked={someSelected ? 'indeterminate' : allSelected}
          onCheckedChange={(checked) => {
            setSelected(checked ? items : []);
          }}
        />
        <label className="text-sm font-medium">Selecionar todos</label>
      </div>

      <div className="ml-6 space-y-2">
        {items.map((item) => (
          <div key={item} className="flex items-center gap-2">
            <Checkbox
              checked={selected.includes(item)}
              onCheckedChange={(checked) => {
                setSelected(
                  checked
                    ? [...selected, item]
                    : selected.filter((i) => i !== item)
                );
              }}
            />
            <label className="text-sm">{item}</label>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## API

### Props

```typescript
interface CheckboxProps {
  variant?: 'default' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  checked?: boolean | 'indeterminate';
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean | 'indeterminate') => void;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  value?: string;
  className?: string;
}
```

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `variant` | string | `"default"` | Estilo visual |
| `size` | string | `"md"` | Tamanho |
| `checked` | boolean \| 'indeterminate' | - | Estado controlado |
| `onCheckedChange` | function | - | Callback de mudança |
| `disabled` | boolean | `false` | Desabilita interação |

---

## Acessibilidade

- Suporta navegação por teclado (Space para toggle)
- `aria-checked` automático
- Funciona com labels associadas via `htmlFor`
- Suporta estado indeterminado

---

**Voltar para** [Componentes](./README.md)
