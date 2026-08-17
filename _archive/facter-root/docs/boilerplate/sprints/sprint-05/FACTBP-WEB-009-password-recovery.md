# [FACTBP-WEB-009] Password Recovery

> Fluxo de recuperação de senha.

---

## Status: ⏳ Pendente

## Contexto

**Fluxo:**
1. Usuário acessa /forgot-password
2. Informa email
3. Recebe email com link (token)
4. Acessa /reset-password?token=xxx
5. Define nova senha

---

## Tasks

### Task 9.1: Criar Forgot Password Hooks

**Arquivo:** `src/features/auth/hooks/use-forgot-password.ts`

**Implementação:**
```typescript
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { authService } from '../services/auth-service';

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),

    onSuccess: () => {
      toast.success(
        'Se o email existir em nossa base, você receberá um link de recuperação.',
      );
    },

    onError: () => {
      // Não revelar se email existe ou não por segurança
      toast.success(
        'Se o email existir em nossa base, você receberá um link de recuperação.',
      );
    },
  });
}
```

**Arquivo:** `src/features/auth/hooks/use-reset-password.ts`

```typescript
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authService } from '../services/auth-service';
import { ROUTES } from '@/config/routes';

interface ResetPasswordData {
  token: string;
  password: string;
}

export function useResetPassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: ({ token, password }: ResetPasswordData) =>
      authService.resetPassword(token, password),

    onSuccess: () => {
      toast.success('Senha alterada com sucesso! Faça login com sua nova senha.');
      router.push(ROUTES.LOGIN);
    },

    onError: (error: any) => {
      const message =
        error.response?.data?.error?.message ||
        'Erro ao redefinir senha. O link pode ter expirado.';
      toast.error(message);
    },
  });
}
```

**Commit:** `[FACTBP-WEB] feat(auth): add password recovery hooks`

**Status:** ⏳

---

### Task 9.2: Criar Forgot Password Form

**Arquivo:** `src/features/auth/components/forgot-password-form.tsx`

**Implementação:**
```typescript
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { useForgotPassword } from '../hooks/use-forgot-password';
import { ROUTES } from '@/config/routes';
import { CheckCircle } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email é obrigatório').email('Email inválido'),
});

type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false);
  const { mutate: forgotPassword, isPending } = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = (data: ForgotPasswordData) => {
    forgotPassword(data.email, {
      onSuccess: () => setSubmitted(true),
      onError: () => setSubmitted(true), // Mesma tela por segurança
    });
  };

  if (submitted) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-success" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Email enviado!</h2>
              <p className="text-muted-foreground">
                Se o email existir em nossa base, você receberá um link de
                recuperação em alguns minutos.
              </p>
            </div>
            <Link href={ROUTES.LOGIN}>
              <Button variant="outline">Voltar para login</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Recuperar senha</CardTitle>
        <CardDescription>
          Informe seu email para receber um link de recuperação
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
              {...register('email')}
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Enviando...' : 'Enviar link de recuperação'}
          </Button>

          <Link
            href={ROUTES.LOGIN}
            className="text-sm text-primary hover:underline"
          >
            Voltar para login
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}
```

**Status:** ⏳

---

### Task 9.3: Criar Forgot Password Page

**Arquivo:** `src/app/(auth)/forgot-password/page.tsx`

**Implementação:**
```typescript
import { Metadata } from 'next';
import { ForgotPasswordForm } from '@/features/auth/components/forgot-password-form';

export const metadata: Metadata = {
  title: 'Recuperar senha',
  description: 'Recupere o acesso à sua conta',
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
```

**Commit:** `[FACTBP-WEB] feat(auth): add forgot-password page`

**Status:** ⏳

---

### Task 9.4: Criar Reset Password Form

**Arquivo:** `src/features/auth/components/reset-password-form.tsx`

**Implementação:**
```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { useResetPassword } from '../hooks/use-reset-password';
import { ROUTES } from '@/config/routes';

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, 'Senha é obrigatória')
      .min(8, 'Senha deve ter no mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Senha deve ter pelo menos uma letra maiúscula')
      .regex(/[a-z]/, 'Senha deve ter pelo menos uma letra minúscula')
      .regex(/[0-9]/, 'Senha deve ter pelo menos um número'),
    confirmPassword: z.string().min(1, 'Confirme sua senha'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Senhas não conferem',
    path: ['confirmPassword'],
  });

type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const { mutate: resetPassword, isPending } = useResetPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = (data: ResetPasswordData) => {
    resetPassword({ token, password: data.password });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Nova senha</CardTitle>
        <CardDescription>Defina uma nova senha para sua conta</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Nova senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register('password')}
              aria-invalid={!!errors.password}
            />
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              {...register('confirmPassword')}
              aria-invalid={!!errors.confirmPassword}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Salvando...' : 'Salvar nova senha'}
          </Button>

          <Link
            href={ROUTES.LOGIN}
            className="text-sm text-primary hover:underline"
          >
            Voltar para login
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}
```

**Status:** ⏳

---

### Task 9.5: Criar Reset Password Page

**Arquivo:** `src/app/(auth)/reset-password/page.tsx`

**Implementação:**
```typescript
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ResetPasswordForm } from '@/features/auth/components/reset-password-form';
import { ROUTES } from '@/config/routes';

export const metadata: Metadata = {
  title: 'Redefinir senha',
  description: 'Defina uma nova senha para sua conta',
};

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const { token } = await searchParams;

  if (!token) {
    redirect(ROUTES.FORGOT_PASSWORD);
  }

  return <ResetPasswordForm token={token} />;
}
```

**Commit:** `[FACTBP-WEB] feat(auth): add reset-password page`

**Status:** ⏳

---

## Critérios de Aceite

- [ ] Forgot password não revela se email existe
- [ ] Reset password valida força da senha
- [ ] Confirmação de senha funciona
- [ ] Token via query string
- [ ] Redirect para login após reset
- [ ] Toast de feedback
- [ ] Link de volta para login

---

*Task de [Sprint 5](../sprint-05.md)*
