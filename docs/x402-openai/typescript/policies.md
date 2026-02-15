---
sidebar_position: 5
title: Policies
---

# Payment Policies

Policies let you control which chain, scheme, or maximum amount the SDK should use when multiple payment options are available.

## Available Policies

| Policy                 | Description                                               |
| ---------------------- | --------------------------------------------------------- |
| `preferNetwork(caip2)` | Prefer a specific network (e.g. `"eip155:8453"` for Base) |
| `preferScheme(scheme)` | Prefer a payment scheme (e.g. `"exact"`)                  |
| `maxAmount(amount)`    | Reject payments above a threshold (in token decimals)     |

## Usage

```typescript
import {
  X402OpenAI,
  preferNetwork,
  preferScheme,
  maxAmount,
} from 'x402-openai';
import { EvmWallet, SvmWallet } from 'x402-openai/wallets';

const client = new X402OpenAI({
  wallets: [
    new EvmWallet({ privateKey: '0x…' }),
    new SvmWallet({ privateKey: 'base58…' }),
  ],
  policies: [
    preferNetwork('eip155:8453'), // Prefer Base mainnet
    preferScheme('exact'), // Prefer exact payment scheme
    maxAmount(1_000_000n), // Cap at 1 USDC (6 decimals)
  ],
});
```

## How Policies Are Applied

When the server returns multiple payment options, the SDK:

1. Filters out options that exceed `maxAmount`.
2. Sorts remaining options by `preferNetwork` and `preferScheme` scores.
3. Selects the highest-scoring option that has a matching wallet.

If no option matches all policies, the SDK falls back to any compatible option.

## Common Network IDs (CAIP-2)

| Network          | CAIP-2 ID                                 |
| ---------------- | ----------------------------------------- |
| Ethereum Mainnet | `eip155:1`                                |
| Base Mainnet     | `eip155:8453`                             |
| Base Sepolia     | `eip155:84532`                            |
| Optimism         | `eip155:10`                               |
| Arbitrum One     | `eip155:42161`                            |
| Polygon          | `eip155:137`                              |
| Solana Mainnet   | `solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp` |
| Solana Devnet    | `solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1` |
