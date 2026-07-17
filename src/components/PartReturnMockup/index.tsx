import {useState, type CSSProperties, type ReactNode} from 'react';

// ── Types ──────────────────────────────────────────────
interface PartRow {
  id: string;
  name: string;
  partNumber: string;
  service: string;
  approved: number;
  returned: number;
  status: string;
  requester: string;
  date: string;
}

type OptionKey = 'A' | 'B' | 'C';

// ── Data ───────────────────────────────────────────────
const PARTS: PartRow[] = [
  {id: '1', name: 'Cupilha Maior', partNumber: '27054788', service: 'Substituir cuica de freio', approved: 10, returned: 4, status: 'returned', requester: 'Tamires Admin', date: '04/07/2026'},
  {id: '2', name: 'Cupilha Menor', partNumber: '27059153', service: 'Substituir cuica de freio', approved: 5, returned: 5, status: 'returned', requester: 'Tamires Admin', date: '04/07/2026'},
  {id: '3', name: 'Junta 4 furos', partNumber: '27019917', service: 'Substituir cuica de freio', approved: 1, returned: 0, status: 'delivered', requester: 'Tamires Admin', date: '04/07/2026'},
  {id: '4', name: 'Filtro de Oleo', partNumber: '27031445', service: 'Troca de oleo', approved: 2, returned: 0, status: 'pending', requester: 'Carlos Mec.', date: '04/07/2026'},
];

// ── Styles ─────────────────────────────────────────────
const s: Record<string, CSSProperties> = {
  container: {display: 'flex', flexDirection: 'column', gap: 24},
  tabs: {display: 'flex', gap: 8, borderBottom: '2px solid var(--ifm-color-emphasis-200)', paddingBottom: 0},
  tab: {padding: '10px 20px', cursor: 'pointer', border: 'none', background: 'none', fontSize: 14, fontWeight: 500, color: 'var(--ifm-color-emphasis-600)', borderBottom: '2px solid transparent', marginBottom: -2, transition: 'all 0.2s'},
  tabActive: {color: 'var(--ifm-color-primary)', borderBottom: '2px solid var(--ifm-color-primary)', fontWeight: 600},
  card: {border: '1px solid var(--ifm-color-emphasis-200)', borderRadius: 12, overflow: 'hidden', background: 'var(--ifm-background-surface-color)'},
  header: {display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--ifm-color-emphasis-200)', background: 'var(--ifm-color-emphasis-100)'},
  headerTitle: {fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8},
  table: {width: '100%', borderCollapse: 'collapse' as const, fontSize: 13},
  th: {textAlign: 'left' as const, padding: '10px 14px', fontWeight: 600, fontSize: 12, color: 'var(--ifm-color-emphasis-600)', borderBottom: '1px solid var(--ifm-color-emphasis-200)', textTransform: 'uppercase' as const, letterSpacing: 0.5},
  td: {padding: '12px 14px', borderBottom: '1px solid var(--ifm-color-emphasis-100)', verticalAlign: 'middle' as const},
  partName: {fontWeight: 500, fontSize: 13},
  partNumber: {fontSize: 11, color: 'var(--ifm-color-emphasis-500)'},
  desc: {padding: '16px 20px', fontSize: 13, color: 'var(--ifm-color-emphasis-700)', lineHeight: 1.6, background: 'var(--ifm-color-emphasis-100)', borderRadius: 8, margin: '0 0 8px 0'},
  detailBox: {marginTop: 12, padding: '12px 16px', background: 'var(--ifm-color-emphasis-100)', borderRadius: 8, fontSize: 12, lineHeight: 1.8},
  detailLabel: {color: 'var(--ifm-color-emphasis-500)', marginRight: 6},
  legend: {display: 'flex', gap: 16, padding: '12px 16px', flexWrap: 'wrap' as const, fontSize: 12, color: 'var(--ifm-color-emphasis-600)'},
};

// ── Badge Component ────────────────────────────────────
function Badge({color, label, outline}: {color: string; label: string; outline?: boolean}) {
  const colors: Record<string, {bg: string; text: string; border: string}> = {
    yellow: {bg: '#fef3c7', text: '#92400e', border: '#fcd34d'},
    green: {bg: '#d1fae5', text: '#065f46', border: '#6ee7b7'},
    blue: {bg: '#dbeafe', text: '#1e40af', border: '#93c5fd'},
    red: {bg: '#fee2e2', text: '#991b1b', border: '#fca5a5'},
    purple: {bg: '#ede9fe', text: '#5b21b6', border: '#c4b5fd'},
    orange: {bg: '#ffedd5', text: '#9a3412', border: '#fdba74'},
    gray: {bg: '#f3f4f6', text: '#374151', border: '#d1d5db'},
  };
  const c = colors[color] || colors.gray;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 600,
      background: outline ? 'transparent' : c.bg,
      color: c.text,
      border: outline ? `1.5px solid ${c.border}` : `1px solid ${c.border}`,
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  );
}

// ── Indicator (secondary) ──────────────────────────────
function ReturnIndicator({returned, approved}: {returned: number; approved: number}) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 500,
      background: '#f3e8ff', color: '#7c3aed', marginLeft: 6,
    }}>
      {'↩'} {returned}/{approved} devolvidas
    </span>
  );
}

// ── Status logic per option ────────────────────────────
function getStatusDisplay(part: PartRow, option: OptionKey): ReactNode {
  if (part.status === 'pending') return <Badge color="yellow" label="Pendente" />;
  if (part.status === 'delivered' && part.returned === 0) return <Badge color="blue" label="Entregue" />;

  // Only returned parts differ per option
  if (part.status === 'returned') {
    const isPartial = part.returned < part.approved;
    const isTotal = part.returned === part.approved;

    switch (option) {
      case 'A':
        // Always RETURNED badge, detail in card
        return <Badge color="purple" label="Devolvida" />;

      case 'B':
        // Partial = DELIVERED + indicator, Total = RETURNED
        if (isPartial) {
          return (
            <span style={{display: 'inline-flex', alignItems: 'center', flexWrap: 'wrap', gap: 4}}>
              <Badge color="blue" label="Entregue" />
              <ReturnIndicator returned={part.returned} approved={part.approved} />
            </span>
          );
        }
        return <Badge color="purple" label="Devolvida" />;

      case 'C':
        // Three distinct badges
        if (isTotal) return <Badge color="purple" label="Devolvida" />;
        if (isPartial) return <Badge color="orange" label="Parcial" />;
        return <Badge color="blue" label="Entregue" />;
    }
  }

  return <Badge color="gray" label="—" />;
}

function getQtyDisplay(part: PartRow, option: OptionKey): ReactNode {
  const base = `${part.approved}`;
  if (part.status !== 'returned' || part.returned === 0) return base;

  const used = part.approved - part.returned;

  if (option === 'A') {
    return (
      <span>
        <span style={{textDecoration: part.returned === part.approved ? 'line-through' : 'none', opacity: part.returned === part.approved ? 0.5 : 1}}>{part.approved}</span>
        <span style={{fontSize: 11, color: 'var(--ifm-color-emphasis-500)', marginLeft: 4}}>({used} usadas)</span>
      </span>
    );
  }

  if (option === 'B') {
    return (
      <span>
        {part.approved}
        {part.returned > 0 && <span style={{fontSize: 11, color: '#7c3aed', marginLeft: 4}}>{'↩'}{part.returned}</span>}
      </span>
    );
  }

  if (option === 'C') {
    const isPartial = part.returned < part.approved;
    return (
      <span>
        {isPartial ? `${used} usadas` : '0 usadas'}
        <span style={{fontSize: 11, color: 'var(--ifm-color-emphasis-500)', marginLeft: 4}}>/ {part.returned} devolvidas</span>
      </span>
    );
  }

  return base;
}

// ── Detail Card per option ─────────────────────────────
function DetailCard({part, option}: {part: PartRow; option: OptionKey}) {
  if (part.status !== 'returned') return null;

  const used = part.approved - part.returned;

  return (
    <div style={s.detailBox}>
      <div><span style={s.detailLabel}>Qtd aprovada:</span> <strong>{part.approved}</strong></div>
      <div><span style={s.detailLabel}>Qtd devolvida:</span> <strong style={{color: '#7c3aed'}}>{part.returned}</strong></div>
      <div><span style={s.detailLabel}>Qtd utilizada:</span> <strong style={{color: '#059669'}}>{used}</strong></div>
      <div><span style={s.detailLabel}>Devolvido por:</span> {part.requester}</div>
      <div><span style={s.detailLabel}>Data devolucao:</span> {part.date}</div>
      <div><span style={s.detailLabel}>Motivo:</span> <em>Diagnostico alterado durante reparo</em></div>
    </div>
  );
}

// ── Option descriptions ────────────────────────────────
const OPTION_DESCRIPTIONS: Record<OptionKey, {title: string; desc: string}> = {
  A: {
    title: 'Opcao A — Status RETURNED unico',
    desc: 'Qualquer devolucao (parcial ou total) muda o status para "Devolvida". A quantidade devolvida vs utilizada aparece no card de detalhes e na coluna de quantidade.',
  },
  B: {
    title: 'Opcao B — Entregue + indicador de devolucao',
    desc: 'Devolucao parcial mantem status "Entregue" com um indicador visual de quantas pecas foram devolvidas. So muda para "Devolvida" quando TODAS as pecas sao devolvidas.',
  },
  C: {
    title: 'Opcao C — Tres badges distintos',
    desc: 'Tres estados visuais: "Entregue" (azul, sem devolucao), "Parcial" (laranja, devolucao parcial) e "Devolvida" (roxo, devolucao total). Mais explicito, mais badges.',
  },
};

// ── Main Component ─────────────────────────────────────
export function PartReturnMockup() {
  const [activeOption, setActiveOption] = useState<OptionKey>('A');
  const [expandedRow, setExpandedRow] = useState<string | null>('1');

  const options: OptionKey[] = ['A', 'B', 'C'];

  return (
    <div style={s.container}>
      {/* Tabs */}
      <div style={s.tabs}>
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => {setActiveOption(opt); setExpandedRow('1');}}
            style={{...s.tab, ...(activeOption === opt ? s.tabActive : {})}}
          >
            Opcao {opt}
          </button>
        ))}
      </div>

      {/* Description */}
      <div style={s.desc}>
        <strong>{OPTION_DESCRIPTIONS[activeOption].title}</strong>
        <br />
        {OPTION_DESCRIPTIONS[activeOption].desc}
      </div>

      {/* Legend */}
      <div style={s.legend}>
        <span><Badge color="yellow" label="Pendente" /> Aguardando aprovacao</span>
        <span><Badge color="blue" label="Entregue" /> Entregue ao mecanico</span>
        <span><Badge color="purple" label="Devolvida" /> Devolvida ao almoxarifado</span>
        {activeOption === 'C' && <span><Badge color="orange" label="Parcial" /> Devolucao parcial</span>}
      </div>

      {/* Table */}
      <div style={s.card}>
        <div style={s.header}>
          <span style={s.headerTitle}>
            {'🔧'} PN-0007
            <Badge color="blue" label="Em Manutencao" outline />
          </span>
          <span style={{fontSize: 12, color: 'var(--ifm-color-emphasis-500)'}}>
            4 pecas
          </span>
        </div>

        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Peca</th>
              <th style={s.th}>Servico</th>
              <th style={{...s.th, textAlign: 'center'}}>Qtd</th>
              <th style={{...s.th, textAlign: 'center'}}>Status</th>
              <th style={s.th}>Solicitante</th>
            </tr>
          </thead>
          <tbody>
            {PARTS.map((part) => (
              <>
                <tr
                  key={part.id}
                  onClick={() => setExpandedRow(expandedRow === part.id ? null : part.id)}
                  style={{cursor: part.status === 'returned' ? 'pointer' : 'default', transition: 'background 0.15s'}}
                  onMouseEnter={(e) => {if (part.status === 'returned') (e.currentTarget as HTMLElement).style.background = 'var(--ifm-color-emphasis-100)';}}
                  onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                >
                  <td style={s.td}>
                    <div style={s.partName}>{part.name}</div>
                    <div style={s.partNumber}>{part.partNumber}</div>
                  </td>
                  <td style={s.td}>{part.service}</td>
                  <td style={{...s.td, textAlign: 'center'}}>{getQtyDisplay(part, activeOption)}</td>
                  <td style={{...s.td, textAlign: 'center'}}>{getStatusDisplay(part, activeOption)}</td>
                  <td style={s.td}>
                    <div style={{fontSize: 13}}>{part.requester}</div>
                    <div style={{fontSize: 11, color: 'var(--ifm-color-emphasis-500)'}}>{part.date}</div>
                  </td>
                </tr>
                {expandedRow === part.id && part.status === 'returned' && (
                  <tr key={`${part.id}-detail`}>
                    <td colSpan={5} style={{padding: '0 14px 14px 14px', borderBottom: '1px solid var(--ifm-color-emphasis-100)'}}>
                      <DetailCard part={part} option={activeOption} />
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Hint */}
      <div style={{fontSize: 12, color: 'var(--ifm-color-emphasis-500)', textAlign: 'center', fontStyle: 'italic'}}>
        Clique nas linhas com devolucao para ver o card de detalhes
      </div>
    </div>
  );
}
