# Design Tokens

> **Tokens de design do Facter Design System.**
> Definem cores, tipografia, espaçamento e outros valores fundamentais.

---

## Cores

### Semantic Colors

| Token | Light | Dark | Uso |
|-------|-------|------|-----|
| `--background` | #FFFFFF | #0A0A0A | Fundo principal |
| `--foreground` | #0A0A0A | #FAFAFA | Texto principal |
| `--primary` | #F97316 | #F97316 | Ação principal (laranja Facter) |
| `--secondary` | #F4F4F5 | #262626 | Elementos secundários |
| `--muted` | #F4F4F5 | #262626 | Texto/elementos desabilitados |
| `--accent` | #F4F4F5 | #262626 | Destaque sutil |
| `--destructive` | #EF4444 | #7F1D1D | Ações destrutivas |

### Functional Colors

| Token | Cor | Uso |
|-------|-----|-----|
| `--success` | Verde | Status positivo |
| `--warning` | Amarelo | Alertas |
| `--error` | Vermelho | Erros |
| `--info` | Azul | Informações |

### Configuração CSS

```css
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  --primary: 24 100% 50%;
  --primary-foreground: 0 0% 98%;
  --secondary: 0 0% 96.1%;
  --secondary-foreground: 0 0% 9%;
  --muted: 0 0% 96.1%;
  --muted-foreground: 0 0% 45.1%;
  --accent: 0 0% 96.1%;
  --accent-foreground: 0 0% 9%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 98%;
  --border: 0 0% 89.8%;
  --input: 0 0% 89.8%;
  --ring: 24 100% 50%;
}

.dark {
  --background: 0 0% 3.9%;
  --foreground: 0 0% 98%;
  --primary: 24 100% 50%;
  --primary-foreground: 0 0% 98%;
  /* ... */
}
```

---

## Tipografia

### Font Family

```css
--font-sans: Inter, system-ui, sans-serif;
--font-mono: 'JetBrains Mono', monospace;
```

### Font Sizes

| Classe | Tamanho | Line Height | Uso |
|--------|---------|-------------|-----|
| `text-xs` | 12px | 16px | Labels pequenos |
| `text-sm` | 14px | 20px | Texto secundário |
| `text-base` | 16px | 24px | Texto padrão |
| `text-lg` | 18px | 28px | Texto destacado |
| `text-xl` | 20px | 28px | Títulos pequenos |
| `text-2xl` | 24px | 32px | Títulos médios |
| `text-3xl` | 30px | 36px | Títulos grandes |
| `text-4xl` | 36px | 40px | Títulos hero |

### Font Weights

| Classe | Peso | Uso |
|--------|------|-----|
| `font-normal` | 400 | Texto regular |
| `font-medium` | 500 | Texto semi-destacado |
| `font-semibold` | 600 | Labels, títulos |
| `font-bold` | 700 | Títulos importantes |

---

## Espaçamento

### Scale

| Token | Valor | Uso |
|-------|-------|-----|
| `0` | 0 | Reset |
| `0.5` | 2px | Micro espaçamento |
| `1` | 4px | Espaçamento mínimo |
| `2` | 8px | Espaçamento pequeno |
| `3` | 12px | Espaçamento médio-pequeno |
| `4` | 16px | Espaçamento médio |
| `5` | 20px | Espaçamento médio-grande |
| `6` | 24px | Espaçamento grande |
| `8` | 32px | Espaçamento extra grande |
| `10` | 40px | Seções |
| `12` | 48px | Blocos maiores |
| `16` | 64px | Layout |

### Uso

```tsx
// Padding
<div className="p-4">16px de padding</div>

// Margin
<div className="mt-2">8px de margin-top</div>

// Gap
<div className="flex gap-4">16px entre items</div>

// Space between
<div className="space-y-4">16px entre children</div>
```

---

## Border Radius

| Token | Valor | Uso |
|-------|-------|-----|
| `--radius` | 0.5rem (8px) | Base |
| `rounded-sm` | calc(var(--radius) - 4px) | Pequeno |
| `rounded-md` | calc(var(--radius) - 2px) | Médio |
| `rounded-lg` | var(--radius) | Grande |
| `rounded-xl` | calc(var(--radius) + 4px) | Extra grande |
| `rounded-full` | 9999px | Circular |

---

## Shadows

| Classe | Uso |
|--------|-----|
| `shadow-sm` | Cards elevados |
| `shadow` | Dropdowns, popovers |
| `shadow-md` | Modais |
| `shadow-lg` | Elementos flutuantes |

---

## Z-Index

| Token | Valor | Uso |
|-------|-------|-----|
| `z-0` | 0 | Base |
| `z-10` | 10 | Elementos elevados |
| `z-20` | 20 | Dropdowns |
| `z-30` | 30 | Headers fixos |
| `z-40` | 40 | Modais |
| `z-50` | 50 | Toasts, loaders |

---

## Breakpoints

| Token | Valor | Uso |
|-------|-------|-----|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablets |
| `lg` | 1024px | Desktop pequeno |
| `xl` | 1280px | Desktop |
| `2xl` | 1536px | Desktop grande |

### Uso

```tsx
// Mobile first
<div className="p-2 sm:p-4 md:p-6 lg:p-8">
  Padding aumenta conforme a tela
</div>
```

---

## Animações

### Durations

| Token | Valor | Uso |
|-------|-------|-----|
| `duration-150` | 150ms | Hover rápido |
| `duration-200` | 200ms | Transições padrão |
| `duration-300` | 300ms | Modais, dropdowns |
| `duration-500` | 500ms | Animações suaves |

### Easing

| Classe | Uso |
|--------|-----|
| `ease-in` | Aceleração |
| `ease-out` | Desaceleração |
| `ease-in-out` | Padrão |

### Keyframes Customizados

```css
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slide-in {
  from { transform: translateY(-10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
```

---

## Como Customizar

### Sobrescrever Tokens

```css
/* Seu globals.css */
:root {
  /* Mudar cor primária */
  --primary: 220 100% 50%; /* Azul */

  /* Mudar border radius */
  --radius: 0.75rem;
}
```

### Adicionar Tokens

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff7ed',
          500: '#f97316',
          900: '#7c2d12',
        },
      },
    },
  },
}
```

---

**Voltar para** [Design System](../README.md)
