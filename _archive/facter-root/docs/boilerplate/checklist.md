# Facter Boilerplate - Checklist Completo

> Documento mestre para acompanhamento do progresso do Facter Boilerplate.
> Atualizar conforme itens forem concluídos.

---

## Legenda

- ✅ Concluído
- 🔄 Em progresso
- ⏳ Pendente
- ❌ Bloqueado
- 🔜 Próximo

---

## 1. Documentação

### 1.1 Planejamento
| Status | Item | Arquivo |
|--------|------|---------|
| ✅ | Especificação técnica | `BOILERPLATE-SPEC.md` |
| ✅ | Lista de features | `BOILERPLATE-FEATURES.md` |
| ✅ | Arquitetura completa | `BOILERPLATE-ARCHITECTURE.md` |
| ✅ | Contexto do projeto | `CLAUDE.md` |
| ✅ | Padrão de commits | `CLAUDE.md` |
| ✅ | Checklist mestre | `CHECKLIST.md` |

### 1.2 Documentação Técnica
| Status | Item | Descrição |
|--------|------|-----------|
| ✅ | Estrutura de pastas | Frontend + Backend |
| ✅ | Multi-tenancy | Modelo e fluxo |
| ✅ | Autenticação | JWT + Refresh Token |
| ✅ | Autorização (RBAC) | Ability class + guards |
| ✅ | Event-driven | Domain events + handlers |
| ✅ | API patterns | Response format, pagination |
| ✅ | Caching | Redis + TanStack Query |
| ✅ | Error handling | Exceptions + filters |
| ✅ | Testing | Estratégia completa |
| ✅ | Performance | Guidelines |
| ✅ | Observability | Logging + health checks |
| ✅ | Prisma Schema | Modelo de dados completo |
| ⏳ | CI/CD | GitHub Actions workflows |
| ⏳ | Docker | Dockerfile + compose |
| ✅ | Environment | .env.example documentado |

---

## 2. Design System (@facter/ds-core)

### 2.1 Componentes Base (Concluídos)
| Status | Componente | Descrição |
|--------|------------|-----------|
| ✅ | Button | Variantes, loading, icons |
| ✅ | Input | Label, error, icons |
| ✅ | Badge | Status indicators |
| ✅ | Spinner | Loading spinner |
| ✅ | Loader | Full page loader |
| ✅ | Select | Radix UI based |
| ✅ | Checkbox | Form control |
| ✅ | Switch | Toggle control |
| ✅ | RadioGroup | Radio options |
| ✅ | Tabs | Navigation tabs |
| ✅ | Dialog | Modal dialog |
| ✅ | Toaster | Notifications (Sonner) |
| ✅ | DataTable | TanStack Table |
| ✅ | Form | Smart components |
| ✅ | EmptyState | Empty content |
| ✅ | RippleEffect | Click effect |
| ✅ | ThemeProvider | Theme context |

### 2.2 Layouts (Concluídos)
| Status | Layout | Uso |
|--------|--------|-----|
| ✅ | AuthLayout | Login, register, forgot-password |
| ✅ | SelectionLayout | Seleção de empresa |

### 2.3 Layouts Avançados (Concluídos)
| Status | Componente | Prioridade | Descrição |
|--------|------------|------------|-----------|
| ✅ | DashboardLayout | **ALTA** | Sidebar + Header + Content |
| ✅ | Sidebar | Alta | Menu lateral colapsável (via DashboardLayout) |
| ✅ | Header | Alta | Top bar com user menu (via DashboardLayout) |
| ✅ | Breadcrumbs | Média | Navegação hierárquica (via DashboardLayout) |

### 2.4 Componentes Pendentes (Para o Boilerplate)
| Status | Componente | Prioridade | Descrição |
|--------|------------|------------|-----------|
| ⏳ | CommandPalette | Média | Busca global (Cmd+K) |
| ⏳ | FileUpload | Média | Upload de arquivos |
| ⏳ | Avatar | Baixa | Foto do usuário |
| ⏳ | Dropdown | Baixa | Menu dropdown |
| ⏳ | Tooltip | Baixa | Tooltips |
| ⏳ | Skeleton | Baixa | Loading placeholders |
| ⏳ | Pagination | Baixa | Paginação de listas |

### 2.5 Temas
| Status | Tema | Primary Color |
|--------|------|---------------|
| ✅ | base.css | Tokens comuns |
| ✅ | truck.css | Azul (233 65% 50%) |
| ✅ | vagas.css | Roxo (262 83% 58%) |
| ✅ | techcare.css | Verde (142 76% 36%) |
| ⏳ | pet.css | A definir |

---

## 3. Boilerplate - Frontend (Next.js)

### 3.1 Setup Inicial
| Status | Item | Descrição |
|--------|------|-----------|
| ✅ | Criar repositório | `facter-boilerplate-web` |
| ✅ | Next.js 16 | App Router |
| ✅ | TypeScript | Strict mode |
| ✅ | Tailwind CSS | Configurado |
| ✅ | ESLint | Configuração |
| ✅ | Dependencies | ds-core, zustand, tanstack-query, axios, zod |

### 3.2 Estrutura Base
| Status | Item | Path |
|--------|------|------|
| ⏳ | Root layout | `app/layout.tsx` |
| ⏳ | Providers | `providers/app-providers.tsx` |
| ⏳ | Middleware | `middleware.ts` |
| ⏳ | Global CSS | `globals.css` |
| ⏳ | Env config | `config/env.ts` |

### 3.3 Autenticação
| Status | Item | Descrição |
|--------|------|-----------|
| ⏳ | Login page | `/login` |
| ⏳ | Register page | `/register` |
| ⏳ | Forgot password | `/forgot-password` |
| ⏳ | Reset password | `/reset-password` |
| ⏳ | Auth store | Zustand |
| ⏳ | Auth service | API calls |
| ⏳ | useAuth hook | Auth state |
| ⏳ | useLogin hook | Login mutation |
| ⏳ | Token refresh | Interceptor |
| ⏳ | Auth middleware | Route protection |

### 3.4 Multi-tenancy
| Status | Item | Descrição |
|--------|------|-----------|
| ⏳ | Select company page | `/select-company` |
| ⏳ | Company store | Zustand |
| ⏳ | Company provider | Context |
| ⏳ | Company header | X-Company-ID |
| ⏳ | Company cookie | Persistência |

### 3.5 Permissões (RBAC)
| Status | Item | Descrição |
|--------|------|-----------|
| ⏳ | Ability class | Core logic |
| ⏳ | Permissions provider | Context |
| ⏳ | useAbility hook | Access ability |
| ⏳ | useCan hook | Permission check |
| ⏳ | `<Can>` component | Conditional render |
| ⏳ | `<CanAny>` component | Any permission |
| ⏳ | `<CanAll>` component | All permissions |
| ⏳ | Permission gate | Route protection |

### 3.6 Dashboard
| Status | Item | Descrição |
|--------|------|-----------|
| ⏳ | Dashboard layout | Sidebar + Header |
| ⏳ | Dashboard page | `/dashboard` |
| ⏳ | Settings layout | `/settings/*` |
| ⏳ | Profile page | `/settings/profile` |
| ⏳ | Security page | `/settings/security` |
| ⏳ | Company settings | `/settings/company` |
| ⏳ | Members page | `/settings/company/members` |

### 3.7 Lib/Utils
| Status | Item | Descrição |
|--------|------|-----------|
| ⏳ | API client | Axios instance |
| ⏳ | Query client | TanStack Query |
| ⏳ | Event emitter | Frontend events |
| ⏳ | Storage utils | LocalStorage helpers |
| ⏳ | Format utils | Date, currency, etc. |
| ⏳ | cn() helper | Class names |

---

## 4. Boilerplate - Backend (NestJS)

### 4.1 Setup Inicial
| Status | Item | Descrição |
|--------|------|-----------|
| ✅ | Criar repositório | `facter-boilerplate-api` |
| ✅ | NestJS 11 | Estrutura base |
| ✅ | TypeScript | Strict mode |
| ✅ | ESLint + Prettier | Configuração |
| ✅ | Dependencies | jwt, passport, prisma, bcrypt |
| ⏳ | Redis | Cache setup |

### 4.2 Database (Prisma)
| Status | Item | Descrição |
|--------|------|-----------|
| ✅ | Schema base | User, Company, Membership |
| ✅ | Permission tables | Role, Permission, RolePermission |
| ⏳ | Migrations | Initial migration |
| ⏳ | Seed | Dados iniciais |
| ⏳ | Prisma Service | NestJS integration |

### 4.3 Autenticação
| Status | Item | Descrição |
|--------|------|-----------|
| ⏳ | Auth module | Module setup |
| ✅ | Login use case | Email + password |
| ✅ | Register use case | New user |
| ⏳ | Refresh token | Token renewal |
| ⏳ | Logout use case | Invalidate tokens |
| ⏳ | JWT strategy | Passport JWT |
| ⏳ | JWT guard | Route protection |
| ✅ | Password hash | bcrypt |

### 4.4 Multi-tenancy
| Status | Item | Descrição |
|--------|------|-----------|
| ⏳ | Company module | CRUD |
| ⏳ | Membership module | User-Company relation |
| ⏳ | Company guard | Validate X-Company-ID |
| ⏳ | Company middleware | Set company context |
| ⏳ | CompanyInstance | Request scoped |

### 4.5 Permissões (RBAC)
| Status | Item | Descrição |
|--------|------|-----------|
| ⏳ | Permissions module | Module setup |
| ⏳ | Ability class | Core logic |
| ⏳ | Permission guard | Route protection |
| ⏳ | Permission decorator | @RequirePermission |
| ⏳ | Get permissions endpoint | /auth/permissions |
| ⏳ | Role CRUD | Manage roles |
| ⏳ | Permission CRUD | Manage permissions |

### 4.6 Infraestrutura
| Status | Item | Descrição |
|--------|------|-----------|
| ⏳ | Cache service | Redis wrapper |
| ⏳ | Event emitter | Domain events |
| ⏳ | Event handlers | Handle events |
| ⏳ | Mail service | Email sending |
| ⏳ | Queue service | BullMQ |
| ⏳ | Storage service | S3/R2 |

### 4.7 HTTP Layer
| Status | Item | Descrição |
|--------|------|-----------|
| ⏳ | Transform interceptor | Response format |
| ⏳ | Logging interceptor | Request logging |
| ⏳ | Exception filter | Error handling |
| ⏳ | Validation pipe | DTO validation |
| ⏳ | Throttle guard | Rate limiting |

---

## 5. Infraestrutura

### 5.1 Docker
| Status | Item | Descrição |
|--------|------|-----------|
| ⏳ | Dockerfile (frontend) | Multi-stage build |
| ⏳ | Dockerfile (backend) | Multi-stage build |
| ⏳ | docker-compose.yml | Dev environment |
| ⏳ | docker-compose.prod.yml | Production |
| ⏳ | .dockerignore | Ignore files |

### 5.2 CI/CD (GitHub Actions)
| Status | Item | Descrição |
|--------|------|-----------|
| ⏳ | Lint workflow | ESLint check |
| ⏳ | Test workflow | Run tests |
| ⏳ | Build workflow | Build check |
| ⏳ | Deploy workflow | Auto deploy |
| ⏳ | Release workflow | Versioning |

### 5.3 Environment
| Status | Item | Descrição |
|--------|------|-----------|
| ⏳ | .env.example | Template |
| ⏳ | Env validation | Zod schema |
| ⏳ | Secrets management | GitHub secrets |

---

## 6. Testes

### 6.1 Frontend
| Status | Item | Descrição |
|--------|------|-----------|
| ⏳ | Vitest setup | Test runner |
| ⏳ | Testing Library | Component tests |
| ⏳ | MSW | API mocking |
| ⏳ | Auth tests | Login, logout |
| ⏳ | Permission tests | Can, CanAny |

### 6.2 Backend
| Status | Item | Descrição |
|--------|------|-----------|
| ⏳ | Jest setup | Test runner |
| ⏳ | Unit tests | Use cases |
| ⏳ | Integration tests | Controllers |
| ⏳ | E2E tests | Full flow |
| ⏳ | Test database | SQLite/Docker |

---

## 7. Finalização

### 7.1 Documentação Final
| Status | Item | Descrição |
|--------|------|-----------|
| ⏳ | README.md | Getting started |
| ⏳ | CONTRIBUTING.md | Contribution guide |
| ⏳ | API docs | Swagger/OpenAPI |
| ⏳ | Storybook | Component docs |

### 7.2 Qualidade
| Status | Item | Descrição |
|--------|------|-----------|
| ⏳ | Code review | Review geral |
| ⏳ | Security audit | OWASP check |
| ⏳ | Performance test | Lighthouse |
| ⏳ | Accessibility | a11y check |

### 7.3 Release
| Status | Item | Descrição |
|--------|------|-----------|
| ⏳ | GitHub Template | Enable template |
| ⏳ | First release | v1.0.0 |
| ⏳ | Announcement | Documentar uso |

---

## Ordem de Execução Sugerida

```
FASE 1 - Design System (Pré-requisito) ✅
├── 1. DashboardLayout ✅
├── 2. Sidebar ✅
├── 3. Header ✅
└── 4. Breadcrumbs ✅

FASE 2 - Boilerplate Setup ✅
├── 5. Criar repositórios (web + api) ✅
├── 6. Setup Next.js 16 ✅
├── 7. Setup NestJS 11 ✅
└── 8. Prisma Schema ✅

FASE 3 - Core Features 🔜
├── 9. Autenticação (Backend) 🔜
├── 10. Autenticação (Frontend)
├── 11. Multi-tenancy (Backend)
├── 12. Multi-tenancy (Frontend)
├── 13. Permissões (Backend)
└── 14. Permissões (Frontend)

FASE 4 - Infraestrutura
├── 15. Docker setup
├── 16. CI/CD
└── 17. Environment

FASE 5 - Testes & Docs
├── 18. Testes unitários
├── 19. Testes integração
├── 20. Documentação final
└── 21. Release v1.0.0
```

---

## Progresso Geral

| Fase | Progresso | Status |
|------|-----------|--------|
| Documentação | 95% | 🔄 |
| Design System | 90% | ✅ |
| Frontend (Setup) | 100% | ✅ |
| Frontend (Features) | 0% | ⏳ |
| Backend (Setup) | 100% | ✅ |
| Backend (Features) | 0% | ⏳ |
| Infraestrutura | 0% | ⏳ |
| Testes | 0% | ⏳ |
| **Total** | **~40%** | 🔄 |

---

## Próximo Passo

🔜 **Autenticação no Backend (API)**
- Prisma Service
- Auth Module (login, register, refresh)
- JWT Strategy + Guards
- Password hashing

---

*Última atualização: 2024-12-14*
