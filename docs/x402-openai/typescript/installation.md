---
sidebar_position: 1
title: Installation
---

# Installation

## Requirements

- Node.js 18+ or Bun
- TypeScript 5.0+
- A crypto wallet private key (EVM or Solana)

## Install via Bun

```bash
# EVM chains (Ethereum, Base, Optimism, …)
bun add x402-openai @x402/evm viem

# Solana
bun add x402-openai @x402/svm @solana/kit @scure/base

# All chains
bun add x402-openai @x402/evm @x402/svm viem @solana/kit @scure/base
```

## Install via npm

```bash
npm install x402-openai @x402/evm viem
```

## Install via pnpm

```bash
pnpm add x402-openai @x402/evm viem
```

## Verify Installation

```typescript
import { X402OpenAI } from 'x402-openai';
console.log('x402-openai loaded successfully');
```

## Environment Variables

Store your private key securely:

```bash
export EVM_PRIVATE_KEY="0x…"
# or
export SOLANA_PRIVATE_KEY="base58…"
```

```typescript
import { X402OpenAI } from 'x402-openai';
import { EvmWallet } from 'x402-openai/wallets';

const client = new X402OpenAI({
  wallet: new EvmWallet({ privateKey: process.env.EVM_PRIVATE_KEY! }),
});
```

## Next Steps

- [Quickstart](/x402-openai/typescript/quickstart) — send your first paid request
- [Wallets](/x402-openai/typescript/wallets) — EVM, Solana, and BIP-39 mnemonic options
