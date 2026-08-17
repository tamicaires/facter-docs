# Fluxo: Recebimento

> **Processo de recebimento de equipamento do cliente.**

---

## Visão Geral

```
Cliente chega ──▶ Identificar ──▶ Cadastrar ──▶ Registrar ──▶ Entregar
                  Cliente        Equipamento    OS           Comprovante
```

---

## Etapas Detalhadas

### 1. Identificar Cliente

```
┌─────────────────────────────────────────────────────────────────┐
│                    BUSCAR CLIENTE                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   [______________________] 🔍                                  │
│    Buscar por nome, CPF ou telefone                            │
│                                                                 │
│   ┌───────────────────────────────────────────────────────┐   │
│   │ João Silva - (11) 99999-9999 - 123.456.789-00         │   │
│   │ Maria Santos - (11) 98888-8888                        │   │
│   └───────────────────────────────────────────────────────┘   │
│                                                                 │
│   [Novo Cliente]                                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Ações:**
- Buscar cliente existente
- Se não encontrar → cadastrar novo cliente
- Verificar dados de contato atualizados

---

### 2. Cadastrar Equipamento

```
┌─────────────────────────────────────────────────────────────────┐
│                    DADOS DO EQUIPAMENTO                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Tipo:        [ Smartphone          ▼]                        │
│   Marca:       [ Apple               ▼]                        │
│   Modelo:      [________________________]                      │
│   Cor:         [________________________]                      │
│   IMEI:        [________________________] [Validar]            │
│   Série:       [________________________]                      │
│                                                                 │
│   ─────────────────────────────────────────────────────────   │
│                                                                 │
│   Condição:    ○ Novo  ○ Excelente  ● Bom  ○ Regular  ○ Ruim  │
│                                                                 │
│   Acessórios:  ☑ Carregador  ☐ Fone  ☑ Capa  ☐ Película      │
│                [________________________] [+]                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Validações:**
- IMEI: 15 dígitos, algoritmo de Luhn
- Verificar se equipamento já cadastrado
- Se já existe → perguntar se é novo problema

---

### 3. Registrar Fotos

```
┌─────────────────────────────────────────────────────────────────┐
│                    FOTOS DO RECEBIMENTO                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐         │
│   │         │  │         │  │         │  │   ➕    │         │
│   │  📷     │  │  📷     │  │  📷     │  │         │         │
│   │ Frente  │  │ Traseira│  │  Tela   │  │ Adicionar│         │
│   └─────────┘  └─────────┘  └─────────┘  └─────────┘         │
│                                                                 │
│   ⚠️ Registre todas as avarias visíveis antes de aceitar      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Recomendações:**
- Mínimo 3 fotos: frente, traseira, tela
- Fotografar qualquer dano existente
- Fotos protegem contra reclamações futuras

---

### 4. Descrever Defeito

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEFEITO RELATADO                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   O que o cliente relatou:                                      │
│   ┌─────────────────────────────────────────────────────────┐ │
│   │ A tela parou de funcionar depois que o celular caiu no │ │
│   │ chão. O touch não responde e apareceram manchas na     │ │
│   │ parte de baixo da tela.                                 │ │
│   └─────────────────────────────────────────────────────────┘ │
│                                                                 │
│   Defeitos comuns:                                              │
│   [Tela quebrada] [Não liga] [Não carrega] [Bateria]          │
│   [Touch] [Câmera] [Alto-falante] [Microfone]                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### 5. Definir Prioridade

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRIORIDADE                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ○ Normal (3-5 dias úteis)                                    │
│   ○ Alta (1-2 dias úteis) - Taxa adicional 20%                 │
│   ○ Urgente (até 24h) - Taxa adicional 50%                     │
│                                                                 │
│   SLA previsto: Diagnóstico em até 48h                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### 6. Gerar OS e Comprovante

```
┌─────────────────────────────────────────────────────────────────┐
│                    COMPROVANTE DE RECEBIMENTO                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│              🏢 TechCare Assistência Técnica                   │
│              CNPJ: 12.345.678/0001-90                          │
│              Tel: (11) 3333-3333                               │
│                                                                 │
│   ─────────────────────────────────────────────────────────   │
│                                                                 │
│   OS: OS-202501-00042                                          │
│   Data: 14/01/2025 às 14:32                                    │
│                                                                 │
│   Cliente: João Silva                                          │
│   Tel: (11) 99999-9999                                         │
│                                                                 │
│   Equipamento: Apple iPhone 13 - Preto                         │
│   IMEI: 123456789012345                                        │
│   Acessórios: Carregador, Capa                                 │
│                                                                 │
│   Defeito: Tela quebrada, touch não funciona                   │
│                                                                 │
│   ─────────────────────────────────────────────────────────   │
│                                                                 │
│   Acompanhe: techcare.app/os/OS-202501-00042                   │
│   [QR CODE]                                                    │
│                                                                 │
│   Previsão diagnóstico: 16/01/2025                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Checklist do Atendente

- [ ] Cliente identificado/cadastrado
- [ ] Dados do equipamento completos
- [ ] IMEI validado (se aplicável)
- [ ] Fotos registradas
- [ ] Acessórios conferidos e listados
- [ ] Defeito descrito claramente
- [ ] Prioridade definida
- [ ] Comprovante entregue ao cliente
- [ ] Cliente informado sobre prazo do diagnóstico

---

## Notificações Automáticas

| Momento | Canal | Conteúdo |
|---------|-------|----------|
| OS criada | WhatsApp + Email | Confirmação com número da OS e link de acompanhamento |

---

**Voltar para** [Fluxos](./README.md)
