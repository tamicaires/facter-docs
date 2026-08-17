# Acessibilidade

> **Guia de acessibilidade para o Facter Design System.**
> Segue as diretrizes WCAG 2.1 nível AA.

---

## Princípios POUR

### Perceptível

O conteúdo deve ser apresentável de formas que os usuários possam perceber.

```tsx
// ✅ Bom - imagem com alt text
<img src="/logo.png" alt="Logo da Facter Soluções" />

// ✅ Bom - ícone decorativo
<Icon aria-hidden="true" />

// ✅ Bom - ícone com significado
<Button aria-label="Excluir item">
  <Trash className="h-4 w-4" />
</Button>
```

### Operável

A interface deve ser operável por todos os usuários.

```tsx
// ✅ Bom - botão acessível
<Button onClick={handleClick}>Salvar</Button>

// ❌ Ruim - div não é focável/acessível
<div onClick={handleClick}>Salvar</div>
```

### Compreensível

O conteúdo deve ser compreensível.

```tsx
// ✅ Bom - mensagem de erro clara
<Input
  label="Email"
  error
  aria-describedby="email-error"
/>
<span id="email-error" className="text-red-500 text-sm">
  Digite um email válido
</span>
```

### Robusto

O conteúdo deve ser interpretável por tecnologias assistivas.

```tsx
// ✅ Bom - HTML semântico
<nav aria-label="Menu principal">
  <ul>
    <li><a href="/">Home</a></li>
  </ul>
</nav>
```

---

## Navegação por Teclado

### Focus Management

Todos os componentes interativos devem ser focáveis e ter indicador visual de foco.

```css
/* Já implementado no DS */
:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}
```

### Atalhos de Teclado por Componente

| Componente | Teclas | Ação |
|------------|--------|------|
| Button | `Enter`, `Space` | Ativar |
| Dialog | `Escape` | Fechar |
| Tabs | `←` `→` | Navegar abas |
| Select | `Enter`, `Space` | Abrir dropdown |
| Select | `↑` `↓` | Navegar opções |
| Checkbox | `Space` | Toggle |
| Switch | `Space` | Toggle |

### Tab Order

```tsx
// ✅ Bom - ordem lógica
<form>
  <Input label="Nome" />        {/* Tab 1 */}
  <Input label="Email" />       {/* Tab 2 */}
  <Button type="submit">Enviar</Button>  {/* Tab 3 */}
</form>

// Ajustar ordem quando necessário
<Button tabIndex={1}>Primeiro</Button>
<Button tabIndex={2}>Segundo</Button>
```

### Skip Links

Implemente skip links para conteúdo principal:

```tsx
// No layout principal
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded"
>
  Pular para o conteúdo principal
</a>

<main id="main-content">
  {/* Conteúdo */}
</main>
```

---

## Screen Readers

### Labels

```tsx
// ✅ Bom - input com label
<Input label="Nome completo" id="name" />

// ✅ Bom - label invisível
<Input
  aria-label="Buscar"
  placeholder="Buscar..."
/>
```

### Descrições

```tsx
// Relacionar erro ao campo
<Input
  label="Email"
  aria-describedby="email-hint email-error"
/>
<span id="email-hint" className="text-sm text-muted-foreground">
  Usaremos para enviar notificações
</span>
<span id="email-error" className="text-sm text-red-500">
  Email inválido
</span>
```

### Live Regions

Para anúncios dinâmicos:

```tsx
// Toast já implementa isso
toast.success('Salvo com sucesso!'); // Anunciado automaticamente

// Para notificações customizadas
<div aria-live="polite" aria-atomic="true">
  {message}
</div>
```

### Estados

```tsx
// Botão com estado
<Button aria-busy={isLoading} disabled={isLoading}>
  {isLoading ? 'Salvando...' : 'Salvar'}
</Button>

// Expandível
<Button aria-expanded={isOpen} aria-controls="menu">
  Menu
</Button>
<div id="menu" hidden={!isOpen}>
  {/* Conteúdo do menu */}
</div>
```

---

## Contraste de Cores

### Requisitos WCAG AA

- Texto normal: mínimo 4.5:1
- Texto grande (18px+ ou 14px bold): mínimo 3:1
- Componentes UI: mínimo 3:1

### Cores do Design System

Todas as cores do DS atendem aos requisitos:

| Par de Cores | Contraste |
|-------------|-----------|
| `foreground` / `background` | ✅ 12:1 |
| `primary-foreground` / `primary` | ✅ 4.5:1 |
| `muted-foreground` / `background` | ✅ 4.5:1 |
| `destructive-foreground` / `destructive` | ✅ 4.5:1 |

### Verificação

```bash
# Ferramentas recomendadas
- Chrome DevTools > Lighthouse
- axe DevTools extension
- WebAIM Contrast Checker
```

---

## Formulários Acessíveis

### Labels Obrigatórios

```tsx
<Input
  label="Nome"
  required
  aria-required="true"
/>
```

### Mensagens de Erro

```tsx
function AccessibleForm() {
  const { register, formState: { errors } } = useForm();

  return (
    <form>
      <div>
        <Input
          label="Email"
          {...register('email')}
          error={!!errors.email}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <span id="email-error" role="alert" className="text-red-500 text-sm">
            {errors.email.message}
          </span>
        )}
      </div>
    </form>
  );
}
```

### Grupos de Campos

```tsx
<fieldset>
  <legend className="font-semibold mb-2">Endereço</legend>
  <Input label="Rua" />
  <Input label="Cidade" />
  <Input label="CEP" />
</fieldset>
```

---

## Imagens e Mídia

### Imagens

```tsx
// Imagem informativa
<img src="/chart.png" alt="Gráfico mostrando aumento de 30% nas vendas" />

// Imagem decorativa
<img src="/decoration.png" alt="" role="presentation" />

// Ícone com significado
<Button aria-label="Adicionar item">
  <Plus className="h-4 w-4" />
</Button>
```

### Vídeos

```tsx
<video controls>
  <source src="/video.mp4" type="video/mp4" />
  <track kind="captions" src="/captions.vtt" label="Português" />
</video>
```

---

## Testes de Acessibilidade

### Automatizados

```tsx
// Com Jest e jest-axe
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('Button is accessible', async () => {
  const { container } = render(<Button>Click me</Button>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Manuais

Checklist de verificação:

- [ ] Navegue apenas com teclado (Tab, Enter, Escape)
- [ ] Teste com screen reader (NVDA, VoiceOver)
- [ ] Verifique zoom até 200%
- [ ] Teste com modo alto contraste
- [ ] Verifique em diferentes tamanhos de tela

---

## Checklist

### Componentes

- [ ] Elementos interativos são focáveis
- [ ] Focus visível em todos os estados
- [ ] Labels associados a inputs
- [ ] Erros anunciados a screen readers
- [ ] Estados comunicados (loading, disabled)

### Cores

- [ ] Contraste de texto adequado
- [ ] Não depende apenas de cor para informação
- [ ] Funciona em modo alto contraste

### Navegação

- [ ] Tab order lógico
- [ ] Skip links implementados
- [ ] Landmarks semânticos

---

**Voltar para** [Padrões](./README.md)
