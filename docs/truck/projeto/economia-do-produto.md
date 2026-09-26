---
title: "Economia do produto"
sidebar_position: 3
tags: [preco, custo, margem, infraestrutura, planos, cobranca]
---

# Economia do produto

A infraestrutura não é o que ameaça a margem do Truck. Com os preços de hoje, ela custa cerca de R$ 1.300 por mês para os primeiros clientes, e um cliente pequeno já a cobre. O que pode transformar o sistema em custo é **tempo de gente**: implantação, suporte e desenvolvimento, além da faixa de imposto. Esta página é viva: cada módulo novo diz o que muda no custo de servir, e os números são revistos no mesmo ciclo.

Preços pesquisados em 26/09/2026, com fonte. Os valores marcados como **premissa** são estimativas nossas, e trocá-los muda o resultado.

## Premissas

| Premissa | Valor | Origem |
| --- | --- | --- |
| Câmbio | R$ 5,50 por US$ | **Premissa**, atualizar |
| Fotos por OS | 12 | Informado pela arquiteta (mais de 10) |
| Tamanho da foto após compressão no aparelho (1600 px, WebP) | 150 KB | Entre 80 e 150 KB em WebP ([Google](https://developers.google.com/speed/webp)); usamos o teto |
| OS por veículo por mês | ~1 no cliente pequeno; ~1,8 no piloto | **Premissa** a partir dos volumes informados |

## Cenários de cliente

| | Pequeno | Piloto: Suzano Imperatriz | Hipótese: Suzano nacional |
| --- | --- | --- | --- |
| Veículos (cavalos + carretas) | 60 | 500 | 2.500 (**premissa**: 5 unidades do porte de Imperatriz) |
| Oficinas | 1 | 4 a 10 | 20 a 50 |
| OS por mês | 60 | 900 | 4.500 |
| Usuários ativos | ~8 | ~80 | ~400 |
| Fotos novas por mês | 720 (~0,1 GB) | 10.800 (~1,6 GB) | 54.000 (~8 GB) |
| Fotos acumuladas em 1 ano | ~1,3 GB | ~19 GB | ~97 GB |

:::tip[Simulador]
Para testar outros preços, quantidades e custos, use o [simulador de receita](./simulador.mdx).
:::

## Quanto custa servir

### Infraestrutura fixa (lançamento até ~50 clientes)

| Item | US$/mês | Fonte |
| --- | --- | --- |
| Render workspace Pro | 25 | [render.com/pricing](https://render.com/pricing) |
| API: 2 instâncias de 1 CPU / 2 GB (redundância) | 50 | idem |
| Worker da fila: 1 CPU / 2 GB | 25 | idem |
| Redis (Render Key Value, 256 MB) | 10 | idem |
| Postgres (Render, 1 CPU / 4 GB) | 55 | idem |
| Vercel Pro | 20 | [vercel.com/pricing](https://vercel.com/pricing) |
| Sentry Team | 26 | [sentry.io/pricing](https://sentry.io/pricing/) |
| Resend Pro (e-mail, 50 mil/mês) | 20 | [resend.com/pricing](https://resend.com/pricing) |
| PostHog (analytics de uso) | 0 até 1 milhão de eventos/mês | [posthog.com/pricing](https://posthog.com/pricing) |
| **Total** | **~231 (≈ R$ 1.270)** | |

### Variável por cliente

| Item | Pequeno | Suzano Imperatriz | Suzano nacional |
| --- | --- | --- | --- |
| Fotos no R2 (US$ 0,015/GB-mês, sem custo de saída), após 1 ano | ~US$ 0,02 | ~US$ 0,30 | ~US$ 1,50 |
| Analytics de uso (eventos acima do gratuito, US$ 0,00005/evento) | 0 | ~US$ 20 (~400 mil eventos) | ~US$ 70 |
| Banco e processamento | Dentro da infra fixa | Dentro da infra fixa | Exige subir Postgres e API: +US$ 100 a 200 |

Fonte do R2: [developers.cloudflare.com/r2/pricing](https://developers.cloudflare.com/r2/pricing/).

**As fotos custam centavos desde que três regras valham:** compressão no aparelho antes do envio (a foto original de tablet tem de 3 a 8 MB, 20 a 50 vezes mais), armazenamento no R2 (no S3 a saída custa US$ 0,09/GB e passa a pesar quando gestores veem fotos o dia inteiro) e miniatura para as listas.

## Quanto custa operar

| Item | Valor | Fonte |
| --- | --- | --- |
| Boleto ou PIX recebido (Asaas) | R$ 1,99 por cobrança | [asaas.com/precos-e-taxas](https://www.asaas.com/precos-e-taxas) |
| Cartão à vista (Asaas) | R$ 0,49 + 2,99% | idem |
| Imposto (Simples Nacional) | 6% (Anexo III) a 15,5% (Anexo V) na primeira faixa. Software em geral cai no Anexo V, salvo Fator R ≥ 28% (folha ÷ receita) | [LC 123/2006](https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp123.htm); **confirmar com contador**, e ver o efeito da reforma (LC 214/2025) |
| Implantação (importação de planilhas, configuração, treinamento) | Horas de trabalho por cliente | **Medir no piloto** |
| Suporte | Horas por cliente por mês | **Medir no piloto** |

**A diferença entre 6% e 15,5% de imposto vale mais que toda a infraestrutura** a partir de uns R$ 15 mil por mês de receita. Vale falar com o contador antes de emitir a primeira nota.

## Mercado

| Produto | Preço público | Inclui | Fonte |
| --- | --- | --- | --- |
| Sofit | **R$ 39,90 por veículo/mês**, mínimo de 20 veículos, mais consultoria de implantação (valor não informado) | Plano de manutenção, OS, checklist, pneus, combustível | [sofit4.com.br/precos](https://sofit4.com.br/precos/) (página marcada 2024) |
| Mobi7 | R$ 69,90 a 89,90 por veículo/mês, mais R$ 120 de instalação | Telemetria com hardware; manutenção no plano avançado | [mobi7.com.br](https://mobi7.com.br/planos-telemetria-gestao-frotas/) |
| Infleet, Cobli, MaxiFrota, Rota Exata, Softruck, Prolog | Não público (demonstração) | — | sites oficiais |
| Fleetio (EUA) | US$ 4 a 10 por veículo/mês | Manutenção, OS, estoque | [Capterra](https://www.capterra.com/p/120855/Fleetio/pricing/) (página oficial bloqueada) |
| Simply Fleet (EUA) | US$ 2 a 4 por veículo/mês | Manutenção e estoque | [simplyfleet.app](https://simplyfleet.app/pricing-plan) |

No Brasil, software de manutenção sem hardware está publicado a partir de R$ 39,90 por veículo por mês. Com telemetria, fica entre R$ 70 e 90. A maioria esconde o preço atrás de uma demonstração.

## O que os clientes usam hoje

| Cliente | Hoje | Observação |
| --- | --- | --- |
| Vale das Carretas (oficina terceira do ecossistema Suzano) | SmartQuestion para os serviços, sem rastreabilidade; checklist em folha de papel; OS em Word, impressa e preenchida à mão. **Só carretas.** 150 frotas (conjuntos: geralmente bitrem, também tritrem e até 6 unidades; ~300 a 450 carretas), até 110 atendidas por mês, ~200 OS por mês. Cobrança sugerida: por frota atendida | Faz só a manutenção. A **Suzano é dona** do almoxarifado, das frotas e dos pneus. Em outros clientes a divisão é diferente |
| Suzano (dona dos pneus) | Pneus no Excel na operação de Imperatriz | Usou o Sofit para pneus e parou ali. **Hipótese:** a versão era antiga. O Sofit **ainda funciona em alguma unidade da fábrica**, de forma limitada e não abrangente: é concorrente instalado dentro da Suzano |

**Perguntas para a descoberta com a Vale e a Suzano:**

1. Em qual unidade da Suzano o Sofit ainda funciona, e por que ali dá certo? E por que parou em Imperatriz (hipótese: versão antiga): preço, esforço para registrar, falta de encaixe com a oficina ou outro motivo? A resposta define se R$ 39,90 por veículo é teto ou piso.
2. Quanto pagam hoje, somando SmartQuestion, o Sofit enquanto usaram e o tempo gasto em planilhas?
3. O que o SmartQuestion faz que eles não abririam mão?
4. Quem na Vale sofre mais com a falta de rastreabilidade: o dono da oficina, o encarregado ou o almoxarife?

**Posicionamento frente ao Sofit:** o Sofit atende uma unidade isolada; o Truck junta embarcador, oficinas terceiras e transportadoras num ecossistema, com cada parte controlando o próprio dado. Onde o Sofit ainda roda, a importação do histórico ou uma convivência temporária entram no plano de implantação.

## Hipótese de preço (a validar)

**Métrica: veículo ativo por mês.** Acompanha o valor entregue (custo por veículo), cresce com o porte e é o padrão do mercado. Quatro regras:

1. **Planos por módulo e profundidade dos indicadores**, com a oficina sempre inclusa, porque ela gera o dado.
2. **Mínimo mensal** para cliente pequeno não virar custo de suporte.
3. **Implantação cobrada à parte**, porque importar planilhas e treinar custa horas.
4. **Ecossistema:** a oficina terceira paga pelos veículos que atende (ou é patrocinada pelo embarcador), e o embarcador paga pelos veículos dele e, se quiser, pelos dos parceiros que convida.

| Cenário | Hipótese | Receita/mês | Custo direto/mês (infra variável + pagamento) | Imposto (6% a 15,5%) |
| --- | --- | --- | --- | --- |
| Pequeno (60 veículos) | R$ 39 por veículo, mínimo R$ 990 | R$ 2.340 | ~R$ 3 | R$ 140 a 363 |
| Suzano Imperatriz (500) | Faixa progressiva (100 × 39 + 200 × 36 + 200 × 32) | R$ 17.500 | ~R$ 115 | R$ 1.050 a 2.713 |
| Suzano nacional (2.500) | Faixa progressiva até 1.000 + R$ 25 acima (contrato enterprise) | R$ 71.000 | ~R$ 1.500 | R$ 4.260 a 11.005 |

Mais a implantação única, a definir depois de medir as horas do piloto.

### Faixas por volume (hipótese)

Preço **progressivo**, como o imposto de renda: cada faixa cobra o próprio preço. Assim a receita nunca cai quando o cliente cresce (com a regra anterior, "ao passar de 300 todos caem para R$ 32", 301 veículos rendiam menos que 300).

| Veículos ativos (faixa) | Preço por veículo/mês nesta faixa |
| --- | --- |
| 1 a 100 | R$ 39 |
| 101 a 300 | R$ 36 |
| 301 a 1.000 | R$ 32 |
| acima de 1.000 | R$ 25 (enterprise) |

### Conta completa: Suzano como única cliente

Dois grupos de custo:

- **Custo para o sistema funcionar:** só existe porque o cliente usa o Truck (servidores, fotos, analytics, taxa de cobrança, imposto sobre a receita).
- **Custo para a empresa existir:** pago todo mês com ou sem cliente (pró-labore e salários de quem desenvolve, implanta, dá suporte e vende; contador; ferramentas; viagens).

**O que sobra do sistema** = receita − custo para o sistema funcionar. **Lucro** = o que sobra do sistema − custo para a empresa existir. O custo para a empresa existir abaixo é **exemplo**; trocar pelos valores reais.

| Custo para a empresa existir, por mês (cenário de garantia) | Max 5x próprio | Max 20x próprio |
| --- | --- | --- |
| Contador | R$ 270 | R$ 270 |
| Claude da arquiteta, sem dividir (US$ 100 / US$ 200\*) | ~R$ 585 | ~R$ 1.170 |
| Claude Pro do marido (US$ 20) | ~R$ 120 | ~R$ 120 |
| Domínio e extras | ~R$ 30 | ~R$ 30 |
| Pró-labore | R$ 0 por enquanto | R$ 0 por enquanto |
| **Total** | **~R$ 1.005** | **~R$ 1.590** |

Preços do Claude em [claude.com/pricing](https://claude.com/pricing) (26/09/2026): Pro US$ 20; Max a partir de US$ 100 (5x ou 20x o uso do Pro). \*US$ 200 para o Max 20x é **premissa**, porque a página não mostra o valor separado. Conversão: R$ 5,50 por dólar mais ~6% de IOF e spread. Equipe: a arquiteta e o marido, sem escritório fixo; a arquiteta mantém outra renda.

| | 50 veículos | 100 | 200 | 300 | 500 |
| --- | --- | --- | --- | --- | --- |
| Receita (faixa progressiva) | R$ 1.950 | R$ 3.900 | R$ 7.500 | R$ 11.100 | R$ 17.500 |
| − Infra | R$ 585 (enxuta) | R$ 585 (enxuta) | R$ 1.270 | R$ 1.270 | R$ 1.270 |
| − Variável (fotos, analytics, cobrança) | R$ 3 | R$ 3 | R$ 3 | R$ 4 | R$ 115 |
| − Imposto (6%, alíquota atual) | R$ 117 | R$ 234 | R$ 450 | R$ 666 | R$ 1.050 |
| **= O que sobra do sistema** | R$ 1.245 | R$ 3.078 | R$ 5.777 | R$ 9.160 | R$ 15.065 |
| **Lucro se o seu Claude for o Max 5x** (custo da empresa R$ 1.005) | +R$ 240 | +R$ 2.073 | +R$ 4.772 | +R$ 8.155 | +R$ 14.060 |
| **Lucro se o seu Claude for o Max 20x** (custo da empresa R$ 1.590; cenário de garantia, o mais caro) | **−R$ 345** | **+R$ 1.488** | **+R$ 4.187** | **+R$ 7.570** | **+R$ 13.475** |

**Alíquota atual: 6%** (primeira faixa do Simples, informada em 26/09/2026), além do INSS já pago. Os 6% valem enquanto o faturamento total do CNPJ nos últimos 12 meses ficar até R$ 180 mil; acima disso, a alíquota efetiva sobe aos poucos (ex.: ~8% com R$ 300 mil no Anexo III), porque a lei desconta uma parcela fixa. O contador projeta com o faturamento real.

Empate: ~45 veículos (Max 5x) e ~60 (Max 20x). A partir de 100 veículos, positivo em qualquer cenário; o pequeno negativo com 50 é coberto pela taxa de implantação. Com imposto acima de 6% (faixa maior ou Anexo V), usar a faixa da tabela de hipótese de preço.

**O preço não deve depender do pró-labore zero:** defina um pró-labore-alvo e confira que o preço o paga quando os clientes crescerem; senão o preço fica fixado baixo demais nos contratos.

### Para levar ao contador

1. **Anexo do Simples.** A empresa tem a atividade 6203-1/00 (licenciamento de programas não customizáveis), que é o enquadramento de SaaS. Licenciamento pode cair no Anexo III (6%) sem depender do Fator R; confirmar. A diferença para o Anexo V (15,5%) chega a ~R$ 1.600/mês com 500 veículos.
2. **Faixa somada.** A receita do Truck soma com a da outra atividade no mesmo CNPJ; a faixa do Simples usa o faturamento total dos últimos 12 meses.
3. **Responsabilidade.** A empresa é Empresário Individual: o patrimônio pessoal responde pelas dívidas. Com contratos de porte (SLA, multa, LGPD), avaliar Sociedade Limitada Unipessoal (SLU) ou LTDA com o marido como sócio.
4. **Pró-labore e Fator R.** Se o Anexo V se aplicar, um pró-labore que leve a folha a 28% da receita pode reduzir o imposto total.

### Infra enxuta para o início

| Item | US$/mês |
| --- | --- |
| Render Pro (workspace) | 25 |
| API: 1 instância de 1 CPU / 2 GB | 25 |
| Worker: 0,5 CPU / 512 MB | 7 |
| Redis 256 MB | 10 |
| Postgres 1 GB | 19 |
| Vercel Pro | 20 |
| Sentry e Resend nos planos gratuitos | 0 |
| **Total** | **~106 (≈ R$ 585)** |

Sem redundância da API: uma queda de instância derruba o sistema até reiniciar. Aceitável no piloto, não na abertura.

**O que falta para fechar o preço:** as horas de implantação e suporte medidas no piloto; o anexo do Simples com o contador; e o valor que a Suzano atribui ao que hoje paga em sistemas e planilhas separados. Esse é o teto real do preço, porque o Truck substitui essas ferramentas.

## Como esta página evolui

Cada módulo ou decisão de arquitetura diz o que muda no custo de servir (armazenamento, processamento, serviços de terceiros), e esta página é atualizada no mesmo ciclo. Preços de provedores e concorrentes sempre com fonte e data.
