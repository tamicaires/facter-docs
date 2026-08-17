# Customer (Cliente)

> **Entidade que representa um cliente da assistência técnica.**

---

## Schema Prisma

```prisma
model Customer {
  id              String            @id @default(uuid())
  companyId       String
  company         Company           @relation(fields: [companyId], references: [id])

  // Identificação
  name            String
  document        String?           // CPF ou CNPJ
  documentType    DocumentType?

  // Contato
  email           String?
  phone           String
  phone2          String?

  // Endereço
  address         Address?

  // Classificação
  type            CustomerType      @default(INDIVIDUAL)
  category        CustomerCategory  @default(REGULAR)

  // Preferências de notificação
  notificationPreferences Json?

  // Observações internas
  notes           String?

  // Relacionamentos
  equipment       Equipment[]
  serviceOrders   ServiceOrder[]
  payments        Payment[]
  warranties      Warranty[]

  // Soft delete
  deletedAt       DateTime?

  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  @@unique([companyId, document])
  @@index([companyId, name])
  @@index([companyId, phone])
}

type Address {
  street        String
  number        String
  complement    String?
  neighborhood  String
  city          String
  state         String
  zipCode       String
}

enum DocumentType {
  CPF
  CNPJ
}

enum CustomerType {
  INDIVIDUAL    // Pessoa física
  BUSINESS      // Pessoa jurídica
}

enum CustomerCategory {
  REGULAR       // Cliente comum
  VIP           // Cliente VIP (desconto 10%)
  PREMIUM       // Cliente Premium (desconto 15%)
  RESELLER      // Revendedor (desconto especial)
}
```

---

## Endpoints da API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/customers` | Listar clientes |
| GET | `/customers/:id` | Buscar cliente |
| POST | `/customers` | Criar cliente |
| PUT | `/customers/:id` | Atualizar cliente |
| DELETE | `/customers/:id` | Excluir cliente (soft) |
| GET | `/customers/:id/service-orders` | OS do cliente |
| GET | `/customers/:id/equipment` | Equipamentos do cliente |

---

## Validações

```typescript
const customerSchema = z.object({
  name: z.string().min(2).max(200),
  document: z.string().optional().refine(isValidCpfOrCnpj),
  email: z.string().email().optional(),
  phone: z.string().refine(isValidPhone),
  phone2: z.string().refine(isValidPhone).optional(),
  address: addressSchema.optional(),
  type: z.enum(['INDIVIDUAL', 'BUSINESS']),
  category: z.enum(['REGULAR', 'VIP', 'PREMIUM', 'RESELLER']).optional(),
});
```

---

## Regras de Negócio

- CPF/CNPJ único por empresa
- Telefone obrigatório
- Soft delete (não exclui permanentemente)
- Categorias afetam descontos em orçamentos

---

**Voltar para** [Entidades](./README.md)
