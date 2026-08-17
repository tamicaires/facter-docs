# User (Usuário)

> **Entidade que representa um usuário do sistema (dados globais, sem vínculo direto com empresa).**

---

## Schema Prisma

```prisma
model User {
  id              String          @id @default(uuid())

  // Dados pessoais (globais, não por empresa)
  email           String          @unique
  password        String          // Hash bcrypt
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

  // Vínculos com empresas (via Membership)
  memberships     Membership[]

  // Convites enviados por este usuário
  invitesSent     Membership[]    @relation("Invites")

  // Preferências pessoais (globais)
  preferences     Json?           // UserPreferences

  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
}
```

---

## Diferença: User vs Membership

| Aspecto | User | Membership |
|---------|------|------------|
| Escopo | Global | Por empresa |
| Email | Único global | - |
| Senha | Uma só | - |
| Role | - | Por empresa |
| Permissões | - | Por empresa |
| Perfil técnico | - | Por empresa |

```
┌─────────────────────────────────────────────────────────────────┐
│                           USER                                   │
│  (email, senha, nome - dados globais)                           │
│                                                                  │
│    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐       │
│    │ Membership  │    │ Membership  │    │ Membership  │       │
│    │ Empresa A   │    │ Empresa B   │    │ Empresa C   │       │
│    │ role: ADMIN │    │ role: TECH  │    │ role: OWNER │       │
│    └─────────────┘    └─────────────┘    └─────────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Preferences (JSON)

```typescript
interface UserPreferences {
  // Interface
  theme: 'light' | 'dark' | 'system';
  language: 'pt-BR' | 'en' | 'es';

  // Notificações pessoais
  notifications: {
    email: boolean;
    push: boolean;
    sound: boolean;
  };

  // Atalhos de teclado
  shortcuts: Record<string, string>;

  // Última empresa acessada (para auto-select no login)
  lastCompanyId?: string;
}
```

---

## Endpoints da API

### Autenticação

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/auth/register` | Criar conta |
| POST | `/auth/login` | Login |
| POST | `/auth/logout` | Logout |
| POST | `/auth/forgot-password` | Esqueci a senha |
| POST | `/auth/reset-password` | Redefinir senha |
| POST | `/auth/verify-email` | Verificar email |
| POST | `/auth/refresh` | Renovar token |

### Perfil

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/users/me` | Meu perfil |
| PUT | `/users/me` | Atualizar perfil |
| PUT | `/users/me/password` | Alterar senha |
| PUT | `/users/me/preferences` | Atualizar preferências |
| POST | `/users/me/avatar` | Upload de avatar |
| DELETE | `/users/me/avatar` | Remover avatar |

### MFA

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/users/me/mfa/enable` | Habilitar MFA |
| POST | `/users/me/mfa/disable` | Desabilitar MFA |
| POST | `/users/me/mfa/verify` | Verificar código MFA |
| GET | `/users/me/mfa/backup-codes` | Gerar códigos backup |

---

## Fluxo de Registro

```
┌─────────────────────────────────────────────────────────────────┐
│                    REGISTRO DE USUÁRIO                          │
└────────┬────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PREENCHER DADOS                              │
│                    - Nome                                       │
│                    - Email                                      │
│                    - Senha                                      │
└────────┬────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CRIAR USER                                   │
│                    emailVerified: false                         │
└────────┬────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ENVIAR EMAIL DE VERIFICAÇÃO                  │
└────────┬────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    USUÁRIO CLICA NO LINK                        │
│                    emailVerified: true                          │
└────────┬────────────────────────────────────────────────────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
[TEM CONVITE] [NÃO TEM]
    │         │
    │         ▼
    │    ┌─────────────────┐
    │    │ Criar Empresa   │
    │    │ Criar Membership│
    │    │ role: OWNER     │
    │    └────────┬────────┘
    │             │
    └──────┬──────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    REDIRECIONAR PARA DASHBOARD                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Validações

```typescript
const userValidation = z.object({
  email: z.string().email('Email inválido'),
  password: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Precisa de letra maiúscula')
    .regex(/[0-9]/, 'Precisa de número'),
  name: z.string().min(2, 'Nome muito curto'),
  phone: z.string().optional(),
});
```

---

## Regras de Negócio

### Email
- Email único globalmente
- Verificação obrigatória para funcionalidades completas
- Pode alterar email (requer re-verificação)

### Senha
- Mínimo 8 caracteres
- Hash com bcrypt (rounds: 12)
- Histórico de senhas (não repetir últimas 5)

### MFA (Autenticação Multi-Fator)
- TOTP (Google Authenticator, Authy)
- 6 códigos de backup (uso único)
- Obrigatório para algumas empresas

### Sessão
- JWT com refresh token
- Access token: 15 minutos
- Refresh token: 7 dias
- Múltiplas sessões permitidas

---

## Hooks Úteis

```typescript
// hooks/useUser.ts
function useUser() {
  const { user, isLoading } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => api.get('/users/me'),
  });

  return { user, isLoading };
}

// hooks/useUpdateProfile.ts
function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileDto) => api.put('/users/me', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['user', 'me']);
    },
  });
}
```

---

## Ver também

- [Membership](./membership.md) - Vínculos com empresas
- [Company](./company.md) - Empresas

---

**Voltar para** [Entidades](./README.md)
