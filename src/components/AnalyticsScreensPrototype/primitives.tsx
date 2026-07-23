import type {CSSProperties, ReactNode} from 'react';

// ── Palette ─────────────────────────────────────────────
export const c = {
  primary: 'hsl(233, 65%, 50%)',
  primaryBg: 'hsla(233, 65%, 50%, 0.08)',
  primaryBorder: 'hsla(233, 65%, 50%, 0.25)',
  primaryHover: 'hsla(233, 65%, 50%, 0.12)',
  cardBg: 'var(--ifm-background-color, #fff)',
  cardBorder: 'var(--ifm-color-emphasis-200, #e5e5e5)',
  muted: 'var(--ifm-color-emphasis-600, #888)',
  mutedBg: 'var(--ifm-color-emphasis-100, #f5f5f5)',
  grayMark: 'var(--ifm-color-emphasis-300, #d4d4d4)',
  text: 'var(--ifm-font-color-base, #1a1a1a)',
  success: 'hsl(142, 60%, 35%)',
  successBg: 'hsla(142, 60%, 35%, 0.1)',
  warning: 'hsl(35, 90%, 42%)',
  warningBg: 'hsla(35, 90%, 45%, 0.12)',
  danger: 'hsl(0, 70%, 48%)',
  dangerBg: 'hsla(0, 70%, 50%, 0.08)',
  // Categorical (ordem fixa, nunca ciclada)
  cat1: 'hsl(233, 60%, 55%)', // pecas / serie 1
  cat2: 'hsl(174, 50%, 36%)', // mao de obra / serie 2
  cat3: 'hsl(35, 85%, 50%)', // pneus / serie 3
  cat4: 'hsl(274, 35%, 55%)', // externo / serie 4
};

export const COST_LEGEND: {label: string; color: string}[] = [
  {label: 'Peças', color: c.cat1},
  {label: 'Mão de obra', color: c.cat2},
  {label: 'Pneus', color: c.cat3},
  {label: 'Externo', color: c.cat4},
];

// ── Shared style fragments ──────────────────────────────
export const card: CSSProperties = {
  padding: '0.85rem 1rem',
  borderRadius: '0.75rem',
  border: `1px solid ${c.cardBorder}`,
  background: c.cardBg,
};

const LAYER_LABELS = ['Veredito', 'História central', 'Diagnóstico', 'Ação'];

export function LayerBadge({n}: {n: 1 | 2 | 3 | 4}): ReactNode {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontSize: '0.6rem',
        fontWeight: 700,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: n === 2 ? c.primary : c.muted,
        background: n === 2 ? c.primaryBg : c.mutedBg,
        borderRadius: 999,
        padding: '0.15rem 0.5rem',
        whiteSpace: 'nowrap',
      }}
    >
      {n} · {LAYER_LABELS[n - 1]}
    </span>
  );
}

export function Section({
  layer,
  title,
  hint,
  children,
}: {
  layer?: 1 | 2 | 3 | 4;
  title?: string;
  hint?: string;
  children: ReactNode;
}): ReactNode {
  return (
    <div style={{marginBottom: '1.25rem'}}>
      {(layer || title) && (
        <div style={{display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap'}}>
          {layer && <LayerBadge n={layer} />}
          {title && <span style={{fontSize: '0.82rem', fontWeight: 700, color: c.text}}>{title}</span>}
          {hint && <span style={{fontSize: '0.7rem', color: c.muted, marginLeft: 'auto'}}>{hint}</span>}
        </div>
      )}
      {children}
    </div>
  );
}

export function Grid({cols, children, gap = '0.75rem'}: {cols: number; children: ReactNode; gap?: string}): ReactNode {
  return (
    <div style={{display: 'grid', gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap}}>{children}</div>
  );
}

// ── Sparkline ───────────────────────────────────────────
export function Spark({data, color = c.primary, width = 68, height = 22}: {data: number[]; color?: string; width?: number; height?: number}): ReactNode {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * width},${height - 2 - ((v - min) / span) * (height - 4)}`)
    .join(' ');
  return (
    <svg width={width} height={height} style={{display: 'block', overflow: 'visible'}}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Meter (valor vs meta) ───────────────────────────────
export function Meter({value, goal, max = 100}: {value: number; goal: number; max?: number}): ReactNode {
  const ok = value >= goal;
  return (
    <div style={{marginTop: '0.4rem'}}>
      <div style={{position: 'relative', height: 6, borderRadius: 999, background: c.mutedBg, overflow: 'visible'}}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            width: `${Math.min(100, (value / max) * 100)}%`,
            borderRadius: 999,
            background: ok ? c.success : c.warning,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: `${(goal / max) * 100}%`,
            top: -2,
            bottom: -2,
            width: 2,
            background: c.text,
            opacity: 0.5,
            borderRadius: 1,
          }}
        />
      </div>
      <div style={{fontSize: '0.62rem', color: c.muted, marginTop: 2}}>meta {goal}%</div>
    </div>
  );
}

// ── Stat tile (BigNumberCard) ───────────────────────────
export function StatTile({
  label,
  value,
  delta,
  positive,
  spark,
  meterGoal,
  meterValue,
  alert,
  highlight,
  sub,
}: {
  label: string;
  value: string;
  delta?: string;
  positive?: boolean;
  spark?: number[];
  meterGoal?: number;
  meterValue?: number;
  alert?: boolean;
  highlight?: boolean;
  sub?: string;
}): ReactNode {
  return (
    <div
      style={{
        ...card,
        ...(alert ? {borderColor: c.danger, background: c.dangerBg} : {}),
        ...(highlight ? {borderColor: c.primaryBorder, background: c.primaryBg} : {}),
      }}
    >
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6}}>
        <div style={{minWidth: 0}}>
          <p style={{margin: 0, fontSize: '0.66rem', fontWeight: 600, color: c.muted, textTransform: 'uppercase', letterSpacing: '0.04em'}}>
            {label}
          </p>
          <p style={{margin: '0.2rem 0 0', fontSize: '1.3rem', fontWeight: 800, color: alert ? c.danger : c.text, lineHeight: 1.1}}>
            {value}
          </p>
          {delta && (
            <p style={{margin: '0.15rem 0 0', fontSize: '0.68rem', fontWeight: 600, color: positive ? c.success : c.danger}}>
              {delta} <span style={{color: c.muted, fontWeight: 400}}>vs anterior</span>
            </p>
          )}
          {sub && <p style={{margin: '0.15rem 0 0', fontSize: '0.66rem', color: c.muted}}>{sub}</p>}
        </div>
        {spark && (
          <div style={{flexShrink: 0, paddingTop: 4}}>
            <Spark data={spark} color={positive === false ? c.danger : c.primary} />
          </div>
        )}
      </div>
      {meterGoal !== undefined && meterValue !== undefined && <Meter value={meterValue} goal={meterGoal} />}
    </div>
  );
}

// ── Barras horizontais ──────────────────────────────────
export interface HBarItem {
  label: string;
  value: number;
  display?: string;
  sub?: string;
  color?: string;
  emphasized?: boolean;
}

export function HBars({items, maxOverride}: {items: HBarItem[]; maxOverride?: number}): ReactNode {
  const max = maxOverride ?? Math.max(...items.map((i) => i.value));
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '0.45rem'}}>
      {items.map((it) => (
        <div key={it.label}>
          <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: 2}}>
            <span style={{color: c.text, fontWeight: it.emphasized ? 700 : 500}}>{it.label}</span>
            <span style={{color: c.muted}}>
              {it.display ?? it.value}
              {it.sub && <span style={{marginLeft: 6, color: it.emphasized ? c.danger : c.muted, fontWeight: it.emphasized ? 700 : 400}}>{it.sub}</span>}
            </span>
          </div>
          <div style={{height: 8, borderRadius: 4, background: c.mutedBg}}>
            <div
              style={{
                height: '100%',
                width: `${(it.value / max) * 100}%`,
                borderRadius: 4,
                background: it.color ?? (it.emphasized ? c.danger : c.primary),
                opacity: it.emphasized ? 1 : it.color ? 1 : 0.75,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Colunas empilhadas (div-based) ──────────────────────
export interface StackedColumn {
  label: string;
  parts: {v: number; color: string}[];
}

export function Columns({groups, height = 110}: {groups: StackedColumn[]; height?: number}): ReactNode {
  const max = Math.max(...groups.map((g) => g.parts.reduce((a, p) => a + p.v, 0)));
  return (
    <div style={{display: 'flex', alignItems: 'flex-end', gap: 10, height: height + 18}}>
      {groups.map((g) => {
        const total = g.parts.reduce((a, p) => a + p.v, 0);
        return (
          <div key={g.label} style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch', height: '100%'}}>
            <div style={{flex: 1, display: 'flex', flexDirection: 'column-reverse', gap: 2, justifyContent: 'flex-start'}}>
              {g.parts.map((p, i) => (
                <div
                  key={i}
                  style={{
                    height: `${(p.v / max) * 100}%`,
                    minHeight: p.v > 0 ? 2 : 0,
                    background: p.color,
                    borderRadius: i === g.parts.length - 1 ? '3px 3px 0 0' : 0,
                  }}
                  title={`${p.v}`}
                />
              ))}
              <div style={{height: `${(1 - total / max) * 100}%`}} />
            </div>
            <div style={{fontSize: '0.6rem', color: c.muted, textAlign: 'center', marginTop: 4, whiteSpace: 'nowrap'}}>{g.label}</div>
          </div>
        );
      })}
    </div>
  );
}

export function Legend({items}: {items: {label: string; color: string}[]}): ReactNode {
  return (
    <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.5rem'}}>
      {items.map((it) => (
        <span key={it.label} style={{display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.66rem', color: c.muted}}>
          <span style={{width: 8, height: 8, borderRadius: 2, background: it.color, display: 'inline-block'}} />
          {it.label}
        </span>
      ))}
    </div>
  );
}

// ── Linha com banda de meta ─────────────────────────────
// Formas em SVG esticado (vectorEffect preserva espessuras); rótulos em HTML
// sobreposto para não distorcer o texto.
export function LineWithGoal({
  points,
  goal,
  min,
  max,
  height = 90,
  color = c.primary,
  unit = '%',
}: {
  points: number[];
  goal?: number;
  min: number;
  max: number;
  height?: number;
  color?: string;
  unit?: string;
}): ReactNode {
  const span = max - min || 1;
  const yPct = (v: number) => 92 - ((v - min) / span) * 84; // 8% de folga em cima/embaixo
  const pts = points.map((v, i) => `${(i / (points.length - 1)) * 100},${yPct(v)}`).join(' ');
  const last = points[points.length - 1];
  return (
    <div style={{position: 'relative', height, overflow: 'visible'}}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block'}}>
        {goal !== undefined && (
          <>
            <rect x={0} y={0} width={100} height={yPct(goal)} fill={c.success} opacity={0.06} />
            <line x1={0} x2={100} y1={yPct(goal)} y2={yPct(goal)} stroke={c.success} strokeWidth={1} strokeDasharray="4 3" vectorEffect="non-scaling-stroke" />
          </>
        )}
        <polyline points={pts} fill="none" stroke={color} strokeWidth={2} vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span
        style={{
          position: 'absolute',
          right: 0,
          top: `${yPct(last)}%`,
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: color,
          transform: 'translate(50%, -50%)',
        }}
      />
      <span
        style={{
          position: 'absolute',
          right: 0,
          top: `calc(${yPct(last)}% - 16px)`,
          fontSize: '0.62rem',
          fontWeight: 700,
          color,
          whiteSpace: 'nowrap',
        }}
      >
        {last}
        {unit}
      </span>
      {goal !== undefined && (
        <span
          style={{
            position: 'absolute',
            left: 2,
            top: `calc(${yPct(goal)}% + 1px)`,
            fontSize: '0.58rem',
            fontWeight: 600,
            color: c.success,
            whiteSpace: 'nowrap',
          }}
        >
          meta {goal}
          {unit}
        </span>
      )}
    </div>
  );
}

// ── Área empilhada ──────────────────────────────────────
export function AreaStack({series, height = 130}: {series: {color: string; data: number[]}[]; height?: number}): ReactNode {
  const W = 100;
  const n = series[0].data.length;
  const totals = Array.from({length: n}, (_, i) => series.reduce((a, s) => a + s.data[i], 0));
  const max = Math.max(...totals);
  const y = (v: number) => height - 4 - (v / max) * (height - 10);
  const x = (i: number) => (i / (n - 1)) * W;
  // camadas acumuladas de baixo para cima
  const cumLayers: number[][] = [];
  let running = Array(n).fill(0);
  for (const s of series) {
    running = running.map((v, i) => v + s.data[i]);
    cumLayers.push([...running]);
  }
  return (
    <svg viewBox={`0 0 ${W} ${height}`} width="100%" height={height} preserveAspectRatio="none" style={{display: 'block'}}>
      {series.map((s, si) => {
        const top = cumLayers[si];
        const bottom = si === 0 ? Array(n).fill(0) : cumLayers[si - 1];
        const path =
          top.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(v)}`).join(' ') +
          ' ' +
          [...bottom]
            .reverse()
            .map((v, i) => `L${x(n - 1 - i)},${y(v)}`)
            .join(' ') +
          ' Z';
        return <path key={si} d={path} fill={s.color} opacity={0.8} stroke={c.cardBg} strokeWidth={1} vectorEffect="non-scaling-stroke" />;
      })}
    </svg>
  );
}

// ── Scatter com quadrantes (HTML puro — sem distorção) ──
export function ScatterQuadrant({
  points,
  xLabel,
  yLabel,
  height = 200,
}: {
  points: {x: number; y: number; label?: string; hot?: boolean}[];
  xLabel: string;
  yLabel: string;
  height?: number;
}): ReactNode {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const xMin = Math.min(...xs), xMax = Math.max(...xs);
  const yMin = Math.min(...ys), yMax = Math.max(...ys);
  const pxPct = (v: number) => 4 + ((v - xMin) / (xMax - xMin || 1)) * 92;
  const pyPct = (v: number) => 92 - ((v - yMin) / (yMax - yMin || 1)) * 84;
  const midX = pxPct((xMin + xMax) / 2);
  const midY = pyPct((yMin + yMax) / 2);
  return (
    <div>
      <div style={{fontSize: '0.6rem', color: c.muted, marginBottom: 2}}>↑ {yLabel}</div>
      <div style={{position: 'relative', height, borderLeft: `1px solid ${c.cardBorder}`, borderBottom: `1px solid ${c.cardBorder}`}}>
        {/* quadrante crítico: custo alto + disponibilidade baixa */}
        <div style={{position: 'absolute', left: `${midX}%`, top: `${midY}%`, right: 0, bottom: 0, background: c.dangerBg}} />
        <div style={{position: 'absolute', left: `${midX}%`, top: 0, bottom: 0, width: 1, background: c.grayMark}} />
        <div style={{position: 'absolute', left: 0, right: 0, top: `${midY}%`, height: 1, background: c.grayMark}} />
        <span style={{position: 'absolute', right: 6, bottom: 4, fontSize: '0.6rem', fontWeight: 700, color: c.danger}}>
          caro e indisponível
        </span>
        {points.map((p, i) => (
          <span key={i}>
            <span
              style={{
                position: 'absolute',
                left: `${pxPct(p.x)}%`,
                top: `${pyPct(p.y)}%`,
                width: p.hot ? 9 : 6,
                height: p.hot ? 9 : 6,
                borderRadius: '50%',
                background: p.hot ? c.danger : c.grayMark,
                border: `1px solid ${c.cardBg}`,
                transform: 'translate(-50%, -50%)',
              }}
            />
            {p.hot && p.label && (
              <span
                style={{
                  position: 'absolute',
                  left: `${pxPct(p.x)}%`,
                  top: `calc(${pyPct(p.y)}% - 16px)`,
                  transform: 'translateX(-50%)',
                  fontSize: '0.6rem',
                  fontWeight: 700,
                  color: c.danger,
                  whiteSpace: 'nowrap',
                }}
              >
                {p.label}
              </span>
            )}
          </span>
        ))}
      </div>
      <div style={{fontSize: '0.6rem', color: c.muted, textAlign: 'right', marginTop: 2}}>{xLabel} →</div>
    </div>
  );
}

// ── Pareto (eixo único 0–100%) ──────────────────────────
// Barras em HTML; linha cumulativa em SVG sobreposto; rótulos em HTML.
export function Pareto({bars, height = 120, boundaries = [80, 95]}: {bars: {label: string; pct: number}[]; height?: number; boundaries?: number[]}): ReactNode {
  const n = bars.length;
  const barMax = Math.max(...bars.map((b) => b.pct));
  let running = 0;
  const cumPts = bars
    .map((b, i) => {
      running += b.pct;
      return `${((i + 0.5) / n) * 100},${100 - running}`;
    })
    .join(' ');
  return (
    <div>
      <div style={{position: 'relative', height}}>
        {boundaries.map((b) => (
          <div key={b} style={{position: 'absolute', left: 0, right: 0, top: `${100 - b}%`}}>
            <div style={{borderTop: `1px dashed ${c.grayMark}`}} />
            <span style={{position: 'absolute', right: 0, top: 1, fontSize: '0.56rem', color: c.muted}}>{b}%</span>
          </div>
        ))}
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', gap: 3}}>
          {bars.map((b) => (
            <div
              key={b.label}
              style={{
                flex: 1,
                height: `${(b.pct / barMax) * 55}%`,
                minHeight: 2,
                borderRadius: '3px 3px 0 0',
                background: c.primary,
                opacity: 0.7,
              }}
            />
          ))}
        </div>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none'}}>
          <polyline points={cumPts} fill="none" stroke={c.cat3} strokeWidth={2} vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
      </div>
      <div style={{display: 'flex', gap: 3, marginTop: 4}}>
        {bars.map((b) => (
          <div key={b.label} style={{flex: 1, fontSize: '0.56rem', color: c.muted, textAlign: 'center', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'}}>
            {b.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Histograma ──────────────────────────────────────────
export function Histogram({buckets, height = 110}: {buckets: {label: string; value: number; hot?: boolean}[]; height?: number}): ReactNode {
  const max = Math.max(...buckets.map((b) => b.value));
  return (
    <div style={{display: 'flex', alignItems: 'flex-end', gap: 6, height: height + 20}}>
      {buckets.map((b) => (
        <div key={b.label} style={{flex: 1, display: 'flex', flexDirection: 'column', height: '100%'}}>
          <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'}}>
            <div style={{fontSize: '0.62rem', color: b.hot ? c.danger : c.muted, textAlign: 'center', fontWeight: 600, marginBottom: 2}}>{b.value}</div>
            <div
              style={{
                height: `${(b.value / max) * 100}%`,
                minHeight: 3,
                borderRadius: '3px 3px 0 0',
                background: b.hot ? c.danger : c.primary,
                opacity: b.hot ? 0.9 : 0.7,
              }}
            />
          </div>
          <div style={{fontSize: '0.6rem', color: c.muted, textAlign: 'center', marginTop: 4, whiteSpace: 'nowrap'}}>{b.label}</div>
        </div>
      ))}
    </div>
  );
}

// ── Tabela ──────────────────────────────────────────────
export function MockTable({cols, rows, aligns}: {cols: string[]; rows: ReactNode[][]; aligns?: ('left' | 'right' | 'center')[]}): ReactNode {
  return (
    <div style={{overflowX: 'auto'}}>
      <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '0.72rem'}}>
        <thead>
          <tr>
            {cols.map((col, i) => (
              <th
                key={col}
                style={{
                  textAlign: aligns?.[i] ?? 'left',
                  padding: '0.4rem 0.6rem',
                  color: c.muted,
                  fontWeight: 600,
                  fontSize: '0.64rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  borderBottom: `1px solid ${c.cardBorder}`,
                  whiteSpace: 'nowrap',
                }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  style={{
                    textAlign: aligns?.[ci] ?? 'left',
                    padding: '0.4rem 0.6rem',
                    borderBottom: `1px solid ${c.cardBorder}`,
                    color: c.text,
                    whiteSpace: 'nowrap',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function StatusPill({tone, children}: {tone: 'success' | 'warning' | 'danger'; children: ReactNode}): ReactNode {
  const map = {
    success: {color: c.success, bg: c.successBg},
    warning: {color: c.warning, bg: c.warningBg},
    danger: {color: c.danger, bg: c.dangerBg},
  } as const;
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '0.1rem 0.5rem',
        borderRadius: 999,
        fontSize: '0.64rem',
        fontWeight: 700,
        color: map[tone].color,
        background: map[tone].bg,
      }}
    >
      {children}
    </span>
  );
}
