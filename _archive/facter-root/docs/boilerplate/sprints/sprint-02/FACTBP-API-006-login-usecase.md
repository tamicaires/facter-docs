# [FACTBP-API-006] Login Use Case

> Implementar login com email/senha retornando tokens.

---

## Status: ✅ Concluído (2025-12-15)

## Contexto

**Problemas do Facter Truck que estamos resolvendo:**
- ❌ 2 queries no login → ✅ 1 query otimizada
- ❌ Não verifica isActive → ✅ Verifica user.isActive
- ❌ Token com todas as roles → ✅ Token mínimo
- ❌ Sem refresh token → ✅ Retorna par de tokens

**Endpoint (conforme docs/facter-techcare/api/auth.md):**
```
POST /auth/login
```

---

## Tasks

### Task 6.1: Criar LoginDTO

**Arquivo:** `src/application/auth/dto/login.dto.ts`

**Implementação:**
```typescript
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  password: string;
}
```

**Status:** ⏳

---

### Task 6.2: Criar TokenResponseDTO

**Arquivo:** `src/application/auth/dto/token-response.dto.ts`

**Descrição:** Response padrão de autenticação (conforme documentação).

**Implementação:**
```typescript
export class MembershipDto {
  id: string;
  companyId: string;
  companyName: string;
  role: string;
  isOwner: boolean;
}

export class UserResponseDto {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  memberships: MembershipDto[];
}

export class TokenResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserResponseDto;
}
```

**Status:** ⏳

---

### Task 6.3: Criar LoginUseCase

**Arquivo:** `src/application/auth/use-cases/login.use-case.ts`

**Fluxo:**
```
Input: { email, password }
   │
   ├─▶ Find user by email (1 query com memberships)
   ├─▶ Check user exists
   ├─▶ Check user.isActive
   ├─▶ Verify password
   ├─▶ Create refresh token (DB)
   ├─▶ Generate token pair
   └─▶ Return { accessToken, refreshToken, expiresIn, user }
```

**Implementação:**
```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { PasswordService } from '@/infra/auth/services/password.service';
import { TokenService } from '@/infra/auth/services/token.service';
import { RefreshTokenService } from '@/infra/auth/services/refresh-token.service';
import { InvalidCredentialsException, UserNotFoundException } from '@/core/exceptions';
import { LoginDto } from '../dto/login.dto';
import { TokenResponseDto, UserResponseDto, MembershipDto } from '../dto/token-response.dto';

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  async execute(dto: LoginDto): Promise<TokenResponseDto> {
    // 1. Buscar usuário com memberships em UMA query
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        memberships: {
          where: { isActive: true },
          include: {
            company: true,
            role: true,
          },
        },
      },
    });

    // 2. Verificar se usuário existe
    if (!user) {
      throw new InvalidCredentialsException();
    }

    // 3. Verificar se usuário está ativo
    if (!user.isActive) {
      throw new InvalidCredentialsException();
    }

    // 4. Verificar senha
    const isPasswordValid = await this.passwordService.compare(
      dto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
    }

    // 5. Criar refresh token no banco
    const { id: refreshTokenId, token: refreshTokenValue } =
      await this.refreshTokenService.create(user.id);

    // 6. Gerar par de tokens
    const tokenPair = await this.tokenService.generateTokenPair(
      user.id,
      user.email,
      refreshTokenId,
    );

    // 7. Mapear memberships
    const memberships: MembershipDto[] = user.memberships.map((m) => ({
      id: m.id,
      companyId: m.companyId,
      companyName: m.company.name,
      role: m.role.name,
      isOwner: m.isOwner,
    }));

    // 8. Montar response
    const userResponse: UserResponseDto = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      memberships,
    };

    return {
      accessToken: tokenPair.accessToken,
      refreshToken: refreshTokenValue,
      expiresIn: tokenPair.expiresIn,
      user: userResponse,
    };
  }
}
```

**Commit:** `[FACTBP-API] feat(auth): implement LoginUseCase`

**Status:** ⏳

---

## Response Format

**Sucesso (200):**
```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "a1b2c3d4e5f6...",
    "expiresIn": 900,
    "user": {
      "id": "clxx...",
      "email": "usuario@email.com",
      "name": "João Silva",
      "avatar": null,
      "memberships": [
        {
          "id": "clxx...",
          "companyId": "clxx...",
          "companyName": "Empresa LTDA",
          "role": "owner",
          "isOwner": true
        }
      ]
    }
  }
}
```

**Erro (401):**
```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Email ou senha inválidos"
  }
}
```

---

## Critérios de Aceite

- [ ] Login com email/senha funciona
- [ ] Apenas 1 query no banco (user + memberships)
- [ ] Verifica user.isActive
- [ ] Retorna accessToken + refreshToken
- [ ] expiresIn em segundos
- [ ] Memberships incluídas na response
- [ ] Error INVALID_CREDENTIALS para credenciais erradas

---

*Task de [Sprint 2](../sprint-02.md)*
