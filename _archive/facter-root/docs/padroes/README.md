# Padrões Facter

> **Padrões globais que todos os sistemas Facter devem seguir.**
> Este documento é **LEITURA OBRIGATÓRIA** para todo desenvolvedor.

---

## Estrutura

```
padroes/
├── desenvolvimento/     # Como escrever código
│   ├── codigo.md        # Clean Code, SOLID
│   ├── typescript.md    # Padrões TypeScript
│   ├── react.md         # Padrões React
│   ├── nestjs.md        # Padrões NestJS
│   ├── testes.md        # Estratégia de testes
│   └── code-review.md   # Checklist de review
│
├── arquitetura/         # Como estruturar sistemas
│   ├── frontend.md      # Arquitetura frontend
│   ├── backend.md       # Arquitetura backend
│   ├── banco-dados.md   # Modelagem de dados
│   ├── api-design.md    # Design de APIs
│   └── seguranca.md     # Segurança
│
├── infraestrutura/      # Como operar sistemas
│   ├── ambientes.md     # Dev, staging, prod
│   ├── ci-cd.md         # Pipelines
│   ├── docker.md        # Containerização
│   └── monitoramento.md # Observabilidade
│
└── processos/           # Como trabalhar
    ├── git-flow.md      # Branching
    ├── versionamento.md # Semantic versioning
    ├── deploy.md        # Processo de deploy
    └── incidentes.md    # Gestão de incidentes
```

---

## Princípios Fundamentais

### 1. Qualidade Não é Negociável
- **Nunca** sacrifique qualidade por velocidade
- **Nunca** use gambiarras ("funciona" não é suficiente)
- **Sempre** entenda o problema antes de codar
- **Sempre** deixe o código melhor do que encontrou

### 2. Código é Comunicação
```typescript
// ❌ Código que só a máquina entende
const x = d.filter(i => i.s === 'a' && i.v > 10).map(i => i.n);

// ✅ Código que humanos entendem
const activeHighValueItemNames = data
  .filter(item => item.status === 'active' && item.value > MIN_HIGH_VALUE)
  .map(item => item.name);
```

### 3. Consistência Acima de Preferência Pessoal
- Siga os padrões do projeto, mesmo que discorde
- Discuta mudanças em code review, não no código
- Um padrão consistente é melhor que vários "melhores" padrões

### 4. Documentação é Parte do Código
- Código sem documentação está incompleto
- README atualizado é obrigatório
- ADRs para decisões importantes

---

## Regras de Ouro

### TypeScript
```typescript
// ❌ PROIBIDO
const data = response as any;
// @ts-ignore
brokenFunction();

// ✅ OBRIGATÓRIO
const data: ApiResponse = response;
```

### React
```typescript
// ❌ EVITAR
useEffect(() => {
  fetchData();
}, []); // Sem cleanup, sem loading state

// ✅ PREFERIR
const { data, isLoading } = useQuery({
  queryKey: ['data'],
  queryFn: fetchData,
});
```

### NestJS
```typescript
// ❌ EVITAR
@Controller('users')
class UserController {
  async create(@Body() body: any) { ... }
}

// ✅ PREFERIR
@Controller('users')
class UserController {
  constructor(private createUserUseCase: CreateUser) {}

  async create(@Body() body: CreateUserDto) {
    return this.createUserUseCase.execute(body);
  }
}
```

---

## Checklist Rápido

### Antes de Commitar
- [ ] Código compila sem erros
- [ ] Testes passam
- [ ] Lint passa
- [ ] Sem `console.log` esquecido
- [ ] Sem `any` ou `@ts-ignore`
- [ ] Nomes significativos
- [ ] Funções pequenas e focadas

### Antes de Abrir PR
- [ ] Branch atualizada com main
- [ ] Descrição clara do que foi feito
- [ ] Screenshots se houver mudança visual
- [ ] Documentação atualizada se necessário

---

## Documentação Detalhada

| Documento | Conteúdo | Prioridade |
|-----------|----------|------------|
| [Código](./desenvolvimento/codigo.md) | Clean Code, SOLID, nomenclatura | 🔴 Alta |
| [TypeScript](./desenvolvimento/typescript.md) | Tipagem, generics, patterns | 🔴 Alta |
| [React](./desenvolvimento/react.md) | Componentes, hooks, estado | 🔴 Alta |
| [NestJS](./desenvolvimento/nestjs.md) | Módulos, use cases, guards | 🔴 Alta |
| [Testes](./desenvolvimento/testes.md) | Unit, integration, E2E | 🟡 Média |
| [Code Review](./desenvolvimento/code-review.md) | Checklist, boas práticas | 🟡 Média |
| [Frontend](./arquitetura/frontend.md) | Feature-based, estado | 🔴 Alta |
| [Backend](./arquitetura/backend.md) | Clean Architecture | 🔴 Alta |
| [API Design](./arquitetura/api-design.md) | REST, versionamento | 🟡 Média |
| [Segurança](./arquitetura/seguranca.md) | Auth, OWASP | 🔴 Alta |
| [Git Flow](./processos/git-flow.md) | Branching strategy | 🟡 Média |

---

## Enforcement

### Automatizado
- **ESLint** - Regras de código
- **TypeScript** - Tipagem strict
- **Prettier** - Formatação
- **Husky** - Pre-commit hooks
- **CI/CD** - Build e testes

### Manual
- **Code Review** - Obrigatório para merge
- **Pair Programming** - Para features complexas
- **Tech Review** - Para decisões arquiteturais

---

*Padrões são vivos - proponha melhorias via PR na documentação*
