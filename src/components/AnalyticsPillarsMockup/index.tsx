import {useState, type CSSProperties, type ReactNode} from 'react';

// ── Types ──────────────────────────────────────────────
interface Pillar {
  id: string;
  number: number;
  icon: string;
  label: string;
  question: string;
  pages: {id: string; label: string; filters: string[]}[];
}

// ── Pillar definitions ─────────────────────────────────
const pillars: Pillar[] = [
  {
    id: 'operacional',
    number: 1,
    icon: '\u{1F527}',
    label: 'Operacional',
    question: 'Como esta a oficina?',
    pages: [
      {id: 'overview', label: 'Visao Geral', filters: ['Periodo', 'Frota']},
      {id: 'work-orders', label: 'Ordens de Servico', filters: ['Periodo', 'Frota', 'Transportadora', 'Tipo de OS', 'Prioridade']},
      {id: 'kpis', label: 'Indicadores', filters: ['Periodo', 'Frota']},
    ],
  },
  {
    id: 'ativos',
    number: 2,
    icon: '\u{1F69B}',
    label: 'Ativos',
    question: 'Como estao meus veiculos?',
    pages: [
      {id: 'fleet', label: 'Frota', filters: ['Periodo', 'Frota', 'Transportadora']},
      {id: 'tires', label: 'Pneus', filters: ['Periodo', 'Frota', 'Marca', 'Status']},
    ],
  },
  {
    id: 'financeiro',
    number: 3,
    icon: '\u{1F4B0}',
    label: 'Financeiro',
    question: 'Quanto estou gastando?',
    pages: [
      {id: 'costs', label: 'Custos', filters: ['Periodo', 'Frota', 'Transportadora', 'Tipo de OS']},
      {id: 'parts', label: 'Pecas e Estoque', filters: ['Periodo', 'Categoria', 'Classificacao ABC']},
    ],
  },
  {
    id: 'pessoas',
    number: 4,
    icon: '\u{1F465}',
    label: 'Pessoas',
    question: 'Como esta a equipe?',
    pages: [
      {id: 'employees', label: 'Desempenho', filters: ['Periodo', 'Turno', 'Cargo']},
    ],
  },
  {
    id: 'qualidade',
    number: 5,
    icon: '\u2705',
    label: 'Qualidade',
    question: 'Estamos mantendo padrao?',
    pages: [
      {id: 'checklists', label: 'Checklists', filters: ['Periodo', 'Frota', 'Template']},
      {id: 'emergency', label: 'Socorro', filters: ['Periodo', 'Frota', 'Tipo de Problema']},
    ],
  },
  {
    id: 'prevencao',
    number: 6,
    icon: '\u{1F6E1}\uFE0F',
    label: 'Prevencao',
    question: 'Prevenindo ou apagando incendio?',
    pages: [
      {id: 'preventive', label: 'Manutencao Preventiva', filters: ['Periodo', 'Frota', 'Tipo de Plano', 'Severidade']},
    ],
  },
];

// ── Colors ──────────────────────────────────────────────
const c = {
  primary: 'hsl(233, 65%, 50%)',
  primaryBg: 'hsla(233, 65%, 50%, 0.08)',
  primaryBorder: 'hsla(233, 65%, 50%, 0.25)',
  primaryHover: 'hsla(233, 65%, 50%, 0.12)',
  cardBg: 'var(--ifm-background-color, #fff)',
  cardBorder: 'var(--ifm-color-emphasis-200, #e5e5e5)',
  muted: 'var(--ifm-color-emphasis-600, #888)',
  mutedBg: 'var(--ifm-color-emphasis-100, #f5f5f5)',
  text: 'var(--ifm-font-color-base, #1a1a1a)',
  chipActive: 'hsl(233, 65%, 50%)',
  chipActiveBg: 'hsla(233, 65%, 50%, 0.1)',
  chipActiveBorder: 'hsla(233, 65%, 50%, 0.3)',
  success: 'hsl(142, 71%, 35%)',
  successBg: 'hsla(142, 76%, 36%, 0.1)',
};

// ── Styles ──────────────────────────────────────────────
const s = {
  wrapper: {
    fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
    fontSize: '0.875rem',
    lineHeight: 1.5,
  } as CSSProperties,
  mockupContainer: {
    display: 'flex',
    border: `1px solid ${c.cardBorder}`,
    borderRadius: '0.75rem',
    overflow: 'hidden',
    minHeight: 520,
    background: c.cardBg,
  } as CSSProperties,
  // Sidebar
  sidebar: {
    width: 240,
    borderRight: `1px solid ${c.cardBorder}`,
    background: c.mutedBg,
    display: 'flex',
    flexDirection: 'column' as const,
    flexShrink: 0,
  } as CSSProperties,
  sidebarHeader: {
    padding: '1rem 1rem 0.5rem',
    borderBottom: `1px solid ${c.cardBorder}`,
  } as CSSProperties,
  sidebarLogo: {
    fontWeight: 800,
    fontSize: '1rem',
    color: c.primary,
    letterSpacing: '-0.02em',
  } as CSSProperties,
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0.75rem',
    margin: '0.5rem 0.5rem 0',
    borderRadius: '0.5rem',
    border: 'none',
    background: 'transparent',
    color: c.muted,
    cursor: 'pointer',
    fontSize: '0.78rem',
    fontWeight: 500,
    transition: 'all 0.15s',
    width: 'calc(100% - 1rem)',
    textAlign: 'left' as const,
  } as CSSProperties,
  sidebarNav: {
    flex: 1,
    padding: '0.5rem',
    overflowY: 'auto' as const,
  } as CSSProperties,
  pillarBtn: (active: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    width: '100%',
    padding: '0.5rem 0.75rem',
    borderRadius: '0.5rem',
    border: 'none',
    background: active ? c.primaryBg : 'transparent',
    color: active ? c.primary : c.text,
    cursor: 'pointer',
    fontSize: '0.82rem',
    fontWeight: active ? 600 : 500,
    transition: 'all 0.15s',
    textAlign: 'left' as const,
    position: 'relative' as const,
  }) as CSSProperties,
  pillarNumber: (active: boolean) => ({
    width: 22,
    height: 22,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.65rem',
    fontWeight: 700,
    background: active ? c.primary : 'transparent',
    color: active ? '#fff' : c.muted,
    border: active ? 'none' : `1.5px solid ${c.cardBorder}`,
    flexShrink: 0,
  }) as CSSProperties,
  pillarChevron: (open: boolean) => ({
    marginLeft: 'auto',
    fontSize: '0.6rem',
    color: c.muted,
    transition: 'transform 0.15s',
    transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
  }) as CSSProperties,
  subItems: {
    paddingLeft: '2.25rem',
    paddingBottom: '0.25rem',
  } as CSSProperties,
  subItem: (active: boolean) => ({
    display: 'block',
    width: '100%',
    padding: '0.35rem 0.75rem',
    borderRadius: '0.375rem',
    border: 'none',
    background: active ? c.primaryBg : 'transparent',
    color: active ? c.primary : c.muted,
    cursor: 'pointer',
    fontSize: '0.78rem',
    fontWeight: active ? 600 : 400,
    textAlign: 'left' as const,
    transition: 'all 0.1s',
  }) as CSSProperties,
  // Content area
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
  } as CSSProperties,
  contentHeader: {
    padding: '1rem 1.5rem',
    borderBottom: `1px solid ${c.cardBorder}`,
  } as CSSProperties,
  contentTitle: {
    margin: 0,
    fontSize: '1.1rem',
    fontWeight: 700,
    color: c.text,
  } as CSSProperties,
  contentSubtitle: {
    margin: '0.25rem 0 0',
    fontSize: '0.78rem',
    color: c.muted,
    fontStyle: 'italic' as const,
  } as CSSProperties,
  // Filter chips
  filterBar: {
    padding: '0.75rem 1.5rem',
    borderBottom: `1px solid ${c.cardBorder}`,
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.5rem',
    alignItems: 'center',
    background: c.mutedBg,
  } as CSSProperties,
  filterLabel: {
    fontSize: '0.72rem',
    fontWeight: 600,
    color: c.muted,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginRight: '0.25rem',
  } as CSSProperties,
  chip: (active: boolean) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.35rem 0.75rem',
    borderRadius: '9999px',
    border: `1px solid ${active ? c.chipActiveBorder : c.cardBorder}`,
    background: active ? c.chipActiveBg : c.cardBg,
    color: active ? c.chipActive : c.text,
    cursor: 'pointer',
    fontSize: '0.78rem',
    fontWeight: active ? 600 : 400,
    transition: 'all 0.15s',
    whiteSpace: 'nowrap' as const,
  }) as CSSProperties,
  chipClose: {
    width: 14,
    height: 14,
    borderRadius: '50%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'hsla(233, 65%, 50%, 0.2)',
    color: c.primary,
    fontSize: '0.6rem',
    fontWeight: 700,
    cursor: 'pointer',
    border: 'none',
    lineHeight: 1,
  } as CSSProperties,
  chipChevron: {
    fontSize: '0.55rem',
    color: c.muted,
    marginLeft: '0.1rem',
  } as CSSProperties,
  // Content body
  contentBody: {
    flex: 1,
    padding: '1.5rem',
    overflowY: 'auto' as const,
  } as CSSProperties,
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
    marginBottom: '1.5rem',
  } as CSSProperties,
  kpiCard: {
    padding: '1rem',
    borderRadius: '0.75rem',
    border: `1px solid ${c.cardBorder}`,
    background: c.cardBg,
  } as CSSProperties,
  kpiLabel: {
    fontSize: '0.72rem',
    fontWeight: 600,
    color: c.muted,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.04em',
    margin: 0,
  } as CSSProperties,
  kpiValue: {
    fontSize: '1.5rem',
    fontWeight: 800,
    margin: '0.25rem 0 0',
    color: c.text,
  } as CSSProperties,
  kpiTrend: (positive: boolean) => ({
    fontSize: '0.72rem',
    fontWeight: 600,
    color: positive ? c.success : 'hsl(0, 72%, 50%)',
    margin: '0.15rem 0 0',
  }) as CSSProperties,
  chartPlaceholder: {
    height: 140,
    borderRadius: '0.75rem',
    border: `1px dashed ${c.cardBorder}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: c.muted,
    fontSize: '0.82rem',
    background: c.mutedBg,
  } as CSSProperties,
  note: {
    padding: '0.75rem 1rem',
    background: c.mutedBg,
    borderRadius: '0.5rem',
    fontSize: '0.8rem',
    color: c.muted,
    lineHeight: 1.6,
    marginTop: '1rem',
  } as CSSProperties,
};

// ── KPI mock data per page ──────────────────────────────
const pageKpis: Record<string, {label: string; value: string; trend: string; positive: boolean}[]> = {
  overview: [
    {label: 'MTTR', value: '04:32h', trend: '-8.2%', positive: true},
    {label: 'Disponibilidade', value: '87.3%', trend: '+2.1%', positive: true},
    {label: 'OS Abertas', value: '23', trend: '+12%', positive: false},
  ],
  'work-orders': [
    {label: 'Total OS', value: '147', trend: '+12%', positive: false},
    {label: 'MTTR', value: '04:32h', trend: '-8.2%', positive: true},
    {label: 'Taxa Conclusao', value: '91.2%', trend: '+3.1%', positive: true},
  ],
  kpis: [
    {label: 'CPK', value: 'R$ 2.34', trend: '-5.3%', positive: true},
    {label: 'MTBF', value: '18.5 dias', trend: '+4.2%', positive: true},
    {label: 'PMP', value: '62.1%', trend: '+1.8%', positive: true},
  ],
  fleet: [
    {label: 'Veiculos', value: '84', trend: '+2', positive: true},
    {label: 'Disponibilidade', value: '87.3%', trend: '+2.1%', positive: true},
    {label: 'Custo Total', value: 'R$ 284k', trend: '+7.2%', positive: false},
  ],
  tires: [
    {label: 'Pneus Ativos', value: '412', trend: '-3', positive: false},
    {label: 'CPK Pneu', value: 'R$ 0.18', trend: '-12%', positive: true},
    {label: 'Taxa Recape', value: '34.2%', trend: '+5.1%', positive: true},
  ],
  costs: [
    {label: 'Custo Total', value: 'R$ 284k', trend: '+7.2%', positive: false},
    {label: 'Pecas', value: 'R$ 142k', trend: '+4.5%', positive: false},
    {label: 'Mao de Obra', value: 'R$ 89k', trend: '-2.1%', positive: true},
  ],
  parts: [
    {label: 'Itens em Estoque', value: '1.247', trend: '+34', positive: true},
    {label: 'Cobertura Media', value: '45 dias', trend: '+8%', positive: true},
    {label: 'Estoque Zero', value: '12', trend: '-3', positive: true},
  ],
  employees: [
    {label: 'Eficiencia', value: '78.3%', trend: '+4.2%', positive: true},
    {label: 'Utilizacao', value: '85.1%', trend: '+1.8%', positive: true},
    {label: 'Pausas', value: '12.4%', trend: '-2.3%', positive: true},
  ],
  checklists: [
    {label: 'Conformidade', value: '94.2%', trend: '+1.5%', positive: true},
    {label: 'Nao Conformes', value: '18', trend: '-5', positive: true},
    {label: 'Recorrencia', value: '8.3%', trend: '-1.2%', positive: true},
  ],
  emergency: [
    {label: 'Tempo Resposta', value: '42 min', trend: '-15%', positive: true},
    {label: 'SLA', value: '88.5%', trend: '+3.2%', positive: true},
    {label: 'Total', value: '14', trend: '-2', positive: true},
  ],
  preventive: [
    {label: 'Compliance', value: '76.4%', trend: '+5.8%', positive: true},
    {label: 'PMP', value: '62.1%', trend: '+1.8%', positive: true},
    {label: 'Vencidos', value: '8', trend: '-3', positive: true},
  ],
};

const chartLabels: Record<string, string> = {
  overview: 'Pipeline de OS + Tendencia + Top Frotas Problema',
  'work-orders': 'Pipeline por Status + Tendencia Mensal + Pausas',
  kpis: 'Tendencia CPK/MTTR/MTBF + Eficiencia',
  fleet: 'Custo por Veiculo + Disponibilidade por Frota',
  tires: 'Status Pneus + CPK por Marca + Lifecycle',
  costs: 'Tendencia Pecas vs M.O. + OS por Tipo + Top 10',
  parts: 'Classificacao ABC + Consumo por Categoria',
  employees: 'Eficiencia por Colaborador + Pausas por Motivo',
  checklists: 'Conformidade por Template + Itens Nao Conformes',
  emergency: 'Tempo Resposta (Histograma) + Tipos + SLA',
  preventive: 'Compliance Mensal + PMP + Vencidos por Severidade',
};

// ── Main Component ──────────────────────────────────────
export function AnalyticsPillarsMockup(): ReactNode {
  const [activePillar, setActivePillar] = useState('operacional');
  const [activePage, setActivePage] = useState('overview');
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({Periodo: 'Jul 2026'});

  const currentPillar = pillars.find((p) => p.id === activePillar)!;
  const currentPage = currentPillar.pages.find((p) => p.id === activePage)!;
  const kpis = pageKpis[activePage] || [];

  function handlePillarClick(pillar: Pillar) {
    setActivePillar(pillar.id);
    setActivePage(pillar.pages[0].id);
    // Reset filters but keep Periodo
    setActiveFilters({Periodo: 'Jul 2026'});
  }

  function handlePageClick(pageId: string) {
    setActivePage(pageId);
  }

  function toggleFilter(filter: string) {
    if (filter === 'Periodo') return; // Periodo always active
    setActiveFilters((prev) => {
      const next = {...prev};
      if (next[filter]) {
        delete next[filter];
      } else {
        // Simulated values
        const mockValues: Record<string, string> = {
          Frota: 'Frota A',
          Transportadora: 'Trans. Norte',
          'Tipo de OS': 'Corretiva',
          Prioridade: 'Alta',
          Turno: 'Diurno',
          Cargo: 'Mecanico',
          Marca: 'Michelin',
          Status: 'Em Uso',
          Categoria: 'Rolamentos',
          'Classificacao ABC': 'Classe A',
          Template: 'Insp. Rodagem',
          'Tipo de Problema': 'Pneu',
          'Tipo de Plano': 'Preventiva',
          Severidade: 'Alta',
        };
        next[filter] = mockValues[filter] || filter;
      }
      return next;
    });
  }

  return (
    <div style={s.wrapper}>
      <div style={s.mockupContainer}>
        {/* ── Sidebar ── */}
        <div style={s.sidebar}>
          <div style={s.sidebarHeader}>
            <span style={s.sidebarLogo}>FACTER</span>
          </div>

          <button
            style={s.backBtn}
            onMouseEnter={(e) => {e.currentTarget.style.background = c.primaryBg; e.currentTarget.style.color = c.primary;}}
            onMouseLeave={(e) => {e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = c.muted;}}
          >
            &#8592; Voltar ao Sistema
          </button>

          <div style={s.sidebarNav}>
            {pillars.map((pillar) => {
              const isActive = activePillar === pillar.id;
              return (
                <div key={pillar.id} style={{marginBottom: '0.15rem'}}>
                  <button
                    style={s.pillarBtn(isActive)}
                    onClick={() => handlePillarClick(pillar)}
                    onMouseEnter={(e) => {if (!isActive) e.currentTarget.style.background = c.primaryHover;}}
                    onMouseLeave={(e) => {if (!isActive) e.currentTarget.style.background = 'transparent';}}
                  >
                    {isActive && (
                      <div style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 3,
                        borderRadius: '0 4px 4px 0',
                        background: c.primary,
                      }} />
                    )}
                    <span style={s.pillarNumber(isActive)}>{pillar.number}</span>
                    <span>{pillar.icon} {pillar.label}</span>
                    <span style={s.pillarChevron(isActive)}>&#9654;</span>
                  </button>

                  {isActive && (
                    <div style={s.subItems}>
                      {pillar.pages.map((page) => (
                        <button
                          key={page.id}
                          style={s.subItem(activePage === page.id)}
                          onClick={() => handlePageClick(page.id)}
                          onMouseEnter={(e) => {if (activePage !== page.id) e.currentTarget.style.background = c.primaryHover;}}
                          onMouseLeave={(e) => {if (activePage !== page.id) e.currentTarget.style.background = 'transparent';}}
                        >
                          {page.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Content ── */}
        <div style={s.content}>
          <div style={s.contentHeader}>
            <h3 style={s.contentTitle}>{currentPage.label}</h3>
            <p style={s.contentSubtitle}>Pilar {currentPillar.number}: {currentPillar.question}</p>
          </div>

          {/* Filter chips */}
          <div style={s.filterBar}>
            <span style={s.filterLabel}>Filtros</span>
            {currentPage.filters.map((filter) => {
              const isActive = !!activeFilters[filter];
              const isPeriodo = filter === 'Periodo';
              return (
                <button
                  key={filter}
                  style={s.chip(isActive)}
                  onClick={() => toggleFilter(filter)}
                  onMouseEnter={(e) => {if (!isActive) {e.currentTarget.style.background = c.mutedBg; e.currentTarget.style.borderColor = c.muted;}}}
                  onMouseLeave={(e) => {if (!isActive) {e.currentTarget.style.background = c.cardBg; e.currentTarget.style.borderColor = c.cardBorder;}}}
                >
                  {isActive ? activeFilters[filter] : `${filter}`}
                  {isActive && !isPeriodo ? (
                    <span
                      style={s.chipClose}
                      onClick={(e) => {e.stopPropagation(); toggleFilter(filter);}}
                    >
                      &#10005;
                    </span>
                  ) : (
                    <span style={s.chipChevron}>&#9660;</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* KPIs + Chart placeholder */}
          <div style={s.contentBody}>
            <div style={s.kpiGrid}>
              {kpis.map((kpi) => (
                <div key={kpi.label} style={s.kpiCard}>
                  <p style={s.kpiLabel}>{kpi.label}</p>
                  <p style={s.kpiValue}>{kpi.value}</p>
                  <p style={s.kpiTrend(kpi.positive)}>{kpi.trend}</p>
                </div>
              ))}
            </div>

            <div style={s.chartPlaceholder}>
              {chartLabels[activePage] || 'Graficos e tabelas da pagina'}
            </div>
          </div>
        </div>
      </div>

      <div style={s.note}>
        <strong>Interativo:</strong> Clique nos pilares da sidebar para navegar. Clique nas sub-paginas para trocar de tela.
        Clique nos chips de filtro para simular a ativacao/desativacao — observe como cada pagina mostra apenas os filtros relevantes.
      </div>
    </div>
  );
}
