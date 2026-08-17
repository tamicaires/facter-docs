# [FACTBP-API-009] Auth Controller & Module

> Criar controller e module de autenticação.

---

## Status: ✅ Concluído

## Contexto

**Endpoints (conforme docs/facter-techcare/api/auth.md):**
```
POST /auth/login     - Login com email/senha
POST /auth/register  - Registro com criação de empresa
POST /auth/refresh   - Renovar tokens
POST /auth/logout    - Logout (revogar refresh token)
GET  /auth/me        - Dados do usuário atual
```

---

## Tasks

### Task 9.1: Criar LogoutUseCase

**Arquivo:** `src/application/auth/use-cases/logout.use-case.ts`

**Implementação:**
```typescript
import { Injectable } from '@nestjs/common';
import { RefreshTokenService } from '@/infra/auth/services/refresh-token.service';

export class LogoutDto {
  refreshToken?: string;
}

@Injectable()
export class LogoutUseCase {
  constructor(
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  async execute(dto: LogoutDto, userId: string): Promise<void> {
    if (dto.refreshToken) {
      // Revogar apenas o token específico
      await this.refreshTokenService.revoke(dto.refreshToken);
    } else {
      // Revogar todos os tokens do usuário
      await this.refreshTokenService.revokeAllByUserId(userId);
    }
  }
}
```

**Status:** ✅

---

### Task 9.2: Criar GetMeUseCase

**Arquivo:** `src/application/auth/use-cases/get-me.use-case.ts`

**Descrição:** Retorna dados do usuário autenticado. Melhoria vs Facter Truck: não expõe todos os dados, apenas os necessários.

**Implementação:**
```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { UserNotFoundException } from '@/core/exceptions';
import { UserResponseDto, MembershipDto } from '../dto/token-response.dto';

@Injectable()
export class GetMeUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
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

    if (!user) {
      throw new UserNotFoundException();
    }

    const memberships: MembershipDto[] = user.memberships.map((m) => ({
      id: m.id,
      companyId: m.companyId,
      companyName: m.company.name,
      role: m.role.name,
      isOwner: m.isOwner,
    }));

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      memberships,
    };
  }
}
```

**Status:** ✅

---

### Task 9.3: Criar AuthController

**Arquivo:** `src/application/auth/auth.controller.ts`

**Implementação:**
```typescript
import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { LoginUseCase } from './use-cases/login.use-case';
import { RegisterUseCase } from './use-cases/register.use-case';
import { RefreshTokenUseCase } from './use-cases/refresh-token.use-case';
import { LogoutUseCase } from './use-cases/logout.use-case';
import { GetMeUseCase } from './use-cases/get-me.use-case';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { TokenResponseDto } from './dto/token-response.dto';
import { JwtAuthGuard } from '@/infra/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/infra/auth/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUseCase: RegisterUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly getMeUseCase: GetMeUseCase,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto): Promise<TokenResponseDto> {
    return this.loginUseCase.execute(dto);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto): Promise<TokenResponseDto> {
    return this.registerUseCase.execute(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshTokenDto): Promise<TokenResponseDto> {
    return this.refreshTokenUseCase.execute(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async logout(
    @Body() dto: { refreshToken?: string },
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    await this.logoutUseCase.execute(dto, userId);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser('id') userId: string) {
    return this.getMeUseCase.execute(userId);
  }
}
```

**Status:** ✅

---

### Task 9.4: Criar CurrentUser Decorator

**Arquivo:** `src/infra/auth/decorators/current-user.decorator.ts`

**Implementação:**
```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return null;
    }

    return data ? user[data] : user;
  },
);
```

**Status:** ✅

---

### Task 9.5: Criar JwtAuthGuard

**Arquivo:** `src/infra/auth/guards/jwt-auth.guard.ts`

**Implementação:**
```typescript
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { TokenService } from '../services/token.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token não fornecido');
    }

    const payload = await this.tokenService.verifyAccessToken(token);

    if (!payload) {
      throw new UnauthorizedException('Token inválido');
    }

    // Adiciona user info ao request
    request.user = {
      id: payload.sub,
      email: payload.email,
    };

    return true;
  }

  private extractTokenFromHeader(request: any): string | null {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : null;
  }
}
```

**Status:** ✅

---

### Task 9.6: Criar AuthModule

**Arquivo:** `src/application/auth/auth.module.ts`

**Implementação:**
```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Controller
import { AuthController } from './auth.controller';

// Use Cases
import { LoginUseCase } from './use-cases/login.use-case';
import { RegisterUseCase } from './use-cases/register.use-case';
import { RefreshTokenUseCase } from './use-cases/refresh-token.use-case';
import { LogoutUseCase } from './use-cases/logout.use-case';
import { GetMeUseCase } from './use-cases/get-me.use-case';

// Services
import { PasswordService } from '@/infra/auth/services/password.service';
import { TokenService } from '@/infra/auth/services/token.service';
import { RefreshTokenService } from '@/infra/auth/services/refresh-token.service';

// Guards
import { JwtAuthGuard } from '@/infra/auth/guards/jwt-auth.guard';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.expiresIn'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    // Use Cases
    LoginUseCase,
    RegisterUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    GetMeUseCase,

    // Services
    PasswordService,
    TokenService,
    RefreshTokenService,

    // Guards
    JwtAuthGuard,
  ],
  exports: [
    TokenService,
    PasswordService,
    JwtAuthGuard,
  ],
})
export class AuthModule {}
```

**Commit:** `[FACTBP-API] feat(auth): add AuthController and AuthModule`

**Status:** ✅

---

## Estrutura Final Sprint 2

```
src/
├── application/
│   └── auth/
│       ├── auth.controller.ts
│       ├── auth.module.ts
│       ├── dto/
│       │   ├── login.dto.ts
│       │   ├── register.dto.ts
│       │   ├── refresh-token.dto.ts
│       │   └── token-response.dto.ts
│       └── use-cases/
│           ├── login.use-case.ts
│           ├── register.use-case.ts
│           ├── refresh-token.use-case.ts
│           ├── logout.use-case.ts
│           └── get-me.use-case.ts
└── infra/
    └── auth/
        ├── decorators/
        │   └── current-user.decorator.ts
        ├── guards/
        │   └── jwt-auth.guard.ts
        └── services/
            ├── password.service.ts
            ├── token.service.ts
            ├── refresh-token.service.ts
            └── index.ts
```

---

## Critérios de Aceite

- [x] Todos os endpoints de auth funcionam
- [x] Guards protegem rotas autenticadas
- [x] CurrentUser decorator funciona
- [x] Module exporta serviços necessários
- [x] Responses seguem formato padrão

---

*Task de [Sprint 2](../sprint-02.md)*
