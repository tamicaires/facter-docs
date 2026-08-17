# PlatformAdmin (Administrador da Plataforma)

> **Entidade que representa administradores da plataforma TechCare (não das empresas).**

---

## Conceito

**PlatformAdmin** é diferente de **User**:

| Aspecto | User | PlatformAdmin |
|---------|------|---------------|
| Escopo | Empresas/Tenants | Plataforma global |
| Acessa | App principal | Admin Panel |
| Gerencia | Dados da empresa | Empresas, planos, features |
| Multi-tenant | Sim (via membership) | Não |

---

## Schema Prisma

```prisma
model PlatformAdmin {
  id              String          @id @default(uuid())

  // Autenticação
  email           String          @unique
  password        String          // Hash bcrypt
  name            String

  // Role na plataforma
  role            PlatformRole    @default(SUPPORT)

  // Permissões específicas (além do role)
  permissions     String[]        // ['manage_billing', 'impersonate']

  // Segurança
  mfaEnabled      Boolean         @default(true)  // Obrigatório para admins
  mfaSecret       String?
  mfaBackupCodes  String[]        // Códigos de backup

  // Status
  status          AdminStatus     @default(ACTIVE)

  // Sessões e auditoria
  lastLoginAt     DateTime?
  lastLoginIp     String?
  sessions        AdminSession[]

  // Audit trail
  actionsLog      AdminAuditLog[]

  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  @@index([email])
  @@index([role])
}

model AdminSession {
  id              String          @id @default(uuid())
  adminId         String
  admin           PlatformAdmin   @relation(fields: [adminId], references: [id])

  // Token
  token           String          @unique
  refreshToken    String          @unique

  // Metadados
  userAgent       String?
  ipAddress       String?
  location        String?         // Geolocalização aproximada

  // Expiração
  expiresAt       DateTime
  lastActivityAt  DateTime        @default(now())

  // Status
  revoked         Boolean         @default(false)
  revokedAt       DateTime?
  revokedReason   String?

  createdAt       DateTime        @default(now())

  @@index([adminId])
  @@index([token])
}

model AdminAuditLog {
  id              String          @id @default(uuid())
  adminId         String
  admin           PlatformAdmin   @relation(fields: [adminId], references: [id])

  // Ação
  action          AdminAction

  // Alvo da ação
  targetType      String?         // 'Company', 'Feature', 'Plan'
  targetId        String?

  // Detalhes
  details         Json?
  metadata        Json?           // IP, user agent, etc

  // Request
  requestId       String?
  ipAddress       String?

  createdAt       DateTime        @default(now())

  @@index([adminId])
  @@index([action])
  @@index([targetType, targetId])
  @@index([createdAt])
}

enum PlatformRole {
  SUPER_ADMIN     // Acesso total, pode criar outros admins
  ADMIN           // Gerencia empresas e features
  SUPPORT         // Visualiza e suporte básico
  BILLING         // Apenas financeiro/assinaturas
}

enum AdminStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
}

enum AdminAction {
  // Auth
  LOGIN
  LOGOUT
  LOGIN_FAILED
  PASSWORD_CHANGE
  MFA_ENABLE
  MFA_DISABLE

  // Companies
  COMPANY_VIEW
  COMPANY_CREATE
  COMPANY_UPDATE
  COMPANY_SUSPEND
  COMPANY_REACTIVATE
  COMPANY_DELETE
  COMPANY_IMPERSONATE

  // Features
  FEATURE_CREATE
  FEATURE_UPDATE
  FEATURE_DELETE
  FEATURE_TOGGLE
  FEATURE_OVERRIDE

  // Plans
  PLAN_CREATE
  PLAN_UPDATE
  PLAN_DELETE
  COMPANY_PLAN_CHANGE

  // Admins
  ADMIN_CREATE
  ADMIN_UPDATE
  ADMIN_DELETE
  ADMIN_SUSPEND

  // Billing
  INVOICE_VIEW
  INVOICE_REFUND
  SUBSCRIPTION_CANCEL

  // System
  CONFIG_CHANGE
  DATA_EXPORT
}
```

---

## Permissões por Role

```typescript
const ROLE_PERMISSIONS: Record<PlatformRole, string[]> = {
  SUPER_ADMIN: [
    // Tudo
    '*',
  ],

  ADMIN: [
    // Companies
    'companies:view',
    'companies:create',
    'companies:update',
    'companies:suspend',
    'companies:impersonate',

    // Features
    'features:view',
    'features:toggle',
    'features:override',

    // Plans
    'plans:view',
    'plans:assign',

    // Billing
    'billing:view',

    // Admins
    'admins:view',
  ],

  SUPPORT: [
    // Companies (somente leitura)
    'companies:view',

    // Features (somente leitura)
    'features:view',

    // Billing (somente leitura)
    'billing:view',
  ],

  BILLING: [
    // Companies (limitado)
    'companies:view',

    // Billing (completo)
    'billing:view',
    'billing:refund',
    'subscriptions:manage',

    // Plans
    'plans:view',
    'plans:assign',
  ],
};

// Verificar permissão
function hasPermission(admin: PlatformAdmin, permission: string): boolean {
  const rolePermissions = ROLE_PERMISSIONS[admin.role];

  // Super admin tem tudo
  if (rolePermissions.includes('*')) return true;

  // Verificar permissão do role
  if (rolePermissions.includes(permission)) return true;

  // Verificar permissões extras
  if (admin.permissions.includes(permission)) return true;

  return false;
}
```

---

## Autenticação

```typescript
// services/admin-auth.service.ts
class AdminAuthService {
  /**
   * Login do admin
   */
  async login(email: string, password: string, mfaCode?: string): Promise<{
    admin: PlatformAdmin;
    tokens: { accessToken: string; refreshToken: string };
  }> {
    const admin = await prisma.platformAdmin.findUnique({
      where: { email },
    });

    if (!admin || admin.status !== 'ACTIVE') {
      await this.logAction(null, 'LOGIN_FAILED', { email, reason: 'not_found' });
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Verificar senha
    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) {
      await this.logAction(admin.id, 'LOGIN_FAILED', { reason: 'wrong_password' });
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Verificar MFA (obrigatório para admins)
    if (admin.mfaEnabled) {
      if (!mfaCode) {
        throw new MfaRequiredException();
      }

      const validMfa = this.verifyMfaCode(admin.mfaSecret!, mfaCode);
      if (!validMfa) {
        // Verificar códigos de backup
        const backupIndex = admin.mfaBackupCodes.indexOf(mfaCode);
        if (backupIndex === -1) {
          await this.logAction(admin.id, 'LOGIN_FAILED', { reason: 'wrong_mfa' });
          throw new UnauthorizedException('Código MFA inválido');
        }

        // Remover código de backup usado
        await prisma.platformAdmin.update({
          where: { id: admin.id },
          data: {
            mfaBackupCodes: admin.mfaBackupCodes.filter((_, i) => i !== backupIndex),
          },
        });
      }
    }

    // Criar sessão
    const tokens = this.generateTokens(admin);
    await this.createSession(admin.id, tokens);

    // Atualizar último login
    await prisma.platformAdmin.update({
      where: { id: admin.id },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: this.getClientIp(),
      },
    });

    await this.logAction(admin.id, 'LOGIN');

    return { admin, tokens };
  }

  /**
   * Impersonate - acessar como admin de uma empresa
   */
  async impersonate(adminId: string, companyId: string): Promise<{
    token: string;
    company: Company;
  }> {
    const admin = await prisma.platformAdmin.findUnique({
      where: { id: adminId },
    });

    if (!hasPermission(admin!, 'companies:impersonate')) {
      throw new ForbiddenException('Sem permissão para impersonate');
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: { memberships: { where: { role: 'OWNER' } } },
    });

    if (!company) {
      throw new NotFoundException('Empresa não encontrada');
    }

    // Gerar token especial de impersonate
    const ownerMembership = company.memberships[0];
    const token = this.generateImpersonateToken(admin!, ownerMembership);

    await this.logAction(adminId, 'COMPANY_IMPERSONATE', {
      companyId,
      companyName: company.name,
    });

    return { token, company };
  }

  /**
   * Registrar ação de auditoria
   */
  private async logAction(
    adminId: string | null,
    action: AdminAction,
    details?: Record<string, any>
  ): Promise<void> {
    if (!adminId) {
      // Log sem admin (tentativas de login falhas)
      console.log(`Admin action: ${action}`, details);
      return;
    }

    await prisma.adminAuditLog.create({
      data: {
        adminId,
        action,
        details,
        ipAddress: this.getClientIp(),
        requestId: this.getRequestId(),
      },
    });
  }
}
```

---

## Endpoints da API

### Autenticação

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/admin/auth/login` | Login |
| POST | `/admin/auth/logout` | Logout |
| POST | `/admin/auth/refresh` | Renovar token |
| POST | `/admin/auth/mfa/verify` | Verificar MFA |

### Gestão de Admins

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/admin/admins` | Listar admins |
| GET | `/admin/admins/:id` | Buscar admin |
| POST | `/admin/admins` | Criar admin |
| PUT | `/admin/admins/:id` | Atualizar admin |
| DELETE | `/admin/admins/:id` | Desativar admin |
| POST | `/admin/admins/:id/suspend` | Suspender |
| POST | `/admin/admins/:id/reactivate` | Reativar |

### Auditoria

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/admin/audit-logs` | Listar logs |
| GET | `/admin/audit-logs/admin/:id` | Logs de um admin |
| GET | `/admin/audit-logs/export` | Exportar logs |

### Impersonate

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/admin/impersonate/:companyId` | Acessar como empresa |
| POST | `/admin/impersonate/end` | Encerrar impersonate |

---

## Interface de Gestão

```tsx
function AdminsManagementPage() {
  const { data: admins, isLoading } = useAdmins();
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Administradores</h1>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Admin
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Admin</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>MFA</TableHead>
                <TableHead>Último Login</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins?.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{admin.name}</p>
                      <p className="text-sm text-muted-foreground">{admin.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleVariant(admin.role)}>
                      {getRoleLabel(admin.role)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={admin.status === 'ACTIVE' ? 'success' : 'destructive'}>
                      {admin.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {admin.mfaEnabled ? (
                      <ShieldCheck className="h-5 w-5 text-green-600" />
                    ) : (
                      <ShieldAlert className="h-5 w-5 text-yellow-600" />
                    )}
                  </TableCell>
                  <TableCell>
                    {admin.lastLoginAt
                      ? formatRelative(admin.lastLoginAt)
                      : 'Nunca'}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => editAdmin(admin)}>
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => viewLogs(admin.id)}>
                          Ver Logs
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {admin.status === 'ACTIVE' ? (
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => suspendAdmin(admin.id)}
                          >
                            Suspender
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => reactivateAdmin(admin.id)}>
                            Reativar
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CreateAdminModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}
```

---

## Logs de Auditoria

```tsx
function AdminAuditLogsPage() {
  const [filters, setFilters] = useState({
    adminId: '',
    action: '',
    from: subDays(new Date(), 7),
    to: new Date(),
  });

  const { data: logs, isLoading } = useAdminAuditLogs(filters);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Logs de Auditoria</h1>

      {/* Filtros */}
      <Card>
        <CardContent className="flex gap-4 pt-6">
          <Select
            value={filters.adminId}
            onValueChange={(v) => setFilters({ ...filters, adminId: v })}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Todos os admins" />
            </SelectTrigger>
            <SelectContent>
              {/* Options */}
            </SelectContent>
          </Select>

          <Select
            value={filters.action}
            onValueChange={(v) => setFilters({ ...filters, action: v })}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Todas as ações" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(AdminAction).map((action) => (
                <SelectItem key={action} value={action}>
                  {getActionLabel(action)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DateRangePicker
            value={{ from: filters.from, to: filters.to }}
            onChange={({ from, to }) => setFilters({ ...filters, from, to })}
          />

          <Button variant="outline" onClick={() => exportLogs(filters)}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </CardContent>
      </Card>

      {/* Timeline de logs */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {logs?.map((log) => (
              <div key={log.id} className="flex gap-4 pb-4 border-b last:border-0">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  getActionColor(log.action)
                )}>
                  {getActionIcon(log.action)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{log.admin.name}</span>
                    <span className="text-muted-foreground">
                      {getActionLabel(log.action)}
                    </span>
                    {log.targetType && (
                      <Badge variant="outline">
                        {log.targetType}: {log.targetId}
                      </Badge>
                    )}
                  </div>
                  {log.details && (
                    <pre className="text-xs text-muted-foreground mt-1 bg-muted p-2 rounded">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  )}
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <span>{formatDateTime(log.createdAt)}</span>
                    {log.ipAddress && (
                      <>
                        <span>•</span>
                        <span>IP: {log.ipAddress}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## Regras de Negócio

### Autenticação
- MFA obrigatório para todos os admins
- Sessões expiram em 8 horas de inatividade
- Máximo de 3 sessões simultâneas

### Roles
- SUPER_ADMIN: Único que pode criar/gerenciar outros admins
- ADMIN: Gerencia empresas e features
- SUPPORT: Acesso somente leitura
- BILLING: Apenas questões financeiras

### Impersonate
- Gera token especial com flag `impersonated: true`
- Todas as ações são logadas com o admin original
- Duração máxima de 1 hora

### Auditoria
- Todas as ações são registradas
- Logs mantidos por 2 anos
- Exportação disponível para compliance

### Segurança
- Senhas com mínimo 12 caracteres
- Bloqueio após 5 tentativas falhas
- Notificação de login de novo IP

---

**Voltar para** [Entidades](./README.md)
