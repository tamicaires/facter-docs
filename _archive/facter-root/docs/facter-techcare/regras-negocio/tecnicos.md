# Técnicos

> **Regras de negócio para gestão de técnicos.**

---

## Conceito

Técnico é o profissional responsável por realizar diagnósticos, reparos e manutenções nos equipamentos.

---

## Especialidades

| Especialidade | Código | Equipamentos |
|---------------|--------|--------------|
| Smartphones | `SMARTPHONES` | Celulares, Tablets |
| Computadores | `COMPUTERS` | Desktops, Notebooks, All-in-One |
| Eletrônicos | `ELECTRONICS` | TVs, Som, Eletrodomésticos |
| Impressoras | `PRINTERS` | Impressoras, Multifuncionais |
| Redes | `NETWORKING` | Roteadores, Switches, Servidores |
| Games | `GAMING` | Consoles, Controles |
| Apple | `APPLE` | iPhones, MacBooks, iPads |

### Regras de Especialidade

```typescript
// RN-TEC-001: Técnico pode ter múltiplas especialidades
interface Tecnico {
  id: string;
  especialidades: Especialidade[];
  especialidadePrincipal: Especialidade;
}

// RN-TEC-002: Atribuição considera especialidade
function sugerirTecnico(os: OrdemServico): Tecnico[] {
  const especialidadeEquipamento = getEspecialidadeEquipamento(os.equipamento);

  return tecnicos
    .filter(t => t.especialidades.includes(especialidadeEquipamento))
    .filter(t => t.disponivel)
    .sort((a, b) => {
      // Priorizar especialidade principal
      const aMain = a.especialidadePrincipal === especialidadeEquipamento ? 1 : 0;
      const bMain = b.especialidadePrincipal === especialidadeEquipamento ? 1 : 0;
      return bMain - aMain;
    });
}
```

---

## Níveis de Experiência

| Nível | Código | Descrição | Multiplicador Comissão |
|-------|--------|-----------|------------------------|
| Júnior | `JUNIOR` | Em treinamento | 0.8x |
| Pleno | `MID` | Autônomo | 1.0x |
| Sênior | `SENIOR` | Referência técnica | 1.2x |
| Especialista | `SPECIALIST` | Casos complexos | 1.5x |

---

## Disponibilidade

### Status

| Status | Código | Descrição |
|--------|--------|-----------|
| Disponível | `AVAILABLE` | Pode receber OS |
| Ocupado | `BUSY` | Em atendimento |
| Ausente | `AWAY` | Fora do expediente |
| Férias | `VACATION` | Período de férias |
| Licença | `LEAVE` | Licença médica/outro |
| Inativo | `INACTIVE` | Desligado |

### Horários

```typescript
interface HorarioTecnico {
  tecnicoId: string;
  diaSemana: DiaSemana;
  horaInicio: string; // HH:mm
  horaFim: string;
  intervaloInicio?: string;
  intervaloFim?: string;
}

// RN-TEC-010: Validar horário de atribuição
function validarDisponibilidade(tecnicoId: string, dataHora: Date): boolean {
  const horario = getHorarioTecnico(tecnicoId, getDiaSemana(dataHora));

  if (!horario) return false;

  const hora = format(dataHora, 'HH:mm');

  // Fora do expediente
  if (hora < horario.horaInicio || hora > horario.horaFim) {
    return false;
  }

  // No intervalo
  if (horario.intervaloInicio && horario.intervaloFim) {
    if (hora >= horario.intervaloInicio && hora <= horario.intervaloFim) {
      return false;
    }
  }

  return true;
}
```

---

## Atribuição de OS

### Critérios de Atribuição

1. **Especialidade**: Técnico deve ter a especialidade do equipamento
2. **Disponibilidade**: Técnico deve estar disponível
3. **Carga de Trabalho**: Considerar OS em andamento
4. **Nível**: Casos complexos para técnicos experientes
5. **Performance**: Histórico de avaliações

### Algoritmo de Sugestão

```typescript
interface ScoreTecnico {
  tecnicoId: string;
  score: number;
}

function calcularScoreAtribuicao(tecnico: Tecnico, os: OrdemServico): number {
  let score = 100;

  // Especialidade principal: +20
  if (tecnico.especialidadePrincipal === os.especialidade) {
    score += 20;
  }

  // Carga de trabalho: -5 por OS
  score -= tecnico.osEmAndamento * 5;

  // Avaliação média: +/- 10
  score += (tecnico.avaliacaoMedia - 3) * 5;

  // Tempo de resposta médio
  if (tecnico.tempoMedioResposta < 24) score += 10;
  if (tecnico.tempoMedioResposta > 48) score -= 10;

  return score;
}
```

### Limite de OS

```typescript
// RN-TEC-020: Limite de OS simultâneas por nível
const LIMITE_OS = {
  JUNIOR: 3,
  MID: 5,
  SENIOR: 7,
  SPECIALIST: 10,
};

function podeReceberOS(tecnico: Tecnico): boolean {
  const limite = LIMITE_OS[tecnico.nivel];
  return tecnico.osEmAndamento < limite;
}
```

---

## Avaliações

### Critérios

| Critério | Peso | Descrição |
|----------|------|-----------|
| Qualidade | 40% | Qualidade do reparo |
| Prazo | 30% | Cumprimento de SLA |
| Comunicação | 15% | Clareza no diagnóstico |
| Organização | 15% | Documentação e fotos |

### Fontes de Avaliação

1. **Cliente**: Após entrega da OS (opcional)
2. **Gerente**: Revisão periódica
3. **Sistema**: Métricas automáticas (prazo, retrabalho)

```typescript
interface Avaliacao {
  tecnicoId: string;
  osId: string;
  tipo: 'CLIENTE' | 'GERENTE' | 'SISTEMA';
  qualidade?: number;     // 1-5
  prazo?: number;         // 1-5
  comunicacao?: number;   // 1-5
  organizacao?: number;   // 1-5
  comentario?: string;
  createdAt: Date;
}
```

---

## Comissões

Ver [Comissões](./comissoes.md) para detalhes completos.

### Resumo

```typescript
interface ComissaoTecnico {
  base: number;           // Valor fixo por OS finalizada
  percentual: number;     // % do valor do serviço
  bonusMeta: number;      // Bônus por atingir meta
}

// RN-TEC-030: Cálculo de comissão
function calcularComissao(tecnico: Tecnico, os: OrdemServico): number {
  const comissao = tecnico.comissao;
  const multiplicador = MULTIPLICADOR_NIVEL[tecnico.nivel];

  const valorBase = comissao.base;
  const valorPercentual = os.valorServico * (comissao.percentual / 100);

  return (valorBase + valorPercentual) * multiplicador;
}
```

---

## Métricas

### KPIs Individuais

| Métrica | Descrição | Meta |
|---------|-----------|------|
| OS/Dia | Média de OS finalizadas por dia | 3+ |
| Tempo Médio | Tempo médio de diagnóstico + execução | < 48h |
| Taxa de Retrabalho | % de OS com retorno | < 5% |
| Avaliação Média | Média das avaliações | > 4.0 |
| Taxa de Cumprimento SLA | % dentro do prazo | > 90% |

### Dashboard do Técnico

```typescript
interface DashboardTecnico {
  osHoje: number;
  osEmAndamento: number;
  osConcluidas: number;
  avaliacaoMes: number;
  comissaoMes: number;
  metaMes: number;
  percentualMeta: number;
}
```

---

## Permissões

| Ação | Técnico | Gerente | Admin |
|------|---------|---------|-------|
| Ver próprio perfil | ✅ | - | - |
| Editar próprio perfil | Parcial | - | - |
| Ver outros técnicos | ❌ | ✅ | ✅ |
| Criar técnico | ❌ | ✅ | ✅ |
| Editar técnico | ❌ | ✅ | ✅ |
| Definir comissão | ❌ | ❌ | ✅ |
| Ver comissões | Própria | Todas | Todas |
| Inativar técnico | ❌ | ❌ | ✅ |

---

## Onboarding de Técnico

### Checklist

1. [ ] Cadastro básico completo
2. [ ] Especialidades definidas
3. [ ] Horários configurados
4. [ ] Treinamento no sistema
5. [ ] Primeiro atendimento supervisionado
6. [ ] Avaliação do período de teste

### Período de Teste

- Duração: 30 dias
- Status: `JUNIOR` durante teste
- Supervisão: OS revisadas por técnico sênior
- Avaliação: Mínimo 4.0 para efetivação

---

**Voltar para** [Regras de Negócio](./README.md)
