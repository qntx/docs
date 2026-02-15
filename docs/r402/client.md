---
sidebar_position: 2
title: Client
---

# Client Integration

Use `r402-http` client middleware to automatically handle x402 payments when making HTTP requests from Rust.

## Installation

```bash
cargo add r402 r402-evm r402-http --features client
```

## Basic Example

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
println!("{}", res.text().await?);
```

## How It Works

1. The client sends a normal HTTP request.
2. If the server responds with `402 Payment Required`:
   - The client middleware parses the price tag from the response.
   - It finds a registered scheme that can handle the payment.
   - The scheme signs a payment payload using your private key.
   - The request is retried with the `X-PAYMENT` header.
3. If the payment is accepted, you receive the response normally.

## Multi-chain Client

Register multiple scheme clients to support payments on different chains:

```rust
use r402_evm::Eip155ExactClient;
use r402_svm::SolanaExactClient;

let x402 = X402Client::new()
    .register(Eip155ExactClient::new(evm_signer))
    .register(SolanaExactClient::new(solana_signer));
```

## Client Hooks

Use `ClientHooks` to observe or modify the payment flow:

```rust
use r402::hooks::ClientHooks;

// Hooks allow you to:
// - Log payment attempts and results
// - Implement retry logic
// - Add custom headers
// - Track spending
```

## Related

- [Server](/r402/server) — gate endpoints with payments
- [Chains](/r402/chains) — list of supported chains and tokens
