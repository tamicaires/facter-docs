import {useState, type CSSProperties, type ReactNode} from 'react';

// ── Types ──────────────────────────────────────────────
interface FilterState {
  id: string;
  label: string;
  value: string | null;
  displayValue: string;
}

interface PageNav {
  id: string;
  label: string;
  pillar: string;
  pillarNumber: number;
  pillarIcon: string;
  filterIds: string[];
}

interface TransitionLog {
  from: string;
  to: string;
  kept: string[];
  reset: string[];
  newFilters: string[];
}

// ── Filter registry ─────────────────────────────────────
const FILTER_REGISTRY: Record<string, {label: string; defaultLabel: string; sampleValue: string}> = {
  periodo: {label: 'Periodo', defaultLabel: 'Jul 2026', sampleValue: 'Jul 2026'},
  frota: {label: 'Frota', defaultLabel: 'Todas Frotas', sampleValue: 'Frota A'},
  transportadora: {label: 'Transportadora', defaultLabel: 'Todas Transp.', sampleValue: 'Trans. Norte'},
  'tipo-os': {label: 'Tipo de OS', defaultLabel: 'Todos Tipos', sampleValue: 'Corretiva'},
  prioridade: {label: 'Prioridade', defaultLabel: 'Todas Prior.', sampleValue: 'Alta'},
  turno: {label: 'Turno', defaultLabel: 'Todos Turnos', sampleValue: 'Diurno'},
  cargo: {label: 'Cargo', defaultLabel: 'Todos Cargos', sampleValue: 'Mecanico'},
  marca: {label: 'Marca', defaultLabel: 'Todas Marcas', sampleValue: 'Michelin'},
  'status-pneu': {label: 'Status', defaultLabel: 'Todos Status', sampleValue: 'Em Uso'},
  categoria: {label: 'Categoria', defaultLabel: 'Todas Categ.', sampleValue: 'Rolamentos'},
  abc: {label: 'Class. ABC', defaultLabel: 'Todas Classes', sampleValue: 'Classe A'},
  template: {label: 'Template', defaultLabel: 'Todos Templates', sampleValue: 'Insp. Rodagem'},
  'tipo-problema': {label: 'Tipo Problema', defaultLabel: 'Todos Probl.', sampleValue: 'Pneu furado'},
  'tipo-plano': {label: 'Tipo Plano', defaultLabel: 'Todos Planos', sampleValue: 'Por KM'},
  severidade: {label: 'Severidade', defaultLabel: 'Todas Sever.', sampleValue: 'Alta'},
};

// ── Page definitions ────────────────────────────────────
const navPages: PageNav[] = [
  {id: 'overview', label: 'Visao Geral', pillar: 'Operacional', pillarNumber: 1, pillarIcon: '\u{1F527}', filterIds: ['periodo', 'frota']},
  {id: 'work-orders', label: 'Ordens de Servico', pillar: 'Operacional', pillarNumber: 1, pillarIcon: '\u{1F527}', filterIds: ['periodo', 'frota', 'transportadora', 'tipo-os', 'prioridade']},
  {id: 'kpis', label: 'Indicadores', pillar: 'Operacional', pillarNumber: 1, pillarIcon: '\u{1F527}', filterIds: ['periodo', 'frota']},
  {id: 'fleet', label: 'Frota', pillar: 'Ativos', pillarNumber: 2, pillarIcon: '\u{1F69B}', filterIds: ['periodo', 'frota', 'transportadora']},
  {id: 'tires', label: 'Pneus', pillar: 'Ativos', pillarNumber: 2, pillarIcon: '\u{1F69B}', filterIds: ['periodo', 'frota', 'marca', 'status-pneu']},
  {id: 'costs', label: 'Custos', pillar: 'Financeiro', pillarNumber: 3, pillarIcon: '\u{1F4B0}', filterIds: ['periodo', 'frota', 'transportadora', 'tipo-os']},
  {id: 'parts', label: 'Pecas e Estoque', pillar: 'Financeiro', pillarNumber: 3, pillarIcon: '\u{1F4B0}', filterIds: ['periodo', 'categoria', 'abc']},
  {id: 'employees', label: 'Desempenho', pillar: 'Pessoas', pillarNumber: 4, pillarIcon: '\u{1F465}', filterIds: ['periodo', 'turno', 'cargo']},
  {id: 'checklists', label: 'Checklists', pillar: 'Qualidade', pillarNumber: 5, pillarIcon: '\u2705', filterIds: ['periodo', 'frota', 'template']},
  {id: 'emergency', label: 'Socorro', pillar: 'Qualidade', pillarNumber: 5, pillarIcon: '\u2705', filterIds: ['periodo', 'frota', 'tipo-problema']},
  {id: 'preventive', label: 'Manut. Preventiva', pillar: 'Prevencao', pillarNumber: 6, pillarIcon: '\u{1F6E1}\uFE0F', filterIds: ['periodo', 'frota', 'tipo-plano', 'severidade']},
];

// ── Colors ──────────────────────────────────────────────
const co = {
  primary: 'hsl(233, 65%, 50%)',
  primaryBg: 'hsla(233, 65%, 50%, 0.08)',
  primaryBorder: 'hsla(233, 65%, 50%, 0.25)',
  cardBg: 'var(--ifm-background-color, #fff)',
  cardBorder: 'var(--ifm-color-emphasis-200, #e5e5e5)',
  muted: 'var(--ifm-color-emphasis-600, #888)',
  mutedBg: 'var(--ifm-color-emphasis-100, #f5f5f5)',
  text: 'var(--ifm-font-color-base, #1a1a1a)',
  kept: 'hsl(142, 71%, 35%)',
  keptBg: 'hsla(142, 76%, 36%, 0.1)',
  keptBorder: 'hsla(142, 76%, 36%, 0.3)',
  reset: 'hsl(0, 72%, 50%)',
  resetBg: 'hsla(0, 84%, 60%, 0.08)',
  resetBorder: 'hsla(0, 84%, 60%, 0.25)',
  newFilter: 'hsl(215, 16%, 47%)',
  newBg: 'hsla(215, 16%, 47%, 0.08)',
  newBorder: 'hsla(215, 16%, 47%, 0.2)',
};

// ── Styles ──────────────────────────────────────────────
const st = {
  wrapper: {
    fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
    fontSize: '0.875rem',
    lineHeight: 1.5,
  } as CSSProperties,
  container: {
    border: `1px solid ${co.cardBorder}`,
    borderRadius: '0.75rem',
    overflow: 'hidden',
    background: co.cardBg,
  } as CSSProperties,
  // Top: page selector
  topBar: {
    padding: '1rem 1.25rem',
    borderBottom: `1px solid ${co.cardBorder}`,
    background: co.mutedBg,
  } as CSSProperties,
  topLabel: {
    fontSize: '0.72rem',
    fontWeight: 700,
    color: co.muted,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    margin: '0 0 0.5rem',
  } as CSSProperties,
  pageGrid: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.35rem',
  } as CSSProperties,
  pageBtn: (active: boolean) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.4rem 0.7rem',
    borderRadius: '0.5rem',
    border: `1px solid ${active ? co.primaryBorder : co.cardBorder}`,
    background: active ? co.primaryBg : co.cardBg,
    color: active ? co.primary : co.text,
    cursor: 'pointer',
    fontSize: '0.78rem',
    fontWeight: active ? 600 : 400,
    transition: 'all 0.15s',
    whiteSpace: 'nowrap' as const,
  }) as CSSProperties,
  pageBtnPillar: {
    fontSize: '0.65rem',
    opacity: 0.7,
  } as CSSProperties,
  // Instruction
  instruction: {
    padding: '0.75rem 1.25rem',
    borderBottom: `1px solid ${co.cardBorder}`,
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  } as CSSProperties,
  instructionText: {
    fontSize: '0.82rem',
    color: co.text,
    margin: 0,
  } as CSSProperties,
  instructionHighlight: {
    fontWeight: 700,
    color: co.primary,
  } as CSSProperties,
  // Current state
  stateSection: {
    padding: '1rem 1.25rem',
    borderBottom: `1px solid ${co.cardBorder}`,
  } as CSSProperties,
  stateLabel: {
    fontSize: '0.72rem',
    fontWeight: 700,
    color: co.muted,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    margin: '0 0 0.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  } as CSSProperties,
  statePillarBadge: {
    fontSize: '0.65rem',
    fontWeight: 700,
    padding: '0.1rem 0.5rem',
    borderRadius: '9999px',
    background: co.primaryBg,
    color: co.primary,
    textTransform: 'none' as const,
    letterSpacing: '0',
  } as CSSProperties,
  chipRow: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.5rem',
    alignItems: 'center',
  } as CSSProperties,
  chip: (variant: 'active' | 'inactive' | 'kept' | 'reset' | 'new') => {
    const variants: Record<string, {bg: string; border: string; color: string}> = {
      active: {bg: co.primaryBg, border: co.primaryBorder, color: co.primary},
      inactive: {bg: co.cardBg, border: co.cardBorder, color: co.text},
      kept: {bg: co.keptBg, border: co.keptBorder, color: co.kept},
      reset: {bg: co.resetBg, border: co.resetBorder, color: co.reset},
      new: {bg: co.newBg, border: co.newBorder, color: co.newFilter},
    };
    const v = variants[variant];
    return {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.35rem',
      padding: '0.4rem 0.75rem',
      borderRadius: '9999px',
      border: `1.5px solid ${v.border}`,
      background: v.bg,
      color: v.color,
      fontSize: '0.8rem',
      fontWeight: 600,
      whiteSpace: 'nowrap' as const,
      transition: 'all 0.3s',
    } as CSSProperties;
  },
  chipIcon: {
    fontSize: '0.7rem',
    fontWeight: 800,
  } as CSSProperties,
  chipLabel: {
    fontSize: '0.68rem',
    fontWeight: 400,
    opacity: 0.8,
  } as CSSProperties,
  // Activate button
  activateBar: {
    padding: '0.75rem 1.25rem',
    borderBottom: `1px solid ${co.cardBorder}`,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap' as const,
  } as CSSProperties,
  activateLabel: {
    fontSize: '0.72rem',
    color: co.muted,
    fontWeight: 500,
  } as CSSProperties,
  activateBtn: {
    padding: '0.3rem 0.6rem',
    borderRadius: '9999px',
    border: `1px solid ${co.cardBorder}`,
    background: co.cardBg,
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: 500,
    transition: 'all 0.15s',
    color: co.text,
  } as CSSProperties,
  activateAllBtn: {
    padding: '0.3rem 0.6rem',
    borderRadius: '9999px',
    border: `1px solid ${co.primaryBorder}`,
    background: co.primaryBg,
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: co.primary,
    transition: 'all 0.15s',
  } as CSSProperties,
  // Transition log
  logSection: {
    padding: '1rem 1.25rem',
  } as CSSProperties,
  logLabel: {
    fontSize: '0.72rem',
    fontWeight: 700,
    color: co.muted,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    margin: '0 0 0.5rem',
  } as CSSProperties,
  logEmpty: {
    fontSize: '0.8rem',
    color: co.muted,
    fontStyle: 'italic' as const,
    padding: '0.5rem 0',
  } as CSSProperties,
  logEntry: {
    padding: '0.6rem 0.75rem',
    borderRadius: '0.5rem',
    border: `1px solid ${co.cardBorder}`,
    marginBottom: '0.5rem',
    fontSize: '0.78rem',
    lineHeight: 1.6,
  } as CSSProperties,
  logRoute: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.35rem',
    fontWeight: 600,
    fontSize: '0.8rem',
  } as CSSProperties,
  logArrow: {
    color: co.muted,
    fontSize: '0.7rem',
  } as CSSProperties,
  logItems: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.25rem',
    marginTop: '0.25rem',
  } as CSSProperties,
  logPill: (variant: 'kept' | 'reset' | 'new') => {
    const variants: Record<string, {bg: string; color: string}> = {
      kept: {bg: co.keptBg, color: co.kept},
      reset: {bg: co.resetBg, color: co.reset},
      new: {bg: co.newBg, color: co.newFilter},
    };
    const v = variants[variant];
    return {
      fontSize: '0.68rem',
      padding: '0.1rem 0.45rem',
      borderRadius: '9999px',
      background: v.bg,
      color: v.color,
      fontWeight: 600,
    } as CSSProperties;
  },
  // Legend
  legend: {
    padding: '0.75rem 1.25rem',
    borderTop: `1px solid ${co.cardBorder}`,
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '1rem',
    background: co.mutedBg,
  } as CSSProperties,
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    fontSize: '0.72rem',
    color: co.text,
  } as CSSProperties,
  legendDot: (color: string) => ({
    width: 10,
    height: 10,
    borderRadius: '50%',
    background: color,
    flexShrink: 0,
  }) as CSSProperties,
  note: {
    padding: '0.75rem 1rem',
    background: co.mutedBg,
    borderRadius: '0.5rem',
    fontSize: '0.8rem',
    color: co.muted,
    lineHeight: 1.6,
    marginTop: '1rem',
  } as CSSProperties,
};

// ── Main Component ──────────────────────────────────────
export function ChipTransitionMockup(): ReactNode {
  const [currentPageId, setCurrentPageId] = useState('work-orders');
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({
    periodo: 'Jul 2026',
    frota: 'Frota A',
    transportadora: 'Trans. Norte',
    'tipo-os': 'Corretiva',
    prioridade: 'Alta',
  });
  const [logs, setLogs] = useState<TransitionLog[]>([]);
  const [lastTransition, setLastTransition] = useState<TransitionLog | null>(null);

  const currentPage = navPages.find((p) => p.id === currentPageId)!;

  function navigateTo(targetPageId: string) {
    if (targetPageId === currentPageId) return;

    const fromPage = currentPage;
    const toPage = navPages.find((p) => p.id === targetPageId)!;
    const targetFilterSet = new Set(toPage.filterIds);

    const kept: string[] = [];
    const reset: string[] = [];
    const newFilters: string[] = [];
    const nextFilters: Record<string, string> = {};

    // Process currently active filters
    for (const [filterId, value] of Object.entries(activeFilters)) {
      if (targetFilterSet.has(filterId)) {
        // Filter exists in target page -> KEEP
        kept.push(filterId);
        nextFilters[filterId] = value;
      } else {
        // Filter doesn't exist in target page -> RESET
        reset.push(filterId);
      }
    }

    // Find filters in target that are new (not in current active)
    for (const filterId of toPage.filterIds) {
      if (!activeFilters[filterId]) {
        newFilters.push(filterId);
      }
    }

    const log: TransitionLog = {
      from: fromPage.label,
      to: toPage.label,
      kept,
      reset,
      newFilters,
    };

    setActiveFilters(nextFilters);
    setCurrentPageId(targetPageId);
    setLastTransition(log);
    setLogs((prev) => [log, ...prev].slice(0, 5));
  }

  function activateFilter(filterId: string) {
    const reg = FILTER_REGISTRY[filterId];
    if (reg) {
      setActiveFilters((prev) => ({...prev, [filterId]: reg.sampleValue}));
    }
  }

  function activateAll() {
    const next: Record<string, string> = {};
    for (const fId of currentPage.filterIds) {
      const reg = FILTER_REGISTRY[fId];
      if (reg) next[fId] = activeFilters[fId] || reg.sampleValue;
    }
    setActiveFilters(next);
  }

  function deactivateFilter(filterId: string) {
    setActiveFilters((prev) => {
      const next = {...prev};
      delete next[filterId];
      return next;
    });
  }

  // Compute chip states for display
  function getChipVariant(filterId: string): 'active' | 'inactive' | 'kept' | 'reset' | 'new' {
    if (!lastTransition) {
      return activeFilters[filterId] ? 'active' : 'inactive';
    }
    if (lastTransition.kept.includes(filterId)) return 'kept';
    if (lastTransition.newFilters.includes(filterId)) return 'new';
    return activeFilters[filterId] ? 'active' : 'inactive';
  }

  // Inactive filters for this page (can activate)
  const inactiveFilters = currentPage.filterIds.filter((fId) => !activeFilters[fId]);

  // Group pages by pillar for display
  const pillarOrder = [...new Set(navPages.map((p) => p.pillar))];

  return (
    <div style={st.wrapper}>
      <div style={st.container}>
        {/* Page selector */}
        <div style={st.topBar}>
          <p style={st.topLabel}>Clique para navegar entre paginas</p>
          <div style={st.pageGrid}>
            {pillarOrder.map((pillar) => {
              const pillarPages = navPages.filter((p) => p.pillar === pillar);
              return pillarPages.map((page) => (
                <button
                  key={page.id}
                  style={st.pageBtn(currentPageId === page.id)}
                  onClick={() => navigateTo(page.id)}
                  onMouseEnter={(e) => {if (currentPageId !== page.id) e.currentTarget.style.background = co.primaryBg;}}
                  onMouseLeave={(e) => {if (currentPageId !== page.id) e.currentTarget.style.background = co.cardBg;}}
                >
                  <span style={st.pageBtnPillar}>{page.pillarIcon}</span>
                  {page.label}
                </button>
              ));
            })}
          </div>
        </div>

        {/* Current page info */}
        <div style={st.instruction}>
          <p style={st.instructionText}>
            Pagina atual: <span style={st.instructionHighlight}>{currentPage.pillarIcon} {currentPage.pillar} &gt; {currentPage.label}</span>
          </p>
        </div>

        {/* Current chips state */}
        <div style={st.stateSection}>
          <p style={st.stateLabel}>
            Chips de filtro
            <span style={st.statePillarBadge}>{currentPage.filterIds.length} filtros nesta pagina</span>
          </p>
          <div style={st.chipRow}>
            {currentPage.filterIds.map((filterId) => {
              const reg = FILTER_REGISTRY[filterId];
              const isActive = !!activeFilters[filterId];
              const variant = getChipVariant(filterId);
              const displayLabel = isActive ? activeFilters[filterId] : reg.defaultLabel;

              const variantIcons: Record<string, string> = {
                kept: '\u2713',
                reset: '',
                new: '',
                active: '',
                inactive: '',
              };
              const variantLabels: Record<string, string> = {
                kept: 'mantido',
                new: 'novo',
                active: '',
                inactive: '',
              };

              return (
                <div key={filterId} style={{position: 'relative'}}>
                  <button
                    style={st.chip(variant)}
                    onClick={() => isActive ? deactivateFilter(filterId) : activateFilter(filterId)}
                    title={isActive ? 'Clique para desativar' : 'Clique para ativar'}
                  >
                    {variantIcons[variant] && <span style={st.chipIcon}>{variantIcons[variant]}</span>}
                    {displayLabel}
                    {isActive && (
                      <span
                        style={{fontSize: '0.65rem', cursor: 'pointer', opacity: 0.7}}
                        onClick={(e) => {e.stopPropagation(); deactivateFilter(filterId);}}
                      >
                        \u2715
                      </span>
                    )}
                    {variantLabels[variant] && (
                      <span style={st.chipLabel}>{variantLabels[variant]}</span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Activate buttons */}
        {inactiveFilters.length > 0 && (
          <div style={st.activateBar}>
            <span style={st.activateLabel}>Ativar filtros:</span>
            {inactiveFilters.map((fId) => (
              <button
                key={fId}
                style={st.activateBtn}
                onClick={() => activateFilter(fId)}
                onMouseEnter={(e) => {e.currentTarget.style.background = co.mutedBg;}}
                onMouseLeave={(e) => {e.currentTarget.style.background = co.cardBg;}}
              >
                + {FILTER_REGISTRY[fId].label}
              </button>
            ))}
            {inactiveFilters.length > 1 && (
              <button style={st.activateAllBtn} onClick={activateAll}>
                Ativar todos
              </button>
            )}
          </div>
        )}

        {/* Transition log */}
        <div style={st.logSection}>
          <p style={st.logLabel}>Historico de transicoes</p>
          {logs.length === 0 ? (
            <p style={st.logEmpty}>Navegue entre paginas para ver como os filtros se comportam.</p>
          ) : (
            logs.map((log, i) => (
              <div key={i} style={st.logEntry}>
                <div style={st.logRoute}>
                  <span>{log.from}</span>
                  <span style={st.logArrow}>\u2192</span>
                  <span style={{color: co.primary}}>{log.to}</span>
                </div>
                <div style={st.logItems}>
                  {log.kept.map((fId) => (
                    <span key={fId} style={st.logPill('kept')}>
                      \u2713 {FILTER_REGISTRY[fId].label}
                    </span>
                  ))}
                  {log.reset.map((fId) => (
                    <span key={fId} style={st.logPill('reset')}>
                      \u2715 {FILTER_REGISTRY[fId].label}
                    </span>
                  ))}
                  {log.newFilters.map((fId) => (
                    <span key={fId} style={st.logPill('new')}>
                      + {FILTER_REGISTRY[fId].label}
                    </span>
                  ))}
                  {log.kept.length === 0 && log.reset.length === 0 && log.newFilters.length === 0 && (
                    <span style={{fontSize: '0.72rem', color: co.muted}}>Sem filtros ativos na transicao</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Legend */}
        <div style={st.legend}>
          <div style={st.legendItem}>
            <span style={st.legendDot(co.kept)} />
            <span><strong>Mantido</strong> — filtro existe na pagina destino, valor preservado</span>
          </div>
          <div style={st.legendItem}>
            <span style={st.legendDot(co.reset)} />
            <span><strong>Resetado</strong> — filtro nao existe na pagina destino, valor perdido</span>
          </div>
          <div style={st.legendItem}>
            <span style={st.legendDot(co.newFilter)} />
            <span><strong>Novo</strong> — filtro aparece na pagina destino mas nao estava ativo antes</span>
          </div>
        </div>
      </div>

      <div style={st.note}>
        <strong>Interativo:</strong> Clique nas paginas para navegar. Observe:
        <ul style={{margin: '0.25rem 0 0', paddingLeft: '1.25rem'}}>
          <li><strong>OS {'\u2192'} Indicadores</strong> (mesmo pilar) — Periodo e Frota mantidos, Tipo OS e Prioridade resetados</li>
          <li><strong>OS {'\u2192'} Custos</strong> (pilar diferente, filtros em comum) — Periodo, Frota, Transportadora e Tipo OS mantidos, Prioridade resetado</li>
          <li><strong>OS {'\u2192'} Desempenho</strong> (pilar diferente, poucos em comum) — So Periodo mantido, Turno e Cargo aparecem como novos</li>
          <li>Use os botoes "Ativar" para simular filtros ativos antes de navegar</li>
        </ul>
      </div>
    </div>
  );
}
