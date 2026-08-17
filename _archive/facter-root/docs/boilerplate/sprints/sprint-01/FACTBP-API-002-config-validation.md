# [FACTBP-API-002] Configuração com Validação

> Implementar configuração tipada com validação Zod.

---

## Status: ✅ Concluído (2025-12-15)

---

## Tasks

### Task 2.1: Criar env.config.ts

**Arquivo:** `src/config/env.config.ts`

**Descrição:** Schema Zod para validar todas as variáveis de ambiente.

**Implementação:**
```typescript
import { z } from 'zod';

const envSchema = z.object({
  // App
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),

  // Database
  DATABASE_URL: z.string().url(),

  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('15m'),

  // Refresh Token
  REFRESH_TOKEN_SECRET: z.string().min(32).optional(),
  REFRESH_TOKEN_EXPIRES_DAYS: z.coerce.number().default(7),

  // Redis (opcional)
  REDIS_URL: z.string().url().optional(),

  // Frontend URL (para CORS)
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
});

export type EnvConfig = z.infer<typeof envSchema>;

let cachedEnv: EnvConfig | null = null;

export function validateEnv(): EnvConfig {
  if (cachedEnv) return cachedEnv;

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    console.error(result.error.format());
    process.exit(1);
  }

  cachedEnv = result.data;
  return cachedEnv;
}

export function getEnv(): EnvConfig {
  if (!cachedEnv) {
    return validateEnv();
  }
  return cachedEnv;
}
```

**Commit:** `[FACTBP-API] feat(config): add env validation with Zod`

**Status:** ✅

---

### Task 2.2: Criar jwt.config.ts

**Arquivo:** `src/config/jwt.config.ts`

**Descrição:** Configuração específica para JWT.

**Implementação:**
```typescript
import { registerAs } from '@nestjs/config';
import { getEnv } from './env.config';

export const jwtConfig = registerAs('jwt', () => {
  const env = getEnv();

  return {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
    refreshSecret: env.REFRESH_TOKEN_SECRET || env.JWT_SECRET,
    refreshExpiresInDays: env.REFRESH_TOKEN_EXPIRES_DAYS,
  };
});

export type JwtConfig = ReturnType<typeof jwtConfig>;
```

**Commit:** `[FACTBP-API] feat(config): add JWT configuration`

**Status:** ✅

---

### Task 2.3: Criar app.config.ts

**Arquivo:** `src/config/app.config.ts`

**Descrição:** Configuração geral da aplicação.

**Implementação:**
```typescript
import { registerAs } from '@nestjs/config';
import { getEnv } from './env.config';

export const appConfig = registerAs('app', () => {
  const env = getEnv();

  return {
    nodeEnv: env.NODE_ENV,
    port: env.PORT,
    frontendUrl: env.FRONTEND_URL,
    isDevelopment: env.NODE_ENV === 'development',
    isProduction: env.NODE_ENV === 'production',
    isTest: env.NODE_ENV === 'test',
  };
});

export type AppConfig = ReturnType<typeof appConfig>;
```

**Commit:** `[FACTBP-API] feat(config): add app configuration`

**Status:** ✅

---

### Task 2.4: Criar index.ts e integrar ConfigModule

**Arquivo:** `src/config/index.ts`

**Descrição:** Barrel export e função de load para ConfigModule.

**Implementação:**
```typescript
export * from './env.config';
export * from './jwt.config';
export * from './app.config';

import { jwtConfig } from './jwt.config';
import { appConfig } from './app.config';

export const configLoad = [jwtConfig, appConfig];
```

**Uso no AppModule:**
```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configLoad, validateEnv } from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: configLoad,
      validate: validateEnv,
    }),
    // ...
  ],
})
export class AppModule {}
```

**Commit:** `[FACTBP-API] chore(config): integrate NestJS ConfigModule`

**Status:** ✅

---

## Critérios de Aceite

- [x] App não inicia se env vars inválidas
- [x] Mensagem de erro clara indicando var faltante
- [x] ConfigService disponível em toda aplicação
- [x] Tipos corretos para todas as configs

---

## Variáveis de Ambiente

```bash
# .env.example
NODE_ENV=development
PORT=3001

DATABASE_URL=postgresql://facter:facter123@localhost:5432/facter_boilerplate

JWT_SECRET=your-super-secret-jwt-key-minimum-32-chars
JWT_EXPIRES_IN=15m

REFRESH_TOKEN_EXPIRES_DAYS=7

FRONTEND_URL=http://localhost:3000
```

---

*Task de [Sprint 1](../sprint-01.md)*
