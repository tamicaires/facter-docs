import {useState, type CSSProperties, type ReactNode} from 'react';

// ── Types ──────────────────────────────────────────────
type ConformityStatus = 'PENDING' | 'CONFORM' | 'NON_CONFORM' | 'NOT_APPLICABLE';

interface CellState {
  status: ConformityStatus;
  menuOpen?: boolean;
}

type Option = 1 | 2 | 3;

// ── Color tokens ───────────────────────────────────────
const colors = {
  conform: {bg: 'hsla(142, 76%, 36%, 0.15)', border: 'hsla(142, 76%, 36%, 0.3)', text: 'hsl(142, 71%, 35%)'},
  nonConform: {bg: 'hsla(0, 84%, 60%, 0.15)', border: 'hsla(0, 84%, 60%, 0.3)', text: 'hsl(0, 72%, 50%)'},
  pending: {bg: 'hsla(240, 4%, 46%, 0.1)', border: 'hsla(240, 4%, 46%, 0.2)', text: 'hsl(240, 4%, 46%)'},
  na: {bg: 'hsla(215, 16%, 47%, 0.1)', border: 'hsla(215, 16%, 47%, 0.2)', text: 'hsl(215, 16%, 47%)'},
  primary: 'hsl(233, 65%, 50%)',
  primaryBg: 'hsla(233, 65%, 50%, 0.1)',
  cardBg: 'var(--facter-card-bg, #fff)',
  cardBorder: 'var(--facter-card-border, #e5e5e5)',
  muted: 'var(--facter-muted, #888)',
  mutedBg: 'var(--facter-muted-bg, #f5f5f5)',
  rowHighlight: 'hsla(0, 84%, 60%, 0.03)',
};

// ── Data ───────────────────────────────────────────────
const trailers = ['SR1', 'SR2', 'SR3'];

const checklistItems = [
  {id: '1', label: 'Verificar Pneus', category: 'Rodagem'},
  {id: '2', label: 'Verificar Freios', category: 'Rodagem'},
  {id: '3', label: 'Verificar Iluminacao', category: 'Eletrica'},
  {id: '4', label: 'Verificar Lona', category: 'Estrutura'},
];

type GridState = Record<string, Record<string, CellState>>;

function buildInitialState(): GridState {
  const state: GridState = {};
  for (const item of checklistItems) {
    state[item.id] = {};
    for (const t of trailers) {
      state[item.id][t] = {status: 'PENDING'};
    }
  }
  // Pre-fill some for realism
  state['1']['SR1'] = {status: 'NON_CONFORM'};
  state['1']['SR2'] = {status: 'CONFORM'};
  state['1']['SR3'] = {status: 'NON_CONFORM'};
  state['2']['SR1'] = {status: 'CONFORM'};
  state['2']['SR2'] = {status: 'CONFORM'};
  state['2']['SR3'] = {status: 'CONFORM'};
  state['3']['SR1'] = {status: 'CONFORM'};
  state['3']['SR2'] = {status: 'NON_CONFORM'};
  state['4']['SR1'] = {status: 'CONFORM'};
  return state;
}

// ── Styles ─────────────────────────────────────────────
const s = {
  wrapper: {
    fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
    fontSize: '0.875rem',
    lineHeight: 1.5,
  } as CSSProperties,
  tabs: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1.5rem',
  } as CSSProperties,
  tab: (active: boolean) => ({
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    border: `1px solid ${active ? colors.primary : colors.cardBorder}`,
    background: active ? colors.primaryBg : colors.cardBg,
    color: active ? colors.primary : 'inherit',
    cursor: 'pointer',
    fontWeight: active ? 600 : 400,
    fontSize: '0.8rem',
    transition: 'all 0.15s',
  }) as CSSProperties,
  card: {
    background: colors.cardBg,
    border: `1px solid ${colors.cardBorder}`,
    borderRadius: '0.75rem',
    overflow: 'hidden',
  } as CSSProperties,
  cardHeader: {
    padding: '1rem 1.25rem',
    borderBottom: `1px solid ${colors.cardBorder}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  } as CSSProperties,
  cardTitle: {
    fontWeight: 700,
    fontSize: '0.9rem',
    margin: 0,
  } as CSSProperties,
  badge: {
    fontSize: '0.7rem',
    fontWeight: 600,
    padding: '2px 8px',
    borderRadius: '9999px',
    background: colors.mutedBg,
    color: colors.muted,
  } as CSSProperties,
  grid: {
    width: '100%',
  } as CSSProperties,
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.5rem 1rem',
    borderBottom: `1px solid ${colors.cardBorder}`,
    background: colors.mutedBg,
  } as CSSProperties,
  headerLabel: {
    flex: 1,
    fontSize: '0.75rem',
    fontWeight: 600,
    color: colors.muted,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.04em',
  } as CSSProperties,
  headerTrailer: {
    width: 120,
    textAlign: 'center' as const,
    fontSize: '0.75rem',
    fontWeight: 600,
    flexShrink: 0,
  } as CSSProperties,
  headerTrailerName: {
    color: colors.primary,
    fontWeight: 700,
  } as CSSProperties,
  headerTrailerSub: {
    color: colors.muted,
    fontSize: '0.65rem',
    fontWeight: 400,
  } as CSSProperties,
  headerActions: {
    width: 80,
    flexShrink: 0,
  } as CSSProperties,
  row: (hasNonConform: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    padding: '0.5rem 1rem',
    borderBottom: `1px solid ${colors.cardBorder}`,
    background: hasNonConform ? colors.rowHighlight : 'transparent',
    transition: 'background 0.15s',
    position: 'relative' as const,
  }) as CSSProperties,
  rowLabel: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  } as CSSProperties,
  rowIndex: {
    width: 20,
    fontSize: '0.75rem',
    color: colors.muted,
    fontWeight: 500,
  } as CSSProperties,
  rowText: {
    fontSize: '0.85rem',
    fontWeight: 500,
  } as CSSProperties,
  cellGroup: {
    width: 120,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    flexShrink: 0,
    position: 'relative' as const,
  } as CSSProperties,
  btn: (status: ConformityStatus, targetStatus: ConformityStatus) => {
    const isActive = status === targetStatus;
    const colorMap: Record<string, typeof colors.conform> = {
      NON_CONFORM: colors.nonConform,
      CONFORM: colors.conform,
    };
    const c = colorMap[targetStatus] || colors.pending;
    return {
      width: 32,
      height: 32,
      borderRadius: '0.5rem',
      border: `1px solid ${isActive ? c.border : 'hsla(240, 4%, 46%, 0.15)'}`,
      background: isActive ? c.bg : 'hsla(240, 4%, 46%, 0.06)',
      color: isActive ? c.text : colors.muted,
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.85rem',
      fontWeight: 700,
      transition: 'all 0.15s',
      lineHeight: 1,
    } as CSSProperties;
  },
  dotsBtn: {
    width: 24,
    height: 32,
    borderRadius: '0.375rem',
    border: 'none',
    background: 'transparent',
    color: colors.muted,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.1rem',
    transition: 'all 0.15s',
    position: 'relative' as const,
  } as CSSProperties,
  actionCol: {
    width: 80,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    flexShrink: 0,
  } as CSSProperties,
  actionBtn: (variant: 'primary' | 'default') => ({
    width: 32,
    height: 32,
    borderRadius: '0.5rem',
    border: variant === 'primary' ? `1px solid hsla(233, 65%, 50%, 0.3)` : `1px solid ${colors.cardBorder}`,
    background: variant === 'primary' ? colors.primaryBg : colors.mutedBg,
    color: variant === 'primary' ? colors.primary : colors.muted,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.85rem',
    transition: 'all 0.15s',
  }) as CSSProperties,
  dropdown: {
    position: 'absolute' as const,
    top: '100%',
    right: 0,
    marginTop: 4,
    background: colors.cardBg,
    border: `1px solid ${colors.cardBorder}`,
    borderRadius: '0.5rem',
    boxShadow: '0 8px 24px hsla(0,0%,0%,0.12)',
    padding: '4px',
    zIndex: 50,
    minWidth: 200,
    whiteSpace: 'nowrap' as const,
  } as CSSProperties,
  dropdownItem: (color?: string) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 10px',
    borderRadius: '0.375rem',
    fontSize: '0.8rem',
    cursor: 'pointer',
    border: 'none',
    background: 'transparent',
    width: '100%',
    textAlign: 'left' as const,
    color: color || 'inherit',
    fontWeight: 500,
    transition: 'background 0.1s',
  }) as CSSProperties,
  dropdownSep: {
    height: 1,
    background: colors.cardBorder,
    margin: '4px 0',
  } as CSSProperties,
  // Option 2: inline action icon
  inlineAction: {
    position: 'absolute' as const,
    bottom: -2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: '50%',
    background: colors.primaryBg,
    color: colors.primary,
    border: `1px solid hsla(233, 65%, 50%, 0.25)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.6rem',
    cursor: 'pointer',
    zIndex: 2,
  } as CSSProperties,
  // Option 3: expanded row
  expandedRow: {
    borderBottom: `1px solid ${colors.cardBorder}`,
    background: colors.mutedBg,
    padding: '0.5rem 1rem 0.5rem 2.5rem',
  } as CSSProperties,
  expandedItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.35rem 0',
  } as CSSProperties,
  expandedTrailer: {
    fontWeight: 600,
    fontSize: '0.8rem',
    color: colors.primary,
    width: 36,
  } as CSSProperties,
  expandedStatus: {
    fontSize: '0.78rem',
    color: colors.nonConform.text,
    fontWeight: 500,
    flex: 1,
  } as CSSProperties,
  expandedBtn: {
    padding: '4px 10px',
    borderRadius: '0.375rem',
    border: `1px solid ${colors.cardBorder}`,
    background: colors.cardBg,
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: 500,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    transition: 'all 0.1s',
  } as CSSProperties,
  expandedBtnPrimary: {
    padding: '4px 10px',
    borderRadius: '0.375rem',
    border: `1px solid hsla(233, 65%, 50%, 0.3)`,
    background: colors.primaryBg,
    color: colors.primary,
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: 500,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    transition: 'all 0.1s',
  } as CSSProperties,
  expandArrow: {
    width: 28,
    height: 28,
    borderRadius: '0.375rem',
    border: 'none',
    background: 'transparent',
    color: colors.muted,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.85rem',
    transition: 'transform 0.15s',
    flexShrink: 0,
  } as CSSProperties,
  note: {
    padding: '0.75rem 1rem',
    background: colors.mutedBg,
    borderRadius: '0.5rem',
    fontSize: '0.8rem',
    color: colors.muted,
    lineHeight: 1.6,
    marginTop: '1rem',
  } as CSSProperties,
  optionTitle: {
    fontSize: '0.95rem',
    fontWeight: 700,
    margin: '0 0 0.25rem 0',
  } as CSSProperties,
  optionDesc: {
    fontSize: '0.8rem',
    color: colors.muted,
    margin: '0 0 1rem 0',
  } as CSSProperties,
  popover: {
    position: 'absolute' as const,
    top: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    marginTop: 6,
    background: colors.cardBg,
    border: `1px solid ${colors.cardBorder}`,
    borderRadius: '0.5rem',
    boxShadow: '0 8px 24px hsla(0,0%,0%,0.12)',
    padding: '6px',
    zIndex: 50,
    minWidth: 170,
    whiteSpace: 'nowrap' as const,
  } as CSSProperties,
} as const;

// ── Icons (inline SVG strings) ─────────────────────────
function XIcon(): ReactNode {
  return <span style={{lineHeight: 1}}>&#10005;</span>;
}
function CheckIcon(): ReactNode {
  return <span style={{lineHeight: 1}}>&#10003;</span>;
}
function DotsIcon(): ReactNode {
  return <span style={{lineHeight: 1, letterSpacing: '2px'}}>&#8943;</span>;
}
function WrenchIcon(): ReactNode {
  return <span style={{fontSize: '0.75em'}}>&#128295;</span>;
}
function PackageIcon(): ReactNode {
  return <span style={{fontSize: '0.75em'}}>&#128230;</span>;
}
function ChevronDown({open}: {open: boolean}): ReactNode {
  return (
    <span style={{
      display: 'inline-block',
      transition: 'transform 0.15s',
      transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
      fontSize: '0.75rem',
    }}>&#9660;</span>
  );
}

// ── Conformity Cell (shared) ───────────────────────────
function ConformityButtons({
  status,
  onToggle,
}: {
  status: ConformityStatus;
  onToggle: (target: ConformityStatus) => void;
}): ReactNode {
  return (
    <>
      <button
        style={s.btn(status, 'NON_CONFORM')}
        onClick={() => onToggle(status === 'NON_CONFORM' ? 'PENDING' : 'NON_CONFORM')}
        title="Nao Conforme"
      >
        <XIcon />
      </button>
      <button
        style={s.btn(status, 'CONFORM')}
        onClick={() => onToggle(status === 'CONFORM' ? 'PENDING' : 'CONFORM')}
        title="Conforme"
      >
        <CheckIcon />
      </button>
    </>
  );
}

// ── Option 1: Extended menu ────────────────────────────
function Option1Grid({
  grid,
  setGrid,
}: {
  grid: GridState;
  setGrid: (fn: (prev: GridState) => GridState) => void;
}): ReactNode {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  function toggleStatus(itemId: string, trailer: string, target: ConformityStatus) {
    setGrid((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [trailer]: {status: target},
      },
    }));
  }

  function hasNonConformInRow(itemId: string): boolean {
    return trailers.some((t) => grid[itemId]?.[t]?.status === 'NON_CONFORM');
  }

  function isEvaluated(status: ConformityStatus): boolean {
    return status !== 'PENDING';
  }

  return (
    <div style={s.card}>
      <div style={s.cardHeader}>
        <p style={s.cardTitle}>Rodagem</p>
        <span style={s.badge}>4 itens</span>
      </div>

      <div style={s.headerRow}>
        <div style={s.headerLabel}>Item</div>
        {trailers.map((t) => (
          <div key={t} style={s.headerTrailer}>
            <div style={s.headerTrailerName}>{t}</div>
            <div style={s.headerTrailerSub}>Reboque</div>
          </div>
        ))}
      </div>

      {checklistItems.map((item, idx) => (
        <div key={item.id} style={s.row(hasNonConformInRow(item.id))}>
          <div style={s.rowLabel}>
            <span style={s.rowIndex}>{idx + 1}</span>
            <span style={s.rowText}>{item.label}</span>
          </div>
          {trailers.map((t) => {
            const cell = grid[item.id]?.[t] || {status: 'PENDING' as ConformityStatus};
            const menuKey = `${item.id}-${t}`;
            const showExtras = isEvaluated(cell.status);
            return (
              <div key={t} style={s.cellGroup}>
                <ConformityButtons
                  status={cell.status}
                  onToggle={(target) => toggleStatus(item.id, t, target)}
                />
                <div style={{position: 'relative'}}>
                  <button
                    style={s.dotsBtn}
                    onClick={() => setOpenMenu(openMenu === menuKey ? null : menuKey)}
                    title="Mais opcoes"
                  >
                    <DotsIcon />
                  </button>
                  {openMenu === menuKey && (
                    <div style={s.dropdown}>
                      <button
                        style={s.dropdownItem()}
                        onClick={() => setOpenMenu(null)}
                        onMouseEnter={(e) => {e.currentTarget.style.background = colors.mutedBg;}}
                        onMouseLeave={(e) => {e.currentTarget.style.background = 'transparent';}}
                      >
                        <span style={{color: colors.na.text}}>&#8856;</span> Nao se Aplica
                      </button>
                      <button
                        style={s.dropdownItem()}
                        onClick={() => setOpenMenu(null)}
                        onMouseEnter={(e) => {e.currentTarget.style.background = colors.mutedBg;}}
                        onMouseLeave={(e) => {e.currentTarget.style.background = 'transparent';}}
                      >
                        <span style={{color: 'hsl(45, 93%, 47%)'}}>&#9888;</span> Parcial
                      </button>
                      <button
                        style={s.dropdownItem(colors.muted)}
                        onClick={() => {toggleStatus(item.id, t, 'PENDING'); setOpenMenu(null);}}
                        onMouseEnter={(e) => {e.currentTarget.style.background = colors.mutedBg;}}
                        onMouseLeave={(e) => {e.currentTarget.style.background = 'transparent';}}
                      >
                        <span>&#9676;</span> Limpar status
                      </button>
                      {showExtras && (
                        <>
                          <div style={s.dropdownSep} />
                          <button
                            style={s.dropdownItem(colors.primary)}
                            onClick={() => {alert(`Adicionar Servico para ${t} — item "${item.label}"`); setOpenMenu(null);}}
                            onMouseEnter={(e) => {e.currentTarget.style.background = colors.primaryBg;}}
                            onMouseLeave={(e) => {e.currentTarget.style.background = 'transparent';}}
                          >
                            <WrenchIcon /> Adicionar Servico
                          </button>
                          <button
                            style={s.dropdownItem()}
                            onClick={() => {alert(`Solicitar Peca para ${t} — item "${item.label}"`); setOpenMenu(null);}}
                            onMouseEnter={(e) => {e.currentTarget.style.background = colors.mutedBg;}}
                            onMouseLeave={(e) => {e.currentTarget.style.background = 'transparent';}}
                          >
                            <PackageIcon /> Solicitar Peca
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ── Option 2: Inline action icon ───────────────────────
function Option2Grid({
  grid,
  setGrid,
}: {
  grid: GridState;
  setGrid: (fn: (prev: GridState) => GridState) => void;
}): ReactNode {
  const [popover, setPopover] = useState<string | null>(null);

  function toggleStatus(itemId: string, trailer: string, target: ConformityStatus) {
    setGrid((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [trailer]: {status: target},
      },
    }));
  }

  function hasNonConformInRow(itemId: string): boolean {
    return trailers.some((t) => grid[itemId]?.[t]?.status === 'NON_CONFORM');
  }

  return (
    <div style={s.card}>
      <div style={s.cardHeader}>
        <p style={s.cardTitle}>Rodagem</p>
        <span style={s.badge}>4 itens</span>
      </div>

      <div style={s.headerRow}>
        <div style={s.headerLabel}>Item</div>
        {trailers.map((t) => (
          <div key={t} style={s.headerTrailer}>
            <div style={s.headerTrailerName}>{t}</div>
            <div style={s.headerTrailerSub}>Reboque</div>
          </div>
        ))}
      </div>

      {checklistItems.map((item, idx) => (
        <div key={item.id} style={s.row(hasNonConformInRow(item.id))}>
          <div style={s.rowLabel}>
            <span style={s.rowIndex}>{idx + 1}</span>
            <span style={s.rowText}>{item.label}</span>
          </div>
          {trailers.map((t) => {
            const cell = grid[item.id]?.[t] || {status: 'PENDING' as ConformityStatus};
            const isNonConform = cell.status === 'NON_CONFORM';
            const popKey = `${item.id}-${t}`;
            return (
              <div key={t} style={s.cellGroup}>
                <ConformityButtons
                  status={cell.status}
                  onToggle={(target) => toggleStatus(item.id, t, target)}
                />
                <button style={s.dotsBtn} title="Mais opcoes">
                  <DotsIcon />
                </button>
                {isNonConform && (
                  <div style={{position: 'relative'}}>
                    <button
                      style={s.inlineAction}
                      onClick={() => setPopover(popover === popKey ? null : popKey)}
                      title="Acoes"
                    >
                      <WrenchIcon />
                    </button>
                    {popover === popKey && (
                      <div style={s.popover}>
                        <button
                          style={s.dropdownItem(colors.primary)}
                          onClick={() => {alert(`Adicionar Servico para ${t} — item "${item.label}"`); setPopover(null);}}
                          onMouseEnter={(e) => {e.currentTarget.style.background = colors.primaryBg;}}
                          onMouseLeave={(e) => {e.currentTarget.style.background = 'transparent';}}
                        >
                          <WrenchIcon /> Adicionar Servico
                        </button>
                        <button
                          style={s.dropdownItem()}
                          onClick={() => {alert(`Solicitar Peca para ${t} — item "${item.label}"`); setPopover(null);}}
                          onMouseEnter={(e) => {e.currentTarget.style.background = colors.mutedBg;}}
                          onMouseLeave={(e) => {e.currentTarget.style.background = 'transparent';}}
                        >
                          <PackageIcon /> Solicitar Peca
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ── Option 3: Expandable rows ──────────────────────────
function Option3Grid({
  grid,
  setGrid,
}: {
  grid: GridState;
  setGrid: (fn: (prev: GridState) => GridState) => void;
}): ReactNode {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['1']));

  function toggleStatus(itemId: string, trailer: string, target: ConformityStatus) {
    setGrid((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [trailer]: {status: target},
      },
    }));
  }

  function hasNonConformInRow(itemId: string): boolean {
    return trailers.some((t) => grid[itemId]?.[t]?.status === 'NON_CONFORM');
  }

  function toggleExpand(itemId: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  }

  function getNonConformTrailers(itemId: string): string[] {
    return trailers.filter((t) => grid[itemId]?.[t]?.status === 'NON_CONFORM');
  }

  return (
    <div style={s.card}>
      <div style={s.cardHeader}>
        <p style={s.cardTitle}>Rodagem</p>
        <span style={s.badge}>4 itens</span>
      </div>

      <div style={s.headerRow}>
        <div style={{...s.headerLabel, paddingLeft: 36}}>Item</div>
        {trailers.map((t) => (
          <div key={t} style={s.headerTrailer}>
            <div style={s.headerTrailerName}>{t}</div>
            <div style={s.headerTrailerSub}>Reboque</div>
          </div>
        ))}
      </div>

      {checklistItems.map((item, idx) => {
        const hasNC = hasNonConformInRow(item.id);
        const isExpanded = expanded.has(item.id);
        const ncTrailers = getNonConformTrailers(item.id);
        return (
          <div key={item.id}>
            <div style={s.row(hasNC)}>
              <div style={s.rowLabel}>
                {hasNC ? (
                  <button
                    style={{
                      ...s.expandArrow,
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                    onClick={() => toggleExpand(item.id)}
                    title={isExpanded ? 'Recolher' : 'Expandir'}
                  >
                    &#9660;
                  </button>
                ) : (
                  <span style={{width: 28, display: 'inline-block'}} />
                )}
                <span style={s.rowIndex}>{idx + 1}</span>
                <span style={s.rowText}>{item.label}</span>
              </div>
              {trailers.map((t) => {
                const cell = grid[item.id]?.[t] || {status: 'PENDING' as ConformityStatus};
                return (
                  <div key={t} style={s.cellGroup}>
                    <ConformityButtons
                      status={cell.status}
                      onToggle={(target) => toggleStatus(item.id, t, target)}
                    />
                    <button style={s.dotsBtn} title="Mais opcoes">
                      <DotsIcon />
                    </button>
                  </div>
                );
              })}
            </div>
            {hasNC && isExpanded && (
              <div style={s.expandedRow}>
                {ncTrailers.map((t) => (
                  <div key={t} style={s.expandedItem}>
                    <span style={{fontSize: '0.75rem', color: colors.muted}}>&#9492;&#9472;</span>
                    <span style={s.expandedTrailer}>{t}</span>
                    <span style={s.expandedStatus}>Nao Conforme</span>
                    <button
                      style={s.expandedBtnPrimary}
                      onClick={() => alert(`Adicionar Servico para ${t} — item "${item.label}"`)}
                    >
                      <WrenchIcon /> Adicionar Servico
                    </button>
                    <button
                      style={s.expandedBtn}
                      onClick={() => alert(`Solicitar Peca para ${t} — item "${item.label}"`)}
                    >
                      <PackageIcon /> Solicitar Peca
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────
export function ChecklistMockup(): ReactNode {
  const [activeOption, setActiveOption] = useState<Option>(1);
  const [grid1, setGrid1] = useState<GridState>(buildInitialState);
  const [grid2, setGrid2] = useState<GridState>(buildInitialState);
  const [grid3, setGrid3] = useState<GridState>(buildInitialState);

  const options: Record<Option, {title: string; desc: string}> = {
    1: {
      title: 'Opcao 1 — Menu estendido (tres pontos)',
      desc: 'Acoes de servico e peca aparecem no menu que ja existe em cada celula, abaixo de um separador. So aparecem quando o item ja foi avaliado.',
    },
    2: {
      title: 'Opcao 2 — Icone de acao na celula',
      desc: 'Um icone de chave aparece na celula quando marcada como nao conforme. Clicar abre um mini-popover com as acoes.',
    },
    3: {
      title: 'Opcao 3 — Linha expandivel',
      desc: 'Uma seta aparece nas linhas com itens nao conformes. Clicar expande uma sub-secao com botoes de acao por reboque.',
    },
  };

  const opt = options[activeOption];

  return (
    <div style={s.wrapper}>
      <div style={s.tabs}>
        {([1, 2, 3] as Option[]).map((n) => (
          <button
            key={n}
            style={s.tab(activeOption === n)}
            onClick={() => setActiveOption(n)}
          >
            Opcao {n}
          </button>
        ))}
      </div>

      <p style={s.optionTitle}>{opt.title}</p>
      <p style={s.optionDesc}>{opt.desc}</p>

      {activeOption === 1 && <Option1Grid grid={grid1} setGrid={setGrid1} />}
      {activeOption === 2 && <Option2Grid grid={grid2} setGrid={setGrid2} />}
      {activeOption === 3 && <Option3Grid grid={grid3} setGrid={setGrid3} />}

      <div style={s.note}>
        <strong>Interativo:</strong> Clique nos botoes de conformidade (&#10005; / &#10003;) para alterar o status.
        {activeOption === 1 && ' Clique no menu (...) de qualquer celula avaliada para ver as acoes extras.'}
        {activeOption === 2 && ' Celulas nao conformes mostram um icone de chave — clique para ver as acoes.'}
        {activeOption === 3 && ' Linhas com itens nao conformes mostram uma seta — clique para expandir.'}
      </div>
    </div>
  );
}
