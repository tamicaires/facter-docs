# [FACTBP-API-008] Refresh Token Use Case

> Implementar rotação de refresh token com segurança.

---

## Status: ✅ Concluído

## Contexto

**Problemas do Facter Truck que estamos resolvendo:**
- ❌ Sem refresh token → ✅ Refresh token com rotação
- ❌ Token único sem revogação → ✅ Token rotacionado a cada uso
- ❌ Sem detecção de reuse → ✅ Detecta tentativa de reuso

**Endpoint (conforme docs/facter-techcare/api/auth.md):**
```
POST /auth/refresh
```

**Fluxo:**
1. Validar refresh token
2. Verificar se não foi usado (reuse detection)
3. Revogar token antigo
4. Criar novo refresh token
5. Gerar novo par de tokens
6. Retornar tokens

---

## Tasks

### Task 8.1: Criar RefreshTokenDTO

**Arquivo:** `src/application/auth/dto/refresh-token.dto.ts`

**Implementação:**
```typescript
import { IsString, IsNotEmpty } from 'class-validator';

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty({ message: 'Refresh token é obrigatório' })
  refreshToken: string;
}
```

**Status:** ✅

---

### Task 8.2: Criar RefreshTokenUseCase

**Arquivo:** `src/application/auth/use-cases/refresh-token.use-case.ts`

**Implementação:**
```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { TokenService } from '@/infra/auth/services/token.service';
import { RefreshTokenService } from '@/infra/auth/services/refresh-token.service';
import { TokenExpiredException } from '@/core/exceptions';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { TokenResponseDto, UserResponseDto, MembershipDto } from '../dto/token-response.dto';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  async execute(dto: RefreshTokenDto): Promise<TokenResponseDto> {
    // 1. Rotacionar token (valida + deleta antigo + cria novo)
    const { id: newRefreshTokenId, token: newRefreshTokenValue } =
      await this.refreshTokenService.rotate(dto.refreshToken);

    // 2. Buscar dados do novo token para pegar userId
    const refreshToken = await this.prisma.refreshToken.findUnique({
      where: { id: newRefreshTokenId },
      include: {
        user: {
          include: {
            memberships: {
              where: { isActive: true },
              include: {
                company: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!refreshToken || !refreshToken.user) {
      throw new TokenExpiredException();
    }

    const { user } = refreshToken;

    // 3. Verificar se usuário ainda está ativo
    if (!user.isActive) {
      // Revogar token criado e lançar erro
      await this.refreshTokenService.revoke(newRefreshTokenValue);
      throw new TokenExpiredException();
    }

    // 4. Gerar novo par de tokens
    const tokenPair = await this.tokenService.generateTokenPair(
      user.id,
      user.email,
      newRefreshTokenId,
    );

    // 5. Mapear memberships
    const memberships: MembershipDto[] = user.memberships.map((m) => ({
      id: m.id,
      companyId: m.companyId,
      companyName: m.company.name,
      role: m.role.name,
      isOwner: m.isOwner,
    }));

    // 6. Montar response
    const userResponse: UserResponseDto = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      memberships,
    };

    return {
      accessToken: tokenPair.accessToken,
      refreshToken: newRefreshTokenValue,
      expiresIn: tokenPair.expiresIn,
      user: userResponse,
    };
  }
}
```

**Commit:** `[FACTBP-API] feat(auth): implement RefreshTokenUseCase with rotation`

**Status:** ✅

---

## Response Format

**Sucesso (200):**
```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "novo-token-rotacionado...",
    "expiresIn": 900,
    "user": {
      "id": "clxx...",
      "email": "usuario@email.com",
      "name": "João Silva",
      "avatar": null,
      "memberships": [...]
    }
  }
}
```

**Erro (401 - Token Expirado):**
```json
{
  "error": {
    "code": "TOKEN_EXPIRED",
    "message": "Token expirado ou inválido"
  }
}
```

---

## Critérios de Aceite

- [x] Refresh token é rotacionado a cada uso
- [x] Token antigo é invalidado
- [x] Novo par de tokens é gerado
- [x] Verifica user.isActive
- [x] Error TOKEN_EXPIRED para token inválido
- [x] Retorna mesmo formato que login

---

*Task de [Sprint 2](../sprint-02.md)*
