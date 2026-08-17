# Sprint 2 - Autenticação Backend

> Implementação completa do sistema de autenticação com JWT e Refresh Token.

---

## Resumo

| Item | Valor |
|------|-------|
| **Objetivo** | Sistema de auth completo com JWT + Refresh Token |
| **Histórias** | 8 |
| **Tasks** | 30 |
| **Status** | ⏳ Pendente |
| **Dependências** | Sprint 1 |

---

## Histórias

### [FACTBP-API-005] Auth Services

**Descrição:** Criar serviços de suporte para autenticação.

**Tasks:**

| # | Task | Status |
|---|------|--------|
| 5.1 | Criar `PasswordService` (hash, compare) | ✅ |
| 5.2 | Criar `TokenService` (generate, verify JWT) | ✅ |
| 5.3 | Criar `RefreshTokenService` (create, validate, revoke) | ✅ |

**Commits esperados:**
```
[FACTBP-API] feat(auth): add PasswordService with bcrypt
[FACTBP-API] feat(auth): add TokenService for JWT operations
[FACTBP-API] feat(auth): add RefreshTokenService with rotation
```

---

### [FACTBP-API-006] Login Use Case

**Descrição:** Implementar login com email/senha retornando tokens.

**Tasks:**

| # | Task | Status |
|---|------|--------|
| 6.1 | Criar `LoginDTO` com validação | ✅ |
| 6.2 | Criar `LoginUseCase` | ✅ |
| 6.3 | Criar `TokenResponseDTO` | ✅ |

**Commits esperados:**
```
[FACTBP-API] feat(auth): add login DTO with validation
[FACTBP-API] feat(auth): implement LoginUseCase
```

**Fluxo:**
```
Input: { email, password }
   │
   ├─▶ Find user by email
   ├─▶ Verify password
   ├─▶ Check user.isActive
   ├─▶ Generate access token (15m)
   ├─▶ Generate refresh token (7d)
   └─▶ Return { accessToken, refreshToken, user }
```

---

### [FACTBP-API-007] Register Use Case

**Descrição:** Implementar registro de usuário com criação de empresa.

**Tasks:**

| # | Task | Status |
|---|------|--------|
| 7.1 | Criar `RegisterDTO` com validação | ✅ |
| 7.2 | Criar `RegisterUseCase` | ✅ |
| 7.3 | Criar role e membership automaticamente | ✅ |

**Commits esperados:**
```
[FACTBP-API] feat(auth): add register DTO
[FACTBP-API] feat(auth): implement RegisterUseCase with company creation
```

**Fluxo:**
```
Input: { user: { email, password, name }, company: { name, slug } }
   │
   ├─▶ Check email not exists
   ├─▶ Create user (password hashed)
   ├─▶ Create company
   ├─▶ Create default role (owner)
   ├─▶ Create membership (user + company + role)
   ├─▶ Generate tokens
   └─▶ Return { user, company, tokens }
```

---

### [FACTBP-API-008] Refresh Token Use Case

**Descrição:** Implementar renovação de tokens com rotação.

**Tasks:**

| # | Task | Status |
|---|------|--------|
| 8.1 | Criar `RefreshTokenDTO` | ✅ |
| 8.2 | Criar `RefreshTokenUseCase` | ✅ |
| 8.3 | Implementar detecção de token reuse | ✅ |

**Commits esperados:**
```
[FACTBP-API] feat(auth): implement RefreshTokenUseCase with rotation
[FACTBP-API] feat(auth): add token reuse detection
```

**Fluxo:**
```
Input: { refreshToken } (from httpOnly cookie)
   │
   ├─▶ Find token in database
   ├─▶ Check not expired
   ├─▶ Check family (detect reuse)
   ├─▶ Delete old token
   ├─▶ Generate new token pair
   └─▶ Return { accessToken, refreshToken }
```

---

### [FACTBP-API-009] Auth Controller & JWT Strategy

**Descrição:** Criar controller e estratégia JWT do Passport.

**Tasks:**

| # | Task | Status |
|---|------|--------|
| 9.1 | Criar `LogoutUseCase` | ✅ |
| 9.2 | Criar `GetMeUseCase` | ✅ |
| 9.3 | Criar `AuthController` (login, register, refresh, logout, me) | ✅ |
| 9.4 | Criar `JwtAuthGuard` | ✅ |
| 9.5 | Criar `CurrentUser` decorator | ✅ |
| 9.6 | Criar `AuthModule` | ✅ |

**Commits esperados:**
```
[FACTBP-API] feat(auth): add JWT strategy and guard
[FACTBP-API] feat(auth): add AuthController with all endpoints
[FACTBP-API] feat(auth): add CurrentUser decorator
```

---

### [FACTBP-API-014] Password Recovery

**Descrição:** Implementar fluxo completo de recuperação de senha.

**Tasks:**

| # | Task | Status |
|---|------|--------|
| 14.1 | Criar PasswordResetToken model | ⏳ |
| 14.2 | Criar `ForgotPasswordUseCase` | ⏳ |
| 14.3 | Criar `ResetPasswordUseCase` | ⏳ |
| 14.4 | Criar `ChangePasswordUseCase` | ⏳ |
| 14.5 | Adicionar endpoints no AuthController | ⏳ |
| 14.6 | Criar DTOs com validação | ⏳ |

**Arquivo detalhado:** [FACTBP-API-014](./sprint-02/FACTBP-API-014-password-recovery.md)

---

### [FACTBP-API-015] Mail Service

**Descrição:** Serviço de envio de emails com templates.

**Tasks:**

| # | Task | Status |
|---|------|--------|
| 15.1 | Instalar dependências (nodemailer, handlebars) | ⏳ |
| 15.2 | Criar configuração de email | ⏳ |
| 15.3 | Criar MailService | ⏳ |
| 15.4 | Criar templates (reset-password, welcome, invite) | ⏳ |
| 15.5 | Criar MailModule | ⏳ |
| 15.6 | Criar modo dev (console) | ⏳ |

**Arquivo detalhado:** [FACTBP-API-015](./sprint-02/FACTBP-API-015-mail-service.md)

---

### [FACTBP-API-016] Throttle Guard (Rate Limiting)

**Descrição:** Proteção contra brute force e DDoS.

**Tasks:**

| # | Task | Status |
|---|------|--------|
| 16.1 | Instalar @nestjs/throttler | ⏳ |
| 16.2 | Criar configuração de throttle | ⏳ |
| 16.3 | Configurar ThrottlerModule | ⏳ |
| 16.4 | Criar AuthThrottleGuard | ⏳ |
| 16.5 | Criar ForgotPasswordThrottleGuard | ⏳ |
| 16.6 | Aplicar guards nos endpoints | ⏳ |
| 16.7 | Criar LoginAttemptService (opcional) | ⏳ |

**Arquivo detalhado:** [FACTBP-API-016](./sprint-02/FACTBP-API-016-throttle-guard.md)

---

## Critérios de Aceite

- [ ] POST /auth/login retorna tokens + user
- [ ] POST /auth/register cria user + company + membership
- [ ] POST /auth/refresh renova tokens com rotação
- [ ] POST /auth/logout revoga refresh token
- [ ] GET /auth/me retorna usuário autenticado
- [ ] Refresh token em httpOnly cookie
- [ ] Access token expira em 15 minutos
- [ ] Refresh token expira em 7 dias
- [ ] Token reuse é detectado e invalida família
- [ ] POST /auth/forgot-password envia email
- [ ] POST /auth/reset-password funciona com token válido
- [ ] POST /auth/change-password funciona para usuário logado
- [ ] Rate limiting aplicado nos endpoints de auth
- [ ] MailService envia emails (ou loga em dev)

---

## Endpoints

| Método | Endpoint | Auth | Descrição |
|--------|----------|------|-----------|
| POST | `/auth/login` | ❌ | Login |
| POST | `/auth/register` | ❌ | Registro |
| POST | `/auth/refresh` | Cookie | Renovar tokens |
| POST | `/auth/logout` | ✅ | Invalidar sessão |
| GET | `/auth/me` | ✅ | Dados do usuário |
| POST | `/auth/forgot-password` | ❌ | Solicitar reset |
| POST | `/auth/reset-password` | Token | Redefinir senha |
| POST | `/auth/change-password` | ✅ | Alterar senha (logado) |

---

## Arquivos a Criar

```
src/
├── application/
│   └── auth/
│       ├── use-cases/
│       │   ├── login.use-case.ts
│       │   ├── register.use-case.ts
│       │   ├── refresh-token.use-case.ts
│       │   └── logout.use-case.ts
│       ├── dto/
│       │   ├── login.dto.ts
│       │   ├── register.dto.ts
│       │   ├── refresh-token.dto.ts
│       │   └── token-response.dto.ts
│       └── auth.module.ts
├── infra/
│   ├── auth/
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts
│   │   └── services/
│   │       ├── password.service.ts
│   │       ├── token.service.ts
│   │       └── refresh-token.service.ts
│   ├── http/
│   │   ├── controllers/
│   │   │   └── auth.controller.ts
│   │   ├── guards/
│   │   │   └── jwt-auth.guard.ts
│   │   └── decorators/
│   │       ├── current-user.decorator.ts
│   │       └── public.decorator.ts
│   └── database/
│       └── repositories/
│           ├── prisma-user.repository.ts
│           └── prisma-refresh-token.repository.ts
```

---

*Sprint 2 de 7*
