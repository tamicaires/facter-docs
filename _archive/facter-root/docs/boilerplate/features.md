# Facter Boilerplate - Features Detalhadas

## Contexto do Ecossistema

**Sistemas Facter:**
- Facter Truck - Gestão de frotas/carretas
- Facter TechCare - Assistência técnica
- Facter Vagas - Vagas de emprego
- Facter Pet - Sistema pet shop/veterinário
- Outros futuros...

**Características comuns:**
- Todos são SaaS multi-tenant
- Usuário pode ter acesso a múltiplas empresas
- CRUD de entidades específicas do domínio
- Relatórios e dashboards
- Configurações por empresa

---

## Estrutura do Boilerplate

### Camada 1: Core (Sempre incluso)

```
✅ OBRIGATÓRIO EM TODOS OS PROJETOS
```

#### 1.1 Autenticação Completa
```
/login              - Tela de login (AuthLayout)
/register           - Cadastro de usuário
/forgot-password    - Esqueci minha senha
/reset-password     - Redefinir senha
/verify-email       - Verificação de email (opcional)
```

**Funcionalidades:**
- Login com email/senha
- Remember me (token persistente)
- Refresh token automático
- Logout em todos dispositivos
- Rate limiting (proteção brute force)

#### 1.2 Multi-tenancy (Empresas)
```
/select-company     - Seleção de empresa (SelectionLayout)
/companies/new      - Criar nova empresa
/invite/[token]     - Aceitar convite de empresa
```

**Funcionalidades:**
- Usuário pertence a N empresas (memberships)
- Roles por empresa (owner, admin, member)
- Convite por email
- Empresa ativa salva em cookie/store
- Middleware valida empresa ativa

#### 1.3 Layout de Dashboard
```
/dashboard          - Dashboard principal
/[qualquer-rota]    - Todas usam DashboardLayout
```

**DashboardLayout inclui:**
- Sidebar colapsável
- Header com user menu
- Breadcrumbs automáticos
- Mobile responsive (drawer)
- Theme toggle (dark/light)

#### 1.4 Perfil e Conta
```
/settings/profile   - Dados do usuário
/settings/security  - Senha, 2FA
/settings/sessions  - Dispositivos conectados
```

#### 1.5 Configurações da Empresa
```
/settings/company           - Dados da empresa
/settings/company/members   - Membros e convites
/settings/company/roles     - Permissões (se RBAC)
/settings/company/billing   - Assinatura (se SaaS pago)
```

---

### Camada 2: Módulos Opcionais

```
⚙️ ATIVADOS CONFORME NECESSIDADE DO PROJETO
```

#### 2.1 Sistema de Permissões (RBAC)
```typescript
// Uso
<Can permission="users.create">
  <Button>Novo Usuário</Button>
</Can>

// ou hook
const { can } = usePermissions()
if (can('users.delete')) { ... }
```

**Inclui:**
- Roles configuráveis por empresa
- Permissions granulares
- UI para gerenciar roles
- Middleware de proteção

#### 2.2 Notificações
```
/notifications      - Central de notificações
```

**Funcionalidades:**
- Notificações in-app (bell icon)
- Mark as read/unread
- Push notifications (opcional)
- Email notifications (configurável)
- Preferências por tipo

#### 2.3 Auditoria/Activity Log
```
/settings/audit     - Log de atividades
```

**Funcionalidades:**
- Registra ações importantes
- Quem fez, quando, o quê
- Filtros por período, usuário, ação
- Export para compliance

#### 2.4 Upload de Arquivos
```typescript
// Componente
<FileUpload
  accept="image/*,application/pdf"
  maxSize={5 * 1024 * 1024}
  onUpload={handleUpload}
/>

// Service
const url = await uploadService.upload(file)
```

**Inclui:**
- Upload para S3/Cloudflare R2
- Preview de imagens
- Progress bar
- Validação de tipo/tamanho
- Compressão de imagens

#### 2.5 Busca Global
```
Ctrl+K / Cmd+K     - Command palette
```

**Funcionalidades:**
- Busca em todas as entidades
- Ações rápidas (criar, navegar)
- Atalhos de teclado
- Resultados agrupados

#### 2.6 Exportação de Dados
```typescript
<DataTable>
  <DataTable.Export formats={['csv', 'xlsx', 'pdf']} />
</DataTable>
```

**Formatos:**
- CSV
- Excel (xlsx)
- PDF (relatório formatado)

#### 2.7 Relatórios
```
/reports            - Lista de relatórios
/reports/[id]       - Relatório específico
```

**Estrutura:**
- Relatórios pré-definidos
- Filtros de período
- Gráficos (charts)
- Export PDF/Excel

---

### Camada 3: Integrações

```
🔌 CONEXÕES COM SERVIÇOS EXTERNOS
```

#### 3.1 Webhooks
```
/settings/webhooks  - Configurar webhooks
```

**Funcionalidades:**
- URLs de callback
- Eventos disponíveis
- Retry automático
- Logs de envio

#### 3.2 API Pública
```
/settings/api-keys  - Chaves de API
/docs/api           - Documentação
```

**Funcionalidades:**
- Gerar API keys
- Permissões por key
- Rate limiting
- OpenAPI/Swagger docs

---

## Decisões por Sistema

| Feature | Truck | TechCare | Vagas | Pet |
|---------|-------|----------|-------|-----|
| Auth | ✅ | ✅ | ✅ | ✅ |
| Multi-tenant | ✅ | ✅ | ✅ | ✅ |
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| RBAC | ✅ | ✅ | ⚙️ | ⚙️ |
| Notificações | ✅ | ✅ | ✅ | ✅ |
| Audit Log | ✅ | ⚙️ | ❌ | ❌ |
| File Upload | ✅ | ✅ | ✅ | ✅ |
| Busca Global | ✅ | ⚙️ | ✅ | ⚙️ |
| Relatórios | ✅ | ✅ | ⚙️ | ⚙️ |
| Webhooks | ⚙️ | ⚙️ | ✅ | ❌ |
| API Pública | ⚙️ | ⚙️ | ✅ | ❌ |

✅ = Necessário desde o início
⚙️ = Pode adicionar depois
❌ = Provavelmente não precisa

---

## Estrutura de Pastas Expandida

```
facter-boilerplate/
├── src/
│   ├── app/
│   │   ├── (auth)/                 # Públicas
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── forgot-password/
│   │   │   └── reset-password/
│   │   │
│   │   ├── (main)/                 # Protegidas
│   │   │   ├── select-company/
│   │   │   ├── dashboard/
│   │   │   ├── settings/
│   │   │   │   ├── profile/
│   │   │   │   ├── security/
│   │   │   │   ├── company/
│   │   │   │   └── notifications/
│   │   │   └── layout.tsx          # DashboardLayout
│   │   │
│   │   └── api/
│   │       └── auth/
│   │
│   ├── features/
│   │   ├── auth/                   # Core
│   │   ├── company/                # Core
│   │   ├── user/                   # Core
│   │   ├── notifications/          # Opcional
│   │   ├── permissions/            # Opcional (RBAC)
│   │   └── audit/                  # Opcional
│   │
│   ├── components/
│   │   ├── layouts/
│   │   │   ├── dashboard-layout/
│   │   │   │   ├── sidebar.tsx
│   │   │   │   ├── header.tsx
│   │   │   │   ├── breadcrumbs.tsx
│   │   │   │   └── index.tsx
│   │   │   └── index.ts
│   │   │
│   │   └── common/
│   │       ├── command-palette.tsx  # Busca global
│   │       ├── file-upload.tsx
│   │       └── data-export.tsx
│   │
│   ├── lib/
│   │   ├── api.ts
│   │   ├── auth.ts                 # Helpers de auth
│   │   ├── upload.ts               # Upload service
│   │   └── permissions.ts          # RBAC helpers
│   │
│   └── config/
│       ├── features.ts             # Feature flags
│       ├── navigation.ts           # Menu items
│       └── permissions.ts          # Permissions list
│
├── .env.example
├── README.md
└── docs/
    ├── SETUP.md                    # Como usar o template
    ├── FEATURES.md                 # Features disponíveis
    └── CUSTOMIZATION.md            # Como customizar
```

---

## Feature Flags

```typescript
// config/features.ts
export const features = {
  // Core (sempre true)
  auth: true,
  multiTenant: true,

  // Opcionais (configurar por projeto)
  rbac: process.env.NEXT_PUBLIC_FEATURE_RBAC === 'true',
  notifications: process.env.NEXT_PUBLIC_FEATURE_NOTIFICATIONS === 'true',
  auditLog: process.env.NEXT_PUBLIC_FEATURE_AUDIT === 'true',
  globalSearch: process.env.NEXT_PUBLIC_FEATURE_SEARCH === 'true',
  webhooks: process.env.NEXT_PUBLIC_FEATURE_WEBHOOKS === 'true',
}

// Uso
import { features } from '@/config/features'

{features.notifications && <NotificationBell />}
```

---

## Próximos Passos

1. **DashboardLayout no DS** - Criar antes do boilerplate
2. **Criar repositório** - facter-boilerplate (separado)
3. **Implementar Core** - Auth, Multi-tenant, Dashboard
4. **Documentar** - Como usar, customizar
5. **Testar** - Criar um sistema novo usando o template

---

## Estimativa de Tempo

| Fase | Descrição | Tempo |
|------|-----------|-------|
| 1 | DashboardLayout no DS | 2-3h |
| 2 | Setup repo + estrutura | 1-2h |
| 3 | Auth completo | 4-6h |
| 4 | Multi-tenant | 3-4h |
| 5 | DashboardLayout no boilerplate | 2-3h |
| 6 | Settings pages | 2-3h |
| 7 | Documentação | 2h |
| **Total** | | **16-23h** |

Módulos opcionais: +2-4h cada
