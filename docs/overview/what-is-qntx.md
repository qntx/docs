---
sidebar_position: 1
title: What is QNTX?
---

# What is QNTX?

QNTX is an open-source organization building the infrastructure layer where **AI meets Web3**. Every project is MIT / Apache-2.0 dual-licensed, written primarily in Rust, and designed to compose together.

## Mission

> We build open-source AI + Web3 infrastructure.

The crypto economy needs autonomous agents that can discover each other, communicate, and transact — without human intermediaries. QNTX provides the building blocks:

- **Payments** — the x402 protocol lets any HTTP endpoint accept crypto payments via a standard `402 Payment Required` flow.
- **Agent communication** — the A2A (Agent-to-Agent) protocol enables agents to discover capabilities and exchange tasks.
- **Identity & reputation** — the ERC-8004 standard provides on-chain registries for trustless agent verification.
- **Wallets** — deterministic HD wallet derivation from a single BIP-39 mnemonic, across Bitcoin, Ethereum, and Solana.

## Projects

| Project                              | Language           | Description                                                      |
| ------------------------------------ | ------------------ | ---------------------------------------------------------------- |
| [x402-openai](/x402-openai/overview) | Python, TypeScript | Drop-in OpenAI client with transparent x402 payment support      |
| [Machi](/machi/overview)             | Rust               | Web3-native AI agent framework with embedded wallet capabilities |
| [r402](/r402/overview)               | Rust               | Modular SDK for the x402 payment protocol                        |
| [ra2a](/ra2a/overview)               | Rust               | SDK for the Agent2Agent (A2A) protocol                           |
| [Facilitator](/facilitator/overview) | Rust               | Production-ready x402 payment facilitator server                 |
| [ERC-8004](/erc8004/overview)        | Rust               | SDK for the ERC-8004 Trustless Agents standard                   |
| [Kobe](/kobe/overview)               | Rust               | Multi-chain HD wallet derivation toolkit                         |

## Design Principles

- **Modular** — each crate solves one problem; compose them as needed.
- **`no_std`-first** — library crates compile without `std` where possible, enabling embedded and WASM targets.
- **Zero `async_trait`** — pure RPITIT (return-position `impl Trait` in trait) with no trait-object overhead.
- **Strict linting** — `pedantic` + `nursery` + `correctness` (deny) across all workspaces.
- **Rust 2024 edition** — latest language ergonomics and safety guarantees.

## License

All QNTX projects are dual-licensed under:

- [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0)
- [MIT License](https://opensource.org/licenses/MIT)
