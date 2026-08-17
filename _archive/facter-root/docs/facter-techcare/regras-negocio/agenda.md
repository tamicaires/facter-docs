# Agenda e Agendamentos

> **Sistema de agendamento de atendimentos e visitas técnicas.**

---

## Conceito

O módulo de agenda permite:
- Agendar entregas de equipamento
- Agendar visitas técnicas externas
- Agendar retiradas
- Gerenciar disponibilidade de técnicos

---

## Tipos de Agendamento

| Tipo | Código | Descrição |
|------|--------|-----------|
| Entrega | `DELIVERY` | Cliente entregará equipamento |
| Retirada | `PICKUP` | Cliente retirará equipamento |
| Visita Técnica | `TECHNICAL_VISIT` | Técnico vai até o cliente |
| Retorno Garantia | `WARRANTY_RETURN` | Cliente retorna em garantia |

---

## Estrutura

```prisma
model Appointment {
  id              String            @id @default(uuid())
  companyId       String
  company         Company           @relation(fields: [companyId], references: [id])

  // Tipo
  type            AppointmentType

  // Relacionamentos
  customerId      String
  customer        Customer          @relation(fields: [customerId], references: [id])
  serviceOrderId  String?
  serviceOrder    ServiceOrder?     @relation(fields: [serviceOrderId], references: [id])
  technicianId    String?
  technician      User?             @relation(fields: [technicianId], references: [id])

  // Data e hora
  scheduledDate   DateTime
  scheduledTime   String            // "14:00"
  duration        Int               @default(30) // minutos

  // Endereço (para visitas)
  address         Json?

  // Status
  status          AppointmentStatus @default(SCHEDULED)

  // Observações
  notes           String?

  // Confirmação
  confirmedAt     DateTime?
  confirmedBy     String?           // 'CUSTOMER' | 'STAFF'

  // Lembrete
  reminderSent    Boolean           @default(false)
  reminderSentAt  DateTime?

  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
}

enum AppointmentType {
  DELIVERY
  PICKUP
  TECHNICAL_VISIT
  WARRANTY_RETURN
}

enum AppointmentStatus {
  SCHEDULED     // Agendado
  CONFIRMED     // Confirmado
  IN_PROGRESS   // Em andamento
  COMPLETED     // Concluído
  NO_SHOW       // Não compareceu
  CANCELLED     // Cancelado
  RESCHEDULED   // Reagendado
}
```

---

## Horários Disponíveis

### Configuração de Slots

```typescript
interface ScheduleConfig {
  // Horário de funcionamento
  businessHours: {
    [day: string]: {
      open: string;   // "08:00"
      close: string;  // "18:00"
      breaks?: {
        start: string;
        end: string;
      }[];
    } | null;  // null = fechado
  };

  // Duração padrão dos slots
  defaultSlotDuration: number;  // 30 minutos

  // Limite de agendamentos por slot
  maxPerSlot: number;

  // Antecedência mínima (horas)
  minAdvanceHours: number;

  // Antecedência máxima (dias)
  maxAdvanceDays: number;
}

// Exemplo
const defaultScheduleConfig: ScheduleConfig = {
  businessHours: {
    monday: { open: '08:00', close: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
    tuesday: { open: '08:00', close: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
    wednesday: { open: '08:00', close: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
    thursday: { open: '08:00', close: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
    friday: { open: '08:00', close: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
    saturday: { open: '08:00', close: '12:00' },
    sunday: null,
  },
  defaultSlotDuration: 30,
  maxPerSlot: 2,
  minAdvanceHours: 2,
  maxAdvanceDays: 30,
};
```

### Calcular Slots Disponíveis

```typescript
interface TimeSlot {
  time: string;       // "14:00"
  available: boolean;
  spotsLeft: number;
}

async function getAvailableSlots(
  companyId: string,
  date: Date,
  type: AppointmentType
): Promise<TimeSlot[]> {
  const config = await getScheduleConfig(companyId);
  const dayOfWeek = format(date, 'EEEE').toLowerCase();
  const dayConfig = config.businessHours[dayOfWeek];

  if (!dayConfig) {
    return []; // Fechado
  }

  // Gerar todos os slots do dia
  const slots = generateTimeSlots(
    dayConfig.open,
    dayConfig.close,
    config.defaultSlotDuration,
    dayConfig.breaks
  );

  // Buscar agendamentos existentes
  const existingAppointments = await prisma.appointment.findMany({
    where: {
      companyId,
      scheduledDate: {
        gte: startOfDay(date),
        lte: endOfDay(date),
      },
      status: { notIn: ['CANCELLED', 'RESCHEDULED'] },
    },
  });

  // Marcar disponibilidade
  return slots.map(time => {
    const appointmentsAtTime = existingAppointments.filter(
      a => a.scheduledTime === time
    );

    return {
      time,
      available: appointmentsAtTime.length < config.maxPerSlot,
      spotsLeft: config.maxPerSlot - appointmentsAtTime.length,
    };
  });
}

function generateTimeSlots(
  open: string,
  close: string,
  duration: number,
  breaks?: { start: string; end: string }[]
): string[] {
  const slots: string[] = [];
  let current = parseTime(open);
  const end = parseTime(close);

  while (current < end) {
    const timeStr = formatTime(current);

    // Verificar se não está no intervalo
    const inBreak = breaks?.some(b =>
      timeStr >= b.start && timeStr < b.end
    );

    if (!inBreak) {
      slots.push(timeStr);
    }

    current = addMinutes(current, duration);
  }

  return slots;
}
```

---

## Agendamento de Visita Técnica

### Fluxo

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    CLIENTE SOLICITA VISITA                              │
└────────┬────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    SELECIONAR DATA E HORÁRIO                            │
├─────────────────────────────────────────────────────────────────────────┤
│ • Mostrar calendário com dias disponíveis                               │
│ • Mostrar slots de horário                                              │
│ • Indicar técnicos disponíveis                                          │
└────────┬────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    INFORMAR ENDEREÇO                                    │
├─────────────────────────────────────────────────────────────────────────┤
│ • Usar endereço cadastrado ou informar novo                             │
│ • Validar área de atendimento                                           │
└────────┬────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    DESCREVER PROBLEMA                                   │
├─────────────────────────────────────────────────────────────────────────┤
│ • Tipo de equipamento                                                   │
│ • Descrição do defeito                                                  │
│ • Fotos (opcional)                                                      │
└────────┬────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    CONFIRMAR AGENDAMENTO                                │
├─────────────────────────────────────────────────────────────────────────┤
│ • Enviar confirmação por WhatsApp/Email                                 │
│ • Agendar lembrete                                                      │
└─────────────────────────────────────────────────────────────────────────┘
```

### Criar Visita Técnica

```typescript
interface CreateTechnicalVisitDto {
  customerId: string;
  scheduledDate: Date;
  scheduledTime: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  equipmentType: string;
  reportedIssue: string;
  photos?: string[];
  technicianId?: string;  // Opcional, pode ser atribuído depois
}

async function createTechnicalVisit(
  companyId: string,
  dto: CreateTechnicalVisitDto
): Promise<Appointment> {
  // Validar slot disponível
  const slots = await getAvailableSlots(companyId, dto.scheduledDate, 'TECHNICAL_VISIT');
  const slot = slots.find(s => s.time === dto.scheduledTime);

  if (!slot?.available) {
    throw new Error('Horário não disponível');
  }

  // Validar área de atendimento
  const isInServiceArea = await checkServiceArea(companyId, dto.address);
  if (!isInServiceArea) {
    throw new Error('Endereço fora da área de atendimento');
  }

  // Criar agendamento
  const appointment = await prisma.appointment.create({
    data: {
      companyId,
      type: 'TECHNICAL_VISIT',
      customerId: dto.customerId,
      scheduledDate: dto.scheduledDate,
      scheduledTime: dto.scheduledTime,
      duration: 60, // Visitas técnicas: 1 hora
      address: dto.address,
      technicianId: dto.technicianId,
      notes: dto.reportedIssue,
      status: 'SCHEDULED',
    },
  });

  // Enviar confirmação
  await sendAppointmentConfirmation(appointment);

  // Agendar lembrete (1 dia antes)
  await scheduleReminder(appointment.id, subDays(dto.scheduledDate, 1));

  return appointment;
}
```

---

## Disponibilidade do Técnico

### Estrutura

```prisma
model TechnicianAvailability {
  id            String    @id @default(uuid())
  technicianId  String
  technician    User      @relation(fields: [technicianId], references: [id])

  // Período
  date          DateTime
  startTime     String
  endTime       String

  // Tipo
  type          AvailabilityType

  // Motivo (se bloqueado)
  reason        String?

  createdAt     DateTime  @default(now())
}

enum AvailabilityType {
  AVAILABLE     // Disponível para agendamentos
  BLOCKED       // Bloqueado (férias, folga, etc)
  EXTERNAL      // Atendimento externo já agendado
}
```

### Verificar Disponibilidade

```typescript
async function getTechnicianAvailability(
  technicianId: string,
  date: Date
): Promise<{
  available: boolean;
  slots: TimeSlot[];
  blockedPeriods: { start: string; end: string; reason: string }[];
}> {
  // Buscar bloqueios
  const blocks = await prisma.technicianAvailability.findMany({
    where: {
      technicianId,
      date: {
        gte: startOfDay(date),
        lte: endOfDay(date),
      },
      type: 'BLOCKED',
    },
  });

  // Buscar agendamentos
  const appointments = await prisma.appointment.findMany({
    where: {
      technicianId,
      scheduledDate: {
        gte: startOfDay(date),
        lte: endOfDay(date),
      },
      status: { notIn: ['CANCELLED', 'RESCHEDULED'] },
    },
  });

  // Se tem bloqueio de dia inteiro
  const fullDayBlock = blocks.find(b =>
    b.startTime === '00:00' && b.endTime === '23:59'
  );

  if (fullDayBlock) {
    return {
      available: false,
      slots: [],
      blockedPeriods: [{
        start: '00:00',
        end: '23:59',
        reason: fullDayBlock.reason
      }],
    };
  }

  // Calcular slots livres
  // ...
}
```

---

## Lembretes

### Agendar Lembrete

```typescript
// Job de lembrete
async function processAppointmentReminders() {
  const tomorrow = addDays(new Date(), 1);

  const appointments = await prisma.appointment.findMany({
    where: {
      scheduledDate: {
        gte: startOfDay(tomorrow),
        lte: endOfDay(tomorrow),
      },
      status: { in: ['SCHEDULED', 'CONFIRMED'] },
      reminderSent: false,
    },
    include: {
      customer: true,
      technician: true,
    },
  });

  for (const appointment of appointments) {
    await sendReminder(appointment);

    await prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        reminderSent: true,
        reminderSentAt: new Date(),
      },
    });
  }
}

// Template de lembrete
const REMINDER_TEMPLATE = {
  DELIVERY: `Olá {{cliente}}! 📅

Lembrete: Amanhã você tem horário agendado para entregar seu equipamento.

📍 Data: {{data}}
🕐 Horário: {{horario}}
📍 Local: {{endereco}}

Confirma presença? Responda SIM ou NÃO.`,

  TECHNICAL_VISIT: `Olá {{cliente}}! 📅

Lembrete: Amanhã o técnico {{tecnico}} irá até você.

📍 Data: {{data}}
🕐 Horário: {{horario}}
📍 Local: {{endereco}}

Por favor, esteja disponível no horário. Confirma? Responda SIM ou NÃO.`,
};
```

---

## Calendário na Interface

### Visualização

```typescript
interface CalendarView {
  type: 'day' | 'week' | 'month';
  date: Date;
  events: CalendarEvent[];
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: AppointmentType;
  status: AppointmentStatus;
  customer: {
    name: string;
    phone: string;
  };
  technician?: {
    name: string;
  };
  color: string;
}
```

### Componente

```tsx
function AppointmentCalendar() {
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');
  const [date, setDate] = useState(new Date());

  const { data: appointments } = useAppointments({
    startDate: startOfWeek(date),
    endDate: endOfWeek(date),
  });

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setDate(subWeek(date, 1))}>
            <ChevronLeft />
          </Button>
          <Button variant="outline" onClick={() => setDate(new Date())}>
            Hoje
          </Button>
          <Button variant="outline" onClick={() => setDate(addWeek(date, 1))}>
            <ChevronRight />
          </Button>
        </div>

        <h2 className="text-lg font-semibold">
          {format(date, 'MMMM yyyy', { locale: ptBR })}
        </h2>

        <Tabs value={view} onValueChange={setView}>
          <TabsList>
            <TabsTrigger value="day">Dia</TabsTrigger>
            <TabsTrigger value="week">Semana</TabsTrigger>
            <TabsTrigger value="month">Mês</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto">
        {view === 'week' && (
          <WeekView date={date} appointments={appointments} />
        )}
        {view === 'day' && (
          <DayView date={date} appointments={appointments} />
        )}
        {view === 'month' && (
          <MonthView date={date} appointments={appointments} />
        )}
      </div>
    </div>
  );
}
```

---

## Modo Individual

Para técnicos autônomos:
- Agenda pessoal simplificada
- Sem atribuição de técnico (é sempre ele)
- Integração com Google Calendar (opcional)

```typescript
// Sync com Google Calendar
interface GoogleCalendarSync {
  enabled: boolean;
  calendarId: string;
  accessToken: string;
  refreshToken: string;
  syncDirection: 'ONE_WAY' | 'TWO_WAY';
}
```

---

## Permissões

| Ação | Atendente | Técnico | Gerente | Admin |
|------|-----------|---------|---------|-------|
| Ver agenda | ✅ | Própria | ✅ | ✅ |
| Criar agendamento | ✅ | ❌ | ✅ | ✅ |
| Editar agendamento | ✅ | Próprios | ✅ | ✅ |
| Cancelar agendamento | ✅ | ❌ | ✅ | ✅ |
| Bloquear horários | ❌ | Próprios | ✅ | ✅ |
| Ver todos técnicos | ❌ | ❌ | ✅ | ✅ |

---

**Voltar para** [Regras de Negócio](./README.md)
