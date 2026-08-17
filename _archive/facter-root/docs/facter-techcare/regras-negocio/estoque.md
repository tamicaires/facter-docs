# Estoque

> **Regras de negócio para gestão de peças e estoque.**

---

## Conceito

O módulo de estoque gerencia peças, componentes e insumos utilizados nos reparos.

---

## Estrutura

### Peça

```typescript
interface Peca {
  id: string;
  sku: string;                  // Código único
  nome: string;
  descricao?: string;
  categoria: CategoriaPeca;
  marca?: string;
  modelosCompativeis: string[]; // Ex: ["iPhone 12", "iPhone 12 Pro"]
  tipo: TipoPeca;               // ORIGINAL, COMPATIVEL, GENERICO
  custo: number;                // Preço de compra
  precoVenda: number;           // Preço para cliente
  markup: number;               // Multiplicador
  quantidadeMinima: number;     // Estoque mínimo
  quantidadeAtual: number;
  localizacao?: string;         // Prateleira, gaveta
  fornecedor?: string;
  garantiaDias: number;         // Garantia da peça
  ativo: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
}
```

### Categorias

| Categoria | Código | Exemplos |
|-----------|--------|----------|
| Telas | `SCREENS` | LCD, OLED, Touch |
| Baterias | `BATTERIES` | Bateria celular, notebook |
| Conectores | `CONNECTORS` | USB-C, Lightning, P2 |
| Botões | `BUTTONS` | Power, Volume, Home |
| Câmeras | `CAMERAS` | Frontal, Traseira |
| Componentes SMD | `SMD` | Capacitores, Resistores, CIs |
| Cabos Flex | `FLEX` | Flex de carga, tela |
| Carcaça | `HOUSING` | Tampa traseira, chassi |
| Outros | `OTHER` | Diversos |

---

## Movimentações

### Tipos

| Tipo | Código | Descrição | Afeta Estoque |
|------|--------|-----------|---------------|
| Entrada | `IN` | Compra de fornecedor | +Quantidade |
| Saída OS | `OUT_SERVICE` | Uso em ordem de serviço | -Quantidade |
| Saída Venda | `OUT_SALE` | Venda direta | -Quantidade |
| Ajuste Positivo | `ADJUST_IN` | Correção de inventário | +Quantidade |
| Ajuste Negativo | `ADJUST_OUT` | Correção de inventário | -Quantidade |
| Devolução | `RETURN` | Retorno de peça defeituosa | +Quantidade |
| Perda | `LOSS` | Peça danificada/extraviada | -Quantidade |

### Registro

```typescript
interface Movimentacao {
  id: string;
  pecaId: string;
  tipo: TipoMovimentacao;
  quantidade: number;
  custoUnitario?: number;       // Para entradas
  motivoAjuste?: string;        // Para ajustes
  osId?: string;                // Para saídas de OS
  vendaId?: string;             // Para vendas
  fornecedorId?: string;        // Para entradas
  notaFiscal?: string;
  usuarioId: string;
  criadoEm: Date;
}
```

---

## Controle de Estoque

### Estoque Mínimo

```typescript
// RN-EST-001: Alertar quando abaixo do mínimo
function verificarEstoqueMinimo(): PecaBaixoEstoque[] {
  return pecas.filter(p =>
    p.quantidadeAtual <= p.quantidadeMinima && p.ativo
  );
}

// RN-EST-002: Notificar responsáveis
async function notificarEstoqueBaixo(pecas: PecaBaixoEstoque[]): void {
  // Enviar email para gerente/compras
  // Criar tarefa de reposição
}
```

### Reserva para OS

```typescript
// RN-EST-003: Reservar peças ao aprovar orçamento
interface Reserva {
  id: string;
  pecaId: string;
  osId: string;
  quantidade: number;
  status: 'RESERVADO' | 'UTILIZADO' | 'LIBERADO';
  criadoEm: Date;
  expiraEm: Date; // 7 dias
}

// RN-EST-004: Liberar reserva se OS cancelada ou expirada
// RN-EST-005: Converter reserva em saída ao usar peça
```

### Quantidade Disponível

```typescript
// RN-EST-006: Disponível = Atual - Reservado
function quantidadeDisponivel(pecaId: string): number {
  const peca = getPeca(pecaId);
  const reservado = getReservasAtivas(pecaId)
    .reduce((sum, r) => sum + r.quantidade, 0);

  return peca.quantidadeAtual - reservado;
}
```

---

## Precificação

### Markup Padrão

```typescript
const MARKUP_PADRAO = {
  ORIGINAL: 1.4,    // 40% sobre custo
  COMPATIVEL: 1.6,  // 60% sobre custo
  GENERICO: 2.0,    // 100% sobre custo
};

// RN-EST-010: Calcular preço de venda
function calcularPrecoVenda(peca: Peca): number {
  const markup = peca.markup || MARKUP_PADRAO[peca.tipo];
  return Math.ceil(peca.custo * markup);
}
```

### Atualização de Custos

```typescript
// RN-EST-011: Atualizar custo na entrada
// Opções: último custo, custo médio
enum MetodoCusto {
  ULTIMO = 'ULTIMO',      // Usa custo da última compra
  MEDIO = 'MEDIO',        // Média ponderada
}

function atualizarCusto(peca: Peca, entrada: Entrada, metodo: MetodoCusto): void {
  if (metodo === 'ULTIMO') {
    peca.custo = entrada.custoUnitario;
  } else {
    const custoTotal = peca.custo * peca.quantidadeAtual +
                       entrada.custoUnitario * entrada.quantidade;
    const quantidadeTotal = peca.quantidadeAtual + entrada.quantidade;
    peca.custo = custoTotal / quantidadeTotal;
  }
}
```

---

## Entrada de Estoque

### Fluxo

```
[Selecionar Fornecedor] → [Informar Itens] → [Conferir] → [Confirmar]
                                ↓
                    [NF: Opcional] → [Salvar]
```

### Validações

```typescript
// RN-EST-020: Validar entrada
function validarEntrada(entrada: EntradaEstoque): void {
  if (!entrada.itens?.length) {
    throw new Error('Entrada deve ter pelo menos um item');
  }

  entrada.itens.forEach(item => {
    if (item.quantidade <= 0) {
      throw new Error('Quantidade deve ser maior que zero');
    }
    if (item.custoUnitario <= 0) {
      throw new Error('Custo deve ser maior que zero');
    }
  });
}
```

---

## Saída para OS

### Fluxo

```typescript
// RN-EST-030: Registrar saída ao usar peça na OS
async function registrarUsoPeca(osId: string, pecaId: string, quantidade: number): Promise<void> {
  // Verificar disponibilidade
  const disponivel = quantidadeDisponivel(pecaId);
  if (disponivel < quantidade) {
    throw new Error('Estoque insuficiente');
  }

  // Verificar se há reserva
  const reserva = await getReserva(osId, pecaId);
  if (reserva) {
    await utilizarReserva(reserva.id);
  }

  // Registrar movimentação
  await criarMovimentacao({
    pecaId,
    tipo: 'OUT_SERVICE',
    quantidade,
    osId,
  });

  // Atualizar quantidade
  await atualizarQuantidade(pecaId, -quantidade);
}
```

---

## Inventário

### Contagem

```typescript
interface Contagem {
  id: string;
  data: Date;
  status: 'EM_ANDAMENTO' | 'FINALIZADA';
  itens: ItemContagem[];
  responsavelId: string;
  observacoes?: string;
}

interface ItemContagem {
  pecaId: string;
  quantidadeSistema: number;
  quantidadeContada: number;
  diferenca: number;
  ajustado: boolean;
}

// RN-EST-040: Gerar ajustes de diferenças
function gerarAjustesInventario(contagem: Contagem): Movimentacao[] {
  return contagem.itens
    .filter(item => item.diferenca !== 0)
    .map(item => ({
      pecaId: item.pecaId,
      tipo: item.diferenca > 0 ? 'ADJUST_IN' : 'ADJUST_OUT',
      quantidade: Math.abs(item.diferenca),
      motivoAjuste: `Ajuste inventário ${contagem.id}`,
    }));
}
```

---

## Fornecedores

```typescript
interface Fornecedor {
  id: string;
  nome: string;
  cnpj?: string;
  telefone?: string;
  email?: string;
  whatsapp?: string;
  endereco?: Endereco;
  observacoes?: string;
  ativo: boolean;
}

// RN-EST-050: Vincular peças a fornecedores preferenciais
interface PecaFornecedor {
  pecaId: string;
  fornecedorId: string;
  codigoFornecedor?: string; // Código da peça no fornecedor
  precoReferencia?: number;
  prazoEntrega?: number;     // dias
  preferencial: boolean;
}
```

---

## Relatórios

### Posição de Estoque

```typescript
interface RelatorioEstoque {
  data: Date;
  totalItens: number;
  valorTotal: number;         // Custo total
  valorVenda: number;         // Preço venda total
  itensBaixoEstoque: number;
  itensSemMovimento: number;  // > 90 dias
  detalhes: {
    categoria: string;
    quantidade: number;
    valorCusto: number;
    valorVenda: number;
  }[];
}
```

### Curva ABC

```typescript
// RN-EST-060: Classificação ABC por giro
interface CurvaABC {
  classificacao: 'A' | 'B' | 'C';
  pecas: Peca[];
  percentualItens: number;
  percentualValor: number;
}

// A: 20% dos itens = 80% do valor
// B: 30% dos itens = 15% do valor
// C: 50% dos itens = 5% do valor
```

---

## Permissões

| Ação | Atendente | Técnico | Gerente | Admin |
|------|-----------|---------|---------|-------|
| Ver estoque | ✅ | ✅ | ✅ | ✅ |
| Usar peça em OS | ✅ | ✅ | ✅ | ✅ |
| Registrar entrada | ❌ | ❌ | ✅ | ✅ |
| Fazer ajustes | ❌ | ❌ | ✅ | ✅ |
| Cadastrar peças | ❌ | ❌ | ✅ | ✅ |
| Editar preços | ❌ | ❌ | ✅ | ✅ |
| Realizar inventário | ❌ | ❌ | ✅ | ✅ |
| Ver relatórios | ❌ | ❌ | ✅ | ✅ |

---

**Voltar para** [Regras de Negócio](./README.md)
