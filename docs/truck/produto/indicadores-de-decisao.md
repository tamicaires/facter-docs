---
title: "Indicadores de decisão"
sidebar_position: 1
tags: [indicadores, kpi, decisao, analytics, lancamento, v2]
---

# Indicadores de decisão

O lançamento traz 13 indicadores, escolhidos pelas decisões que donos e chefias tomam: quanto custa, qual veículo compensa, onde a oficina perde tempo, o que volta e o que se repete. Todos saem de fatos que a v2 grava desde o primeiro dia. Definidos em 26/09/2026, organizados pelos pilares do [Analytics Hub](./propostas/analytics-pillars.mdx).

**Regras que valem para todos** (invariantes KPI-1 a KPI-3):

- Cada indicador tem esta definição escrita e um teste com números conhecidos.
- Períodos são cortados no fuso da empresa (padrão `America/Sao_Paulo`).
- Todo número é clicável até as ordens de serviço que o compõem.
- Calculados a partir de tabelas de agregação atualizadas por evento, nunca varrendo o histórico na requisição.
- Filtros comuns: período, frota, veículo, transportadora.
- **Ponto de vista do custo** ([ADR-011](../engenharia/adrs/adr-011-ecossistema-e-compartilhamento.md)): para o dono do ativo, o custo de uma OS feita por oficina terceira é o **valor cobrado**; para a oficina, é o **custo interno**. Peças de depósito consignado são custo do dono do estoque. Os indicadores 1, 2 e 3 respeitam o ponto de vista de quem consulta.

## Lançamento

| # | Pilar | Indicador | Decisão que apoia | Definição | Unidade | E-mail semanal |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Financeiro | Custo de manutenção por veículo e por frota | Onde está o dinheiro | Peças (preço congelado na entrega) + mão de obra (horas das sessões × custo/hora do cargo) + serviços externos + parcela do rateio, no período | R$ | Sim |
| 2 | Financeiro | Custo por km (CPK) | Qual veículo compensa manter, vender ou substituir | Custo do período ÷ km rodado no período (diferença entre leituras) | R$/km | — |
| 3 | Financeiro | Composição do custo | Onde cortar | Participação de peças, mão de obra, externo e rateio no custo total | % | — |
| 4 | Ativos | Disponibilidade da frota | Quantos veículos posso pôr na estrada; se preciso de reserva | Tempo sem OS aberta ÷ tempo total. **Parado = da entrada na fila até a saída da oficina**, fila incluída | % | Sim |
| 5 | Ativos | Veículos que mais pararam | Onde agir primeiro | Ranking de horas paradas no período | h | Sim |
| 6 | Ativos | Falhas recorrentes | Problema estrutural, não pontual | Mesmo componente no mesmo ativo repetido dentro da janela. **Janela configurável por empresa; padrão 90 dias ou 20 mil km, o que vier primeiro** | ocorrências | Sim (novas na semana) |
| 7 | Operacional | Tempo na oficina por motivo | Onde a oficina perde tempo: peça, box, gente, externo | Soma da duração de cada estado e motivo de pausa (fila, em manutenção, aguardando peça, serviço externo, outras pausas) | h e % | Sim |
| 8 | Operacional | Fila e ordens abertas agora | O que priorizar hoje | Contagem por status e idade | ordens | — |
| 9 | Operacional | Lead time da OS | Prazo que posso prometer à operação | Entrada na fila → saída; mediana e p90 | h | — |
| 10 | Qualidade | Taxa de retrabalho | Treinamento, troca de fornecedor | Serviços marcados como retorno ÷ serviços concluídos, por tipo de serviço, mecânico e fornecedor. **Retorno é marcado pelo usuário, com sugestão do sistema** | % | Sim |
| 11 | Pessoas | Horas trabalhadas × disponíveis | Dimensionar equipe e turnos | Horas das sessões ÷ horas do turno, por mecânico e equipe. **Individual visível só para gestão; sem ranking na oficina** | % | — |
| 12 | Prevenção | Corretiva × preventiva | Estou só apagando incêndio? | Proporção de OS por tipo | % | — |
| 13 | Qualidade | Não conformidades de checklist | Pontos fracos recorrentes da frota | Itens não conformes ÷ itens inspecionados, por item e ativo | % | — |

## Depois do lançamento

| Indicador | Por que depois |
| --- | --- |
| Custo por tipo de serviço e componente | Precisa de alguns meses de componente registrado para dizer algo |
| MTBF por modelo/marca | Precisa de histórico de corretivas com km |
| Ocupação de boxes | Depende de turnos e boxes calibrados no piloto |
| Produtividade por mecânico (serviços, tempo médio por tipo) | Captura consolidada primeiro; exposição sensível |
| Orçado × realizado | Depende de centros de custo |
| Preventiva vencendo, conformidade | Depende do motor de preventiva |

## Fatos que a v2 grava

Entrada direta para o schema v2. Nenhum indicador acima existe sem estes fatos, e fato não gravado não se recupera.

| Fato | Indicadores | Como é capturado sem atrito |
| --- | --- | --- |
| Transições da OS com timestamp do servidor e autor | 4, 5, 7, 8, 9 | Automático |
| Motivo de cada pausa (aguardando peça, serviço externo, fim de turno…) | 7 | Um toque ao pausar |
| Km (e horas, quando houver) do ativo em cada entrada na oficina | 2, 6 | Ao abrir a OS, pré-preenchido com a última leitura; confirmação com um toque |
| Tipo da OS (corretiva, preventiva, inspeção…) | 12 | Ao abrir a OS; padrão pelo tipo de manutenção |
| Componente de cada serviço | 6 (e custo por componente depois) | Pré-sugerido pelo tipo de serviço |
| Vínculo de retorno: serviço que voltou → serviço original | 10 | Ao criar o serviço, o sistema sugere o retorno provável no mesmo componente; confirmação com um toque |
| Sessões de trabalho por executor | 1, 11 | Automático ao iniciar, pausar e concluir |
| Custo/hora por cargo | 1 | Cadastro do cargo ([ADR-009](../engenharia/adrs/adr-009-labor-cost.md)) |
| Consumo de peça com preço congelado e data de consumo | 1, 3 | Automático na entrega da requisição |
| Serviços externos com valor e fornecedor | 1, 3, 10 | Ao registrar o serviço externo |
| Rateio mensal por veículo | 1, 3 | Automático (fechamento do período) |
| Turnos de cada mecânico | 11 | Cadastro de turnos |
| Itens de checklist com conformidade | 13 | Na execução do checklist |

## Resumo semanal por e-mail

Toda segunda-feira, para donos e chefias: custo da semana (1), disponibilidade (4), veículos que mais pararam (5), falhas recorrentes novas (6), tempo perdido por motivo (7) e retrabalho (10). Cada número leva à tela correspondente no sistema.
