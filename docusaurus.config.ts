import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'QNtX Developer documentation',
  tagline: 'We build open-source AI + Web3 infrastructure.',
  favicon: 'img/favicon.svg',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://docs.qntx.fun',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'qntx', // Usually your GitHub org/user name.
  projectName: 'docs', // Usually your repo name.

  onBrokenLinks: 'warn',

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          sidebarCollapsible: true,
          showLastUpdateTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: 'https://github.com/qntx/docs/tree/main/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  headTags: [
    {
      tagName: 'link',
      attributes: {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossorigin: 'anonymous',
      },
    },
  ],
  stylesheets: [
    'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=IBM+Plex+Mono:wght@300;400;500&display=swap',
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    announcementBar: {
      id: 'announcement',
      content:
        '<strong>Welcome to QNTX Documentation. This site is under active development.</strong>',
      backgroundColor: '#e8e0d0',
      textColor: '#1a1a1a',
      isCloseable: true,
    },
    docs: {
      sidebar: {
        autoCollapseCategories: true,
        hideable: false,
      },
    },
    navbar: {
      logo: {
        alt: 'QNTX Logo',
        src: 'img/logo-light.svg',
        srcDark: 'img/logo-dark.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docs',
          position: 'left',
          label: 'Docs',
        },
        {
          type: 'dropdown',
          label: 'SDKs',
          position: 'left',
          items: [
            {
              label: 'x402-openai (Python)',
              to: '/x402-openai/python/installation',
            },
            {
              label: 'x402-openai (TypeScript)',
              to: '/x402-openai/typescript/installation',
            },
          ],
        },
        {
          type: 'dropdown',
          label: 'Infrastructure',
          position: 'left',
          items: [
            { label: 'Machi Agent Framework (Rust)', to: '/machi/overview' },
            { label: 'r402 (Rust)', to: '/r402/overview' },
            { label: 'ra2a (Rust)', to: '/ra2a/overview' },
            { label: 'kobe (Rust)', to: '/kobe/overview' },
            { label: 'erc8004 (Rust)', to: '/erc8004/overview' },
            { label: 'Facilitator (Rust)', to: '/facilitator/overview' },
          ],
        },
        {
          href: 'https://qntx.fun',
          label: 'Home',
          position: 'right',
        },
        {
          href: 'https://github.com/qntx',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      copyright: `Copyright © ${new Date().getFullYear()} QNTX, Inc. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: [
        'bash',
        'python',
        'rust',
        'toml',
        'solidity',
        'typescript',
        'diff',
        'json',
        'yaml',
      ],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
