---
sidebar_position: 0
title: Overview
---

# Facilitator

Production-ready [x402 payment protocol](https://www.x402.org/) facilitator — verifies payment signatures and settles transactions on-chain over HTTP 402.

## What is a Facilitator?

The facilitator is a trusted third party that acts on behalf of resource servers. It does **not** hold funds — it only validates payment payloads and broadcasts settlement transactions to the blockchain.

```text
Client ──── request + payment ──▶ Server ──── verify ──▶ Facilitator
Client ◀─── 200 + content ────── Server ◀─── ok ─────── Facilitator
                                  Server ──── settle ──▶ Facilitator
                                  Server ◀─── tx hash ── Facilitator
```

## Quick Start

```bash
# Install from crates.io
cargo install facilitator

# Generate a commented config template
facilitator init

# Edit config.toml with your RPC URLs and signer keys, then start
facilitator serve
```

## API Endpoints

| Method | Path         | Description                                               |
| ------ | ------------ | --------------------------------------------------------- |
| `GET`  | `/supported` | List supported payment kinds (version / scheme / network) |
| `POST` | `/verify`    | Verify a payment payload against requirements             |
| `POST` | `/settle`    | Settle an accepted payment on-chain                       |
| `GET`  | `/health`    | Health check                                              |

## Supported Chains

| Family            | Networks                                                                       |
| ----------------- | ------------------------------------------------------------------------------ |
| **EVM (EIP-155)** | Ethereum, Base, Optimism, Arbitrum, Polygon, Avalanche, Celo, Monad + testnets |
| **Solana (SVM)**  | Mainnet, Devnet, and custom clusters                                           |

## Feature Flags

| Feature        | Default | Description                       |
| -------------- | ------- | --------------------------------- |
| `chain-eip155` | yes     | EVM chain support via r402-evm    |
| `chain-solana` | yes     | Solana chain support via r402-svm |
| `telemetry`    | yes     | OpenTelemetry tracing and metrics |

Minimize binary size by disabling unused chains:

```bash
cargo install facilitator --no-default-features --features chain-eip155
```

## Source Code

- [qntx/facilitator](https://github.com/qntx/facilitator)
- [crates.io/crates/facilitator](https://crates.io/crates/facilitator)
- [Docker image](https://github.com/qntx/facilitator/pkgs/container/facilitator)
