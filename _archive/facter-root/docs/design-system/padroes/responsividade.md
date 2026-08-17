# Responsividade

> **Guia de design responsivo para o Facter Design System.**
> Abordagem mobile-first com breakpoints consistentes.

---

## Breakpoints

O Design System usa os breakpoints do Tailwind CSS:

| Token | Valor | Dispositivo |
|-------|-------|-------------|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablets |
| `lg` | 1024px | Desktop pequeno |
| `xl` | 1280px | Desktop |
| `2xl` | 1536px | Desktop grande |

---

## Mobile First

Sempre comece pelo mobile e adicione estilos para telas maiores:

```tsx
// ✅ Bom - mobile first
<div className="p-4 md:p-6 lg:p-8">
  <h1 className="text-xl md:text-2xl lg:text-3xl">
    Título
  </h1>
</div>

// ❌ Ruim - desktop first
<div className="p-8 sm:p-4">
```

---

## Layouts Responsivos

### Container

```tsx
<div className="container mx-auto px-4">
  {/* Conteúdo centralizado com padding */}
</div>
```

### Grid Responsivo

```tsx
// 1 coluna no mobile, 2 em tablet, 3 em desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card />
  <Card />
  <Card />
</div>
```

### Flex Responsivo

```tsx
// Stack no mobile, row em desktop
<div className="flex flex-col md:flex-row gap-4">
  <Sidebar className="w-full md:w-64" />
  <Main className="flex-1" />
</div>
```

---

## Componentes Responsivos

### Dialog

O Dialog já é responsivo, mas pode ser customizado:

```tsx
<DialogContent size="md" className="max-w-[95vw] md:max-w-[525px]">
  {/* Em mobile: quase toda tela */}
  {/* Em desktop: 525px */}
</DialogContent>
```

### Tabs

Horizontal em desktop, vertical ou scrollável em mobile:

```tsx
// Scrollável horizontalmente em mobile
<TabsList className="flex overflow-x-auto md:overflow-visible">
  <TabsTrigger value="1">Aba 1</TabsTrigger>
  <TabsTrigger value="2">Aba 2</TabsTrigger>
  <TabsTrigger value="3">Aba 3</TabsTrigger>
</TabsList>
```

### DataTable

Responsividade para tabelas:

```tsx
// Wrapper scrollável em mobile
<div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
  <DataTable columns={columns} data={data} />
</div>

// Ou usar Card view em mobile
function ResponsiveDataView({ data }) {
  return (
    <>
      {/* Desktop: Tabela */}
      <div className="hidden md:block">
        <DataTable data={data} />
      </div>

      {/* Mobile: Cards */}
      <div className="md:hidden space-y-4">
        {data.map(item => (
          <MobileCard key={item.id} item={item} />
        ))}
      </div>
    </>
  );
}
```

### Form Layout

```tsx
<form className="space-y-4">
  {/* Campos em linha em desktop */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <Input label="Nome" />
    <Input label="Sobrenome" />
  </div>

  {/* Campo full width */}
  <Input label="Email" />

  {/* Botões */}
  <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
    <Button variant="outline">Cancelar</Button>
    <Button>Salvar</Button>
  </div>
</form>
```

---

## Padrões de Layout

### Sidebar Layout

```tsx
function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar - oculta em mobile */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-background border-r transform transition-transform lg:relative lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <Navigation />
      </aside>

      {/* Overlay em mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Conteúdo principal */}
      <main className="flex-1 p-4 lg:p-8">
        {/* Botão menu em mobile */}
        <Button
          variant="ghost"
          className="lg:hidden mb-4"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {children}
      </main>
    </div>
  );
}
```

### Header Responsivo

```tsx
function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Logo />

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <NavLinks />
        </nav>

        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <nav className="md:hidden border-t p-4">
          <NavLinks className="flex flex-col gap-2" />
        </nav>
      )}
    </header>
  );
}
```

---

## Tipografia Responsiva

```tsx
// Títulos
<h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
  Título Principal
</h1>

// Subtítulos
<h2 className="text-xl sm:text-2xl md:text-3xl font-semibold">
  Subtítulo
</h2>

// Texto
<p className="text-sm sm:text-base">
  Texto do parágrafo
</p>
```

---

## Espaçamento Responsivo

```tsx
// Seções
<section className="py-8 md:py-12 lg:py-16">

// Cards
<div className="p-4 md:p-6">

// Gaps
<div className="grid gap-4 md:gap-6 lg:gap-8">
```

---

## Imagens Responsivas

```tsx
// Imagem adaptativa
<img
  src="/image.jpg"
  alt="Descrição"
  className="w-full h-auto max-w-md mx-auto md:max-w-lg lg:max-w-xl"
/>

// Background responsivo
<div className="h-48 md:h-64 lg:h-80 bg-cover bg-center"
     style={{ backgroundImage: 'url(/hero.jpg)' }} />
```

---

## Utilities para Responsividade

### Ocultar/Mostrar

```tsx
// Oculto em mobile, visível em desktop
<div className="hidden md:block">Desktop only</div>

// Visível em mobile, oculto em desktop
<div className="block md:hidden">Mobile only</div>
```

### Ordem

```tsx
<div className="flex flex-col md:flex-row">
  <div className="order-2 md:order-1">Primeiro em desktop</div>
  <div className="order-1 md:order-2">Segundo em desktop</div>
</div>
```

---

## Testes

### Checklist de Responsividade

- [ ] Layout funciona em 320px de largura
- [ ] Não há scroll horizontal indesejado
- [ ] Textos são legíveis em todos os tamanhos
- [ ] Áreas de toque têm no mínimo 44x44px
- [ ] Formulários são usáveis em mobile
- [ ] Tabelas têm alternativa para mobile
- [ ] Imagens são otimizadas para cada breakpoint

### Ferramentas

```bash
# Chrome DevTools
- Device Toolbar (Ctrl+Shift+M)
- Responsive mode

# Extensões
- Responsive Viewer
- Window Resizer
```

---

**Voltar para** [Padrões](./README.md)
