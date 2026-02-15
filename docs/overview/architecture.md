---
sidebar_position: 2
title: Architecture
---

# Architecture

QNTX projects form a layered stack. Each layer builds on the one below, but every crate can be used independently.

## How Projects Connect

### Payment Flow (x402)

A typical pay-per-request flow involves three parties:

1. **Client** (x402-openai or r402 client) sends a request to a paid endpoint.
2. **Server** (r402 server middleware) responds with `402 Payment Required` and a price tag.
3. **Client** signs a payment payload and retries the request.
4. **Server** forwards the payment to the **Facilitator** for on-chain settlement.
5. **Facilitator** verifies the signature and broadcasts the transaction.

```text
Client ──── request ────▶ Server
Client ◀─── 402 + price ─ Server
Client ──── request + payment ──▶ Server ──── verify ──▶ Facilitator
Client ◀─── 200 + content ────── Server ◀─── ok ─────── Facilitator
                                  Server ──── settle ──▶ Facilitator
```

### Agent Communication Flow (A2A)

Two agents communicate via the Agent2Agent protocol:

1. **Caller agent** discovers the **remote agent** via its Agent Card.
2. **Caller** sends a task message via JSON-RPC over HTTP.
3. **Remote agent** processes the task and streams results back via SSE.

```text
Caller ──── GET /.well-known/agent.json ──▶ Remote Agent
Caller ◀─── Agent Card ───────────────────── Remote Agent
Caller ──── POST /a2a (send_message) ──────▶ Remote Agent
Caller ◀─── SSE stream (task updates) ────── Remote Agent
```

### On-chain Identity (ERC-8004)

Agents register their identity on-chain and build reputation:

1. **Register** — mint an ERC-721 agent identity NFT with a metadata URI.
2. **Discover** — other agents query the registry to find agents by ID.
3. **Validate** — validators assess agent capabilities and record results.
4. **Reputation** — clients submit feedback; aggregated scores are publicly queryable.

## Supported Chains

| Family            | Networks                                                                       | Used by                           |
| ----------------- | ------------------------------------------------------------------------------ | --------------------------------- |
| **EVM (EIP-155)** | Ethereum, Base, Optimism, Arbitrum, Polygon, Avalanche, Celo, Monad + testnets | r402, Facilitator, ERC-8004, Kobe |
| **Solana (SVM)**  | Mainnet, Devnet                                                                | r402, Facilitator, Kobe           |
| **Bitcoin**       | Mainnet, Testnet                                                               | Kobe                              |
