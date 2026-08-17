# Padrões TypeScript

> **Regras e padrões para uso de TypeScript nos projetos Facter.**

---

## Regra de Ouro: NUNCA Gambiarras

> **PROIBIDO:** `as any`, `as unknown as Type`, `@ts-ignore`, `@ts-expect-error` sem justificativa

```typescript
// ❌ NUNCA
const data = response as any;
const user = obj as unknown as User;
// @ts-ignore
brokenFunction();

// ✅ SEMPRE resolver o problema real
const data: ApiResponse = response;
const user = validateAndParseUser(obj);
```

---

## Configuração Obrigatória

### tsconfig.json

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

---

## Tipos Explícitos

### APIs Públicas

```typescript
// ❌ Tipos implícitos em APIs públicas
function fetchUser(id) {
  return api.get(`/users/${id}`);
}

// ✅ Tipos explícitos
function fetchUser(id: string): Promise<User> {
  return api.get<User>(`/users/${id}`);
}
```

### Retorno de Funções

```typescript
// ❌ Retorno implícito
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ✅ Retorno explícito
function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

---

## Tipos vs Interfaces

### Use `interface` para:
- Objetos que podem ser estendidos
- Contratos de API
- Props de componentes

```typescript
interface User {
  id: string;
  name: string;
}

interface AdminUser extends User {
  permissions: string[];
}

interface ButtonProps {
  variant: 'primary' | 'secondary';
  onClick: () => void;
}
```

### Use `type` para:
- Unions e intersections
- Tipos utilitários
- Aliases simples

```typescript
type UserRole = 'admin' | 'user' | 'guest';
type UserWithRole = User & { role: UserRole };
type PartialUser = Partial<User>;
type UserId = string;
```

---

## Generics

### Básico

```typescript
// ✅ Generics para reusabilidade com type safety
function getFirstItem<T>(items: T[]): T | undefined {
  return items[0];
}

// Uso
const firstUser = getFirstItem<User>(users);
const firstNumber = getFirstItem([1, 2, 3]);
```

### Com Constraints

```typescript
// ✅ Constraints quando necessário
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

// Uso
const userName = getProperty(user, 'name'); // OK
const invalid = getProperty(user, 'invalid'); // ❌ Erro de compilação
```

### Em Componentes React

```typescript
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string;
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <ul>
      {items.map(item => (
        <li key={keyExtractor(item)}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}
```

---

## Discriminated Unions

```typescript
// ✅ Para estados mutuamente exclusivos
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

function renderState<T>(state: AsyncState<T>) {
  switch (state.status) {
    case 'idle':
      return <Idle />;
    case 'loading':
      return <Loading />;
    case 'success':
      return <Success data={state.data} />; // TypeScript sabe que data existe
    case 'error':
      return <Error error={state.error} />; // TypeScript sabe que error existe
  }
}
```

---

## Utility Types

### Nativos do TypeScript

```typescript
// Partial - todos os campos opcionais
type PartialUser = Partial<User>;

// Required - todos os campos obrigatórios
type RequiredUser = Required<User>;

// Pick - seleciona campos
type UserName = Pick<User, 'name' | 'email'>;

// Omit - remove campos
type UserWithoutId = Omit<User, 'id'>;

// Record - objeto tipado
type UserRoles = Record<string, UserRole>;

// ReturnType - tipo de retorno de função
type FetchResult = ReturnType<typeof fetchUser>;

// Parameters - tipos dos parâmetros
type FetchParams = Parameters<typeof fetchUser>;
```

### Customizados

```typescript
// Nullable
type Nullable<T> = T | null;

// DeepPartial
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// NonNullableFields
type NonNullableFields<T> = {
  [P in keyof T]: NonNullable<T[P]>;
};
```

---

## Enums vs Union Types

### Prefira Union Types

```typescript
// ❌ Evite enums (problemas com tree-shaking)
enum Status {
  Active = 'active',
  Inactive = 'inactive',
}

// ✅ Prefira union types
type Status = 'active' | 'inactive';

// ✅ Ou const objects para valores + tipos
const Status = {
  Active: 'active',
  Inactive: 'inactive',
} as const;

type Status = typeof Status[keyof typeof Status];
```

---

## Type Guards

### typeof

```typescript
function process(value: string | number) {
  if (typeof value === 'string') {
    // TypeScript sabe que é string aqui
    return value.toUpperCase();
  }
  // TypeScript sabe que é number aqui
  return value.toFixed(2);
}
```

### instanceof

```typescript
function handleError(error: Error | ValidationError) {
  if (error instanceof ValidationError) {
    // TypeScript sabe que é ValidationError
    return { field: error.field, message: error.message };
  }
  return { message: error.message };
}
```

### Custom Type Guards

```typescript
interface Dog {
  bark(): void;
}

interface Cat {
  meow(): void;
}

// Type guard customizado
function isDog(animal: Dog | Cat): animal is Dog {
  return 'bark' in animal;
}

function makeSound(animal: Dog | Cat) {
  if (isDog(animal)) {
    animal.bark(); // TypeScript sabe que é Dog
  } else {
    animal.meow(); // TypeScript sabe que é Cat
  }
}
```

---

## Assertions (Quando Usar)

### Non-null Assertion (!)

```typescript
// ❌ Evite - esconde erros
const element = document.getElementById('app')!;

// ✅ Prefira - trate o null
const element = document.getElementById('app');
if (!element) {
  throw new Error('Element not found');
}
```

### Type Assertion (as)

```typescript
// ❌ Perigoso - pode estar errado
const user = data as User;

// ✅ Valide antes
function isUser(data: unknown): data is User {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'name' in data
  );
}

if (isUser(data)) {
  // Agora é seguro
  const user = data;
}
```

---

## Zod para Validação Runtime

```typescript
import { z } from 'zod';

// Schema = Validação + Tipo
const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  age: z.number().int().positive().optional(),
});

// Tipo inferido do schema
type User = z.infer<typeof userSchema>;

// Validação em runtime
function parseUser(data: unknown): User {
  return userSchema.parse(data); // Throws se inválido
}

// Validação safe
function safeParseUser(data: unknown) {
  const result = userSchema.safeParse(data);
  if (result.success) {
    return result.data; // User tipado
  }
  return null;
}
```

---

## Erros Comuns

### 1. Object Index

```typescript
// ❌ Erro comum
const obj = { a: 1, b: 2 };
const key = 'a';
const value = obj[key]; // Error: no index signature

// ✅ Solução 1: Type assertion no key
const value = obj[key as keyof typeof obj];

// ✅ Solução 2: Record type
const obj: Record<string, number> = { a: 1, b: 2 };
const value = obj[key];
```

### 2. Array Methods

```typescript
// ❌ Pode ser undefined
const first = items[0];

// ✅ Com noUncheckedIndexedAccess
const first = items[0]; // first: T | undefined

// ✅ Ou use .at()
const first = items.at(0); // first: T | undefined
```

### 3. Event Handlers

```typescript
// ❌ Event implícito
const handleChange = (e) => { ... };

// ✅ Event tipado
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
};
```

---

## Checklist de TypeScript

- [ ] `strict: true` no tsconfig
- [ ] Nenhum `any` no código
- [ ] Nenhum `@ts-ignore` sem justificativa
- [ ] Tipos explícitos em funções públicas
- [ ] Generics onde faz sentido
- [ ] Type guards para narrowing
- [ ] Zod para validação runtime de dados externos

---

**Relacionados:**
- [Código](./codigo.md) - Clean Code, SOLID
- [React](./react.md) - Padrões React com TypeScript

**Voltar para** [Padrões](../README.md)
