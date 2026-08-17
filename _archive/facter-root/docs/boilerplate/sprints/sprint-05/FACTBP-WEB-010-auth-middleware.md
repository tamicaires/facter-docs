# [FACTBP-WEB-010] Auth Middleware

> Middleware Next.js para proteção de rotas.

---

## Status: ⏳ Pendente

## Contexto

**Next.js Middleware:**
- Executa antes de cada request
- Roda no Edge Runtime
- Pode redirecionar ou modificar response
- Não pode acessar localStorage (roda no servidor)

**Estratégia:**
- Verificar cookie `auth_token` (setado no login)
- Rotas públicas permitidas sem auth
- Rotas privadas requerem token
- Redirect lógico baseado no estado

---

## Tasks

### Task 10.1: Atualizar Auth Storage para Cookies

**Arquivo:** `src/lib/auth-storage.ts` (atualização)

**Adicionar:**
```typescript
import Cookies from 'js-cookie';

const COOKIE_OPTIONS = {
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  expires: 7, // 7 dias
};

// Modificar setStoredToken para também setar cookie
export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
  Cookies.set('auth_token', token, COOKIE_OPTIONS);
}

export function removeStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  Cookies.remove('auth_token');
}

// Modificar clearAuth
export function clearAuth(): void {
  removeStoredToken();
  removeStoredRefreshToken();
  removeStoredCompanyId();
  Cookies.remove('auth_token');
  Cookies.remove('company_id');
}

// Também setar company_id em cookie
export function setStoredCompanyId(companyId: string): void {
  localStorage.setItem(COMPANY_KEY, companyId);
  Cookies.set('company_id', companyId, COOKIE_OPTIONS);
}

export function removeStoredCompanyId(): void {
  localStorage.removeItem(COMPANY_KEY);
  Cookies.remove('company_id');
}
```

**Instalar:**
```bash
pnpm add js-cookie
pnpm add -D @types/js-cookie
```

**Status:** ⏳

---

### Task 10.2: Criar Middleware

**Arquivo:** `src/middleware.ts`

**Implementação:**
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rotas públicas (não requerem autenticação)
const publicRoutes = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
];

// Rotas de auth (não devem ser acessadas se autenticado)
const authRoutes = ['/login', '/register'];

// Rotas que não passam pelo middleware
const ignoredRoutes = [
  '/_next',
  '/api',
  '/favicon.ico',
  '/images',
  '/fonts',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignorar rotas estáticas e API
  if (ignoredRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Verificar token
  const token = request.cookies.get('auth_token')?.value;
  const companyId = request.cookies.get('company_id')?.value;

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route),
  );
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Usuário autenticado tentando acessar rota de auth
  if (token && isAuthRoute) {
    // Se tem empresa selecionada, vai pro dashboard
    if (companyId) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // Senão, vai selecionar empresa
    return NextResponse.redirect(new URL('/select-company', request.url));
  }

  // Usuário não autenticado tentando acessar rota protegida
  if (!token && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url);
    // Salvar URL de destino para redirect após login
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Usuário autenticado sem empresa tentando acessar rota que requer empresa
  if (token && !companyId && !isPublicRoute && pathname !== '/select-company') {
    return NextResponse.redirect(new URL('/select-company', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
```

**Commit:** `[FACTBP-WEB] feat(auth): add Next.js middleware for route protection`

**Status:** ⏳

---

### Task 10.3: Criar Select Company Page

**Arquivo:** `src/app/(auth)/select-company/page.tsx`

**Implementação:**
```typescript
import { Metadata } from 'next';
import { SelectCompanyForm } from '@/features/auth/components/select-company-form';

export const metadata: Metadata = {
  title: 'Selecionar empresa',
  description: 'Selecione a empresa para acessar',
};

export default function SelectCompanyPage() {
  return <SelectCompanyForm />;
}
```

**Arquivo:** `src/features/auth/components/select-company-form.tsx`

```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
} from '@facter/ds-core';
import { useAuth } from '../hooks/use-auth';
import { useSwitchCompany } from '../hooks/use-switch-company';
import { Building2 } from 'lucide-react';
import { ROUTES } from '@/config/routes';

export function SelectCompanyForm() {
  const router = useRouter();
  const { memberships, currentCompanyId, isAuthenticated } = useAuth();
  const { mutate: switchCompany, isPending } = useSwitchCompany();

  // Se já tem empresa selecionada, redireciona
  useEffect(() => {
    if (currentCompanyId) {
      router.push(ROUTES.DASHBOARD);
    }
  }, [currentCompanyId, router]);

  // Se não está autenticado, redireciona
  useEffect(() => {
    if (!isAuthenticated) {
      router.push(ROUTES.LOGIN);
    }
  }, [isAuthenticated, router]);

  // Se tem apenas uma empresa, seleciona automaticamente
  useEffect(() => {
    if (memberships.length === 1) {
      switchCompany(memberships[0].companyId);
    }
  }, [memberships, switchCompany]);

  const handleSelectCompany = (companyId: string) => {
    switchCompany(companyId);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Selecionar empresa</CardTitle>
        <CardDescription>
          Escolha a empresa que deseja acessar
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {memberships.map((membership) => (
          <Button
            key={membership.id}
            variant="outline"
            className="w-full justify-start h-auto py-3 px-4"
            onClick={() => handleSelectCompany(membership.companyId)}
            disabled={isPending}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-medium">{membership.companyName}</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {membership.role}
                  {membership.isOwner && ' (Proprietário)'}
                </p>
              </div>
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
```

**Commit:** `[FACTBP-WEB] feat(auth): add select-company page`

**Status:** ⏳

---

### Task 10.4: Atualizar Login para Callback URL

**Arquivo:** `src/features/auth/hooks/use-login.ts` (atualização)

**Implementação:**
```typescript
import { useSearchParams } from 'next/navigation';

export function useLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      authService.login(credentials),

    onSuccess: (data) => {
      const { accessToken, refreshToken, user } = data;

      setAuth({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
        },
        memberships: user.memberships,
        accessToken,
        refreshToken,
      });

      toast.success('Login realizado com sucesso!');

      // Verificar callbackUrl
      const callbackUrl = searchParams.get('callbackUrl');

      // Redirecionar
      if (user.memberships.length === 1) {
        router.push(callbackUrl || ROUTES.DASHBOARD);
      } else {
        router.push('/select-company');
      }
    },

    onError: (error: any) => {
      const message =
        error.response?.data?.error?.message || 'Erro ao fazer login';
      toast.error(message);
    },
  });
}
```

**Commit:** `[FACTBP-WEB] feat(auth): add callback URL support`

**Status:** ⏳

---

## Fluxo Completo

```
Usuário não autenticado
   │
   ├─▶ Acessa /dashboard
   │     └─▶ Middleware redireciona para /login?callbackUrl=/dashboard
   │
   ├─▶ Faz login
   │     ├─▶ 1 empresa: vai para callbackUrl ou /dashboard
   │     └─▶ N empresas: vai para /select-company
   │
   └─▶ Seleciona empresa
         └─▶ Vai para /dashboard

Usuário autenticado
   │
   ├─▶ Acessa /login
   │     └─▶ Middleware redireciona para /dashboard (ou /select-company)
   │
   └─▶ Acessa /dashboard sem empresa
         └─▶ Middleware redireciona para /select-company
```

---

## Critérios de Aceite

- [ ] Middleware protege rotas privadas
- [ ] Redirect para login com callbackUrl
- [ ] Não acessa rotas de auth se autenticado
- [ ] Select company funciona
- [ ] Empresa única selecionada automaticamente
- [ ] Cookies setados no login
- [ ] Cookies limpos no logout

---

*Task de [Sprint 5](../sprint-05.md)*
