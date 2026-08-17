# Toast

> **Sistema de notificações toast baseado em Sonner.**

---

## Import

```tsx
import { Toaster, toast } from '@facter/ds-core';
```

---

## Setup

Adicione o `Toaster` no root da aplicação:

```tsx
// App.tsx
import { Toaster } from '@facter/ds-core';

function App() {
  return (
    <>
      <YourApp />
      <Toaster />
    </>
  );
}
```

---

## Uso Básico

```tsx
import { toast } from '@facter/ds-core';

// Sucesso
toast.success('Operação realizada com sucesso!');

// Erro
toast.error('Algo deu errado.');

// Warning
toast.warning('Atenção necessária.');

// Info
toast.info('Informação importante.');

// Default
toast('Mensagem padrão');
```

---

## Com Descrição

```tsx
toast.success('Usuário criado', {
  description: 'O usuário foi cadastrado com sucesso.',
});

toast.error('Falha ao salvar', {
  description: 'Verifique sua conexão e tente novamente.',
});
```

---

## Com Ação

```tsx
toast.error('Arquivo excluído', {
  description: 'O arquivo foi movido para a lixeira.',
  action: {
    label: 'Desfazer',
    onClick: () => restoreFile(),
  },
});
```

---

## Com Duração Customizada

```tsx
// Toast que dura 10 segundos
toast.info('Mensagem importante', {
  duration: 10000,
});

// Toast que não fecha automaticamente
toast.warning('Ação necessária', {
  duration: Infinity,
});
```

---

## Toast com Promise

```tsx
const saveUser = async (data: UserData) => {
  return api.post('/users', data);
};

toast.promise(saveUser(userData), {
  loading: 'Salvando usuário...',
  success: 'Usuário salvo com sucesso!',
  error: 'Erro ao salvar usuário.',
});
```

---

## Toast Customizado

```tsx
toast.custom((t) => (
  <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-lg">
    <Avatar src={user.avatar} />
    <div>
      <p className="font-medium">{user.name}</p>
      <p className="text-sm text-muted-foreground">Entrou no sistema</p>
    </div>
    <Button size="sm" onClick={() => toast.dismiss(t)}>
      Fechar
    </Button>
  </div>
));
```

---

## Dismiss

```tsx
// Fechar toast específico
const toastId = toast.success('Mensagem');
toast.dismiss(toastId);

// Fechar todos os toasts
toast.dismiss();
```

---

## Configuração do Toaster

```tsx
<Toaster
  position="top-right"    // Posição
  expand={false}          // Expandir ao hover
  richColors              // Cores mais ricas
  closeButton             // Mostrar botão de fechar
  duration={4000}         // Duração padrão
/>
```

### Posições Disponíveis

- `top-left`
- `top-center`
- `top-right` (padrão)
- `bottom-left`
- `bottom-center`
- `bottom-right`

---

## API

### toast()

```typescript
toast(message: string, options?: ToastOptions): string

interface ToastOptions {
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  cancel?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
  onAutoClose?: () => void;
}
```

### Métodos

| Método | Descrição |
|--------|-----------|
| `toast()` | Toast padrão |
| `toast.success()` | Toast de sucesso |
| `toast.error()` | Toast de erro |
| `toast.warning()` | Toast de warning |
| `toast.info()` | Toast de info |
| `toast.promise()` | Toast com promise |
| `toast.custom()` | Toast customizado |
| `toast.dismiss()` | Fechar toast |

---

## Exemplos de Uso

### Após Mutation

```tsx
const { mutate } = useMutation({
  mutationFn: createUser,
  onSuccess: () => {
    toast.success('Usuário criado com sucesso!');
    queryClient.invalidateQueries(['users']);
  },
  onError: (error) => {
    toast.error('Erro ao criar usuário', {
      description: error.message,
    });
  },
});
```

### Com Form

```tsx
const onSubmit = async (data: FormData) => {
  try {
    await saveData(data);
    toast.success('Dados salvos!');
    form.reset();
  } catch (error) {
    toast.error('Erro ao salvar', {
      description: 'Verifique os dados e tente novamente.',
    });
  }
};
```

---

**Voltar para** [Componentes](./README.md)
