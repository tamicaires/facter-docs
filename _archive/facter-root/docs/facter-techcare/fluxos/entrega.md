# Fluxo: Entrega

> **Processo de finalização e entrega do equipamento ao cliente.**

---

## Visão Geral

```
OS Paga ──▶ Conferir ──▶ Demonstrar ──▶ Termo de ──▶ Assinatura ──▶ Entrega
            Equipamento  Funcionamento  Garantia                    Concluída
```

---

## Pré-requisitos

- [ ] OS com status `COMPLETED` ou `READY_FOR_PICKUP`
- [ ] Pagamento confirmado (ou isento)
- [ ] Cliente identificado

---

## Etapas

### 1. Conferir Equipamento

```
┌─────────────────────────────────────────────────────────────────┐
│                    CONFERÊNCIA DE ENTREGA                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   OS: OS-202501-00042                                          │
│   Cliente: João Silva                                          │
│                                                                 │
│   ─────────────────────────────────────────────────────────   │
│                                                                 │
│   Equipamento:                                                  │
│   ☑ Apple iPhone 13 - Preto                                    │
│   ☑ IMEI: 123456789012345                                      │
│                                                                 │
│   Acessórios recebidos:                                        │
│   ☑ Carregador                                                 │
│   ☑ Capa protetora                                             │
│   ☐ Fone de ouvido (não entregue no recebimento)              │
│                                                                 │
│   Serviço realizado:                                           │
│   • Troca de tela (peça original)                              │
│   • Limpeza interna                                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### 2. Demonstrar Funcionamento

```
┌─────────────────────────────────────────────────────────────────┐
│                    TESTES COM O CLIENTE                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Demonstrar para o cliente:                                    │
│                                                                 │
│   ☑ Liga normalmente                                           │
│   ☑ Touch funciona em toda a tela                              │
│   ☑ Cores e brilho OK                                          │
│   ☑ Câmeras funcionando                                        │
│   ☑ Alto-falante OK                                            │
│   ☑ Carregamento OK                                            │
│                                                                 │
│   Cliente satisfeito? [ Sim ]                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Se cliente não satisfeito:**
- Registrar reclamação
- Acionar técnico para verificação
- Avaliar necessidade de retrabalho

---

### 3. Termo de Garantia

```
┌─────────────────────────────────────────────────────────────────┐
│                    TERMO DE GARANTIA                            │
│                                                                 │
│              🏢 TechCare Assistência Técnica                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   OS: OS-202501-00042                                          │
│   Data: 16/01/2025                                             │
│                                                                 │
│   Cliente: João Silva                                          │
│   CPF: 123.456.789-00                                          │
│                                                                 │
│   Equipamento: Apple iPhone 13                                 │
│   IMEI: 123456789012345                                        │
│                                                                 │
│   ─────────────────────────────────────────────────────────   │
│                                                                 │
│   ITENS COBERTOS PELA GARANTIA:                                │
│                                                                 │
│   Item                           Prazo     Válido até          │
│   ────────────────────────────────────────────────────────    │
│   Serviço de troca de tela       90 dias   16/04/2025         │
│   Tela iPhone 13 Original        90 dias   16/04/2025         │
│                                                                 │
│   ─────────────────────────────────────────────────────────   │
│                                                                 │
│   CONDIÇÕES:                                                    │
│   • Garantia cobre defeitos do serviço/peça                    │
│   • NÃO cobre: quedas, líquidos, mau uso                       │
│   • Violação de lacres anula a garantia                        │
│   • Reparos por terceiros anulam a garantia                    │
│                                                                 │
│   Em caso de problema, retorne com este documento.             │
│                                                                 │
│   Verificar online: techcare.app/garantia/xxxxx                │
│   [QR CODE]                                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### 4. Coleta de Assinatura

```
┌─────────────────────────────────────────────────────────────────┐
│                    CONFIRMAÇÃO DE ENTREGA                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Declaro que recebi o equipamento em perfeito                 │
│   funcionamento, conforme os serviços descritos.               │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐ │
│   │                                                         │ │
│   │           [Área para assinatura digital]               │ │
│   │                                                         │ │
│   └─────────────────────────────────────────────────────────┘ │
│                                                                 │
│   [Limpar]                                                     │
│                                                                 │
│   [ ] Enviar cópia por email                                   │
│   [ ] Enviar cópia por WhatsApp                                │
│                                                                 │
│   [Confirmar Entrega]                                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### 5. Finalização

Após confirmar entrega:

1. **Status da OS:** `DELIVERED` → `ARCHIVED`
2. **Garantia ativada:** Contagem inicia
3. **Notificações:**
   - Email com recibo e termo de garantia
   - WhatsApp de agradecimento
4. **Pesquisa de satisfação:** Enviada em 24h

---

## Entrega sem Reparo

Quando orçamento é rejeitado ou equipamento sem conserto:

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEVOLUÇÃO SEM REPARO                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Motivo: ○ Orçamento rejeitado                                │
│           ○ Equipamento sem conserto                           │
│           ○ Cliente desistiu                                   │
│                                                                 │
│   Taxa de diagnóstico cobrada? [ Sim ] R$ 50,00               │
│                                                                 │
│   Observações:                                                  │
│   ┌─────────────────────────────────────────────────────────┐ │
│   │ Cliente optou por não realizar o reparo devido ao      │ │
│   │ valor do orçamento.                                     │ │
│   └─────────────────────────────────────────────────────────┘ │
│                                                                 │
│   [ ] Informar cliente sobre descarte adequado                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Checklist do Atendente

- [ ] Equipamento conferido visualmente
- [ ] Funcionamento demonstrado ao cliente
- [ ] Acessórios devolvidos
- [ ] Termo de garantia entregue/explicado
- [ ] Assinatura coletada
- [ ] Cliente satisfeito

---

## Notificações Automáticas

| Momento | Canal | Conteúdo |
|---------|-------|----------|
| Após entrega | Email | Recibo + Termo de garantia (PDF) |
| Após entrega | WhatsApp | Agradecimento + Link garantia |
| 24h depois | Email | Pesquisa de satisfação |
| 7 dias depois | WhatsApp | "Tudo funcionando bem?" |

---

**Voltar para** [Fluxos](./README.md)
