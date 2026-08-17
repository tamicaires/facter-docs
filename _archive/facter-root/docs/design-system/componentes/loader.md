# Loader

> **Indicadores de carregamento com múltiplas variantes.**
> Inclui Provider para controle global.

---

## Import

```tsx
import { Loader, LoaderProvider, useLoader } from '@facter/ds-core';
```

---

## Uso Básico (Componente)

```tsx
<Loader />
```

---

## Variantes

```tsx
<Loader variant="spinner" />
<Loader variant="dots" />
<Loader variant="pulse" />
<Loader variant="bars" />
```

| Variante | Descrição |
|----------|-----------|
| `spinner` | Círculo girando (padrão) |
| `dots` | Pontos pulsando |
| `pulse` | Pulso circular |
| `bars` | Barras animadas |

---

## Tamanhos

```tsx
<Loader size="sm" />
<Loader size="md" />
<Loader size="lg" />
```

---

## Com Mensagem

```tsx
<Loader message="Carregando dados..." />
```

---

## Fullscreen

```tsx
<Loader fullscreen message="Aguarde..." />
```

---

## Loader Global (Provider)

### Setup

```tsx
// App.tsx
import { LoaderProvider } from '@facter/ds-core';

function App() {
  return (
    <LoaderProvider>
      <YourApp />
    </LoaderProvider>
  );
}
```

### Uso com Hook

```tsx
import { useLoader } from '@facter/ds-core';

function MyComponent() {
  const loader = useLoader();

  const handleSubmit = async () => {
    loader.show({ message: 'Salvando...' });

    try {
      await saveData();
      toast.success('Salvo!');
    } catch (error) {
      toast.error('Erro ao salvar');
    } finally {
      loader.hide();
    }
  };

  return <Button onClick={handleSubmit}>Salvar</Button>;
}
```

### API do Hook

```typescript
const loader = useLoader();

// Mostrar loader
loader.show();
loader.show({ message: 'Carregando...' });
loader.show({ variant: 'dots', message: 'Processando...' });

// Esconder loader
loader.hide();

// Estado
loader.isLoading; // boolean
```

---

## Loader Imperativo

Para casos onde não é possível usar hooks:

```tsx
import { loader } from '@facter/ds-core';

// Em qualquer lugar
loader.show({ message: 'Aguarde...' });

// Após operação
loader.hide();
```

---

## Com React Query

```tsx
function UsersPage() {
  const loader = useLoader();
  const { mutate } = useCreateUser();

  const handleCreate = (data: UserData) => {
    loader.show({ message: 'Criando usuário...' });

    mutate(data, {
      onSettled: () => loader.hide(),
      onSuccess: () => toast.success('Usuário criado!'),
      onError: () => toast.error('Erro ao criar'),
    });
  };

  return (/* ... */);
}
```

---

## Loader em Componentes Específicos

Para loaders localizados (não fullscreen):

```tsx
function Card() {
  const { data, isLoading } = useData();

  return (
    <div className="relative p-4 border rounded">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <Loader variant="dots" size="sm" />
        </div>
      )}
      {data && <Content data={data} />}
    </div>
  );
}
```

---

## API

### Loader Props

```typescript
interface LoaderProps {
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars';
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  fullscreen?: boolean;
  className?: string;
}
```

### useLoader

```typescript
interface UseLoaderReturn {
  show: (options?: LoaderOptions) => void;
  hide: () => void;
  isLoading: boolean;
}

interface LoaderOptions {
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars';
  message?: string;
}
```

---

## Boas Práticas

1. **Use o loader global** para operações que bloqueiam a UI
2. **Use loaders locais** para partes específicas da tela
3. **Sempre chame `hide()`** em `finally` ou `onSettled`
4. **Adicione mensagens** para operações longas

```tsx
// ✅ Bom - sempre fecha o loader
const handleSubmit = async () => {
  loader.show({ message: 'Salvando...' });
  try {
    await save();
  } finally {
    loader.hide();
  }
};

// ❌ Ruim - pode deixar loader aberto se der erro
const handleSubmit = async () => {
  loader.show();
  await save();
  loader.hide();
};
```

---

**Voltar para** [Componentes](./README.md)
