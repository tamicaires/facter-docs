# [FACTBP-WEB-001] Estrutura Base

> Organizar estrutura de pastas e arquivos base do frontend.

---

## Status: ✅ Concluído (2025-12-16)

## Contexto

**Estrutura Feature-First:**
- Cada feature é auto-contida
- Componentes globais em `/components`
- Providers na raiz de `/providers`
- Configuração em `/config`

---

## Tasks

### Task 1.1: Criar Estrutura de Pastas

**Estrutura:**
```
src/
├── app/                    # App Router (Next.js)
│   ├── (auth)/            # Grupo: rotas de auth (login, register)
│   ├── (dashboard)/       # Grupo: rotas autenticadas
│   ├── layout.tsx
│   └── page.tsx
├── components/            # Componentes globais
│   ├── ui/               # Re-exports do DS
│   └── common/           # Componentes compartilhados
├── config/               # Configurações
├── features/             # Features da aplicação
│   └── auth/
│       ├── components/
│       ├── hooks/
│       ├── services/
│       ├── stores/
│       ├── types/
│       └── index.ts
├── lib/                  # Utilitários e clients
├── providers/            # React providers
├── styles/               # Estilos globais
└── types/                # Tipos globais
```

**Comando:**
```bash
mkdir -p src/{components/{ui,common},config,features/auth/{components,hooks,services,stores,types},lib,providers,styles,types}
```

**Commit:** `[FACTBP-WEB] chore: setup folder structure`

**Status:** ✅

---

### Task 1.2: Configurar Path Aliases

**Arquivo:** `tsconfig.json`

**Implementação:**
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/features/*": ["./src/features/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/config/*": ["./src/config/*"],
      "@/providers/*": ["./src/providers/*"],
      "@/types/*": ["./src/types/*"],
      "@/styles/*": ["./src/styles/*"]
    }
  }
}
```

**Commit:** `[FACTBP-WEB] chore: configure path aliases`

**Status:** ✅

---

### Task 1.3: Criar Validação de Env

**Arquivo:** `src/config/env.ts`

**Implementação:**
```typescript
import { z } from 'zod';

const envSchema = z.object({
  // API
  NEXT_PUBLIC_API_URL: z.string().url(),

  // Auth
  NEXT_PUBLIC_AUTH_STORAGE_KEY: z.string().default('auth_token'),

  // App
  NEXT_PUBLIC_APP_NAME: z.string().default('Facter'),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),

  // Feature Toggles (opcional - pode vir do backend)
  NEXT_PUBLIC_FEATURES: z.string().optional(),
});

function validateEnv() {
  const parsed = envSchema.safeParse({
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_AUTH_STORAGE_KEY: process.env.NEXT_PUBLIC_AUTH_STORAGE_KEY,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_FEATURES: process.env.NEXT_PUBLIC_FEATURES,
  });

  if (!parsed.success) {
    console.error(
      '❌ Invalid environment variables:',
      JSON.stringify(parsed.error.format(), null, 2),
    );
    throw new Error('Invalid environment variables');
  }

  return parsed.data;
}

export const env = validateEnv();

// Type-safe access
export type Env = z.infer<typeof envSchema>;
```

**Arquivo:** `.env.local.example`

```bash
# API
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Auth
NEXT_PUBLIC_AUTH_STORAGE_KEY=facter_auth_token

# App
NEXT_PUBLIC_APP_NAME=Facter
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Commit:** `[FACTBP-WEB] feat(config): add env validation with Zod`

**Status:** ✅

---

## Critérios de Aceite

- [x] Estrutura de pastas criada
- [x] Path aliases funcionando
- [x] Env vars validadas no startup
- [x] `.env.local.example` criado

---

*Task de [Sprint 4](../sprint-04.md)*
