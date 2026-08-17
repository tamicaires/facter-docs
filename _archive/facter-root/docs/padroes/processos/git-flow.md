# Git Flow

> **Estratégia de branching e fluxo de trabalho Git nos projetos Facter.**

---

## Branches Principais

| Branch | Propósito | Protegida |
|--------|-----------|-----------|
| `main` | Produção | Sim |
| `develop` | Desenvolvimento | Sim |

---

## Branches de Trabalho

| Tipo | Prefixo | Origem | Destino | Exemplo |
|------|---------|--------|---------|---------|
| Feature | `feature/` | `develop` | `develop` | `feature/user-profile` |
| Bugfix | `bugfix/` | `develop` | `develop` | `bugfix/login-error` |
| Hotfix | `hotfix/` | `main` | `main` + `develop` | `hotfix/critical-fix` |
| Release | `release/` | `develop` | `main` + `develop` | `release/1.2.0` |

---

## Fluxo Visual

```
main     ─────●─────────────────────────●─────────────●─────
              │                         │             │
              │    hotfix/critical      │             │
              │    ┌──●──┐              │             │
              │    │     │              │             │
              └────┤     ├──────────────┤             │
                   │     │              │             │
develop  ─────●────┴──●──┴────●────●────●─────●───────●─────
              │               │    │          │       │
              │               │    │          │       │
feature/a     └───●───●───────┘    │          │       │
                                   │          │       │
feature/b                          └──●───●───┘       │
                                                      │
release/1.0                                    └──●───┘
```

---

## Workflow

### 1. Nova Feature

```bash
# 1. Atualizar develop
git checkout develop
git pull origin develop

# 2. Criar branch
git checkout -b feature/user-profile

# 3. Desenvolver (commits frequentes)
git add .
git commit -m "feat(users): add profile page structure"

# 4. Manter atualizado
git fetch origin
git rebase origin/develop

# 5. Push
git push -u origin feature/user-profile

# 6. Abrir PR para develop
```

### 2. Bugfix

```bash
# Mesmo fluxo de feature, mas com prefixo bugfix/
git checkout -b bugfix/login-validation
```

### 3. Hotfix (Produção)

```bash
# 1. Criar do main
git checkout main
git pull origin main
git checkout -b hotfix/critical-security-fix

# 2. Corrigir e commitar
git commit -m "fix(auth): patch security vulnerability"

# 3. Merge para main E develop
# Via PR para main (deploy imediato)
# Via PR para develop (manter sincronizado)
```

### 4. Release

```bash
# 1. Criar do develop
git checkout develop
git pull origin develop
git checkout -b release/1.2.0

# 2. Apenas bugfixes e preparação
git commit -m "chore: bump version to 1.2.0"

# 3. Merge para main (deploy)
# 4. Merge para develop (sincronizar)
# 5. Tag na main
git tag -a v1.2.0 -m "Release 1.2.0"
git push origin v1.2.0
```

---

## Commits

### Conventional Commits

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Tipos

| Tipo | Uso | Exemplo |
|------|-----|---------|
| `feat` | Nova funcionalidade | `feat(users): add profile page` |
| `fix` | Correção de bug | `fix(auth): resolve token expiration` |
| `docs` | Documentação | `docs(readme): update installation` |
| `style` | Formatação | `style: fix indentation` |
| `refactor` | Refatoração | `refactor(api): extract base service` |
| `test` | Testes | `test(users): add unit tests` |
| `chore` | Manutenção | `chore(deps): update dependencies` |
| `perf` | Performance | `perf(query): optimize user list` |

### Boas Práticas

```bash
# ✅ BOM - específico e claro
git commit -m "feat(users): add email validation on registration form"

# ❌ RUIM - vago
git commit -m "fix stuff"
git commit -m "update"
git commit -m "wip"
```

---

## Pull Requests

### Título

```
feat(users): add user profile page
```

### Descrição (Template)

```markdown
## Descrição
Breve descrição do que foi feito.

## Tipo de Mudança
- [ ] Feature
- [ ] Bugfix
- [ ] Hotfix
- [ ] Refactor
- [ ] Docs

## Como Testar
1. Passo 1
2. Passo 2

## Screenshots (se aplicável)

## Checklist
- [ ] Código compila
- [ ] Testes passam
- [ ] Documentação atualizada
```

### Regras

- **Mínimo 1 aprovação** para merge
- **Squash and Merge** para manter histórico limpo
- **Branch deletada** após merge

---

## Proteção de Branches

### main

- [ ] Require pull request
- [ ] Require 1 approval
- [ ] Require status checks to pass
- [ ] Require branches to be up to date
- [ ] No direct pushes

### develop

- [ ] Require pull request
- [ ] Require 1 approval
- [ ] Require status checks to pass

---

## Comandos Úteis

### Atualizar Branch

```bash
# Rebase (preferido - histórico linear)
git fetch origin
git rebase origin/develop

# Merge (se muitos conflitos)
git fetch origin
git merge origin/develop
```

### Resolver Conflitos

```bash
# Durante rebase
git rebase origin/develop
# Resolver conflitos
git add .
git rebase --continue

# Abortar se necessário
git rebase --abort
```

### Desfazer Commit Local

```bash
# Desfazer último commit (manter mudanças)
git reset --soft HEAD~1

# Desfazer último commit (descartar mudanças)
git reset --hard HEAD~1
```

### Stash

```bash
# Guardar mudanças temporariamente
git stash

# Recuperar
git stash pop

# Listar
git stash list
```

---

## O Que NUNCA Fazer

```bash
# ❌ NUNCA force push em branch compartilhada
git push --force origin develop

# ❌ NUNCA commit direto na main/develop
git checkout main
git commit -m "quick fix"  # ERRADO!

# ❌ NUNCA rebase de branch pública
git rebase develop  # Se já tem PR aberto

# ❌ NUNCA commitar secrets
git add .env  # ERRADO!
```

---

## Checklist Git

- [ ] Branch criada do lugar correto
- [ ] Commits seguem Conventional Commits
- [ ] Branch atualizada antes de PR
- [ ] PR tem descrição clara
- [ ] Código revisado e aprovado
- [ ] CI passou
- [ ] Squash and Merge

---

**Relacionados:**
- [Code Review](../desenvolvimento/code-review.md)
- [Versionamento](./versionamento.md)

**Voltar para** [Padrões](../README.md)
