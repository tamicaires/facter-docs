# RippleEffect

> **Efeito visual de ondas concêntricas para decoração de UI.**
> Inclui wrappers para facilitar uso em cards e backgrounds.

---

## Import

```tsx
import {
  RippleEffect,
  RippleWrapper,
  RippleBackground,
} from '@facter/ds-core';
```

---

## Uso Básico

```tsx
<div className="relative h-40 border rounded-lg">
  <RippleEffect />
</div>
```

---

## Tamanhos

```tsx
<RippleEffect size="sm" />   {/* Pequeno */}
<RippleEffect size="md" />   {/* Médio (padrão) */}
<RippleEffect size="lg" />   {/* Grande */}
<RippleEffect size="xl" />   {/* Extra grande */}
<RippleEffect size="xxl" />  {/* Máximo */}
```

---

## Cores

```tsx
<RippleEffect color="primary" />   {/* Laranja (padrão) */}
<RippleEffect color="secondary" /> {/* Secundária */}
<RippleEffect color="accent" />    {/* Accent */}
<RippleEffect color="muted" />     {/* Suave */}
```

---

## Intensidade

Controla a opacidade dos anéis:

```tsx
<RippleEffect intensity="light" />   {/* Sutil */}
<RippleEffect intensity="medium" />  {/* Padrão */}
<RippleEffect intensity="strong" />  {/* Forte */}
```

---

## Número de Anéis

```tsx
<RippleEffect rings={3} />  {/* 3 anéis */}
<RippleEffect rings={5} />  {/* 5 anéis (padrão) */}
<RippleEffect rings={8} />  {/* 8 anéis */}
```

---

## Posições

```tsx
<RippleEffect position="center" />        {/* Centro (padrão) */}
<RippleEffect position="top-left" />      {/* Canto superior esquerdo */}
<RippleEffect position="top-right" />     {/* Canto superior direito */}
<RippleEffect position="bottom-left" />   {/* Canto inferior esquerdo */}
<RippleEffect position="bottom-right" />  {/* Canto inferior direito */}
<RippleEffect position="top-center" />    {/* Centro superior */}
<RippleEffect position="bottom-center" /> {/* Centro inferior */}
```

---

## RippleWrapper

Envolve conteúdo com efeito ripple:

```tsx
<RippleWrapper
  rippleProps={{
    size: 'lg',
    color: 'primary',
    position: 'bottom-right',
  }}
  className="p-8 border rounded-lg"
>
  <h3 className="font-semibold">Card com Ripple</h3>
  <p className="text-muted-foreground">
    Conteúdo do card aqui.
  </p>
</RippleWrapper>
```

---

## RippleBackground

Background decorativo com overflow hidden:

```tsx
<div className="relative h-64 border rounded-lg overflow-hidden">
  <RippleBackground
    size="xl"
    color="primary"
    intensity="light"
    position="bottom-right"
  />

  <div className="relative z-10 p-6">
    <h2 className="text-2xl font-bold">Hero Section</h2>
    <p>Conteúdo sobre o ripple decorativo.</p>
  </div>
</div>
```

---

## Casos de Uso

### Card Decorativo

```tsx
function FeatureCard({ title, description, icon: Icon }) {
  return (
    <div className="relative p-6 border rounded-lg overflow-hidden">
      <RippleEffect
        size="lg"
        color="primary"
        intensity="light"
        position="top-right"
        rings={4}
      />

      <div className="relative z-10">
        <Icon className="h-8 w-8 text-primary mb-4" />
        <h3 className="font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
```

### Hero Section

```tsx
function HeroSection() {
  return (
    <section className="relative min-h-[60vh] flex items-center overflow-hidden">
      {/* Ripple decorativo no canto */}
      <RippleBackground
        size="xxl"
        color="primary"
        intensity="light"
        position="bottom-right"
        containerClassName="opacity-50"
      />

      {/* Segundo ripple */}
      <RippleBackground
        size="xl"
        color="accent"
        intensity="light"
        position="top-left"
        containerClassName="opacity-30"
      />

      <div className="relative z-10 container mx-auto px-4">
        <h1 className="text-5xl font-bold">Título Principal</h1>
        <p className="mt-4 text-xl">Descrição do hero.</p>
      </div>
    </section>
  );
}
```

### Badge com Efeito

```tsx
function PulseBadge({ children }) {
  return (
    <div className="relative inline-flex">
      <RippleEffect
        size="sm"
        rings={3}
        intensity="light"
        color="primary"
      />
      <span className="relative z-10 px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm">
        {children}
      </span>
    </div>
  );
}
```

### Loading Indicator Decorativo

```tsx
function LoadingCard() {
  return (
    <div className="relative p-8 border rounded-lg">
      <RippleEffect
        size="lg"
        rings={6}
        intensity="medium"
        color="muted"
      />

      <div className="relative z-10 text-center">
        <Loader variant="dots" />
        <p className="mt-4 text-muted-foreground">Carregando...</p>
      </div>
    </div>
  );
}
```

---

## API

### RippleEffect Props

```typescript
interface RippleEffectProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  color?: 'primary' | 'secondary' | 'accent' | 'muted';
  intensity?: 'light' | 'medium' | 'strong';
  rings?: number;
  position?: 'center' | 'top-left' | 'top-right' | 'bottom-left' |
             'bottom-right' | 'top-center' | 'bottom-center';
  className?: string;
}
```

### RippleWrapper Props

```typescript
interface RippleWrapperProps {
  children: React.ReactNode;
  rippleProps?: RippleEffectProps;
  className?: string;
}
```

### RippleBackground Props

```typescript
interface RippleBackgroundProps extends RippleEffectProps {
  containerClassName?: string;
}
```

---

## Configurações de Tamanho

| Size | Base | Increment |
|------|------|-----------|
| `sm` | 8 | 2 |
| `md` | 12 | 4 |
| `lg` | 16 | 6 |
| `xl` | 28 | 14 |
| `xxl` | 36 | 16 |

---

## Performance

- Componentes memoizados com `React.memo`
- Anéis calculados via `useMemo`
- `pointer-events-none` para não interferir com interações
- Recomendado usar com moderação (1-3 por página)

---

**Voltar para** [Componentes](./README.md)
