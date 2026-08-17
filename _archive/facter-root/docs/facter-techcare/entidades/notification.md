# Notification (Notificações)

> **Entidades que gerenciam o sistema de notificações multicanal.**

---

## Schema Prisma

```prisma
// Fila de notificações a serem enviadas
model NotificationQueue {
  id              String          @id @default(uuid())
  companyId       String
  company         Company         @relation(fields: [companyId], references: [id])

  // Tipo de notificação
  type            NotificationType

  // Canal de envio
  channel         NotificationChannel

  // Destinatário
  recipientType   RecipientType   // CUSTOMER, USER
  recipientId     String          // customerId ou userId
  recipientContact String         // email, phone, etc

  // Referência (para contexto)
  referenceType   String?         // 'ServiceOrder', 'Quote', etc
  referenceId     String?

  // Conteúdo
  template        String          // Nome do template
  payload         Json            // Dados para o template
  subject         String?         // Assunto (email)

  // Agendamento
  scheduledFor    DateTime        @default(now())

  // Status
  status          NotificationStatus @default(PENDING)

  // Tentativas
  attempts        Int             @default(0)
  maxAttempts     Int             @default(3)
  lastAttemptAt   DateTime?
  nextRetryAt     DateTime?

  // Resultado
  sentAt          DateTime?
  deliveredAt     DateTime?
  error           String?
  providerMessageId String?       // ID da mensagem no provedor

  // Métricas
  openedAt        DateTime?       // Email aberto
  clickedAt       DateTime?       // Link clicado

  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  @@index([companyId])
  @@index([status, scheduledFor])
  @@index([recipientId])
  @@index([referenceType, referenceId])
}

// Notificações internas (sistema/push)
model InAppNotification {
  id              String          @id @default(uuid())
  companyId       String
  company         Company         @relation(fields: [companyId], references: [id])

  // Destinatário
  membershipId    String
  membership      Membership      @relation(fields: [membershipId], references: [id])

  // Conteúdo
  title           String
  message         String
  icon            String?
  color           String?

  // Ação
  actionType      String?         // 'navigate', 'open_modal', etc
  actionPayload   Json?           // { route: '/os/123' }

  // Referência
  referenceType   String?
  referenceId     String?

  // Status
  read            Boolean         @default(false)
  readAt          DateTime?

  // Arquivada
  archived        Boolean         @default(false)
  archivedAt      DateTime?

  createdAt       DateTime        @default(now())

  @@index([companyId, membershipId])
  @@index([membershipId, read])
  @@index([membershipId, createdAt])
}

// Preferências de notificação do cliente
model CustomerNotificationPrefs {
  id              String          @id @default(uuid())
  customerId      String          @unique
  customer        Customer        @relation(fields: [customerId], references: [id])

  // Canais habilitados
  emailEnabled    Boolean         @default(true)
  whatsappEnabled Boolean         @default(true)
  smsEnabled      Boolean         @default(false)

  // Tipos de notificação
  statusUpdates   Boolean         @default(true)
  promotions      Boolean         @default(false)
  reminders       Boolean         @default(true)

  // Horários de silêncio
  quietHoursStart String?         // "22:00"
  quietHoursEnd   String?         // "08:00"

  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
}

// Templates de notificação customizados
model NotificationTemplate {
  id              String          @id @default(uuid())
  companyId       String
  company         Company         @relation(fields: [companyId], references: [id])

  // Identificação
  key             String          // 'quote_ready', 'os_completed', etc
  name            String
  description     String?

  // Canal
  channel         NotificationChannel

  // Conteúdo
  subject         String?         // Para email
  content         String          // Template com variáveis {{var}}
  contentHtml     String?         // Versão HTML (email)

  // Status
  active          Boolean         @default(true)

  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  @@unique([companyId, key, channel])
  @@index([companyId])
}

enum NotificationType {
  // OS
  OS_CREATED
  OS_STATUS_CHANGED
  OS_ASSIGNED

  // Orçamento
  QUOTE_READY
  QUOTE_REMINDER
  QUOTE_EXPIRING
  QUOTE_APPROVED
  QUOTE_REJECTED

  // Conclusão
  OS_COMPLETED
  READY_FOR_PICKUP
  PICKUP_REMINDER

  // Pagamento
  PAYMENT_RECEIVED
  PAYMENT_REMINDER

  // Garantia
  WARRANTY_CREATED
  WARRANTY_EXPIRING

  // Sistema
  LOW_STOCK
  NEW_ASSIGNMENT
  SYSTEM_ALERT
}

enum NotificationChannel {
  EMAIL
  WHATSAPP
  SMS
  PUSH
  IN_APP
}

enum NotificationStatus {
  PENDING         // Aguardando envio
  PROCESSING      // Em processamento
  SENT            // Enviado
  DELIVERED       // Entregue (confirmado pelo provedor)
  FAILED          // Falhou
  CANCELLED       // Cancelado
}

enum RecipientType {
  CUSTOMER
  USER
}
```

---

## Fluxo de Envio

```
┌─────────────────────────────────────────────────────────────────┐
│                    EVENTO DISPARA NOTIFICAÇÃO                   │
│                    (ex: OS_COMPLETED)                           │
└────────┬────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    VERIFICAR CONFIG DA EMPRESA                  │
│                    (canal habilitado? template existe?)         │
└────────┬────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    VERIFICAR PREFERÊNCIAS                       │
│                    (cliente aceita? quiet hours?)               │
└────────┬────────────────────────────────────────────────────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
[PODE ENVIAR] [NÃO PODE]
    │         │
    │         ▼
    │    ┌─────────────────┐
    │    │ Agendar para    │
    │    │ horário válido  │
    │    │ ou cancelar     │
    │    └─────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CRIAR NA FILA                                │
│                    status: PENDING                              │
└────────┬────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    JOB PROCESSOR                                │
│                    (BullMQ / Agenda)                            │
└────────┬────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    RENDERIZAR TEMPLATE                          │
│                    (substituir variáveis)                       │
└────────┬────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ENVIAR VIA PROVEDOR                          │
│                    (SendGrid, Meta, Twilio)                     │
└────────┬────────────────────────────────────────────────────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
[SUCESSO]  [ERRO]
    │         │
    │         ▼
    │    ┌─────────────────┐
    │    │ attempts++      │
    │    │ Retry ou FAILED │
    │    └─────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ATUALIZAR STATUS                             │
│                    status: SENT/DELIVERED                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Serviço de Notificações

```typescript
// services/notification.service.ts
class NotificationService {
  /**
   * Enfileirar notificação
   */
  async queue(params: {
    companyId: string;
    type: NotificationType;
    recipientType: 'CUSTOMER' | 'USER';
    recipientId: string;
    referenceType?: string;
    referenceId?: string;
    data: Record<string, any>;
    scheduledFor?: Date;
  }): Promise<void> {
    const config = await this.getNotificationConfig(params.companyId);
    const recipient = await this.getRecipient(params.recipientType, params.recipientId);
    const prefs = await this.getPreferences(params.recipientType, params.recipientId);

    // Determinar canais a usar
    const channels = this.getChannelsForType(params.type, config, prefs);

    for (const channel of channels) {
      // Verificar quiet hours
      let scheduledFor = params.scheduledFor || new Date();
      if (prefs?.quietHoursStart && prefs?.quietHoursEnd) {
        scheduledFor = this.adjustForQuietHours(scheduledFor, prefs);
      }

      // Buscar template
      const template = await this.getTemplate(params.companyId, params.type, channel);

      // Criar na fila
      await prisma.notificationQueue.create({
        data: {
          companyId: params.companyId,
          type: params.type,
          channel,
          recipientType: params.recipientType,
          recipientId: params.recipientId,
          recipientContact: this.getContact(recipient, channel),
          referenceType: params.referenceType,
          referenceId: params.referenceId,
          template: template.key,
          payload: params.data,
          subject: template.subject,
          scheduledFor,
          status: 'PENDING',
        },
      });
    }
  }

  /**
   * Processar fila de notificações
   */
  async processQueue(): Promise<void> {
    const notifications = await prisma.notificationQueue.findMany({
      where: {
        status: 'PENDING',
        scheduledFor: { lte: new Date() },
      },
      take: 100,
      orderBy: { scheduledFor: 'asc' },
    });

    for (const notification of notifications) {
      await this.processNotification(notification);
    }
  }

  /**
   * Processar uma notificação
   */
  private async processNotification(notification: NotificationQueue): Promise<void> {
    try {
      // Marcar como processando
      await prisma.notificationQueue.update({
        where: { id: notification.id },
        data: { status: 'PROCESSING', lastAttemptAt: new Date() },
      });

      // Renderizar template
      const content = await this.renderTemplate(
        notification.template,
        notification.payload as Record<string, any>
      );

      // Enviar
      const result = await this.send(notification.channel, {
        to: notification.recipientContact,
        subject: notification.subject,
        content,
      });

      // Atualizar como enviado
      await prisma.notificationQueue.update({
        where: { id: notification.id },
        data: {
          status: 'SENT',
          sentAt: new Date(),
          providerMessageId: result.messageId,
        },
      });
    } catch (error) {
      const attempts = notification.attempts + 1;
      const shouldRetry = attempts < notification.maxAttempts;

      await prisma.notificationQueue.update({
        where: { id: notification.id },
        data: {
          status: shouldRetry ? 'PENDING' : 'FAILED',
          attempts,
          error: error.message,
          nextRetryAt: shouldRetry
            ? addMinutes(new Date(), Math.pow(2, attempts) * 5) // Exponential backoff
            : null,
        },
      });
    }
  }

  /**
   * Enviar via provedor
   */
  private async send(
    channel: NotificationChannel,
    params: { to: string; subject?: string; content: string }
  ): Promise<{ messageId: string }> {
    switch (channel) {
      case 'EMAIL':
        return this.emailProvider.send(params);
      case 'WHATSAPP':
        return this.whatsappProvider.send(params);
      case 'SMS':
        return this.smsProvider.send(params);
      default:
        throw new Error(`Channel ${channel} not supported`);
    }
  }

  /**
   * Criar notificação in-app
   */
  async createInApp(params: {
    companyId: string;
    membershipId: string;
    title: string;
    message: string;
    icon?: string;
    color?: string;
    actionType?: string;
    actionPayload?: Record<string, any>;
    referenceType?: string;
    referenceId?: string;
  }): Promise<InAppNotification> {
    const notification = await prisma.inAppNotification.create({
      data: params,
    });

    // Emitir via WebSocket
    this.websocket.emit(`user:${params.membershipId}`, 'notification', notification);

    return notification;
  }

  /**
   * Marcar como lida
   */
  async markAsRead(notificationId: string, membershipId: string): Promise<void> {
    await prisma.inAppNotification.updateMany({
      where: { id: notificationId, membershipId },
      data: { read: true, readAt: new Date() },
    });
  }

  /**
   * Marcar todas como lidas
   */
  async markAllAsRead(membershipId: string): Promise<void> {
    await prisma.inAppNotification.updateMany({
      where: { membershipId, read: false },
      data: { read: true, readAt: new Date() },
    });
  }
}
```

---

## Endpoints da API

### Fila de Notificações (Admin)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/notifications/queue` | Listar fila |
| GET | `/notifications/queue/:id` | Detalhes |
| POST | `/notifications/queue/:id/retry` | Retentar envio |
| DELETE | `/notifications/queue/:id` | Cancelar |

### Notificações In-App

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/notifications` | Minhas notificações |
| GET | `/notifications/unread-count` | Contador de não lidas |
| PUT | `/notifications/:id/read` | Marcar como lida |
| PUT | `/notifications/read-all` | Marcar todas como lidas |
| DELETE | `/notifications/:id` | Arquivar |

### Templates

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/notifications/templates` | Listar templates |
| GET | `/notifications/templates/:key` | Buscar template |
| PUT | `/notifications/templates/:key` | Atualizar template |
| POST | `/notifications/templates/:key/preview` | Preview |
| POST | `/notifications/templates/:key/reset` | Restaurar padrão |

---

## Componente de Notificações

```tsx
function NotificationsDropdown() {
  const { data: notifications } = useNotifications();
  const { data: unreadCount } = useUnreadCount();
  const markAsRead = useMarkAsReadMutation();
  const markAllAsRead = useMarkAllAsReadMutation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <div className="flex items-center justify-between p-2 border-b">
          <h4 className="font-semibold">Notificações</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsRead.mutate()}
            >
              Marcar todas como lidas
            </Button>
          )}
        </div>

        <ScrollArea className="h-80">
          {notifications?.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              Nenhuma notificação
            </div>
          ) : (
            notifications?.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={cn(
                  "flex flex-col items-start p-3 cursor-pointer",
                  !notification.read && "bg-muted/50"
                )}
                onClick={() => {
                  if (!notification.read) {
                    markAsRead.mutate(notification.id);
                  }
                  if (notification.actionType === 'navigate') {
                    navigate(notification.actionPayload.route);
                  }
                }}
              >
                <div className="flex items-start gap-2 w-full">
                  {notification.icon && (
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      notification.color ? `bg-${notification.color}-100` : "bg-muted"
                    )}>
                      <Icon name={notification.icon} className="h-4 w-4" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatRelative(notification.createdAt)}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  )}
                </div>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>

        <div className="p-2 border-t">
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => navigate('/notifications')}
          >
            Ver todas
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

---

## Regras de Negócio

### Canais
- Email: Sempre disponível
- WhatsApp: Requer configuração do provedor
- SMS: Requer configuração e tem custo por mensagem
- In-App: Para usuários do sistema

### Preferências
- Cliente pode optar por não receber notificações
- Quiet hours são respeitados
- Notificações críticas ignoram preferências

### Retry
- Máximo 3 tentativas por padrão
- Backoff exponencial entre tentativas
- Notificações expiradas são canceladas

### Templates
- Cada empresa pode customizar templates
- Variáveis disponíveis dependem do tipo
- Preview antes de salvar

---

**Voltar para** [Entidades](./README.md)
