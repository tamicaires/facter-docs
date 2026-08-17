# Troubleshooting: OAuth Redirect e CORS - Configuração de Portas

**Data:** 2026-01-26
**Projeto:** Facter TechCare + Facter Hub
**Severidade:** Bloqueante (impossibilitava login)

---

## Sumário Executivo

Erro de CORS e redirecionamento OAuth impedindo login no TechCare. Causa raiz: inconsistência nas configurações de portas entre os serviços após inicialização dos containers Docker.

**Tempo de resolução:** ~15 minutos
**Serviços afetados:** TechCare Web, Hub Web, Hub API

---

## 1. Sintomas Observados

### 1.1 Primeiro Erro - Redirecionamento Incorreto
```
URL: http://localhost:3001/api/oauth/authorize?client_id=techcare&...
Erro: ENTITY_NOT_FOUND - "Cannot GET /api/oauth/authorize"
```

O botão "Entrar com Facter Hub" no TechCare redirecionava para a porta errada.

### 1.2 Segundo Erro - CORS na Tela de Login
```
Cross-Origin Request Blocked: The Same Origin Policy disallows reading
the remote resource at http://localhost:3001/api/auth/login.
(Reason: CORS header 'Access-Control-Allow-Origin' missing).
Status code: 500.
```

Após corrigir o primeiro erro, o Hub Web conseguia carregar a tela de login, mas a requisição de autenticação falhava com CORS.

---

## 2. Análise da Causa Raiz

### 2.1 Arquitetura dos Serviços

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ARQUITETURA LOCAL                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  TechCare Web (3000) ──OAuth──> Hub API (3002) ──redirect──> Hub Web (3005)
│        │                              │                          │
│        │                              │                          │
│        └──── REST API ────> TechCare API (3001)                  │
│                                                                      │
│  Docker Containers:                                                  │
│  ├── Hub PostgreSQL (5433)      ├── TechCare PostgreSQL (5434)      │
│  └── Hub Redis (6380)           └── TechCare Redis (6381)           │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Problema Identificado

As configurações de ambiente estavam com portas inconsistentes:

| Serviço | Variável | Valor Incorreto | Valor Correto |
|---------|----------|-----------------|---------------|
| TechCare Web | `NEXT_PUBLIC_API_URL` | `:3003` | `:3001` |
| TechCare Web | `NEXT_PUBLIC_HUB_API_URL` | `:3001` | `:3002` |
| TechCare API | `DATABASE_URL` | `:5432` | `:5434` |
| TechCare API | `REDIS_URL` | `:6379` | `:6381` |
| TechCare API | `PORT` | `3003` | `3001` |
| Hub API | `PORT` | `3001` | `3002` |
| Hub Web | `NEXT_PUBLIC_API_URL` | `:3001` | `:3002` |

### 2.3 Origem do Problema

1. **Conflito de portas**: Hub API e TechCare API estavam ambos configurados para porta 3001
2. **Docker ports mismatch**: Os containers Docker expõem portas diferentes das padrão (5433/5434 para PostgreSQL, 6380/6381 para Redis)
3. **Cache de variáveis**: Next.js cacheia variáveis `NEXT_PUBLIC_*` no build, exigindo restart do dev server

---

## 3. Processo de Diagnóstico

### 3.1 Identificação do Fluxo OAuth

Analisado o código em `facter-techcare-web/src/app/page.tsx`:

```typescript
const handleLogin = () => {
  const params = new URLSearchParams({
    client_id: 'techcare',
    redirect_uri: `${env.NEXT_PUBLIC_APP_URL}/callback`,
    response_type: 'code',
    scope: 'openid profile email',
  });
  // Problema: env.NEXT_PUBLIC_HUB_API_URL apontava para porta errada
  const hubOAuthUrl = `${env.NEXT_PUBLIC_HUB_API_URL}/oauth/authorize?${params}`;
  window.location.href = hubOAuthUrl;
};
```

### 3.2 Verificação dos Endpoints

Confirmado que Hub API possui o endpoint OAuth em `facter-hub-api/src/application/oauth/oauth.controller.ts`:

```typescript
@Get('authorize')
@UseGuards(OptionalJwtAuthGuard)
async authorize(...) {
  // Se não autenticado, redireciona para login
  if (!userId) {
    return { action: 'login_required', loginUrl: this.buildLoginUrl(dto) };
  }
  // Se autenticado, gera código e redireciona
  return { action: 'redirect', redirectUrl };
}
```

### 3.3 Rastreamento das Configurações

```bash
# Verificar portas em uso
netstat -ano | grep -E ":300[0-5].*LISTENING"

# Verificar configuração do TechCare Web
cat facter-techcare-web/.env.local

# Verificar configuração do Hub Web
cat facter-hub-web/.env.local

# Verificar configuração do Hub API
grep PORT facter-hub-api/.env
```

---

## 4. Solução Aplicada

### 4.1 Correções nos Arquivos de Ambiente

**facter-techcare/facter-techcare-api/.env**
```diff
- PORT=3003
+ PORT=3001
- DATABASE_URL="postgresql://postgres:postgres@localhost:5432/techcare_db?schema=public"
+ DATABASE_URL="postgresql://postgres:postgres@localhost:5434/techcare_db?schema=public"
- # REDIS_URL="redis://localhost:6379"
+ REDIS_URL="redis://localhost:6381"
```

**facter-hub/facter-hub-api/.env**
```diff
- PORT=3001
+ PORT=3002
```

**facter-techcare/facter-techcare-web/.env.local**
```diff
- NEXT_PUBLIC_API_URL=http://localhost:3003/api
+ NEXT_PUBLIC_API_URL=http://localhost:3001/api
- NEXT_PUBLIC_HUB_API_URL=http://localhost:3001/api
+ NEXT_PUBLIC_HUB_API_URL=http://localhost:3002/api
```

**facter-hub/facter-hub-web/.env.local**
```diff
- NEXT_PUBLIC_API_URL=http://localhost:3001/api
+ NEXT_PUBLIC_API_URL=http://localhost:3002/api
```

### 4.2 Rebuild e Restart

```bash
# Hub API - rebuild necessário (dist não existia)
cd facter-hub/facter-hub-api
rm -rf dist && pnpm build
pnpm start:dev

# TechCare API
cd facter-techcare/facter-techcare-api
rm -rf dist && pnpm build
pnpm start:dev

# Hub Web - restart para recarregar env vars
cd facter-hub/facter-hub-web
# Ctrl+C
pnpm dev

# TechCare Web - restart para recarregar env vars
cd facter-techcare/facter-techcare-web
# Ctrl+C
pnpm dev
```

---

## 5. Configuração Final (Referência)

### 5.1 Mapeamento de Portas

| Serviço | Porta | Descrição |
|---------|-------|-----------|
| TechCare Web | 3000 | Frontend Next.js |
| TechCare API | 3001 | Backend NestJS |
| Hub API | 3002 | Backend NestJS (OAuth Provider) |
| Hub Web | 3005 | Frontend Next.js (Login/Admin) |
| Hub PostgreSQL | 5433 | Docker: facter-hub-postgres |
| Hub Redis | 6380 | Docker: facter-hub-redis |
| TechCare PostgreSQL | 5434 | Docker: techcare-postgres |
| TechCare Redis | 6381 | Docker: techcare-redis |

### 5.2 Fluxo OAuth Correto

```
1. Usuário clica "Entrar com Facter Hub" no TechCare (localhost:3000)
2. TechCare redireciona para Hub API OAuth (localhost:3002/api/oauth/authorize)
3. Hub API verifica autenticação (cookie JWT)
4. Se não autenticado: redireciona para Hub Web login (localhost:3005/login)
5. Usuário faz login no Hub Web
6. Hub Web chama Hub API para autenticar (localhost:3002/api/auth/login)
7. Após login, redireciona de volta para Hub API OAuth
8. Hub API gera código de autorização
9. Hub API redireciona para TechCare callback (localhost:3000/callback)
10. TechCare troca código por tokens
11. Login completo!
```

---

## 6. Prevenção Futura

### 6.1 Recomendações

1. **Criar `.env.example` atualizado** com as portas corretas em cada projeto
2. **Documentar arquitetura de portas** no CLAUDE.md principal
3. **Script de setup** que valida configurações antes de iniciar
4. **Health checks** nos scripts de dev para verificar conectividade

### 6.2 Checklist de Setup Local

```markdown
- [ ] Docker containers rodando (docker ps)
- [ ] Hub API rodando na porta 3002
- [ ] TechCare API rodando na porta 3001
- [ ] Hub Web rodando na porta 3005
- [ ] TechCare Web rodando na porta 3000
- [ ] Todas as .env.local com portas corretas
```

---

## 7. Arquivos Modificados

| Arquivo | Alteração |
|---------|-----------|
| `facter-techcare/facter-techcare-api/.env` | PORT, DATABASE_URL, REDIS_URL |
| `facter-hub/facter-hub-api/.env` | PORT |
| `facter-techcare/facter-techcare-web/.env.local` | NEXT_PUBLIC_API_URL, NEXT_PUBLIC_HUB_API_URL |
| `facter-hub/facter-hub-web/.env.local` | NEXT_PUBLIC_API_URL |

---

*Documentado por Claude Code em 2026-01-26*
