# [FACTBP-API-010] Company Guard

> Guard que valida header X-Company-ID e verifica acesso do usuário.

---

## Status: ✅ Concluído (2025-12-16)

## Contexto

**Multi-tenancy via header:**
- Todas as rotas que precisam de contexto de empresa requerem `X-Company-ID`
- Guard valida se usuário tem membership ativo na empresa
- Empresa é anexada ao request para uso nos controllers

**Fluxo:**
```
Request com header X-Company-ID
   │
   ├─▶ Extract companyId from header
   ├─▶ Find membership (userId + companyId)
   ├─▶ Check membership.isActive
   ├─▶ Attach company + membership to request
   └─▶ Allow/Deny
```

---

## Tasks

### Task 10.1: Criar CompanyService

**Arquivo:** `src/application/company/services/company.service.ts`

**Implementação:**
```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infra/database/prisma/prisma.service';

export interface CompanyContext {
  companyId: string;
  companyName: string;
  companySlug: string;
  membershipId: string;
  roleId: string;
  roleName: string;
  isOwner: boolean;
}

@Injectable()
export class CompanyService {
  constructor(private readonly prisma: PrismaService) {}

  async getMembershipContext(
    userId: string,
    companyId: string,
  ): Promise<CompanyContext | null> {
    const membership = await this.prisma.membership.findFirst({
      where: {
        userId,
        companyId,
        isActive: true,
      },
      include: {
        company: true,
        role: true,
      },
    });

    if (!membership) {
      return null;
    }

    return {
      companyId: membership.companyId,
      companyName: membership.company.name,
      companySlug: membership.company.slug,
      membershipId: membership.id,
      roleId: membership.roleId,
      roleName: membership.role.name,
      isOwner: membership.isOwner,
    };
  }

  async userHasAccessToCompany(
    userId: string,
    companyId: string,
  ): Promise<boolean> {
    const membership = await this.prisma.membership.findFirst({
      where: {
        userId,
        companyId,
        isActive: true,
      },
    });

    return !!membership;
  }

  async getCompanyById(companyId: string) {
    return this.prisma.company.findUnique({
      where: { id: companyId },
    });
  }

  async getCompanyBySlug(slug: string) {
    return this.prisma.company.findUnique({
      where: { slug },
    });
  }
}
```

**Commit:** `[FACTBP-API] feat(company): add CompanyService`

**Status:** ✅

---

### Task 10.2: Criar CompanyGuard

**Arquivo:** `src/infra/http/guards/company.guard.ts`

**Implementação:**
```typescript
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CompanyService } from '@/application/company/services/company.service';

export const COMPANY_OPTIONAL_KEY = 'company:optional';

@Injectable()
export class CompanyGuard implements CanActivate {
  constructor(
    private readonly companyService: CompanyService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    // Verificar se company é opcional nesta rota
    const isOptional = this.reflector.getAllAndOverride<boolean>(
      COMPANY_OPTIONAL_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Extrair company ID do header
    const companyId = request.headers['x-company-id'];

    if (!companyId) {
      if (isOptional) {
        return true;
      }
      throw new BadRequestException('Header X-Company-ID é obrigatório');
    }

    // Validar UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(companyId)) {
      throw new BadRequestException('X-Company-ID inválido');
    }

    // Buscar contexto de membership
    const companyContext = await this.companyService.getMembershipContext(
      user.id,
      companyId,
    );

    if (!companyContext) {
      throw new ForbiddenException('Você não tem acesso a esta empresa');
    }

    // Anexar contexto ao request
    request.company = companyContext;

    return true;
  }
}
```

**Commit:** `[FACTBP-API] feat(company): add CompanyGuard for X-Company-ID validation`

**Status:** ✅

---

### Task 10.3: Criar CurrentCompany Decorator

**Arquivo:** `src/infra/http/decorators/current-company.decorator.ts`

**Implementação:**
```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CompanyContext } from '@/application/company/services/company.service';

export const CurrentCompany = createParamDecorator(
  (data: keyof CompanyContext | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const company: CompanyContext = request.company;

    if (!company) {
      return null;
    }

    return data ? company[data] : company;
  },
);
```

**Status:** ✅

---

### Task 10.4: Criar CompanyOptional Decorator

**Arquivo:** `src/infra/http/decorators/company-optional.decorator.ts`

**Implementação:**
```typescript
import { SetMetadata } from '@nestjs/common';
import { COMPANY_OPTIONAL_KEY } from '../guards/company.guard';

export const CompanyOptional = () => SetMetadata(COMPANY_OPTIONAL_KEY, true);
```

**Status:** ✅

---

### Task 10.5: Criar CompanyModule

**Arquivo:** `src/application/company/company.module.ts`

**Implementação:**
```typescript
import { Module, Global } from '@nestjs/common';
import { CompanyService } from './services/company.service';
import { CompanyGuard } from '@/infra/http/guards/company.guard';

@Global()
@Module({
  providers: [CompanyService, CompanyGuard],
  exports: [CompanyService, CompanyGuard],
})
export class CompanyModule {}
```

**Commit:** `[FACTBP-API] feat(company): add CompanyModule`

**Status:** ✅

---

## Uso

```typescript
@Controller('users')
@UseGuards(JwtAuthGuard, CompanyGuard)
export class UsersController {
  @Get()
  findAll(@CurrentCompany() company: CompanyContext) {
    // company.companyId, company.roleName, etc
  }

  @Get('profile')
  @CompanyOptional()
  getProfile(@CurrentCompany() company?: CompanyContext) {
    // company pode ser undefined
  }
}
```

---

## Critérios de Aceite

- [x] Header X-Company-ID é extraído e validado
- [x] Verifica se usuário tem membership ativo
- [x] Contexto da empresa anexado ao request
- [x] @CurrentCompany decorator funciona
- [x] @CompanyOptional permite rotas sem empresa
- [x] Error FORBIDDEN para acesso negado

---

*Task de [Sprint 3](../sprint-03.md)*
