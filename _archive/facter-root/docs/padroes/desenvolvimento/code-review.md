# Code Review

> **Checklist e boas práticas para revisão de código nos projetos Facter.**

---

## Propósito do Code Review

1. **Qualidade** - Garantir padrões de código
2. **Conhecimento** - Compartilhar conhecimento entre o time
3. **Bugs** - Identificar problemas antes de produção
4. **Consistência** - Manter padrões do projeto

---

## Checklist do Autor (Antes de Abrir PR)

### Código

- [ ] Código compila sem erros (`npm run build`)
- [ ] Testes passam (`npm test`)
- [ ] Lint passa (`npm run lint`)
- [ ] Nenhum `console.log` esquecido
- [ ] Nenhum `any` ou `@ts-ignore` sem justificativa
- [ ] Nenhum código comentado
- [ ] Nomes significativos em variáveis e funções
- [ ] Funções pequenas e focadas (< 30 linhas)
- [ ] Early returns onde aplicável
- [ ] Tratamento de erros adequado

### Testes

- [ ] Novos testes para novas funcionalidades
- [ ] Testes cobrem edge cases
- [ ] Coverage não diminuiu
- [ ] Testes são significativos (não só coverage)

### PR

- [ ] Branch atualizada com main
- [ ] Título descritivo (Conventional Commits)
- [ ] Descrição clara do que foi feito
- [ ] Screenshots se houver mudança visual
- [ ] Link para issue relacionada

---

## Checklist do Revisor

### Primeira Passada - Visão Geral

- [ ] O PR resolve o problema proposto?
- [ ] A abordagem faz sentido?
- [ ] O tamanho do PR é razoável? (< 400 linhas ideal)
- [ ] Há documentação necessária?

### Segunda Passada - Código

#### Legibilidade
- [ ] Código é auto-explicativo?
- [ ] Nomes são claros e significativos?
- [ ] Complexidade é necessária?
- [ ] Comentários explicam o "porquê", não o "o quê"?

#### Padrões
- [ ] Segue os padrões do projeto?
- [ ] Estrutura de arquivos está correta?
- [ ] Imports organizados?
- [ ] Formatação consistente?

#### TypeScript
- [ ] Tipos estão corretos e completos?
- [ ] Nenhum `any` desnecessário?
- [ ] Generics usados corretamente?
- [ ] Nullability tratada?

#### React (se aplicável)
- [ ] Hooks seguem as regras?
- [ ] Memoization necessária está presente?
- [ ] Sem re-renders desnecessários?
- [ ] Estado no lugar certo (local vs store)?

#### Backend (se aplicável)
- [ ] Use case com responsabilidade única?
- [ ] Validações presentes?
- [ ] Erros tratados corretamente?
- [ ] Queries otimizadas?

### Terceira Passada - Segurança e Performance

#### Segurança
- [ ] Dados sensíveis protegidos?
- [ ] Validação de input presente?
- [ ] Sem SQL injection, XSS, etc?
- [ ] Autenticação/autorização corretas?

#### Performance
- [ ] Sem operações N+1?
- [ ] Sem loops desnecessários?
- [ ] Lazy loading onde aplicável?
- [ ] Bundle size considerado?

---

## Como Dar Feedback

### Níveis de Severidade

| Prefixo | Significado | Ação |
|---------|-------------|------|
| `[blocker]` | Problema crítico | Deve ser corrigido |
| `[major]` | Problema importante | Deveria ser corrigido |
| `[minor]` | Sugestão de melhoria | Considerar |
| `[nit]` | Nitpick/cosmético | Opcional |
| `[question]` | Dúvida | Precisa esclarecimento |
| `[praise]` | Elogio | Reconhecimento |

### Exemplos

```
[blocker] Essa query pode causar N+1. Precisamos adicionar um include aqui.

[major] Esse componente está re-renderizando desnecessariamente.
Considere usar useMemo para o cálculo de `sortedItems`.

[minor] Poderíamos extrair essa lógica para um custom hook para
reutilização em outros lugares.

[nit] Prefiro `items.length === 0` ao invés de `!items.length`
para maior clareza, mas fica a seu critério.

[question] Por que escolhemos usar Zustand aqui ao invés de
estado local? Não estou vendo esse estado sendo compartilhado.

[praise] Excelente uso de discriminated unions aqui!
Ficou muito mais type-safe.
```

### Boas Práticas de Feedback

**✅ Faça:**
- Seja específico e construtivo
- Sugira alternativas quando criticar
- Reconheça o que está bom
- Pergunte antes de assumir
- Foque no código, não na pessoa

**❌ Evite:**
- Comentários vagos ("não gostei")
- Tom agressivo ou passivo-agressivo
- Excesso de nitpicks
- Bloquear por preferência pessoal
- Demorar muito para revisar

---

## Tamanho do PR

### Ideal
- **< 200 linhas** - Revisão rápida e efetiva
- **200-400 linhas** - Aceitável para features
- **> 400 linhas** - Considerar dividir

### Como Dividir PRs Grandes

1. **Por camada** - Backend separado do Frontend
2. **Por feature** - Features independentes
3. **Por tipo** - Refactor separado de feature
4. **Stacked PRs** - PRs dependentes em sequência

---

## Conventional Commits

### Formato

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Tipos

| Tipo | Uso |
|------|-----|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `docs` | Documentação |
| `style` | Formatação (não afeta código) |
| `refactor` | Refatoração (não muda comportamento) |
| `test` | Testes |
| `chore` | Manutenção, configs |

### Exemplos

```
feat(users): add user profile page
fix(auth): resolve token refresh race condition
docs(readme): update installation instructions
refactor(api): extract base service class
test(users): add tests for user creation
chore(deps): update React to v18.3
```

---

## Merge Strategy

### Squash and Merge (Padrão)
- Commits limpos no main
- Histórico linear
- Usar para features normais

### Merge Commit
- Preserva histórico detalhado
- Usar para releases, merges de branches longas

### Rebase and Merge
- Histórico linear sem merge commits
- Usar com cuidado (reescreve histórico)

---

## Tempo de Review

| Tamanho | Tempo Esperado |
|---------|----------------|
| < 100 linhas | Mesmo dia |
| 100-300 linhas | 1 dia útil |
| 300-500 linhas | 2 dias úteis |
| > 500 linhas | Considerar dividir |

### Se Não Puder Revisar

- Avise o autor
- Sugira outro revisor
- Não deixe PR parado sem comunicação

---

## Resolução de Conflitos

1. **Discussão no PR** - Tentar resolver via comentários
2. **Call Rápida** - Se texto não resolver
3. **Tech Lead** - Se não houver acordo
4. **Documentar decisão** - Para referência futura

---

## Aprovação

### Quando Aprovar
- Código atende aos padrões
- Funcionalidade está correta
- Testes estão adequados
- Sem problemas de segurança

### Quando Pedir Mudanças
- Bugs identificados
- Violação de padrões
- Problemas de segurança
- Falta de testes críticos

### Quando Comentar (sem aprovar/rejeitar)
- Dúvidas não respondidas
- Precisa testar localmente
- Esperando outra aprovação

---

**Voltar para** [Padrões](../README.md)
