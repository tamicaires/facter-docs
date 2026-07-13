---
title: Paginacao
sidebar_position: 4
tags: [paginacao, backend, api, padroes]
---

# Padrao de Paginacao

Padrao unificado de paginacao para todas as listas do Facter Truck.

---

## Motivacao

Antes da padronizacao: multiplas interfaces de paginacao, parametros inconsistentes entre modulos, codigo duplicado em cada repository. O padrao unifica tudo em interfaces compartilhadas.

---

## Interfaces

### PaginationOptions

```typescript
export interface PaginationOptions {
  page: number;        // Pagina atual (default: 1)
  perPage: number;     // Itens por pagina (default: 20, max: 100)
  orderBy?: 'asc' | 'desc';  // Direcao da ordenacao (default: 'desc')
  orderField?: string;        // Campo de ordenacao (default: 'createdAt')
}
```

### PaginatedResult\<T\>

```typescript
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
```

---

## Constantes

```typescript
export const DEFAULT_PAGE = 1;
export const DEFAULT_PER_PAGE = 20;
export const MAX_PER_PAGE = 100;
```

---

## Helpers

### createPaginatedResult

```typescript
export function createPaginatedResult<T>(
  data: T[],
  total: number,
  options: PaginationOptions,
): PaginatedResult<T> {
  const totalPages = Math.ceil(total / options.perPage);
  return {
    data,
    total,
    page: options.page,
    perPage: options.perPage,
    totalPages,
    hasNextPage: options.page < totalPages,
    hasPreviousPage: options.page > 1,
  };
}
```

### normalizePaginationOptions

```typescript
export function normalizePaginationOptions(
  raw: Partial<PaginationOptions>,
): PaginationOptions {
  return {
    page: Math.max(1, raw.page ?? DEFAULT_PAGE),
    perPage: Math.min(MAX_PER_PAGE, Math.max(1, raw.perPage ?? DEFAULT_PER_PAGE)),
    orderBy: raw.orderBy ?? 'desc',
    orderField: raw.orderField ?? 'createdAt',
  };
}
```

### calculateOffset

```typescript
export function calculateOffset(options: PaginationOptions): number {
  return (options.page - 1) * options.perPage;
}
```

---

## Uso por Camada

### Repository (Abstract)

```typescript
export abstract class VehicleRepository {
  abstract findMany(
    companyId: string,
    options: PaginationOptions,
    filters?: VehicleFilters,
  ): Promise<PaginatedResult<Vehicle>>;
}
```

### Repository (Prisma Implementation)

```typescript
async findMany(
  companyId: string,
  options: PaginationOptions,
  filters?: VehicleFilters,
): Promise<PaginatedResult<Vehicle>> {
  const where = { companyId, ...this.buildFilters(filters) };

  const [data, total] = await Promise.all([
    this.prisma.vehicle.findMany({
      where,
      skip: calculateOffset(options),
      take: options.perPage,
      orderBy: { [options.orderField]: options.orderBy },
    }),
    this.prisma.vehicle.count({ where }),
  ]);

  return createPaginatedResult(data.map(v => new Vehicle(v)), total, options);
}
```

### Use Case

```typescript
@Injectable()
export class ListVehiclesUseCase {
  constructor(private readonly vehicleRepository: VehicleRepository) {}

  async execute(
    companyId: string,
    rawOptions: Partial<PaginationOptions>,
    filters?: VehicleFilters,
  ): Promise<PaginatedResult<Vehicle>> {
    const options = normalizePaginationOptions(rawOptions);
    return this.vehicleRepository.findMany(companyId, options, filters);
  }
}
```

### Controller

```typescript
@Get()
async list(
  @CurrentCompany() company: CompanyInstance,
  @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  @Query('perPage', new DefaultValuePipe(20), ParseIntPipe) perPage: number,
  @Query('orderBy') orderBy?: 'asc' | 'desc',
  @Query('orderField') orderField?: string,
  @Query('search') search?: string,
) {
  return this.listVehicles.execute(
    company.id,
    { page, perPage, orderBy, orderField },
    { search },
  );
}
```

---

## Filtros Domain-Specific

Cada dominio pode ter seus proprios filtros alem da paginacao:

```typescript
export interface VehicleFilters {
  search?: string;
  fleetId?: string;
  isActive?: boolean;
}

export interface WorkOrderFilters {
  search?: string;
  status?: MaintenanceStatus;
  priority?: WorkOrderPriority;
  vehicleId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}
```

---

## Paginacao e obrigatoria para listas

Nenhum endpoint de listagem pode retornar todos os registros sem paginacao. Isso e uma regra obrigatoria do projeto para garantir performance.

---

## Referencias

- [Performance](./performance) -- Otimizacoes de queries
- [Clean Architecture](./clean-architecture) -- Estrutura de repositories
