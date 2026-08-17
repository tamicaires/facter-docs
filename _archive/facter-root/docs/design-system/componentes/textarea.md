# Textarea

> **Componente de área de texto com suporte a floating label e auto-resize.**

---

## Import

```tsx
import { Textarea } from '@facter/ds-core';
```

---

## Uso Básico

```tsx
<Textarea label="Descrição" placeholder="Digite aqui..." />
```

---

## Tamanhos

```tsx
<Textarea textareaSize="sm" label="Pequeno" />   {/* min-height: 80px */}
<Textarea textareaSize="default" label="Padrão" /> {/* min-height: 100px */}
<Textarea textareaSize="lg" label="Grande" />    {/* min-height: 120px */}
```

---

## Com Ícone

```tsx
import { MessageSquare } from 'lucide-react';

<Textarea
  label="Mensagem"
  icon={MessageSquare}
  placeholder="Escreva sua mensagem..."
/>
```

---

## Estado de Erro

```tsx
<Textarea
  label="Comentário"
  error
  required
  placeholder="Campo obrigatório"
/>
```

---

## Auto-Resize

O textarea cresce automaticamente conforme o conteúdo:

```tsx
<Textarea
  label="Notas"
  autoResize
  placeholder="O campo vai crescer conforme você digita..."
/>
```

---

## Controlado

```tsx
function ControlledTextarea() {
  const [value, setValue] = useState('');

  return (
    <div>
      <Textarea
        label="Comentário"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Digite seu comentário..."
      />
      <p className="text-xs text-muted-foreground mt-1">
        {value.length}/500 caracteres
      </p>
    </div>
  );
}
```

---

## Com React Hook Form

```tsx
import { useForm } from 'react-hook-form';

function FeedbackForm() {
  const { register, handleSubmit, formState: { errors } } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Textarea
        label="Feedback"
        placeholder="Conte-nos sua experiência..."
        error={!!errors.feedback}
        required
        {...register('feedback', {
          required: 'Feedback é obrigatório',
          minLength: {
            value: 10,
            message: 'Mínimo de 10 caracteres',
          },
        })}
      />
      {errors.feedback && (
        <p className="text-red-500 text-xs mt-1">
          {errors.feedback.message}
        </p>
      )}
    </form>
  );
}
```

---

## Com Limite de Caracteres

```tsx
function LimitedTextarea() {
  const [value, setValue] = useState('');
  const maxLength = 280;

  return (
    <div>
      <Textarea
        label="Tweet"
        value={value}
        onChange={(e) => setValue(e.target.value.slice(0, maxLength))}
        placeholder="O que está acontecendo?"
        autoResize
      />
      <div className="flex justify-end mt-1">
        <span
          className={cn(
            'text-xs',
            value.length > maxLength * 0.9
              ? 'text-red-500'
              : 'text-muted-foreground'
          )}
        >
          {value.length}/{maxLength}
        </span>
      </div>
    </div>
  );
}
```

---

## Desabilitado e Readonly

```tsx
{/* Desabilitado */}
<Textarea
  label="Campo desabilitado"
  disabled
  value="Não pode ser editado"
/>

{/* Somente leitura */}
<Textarea
  label="Somente leitura"
  readOnly
  value="Pode ser selecionado mas não editado"
/>
```

---

## Altura Fixa

```tsx
<Textarea
  label="Descrição"
  className="h-40 resize-none"
  placeholder="Altura fixa de 160px"
/>
```

---

## Com Resize Manual

Por padrão, o resize está desativado. Para permitir:

```tsx
{/* Resize vertical */}
<Textarea
  label="Com resize"
  className="resize-y"
/>

{/* Resize livre */}
<Textarea
  label="Resize livre"
  className="resize"
/>
```

---

## API

### Props

```typescript
interface TextareaProps {
  label?: string;
  error?: boolean;
  required?: boolean;
  icon?: React.ComponentType<any>;
  textareaSize?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'error';
  autoResize?: boolean;
  className?: string;
  containerClassName?: string;
  labelClassName?: string;
  // Props nativas do textarea
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;
  readOnly?: boolean;
  rows?: number;
  maxLength?: number;
}
```

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `label` | string | - | Floating label |
| `error` | boolean | `false` | Estado de erro |
| `textareaSize` | string | `"default"` | Altura mínima |
| `autoResize` | boolean | `false` | Crescer automaticamente |
| `icon` | Component | - | Ícone no canto esquerdo |

---

## Acessibilidade

- Label associada automaticamente
- Estados de erro anunciados
- Suporta navegação por teclado
- Contraste adequado

---

**Voltar para** [Componentes](./README.md)
