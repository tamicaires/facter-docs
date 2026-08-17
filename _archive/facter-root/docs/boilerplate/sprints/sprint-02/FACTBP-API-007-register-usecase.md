# [FACTBP-API-007] Register Use Case

> Implementar registro de usuário com criação de empresa.

---

## Status: ✅ Concluído (2025-12-15)

## Contexto

**Endpoint (conforme docs/facter-techcare/api/auth.md):**
```
POST /auth/register
```

**Fluxo:**
1. Criar usuário
2. Criar empresa
3. Criar role "owner" para a empresa
4. Criar membership (user + company + role)
5. Gerar tokens
6. Retornar tudo

---

## Tasks

### Task 7.1: Criar RegisterDTO

**Arquivo:** `src/application/auth/dto/register.dto.ts`

**Implementação:**
```typescript
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  ValidateNested,
  IsOptional,
  Matches,
} from 'class-validator';

export class RegisterUserDto {
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Senha deve ter no mínimo 8 caracteres' })
  @MaxLength(100)
  password: string;

  @IsString()
  @MinLength(2, { message: 'Nome deve ter no mínimo 2 caracteres' })
  @MaxLength(100)
  name: string;
}

export class RegisterCompanyDto {
  @IsString()
  @MinLength(2, { message: 'Nome da empresa deve ter no mínimo 2 caracteres' })
  @MaxLength(100)
  name: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug deve conter apenas letras minúsculas, números e hífens',
  })
  @IsOptional()
  slug?: string;
}

export class RegisterDto {
  @ValidateNested()
  @Type(() => RegisterUserDto)
  user: RegisterUserDto;

  @ValidateNested()
  @Type(() => RegisterCompanyDto)
  company: RegisterCompanyDto;
}
```

**Status:** ⏳

---

### Task 7.2: Criar RegisterUseCase

**Arquivo:** `src/application/auth/use-cases/register.use-case.ts`

**Implementação:**
```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { PasswordService } from '@/infra/auth/services/password.service';
import { TokenService } from '@/infra/auth/services/token.service';
import { RefreshTokenService } from '@/infra/auth/services/refresh-token.service';
import { UserAlreadyExistsException } from '@/core/exceptions';
import { RegisterDto } from '../dto/register.dto';
import { TokenResponseDto, UserResponseDto, MembershipDto } from '../dto/token-response.dto';

@Injectable()
export class RegisterUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  async execute(dto: RegisterDto): Promise<TokenResponseDto> {
    // 1. Verificar se email já existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.user.email },
    });

    if (existingUser) {
      throw new UserAlreadyExistsException();
    }

    // 2. Hash da senha
    const hashedPassword = await this.passwordService.hash(dto.user.password);

    // 3. Gerar slug se não fornecido
    const slug = dto.company.slug || this.generateSlug(dto.company.name);

    // 4. Verificar se slug já existe
    const existingCompany = await this.prisma.company.findUnique({
      where: { slug },
    });

    if (existingCompany) {
      throw new UserAlreadyExistsException(); // TODO: criar CompanySlugExistsException
    }

    // 5. Criar tudo em uma transação
    const result = await this.prisma.$transaction(async (tx) => {
      // Criar usuário
      const user = await tx.user.create({
        data: {
          email: dto.user.email,
          password: hashedPassword,
          name: dto.user.name,
        },
      });

      // Criar empresa
      const company = await tx.company.create({
        data: {
          name: dto.company.name,
          slug,
        },
      });

      // Buscar permission "manage all"
      const manageAllPermission = await tx.permission.findUnique({
        where: { action_subject: { action: 'manage', subject: 'all' } },
      });

      // Criar role "owner" para esta empresa
      const ownerRole = await tx.role.create({
        data: {
          name: 'owner',
          description: 'Proprietário da empresa',
          companyId: company.id,
          isDefault: false,
          permissions: manageAllPermission
            ? {
                create: {
                  permissionId: manageAllPermission.id,
                },
              }
            : undefined,
        },
      });

      // Criar membership
      const membership = await tx.membership.create({
        data: {
          userId: user.id,
          companyId: company.id,
          roleId: ownerRole.id,
          isOwner: true,
        },
        include: {
          company: true,
          role: true,
        },
      });

      return { user, company, membership, ownerRole };
    });

    // 6. Criar refresh token
    const { id: refreshTokenId, token: refreshTokenValue } =
      await this.refreshTokenService.create(result.user.id);

    // 7. Gerar par de tokens
    const tokenPair = await this.tokenService.generateTokenPair(
      result.user.id,
      result.user.email,
      refreshTokenId,
    );

    // 8. Montar response
    const memberships: MembershipDto[] = [
      {
        id: result.membership.id,
        companyId: result.company.id,
        companyName: result.company.name,
        role: result.ownerRole.name,
        isOwner: true,
      },
    ];

    const userResponse: UserResponseDto = {
      id: result.user.id,
      email: result.user.email,
      name: result.user.name,
      avatar: result.user.avatar,
      memberships,
    };

    return {
      accessToken: tokenPair.accessToken,
      refreshToken: refreshTokenValue,
      expiresIn: tokenPair.expiresIn,
      user: userResponse,
    };
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9]+/g, '-') // Substitui não-alfanuméricos por hífen
      .replace(/^-+|-+$/g, ''); // Remove hífens no início/fim
  }
}
```

**Commit:** `[FACTBP-API] feat(auth): implement RegisterUseCase with company creation`

**Status:** ⏳

---

## Response Format

**Sucesso (201):**
```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "a1b2c3d4e5f6...",
    "expiresIn": 900,
    "user": {
      "id": "clxx...",
      "email": "novo@email.com",
      "name": "Maria Santos",
      "avatar": null,
      "memberships": [
        {
          "id": "clxx...",
          "companyId": "clxx...",
          "companyName": "Nova Empresa",
          "role": "owner",
          "isOwner": true
        }
      ]
    }
  }
}
```

**Erro (409 - Conflict):**
```json
{
  "error": {
    "code": "USER_ALREADY_EXISTS",
    "message": "Usuário já existe com este email"
  }
}
```

---

## Critérios de Aceite

- [ ] Registro cria user + company + role + membership
- [ ] Usa transação para atomicidade
- [ ] Hash de senha com bcrypt
- [ ] Gera slug automaticamente se não fornecido
- [ ] Role "owner" criada com permission "manage all"
- [ ] Retorna tokens + user
- [ ] Error USER_ALREADY_EXISTS para email duplicado

---

*Task de [Sprint 2](../sprint-02.md)*
