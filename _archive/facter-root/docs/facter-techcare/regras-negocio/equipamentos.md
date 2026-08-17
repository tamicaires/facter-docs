# Equipamentos

> **Regras de negócio para gestão de equipamentos.**

---

## Conceito

Equipamento é o item trazido pelo cliente para reparo ou manutenção.

---

## Categorias

| Categoria | Código | Exemplos |
|-----------|--------|----------|
| Smartphones | `SMARTPHONE` | iPhone, Samsung Galaxy, Xiaomi |
| Tablets | `TABLET` | iPad, Galaxy Tab |
| Notebooks | `NOTEBOOK` | MacBook, Dell, Lenovo |
| Desktops | `DESKTOP` | PCs montados, All-in-One |
| Impressoras | `PRINTER` | Laser, Jato de Tinta, Multifuncionais |
| TVs | `TV` | Smart TVs, Monitores |
| Consoles | `CONSOLE` | PlayStation, Xbox, Nintendo |
| Áudio | `AUDIO` | Fones, Caixas de Som, Home Theater |
| Eletrodomésticos | `APPLIANCE` | Micro-ondas, Cafeteiras, Aspiradores |
| Outros | `OTHER` | Diversos |

---

## Campos

### Dados Básicos

| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| Categoria | enum | Sim | Lista válida |
| Marca | string | Sim | 2-50 caracteres |
| Modelo | string | Sim | 2-100 caracteres |
| Número de Série | string | Não | Único por categoria |
| IMEI | string | Não | 15 dígitos (celulares) |
| Cor | string | Não | - |
| Capacidade | string | Não | Ex: 128GB, 1TB |

### Estado de Entrada

| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| Condição Física | enum | Sim |
| Acessórios | string[] | Não |
| Senha/Padrão | string | Não |
| Observações | text | Não |
| Fotos | file[] | Recomendado |

### Condição Física

| Estado | Código | Descrição |
|--------|--------|-----------|
| Excelente | `EXCELLENT` | Sem marcas de uso |
| Bom | `GOOD` | Marcas leves de uso |
| Regular | `FAIR` | Arranhões visíveis |
| Ruim | `POOR` | Danos estéticos significativos |
| Muito Ruim | `BAD` | Quebrado, trincado |

---

## IMEI

### Validação

```typescript
// RN-EQP-001: IMEI deve ter 15 dígitos
function validateIMEI(imei: string): boolean {
  if (!/^\d{15}$/.test(imei)) return false;

  // Algoritmo de Luhn
  let sum = 0;
  for (let i = 0; i < 15; i++) {
    let digit = parseInt(imei[i]);
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
}
```

### Consulta de IMEI

```typescript
// RN-EQP-002: Consultar IMEI em listas de bloqueio (opcional)
async function consultarIMEI(imei: string): Promise<IMEIStatus> {
  // Integração com API de consulta
  return {
    imei,
    status: 'LIMPO' | 'BLOQUEADO' | 'ROUBADO',
    marca: string,
    modelo: string,
  };
}
```

---

## Cadastro de Equipamento

### Fluxo

```
[Selecionar Categoria] → [Informar Marca/Modelo] → [Detalhes] → [Fotos] → [Confirmar]
```

### Busca de Modelos

```typescript
// RN-EQP-010: Auto-complete de modelos conhecidos
function buscarModelos(categoria: string, marca: string, termo: string): Modelo[] {
  return modelosConhecidos
    .filter(m => m.categoria === categoria)
    .filter(m => m.marca.toLowerCase() === marca.toLowerCase())
    .filter(m => m.nome.toLowerCase().includes(termo.toLowerCase()))
    .slice(0, 10);
}

// RN-EQP-011: Permitir modelo personalizado
interface ModeloCustom {
  categoria: string;
  marca: string;
  modelo: string; // Digitado pelo usuário
  isCustom: true;
}
```

### Equipamento Recorrente

```typescript
// RN-EQP-012: Sugerir equipamentos anteriores do cliente
function equipamentosAnteriores(clienteId: string): Equipamento[] {
  return findEquipamentosByCliente(clienteId)
    .sort((a, b) => b.ultimaOS.getTime() - a.ultimaOS.getTime())
    .slice(0, 5);
}
```

---

## Histórico do Equipamento

### Por Número de Série/IMEI

```typescript
interface HistoricoEquipamento {
  equipamentoId: string;
  serialNumber?: string;
  imei?: string;
  ordens: OrdemServico[];
  ultimoReparo?: Date;
  totalReparos: number;
  garantiaAtiva?: Garantia;
}

// RN-EQP-020: Vincular histórico por identificador
function buscarHistorico(serial?: string, imei?: string): HistoricoEquipamento | null {
  if (imei) {
    return findByIMEI(imei);
  }
  if (serial) {
    return findBySerial(serial);
  }
  return null;
}
```

---

## Defeitos Comuns

### Catálogo de Defeitos

| Categoria | Defeitos Comuns |
|-----------|-----------------|
| Smartphone | Tela quebrada, Bateria, Não liga, Não carrega, Conector, Câmera |
| Notebook | Tela, Teclado, Bateria, SSD/HD, Dobradiça, Superaquecimento |
| Impressora | Não imprime, Manchando, Puxando torto, Error, Cabeçote |
| TV | Não liga, Sem imagem, Sem som, Tela quebrada, Listras |

### Uso no Cadastro

```typescript
// RN-EQP-030: Sugerir defeitos por categoria
function defeitosComuns(categoria: string): string[] {
  return CATALOGO_DEFEITOS[categoria] || [];
}

// RN-EQP-031: Permitir defeito customizado
// Campo de texto livre além das sugestões
```

---

## Acessórios

### Lista Padrão por Categoria

| Categoria | Acessórios Comuns |
|-----------|-------------------|
| Smartphone | Carregador, Cabo, Fone, Capinha, Película |
| Notebook | Carregador, Mochila/Case |
| Console | Controle, Cabos, HD Externo |
| Impressora | Cabo USB, Cabo de Força |

### Registro

```typescript
interface Acessorio {
  nome: string;
  quantidade: number;
  condicao: 'BOM' | 'REGULAR' | 'RUIM';
  observacao?: string;
}

// RN-EQP-040: Registrar acessórios na entrada
// Verificar na saída para garantir devolução
```

---

## Fotos

### Requisitos

| Momento | Quantidade | Obrigatório |
|---------|------------|-------------|
| Entrada | 3-10 fotos | Recomendado |
| Defeito | 1-5 fotos | Se visível |
| Reparo | 1-5 fotos | Recomendado |
| Saída | 1-3 fotos | Recomendado |

### Categorias de Foto

```typescript
enum CategoriaFoto {
  FRENTE = 'FRENTE',
  VERSO = 'VERSO',
  LATERAL = 'LATERAL',
  DEFEITO = 'DEFEITO',
  REPARO = 'REPARO',
  COMPONENTE = 'COMPONENTE',
  ACESSORIO = 'ACESSORIO',
}
```

### Validação

```typescript
// RN-EQP-050: Formato de imagem
const FORMATOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];
const TAMANHO_MAXIMO = 5 * 1024 * 1024; // 5MB

// RN-EQP-051: Compressão automática
// Imagens > 2MB são comprimidas para 80% de qualidade
```

---

## Marcas Conhecidas

### Por Categoria

```typescript
const MARCAS = {
  SMARTPHONE: ['Apple', 'Samsung', 'Xiaomi', 'Motorola', 'LG', 'Asus', 'Realme'],
  NOTEBOOK: ['Dell', 'Lenovo', 'HP', 'Asus', 'Acer', 'Apple', 'Samsung'],
  PRINTER: ['HP', 'Epson', 'Canon', 'Brother', 'Samsung', 'Lexmark'],
  TV: ['Samsung', 'LG', 'Sony', 'TCL', 'Philips', 'AOC'],
  CONSOLE: ['Sony', 'Microsoft', 'Nintendo'],
};

// RN-EQP-060: Auto-complete de marcas
// RN-EQP-061: Permitir marca customizada
```

---

## Validações

```typescript
// RN-EQP-070: Categoria obrigatória
if (!categoria) {
  throw new Error('Categoria é obrigatória');
}

// RN-EQP-071: Marca obrigatória
if (!marca || marca.length < 2) {
  throw new Error('Marca é obrigatória');
}

// RN-EQP-072: Modelo obrigatório
if (!modelo || modelo.length < 2) {
  throw new Error('Modelo é obrigatório');
}

// RN-EQP-073: IMEI válido (se informado)
if (imei && !validateIMEI(imei)) {
  throw new Error('IMEI inválido');
}

// RN-EQP-074: Condição física obrigatória
if (!condicaoFisica) {
  throw new Error('Condição física é obrigatória');
}
```

---

**Voltar para** [Regras de Negócio](./README.md)
