---
sidebar_position: 0
title: Overview
---

# Machi

A Web3-native AI Agent Framework with embedded wallet capabilities.

:::info
Machi is under active development. This documentation will be expanded as the framework matures.
:::

## What is Machi?

Machi is a Rust framework for building AI agents that can natively interact with blockchains. Unlike traditional agent frameworks that bolt on Web3 as an afterthought, Machi treats wallets, transactions, and on-chain identity as first-class primitives.

## Key Features

- **Embedded wallets** — agents have their own HD wallets derived via [Kobe](/kobe/overview), enabling autonomous on-chain transactions.
- **x402 payments** — built-in support for the x402 payment protocol via [r402](/r402/overview), so agents can pay for and charge for services.
- **A2A communication** — agents discover and communicate with each other using the A2A protocol via [ra2a](/ra2a/overview).
- **On-chain identity** — register agents on-chain with [ERC-8004](/erc8004/overview) for trustless discovery and reputation.

## Getting Started

Add Machi to your Rust project:

```bash
cargo add machi
```

## Source Code

- [qntx/machi](https://github.com/qntx/machi) — core framework

## Related Projects

- [Kobe](/kobe/overview) — HD wallet derivation used by Machi agents
- [r402](/r402/overview) — x402 payment protocol integration
- [ra2a](/ra2a/overview) — A2A protocol for agent communication
- [ERC-8004](/erc8004/overview) — on-chain agent identity
