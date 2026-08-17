# Warranty (Garantia)

> **Entidade que representa garantias emitidas para serviços e peças.**

---

## Schema Prisma

```prisma
model Warranty {
  id              String          @id @default(uuid())
  companyId       String
  company         Company         @relation(fields: [companyId], references: [id])

  // Relacionamentos
  serviceOrderId  String
  serviceOrder    ServiceOrder    @relation(fields: [serviceOrderId], references: [id])
  customerId      String
  customer        Customer        @relation(fields: [customerId], references: [id])
  equipmentId     String
  equipment       Equipment       @relation(fields: [equipmentId], references: [id])

  // Código único para consulta
  code            String          @unique  // WRT-XXXXX

  // Tipo de garantia
  type            WarrantyType

  // Itens cobertos
  items           WarrantyItem[]

  // Datas
  startDate       DateTime        @default(now())
  endDate         DateTime

  // Status
  status          WarrantyStatus  @default(ACTIVE)

  // Termos aceitos
  termsAccepted   Boolean         @default(false)
  termsAcceptedAt DateTime?

  // Assinatura digital
  signatureUrl    String?

  // Acionamentos
  claims          WarrantyClaim[]

  // Observações
  notes           String?

  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  @@index([companyId])
  @@index([companyId, code])
  @@index([companyId, customerId])
  @@index([companyId, serviceOrderId])
  @@index([companyId, status])
}

model WarrantyItem {
  id              String          @id @default(uuid())
  warrantyId      String
  warranty        Warranty        @relation(fields: [warrantyId], references: [id])

  // O que está coberto
  type            WarrantyItemType
  description     String

  // Se for peça
  partId          String?
  part            Part?           @relation(fields: [partId], references: [id])
  partType        PartType?       // ORIGINAL, COMPATIBLE, GENERIC

  // Prazo específico (pode ser diferente do serviço)
  durationDays    Int
  expiresAt       DateTime

  createdAt       DateTime        @default(now())
}

model WarrantyClaim {
  id              String          @id @default(uuid())
  warrantyId      String
  warranty        Warranty        @relation(fields: [warrantyId], references: [id])

  // Descrição do problema
  description     String

  // Fotos do problema
  photos          String[]

  // Análise
  analysis        String?
  isValid         Boolean?        // null = pendente, true = válido, false = negado
  invalidReason   String?

  // Resultado
  result          ClaimResult?

  // Nova OS gerada (se aplicável)
  newServiceOrderId String?
  newServiceOrder ServiceOrder?   @relation("WarrantyRepair", fields: [newServiceOrderId], references: [id])

  // Quem analisou
  analyzedById    String?
  analyzedBy      Membership?     @relation(fields: [analyzedById], references: [id])
  analyzedAt      DateTime?

  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  @@index([warrantyId])
}

enum WarrantyType {
  SERVICE         // Garantia do serviço
  PART            // Garantia de peça específica
  FULL            // Garantia completa (serviço + peças)
}

enum WarrantyStatus {
  ACTIVE          // Garantia ativa
  EXPIRED         // Expirada
  VOIDED          // Anulada (violação de termos)
  CLAIMED         // Acionada (em análise)
  RENEWED         // Renovada após retorno
}

enum WarrantyItemType {
  SERVICE         // Mão de obra
  PART            // Peça
  COMPONENT       // Componente específico
}

enum ClaimResult {
  APPROVED        // Aprovado - reparo gratuito
  PARTIAL         // Parcialmente aprovado
  DENIED          // Negado
  PENDING         // Aguardando análise
}
```

---

## Fluxo de Garantia

```
┌─────────────────────────────────────────────────────────────────┐
│                    OS FINALIZADA                                │
│                    status: COMPLETED                            │
└────────┬────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    GERAR GARANTIA                               │
│                    (automático ou manual)                       │
└────────┬────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    TERMO DE GARANTIA                            │
│                    - Itens cobertos                             │
│                    - Prazos por item                            │
│                    - Exclusões                                  │
└────────┬────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENTE ACEITA                               │
│                    (assinatura digital)                         │
└────────┬────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    GARANTIA ATIVA                               │
│                    status: ACTIVE                               │
│                    Pode ser consultada por código               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Acionamento de Garantia

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENTE RETORNA                              │
│                    "Problema X dentro do prazo"                 │
└────────┬────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BUSCAR GARANTIA                              │
│                    - Por código WRT-XXXXX                       │
│                    - Por OS anterior                            │
│                    - Por equipamento                            │
└────────┬────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    VERIFICAR COBERTURA                          │
│                    - Garantia ativa?                            │
│                    - Item coberto?                              │
│                    - Dentro do prazo?                           │
└────────┬────────────────────────────────────────────────────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
[COBERTO]  [NÃO COBERTO]
    │         │
    │         ▼
    │    ┌─────────────────┐
    │    │ Informar cliente│
    │    │ Ofertar reparo  │
    │    │ pago (nova OS)  │
    │    └─────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CRIAR CLAIM                                  │
│                    - Descrever problema                         │
│                    - Anexar fotos                               │
└────────┬────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ANÁLISE TÉCNICA                              │
│                    - Verificar se é defeito coberto             │
│                    - Verificar se não é mau uso                 │
└────────┬────────────────────────────────────────────────────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
[VÁLIDO]   [INVÁLIDO]
    │         │
    │         ▼
    │    ┌─────────────────┐
    │    │ Registrar motivo│
    │    │ Notificar       │
    │    │ cliente         │
    │    └─────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CRIAR NOVA OS                                │
│                    - Vinculada à garantia                       │
│                    - Sem custo para cliente                     │
│                    - Prioridade alta                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Cálculo de Prazos

```typescript
function calculateWarrantyDates(
  items: QuoteItem[],
  config: WarrantyConfig,
  startDate: Date = new Date()
): WarrantyItem[] {
  const warrantyItems: WarrantyItem[] = [];

  // Garantia do serviço
  warrantyItems.push({
    type: 'SERVICE',
    description: 'Mão de obra',
    durationDays: config.serviceDays,
    expiresAt: addDays(startDate, config.serviceDays),
  });

  // Garantia das peças
  items
    .filter(item => item.type === 'PART' && item.partId)
    .forEach(item => {
      let days: number;

      switch (item.partType) {
        case 'ORIGINAL':
          days = config.originalPartDays;
          break;
        case 'COMPATIBLE':
          days = config.compatiblePartDays;
          break;
        case 'GENERIC':
          days = config.genericPartDays;
          break;
        default:
          days = config.serviceDays;
      }

      warrantyItems.push({
        type: 'PART',
        description: item.description,
        partId: item.partId,
        partType: item.partType,
        durationDays: days,
        expiresAt: addDays(startDate, days),
      });
    });

  return warrantyItems;
}
```

---

## Endpoints da API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/warranties` | Listar garantias |
| GET | `/warranties/:id` | Buscar garantia |
| GET | `/warranties/code/:code` | Buscar por código |
| POST | `/warranties` | Criar garantia |
| POST | `/warranties/:id/accept` | Aceitar termos |
| POST | `/warranties/:id/void` | Anular garantia |
| GET | `/warranties/:id/claims` | Listar acionamentos |
| POST | `/warranties/:id/claims` | Criar acionamento |
| PUT | `/warranties/:id/claims/:claimId` | Analisar acionamento |

### Consulta Pública

```http
GET /public/warranty/:code

{
  "data": {
    "code": "WRT-12345",
    "status": "ACTIVE",
    "equipment": {
      "type": "SMARTPHONE",
      "brand": "Apple",
      "model": "iPhone 13"
    },
    "items": [
      {
        "description": "Mão de obra",
        "expiresAt": "2025-04-16",
        "daysRemaining": 90
      },
      {
        "description": "Tela iPhone 13 Original",
        "expiresAt": "2025-04-16",
        "daysRemaining": 90
      }
    ],
    "company": {
      "name": "TechCare Assistência",
      "phone": "(11) 99999-9999"
    }
  }
}
```

---

## Regras de Negócio

### Criação
- Garantia é criada automaticamente após conclusão da OS (configurável)
- Pode ser criada manualmente pelo atendente
- Código único gerado automaticamente (WRT-XXXXX)

### Cobertura
- Cada item tem seu próprio prazo
- Prazo mais longo define validade geral
- Peças originais têm maior prazo que genéricas

### Exclusões (padrão)
- Danos por queda ou impacto
- Danos por líquidos
- Violação de lacres de segurança
- Reparos realizados por terceiros
- Desgaste natural de uso
- Problemas de software não relacionados ao serviço

### Anulação
- Violação de termos anula a garantia
- Registrar motivo e evidências
- Cliente é notificado

### Renovação
- Após retorno em garantia, prazo pode ser renovado (configurável)
- Nova garantia cobre apenas o item reparado

---

## Termo de Garantia (Template)

```
╔══════════════════════════════════════════════════════════════════╗
║                     TERMO DE GARANTIA                             ║
║                                                                   ║
║  Código: WRT-12345                                               ║
║  Data: 16/01/2025                                                ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  EMPRESA: TechCare Assistência Técnica                           ║
║  CNPJ: 00.000.000/0001-00                                        ║
║                                                                   ║
║  CLIENTE: João Silva                                             ║
║  CPF: 123.456.789-00                                             ║
║                                                                   ║
║  EQUIPAMENTO: Apple iPhone 13                                    ║
║  IMEI: 123456789012345                                           ║
║                                                                   ║
║  OS: OS-202501-00042                                             ║
║                                                                   ║
╠══════════════════════════════════════════════════════════════════╣
║  ITENS COBERTOS                                                   ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  Item                           Prazo       Válido até           ║
║  ─────────────────────────────────────────────────────────────   ║
║  Serviço de troca de tela       90 dias     16/04/2025          ║
║  Tela iPhone 13 Original        90 dias     16/04/2025          ║
║                                                                   ║
╠══════════════════════════════════════════════════════════════════╣
║  CONDIÇÕES E EXCLUSÕES                                            ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  Esta garantia cobre defeitos de fabricação da peça e/ou         ║
║  falhas no serviço executado.                                    ║
║                                                                   ║
║  NÃO ESTÃO COBERTOS:                                             ║
║  • Danos causados por queda ou impacto                           ║
║  • Danos causados por líquidos                                   ║
║  • Violação de lacres de segurança                               ║
║  • Reparos realizados por terceiros                              ║
║  • Problemas de software não relacionados ao serviço             ║
║                                                                   ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  Em caso de problema, entre em contato:                          ║
║  • WhatsApp: (11) 99999-9999                                     ║
║  • Email: garantia@techcare.app                                  ║
║  • Consulte online: techcare.app/garantia/WRT-12345              ║
║                                                                   ║
║                        [QR CODE]                                  ║
║                                                                   ║
╚══════════════════════════════════════════════════════════════════╝
```

---

**Voltar para** [Entidades](./README.md)
