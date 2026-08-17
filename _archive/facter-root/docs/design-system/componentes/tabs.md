# Tabs

> **Componente de navegação por abas baseado em Radix UI.**
> Padrão compound component para máxima flexibilidade.

---

## Import

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@facter/ds-core';
```

---

## Uso Básico

```tsx
<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Visão Geral</TabsTrigger>
    <TabsTrigger value="analytics">Analytics</TabsTrigger>
    <TabsTrigger value="settings">Configurações</TabsTrigger>
  </TabsList>

  <TabsContent value="overview">
    <p>Conteúdo da visão geral...</p>
  </TabsContent>

  <TabsContent value="analytics">
    <p>Conteúdo de analytics...</p>
  </TabsContent>

  <TabsContent value="settings">
    <p>Conteúdo de configurações...</p>
  </TabsContent>
</Tabs>
```

---

## Controlado

```tsx
function ControlledTabs() {
  const [activeTab, setActiveTab] = useState('tab1');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList>
        <TabsTrigger value="tab1">Aba 1</TabsTrigger>
        <TabsTrigger value="tab2">Aba 2</TabsTrigger>
      </TabsList>

      <TabsContent value="tab1">Conteúdo 1</TabsContent>
      <TabsContent value="tab2">Conteúdo 2</TabsContent>
    </Tabs>
  );
}
```

---

## Com Ícones

```tsx
import { User, Settings, Bell } from 'lucide-react';

<Tabs defaultValue="profile">
  <TabsList>
    <TabsTrigger value="profile" className="flex items-center gap-2">
      <User className="h-4 w-4" />
      Perfil
    </TabsTrigger>
    <TabsTrigger value="notifications" className="flex items-center gap-2">
      <Bell className="h-4 w-4" />
      Notificações
    </TabsTrigger>
    <TabsTrigger value="settings" className="flex items-center gap-2">
      <Settings className="h-4 w-4" />
      Configurações
    </TabsTrigger>
  </TabsList>

  <TabsContent value="profile">...</TabsContent>
  <TabsContent value="notifications">...</TabsContent>
  <TabsContent value="settings">...</TabsContent>
</Tabs>
```

---

## Tabs Desabilitadas

```tsx
<Tabs defaultValue="active">
  <TabsList>
    <TabsTrigger value="active">Ativa</TabsTrigger>
    <TabsTrigger value="disabled" disabled>
      Desabilitada
    </TabsTrigger>
    <TabsTrigger value="another">Outra Ativa</TabsTrigger>
  </TabsList>

  <TabsContent value="active">Conteúdo ativo</TabsContent>
  <TabsContent value="another">Outro conteúdo</TabsContent>
</Tabs>
```

---

## Com Badge de Contagem

```tsx
import { Badge } from '@facter/ds-core';

<Tabs defaultValue="inbox">
  <TabsList>
    <TabsTrigger value="inbox" className="flex items-center gap-2">
      Caixa de Entrada
      <Badge variant="default" size="sm">12</Badge>
    </TabsTrigger>
    <TabsTrigger value="sent">Enviados</TabsTrigger>
    <TabsTrigger value="spam" className="flex items-center gap-2">
      Spam
      <Badge variant="error" size="sm">3</Badge>
    </TabsTrigger>
  </TabsList>

  <TabsContent value="inbox">...</TabsContent>
  <TabsContent value="sent">...</TabsContent>
  <TabsContent value="spam">...</TabsContent>
</Tabs>
```

---

## Tabs com Cards

```tsx
<Tabs defaultValue="users" className="w-full">
  <TabsList className="w-full justify-start">
    <TabsTrigger value="users">Usuários</TabsTrigger>
    <TabsTrigger value="teams">Equipes</TabsTrigger>
    <TabsTrigger value="permissions">Permissões</TabsTrigger>
  </TabsList>

  <TabsContent value="users">
    <div className="border rounded-lg p-4 mt-4">
      <h3 className="font-semibold mb-4">Gerenciar Usuários</h3>
      {/* Conteúdo */}
    </div>
  </TabsContent>

  <TabsContent value="teams">
    <div className="border rounded-lg p-4 mt-4">
      <h3 className="font-semibold mb-4">Gerenciar Equipes</h3>
      {/* Conteúdo */}
    </div>
  </TabsContent>

  <TabsContent value="permissions">
    <div className="border rounded-lg p-4 mt-4">
      <h3 className="font-semibold mb-4">Gerenciar Permissões</h3>
      {/* Conteúdo */}
    </div>
  </TabsContent>
</Tabs>
```

---

## Tabs com URL State

```tsx
import { useSearchParams } from 'react-router-dom';

function URLTabs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  return (
    <Tabs value={currentTab} onValueChange={handleTabChange}>
      <TabsList>
        <TabsTrigger value="overview">Visão Geral</TabsTrigger>
        <TabsTrigger value="details">Detalhes</TabsTrigger>
        <TabsTrigger value="history">Histórico</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">...</TabsContent>
      <TabsContent value="details">...</TabsContent>
      <TabsContent value="history">...</TabsContent>
    </Tabs>
  );
}
```

---

## Vertical Tabs

```tsx
<Tabs defaultValue="general" orientation="vertical" className="flex gap-4">
  <TabsList className="flex-col h-auto border-r border-b-0 pr-4">
    <TabsTrigger value="general" className="w-full justify-start">
      Geral
    </TabsTrigger>
    <TabsTrigger value="security" className="w-full justify-start">
      Segurança
    </TabsTrigger>
    <TabsTrigger value="billing" className="w-full justify-start">
      Faturamento
    </TabsTrigger>
  </TabsList>

  <div className="flex-1">
    <TabsContent value="general">
      <h3 className="font-semibold mb-4">Configurações Gerais</h3>
      {/* Conteúdo */}
    </TabsContent>
    <TabsContent value="security">
      <h3 className="font-semibold mb-4">Configurações de Segurança</h3>
      {/* Conteúdo */}
    </TabsContent>
    <TabsContent value="billing">
      <h3 className="font-semibold mb-4">Faturamento</h3>
      {/* Conteúdo */}
    </TabsContent>
  </div>
</Tabs>
```

---

## API

### Tabs Props

```typescript
interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  children: React.ReactNode;
}
```

### TabsTrigger Props

```typescript
interface TabsTriggerProps {
  value: string;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}
```

### TabsContent Props

```typescript
interface TabsContentProps {
  value: string;
  forceMount?: boolean;
  className?: string;
  children: React.ReactNode;
}
```

---

## Subcomponentes

| Componente | Descrição |
|------------|-----------|
| `Tabs` | Root - gerencia estado |
| `TabsList` | Container dos triggers |
| `TabsTrigger` | Botão da aba |
| `TabsContent` | Conteúdo da aba |

---

## Acessibilidade

- Navegação por setas (← →)
- `role="tablist"`, `role="tab"`, `role="tabpanel"`
- `aria-selected` automático
- Focus management correto
- Home/End para primeira/última aba

---

**Voltar para** [Componentes](./README.md)
