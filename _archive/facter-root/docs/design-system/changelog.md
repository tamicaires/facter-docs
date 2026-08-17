# Changelog - Facter Design System

> **Histórico de versões e mudanças do Design System.**

---

## @facter/ds-core

### [1.1.1] - 2025-01

#### Adicionado
- Componente `RippleEffect` para efeitos decorativos
- Componente `RippleWrapper` e `RippleBackground`
- Suporte a `autoResize` no Textarea
- Variante `success` no Switch

#### Melhorado
- Performance do DataTable com memoização
- EmptyState com opção de desabilitar animação
- Loader com novas variantes (`bars`)

#### Corrigido
- Focus ring no Select em dark mode
- Overflow do Dialog em mobile

---

### [1.1.0] - 2024-12

#### Adicionado
- Componente `DataTable` com Compound Components
- Componente `EmptyState` com animações Framer Motion
- Providers: `ThemeProvider`, `LoaderProvider`
- Hooks: `useTheme`, `useLoader`
- Suporte a tema escuro

#### Melhorado
- Todos os componentes agora usam `forwardRef`
- Melhor tipagem TypeScript
- Tamanhos de componentes padronizados

---

### [1.0.0] - 2024-11

#### Lançamento Inicial

**Componentes:**
- Button (variantes: default, destructive, outline, secondary, ghost, link)
- Input (com floating label, ícone, estados de erro)
- Select (baseado em Radix UI)
- Checkbox (variantes: default, secondary, outline)
- Switch (variantes: default, secondary)
- Textarea (com auto-resize opcional)
- Badge (variantes: default, secondary, success, warning, error, info, outline)
- Tabs (Compound Component)
- Dialog (Compound Component)
- Toast (integração com Sonner)
- Loader (variantes: spinner, dots, pulse)

**Providers:**
- ThemeProvider (light/dark/system)

**Dependências:**
- Radix UI (primitivos acessíveis)
- Class Variance Authority (variantes)
- Tailwind CSS (styling)
- Framer Motion (animações)
- Sonner (toasts)

---

## @facter/ds-utils

### [1.0.0] - 2024-11

#### Lançamento Inicial

**Formatters:**
- `formatCurrency` - Formata valores em Real brasileiro
- `formatDate` - Formata datas (DD/MM/YYYY)
- `formatDateTime` - Formata data e hora
- `formatRelativeDate` - Formata data relativa (Hoje, Ontem, etc.)

**Validators:**
- `validateEmail` - Valida formato de email
- `validateCPF` - Valida CPF brasileiro
- `validateCNPJ` - Valida CNPJ brasileiro

---

## Roadmap

### Próximas Versões

#### 1.2.0 (Planejado)
- [ ] Componente `Calendar`
- [ ] Componente `DatePicker`
- [ ] Componente `TimePicker`
- [ ] Componente `Accordion`
- [ ] Componente `Slider`

#### 1.3.0 (Planejado)
- [ ] Componente `Combobox` (autocomplete)
- [ ] Componente `MultiSelect`
- [ ] Componente `FileUpload`
- [ ] Componente `Avatar`
- [ ] Componente `Tooltip`

#### 2.0.0 (Futuro)
- [ ] Suporte a design tokens CSS customizados
- [ ] Gerador de temas
- [ ] Componentes de navegação (Breadcrumb, Pagination)
- [ ] Componentes de layout (Card, Sidebar)

---

## Migração

### De 1.0.x para 1.1.x

Sem breaking changes. Apenas adicione os novos providers se quiser usar as funcionalidades:

```tsx
// Antes (1.0.x)
import { ThemeProvider } from '@facter/ds-core';

// Depois (1.1.x) - Opcional
import { ThemeProvider, LoaderProvider, Toaster } from '@facter/ds-core';

function App() {
  return (
    <ThemeProvider>
      <LoaderProvider>
        <YourApp />
        <Toaster />
      </LoaderProvider>
    </ThemeProvider>
  );
}
```

---

**Voltar para** [Design System](./README.md)
