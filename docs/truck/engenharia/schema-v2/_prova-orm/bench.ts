import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/prisma/client';
import { drizzle } from 'drizzle-orm/node-postgres';
import { and, count, desc, eq, gte, sql } from 'drizzle-orm';
import * as schema from './drizzle/schema';
import * as relations from './drizzle/relations';

const COMPANY = '3d2abcec-ea59-413e-acd3-e2e43ee7e844';
const WO = '05b7750f-3322-43ed-acab-30e30bfafb82';
const SINCE = new Date(Date.now() - 365 * 24 * 3600 * 1000);
const WARMUP = 30;
const RUNS = Number(process.env.RUNS ?? 300);
const CONCURRENCY = 20;

const url = process.env.BENCH_URL ?? process.env.DATABASE_URL!;
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url, max: 10 }) });
const pool = new Pool({ connectionString: url, max: 10 });
const db = drizzle(pool, { schema: { ...schema, ...relations } });
const rawPool = new Pool({ connectionString: url, max: 10 });

type Fn = () => Promise<unknown>;

const cases: Record<string, Record<string, Fn>> = {
  'Q1 detalhe da OS (serviços, executores, peças)': {
    prisma: () => prisma.work_orders.findUnique({
      where: { id: WO },
      include: {
        fleets: { select: { fleet_number: true } },
        service_executions: {
          include: {
            services: { select: { service_name: true } },
            service_execution_employee: { include: { employees: { select: { name: true } } } },
          },
        },
        part_requests: true,
      },
    }),
    'prisma (join)': () => prisma.work_orders.findUnique({
      relationLoadStrategy: 'join',
      where: { id: WO },
      include: {
        fleets: { select: { fleet_number: true } },
        service_executions: { include: { services: { select: { service_name: true } }, service_execution_employee: { include: { employees: { select: { name: true } } } } } },
        part_requests: true,
      },
    } as any),
    drizzle: () => db.query.workOrders.findFirst({
      where: eq(schema.workOrders.id, WO),
      with: {
        fleet: { columns: { fleetNumber: true } },
        serviceExecutions: {
          with: {
            service: { columns: { serviceName: true } },
            serviceExecutionEmployees: { with: { employee: { columns: { name: true } } } },
          },
        },
        partRequests: true,
      },
    }),
    'SQL puro (pg)': () => rawPool.query(
      `select w.*, f.fleet_number,
        (select coalesce(json_agg(json_build_object('se', se, 'service_name', s.service_name,
           'employees', (select coalesce(json_agg(json_build_object('see', see, 'name', e.name)), '[]')
                         from service_execution_employee see join employees e on e.id = see.employee_id
                         where see.service_assignment_id = se.id))), '[]')
         from service_executions se join services s on s.id = se.service_id where se.work_order_id = w.id) as services,
        (select coalesce(json_agg(pr), '[]') from part_requests pr where pr.work_order_id = w.id) as part_requests
       from work_orders w join fleets f on f.id = w.fleet_id where w.id = $1`, [WO]),
  },
  'Q2 lista paginada (20 OS, frota, nº de serviços)': {
    prisma: () => prisma.work_orders.findMany({
      where: { company_id: COMPANY },
      orderBy: { created_at: 'desc' },
      take: 20,
      include: { fleets: { select: { fleet_number: true } }, _count: { select: { service_executions: true } } },
    }),
    drizzle: () => db.query.workOrders.findMany({
      where: eq(schema.workOrders.companyId, COMPANY),
      orderBy: desc(schema.workOrders.createdAt),
      limit: 20,
      with: { fleet: { columns: { fleetNumber: true } } },
      extras: {
        serviceCount: sql<number>`(select count(*) from service_executions se where se.work_order_id = ${schema.workOrders.id})`.as('service_count'),
      },
    }),
    'SQL puro (pg)': () => rawPool.query(
      `select w.*, f.fleet_number,
        (select count(*) from service_executions se where se.work_order_id = w.id) as service_count
       from work_orders w join fleets f on f.id = w.fleet_id
       where w.company_id = $1 order by w.created_at desc limit 20`, [COMPANY]),
  },
  'Q3 agregação (OS por status, 12 meses)': {
    prisma: () => prisma.work_orders.groupBy({
      by: ['status'],
      where: { company_id: COMPANY, created_at: { gte: SINCE } },
      _count: { _all: true },
    }),
    drizzle: () => db.select({ status: schema.workOrders.status, total: count() })
      .from(schema.workOrders)
      .where(and(eq(schema.workOrders.companyId, COMPANY), gte(schema.workOrders.createdAt, SINCE.toISOString())))
      .groupBy(schema.workOrders.status),
    'SQL puro (pg)': () => rawPool.query(
      `select status, count(*) from work_orders where company_id = $1 and created_at >= $2 group by status`,
      [COMPANY, SINCE]),
  },
};

function pct(sorted: number[], p: number) {
  return sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))];
}

async function sequential(fn: Fn) {
  for (let i = 0; i < WARMUP; i++) await fn();
  const times: number[] = [];
  for (let i = 0; i < RUNS; i++) {
    const t = performance.now();
    await fn();
    times.push(performance.now() - t);
  }
  return times.sort((a, b) => a - b);
}

async function concurrent(fn: Fn) {
  const times: number[] = [];
  const start = performance.now();
  let next = 0;
  await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
    while (next < RUNS) {
      next++;
      const t = performance.now();
      await fn();
      times.push(performance.now() - t);
    }
  }));
  const elapsed = (performance.now() - start) / 1000;
  return { times: times.sort((a, b) => a - b), rps: RUNS / elapsed };
}

async function main() {
  const rows: string[] = [];
  for (const [name, impls] of Object.entries(cases)) {
    for (const [impl, fn] of Object.entries(impls)) {
      const seq = await sequential(fn);
      const conc = await concurrent(fn);
      rows.push([name, impl, pct(seq, 50).toFixed(2), pct(seq, 95).toFixed(2),
        pct(conc.times, 50).toFixed(2), pct(conc.times, 95).toFixed(2), conc.rps.toFixed(0)].join(' | '));
    }
  }
  console.log('consulta | implementação | seq p50 ms | seq p95 ms | 20 simult. p50 ms | 20 simult. p95 ms | req/s');
  for (const r of rows) console.log(r);
  await prisma.$disconnect(); await pool.end(); await rawPool.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
