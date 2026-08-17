# [FACTBP-INFRA-005] Health Check

> Implementar endpoints de health check para monitoramento e deploy.

---

## Status: ⏳ Pendente

## Contexto

**Necessário para:**
- Kubernetes liveness/readiness probes
- Load balancer health checks
- Monitoramento (Prometheus, Datadog, etc.)
- Deploy zero-downtime

**Endpoints:**
```
GET /health       - Status geral
GET /health/live  - Liveness (app está rodando)
GET /health/ready - Readiness (app pode receber tráfego)
```

---

## Tasks

### Task 5.1: Instalar Dependências

**Comando:**
```bash
pnpm add @nestjs/terminus
```

**Commit:** `[FACTBP-API] chore(deps): add @nestjs/terminus for health checks`

**Status:** ⏳

---

### Task 5.2: Criar Health Controller

**Arquivo:** `src/infra/http/controllers/health.controller.ts`

**Implementação:**
```typescript
import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HealthCheckResult,
  PrismaHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from '@/infra/database/prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prismaHealth: PrismaHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
    private prisma: PrismaService,
  ) {}

  /**
   * Health check completo
   * Verifica: Database, Memory, Disk
   */
  @Get()
  @HealthCheck()
  check(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.prismaHealth.pingCheck('database', this.prisma),
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024), // 150MB
      () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024), // 300MB
    ]);
  }

  /**
   * Liveness probe
   * Verifica se a aplicação está rodando
   * Usado pelo Kubernetes para restart
   */
  @Get('live')
  @HealthCheck()
  live(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.memory.checkHeap('memory', 200 * 1024 * 1024),
    ]);
  }

  /**
   * Readiness probe
   * Verifica se a aplicação pode receber tráfego
   * Usado pelo Kubernetes para routing
   */
  @Get('ready')
  @HealthCheck()
  ready(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.prismaHealth.pingCheck('database', this.prisma),
    ]);
  }
}
```

**Commit:** `[FACTBP-API] feat(health): add HealthController with endpoints`

**Status:** ⏳

---

### Task 5.3: Criar Custom Health Indicators

**Arquivo:** `src/infra/http/health/redis.health.ts`

**Descrição:** Health check para Redis (se usado).

**Implementação:**
```typescript
import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { Inject, Optional } from '@nestjs/common';
import { CACHE_SERVICE, ICacheService } from '@/infra/cache/cache.interface';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(
    @Optional()
    @Inject(CACHE_SERVICE)
    private readonly cacheService: ICacheService,
  ) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    if (!this.cacheService) {
      return this.getStatus(key, true, { message: 'Cache not configured' });
    }

    try {
      // Tenta set/get para verificar conexão
      const testKey = `health:${Date.now()}`;
      await this.cacheService.set(testKey, 'ok', 10);
      const value = await this.cacheService.get(testKey);
      await this.cacheService.del(testKey);

      if (value === 'ok') {
        return this.getStatus(key, true);
      }

      throw new Error('Cache read/write failed');
    } catch (error) {
      throw new HealthCheckError(
        'Redis check failed',
        this.getStatus(key, false, { error: error.message }),
      );
    }
  }
}
```

**Commit:** `[FACTBP-API] feat(health): add RedisHealthIndicator`

**Status:** ⏳

---

### Task 5.4: Criar Prisma Health Indicator

**Arquivo:** `src/infra/http/health/prisma.health.ts`

**Implementação:**
```typescript
import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { PrismaService } from '@/infra/database/prisma/prisma.service';

@Injectable()
export class PrismaHealthIndicator extends HealthIndicator {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async pingCheck(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return this.getStatus(key, true);
    } catch (error) {
      throw new HealthCheckError(
        'Database check failed',
        this.getStatus(key, false, { error: error.message }),
      );
    }
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    return this.pingCheck(key);
  }
}
```

**Commit:** `[FACTBP-API] feat(health): add PrismaHealthIndicator`

**Status:** ⏳

---

### Task 5.5: Criar Health Module

**Arquivo:** `src/infra/http/health/health.module.ts`

**Implementação:**
```typescript
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from '../controllers/health.controller';
import { PrismaHealthIndicator } from './prisma.health';
import { RedisHealthIndicator } from './redis.health';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [PrismaHealthIndicator, RedisHealthIndicator],
})
export class HealthModule {}
```

**Commit:** `[FACTBP-API] feat(health): add HealthModule`

**Status:** ⏳

---

### Task 5.6: Atualizar AppModule

**Arquivo:** `src/app.module.ts` (atualizar)

**Implementação:**
```typescript
import { HealthModule } from './infra/http/health/health.module';

@Module({
  imports: [
    // ... outros módulos
    HealthModule,
  ],
})
export class AppModule {}
```

**Commit:** `[FACTBP-API] chore: add HealthModule to AppModule`

**Status:** ⏳

---

### Task 5.7: Criar Response Types

**Arquivo:** `src/infra/http/health/health.types.ts`

**Implementação:**
```typescript
export interface HealthStatus {
  status: 'ok' | 'error';
  info?: Record<string, { status: string }>;
  error?: Record<string, { status: string; error?: string }>;
  details: Record<string, { status: string; [key: string]: unknown }>;
}

/**
 * Response do /health
 *
 * @example
 * {
 *   "status": "ok",
 *   "info": {
 *     "database": { "status": "up" },
 *     "memory_heap": { "status": "up" },
 *     "memory_rss": { "status": "up" }
 *   },
 *   "error": {},
 *   "details": {
 *     "database": { "status": "up" },
 *     "memory_heap": { "status": "up" },
 *     "memory_rss": { "status": "up" }
 *   }
 * }
 */
export type HealthCheckResponse = HealthStatus;
```

**Status:** ⏳

---

### Task 5.8: Configurar Skip de Auth nos Health Endpoints

**Arquivo:** `src/infra/http/controllers/health.controller.ts` (atualizar)

**Implementação:**
```typescript
import { Public } from '@/infra/auth/decorators/public.decorator';

@Controller('health')
@Public() // Endpoints de health não precisam de auth
export class HealthController {
  // ...
}
```

**OU criar o decorator se não existir:**

**Arquivo:** `src/infra/auth/decorators/public.decorator.ts`

```typescript
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

**Commit:** `[FACTBP-API] feat(health): make health endpoints public`

**Status:** ⏳

---

## Responses

### GET /health
```json
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "memory_heap": { "status": "up" },
    "memory_rss": { "status": "up" }
  },
  "error": {},
  "details": {
    "database": { "status": "up" },
    "memory_heap": { "status": "up" },
    "memory_rss": { "status": "up" }
  }
}
```

### GET /health/live
```json
{
  "status": "ok",
  "info": {
    "memory": { "status": "up" }
  },
  "error": {},
  "details": {
    "memory": { "status": "up" }
  }
}
```

### GET /health/ready
```json
{
  "status": "ok",
  "info": {
    "database": { "status": "up" }
  },
  "error": {},
  "details": {
    "database": { "status": "up" }
  }
}
```

### Error Response (503)
```json
{
  "status": "error",
  "info": {
    "memory": { "status": "up" }
  },
  "error": {
    "database": {
      "status": "down",
      "error": "Connection refused"
    }
  },
  "details": {
    "memory": { "status": "up" },
    "database": {
      "status": "down",
      "error": "Connection refused"
    }
  }
}
```

---

## Kubernetes Config Example

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
spec:
  template:
    spec:
      containers:
        - name: api
          livenessProbe:
            httpGet:
              path: /health/live
              port: 3001
            initialDelaySeconds: 30
            periodSeconds: 10
            failureThreshold: 3
          readinessProbe:
            httpGet:
              path: /health/ready
              port: 3001
            initialDelaySeconds: 5
            periodSeconds: 5
            failureThreshold: 3
```

---

## Critérios de Aceite

- [ ] GET /health retorna status de todos os serviços
- [ ] GET /health/live retorna status da aplicação
- [ ] GET /health/ready retorna status do banco
- [ ] Endpoints retornam 503 quando algo falha
- [ ] Endpoints são públicos (não precisam auth)
- [ ] Redis health check funciona (se configurado)

---

## Arquivos a Criar

```
src/
└── infra/
    └── http/
        ├── controllers/
        │   └── health.controller.ts
        └── health/
            ├── health.module.ts
            ├── health.types.ts
            ├── prisma.health.ts
            └── redis.health.ts
```

---

*Task de [Sprint 7](../sprint-07.md)*
