# [FACTBP-API-012] Switch Company

> Permitir usuário trocar de empresa ativa.

---

## Status: ✅ Concluído (2025-12-16)

## Contexto

**Endpoint (conforme docs/facter-techcare/api/auth.md):**
```
POST /auth/switch-company
```

**Fluxo:**
1. Receber companyId destino
2. Verificar se usuário tem membership ativo
3. Gerar novos tokens (opcional - para invalidar sessão anterior)
4. Retornar dados atualizados

---

## Tasks

### Task 12.1: Criar SwitchCompanyDTO

**Arquivo:** `src/application/auth/dto/switch-company.dto.ts`

**Implementação:**
```typescript
import { IsString, IsUUID, IsNotEmpty } from 'class-validator';

export class SwitchCompanyDto {
  @IsString()
  @IsUUID('4', { message: 'companyId deve ser um UUID válido' })
  @IsNotEmpty({ message: 'companyId é obrigatório' })
  companyId: string;
}
```

**Status:** ✅

---

### Task 12.2: Criar SwitchCompanyUseCase

**Arquivo:** `src/application/auth/use-cases/switch-company.use-case.ts`

**Implementação:**
```typescript
import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { TokenService } from '@/infra/auth/services/token.service';
import { RefreshTokenService } from '@/infra/auth/services/refresh-token.service';
import { SwitchCompanyDto } from '../dto/switch-company.dto';
import { TokenResponseDto, UserResponseDto, MembershipDto } from '../dto/token-response.dto';

export interface SwitchCompanyResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  currentCompany: {
    id: string;
    name: string;
    slug: string;
    role: string;
    isOwner: boolean;
  };
}

@Injectable()
export class SwitchCompanyUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  async execute(
    dto: SwitchCompanyDto,
    userId: string,
    currentRefreshToken?: string,
  ): Promise<SwitchCompanyResult> {
    // 1. Verificar se usuário tem membership ativo na empresa destino
    const membership = await this.prisma.membership.findFirst({
      where: {
        userId,
        companyId: dto.companyId,
        isActive: true,
      },
      include: {
        company: true,
        role: true,
      },
    });

    if (!membership) {
      throw new ForbiddenException('Você não tem acesso a esta empresa');
    }

    // 2. Revogar refresh token atual (se fornecido)
    if (currentRefreshToken) {
      await this.refreshTokenService.revoke(currentRefreshToken);
    }

    // 3. Buscar dados do usuário
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ForbiddenException('Usuário não encontrado');
    }

    // 4. Criar novo refresh token
    const { id: refreshTokenId, token: refreshTokenValue } =
      await this.refreshTokenService.create(userId);

    // 5. Gerar novo par de tokens
    const tokenPair = await this.tokenService.generateTokenPair(
      userId,
      user.email,
      refreshTokenId,
    );

    return {
      accessToken: tokenPair.accessToken,
      refreshToken: refreshTokenValue,
      expiresIn: tokenPair.expiresIn,
      currentCompany: {
        id: membership.companyId,
        name: membership.company.name,
        slug: membership.company.slug,
        role: membership.role.name,
        isOwner: membership.isOwner,
      },
    };
  }
}
```

**Commit:** `[FACTBP-API] feat(company): implement SwitchCompanyUseCase`

**Status:** ✅

---

### Task 12.3: Adicionar Endpoint no AuthController

**Arquivo:** `src/application/auth/auth.controller.ts` (atualização)

**Adicionar:**
```typescript
import { SwitchCompanyUseCase } from './use-cases/switch-company.use-case';
import { SwitchCompanyDto } from './dto/switch-company.dto';

// ... no constructor
constructor(
  // ... existing
  private readonly switchCompanyUseCase: SwitchCompanyUseCase,
) {}

// ... novo endpoint
@Post('switch-company')
@HttpCode(HttpStatus.OK)
@UseGuards(JwtAuthGuard)
async switchCompany(
  @Body() dto: SwitchCompanyDto,
  @CurrentUser('id') userId: string,
  @Body('refreshToken') refreshToken?: string,
) {
  return this.switchCompanyUseCase.execute(dto, userId, refreshToken);
}
```

**Commit:** `[FACTBP-API] feat(auth): add switch-company endpoint`

**Status:** ✅

---

## Response Format

**Sucesso (200):**
```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "novo-token...",
    "expiresIn": 900,
    "currentCompany": {
      "id": "clxx...",
      "name": "Outra Empresa",
      "slug": "outra-empresa",
      "role": "admin",
      "isOwner": false
    }
  }
}
```

**Erro (403 - Forbidden):**
```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Você não tem acesso a esta empresa"
  }
}
```

---

## Critérios de Aceite

- [x] Switch funciona entre empresas do usuário
- [x] Novos tokens são gerados
- [x] Refresh token antigo é revogado (se fornecido)
- [x] Retorna dados da nova empresa
- [x] Error FORBIDDEN para empresa sem acesso

---

*Task de [Sprint 3](../sprint-03.md)*
