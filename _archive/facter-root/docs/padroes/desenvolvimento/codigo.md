# Padrões de Código

> **Este documento é LEITURA OBRIGATÓRIA para todo desenvolvimento.**
> Define os padrões de qualidade esperados em código, arquitetura e práticas.

---

## Sumário

1. [Princípios Fundamentais](#princípios-fundamentais)
2. [Clean Code](#clean-code)
3. [SOLID Principles](#solid-principles)
4. [Design Patterns](#design-patterns)
5. [Tratamento de Erros](#tratamento-de-erros)
6. [Performance](#performance)
7. [Code Review Checklist](#code-review-checklist)

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

### 3. Explicitude sobre Implicitude

```typescript
// ❌ Implícito - o que significa true?
processOrder(order, true, false);

// ✅ Explícito - intenção clara
processOrder(order, {
  sendNotification: true,
  skipValidation: false,
});
```

---

## Clean Code

### Nomenclatura

| Tipo | Convenção | Exemplo |
|------|-----------|---------|
| Variáveis | camelCase, substantivo | `userName`, `orderList` |
| Funções | camelCase, verbo | `getUserById`, `calculateTotal` |
| Constantes | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT`, `API_BASE_URL` |
| Componentes | PascalCase | `UserProfile`, `OrderList` |
| Tipos/Interfaces | PascalCase | `UserData`, `OrderItem` |
| Arquivos de componente | PascalCase | `UserProfile.tsx` |
| Arquivos de util | kebab-case | `format-date.ts` |

### Nomes Significativos

```typescript
// ❌ Nomes genéricos ou abreviados
const d = new Date();
const arr = users.filter(u => u.a);
const handleClick = () => { ... };

// ✅ Nomes que revelam intenção
const currentDate = new Date();
const activeUsers = users.filter(user => user.isActive);
const handleUserSelection = () => { ... };
```

### Funções

#### Tamanho
- **Máximo 20-30 linhas** (idealmente menos)
- Se precisar de scroll, quebre em funções menores

#### Single Responsibility
```typescript
// ❌ Função que faz muitas coisas
function processUser(user: User) {
  // valida
  // formata
  // salva
  // envia email
  // atualiza cache
}

// ✅ Funções com responsabilidade única
function validateUser(user: User): ValidationResult { ... }
function formatUserData(user: User): FormattedUser { ... }
function saveUser(user: FormattedUser): Promise<void> { ... }
function notifyUserCreation(user: User): Promise<void> { ... }
```

#### Parâmetros
- **Máximo 3 parâmetros** (idealmente 2)
- Use objeto para múltiplos parâmetros

```typescript
// ❌ Muitos parâmetros
function createUser(name: string, email: string, age: number, role: string, dept: string) { ... }

// ✅ Objeto de configuração
interface CreateUserParams {
  name: string;
  email: string;
  age: number;
  role: UserRole;
  department: string;
}
function createUser(params: CreateUserParams) { ... }
```

### Early Return

```typescript
// ❌ Nesting profundo
function processOrder(order: Order) {
  if (order) {
    if (order.isValid) {
      if (order.items.length > 0) {
        // lógica principal enterrada
      }
    }
  }
}

// ✅ Early return - guard clauses
function processOrder(order: Order) {
  if (!order) return;
  if (!order.isValid) return;
  if (order.items.length === 0) return;

  // lógica principal no nível principal
}
```

### Evite Comentários Óbvios

```typescript
// ❌ Comentário que repete o código
// Incrementa o contador
counter++;

// ✅ Código auto-explicativo não precisa de comentário
counter++;

// ✅ Comentário que explica o "porquê" (quando necessário)
// Delay de 100ms necessário devido a race condition no Safari
await delay(100);
```

---

## SOLID Principles

### S - Single Responsibility

```typescript
// ❌ Classe/função com múltiplas responsabilidades
class UserService {
  createUser() { /* ... */ }
  sendWelcomeEmail() { /* ... */ }
  generateReport() { /* ... */ }
  validateCreditCard() { /* ... */ }
}

// ✅ Cada classe/função com uma responsabilidade
class UserService {
  createUser() { /* ... */ }
}

class EmailService {
  sendWelcomeEmail() { /* ... */ }
}

class ReportService {
  generateReport() { /* ... */ }
}
```

### O - Open/Closed

```typescript
// ✅ Aberto para extensão, fechado para modificação
interface PaymentProcessor {
  process(amount: number): Promise<void>;
}

class CreditCardProcessor implements PaymentProcessor {
  async process(amount: number) { /* ... */ }
}

class PixProcessor implements PaymentProcessor {
  async process(amount: number) { /* ... */ }
}

// Adicionar novo método de pagamento não requer modificar código existente
class BoletoProcessor implements PaymentProcessor {
  async process(amount: number) { /* ... */ }
}
```

### L - Liskov Substitution

```typescript
// ✅ Subtipos devem ser substituíveis por seus tipos base
interface Bird {
  move(): void;
}

class Sparrow implements Bird {
  move() { this.fly(); }
  fly() { /* ... */ }
}

class Penguin implements Bird {
  move() { this.swim(); } // Ainda satisfaz o contrato
  swim() { /* ... */ }
}
```

### I - Interface Segregation

```typescript
// ❌ Interface muito grande
interface Worker {
  work(): void;
  eat(): void;
  sleep(): void;
  attendMeeting(): void;
}

// ✅ Interfaces segregadas
interface Workable {
  work(): void;
}

interface Feedable {
  eat(): void;
}

interface MeetingAttendee {
  attendMeeting(): void;
}

class Developer implements Workable, Feedable, MeetingAttendee {
  work() { /* ... */ }
  eat() { /* ... */ }
  attendMeeting() { /* ... */ }
}
```

### D - Dependency Inversion

```typescript
// ❌ Dependência direta de implementação
class OrderService {
  private emailService = new EmailService(); // acoplamento forte

  createOrder() {
    // ...
    this.emailService.send();
  }
}

// ✅ Dependência de abstração
interface NotificationService {
  send(message: string): void;
}

class OrderService {
  constructor(private notificationService: NotificationService) {}

  createOrder() {
    // ...
    this.notificationService.send('Order created');
  }
}
```

---

## Design Patterns

### Factory Pattern

```typescript
// Para criação de objetos complexos
interface Notification {
  send(message: string): void;
}

class EmailNotification implements Notification {
  send(message: string) { /* ... */ }
}

class SMSNotification implements Notification {
  send(message: string) { /* ... */ }
}

// Factory
function createNotification(type: 'email' | 'sms'): Notification {
  switch (type) {
    case 'email':
      return new EmailNotification();
    case 'sms':
      return new SMSNotification();
  }
}
```

### Strategy Pattern

```typescript
// Para algoritmos intercambiáveis
interface SortStrategy<T> {
  sort(items: T[]): T[];
}

const quickSort: SortStrategy<number> = {
  sort: (items) => { /* ... */ }
};

const mergeSort: SortStrategy<number> = {
  sort: (items) => { /* ... */ }
};

function sortItems<T>(items: T[], strategy: SortStrategy<T>): T[] {
  return strategy.sort(items);
}
```

### Adapter Pattern

```typescript
// Para integrar APIs externas
interface OurUserFormat {
  id: string;
  fullName: string;
  emailAddress: string;
}

interface ExternalApiUser {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
}

function adaptExternalUser(external: ExternalApiUser): OurUserFormat {
  return {
    id: String(external.user_id),
    fullName: `${external.first_name} ${external.last_name}`,
    emailAddress: external.email,
  };
}
```

---

## Tratamento de Erros

### Nunca Silenciar Erros

```typescript
// ❌ NUNCA
try {
  riskyOperation();
} catch (e) {
  // silenciado - bug escondido
}

// ❌ NUNCA
try {
  riskyOperation();
} catch (e) {
  console.log(e); // só log não é tratamento
}

// ✅ Trate ou propague
try {
  riskyOperation();
} catch (e) {
  logger.error('Operation failed', { error: e, context: relevantData });
  showUserFriendlyError('Algo deu errado. Tente novamente.');
  // ou
  throw new CustomError('Operation failed', { cause: e });
}
```

### Custom Errors

```typescript
class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public code: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public endpoint: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
```

---

## Performance

### Evite Operações Desnecessárias

```typescript
// ❌ Recalcula em cada iteração
items.forEach(item => {
  const config = loadConfig(); // Chamado N vezes
  process(item, config);
});

// ✅ Calcula uma vez
const config = loadConfig();
items.forEach(item => {
  process(item, config);
});
```

### Bundle Size

```typescript
// ❌ Import completo
import _ from 'lodash';
_.map(items, fn);

// ✅ Import específico
import map from 'lodash/map';
map(items, fn);

// ✅ Ou use ES modules nativos
items.map(fn);
```

---

## Code Review Checklist

### Antes de Abrir PR

- [ ] Código compila sem erros (`npm run build`)
- [ ] Testes passam (`npm test`)
- [ ] Lint passa (`npm run lint`)
- [ ] Nenhum `console.log` esquecido
- [ ] Nenhum `any` ou gambiarra de tipo
- [ ] Nomes significativos
- [ ] Funções pequenas e focadas
- [ ] Early returns onde aplicável
- [ ] Tratamento de erros adequado
- [ ] Testes cobrem casos importantes

### Durante Code Review

- [ ] Código é legível sem explicação?
- [ ] Segue os padrões do projeto?
- [ ] Tipos estão corretos e completos?
- [ ] Há casos não tratados?
- [ ] Performance é adequada?
- [ ] Testes são significativos?

---

## Resumo: As 10 Regras de Ouro

1. **Nunca gambiarras** - Se TypeScript reclama, resolva corretamente
2. **Nomes significativos** - Código deve ser auto-explicativo
3. **Funções pequenas** - Máximo 20-30 linhas, uma responsabilidade
4. **Early return** - Evite nesting profundo
5. **Tipos explícitos** - Especialmente em APIs públicas
6. **Trate erros** - Nunca silencie, sempre trate ou propague
7. **Teste comportamento** - Não implementação
8. **Composição** - Prefira sobre herança
9. **Imutabilidade** - Evite mutação de estado
10. **Simplicidade** - KISS (Keep It Simple, Stupid)

---

**Relacionados:**
- [TypeScript](./typescript.md) - Detalhes de tipagem
- [React](./react.md) - Padrões React
- [NestJS](./nestjs.md) - Padrões NestJS
- [Testes](./testes.md) - Padrões de testes

**Voltar para** [Padrões](../README.md)
