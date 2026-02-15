---
sidebar_position: 3
title: Supported Chains
---

# Supported Chains

r402 ships with 44 built-in chain definitions — 42 EVM networks and 2 Solana clusters.

## EVM Chains (EIP-155)

### Mainnets

| Network           | Chain ID | CAIP-2 ID       |
| ----------------- | -------- | --------------- |
| Ethereum          | 1        | `eip155:1`      |
| Base              | 8453     | `eip155:8453`   |
| Optimism          | 10       | `eip155:10`     |
| Arbitrum One      | 42161    | `eip155:42161`  |
| Polygon           | 137      | `eip155:137`    |
| Avalanche C-Chain | 43114    | `eip155:43114`  |
| Celo              | 42220    | `eip155:42220`  |
| BNB Smart Chain   | 56       | `eip155:56`     |
| Gnosis            | 100      | `eip155:100`    |
| Scroll            | 534352   | `eip155:534352` |
| Monad             | 143      | `eip155:143`    |

### Testnets

| Network          | Chain ID | CAIP-2 ID         |
| ---------------- | -------- | ----------------- |
| Ethereum Sepolia | 11155111 | `eip155:11155111` |
| Base Sepolia     | 84532    | `eip155:84532`    |
| Optimism Sepolia | 11155420 | `eip155:11155420` |
| Arbitrum Sepolia | 421614   | `eip155:421614`   |
| Polygon Amoy     | 80002    | `eip155:80002`    |

## Solana Chains

| Network | CAIP-2 ID                                 |
| ------- | ----------------------------------------- |
| Mainnet | `solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp` |
| Devnet  | `solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1` |

## Supported Tokens

### USDC

USDC is the primary token supported by the x402 protocol. r402 includes built-in USDC definitions for all supported chains.

```rust
use r402_evm::USDC;

// Get USDC on a specific chain
let usdc_base = USDC::base();           // Base mainnet
let usdc_eth = USDC::ethereum();        // Ethereum mainnet
let usdc_sepolia = USDC::base_sepolia(); // Base Sepolia testnet

// Create a price amount (6 decimals)
let one_usdc = usdc_base.amount(1_000_000u64);
let half_usdc = usdc_base.amount(500_000u64);
```

## Payment Schemes

| Scheme        | Description                                                  |
| ------------- | ------------------------------------------------------------ |
| **`exact`**   | ERC-3009 `transferWithAuthorization` — exact amount transfer |
| **`permit2`** | Uniswap Permit2 proxy — alternative transfer mechanism       |

r402 uses a **dual path** approach: it attempts ERC-3009 first and falls back to Permit2 if the token supports it.
