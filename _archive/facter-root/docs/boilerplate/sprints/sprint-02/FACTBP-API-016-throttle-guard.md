# [FACTBP-API-016] Throttle Guard (Rate Limiting)

> Implementar rate limiting para proteção contra brute force.

---

## Status: ⏳ Pendente

## Contexto

**Problema:**
- Ataques de brute force em login
- Ataques de força bruta em forgot-password
- DDoS em endpoints públicos

**Solução:**
- Rate limiting por IP
- Limitação mais restrita em endpoints de auth
- Uso do @nestjs/throttler

---

## Tasks

### Task 16.1: Instalar Dependências

**Comando:**
```bash
pnpm add @nestjs/throttler
```

**Commit:** `[FACTBP-API] chore(deps): add @nestjs/throttler`

**Status:** ⏳

---

### Task 16.2: Criar Configuração de Throttle

**Arquivo:** `src/config/throttle.config.ts`

**Implementação:**
```typescript
import { registerAs } from '@nestjs/config';

export default registerAs('throttle', () => ({
  // Limite global: 100 requests por minuto por IP
  global: {
    ttl: parseInt(process.env.THROTTLE_TTL || '60000', 10), // 1 minuto em ms
    limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
  },
  // Limite para auth: 5 requests por minuto por IP
  auth: {
    ttl: parseInt(process.env.THROTTLE_AUTH_TTL || '60000', 10),
    limit: parseInt(process.env.THROTTLE_AUTH_LIMIT || '5', 10),
  },
  // Limite para forgot-password: 3 requests por 5 minutos por IP
  forgotPassword: {
    ttl: parseInt(process.env.THROTTLE_FORGOT_TTL || '300000', 10), // 5 minutos
    limit: parseInt(process.env.THROTTLE_FORGOT_LIMIT || '3', 10),
  },
}));
```

**Commit:** `[FACTBP-API] feat(config): add throttle configuration`

**Status:** ⏳

---

### Task 16.3: Configurar ThrottlerModule

**Arquivo:** `src/app.module.ts` (atualizar)

**Implementação:**
```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import throttleConfig from './config/throttle.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [throttleConfig],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            name: 'global',
            ttl: configService.get<number>('throttle.global.ttl'),
            limit: configService.get<number>('throttle.global.limit'),
          },
        ],
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    // Aplica rate limiting globalmente
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
```

**Commit:** `[FACTBP-API] feat(security): configure global rate limiting`

**Status:** ⏳

---

### Task 16.4: Criar Custom Auth Throttle Guard

**Arquivo:** `src/infra/http/guards/auth-throttle.guard.ts`

**Descrição:** Guard específico para endpoints de auth com limite mais restrito.

**Implementação:**
```typescript
import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerException } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthThrottleGuard extends ThrottlerGuard {
  constructor(private readonly configService: ConfigService) {
    super();
  }

  protected async getTracker(req: Record<string, any>): Promise<string> {
    // Usa IP como tracker
    return req.ip;
  }

  protected async handleRequest(
    context: ExecutionContext,
    limit: number,
    ttl: number,
  ): Promise<boolean> {
    // Override com configuração específica para auth
    const authLimit = this.configService.get<number>('throttle.auth.limit');
    const authTtl = this.configService.get<number>('throttle.auth.ttl');

    return super.handleRequest(context, authLimit || limit, authTtl || ttl);
  }

  protected throwThrottlingException(): void {
    throw new ThrottlerException(
      'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.',
    );
  }
}
```

**Commit:** `[FACTBP-API] feat(security): add AuthThrottleGuard`

**Status:** ⏳

---

### Task 16.5: Criar ForgotPassword Throttle Guard

**Arquivo:** `src/infra/http/guards/forgot-password-throttle.guard.ts`

**Descrição:** Guard específico para forgot-password com limite ainda mais restrito.

**Implementação:**
```typescript
import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerException } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ForgotPasswordThrottleGuard extends ThrottlerGuard {
  constructor(private readonly configService: ConfigService) {
    super();
  }

  protected async getTracker(req: Record<string, any>): Promise<string> {
    // Usa IP + email como tracker (se disponível)
    const email = req.body?.email || '';
    return `${req.ip}:${email}`;
  }

  protected async handleRequest(
    context: ExecutionContext,
    limit: number,
    ttl: number,
  ): Promise<boolean> {
    const forgotLimit = this.configService.get<number>('throttle.forgotPassword.limit');
    const forgotTtl = this.configService.get<number>('throttle.forgotPassword.ttl');

    return super.handleRequest(context, forgotLimit || limit, forgotTtl || ttl);
  }

  protected throwThrottlingException(): void {
    throw new ThrottlerException(
      'Muitas solicitações de recuperação de senha. Aguarde alguns minutos.',
    );
  }
}
```

**Commit:** `[FACTBP-API] feat(security): add ForgotPasswordThrottleGuard`

**Status:** ⏳

---

### Task 16.6: Aplicar Guards nos Endpoints de Auth

**Arquivo:** `src/application/auth/auth.controller.ts` (atualizar)

**Implementação:**
```typescript
import { UseGuards } from '@nestjs/common';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { AuthThrottleGuard } from '@/infra/http/guards/auth-throttle.guard';
import { ForgotPasswordThrottleGuard } from '@/infra/http/guards/forgot-password-throttle.guard';

@Controller('auth')
export class AuthController {
  @Post('login')
  @UseGuards(AuthThrottleGuard)
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto): Promise<TokenResponseDto> {
    return this.loginUseCase.execute(dto);
  }

  @Post('register')
  @UseGuards(AuthThrottleGuard)
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto): Promise<TokenResponseDto> {
    return this.registerUseCase.execute(dto);
  }

  @Post('forgot-password')
  @UseGuards(ForgotPasswordThrottleGuard)
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<{ message: string }> {
    await this.forgotPasswordUseCase.execute(dto);
    return { message: 'Se o email existir, você receberá instruções' };
  }

  @Post('refresh')
  @SkipThrottle() // Refresh não precisa de throttle restrito
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshTokenDto): Promise<TokenResponseDto> {
    return this.refreshTokenUseCase.execute(dto);
  }

  // ... outros endpoints
}
```

**Commit:** `[FACTBP-API] feat(auth): apply rate limiting to auth endpoints`

**Status:** ⏳

---

### Task 16.7: Criar Login Attempt Tracking (Opcional)

**Arquivo:** `src/infra/auth/services/login-attempt.service.ts`

**Descrição:** Rastrear tentativas de login falhas por email para bloqueio temporário.

**Implementação:**
```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infra/database/prisma/prisma.service';

interface AttemptCache {
  count: number;
  lockedUntil?: Date;
}

@Injectable()
export class LoginAttemptService {
  private attempts = new Map<string, AttemptCache>();
  private readonly MAX_ATTEMPTS = 5;
  private readonly LOCK_DURATION = 15 * 60 * 1000; // 15 minutos

  isLocked(email: string): boolean {
    const attempt = this.attempts.get(email);
    if (!attempt?.lockedUntil) return false;

    if (new Date() > attempt.lockedUntil) {
      this.attempts.delete(email);
      return false;
    }

    return true;
  }

  recordFailedAttempt(email: string): void {
    const attempt = this.attempts.get(email) || { count: 0 };
    attempt.count++;

    if (attempt.count >= this.MAX_ATTEMPTS) {
      attempt.lockedUntil = new Date(Date.now() + this.LOCK_DURATION);
    }

    this.attempts.set(email, attempt);
  }

  resetAttempts(email: string): void {
    this.attempts.delete(email);
  }

  getRemainingAttempts(email: string): number {
    const attempt = this.attempts.get(email);
    return this.MAX_ATTEMPTS - (attempt?.count || 0);
  }

  getLockExpiration(email: string): Date | null {
    return this.attempts.get(email)?.lockedUntil || null;
  }
}
```

**Commit:** `[FACTBP-API] feat(security): add login attempt tracking`

**Status:** ⏳

---

## Critérios de Aceite

- [ ] Rate limiting global aplicado (100 req/min)
- [ ] Rate limiting de auth aplicado (5 req/min)
- [ ] Rate limiting de forgot-password aplicado (3 req/5min)
- [ ] Mensagens de erro claras quando limitado
- [ ] Configuração via env vars
- [ ] Login attempt tracking funciona

---

## Arquivos a Criar

```
src/
├── config/
│   └── throttle.config.ts
└── infra/
    ├── http/
    │   └── guards/
    │       ├── auth-throttle.guard.ts
    │       └── forgot-password-throttle.guard.ts
    └── auth/
        └── services/
            └── login-attempt.service.ts
```

---

## Environment Variables

```bash
# .env.example
THROTTLE_TTL=60000
THROTTLE_LIMIT=100
THROTTLE_AUTH_TTL=60000
THROTTLE_AUTH_LIMIT=5
THROTTLE_FORGOT_TTL=300000
THROTTLE_FORGOT_LIMIT=3
```

---

*Task de [Sprint 2](../sprint-02.md)*
