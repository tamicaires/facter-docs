import type {ReactNode} from 'react';
import {
  AreaStack,
  c,
  card,
  Columns,
  COST_LEGEND,
  Grid,
  HBars,
  Histogram,
  Legend,
  LineWithGoal,
  MockTable,
  Pareto,
  ScatterQuadrant,
  Section,
  Spark,
  StatTile,
  StatusPill,
} from './primitives';

export interface ScreenProps {
  go: (pillarId: string, pageId: string) => void;
}

const MONTHS = ['Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul'];

// ════════════════════════════════════════════════════════
// Pilar 1 — Operacional
// ════════════════════════════════════════════════════════

function OverviewScreen({go}: ScreenProps): ReactNode {
  const alerts = [
    {label: 'Veículos parados +48h', value: 4, pillar: 'ativos', page: 'fleet'},
    {label: 'Preventivas vencidas', value: 8, pillar: 'prevencao', page: 'preventive'},
    {label: 'Peças com estoque zero', value: 12, pillar: 'financeiro', page: 'parts'},
    {label: 'Pneus com sulco baixo', value: 7, pillar: 'ativos', page: 'tires'},
  ];
  const pillarCards = [
    {pillar: 'operacional', page: 'work-orders', title: 'Operacional', signal: '147 OS', sub: 'MTTR 4h32 · -8%', spark: [52, 48, 55, 49, 44, 41], positive: true},
    {pillar: 'ativos', page: 'fleet', title: 'Ativos', signal: '87,3%', sub: 'disponibilidade · +2,1%', spark: [83, 84, 85, 84, 86, 87], positive: true},
    {pillar: 'financeiro', page: 'costs', title: 'Financeiro', signal: 'R$ 284k', sub: 'custo do mês · +7,2%', spark: [231, 245, 238, 252, 265, 284], positive: false},
    {pillar: 'pessoas', page: 'employees', title: 'Pessoas', signal: '78,3%', sub: 'eficiência média · +4,2%', spark: [71, 72, 74, 75, 77, 78], positive: true},
    {pillar: 'qualidade', page: 'checklists', title: 'Qualidade', signal: '94,2%', sub: 'conformidade · meta 90%', spark: [88, 90, 87, 91, 93, 94], positive: true},
    {pillar: 'prevencao', page: 'preventive', title: 'Prevenção', signal: '76,4%', sub: 'aderência · meta 90%', spark: [68, 71, 74, 72, 76, 78], positive: false},
  ];
  return (
    <>
      <Section layer={1} title="Pulso da operação">
        <Grid cols={4}>
          <StatTile label="Disponibilidade" value="87,3%" delta="+2,1%" positive spark={[83, 84, 85, 84, 86, 87]} />
          <StatTile label="OS abertas" value="23" delta="+12%" positive={false} spark={[16, 18, 17, 20, 21, 23]} />
          <StatTile label="Custo do período" value="R$ 284k" delta="+7,2%" positive={false} spark={[231, 245, 238, 252, 265, 284]} />
          <StatTile label="% Preventivas" value="42%" delta="+1,8%" positive meterValue={42} meterGoal={40} />
        </Grid>
      </Section>

      <Section layer={2} title="Atenção agora" hint="clique para ir ao pilar">
        <Grid cols={4}>
          {alerts.map((a) => (
            <button
              key={a.label}
              onClick={() => go(a.pillar, a.page)}
              style={{
                ...card,
                borderColor: a.value > 0 ? c.danger : c.cardBorder,
                background: a.value > 0 ? c.dangerBg : c.cardBg,
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'inherit',
              }}
            >
              <p style={{margin: 0, fontSize: '1.4rem', fontWeight: 800, color: c.danger}}>{a.value}</p>
              <p style={{margin: '0.15rem 0 0', fontSize: '0.68rem', color: c.text, fontWeight: 600}}>{a.label}</p>
              <p style={{margin: '0.25rem 0 0', fontSize: '0.64rem', color: c.muted}}>Ver pilar →</p>
            </button>
          ))}
        </Grid>
      </Section>

      <Section layer={3} title="Um cartão por pilar" hint="a sidebar diz onde ir; a capa diz por quê">
        <Grid cols={3}>
          {pillarCards.map((p) => (
            <button
              key={p.title}
              onClick={() => go(p.pillar, p.page)}
              style={{...card, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit'}}
            >
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <span style={{fontSize: '0.66rem', fontWeight: 700, color: c.muted, textTransform: 'uppercase', letterSpacing: '0.04em'}}>{p.title}</span>
                <Spark data={p.spark} color={p.positive ? c.success : c.warning} width={54} height={18} />
              </div>
              <p style={{margin: '0.3rem 0 0', fontSize: '1.15rem', fontWeight: 800, color: c.text}}>{p.signal}</p>
              <p style={{margin: '0.1rem 0 0', fontSize: '0.66rem', color: c.muted}}>{p.sub}</p>
              <p style={{margin: '0.4rem 0 0', fontSize: '0.66rem', fontWeight: 600, color: c.primary}}>Ver pilar →</p>
            </button>
          ))}
        </Grid>
      </Section>
    </>
  );
}

function WorkOrdersScreen(): ReactNode {
  return (
    <>
      <Section layer={1}>
        <Grid cols={5}>
          <StatTile label="Total OS" value="147" delta="+12%" positive={false} spark={[121, 128, 125, 133, 140, 147]} />
          <StatTile label="MTTR" value="4h32" delta="-8,2%" positive spark={[5.4, 5.2, 5.0, 4.9, 4.7, 4.5]} />
          <StatTile label="Tempo em fila" value="38h" delta="+15%" positive={false} spark={[28, 30, 31, 33, 36, 38]} />
          <StatTile label="First-time fix" value="82%" delta="+1,4%" positive meterValue={82} meterGoal={85} />
          <StatTile label="Retrabalho" value="6,1%" delta="-0,8%" positive spark={[7.8, 7.4, 7.1, 6.8, 6.4, 6.1]} />
        </Grid>
      </Section>

      <Section layer={2} title="Onde as OS empacam" hint="volume por etapa · tempo médio parado em cada uma">
        <div style={card}>
          <HBars
            items={[
              {label: 'Em fila', value: 32, display: '32 OS', sub: '18h médias'},
              {label: 'Aguardando peça', value: 14, display: '14 OS', sub: '41h médias — gargalo', emphasized: true},
              {label: 'Em manutenção', value: 26, display: '26 OS', sub: '12h médias'},
              {label: 'Pausada', value: 9, display: '9 OS', sub: '7h médias'},
              {label: 'Finalizada no período', value: 134, display: '134 OS', color: c.grayMark},
            ]}
          />
        </div>
      </Section>

      <Section layer={3}>
        <Grid cols={2}>
          <div style={card}>
            <p style={{margin: '0 0 0.5rem', fontSize: '0.74rem', fontWeight: 700, color: c.text}}>Volume por tipo · 6 meses</p>
            <Columns
              groups={MONTHS.map((m, i) => ({
                label: m,
                parts: [
                  {v: [38, 35, 40, 33, 31, 29][i], color: c.cat1},
                  {v: [18, 20, 22, 24, 26, 28][i], color: c.cat2},
                  {v: [8, 6, 9, 7, 5, 6][i], color: c.cat3},
                  {v: [4, 5, 4, 6, 5, 4][i], color: c.cat4},
                ],
              }))}
            />
            <Legend
              items={[
                {label: 'Corretiva', color: c.cat1},
                {label: 'Preventiva', color: c.cat2},
                {label: 'Socorro', color: c.cat3},
                {label: 'Inspeção', color: c.cat4},
              ]}
            />
          </div>
          <div style={card}>
            <p style={{margin: '0 0 0.5rem', fontSize: '0.74rem', fontWeight: 700, color: c.text}}>Pareto de pausas · % do tempo parado</p>
            <Pareto
              bars={[
                {label: 'Falta peça', pct: 38},
                {label: 'Aprovação', pct: 24},
                {label: 'Refeição', pct: 14},
                {label: 'Turno', pct: 9},
                {label: 'Outros', pct: 15},
              ]}
            />
            <p style={{margin: '0.4rem 0 0', fontSize: '0.66rem', color: c.muted}}>2 motivos causam 62% da parada</p>
          </div>
        </Grid>
      </Section>

      <Section layer={4} title="OS por frota">
        <div style={card}>
          <MockTable
            cols={['Frota', 'Total OS', 'Abertas', 'MTTR', 'Custo']}
            aligns={['left', 'right', 'right', 'right', 'right']}
            rows={[
              ['Frota 104', '31', '6', '5h10', 'R$ 68k'],
              ['Frota 087', '27', '4', '4h05', 'R$ 54k'],
              ['Frota 112', '22', '5', '6h22', 'R$ 49k'],
              ['Frota 093', '18', '3', '3h48', 'R$ 37k'],
            ]}
          />
        </div>
      </Section>
    </>
  );
}

function IndustrialKpisScreen(): ReactNode {
  const metrics: {label: string; value: string; data: number[]; goal?: number; min: number; max: number; unit: string}[] = [
    {label: 'MTBF', value: '18,5 dias', data: [15.2, 16.1, 16.8, 17.4, 18.0, 18.5], min: 12, max: 22, unit: 'd', goal: 20},
    {label: 'MTTR', value: '4h32', data: [5.4, 5.2, 5.0, 4.9, 4.7, 4.5], min: 3, max: 7, unit: 'h'},
    {label: 'Disponibilidade', value: '87,3%', data: [83, 84, 85, 84, 86, 87], min: 75, max: 100, unit: '%', goal: 90},
    {label: 'CPK', value: 'R$ 2,34', data: [2.6, 2.55, 2.5, 2.42, 2.38, 2.34], min: 2, max: 3, unit: ''},
    {label: 'CPH', value: 'R$ 41,20', data: [46, 45, 44, 43, 42, 41.2], min: 35, max: 50, unit: ''},
    {label: 'PMP', value: '42%', data: [31, 33, 36, 38, 40, 42], min: 20, max: 60, unit: '%', goal: 40},
    {label: 'Conformidade', value: '94,2%', data: [88, 90, 87, 91, 93, 94], min: 80, max: 100, unit: '%', goal: 90},
    {label: 'Eficiência', value: '78,3%', data: [71, 72, 74, 75, 77, 78], min: 60, max: 90, unit: '%', goal: 80},
  ];
  return (
    <>
      <Section layer={2} title="Scorecard industrial · 6 meses" hint="small multiples — cada métrica no seu próprio eixo, com banda de meta">
        <Grid cols={4}>
          {metrics.map((m) => (
            <div key={m.label} style={card}>
              <p style={{margin: 0, fontSize: '0.64rem', fontWeight: 600, color: c.muted, textTransform: 'uppercase', letterSpacing: '0.04em'}}>{m.label}</p>
              <p style={{margin: '0.15rem 0 0.3rem', fontSize: '1.05rem', fontWeight: 800, color: c.text}}>{m.value}</p>
              <LineWithGoal points={m.data.map((v) => Math.round(v * 10) / 10)} goal={m.goal} min={m.min} max={m.max} height={54} unit={m.unit} />
            </div>
          ))}
        </Grid>
      </Section>

      <Section layer={3} title="Contexto por área">
        <Grid cols={4}>
          <StatTile label="Estoque baixo" value="27" sub="peças abaixo do mínimo" />
          <StatTile label="Estoque zerado" value="12" alert />
          <StatTile label="CPK pneu" value="R$ 0,18" delta="-12%" positive />
          <StatTile label="Recapagem" value="34,2%" delta="+5,1%" positive />
        </Grid>
      </Section>
    </>
  );
}

// ════════════════════════════════════════════════════════
// Pilar 2 — Ativos
// ════════════════════════════════════════════════════════

function FleetScreen(): ReactNode {
  const scatter = [
    {x: 1.4, y: 96}, {x: 1.7, y: 93}, {x: 1.9, y: 95}, {x: 2.0, y: 91}, {x: 2.1, y: 88},
    {x: 2.2, y: 92}, {x: 2.3, y: 86}, {x: 2.4, y: 90}, {x: 2.5, y: 84}, {x: 2.6, y: 89},
    {x: 2.7, y: 82}, {x: 2.8, y: 87}, {x: 3.0, y: 85}, {x: 3.1, y: 80}, {x: 3.3, y: 83},
    {x: 3.5, y: 78}, {x: 3.7, y: 81}, {x: 4.1, y: 68, label: 'QRA-2F41', hot: true},
    {x: 4.4, y: 71, label: 'PSV-8B12', hot: true}, {x: 4.7, y: 63, label: 'RTX-1C09', hot: true},
    {x: 1.6, y: 89}, {x: 2.9, y: 93}, {x: 3.2, y: 88}, {x: 3.8, y: 86},
  ];
  return (
    <>
      <Section layer={1}>
        <Grid cols={4}>
          <StatTile label="Disponibilidade" value="87,3%" delta="+2,1%" positive meterValue={87} meterGoal={90} />
          <StatTile label="CPK médio" value="R$ 2,34" delta="-5,3%" positive spark={[2.6, 2.55, 2.5, 2.42, 2.38, 2.34]} />
          <StatTile label="Custo total" value="R$ 284k" delta="+7,2%" positive={false} spark={[231, 245, 238, 252, 265, 284]} />
          <StatTile label="Em manutenção" value="9" sub="de 84 veículos" />
        </Grid>
      </Section>

      <Section layer={2} title="Quadrante CPK × Disponibilidade" hint="cada ponto é um veículo — os vilões saltam aos olhos">
        <div style={card}>
          <ScatterQuadrant points={scatter} xLabel="CPK (R$/km)" yLabel="Disponibilidade %" />
        </div>
      </Section>

      <Section layer={3}>
        <Grid cols={2}>
          <div style={card}>
            <p style={{margin: '0 0 0.5rem', fontSize: '0.74rem', fontWeight: 700, color: c.text}}>Top 5 veículos por custo</p>
            <HBars
              items={[
                {label: 'RTX-1C09', value: 31, display: 'R$ 31k', emphasized: true},
                {label: 'QRA-2F41', value: 27, display: 'R$ 27k', emphasized: true},
                {label: 'PSV-8B12', value: 22, display: 'R$ 22k'},
                {label: 'LMN-4D77', value: 18, display: 'R$ 18k'},
                {label: 'KJB-9A03', value: 15, display: 'R$ 15k'},
              ]}
            />
          </div>
          <div style={card}>
            <p style={{margin: '0 0 0.5rem', fontSize: '0.74rem', fontWeight: 700, color: c.text}}>Comparação entre frotas</p>
            <MockTable
              cols={['Frota', 'Veículos', 'CPK', 'Disp.']}
              aligns={['left', 'right', 'right', 'right']}
              rows={[
                ['Frota 104', '22', 'R$ 2,10', <StatusPill tone="success">91%</StatusPill>],
                ['Frota 087', '18', 'R$ 2,25', <StatusPill tone="success">90%</StatusPill>],
                ['Frota 112', '25', 'R$ 2,61', <StatusPill tone="warning">84%</StatusPill>],
                ['Frota 093', '19', 'R$ 2,44', <StatusPill tone="danger">79%</StatusPill>],
              ]}
            />
          </div>
        </Grid>
      </Section>

      <Section layer={4} title="Ranking de veículos">
        <div style={card}>
          <MockTable
            cols={['Placa', 'Modelo', 'KM', 'Custo', 'CPK', 'Disp.']}
            aligns={['left', 'left', 'right', 'right', 'right', 'right']}
            rows={[
              ['RTX-1C09', 'FH 540', '12.480', 'R$ 31k', 'R$ 4,70', <StatusPill tone="danger">63%</StatusPill>],
              ['QRA-2F41', 'R 450', '14.220', 'R$ 27k', 'R$ 4,10', <StatusPill tone="danger">68%</StatusPill>],
              ['PSV-8B12', 'FH 460', '11.900', 'R$ 22k', 'R$ 4,40', <StatusPill tone="warning">71%</StatusPill>],
              ['LMN-4D77', 'Actros', '16.750', 'R$ 18k', 'R$ 2,30', <StatusPill tone="success">89%</StatusPill>],
            ]}
          />
        </div>
      </Section>
    </>
  );
}

function TiresScreen(): ReactNode {
  return (
    <>
      <Section layer={1} hint="foto atual do parque — sem recorte de período">
        <Grid cols={5}>
          <StatTile label="Pneus ativos" value="412" />
          <StatTile label="CPK pneu" value="R$ 0,18" delta="-12%" positive />
          <StatTile label="Sulco médio" value="8,4 mm" />
          <StatTile label="Recapagem" value="34,2%" delta="+5,1%" positive />
          <StatTile label="Sucata" value="6,8%" delta="-1,2%" positive />
        </Grid>
      </Section>

      <Section layer={2} title="Ciclo de vida do parque" hint="compra → uso → recapagem → sucata">
        <div style={card}>
          <div style={{display: 'flex', height: 34, borderRadius: 8, overflow: 'hidden', gap: 2}}>
            {[
              {label: 'Novos', v: 82, color: c.cat2, text: '#fff'},
              {label: 'Rodando', v: 264, color: c.cat1, text: '#fff'},
              {label: 'Em recapagem', v: 38, color: c.cat3, text: '#fff'},
              {label: 'Sucata', v: 28, color: c.grayMark, text: c.text},
            ].map((seg) => (
              <div
                key={seg.label}
                style={{
                  flex: seg.v,
                  background: seg.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: seg.text,
                  fontSize: '0.64rem',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                }}
              >
                {seg.v}
              </div>
            ))}
          </div>
          <Legend
            items={[
              {label: 'Novos (82)', color: c.cat2},
              {label: 'Rodando (264)', color: c.cat1},
              {label: 'Em recapagem (38)', color: c.cat3},
              {label: 'Sucata (28)', color: c.grayMark},
            ]}
          />
        </div>
      </Section>

      <Section layer={3}>
        <Grid cols={2}>
          <div style={card}>
            <p style={{margin: '0 0 0.5rem', fontSize: '0.74rem', fontWeight: 700, color: c.text}}>CPK por marca · melhor e pior em destaque</p>
            <HBars
              items={[
                {label: 'Marca A', value: 0.14, display: 'R$ 0,14', color: c.success},
                {label: 'Marca B', value: 0.16, display: 'R$ 0,16', color: c.grayMark},
                {label: 'Marca C', value: 0.18, display: 'R$ 0,18', color: c.grayMark},
                {label: 'Marca D', value: 0.21, display: 'R$ 0,21', color: c.grayMark},
                {label: 'Marca E', value: 0.27, display: 'R$ 0,27', color: c.danger},
              ]}
            />
          </div>
          <div style={card}>
            <p style={{margin: '0 0 0.5rem', fontSize: '0.74rem', fontWeight: 700, color: c.text}}>Eventos por mês</p>
            <Columns
              groups={MONTHS.map((m, i) => ({
                label: m,
                parts: [
                  {v: [12, 10, 14, 11, 9, 8][i], color: c.cat1},
                  {v: [6, 7, 5, 8, 7, 9][i], color: c.cat3},
                  {v: [3, 2, 4, 3, 2, 2][i], color: c.grayMark},
                ],
              }))}
            />
            <Legend
              items={[
                {label: 'Rodízio', color: c.cat1},
                {label: 'Recapagem', color: c.cat3},
                {label: 'Sucateamento', color: c.grayMark},
              ]}
            />
          </div>
        </Grid>
      </Section>

      <Section layer={4} title="ROI de recapagem — o ouro da tela">
        <div style={card}>
          <MockTable
            cols={['Marca', 'Qtd', 'Custo original', 'Custo recap', 'KM ganho', 'CPK/vida']}
            aligns={['left', 'right', 'right', 'right', 'right', 'right']}
            rows={[
              ['Marca A 295/80', '64', 'R$ 2.480', 'R$ 890', '48.200 km', 'R$ 0,12'],
              ['Marca B 295/80', '52', 'R$ 2.310', 'R$ 860', '41.700 km', 'R$ 0,14'],
              ['Marca C 275/80', '38', 'R$ 2.150', 'R$ 840', '35.100 km', 'R$ 0,17'],
            ]}
          />
        </div>
      </Section>
    </>
  );
}

// ════════════════════════════════════════════════════════
// Pilar 3 — Financeiro
// ════════════════════════════════════════════════════════

function CostsScreen(): ReactNode {
  return (
    <>
      <Section layer={1}>
        <Grid cols={5}>
          <StatTile label="Custo total" value="R$ 284k" delta="+7,2%" positive={false} spark={[231, 245, 238, 252, 265, 284]} />
          <StatTile label="Custo por OS" value="R$ 1.932" delta="-2,4%" positive />
          <StatTile label="CPK" value="R$ 2,34" delta="-5,3%" positive />
          <StatTile label="CPH" value="R$ 41,20" delta="-3,8%" positive />
          <StatTile label="Corretiva vs preventiva" value="3,2×" sub="custo por OS — o argumento da prevenção" highlight />
        </Grid>
      </Section>

      <Section layer={2} title="Evolução de custos por categoria">
        <div style={card}>
          <AreaStack
            series={[
              {color: c.cat1, data: [118, 126, 121, 130, 136, 142]},
              {color: c.cat2, data: [72, 76, 74, 79, 84, 89]},
              {color: c.cat3, data: [28, 30, 29, 30, 31, 33]},
              {color: c.cat4, data: [13, 13, 14, 13, 14, 20]},
            ]}
          />
          <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: c.muted, marginTop: 2}}>
            {MONTHS.map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>
          <Legend items={COST_LEGEND} />
        </div>
      </Section>

      <Section layer={3}>
        <Grid cols={2}>
          <div style={card}>
            <p style={{margin: '0 0 0.5rem', fontSize: '0.74rem', fontWeight: 700, color: c.text}}>Custo por frota · top 5 + outras</p>
            <HBars
              items={[
                {label: 'Frota 104', value: 68, display: 'R$ 68k'},
                {label: 'Frota 087', value: 54, display: 'R$ 54k'},
                {label: 'Frota 112', value: 49, display: 'R$ 49k'},
                {label: 'Frota 093', value: 37, display: 'R$ 37k'},
                {label: 'Frota 121', value: 31, display: 'R$ 31k'},
                {label: 'Outras (6)', value: 45, display: 'R$ 45k', color: c.grayMark},
              ]}
            />
          </div>
          <div style={card}>
            <p style={{margin: '0 0 0.5rem', fontSize: '0.74rem', fontWeight: 700, color: c.text}}>Preventiva vs corretiva</p>
            <Grid cols={2} gap="0.5rem">
              <div style={{...card, background: c.successBg, borderColor: 'transparent'}}>
                <p style={{margin: 0, fontSize: '0.64rem', fontWeight: 700, color: c.success, textTransform: 'uppercase'}}>Preventiva</p>
                <p style={{margin: '0.2rem 0 0', fontSize: '1.1rem', fontWeight: 800, color: c.text}}>R$ 61k</p>
                <p style={{margin: '0.1rem 0 0', fontSize: '0.66rem', color: c.muted}}>62 OS · R$ 984/OS</p>
              </div>
              <div style={{...card, background: c.dangerBg, borderColor: 'transparent'}}>
                <p style={{margin: 0, fontSize: '0.64rem', fontWeight: 700, color: c.danger, textTransform: 'uppercase'}}>Corretiva</p>
                <p style={{margin: '0.2rem 0 0', fontSize: '1.1rem', fontWeight: 800, color: c.text}}>R$ 198k</p>
                <p style={{margin: '0.1rem 0 0', fontSize: '0.66rem', color: c.muted}}>63 OS · R$ 3.142/OS</p>
              </div>
            </Grid>
            <p style={{margin: '0.5rem 0 0', fontSize: '0.68rem', color: c.muted}}>
              Cada OS corretiva custa <strong style={{color: c.danger}}>3,2×</strong> uma preventiva
            </p>
          </div>
        </Grid>
      </Section>

      <Section layer={4} title="Top OS mais caras" hint="com % do custo total — dá escala">
        <div style={card}>
          <MockTable
            cols={['OS', 'Veículo', 'Tipo', 'Custo', '% do total']}
            aligns={['left', 'left', 'left', 'right', 'right']}
            rows={[
              ['#4821', 'RTX-1C09', 'Corretiva', 'R$ 18,4k', '6,5%'],
              ['#4796', 'QRA-2F41', 'Corretiva', 'R$ 14,1k', '5,0%'],
              ['#4810', 'PSV-8B12', 'Socorro', 'R$ 11,8k', '4,2%'],
              ['#4788', 'LMN-4D77', 'Corretiva', 'R$ 9,3k', '3,3%'],
            ]}
          />
        </div>
      </Section>
    </>
  );
}

function PartsScreen(): ReactNode {
  return (
    <>
      <div style={{marginBottom: '0.5rem', fontSize: '0.78rem', fontWeight: 800, color: c.text}}>Seção A — Consumo do período</div>
      <Section layer={1}>
        <Grid cols={3}>
          <StatTile label="Requisições" value="342" delta="+9%" positive={false} />
          <StatTile label="Taxa de aprovação" value="91,4%" delta="+2,1%" positive />
          <StatTile label="Custo do período" value="R$ 142k" delta="+4,5%" positive={false} />
        </Grid>
      </Section>

      <Section layer={2} title="Classificação ABC · eixo único 0–100%" hint="barras = % do custo · linha = acumulado">
        <div style={card}>
          <Pareto
            bars={[
              {label: 'Pneu 295', pct: 14},
              {label: 'Rolam.', pct: 11},
              {label: 'Filtro ar', pct: 9},
              {label: 'Pastilha', pct: 8},
              {label: 'Óleo 15W', pct: 7},
              {label: 'Correia', pct: 6},
              {label: 'Amortec.', pct: 5},
              {label: 'Filtro ól.', pct: 4},
              {label: 'Lâmpada', pct: 3},
              {label: 'Outras', pct: 33},
            ]}
            boundaries={[80, 95]}
          />
          <p style={{margin: '0.4rem 0 0', fontSize: '0.66rem', color: c.muted}}>Classe A: 8 peças concentram 64% do custo</p>
        </div>
      </Section>

      <div style={{margin: '0.25rem 0 0.5rem', fontSize: '0.78rem', fontWeight: 800, color: c.text}}>Seção B — Saúde do estoque (hoje)</div>
      <Section layer={1}>
        <Grid cols={3}>
          <StatTile label="Estoque baixo" value="27" sub="abaixo do mínimo" />
          <StatTile label="Estoque zerado" value="12" alert />
          <StatTile label="Valor em estoque" value="R$ 486k" />
        </Grid>
      </Section>

      <Section layer={4} title="Alertas de estoque" hint="ordenado por cobertura — 'essa peça acaba em 4 dias'">
        <div style={card}>
          <MockTable
            cols={['Peça', 'Estoque', 'Consumo/período', 'Cobertura', 'Status']}
            aligns={['left', 'right', 'right', 'right', 'left']}
            rows={[
              ['Filtro de ar FH', '3', '22', '4 dias', <StatusPill tone="danger">Crítico</StatusPill>],
              ['Pastilha de freio', '8', '31', '8 dias', <StatusPill tone="danger">Crítico</StatusPill>],
              ['Correia dentada', '6', '14', '13 dias', <StatusPill tone="warning">Atenção</StatusPill>],
              ['Óleo 15W40 (L)', '120', '260', '14 dias', <StatusPill tone="warning">Atenção</StatusPill>],
              ['Rolamento roda', '11', '18', '18 dias', <StatusPill tone="success">OK</StatusPill>],
            ]}
          />
        </div>
      </Section>
    </>
  );
}

// ════════════════════════════════════════════════════════
// Pilar 4 — Pessoas
// ════════════════════════════════════════════════════════

function EmployeesScreen(): ReactNode {
  return (
    <>
      <Section layer={1} title="Capacidade antes de indivíduos">
        <Grid cols={4}>
          <StatTile label="Wrench time" value="61,2%" delta="+2,8%" positive spark={[55, 56, 58, 59, 60, 61]} />
          <StatTile label="Eficiência média" value="78,3%" delta="+4,2%" positive meterValue={78} meterGoal={80} />
          <StatTile label="Utilização" value="85,1%" delta="+1,8%" positive />
          <StatTile label="Técnicos ativos" value="14" />
        </Grid>
      </Section>

      <Section layer={2} title="Distribuição de eficiência da equipe" hint="a pergunta é: a curva está deslocando para a direita?">
        <div style={card}>
          <Histogram
            buckets={[
              {label: '0–20%', value: 0},
              {label: '20–40%', value: 1},
              {label: '40–60%', value: 3},
              {label: '60–80%', value: 6},
              {label: '80–100%', value: 4},
            ]}
          />
        </div>
      </Section>

      <Section layer={3}>
        <Grid cols={2}>
          <div style={card}>
            <p style={{margin: '0 0 0.5rem', fontSize: '0.74rem', fontWeight: 700, color: c.text}}>Pareto de pausas · onde a capacidade vaza</p>
            <Pareto
              bars={[
                {label: 'Falta peça', pct: 34},
                {label: 'Refeição', pct: 26},
                {label: 'Aprovação', pct: 18},
                {label: 'Turno', pct: 10},
                {label: 'Outros', pct: 12},
              ]}
            />
          </div>
          <div style={card}>
            <p style={{margin: '0 0 0.5rem', fontSize: '0.74rem', fontWeight: 700, color: c.text}}>Composição por cargo</p>
            <HBars
              items={[
                {label: 'Mecânico', value: 7, display: '7'},
                {label: 'Eletricista', value: 3, display: '3'},
                {label: 'Borracheiro', value: 2, display: '2'},
                {label: 'Soldador', value: 2, display: '2'},
              ]}
            />
          </div>
        </Grid>
      </Section>

      <Section layer={4} title="Equipe" hint="dados individuais por último — e sem pódio">
        <div style={card}>
          <MockTable
            cols={['Nome', 'Cargo', 'Turno', 'Serviços', 'Eficiência']}
            aligns={['left', 'left', 'left', 'right', 'right']}
            rows={[
              ['J. Almeida', 'Mecânico', 'Diurno', '42', <StatusPill tone="success">91%</StatusPill>],
              ['R. Souza', 'Eletricista', 'Diurno', '35', <StatusPill tone="success">86%</StatusPill>],
              ['M. Costa', 'Mecânico', 'Noturno', '38', <StatusPill tone="warning">72%</StatusPill>],
              ['P. Lima', 'Borracheiro', 'Diurno', '29', <StatusPill tone="warning">68%</StatusPill>],
            ]}
          />
        </div>
      </Section>
    </>
  );
}

// ════════════════════════════════════════════════════════
// Pilar 5 — Qualidade
// ════════════════════════════════════════════════════════

function ChecklistsScreen(): ReactNode {
  return (
    <>
      <Section layer={1}>
        <Grid cols={4}>
          <StatTile label="Conformidade" value="94,2%" delta="+1,5%" positive meterValue={94} meterGoal={90} />
          <StatTile label="Não conformidades" value="16" delta="-5" positive spark={[34, 28, 31, 22, 18, 16]} />
          <StatTile label="Recorrência" value="8,3%" delta="-1,2%" positive />
          <StatTile label="Tempo médio" value="12 min" />
        </Grid>
      </Section>

      <Section layer={2} title="Conformidade e não conformidades" hint="dois charts de eixo alinhado — nunca eixo duplo">
        <div style={card}>
          <p style={{margin: '0 0 0.25rem', fontSize: '0.66rem', color: c.muted}}>Conformidade % · meta 90%</p>
          <LineWithGoal points={[88, 90, 87, 91, 93, 94]} goal={90} min={80} max={100} height={70} />
          <p style={{margin: '0.5rem 0 0.25rem', fontSize: '0.66rem', color: c.muted}}>Não conformidades por mês</p>
          <Columns groups={MONTHS.map((m, i) => ({label: m, parts: [{v: [34, 28, 31, 22, 18, 16][i], color: c.cat3}]}))} height={54} />
        </div>
      </Section>

      <Section layer={3}>
        <Grid cols={2}>
          <div style={card}>
            <p style={{margin: '0 0 0.5rem', fontSize: '0.74rem', fontWeight: 700, color: c.text}}>Itens não conformes · reincidência destacada</p>
            <MockTable
              cols={['Item', 'Ocorrências', 'Recorrência']}
              aligns={['left', 'right', 'right']}
              rows={[
                ['Vazamento de ar', '9', <StatusPill tone="danger">44%</StatusPill>],
                ['Iluminação traseira', '7', <StatusPill tone="warning">28%</StatusPill>],
                ['Sulco de pneu', '5', <StatusPill tone="warning">20%</StatusPill>],
                ['Extintor vencido', '3', <StatusPill tone="success">0%</StatusPill>],
              ]}
            />
          </div>
          <div style={card}>
            <p style={{margin: '0 0 0.5rem', fontSize: '0.74rem', fontWeight: 700, color: c.text}}>Conformidade por frota</p>
            <HBars
              items={[
                {label: 'Frota 104', value: 97, display: '97%', color: c.success},
                {label: 'Frota 087', value: 95, display: '95%', color: c.success},
                {label: 'Frota 112', value: 88, display: '88%', color: c.warning},
                {label: 'Frota 093', value: 76, display: '76%', color: c.danger},
              ]}
              maxOverride={100}
            />
          </div>
        </Grid>
      </Section>
    </>
  );
}

function EmergencyScreen(): ReactNode {
  return (
    <>
      <Section layer={1}>
        <Grid cols={4}>
          <StatTile label="Total de socorros" value="14" delta="-2" positive spark={[22, 19, 18, 17, 16, 14]} />
          <StatTile label="Tempo de resposta" value="42 min" delta="-15%" positive />
          <StatTile label="Tempo de resolução" value="2h15" delta="-8%" positive />
          <StatTile label="SLA" value="88,5%" delta="+3,2%" positive meterValue={88} meterGoal={90} />
        </Grid>
      </Section>

      <Section layer={2} title="Distribuição do tempo de resposta" hint="a distribuição diz mais que a média — atenção à cauda">
        <div style={card}>
          <Histogram
            buckets={[
              {label: '<30min', value: 22},
              {label: '30–60min', value: 18},
              {label: '1–2h', value: 9},
              {label: '2–4h', value: 4, hot: true},
              {label: '>4h', value: 3, hot: true},
            ]}
          />
        </div>
      </Section>

      <Section layer={3}>
        <Grid cols={2}>
          <div style={card}>
            <p style={{margin: '0 0 0.5rem', fontSize: '0.74rem', fontWeight: 700, color: c.text}}>Tipos de problema</p>
            <HBars
              items={[
                {label: 'Pneu', value: 6, display: '6'},
                {label: 'Elétrico', value: 3, display: '3'},
                {label: 'Motor', value: 2, display: '2'},
                {label: 'Freio', value: 2, display: '2'},
                {label: 'Outros', value: 1, display: '1', color: c.grayMark},
              ]}
            />
          </div>
          <div style={card}>
            <p style={{margin: '0 0 0.5rem', fontSize: '0.74rem', fontWeight: 700, color: c.text}}>Volume por mês</p>
            <Columns
              groups={MONTHS.map((m, i) => ({
                label: m,
                parts: [
                  {v: [18, 16, 15, 14, 13, 11][i], color: c.cat2},
                  {v: [3, 2, 2, 2, 2, 2][i], color: c.grayMark},
                  {v: [1, 1, 1, 1, 1, 1][i], color: c.cat3},
                ],
              }))}
            />
            <Legend
              items={[
                {label: 'Resolvido', color: c.cat2},
                {label: 'Cancelado', color: c.grayMark},
                {label: 'Pendente', color: c.cat3},
              ]}
            />
          </div>
        </Grid>
      </Section>

      <Section layer={4} title="Frotas com mais socorros" hint="emphasis nas 3 piores">
        <div style={card}>
          <HBars
            items={[
              {label: 'Frota 112', value: 5, display: '5', emphasized: true},
              {label: 'Frota 093', value: 4, display: '4', emphasized: true},
              {label: 'Frota 104', value: 3, display: '3', emphasized: true},
              {label: 'Frota 087', value: 1, display: '1', color: c.grayMark},
              {label: 'Frota 121', value: 1, display: '1', color: c.grayMark},
            ]}
          />
        </div>
      </Section>
    </>
  );
}

// ════════════════════════════════════════════════════════
// Pilar 6 — Prevenção
// ════════════════════════════════════════════════════════

function PreventiveScreen(): ReactNode {
  return (
    <>
      <Section layer={1}>
        <Grid cols={4}>
          <StatTile label="Aderência" value="76,4%" delta="+5,8%" positive meterValue={76} meterGoal={90} />
          <StatTile label="PMP" value="42%" delta="+1,8%" positive meterValue={42} meterGoal={40} />
          <StatTile label="Planos vencidos" value="8" delta="-3" positive alert />
          <StatTile label="MTBF" value="18,5 dias" delta="+4,2%" positive />
        </Grid>
      </Section>

      <Section layer={2} title="Planos vencidos — a chamada para ação" hint="a única tabela do hub que sobe na hierarquia">
        <div style={{...card, borderColor: c.danger}}>
          <MockTable
            cols={['Plano', 'Ativo', 'Vencido há', 'Severidade']}
            aligns={['left', 'left', 'right', 'left']}
            rows={[
              ['Troca de óleo motor', 'RTX-1C09', '12 dias', <StatusPill tone="danger">Alta</StatusPill>],
              ['Revisão de freios', 'QRA-2F41', '9 dias', <StatusPill tone="danger">Alta</StatusPill>],
              ['Alinhamento', 'PSV-8B12', '6 dias', <StatusPill tone="warning">Média</StatusPill>],
              ['Insp. suspensão', 'LMN-4D77', '4 dias', <StatusPill tone="warning">Média</StatusPill>],
              ['Filtros de cabine', 'KJB-9A03', '2 dias', <StatusPill tone="success">Baixa</StatusPill>],
            ]}
          />
        </div>
      </Section>

      <Section layer={3}>
        <Grid cols={2}>
          <div style={card}>
            <p style={{margin: '0 0 0.25rem', fontSize: '0.74rem', fontWeight: 700, color: c.text}}>Aderência ao plano · meta 90%</p>
            <LineWithGoal points={[68, 71, 74, 72, 76, 78]} goal={90} min={60} max={100} height={80} />
          </div>
          <div style={card}>
            <p style={{margin: '0 0 0.25rem', fontSize: '0.74rem', fontWeight: 700, color: c.text}}>PMP · meta 40%</p>
            <LineWithGoal points={[31, 33, 36, 38, 40, 42]} goal={40} min={20} max={60} height={80} color={c.cat2} />
          </div>
        </Grid>
      </Section>

      <Section layer={4} title="Economia da prevenção" hint="conecta com o pilar Financeiro">
        <Grid cols={3}>
          <StatTile label="Custo médio preventiva" value="R$ 984" sub="por OS" />
          <StatTile label="Custo médio corretiva" value="R$ 3.142" sub="por OS" />
          <StatTile label="Razão P/C" value="3,2×" sub="cada preventiva em dia evita uma corretiva 3× mais cara" highlight />
        </Grid>
      </Section>
    </>
  );
}

// ── Registry ────────────────────────────────────────────
export const SCREENS: Record<string, (props: ScreenProps) => ReactNode> = {
  overview: OverviewScreen,
  'work-orders': WorkOrdersScreen,
  kpis: IndustrialKpisScreen,
  fleet: FleetScreen,
  tires: TiresScreen,
  costs: CostsScreen,
  parts: PartsScreen,
  employees: EmployeesScreen,
  checklists: ChecklistsScreen,
  emergency: EmergencyScreen,
  preventive: PreventiveScreen,
};
