import {useState, type CSSProperties, type ReactNode} from 'react';

// ── Types ──────────────────────────────────────────────
interface FilterOption {
  label: string;
  value: string;
}

interface ChipFilter {
  id: string;
  label: string;
  defaultLabel: string;
  options: FilterOption[];
  description: string;
}

interface PageDef {
  id: string;
  label: string;
  pillar: string;
  pillarNumber: number;
  pillarIcon: string;
  filters: ChipFilter[];
}

// ── Filter definitions ─────────────────────────────────
const PERIODO: ChipFilter = {
  id: 'periodo',
  label: 'Periodo',
  defaultLabel: 'Jul 2026',
  options: [
    {label: 'Hoje', value: 'hoje'},
    {label: 'Ultimos 7 dias', value: '7d'},
    {label: 'Ultimos 30 dias', value: '30d'},
    {label: 'Este mes', value: 'mes'},
    {label: 'Ultimo trimestre', value: 'tri'},
    {label: 'Personalizado...', value: 'custom'},
  ],
  description: 'Periodo de analise. Presente em TODAS as paginas.',
};

const FROTA: ChipFilter = {
  id: 'frota',
  label: 'Frota',
  defaultLabel: 'Todas Frotas',
  options: [
    {label: 'Frota A — Pesados', value: 'a'},
    {label: 'Frota B — Leves', value: 'b'},
    {label: 'Frota C — Utilitarios', value: 'c'},
    {label: 'Frota D — Maquinas', value: 'd'},
  ],
  description: 'Filtra por frota especifica. Util para comparar frotas.',
};

const TRANSPORTADORA: ChipFilter = {
  id: 'transportadora',
  label: 'Transportadora',
  defaultLabel: 'Todas Transp.',
  options: [
    {label: 'Transportes Norte', value: 'norte'},
    {label: 'Transportes Sul', value: 'sul'},
    {label: 'Logistica Express', value: 'express'},
  ],
  description: 'Filtra por transportadora parceira.',
};

const TIPO_OS: ChipFilter = {
  id: 'tipo-os',
  label: 'Tipo de OS',
  defaultLabel: 'Todos Tipos',
  options: [
    {label: 'Corretiva', value: 'corretiva'},
    {label: 'Preventiva', value: 'preventiva'},
    {label: 'Emergencia', value: 'emergencia'},
    {label: 'Inspecao', value: 'inspecao'},
  ],
  description: 'Filtra por tipo de ordem de servico.',
};

const PRIORIDADE: ChipFilter = {
  id: 'prioridade',
  label: 'Prioridade',
  defaultLabel: 'Todas Prior.',
  options: [
    {label: 'Critica', value: 'critica'},
    {label: 'Alta', value: 'alta'},
    {label: 'Media', value: 'media'},
    {label: 'Baixa', value: 'baixa'},
  ],
  description: 'Filtra por prioridade da OS. Permite focar nos urgentes.',
};

const TURNO: ChipFilter = {
  id: 'turno',
  label: 'Turno',
  defaultLabel: 'Todos Turnos',
  options: [
    {label: 'Diurno (06h-14h)', value: 'diurno'},
    {label: 'Vespertino (14h-22h)', value: 'vespertino'},
    {label: 'Noturno (22h-06h)', value: 'noturno'},
  ],
  description: 'Filtra por turno de trabalho. Exclusivo do pilar Pessoas.',
};

const CARGO: ChipFilter = {
  id: 'cargo',
  label: 'Cargo',
  defaultLabel: 'Todos Cargos',
  options: [
    {label: 'Mecanico', value: 'mecanico'},
    {label: 'Eletricista', value: 'eletricista'},
    {label: 'Borracheiro', value: 'borracheiro'},
    {label: 'Auxiliar', value: 'auxiliar'},
  ],
  description: 'Filtra por funcao/cargo. Exclusivo do pilar Pessoas.',
};

const MARCA_PNEU: ChipFilter = {
  id: 'marca',
  label: 'Marca',
  defaultLabel: 'Todas Marcas',
  options: [
    {label: 'Michelin', value: 'michelin'},
    {label: 'Bridgestone', value: 'bridgestone'},
    {label: 'Goodyear', value: 'goodyear'},
    {label: 'Pirelli', value: 'pirelli'},
    {label: 'Continental', value: 'continental'},
  ],
  description: 'Filtra por marca de pneu. Exclusivo da pagina de Pneus.',
};

const STATUS_PNEU: ChipFilter = {
  id: 'status-pneu',
  label: 'Status',
  defaultLabel: 'Todos Status',
  options: [
    {label: 'Em Uso', value: 'em-uso'},
    {label: 'Estoque', value: 'estoque'},
    {label: 'Recapagem', value: 'recapagem'},
    {label: 'Condenado', value: 'condenado'},
  ],
  description: 'Filtra por status do pneu no ciclo de vida.',
};

const CATEGORIA_PECA: ChipFilter = {
  id: 'categoria',
  label: 'Categoria',
  defaultLabel: 'Todas Categ.',
  options: [
    {label: 'Rolamentos', value: 'rolamentos'},
    {label: 'Filtros', value: 'filtros'},
    {label: 'Freios', value: 'freios'},
    {label: 'Eletrica', value: 'eletrica'},
    {label: 'Suspensao', value: 'suspensao'},
  ],
  description: 'Filtra por categoria de peca/insumo.',
};

const ABC: ChipFilter = {
  id: 'abc',
  label: 'Classificacao ABC',
  defaultLabel: 'Todas Classes',
  options: [
    {label: 'Classe A — 80% do custo', value: 'a'},
    {label: 'Classe B — 15% do custo', value: 'b'},
    {label: 'Classe C — 5% do custo', value: 'c'},
  ],
  description: 'Filtra pela classificacao Pareto de custo das pecas.',
};

const TEMPLATE: ChipFilter = {
  id: 'template',
  label: 'Template',
  defaultLabel: 'Todos Templates',
  options: [
    {label: 'Insp. Rodagem', value: 'rodagem'},
    {label: 'Insp. Eletrica', value: 'eletrica'},
    {label: 'Insp. Estrutural', value: 'estrutural'},
    {label: 'Insp. Saida', value: 'saida'},
  ],
  description: 'Filtra por modelo de checklist/inspecao.',
};

const TIPO_PROBLEMA: ChipFilter = {
  id: 'tipo-problema',
  label: 'Tipo de Problema',
  defaultLabel: 'Todos Problemas',
  options: [
    {label: 'Pneu furado', value: 'pneu'},
    {label: 'Motor', value: 'motor'},
    {label: 'Freio', value: 'freio'},
    {label: 'Eletrica', value: 'eletrica'},
    {label: 'Outros', value: 'outros'},
  ],
  description: 'Filtra por tipo de problema no chamado de socorro.',
};

const TIPO_PLANO: ChipFilter = {
  id: 'tipo-plano',
  label: 'Tipo de Plano',
  defaultLabel: 'Todos Planos',
  options: [
    {label: 'Preventiva por KM', value: 'km'},
    {label: 'Preventiva por Tempo', value: 'tempo'},
    {label: 'Preventiva por Horimetro', value: 'horimetro'},
  ],
  description: 'Filtra por tipo de gatilho do plano preventivo.',
};

const SEVERIDADE: ChipFilter = {
  id: 'severidade',
  label: 'Severidade',
  defaultLabel: 'Todas Sever.',
  options: [
    {label: 'Critica — Parada obrigatoria', value: 'critica'},
    {label: 'Alta — Programar urgente', value: 'alta'},
    {label: 'Media — Programar', value: 'media'},
    {label: 'Baixa — Proximo agendamento', value: 'baixa'},
  ],
  description: 'Filtra por severidade do alerta de manutencao vencida.',
};

// ── Pages ───────────────────────────────────────────────
const pages: PageDef[] = [
  {id: 'overview', label: 'Visao Geral', pillar: 'Operacional', pillarNumber: 1, pillarIcon: '\u{1F527}', filters: [PERIODO, FROTA]},
  {id: 'work-orders', label: 'Ordens de Servico', pillar: 'Operacional', pillarNumber: 1, pillarIcon: '\u{1F527}', filters: [PERIODO, FROTA, TRANSPORTADORA, TIPO_OS, PRIORIDADE]},
  {id: 'kpis', label: 'Indicadores', pillar: 'Operacional', pillarNumber: 1, pillarIcon: '\u{1F527}', filters: [PERIODO, FROTA]},
  {id: 'fleet', label: 'Frota', pillar: 'Ativos', pillarNumber: 2, pillarIcon: '\u{1F69B}', filters: [PERIODO, FROTA, TRANSPORTADORA]},
  {id: 'tires', label: 'Pneus', pillar: 'Ativos', pillarNumber: 2, pillarIcon: '\u{1F69B}', filters: [PERIODO, FROTA, MARCA_PNEU, STATUS_PNEU]},
  {id: 'costs', label: 'Custos', pillar: 'Financeiro', pillarNumber: 3, pillarIcon: '\u{1F4B0}', filters: [PERIODO, FROTA, TRANSPORTADORA, TIPO_OS]},
  {id: 'parts', label: 'Pecas e Estoque', pillar: 'Financeiro', pillarNumber: 3, pillarIcon: '\u{1F4B0}', filters: [PERIODO, CATEGORIA_PECA, ABC]},
  {id: 'employees', label: 'Desempenho', pillar: 'Pessoas', pillarNumber: 4, pillarIcon: '\u{1F465}', filters: [PERIODO, TURNO, CARGO]},
  {id: 'checklists', label: 'Checklists', pillar: 'Qualidade', pillarNumber: 5, pillarIcon: '\u2705', filters: [PERIODO, FROTA, TEMPLATE]},
  {id: 'emergency', label: 'Socorro', pillar: 'Qualidade', pillarNumber: 5, pillarIcon: '\u2705', filters: [PERIODO, FROTA, TIPO_PROBLEMA]},
  {id: 'preventive', label: 'Manutencao Preventiva', pillar: 'Prevencao', pillarNumber: 6, pillarIcon: '\u{1F6E1}\uFE0F', filters: [PERIODO, FROTA, TIPO_PLANO, SEVERIDADE]},
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
  chipActive: 'hsl(233, 65%, 50%)',
  chipActiveBg: 'hsla(233, 65%, 50%, 0.1)',
  chipActiveBorder: 'hsla(233, 65%, 50%, 0.3)',
  highlight: 'hsla(233, 65%, 50%, 0.04)',
  newBadge: 'hsl(25, 95%, 53%)',
  newBadgeBg: 'hsla(25, 95%, 53%, 0.12)',
};

// ── Styles ──────────────────────────────────────────────
const st = {
  wrapper: {
    fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
    fontSize: '0.875rem',
    lineHeight: 1.5,
  } as CSSProperties,
  pageCard: (active: boolean) => ({
    border: `1px solid ${active ? co.primaryBorder : co.cardBorder}`,
    borderRadius: '0.75rem',
    overflow: 'hidden',
    marginBottom: '0.75rem',
    background: active ? co.highlight : co.cardBg,
    transition: 'all 0.2s',
    cursor: 'pointer',
  }) as CSSProperties,
  pageHeader: {
    padding: '0.75rem 1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  } as CSSProperties,
  pillarBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.2rem 0.6rem',
    borderRadius: '9999px',
    background: co.primaryBg,
    color: co.primary,
    fontSize: '0.7rem',
    fontWeight: 700,
    flexShrink: 0,
  } as CSSProperties,
  pageTitle: {
    fontSize: '0.9rem',
    fontWeight: 700,
    margin: 0,
    flex: 1,
    color: co.text,
  } as CSSProperties,
  filterCount: {
    fontSize: '0.72rem',
    fontWeight: 600,
    color: co.muted,
    padding: '0.15rem 0.5rem',
    borderRadius: '9999px',
    background: co.mutedBg,
  } as CSSProperties,
  chevron: (open: boolean) => ({
    fontSize: '0.6rem',
    color: co.muted,
    transition: 'transform 0.2s',
    transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
  }) as CSSProperties,
  // Expanded content
  expandedContent: {
    borderTop: `1px solid ${co.cardBorder}`,
  } as CSSProperties,
  chipBar: {
    padding: '0.75rem 1rem',
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.5rem',
    alignItems: 'center',
    background: co.mutedBg,
    borderBottom: `1px solid ${co.cardBorder}`,
  } as CSSProperties,
  chipLabel: {
    fontSize: '0.68rem',
    fontWeight: 700,
    color: co.muted,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  } as CSSProperties,
  chip: (active: boolean) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.4rem 0.75rem',
    borderRadius: '9999px',
    border: `1px solid ${active ? co.chipActiveBorder : co.cardBorder}`,
    background: active ? co.chipActiveBg : co.cardBg,
    color: active ? co.chipActive : co.text,
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: active ? 600 : 400,
    transition: 'all 0.15s',
    whiteSpace: 'nowrap' as const,
  }) as CSSProperties,
  chipCloseBtn: {
    width: 15,
    height: 15,
    borderRadius: '50%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'hsla(233, 65%, 50%, 0.2)',
    color: co.primary,
    fontSize: '0.55rem',
    fontWeight: 700,
    cursor: 'pointer',
    border: 'none',
    lineHeight: 1,
  } as CSSProperties,
  chipChevron: {
    fontSize: '0.5rem',
    color: co.muted,
  } as CSSProperties,
  // Dropdown preview
  dropdown: {
    position: 'relative' as const,
    display: 'inline-block',
  } as CSSProperties,
  dropdownMenu: {
    position: 'absolute' as const,
    top: '100%',
    left: 0,
    marginTop: 4,
    background: co.cardBg,
    border: `1px solid ${co.cardBorder}`,
    borderRadius: '0.5rem',
    boxShadow: '0 8px 24px hsla(0,0%,0%,0.12)',
    padding: '4px',
    zIndex: 50,
    minWidth: 200,
    whiteSpace: 'nowrap' as const,
  } as CSSProperties,
  dropdownItem: (active: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 10px',
    borderRadius: '0.375rem',
    fontSize: '0.8rem',
    cursor: 'pointer',
    border: 'none',
    background: active ? co.primaryBg : 'transparent',
    width: '100%',
    textAlign: 'left' as const,
    color: active ? co.primary : 'inherit',
    fontWeight: active ? 600 : 400,
    transition: 'background 0.1s',
  }) as CSSProperties,
  dropdownRadio: (active: boolean) => ({
    width: 14,
    height: 14,
    borderRadius: '50%',
    border: `2px solid ${active ? co.primary : co.cardBorder}`,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  }) as CSSProperties,
  dropdownRadioDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: co.primary,
  } as CSSProperties,
  // Filter detail
  filterDetail: {
    padding: '0.75rem 1rem',
  } as CSSProperties,
  filterDetailGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '0.75rem',
  } as CSSProperties,
  filterCard: (selected: boolean) => ({
    padding: '0.75rem',
    borderRadius: '0.5rem',
    border: `1px solid ${selected ? co.primaryBorder : co.cardBorder}`,
    background: selected ? co.highlight : co.cardBg,
    cursor: 'pointer',
    transition: 'all 0.15s',
  }) as CSSProperties,
  filterCardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '0.5rem',
  } as CSSProperties,
  filterCardName: {
    fontSize: '0.82rem',
    fontWeight: 700,
    color: co.text,
  } as CSSProperties,
  filterCardNew: {
    fontSize: '0.6rem',
    fontWeight: 700,
    padding: '1px 6px',
    borderRadius: '9999px',
    background: co.newBadgeBg,
    color: co.newBadge,
    textTransform: 'uppercase' as const,
  } as CSSProperties,
  filterCardDesc: {
    fontSize: '0.72rem',
    color: co.muted,
    margin: '0 0 0.5rem',
    lineHeight: 1.4,
  } as CSSProperties,
  filterCardOptions: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.25rem',
  } as CSSProperties,
  optionPill: {
    fontSize: '0.68rem',
    padding: '0.15rem 0.5rem',
    borderRadius: '9999px',
    background: co.mutedBg,
    color: co.muted,
    fontWeight: 500,
  } as CSSProperties,
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

// Filters exclusive to a pillar (not shared with others)
const sharedFilters = new Set(['periodo', 'frota', 'transportadora']);

// ── Main Component ──────────────────────────────────────
export function ChipFiltersMockup(): ReactNode {
  const [expandedPage, setExpandedPage] = useState<string>('work-orders');
  const [activeChips, setActiveChips] = useState<Record<string, string>>({});
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  function togglePage(pageId: string) {
    setExpandedPage(expandedPage === pageId ? '' : pageId);
    setActiveChips({});
    setOpenDropdown(null);
  }

  function toggleChip(filterId: string, value?: string) {
    setActiveChips((prev) => {
      const next = {...prev};
      if (next[filterId]) {
        delete next[filterId];
      } else {
        next[filterId] = value || '';
      }
      return next;
    });
    setOpenDropdown(null);
  }

  function handleChipClick(filterId: string) {
    if (activeChips[filterId]) {
      // Already active, deactivate
      toggleChip(filterId);
    } else {
      // Open dropdown
      setOpenDropdown(openDropdown === filterId ? null : filterId);
    }
  }

  function selectOption(filterId: string, value: string) {
    setActiveChips((prev) => ({...prev, [filterId]: value}));
    setOpenDropdown(null);
  }

  // Group pages by pillar
  const pillarGroups: {pillar: string; number: number; icon: string; pages: PageDef[]}[] = [];
  for (const page of pages) {
    const existing = pillarGroups.find((g) => g.pillar === page.pillar);
    if (existing) {
      existing.pages.push(page);
    } else {
      pillarGroups.push({pillar: page.pillar, number: page.pillarNumber, icon: page.pillarIcon, pages: [page]});
    }
  }

  return (
    <div style={st.wrapper}>
      {pillarGroups.map((group) => (
        <div key={group.pillar} style={{marginBottom: '1.5rem'}}>
          <h4 style={{
            fontSize: '0.82rem',
            fontWeight: 700,
            color: co.primary,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            margin: '0 0 0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <span style={{
              width: 22, height: 22, borderRadius: '50%',
              background: co.primary, color: '#fff',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.65rem', fontWeight: 800,
            }}>{group.number}</span>
            {group.icon} {group.pillar}
          </h4>

          {group.pages.map((page) => {
            const isExpanded = expandedPage === page.id;
            return (
              <div key={page.id} style={st.pageCard(isExpanded)}>
                {/* Header */}
                <div
                  style={st.pageHeader}
                  onClick={() => togglePage(page.id)}
                >
                  <p style={st.pageTitle}>{page.label}</p>
                  <span style={st.filterCount}>{page.filters.length} filtros</span>
                  <span style={st.chevron(isExpanded)}>&#9660;</span>
                </div>

                {/* Expanded */}
                {isExpanded && (
                  <div style={st.expandedContent}>
                    {/* Live chip bar */}
                    <div style={st.chipBar}>
                      <span style={st.chipLabel}>Filtros</span>
                      {page.filters.map((filter) => {
                        const isActive = !!activeChips[filter.id];
                        const isDropdownOpen = openDropdown === filter.id;
                        return (
                          <div key={filter.id} style={st.dropdown}>
                            <button
                              style={st.chip(isActive)}
                              onClick={() => handleChipClick(filter.id)}
                              onMouseEnter={(e) => {if (!isActive) {e.currentTarget.style.background = co.mutedBg;}}}
                              onMouseLeave={(e) => {if (!isActive) {e.currentTarget.style.background = co.cardBg;}}}
                            >
                              {isActive
                                ? filter.options.find((o) => o.value === activeChips[filter.id])?.label || filter.defaultLabel
                                : filter.defaultLabel
                              }
                              {isActive ? (
                                <span
                                  style={st.chipCloseBtn}
                                  onClick={(e) => {e.stopPropagation(); toggleChip(filter.id);}}
                                >
                                  &#10005;
                                </span>
                              ) : (
                                <span style={st.chipChevron}>&#9660;</span>
                              )}
                            </button>

                            {/* Dropdown */}
                            {isDropdownOpen && (
                              <div style={st.dropdownMenu}>
                                {filter.options.map((opt) => (
                                  <button
                                    key={opt.value}
                                    style={st.dropdownItem(activeChips[filter.id] === opt.value)}
                                    onClick={() => selectOption(filter.id, opt.value)}
                                    onMouseEnter={(e) => {e.currentTarget.style.background = co.mutedBg;}}
                                    onMouseLeave={(e) => {e.currentTarget.style.background = activeChips[filter.id] === opt.value ? co.primaryBg : 'transparent';}}
                                  >
                                    <span style={st.dropdownRadio(activeChips[filter.id] === opt.value)}>
                                      {activeChips[filter.id] === opt.value && <span style={st.dropdownRadioDot} />}
                                    </span>
                                    {opt.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Filter detail cards */}
                    <div style={st.filterDetail}>
                      <div style={st.filterDetailGrid}>
                        {page.filters.map((filter) => {
                          const isNew = !sharedFilters.has(filter.id);
                          const isSelected = !!activeChips[filter.id];
                          return (
                            <div
                              key={filter.id}
                              style={st.filterCard(isSelected)}
                              onClick={() => handleChipClick(filter.id)}
                            >
                              <div style={st.filterCardHeader}>
                                <span style={st.filterCardName}>{filter.label}</span>
                                {isNew && <span style={st.filterCardNew}>Novo</span>}
                              </div>
                              <p style={st.filterCardDesc}>{filter.description}</p>
                              <div style={st.filterCardOptions}>
                                {filter.options.slice(0, 4).map((opt) => (
                                  <span key={opt.value} style={st.optionPill}>{opt.label}</span>
                                ))}
                                {filter.options.length > 4 && (
                                  <span style={st.optionPill}>+{filter.options.length - 4}</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}

      <div style={st.note}>
        <strong>Interativo:</strong> Clique em qualquer pagina para expandir e ver seus filtros contextuais.
        Na barra de chips, clique para abrir o dropdown e selecionar um valor.
        Os cards abaixo mostram a descricao e opcoes disponiveis de cada filtro.
        Filtros marcados como <span style={{...st.filterCardNew, marginLeft: 4, marginRight: 4}}>Novo</span> sao exclusivos daquele pilar e precisam de suporte no backend.
      </div>
    </div>
  );
}
