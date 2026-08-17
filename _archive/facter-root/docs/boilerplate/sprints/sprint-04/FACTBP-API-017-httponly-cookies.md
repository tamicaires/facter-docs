# [FACTBP-API-017] Auth com httpOnly Cookies

> Migrar autenticação de localStorage para httpOnly cookies (segurança).

---

## Status: ✅ Concluído (2025-12-16)

## Contexto

**Problema com localStorage:**
- Vulnerável a XSS (JavaScript pode ler)
- Tokens expostos no client
- Não é o padrão recomendado para auth

**Solução com httpOnly Cookies:**
- JavaScript não consegue acessar
- Enviados automaticamente pelo browser
- Proteção contra XSS
- Padrão de segurança recomendado

---

## Tasks

### Task 17.1: Criar Cookie Utils

**Arquivo:** `src/infra/http/utils/cookie.utils.ts`

```typescript
import { Response } from 'express';

export interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  path: string;
  maxAge: number;
}

const BASE_OPTIONS: Omit<CookieOptions, 'maxAge'> = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
};

export const COOKIE_NAMES = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
} as const;

export function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
  accessTokenMaxAge: number,
  refreshTokenMaxAge: number,
): void {
  res.cookie(COOKIE_NAMES.ACCESS_TOKEN, accessToken, {
    ...BASE_OPTIONS,
    maxAge: accessTokenMaxAge,
  });

  res.cookie(COOKIE_NAMES.REFRESH_TOKEN, refreshToken, {
    ...BASE_OPTIONS,
    maxAge: refreshTokenMaxAge,
  });
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie(COOKIE_NAMES.ACCESS_TOKEN, { path: '/' });
  res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, { path: '/' });
}
```

**Status:** ✅

---

### Task 17.2: Criar Cookie Decorator

**Arquivo:** `src/infra/http/decorators/cookies.decorator.ts`

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const Cookies = createParamDecorator(
  (key: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return key ? request.cookies?.[key] : request.cookies;
  },
);
```

**Status:** ✅

---

### Task 17.3: Atualizar JwtAuthGuard

**Arquivo:** `src/infra/http/guards/jwt-auth.guard.ts`

```typescript
// Ler token do cookie OU header (flexibilidade para mobile/API)
const extractToken = (request: Request): string | null => {
  // 1. Tentar cookie primeiro
  const cookieToken = request.cookies?.[COOKIE_NAMES.ACCESS_TOKEN];
  if (cookieToken) return cookieToken;

  // 2. Fallback para header (mobile, APIs externas)
  const authHeader = request.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  return null;
};
```

**Status:** ✅

---

### Task 17.4: Atualizar AuthController

**Arquivo:** `src/infra/http/controllers/auth.controller.ts`

**Mudanças:**

1. **Login/Register:** Setar cookies na response
```typescript
@Post('login')
async login(
  @Body() dto: LoginDto,
  @Res({ passthrough: true }) res: Response,
) {
  const result = await this.loginUseCase.execute(dto);

  setAuthCookies(
    res,
    result.accessToken,
    result.refreshToken,
    15 * 60 * 1000,      // 15 min
    7 * 24 * 60 * 60 * 1000, // 7 days
  );

  return { data: result.user };
}
```

2. **Refresh:** Ler do cookie
```typescript
@Post('refresh')
async refresh(
  @Cookies(COOKIE_NAMES.REFRESH_TOKEN) refreshToken: string,
  @Res({ passthrough: true }) res: Response,
) {
  const result = await this.refreshTokenUseCase.execute({ refreshToken });

  setAuthCookies(res, result.accessToken, result.refreshToken, ...);

  return { data: { message: 'Token refreshed' } };
}
```

3. **Logout:** Limpar cookies
```typescript
@Post('logout')
@UseGuards(JwtAuthGuard)
async logout(
  @CurrentUser() user: JwtPayload,
  @Res({ passthrough: true }) res: Response,
) {
  await this.logoutUseCase.execute({ userId: user.sub });
  clearAuthCookies(res);
  return { data: { message: 'Logged out' } };
}
```

**Status:** ✅

---

### Task 17.5: Configurar Cookie Parser

**Arquivo:** `src/main.ts`

```typescript
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  // CORS com credentials para cookies
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // ...
}
```

**Dependência:**
```bash
pnpm add cookie-parser
pnpm add -D @types/cookie-parser
```

**Status:** ✅

---

### Task 17.6: Atualizar Testes

Atualizar testes do AuthController para usar cookies.

**Status:** ✅

---

## Critérios de Aceite

- [x] Tokens setados em httpOnly cookies
- [x] Cookies secure em produção
- [x] sameSite configurado corretamente
- [x] Login/Register setam cookies
- [x] Refresh lê do cookie
- [x] Logout limpa cookies
- [x] Guard lê de cookie OU header
- [x] CORS configurado com credentials
- [x] Testes atualizados

---

## Response Changes

**Antes (com tokens no body):**
```json
{
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "abc...",
    "user": { ... }
  }
}
```

**Depois (tokens em cookies):**
```json
{
  "data": {
    "user": { ... }
  }
}
```
+ Headers `Set-Cookie`

---

## Configuração CORS

```typescript
// Frontend precisa enviar credentials
fetch('/api/auth/me', { credentials: 'include' });

// Axios
axios.defaults.withCredentials = true;
```

---

*Task de [Sprint 4](../sprint-04.md)*
