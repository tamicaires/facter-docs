# Sprint 5 - Autenticação Frontend

> Páginas e hooks de autenticação no frontend.

---

## Resumo

| Item | Valor |
|------|-------|
| **Objetivo** | Fluxo completo de auth no frontend |
| **Histórias** | 5 |
| **Tasks** | 15 |
| **Status** | ⏳ Pendente |
| **Dependências** | Sprint 2, Sprint 4 |

---

## Histórias

### [FACTBP-WEB-006] Auth Services e Hooks

**Descrição:** Criar serviços e hooks para autenticação.

**Tasks:**

| # | Task | Status |
|---|------|--------|
| 6.1 | Criar `features/auth/services/auth-service.ts` | ⏳ |
| 6.2 | Criar `features/auth/hooks/use-login.ts` | ⏳ |
| 6.3 | Criar `features/auth/hooks/use-register.ts` | ⏳ |
| 6.4 | Criar `features/auth/hooks/use-auth.ts` | ⏳ |

**Commits esperados:**
```
[FACTBP-WEB] feat(auth): add auth service
[FACTBP-WEB] feat(auth): add useLogin hook
[FACTBP-WEB] feat(auth): add useRegister hook
[FACTBP-WEB] feat(auth): add useAuth hook
```

---

### [FACTBP-WEB-007] Login Page

**Descrição:** Página de login usando AuthLayout do DS.

**Tasks:**

| # | Task | Status |
|---|------|--------|
| 7.1 | Criar `app/(auth)/layout.tsx` com AuthLayout | ⏳ |
| 7.2 | Criar `app/(auth)/login/page.tsx` | ⏳ |
| 7.3 | Criar `features/auth/components/login-form.tsx` | ⏳ |

**Commits esperados:**
```
[FACTBP-WEB] feat(auth): add auth layout with AuthLayout
[FACTBP-WEB] feat(auth): add login page
[FACTBP-WEB] feat(auth): add LoginForm component
```

---

### [FACTBP-WEB-008] Register Page

**Descrição:** Página de registro com criação de empresa.

**Tasks:**

| # | Task | Status |
|---|------|--------|
| 8.1 | Criar `app/(auth)/register/page.tsx` | ⏳ |
| 8.2 | Criar `features/auth/components/register-form.tsx` | ⏳ |
| 8.3 | Validação com Zod (user + company) | ⏳ |

**Commits esperados:**
```
[FACTBP-WEB] feat(auth): add register page
[FACTBP-WEB] feat(auth): add RegisterForm component
```

---

### [FACTBP-WEB-009] Password Recovery

**Descrição:** Fluxo de recuperação de senha.

**Tasks:**

| # | Task | Status |
|---|------|--------|
| 9.1 | Criar `app/(auth)/forgot-password/page.tsx` | ⏳ |
| 9.2 | Criar `app/(auth)/reset-password/page.tsx` | ⏳ |
| 9.3 | Criar hooks `useForgotPassword`, `useResetPassword` | ⏳ |

**Commits esperados:**
```
[FACTBP-WEB] feat(auth): add forgot-password page
[FACTBP-WEB] feat(auth): add reset-password page
[FACTBP-WEB] feat(auth): add password recovery hooks
```

---

### [FACTBP-WEB-010] Auth Middleware

**Descrição:** Middleware Next.js para proteção de rotas.

**Tasks:**

| # | Task | Status |
|---|------|--------|
| 10.1 | Criar `middleware.ts` | ⏳ |
| 10.2 | Configurar rotas públicas/protegidas | ⏳ |
| 10.3 | Redirect logic (login → select-company → dashboard) | ⏳ |

**Commits esperados:**
```
[FACTBP-WEB] feat(auth): add Next.js middleware for route protection
[FACTBP-WEB] feat(auth): configure public and protected routes
```

**Middleware:**
```typescript
const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password']

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value
  const pathname = request.nextUrl.pathname

  // Rota pública
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    if (token) {
      return NextResponse.redirect(new URL('/select-company', request.url))
    }
    return NextResponse.next()
  }

  // Rota protegida sem token
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}
```

---

## Critérios de Aceite

- [ ] Login funciona e salva tokens
- [ ] Register cria user + company
- [ ] Forgot password envia email
- [ ] Reset password funciona com token
- [ ] Middleware protege rotas
- [ ] Redirect correto após login
- [ ] Token refresh automático
- [ ] Logout limpa estado e cookies

---

## Arquivos a Criar

```
src/
├── app/
│   └── (auth)/
│       ├── layout.tsx
│       ├── login/
│       │   └── page.tsx
│       ├── register/
│       │   └── page.tsx
│       ├── forgot-password/
│       │   └── page.tsx
│       └── reset-password/
│           └── page.tsx
├── features/
│   └── auth/
│       ├── components/
│       │   ├── login-form.tsx
│       │   ├── register-form.tsx
│       │   ├── forgot-password-form.tsx
│       │   └── reset-password-form.tsx
│       ├── hooks/
│       │   ├── use-login.ts
│       │   ├── use-register.ts
│       │   ├── use-auth.ts
│       │   ├── use-forgot-password.ts
│       │   └── use-reset-password.ts
│       └── services/
│           └── auth-service.ts
└── middleware.ts
```

---

*Sprint 5 de 7*
