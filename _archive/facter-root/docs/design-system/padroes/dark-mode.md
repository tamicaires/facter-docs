# Dark Mode

> **Implementação e uso do tema escuro no Facter Design System.**
> Suporta tema claro, escuro e preferência do sistema.

---

## Setup

### ThemeProvider

O tema é gerenciado pelo `ThemeProvider`:

```tsx
// App.tsx
import { ThemeProvider } from '@facter/ds-core';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="facter-theme">
      <YourApp />
    </ThemeProvider>
  );
}
```

### Props do ThemeProvider

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `defaultTheme` | `'light' \| 'dark' \| 'system'` | `'system'` | Tema inicial |
| `storageKey` | `string` | `'theme'` | Chave no localStorage |

---

## Usando o Tema

### Hook useTheme

```tsx
import { useTheme } from '@facter/ds-core';

function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <div>
      <p>Tema atual: {theme}</p>
      <p>Tema resolvido: {resolvedTheme}</p>

      <Button onClick={() => setTheme('light')}>Claro</Button>
      <Button onClick={() => setTheme('dark')}>Escuro</Button>
      <Button onClick={() => setTheme('system')}>Sistema</Button>
    </div>
  );
}
```

### API do Hook

```typescript
interface UseThemeReturn {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  resolvedTheme: 'light' | 'dark'; // Tema efetivo aplicado
}
```

---

## Theme Switcher

### Toggle Simples

```tsx
import { useTheme } from '@facter/ds-core';
import { Sun, Moon } from 'lucide-react';

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
    >
      {resolvedTheme === 'dark' ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  );
}
```

### Dropdown Completo

```tsx
import { useTheme } from '@facter/ds-core';
import { Sun, Moon, Monitor } from 'lucide-react';

function ThemeDropdown() {
  const { theme, setTheme } = useTheme();

  return (
    <Select value={theme} onValueChange={setTheme}>
      <SelectItem value="light">
        <div className="flex items-center gap-2">
          <Sun className="h-4 w-4" />
          Claro
        </div>
      </SelectItem>
      <SelectItem value="dark">
        <div className="flex items-center gap-2">
          <Moon className="h-4 w-4" />
          Escuro
        </div>
      </SelectItem>
      <SelectItem value="system">
        <div className="flex items-center gap-2">
          <Monitor className="h-4 w-4" />
          Sistema
        </div>
      </SelectItem>
    </Select>
  );
}
```

---

## Tokens de Cor

As cores são definidas em HSL e mudam automaticamente com o tema:

### Light Mode

```css
:root {
  --background: 0 0% 100%;        /* #FFFFFF */
  --foreground: 0 0% 3.9%;        /* #0A0A0A */
  --primary: 24 100% 50%;         /* #F97316 */
  --primary-foreground: 0 0% 98%; /* #FAFAFA */
  --secondary: 0 0% 96.1%;        /* #F4F4F5 */
  --muted: 0 0% 96.1%;            /* #F4F4F5 */
  --muted-foreground: 0 0% 45.1%; /* #737373 */
  --destructive: 0 84.2% 60.2%;   /* #EF4444 */
  --border: 0 0% 89.8%;           /* #E5E5E5 */
}
```

### Dark Mode

```css
.dark {
  --background: 0 0% 3.9%;        /* #0A0A0A */
  --foreground: 0 0% 98%;         /* #FAFAFA */
  --primary: 24 100% 50%;         /* #F97316 (mantido) */
  --primary-foreground: 0 0% 98%;
  --secondary: 0 0% 14.9%;        /* #262626 */
  --muted: 0 0% 14.9%;
  --muted-foreground: 0 0% 63.9%;
  --destructive: 0 62.8% 30.6%;   /* #7F1D1D */
  --border: 0 0% 14.9%;
}
```

---

## Escrevendo CSS para Dark Mode

### Usando Tokens

```tsx
// ✅ Bom - usa tokens
<div className="bg-background text-foreground border-border">
  Adapta automaticamente ao tema
</div>

// ❌ Ruim - cores fixas
<div className="bg-white text-black">
  Não adapta ao tema
</div>
```

### Classes Condicionais

```tsx
// Para casos especiais
<div className="bg-gray-100 dark:bg-gray-900">
  Customizado por tema
</div>

// Com variants
<Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
  Badge
</Badge>
```

---

## Imagens e Mídia

### Logo Adaptativo

```tsx
function Logo() {
  const { resolvedTheme } = useTheme();

  return (
    <img
      src={resolvedTheme === 'dark' ? '/logo-light.svg' : '/logo-dark.svg'}
      alt="Logo"
    />
  );
}

// Ou com CSS
<picture>
  <source srcSet="/logo-light.svg" media="(prefers-color-scheme: dark)" />
  <img src="/logo-dark.svg" alt="Logo" />
</picture>
```

### Ícones

```tsx
// Ícones do Lucide já adaptam via text color
<Sun className="h-5 w-5 text-foreground" />
```

---

## Gráficos e Charts

```tsx
function Chart() {
  const { resolvedTheme } = useTheme();

  const colors = {
    light: {
      line: '#f97316',
      grid: '#e5e5e5',
      text: '#0a0a0a',
    },
    dark: {
      line: '#f97316',
      grid: '#262626',
      text: '#fafafa',
    },
  };

  const theme = colors[resolvedTheme];

  return (
    <LineChart
      style={{
        '--chart-line': theme.line,
        '--chart-grid': theme.grid,
        '--chart-text': theme.text,
      }}
    />
  );
}
```

---

## Evitar Flash

### SSR/SSG

Para evitar flash de tema errado no carregamento:

```tsx
// Em apps Next.js/Remix
// O ThemeProvider já implementa script inline

// Em HTML customizado
<script>
  (function() {
    const theme = localStorage.getItem('facter-theme') || 'system';
    const resolved = theme === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme;
    document.documentElement.classList.add(resolved);
  })();
</script>
```

---

## Testando Temas

### Manual

1. Use DevTools para simular `prefers-color-scheme`
2. Alterne manualmente com o ThemeSwitcher
3. Verifique todos os componentes em ambos os temas

### Automatizado

```tsx
import { render } from '@testing-library/react';
import { ThemeProvider } from '@facter/ds-core';

// Testar em tema claro
render(
  <ThemeProvider defaultTheme="light">
    <Component />
  </ThemeProvider>
);

// Testar em tema escuro
render(
  <ThemeProvider defaultTheme="dark">
    <Component />
  </ThemeProvider>
);
```

---

## Checklist

- [ ] ThemeProvider configurado no root
- [ ] Todas as cores usam tokens
- [ ] Imagens/logos têm versão para cada tema
- [ ] Contraste adequado em ambos os temas
- [ ] Sem flash de tema no carregamento
- [ ] ThemeSwitcher acessível na UI

---

**Voltar para** [Padrões](./README.md)
