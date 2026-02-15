---
sidebar_position: 0
title: Overview
---

# r402

Modular Rust SDK for the [x402 payment protocol](https://www.x402.org/) — client signing, server gating, and facilitator settlement over HTTP 402.

## What is r402?

r402 is a comprehensive Rust implementation of the x402 protocol. It provides everything you need to build payment-gated HTTP services:

- **Server middleware** — protect any Axum route with crypto payment requirements.
- **Client middleware** — automatically sign and attach payments to outgoing requests.
- **Facilitator client** — verify and settle payments on-chain.

## Crates

| Crate           | Description                                                                         |
| --------------- | ----------------------------------------------------------------------------------- |
| **`r402`**      | Core library — protocol types, scheme traits, facilitator abstractions, hook system |
| **`r402-evm`**  | EVM (EIP-155) — ERC-3009 transfer authorization, multi-signer management            |
| **`r402-svm`**  | Solana (SVM) — SPL token transfers, program-derived addressing                      |
| **`r402-http`** | HTTP transport — Axum payment gate, reqwest client middleware, facilitator client   |

## Quick Start

```bash
cargo add r402 r402-evm r402-http
```

### Protect a Route (Server)

```rust
use alloy_primitives::address;
use axum::{Router, routing::get};
use r402_evm::{Eip155Exact, USDC};
use r402_http::server::X402Middleware;

let x402 = X402Middleware::new("https://facilitator.example.com");

let app = Router::new().route(
    "/paid-content",
    get(handler).layer(
        x402.with_price_tag(Eip155Exact::price_tag(
            address!("0xYourPayToAddress"),
            USDC::base().amount(1_000_000u64), // 1 USDC
        ))
    ),
);
```

### Send Payments (Client)

```rust
use alloy_signer_local::PrivateKeySigner;
use r402_evm::Eip155ExactClient;
use r402_http::client::{ReqwestWithPayments, ReqwestWithPaymentsBuild, X402Client};
use std::sync::Arc;

let signer = Arc::new("0x…".parse::<PrivateKeySigner>()?);
let x402 = X402Client::new().register(Eip155ExactClient::new(signer));

let client = reqwest::Client::new()
    .with_payments(x402)
    .build();

let res = client.get("https://api.example.com/paid").send().await?;
```

## Design Highlights

| Aspect                 | Detail                                    |
| ---------------------- | ----------------------------------------- |
| **Built-in chains**    | 44 (42 EVM + 2 Solana)                    |
| **Permit2**            | Dual path — ERC-3009 + `x402Permit2Proxy` |
| **Lifecycle hooks**    | `FacilitatorHooks` + `ClientHooks`        |
| **Zero `async_trait`** | Pure RPITIT, no trait-object overhead     |
| **Edition**            | Rust 2024                                 |

## Feature Flags

| Crate       | `server`             | `client`                   | `facilitator`            | `telemetry`     |
| ----------- | -------------------- | -------------------------- | ------------------------ | --------------- |
| `r402-http` | Axum payment gate    | Reqwest middleware         | HTTP facilitator client  | `tracing` spans |
| `r402-evm`  | Price tag generation | EIP-712 / EIP-3009 signing | On-chain verify & settle | `tracing` spans |
| `r402-svm`  | Price tag generation | SPL token signing          | On-chain verify & settle | `tracing` spans |

## Source Code

- [qntx/r402](https://github.com/qntx/r402)
- [crates.io/crates/r402](https://crates.io/crates/r402)
- [docs.rs/r402](https://docs.rs/r402)
