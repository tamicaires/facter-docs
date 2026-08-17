# [FACTBP-API-014] Password Recovery

> Implementar fluxo completo de recuperação de senha (forgot + reset).

---

## Status: ⏳ Pendente

## Contexto

**Fluxo:**
```
1. User solicita reset → POST /auth/forgot-password
2. Sistema gera token único + envia email
3. User clica no link do email
4. User define nova senha → POST /auth/reset-password
```

**Segurança:**
- Token expira em 1 hora
- Token é hash no banco (não armazena plain)
- Invalida todos os refresh tokens após reset
- Rate limiting no endpoint

---

## Tasks

### Task 14.1: Criar PasswordResetToken Model

**Arquivo:** `prisma/schema.prisma` (adicionar)

**Implementação:**
```prisma
model PasswordResetToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("password_reset_tokens")
}
```

**Atualizar User model:**
```prisma
model User {
  // ... existing fields
  passwordResetTokens PasswordResetToken[]
}
```

**Commit:** `[FACTBP-API] feat(database): add PasswordResetToken model`

**Status:** ⏳

---

### Task 14.2: Criar ForgotPasswordUseCase

**Arquivo:** `src/application/auth/use-cases/forgot-password.use-case.ts`

**Implementação:**
```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { MailService } from '@/infra/mail/mail.service';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

export class ForgotPasswordDto {
  email: string;
}

@Injectable()
export class ForgotPasswordUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  async execute(dto: ForgotPasswordDto): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    // Sempre retorna sucesso (não revela se email existe)
    if (!user) {
      return;
    }

    // Invalidar tokens anteriores
    await this.prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    // Gerar novo token
    const plainToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(plainToken)
      .digest('hex');

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hora

    await this.prisma.passwordResetToken.create({
      data: {
        token: hashedToken,
        userId: user.id,
        expiresAt,
      },
    });

    // Enviar email
    const resetUrl = `${this.configService.get('app.frontendUrl')}/reset-password?token=${plainToken}`;

    await this.mailService.send({
      to: user.email,
      subject: 'Recuperação de Senha',
      template: 'reset-password',
      context: {
        name: user.name,
        resetUrl,
        expiresIn: '1 hora',
      },
    });
  }
}
```

**Commit:** `[FACTBP-API] feat(auth): add ForgotPasswordUseCase`

**Status:** ⏳

---

### Task 14.3: Criar ResetPasswordUseCase

**Arquivo:** `src/application/auth/use-cases/reset-password.use-case.ts`

**Implementação:**
```typescript
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { PasswordService } from '@/infra/auth/services/password.service';
import { RefreshTokenService } from '@/infra/auth/services/refresh-token.service';
import * as crypto from 'crypto';

export class ResetPasswordDto {
  token: string;
  password: string;
}

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  async execute(dto: ResetPasswordDto): Promise<void> {
    // Hash do token recebido para comparar com o banco
    const hashedToken = crypto
      .createHash('sha256')
      .update(dto.token)
      .digest('hex');

    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { token: hashedToken },
    });

    if (!resetToken) {
      throw new BadRequestException('Token inválido ou expirado');
    }

    if (resetToken.usedAt) {
      throw new BadRequestException('Token já foi utilizado');
    }

    if (new Date() > resetToken.expiresAt) {
      throw new BadRequestException('Token expirado');
    }

    // Validar força da senha
    const validation = this.passwordService.validate(dto.password);
    if (!validation.valid) {
      throw new BadRequestException(validation.errors.join(', '));
    }

    // Hash da nova senha
    const hashedPassword = await this.passwordService.hash(dto.password);

    // Transaction: atualizar senha + marcar token como usado + revogar refresh tokens
    await this.prisma.$transaction(async (tx) => {
      // Atualizar senha
      await tx.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword },
      });

      // Marcar token como usado
      await tx.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      });
    });

    // Revogar todos os refresh tokens (força re-login)
    await this.refreshTokenService.revokeAllByUserId(resetToken.userId);
  }
}
```

**Commit:** `[FACTBP-API] feat(auth): add ResetPasswordUseCase`

**Status:** ⏳

---

### Task 14.4: Criar ChangePasswordUseCase

**Arquivo:** `src/application/auth/use-cases/change-password.use-case.ts`

**Descrição:** Para usuário logado alterar sua própria senha.

**Implementação:**
```typescript
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { PasswordService } from '@/infra/auth/services/password.service';
import { RefreshTokenService } from '@/infra/auth/services/refresh-token.service';

export class ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

@Injectable()
export class ChangePasswordUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  async execute(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('Usuário não encontrado');
    }

    // Verificar senha atual
    const isCurrentValid = await this.passwordService.compare(
      dto.currentPassword,
      user.password,
    );

    if (!isCurrentValid) {
      throw new BadRequestException('Senha atual incorreta');
    }

    // Validar nova senha
    const validation = this.passwordService.validate(dto.newPassword);
    if (!validation.valid) {
      throw new BadRequestException(validation.errors.join(', '));
    }

    // Hash da nova senha
    const hashedPassword = await this.passwordService.hash(dto.newPassword);

    // Atualizar senha
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Opcional: revogar outros tokens (manter sessão atual)
    // await this.refreshTokenService.revokeAllByUserId(userId);
  }
}
```

**Commit:** `[FACTBP-API] feat(auth): add ChangePasswordUseCase`

**Status:** ⏳

---

### Task 14.5: Adicionar Endpoints no AuthController

**Arquivo:** `src/application/auth/auth.controller.ts` (adicionar)

**Implementação:**
```typescript
// Adicionar imports
import { ForgotPasswordUseCase } from './use-cases/forgot-password.use-case';
import { ResetPasswordUseCase } from './use-cases/reset-password.use-case';
import { ChangePasswordUseCase } from './use-cases/change-password.use-case';

// Adicionar no constructor
constructor(
  // ... existing
  private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
  private readonly resetPasswordUseCase: ResetPasswordUseCase,
  private readonly changePasswordUseCase: ChangePasswordUseCase,
) {}

// Adicionar endpoints

@Post('forgot-password')
@HttpCode(HttpStatus.OK)
async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<{ message: string }> {
  await this.forgotPasswordUseCase.execute(dto);
  return { message: 'Se o email existir, você receberá instruções para recuperação' };
}

@Post('reset-password')
@HttpCode(HttpStatus.OK)
async resetPassword(@Body() dto: ResetPasswordDto): Promise<{ message: string }> {
  await this.resetPasswordUseCase.execute(dto);
  return { message: 'Senha alterada com sucesso' };
}

@Post('change-password')
@HttpCode(HttpStatus.OK)
@UseGuards(JwtAuthGuard)
async changePassword(
  @Body() dto: ChangePasswordDto,
  @CurrentUser('id') userId: string,
): Promise<{ message: string }> {
  await this.changePasswordUseCase.execute(userId, dto);
  return { message: 'Senha alterada com sucesso' };
}
```

**Commit:** `[FACTBP-API] feat(auth): add password recovery endpoints`

**Status:** ⏳

---

### Task 14.6: Criar DTOs com Validação

**Arquivo:** `src/application/auth/dto/password.dto.ts`

**Implementação:**
```typescript
import { IsEmail, IsString, MinLength, Matches } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Email inválido' })
  email: string;
}

export class ResetPasswordDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(8, { message: 'Senha deve ter no mínimo 8 caracteres' })
  @Matches(/[A-Z]/, { message: 'Senha deve ter pelo menos uma letra maiúscula' })
  @Matches(/[a-z]/, { message: 'Senha deve ter pelo menos uma letra minúscula' })
  @Matches(/[0-9]/, { message: 'Senha deve ter pelo menos um número' })
  password: string;
}

export class ChangePasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  @MinLength(8, { message: 'Senha deve ter no mínimo 8 caracteres' })
  @Matches(/[A-Z]/, { message: 'Senha deve ter pelo menos uma letra maiúscula' })
  @Matches(/[a-z]/, { message: 'Senha deve ter pelo menos uma letra minúscula' })
  @Matches(/[0-9]/, { message: 'Senha deve ter pelo menos um número' })
  newPassword: string;
}
```

**Commit:** `[FACTBP-API] feat(auth): add password DTOs with validation`

**Status:** ⏳

---

## Critérios de Aceite

- [ ] POST /auth/forgot-password envia email (não revela se email existe)
- [ ] POST /auth/reset-password funciona com token válido
- [ ] POST /auth/change-password funciona para usuário logado
- [ ] Token de reset expira em 1 hora
- [ ] Token é hash no banco (segurança)
- [ ] Reset password revoga todos os refresh tokens
- [ ] Validação de força da senha funciona

---

## Endpoints

| Método | Endpoint | Auth | Descrição |
|--------|----------|------|-----------|
| POST | `/auth/forgot-password` | ❌ | Solicitar reset |
| POST | `/auth/reset-password` | Token | Redefinir senha |
| POST | `/auth/change-password` | JWT | Alterar senha |

---

## Arquivos a Criar

```
src/
├── application/
│   └── auth/
│       ├── dto/
│       │   └── password.dto.ts
│       └── use-cases/
│           ├── forgot-password.use-case.ts
│           ├── reset-password.use-case.ts
│           └── change-password.use-case.ts
prisma/
└── schema.prisma (adicionar PasswordResetToken)
```

---

*Task de [Sprint 2](../sprint-02.md)*
