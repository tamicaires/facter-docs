# Equipment (Equipamento)

> **Entidade que representa um equipamento do cliente.**

---

## Schema Prisma

```prisma
model Equipment {
  id              String            @id @default(uuid())
  companyId       String
  company         Company           @relation(fields: [companyId], references: [id])

  // Proprietário
  customerId      String
  customer        Customer          @relation(fields: [customerId], references: [id])

  // Identificação
  type            EquipmentType
  brand           String
  model           String
  color           String?

  // Identificadores únicos
  serialNumber    String?
  imei            String?
  imei2           String?

  // Detalhes
  description     String?           // Descrição livre
  accessories     String[]          // Acessórios cadastrados
  condition       EquipmentCondition @default(GOOD)

  // Fotos
  photos          EquipmentPhoto[]

  // Relacionamentos
  serviceOrders   ServiceOrder[]

  // Soft delete
  deletedAt       DateTime?

  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  @@index([companyId, customerId])
  @@index([companyId, imei])
  @@index([companyId, serialNumber])
}

model EquipmentPhoto {
  id            String      @id @default(uuid())
  equipmentId   String
  equipment     Equipment   @relation(fields: [equipmentId], references: [id])

  url           String
  type          PhotoType   @default(GENERAL)
  description   String?

  createdAt     DateTime    @default(now())
}

enum EquipmentType {
  SMARTPHONE
  TABLET
  NOTEBOOK
  DESKTOP
  MONITOR
  PRINTER
  CONSOLE
  SMARTWATCH
  HEADPHONE
  OTHER
}

enum EquipmentCondition {
  NEW           // Novo
  EXCELLENT     // Excelente
  GOOD          // Bom
  FAIR          // Regular
  POOR          // Ruim
}

enum PhotoType {
  GENERAL       // Geral
  FRONT         // Frente
  BACK          // Traseira
  DAMAGE        // Dano
  SCREEN        // Tela
  ACCESSORY     // Acessório
}
```

---

## Endpoints da API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/equipment` | Listar equipamentos |
| GET | `/equipment/:id` | Buscar equipamento |
| POST | `/equipment` | Criar equipamento |
| PUT | `/equipment/:id` | Atualizar equipamento |
| DELETE | `/equipment/:id` | Excluir equipamento |
| POST | `/equipment/:id/photos` | Adicionar foto |
| GET | `/equipment/search?imei=` | Buscar por IMEI |

---

## Validações

```typescript
const equipmentSchema = z.object({
  customerId: z.string().uuid(),
  type: z.enum(EQUIPMENT_TYPES),
  brand: z.string().min(1).max(100),
  model: z.string().min(1).max(100),
  color: z.string().max(50).optional(),
  serialNumber: z.string().max(100).optional(),
  imei: z.string().length(15).optional().refine(isValidImei),
  imei2: z.string().length(15).optional().refine(isValidImei),
  condition: z.enum(CONDITIONS).optional(),
  accessories: z.array(z.string()).optional(),
});
```

---

## Regras de Negócio

- IMEI deve ser válido (15 dígitos, algoritmo de Luhn)
- IMEI único por empresa
- Equipamento sempre vinculado a um cliente
- Fotos recomendadas no cadastro

---

**Voltar para** [Entidades](./README.md)
