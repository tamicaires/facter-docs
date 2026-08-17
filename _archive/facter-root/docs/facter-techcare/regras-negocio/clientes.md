# Clientes

> **Regras de negócio para gestão de clientes.**

---

## Conceito

Cliente representa uma pessoa física ou jurídica que solicita serviços de assistência técnica.

---

## Tipos de Cliente

| Tipo | Código | Documentos | Campos Extras |
|------|--------|------------|---------------|
| Pessoa Física | `PF` | CPF | Data Nascimento |
| Pessoa Jurídica | `PJ` | CNPJ | IE, Razão Social |

---

## Categorias

| Categoria | Código | Benefícios | Critério |
|-----------|--------|------------|----------|
| Regular | `REGULAR` | Nenhum | Padrão |
| Premium | `PREMIUM` | 10% desconto, Prioridade Alta | > 10 OS/ano ou > R$5.000/ano |
| VIP | `VIP` | 15% desconto, Prioridade Urgente | > 20 OS/ano ou > R$15.000/ano |
| Corporativo | `CORPORATE` | Condições especiais, Faturamento | Contrato |

### Regras de Upgrade

```typescript
// RN-CLI-001: Upgrade automático baseado em histórico
function calcularCategoria(cliente: Cliente): Categoria {
  const ultimoAno = getOrdensUltimoAno(cliente.id);
  const totalGasto = calcularTotalGasto(ultimoAno);

  if (cliente.contrato) return 'CORPORATE';
  if (ultimoAno.length >= 20 || totalGasto >= 15000) return 'VIP';
  if (ultimoAno.length >= 10 || totalGasto >= 5000) return 'PREMIUM';
  return 'REGULAR';
}
```

---

## Campos

### Dados Básicos

| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| Nome/Razão Social | string | Sim | 3-200 caracteres |
| Tipo | enum | Sim | PF ou PJ |
| CPF/CNPJ | string | Sim | Válido e único |
| Email | string | Não | Formato válido |
| Telefone Principal | string | Sim | Formato válido |
| Telefone Secundário | string | Não | Formato válido |
| WhatsApp | string | Não | Formato válido |

### Endereço

| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| CEP | string | Não |
| Logradouro | string | Não |
| Número | string | Não |
| Complemento | string | Não |
| Bairro | string | Não |
| Cidade | string | Não |
| Estado | string (UF) | Não |

### Dados Adicionais

| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| Data Nascimento | date | Não (PF) |
| Inscrição Estadual | string | Não (PJ) |
| Nome Fantasia | string | Não (PJ) |
| Observações | text | Não |

---

## Validações

### CPF/CNPJ

```typescript
// RN-CLI-010: CPF/CNPJ deve ser válido
if (tipo === 'PF' && !validateCPF(documento)) {
  throw new Error('CPF inválido');
}

if (tipo === 'PJ' && !validateCNPJ(documento)) {
  throw new Error('CNPJ inválido');
}

// RN-CLI-011: CPF/CNPJ deve ser único
const existing = await findByDocument(documento);
if (existing && existing.id !== clienteId) {
  throw new Error('CPF/CNPJ já cadastrado');
}
```

### Contato

```typescript
// RN-CLI-012: Pelo menos um telefone é obrigatório
if (!telefonePrincipal && !telefoneSecundario && !whatsapp) {
  throw new Error('Pelo menos um telefone é obrigatório');
}

// RN-CLI-013: WhatsApp para notificações
if (receberNotificacoesWhatsApp && !whatsapp) {
  throw new Error('WhatsApp é obrigatório para receber notificações');
}
```

---

## Busca de Clientes

### Critérios de Busca

- Nome/Razão Social (parcial)
- CPF/CNPJ (exato ou parcial)
- Telefone (qualquer)
- Email (parcial)

### Cadastro Rápido

Para agilizar o atendimento, permitir cadastro mínimo:

```typescript
interface CadastroRapido {
  nome: string;          // Obrigatório
  telefonePrincipal: string;  // Obrigatório
  tipo: 'PF' | 'PJ';     // Obrigatório
  documento?: string;    // Opcional no cadastro rápido
}
```

Completar cadastro posteriormente é incentivado mas não bloqueante.

---

## Histórico

### Informações Mantidas

| Dado | Descrição |
|------|-----------|
| Ordens de Serviço | Todas as OS do cliente |
| Equipamentos | Equipamentos já atendidos |
| Orçamentos | Histórico de orçamentos |
| Pagamentos | Histórico financeiro |
| Interações | Notas e comunicações |

### Métricas do Cliente

```typescript
interface ClienteMetrics {
  totalOS: number;
  osUltimoAno: number;
  ticketMedio: number;
  totalGasto: number;
  totalGastoUltimoAno: number;
  taxaAprovacao: number;     // % orçamentos aprovados
  tempoMedioResposta: number; // Horas para aprovar orçamento
  ultimaVisita: Date;
  equipamentoMaisFrequente: string;
}
```

---

## Comunicação

### Preferências

| Preferência | Tipo | Default |
|-------------|------|---------|
| Receber notificações por email | boolean | true |
| Receber notificações por WhatsApp | boolean | true |
| Receber notificações por SMS | boolean | false |
| Receber promoções | boolean | false |
| Horário preferido para contato | enum | COMERCIAL |

### Templates de Mensagem

Ver [Notificações](./notificacoes.md) para templates.

---

## Unificação de Cadastros

### Identificação de Duplicados

```typescript
// RN-CLI-020: Detectar possíveis duplicados
function detectarDuplicados(cliente: Cliente): Cliente[] {
  return findPossibleDuplicates({
    documento: cliente.documento,
    telefones: [cliente.telefonePrincipal, cliente.telefoneSecundario],
    email: cliente.email,
    nomeSimilar: cliente.nome, // Busca fonética
  });
}
```

### Merge de Cadastros

1. Manter cadastro mais completo como principal
2. Transferir todas as OS para o principal
3. Manter histórico do cadastro unificado
4. Registrar evento de unificação

---

## Exclusão / Inativação

### Regras

```typescript
// RN-CLI-030: Não pode excluir cliente com OS
if (await hasActiveOS(clienteId)) {
  throw new Error('Cliente possui OS em andamento');
}

// RN-CLI-031: Cliente com histórico é inativado, não excluído
if (await hasAnyOS(clienteId)) {
  await inativarCliente(clienteId);
  return;
}

// RN-CLI-032: Excluir apenas sem histórico
await excluirCliente(clienteId);
```

### Estados

| Estado | Código | Descrição |
|--------|--------|-----------|
| Ativo | `ACTIVE` | Pode criar OS |
| Inativo | `INACTIVE` | Não pode criar OS, mantém histórico |
| Bloqueado | `BLOCKED` | Inadimplente ou problema |

---

## Permissões

| Ação | Atendente | Técnico | Gerente | Admin |
|------|-----------|---------|---------|-------|
| Criar cliente | ✅ | ❌ | ✅ | ✅ |
| Editar cliente | ✅ | ❌ | ✅ | ✅ |
| Ver cliente | ✅ | ✅* | ✅ | ✅ |
| Ver histórico completo | ❌ | ❌ | ✅ | ✅ |
| Inativar cliente | ❌ | ❌ | ✅ | ✅ |
| Excluir cliente | ❌ | ❌ | ❌ | ✅ |
| Unificar cadastros | ❌ | ❌ | ✅ | ✅ |

*Técnico vê apenas clientes de suas OS

---

**Voltar para** [Regras de Negócio](./README.md)
