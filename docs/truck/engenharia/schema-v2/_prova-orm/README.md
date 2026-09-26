# Prova Prisma × Drizzle (ADR-013)

Código da prova de 26/09/2026. Pasta com `_` não entra no site.

Para reproduzir: projeto Node com `prisma@7.10.0`, `@prisma/client@7.10.0`, `@prisma/adapter-pg@7.10.0`,
`drizzle-orm@0.45.3`, `drizzle-kit@0.31.11`, `pg`, `tsx`; `DATABASE_URL` apontando para `facter_truck_perf`;
`npx prisma db pull && npx prisma generate` (com `previewFeatures = ["relationJoins"]`) e `npx drizzle-kit pull`
(corrigir as colunas `unknown(...).array()` geradas para `text(...).array()`). Rodar `npx tsx bench.ts`.
Com atraso de rede: `DELAY_MS=0.75 node proxy.mjs` e `BENCH_URL` apontando para a porta 55432.
