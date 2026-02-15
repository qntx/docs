---
sidebar_position: 1
title: Server
---

# Server Integration

Use `r402-http` server middleware to gate any Axum route with crypto payment requirements.

## Installation

```bash
cargo add r402 r402-evm r402-http --features server
```

## Basic Example

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
            USDC::base().amount(1_000_000u64), // 1 USDC (6 decimals)
        ))
    ),
);
```

## How It Works

1. A client sends a request to a protected route.
2. The middleware checks for a valid `X-PAYMENT` header.
3. If missing, it responds with `402 Payment Required` and includes:
   - The price tag (amount, token, chain, recipient address).
   - The facilitator URL for payment verification.
4. If present, the middleware:
   - Forwards the payment to the facilitator for verification.
   - If valid, allows the request through to the handler.
   - After the response is sent, triggers settlement via the facilitator.

## Price Tag Configuration

### EVM — USDC on Base

```rust
use r402_evm::{Eip155Exact, USDC};

Eip155Exact::price_tag(
    address!("0xYourPayToAddress"),
    USDC::base().amount(1_000_000u64), // 1 USDC
)
```

### EVM — USDC on Ethereum

```rust
Eip155Exact::price_tag(
    address!("0xYourPayToAddress"),
    USDC::ethereum().amount(5_000_000u64), // 5 USDC
)
```

### Multiple Price Tags

Offer the client a choice of payment options:

```rust
let app = Router::new().route(
    "/paid-content",
    get(handler)
        .layer(x402.with_price_tag(Eip155Exact::price_tag(
            address!("0xAddr"),
            USDC::base().amount(1_000_000u64),
        )))
        .layer(x402.with_price_tag(Eip155Exact::price_tag(
            address!("0xAddr"),
            USDC::ethereum().amount(1_000_000u64),
        ))),
);
```

## Lifecycle Hooks

Use `FacilitatorHooks` to run custom logic before and after settlement:

```rust
use r402::hooks::FacilitatorHooks;

// Hooks allow you to:
// - Log payment events
// - Track usage metrics
// - Implement custom authorization logic
// - Trigger side effects after settlement
```

## Related

- [Client](/r402/client) — send payments from Rust
- [Chains](/r402/chains) — list of supported chains and tokens
- [Facilitator](/facilitator/overview) — run your own facilitator
