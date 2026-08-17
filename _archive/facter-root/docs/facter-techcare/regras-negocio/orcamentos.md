# Orçamentos

> **Regras de negócio para geração e aprovação de orçamentos.**

---

## Conceito

Orçamento é o documento que detalha os serviços necessários, peças e valores para o reparo do equipamento.

---

## Estrutura

```typescript
interface Orcamento {
  id: string;
  osId: string;
  numero: string;                // ORC-202501-00001
  status: StatusOrcamento;
  itens: ItemOrcamento[];
  subtotalServicos: number;
  subtotalPecas: number;
  desconto: Desconto;
  acrescimo?: Acrescimo;
  total: number;
  validadeEm: Date;
  observacoes?: string;
  criadoPor: string;
  criadoEm: Date;
  aprovadoEm?: Date;
  rejeitadoEm?: Date;
  motivoRejeicao?: string;
}
```

---

## Status

| Status | Código | Descrição |
|--------|--------|-----------|
| Rascunho | `DRAFT` | Em elaboração |
| Enviado | `SENT` | Enviado ao cliente |
| Visualizado | `VIEWED` | Cliente visualizou |
| Aprovado | `APPROVED` | Cliente aprovou |
| Rejeitado | `REJECTED` | Cliente rejeitou |
| Expirado | `EXPIRED` | Passou da validade |
| Cancelado | `CANCELLED` | Cancelado internamente |

### Transições

```typescript
const STATUS_TRANSITIONS = {
  DRAFT: ['SENT', 'CANCELLED'],
  SENT: ['VIEWED', 'APPROVED', 'REJECTED', 'EXPIRED', 'CANCELLED'],
  VIEWED: ['APPROVED', 'REJECTED', 'EXPIRED'],
  APPROVED: [],
  REJECTED: ['DRAFT'], // Pode gerar novo orçamento
  EXPIRED: ['DRAFT'],  // Pode gerar novo orçamento
  CANCELLED: [],
};
```

---

## Itens do Orçamento

### Tipos

| Tipo | Código | Descrição |
|------|--------|-----------|
| Serviço | `SERVICE` | Mão de obra, diagnóstico |
| Peça | `PART` | Componentes e peças |
| Acessório | `ACCESSORY` | Itens adicionais vendidos |

### Estrutura do Item

```typescript
interface ItemOrcamento {
  id: string;
  tipo: TipoItem;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  pecaId?: string;      // Se tipo = PART
  servicoId?: string;   // Se tipo = SERVICE
  garantia?: number;    // Dias de garantia do item
}
```

---

## Tabela de Serviços

### Serviços Padrão

| Serviço | Código | Valor Base | Tempo Estimado |
|---------|--------|------------|----------------|
| Diagnóstico | `DIAG` | R$ 50,00 | 1h |
| Troca de Tela | `SCREEN` | R$ 80,00 | 2h |
| Troca de Bateria | `BATTERY` | R$ 50,00 | 1h |
| Limpeza Interna | `CLEAN` | R$ 60,00 | 1h |
| Formatação | `FORMAT` | R$ 80,00 | 2h |
| Backup | `BACKUP` | R$ 40,00 | 1h |
| Instalação SO | `OS_INSTALL` | R$ 100,00 | 2h |
| Reparo Placa | `BOARD_REPAIR` | R$ 150,00+ | 4h+ |

### Regras de Serviço

```typescript
// RN-ORC-001: Serviço pode ter valor variável
interface Servico {
  id: string;
  codigo: string;
  nome: string;
  valorBase: number;
  valorMinimo?: number;
  valorMaximo?: number;
  tempoEstimado: number; // minutos
  requerAprovacao: boolean; // Se valor > valorBase
}
```

---

## Precificação de Peças

### Markup

```typescript
// RN-ORC-010: Markup sobre custo da peça
const MARKUP_PADRAO = 1.5; // 50% sobre custo

function calcularPrecoVenda(peca: Peca): number {
  const markup = peca.markupCustom || MARKUP_PADRAO;
  return peca.custo * markup;
}
```

### Tipos de Peça

| Tipo | Markup | Descrição |
|------|--------|-----------|
| Original | 1.3x - 1.5x | Peça do fabricante |
| Compatível | 1.5x - 2.0x | Peça alternativa de qualidade |
| Genérica | 2.0x - 3.0x | Peça genérica |
| Premium | 1.2x - 1.4x | Alta qualidade, parceiro |

---

## Descontos

### Tipos de Desconto

| Tipo | Código | Descrição |
|------|--------|-----------|
| Percentual | `PERCENT` | % sobre o total |
| Valor Fixo | `FIXED` | Valor em reais |
| Cliente VIP | `VIP` | Automático para VIPs |
| Promocional | `PROMO` | Campanha específica |
| Negociação | `NEGOTIATION` | Aprovado por gerente |

### Limites

```typescript
// RN-ORC-020: Limites de desconto por perfil
const LIMITES_DESCONTO = {
  ATENDENTE: { maxPercent: 5, maxFixed: 50 },
  TECNICO: { maxPercent: 0, maxFixed: 0 },
  GERENTE: { maxPercent: 20, maxFixed: 500 },
  ADMIN: { maxPercent: 100, maxFixed: Infinity },
};

// RN-ORC-021: Desconto acima do limite requer aprovação
function validarDesconto(desconto: Desconto, usuario: Usuario): boolean {
  const limite = LIMITES_DESCONTO[usuario.perfil];

  if (desconto.tipo === 'PERCENT' && desconto.valor > limite.maxPercent) {
    return false; // Requer aprovação
  }

  if (desconto.tipo === 'FIXED' && desconto.valor > limite.maxFixed) {
    return false; // Requer aprovação
  }

  return true;
}
```

### Desconto VIP Automático

```typescript
// RN-ORC-022: Aplicar desconto automático para VIPs
function aplicarDescontoCategoria(cliente: Cliente, subtotal: number): Desconto | null {
  const descontos = {
    REGULAR: null,
    PREMIUM: { tipo: 'PERCENT', valor: 10 },
    VIP: { tipo: 'PERCENT', valor: 15 },
    CORPORATE: null, // Condições especiais em contrato
  };

  return descontos[cliente.categoria];
}
```

---

## Validade

```typescript
// RN-ORC-030: Validade padrão de 7 dias
const VALIDADE_PADRAO_DIAS = 7;

// RN-ORC-031: Validade mínima de 3 dias
const VALIDADE_MINIMA_DIAS = 3;

// RN-ORC-032: Validade máxima de 30 dias
const VALIDADE_MAXIMA_DIAS = 30;

function calcularValidade(dataBase: Date, diasCustom?: number): Date {
  const dias = diasCustom || VALIDADE_PADRAO_DIAS;
  const validadeFinal = Math.min(Math.max(dias, VALIDADE_MINIMA_DIAS), VALIDADE_MAXIMA_DIAS);
  return addDays(dataBase, validadeFinal);
}
```

---

## Aprovação

### Fluxo de Aprovação

```
[Orçamento Enviado] → [Cliente Notificado] → [Cliente Acessa Link]
                                                    ↓
                            [Visualiza Detalhes] → [Aprova/Rejeita]
                                                    ↓
                                          [Sistema Notifica Loja]
```

### Link de Aprovação

```typescript
// RN-ORC-040: Link único e seguro para aprovação
function gerarLinkAprovacao(orcamentoId: string): string {
  const token = generateSecureToken();
  await saveTokenOrcamento(orcamentoId, token, expiracaoDoOrcamento);

  return `${BASE_URL}/orcamento/${token}`;
}

// RN-ORC-041: Token expira junto com orçamento
// RN-ORC-042: Token de uso único (invalidado após aprovação/rejeição)
```

### Página de Aprovação

```typescript
interface PaginaOrcamento {
  empresa: {
    nome: string;
    logo: string;
    telefone: string;
  };
  orcamento: {
    numero: string;
    data: Date;
    validade: Date;
    itens: ItemOrcamento[];
    subtotalServicos: number;
    subtotalPecas: number;
    desconto?: Desconto;
    total: number;
  };
  equipamento: {
    tipo: string;
    marca: string;
    modelo: string;
    defeito: string;
  };
  diagnostico: string;
  acoes: {
    aprovar: () => void;
    rejeitar: (motivo: string) => void;
    contato: string; // WhatsApp/telefone
  };
}
```

---

## Rejeição

### Motivos de Rejeição

| Motivo | Código | Ação Sugerida |
|--------|--------|---------------|
| Valor alto | `PRICE_HIGH` | Oferecer desconto |
| Desistiu do reparo | `GAVE_UP` | Devolver equipamento |
| Vai consertar em outro lugar | `COMPETITOR` | - |
| Equipamento obsoleto | `OBSOLETE` | Sugerir troca |
| Outros | `OTHER` | Texto livre |

### Tratamento

```typescript
// RN-ORC-050: Registrar motivo de rejeição
interface Rejeicao {
  orcamentoId: string;
  motivo: MotivoRejeicao;
  detalhes?: string;
  data: Date;
}

// RN-ORC-051: Notificar responsável sobre rejeição
// RN-ORC-052: Iniciar processo de devolução se rejeitado
```

---

## Revisões

### Regras

```typescript
// RN-ORC-060: Orçamento rejeitado pode gerar novo
// RN-ORC-061: Manter histórico de versões
interface VersaoOrcamento {
  versao: number;
  orcamento: Orcamento;
  alteracoes: string;
  criadoPor: string;
  criadoEm: Date;
}

// RN-ORC-062: Limite de revisões
const MAX_REVISOES = 3;
```

---

## Notificações

| Evento | Destinatário | Canais |
|--------|--------------|--------|
| Orçamento criado | Cliente | Email, WhatsApp |
| Lembrete de validade | Cliente | WhatsApp (D-2) |
| Orçamento aprovado | Técnico, Atendente | Sistema, Email |
| Orçamento rejeitado | Atendente, Gerente | Sistema, Email |
| Orçamento expirado | Atendente | Sistema |

---

## Permissões

| Ação | Atendente | Técnico | Gerente | Admin |
|------|-----------|---------|---------|-------|
| Criar orçamento | ✅ | ✅ | ✅ | ✅ |
| Editar rascunho | ✅ | ✅ | ✅ | ✅ |
| Enviar orçamento | ✅ | ❌ | ✅ | ✅ |
| Aplicar desconto | Limitado | ❌ | ✅ | ✅ |
| Aprovar desconto extra | ❌ | ❌ | ✅ | ✅ |
| Cancelar orçamento | ❌ | ❌ | ✅ | ✅ |
| Ver histórico | ✅ | ✅* | ✅ | ✅ |

---

**Voltar para** [Regras de Negócio](./README.md)
