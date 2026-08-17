# Input

> **Campo de entrada de texto com label, ícone e estado de erro.**

---

## Import

```tsx
import { Input } from '@facter/ds-core';
```

---

## Uso Básico

```tsx
<Input placeholder="Digite algo..." />
```

---

## Com Label

```tsx
<Input label="Nome completo" placeholder="Digite seu nome" />
```

---

## Tipos

```tsx
<Input type="text" label="Nome" />
<Input type="email" label="Email" />
<Input type="password" label="Senha" />
<Input type="number" label="Idade" />
<Input type="tel" label="Telefone" />
<Input type="url" label="Website" />
```

---

## Tamanhos

```tsx
<Input size="sm" label="Pequeno" />
<Input size="default" label="Padrão" />
<Input size="lg" label="Grande" />
```

---

## Com Ícone

```tsx
import { Search, Mail, Lock } from 'lucide-react';

<Input icon={Search} placeholder="Buscar..." />
<Input icon={Mail} label="Email" type="email" />
<Input icon={Lock} label="Senha" type="password" />
```

---

## Estado de Erro

```tsx
<Input
  label="Email"
  error={true}
  placeholder="email@exemplo.com"
/>

// Com React Hook Form
<Input
  label="Email"
  error={!!errors.email}
  {...register('email')}
/>
```

---

## Password com Toggle

O Input do tipo password já inclui toggle de visibilidade:

```tsx
<Input type="password" label="Senha" />
```

---

## Disabled

```tsx
<Input disabled label="Campo desabilitado" value="Não editável" />
```

---

## API

### Props

```typescript
interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: boolean;
  icon?: React.ComponentType<any>;
  size?: 'default' | 'sm' | 'lg';
  containerClassName?: string;
  labelClassName?: string;
}
```

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `label` | string | - | Label do campo |
| `error` | boolean | `false` | Estado de erro |
| `icon` | Component | - | Ícone à esquerda |
| `size` | string | `"default"` | Tamanho |
| `containerClassName` | string | - | Classes do container |
| `labelClassName` | string | - | Classes da label |

---

## Com React Hook Form

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input, Button } from '@facter/ds-core';

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
});

function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Email"
        type="email"
        error={!!errors.email}
        {...register('email')}
      />
      {errors.email && (
        <span className="text-sm text-destructive">{errors.email.message}</span>
      )}

      <Input
        label="Senha"
        type="password"
        error={!!errors.password}
        {...register('password')}
      />
      {errors.password && (
        <span className="text-sm text-destructive">{errors.password.message}</span>
      )}

      <Button type="submit" className="w-full">Entrar</Button>
    </form>
  );
}
```

---

## Acessibilidade

- Label associada via `htmlFor` automático
- Usa `aria-invalid` quando `error={true}`
- Focus ring visível
- Suporta todos os atributos HTML de input

---

## Ref

O Input suporta `forwardRef`:

```tsx
const inputRef = useRef<HTMLInputElement>(null);

<Input ref={inputRef} label="Nome" />

// Focar programaticamente
inputRef.current?.focus();
```

---

**Voltar para** [Componentes](./README.md)
