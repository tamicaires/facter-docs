# Entidade: {NomeDaTabela}

> **Schema:** public
> **Tipo:** Tabela principal / Tabela de relacionamento / Tabela de lookup

---

## Descrição

{Descrição do propósito desta entidade no sistema}

---

## Schema Prisma

```prisma
model {NomeDaTabela} {
  id        String   @id @default(uuid())
  // ... campos
  companyId String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relacionamentos
  company   Company  @relation(fields: [companyId], references: [id])

  // Índices
  @@unique([companyId, campoUnico])
  @@index([companyId])
  @@map("nome_tabela_snake_case")
}
```

---

## Campos

| Campo | Tipo | Null | Default | Descrição |
|-------|------|------|---------|-----------|
| id | UUID | Não | uuid() | Identificador único |
| campo1 | String | Não | - | Descrição do campo |
| campo2 | Int | Sim | null | Descrição do campo |
| status | Enum | Não | PENDING | Status do registro |
| companyId | UUID | Não | - | FK para Company (multi-tenant) |
| createdAt | DateTime | Não | now() | Data de criação |
| updatedAt | DateTime | Não | auto | Data de atualização |

---

## Enums

### {StatusEnum}

| Valor | Descrição |
|-------|-----------|
| PENDING | Aguardando processamento |
| ACTIVE | Ativo |
| INACTIVE | Inativo |
| DELETED | Removido (soft delete) |

---

## Relacionamentos

### Pertence a (N:1)

| Entidade | Campo FK | Descrição |
|----------|----------|-----------|
| Company | companyId | Empresa dona do registro |
| User | userId | Usuário responsável |

### Possui muitos (1:N)

| Entidade | Campo FK na outra tabela | Descrição |
|----------|--------------------------|-----------|
| Item | parentId | Itens filhos |

### Muitos para muitos (N:N)

| Entidade | Tabela intermediária | Descrição |
|----------|---------------------|-----------|
| Tag | EntityTag | Tags associadas |

---

## Índices

| Nome | Campos | Tipo | Propósito |
|------|--------|------|-----------|
| PRIMARY | id | PK | Identificador |
| idx_company | companyId | Index | Multi-tenant |
| uq_company_code | companyId, code | Unique | Código único por empresa |
| idx_status | companyId, status | Index | Filtro por status |
| idx_created | companyId, createdAt DESC | Index | Ordenação por data |

---

## Constraints

| Nome | Tipo | Campos | Descrição |
|------|------|--------|-----------|
| pk_entity | Primary Key | id | Chave primária |
| fk_company | Foreign Key | companyId → Company.id | Integridade referencial |
| uq_code | Unique | companyId, code | Código único por tenant |
| chk_value | Check | value >= 0 | Valor não negativo |

---

## Regras de Negócio

| Código | Descrição |
|--------|-----------|
| RN001 | {Regra que afeta esta entidade} |
| RN002 | {Outra regra} |

---

## Exemplos de Queries

### Criar

```typescript
await prisma.entity.create({
  data: {
    campo1: 'valor',
    campo2: 123,
    companyId: company.id,
  },
});
```

### Buscar por ID

```typescript
await prisma.entity.findFirst({
  where: {
    id: entityId,
    companyId: company.id, // SEMPRE filtrar por tenant
  },
  include: {
    relatedEntity: true,
  },
});
```

### Listar com filtros

```typescript
await prisma.entity.findMany({
  where: {
    companyId: company.id,
    status: 'ACTIVE',
    createdAt: {
      gte: startDate,
      lte: endDate,
    },
  },
  orderBy: { createdAt: 'desc' },
  take: pageSize,
  skip: (page - 1) * pageSize,
});
```

### Atualizar

```typescript
await prisma.entity.update({
  where: { id: entityId },
  data: {
    campo1: 'novo valor',
    updatedAt: new Date(),
  },
});
```

### Soft Delete

```typescript
await prisma.entity.update({
  where: { id: entityId },
  data: {
    status: 'DELETED',
    deletedAt: new Date(),
  },
});
```

---

## Migrations

| Data | Migration | Descrição |
|------|-----------|-----------|
| YYYY-MM-DD | create_entity_table | Criação da tabela |
| YYYY-MM-DD | add_entity_status | Adiciona campo status |

---

## Considerações de Performance

- Índice em `companyId` é obrigatório para multi-tenant
- Considerar particionamento se > 10M registros
- Evitar SELECT * em tabelas com muitos campos

---

## Histórico

| Data | Versão | Alteração | Autor |
|------|--------|-----------|-------|
| YYYY-MM-DD | 1.0 | Criação | Nome |

---

**Voltar para** [Banco de Dados](../README.md)
