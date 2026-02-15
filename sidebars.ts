import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docs: [
    'index',
    {
      type: 'category',
      label: 'Getting Started',
      collapsed: false,
      items: [
        'overview/what-is-qntx',
        'overview/architecture',
        'overview/quickstart',
      ],
    },
    {
      type: 'category',
      label: 'x402-openai (Python)',
      collapsed: true,
      items: [
        'x402-openai/overview',
        'x402-openai/python/installation',
        'x402-openai/python/quickstart',
        'x402-openai/python/wallets',
        'x402-openai/python/streaming',
        'x402-openai/python/policies',
      ],
    },
    {
      type: 'category',
      label: 'x402-openai (TypeScript)',
      collapsed: true,
      items: [
        'x402-openai/typescript/installation',
        'x402-openai/typescript/quickstart',
        'x402-openai/typescript/wallets',
        'x402-openai/typescript/streaming',
        'x402-openai/typescript/policies',
      ],
    },
    {
      type: 'category',
      label: 'Machi',
      collapsed: true,
      items: ['machi/overview'],
    },
    {
      type: 'category',
      label: 'r402',
      collapsed: true,
      items: ['r402/overview', 'r402/server', 'r402/client', 'r402/chains'],
    },
    {
      type: 'category',
      label: 'ra2a',
      collapsed: true,
      items: ['ra2a/overview', 'ra2a/server', 'ra2a/client', 'ra2a/storage'],
    },
    {
      type: 'category',
      label: 'Kobe',
      collapsed: true,
      items: ['kobe/overview', 'kobe/cli', 'kobe/chains'],
    },
    {
      type: 'category',
      label: 'ERC-8004',
      collapsed: true,
      items: [
        'erc8004/overview',
        'erc8004/identity',
        'erc8004/reputation',
        'erc8004/networks',
      ],
    },
    {
      type: 'category',
      label: 'Facilitator',
      collapsed: true,
      items: [
        'facilitator/overview',
        'facilitator/configuration',
        'facilitator/docker',
        'facilitator/api',
      ],
    },
  ],
};

export default sidebars;
