import {useState, type CSSProperties, type ReactNode} from 'react';

// ── Types ──────────────────────────────────────────────
interface Asset {
  id: string;
  plate: string;
  fleet: string;
  directCost: number; // pecas diretas + MO do ativo no periodo
  woCount: number; // OS que tocaram o ativo
  km: number; // km rodado no periodo
}

type StrategyKey = 'atual' | 'directCost' | 'woCount' | 'equal';

// ── Cenario ────────────────────────────────────────────
// Pool de materiais compartilhados consumidos na oficina no mes.
const SHARED_ITEMS = [
  {name: 'Graxa (balde 5kg)', cost: 600},
  {name: 'Disco de corte', cost: 300},
  {name: 'Arame MIG', cost: 200},
];
const SHARED_POOL = SHARED_ITEMS.reduce((acc, i) => acc + i.cost, 0); // 1100

// No fluxo atual, todo o pool cai na OS onde a graxa foi solicitada — o Veiculo A.
const DUMP_ASSET_ID = 'A';

const ASSETS: Asset[] = [
  {id: 'A', plate: 'PN-0007', fleet: 'Frota 01', directCost: 800, woCount: 2, km: 3000},
  {id: 'B', plate: 'PN-0012', fleet: 'Frota 01', directCost: 1600, woCount: 3, km: 8000},
  {id: 'C', plate: 'PN-0021', fleet: 'Frota 02', directCost: 400, woCount: 1, km: 1500},
  {id: 'D', plate: 'PN-0033', fleet: 'Frota 02', directCost: 1200, woCount: 2, km: 6000},
];

// ── Estrategias de rateio ──────────────────────────────
const STRATEGIES: Record<StrategyKey, {title: string; desc: string}> = {
  atual: {
    title: 'Hoje — 100% numa unica frota',
    desc: 'Todo o custo dos materiais compartilhados (R$ 1.100) e apropriado ao ativo da OS onde a graxa foi solicitada. O Veiculo A absorve sozinho o consumo que serviu a oficina inteira.',
  },
  directCost: {
    title: 'Rateio por custo direto de manutencao',
    desc: 'O pool e distribuido proporcionalmente ao custo direto (pecas + MO) de cada ativo no periodo. Quem gerou mais manutencao absorve mais consumivel. Base recomendada.',
  },
  woCount: {
    title: 'Rateio por numero de OS',
    desc: 'O pool e distribuido pelo numero de ordens de servico que tocaram cada ativo. Simples e sempre disponivel, mas ignora o porte de cada reparo.',
  },
  equal: {
    title: 'Rateio igualitario',
    desc: 'O pool e dividido em partes iguais entre os ativos ativos no periodo. Mais simples de explicar, porem desconsidera o esforco real de cada ativo.',
  },
};

// ── Calculo da parcela compartilhada por ativo ─────────
function sharePerAsset(asset: Asset, strategy: StrategyKey): number {
  if (strategy === 'atual') {
    return asset.id === DUMP_ASSET_ID ? SHARED_POOL : 0;
  }
  if (strategy === 'equal') {
    return SHARED_POOL / ASSETS.length;
  }
  const totalBase = ASSETS.reduce(
    (acc, a) => acc + (strategy === 'directCost' ? a.directCost : a.woCount),
    0,
  );
  const base = strategy === 'directCost' ? asset.directCost : asset.woCount;
  return (SHARED_POOL * base) / totalBase;
}

// ── Formatacao ─────────────────────────────────────────
function brl(v: number): string {
  return v.toLocaleString('pt-BR', {minimumFractionDigits: 0, maximumFractionDigits: 0});
}
function cpk(total: number, km: number): string {
  return (total / km).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
}

// ── Styles ─────────────────────────────────────────────
const s: Record<string, CSSProperties> = {
  container: {display: 'flex', flexDirection: 'column', gap: 20},
  tabs: {display: 'flex', gap: 8, borderBottom: '2px solid var(--ifm-color-emphasis-200)', flexWrap: 'wrap'},
  tab: {padding: '10px 16px', cursor: 'pointer', border: 'none', background: 'none', fontSize: 13, fontWeight: 500, color: 'var(--ifm-color-emphasis-600)', borderBottom: '2px solid transparent', marginBottom: -2, transition: 'all 0.2s'},
  tabActive: {color: 'var(--ifm-color-primary)', borderBottom: '2px solid var(--ifm-color-primary)', fontWeight: 600},
  desc: {padding: '14px 18px', fontSize: 13, color: 'var(--ifm-color-emphasis-700)', lineHeight: 1.6, background: 'var(--ifm-color-emphasis-100)', borderRadius: 8},
  poolBox: {display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', fontSize: 12, color: 'var(--ifm-color-emphasis-600)'},
  poolChip: {display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 8, background: 'var(--ifm-color-emphasis-100)', border: '1px solid var(--ifm-color-emphasis-200)'},
  card: {border: '1px solid var(--ifm-color-emphasis-200)', borderRadius: 12, overflow: 'hidden', background: 'var(--ifm-background-surface-color)'},
  table: {width: '100%', borderCollapse: 'collapse' as const, fontSize: 13},
  th: {textAlign: 'left' as const, padding: '10px 14px', fontWeight: 600, fontSize: 11, color: 'var(--ifm-color-emphasis-600)', borderBottom: '1px solid var(--ifm-color-emphasis-200)', textTransform: 'uppercase' as const, letterSpacing: 0.5},
  thR: {textAlign: 'right' as const},
  td: {padding: '12px 14px', borderBottom: '1px solid var(--ifm-color-emphasis-100)', verticalAlign: 'middle' as const},
  tdR: {textAlign: 'right' as const, fontVariantNumeric: 'tabular-nums'},
  plate: {fontWeight: 600, fontSize: 13},
  fleet: {fontSize: 11, color: 'var(--ifm-color-emphasis-500)'},
  foot: {padding: '12px 14px', fontWeight: 700, fontSize: 13, background: 'var(--ifm-color-emphasis-100)'},
  hint: {fontSize: 12, color: 'var(--ifm-color-emphasis-500)', textAlign: 'center' as const, fontStyle: 'italic'},
};

function Bar({value, max, color}: {value: number; max: number; color: string}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{height: 6, background: 'var(--ifm-color-emphasis-200)', borderRadius: 4, overflow: 'hidden', minWidth: 60}}>
      <div style={{height: '100%', width: `${pct}%`, background: color, transition: 'width 0.4s'}} />
    </div>
  );
}

// ── Main Component ─────────────────────────────────────
export function SharedMaterialAllocationMockup(): ReactNode {
  const [strategy, setStrategy] = useState<StrategyKey>('atual');
  const strategies: StrategyKey[] = ['atual', 'directCost', 'woCount', 'equal'];

  const rows = ASSETS.map((a) => {
    const share = sharePerAsset(a, strategy);
    const total = a.directCost + share;
    return {...a, share, total};
  });
  const maxTotal = Math.max(...rows.map((r) => r.total));
  const totalShare = rows.reduce((acc, r) => acc + r.share, 0);
  const totalDirect = rows.reduce((acc, r) => acc + r.directCost, 0);

  // Distorcao do ativo A: quanto ele aparece acima do que apareceria com rateio justo (por custo direto)
  const fairA = ASSETS[0].directCost + sharePerAsset(ASSETS[0], 'directCost');
  const shownA = rows[0].total;
  const distortion = Math.round(((shownA - fairA) / fairA) * 100);

  return (
    <div style={s.container}>
      {/* Cenario */}
      <div style={s.poolBox}>
        <strong style={{color: 'var(--ifm-color-emphasis-800)'}}>Materiais compartilhados no mes:</strong>
        {SHARED_ITEMS.map((i) => (
          <span key={i.name} style={s.poolChip}>{i.name} <strong>R$ {brl(i.cost)}</strong></span>
        ))}
        <span style={s.poolChip}>Pool total <strong>R$ {brl(SHARED_POOL)}</strong></span>
      </div>

      {/* Tabs */}
      <div style={s.tabs}>
        {strategies.map((k) => (
          <button
            key={k}
            onClick={() => setStrategy(k)}
            style={{...s.tab, ...(strategy === k ? s.tabActive : {})}}
          >
            {k === 'atual' ? 'Hoje' : k === 'directCost' ? 'Por custo direto' : k === 'woCount' ? 'Por nº de OS' : 'Igualitario'}
          </button>
        ))}
      </div>

      {/* Descricao */}
      <div style={s.desc}>
        <strong>{STRATEGIES[strategy].title}</strong>
        <br />
        {STRATEGIES[strategy].desc}
      </div>

      {/* Tabela */}
      <div style={s.card}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Ativo</th>
              <th style={{...s.th, ...s.thR}}>Custo direto</th>
              <th style={{...s.th, ...s.thR}}>Parcela compartilhada</th>
              <th style={{...s.th, ...s.thR}}>Total apropriado</th>
              <th style={{...s.th, ...s.thR}}>CPK</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const isDump = strategy === 'atual' && r.id === DUMP_ASSET_ID;
              return (
                <tr key={r.id}>
                  <td style={s.td}>
                    <div style={s.plate}>{r.plate}</div>
                    <div style={s.fleet}>{r.fleet}</div>
                  </td>
                  <td style={{...s.td, ...s.tdR}}>R$ {brl(r.directCost)}</td>
                  <td style={{...s.td, ...s.tdR, color: isDump ? '#dc2626' : 'var(--ifm-color-emphasis-700)', fontWeight: isDump ? 700 : 400}}>
                    R$ {brl(r.share)}
                  </td>
                  <td style={{...s.td, ...s.tdR, fontWeight: 600}}>
                    <div style={{display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end'}}>
                      <span style={{color: isDump ? '#dc2626' : 'inherit'}}>R$ {brl(r.total)}</span>
                      <Bar value={r.total} max={maxTotal} color={isDump ? '#dc2626' : 'var(--ifm-color-primary)'} />
                    </div>
                  </td>
                  <td style={{...s.td, ...s.tdR, color: isDump ? '#dc2626' : 'inherit', fontWeight: isDump ? 700 : 400}}>
                    {cpk(r.total, r.km)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td style={s.foot}>Total</td>
              <td style={{...s.foot, ...s.tdR}}>R$ {brl(totalDirect)}</td>
              <td style={{...s.foot, ...s.tdR}}>R$ {brl(totalShare)}</td>
              <td style={{...s.foot, ...s.tdR}}>R$ {brl(totalDirect + totalShare)}</td>
              <td style={s.foot} />
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Distorcao */}
      {strategy === 'atual' ? (
        <div style={{...s.desc, background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca'}}>
          <strong>Distorcao:</strong> o Veiculo A aparece <strong>{distortion}% mais caro</strong> do que apareceria com rateio por custo direto (R$ {brl(shownA)} contra R$ {brl(Math.round(fairA))}). O CPK dele fica inflado e qualquer decisao de renovacao/manutencao baseada nesse numero parte de um dado errado.
        </div>
      ) : (
        <div style={{...s.desc, background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0'}}>
          <strong>Resultado:</strong> os R$ {brl(SHARED_POOL)} de material compartilhado se distribuem entre os 4 ativos. Nenhum veiculo carrega sozinho um consumo que serviu a oficina inteira, e o custo por ativo passa a refletir o esforco real de cada um.
        </div>
      )}

      <div style={s.hint}>Troque a estrategia nas abas para comparar como o mesmo pool de R$ {brl(SHARED_POOL)} muda o custo por ativo.</div>
    </div>
  );
}
