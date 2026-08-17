# Fluxo de Orçamento

> **Processo de geração, envio e aprovação de orçamentos.**

---

## Diagrama

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FLUXO DE ORÇAMENTO                                 │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌───────────────────┐
    │    Diagnóstico    │
    │    Concluído      │
    └─────────┬─────────┘
              │
              ▼
    ┌───────────────────────────────────────────┐
    │           GERAÇÃO DO ORÇAMENTO             │
    │  ┌─────────────────────────────────────┐  │
    │  │ • Itens de serviço                  │  │
    │  │ • Peças necessárias                 │  │
    │  │ • Mão de obra                       │  │
    │  │ • Descontos                         │  │
    │  │ • Prazo de execução                 │  │
    │  │ • Validade do orçamento             │  │
    │  └─────────────────────────────────────┘  │
    └───────────────────┬───────────────────────┘
                        │
                        ▼
              ┌─────────────────┐
              │  Valor acima do │
              │  limite?        │
              └────────┬────────┘
                       │
          ┌────────────┴────────────┐
          │                         │
          ▼                         ▼
    ┌───────────┐           ┌───────────────┐
    │    NÃO    │           │      SIM      │
    └─────┬─────┘           └───────┬───────┘
          │                         │
          │                         ▼
          │                 ┌───────────────┐
          │                 │ Aprovação     │
          │                 │ Gerente       │
          │                 └───────┬───────┘
          │                         │
          │         ┌───────────────┴───────────────┐
          │         │                               │
          │         ▼                               ▼
          │   ┌───────────┐                 ┌───────────┐
          │   │ Aprovado  │                 │ Rejeitado │
          │   └─────┬─────┘                 └─────┬─────┘
          │         │                             │
          └─────────┴──────────┐                  │
                               │                  │
                               ▼                  ▼
                       ┌───────────────┐   ┌─────────────┐
                       │ Enviar para   │   │  Revisar    │
                       │ Cliente       │   │  Orçamento  │
                       └───────┬───────┘   └─────────────┘
                               │
                               ▼
                       ┌───────────────┐
                       │ AWAITING_     │
                       │ APPROVAL      │
                       └───────┬───────┘
                               │
                               ▼
                       ┌───────────────┐
                       │ Cliente       │
                       │ Responde      │
                       └───────┬───────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
          ▼                    ▼                    ▼
    ┌───────────┐      ┌───────────────┐    ┌───────────┐
    │ APROVADO  │      │  NEGOCIAR     │    │ REJEITADO │
    └─────┬─────┘      └───────┬───────┘    └─────┬─────┘
          │                    │                  │
          ▼                    ▼                  ▼
    ┌───────────────┐  ┌───────────────┐    ┌───────────────┐
    │ Aguardar      │  │ Novo          │    │ Cliente       │
    │ Peças/Iniciar │  │ Orçamento     │    │ retira equip. │
    └───────────────┘  └───────────────┘    └───────────────┘
```

---

## Estados do Orçamento

| Estado | Descrição |
|--------|-----------|
| `DRAFT` | Rascunho |
| `PENDING_INTERNAL` | Aguardando aprovação interna |
| `SENT` | Enviado ao cliente |
| `VIEWED` | Visualizado pelo cliente |
| `APPROVED` | Aprovado |
| `REJECTED` | Rejeitado |
| `EXPIRED` | Expirado |
| `CANCELLED` | Cancelado |

---

## Estrutura do Orçamento

```typescript
interface Quote {
  id: string;
  number: string;              // ORC-2024-00001
  serviceOrderId: string;

  // Itens
  items: QuoteItem[];

  // Valores
  subtotal: number;
  laborTotal: number;
  partsTotal: number;
  discount: number;
  discountType: 'PERCENTAGE' | 'FIXED';
  total: number;

  // Prazos
  estimatedDays: number;       // Prazo de execução
  validUntil: Date;            // Validade do orçamento

  // Status
  status: QuoteStatus;
  sentAt?: Date;
  viewedAt?: Date;
  respondedAt?: Date;

  // Aprovação interna
  requiresApproval: boolean;
  approvedById?: string;
  approvedAt?: Date;

  // Resposta do cliente
  customerResponse?: 'APPROVED' | 'REJECTED' | 'NEGOTIATING';
  customerNotes?: string;

  // Termos
  terms: string;
  notes: string;

  createdAt: Date;
  createdById: string;
}

interface QuoteItem {
  id: string;
  type: 'SERVICE' | 'PART';
  description: string;

  // Se for peça
  partId?: string;
  partSku?: string;

  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;

  // Origem do preço
  priceSource: 'CATALOG' | 'CUSTOM' | 'NEGOTIATED';

  notes?: string;
}
```

---

## Ações

### 1. Gerar Orçamento

```typescript
// POST /quotes
{
  "serviceOrderId": "order-uuid",
  "items": [
    {
      "type": "SERVICE",
      "description": "Troca de tela",
      "quantity": 1,
      "unitPrice": 150.00
    },
    {
      "type": "PART",
      "partId": "part-uuid",
      "description": "Tela iPhone 14 Pro Original",
      "quantity": 1,
      "unitPrice": 450.00
    }
  ],
  "discount": 10,
  "discountType": "PERCENTAGE",
  "estimatedDays": 3,
  "validityDays": 15,
  "notes": "Garantia de 90 dias nos serviços"
}
```

### 2. Enviar para Cliente

```typescript
// POST /quotes/:id/send
{
  "channels": ["whatsapp", "email"],
  "message": "Olá! Segue o orçamento para seu equipamento..."
}
```

### 3. Cliente Aprova (Link Público)

```typescript
// POST /quotes/:id/approve (token no header)
{
  "customerName": "João Silva",
  "signature": "data:image/png;base64,..."  // Assinatura digital
}
```

### 4. Cliente Rejeita

```typescript
// POST /quotes/:id/reject
{
  "reason": "Valor muito alto",
  "notes": "Gostaria de negociar o valor"
}
```

---

## Página Pública de Orçamento

URL: `https://techcare.app/orcamento/{token}`

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo TechFix]                                        Orçamento #ORC-00001 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Cliente: João Silva                                                         │
│  Equipamento: iPhone 14 Pro - Apple                                         │
│  OS: OS-202501-00001                                                         │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  ITENS DO ORÇAMENTO                                                          │
│                                                                              │
│  ┌────────────────────────────────┬──────┬───────────┬───────────┐          │
│  │ Descrição                      │ Qtd  │ Unit.     │ Total     │          │
│  ├────────────────────────────────┼──────┼───────────┼───────────┤          │
│  │ Troca de tela                  │ 1    │ R$ 150,00 │ R$ 150,00 │          │
│  │ Tela iPhone 14 Pro Original    │ 1    │ R$ 450,00 │ R$ 450,00 │          │
│  ├────────────────────────────────┼──────┼───────────┼───────────┤          │
│  │ Subtotal                       │      │           │ R$ 600,00 │          │
│  │ Desconto (10%)                 │      │           │ -R$ 60,00 │          │
│  │ TOTAL                          │      │           │ R$ 540,00 │          │
│  └────────────────────────────────┴──────┴───────────┴───────────┘          │
│                                                                              │
│  Prazo de Execução: 3 dias úteis                                            │
│  Validade: até 30/01/2024                                                   │
│                                                                              │
│  Garantia: 90 dias nos serviços e peças                                     │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────┐    ┌─────────────────────────┐                 │
│  │   ✓ APROVAR ORÇAMENTO   │    │    ✗ RECUSAR            │                 │
│  └─────────────────────────┘    └─────────────────────────┘                 │
│                                                                              │
│  💬 Tem dúvidas? Fale conosco: (11) 99999-9999                              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Regras de Negócio

1. **Validade padrão**: 15 dias (configurável)
2. **Aprovação interna**: Valores acima de R$ 1.000 (configurável)
3. **Desconto máximo**: 20% sem aprovação gerencial
4. **Revisões**: Máximo 3 revisões por orçamento
5. **Expiração**: Sistema marca automaticamente como expirado
6. **Notificações**: Lembrete 3 dias antes de expirar

---

## Notificações

| Evento | Destinatário | Canal |
|--------|--------------|-------|
| Orçamento enviado | Cliente | WhatsApp, Email |
| Orçamento visualizado | Atendente | Sistema |
| Orçamento aprovado | Atendente, Técnico | Sistema, Email |
| Orçamento rejeitado | Atendente | Sistema, Email |
| Orçamento expirando | Cliente, Atendente | WhatsApp, Email |
| Orçamento expirado | Atendente | Sistema |

---

**Voltar para** [Fluxos](./README.md)
