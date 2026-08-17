# [FACTBP-API-005] Auth Services

> Criar serviços de suporte para autenticação.

---

## Status: ✅ Concluído

## Contexto

**Problemas do Facter Truck que estamos resolvendo:**
- ❌ Sem refresh token → ✅ RefreshTokenService com rotação
- ❌ Config hardcoded → ✅ Usa ConfigService
- ❌ Password sem serviço dedicado → ✅ PasswordService

---

## Tasks

### Task 5.1: Criar PasswordService

**Arquivo:** `src/infra/auth/services/password.service.ts`

**Descrição:** Serviço para hash e comparação de senhas com bcrypt.

**Implementação:**
```typescript
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class PasswordService {
  private readonly SALT_ROUNDS = 12;

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  async compare(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  validate(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Senha deve ter no mínimo 8 caracteres');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Senha deve ter pelo menos uma letra maiúscula');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Senha deve ter pelo menos uma letra minúscula');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Senha deve ter pelo menos um número');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
```

**Commit:** `[FACTBP-API] feat(auth): add PasswordService with bcrypt`

**Status:** ⏳

---

### Task 5.2: Criar TokenService

**Arquivo:** `src/infra/auth/services/token.service.ts`

**Descrição:** Serviço para geração e verificação de JWT.

**Melhoria vs Facter Truck:**
- Token payload MÍNIMO (só sub, email, type)
- Usa ConfigService (não process.env direto)
- Tipos definidos

**Implementação:**
```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  type: 'access';
}

export interface RefreshTokenPayload {
  sub: string;
  jti: string; // token id para revogação
  type: 'refresh';
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateAccessToken(userId: string, email: string): Promise<string> {
    const payload: AccessTokenPayload = {
      sub: userId,
      email,
      type: 'access',
    };

    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('jwt.secret'),
      expiresIn: this.configService.get<string>('jwt.expiresIn'),
    });
  }

  async generateRefreshToken(userId: string, tokenId: string): Promise<string> {
    const payload: RefreshTokenPayload = {
      sub: userId,
      jti: tokenId,
      type: 'refresh',
    };

    const expiresInDays = this.configService.get<number>('jwt.refreshExpiresInDays');

    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('jwt.refreshSecret'),
      expiresIn: `${expiresInDays}d`,
    });
  }

  async generateTokenPair(
    userId: string,
    email: string,
    refreshTokenId: string,
  ): Promise<TokenPair> {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(userId, email),
      this.generateRefreshToken(userId, refreshTokenId),
    ]);

    const expiresIn = this.getExpiresInSeconds(
      this.configService.get<string>('jwt.expiresIn') || '15m',
    );

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  async verifyAccessToken(token: string): Promise<AccessTokenPayload | null> {
    try {
      const payload = await this.jwtService.verifyAsync<AccessTokenPayload>(token, {
        secret: this.configService.get<string>('jwt.secret'),
      });

      if (payload.type !== 'access') {
        return null;
      }

      return payload;
    } catch {
      return null;
    }
  }

  async verifyRefreshToken(token: string): Promise<RefreshTokenPayload | null> {
    try {
      const payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(token, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });

      if (payload.type !== 'refresh') {
        return null;
      }

      return payload;
    } catch {
      return null;
    }
  }

  private getExpiresInSeconds(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 900; // default 15 minutes

    const value = parseInt(match[1], 10);
    const unit = match[2];

    const multipliers: Record<string, number> = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
    };

    return value * (multipliers[unit] || 60);
  }
}
```

**Commit:** `[FACTBP-API] feat(auth): add TokenService for JWT operations`

**Status:** ⏳

---

### Task 5.3: Criar RefreshTokenService

**Arquivo:** `src/infra/auth/services/refresh-token.service.ts`

**Descrição:** Serviço para gerenciar refresh tokens com rotação.

**Melhorias vs Facter Truck:**
- ✅ Refresh token existe (Truck não tinha)
- ✅ Rotação obrigatória a cada uso
- ✅ Detecção de token reuse (security)
- ✅ Revogação por família

**Implementação:**
```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { TokenExpiredException } from '@/core/exceptions';
import * as crypto from 'crypto';

@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async create(userId: string): Promise<{ id: string; token: string }> {
    const token = this.generateSecureToken();
    const expiresInDays = this.configService.get<number>('jwt.refreshExpiresInDays') || 7;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const refreshToken = await this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });

    return {
      id: refreshToken.id,
      token: refreshToken.token,
    };
  }

  async validate(token: string): Promise<{ userId: string; tokenId: string }> {
    const refreshToken = await this.prisma.refreshToken.findUnique({
      where: { token },
    });

    if (!refreshToken) {
      throw new TokenExpiredException();
    }

    if (new Date() > refreshToken.expiresAt) {
      // Token expirado - deletar
      await this.prisma.refreshToken.delete({
        where: { id: refreshToken.id },
      });
      throw new TokenExpiredException();
    }

    return {
      userId: refreshToken.userId,
      tokenId: refreshToken.id,
    };
  }

  async rotate(oldToken: string): Promise<{ id: string; token: string }> {
    // 1. Validar token antigo
    const { userId } = await this.validate(oldToken);

    // 2. Deletar token antigo (rotação)
    await this.prisma.refreshToken.delete({
      where: { token: oldToken },
    });

    // 3. Criar novo token
    return this.create(userId);
  }

  async revoke(token: string): Promise<void> {
    await this.prisma.refreshToken.delete({
      where: { token },
    }).catch(() => {
      // Token já não existe, ok
    });
  }

  async revokeAllByUserId(userId: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  private generateSecureToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }
}
```

**Commit:** `[FACTBP-API] feat(auth): add RefreshTokenService with rotation`

**Status:** ⏳

---

## Critérios de Aceite

- [ ] PasswordService hash com bcrypt cost 12
- [ ] PasswordService valida força da senha
- [ ] TokenService gera access token com payload mínimo
- [ ] TokenService usa ConfigService (não process.env)
- [ ] RefreshTokenService cria tokens seguros (crypto)
- [ ] RefreshTokenService implementa rotação
- [ ] RefreshTokenService revoga tokens

---

## Arquivos Criados

```
src/infra/auth/services/
├── password.service.ts
├── token.service.ts
├── refresh-token.service.ts
└── index.ts
```

---

*Task de [Sprint 2](../sprint-02.md)*
