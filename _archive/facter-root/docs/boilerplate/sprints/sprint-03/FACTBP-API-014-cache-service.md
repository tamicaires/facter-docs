# [FACTBP-API-014] Cache Service (Redis)

> Serviço de cache com Redis para produção e fallback em memória para dev.

---

## Status: ✅ Concluído (2025-12-16)

## Contexto

**Uso de Cache:**
- Permissões do usuário (RBAC)
- Sessões
- Dados frequentes (listas, configs)
- Rate limiting (opcional)

**Stack:**
- Redis para produção
- In-memory para desenvolvimento
- Interface unificada

---

## Tasks

### Task 14.1: Instalar Dependências

**Comando:**
```bash
pnpm add @nestjs/cache-manager cache-manager cache-manager-redis-yet redis
pnpm add -D @types/cache-manager
```

**Commit:** `[FACTBP-API] chore(deps): add cache-manager and redis`

**Status:** ✅

---

### Task 14.2: Criar Configuração de Cache

**Arquivo:** `src/config/cache.config.ts`

**Implementação:**
```typescript
import { registerAs } from '@nestjs/config';

export default registerAs('cache', () => ({
  store: process.env.CACHE_STORE || 'memory', // 'memory' | 'redis'
  ttl: parseInt(process.env.CACHE_TTL || '300', 10), // 5 minutos default
  redis: {
    url: process.env.REDIS_URL,
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0', 10),
  },
}));
```

**Commit:** `[FACTBP-API] feat(config): add cache configuration`

**Status:** ✅

---

### Task 14.3: Criar Cache Service Interface

**Arquivo:** `src/infra/cache/cache.interface.ts`

**Implementação:**
```typescript
export interface ICacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
  reset(): Promise<void>;
  keys(pattern: string): Promise<string[]>;
  has(key: string): Promise<boolean>;
}

export const CACHE_SERVICE = 'CACHE_SERVICE';
```

**Status:** ✅

---

### Task 14.4: Criar Memory Cache Service

**Arquivo:** `src/infra/cache/memory-cache.service.ts`

**Descrição:** Cache em memória para desenvolvimento.

**Implementação:**
```typescript
import { Injectable, Logger } from '@nestjs/common';
import { ICacheService } from './cache.interface';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

@Injectable()
export class MemoryCacheService implements ICacheService {
  private readonly logger = new Logger(MemoryCacheService.name);
  private cache = new Map<string, CacheEntry<unknown>>();
  private readonly defaultTtl = 300; // 5 minutos

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    this.logger.debug(`Cache HIT: ${key}`);
    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const expiresAt = Date.now() + (ttl || this.defaultTtl) * 1000;
    this.cache.set(key, { value, expiresAt });
    this.logger.debug(`Cache SET: ${key} (TTL: ${ttl || this.defaultTtl}s)`);
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
    this.logger.debug(`Cache DEL: ${key}`);
  }

  async reset(): Promise<void> {
    this.cache.clear();
    this.logger.debug('Cache RESET');
  }

  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp(pattern.replace('*', '.*'));
    const matchingKeys: string[] = [];

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        matchingKeys.push(key);
      }
    }

    return matchingKeys;
  }

  async has(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== null;
  }
}
```

**Commit:** `[FACTBP-API] feat(cache): add MemoryCacheService`

**Status:** ✅

---

### Task 14.5: Criar Redis Cache Service

**Arquivo:** `src/infra/cache/redis-cache.service.ts`

**Implementação:**
```typescript
import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';
import { ICacheService } from './cache.interface';

@Injectable()
export class RedisCacheService
  implements ICacheService, OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(RedisCacheService.name);
  private client: RedisClientType;
  private readonly defaultTtl: number;

  constructor(private readonly configService: ConfigService) {
    this.defaultTtl = this.configService.get<number>('cache.ttl') || 300;
  }

  async onModuleInit() {
    const redisConfig = this.configService.get('cache.redis');

    this.client = createClient({
      url: redisConfig.url,
      socket: {
        host: redisConfig.host,
        port: redisConfig.port,
      },
      password: redisConfig.password,
      database: redisConfig.db,
    });

    this.client.on('error', (err) => {
      this.logger.error('Redis Client Error', err);
    });

    this.client.on('connect', () => {
      this.logger.log('Redis connected');
    });

    await this.client.connect();
  }

  async onModuleDestroy() {
    await this.client?.disconnect();
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);

      if (!value) {
        return null;
      }

      this.logger.debug(`Cache HIT: ${key}`);
      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.error(`Cache GET error: ${key}`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      await this.client.set(key, JSON.stringify(value), {
        EX: ttl || this.defaultTtl,
      });
      this.logger.debug(`Cache SET: ${key} (TTL: ${ttl || this.defaultTtl}s)`);
    } catch (error) {
      this.logger.error(`Cache SET error: ${key}`, error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
      this.logger.debug(`Cache DEL: ${key}`);
    } catch (error) {
      this.logger.error(`Cache DEL error: ${key}`, error);
    }
  }

  async reset(): Promise<void> {
    try {
      await this.client.flushDb();
      this.logger.debug('Cache RESET');
    } catch (error) {
      this.logger.error('Cache RESET error', error);
    }
  }

  async keys(pattern: string): Promise<string[]> {
    try {
      return await this.client.keys(pattern);
    } catch (error) {
      this.logger.error(`Cache KEYS error: ${pattern}`, error);
      return [];
    }
  }

  async has(key: string): Promise<boolean> {
    try {
      const exists = await this.client.exists(key);
      return exists === 1;
    } catch (error) {
      this.logger.error(`Cache HAS error: ${key}`, error);
      return false;
    }
  }
}
```

**Commit:** `[FACTBP-API] feat(cache): add RedisCacheService`

**Status:** ✅

---

### Task 14.6: Criar Cache Module

**Arquivo:** `src/infra/cache/cache.module.ts`

**Implementação:**
```typescript
import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CACHE_SERVICE } from './cache.interface';
import { MemoryCacheService } from './memory-cache.service';
import { RedisCacheService } from './redis-cache.service';
import cacheConfig from '@/config/cache.config';

const CacheServiceProvider = {
  provide: CACHE_SERVICE,
  useFactory: (configService: ConfigService) => {
    const store = configService.get<string>('cache.store');

    if (store === 'redis') {
      return new RedisCacheService(configService);
    }

    return new MemoryCacheService();
  },
  inject: [ConfigService],
};

@Global()
@Module({
  imports: [ConfigModule.forFeature(cacheConfig)],
  providers: [CacheServiceProvider],
  exports: [CACHE_SERVICE],
})
export class CacheModule {}
```

**Commit:** `[FACTBP-API] feat(cache): add CacheModule with provider factory`

**Status:** ✅

---

### Task 14.7: Atualizar AbilityService para usar Cache Service

**Arquivo:** `src/infra/auth/services/ability.service.ts` (atualizar)

**Implementação:**
```typescript
import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { AbilityFactory, AppAbility } from '../casl/ability.factory';
import { RawPermission } from '../casl/casl.types';
import { ICacheService, CACHE_SERVICE } from '@/infra/cache/cache.interface';

interface CachedAbility {
  permissions: RawPermission[];
}

@Injectable()
export class AbilityService {
  private readonly CACHE_PREFIX = 'ability';
  private readonly CACHE_TTL = 300; // 5 minutos

  constructor(
    private readonly prisma: PrismaService,
    private readonly abilityFactory: AbilityFactory,
    @Inject(CACHE_SERVICE) private readonly cacheService: ICacheService,
  ) {}

  private getCacheKey(membershipId: string): string {
    return `${this.CACHE_PREFIX}:${membershipId}`;
  }

  async getAbilityForMembership(membershipId: string): Promise<AppAbility> {
    const cacheKey = this.getCacheKey(membershipId);

    // Check cache
    const cached = await this.cacheService.get<CachedAbility>(cacheKey);
    if (cached) {
      return this.abilityFactory.createForPermissions(cached.permissions);
    }

    // Fetch from database
    const membership = await this.prisma.membership.findUnique({
      where: { id: membershipId },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!membership) {
      return this.abilityFactory.createForPermissions([]);
    }

    // Owner tem todas as permissões
    if (membership.isOwner) {
      const permissions: RawPermission[] = [{ action: 'manage', subject: 'all' }];
      await this.cacheService.set(cacheKey, { permissions }, this.CACHE_TTL);
      return this.abilityFactory.createForOwner();
    }

    // Mapear permissões
    const permissions: RawPermission[] = membership.role.permissions.map((rp) => ({
      action: rp.permission.action,
      subject: rp.permission.subject,
    }));

    // Cache
    await this.cacheService.set(cacheKey, { permissions }, this.CACHE_TTL);

    return this.abilityFactory.createForPermissions(permissions);
  }

  async getPermissionsForMembership(membershipId: string): Promise<RawPermission[]> {
    const cacheKey = this.getCacheKey(membershipId);
    const cached = await this.cacheService.get<CachedAbility>(cacheKey);

    if (cached) {
      return cached.permissions;
    }

    await this.getAbilityForMembership(membershipId);
    const newCached = await this.cacheService.get<CachedAbility>(cacheKey);
    return newCached?.permissions || [];
  }

  async invalidateCache(membershipId: string): Promise<void> {
    await this.cacheService.del(this.getCacheKey(membershipId));
  }

  async invalidateAllCache(): Promise<void> {
    const keys = await this.cacheService.keys(`${this.CACHE_PREFIX}:*`);
    for (const key of keys) {
      await this.cacheService.del(key);
    }
  }
}
```

**Commit:** `[FACTBP-API] refactor(rbac): use CacheService in AbilityService`

**Status:** ✅

---

## Critérios de Aceite

- [x] Cache em memória funciona para dev
- [x] Cache Redis funciona para prod
- [x] Interface unificada ICacheService
- [x] Configuração via env vars
- [x] AbilityService usa o cache service
- [x] Cache invalidation funciona

---

## Arquivos a Criar

```
src/
├── config/
│   └── cache.config.ts
└── infra/
    └── cache/
        ├── cache.interface.ts
        ├── cache.module.ts
        ├── memory-cache.service.ts
        └── redis-cache.service.ts
```

---

## Environment Variables

```bash
# .env.example
CACHE_STORE=memory          # 'memory' | 'redis'
CACHE_TTL=300               # 5 minutos

# Redis (quando CACHE_STORE=redis)
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

---

*Task de [Sprint 3](../sprint-03.md)*
