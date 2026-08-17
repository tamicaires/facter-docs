# API - Autenticação

> **Endpoints de autenticação e gestão de sessão.**

---

## Endpoints

### POST /auth/login

Realiza login do usuário.

**Request:**
```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

**Response (200):**
```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 900,
    "user": {
      "id": "uuid",
      "email": "usuario@exemplo.com",
      "name": "João Silva",
      "memberships": [
        {
          "id": "membership-uuid",
          "companyId": "company-uuid",
          "companyName": "TechFix LTDA",
          "role": "TECHNICIAN",
          "status": "ACTIVE"
        }
      ]
    }
  }
}
```

**Response (401):**
```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Email ou senha inválidos"
  }
}
```

---

### POST /auth/register

Registra novo usuário e cria empresa.

**Request:**
```json
{
  "user": {
    "email": "novo@exemplo.com",
    "password": "senha123",
    "name": "Maria Santos"
  },
  "company": {
    "name": "Nova Assistência",
    "document": "12345678901234",
    "documentType": "CNPJ",
    "mode": "BUSINESS"
  },
  "plan": "starter"
}
```

**Response (201):**
```json
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "novo@exemplo.com",
      "name": "Maria Santos"
    },
    "company": {
      "id": "uuid",
      "name": "Nova Assistência"
    },
    "membership": {
      "id": "uuid",
      "role": "OWNER"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### POST /auth/refresh

Renova o token de acesso.

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**
```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 900
  }
}
```

---

### POST /auth/logout

Invalida a sessão atual.

**Headers:**
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response (204):** No Content

---

### GET /auth/me

Retorna dados do usuário autenticado.

**Headers:**
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response (200):**
```json
{
  "data": {
    "id": "uuid",
    "email": "usuario@exemplo.com",
    "name": "João Silva",
    "phone": "+5511999999999",
    "avatarUrl": null,
    "preferences": {
      "theme": "light",
      "language": "pt-BR",
      "notifications": true
    },
    "memberships": [
      {
        "id": "membership-uuid",
        "companyId": "company-uuid",
        "companyName": "TechFix LTDA",
        "role": "OWNER",
        "status": "ACTIVE",
        "permissions": ["*"]
      }
    ],
    "currentMembership": {
      "id": "membership-uuid",
      "companyId": "company-uuid",
      "role": "OWNER"
    }
  }
}
```

---

### POST /auth/switch-company

Troca a empresa ativa do usuário.

**Request:**
```json
{
  "companyId": "company-uuid"
}
```

**Response (200):**
```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "company": {
      "id": "company-uuid",
      "name": "Outra Empresa"
    },
    "membership": {
      "id": "membership-uuid",
      "role": "MANAGER"
    }
  }
}
```

---

### POST /auth/forgot-password

Solicita recuperação de senha.

**Request:**
```json
{
  "email": "usuario@exemplo.com"
}
```

**Response (200):**
```json
{
  "data": {
    "message": "Email de recuperação enviado"
  }
}
```

---

### POST /auth/reset-password

Redefine a senha com token.

**Request:**
```json
{
  "token": "reset-token-uuid",
  "password": "novaSenha123"
}
```

**Response (200):**
```json
{
  "data": {
    "message": "Senha alterada com sucesso"
  }
}
```

---

### POST /auth/change-password

Altera senha do usuário autenticado.

**Headers:**
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Request:**
```json
{
  "currentPassword": "senhaAtual",
  "newPassword": "novaSenha123"
}
```

**Response (200):**
```json
{
  "data": {
    "message": "Senha alterada com sucesso"
  }
}
```

---

### POST /auth/verify-email

Verifica email do usuário.

**Request:**
```json
{
  "token": "verification-token-uuid"
}
```

**Response (200):**
```json
{
  "data": {
    "message": "Email verificado com sucesso"
  }
}
```

---

### POST /auth/resend-verification

Reenvia email de verificação.

**Headers:**
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response (200):**
```json
{
  "data": {
    "message": "Email de verificação reenviado"
  }
}
```

---

## JWT Token Structure

```json
{
  "sub": "user-uuid",
  "email": "usuario@exemplo.com",
  "membership": {
    "id": "membership-uuid",
    "companyId": "company-uuid",
    "role": "OWNER"
  },
  "iat": 1640995200,
  "exp": 1640996100
}
```

---

## Refresh Token

- **Validade**: 7 dias
- **Rotação**: Novo refresh token a cada uso
- **Revogação**: Logout invalida todos os refresh tokens

---

**Voltar para** [API](./README.md)
