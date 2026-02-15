---
sidebar_position: 0
title: Overview
---

# Kobe

Modular, `no_std`-compatible Rust toolkit for HD wallet derivation — BIP39 mnemonic management, multi-chain address generation, and a batteries-included CLI.

## What is Kobe?

Kobe provides a unified `Wallet` seed from a single BIP-39 mnemonic, then delegates to per-chain crates for standards-compliant key derivation. All library crates compile under `no_std + alloc` and zeroize sensitive material on drop.

## Crates

| Crate          | Description                                                                |
| -------------- | -------------------------------------------------------------------------- |
| **`kobe`**     | Core library — BIP39 mnemonic, seed derivation, `no_std` wallet type       |
| **`kobe-btc`** | Bitcoin — P2PKH, P2SH-P2WPKH, P2WPKH, P2TR address derivation              |
| **`kobe-evm`** | Ethereum (EVM) — BIP-44 derivation, MetaMask / Ledger Live / Legacy styles |
| **`kobe-svm`** | Solana (SVM) — SLIP-10 Ed25519, Phantom / Trust / Ledger Live styles       |
| **`kobe-cli`** | CLI tool — generate, import, and derive wallets across all chains          |

Planned: **`kobe-sui`** (Sui), **`kobe-xmr`** (Monero), **`kobe-zec`** (Zcash).

## Quick Start

### Library Usage

```rust
use kobe::Wallet;
use kobe_evm::{DerivationStyle, Deriver};

let wallet = Wallet::from_mnemonic(
    "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about",
    None,
)?;

let deriver = Deriver::new(wallet.seed(), DerivationStyle::Standard);
let addr = deriver.derive(0)?;

println!("Address: {}", addr.address);
```

### CLI Usage

```bash
cargo install kobe-cli

kobe eth new                           # New Ethereum wallet
kobe btc new --address-type taproot    # New Bitcoin Taproot wallet
kobe sol new                           # New Solana wallet
```

## Design Highlights

| Aspect                 | Detail                                                                 |
| ---------------------- | ---------------------------------------------------------------------- |
| **Multi-chain**        | Bitcoin (4 address types), Ethereum, Solana — from one BIP39 seed      |
| **HD standards**       | BIP32, BIP39, BIP44 / 49 / 84 / 86, SLIP-10                            |
| **Derivation styles**  | Standard, Ledger Live, Ledger Legacy, Trust Wallet, Legacy (Solana)    |
| **`no_std` + `alloc`** | All library crates compile without `std`; suitable for embedded / WASM |
| **Zeroizing**          | Private keys and seeds wrapped in `Zeroizing<T>` — cleared on drop     |
| **CSPRNG**             | Random generation via OS-provided `rand_core::OsRng`                   |

## Feature Flags

| Crate      | `std`                      | `alloc`                      | `rand`                     | `rand_core`             |
| ---------- | -------------------------- | ---------------------------- | -------------------------- | ----------------------- |
| `kobe`     | Full std support (default) | Heap allocation for `no_std` | Random mnemonic via OS RNG | Custom RNG for `no_std` |
| `kobe-btc` | Full std support (default) | Heap allocation for `no_std` | Random key generation      | —                       |
| `kobe-evm` | Full std support (default) | Heap allocation for `no_std` | Random key generation      | —                       |
| `kobe-svm` | Full std support (default) | Heap allocation for `no_std` | Ed25519 key generation     | —                       |

## Security

:::warning
This library has **not** been independently audited. Use at your own risk.
:::

- Private keys and seeds use [`zeroize`](https://docs.rs/zeroize) for secure memory cleanup
- No key material is logged or persisted by the library
- Random generation uses OS-provided CSPRNG via `rand_core::OsRng`

## Source Code

- [qntx/kobe](https://github.com/qntx/kobe)
- [crates.io/crates/kobe](https://crates.io/crates/kobe)
- [docs.rs/kobe](https://docs.rs/kobe)
