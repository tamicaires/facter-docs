# Padrões React

> **Padrões e boas práticas para desenvolvimento React nos projetos Facter.**

---

## Estrutura de Componente

```typescript
// Ordem recomendada dentro de um componente
export function MyComponent({ prop1, prop2 }: Props) {
  // 1. Hooks (useState, useContext, custom hooks)
  const [state, setState] = useState<State>(initialState);
  const { data } = useMyContext();

  // 2. Derived state / Memos
  const derivedValue = useMemo(() => computeValue(data), [data]);

  // 3. Effects
  useEffect(() => {
    // side effects
  }, [dependencies]);

  // 4. Handlers
  const handleClick = useCallback(() => {
    // handler logic
  }, [dependencies]);

  // 5. Early returns (loading, error, empty states)
  if (isLoading) return <Loading />;
  if (error) return <Error error={error} />;
  if (!data) return null;

  // 6. Render
  return (
    <Container>
      {/* JSX */}
    </Container>
  );
}
```

---

## Componentes

### Function Components (Padrão)

```typescript
// ✅ Function component com tipagem
interface UserCardProps {
  user: User;
  onSelect?: (user: User) => void;
}

export function UserCard({ user, onSelect }: UserCardProps) {
  return (
    <div onClick={() => onSelect?.(user)}>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
}
```

### forwardRef

```typescript
// Para componentes que precisam expor ref
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, ...props }, ref) => {
    return (
      <div>
        {label && <label>{label}</label>}
        <input ref={ref} {...props} />
        {error && <span className="error">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
```

---

## Custom Hooks

### Estrutura

```typescript
// ✅ Hook para buscar dados
export function useUser(userId: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchUser() {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getUser(userId);
        if (!cancelled) {
          setUser(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchUser();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return { user, loading, error };
}
```

### Com React Query (Preferido)

```typescript
// ✅ Hook com React Query - mais limpo e poderoso
export function useUser(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => api.getUser(userId),
    enabled: !!userId,
  });
}

// Hook para mutação
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUserData) => api.updateUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}
```

---

## Estado

### useState

```typescript
// ✅ Estado local simples
const [count, setCount] = useState(0);
const [user, setUser] = useState<User | null>(null);

// ✅ Estado com função inicializadora (para cálculos pesados)
const [data, setData] = useState(() => computeExpensiveValue());
```

### useReducer

```typescript
// ✅ Para estado complexo com múltiplas ações
type State = {
  items: Item[];
  loading: boolean;
  error: Error | null;
};

type Action =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: Item[] }
  | { type: 'FETCH_ERROR'; payload: Error };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, items: action.payload };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}
```

### Zustand (UI State)

```typescript
// ✅ Para estado de UI compartilhado
import { create } from 'zustand';

interface DialogStore {
  isOpen: boolean;
  data: DialogData | null;
  open: (data: DialogData) => void;
  close: () => void;
}

export const useDialogStore = create<DialogStore>((set) => ({
  isOpen: false,
  data: null,
  open: (data) => set({ isOpen: true, data }),
  close: () => set({ isOpen: false, data: null }),
}));
```

---

## Context

### Quando Usar
- Tema
- Autenticação
- Configurações globais
- **NÃO para server state** (use React Query)

### Estrutura

```typescript
// 1. Criar contexto
interface AuthContextValue {
  user: User | null;
  login: (credentials: Credentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// 2. Provider
export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (credentials: Credentials) => {
    const user = await api.login(credentials);
    setUser(user);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// 3. Hook customizado
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

---

## Composição

### Composition over Props Drilling

```typescript
// ❌ Props drilling
<GrandParent user={user}>
  <Parent user={user}>
    <Child user={user}>
      <GrandChild user={user} />
    </Child>
  </Parent>
</GrandParent>

// ✅ Composition
<Layout>
  <Header userMenu={<UserMenu user={user} />} />
  <Sidebar navigation={<Navigation items={navItems} />} />
  <Content>
    <UserProfile user={user} />
  </Content>
</Layout>
```

### Compound Components

```typescript
// ✅ Compound Components para APIs declarativas
<DataTable data={items} columns={columns}>
  <DataTable.Toolbar>
    <DataTable.Search placeholder="Buscar..." />
    <DataTable.Filters />
  </DataTable.Toolbar>
  <DataTable.Content />
  <DataTable.Pagination />
</DataTable>
```

---

## Performance

### Memoization

```typescript
// memo - para componentes que re-renderizam frequentemente
const ExpensiveList = memo(function ExpensiveList({ items }: Props) {
  return items.map(item => <ExpensiveItem key={item.id} item={item} />);
});

// useMemo - para cálculos pesados
const sortedItems = useMemo(
  () => items.sort((a, b) => a.value - b.value),
  [items]
);

// useCallback - para funções passadas como props
const handleClick = useCallback((id: string) => {
  onSelect(id);
}, [onSelect]);
```

### Quando NÃO usar memo

```typescript
// ❌ Não precisa - componente simples
const Button = memo(({ onClick, children }) => (
  <button onClick={onClick}>{children}</button>
));

// ❌ Não precisa - props mudam sempre
const DynamicComponent = memo(({ data }) => (
  <div>{JSON.stringify(data)}</div> // data muda a cada render
));
```

### Code Splitting

```typescript
// ✅ Lazy loading de rotas/componentes pesados
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Reports = lazy(() => import('./pages/Reports'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reports" element={<Reports />} />
      </Routes>
    </Suspense>
  );
}
```

---

## Forms

### React Hook Form + Zod

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  email: z.string().email('Email inválido'),
  age: z.number().int().positive().optional(),
});

type FormData = z.infer<typeof schema>;

export function UserForm({ onSubmit }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input
        label="Nome"
        error={errors.name?.message}
        {...register('name')}
      />
      <Input
        label="Email"
        error={errors.email?.message}
        {...register('email')}
      />
      <Button type="submit" loading={isSubmitting}>
        Salvar
      </Button>
    </form>
  );
}
```

---

## Error Handling

### Error Boundary

```typescript
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Enviar para serviço de monitoramento
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <DefaultErrorFallback />;
    }
    return this.props.children;
  }
}
```

---

## Testing

### Component Testing

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { UserCard } from './UserCard';

describe('UserCard', () => {
  const mockUser = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
  };

  it('renders user information', () => {
    render(<UserCard user={mockUser} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('calls onSelect when clicked', () => {
    const onSelect = vi.fn();
    render(<UserCard user={mockUser} onSelect={onSelect} />);

    fireEvent.click(screen.getByRole('button'));

    expect(onSelect).toHaveBeenCalledWith(mockUser);
  });
});
```

### Hook Testing

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUser } from './useUser';

const wrapper = ({ children }) => (
  <QueryClientProvider client={new QueryClient()}>
    {children}
  </QueryClientProvider>
);

describe('useUser', () => {
  it('fetches user data', async () => {
    const { result } = renderHook(() => useUser('1'), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(expectedUser);
  });
});
```

---

## Checklist React

- [ ] Componentes pequenos e focados
- [ ] Custom hooks para lógica reutilizável
- [ ] React Query para server state
- [ ] Zustand para UI state compartilhado
- [ ] Context apenas para dados globais (tema, auth)
- [ ] Error Boundaries em pontos estratégicos
- [ ] Lazy loading para rotas pesadas
- [ ] Memoization onde faz diferença
- [ ] Testes para comportamento crítico

---

**Relacionados:**
- [TypeScript](./typescript.md) - Tipagem em React
- [Testes](./testes.md) - Padrões de testes

**Voltar para** [Padrões](../README.md)
