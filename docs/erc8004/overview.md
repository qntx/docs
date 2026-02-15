---
sidebar_position: 0
title: Overview
---

# ERC-8004

Type-safe Rust SDK for the [ERC-8004](https://eips.ethereum.org/EIPS/eip-8004) Trustless Agents standard — on-chain identity, reputation, and validation registries for AI agents.

## What is ERC-8004?

ERC-8004 enables **discovery, reputation, and validation** of AI agents across organizational boundaries without pre-existing trust. The standard defines three on-chain registries:

- **Identity Registry** (ERC-721) — register agents as NFTs with metadata URIs, wallets, and service endpoints.
- **Reputation Registry** — submit and query aggregated feedback scores for agents.
- **Validation Registry** — request and respond to capability validation assessments.

## Quick Start

```bash
cargo add erc8004
```

### Query an Agent (Read-Only)

```rust
use alloy::{primitives::U256, providers::ProviderBuilder};
use erc8004::{Erc8004, Network};

let provider = ProviderBuilder::new()
    .connect_http("https://eth.llamarpc.com".parse()?);

let client = Erc8004::new(provider)
    .with_network(Network::EthereumMainnet);

// Identity Registry — ERC-721 agent identity
let identity = client.identity()?;
let owner  = identity.owner_of(U256::from(1)).await?;
let uri    = identity.token_uri(U256::from(1)).await?;
let wallet = identity.get_agent_wallet(U256::from(1)).await?;
```

### Register an Agent (Write)

```rust
use alloy::{network::EthereumWallet, providers::ProviderBuilder, signers::local::PrivateKeySigner};
use erc8004::{Erc8004, Network};

let signer: PrivateKeySigner = std::env::var("PRIVATE_KEY")?.parse()?;
let wallet = EthereumWallet::from(signer);

let provider = ProviderBuilder::new()
    .wallet(wallet)
    .connect_http("https://sepolia.base.org".parse()?);

let client = Erc8004::new(provider)
    .with_network(Network::BaseSepolia);

let agent_id = client.identity()?
    .register_with_uri("https://my-agent.example.com/erc8004.json")
    .await?;
```

## Architecture

| Module           | Description                                                               |
| ---------------- | ------------------------------------------------------------------------- |
| **`Erc8004`**    | Top-level client — generic over `P: Provider`, builder pattern            |
| **`Identity`**   | Identity Registry (ERC-721) — register, manage URIs, wallets, metadata    |
| **`Reputation`** | Reputation Registry — submit / revoke feedback, read aggregated summaries |
| **`Validation`** | Validation Registry — request / respond to validation, query status       |
| **`Network`**    | 18 pre-configured deployments with CREATE2 deterministic addresses        |
| **`types`**      | Off-chain JSON types — `RegistrationFile`, `ServiceEndpoint`, `Feedback`  |

## Design Highlights

- **Zero `async_trait`** — pure RPITIT, no trait-object overhead
- **Inline Solidity bindings** — `sol!` macro preserves full type information
- **Provider-generic** — works with any alloy transport (HTTP, WebSocket, IPC)
- **Lightweight instances** — each registry call creates a zero-alloc contract handle

## Source Code

- [qntx/erc8004](https://github.com/qntx/erc8004)
- [crates.io/crates/erc8004](https://crates.io/crates/erc8004)
- [docs.rs/erc8004](https://docs.rs/erc8004)
