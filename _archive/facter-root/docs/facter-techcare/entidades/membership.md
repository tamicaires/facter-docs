# Membership (Vínculo Usuário-Empresa)

> **Entidade que representa o vínculo entre um usuário e uma empresa.**

---

## Motivação

Separar o vínculo user-company permite:
- **Multi-empresa**: Usuário pode pertencer a várias empresas
- **Roles por empresa**: Mesmo usuário com roles diferentes em empresas diferentes
- **Convites**: Status de convite pendente/aceito
- **Histórico**: Soft delete mantém histórico de participação

---

## Schema Prisma

```prisma
model User {
  id              String          @id @default(uuid())

  // Dados pessoais (globais, não por empresa)
  email           String          @unique
  password        String
  name            String
  avatar          String?
  phone           String?

  // Verificação
  emailVerified   Boolean         @default(false)
  emailVerifiedAt DateTime?

  // Segurança
  mfaEnabled      Boolean         @default(false)
  mfaSecret       String?
  lastLoginAt     DateTime?
  lastLoginIp     String?

  // Vínculos com empresas
  memberships     Membership[]

  // Preferências pessoais (globais)
  preferences     Json?           // UserPreferences

  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
}

model Membership {
  id              String          @id @default(uuid())

  // Vínculos
  userId          String
  user            User            @relation(fields: [userId], references: [id])
  companyId       String
  company         Company         @relation(fields: [companyId], references: [id])

  // Role nesta empresa
  role            UserRole

  // Permissões extras (além do role)
  extraPermissions String[]       @default([])

  // Status do vínculo
  status          MembershipStatus @default(PENDING)

  // Convite
  invitedById     String?
  invitedBy       User?           @relation("Invites", fields: [invitedById], references: [id])
  invitedAt       DateTime        @default(now())
  inviteToken     String?         @unique
  inviteExpiresAt DateTime?

  // Aceitação
  acceptedAt      DateTime?

  // Perfil de técnico (se role = TECHNICIAN)
  technicianProfile TechnicianProfile?

  // Metadados
  lastAccessAt    DateTime?

  // Soft delete
  deletedAt       DateTime?
  deletedReason   String?

  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  @@unique([userId, companyId])
  @@index([companyId, status])
  @@index([userId, status])
  @@index([inviteToken])
}

model TechnicianProfile {
  id              String          @id @default(uuid())
  membershipId    String          @unique
  membership      Membership      @relation(fields: [membershipId], references: [id])

  // Especialidades
  specialties     Specialty[]

  // Disponibilidade
  availability    Json?

  // Comissão
  commissionConfig TechnicianCommission?

  // Métricas (cache para performance)
  totalOrders         Int         @default(0)
  completedOrders     Int         @default(0)
  avgRating           Decimal?    @db.Decimal(3, 2)
  warrantyReturnRate  Decimal?    @db.Decimal(5, 2)

  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
}

enum UserRole {
  OWNER         // Dono da empresa (não pode ser removido)
  ADMIN         // Administrador
  MANAGER       // Gerente
  ATTENDANT     // Atendente
  TECHNICIAN    // Técnico
}

enum MembershipStatus {
  PENDING       // Convite enviado, aguardando aceite
  ACTIVE        // Ativo
  SUSPENDED     // Suspenso temporariamente
  INACTIVE      // Inativo (saiu ou foi removido)
}

enum Specialty {
  SMARTPHONE
  TABLET
  NOTEBOOK
  DESKTOP
  PRINTER
  CONSOLE
  SOFTWARE
  NETWORK
  DATA_RECOVERY
}
```

---

## Fluxo de Convite

```
┌─────────────────────────────────────────────────────────────────┐
│                    ADMIN CONVIDA USUÁRIO                        │
└────────┬────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    VERIFICAR SE USER EXISTE                     │
└────────┬────────────────────────────────────────────────────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
[EXISTE]   [NÃO EXISTE]
    │         │
    │         ▼
    │    ┌─────────────────┐
    │    │ Criar User com  │
    │    │ status pending  │
    │    └────────┬────────┘
    │             │
    └──────┬──────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CRIAR MEMBERSHIP                             │
│                    status: PENDING                              │
│                    inviteToken: uuid                            │
└────────┬────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ENVIAR EMAIL COM LINK                        │
│                    /invite/{token}                              │
└────────┬────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    USUÁRIO CLICA NO LINK                        │
└────────┬────────────────────────────────────────────────────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
[TEM CONTA] [NÃO TEM]
    │         │
    │         ▼
    │    ┌─────────────────┐
    │    │ Definir senha   │
    │    │ Completar perfil│
    │    └────────┬────────┘
    │             │
    └──────┬──────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ATIVAR MEMBERSHIP                            │
│                    status: ACTIVE                               │
│                    acceptedAt: now()                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Contexto de Autenticação

```typescript
// O usuário faz login uma vez, depois seleciona empresa
interface AuthContext {
  user: {
    id: string;
    email: string;
    name: string;
  };

  // Membership atual (empresa selecionada)
  currentMembership: {
    id: string;
    companyId: string;
    company: {
      id: string;
      name: string;
      mode: 'BUSINESS' | 'INDIVIDUAL';
    };
    role: UserRole;
    permissions: string[]; // Role permissions + extras
  };

  // Outras empresas do usuário (para switcher)
  memberships: {
    id: string;
    companyId: string;
    companyName: string;
    role: UserRole;
  }[];
}
```

---

## Switcher de Empresa

```tsx
function CompanySwitcher() {
  const { currentMembership, memberships, switchCompany } = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-2">
          <Building className="h-4 w-4" />
          {currentMembership.company.name}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {memberships.map((membership) => (
          <DropdownMenuItem
            key={membership.id}
            onClick={() => switchCompany(membership.companyId)}
            className={cn(
              membership.companyId === currentMembership.companyId && "bg-accent"
            )}
          >
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              <div>
                <p className="font-medium">{membership.companyName}</p>
                <p className="text-xs text-muted-foreground">
                  {getRoleLabel(membership.role)}
                </p>
              </div>
            </div>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/companies/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Criar nova empresa
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

---

## Endpoints da API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/memberships` | Minhas empresas |
| POST | `/memberships/switch/:companyId` | Trocar empresa ativa |
| GET | `/companies/:id/members` | Membros da empresa |
| POST | `/companies/:id/members/invite` | Convidar membro |
| POST | `/invites/:token/accept` | Aceitar convite |
| PATCH | `/memberships/:id` | Atualizar role/status |
| DELETE | `/memberships/:id` | Remover membro |

---

## Regras de Negócio

### Convite
- Token expira em 7 dias
- Pode reenviar convite (gera novo token)
- Email já cadastrado → apenas cria membership
- Email novo → cria user + membership

### Roles
- `OWNER`: Criador da empresa, não pode ser removido
- Cada empresa tem no mínimo 1 OWNER
- OWNER pode transferir ownership para outro ADMIN

### Remoção
- Soft delete (mantém histórico)
- Não pode remover a si mesmo
- Não pode remover último OWNER
- OS atribuídas são reatribuídas ou ficam sem técnico

---

## Modo Individual

No modo `INDIVIDUAL`, a empresa tem apenas 1 membership (o próprio dono):

```typescript
// Ao criar empresa no modo individual
async function createIndividualCompany(userId: string, data: CreateCompanyDto) {
  const company = await prisma.company.create({
    data: {
      ...data,
      mode: 'INDIVIDUAL',
      memberships: {
        create: {
          userId,
          role: 'OWNER',
          status: 'ACTIVE',
          acceptedAt: new Date(),
        },
      },
    },
  });

  return company;
}
```

---

## Permissões por Role

| Permissão | Owner | Admin | Manager | Attendant | Technician |
|-----------|-------|-------|---------|-----------|------------|
| Convidar membros | ✅ | ✅ | ❌ | ❌ | ❌ |
| Remover membros | ✅ | ✅ | ❌ | ❌ | ❌ |
| Alterar roles | ✅ | ✅* | ❌ | ❌ | ❌ |
| Ver membros | ✅ | ✅ | ✅ | ❌ | ❌ |
| Configurações | ✅ | ✅ | ✅** | ❌ | ❌ |

*Admin não pode alterar OWNER
**Manager só algumas configs

---

**Voltar para** [Entidades](./README.md)
