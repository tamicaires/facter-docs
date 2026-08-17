# [FACTBP-WEB-007] Login Page

> Página de login usando AuthLayout do DS.

---

## Status: ⏳ Pendente

## Contexto

**Design System:**
- Usar `AuthLayout` do @facter/ds-core
- Usar `Input`, `Button`, `Card` do DS
- Validação com react-hook-form + zod

---

## Tasks

### Task 7.1: Criar Auth Layout

**Arquivo:** `src/app/(auth)/layout.tsx`

**Implementação:**
```typescript
import { AuthLayout } from '@facter/ds-core';
import { env } from '@/config/env';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthGroupLayout({ children }: AuthLayoutProps) {
  return (
    <AuthLayout
      logo={
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">F</span>
          </div>
          <span className="font-semibold text-xl">{env.NEXT_PUBLIC_APP_NAME}</span>
        </div>
      }
      footer={
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} {env.NEXT_PUBLIC_APP_NAME}. Todos os direitos reservados.
        </p>
      }
    >
      {children}
    </AuthLayout>
  );
}
```

**Commit:** `[FACTBP-WEB] feat(auth): add auth layout with AuthLayout`

**Status:** ⏳

---

### Task 7.2: Criar Login Form Schema

**Arquivo:** `src/features/auth/schemas/login-schema.ts`

**Implementação:**
```typescript
import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
```

**Status:** ⏳

---

### Task 7.3: Criar Login Form Component

**Arquivo:** `src/features/auth/components/login-form.tsx`

**Implementação:**
```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Label,
} from '@facter/ds-core';
import { useLogin } from '../hooks/use-login';
import { loginSchema, type LoginFormData } from '../schemas/login-schema';
import { ROUTES } from '@/config/routes';

export function LoginForm() {
  const { mutate: login, isPending } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginFormData) => {
    login(data);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Entrar</CardTitle>
        <CardDescription>
          Entre com seu email e senha para acessar
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              autoComplete="email"
              {...register('email')}
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Senha</Label>
              <Link
                href={ROUTES.FORGOT_PASSWORD}
                className="text-sm text-primary hover:underline"
              >
                Esqueceu a senha?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              {...register('password')}
              aria-invalid={!!errors.password}
            />
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full"
            disabled={isPending}
          >
            {isPending ? 'Entrando...' : 'Entrar'}
          </Button>

          <p className="text-sm text-muted-foreground text-center">
            Não tem uma conta?{' '}
            <Link
              href={ROUTES.REGISTER}
              className="text-primary hover:underline"
            >
              Criar conta
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
```

**Commit:** `[FACTBP-WEB] feat(auth): add LoginForm component`

**Status:** ⏳

---

### Task 7.4: Criar Login Page

**Arquivo:** `src/app/(auth)/login/page.tsx`

**Implementação:**
```typescript
import { Metadata } from 'next';
import { LoginForm } from '@/features/auth/components/login-form';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Faça login para acessar sua conta',
};

export default function LoginPage() {
  return <LoginForm />;
}
```

**Commit:** `[FACTBP-WEB] feat(auth): add login page`

**Status:** ⏳

---

## Critérios de Aceite

- [ ] AuthLayout do DS funcionando
- [ ] Form com validação Zod
- [ ] Loading state no botão
- [ ] Link para forgot-password
- [ ] Link para register
- [ ] Toast de erro em falha
- [ ] Redirect após login

---

*Task de [Sprint 5](../sprint-05.md)*
