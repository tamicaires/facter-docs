# [FACTBP-API-011] RBAC com CASL

> Implementar sistema de permissões usando CASL.

---

## Status: ✅ Concluído (2025-12-16)

## Contexto

**Problemas do Facter Truck que estamos resolvendo:**
- ❌ Implementação bugada de ability → ✅ CASL library testada
- ❌ Roles hardcoded em enum → ✅ Database-driven
- ❌ Cache de 1 hora → ✅ Cache de 5 minutos
- ❌ Sem tipagem → ✅ Totalmente tipado

**CASL:**
- Biblioteca padrão para RBAC em JS/TS
- Performática e testada
- Suporta condições complexas
- Integração fácil com NestJS

---

## Tasks

### Task 11.1: Instalar Dependências

**Comando:**
```bash
pnpm add @casl/ability @casl/prisma
```

**Commit:** `[FACTBP-API] chore(deps): add @casl/ability`

**Status:** ✅

---

### Task 11.2: Definir Actions e Subjects

**Arquivo:** `src/infra/auth/casl/casl.types.ts`

**Implementação:**
```typescript
import { Prisma } from '@prisma/client';

// Actions possíveis
export type Action =
  | 'manage' // wildcard - todas as ações
  | 'create'
  | 'read'
  | 'update'
  | 'delete';

// Subjects possíveis (modelos do Prisma + 'all')
export type Subject =
  | 'all' // wildcard - todos os subjects
  | 'User'
  | 'Company'
  | 'Membership'
  | 'Role'
  | 'Permission'
  | 'RefreshToken';

// Para uso com condições Prisma
export type PrismaSubjects = {
  User: Prisma.UserWhereInput;
  Company: Prisma.CompanyWhereInput;
  Membership: Prisma.MembershipWhereInput;
  Role: Prisma.RoleWhereInput;
};

export interface RawPermission {
  action: string;
  subject: string;
  conditions?: Record<string, unknown>;
}
```

**Status:** ✅

---

### Task 11.3: Criar AbilityFactory

**Arquivo:** `src/infra/auth/casl/ability.factory.ts`

**Implementação:**
```typescript
import { Injectable } from '@nestjs/common';
import {
  AbilityBuilder,
  createMongoAbility,
  MongoAbility,
  InferSubjects,
} from '@casl/ability';
import { Action, Subject, RawPermission } from './casl.types';

export type AppAbility = MongoAbility<[Action, Subject]>;

@Injectable()
export class AbilityFactory {
  createForPermissions(permissions: RawPermission[]): AppAbility {
    const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

    for (const permission of permissions) {
      const action = permission.action as Action;
      const subject = permission.subject as Subject;

      if (permission.conditions) {
        can(action, subject, permission.conditions);
      } else {
        can(action, subject);
      }
    }

    return build();
  }

  createForOwner(): AppAbility {
    const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);
    can('manage', 'all');
    return build();
  }
}
```

**Commit:** `[FACTBP-API] feat(rbac): add AbilityFactory with CASL`

**Status:** ✅

---

### Task 11.4: Criar AbilityService

**Arquivo:** `src/infra/auth/services/ability.service.ts`

**Implementação:**
```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { AbilityFactory, AppAbility } from '../casl/ability.factory';
import { RawPermission } from '../casl/casl.types';

interface CacheEntry {
  ability: AppAbility;
  permissions: RawPermission[];
  expiresAt: number;
}

@Injectable()
export class AbilityService {
  private cache = new Map<string, CacheEntry>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutos

  constructor(
    private readonly prisma: PrismaService,
    private readonly abilityFactory: AbilityFactory,
  ) {}

  async getAbilityForMembership(membershipId: string): Promise<AppAbility> {
    // Check cache
    const cached = this.cache.get(membershipId);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.ability;
    }

    // Fetch from database
    const membership = await this.prisma.membership.findUnique({
      where: { id: membershipId },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!membership) {
      return this.abilityFactory.createForPermissions([]);
    }

    // Owner tem todas as permissões
    if (membership.isOwner) {
      const ability = this.abilityFactory.createForOwner();
      this.cache.set(membershipId, {
        ability,
        permissions: [{ action: 'manage', subject: 'all' }],
        expiresAt: Date.now() + this.CACHE_TTL,
      });
      return ability;
    }

    // Mapear permissões
    const permissions: RawPermission[] = membership.role.permissions.map(
      (rp) => ({
        action: rp.permission.action,
        subject: rp.permission.subject,
        conditions: rp.permission.conditions as Record<string, unknown> | undefined,
      }),
    );

    const ability = this.abilityFactory.createForPermissions(permissions);

    // Cache
    this.cache.set(membershipId, {
      ability,
      permissions,
      expiresAt: Date.now() + this.CACHE_TTL,
    });

    return ability;
  }

  async getPermissionsForMembership(membershipId: string): Promise<RawPermission[]> {
    const cached = this.cache.get(membershipId);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.permissions;
    }

    // Force fetch
    await this.getAbilityForMembership(membershipId);
    return this.cache.get(membershipId)?.permissions || [];
  }

  invalidateCache(membershipId: string): void {
    this.cache.delete(membershipId);
  }

  invalidateAllCache(): void {
    this.cache.clear();
  }
}
```

**Commit:** `[FACTBP-API] feat(rbac): add AbilityService with caching`

**Status:** ✅

---

### Task 11.5: Criar RequirePermission Decorator

**Arquivo:** `src/infra/http/decorators/require-permission.decorator.ts`

**Implementação:**
```typescript
import { SetMetadata } from '@nestjs/common';
import { Action, Subject } from '@/infra/auth/casl/casl.types';

export const PERMISSION_KEY = 'required_permission';

export interface RequiredPermission {
  action: Action;
  subject: Subject;
}

/**
 * Decorator para exigir permissão em uma rota
 *
 * @example
 * @RequirePermission('read', 'User')
 * @RequirePermission('manage', 'all')
 */
export const RequirePermission = (action: Action, subject: Subject) =>
  SetMetadata(PERMISSION_KEY, { action, subject } as RequiredPermission);
```

**Status:** ✅

---

### Task 11.6: Criar PermissionsGuard

**Arquivo:** `src/infra/http/guards/permissions.guard.ts`

**Implementação:**
```typescript
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AbilityService } from '@/infra/auth/services/ability.service';
import {
  PERMISSION_KEY,
  RequiredPermission,
} from '../decorators/require-permission.decorator';
import { CompanyContext } from '@/application/company/services/company.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly abilityService: AbilityService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.getAllAndOverride<RequiredPermission>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Se não tem @RequirePermission, permite
    if (!requiredPermission) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const company: CompanyContext = request.company;

    if (!company) {
      throw new ForbiddenException('Contexto de empresa não encontrado');
    }

    // Buscar ability do membership
    const ability = await this.abilityService.getAbilityForMembership(
      company.membershipId,
    );

    // Verificar permissão
    const canDo = ability.can(requiredPermission.action, requiredPermission.subject);

    if (!canDo) {
      throw new ForbiddenException(
        `Sem permissão para ${requiredPermission.action} em ${requiredPermission.subject}`,
      );
    }

    return true;
  }
}
```

**Commit:** `[FACTBP-API] feat(rbac): add PermissionsGuard`

**Status:** ✅

---

### Task 11.7: Criar CaslModule

**Arquivo:** `src/infra/auth/casl/casl.module.ts`

**Implementação:**
```typescript
import { Module, Global } from '@nestjs/common';
import { AbilityFactory } from './ability.factory';
import { AbilityService } from '../services/ability.service';
import { PermissionsGuard } from '@/infra/http/guards/permissions.guard';

@Global()
@Module({
  providers: [AbilityFactory, AbilityService, PermissionsGuard],
  exports: [AbilityFactory, AbilityService, PermissionsGuard],
})
export class CaslModule {}
```

**Commit:** `[FACTBP-API] feat(rbac): add CaslModule`

**Status:** ✅

---

## Uso

```typescript
@Controller('users')
@UseGuards(JwtAuthGuard, CompanyGuard, PermissionsGuard)
export class UsersController {
  @Get()
  @RequirePermission('read', 'User')
  findAll() {
    // Só executa se user tem permissão read:User
  }

  @Post()
  @RequirePermission('create', 'User')
  create(@Body() dto: CreateUserDto) {
    // Só executa se user tem permissão create:User
  }

  @Delete(':id')
  @RequirePermission('delete', 'User')
  remove(@Param('id') id: string) {
    // Só executa se user tem permissão delete:User
  }
}
```

---

## Permissões no Banco

Seed inicial já cria:

```sql
-- Permissions
INSERT INTO permissions (action, subject) VALUES
  ('manage', 'all'),      -- Owner: pode tudo
  ('read', 'User'),
  ('create', 'User'),
  ('update', 'User'),
  ('delete', 'User'),
  ('read', 'Company'),
  ('update', 'Company'),
  -- ... etc
```

---

## Critérios de Aceite

- [x] CASL instalado e configurado
- [x] AbilityService carrega permissões do banco
- [x] Cache de 5 minutos funciona
- [x] @RequirePermission decorator funciona
- [x] PermissionsGuard valida permissões
- [x] Owner (isOwner=true) tem todas as permissões
- [x] Error FORBIDDEN para sem permissão

---

*Task de [Sprint 3](../sprint-03.md)*
