# OAuth SSO Integration - Bug Fixes Documentation

> **Data:** 2026-01-27
> **Contexto:** Integração OAuth entre TechCare e Hub
> **Serviços envolvidos:** TechCare Web (3000), TechCare API (3001), Hub API (3002), Hub Web (3005)

---

## Sumário de Bugs

| # | Bug | Severidade | Status |
|---|-----|------------|--------|
| 1 | [Loop infinito no OAuth callback](#bug-1-loop-infinito-no-oauth-callback) | Alta | ✅ Resolvido |
| 2 | [hubUserId com valor incorreto no TechCare](#bug-2-hubuserid-com-valor-incorreto) | Alta | ✅ Resolvido |
| 3 | [403 Forbidden - Membership not found](#bug-3-403-forbidden-membership-not-found) | Alta | ✅ Resolvido |
| 4 | [Usuário não redirecionado para seleção de empresa](#bug-4-usuario-nao-redirecionado-para-selecao-de-empresa) | Média | ✅ Resolvido |
| 5 | [TypeScript errors após atualização do MembershipDto](#bug-5-typescript-errors-no-hub-api) | Média | ✅ Resolvido |

---

## Bug 1: Loop Infinito no OAuth Callback

### Sintomas
- Após login bem-sucedido no Hub, usuário ficava em loop entre `/callback` e `/dashboard`
- Console mostrava redirecionamentos infinitos
- Cookies de autenticação não eram enviados corretamente

### Causa Raiz
Dois problemas combinados:

1. **TransformInterceptor wrapping**: O Hub API usa um interceptor que envolve todas as respostas em `{ data: ... }`. O frontend verificava `data.success` mas o valor real estava em `data.data.success`.

2. **router.push() não enviava cookies**: O Next.js `router.push()` faz navegação client-side que não garante que cookies httpOnly sejam enviados na próxima requisição.

### Solução

**Arquivo:** `facter-techcare-web/src/app/(auth)/callback/_components/callback-handler.tsx`

```typescript
// ANTES (incorreto)
const data = await res.json();
if (data.success) {
  router.push(data.redirect || '/dashboard');
}

// DEPOIS (correto)
const json = await res.json();
// API wraps responses in { data: ... } due to TransformInterceptor
const data = json.data ?? json;

if (data.success) {
  // Use window.location for full page navigation to ensure cookies are sent
  window.location.href = data.redirect || '/dashboard';
}
```

### Por que funciona
- `json.data ?? json` extrai os dados corretamente independente do wrapper
- `window.location.href` força navegação completa (full page reload), garantindo que o browser envie todos os cookies na próxima requisição

---

## Bug 2: hubUserId com Valor Incorreto

### Sintomas
- Após login, usuário não tinha memberships associados
- Queries no TechCare retornavam dados vazios
- Relacionamento User ↔ Hub User quebrado

### Causa Raiz
O seed do TechCare usava um `hubUserId` hardcoded (`'hub_user_admin'`), mas o Hub gera CUIDs reais (ex: `cmjgd0gtf000luo2cakvo3kcx`).

### Solução

1. **Consultar IDs reais do Hub:**
```sql
-- No banco do Hub (porta 5433)
SELECT id, email FROM "User" WHERE email = 'admin@facter.com.br';
-- Resultado: cmjgd0gtf000luo2cakvo3kcx

SELECT id, name FROM "Company" WHERE slug = 'facter';
-- Resultado: cmjswa2o1000uuovsip1ymx1u
```

2. **Atualizar TechCare com IDs corretos:**
```sql
-- No banco do TechCare (porta 5434)
UPDATE "User" SET "hubUserId" = 'cmjgd0gtf000luo2cakvo3kcx' WHERE email = 'admin@facter.com.br';
UPDATE "Company" SET "hubCompanyId" = 'cmjswa2o1000uuovsip1ymx1u' WHERE slug = 'facter';
```

### Prevenção Futura
- Seeds devem usar IDs dinâmicos ou sincronizar com Hub
- Considerar script de sincronização automática entre Hub e produtos

---

## Bug 3: 403 Forbidden - Membership not found

### Sintomas
- Usuário logado mas recebia 403 em todas as rotas protegidas
- Response do `/auth/me` retornava `memberships: []` (array vazio)
- Erro: `{"error":{"code":"FORBIDDEN","message":"Membership not found"}}`

### Causa Raiz
O Hub API não retornava `companySlug` e `isActive` nos memberships. O TechCare usava Zod para validar a resposta, e quando campos obrigatórios faltavam, o Zod **silenciosamente** descartava os objetos inválidos, resultando em array vazio.

**Response do Hub (antes):**
```json
{
  "memberships": [{
    "id": "xxx",
    "companyId": "yyy",
    "companyName": "Facter",
    "role": "OWNER",
    "isOwner": true
    // Faltando: companySlug, isActive
  }]
}
```

**Schema Zod do TechCare (antes):**
```typescript
export const hubMembershipSchema = z.object({
  id: z.string(),
  companyId: z.string(),
  companyName: z.string(),
  companySlug: z.string(),      // ❌ Obrigatório mas Hub não enviava
  role: z.string(),
  isOwner: z.boolean(),
  isActive: z.boolean(),        // ❌ Obrigatório mas Hub não enviava
});
```

### Solução
Duas correções foram necessárias:

#### 1. TechCare: Tornar campos opcionais (correção imediata)

**Arquivo:** `facter-techcare-api/src/infra/hub/types/hub.types.ts`

```typescript
export const hubMembershipSchema = z.object({
  id: z.string(),
  companyId: z.string(),
  companyName: z.string(),
  companySlug: z.string().optional(),              // Agora opcional
  role: z.string(),
  isOwner: z.boolean(),
  isActive: z.boolean().optional().default(true),  // Agora opcional com default
});
```

#### 2. Hub: Retornar todos os campos (correção definitiva)

**Arquivo:** `facter-hub-api/src/application/auth/dto/token-response.dto.ts`

```typescript
export class MembershipDto {
  id: string;
  companyId: string;
  companyName: string;
  companySlug: string;   // ✅ Adicionado
  role: string;
  isOwner: boolean;
  isActive: boolean;     // ✅ Adicionado
}
```

**Arquivos atualizados para retornar os novos campos:**
- `login.use-case.ts`
- `refresh-token.use-case.ts`
- `switch-company.use-case.ts`
- `register.use-case.ts`
- `get-me.use-case.ts`

**Padrão de mapeamento:**
```typescript
const memberships: MembershipDto[] = user.memberships.map((m) => ({
  id: m.id,
  companyId: m.companyId,
  companyName: m.company.name,
  companySlug: m.company.slug,  // ✅ Novo
  role: m.role.slug,
  isOwner: m.isOwner,
  isActive: m.isActive,         // ✅ Novo
}));
```

### Lição Aprendida
- **Zod com `.array()` falha silenciosamente** quando objetos não passam na validação
- Sempre logar o response raw antes da validação Zod durante debug
- Manter contratos de API sincronizados entre serviços

---

## Bug 4: Usuário Não Redirecionado para Seleção de Empresa

### Sintomas
- Usuário sem empresa selecionada ia direto para `/dashboard`
- Deveria ir para `/select-company` para escolher uma empresa
- Resultava em 403 porque nenhum `currentMembership` estava setado

### Causa Raiz
A função `needsCompanySelection` retornava `false` quando `memberships.length === 0`, fazendo o usuário ir para dashboard mesmo sem empresas.

**Código anterior:**
```typescript
export function needsCompanySelection(
  currentCompanyId: string | null,
  memberships: Membership[]
): boolean {
  // Se só tem uma empresa, não precisa selecionar
  if (memberships.length === 1) return false;

  // Múltiplas empresas mas nenhuma selecionada
  if (memberships.length > 1 && !currentCompanyId) return true;

  return false;  // ❌ Retorna false para memberships.length === 0
}
```

### Solução

**Arquivo:** `facter-techcare-web/src/features/auth/helpers/company-resolver.ts`

```typescript
export function needsCompanySelection(
  currentCompanyId: string | null,
  memberships: Membership[]
): boolean {
  // No memberships at all - needs to go to selection to see empty state
  if (memberships.length === 0) return true;  // ✅ Corrigido

  // Single membership - auto-select, no need for selection screen
  if (memberships.length === 1) return false;

  // Multiple memberships but none selected
  if (memberships.length > 1 && !currentCompanyId) return true;

  return false;
}
```

### Por que funciona
- Usuário sem memberships é redirecionado para tela de seleção
- Tela de seleção pode mostrar estado vazio apropriado
- Evita 403 por tentar acessar recursos sem empresa selecionada

---

## Bug 5: TypeScript Errors no Hub API

### Sintomas
- Após adicionar `companySlug` e `isActive` ao `MembershipDto`, build falhava
- Erros em múltiplos use cases: propriedades faltando no mapeamento

### Causa Raiz
O TypeScript corretamente identificou que os use cases não estavam retornando os novos campos obrigatórios do DTO.

**Erro exemplo:**
```
src/application/auth/use-cases/register.use-case.ts:133:37
error TS2339: Property 'slug' does not exist on type '{ id: string; name: string }'.
```

### Solução
Atualizar todos os use cases para incluir os novos campos:

**Arquivo:** `register.use-case.ts` - Atualizar interface:
```typescript
interface TransactionResult {
  user: { id: string; email: string; name: string; avatar: string | null; hubRole: string };
  company: { id: string; name: string; slug: string };  // ✅ Adicionado slug
  membership: { id: string };
  ownerRole: { name: string };
}
```

**Arquivos corrigidos:**
1. `login.use-case.ts` - Já usava `m.company.slug` e `m.isActive`
2. `refresh-token.use-case.ts` - Adicionado mapeamento
3. `switch-company.use-case.ts` - Adicionado mapeamento
4. `register.use-case.ts` - Atualizado `TransactionResult` interface
5. `get-me.use-case.ts` - Adicionado mapeamento

---

## Diagrama do Fluxo OAuth Corrigido

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  TechCare Web   │     │    Hub API      │     │    Hub Web      │
│     :3000       │     │     :3002       │     │     :3005       │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         │ 1. /login             │                       │
         │──────────────────────>│                       │
         │                       │ 2. Redirect to Hub    │
         │<──────────────────────│   /oauth/authorize    │
         │                       │                       │
         │ 3. Redirect           │                       │
         │──────────────────────────────────────────────>│
         │                       │                       │
         │                       │   4. User logs in     │
         │                       │<──────────────────────│
         │                       │                       │
         │ 5. Callback with code │                       │
         │<──────────────────────│                       │
         │                       │                       │
         │ 6. Exchange code      │                       │
         │──────────────────────>│                       │
         │                       │                       │
         │ 7. Tokens + User      │                       │
         │   (with memberships)  │                       │
         │<──────────────────────│                       │
         │                       │                       │
         │ 8. Set cookies        │                       │
         │ 9. window.location    │                       │
         │    /select-company    │                       │
         │    or /dashboard      │                       │
         ▼                       │                       │
```

---

## Checklist de Verificação

Após aplicar as correções, verificar:

- [ ] Hub API compila sem erros (`pnpm build`)
- [ ] TechCare API compila sem erros (`pnpm build`)
- [ ] Login redireciona corretamente para Hub
- [ ] Callback não entra em loop
- [ ] `/auth/me` retorna memberships com `companySlug` e `isActive`
- [ ] Usuário sem empresa selecionada vai para `/select-company`
- [ ] Usuário com empresa selecionada acessa recursos sem 403

---

## Comandos Úteis para Debug

```bash
# Ver logs do Hub API
cd facter-hub/facter-hub-api && pnpm start:dev

# Ver logs do TechCare API
cd facter-techcare/facter-techcare-api && pnpm start:dev

# Testar /auth/me diretamente
curl -X GET http://localhost:3002/auth/me \
  -H "Authorization: Bearer <token>"

# Verificar dados no banco Hub
docker exec -it facter-hub-postgres psql -U postgres -d facter_hub
SELECT u.id, u.email, m.id as membership_id, c.slug
FROM "User" u
JOIN "Membership" m ON m."userId" = u.id
JOIN "Company" c ON c.id = m."companyId";

# Verificar dados no banco TechCare
docker exec -it techcare-postgres psql -U postgres -d techcare
SELECT id, email, "hubUserId" FROM "User";
```

---

*Documentação criada em 2026-01-27*
