import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import {LuCode, LuClipboardList, LuPaintbrush, LuFolderOpen, LuRocket} from 'react-icons/lu';

const sections = [
  {
    title: 'Truck',
    Icon: LuCode,
    iconClass: 'eng',
    description: 'Gestao de frotas e manutencao. Engenharia, produto, ADRs e decisoes.',
    link: '/docs/truck/engenharia/arquitetura/visao-geral',
  },
  {
    title: 'Hub',
    Icon: LuFolderOpen,
    iconClass: 'proj',
    description: 'SSO, billing e assinaturas. Engenharia, produto e roadmap.',
    link: '/docs/hub/engenharia/arquitetura/visao-geral',
  },
  {
    title: 'Design System',
    Icon: LuPaintbrush,
    iconClass: 'ds',
    description: 'Componentes, tokens, dark mode e guia de publicacao do @facter/ds-core.',
    link: '/docs/design-system/visao-geral',
  },
  {
    title: 'Propostas',
    Icon: LuClipboardList,
    iconClass: 'prod',
    description: 'Propostas de produto para revisao — problema, opcoes e recomendacao.',
    link: '/docs/truck/produto/propostas/sidebar-reorganization',
  },
  {
    title: 'Onboarding',
    Icon: LuRocket,
    iconClass: 'onb',
    description: 'Setup local, stack overview e guia de contribuicao.',
    link: '/docs/onboarding/setup-local',
  },
];

function Hero(): ReactNode {
  return (
    <div className="hero-facter">
      <div className="container hero-facter__content">
        <h1 className="hero-facter__title">Facter Docs</h1>
        <p className="hero-facter__subtitle">
          Documentacao centralizada do ecossistema Facter.
          Arquitetura, decisoes de produto, design system e mais.
        </p>
        <Link className="hero-facter__cta" to="/docs/intro">
          Explorar documentacao
          <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>
    </div>
  );
}

function SectionCards(): ReactNode {
  return (
    <section className="container section-cards">
      <div className="section-cards__grid">
        {sections.map((s) => (
          <Link key={s.title} to={s.link} className="section-card">
            <div className="section-card__header">
              <div className={`section-card__icon section-card__icon--${s.iconClass}`}>
                <s.Icon size={18} />
              </div>
              <div className="section-card__title">{s.title}</div>
            </div>
            <div className="section-card__description">{s.description}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="Home"
      description="Documentacao centralizada do ecossistema Facter">
      <Hero />
      <main>
        <SectionCards />
      </main>
    </Layout>
  );
}
