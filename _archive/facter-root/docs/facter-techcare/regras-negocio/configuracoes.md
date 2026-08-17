# Configurações do Sistema

> **Parâmetros configuráveis por empresa/usuário.**

---

## Níveis de Configuração

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        HIERARQUIA DE CONFIGURAÇÕES                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────┐      │
│   │                    PLATAFORMA (Global)                       │      │
│   │  • Funcionalidades por plano                                 │      │
│   │  • Limites de uso                                            │      │
│   │  • Integrações disponíveis                                   │      │
│   └─────────────────────────────────────────────────────────────┘      │
│                              │                                          │
│                              ▼                                          │
│   ┌─────────────────────────────────────────────────────────────┐      │
│   │                    EMPRESA (Company)                         │      │
│   │  • Dados da empresa                                          │      │
│   │  • Configurações de OS                                       │      │
│   │  • Integrações                                               │      │
│   │  • Notificações                                              │      │
│   └─────────────────────────────────────────────────────────────┘      │
│                              │                                          │
│                              ▼                                          │
│   ┌─────────────────────────────────────────────────────────────┐      │
│   │                    USUÁRIO (User)                            │      │
│   │  • Preferências pessoais                                     │      │
│   │  • Interface                                                 │      │
│   │  • Notificações internas                                     │      │
│   └─────────────────────────────────────────────────────────────┘      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Configurações da Empresa

### Dados Básicos

```typescript
interface CompanySettings {
  // Identificação
  profile: {
    name: string;
    tradeName?: string;        // Nome fantasia
    document: string;          // CNPJ ou CPF
    stateRegistration?: string;
    phone: string;
    email: string;
    website?: string;
    logo?: string;
  };

  // Endereço
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };

  // Horário de funcionamento
  businessHours: {
    monday: { open: string; close: string; } | null;
    tuesday: { open: string; close: string; } | null;
    // ... outros dias
    sunday: { open: string; close: string; } | null;
  };
}
```

### Configurações de OS

```typescript
interface ServiceOrderSettings {
  // Numeração
  numbering: {
    prefix: string;            // "OS"
    format: string;            // "{prefix}-{year}{month}-{seq:5}"
    resetPeriod: 'MONTHLY' | 'YEARLY' | 'NEVER';
  };

  // Status workflow
  workflow: {
    requireTriage: boolean;           // Exigir etapa de triagem
    requirePhotosOnReceive: boolean;  // Fotos obrigatórias na entrada
    requirePhotosOnComplete: boolean; // Fotos obrigatórias na saída
    requireSignatureOnDelivery: boolean; // Assinatura na entrega
    autoArchiveAfterDays: number;     // Arquivar após X dias da entrega
  };

  // Prioridades
  priorities: {
    normal: { slaHours: number; multiplier: number; };
    high: { slaHours: number; multiplier: number; };
    urgent: { slaHours: number; multiplier: number; };
  };

  // Campos customizados
  customFields: CustomField[];
}

interface CustomField {
  id: string;
  name: string;
  type: 'TEXT' | 'NUMBER' | 'DATE' | 'SELECT' | 'CHECKBOX';
  required: boolean;
  options?: string[];  // Para SELECT
  showOnCreate: boolean;
  showOnPrint: boolean;
}
```

### Configurações de Orçamento

```typescript
interface QuoteSettings {
  // Validade
  defaultValidityDays: number;      // Padrão: 7
  minValidityDays: number;          // Mínimo: 3
  maxValidityDays: number;          // Máximo: 30

  // Descontos
  discounts: {
    maxPercentWithoutApproval: number;  // % que atendente pode dar
    vipDiscount: number;                 // % automático para VIP
    premiumDiscount: number;             // % automático para Premium
  };

  // Markup de peças
  defaultMarkup: {
    original: number;      // 1.4 = 40%
    compatible: number;    // 1.6 = 60%
    generic: number;       // 2.0 = 100%
  };

  // Serviços padrão
  defaultServices: {
    diagnosisFee: number;         // Valor do diagnóstico
    chargeDiagnosisIfRejected: boolean;  // Cobrar se rejeitado
  };

  // Mensagens
  messages: {
    header?: string;
    footer?: string;
    warrantyTerms?: string;
  };
}
```

### Configurações de Garantia

```typescript
interface WarrantySettings {
  // Prazos padrão (dias)
  defaultPeriods: {
    service: number;       // Garantia do serviço: 90 dias
    originalPart: number;  // Peça original: 90 dias
    compatiblePart: number; // Peça compatível: 60 dias
    genericPart: number;   // Peça genérica: 30 dias
  };

  // Termos
  terms: string;  // Texto dos termos de garantia

  // Exclusões
  exclusions: string[];  // Lista do que não cobre
}
```

### Configurações de Impressão

```typescript
interface PrintSettings {
  // Comprovante de recebimento
  receiptTemplate: 'SIMPLE' | 'DETAILED' | 'CUSTOM';
  receiptCustomTemplate?: string;  // HTML/Handlebars
  receiptSize: 'A4' | '80MM' | '58MM';

  // Orçamento
  quoteTemplate: 'SIMPLE' | 'DETAILED' | 'CUSTOM';
  quoteCustomTemplate?: string;

  // Termo de garantia
  warrantyTemplate: 'DEFAULT' | 'CUSTOM';
  warrantyCustomTemplate?: string;

  // Etiqueta de identificação
  labelTemplate: string;
  labelSize: '40x30' | '50x25' | '60x40';

  // Recibo de pagamento
  paymentReceiptTemplate: string;
}
```

---

## Configurações de Usuário

```typescript
interface UserSettings {
  // Interface
  ui: {
    theme: 'LIGHT' | 'DARK' | 'SYSTEM';
    language: 'pt-BR' | 'en-US' | 'es';
    dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
    currency: 'BRL' | 'USD';
    compactMode: boolean;      // Interface compacta
    sidebarCollapsed: boolean;
  };

  // Notificações internas
  notifications: {
    sound: boolean;
    desktop: boolean;
    newOrder: boolean;
    orderAssigned: boolean;
    quoteApproved: boolean;
    lowStock: boolean;
  };

  // Dashboard
  dashboard: {
    defaultView: 'CARDS' | 'LIST' | 'KANBAN';
    defaultPeriod: 'TODAY' | 'WEEK' | 'MONTH';
    widgets: string[];  // IDs dos widgets visíveis
  };

  // Atalhos
  shortcuts: {
    newOrder: string;      // "Ctrl+N"
    search: string;        // "Ctrl+K"
    // ...
  };
}
```

---

## Configurações de Integração

```typescript
interface IntegrationSettings {
  // WhatsApp
  whatsapp: {
    enabled: boolean;
    provider: 'META' | 'TWILIO' | 'ZAPI' | 'EVOLUTION';
    credentials: Record<string, string>;
    defaultTemplates: boolean;
  };

  // Email
  email: {
    enabled: boolean;
    provider: 'SENDGRID' | 'MAILGUN' | 'SES' | 'SMTP';
    credentials: Record<string, string>;
    fromName: string;
    fromEmail: string;
  };

  // Pagamentos
  payments: {
    enabled: boolean;
    providers: {
      pix: { enabled: boolean; key?: string; };
      creditCard: { enabled: boolean; provider?: string; };
      boleto: { enabled: boolean; provider?: string; };
    };
  };

  // Nota Fiscal
  nfe: {
    enabled: boolean;
    provider: 'FOCUSNFE' | 'NFEIO' | 'ENOTAS';
    credentials: Record<string, string>;
    autoEmit: boolean;  // Emitir automaticamente ao pagar
  };

  // Webhooks
  webhooks: {
    enabled: boolean;
    endpoints: {
      url: string;
      events: string[];
      secret: string;
    }[];
  };
}
```

---

## Tela de Configurações

### Estrutura de Menu

```
⚙️ Configurações
├── 🏢 Empresa
│   ├── Dados cadastrais
│   ├── Endereço
│   └── Horário de funcionamento
│
├── 📋 Ordens de Serviço
│   ├── Numeração
│   ├── Fluxo de trabalho
│   ├── Prioridades e SLA
│   └── Campos personalizados
│
├── 💰 Orçamentos
│   ├── Validade
│   ├── Descontos
│   ├── Markup de peças
│   └── Mensagens
│
├── 🛡️ Garantia
│   ├── Prazos padrão
│   └── Termos
│
├── 🖨️ Impressão
│   ├── Comprovantes
│   ├── Orçamentos
│   └── Etiquetas
│
├── 🔔 Notificações
│   ├── WhatsApp
│   ├── Email
│   └── SMS
│
├── 💳 Pagamentos
│   ├── PIX
│   ├── Cartão
│   └── Boleto
│
├── 📄 Nota Fiscal
│   └── Configuração NF-e
│
├── 👥 Usuários (Modo Empresa)
│   ├── Lista de usuários
│   ├── Convites pendentes
│   └── Permissões
│
└── 🔌 Integrações
    ├── API
    └── Webhooks
```

---

## Permissões de Configuração

| Configuração | Atendente | Técnico | Gerente | Admin |
|--------------|-----------|---------|---------|-------|
| Dados da empresa | ❌ | ❌ | ❌ | ✅ |
| Config. de OS | ❌ | ❌ | ✅ | ✅ |
| Orçamentos | ❌ | ❌ | ✅ | ✅ |
| Garantia | ❌ | ❌ | ✅ | ✅ |
| Impressão | ❌ | ❌ | ✅ | ✅ |
| Notificações | ❌ | ❌ | ✅ | ✅ |
| Pagamentos | ❌ | ❌ | ❌ | ✅ |
| NF-e | ❌ | ❌ | ❌ | ✅ |
| Usuários | ❌ | ❌ | ❌ | ✅ |
| Integrações | ❌ | ❌ | ❌ | ✅ |
| Próprio perfil | ✅ | ✅ | ✅ | ✅ |

---

## Validação e Defaults

```typescript
// Schema de validação com Zod
const companySettingsSchema = z.object({
  profile: z.object({
    name: z.string().min(2).max(200),
    document: z.string().refine(isValidCpfOrCnpj),
    phone: z.string().refine(isValidPhone),
    email: z.string().email(),
  }),
  // ...
});

// Valores padrão
const DEFAULT_SETTINGS: CompanySettings = {
  serviceOrder: {
    numbering: {
      prefix: 'OS',
      format: '{prefix}-{year}{month}-{seq:5}',
      resetPeriod: 'MONTHLY',
    },
    workflow: {
      requireTriage: true,
      requirePhotosOnReceive: false,
      requirePhotosOnComplete: false,
      requireSignatureOnDelivery: true,
      autoArchiveAfterDays: 30,
    },
    // ...
  },
  // ...
};
```

---

**Voltar para** [Regras de Negócio](./README.md)
