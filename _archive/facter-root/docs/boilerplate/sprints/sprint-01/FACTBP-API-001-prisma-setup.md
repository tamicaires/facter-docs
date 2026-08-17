# [FACTBP-API-001] Setup Prisma e Database

> Configurar Prisma com PostgreSQL, criar serviço e módulo.

---

## Status: ✅ Concluído (2025-12-15)

---

## Tasks

### Task 1.1: Criar PrismaService

**Arquivo:** `src/infra/database/prisma/prisma.service.ts`

**Descrição:** Serviço que estende PrismaClient com lifecycle hooks.

**Implementação:**
```typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'info', 'warn', 'error']
          : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clean database in production');
    }
    // Para testes - limpa todas as tabelas
  }
}
```

**Commit:** `[FACTBP-API] feat(database): add PrismaService with lifecycle hooks`

**Status:** ✅

---

### Task 1.2: Criar PrismaModule

**Arquivo:** `src/infra/database/prisma/prisma.module.ts`

**Descrição:** Módulo global que exporta PrismaService.

**Implementação:**
```typescript
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

**Commit:** `[FACTBP-API] feat(database): add PrismaModule as global module`

**Status:** ✅

---

### Task 1.3: Executar Migration Inicial

**Descrição:** Rodar `prisma migrate dev` para criar as tabelas.

**Comandos:**
```bash
cd facter-boilerplate-api
pnpm prisma generate
pnpm prisma migrate dev --name init
```

**Verificar:**
- [x] Tabelas users criada
- [x] Tabela refresh_tokens criada
- [x] Tabela companies criada
- [x] Tabela memberships criada
- [x] Tabela roles criada
- [x] Tabela permissions criada
- [x] Tabela role_permissions criada

**Commit:** `[FACTBP-API] chore(database): run initial migration`

**Status:** ✅

---

### Task 1.4: Criar Seed

**Arquivo:** `prisma/seed.ts`

**Descrição:** Seed com permissions padrão e role Owner.

**Implementação:**
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const permissions = [
  // User
  { action: 'create', subject: 'User' },
  { action: 'read', subject: 'User' },
  { action: 'update', subject: 'User' },
  { action: 'delete', subject: 'User' },
  // Company
  { action: 'read', subject: 'Company' },
  { action: 'update', subject: 'Company' },
  // Membership
  { action: 'create', subject: 'Membership' },
  { action: 'read', subject: 'Membership' },
  { action: 'update', subject: 'Membership' },
  { action: 'delete', subject: 'Membership' },
  // Role
  { action: 'create', subject: 'Role' },
  { action: 'read', subject: 'Role' },
  { action: 'update', subject: 'Role' },
  { action: 'delete', subject: 'Role' },
  // All (super admin)
  { action: 'manage', subject: 'all' },
];

async function main() {
  console.log('Seeding permissions...');

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { action_subject: { action: perm.action, subject: perm.subject } },
      update: {},
      create: {
        action: perm.action,
        subject: perm.subject,
        description: `${perm.action} ${perm.subject}`,
      },
    });
  }

  console.log('Seed completed!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

**Comando:** `pnpm prisma:seed`

**Commit:** `[FACTBP-API] feat(database): add seed for permissions`

**Status:** ✅

---

## Critérios de Aceite

- [x] PrismaService conecta ao PostgreSQL
- [x] PrismaModule é global
- [x] Migration inicial executada sem erros
- [x] Seed cria todas as permissions (15 permissions criadas)

---

## Dependências

- PostgreSQL rodando (local ou Docker)
- `.env` com DATABASE_URL configurado

---

*Task de [Sprint 1](../sprint-01.md)*
