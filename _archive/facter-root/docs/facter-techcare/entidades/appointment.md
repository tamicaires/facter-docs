# Appointment (Agendamento)

> **Entidade que representa agendamentos de entregas, retiradas e visitas técnicas.**

---

## Schema Prisma

```prisma
model Appointment {
  id              String          @id @default(uuid())
  companyId       String
  company         Company         @relation(fields: [companyId], references: [id])

  // Tipo de agendamento
  type            AppointmentType

  // Relacionamentos
  customerId      String
  customer        Customer        @relation(fields: [customerId], references: [id])
  serviceOrderId  String?
  serviceOrder    ServiceOrder?   @relation(fields: [serviceOrderId], references: [id])

  // Responsável (técnico para visitas)
  assignedToId    String?
  assignedTo      Membership?     @relation(fields: [assignedToId], references: [id])

  // Data e hora
  scheduledDate   DateTime        // Data do agendamento
  scheduledTime   String          // Horário (ex: "14:00")
  duration        Int             @default(60)  // Duração em minutos

  // Período alternativo
  periodStart     String?         // "14:00"
  periodEnd       String?         // "18:00"

  // Endereço (para visitas técnicas)
  address         Json?           // Address

  // Status
  status          AppointmentStatus @default(SCHEDULED)

  // Confirmação
  confirmedAt     DateTime?
  confirmedBy     String?         // 'customer' | 'system' | userId

  // Conclusão
  completedAt     DateTime?
  completedNotes  String?

  // Cancelamento
  cancelledAt     DateTime?
  cancelledBy     String?
  cancelReason    String?

  // Lembretes enviados
  reminders       AppointmentReminder[]

  // Observações
  notes           String?

  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  @@index([companyId])
  @@index([companyId, scheduledDate])
  @@index([companyId, customerId])
  @@index([companyId, assignedToId])
  @@index([companyId, status])
}

model AppointmentReminder {
  id              String          @id @default(uuid())
  appointmentId   String
  appointment     Appointment     @relation(fields: [appointmentId], references: [id])

  // Quando enviar
  sendAt          DateTime

  // Canal
  channel         ReminderChannel

  // Status
  status          ReminderStatus  @default(PENDING)
  sentAt          DateTime?
  error           String?

  createdAt       DateTime        @default(now())
}

enum AppointmentType {
  DELIVERY        // Entrega de equipamento na loja
  PICKUP          // Retirada pelo cliente
  TECHNICAL_VISIT // Visita técnica no local
  EVALUATION      // Avaliação/orçamento presencial
}

enum AppointmentStatus {
  SCHEDULED       // Agendado
  CONFIRMED       // Confirmado pelo cliente
  IN_PROGRESS     // Em andamento (técnico a caminho)
  COMPLETED       // Concluído
  CANCELLED       // Cancelado
  NO_SHOW         // Cliente não compareceu
}

enum ReminderChannel {
  EMAIL
  WHATSAPP
  SMS
}

enum ReminderStatus {
  PENDING         // Aguardando envio
  SENT            // Enviado
  FAILED          // Falhou
  CANCELLED       // Cancelado
}
```

---

## Fluxo de Agendamento

```
┌─────────────────────────────────────────────────────────────────┐
│                    VERIFICAR DISPONIBILIDADE                    │
└────────┬────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SELECIONAR DATA/HORÁRIO                      │
└────────┬────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CRIAR AGENDAMENTO                            │
│                    status: SCHEDULED                            │
└────────┬────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NOTIFICAR CLIENTE                            │
│                    (WhatsApp/Email)                             │
└────────┬────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENTE CONFIRMA                             │
│                    status: CONFIRMED                            │
└────────┬────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DIA DO AGENDAMENTO                           │
│                    Lembrete enviado automaticamente             │
└────────┬────────────────────────────────────────────────────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
[COMPARECE] [NÃO COMPARECE]
    │         │
    │         ▼
    │    ┌─────────────────┐
    │    │ status: NO_SHOW │
    │    │ Reagendar?      │
    │    └─────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FINALIZAR                                    │
│                    status: COMPLETED                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Slots de Horário

```typescript
interface TimeSlot {
  time: string;      // "09:00"
  available: boolean;
  reason?: string;   // "Horário de almoço", "Agenda cheia"
}

interface DaySchedule {
  date: string;      // "2025-01-20"
  dayOfWeek: string; // "segunda-feira"
  slots: TimeSlot[];
  closed: boolean;
  closedReason?: string;
}

// Calcular slots disponíveis
function getAvailableSlots(
  date: Date,
  type: AppointmentType,
  config: {
    businessHours: BusinessHours;
    slotDuration: number; // minutos
    appointments: Appointment[];
    technicians: TechnicianProfile[];
  }
): DaySchedule {
  const dayOfWeek = date.getDay();
  const hours = config.businessHours[dayOfWeek];

  if (!hours || hours.closed) {
    return {
      date: format(date, 'yyyy-MM-dd'),
      dayOfWeek: format(date, 'EEEE', { locale: ptBR }),
      slots: [],
      closed: true,
      closedReason: hours?.closedReason || 'Fechado',
    };
  }

  const slots: TimeSlot[] = [];
  let current = parseTime(hours.start);
  const end = parseTime(hours.end);

  while (current < end) {
    const timeStr = formatTime(current);

    // Verificar se slot já está ocupado
    const occupied = config.appointments.some(
      apt => apt.scheduledTime === timeStr &&
             isSameDay(apt.scheduledDate, date)
    );

    // Verificar horário de almoço
    const isLunch = hours.lunchStart && hours.lunchEnd &&
      current >= parseTime(hours.lunchStart) &&
      current < parseTime(hours.lunchEnd);

    slots.push({
      time: timeStr,
      available: !occupied && !isLunch,
      reason: occupied ? 'Ocupado' : isLunch ? 'Horário de almoço' : undefined,
    });

    current = addMinutes(current, config.slotDuration);
  }

  return {
    date: format(date, 'yyyy-MM-dd'),
    dayOfWeek: format(date, 'EEEE', { locale: ptBR }),
    slots,
    closed: false,
  };
}
```

---

## Endpoints da API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/appointments` | Listar agendamentos |
| GET | `/appointments/:id` | Buscar agendamento |
| POST | `/appointments` | Criar agendamento |
| PUT | `/appointments/:id` | Atualizar agendamento |
| DELETE | `/appointments/:id` | Cancelar agendamento |
| GET | `/appointments/slots` | Slots disponíveis |
| POST | `/appointments/:id/confirm` | Confirmar |
| POST | `/appointments/:id/complete` | Finalizar |
| POST | `/appointments/:id/no-show` | Marcar não compareceu |

### Buscar Slots

```http
GET /appointments/slots?type=PICKUP&date=2025-01-20&days=7

{
  "data": [
    {
      "date": "2025-01-20",
      "dayOfWeek": "segunda-feira",
      "closed": false,
      "slots": [
        { "time": "09:00", "available": true },
        { "time": "09:30", "available": true },
        { "time": "10:00", "available": false, "reason": "Ocupado" },
        { "time": "10:30", "available": true },
        { "time": "12:00", "available": false, "reason": "Horário de almoço" }
      ]
    },
    {
      "date": "2025-01-21",
      "dayOfWeek": "terça-feira",
      "closed": false,
      "slots": [...]
    }
  ]
}
```

---

## Componente de Calendário

```tsx
function AppointmentCalendar({
  type,
  onSelect,
}: {
  type: AppointmentType;
  onSelect: (date: Date, time: string) => void;
}) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const { data: slots, isLoading } = useQuery({
    queryKey: ['appointment-slots', type, selectedDate],
    queryFn: () => api.get('/appointments/slots', {
      params: { type, date: format(selectedDate!, 'yyyy-MM-dd'), days: 7 },
    }),
    enabled: !!selectedDate,
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Calendário */}
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={setSelectedDate}
        disabled={(date) =>
          date < new Date() ||
          date > addDays(new Date(), 30)
        }
        className="rounded-md border"
      />

      {/* Horários */}
      {selectedDate && (
        <div className="space-y-4">
          <h3 className="font-medium">
            Horários disponíveis para {format(selectedDate, 'dd/MM')}
          </h3>

          {isLoading ? (
            <Skeleton className="h-32" />
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {slots?.slots.map((slot) => (
                <Button
                  key={slot.time}
                  variant={selectedTime === slot.time ? "default" : "outline"}
                  size="sm"
                  disabled={!slot.available}
                  onClick={() => {
                    setSelectedTime(slot.time);
                    onSelect(selectedDate, slot.time);
                  }}
                >
                  {slot.time}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

---

## Lembretes Automáticos

```typescript
// Configuração de lembretes por tipo
const REMINDER_CONFIG: Record<AppointmentType, {
  beforeHours: number;
  channels: ReminderChannel[];
}[]> = {
  DELIVERY: [
    { beforeHours: 24, channels: ['WHATSAPP', 'EMAIL'] },
    { beforeHours: 2, channels: ['WHATSAPP'] },
  ],
  PICKUP: [
    { beforeHours: 24, channels: ['WHATSAPP', 'EMAIL'] },
    { beforeHours: 2, channels: ['WHATSAPP'] },
  ],
  TECHNICAL_VISIT: [
    { beforeHours: 48, channels: ['WHATSAPP', 'EMAIL'] },
    { beforeHours: 24, channels: ['WHATSAPP'] },
    { beforeHours: 2, channels: ['WHATSAPP'] },
  ],
  EVALUATION: [
    { beforeHours: 24, channels: ['WHATSAPP', 'EMAIL'] },
  ],
};

// Job de processamento
async function processReminders() {
  const now = new Date();

  const pendingReminders = await prisma.appointmentReminder.findMany({
    where: {
      status: 'PENDING',
      sendAt: { lte: now },
    },
    include: {
      appointment: {
        include: {
          customer: true,
          serviceOrder: true,
        },
      },
    },
  });

  for (const reminder of pendingReminders) {
    try {
      await sendReminder(reminder);

      await prisma.appointmentReminder.update({
        where: { id: reminder.id },
        data: { status: 'SENT', sentAt: new Date() },
      });
    } catch (error) {
      await prisma.appointmentReminder.update({
        where: { id: reminder.id },
        data: { status: 'FAILED', error: error.message },
      });
    }
  }
}
```

---

## Regras de Negócio

### Criação
- Agendamento mínimo com 2 horas de antecedência
- Máximo de 30 dias no futuro
- Verificar disponibilidade antes de criar

### Confirmação
- Cliente pode confirmar via link no WhatsApp/Email
- Agendamentos não confirmados recebem lembrete adicional

### Cancelamento
- Cliente pode cancelar até 2 horas antes
- Cancelamentos frequentes podem bloquear agendamentos futuros

### No-Show
- Após 3 no-shows, cliente precisa de confirmação prévia obrigatória
- Registrar motivo quando possível

### Visitas Técnicas
- Apenas para empresas no plano Professional+
- Técnico deve ter disponibilidade
- Endereço obrigatório

---

## Integração com Calendário

```typescript
// Sincronização com Google Calendar (modo individual)
async function syncWithGoogleCalendar(appointment: Appointment) {
  const config = await getIntegrationConfig(appointment.companyId);

  if (!config.googleCalendarEnabled) return;

  const event = {
    summary: `${getAppointmentTypeLabel(appointment.type)} - ${appointment.customer.name}`,
    description: appointment.notes,
    start: {
      dateTime: `${format(appointment.scheduledDate, 'yyyy-MM-dd')}T${appointment.scheduledTime}:00`,
      timeZone: 'America/Sao_Paulo',
    },
    end: {
      dateTime: addMinutes(
        parseISO(`${format(appointment.scheduledDate, 'yyyy-MM-dd')}T${appointment.scheduledTime}`),
        appointment.duration
      ).toISOString(),
      timeZone: 'America/Sao_Paulo',
    },
  };

  await googleCalendar.events.insert({
    calendarId: config.googleCalendarId,
    resource: event,
  });
}
```

---

**Voltar para** [Entidades](./README.md)
