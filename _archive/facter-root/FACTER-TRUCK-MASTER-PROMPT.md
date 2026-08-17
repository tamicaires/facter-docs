# Facter Truck - Master Prompt de Contexto

> Este documento fornece contexto profundo sobre o sistema Facter Truck para qualquer IA assistente.
> Cobre arquitetura, entidades, regras de negocio, padroes e fluxos do sistema.

---

## 1. Visao Geral do Ecossistema

**Facter** e um ecossistema SaaS multi-tenant para gestao de frotas e manutencao veicular. O produto principal e o **Facter Truck**, em producao. Outros produtos planejados: Hub (SSO/billing), TechCare, Vagas, Pet.

```
facter/
├── facter-truck/              # Sistema principal (API + App)
│   ├── facter-api/            # Backend NestJS
│   └── facter-app/            # Frontend React/Vite
├── facter-design-system/      # @facter/ds-core (biblioteca de componentes)
├── facter-hub/                # SSO centralizado (em desenvolvimento)
└── facter-boilerplate/        # Template para novos projetos (pausado)
```

### Stack Tecnologica

| Camada | Tecnologia |
|--------|-----------|
| Backend | NestJS 10 + TypeScript + Prisma 5 + PostgreSQL + Redis |
| Frontend | React 18 + Vite 5 + TanStack Query 5 + Zustand 5 + Tailwind 3 |
| Design System | @facter/ds-core (Radix UI + Tailwind, publicado no npm) |
| Validacao | Zod (runtime) + TypeScript (compilacao) |
| Testes | Jest com jest.fn() mocks (padrao AAA) |
| Auth | JWT + Passport + CASL (RBAC) |
| Eventos | EventEmitter2 (domain events) + SSE (real-time) |
| Graficos | Recharts |
| Icones | lucide-react |
| Drag & Drop | @hello-pangea/dnd + react-dnd |
| Export | xlsx, file-saver, react-to-pdf |
| Portas | API: 3010, Frontend: 5173, PostgreSQL: 5432, Redis: 6379 |

---

## 2. Arquitetura (Clean Architecture + DDD)

### Backend - Camadas

```
facter-api/src/
├── presenters/          # Controllers HTTP (entrada)
│   ├── assets/          # Axle, Box, Carrier, Fleet, Supplier, Tire, Trailer, Vehicle...
│   ├── maintenance/     # WorkOrder, ServiceExecution, MaintenancePlan, Schedule...
│   ├── resources/       # Part, PartCategory, PartKit, PartRequest, Service...
│   ├── personnel/       # Employee, Shift, EmployeeServiceExecution
│   ├── checklist/       # Checklist endpoints
│   ├── cost-center/     # Cost center endpoints
│   └── ...              # dashboard, emergency-request, integration, notification, etc.
│
├── application/         # Use Cases (logica de negocio)
│   └── {domain}/        # 42+ dominios, cada um com seus use cases
│       └── __tests__/   # Testes unitarios com factories/ e mocks/
│
├── core/                # Nucleo do dominio
│   └── domain/
│       ├── entities/    # Entidades com validacao Zod
│       ├── repositories/# Classes abstratas (contratos)
│       ├── errors/      # DomainErrors especificos
│       ├── events/      # Domain events
│       ├── value-objects/# Value objects (MaintenanceTimeTracking, LocationData)
│       ├── services/    # Domain services compartilhados
│       └── enum/        # Enums do dominio
│
├── infra/               # Implementacoes concretas
│   ├── database/        # Prisma ORM (repositories concretos, queries raw)
│   ├── http/
│   │   ├── auth/        # Guards (JWT, Company, Policy), decorators, interceptors
│   │   ├── filters/     # GlobalExceptionFilter (860 linhas, mapeia todos os erros)
│   │   └── ability/     # CASL permissions
│   ├── cache/           # Redis (cache.service.ts)
│   ├── integration/     # APIs externas (telematics, SAP)
│   ├── scheduler/       # Tarefas agendadas
│   └── logging/         # Winston logger
│
└── core/exceptions/     # ErrorCodes com metadata PT-BR (titulo, descricao, acoes)
```

### Regra de Ouro
- Use cases NUNCA acessam Prisma, Redis ou HTTP clients diretamente
- Toda dependencia e injetada via abstracoes (repository abstratos, services)
- Entidades validam seus dados no construtor via Zod
- Erros de negocio usam DomainError (nunca throw generico)

### Cadeia de Guards (Autenticacao/Autorizacao)

```
Request → JwtAuthGuard → CompanyGuard → PolicyGuard → Controller
```

1. **JwtAuthGuard**: Valida token JWT (rotas publicas bypass)
2. **CompanyGuard**: Valida contexto da empresa via header `x-company-id`
3. **PolicyGuard**: Verifica permissoes CASL baseadas no role do usuario

### Multi-Tenancy
- TODA query filtra por `companyId`
- Usuarios pertencem a empresas via `Membership` (com role)
- Dados sao completamente isolados entre empresas

### Frontend - Estrutura

```
facter-app/src/
├── core/                # Infraestrutura do app
│   ├── api/             # Axios client configurado
│   ├── auth/            # Contexto de autenticacao
│   ├── config/          # Configuracoes
│   ├── permissions/     # CASL (espelha backend)
│   ├── providers/       # React context providers
│   └── store/           # Zustand stores globais
│
├── features/            # 36 modulos de feature
│   ├── work-order/      # Lifecycle da OS
│   ├── service-execution/ # Execucao de servicos
│   ├── part-request/    # Solicitacao de pecas
│   ├── tire-manager/    # Gestao de pneus
│   ├── vehicle/         # Veiculos
│   ├── fleet/           # Frotas
│   ├── employee/        # Funcionarios
│   ├── checklist/       # Checklists
│   ├── dashboard/       # Dashboard principal
│   ├── maintenance-planning/ # Planejamento
│   └── ...              # 25+ outros modulos
│
├── shared/              # Codigo compartilhado
│   ├── components/      # Componentes reutilizaveis
│   ├── enums/           # Espelha enums do backend
│   ├── hooks/           # Custom hooks
│   ├── utils/           # Utilitarios (entity-mappers.ts)
│   └── types/           # Tipos compartilhados
│
└── routes/              # React Router configuracao
```

### Padroes Frontend
- **Feature-first**: todo codigo dentro da feature correspondente
- **TanStack Query**: toda comunicacao com API
- **Zustand**: estado global (nao server state)
- **Form compound components**: Form.Input, Form.Select, Form.Textarea (do DS)
- **entity-mappers.ts**: mappers puros para options de select

---

## 3. Modelo de Dados (Prisma - 66 Entidades)

### 3.1 Core (Organizacao)

**Company** - Empresa/tenant
- id, name, cnpj, phone, email, address, logo, isActive, plan, maxUsers, maxVehicles, maxTrailers
- Ponto central: TUDO pertence a uma Company

**User** - Usuario do sistema
- id, name, email, passwordHash, isActive, isSuperAdmin
- Se autentica via JWT, pertence a empresas via Membership

**Membership** - Vinculo usuario-empresa
- id, userId, companyId, role (RoleType), isActive
- **Roles**: SUPER_ADMIN, ADMIN, MAINTENANCE_MANAGER, TIRE_CONSULTANT, PARTS_CONSULTANT, PARTS_MANAGER, REPORT_MANAGER, REPORT_VIEWER, GENERAL_VIEWER, MAINTENANCE_CONSULTANT, MECHANIC, DRIVER, GUEST

**CostCenter** - Centro de custo (hierarquico)
- id, companyId, code, name, parentId, level, path, budgetAmount, budgetPeriod
- Hierarquia pai/filho, com budget tracking
- BudgetPeriod: MONTHLY, QUARTERLY, YEARLY

### 3.2 Ativos (Frota)

**Fleet** - Frota
- id, name, prefix, vehicleId, costCenterId, companyId
- Agrupa Vehicle + Trailers

**Vehicle** - Veiculo
- id, plate, chassis, renavam, brand, model, year, color, fuelType, km, hours, isActive
- Relacoes: Fleet, Axles, WorkOrders, Tires, WheelPositions, AssetReadings

**Trailer** - Reboque/Implemento
- id, plate, chassis, renavam, brand, model, year, trailerType, configuration, numberOfAxles, isActive
- Configuration: EIXO_SIMPLES_RODAGEM_SIMPLES, EIXO_SIMPLES_RODAGEM_DUPLA, EIXO_DUPLO_RODAGEM_SIMPLES, EIXO_DUPLO_RODAGEM_DUPLA, EIXO_TRIPLO_RODAGEM_DUPLA
- Relacoes: Fleet, Axles, WorkOrders, Tires

**Axle** - Eixo
- id, position, type (AxleType: Tracionado, Livre, Direcional), vehicleId|trailerId, isActive
- Relacoes: WheelPositions, ServiceExecutions

**WheelPosition** - Posicao de roda no eixo
- id, axleId, position, side (LEFT/RIGHT), isInner, currentTireId
- Posicao fisica exata no eixo (ex: Eixo 1, Lado Esquerdo, Interna)

**Carrier** - Transportadora
- id, name, cnpj, isActive, costCenterId, companyId

### 3.3 Manutencao

**WorkOrder (Ordem de Servico)** - Entidade central do sistema
- id, displayId, priority, status, reportedProblem, initialDiagnosis
- **Status (MaintenanceStatus)**: Fila → Manutencao → Pausada → Finalizada | Cancelada
- **Priority (WorkOrderPriority)**: BAIXA, MEDIA, ALTA, URGENTE
- **Time tracking**: entryQueue, entryMaintenance, exitMaintenance, startPause, endPause
- **Custos**: totalCost, partsCost, labourCost, tireCost, externalCost
- **Flags**: isCancelled, isServiceReturned
- **Soft delete**: deletedAt, deletedById
- **Integracao**: externalId, externalSource, syncStatus, orderType (PREVENTIVE, CORRECTIVE, EMERGENCY, INSPECTION, OVERHAUL)
- Metodos: startMaintenance(), finishMaintenance(), pause(), resume(), backToQueue(), cancel()

**WorkOrderAsset** - Ativo vinculado a OS (com km/horas entrada/saida)
- workOrderId, vehicleId|trailerId, assetType, kmOnEntry, kmOnExit, hoursOnEntry, hoursOnExit

**Service** - Tipo de servico
- id, serviceName, serviceCategory, weight, locationType, isSystemService, isActive
- **ServiceCategory**: Estrutura, Eletrica, Pneumatica, Freios, Soldagem, Borracharia
- **ServiceLocationType**: NONE, ASSET_ONLY, SIDE, DIRECTIONAL, AXLE, WHEEL, STRUCTURAL
- Servico de sistema "Consumiveis Diversos" nao pode ser deletado

**ServiceExecution** - Servico atribuido a uma OS com localizacao especifica
- id, workOrderId, serviceId, status, startAt, endAt
- **Status (ServiceExecutionStatus)**: PENDING → IN_PROGRESS → PAUSED → COMPLETED | CANCELED
- **Localizacao (Single Source of Truth)**:
  - Asset: vehicleId XOR trailerId
  - Axle: axleId (requer trailer)
  - Structural: structuralPosition (1-4) + structuralSide
  - Wheel: wheelPositionId (requer axle)
  - Directional: directionalSide (FRONT/REAR)
- Metodos: start(), pause(), resume(), complete(), cancel(), getLocationData()
- Validacao: campos de localizacao devem corresponder ao locationType do Service

**ServiceExecutionEmployee** - Funcionario atribuido a execucao
- serviceExecutionId, employeeId, status, startAt, endAt

**Box** - Baia/box de servico
- id, name, position, isActive, companyId

**MaintenanceType** - Tipo de manutencao
- id, name, prefix, description, maintenanceCategoryId, intervalDays, intervalHours, intervalKm

**MaintenanceCategory** - Categoria de manutencao
- id, name, description, companyId

### 3.4 Planejamento de Manutencao

**MaintenancePlanTemplate** - Template de plano de manutencao
- id, name, description, isActive, intervalType, intervalValue, estimatedHours, maintenanceTypeId
- **IntervalType**: DIAS, HORAS, KM, CALENDARIO
- **TriggerLogic**: ANY (OR), ALL (AND), FIRST
- Suporta multi-trigger (ADR-006)

**MaintenanceTrigger** - Gatilho individual de um plano
- id, templateId, triggerType, triggerValue, warningThreshold, criticalThreshold
- **TriggerType**: KILOMETERS, DAYS, HOURS, FUEL, CYCLES, CONDITION

**AppliedMaintenancePlan** - Plano aplicado a ativos especificos
- id, maintenancePlanTemplateId, isActive, startReferenceDate, startReferenceKm, startReferenceHours

**MaintenancePlanAsset** - Ativo vinculado a um plano aplicado
- appliedMaintenancePlanId, assetId, assetType

**MaintenanceSchedule** - Previsao de manutencao
- id, appliedMaintenancePlanId, assetIdentifier, predictedDate, status
- **ScheduleStatus**: PENDING, COMPLETED, CANCELED

**MaintenanceAlert** - Alerta de manutencao pendente/atrasada
- id, vehicleId, appliedPlanId, triggerId, severity, status, overdueValue
- **AlertSeverity**: INFO, WARNING, CRITICAL, OVERDUE
- **AlertStatus**: ACTIVE, ACKNOWLEDGED, DISMISSED, RESOLVED

**PlannedMaintenanceTask** - Tarefa dentro de um plano
- id, maintenancePlanTemplateId, serviceId, checklistTemplateId, estimatedHours

**PlannedTaskPart** - Peca necessaria para uma tarefa planejada
- id, plannedMaintenanceTaskId, partId, quantity, locationHint*

### 3.5 Estoque (Pecas)

**Part** - Peca/componente
- id, name, ni (numero interno), brand, partCategoryId, minStock, currentStock, location, costPrice, isActive
- Relacoes: PartCategory, PartRequests, PartKits

**PartCategory** - Categoria de peca
- id, name, description, companyId

**PartKit** - Kit de pecas (bundle)
- id, name, description, companyId, parts (KitPart[])

**PartRequest** - Solicitacao de pecas durante OS
- id, partId, requestedById, handledById, quantity, approvedQuantity, status
- **RequestStatus**: PENDING → APPROVED|REJECTED → DELIVERED
- Localizacao via serviceExecutionId (SSOT)

### 3.6 Pneus

**Tire** - Pneu
- id, fireNumber (numero de fogo), brand, model, size, dot, purchaseDate, purchasePrice
- **TireStatus**: NEW, IN_USE, STOCK, SENT_RECAP, IN_RECAP, RECAPPED, DAMAGED, CONDEMNED, SOLD, SCRAPPED
- **TireLocation**: STOCK, APPLIED, RECAP_QUEUE, AT_RECAPPER, SCRAP_YARD, THIRD_PARTY
- **TireCondition**: NOVO, RECUPERADO, DANIFICADO, DESCARTE
- Lifecycle: R0 (novo) → R1 → R2 → R3 (recapagens)
- Relacoes: WheelPosition, TireEvents, TireHistories, Supplier

**TireEvent** - Evento no lifecycle do pneu
- id, eventType, tireId, kmAtEvent, treadDepthAtEvent
- **TireEventType**: PURCHASED, MOUNTED, DISMOUNTED, ROTATED, INSPECTED, SENT_TO_RECAP, RETURNED_FROM_RECAP, CONDEMNED, SOLD, SCRAPPED, KM_UPDATED

**TireRecapper** - Empresa de recapagem
- id, name, cnpj, companyId

**TireRequest** - Solicitacao de pneus durante OS
- Similar a PartRequest mas para pneus

**Supplier** - Fornecedor
- id, name, types[], cnpj, isActive
- **SupplierType**: TIRE, PART, LUBRICANT, FUEL, SERVICE, EQUIPMENT, CONSUMABLE

### 3.7 Checklist

**ChecklistTemplate** - Template de checklist
- id, name, icon, isActive, companyId
- Contem: ChecklistCategories → ChecklistItemTemplates

**Checklist** - Instancia de checklist vinculada a OS
- id, workOrderId, templateId, status, handledById
- **ChecklistStatus**: PENDING, IN_PROGRESS, COMPLETED, CANCELED

**ChecklistItem** - Item preenchido
- id, checklistId, itemTemplateId, status (conformidade), trailerId
- **ConformityStatus**: PENDING, CONFORM, NON_CONFORM, NOT_APPLICABLE, PARTIAL

### 3.8 RH

**Employee** - Funcionario
- id, name, cpf, phone, jobId, shiftId, isActive, userId (opcional), companyId
- Pode ser vinculado a User para acesso ao sistema

**Job** (Position) - Cargo
- id, jobTitle, isLeadership, companyId

**Shift** - Turno de trabalho
- id, name, startTime, endTime, shiftManagerId, companyId

### 3.9 Emergencia

**EmergencyRequest** - Solicitacao de socorro
- id, displayId, vehicleId, driverName, driverPhone, problemType, breakdownLatitude/Longitude
- **EmergencyStatus**: ABERTO → AGUARDANDO → ATRIBUIDO → A_CAMINHO → NO_LOCAL → EM_REPARO|GUINCHANDO → RESOLVIDO | CANCELADO
- **ProblemType**: PNEU, BATERIA, MOTOR, FREIO, COMBUSTIVEL, PNEUMATICO, ELETRICO, OUTRO

### 3.10 Integracao (ADR-006)

**IntegrationConfig** - Configuracao de integracao externa
- providerType (TELEMATICS, ERP, FUEL, PARTS), syncDirection, config
- **IntegrationStatus**: CONNECTED, DISCONNECTED, ERROR, SYNCING

**EquipmentCounter** - Medidor de equipamento (como SAP Measuring Point)
- counterType (ODOMETER, HOURMETER, FUEL, CYCLES), currentValue

**CounterReading** - Leitura historica
- value, readingAt, source (MANUAL, TELEMATICS, SAP, CHECKLIST, API, MIGRATION)

**MaintenanceNotification** - Notificacao de manutencao (como SAP QMEL)
- type (BREAKDOWN, MALFUNCTION, DTC, CHECKLIST, ALERT, SCHEDULE)
- source (MANUAL, TELEMATICS, CHECKLIST, SAP, DRIVER_APP)

### 3.11 Rastreabilidade

**WorkOrderTransition** - Historico de transicoes de status da OS
**ServiceExecutionTransition** - Historico de transicoes de servico
**ServiceExecutionEmployeeTransition** - Historico de transicoes de funcionario
- Todos registram: fromStatus, toStatus, transitionedAt, transitionedBy, reason, previousStateDurationMinutes
- PauseReason: WAITING_PART, BREAK, TOOL_UNAVAILABLE, SHIFT_END, REWORK, EXTERNAL_SERVICE, OTHER

**Activity** - Sistema de eventos de dominio (ADR-003)
- verb, actorId, actorType, objectType, objectId, targetType, targetId, metadata
- Usado para audit trail e analytics

**Event** - Log de atividade (legacy)
- event, subject, description, handledById

**Note** - Comentario em OS (com @mencoes via NoteMention)

**Notification** - Notificacao push/in-app para usuario

---

## 4. Fluxos de Negocio Principais

### 4.1 Fluxo da Ordem de Servico (WorkOrder)

```
Criacao → [Fila] → startMaintenance() → [Manutencao]
                                            ↓
                                     pause() ↔ resume()
                                            ↓
                              finishMaintenance() → [Finalizada]
                                    ou
                                cancel() → [Cancelada]
                                    ou
                              backToQueue() → [Fila]
```

**Regras:**
- Nao pode finalizar com servicos PENDING ou IN_PROGRESS
- Ao finalizar, registra custos (pecas, mao de obra, pneus, externos)
- Cada transicao gera WorkOrderTransition com duracao do estado anterior
- Ativos (Vehicle/Trailer) registram km/horas de entrada e saida

### 4.2 Fluxo de Execucao de Servico (ServiceExecution)

```
PENDING → start() → IN_PROGRESS → pause()/resume() → complete() → COMPLETED
                                                    → cancel() → CANCELED
```

**Regras:**
- Localizacao deve corresponder ao locationType do Service
- Vehicle XOR Trailer (nunca ambos)
- Axle requer Trailer
- WheelPosition requer Axle
- Servico "Consumiveis Diversos" tem tratamento especial

### 4.3 Fluxo de Solicitacao de Pecas (PartRequest)

```
PENDING → APPROVED (com approvedQuantity) → DELIVERED
       → REJECTED (com rejectionReason)
```

### 4.4 Lifecycle do Pneu

```
PURCHASED → STOCK → MOUNTED (IN_USE) → DISMOUNTED → STOCK
                                      → SENT_TO_RECAP → IN_RECAP → RETURNED (RECAPPED) → STOCK
                                      → CONDEMNED/SCRAPPED/SOLD (terminal)
```

- Recapagens: R0 (original) → R1 → R2 → R3
- CPK (Custo Por Km) calculado por vida
- Monitoramento: treadDepth, km acumulado

### 4.5 Planejamento de Manutencao

```
MaintenancePlanTemplate (com triggers) → AppliedMaintenancePlan (para ativos especificos)
                                       → MaintenanceSchedule (previsoes geradas)
                                       → MaintenanceAlert (quando proximo/atrasado)
                                       → WorkOrder (gerada automaticamente)
```

**Multi-trigger (ADR-006):**
- Cada plano tem N triggers (km, dias, horas, combustivel, ciclos, condicao)
- TriggerLogic: ANY (qualquer trigger dispara), ALL (todos devem atingir), FIRST (apenas primeiro)

---

## 5. Tratamento de Erros

### Hierarquia
```
DomainError (base abstrata)
├── WorkOrderNotFoundError
├── WorkOrderClosedError
├── InvalidStatusTransitionError
├── LocationFieldsRequiredError
├── DuplicateServiceLocationError
├── ServiceExecutionImmutableError
├── PauseReasonRequiredError
├── TireCannotBeRecappedError
└── ... (50+ erros especificos)
```

### ErrorCodes
Cada DomainError mapeia para um ErrorCode numerico com metadata:
- **1xxx**: Erros de Service
- **2xxx**: Erros de PartRequest
- **3xxx**: Erros de ServiceAssignment
- **4xxx**: Erros de WorkOrder
- **5xxx**: Erros de Tire
- **6xxx**: Erros de Supplier
- **7xxx**: Erros de TireRecapper
- **8xxx**: Erros de Transition
- **9xxx**: Erros de Validation
- **10xxx**: Erros de EmergencyRequest
- **11xxx**: Erros de ChecklistTemplate

Cada codigo tem: title (PT-BR), description, suggestedActions[], severity, retryable

### GlobalExceptionFilter
Captura todos os erros e retorna resposta padronizada:
```json
{
  "statusCode": 409,
  "errorCode": "WO_ALREADY_IN_MAINTENANCE",
  "title": "Ordem de Servico ja em manutencao",
  "description": "Esta OS ja esta sendo atendida",
  "suggestedActions": ["Verifique o status atual da OS"],
  "severity": "warning",
  "retryable": false,
  "timestamp": "2026-01-01T00:00:00.000Z"
}
```

---

## 6. Design System (@facter/ds-core)

### Componentes Principais

| Categoria | Componentes |
|-----------|-------------|
| Primitivos | Button, Input, Badge, Spinner, Loader |
| Form (Smart) | Form.Input, Form.Select, Form.Textarea, Form.Checkbox, Form.Switch, Form.RadioGroup |
| Data Display | DataTable (TanStack Table), Tabs |
| Overlays | Dialog, Modal, Toaster (Sonner) |
| Navigation | Sidebar (compound), Navbar, MobileNav, NavbarCompanyProfile |
| Layouts | AuthLayout, SelectionLayout |

### Form Compound Component
```tsx
<Form form={form} onSubmit={onSubmit}>
  <Form.Input name="nome" label="Nome" required />
  <Form.Select name="categoria" label="Categoria" options={options} variant="card" />
  <Form.Textarea name="descricao" label="Descricao" />
</Form>
```

### Variants do Select
- **default**: Radix Select nativo (texto simples)
- **card**: Dropdown customizado com suporte a icones, descricoes, busca, infinite scroll

### Temas (CSS Variables + Tailwind Preset)
- **truck.css**: Azul (primary: 233 65% 50%)
- **techcare.css**: Verde (primary: 142 76% 36%)
- **vagas.css**: Roxo (primary: 262 83% 58%)

### Regras
- Dialog para 1-6 campos, Pagina para 7+ campos
- Usar Sidebar standalone (NAO DashboardLayout.Sidebar)
- Masks disponiveis: phone, cpf, cnpj, cep, money, percent, plate, date, time, datetime

---

## 7. Padroes de Codigo

### Backend

**Use Case Structure:**
```typescript
async execute(data: IRequest): Promise<Output> {
  const entities = await this.fetchEntities(data);    // fetch
  this.validateBusinessRules(entities);                // validate (throw DomainError)
  const result = this.buildResult(data, entities);     // build
  await this.repository.save(result);                  // persist
}
```

**Prefixos de metodos privados:**
- `validate*` → lanca erro
- `check*` → retorna boolean
- `prepare*` / `build*` / `create*` / `generate*` → constroi objetos

**Repository Pattern:**
```typescript
// Abstract (core/domain/repositories/)
export abstract class WorkOrderRepository {
  abstract findById(id: string, companyId: string): Promise<WorkOrder | null>;
  abstract create(workOrder: WorkOrder): Promise<WorkOrder>;
  // ...
}

// Concrete (infra/database/prisma/)
export class PrismaWorkOrderRepository extends WorkOrderRepository {
  constructor(private prisma: PrismaService) { super(); }
  // implementacao com Prisma
}
```

**Testes (AAA com jest.fn()):**
```typescript
describe('CreateWorkOrderUseCase', () => {
  let sut: CreateWorkOrderUseCase;
  let mockRepo: jest.Mocked<Record<keyof WorkOrderRepository, jest.Mock>>;

  beforeEach(() => {
    mockRepo = createMockWorkOrderRepository();
    sut = new CreateWorkOrderUseCase(mockRepo);
  });

  describe('success scenarios', () => { /* ... */ });
  describe('error scenarios', () => {
    it('should throw WorkOrderNotFoundError', async () => {
      mockRepo.findById.mockResolvedValue(null);
      await expect(sut.execute(input)).rejects.toThrow(WorkOrderNotFoundError);
      expect(mockRepo.save).not.toHaveBeenCalled();
    });
  });
});
```

### Frontend

**Feature Structure:**
```
features/work-order/
├── api/               # TanStack Query hooks (useWorkOrders, useCreateWorkOrder)
├── components/        # Componentes da feature
├── hooks/             # Custom hooks
├── store/             # Zustand stores locais
├── form/              # Form fields enum + Zod schema
├── types/             # Tipos da feature
└── utils/             # Utilitarios
```

**Query Pattern:**
```typescript
// api/use-work-orders.ts
export function useWorkOrders(params: WorkOrderFilters) {
  return useQuery({
    queryKey: ['work-orders', params],
    queryFn: () => workOrderService.list(params),
  });
}
```

---

## 8. Enums Completos

### Status/Estado
| Enum | Valores |
|------|---------|
| MaintenanceStatus | Fila, Manutencao, Pausada, Finalizada, Cancelada |
| ServiceExecutionStatus | PENDING, IN_PROGRESS, PAUSED, COMPLETED, CANCELED |
| ChecklistStatus | PENDING, IN_PROGRESS, COMPLETED, CANCELED |
| ConformityStatus | PENDING, CONFORM, NON_CONFORM, NOT_APPLICABLE, PARTIAL |
| RequestStatus | PENDING, APPROVED, REJECTED, DELIVERED |
| EmergencyStatus | ABERTO, AGUARDANDO, ATRIBUIDO, A_CAMINHO, NO_LOCAL, EM_REPARO, GUINCHANDO, RESOLVIDO, CANCELADO |
| ScheduleStatus | PENDING, COMPLETED, CANCELED |
| AlertStatus | ACTIVE, ACKNOWLEDGED, DISMISSED, RESOLVED |

### Prioridade/Severidade
| Enum | Valores |
|------|---------|
| WorkOrderPriority | BAIXA, MEDIA, ALTA, URGENTE |
| OrderPriority | CRITICAL, HIGH, MEDIUM, LOW |
| AlertSeverity | INFO, WARNING, CRITICAL, OVERDUE |

### Tipos de Ativo
| Enum | Valores |
|------|---------|
| AssetType | VEHICLE, TRAILER, FLEET |
| AxleType | Tracionado, Livre, Direcional |
| Side | LEFT, RIGHT |
| PartDirectionalSide | LEFT, RIGHT, FRONT, REAR |
| ServiceCategory | Estrutura, Eletrica, Pneumatica, Freios, Soldagem, Borracharia |
| ServiceLocationType | NONE, ASSET_ONLY, SIDE, DIRECTIONAL, AXLE, WHEEL, STRUCTURAL |

### Pneus
| Enum | Valores |
|------|---------|
| TireStatus | NEW, IN_USE, STOCK, SENT_RECAP, IN_RECAP, RECAPPED, DAMAGED, CONDEMNED, SOLD, SCRAPPED |
| TireLocation | STOCK, APPLIED, RECAP_QUEUE, AT_RECAPPER, SCRAP_YARD, THIRD_PARTY |
| TireCondition | NOVO, RECUPERADO, DANIFICADO, DESCARTE |
| TireEventType | PURCHASED, MOUNTED, DISMOUNTED, ROTATED, INSPECTED, SENT_TO_RECAP, RETURNED_FROM_RECAP, CONDEMNED, SOLD, SCRAPPED, KM_UPDATED |

### Integracao
| Enum | Valores |
|------|---------|
| SyncStatus | SYNCED, PENDING, RUNNING, ERROR, NOT_SYNCED |
| CounterType | ODOMETER, HOURMETER, FUEL, CYCLES |
| ReadingSource | MANUAL, TELEMATICS, SAP, CHECKLIST, API, MIGRATION |
| ProviderType | TELEMATICS, ERP, FUEL, PARTS |
| IntegrationStatus | CONNECTED, DISCONNECTED, ERROR, SYNCING |

### Outros
| Enum | Valores |
|------|---------|
| RoleType | SUPER_ADMIN, ADMIN, MAINTENANCE_MANAGER, TIRE_CONSULTANT, PARTS_CONSULTANT, PARTS_MANAGER, REPORT_MANAGER, REPORT_VIEWER, GENERAL_VIEWER, MAINTENANCE_CONSULTANT, MECHANIC, DRIVER, GUEST |
| OrderType | PREVENTIVE, CORRECTIVE, EMERGENCY, INSPECTION, OVERHAUL |
| IntervalType | DIAS, HORAS, KM, CALENDARIO |
| TriggerType | KILOMETERS, DAYS, HOURS, FUEL, CYCLES, CONDITION |
| TriggerLogic | ANY, ALL, FIRST |
| BudgetPeriod | MONTHLY, QUARTERLY, YEARLY |
| PauseReason | WAITING_PART, BREAK, TOOL_UNAVAILABLE, SHIFT_END, REWORK, EXTERNAL_SERVICE, OTHER |
| SupplierType | TIRE, PART, LUBRICANT, FUEL, SERVICE, EQUIPMENT, CONSUMABLE |
| ProblemType | PNEU, BATERIA, MOTOR, FREIO, COMBUSTIVEL, PNEUMATICO, ELETRICO, OUTRO |

---

## 9. Repositorios Abstratos (45+)

Todos em `src/core/domain/repositories/`:

**Core:** WorkOrderRepository, ServiceExecutionRepository, ServiceRepository, PartRepository, PartCategoryRepository, PartRequestRepository, TireRepository, TireEventRepository, TireRecapperRepository, SupplierRepository

**Assets:** VehicleRepository, TrailerRepository, AxleRepository, WheelPositionRepository, FleetRepository, CarrierRepository, BoxRepository

**Manutencao:** MaintenanceTypeRepository, MaintenanceCategoryRepository, MaintenancePlanTemplateRepository, AppliedMaintenancePlanRepository, MaintenanceScheduleRepository, MaintenanceAlertRepository, PlannedMaintenanceTaskRepository, PlannedTaskPartRepository

**Organizacao:** CompanyRepository, UserRepository, MembershipRepository, CostCenterRepository, EmployeeRepository, JobRepository, ShiftRepository

**Utilitarios:** ActivityRepository, EventRepository, NoteRepository, NoteMentionRepository, NotificationRepository, ChecklistRepository, ChecklistTemplateRepository, ChecklistCategoryRepository, EmergencyRequestRepository

**Integracao:** EquipmentCounterRepository, CounterReadingRepository, MaintenanceNotificationRepository, MaintenanceTriggerRepository, IntegrationConfigRepository, IntegrationLogRepository, IntegrationErrorRepository

---

## 10. Regras de Qualidade

### Obrigatorio
- Zero `any`, zero `@ts-ignore`, zero `value!` (non-null assertion)
- Testes para todo codigo novo (sucesso E erro)
- N+1 queries PROIBIDO (usar includes/joins)
- Agregacoes complexas no banco (SQL raw), nunca em JS
- Paginacao obrigatoria para listas
- Zod para validacao runtime
- DomainErrors para erros de negocio
- Comentarios: POR QUE, nunca O QUE

### Proibido
- `try {} catch {}` vazio
- `as any`
- Defaults para esconder undefined
- Agregacoes em JS (reduce/map sobre arrays grandes)
- `$queryRawUnsafe` (sempre `Prisma.sql` parametrizado)

### Performance
- CRUD simples → Prisma ORM
- Agregacoes (SUM, COUNT, GROUP BY) → raw queries em `src/infra/database/prisma/queries/`
- Sempre `Prisma.sql` parametrizado
- Tipar resultado com interface, usar `::int`/`::float` nos casts SQL

### Naming
- Arquivos: kebab-case (`create-service-assignment.ts`)
- Classes: PascalCase (`CreateServiceAssignment`)
- Interfaces: IRequest, IOutput
- Constants: UPPER_SNAKE_CASE
- Commits: `[FACTRK] tipo(escopo): mensagem` (ingles, max 4 linhas)

---

## 11. Decisoes Arquiteturais (ADRs)

| ADR | Assunto | Status |
|-----|---------|--------|
| ADR-001 | Unificacao do sistema de localizacao (ServiceExecution como SSOT) | Implementado |
| ADR-002 | Analise do sistema de eventos | Completo |
| ADR-003 | Activity System (domain events com metadata desnormalizada) | Parcialmente implementado (~40%) |
| ADR-004 | Refactoring de Checklist (categories, conformidade, template) | Implementado |
| ADR-005 | Work Order UX improvement | Implementado |
| ADR-006 | Maintenance Planning Evolution (multi-trigger, telematics, SAP) | Em desenvolvimento |
| ADR-007 | Cost Center System + Timeline History Consolidation | Implementado |
| ADR-008 | Auth System Refactoring | Planejado |

---

## 12. Roadmap (Q1 2026)

**Sprints planejadas (95 tasks):**

1. **CC-1, CC-2** - Cost Center (hierarquia, budget, alertas)
2. **SUP** - Supplier Management (generico, multi-tipo)
3. **TF-1, TF-2, TF-3, TF-4** - Tire Evolution (lifecycle completo, CPK, analytics, mount/dismount/recap)
4. **CC-3** - Cost Center advanced (previsao de custos, SAP export)

**Dependencias:** CC-1 → CC-2 → SUP → TF-1 → TF-2 → TF-3 → TF-4 → CC-3

**Features documentadas:**
- Gestao de Pneus (completa: personas, jornadas, regras, cenarios QA)
- Fleet Health Dashboard
- Data Import
- Roadside Assistance (Emergency Request)

---

## 13. Tech Debt Conhecida

- 4 bugs criticos identificados
- 2 vulnerabilidades de seguranca (JWT em localStorage, @Permissions faltando)
- Activity System ~40% migrado (WO e PartRequest completos)
- Alguns use cases ainda usam AppException (migrar para DomainError ao tocar)
- Frontend: migrar imports de `@/components/ui/*` para `@facter/ds-core` ao tocar

---

## 14. Comandos

```bash
# Backend
cd facter-api
pnpm start:dev          # API em localhost:3010
pnpm test               # Rodar testes
pnpm test:watch         # Testes em watch mode
pnpm test:cov           # Cobertura
pnpm prisma generate    # Gerar Prisma client
pnpm prisma migrate dev # Rodar migracoes

# Frontend
cd facter-app
pnpm dev                # App em localhost:5173
pnpm build              # Build de producao

# Design System
cd facter-design-system/packages/core
pnpm build              # Build
pnpm dev                # Watch mode
# Storybook: cd apps/docs && pnpm storybook (porta 6006)
```
