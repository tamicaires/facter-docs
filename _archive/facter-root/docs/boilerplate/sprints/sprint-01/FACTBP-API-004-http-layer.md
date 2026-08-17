# [FACTBP-API-004] HTTP Layer Base

> Configurar interceptors, filters e pipes globais.

---

## Status: ✅ Concluído

---

## Tasks

### Task 4.1: Criar TransformInterceptor

**Arquivo:** `src/infra/http/interceptors/transform.interceptor.ts`

**Descrição:** Interceptor que transforma todas as responses no formato padrão.

**Formato de Response:**
```typescript
// Sucesso
{
  "data": { ... },
  "meta": { ... }  // opcional (paginação)
}

// Lista paginada
{
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "perPage": 10,
    "totalPages": 10
  }
}
```

**Implementação:**
```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((response) => {
        // Se já está no formato correto, retorna
        if (response && typeof response === 'object' && 'data' in response) {
          return response;
        }

        // Transforma para o formato padrão
        return {
          data: response,
        };
      }),
    );
  }
}
```

**Commit:** `[FACTBP-API] feat(http): add transform interceptor for response format`

**Status:** ✅

---

### Task 4.2: Criar HttpExceptionFilter

**Arquivo:** `src/infra/http/filters/http-exception.filter.ts`

**Descrição:** Filter que captura exceções e retorna no formato padrão.

**Formato de Erro:**
```typescript
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Email ou senha inválidos",
    "details": { ... }  // opcional
  }
}
```

**Implementação:**
```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { DomainException } from '@/core/exceptions';

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorResponse: ErrorResponse;

    // Domain Exception (nossas exceções)
    if (exception instanceof DomainException) {
      status = this.mapDomainExceptionToStatus(exception.code);
      errorResponse = {
        error: {
          code: exception.code,
          message: exception.message,
        },
      };
    }
    // Http Exception (NestJS)
    else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        errorResponse = {
          error: {
            code: this.statusToCode(status),
            message: exceptionResponse,
          },
        };
      } else if (typeof exceptionResponse === 'object') {
        const res = exceptionResponse as Record<string, unknown>;
        errorResponse = {
          error: {
            code: (res.code as string) || this.statusToCode(status),
            message: (res.message as string) || 'An error occurred',
            details: res.errors as Record<string, unknown>,
          },
        };
      } else {
        errorResponse = {
          error: {
            code: this.statusToCode(status),
            message: 'An error occurred',
          },
        };
      }
    }
    // Unknown error
    else {
      console.error('Unhandled exception:', exception);
      errorResponse = {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
        },
      };
    }

    response.status(status).json(errorResponse);
  }

  private mapDomainExceptionToStatus(code: string): number {
    const mapping: Record<string, number> = {
      INVALID_CREDENTIALS: HttpStatus.UNAUTHORIZED,
      USER_NOT_FOUND: HttpStatus.NOT_FOUND,
      USER_ALREADY_EXISTS: HttpStatus.CONFLICT,
      TOKEN_EXPIRED: HttpStatus.UNAUTHORIZED,
      FORBIDDEN: HttpStatus.FORBIDDEN,
    };

    return mapping[code] || HttpStatus.BAD_REQUEST;
  }

  private statusToCode(status: number): string {
    const mapping: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      500: 'INTERNAL_ERROR',
    };

    return mapping[status] || 'ERROR';
  }
}
```

**Commit:** `[FACTBP-API] feat(http): add HTTP exception filter`

**Status:** ✅ (implementado como GlobalExceptionFilter)

---

### Task 4.3: Configurar ValidationPipe Global

**Arquivo:** `src/main.ts`

**Descrição:** Configurar ValidationPipe e outros middlewares globais.

**Implementação:**
```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { TransformInterceptor } from './infra/http/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './infra/http/filters/http-exception.filter';
import { validateEnv } from './config';

async function bootstrap() {
  // Validar env antes de tudo
  const env = validateEnv();

  const app = await NestFactory.create(AppModule);

  // CORS
  app.enableCors({
    origin: env.FRONTEND_URL,
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // Remove propriedades não decoradas
      forbidNonWhitelisted: true, // Erro se propriedades extras
      transform: true,           // Transforma tipos automaticamente
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global interceptors
  app.useGlobalInterceptors(new TransformInterceptor());

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(env.PORT);
  console.log(`🚀 Server running on http://localhost:${env.PORT}/api`);
}

bootstrap();
```

**Commit:** `[FACTBP-API] chore(http): configure global pipes, interceptors and filters`

**Status:** ✅

---

## Critérios de Aceite

- [x] Todas as responses seguem formato `{ data, meta? }`
- [x] Todos os errors seguem formato `{ error: { code, message, fields? } }`
- [x] ValidationPipe rejeita campos extras
- [x] ValidationPipe transforma tipos automaticamente
- [x] CORS configurado para frontend URL
- [x] Testes unitários passando (12 testes)

---

## Arquivos Criados

```
src/
├── infra/
│   └── http/
│       ├── interceptors/
│       │   └── transform.interceptor.ts
│       └── filters/
│           └── http-exception.filter.ts
└── main.ts (atualizado)
```

---

## Testes Manuais

```bash
# Teste de response format
curl http://localhost:3001/api/health
# Esperado: { "data": { "status": "ok" } }

# Teste de error format
curl -X POST http://localhost:3001/api/auth/login -d '{}'
# Esperado: { "error": { "code": "...", "message": "..." } }
```

---

*Task de [Sprint 1](../sprint-01.md)*
