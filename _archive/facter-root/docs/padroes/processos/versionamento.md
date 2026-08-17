# Versionamento

> **Padrões de versionamento semântico nos projetos Facter.**

---

## Semantic Versioning (SemVer)

```
MAJOR.MINOR.PATCH

Exemplo: 1.4.2
         │ │ │
         │ │ └── PATCH: Correções de bugs
         │ └──── MINOR: Novas funcionalidades (retrocompatíveis)
         └────── MAJOR: Breaking changes
```

---

## Quando Incrementar

### MAJOR (1.0.0 → 2.0.0)

**Breaking changes** - Mudanças que quebram compatibilidade:

- Remover endpoint de API
- Mudar estrutura de response
- Remover campo obrigatório
- Mudar comportamento existente
- Atualização de dependência major

```
Antes: GET /users → { id, name, email }
Depois: GET /users → { userId, fullName, emailAddress }
```

### MINOR (1.0.0 → 1.1.0)

**Novas funcionalidades** retrocompatíveis:

- Novo endpoint
- Novo campo opcional em response
- Nova feature
- Novo componente no Design System

```
Antes: GET /users → { id, name }
Depois: GET /users → { id, name, avatar } // Campo novo opcional
```

### PATCH (1.0.0 → 1.0.1)

**Correções** que não mudam API:

- Bugfix
- Correção de typo
- Melhoria de performance
- Atualização de dependência patch

---

## Versão Zero (0.x.x)

Durante desenvolvimento inicial:

- `0.x.x` - Qualquer mudança pode ser breaking
- API instável, em desenvolvimento
- Após estabilizar: `1.0.0`

---

## Pre-release

```
1.0.0-alpha.1   # Primeira versão alpha
1.0.0-alpha.2   # Segunda versão alpha
1.0.0-beta.1    # Primeira versão beta
1.0.0-rc.1      # Release candidate 1
1.0.0           # Versão final
```

### Ordem de Precedência

```
1.0.0-alpha < 1.0.0-alpha.1 < 1.0.0-beta < 1.0.0-rc.1 < 1.0.0
```

---

## Changelog

### Formato

```markdown
# Changelog

## [1.2.0] - 2025-01-15

### Added
- Novo endpoint de relatórios (#123)
- Filtro por data na listagem de OS (#124)

### Changed
- Melhorada performance da query de usuários (#125)

### Fixed
- Corrigido erro de validação no formulário de login (#126)

### Deprecated
- Endpoint GET /v1/old-users será removido na v2.0

### Removed
- Removido suporte a Node 16

### Security
- Atualizado bcrypt para corrigir vulnerabilidade

## [1.1.0] - 2025-01-01
...
```

### Categorias

| Categoria | Descrição |
|-----------|-----------|
| Added | Novas funcionalidades |
| Changed | Mudanças em funcionalidades existentes |
| Deprecated | Funcionalidades que serão removidas |
| Removed | Funcionalidades removidas |
| Fixed | Correções de bugs |
| Security | Correções de segurança |

---

## Git Tags

### Criar Tag

```bash
# Tag anotada (recomendado)
git tag -a v1.2.0 -m "Release 1.2.0"

# Push da tag
git push origin v1.2.0

# Push de todas as tags
git push origin --tags
```

### Listar Tags

```bash
git tag -l "v1.*"
```

---

## Package.json

```json
{
  "name": "@facter/app",
  "version": "1.2.0",
  "description": "Facter Application"
}
```

### Atualizar Versão

```bash
# Patch (1.2.0 → 1.2.1)
npm version patch

# Minor (1.2.0 → 1.3.0)
npm version minor

# Major (1.2.0 → 2.0.0)
npm version major

# Específica
npm version 1.5.0
```

---

## Monorepo (Design System)

### Changesets

```bash
# Criar changeset
pnpm changeset

# Aplicar versões
pnpm changeset version

# Publicar
pnpm changeset publish
```

### Versionamento Independente

Cada pacote tem sua própria versão:

```
@facter/ds-core: 1.2.0
@facter/ds-utils: 1.0.5
@facter/ds-forms: 0.8.0
```

---

## API Versioning

### URL Path (Recomendado)

```
/v1/users
/v2/users
```

### Regras

1. **Manter versões anteriores** por mínimo 6 meses
2. **Deprecation notice** via header e docs
3. **Comunicar breaking changes** com antecedência

### Deprecation Header

```
Deprecation: true
Sunset: Sat, 01 Jun 2025 00:00:00 GMT
Link: </v2/users>; rel="successor-version"
```

---

## Comunicação de Releases

### Internamente

1. Changelog atualizado
2. Notificação no Slack/Teams
3. Documentação atualizada

### Externamente (se API pública)

1. Email para usuários afetados
2. Post em blog/docs
3. Período de migração adequado

---

## Checklist de Release

- [ ] Versão atualizada no package.json
- [ ] Changelog atualizado
- [ ] Tag criada no Git
- [ ] Documentação atualizada
- [ ] Breaking changes comunicados
- [ ] Testes passando
- [ ] Deploy realizado

---

**Relacionados:**
- [Git Flow](./git-flow.md) - Fluxo de branches
- [Deploy](./deploy.md) - Processo de deploy

**Voltar para** [Padrões](../README.md)
