# Clean Code Guidelines - Facter Boilerplate

> Diretrizes para manter código limpo e organizado.

---

## Use Cases

### Quando dividir em métodos privados

O método `execute()` deve ser **orquestrador** - delega para métodos privados que fazem o trabalho real.

**Sinais de que precisa dividir:**
- Método com mais de 20-30 linhas
- Comentários separando "seções" do código
- Múltiplas responsabilidades (validar, buscar, criar, mapear)
- Código que poderia ser reutilizado

**Estrutura recomendada:**

```typescript
@Injectable()
export class SomeUseCase {
  async execute(dto: InputDto): Promise<OutputDto> {
    // 1. Validações (throw exceptions)
    await this.validateSomething(dto.field);

    // 2. Preparação de dados
    const preparedData = this.prepareData(dto);

    // 3. Operação principal
    const result = await this.performMainOperation(preparedData);

    // 4. Montar response
    return this.buildResponse(result);
  }

  // Validações - throw exception se inválido
  private async validateSomething(field: string): Promise<void> { }

  // Preparação - transformar/processar dados
  private prepareData(dto: InputDto): PreparedData { }

  // Operação - lógica de negócio principal
  private async performMainOperation(data: PreparedData): Promise<Result> { }

  // Response - mapear para DTO de saída
  private buildResponse(result: Result): OutputDto { }
}
```

### Categorias de métodos privados

| Prefixo | Uso | Exemplo |
|---------|-----|---------|
| `validate*` | Validações que lançam exception | `validateEmailNotExists()` |
| `check*` | Verificações que retornam boolean | `checkUserIsActive()` |
| `prepare*` | Preparar/transformar dados | `prepareUserData()` |
| `create*` | Criar entidades (geralmente em transação) | `createUserWithCompany()` |
| `build*` | Montar objetos de response | `buildTokenResponse()` |
| `generate*` | Gerar valores | `generateSlug()` |
| `map*` | Mapear entre tipos | `mapToMembershipDto()` |

### Exemplo Real: RegisterUseCase

```typescript
// ❌ RUIM - execute fazendo tudo
async execute(dto: RegisterDto): Promise<TokenResponseDto> {
  // 50+ linhas de código misturando validação, criação, mapeamento...
}

// ✅ BOM - execute como orquestrador
async execute(dto: RegisterDto): Promise<TokenResponseDto> {
  await this.validateEmailNotExists(dto.user.email);

  const slug = dto.company.slug || this.generateSlug(dto.company.name);
  await this.validateSlugNotExists(slug);

  const hashedPassword = await this.passwordService.hash(dto.user.password);
  const result = await this.createUserWithCompany(dto, hashedPassword, slug);

  return this.buildTokenResponse(result);
}
```

---

## Comentários

### Quando usar

- **NÃO use** para explicar O QUE o código faz (código deve ser auto-explicativo)
- **USE** para explicar POR QUE algo foi feito de certa forma
- **USE** para avisos importantes ou decisões de negócio

```typescript
// ❌ RUIM
// Verifica se usuário existe
const user = await this.prisma.user.findUnique({ where: { email } });

// ✅ BOM - código auto-explicativo, sem comentário necessário
const existingUser = await this.prisma.user.findUnique({ where: { email } });

// ✅ BOM - explica o porquê
// Usamos findFirst porque a constraint unique é composta (action + subject)
const permission = await this.prisma.permission.findFirst({
  where: { action: 'manage', subject: 'all' },
});
```

---

## Nomes

### Variáveis e métodos

- Nomes devem expressar intenção
- Evitar abreviações obscuras
- Usar verbos para métodos, substantivos para variáveis

```typescript
// ❌ RUIM
const u = await this.prisma.user.findUnique({ where: { email: e } });
const res = await this.doStuff(u);

// ✅ BOM
const existingUser = await this.prisma.user.findUnique({ where: { email } });
const tokenResponse = await this.buildTokenResponse(user);
```

### Booleanos

Prefixos: `is`, `has`, `can`, `should`

```typescript
// ❌ RUIM
const active = user.active;
const permission = canDoThing();

// ✅ BOM
const isActive = user.isActive;
const hasPermission = canPerformAction();
```

---

## Funções Puras vs Side Effects

### Identificar e separar

```typescript
// Função pura - mesmo input = mesmo output, sem side effects
private generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

// Side effect - modifica estado externo (banco, cache, etc)
private async createUser(data: CreateUserData): Promise<User> {
  return this.prisma.user.create({ data });
}
```

### Benefícios

- Funções puras são fáceis de testar
- Side effects isolados são fáceis de mockar
- Código mais previsível

---

## Tratamento de Erros

### Fail fast

Validações no início, falhar cedo:

```typescript
async execute(dto: InputDto): Promise<OutputDto> {
  // Validações primeiro - fail fast
  await this.validateEmailNotExists(dto.email);
  await this.validateCompanySlugNotExists(dto.slug);

  // Se chegou aqui, dados são válidos
  // ... resto da lógica
}
```

### Exceptions específicas

Criar exceptions específicas para cada caso:

```typescript
// ❌ RUIM
throw new Error('User already exists');
throw new ConflictException('User already exists');

// ✅ BOM
throw new UserAlreadyExistsException();
throw new CompanySlugExistsException();
```

---

## Checklist para Code Review

Antes de commitar, verificar:

- [ ] Método `execute()` tem menos de 20-30 linhas?
- [ ] Responsabilidades estão separadas em métodos privados?
- [ ] Nomes expressam claramente a intenção?
- [ ] Comentários explicam "por quê" e não "o quê"?
- [ ] Validações estão no início (fail fast)?
- [ ] Exceptions são específicas para cada caso de erro?

---

*Última atualização: 2025-12-15*
