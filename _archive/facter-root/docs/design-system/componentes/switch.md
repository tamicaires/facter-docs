# Switch

> **Componente de toggle switch baseado em Radix UI.**
> Ideal para configurações on/off.

---

## Import

```tsx
import { Switch } from '@facter/ds-core';
```

---

## Uso Básico

```tsx
<Switch />
```

---

## Com Label

```tsx
<div className="flex items-center gap-3">
  <Switch id="notifications" />
  <label htmlFor="notifications" className="text-sm">
    Ativar notificações
  </label>
</div>
```

---

## Variantes

```tsx
<Switch variant="default" />
<Switch variant="secondary" />
<Switch variant="success" />
```

| Variante | Cor quando ativo | Uso |
|----------|------------------|-----|
| `default` | Primária (laranja) | Padrão |
| `secondary` | Secundária | Alternativa |
| `success` | Verde | Indicar ativação |

---

## Tamanhos

```tsx
<Switch size="sm" />  {/* 36x20 */}
<Switch size="md" />  {/* 44x24 - padrão */}
<Switch size="lg" />  {/* 56x28 */}
```

---

## Controlado

```tsx
function ControlledSwitch() {
  const [enabled, setEnabled] = useState(false);

  return (
    <div className="flex items-center gap-3">
      <Switch
        checked={enabled}
        onCheckedChange={setEnabled}
      />
      <span className="text-sm">
        {enabled ? 'Ativado' : 'Desativado'}
      </span>
    </div>
  );
}
```

---

## Desabilitado

```tsx
<Switch disabled />
<Switch disabled checked />
```

---

## Com React Hook Form

```tsx
import { useForm, Controller } from 'react-hook-form';

function SettingsForm() {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      emailNotifications: true,
      pushNotifications: false,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Controller
        name="emailNotifications"
        control={control}
        render={({ field }) => (
          <div className="flex items-center justify-between">
            <label className="text-sm">Notificações por email</label>
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </div>
        )}
      />

      <Controller
        name="pushNotifications"
        control={control}
        render={({ field }) => (
          <div className="flex items-center justify-between">
            <label className="text-sm">Notificações push</label>
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </div>
        )}
      />
    </form>
  );
}
```

---

## Painel de Configurações

```tsx
function SettingsPanel() {
  const [settings, setSettings] = useState({
    darkMode: false,
    autoSave: true,
    analytics: false,
  });

  const updateSetting = (key: keyof typeof settings) => (value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="font-semibold">Preferências</h3>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Modo escuro</p>
            <p className="text-xs text-muted-foreground">
              Ativar tema escuro
            </p>
          </div>
          <Switch
            checked={settings.darkMode}
            onCheckedChange={updateSetting('darkMode')}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Salvar automaticamente</p>
            <p className="text-xs text-muted-foreground">
              Salvar alterações automaticamente
            </p>
          </div>
          <Switch
            variant="success"
            checked={settings.autoSave}
            onCheckedChange={updateSetting('autoSave')}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Analytics</p>
            <p className="text-xs text-muted-foreground">
              Coletar dados de uso
            </p>
          </div>
          <Switch
            checked={settings.analytics}
            onCheckedChange={updateSetting('analytics')}
          />
        </div>
      </div>
    </div>
  );
}
```

---

## API

### Props

```typescript
interface SwitchProps {
  variant?: 'default' | 'secondary' | 'success';
  size?: 'sm' | 'md' | 'lg';
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  value?: string;
  className?: string;
}
```

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `variant` | string | `"default"` | Cor quando ativo |
| `size` | string | `"md"` | Tamanho do switch |
| `checked` | boolean | - | Estado controlado |
| `onCheckedChange` | function | - | Callback de mudança |
| `disabled` | boolean | `false` | Desabilita interação |

---

## Checkbox vs Switch

| Use Checkbox quando | Use Switch quando |
|---------------------|-------------------|
| Múltiplas opções | Liga/desliga único |
| Formulários com submit | Efeito imediato |
| Termos e condições | Configurações |
| Seleção em listas | Preferências |

---

## Acessibilidade

- Suporta navegação por teclado (Space para toggle)
- `role="switch"` automático
- `aria-checked` correto
- Estados de foco visíveis

---

**Voltar para** [Componentes](./README.md)
