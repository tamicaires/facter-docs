# [FACTBP-WEB-003] Providers Setup

> Configurar providers (Query, Theme, Auth).

---

## Status: ⏳ Pendente

## Contexto

**Providers necessários:**
- **QueryProvider:** TanStack Query para cache e data fetching
- **ThemeProvider:** Tema do @facter/ds-core
- **AuthProvider:** Contexto de autenticação (opcional, pode usar Zustand)

---

## Tasks

### Task 3.1: Instalar Dependências

**Comando:**
```bash
pnpm add @tanstack/react-query @tanstack/react-query-devtools
```

**Status:** ⏳

---

### Task 3.2: Criar QueryProvider

**Arquivo:** `src/providers/query-provider.tsx`

**Implementação:**
```typescript
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type ReactNode } from 'react';

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Não refetch ao focar janela (melhor UX)
            refetchOnWindowFocus: false,
            // Retry apenas 1 vez
            retry: 1,
            // Stale time de 30 segundos
            staleTime: 30 * 1000,
            // Cache time de 5 minutos
            gcTime: 5 * 60 * 1000,
          },
          mutations: {
            // Retry 0 vezes em mutations
            retry: 0,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

**Commit:** `[FACTBP-WEB] feat(providers): add QueryProvider with TanStack Query`

**Status:** ⏳

---

### Task 3.3: Criar ToastProvider

**Arquivo:** `src/providers/toast-provider.tsx`

**Implementação:**
```typescript
'use client';

import { Toaster } from '@facter/ds-core';

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 5000,
        classNames: {
          toast: 'bg-background border-border',
          success: 'text-success border-success/20',
          error: 'text-destructive border-destructive/20',
          warning: 'text-warning border-warning/20',
          info: 'text-info border-info/20',
        },
      }}
    />
  );
}
```

**Status:** ⏳

---

### Task 3.4: Criar AppProviders Wrapper

**Arquivo:** `src/providers/app-providers.tsx`

**Implementação:**
```typescript
'use client';

import { type ReactNode } from 'react';
import { QueryProvider } from './query-provider';
import { ToastProvider } from './toast-provider';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryProvider>
      {children}
      <ToastProvider />
    </QueryProvider>
  );
}
```

**Commit:** `[FACTBP-WEB] feat(providers): add AppProviders wrapper`

**Status:** ⏳

---

### Task 3.5: Atualizar Root Layout

**Arquivo:** `src/app/layout.tsx`

**Implementação:**
```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AppProviders } from '@/providers/app-providers';
import { env } from '@/config/env';

// Importar estilos do DS
import '@facter/ds-core/styles/globals.css';
import '@facter/ds-core/themes/blue.css';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: {
    default: env.NEXT_PUBLIC_APP_NAME,
    template: `%s | ${env.NEXT_PUBLIC_APP_NAME}`,
  },
  description: 'Sistema de gestão empresarial',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
```

**Commit:** `[FACTBP-WEB] chore: integrate providers in root layout`

**Status:** ⏳

---

### Task 3.6: Criar Providers Index

**Arquivo:** `src/providers/index.ts`

**Implementação:**
```typescript
export { AppProviders } from './app-providers';
export { QueryProvider } from './query-provider';
export { ToastProvider } from './toast-provider';
```

**Status:** ⏳

---

## Critérios de Aceite

- [ ] TanStack Query configurado
- [ ] DevTools disponíveis em dev
- [ ] Toaster configurado
- [ ] Layout usa AppProviders
- [ ] Estilos do DS importados

---

*Task de [Sprint 4](../sprint-04.md)*
