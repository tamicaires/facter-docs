# Ordens de Serviço

> **Regras de negócio para gestão de ordens de serviço.**

---

## Conceito

Uma Ordem de Serviço (OS) representa um atendimento técnico, desde a entrada do equipamento até sua devolução ao cliente.

---

## Ciclo de Vida

```
[RECEBIMENTO] → [TRIAGEM] → [DIAGNOSTICO] → [AGUARDANDO_APROVACAO]
                                                     ↓
                                              [APROVADO] / [REJEITADO]
                                                     ↓
[ENTREGUE] ← [FINALIZADO] ← [EM_EXECUCAO] ← [AGUARDANDO_PECAS]
     ↓
[ARQUIVADO]
```

---

## Status

### Tabela de Status

| Status | Código | Descrição | Ações Permitidas |
|--------|--------|-----------|------------------|
| Recebimento | `RECEIVED` | Equipamento recebido | Triar, Cancelar |
| Triagem | `TRIAGE` | Avaliação inicial | Diagnosticar, Cancelar |
| Diagnóstico | `DIAGNOSIS` | Em análise técnica | Gerar Orçamento, Cancelar |
| Aguardando Aprovação | `AWAITING_APPROVAL` | Orçamento enviado | Aprovar, Rejeitar |
| Aprovado | `APPROVED` | Cliente aprovou | Iniciar Execução |
| Rejeitado | `REJECTED` | Cliente rejeitou | Entregar sem reparo |
| Aguardando Peças | `AWAITING_PARTS` | Peças em falta | Atualizar quando chegar |
| Em Execução | `IN_PROGRESS` | Reparo em andamento | Finalizar, Pausar |
| Finalizado | `COMPLETED` | Reparo concluído | Registrar Pagamento |
| Entregue | `DELIVERED` | Equipamento devolvido | Arquivar |
| Arquivado | `ARCHIVED` | OS encerrada | Consultar |
| Cancelado | `CANCELLED` | OS cancelada | Nenhuma |

### Transições Permitidas

```typescript
const STATUS_TRANSITIONS = {
  RECEIVED: ['TRIAGE', 'CANCELLED'],
  TRIAGE: ['DIAGNOSIS', 'CANCELLED'],
  DIAGNOSIS: ['AWAITING_APPROVAL', 'CANCELLED'],
  AWAITING_APPROVAL: ['APPROVED', 'REJECTED'],
  APPROVED: ['AWAITING_PARTS', 'IN_PROGRESS'],
  REJECTED: ['DELIVERED'],
  AWAITING_PARTS: ['IN_PROGRESS'],
  IN_PROGRESS: ['COMPLETED', 'AWAITING_PARTS'],
  COMPLETED: ['DELIVERED'],
  DELIVERED: ['ARCHIVED'],
  ARCHIVED: [],
  CANCELLED: [],
};
```

---

## Prioridades

| Prioridade | SLA Diagnóstico | SLA Execução | Multiplicador Valor |
|------------|-----------------|--------------|---------------------|
| Normal | 48h | 5 dias | 1.0x |
| Alta | 24h | 3 dias | 1.3x |
| Urgente | 4h | 1 dia | 1.5x |

### Regras de Prioridade

- **Normal**: Padrão para todas as OS
- **Alta**: Definida pelo atendente ou cliente VIP
- **Urgente**: Aprovação do gerente necessária

---

## Numeração

### Formato

```
OS-[ANO][MÊS]-[SEQUENCIAL]

Exemplo: OS-202501-00042
```

### Regras

1. Sequencial reinicia a cada mês
2. Zeros à esquerda (5 dígitos)
3. Único por empresa (multi-tenant)

---

## Campos Obrigatórios

### Na Criação

| Campo | Obrigatório | Validação |
|-------|-------------|-----------|
| Cliente | Sim | ID válido ou novo cadastro |
| Equipamento | Sim | Tipo + Marca + Modelo |
| Defeito Relatado | Sim | Mínimo 10 caracteres |
| Prioridade | Sim | Enum válido |
| Atendente | Sim | Usuário logado |

### No Diagnóstico

| Campo | Obrigatório | Validação |
|-------|-------------|-----------|
| Técnico Responsável | Sim | ID válido |
| Diagnóstico Técnico | Sim | Mínimo 20 caracteres |
| Procedimentos | Sim | Lista de itens |

### Na Finalização

| Campo | Obrigatório | Validação |
|-------|-------------|-----------|
| Laudo Final | Sim | Mínimo 20 caracteres |
| Peças Utilizadas | Se aplicável | Lista com valores |
| Valor Total | Sim | > 0 |

---

## Timeline de Eventos

Cada OS mantém um histórico de eventos:

```typescript
interface ServiceOrderEvent {
  id: string;
  serviceOrderId: string;
  type: EventType;
  description: string;
  userId: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

enum EventType {
  STATUS_CHANGED = 'STATUS_CHANGED',
  TECHNICIAN_ASSIGNED = 'TECHNICIAN_ASSIGNED',
  QUOTE_GENERATED = 'QUOTE_GENERATED',
  QUOTE_APPROVED = 'QUOTE_APPROVED',
  QUOTE_REJECTED = 'QUOTE_REJECTED',
  PART_REQUESTED = 'PART_REQUESTED',
  PART_RECEIVED = 'PART_RECEIVED',
  PAYMENT_REGISTERED = 'PAYMENT_REGISTERED',
  NOTE_ADDED = 'NOTE_ADDED',
  ATTACHMENT_ADDED = 'ATTACHMENT_ADDED',
}
```

---

## Validações

### Criação

```typescript
// RN-OS-001: Cliente deve existir ou ser criado
if (!clienteId && !novoCliente) {
  throw new Error('Cliente é obrigatório');
}

// RN-OS-002: Equipamento deve ter informações mínimas
if (!equipamento.tipo || !equipamento.marca) {
  throw new Error('Tipo e marca do equipamento são obrigatórios');
}

// RN-OS-003: Defeito deve ser descritivo
if (defeitoRelatado.length < 10) {
  throw new Error('Descrição do defeito muito curta');
}
```

### Mudança de Status

```typescript
// RN-OS-010: Validar transição permitida
if (!STATUS_TRANSITIONS[statusAtual].includes(novoStatus)) {
  throw new Error('Transição de status não permitida');
}

// RN-OS-011: Diagnóstico requer técnico
if (novoStatus === 'DIAGNOSIS' && !tecnicoId) {
  throw new Error('Técnico responsável é obrigatório para diagnóstico');
}

// RN-OS-012: Finalização requer orçamento aprovado
if (novoStatus === 'COMPLETED' && !orcamentoAprovado) {
  throw new Error('Orçamento deve estar aprovado para finalizar');
}

// RN-OS-013: Entrega requer pagamento ou isenção
if (novoStatus === 'DELIVERED' && !pagamentoRegistrado && !isento) {
  throw new Error('Pagamento deve estar registrado para entregar');
}
```

---

## Permissões

| Ação | Atendente | Técnico | Gerente | Admin |
|------|-----------|---------|---------|-------|
| Criar OS | ✅ | ❌ | ✅ | ✅ |
| Ver OS | ✅ | ✅* | ✅ | ✅ |
| Editar OS | ✅ | ✅* | ✅ | ✅ |
| Cancelar OS | ❌ | ❌ | ✅ | ✅ |
| Atribuir Técnico | ✅ | ❌ | ✅ | ✅ |
| Registrar Diagnóstico | ❌ | ✅ | ✅ | ✅ |
| Aprovar Orçamento | ❌ | ❌ | ✅ | ✅ |
| Registrar Pagamento | ✅ | ❌ | ✅ | ✅ |
| Excluir OS | ❌ | ❌ | ❌ | ✅ |

*Técnico só vê/edita OS atribuídas a ele

---

## Notificações

| Evento | Destinatário | Canal |
|--------|--------------|-------|
| OS Criada | Cliente | Email, WhatsApp |
| Orçamento Pronto | Cliente | Email, WhatsApp |
| Orçamento Aprovado | Técnico | Sistema, Email |
| OS Finalizada | Cliente | Email, WhatsApp |
| Pronta para Retirada | Cliente | Email, WhatsApp, SMS |

---

## Métricas

### KPIs da OS

| Métrica | Cálculo | Meta |
|---------|---------|------|
| Tempo Médio de Diagnóstico | Média(Data Orçamento - Data Recebimento) | < 24h |
| Tempo Médio de Execução | Média(Data Conclusão - Data Aprovação) | < 3 dias |
| Taxa de Aprovação | Aprovadas / Total Orçamentos | > 80% |
| Taxa de Retrabalho | OS com retorno / Total | < 5% |

---

## Anexos

### Tipos Permitidos

- Imagens: JPG, PNG, WEBP (máx 5MB)
- Documentos: PDF (máx 10MB)
- Vídeos: MP4 (máx 50MB)

### Categorias

- Foto do Equipamento (entrada)
- Foto do Defeito
- Foto do Reparo
- Foto do Equipamento (saída)
- Comprovante de Pagamento
- Termo de Garantia

---

**Voltar para** [Regras de Negócio](./README.md)
