# Notificações

> **Sistema de notificações multicanal para comunicação com clientes.**

---

## Canais Disponíveis

| Canal | Uso Principal | Custo |
|-------|---------------|-------|
| **Email** | Orçamentos, recibos, documentos | Baixo |
| **WhatsApp** | Atualizações rápidas, aprovações | Médio |
| **SMS** | Alertas urgentes, lembretes | Alto |
| **Push (PWA)** | Notificações internas | Grátis |
| **Sistema** | Notificações internas | Grátis |

---

## Eventos e Notificações

### Para o Cliente

| Evento | Email | WhatsApp | SMS |
|--------|-------|----------|-----|
| OS Criada | ✅ | ✅ | ❌ |
| Orçamento Pronto | ✅ | ✅ | ❌ |
| Lembrete Orçamento (D-2) | ❌ | ✅ | ❌ |
| Orçamento Expirando | ❌ | ✅ | ❌ |
| Aguardando Peças | ❌ | ✅ | ❌ |
| OS Finalizada | ✅ | ✅ | ❌ |
| Pronto para Retirada | ✅ | ✅ | ✅ |
| Lembrete Retirada (D+3) | ❌ | ✅ | ❌ |
| Pesquisa de Satisfação | ✅ | ❌ | ❌ |

### Para a Equipe (Sistema/Push)

| Evento | Destinatário |
|--------|--------------|
| Nova OS | Atendentes |
| OS Atribuída | Técnico específico |
| Orçamento Aprovado | Técnico da OS |
| Orçamento Rejeitado | Técnico + Atendente |
| Peça Chegou | Técnico da OS |
| Estoque Baixo | Gerente |
| Cliente Aguardando | Atendentes |

---

## Templates de Mensagem

### WhatsApp

```typescript
const WHATSAPP_TEMPLATES = {
  OS_CREATED: {
    name: 'os_criada',
    components: [
      { type: 'body', parameters: ['{{cliente}}', '{{numero_os}}', '{{equipamento}}'] }
    ],
    example: `Olá {{cliente}}! 👋

Sua ordem de serviço *{{numero_os}}* foi criada com sucesso.

📱 Equipamento: {{equipamento}}

Acompanhe o status pelo link:
{{link}}

Qualquer dúvida, estamos à disposição!`
  },

  QUOTE_READY: {
    name: 'orcamento_pronto',
    components: [
      { type: 'body', parameters: ['{{cliente}}', '{{numero_os}}', '{{valor}}', '{{validade}}'] },
      { type: 'button', sub_type: 'url', parameters: ['{{link}}'] }
    ],
    example: `Olá {{cliente}}! 📋

O orçamento da OS *{{numero_os}}* está pronto!

💰 Valor: *R$ {{valor}}*
⏰ Válido até: {{validade}}

Acesse para aprovar ou tirar dúvidas:
{{link}}`
  },

  READY_FOR_PICKUP: {
    name: 'pronto_retirada',
    example: `Olá {{cliente}}! ✅

Ótima notícia! Seu equipamento está *pronto para retirada*!

📱 OS: {{numero_os}}
🏪 Local: {{endereco}}
🕐 Horário: {{horario}}

Valor a pagar: *R$ {{valor}}*

Aguardamos você! 😊`
  }
};
```

### Email (HTML)

```typescript
const EMAIL_TEMPLATES = {
  QUOTE_READY: {
    subject: 'Orçamento {{numero_os}} - {{empresa}}',
    template: 'quote-ready.hbs', // Handlebars template
    data: {
      cliente: string,
      empresa: string,
      numero_os: string,
      equipamento: string,
      diagnostico: string,
      itens: QuoteItem[],
      total: number,
      validade: Date,
      link_aprovacao: string,
    }
  }
};
```

---

## Preferências do Cliente

```prisma
model CustomerNotificationPreferences {
  id           String   @id @default(uuid())
  customerId   String   @unique
  customer     Customer @relation(fields: [customerId], references: [id])

  // Canais habilitados
  emailEnabled     Boolean @default(true)
  whatsappEnabled  Boolean @default(true)
  smsEnabled       Boolean @default(false)

  // Tipos de notificação
  statusUpdates    Boolean @default(true)   // Atualizações de status
  promotions       Boolean @default(false)  // Promoções
  reminders        Boolean @default(true)   // Lembretes

  // Horário preferido
  quietHoursStart  String? // "22:00"
  quietHoursEnd    String? // "08:00"
}
```

---

## Integração WhatsApp Business API

### Opções de Provedor

| Provedor | Preço/msg | Recursos |
|----------|-----------|----------|
| Meta (oficial) | ~R$0,15 | Templates, webhooks |
| Twilio | ~R$0,20 | API simples, logs |
| Z-API | ~R$0,08 | Brasileiro, suporte |
| Evolution API | Self-hosted | Open source |

### Fluxo de Envio

```typescript
interface WhatsAppService {
  // Enviar template aprovado pela Meta
  sendTemplate(to: string, template: string, params: string[]): Promise<void>;

  // Enviar mensagem (apenas em conversa ativa - 24h)
  sendMessage(to: string, message: string): Promise<void>;

  // Enviar mídia
  sendMedia(to: string, mediaUrl: string, caption?: string): Promise<void>;

  // Webhook para respostas
  handleWebhook(payload: WebhookPayload): Promise<void>;
}
```

### Respostas do Cliente

```typescript
// Processar resposta do cliente
async function handleCustomerReply(message: WhatsAppMessage) {
  const { from, text, context } = message;

  // Identificar OS relacionada
  const customer = await findCustomerByPhone(from);
  const pendingQuote = await findPendingQuote(customer.id);

  // Respostas automáticas para aprovação
  if (pendingQuote && isApprovalResponse(text)) {
    if (text.toLowerCase().includes('aprovar') || text === '1') {
      await approveQuote(pendingQuote.id);
      await sendWhatsApp(from, 'Orçamento aprovado! Iniciaremos o reparo.');
    } else if (text.toLowerCase().includes('rejeitar') || text === '2') {
      await rejectQuote(pendingQuote.id, 'Rejeitado via WhatsApp');
      await sendWhatsApp(from, 'Orçamento cancelado. Quando deseja retirar o equipamento?');
    }
  }
}
```

---

## Agendamento e Filas

```typescript
interface NotificationQueue {
  id: string;
  type: NotificationType;
  channel: 'EMAIL' | 'WHATSAPP' | 'SMS';
  recipientId: string;
  recipientContact: string;
  payload: Record<string, any>;
  scheduledFor: Date;
  status: 'PENDING' | 'SENT' | 'FAILED' | 'CANCELLED';
  attempts: number;
  lastAttempt?: Date;
  error?: string;
}

// Job de processamento (Bull/BullMQ)
const notificationQueue = new Queue('notifications');

notificationQueue.process(async (job) => {
  const notification = job.data;

  // Verificar quiet hours
  if (isQuietHours(notification.recipientId)) {
    // Re-agendar para próximo horário permitido
    return reschedule(notification);
  }

  // Enviar
  switch (notification.channel) {
    case 'WHATSAPP':
      await whatsappService.sendTemplate(...);
      break;
    case 'EMAIL':
      await emailService.send(...);
      break;
    case 'SMS':
      await smsService.send(...);
      break;
  }
});
```

---

## Configurações por Empresa

```typescript
interface CompanyNotificationSettings {
  // Canais habilitados
  channels: {
    email: boolean;
    whatsapp: boolean;
    sms: boolean;
  };

  // Credenciais
  whatsapp: {
    provider: 'META' | 'TWILIO' | 'ZAPI' | 'EVOLUTION';
    apiKey?: string;
    phoneNumberId?: string;
    instanceUrl?: string;
  };

  email: {
    provider: 'SENDGRID' | 'MAILGUN' | 'SES' | 'SMTP';
    fromName: string;
    fromEmail: string;
    replyTo?: string;
  };

  sms: {
    provider: 'TWILIO' | 'ZENVIA';
    apiKey?: string;
  };

  // Templates customizados
  customTemplates: boolean;
  logoUrl?: string;
  primaryColor?: string;
}
```

---

## Modo Individual vs Empresa

| Aspecto | Individual | Empresa |
|---------|------------|---------|
| WhatsApp | Do próprio celular | Número da empresa |
| Email | Gmail/pessoal | Domínio próprio |
| Templates | Padrão | Personalizáveis |
| Logo | Opcional | Obrigatório |

---

**Voltar para** [Regras de Negócio](./README.md)
