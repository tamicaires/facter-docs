# Facter Boilerplate - Finalização de Task

> Checklist para finalizar uma task corretamente.
> **Use este guia ao concluir cada task.**

---

## Quick Checklist

```
□ 1. Código implementado e funcionando
□ 2. Testes passando (se aplicável)
□ 3. Commit feito com padrão correto
□ 4. TASK-TRACKER.md atualizado
□ 5. Arquivo da task atualizado (status ✅)
□ 6. Sprint file atualizado (se necessário)
□ 7. checklist.md atualizado (se aplicável)
□ 8. Próxima task marcada como 🔜
```

---

## Passo a Passo Detalhado

### 1. Verificar Implementação

```bash
# Backend
cd facter-boilerplate/facter-boilerplate-api
pnpm lint
pnpm build
pnpm test  # se tiver testes

# Frontend
cd facter-boilerplate/facter-boilerplate-web
pnpm lint
pnpm build
pnpm test  # se tiver testes
```

**Checklist de código:**
- [ ] Código segue os padrões do projeto
- [ ] Sem erros de lint
- [ ] Build passa sem erros
- [ ] Funcionalidade testada manualmente

---

### 2. Fazer Commit

**Formato:**
```bash
git add .
git commit -m "[FACTBP-XXX] tipo(escopo): descrição

- detalhe 1
- detalhe 2

Refs: FACTBP-XXX"
```

**Exemplos:**
```bash
# Backend
git commit -m "[FACTBP-API] feat(auth): add PasswordService with bcrypt

- hash with cost 12
- compare method
- password validation"

# Frontend
git commit -m "[FACTBP-WEB] feat(auth): add login page

- LoginForm component
- useLogin hook
- validation with zod"

# Infra
git commit -m "[FACTBP-INFRA] chore(docker): add docker-compose for dev"
```

---

### 3. Atualizar TASK-TRACKER.md

**Localização:** `docs/boilerplate/TASK-TRACKER.md`

**Alterações necessárias:**

#### 3.1 Atualizar a task concluída
```markdown
# De:
| FACTBP-API-001 | Setup Prisma | 🔄 | 2024-12-15 | - | [Link](...) |

# Para:
| FACTBP-API-001 | Setup Prisma | ✅ | 2024-12-15 | 2024-12-15 | [Link](...) |
```

#### 3.2 Atualizar barra de progresso da sprint
```markdown
# De:
**Sprint 1 Progress:** `[██░░░░░░░░] 1/4`

# Para:
**Sprint 1 Progress:** `[████░░░░░░] 2/4`
```

#### 3.3 Atualizar "Task Atual"
```markdown
## Task Atual

> **Task concluída:** FACTBP-API-001 - Setup Prisma ✅
>
> **Próxima task:** [FACTBP-API-002 - Config Validation](./sprints/sprint-01/FACTBP-API-002-config-validation.md)
```

#### 3.4 Atualizar Quick Stats
```markdown
| Sprint 1 | 4 | 1 | 3 |  # Incrementar "Feito"
```

#### 3.5 Atualizar Status Geral
```markdown
| **Concluídas** | 1 |
| **Em Progresso** | 0 |
| **Pendentes** | 36 |

Progresso: [██░░░░░░░░░░░░░░░░░░] 3%
```

#### 3.6 Marcar próxima task como 🔜
```markdown
| FACTBP-API-002 | Config Validation | 🔜 | - | - | [Link](...) |
```

---

### 4. Atualizar Arquivo da Task

**Localização:** `docs/boilerplate/sprints/sprint-XX/FACTBP-XXX-*.md`

**Alterações:**

```markdown
# No topo do arquivo, mudar:
## Status: ⏳ Pendente

# Para:
## Status: ✅ Concluído (2024-12-15)
```

**E marcar as subtasks:**
```markdown
| # | Task | Status |
|---|------|--------|
| 1.1 | Criar PrismaService | ✅ |
| 1.2 | Criar PrismaModule | ✅ |
| 1.3 | Executar migration | ✅ |
| 1.4 | Criar seed | ✅ |
```

---

### 5. Atualizar Sprint File (se necessário)

**Localização:** `docs/boilerplate/sprints/sprint-XX.md`

**Quando atualizar:**
- Quando todas as tasks de uma história forem concluídas
- Quando a sprint inteira for concluída

**Alterações:**
```markdown
# Mudar status da história:
| FACTBP-API-001 | Setup Prisma | ✅ |

# Se sprint completa, mudar resumo:
| **Status** | ✅ Concluído |
```

---

### 6. Atualizar checklist.md (se aplicável)

**Localização:** `docs/boilerplate/checklist.md`

**Quando atualizar:**
- Quando um item do checklist for concluído
- Itens maiores que correspondem a funcionalidades completas

**Alterações:**
```markdown
# De:
| ⏳ | Prisma Service | NestJS integration |

# Para:
| ✅ | Prisma Service | NestJS integration |
```

---

### 7. Atualizar Notas (se necessário)

**Localização:** `docs/boilerplate/TASK-TRACKER.md` (seção "Notas e Decisões")

**Quando adicionar nota:**
- Decisão técnica importante tomada
- Mudança de escopo
- Bug encontrado e resolvido
- Dependência descoberta

**Formato:**
```markdown
### 2024-12-15
- FACTBP-API-001: Decidido usar bcrypt com cost 12 (padrão OWASP)
- FACTBP-API-001: Migration inicial criada com sucesso
```

---

### 8. Commit da Documentação

```bash
git add docs/
git commit -m "[FACTBP-DOCS] chore: update task tracker - FACTBP-XXX completed"
```

---

## Template de Finalização

> Copie e preencha ao finalizar uma task:

```markdown
## Task Finalizada

**ID:** FACTBP-XXX
**Nome:** [nome da task]
**Data:** YYYY-MM-DD

### Arquivos de código alterados:
- [ ] arquivo1.ts
- [ ] arquivo2.ts

### Documentação atualizada:
- [ ] TASK-TRACKER.md
- [ ] sprints/sprint-XX/FACTBP-XXX-*.md
- [ ] sprints/sprint-XX.md (se aplicável)
- [ ] checklist.md (se aplicável)

### Commit:
```
[FACTBP-XXX] tipo(escopo): descrição
```

### Notas:
-
```

---

## Atalho para IA

> Ao finalizar uma task, diga para a IA:

```
Task FACTBP-XXX concluída.

Atualize:
1. TASK-TRACKER.md - marcar como ✅, atualizar progresso
2. sprints/sprint-XX/FACTBP-XXX-*.md - status ✅
3. Próxima task como 🔜

Data: [hoje]
```

---

## Checklist Visual

```
TASK CONCLUÍDA
     │
     ▼
┌─────────────────────────────────────────┐
│  1. CÓDIGO                              │
│     □ Lint passa                        │
│     □ Build passa                       │
│     □ Testes passam                     │
│     □ Funciona manualmente              │
└─────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────┐
│  2. COMMIT                              │
│     □ Padrão [FACTBP-XXX] tipo(escopo)  │
│     □ Mensagem descritiva               │
└─────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────┐
│  3. TASK-TRACKER.md                     │
│     □ Status: ✅                        │
│     □ Data fim preenchida               │
│     □ Barra de progresso atualizada     │
│     □ "Task Atual" atualizada           │
│     □ Quick Stats atualizado            │
│     □ Próxima task: 🔜                  │
└─────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────┐
│  4. ARQUIVO DA TASK                     │
│     □ Status: ✅ Concluído (data)       │
│     □ Subtasks marcadas ✅              │
└─────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────┐
│  5. OUTROS (se necessário)              │
│     □ sprint-XX.md                      │
│     □ checklist.md                      │
│     □ Notas adicionadas                 │
└─────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────┐
│  6. COMMIT DOCS                         │
│     □ [FACTBP-DOCS] chore: update...    │
└─────────────────────────────────────────┘
     │
     ▼
   PRONTO! 🎉
```

---

## Quando uma Sprint é Concluída

Checklist adicional:

```
□ Todas as tasks da sprint estão ✅
□ Sprint file atualizado com Status: ✅ Concluído
□ sprints/README.md atualizado
□ TASK-TRACKER.md - sprint inteira marcada
□ checklist.md - seção da sprint atualizada
□ Commit: [FACTBP-DOCS] chore: complete sprint X
```

---

## Quando o Projeto é Concluído

Checklist final:

```
□ Todas as 7 sprints concluídas
□ Todos os testes passando
□ Build de produção funcionando
□ Docker compose funcionando
□ CI/CD configurado e passando
□ README.md principal atualizado
□ Documentação final revisada
□ Tag de release criada: v1.0.0
```

---

## Links Úteis

| Documento | Uso |
|-----------|-----|
| [START.md](./START.md) | Visão geral |
| [TASK-TRACKER.md](./TASK-TRACKER.md) | Status das tasks |
| [checklist.md](./checklist.md) | Checklist geral |
| [sprints/README.md](./sprints/README.md) | Overview das sprints |

---

*Última atualização: 2024-12-15*
