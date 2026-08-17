# Permissões (Abilities)

> **Sistema de permissões granular baseado no padrão CASL/Abilities.**
> Define o que cada perfil pode fazer em cada recurso do sistema.

---

## Conceito

O sistema de permissões usa o padrão **Abilities** (inspirado no CASL), onde:

- **Action**: O que o usuário quer fazer (create, read, update, delete, manage)
- **Subject**: Sobre qual recurso (ServiceOrder, Customer, Stock, etc.)
- **Conditions**: Condições adicionais (próprio recurso, mesma empresa, etc.)

---

## Arquitetura

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Frontend     │     │     Backend     │     │    Database     │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ PermissionsProvider  │ AbilityModule   │     │ UserRole        │
│ usePermissions  │────▶│ AbilityBuilder  │────▶│ RolePermission  │
│ <Can> Component │     │ PolicyGuard     │     │ Permission      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## Actions

| Action | Código | Descrição |
|--------|--------|-----------|
| Manage | `manage` | Todas as ações (admin) |
| Create | `create` | Criar novo recurso |
| Read | `read` | Visualizar recurso |
| Update | `update` | Editar recurso |
| Delete | `delete` | Excluir recurso |
| View Report | `view_report` | Ver relatórios do recurso |

---

## Subjects (Recursos)

### Core

| Subject | Código | Descrição |
|---------|--------|-----------|
| ServiceOrder | `ServiceOrder` | Ordens de Serviço |
| Customer | `Customer` | Clientes |
| Equipment | `Equipment` | Equipamentos |
| Technician | `Technician` | Técnicos |

### Operacional

| Subject | Código | Descrição |
|---------|--------|-----------|
| Quote | `Quote` | Orçamentos |
| Diagnosis | `Diagnosis` | Diagnósticos |
| Stock | `Stock` | Estoque |
| Part | `Part` | Peças |
| Warranty | `Warranty` | Garantias |

### Financeiro

| Subject | Código | Descrição |
|---------|--------|-----------|
| Payment | `Payment` | Pagamentos |
| Commission | `Commission` | Comissões |

### Sistema

| Subject | Código | Descrição |
|---------|--------|-----------|
| User | `User` | Usuários |
| Dashboard | `Dashboard` | Dashboard |
| Report | `Report` | Relatórios |
| Settings | `Settings` | Configurações |

---

## Perfis e Permissões

### Atendente

```typescript
const atendenteAbilities = [
  // Service Orders
  { action: 'create', subject: 'ServiceOrder' },
  { action: 'read', subject: 'ServiceOrder' },
  { action: 'update', subject: 'ServiceOrder' },

  // Customers
  { action: 'create', subject: 'Customer' },
  { action: 'read', subject: 'Customer' },
  { action: 'update', subject: 'Customer' },

  // Equipment
  { action: 'create', subject: 'Equipment' },
  { action: 'read', subject: 'Equipment' },

  // Quotes
  { action: 'read', subject: 'Quote' },

  // Payments
  { action: 'create', subject: 'Payment' },
  { action: 'read', subject: 'Payment' },

  // Stock - apenas visualizar
  { action: 'read', subject: 'Stock' },
  { action: 'read', subject: 'Part' },

  // Dashboard básico
  { action: 'read', subject: 'Dashboard' },
];
```

### Técnico

```typescript
const tecnicoAbilities = [
  // Service Orders - apenas atribuídas
  { action: 'read', subject: 'ServiceOrder', conditions: { technicianId: '${userId}' } },
  { action: 'update', subject: 'ServiceOrder', conditions: { technicianId: '${userId}' } },

  // Diagnosis
  { action: 'create', subject: 'Diagnosis' },
  { action: 'update', subject: 'Diagnosis', conditions: { createdBy: '${userId}' } },

  // Quotes - criar e editar próprios
  { action: 'create', subject: 'Quote' },
  { action: 'update', subject: 'Quote', conditions: { createdBy: '${userId}' } },

  // Stock - usar peças
  { action: 'read', subject: 'Stock' },
  { action: 'read', subject: 'Part' },

  // Ver próprias comissões
  { action: 'read', subject: 'Commission', conditions: { technicianId: '${userId}' } },
];
```

### Gerente

```typescript
const gerenteAbilities = [
  // Service Orders - todas
  { action: 'manage', subject: 'ServiceOrder' },

  // Customers - todas
  { action: 'manage', subject: 'Customer' },

  // Equipment
  { action: 'manage', subject: 'Equipment' },

  // Quotes - todas + aprovar descontos
  { action: 'manage', subject: 'Quote' },

  // Diagnosis
  { action: 'manage', subject: 'Diagnosis' },

  // Stock
  { action: 'manage', subject: 'Stock' },
  { action: 'manage', subject: 'Part' },

  // Payments
  { action: 'manage', subject: 'Payment' },

  // Commissions - visualizar todas
  { action: 'read', subject: 'Commission' },

  // Technicians
  { action: 'read', subject: 'Technician' },
  { action: 'update', subject: 'Technician' },

  // Dashboard e Reports
  { action: 'manage', subject: 'Dashboard' },
  { action: 'manage', subject: 'Report' },
];
```

### Administrador

```typescript
const adminAbilities = [
  // Acesso total
  { action: 'manage', subject: 'All' },
];
```

---

## Implementação Frontend

### PermissionsProvider

```typescript
// core/permissions/permissions-provider.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { Ability } from './ability';
import { permissionsService } from './permissions-service';

interface PermissionsContextType {
  ability: Ability | null;
  loading: boolean;
  can: (action: Action, subject: Subject, data?: any) => boolean;
  canAll: (abilities: Array<[Action, Subject]>, data?: any) => boolean;
  canAny: (abilities: Array<[Action, Subject]>, data?: any) => boolean;
  isAdmin: () => boolean;
  refreshPermissions: () => Promise<void>;
}

export function PermissionsProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const [ability, setAbility] = useState<Ability | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPermissions();
    }
  }, [isAuthenticated, user]);

  const can = (action, subject, data) => {
    if (loading || !ability) return false;
    return ability.can(action, subject, data);
  };

  // ... resto da implementação
}
```

### Componente `<Can>`

```tsx
// core/permissions/can.tsx
interface CanProps {
  action: Action;
  subject: Subject;
  data?: any;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function Can({ action, subject, children, fallback = null }: CanProps) {
  const { can } = usePermissions();

  return can(action, subject) ? <>{children}</> : <>{fallback}</>;
}

// Uso
<Can action="create" subject="ServiceOrder">
  <Button>Nova OS</Button>
</Can>

<Can action="delete" subject="Customer" fallback={<DisabledButton />}>
  <Button variant="destructive">Excluir</Button>
</Can>
```

### Componentes `<CanAll>` e `<CanAny>`

```tsx
// Todas as permissões necessárias
<CanAll abilities={[['create', 'Quote'], ['update', 'ServiceOrder']]}>
  <Button>Gerar Orçamento</Button>
</CanAll>

// Qualquer uma das permissões
<CanAny abilities={[['read', 'Report'], ['manage', 'Dashboard']]}>
  <MenuItem>Relatórios</MenuItem>
</CanAny>
```

### Hook `usePermissions`

```typescript
// Uso em lógica
function ServiceOrderActions({ order }) {
  const { can } = usePermissions();

  const handleDelete = () => {
    if (!can('delete', 'ServiceOrder', { id: order.id })) {
      toast.error('Sem permissão');
      return;
    }
    // proceder com exclusão
  };

  return (
    <DropdownMenu>
      {can('update', 'ServiceOrder') && (
        <DropdownMenuItem>Editar</DropdownMenuItem>
      )}
      {can('delete', 'ServiceOrder') && (
        <DropdownMenuItem>Excluir</DropdownMenuItem>
      )}
    </DropdownMenu>
  );
}
```

---

## Implementação Backend

### AbilityBuilder

```typescript
// infra/http/ability/abilityBuilder.ts
export class AbilityBuilder {
  private rules: Rule[] = [];

  can(action: Action, subject: Subject, conditions?: Conditions) {
    this.rules.push({ action, subject, conditions });
  }

  cannot(action: Action, subject: Subject, conditions?: Conditions) {
    this.rules.push({ action, subject, conditions, inverted: true });
  }

  build(): Ability {
    return new Ability(this.rules);
  }
}
```

### Definição de Abilities por Role

```typescript
// infra/http/ability/define-abilities.ts
export function defineAbilitiesFor(user: User): Ability {
  const builder = new AbilityBuilder();

  switch (user.role) {
    case 'ADMIN':
      builder.can('manage', 'All');
      break;

    case 'MANAGER':
      builder.can('manage', 'ServiceOrder');
      builder.can('manage', 'Customer');
      builder.can('manage', 'Quote');
      // ...
      break;

    case 'TECHNICIAN':
      builder.can('read', 'ServiceOrder', { technicianId: user.id });
      builder.can('update', 'ServiceOrder', { technicianId: user.id });
      builder.can('create', 'Diagnosis');
      // ...
      break;

    case 'ATTENDANT':
      builder.can('create', 'ServiceOrder');
      builder.can('read', 'ServiceOrder');
      builder.can('create', 'Customer');
      // ...
      break;
  }

  return builder.build();
}
```

### Policy Guard

```typescript
// infra/http/auth/guards/policy.guard.ts
@Injectable()
export class PolicyGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const permissions = this.reflector.get<Permission[]>(
      'permissions',
      context.getHandler()
    );

    if (!permissions) return true;

    const request = context.switchToHttp().getRequest();
    const ability = request.ability;

    return permissions.every(({ action, subject }) =>
      ability.can(action, subject)
    );
  }
}
```

### Decorator de Permissões

```typescript
// infra/http/auth/decorators/permissions.decorator.ts
export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata('permissions', permissions);

// Uso no controller
@Controller('service-orders')
export class ServiceOrderController {
  @Post()
  @RequirePermissions({ action: 'create', subject: 'ServiceOrder' })
  async create(@Body() dto: CreateServiceOrderDto) {
    // ...
  }

  @Delete(':id')
  @RequirePermissions({ action: 'delete', subject: 'ServiceOrder' })
  async delete(@Param('id') id: string) {
    // ...
  }
}
```

---

## Condições Dinâmicas

### Verificar Próprio Recurso

```typescript
// Frontend
const { can } = usePermissions();
const canEditOwnOrder = can('update', 'ServiceOrder', { technicianId: userId });

// Backend
builder.can('update', 'ServiceOrder', { technicianId: user.id });
```

### Multi-tenant

```typescript
// Todas as queries filtram por companyId automaticamente
builder.can('read', 'ServiceOrder', { companyId: user.companyId });
```

---

## Tabelas do Banco

### Schema

```prisma
model Role {
  id          String       @id @default(uuid())
  name        String       @unique  // ADMIN, MANAGER, TECHNICIAN, ATTENDANT
  description String?
  permissions Permission[]
  users       User[]
}

model Permission {
  id        String  @id @default(uuid())
  action    String  // create, read, update, delete, manage
  subject   String  // ServiceOrder, Customer, etc.
  conditions Json?  // { technicianId: "${userId}" }
  roleId    String
  role      Role    @relation(fields: [roleId], references: [id])

  @@unique([roleId, action, subject])
}
```

---

## Permissões por Tela

| Tela | Permissões Necessárias |
|------|------------------------|
| Dashboard | `read:Dashboard` |
| Lista de OS | `read:ServiceOrder` |
| Criar OS | `create:ServiceOrder`, `read:Customer` |
| Detalhes OS | `read:ServiceOrder` |
| Editar OS | `update:ServiceOrder` |
| Lista Clientes | `read:Customer` |
| Estoque | `read:Stock` |
| Entrada Estoque | `create:Stock` |
| Relatórios | `read:Report` |
| Configurações | `manage:Settings` |

---

## Boas Práticas

1. **Verificar no Frontend E Backend**: Nunca confie apenas no frontend
2. **Granularidade**: Prefira permissões específicas a genéricas
3. **Cache**: Cache de permissions no frontend para evitar re-fetches
4. **Condições**: Use conditions para permissões contextuais
5. **Fallbacks**: Sempre forneça fallback visual quando sem permissão

```tsx
// ✅ Bom - Verificação dupla
// Frontend: esconde o botão
<Can action="delete" subject="Customer">
  <Button onClick={handleDelete}>Excluir</Button>
</Can>

// Backend: bloqueia a requisição
@Delete(':id')
@RequirePermissions({ action: 'delete', subject: 'Customer' })
async delete() { }
```

---

**Voltar para** [Regras de Negócio](./README.md)
