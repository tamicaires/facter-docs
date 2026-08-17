# Fluxo de Diagnóstico

> **Processo de avaliação técnica do equipamento.**

---

## Diagrama

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FLUXO DE DIAGNÓSTICO                               │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌───────────────┐
    │  OS Recebida  │
    │  (RECEIVED)   │
    └───────┬───────┘
            │
            ▼
    ┌───────────────┐
    │  Triagem      │───────────────────────────────────────────┐
    │  Inicial      │                                           │
    └───────┬───────┘                                           │
            │                                                   │
            ▼                                                   │
    ┌───────────────┐                                           │
    │ Atribuir      │                                           │
    │ Técnico       │                                           │
    └───────┬───────┘                                           │
            │                                                   │
            ▼                                                   │
    ┌───────────────┐                                           │
    │ IN_DIAGNOSIS  │                                           │
    └───────┬───────┘                                           │
            │                                                   │
            ▼                                                   │
    ┌───────────────────────────────────────────┐               │
    │           AVALIAÇÃO TÉCNICA                │               │
    │  ┌─────────────────────────────────────┐  │               │
    │  │ • Inspeção visual                   │  │               │
    │  │ • Testes funcionais                 │  │               │
    │  │ • Identificação de problemas        │  │               │
    │  │ • Fotos do estado                   │  │               │
    │  │ • Registro de defeitos              │  │               │
    │  └─────────────────────────────────────┘  │               │
    └───────────────────┬───────────────────────┘               │
                        │                                       │
                        ▼                                       │
              ┌─────────────────┐                               │
              │   É reparável?   │                               │
              └────────┬────────┘                               │
                       │                                        │
          ┌────────────┴────────────┐                           │
          │                         │                           │
          ▼                         ▼                           │
    ┌───────────┐           ┌───────────────┐                   │
    │    SIM    │           │      NÃO      │                   │
    └─────┬─────┘           └───────┬───────┘                   │
          │                         │                           │
          ▼                         ▼                           │
    ┌───────────────┐       ┌───────────────────┐               │
    │ Gerar         │       │ UNRECOVERABLE     │               │
    │ Orçamento     │       │ Notificar cliente │               │
    └───────┬───────┘       └─────────┬─────────┘               │
            │                         │                         │
            ▼                         ▼                         │
    ┌───────────────┐       ┌───────────────────┐               │
    │ AWAITING_     │       │ Cliente decide    │               │
    │ APPROVAL      │       │ destino           │               │
    └───────────────┘       └─────────┬─────────┘               │
                                      │                         │
                            ┌─────────┴─────────┐               │
                            │                   │               │
                            ▼                   ▼               │
                    ┌─────────────┐     ┌─────────────┐         │
                    │  Retirar    │     │  Descartar  │         │
                    │ equipamento │     │ equipamento │         │
                    └──────┬──────┘     └──────┬──────┘         │
                           │                   │                │
                           ▼                   ▼                │
                    ┌─────────────┐     ┌─────────────┐         │
                    │  CANCELLED  │     │  DISCARDED  │◀────────┘
                    └─────────────┘     └─────────────┘
```

---

## Estados do Diagnóstico

| Estado | Descrição |
|--------|-----------|
| `PENDING` | Aguardando diagnóstico |
| `IN_PROGRESS` | Em análise |
| `COMPLETED` | Diagnóstico concluído |
| `REPAIRABLE` | Reparável - orçamento gerado |
| `NOT_REPAIRABLE` | Sem reparo viável |

---

## Dados do Diagnóstico

```typescript
interface Diagnosis {
  // Identificação
  serviceOrderId: string;
  technicianId: string;

  // Análise
  visualInspection: string;        // Observações visuais
  functionalTests: FunctionalTest[];
  issues: Issue[];                 // Problemas identificados

  // Resultado
  result: 'REPAIRABLE' | 'NOT_REPAIRABLE' | 'NEEDS_PARTS';
  repairDifficulty: 'EASY' | 'MEDIUM' | 'HARD';
  estimatedTime: number;           // Horas estimadas

  // Se não reparável
  unrepairableReason?: string;

  // Recomendações
  recommendations: string[];

  // Evidências
  photos: DiagnosisPhoto[];

  // Timestamps
  startedAt: Date;
  completedAt: Date;
}

interface FunctionalTest {
  name: string;           // "Tela", "Bateria", "Câmera"
  status: 'PASS' | 'FAIL' | 'NOT_TESTED';
  notes?: string;
}

interface Issue {
  component: string;      // Componente afetado
  description: string;    // Descrição do problema
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  suggestedFix: string;   // Solução sugerida
  partRequired?: string;  // Peça necessária
  laborCost: number;      // Custo de mão de obra
  partCost: number;       // Custo da peça
}
```

---

## Checklist de Diagnóstico

### Smartphones

- [ ] Ligar equipamento
- [ ] Testar tela (touch, display, cores)
- [ ] Testar câmeras (frontal, traseira)
- [ ] Testar áudio (alto-falante, microfone)
- [ ] Testar sensores (proximidade, luminosidade)
- [ ] Testar conectividade (Wi-Fi, Bluetooth, chip)
- [ ] Testar bateria (carga, desempenho)
- [ ] Testar botões físicos
- [ ] Verificar estado da carcaça
- [ ] Verificar IMEI

### Notebooks

- [ ] Ligar equipamento
- [ ] Testar tela (resolução, pixels mortos)
- [ ] Testar teclado (todas as teclas)
- [ ] Testar touchpad
- [ ] Testar portas USB
- [ ] Testar conectividade
- [ ] Testar bateria
- [ ] Verificar cooler/ventilação
- [ ] Checar HDD/SSD
- [ ] Verificar memória RAM

---

## Ações do Técnico

### 1. Iniciar Diagnóstico

```typescript
// PATCH /service-orders/:id/status
{
  "status": "IN_DIAGNOSIS",
  "technicianId": "tech-uuid"
}
```

### 2. Registrar Testes

```typescript
// POST /service-orders/:id/diagnosis/tests
{
  "tests": [
    { "name": "Tela", "status": "FAIL", "notes": "Display com manchas" },
    { "name": "Touch", "status": "PASS" },
    { "name": "Bateria", "status": "FAIL", "notes": "Inchada" }
  ]
}
```

### 3. Registrar Problemas

```typescript
// POST /service-orders/:id/diagnosis/issues
{
  "issues": [
    {
      "component": "Display",
      "description": "Tela com manchas amareladas",
      "severity": "HIGH",
      "suggestedFix": "Troca de tela",
      "partRequired": "Tela iPhone 14 Pro",
      "laborCost": 100.00,
      "partCost": 450.00
    }
  ]
}
```

### 4. Finalizar Diagnóstico

```typescript
// POST /service-orders/:id/diagnosis/complete
{
  "result": "REPAIRABLE",
  "repairDifficulty": "MEDIUM",
  "estimatedTime": 2,
  "recommendations": [
    "Recomenda-se troca de bateria junto com a tela"
  ],
  "generateQuote": true
}
```

---

## Notificações

| Evento | Destinatário | Canal |
|--------|--------------|-------|
| Diagnóstico iniciado | Cliente | WhatsApp, Email |
| Diagnóstico concluído | Cliente | WhatsApp, Email |
| Equipamento não reparável | Cliente | WhatsApp, Email, Ligação |
| Orçamento gerado | Cliente | WhatsApp, Email |

---

## Regras de Negócio

1. **Prazo de diagnóstico**: Configurável (padrão: 48h)
2. **Fotos obrigatórias**: Mínimo 2 fotos por OS
3. **Autorização**: Cliente notificado antes de testes invasivos
4. **Histórico**: Diagnóstico anterior visível para equipamentos recorrentes

---

**Voltar para** [Fluxos](./README.md)
