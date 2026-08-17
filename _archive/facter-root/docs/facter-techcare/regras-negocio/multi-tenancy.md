# Multi-Tenancy e Modos de Operação

> **Arquitetura multi-tenant com suporte a empresas e técnicos autônomos.**

---

## Visão Geral

O TechCare suporta dois modos de operação:

| Modo | Público | Características |
|------|---------|-----------------|
| **Empresa** | Assistências técnicas com equipe | Múltiplos usuários, hierarquia, relatórios avançados |
| **Individual** | Técnico autônomo | Interface simplificada, um usuário faz tudo |

---

## Arquitetura Multi-Tenant

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         PLATAFORMA TECHCARE                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐        │
│   │   TechFix LTDA  │  │  João Técnico   │  │  Conserta Tudo  │        │
│   │   (Empresa)     │  │  (Individual)   │  │   (Empresa)     │        │
│   │                 │  │                 │  │                 │        │
│   │ 👤 Gerente      │  │ 👤 João         │  │ 👤 Admin        │        │
│   │ 👤 Atendente 1  │  │    (faz tudo)   │  │ 👤 Gerente      │        │
│   │ 👤 Atendente 2  │  │                 │  │ 👤 Atendente    │        │
│   │ 👤 Técnico 1    │  │                 │  │ 👤 Técnico 1    │        │
│   │ 👤 Técnico 2    │  │                 │  │ 👤 Técnico 2    │        │
│   │ 👤 Técnico 3    │  │                 │  │ 👤 Técnico 3    │        │
│   └────────┬────────┘  └────────┬────────┘  └────────┬────────┘        │
│            │                    │                    │                  │
│            └────────────────────┼────────────────────┘                  │
│                                 │                                       │
│                    ┌────────────┴────────────┐                          │
│                    │    DADOS ISOLADOS       │                          │
│                    │  (companyId em tudo)    │                          │
│                    └─────────────────────────┘                          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Modo Empresa

### Características

- **Múltiplos usuários** com perfis diferentes
- **Hierarquia** de permissões (Admin > Gerente > Atendente > Técnico)
- **Fluxo completo** com todas as etapas
- **Relatórios** de equipe e performance
- **Dashboard** gerencial

### Perfis Disponíveis

| Perfil | Responsabilidades |
|--------|-------------------|
| Admin | Configuração, usuários, financeiro completo |
| Gerente | Supervisão, aprovações, relatórios |
| Atendente | Recebimento, cadastro, pagamentos |
| Técnico | Diagnóstico, execução, orçamento |

### Fluxo de OS

```
[Atendente] → [Atendente] → [Técnico] → [Sistema] → [Técnico] → [Atendente]
 Recebe       Triagem      Diagnóstico  Orçamento   Execução    Entrega
```

---

## Modo Individual

### Características

- **Único usuário** (o próprio técnico)
- **Interface simplificada** sem hierarquia
- **Fluxo direto** com etapas opcionais
- **Foco** em produtividade
- **Preço** acessível

### Perfil Único: Técnico Autônomo

O usuário tem todas as permissões necessárias:

```typescript
const tecnicoAutonomoAbilities = [
  { action: 'manage', subject: 'ServiceOrder' },
  { action: 'manage', subject: 'Customer' },
  { action: 'manage', subject: 'Equipment' },
  { action: 'manage', subject: 'Quote' },
  { action: 'manage', subject: 'Stock' },
  { action: 'manage', subject: 'Payment' },
  { action: 'read', subject: 'Dashboard' },
  { action: 'read', subject: 'Report' },
  // Não tem: manage User, manage Settings avançadas
];
```

### Fluxo Simplificado

```
[Técnico] ────────────────────────────────────────────────────▶ [Técnico]
 Recebe + Diagnostica + Orçamento + Executa + Recebe Pagamento + Entrega
```

### Etapas Opcionais no Modo Individual

| Etapa | Empresa | Individual |
|-------|---------|------------|
| Triagem | Obrigatória | Opcional/Automática |
| Atribuir Técnico | Obrigatória | N/A (é ele mesmo) |
| Aprovação Gerente | Para descontos > X% | N/A |
| Assinatura Entrega | Obrigatória | Opcional |

---

## Modelo de Dados

### Company

```prisma
model Company {
  id            String       @id @default(uuid())
  name          String
  document      String?      // CNPJ ou CPF

  // Modo de operação
  mode          CompanyMode  @default(BUSINESS)

  // Configurações
  settings      Json         @default("{}")

  // Plano
  plan          Plan         @default(FREE)
  planExpiresAt DateTime?

  // Relacionamentos
  users         User[]
  customers     Customer[]
  serviceOrders ServiceOrder[]
  parts         Part[]

  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
}

enum CompanyMode {
  BUSINESS    // Empresa com equipe
  INDIVIDUAL  // Técnico autônomo
}

enum Plan {
  FREE        // Limitado
  STARTER     // Individual
  PROFESSIONAL // Empresa pequena
  ENTERPRISE   // Empresa grande
}
```

### User (adaptado ao modo)

```prisma
model User {
  id          String    @id @default(uuid())
  companyId   String
  company     Company   @relation(fields: [companyId], references: [id])

  name        String
  email       String    @unique
  role        Role

  // Para modo Individual, role = OWNER
  // Para modo Empresa, role = ADMIN | MANAGER | ATTENDANT | TECHNICIAN
}

enum Role {
  OWNER       // Dono (modo individual)
  ADMIN       // Administrador (modo empresa)
  MANAGER     // Gerente
  ATTENDANT   // Atendente
  TECHNICIAN  // Técnico
}
```

---

## Diferenças de Interface

### Sidebar / Menu

**Modo Empresa:**
```
📊 Dashboard
📋 Ordens de Serviço
👥 Clientes
👷 Técnicos
📦 Estoque
💰 Financeiro
📈 Relatórios
⚙️ Configurações
   └─ Usuários
   └─ Permissões
   └─ Empresa
```

**Modo Individual:**
```
📊 Resumo
📋 Ordens de Serviço
👥 Clientes
📦 Estoque
💰 Financeiro
⚙️ Configurações
```

### Criação de OS

**Modo Empresa:**
- Formulário completo
- Campo para atribuir técnico
- Seleção de prioridade com justificativa

**Modo Individual:**
- Formulário simplificado
- Técnico = usuário atual (automático)
- Prioridade opcional

### Dashboard

**Modo Empresa:**
- Métricas de equipe
- Performance por técnico
- Comparativos
- Gráficos de tendência

**Modo Individual:**
- Resumo pessoal
- OS do dia/semana
- Valores a receber
- Próximos vencimentos

---

## Regras de Negócio por Modo

### Criação de OS

```typescript
// RN-MT-001: Atribuição automática no modo individual
async function createServiceOrder(dto: CreateServiceOrderDto, user: User) {
  const company = await getCompany(user.companyId);

  let technicianId = dto.technicianId;

  if (company.mode === 'INDIVIDUAL') {
    // No modo individual, o técnico é sempre o próprio usuário
    technicianId = user.id;
  }

  return serviceOrderRepository.create({
    ...dto,
    technicianId,
    companyId: user.companyId,
  });
}
```

### Mudança de Status

```typescript
// RN-MT-002: Pular triagem no modo individual
async function changeStatus(orderId: string, newStatus: Status, user: User) {
  const company = await getCompany(user.companyId);
  const order = await getOrder(orderId);

  // No modo individual, pode pular de RECEIVED direto para DIAGNOSIS
  if (company.mode === 'INDIVIDUAL') {
    const allowedTransitions = {
      ...STANDARD_TRANSITIONS,
      RECEIVED: ['TRIAGE', 'DIAGNOSIS', 'CANCELLED'], // Adiciona DIAGNOSIS
    };
  }

  // ... validação e mudança
}
```

### Aprovação de Desconto

```typescript
// RN-MT-003: Sem aprovação de desconto no modo individual
async function applyDiscount(quoteId: string, discount: Discount, user: User) {
  const company = await getCompany(user.companyId);

  if (company.mode === 'INDIVIDUAL') {
    // Técnico autônomo pode dar qualquer desconto
    return applyDiscountDirectly(quoteId, discount);
  }

  // Modo empresa: verificar limites por perfil
  const limits = DISCOUNT_LIMITS[user.role];
  if (discount.value > limits.maxPercent) {
    return requestManagerApproval(quoteId, discount);
  }

  return applyDiscountDirectly(quoteId, discount);
}
```

---

## Onboarding por Modo

### Fluxo de Cadastro

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CADASTRO TECHCARE                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────┐      │
│   │  Como você trabalha?                                         │      │
│   │                                                              │      │
│   │  ┌────────────────────┐    ┌────────────────────┐           │      │
│   │  │ 👤 Sou Autônomo   │    │ 🏢 Tenho uma       │           │      │
│   │  │                    │    │    Empresa         │           │      │
│   │  │ Trabalho sozinho   │    │                    │           │      │
│   │  │ como técnico       │    │ Tenho equipe de    │           │      │
│   │  │                    │    │ funcionários       │           │      │
│   │  └────────────────────┘    └────────────────────┘           │      │
│   └─────────────────────────────────────────────────────────────┘      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Dados Coletados

**Modo Individual:**
1. Nome completo
2. CPF
3. Email
4. Telefone/WhatsApp
5. Especialidades
6. Criar senha

**Modo Empresa:**
1. Razão Social
2. CNPJ
3. Nome do responsável
4. Email corporativo
5. Telefone
6. Quantos funcionários? (para sugerir plano)
7. Criar senha do admin

---

## Planos e Preços

| Feature | Free | Starter | Professional | Enterprise |
|---------|------|---------|--------------|------------|
| Modo | Individual | Individual | Empresa | Empresa |
| Usuários | 1 | 1 | 5 | Ilimitado |
| OS/mês | 20 | Ilimitado | Ilimitado | Ilimitado |
| Clientes | 50 | Ilimitado | Ilimitado | Ilimitado |
| Estoque | ❌ | ✅ | ✅ | ✅ |
| Relatórios | Básico | Básico | Completo | Completo |
| WhatsApp | ❌ | ✅ | ✅ | ✅ |
| Multi-filial | ❌ | ❌ | ❌ | ✅ |
| API | ❌ | ❌ | ❌ | ✅ |
| Suporte | Email | Email | Chat | Dedicado |

---

## Migração de Modo

### Individual → Empresa

```typescript
// RN-MT-010: Upgrade de modo
async function upgradeToBusinessMode(companyId: string) {
  // 1. Atualizar modo
  await prisma.company.update({
    where: { id: companyId },
    data: { mode: 'BUSINESS' },
  });

  // 2. Converter usuário OWNER para ADMIN
  await prisma.user.updateMany({
    where: { companyId, role: 'OWNER' },
    data: { role: 'ADMIN' },
  });

  // 3. Habilitar features de empresa
  await enableBusinessFeatures(companyId);
}
```

### Empresa → Individual

Não permitido diretamente (precisaria remover usuários primeiro).

---

## Isolamento de Dados

```typescript
// Middleware Prisma para garantir isolamento
prisma.$use(async (params, next) => {
  // Adicionar companyId em todas as queries
  if (params.action === 'findMany' || params.action === 'findFirst') {
    if (!params.args.where) params.args.where = {};
    params.args.where.companyId = currentCompanyId;
  }

  // Adicionar companyId em creates
  if (params.action === 'create') {
    params.args.data.companyId = currentCompanyId;
  }

  return next(params);
});
```

---

## Checklist de Implementação

### Backend
- [ ] Enum `CompanyMode` no schema
- [ ] Campo `mode` em Company
- [ ] Middleware de isolamento por `companyId`
- [ ] Regras de negócio adaptadas ao modo
- [ ] Endpoints de upgrade de plano

### Frontend
- [ ] Tela de onboarding com seleção de modo
- [ ] Sidebar adaptativo
- [ ] Formulários simplificados para Individual
- [ ] Dashboard específico por modo
- [ ] Esconder features não disponíveis

### Permissões
- [ ] Role `OWNER` para modo Individual
- [ ] Abilities específicas por modo
- [ ] Validação de features por plano

---

**Voltar para** [Regras de Negócio](./README.md)
