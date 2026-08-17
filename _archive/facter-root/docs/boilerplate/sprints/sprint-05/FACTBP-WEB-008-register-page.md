# [FACTBP-WEB-008] Register Page

> Página de registro com criação de empresa.

---

## Status: ⏳ Pendente

## Contexto

**Fluxo:**
- Usuário preenche dados pessoais + empresa
- Cria user + company + membership (owner)
- Recebe tokens e é redirecionado

---

## Tasks

### Task 8.1: Criar Register Schema

**Arquivo:** `src/features/auth/schemas/register-schema.ts`

**Implementação:**
```typescript
import { z } from 'zod';

export const registerSchema = z.object({
  user: z.object({
    name: z
      .string()
      .min(1, 'Nome é obrigatório')
      .min(2, 'Nome deve ter no mínimo 2 caracteres')
      .max(100, 'Nome deve ter no máximo 100 caracteres'),
    email: z
      .string()
      .min(1, 'Email é obrigatório')
      .email('Email inválido'),
    password: z
      .string()
      .min(1, 'Senha é obrigatória')
      .min(8, 'Senha deve ter no mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Senha deve ter pelo menos uma letra maiúscula')
      .regex(/[a-z]/, 'Senha deve ter pelo menos uma letra minúscula')
      .regex(/[0-9]/, 'Senha deve ter pelo menos um número'),
    confirmPassword: z.string().min(1, 'Confirme sua senha'),
  }).refine((data) => data.password === data.confirmPassword, {
    message: 'Senhas não conferem',
    path: ['confirmPassword'],
  }),
  company: z.object({
    name: z
      .string()
      .min(1, 'Nome da empresa é obrigatório')
      .min(2, 'Nome deve ter no mínimo 2 caracteres')
      .max(100, 'Nome deve ter no máximo 100 caracteres'),
    slug: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^[a-z0-9-]+$/.test(val),
        'Slug deve conter apenas letras minúsculas, números e hífens'
      ),
  }),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
```

**Status:** ⏳

---

### Task 8.2: Criar Register Form Component

**Arquivo:** `src/features/auth/components/register-form.tsx`

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
  Separator,
} from '@facter/ds-core';
import { useRegister } from '../hooks/use-register';
import { registerSchema, type RegisterFormData } from '../schemas/register-schema';
import { ROUTES } from '@/config/routes';

export function RegisterForm() {
  const { mutate: register, isPending } = useRegister();

  const {
    register: registerField,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      user: {
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
      },
      company: {
        name: '',
        slug: '',
      },
    },
  });

  const companyName = watch('company.name');

  // Gerar slug automaticamente
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const onSubmit = (data: RegisterFormData) => {
    const { confirmPassword, ...userData } = data.user;
    register({
      user: userData,
      company: {
        name: data.company.name,
        slug: data.company.slug || generateSlug(data.company.name),
      },
    });
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Criar conta</CardTitle>
        <CardDescription>
          Preencha seus dados para criar sua conta e empresa
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          {/* Dados Pessoais */}
          <div className="space-y-4">
            <h3 className="font-medium">Dados Pessoais</h3>

            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                placeholder="João Silva"
                {...registerField('user.name')}
                aria-invalid={!!errors.user?.name}
              />
              {errors.user?.name && (
                <p className="text-sm text-destructive">
                  {errors.user.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                {...registerField('user.email')}
                aria-invalid={!!errors.user?.email}
              />
              {errors.user?.email && (
                <p className="text-sm text-destructive">
                  {errors.user.email.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...registerField('user.password')}
                  aria-invalid={!!errors.user?.password}
                />
                {errors.user?.password && (
                  <p className="text-sm text-destructive">
                    {errors.user.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  {...registerField('user.confirmPassword')}
                  aria-invalid={!!errors.user?.confirmPassword}
                />
                {errors.user?.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {errors.user.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Dados da Empresa */}
          <div className="space-y-4">
            <h3 className="font-medium">Dados da Empresa</h3>

            <div className="space-y-2">
              <Label htmlFor="companyName">Nome da empresa</Label>
              <Input
                id="companyName"
                placeholder="Minha Empresa LTDA"
                {...registerField('company.name')}
                aria-invalid={!!errors.company?.name}
              />
              {errors.company?.name && (
                <p className="text-sm text-destructive">
                  {errors.company.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">
                Slug{' '}
                <span className="text-muted-foreground font-normal">
                  (opcional)
                </span>
              </Label>
              <Input
                id="slug"
                placeholder={companyName ? generateSlug(companyName) : 'minha-empresa'}
                {...registerField('company.slug')}
                aria-invalid={!!errors.company?.slug}
              />
              <p className="text-xs text-muted-foreground">
                Usado na URL. Se não informado, será gerado automaticamente.
              </p>
              {errors.company?.slug && (
                <p className="text-sm text-destructive">
                  {errors.company.slug.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Criando conta...' : 'Criar conta'}
          </Button>

          <p className="text-sm text-muted-foreground text-center">
            Já tem uma conta?{' '}
            <Link href={ROUTES.LOGIN} className="text-primary hover:underline">
              Entrar
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
```

**Commit:** `[FACTBP-WEB] feat(auth): add RegisterForm component`

**Status:** ⏳

---

### Task 8.3: Criar Register Page

**Arquivo:** `src/app/(auth)/register/page.tsx`

**Implementação:**
```typescript
import { Metadata } from 'next';
import { RegisterForm } from '@/features/auth/components/register-form';

export const metadata: Metadata = {
  title: 'Criar conta',
  description: 'Crie sua conta e empresa para começar',
};

export default function RegisterPage() {
  return <RegisterForm />;
}
```

**Commit:** `[FACTBP-WEB] feat(auth): add register page`

**Status:** ⏳

---

## Critérios de Aceite

- [ ] Validação completa de user + company
- [ ] Validação de força de senha
- [ ] Confirmação de senha funciona
- [ ] Slug gerado automaticamente
- [ ] Loading state no botão
- [ ] Link para login
- [ ] Toast de sucesso/erro
- [ ] Redirect após registro

---

*Task de [Sprint 5](../sprint-05.md)*
