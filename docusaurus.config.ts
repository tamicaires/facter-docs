import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Facter Docs',
  tagline: 'Documentacao centralizada do ecossistema Facter',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://facter-docs.vercel.app',
  baseUrl: '/',

  organizationName: 'facter',
  projectName: 'facter-docs',

  onBrokenLinks: 'warn',

  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'pt-BR',
    locales: ['pt-BR'],
  },

  // Cor primaria por produto: marca o `<html>` antes da primeira pintura, para
  // que abrir /docs/techcare direto pela URL nao pisque azul antes de virar
  // verde. A navegacao client-side e tratada em src/clientModules/project-theme.
  headTags: [
    {
      tagName: 'script',
      attributes: {},
      innerHTML:
        "(function(){try{var m=/^\\/docs\\/([^/]+)/.exec(location.pathname);if(m){document.documentElement.setAttribute('data-project',m[1]);}}catch(e){}})();",
    },
  ],

  clientModules: ['./src/clientModules/project-theme.ts'],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: 'docs',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themes: [
    '@docusaurus/theme-mermaid',
    [
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        language: ['pt'],
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
      },
    ],
  ],

  themeConfig: {
    image: 'img/facter-social-card.png',
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Facter Docs',
      logo: {
        alt: 'Facter Logo',
        src: 'img/logo.svg',
        srcDark: 'img/logo-dark.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docs',
          position: 'left',
          label: 'Docs',
        },
        {to: '/blog', label: 'Blog', position: 'left'},
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Projetos',
          items: [
            {label: 'Truck', to: '/docs/truck/visao-geral'},
            {label: 'Hub', to: '/docs/hub/engenharia/arquitetura/visao-geral'},
            {label: 'TechCare', to: '/docs/techcare/produto/visao-geral'},
            {label: 'Design System', to: '/docs/design-system/visao-geral'},
          ],
        },
        {
          title: 'Recursos',
          items: [
            {label: 'Onboarding', to: '/docs/onboarding/setup-local'},
            {label: 'Blog', to: '/blog'},
          ],
        },
      ],
      copyright: `Facter &copy; ${new Date().getFullYear()}. Documentacao interna.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'typescript', 'sql'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
