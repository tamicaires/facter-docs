---
title: Performance
sidebar_position: 5
tags: [performance, backend, frontend, padroes]
---

# Performance

Diretrizes de performance para backend e frontend do Facter Truck.

---

## Backend

### N+1 Queries -- PROIBIDO

Nunca buscar registros em loop. Sempre usar `include` ou `joins`:

```typescript
// ERRADO: N+1
const workOrders = await prisma.workOrder.findMany({ where: { companyId } });
for (const wo of workOrders) {
  wo.vehicle = await prisma.vehicle.findUnique({ where: { id: wo.vehicleId } });
}

// CORRETO: Include
const workOrders = await prisma.workOrder.findMany({
  where: { companyId },
  include: {
    vehicle: true,
    services: { include: { service: true, employee: true } },
  },
});
```

### Agregacoes no Banco, Nunca em JS

Agregacoes complexas (SUM, COUNT, GROUP BY) devem ser feitas no banco de dados, nunca em JavaScript:

```typescript
// ERRADO: Agregar em JS
const workOrders = await prisma.workOrder.findMany({ where: { companyId } });
const totalByStatus = workOrders.reduce((acc, wo) => {
  acc[wo.status] = (acc[wo.status] || 0) + 1;
  return acc;
}, {});

// CORRETO: Raw query
const result = await prisma.$queryRaw<StatusCount[]>(Prisma.sql`
  SELECT status, COUNT(*)::int as count
  FROM "WorkOrder"
  WHERE company_id = ${companyId}
  GROUP BY status
`);
```

### Raw Queries

Para agregacoes, usar raw queries em `src/infra/database/prisma/queries/`:

- Sempre usar `Prisma.sql` (parametrizado), **nunca** `$queryRawUnsafe`
- Tipar resultado com interface
- Usar `::int` / `::float` nos casts SQL para evitar BigInt

```typescript
// src/infra/database/prisma/queries/dashboard-queries.ts
interface DashboardCounts {
  total_work_orders: number;
  in_queue: number;
  in_maintenance: number;
  waiting_parts: number;
}

export async function getDashboardCounts(
  prisma: PrismaService,
  companyId: string,
): Promise<DashboardCounts> {
  const [result] = await prisma.$queryRaw<DashboardCounts[]>(Prisma.sql`
    SELECT
      COUNT(*)::int as total_work_orders,
      COUNT(*) FILTER (WHERE status = 'Fila')::int as in_queue,
      COUNT(*) FILTER (WHERE status = 'Manutencao')::int as in_maintenance,
      COUNT(*) FILTER (WHERE status = 'AguardandoPeca')::int as waiting_parts
    FROM "WorkOrder"
    WHERE company_id = ${companyId}
  `);
  return result;
}
```

### Quando usar Prisma ORM vs Raw Queries

| Cenario | Usar |
|---------|------|
| CRUD simples (create, read, update, delete) | Prisma ORM |
| Queries com includes/relations | Prisma ORM |
| Agregacoes (SUM, COUNT, AVG, GROUP BY) | Raw queries |
| Relatorios complexos | Raw queries |
| Queries com window functions | Raw queries |

### Paginacao Obrigatoria

Toda listagem **deve** ter paginacao. Nenhum endpoint retorna todos os registros. Veja [Paginacao](./paginacao).

### Cache Strategy (Redis)

| Dado | TTL | Descricao |
|------|-----|-----------|
| Sessoes de usuario | 7 dias | JWT refresh tokens |
| Permissoes do membership | 1 hora | Cache RBAC |
| Configuracoes da company | 24 horas | Settings do tenant |
| Contadores de dashboard | 5 minutos | Agregacoes de metricas |

Invalidacao manual nos use cases que alteram dados cacheados.

### Event Emitters

Usar `EventEmitter2` apenas para operacoes nao-criticas e assincronas (activity logging, notificacoes). Nunca para fluxo de negocio principal. Se o evento falhar, o use case nao deve falhar.

---

## Frontend

### React.memo para Componentes de Lista

Componentes renderizados em listas devem usar `React.memo` para evitar re-renders desnecessarios:

```typescript
const VehicleCard = React.memo(({ vehicle }: { vehicle: Vehicle }) => {
  return <Card>...</Card>;
});
```

### useMemo e useCallback

Usar para computacoes caras e callbacks estabilizados:

```typescript
const vehicleAge = useMemo(() => {
  return new Date().getFullYear() - vehicle.year;
}, [vehicle.year]);

const handleSelect = useCallback((id: string) => {
  setSelectedId(id);
}, []);
```

### Code Splitting

Usar `lazy()` e `Suspense` para carregar features sob demanda:

```typescript
const VehiclePage = lazy(() => import('./features/vehicle/pages/VehiclePage'));

<Suspense fallback={<Loading />}>
  <VehiclePage />
</Suspense>
```

### TanStack Query

Configurar `staleTime` adequado para evitar refetches desnecessarios:

```typescript
useQuery({
  queryKey: ['vehicles', companyId],
  queryFn: () => vehicleService.list(companyId),
  staleTime: 5 * 60 * 1000, // 5 minutos
});
```

---

## Referencias

- [Paginacao](./paginacao) -- Padrao de paginacao
- [Visao Geral da Arquitetura](../arquitetura/visao-geral) -- Cache strategy
