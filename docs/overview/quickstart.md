---
sidebar_position: 3
title: Quickstart
---

# Quickstart

Choose the path that matches your use case.

## Pay for AI with Crypto

The fastest way to get started is with the x402-openai SDK. It wraps the standard OpenAI client and handles payments transparently.

### Python

```bash
pip install x402-openai[evm]
```

```python
from x402_openai import X402OpenAI
from x402_openai.wallets import EvmWallet

client = X402OpenAI(wallet=EvmWallet(private_key="0x…"))

res = client.chat.completions.create(
    model="openai/gpt-4o-mini",
    messages=[{"role": "user", "content": "Hello!"}],
)
print(res.choices[0].message.content)
```

### TypeScript

```bash
bun add x402-openai @x402/evm viem
```

```typescript
import { X402OpenAI } from 'x402-openai';
import { EvmWallet } from 'x402-openai/wallets';

const client = new X402OpenAI({
  wallet: new EvmWallet({ privateKey: '0x…' }),
});

const res = await client.chat.completions.create({
  model: 'openai/gpt-4o-mini',
  messages: [{ role: 'user', content: 'Hello!' }],
});
console.log(res.choices[0]?.message.content);
```

➡️ Full guide: [x402-openai SDK](/x402-openai/overview)

## Gate an HTTP Endpoint with Payments (Rust)

Use r402 to protect any Axum route with crypto payments:

```bash
cargo add r402 r402-evm r402-http
```

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
            USDC::base().amount(1_000_000u64),
        ))
    ),
);
```

➡️ Full guide: [r402 Server](/r402/server)

## Build an A2A Agent (Rust)

Create an agent that speaks the Agent2Agent protocol:

```bash
cargo add ra2a
```

```rust
use ra2a::{
    server::A2AServerBuilder,
    types::{AgentCard, AgentSkill},
};

let card = AgentCard::builder("My Agent", "http://localhost:8080")
    .description("A minimal A2A agent")
    .version("1.0.0")
    .skill(AgentSkill::new("chat", "Chat", "General chat", vec![]))
    .build();

A2AServerBuilder::new()
    .executor(MyAgent { card })
    .host("0.0.0.0")
    .port(8080)
    .build()
    .serve()
    .await?;
```

➡️ Full guide: [ra2a Server](/ra2a/server)

## Run a Payment Facilitator

Deploy a facilitator to verify and settle x402 payments:

```bash
cargo install facilitator
facilitator init        # generate config.toml
facilitator serve       # start the server
```

➡️ Full guide: [Facilitator](/facilitator/overview)

## Derive HD Wallets

Generate multi-chain wallets from a single BIP-39 mnemonic:

```bash
cargo install kobe-cli
kobe eth new                    # Ethereum wallet
kobe btc new --address-type taproot   # Bitcoin Taproot
kobe sol new                    # Solana wallet
```

➡️ Full guide: [Kobe CLI](/kobe/cli)
