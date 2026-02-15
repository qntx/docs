---
sidebar_position: 5
title: Policies
---

# Payment Policies

Policies let you control which chain, scheme, or maximum amount the SDK should use when multiple payment options are available.

## Available Policies

| Policy                  | Description                                               |
| ----------------------- | --------------------------------------------------------- |
| `prefer_network(caip2)` | Prefer a specific network (e.g. `"eip155:8453"` for Base) |
| `prefer_scheme(scheme)` | Prefer a payment scheme (e.g. `"exact"`)                  |
| `max_amount(amount)`    | Reject payments above a threshold (in token decimals)     |

## Usage

```python
from x402_openai import X402OpenAI, prefer_network, prefer_scheme, max_amount
from x402_openai.wallets import EvmWallet, SvmWallet

client = X402OpenAI(
    wallets=[
        EvmWallet(private_key="0x…"),
        SvmWallet(private_key="base58…"),
    ],
    policies=[
        prefer_network("eip155:8453"),  # Prefer Base mainnet
        prefer_scheme("exact"),         # Prefer exact payment scheme
        max_amount(1_000_000),          # Cap at 1 USDC (6 decimals)
    ],
)
```

## How Policies Are Applied

When the server returns multiple payment options, the SDK:

1. Filters out options that exceed `max_amount`.
2. Sorts remaining options by `prefer_network` and `prefer_scheme` scores.
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
