import {useState, type CSSProperties, type ReactNode} from 'react';
import {c} from './primitives';
import {SCREENS} from './screens';

// ── Pilares e páginas (ids batem com o registry SCREENS) ─
interface Pillar {
  id: string;
  number: number;
  icon: string;
  label: string;
  question: string;
  pages: {id: string; label: string; filters: string[]}[];
}

const pillars: Pillar[] = [
  {
    id: 'operacional',
    number: 1,
    icon: '\u{1F527}',
    label: 'Operacional',
    question: 'Como está a oficina?',
    pages: [
      {id: 'overview', label: 'Visão Geral', filters: ['Período', 'Frota']},
      {id: 'work-orders', label: 'Ordens de Serviço', filters: ['Período', 'Frota', 'Transportadora', 'Tipo de OS', 'Prioridade']},
      {id: 'kpis', label: 'Indicadores', filters: ['Período', 'Frota']},
    ],
  },
  {
    id: 'ativos',
    number: 2,
    icon: '\u{1F69B}',
    label: 'Ativos',
    question: 'Como estão meus veículos?',
    pages: [
      {id: 'fleet', label: 'Frota', filters: ['Período', 'Frota', 'Transportadora']},
      {id: 'tires', label: 'Pneus', filters: ['Período', 'Frota', 'Marca', 'Status']},
    ],
  },
  {
    id: 'financeiro',
    number: 3,
    icon: '\u{1F4B0}',
    label: 'Financeiro',
    question: 'Quanto estou gastando?',
    pages: [
      {id: 'costs', label: 'Custos', filters: ['Período', 'Frota', 'Transportadora', 'Tipo de OS']},
      {id: 'parts', label: 'Peças e Estoque', filters: ['Período', 'Categoria', 'Classificação ABC']},
    ],
  },
  {
    id: 'pessoas',
    number: 4,
    icon: '\u{1F465}',
    label: 'Pessoas',
    question: 'Como está a equipe?',
    pages: [{id: 'employees', label: 'Desempenho', filters: ['Período', 'Turno', 'Cargo']}],
  },
  {
    id: 'qualidade',
    number: 5,
    icon: '✅',
    label: 'Qualidade',
    question: 'Estamos mantendo o padrão?',
    pages: [
      {id: 'checklists', label: 'Checklists', filters: ['Período', 'Frota', 'Template']},
      {id: 'emergency', label: 'Socorro', filters: ['Período', 'Frota', 'Tipo de Problema']},
    ],
  },
  {
    id: 'prevencao',
    number: 6,
    icon: '\u{1F6E1}️',
    label: 'Prevenção',
    question: 'Prevenindo ou apagando incêndio?',
    pages: [{id: 'preventive', label: 'Manutenção Preventiva', filters: ['Período', 'Frota', 'Tipo de Plano', 'Severidade']}],
  },
];

// ── Styles ──────────────────────────────────────────────
const s = {
  wrapper: {
    fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
    fontSize: '0.875rem',
    lineHeight: 1.5,
  } as CSSProperties,
  container: {
    display: 'flex',
    border: `1px solid ${c.cardBorder}`,
    borderRadius: '0.75rem',
    overflow: 'hidden',
    height: 680,
    background: c.cardBg,
  } as CSSProperties,
  sidebar: {
    width: 220,
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
    fontSize: '0.75rem',
    fontWeight: 500,
    width: 'calc(100% - 1rem)',
    textAlign: 'left' as const,
    fontFamily: 'inherit',
  } as CSSProperties,
  nav: {flex: 1, padding: '0.5rem', overflowY: 'auto' as const} as CSSProperties,
  pillarBtn: (active: boolean) =>
    ({
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      width: '100%',
      padding: '0.45rem 0.6rem',
      borderRadius: '0.5rem',
      border: 'none',
      background: active ? c.primaryBg : 'transparent',
      color: active ? c.primary : c.text,
      cursor: 'pointer',
      fontSize: '0.78rem',
      fontWeight: active ? 600 : 500,
      textAlign: 'left' as const,
      position: 'relative' as const,
      fontFamily: 'inherit',
    }) as CSSProperties,
  subItem: (active: boolean) =>
    ({
      display: 'block',
      width: '100%',
      padding: '0.3rem 0.6rem',
      borderRadius: '0.375rem',
      border: 'none',
      background: active ? c.primaryBg : 'transparent',
      color: active ? c.primary : c.muted,
      cursor: 'pointer',
      fontSize: '0.74rem',
      fontWeight: active ? 600 : 400,
      textAlign: 'left' as const,
      fontFamily: 'inherit',
    }) as CSSProperties,
  content: {flex: 1, display: 'flex', flexDirection: 'column' as const, overflow: 'hidden', minWidth: 0} as CSSProperties,
  header: {padding: '0.85rem 1.25rem', borderBottom: `1px solid ${c.cardBorder}`, flexShrink: 0} as CSSProperties,
  filterBar: {
    padding: '0.6rem 1.25rem',
    borderBottom: `1px solid ${c.cardBorder}`,
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.4rem',
    alignItems: 'center',
    background: c.mutedBg,
    flexShrink: 0,
  } as CSSProperties,
  chip: (active: boolean) =>
    ({
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.3rem',
      padding: '0.25rem 0.65rem',
      borderRadius: 9999,
      border: `1px solid ${active ? c.primaryBorder : c.cardBorder}`,
      background: active ? c.primaryBg : c.cardBg,
      color: active ? c.primary : c.muted,
      fontSize: '0.72rem',
      fontWeight: active ? 600 : 400,
      whiteSpace: 'nowrap' as const,
    }) as CSSProperties,
  body: {flex: 1, padding: '1.25rem', overflowY: 'auto' as const} as CSSProperties,
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

// ── Componente principal ────────────────────────────────
export function AnalyticsScreensPrototype(): ReactNode {
  const [activePillar, setActivePillar] = useState('operacional');
  const [activePage, setActivePage] = useState('overview');

  const currentPillar = pillars.find((p) => p.id === activePillar)!;
  const currentPage = currentPillar.pages.find((p) => p.id === activePage) ?? currentPillar.pages[0];
  const Screen = SCREENS[currentPage.id];

  function go(pillarId: string, pageId: string) {
    setActivePillar(pillarId);
    setActivePage(pageId);
  }

  return (
    <div style={s.wrapper}>
      <div style={s.container}>
        {/* Sidebar */}
        <div style={s.sidebar}>
          <div style={s.sidebarHeader}>
            <span style={{fontWeight: 800, fontSize: '1rem', color: c.primary, letterSpacing: '-0.02em'}}>FACTER</span>
            <span style={{fontSize: '0.62rem', fontWeight: 700, color: c.muted, marginLeft: 6, textTransform: 'uppercase', letterSpacing: '0.08em'}}>
              Analytics
            </span>
          </div>
          <button style={s.backBtn}>&#8592; Voltar ao Sistema</button>
          <div style={s.nav}>
            {pillars.map((pillar) => {
              const isActive = activePillar === pillar.id;
              return (
                <div key={pillar.id} style={{marginBottom: '0.15rem'}}>
                  <button style={s.pillarBtn(isActive)} onClick={() => go(pillar.id, pillar.pages[0].id)}>
                    {isActive && (
                      <span style={{position: 'absolute', left: 0, top: 4, bottom: 4, width: 3, borderRadius: '0 4px 4px 0', background: c.primary}} />
                    )}
                    <span>
                      {pillar.icon} {pillar.label}
                    </span>
                    <span style={{marginLeft: 'auto', fontSize: '0.6rem', color: c.muted, transform: isActive ? 'rotate(90deg)' : 'none'}}>&#9654;</span>
                  </button>
                  {isActive && (
                    <div style={{paddingLeft: '1.5rem', paddingBottom: '0.25rem'}}>
                      {pillar.pages.map((page) => (
                        <button key={page.id} style={s.subItem(activePage === page.id)} onClick={() => setActivePage(page.id)}>
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

        {/* Conteúdo */}
        <div style={s.content}>
          <div style={s.header}>
            <h3 style={{margin: 0, fontSize: '1.05rem', fontWeight: 700, color: c.text}}>{currentPage.label}</h3>
            <p style={{margin: '0.15rem 0 0', fontSize: '0.74rem', color: c.muted, fontStyle: 'italic'}}>
              Pilar {currentPillar.number} · {currentPillar.question}
            </p>
          </div>
          <div style={s.filterBar}>
            {currentPage.filters.map((f) => (
              <span key={f} style={s.chip(f === 'Período')}>
                {f === 'Período' ? 'Últimos 30 dias' : f} <span style={{fontSize: '0.55rem'}}>&#9660;</span>
              </span>
            ))}
          </div>
          <div style={s.body}>
            <Screen go={go} />
          </div>
        </div>
      </div>

      <div style={s.note}>
        <strong>Interativo:</strong> navegue pelos pilares e páginas na sidebar. Os selos numerados em cada seção marcam a{' '}
        <strong>gramática de 4 camadas</strong> (1 Veredito → 2 História central → 3 Diagnóstico → 4 Ação). Na Visão Geral, os
        alertas e os cartões de pilar são clicáveis e levam à tela correspondente. Dados ilustrativos.
      </div>
    </div>
  );
}
