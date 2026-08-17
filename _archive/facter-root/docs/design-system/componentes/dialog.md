# Dialog

> **Componente de modal/dialog acessível baseado em Radix UI.**

---

## Import

```tsx
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  DialogClose,
} from '@facter/ds-core';
```

---

## Uso Básico

```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button>Abrir Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Título do Dialog</DialogTitle>
      <DialogDescription>
        Descrição opcional do dialog.
      </DialogDescription>
    </DialogHeader>
    <DialogBody>
      Conteúdo do dialog aqui.
    </DialogBody>
    <DialogFooter>
      <DialogClose asChild>
        <Button variant="outline">Cancelar</Button>
      </DialogClose>
      <Button>Confirmar</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

## Tamanhos

```tsx
<DialogContent size="sm">...</DialogContent>  // 425px
<DialogContent size="md">...</DialogContent>  // 525px (padrão)
<DialogContent size="lg">...</DialogContent>  // 725px
<DialogContent size="xl">...</DialogContent>  // 925px
<DialogContent size="2xl">...</DialogContent> // 1025px
<DialogContent size="full">...</DialogContent> // 95vw
```

---

## Controlado

```tsx
function ControlledDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Abrir</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog Controlado</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <p>O estado é controlado externamente.</p>
        </DialogBody>
        <DialogFooter>
          <Button onClick={() => setOpen(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

---

## Com Formulário

```tsx
function UserFormDialog() {
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useCreateUser();

  const handleSubmit = (data: FormData) => {
    mutate(data, {
      onSuccess: () => {
        setOpen(false);
        toast.success('Usuário criado!');
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Novo Usuário</Button>
      </DialogTrigger>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>Novo Usuário</DialogTitle>
          <DialogDescription>
            Preencha os dados para criar um novo usuário.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <DialogBody className="space-y-4">
            <Input label="Nome" name="name" required />
            <Input label="Email" name="email" type="email" required />
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">Cancelar</Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

---

## Dialog de Confirmação

```tsx
function DeleteConfirmDialog({ onConfirm }: { onConfirm: () => void }) {
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    onConfirm();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="icon-sm">
          <Trash className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Confirmar Exclusão</DialogTitle>
          <DialogDescription>
            Esta ação não pode ser desfeita. Tem certeza que deseja continuar?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button variant="destructive" onClick={handleConfirm}>
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

---

## DialogWrapper

Para casos simples, use `DialogWrapper`:

```tsx
import { DialogWrapper } from '@facter/ds-core';

<DialogWrapper
  trigger={<Button>Abrir</Button>}
  title="Título"
  description="Descrição opcional"
  size="md"
>
  <p>Conteúdo do dialog</p>
</DialogWrapper>
```

---

## API

### Dialog Props

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `open` | boolean | - | Estado controlado |
| `onOpenChange` | function | - | Callback de mudança |
| `defaultOpen` | boolean | `false` | Estado inicial |

### DialogContent Props

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `size` | string | `"md"` | Tamanho do dialog |
| `className` | string | - | Classes adicionais |

---

## Subcomponentes

| Componente | Descrição |
|------------|-----------|
| `Dialog` | Root - gerencia estado |
| `DialogTrigger` | Botão que abre o dialog |
| `DialogContent` | Container do conteúdo |
| `DialogHeader` | Cabeçalho (título + descrição) |
| `DialogTitle` | Título do dialog |
| `DialogDescription` | Descrição opcional |
| `DialogBody` | Corpo do conteúdo |
| `DialogFooter` | Rodapé com ações |
| `DialogClose` | Botão que fecha o dialog |

---

## Acessibilidade

- Focus trap automático
- ESC fecha o dialog
- Click fora fecha o dialog
- `aria-labelledby` e `aria-describedby` automáticos
- Focus retorna ao trigger ao fechar

---

**Voltar para** [Componentes](./README.md)
