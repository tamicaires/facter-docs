# Facter Boilerplate - Guia de Início

> Documento mestre para navegação estratégica do projeto.
> **Sempre comece por aqui.**

---

## Quick Navigation

```
VOCÊ ESTÁ AQUI: START.md
                  │
    ┌─────────────┼─────────────┐
    ▼             ▼             ▼
 ENTENDER      EXECUTAR     ACOMPANHAR
    │             │             │
    ▼             ▼             ▼
 [Docs]       [Sprints]    [Tracker]
```

---

## 1. Status Atual do Projeto

| Item | Status | Progresso |
|------|--------|-----------|
| **Documentação** | ✅ Completa | 100% |
| **Design System** | ✅ Completo | 100% |
| **Backend Setup** | ✅ Parcial | ~10% |
| **Backend Features** | ⏳ Pendente | 0% |
| **Frontend Setup** | ✅ Parcial | ~5% |
| **Frontend Features** | ⏳ Pendente | 0% |
| **Infraestrutura** | ⏳ Pendente | 0% |
| **Testes** | ⏳ Pendente | 0% |

**Próximo passo:** [Sprint 1 - Fundação Backend](./sprints/sprint-01.md)

---

## 2. O Que Ler (Em Ordem)

### Se é sua primeira vez no projeto:

```
1. README.md (este arquivo) ← Você está aqui
2. especificacao.md         ← Visão geral do que vamos construir
3. arquitetura.md           ← Como vai funcionar tecnicamente
4. checklist.md             ← O que já está feito e o que falta
```

### Se vai começar a implementar:

```
1. TASK-TRACKER.md          ← Ver qual task fazer
2. sprints/sprint-XX.md     ← Detalhes da sprint atual
3. sprints/sprint-XX/*.md   ← Detalhes da task específica
```

### Se quer entender algo específico:

| Assunto | Documento |
|---------|-----------|
| Autenticação | [auth-architecture.md](./auth-architecture.md) |
| Features completas | [features.md](./features.md) |
| Estrutura de pastas | [arquitetura.md](./arquitetura.md) |
| Banco de dados | [arquitetura.md](./arquitetura.md#prisma-schema) |
| API patterns | [arquitetura.md](./arquitetura.md#api-patterns) |

---

## 3. Documentação Principal

### Planejamento
| Documento | Descrição | Link |
|-----------|-----------|------|
| **Especificação** | O que é o boilerplate, objetivos | [especificacao.md](./especificacao.md) |
| **Features** | Lista completa de funcionalidades | [features.md](./features.md) |
| **Arquitetura** | Estrutura técnica detalhada | [arquitetura.md](./arquitetura.md) |
| **Auth Architecture** | Detalhes do sistema de auth | [auth-architecture.md](./auth-architecture.md) |
| **Checklist** | Status de cada item | [checklist.md](./checklist.md) |

### Execução
| Documento | Descrição | Link |
|-----------|-----------|------|
| **Task Tracker** | Histórico e status das tasks | [TASK-TRACKER.md](./TASK-TRACKER.md) |
| **Sprints Overview** | Visão geral das sprints | [sprints/README.md](./sprints/README.md) |
| **Sprint 1** | Fundação Backend | [sprints/sprint-01.md](./sprints/sprint-01.md) |
| **Sprint 2** | Autenticação Backend | [sprints/sprint-02.md](./sprints/sprint-02.md) |
| **Sprint 3** | Multi-tenancy & RBAC | [sprints/sprint-03.md](./sprints/sprint-03.md) |
| **Sprint 4** | Fundação Frontend | [sprints/sprint-04.md](./sprints/sprint-04.md) |
| **Sprint 5** | Autenticação Frontend | [sprints/sprint-05.md](./sprints/sprint-05.md) |
| **Sprint 6** | Dashboard & Settings | [sprints/sprint-06.md](./sprints/sprint-06.md) |
| **Sprint 7** | Infra & Testes | [sprints/sprint-07.md](./sprints/sprint-07.md) |

---

## 4. Ordem de Execução das Sprints

```
FASE 1: FUNDAÇÃO
┌──────────────────────────────────────────────────────────────┐
│  Sprint 1: Backend Base    Sprint 4: Frontend Base           │
│  ├── Prisma Service        ├── Estrutura de pastas           │
│  ├── Config + Env          ├── API Client                    │
│  ├── Core Domain           ├── Providers                     │
│  └── HTTP Layer            └── Stores base                   │
│                                                              │
│  [Podem rodar em PARALELO]                                   │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
FASE 2: AUTENTICAÇÃO
┌──────────────────────────────────────────────────────────────┐
│  Sprint 2: Auth Backend                                      │
│  ├── Password/Token Services                                 │
│  ├── Login/Register Use Cases                                │
│  ├── Password Recovery + Mail                                │
│  ├── Rate Limiting                                           │
│  └── Auth Controller                                         │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
FASE 3: MULTI-TENANCY
┌──────────────────────────────────────────────────────────────┐
│  Sprint 3: Multi-tenancy & RBAC                              │
│  ├── Company Guard                                           │
│  ├── CASL Ability                                            │
│  ├── Cache Service (Redis)                                   │
│  └── Permissions Endpoint                                    │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
FASE 4: FRONTEND AUTH
┌──────────────────────────────────────────────────────────────┐
│  Sprint 5: Auth Frontend                                     │
│  ├── Auth Services/Hooks                                     │
│  ├── Login/Register Pages                                    │
│  ├── Password Recovery                                       │
│  └── Auth Middleware                                         │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
FASE 5: DASHBOARD
┌──────────────────────────────────────────────────────────────┐
│  Sprint 6: Dashboard & Settings                              │
│  ├── Company Selection                                       │
│  ├── Dashboard Layout                                        │
│  ├── RBAC Components (Can, useCan)                          │
│  └── Settings Pages                                          │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
FASE 6: FINALIZAÇÃO
┌──────────────────────────────────────────────────────────────┐
│  Sprint 7: Infra & Testes                                    │
│  ├── Feature Toggles                                         │
│  ├── Docker Setup                                            │
│  ├── Health Checks                                           │
│  ├── CI/CD                                                   │
│  └── Testes                                                  │
└──────────────────────────────────────────────────────────────┘
```

---

## 5. Comandos Úteis

### Backend (facter-boilerplate-api)
```bash
cd facter-boilerplate/facter-boilerplate-api

# Instalar dependências
pnpm install

# Gerar Prisma Client
pnpm prisma generate

# Rodar migrations
pnpm prisma migrate dev

# Rodar seed
pnpm prisma db seed

# Iniciar dev server
pnpm start:dev

# Rodar testes
pnpm test
```

### Frontend (facter-boilerplate-web)
```bash
cd facter-boilerplate/facter-boilerplate-web

# Instalar dependências
pnpm install

# Iniciar dev server
pnpm dev

# Build
pnpm build

# Rodar testes
pnpm test
```

### Docker (quando configurado)
```bash
cd facter-boilerplate

# Subir toda a stack
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar
docker-compose down
```

---

## 6. Convenções

### Commits
```
[FACTBP-API] feat(module): descrição    # Backend
[FACTBP-WEB] feat(module): descrição    # Frontend
[FACTBP-INFRA] chore: descrição         # Infraestrutura
[FACTBP-DOCS] docs: descrição           # Documentação
```

### Branches
```
main                    # Produção
develop                 # Desenvolvimento
feature/FACTBP-XXX      # Features
fix/FACTBP-XXX          # Correções
```

### Status das Tasks
```
⏳ Pendente      # Não iniciada
🔄 Em Progresso  # Sendo trabalhada
✅ Concluído     # Finalizada e testada
❌ Bloqueado     # Aguardando dependência
🔜 Próximo       # Próxima a ser feita
```

---

## 7. Contexto para IA

> **IMPORTANTE:** Se você está usando uma IA para ajudar no desenvolvimento, comece informando:

```
Estou trabalhando no Facter Boilerplate.

Documentação principal: docs/boilerplate/
- START.md (guia geral)
- TASK-TRACKER.md (status das tasks)
- sprints/ (detalhes das tasks)

Status atual: [ver TASK-TRACKER.md]
Trabalhando em: [FACTBP-XXX-nome-da-task]

Leia o arquivo docs/boilerplate/TASK-TRACKER.md para contexto completo.
```

### Diretrizes para IA

1. **Sempre leia START.md** antes de iniciar qualquer task
2. **Analise padrões existentes** - Antes de implementar, verifique se já existe um padrão no projeto (ex: `facter-truck/facter-api/src/core/`)
3. **Sugira melhorias** - Se identificar um padrão melhor ou mais consistente, sugira antes de implementar
4. **Mantenha consistência** - Use os mesmos padrões já estabelecidos no projeto
5. **Questione a documentação** - Se a doc sugere um padrão diferente do usado no projeto, pergunte antes

### Padrões do Projeto (Referência: facter-truck)

**Entities (Domain):**
```typescript
// Padrão: Zod schema + Class implements ZodType
import { randomUUID } from 'crypto';
import { z } from 'zod';

export class Entity implements EntityType {
  public readonly id: string;
  public field: string;

  constructor(data: EntityType) {
    const validatedData = entitySchema.parse(data);
    Object.assign(this, validatedData);
    this.id = validatedData.id ?? randomUUID();
  }
}

export const entitySchema = z.object({
  id: z.string().cuid().optional(),
  field: z.string().min(1, 'Campo obrigatório'),
});

export type EntityType = z.infer<typeof entitySchema>;
```

**Repositories:**
```typescript
// Padrão: Abstract class com métodos abstratos
export abstract class EntityRepository {
  abstract create(entity: Entity): Promise<void>;
  abstract findById(id: string): Promise<Entity | null>;
  abstract list(): Promise<Entity[]>;
}
```

**Exceptions:**
```typescript
// Padrão: Extends HttpException com message, status e fields
import { HttpException, HttpStatus } from '@nestjs/common';

export class AppException extends HttpException {
  constructor({ message, status, fields }: AppExceptionProps) {
    super({ message, fields }, status);
  }
}
```

---

## 8. Links Rápidos

| Ação | Link |
|------|------|
| Ver task atual | [TASK-TRACKER.md](./TASK-TRACKER.md) |
| Ver sprint atual | [Sprint 1](./sprints/sprint-01.md) |
| Ver checklist | [checklist.md](./checklist.md) |
| Ver arquitetura | [arquitetura.md](./arquitetura.md) |
| Ver todas as sprints | [sprints/README.md](./sprints/README.md) |

---

## 9. Troubleshooting

### Prisma
```bash
# Resetar banco
pnpm prisma migrate reset

# Ver banco no browser
pnpm prisma studio
```

### Dependências
```bash
# Limpar cache
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Portas em uso
```bash
# Backend: 3001
# Frontend: 3000
# PostgreSQL: 5432
# Redis: 6379
```

---

**Próximo passo:** Abra [TASK-TRACKER.md](./TASK-TRACKER.md) para ver o status detalhado das tasks.

---

*Última atualização: 2025-12-15*
