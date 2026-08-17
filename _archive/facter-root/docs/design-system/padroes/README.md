# Padrões do Design System

> **Guias e convenções para uso consistente do Facter Design System.**

---

## Guias

| Guia | Descrição |
|------|-----------|
| [Acessibilidade](./acessibilidade.md) | WCAG, navegação por teclado, screen readers |
| [Responsividade](./responsividade.md) | Breakpoints, mobile-first, layouts adaptativos |
| [Dark Mode](./dark-mode.md) | Implementação e uso do tema escuro |

---

## Princípios

### 1. Consistência

Use os tokens e componentes existentes. Evite criar estilos customizados que não sigam o sistema.

```tsx
// ✅ Bom - usa tokens
<div className="p-4 bg-background text-foreground rounded-lg">

// ❌ Ruim - valores hardcoded
<div style={{ padding: '16px', background: '#fff' }}>
```

### 2. Composição

Combine componentes pequenos para criar interfaces complexas.

```tsx
// ✅ Bom - composição de componentes
<Dialog>
  <DialogHeader>
    <DialogTitle>Confirmar</DialogTitle>
  </DialogHeader>
  <DialogBody>
    <Input label="Nome" />
  </DialogBody>
  <DialogFooter>
    <Button variant="outline">Cancelar</Button>
    <Button>Confirmar</Button>
  </DialogFooter>
</Dialog>
```

### 3. Acessibilidade

Todos os componentes são acessíveis por padrão. Mantenha isso ao customizar.

```tsx
// ✅ Bom - mantém acessibilidade
<Button aria-label="Fechar menu">
  <X className="h-4 w-4" />
</Button>

// ❌ Ruim - remove acessibilidade
<div onClick={close}>
  <X />
</div>
```

### 4. Performance

Use as otimizações disponíveis nos componentes.

```tsx
// ✅ Bom - desativa animação em listas
{items.map(item => (
  <EmptyState animated={false} key={item.id} />
))}

// ✅ Bom - lazy loading de conteúdo pesado
<Tabs>
  <TabsContent value="heavy" forceMount={false}>
    <HeavyComponent />
  </TabsContent>
</Tabs>
```

---

## Convenções de Código

### Imports

```tsx
// Componentes
import { Button, Input, Select } from '@facter/ds-core';

// Tipos
import { type ButtonProps } from '@facter/ds-core';

// Utils
import { cn } from '@facter/ds-core';
```

### Nomenclatura de Classes

```tsx
// Use className para customização
<Button className="w-full">Full Width</Button>

// Use cn() para classes condicionais
<div className={cn(
  'base-class',
  isActive && 'active-class',
  variant === 'primary' && 'primary-class'
)}>
```

### Extensão de Componentes

```tsx
// Criar variante customizada
import { Button, type ButtonProps } from '@facter/ds-core';

interface LoadingButtonProps extends ButtonProps {
  isLoading?: boolean;
}

export function LoadingButton({ isLoading, children, ...props }: LoadingButtonProps) {
  return (
    <Button disabled={isLoading} {...props}>
      {isLoading ? <Loader size="sm" /> : children}
    </Button>
  );
}
```

---

## Estrutura de Arquivos

```
src/
├── components/
│   └── ui/                    # Componentes customizados baseados no DS
│       └── loading-button.tsx
├── features/
│   └── users/
│       └── components/        # Componentes específicos da feature
│           └── user-card.tsx  # Usa componentes do DS
```

---

**Voltar para** [Design System](../README.md)
