---
sidebar_position: 2
title: Supported Chains
---

# Supported Chains

Kobe supports key derivation for Bitcoin, Ethereum, and Solana from a single BIP-39 mnemonic.

## Bitcoin (`kobe-btc`)

```bash
cargo add kobe kobe-btc
```

Four address types are supported:

| Address Type                    | Standard | Example Prefix |
| ------------------------------- | -------- | -------------- |
| **P2PKH** (Legacy)              | BIP-44   | `1…`           |
| **P2SH-P2WPKH** (Nested SegWit) | BIP-49   | `3…`           |
| **P2WPKH** (Native SegWit)      | BIP-84   | `bc1q…`        |
| **P2TR** (Taproot)              | BIP-86   | `bc1p…`        |

```rust
use kobe::Wallet;
use kobe_btc::{AddressType, Deriver, Network};

let wallet = Wallet::generate(12, None)?;

let deriver = Deriver::new(wallet.seed(), AddressType::P2wpkh, Network::Mainnet);
let addr = deriver.derive(0)?;

println!("Address: {}", addr.address);
println!("Path:    {}", addr.path);
```

## Ethereum (`kobe-evm`)

```bash
cargo add kobe kobe-evm
```

Three derivation styles match popular wallet applications:

| Style             | Path Pattern       | Compatible With        |
| ----------------- | ------------------ | ---------------------- |
| **Standard**      | `m/44'/60'/0'/0/i` | MetaMask, most wallets |
| **Ledger Live**   | `m/44'/60'/i'/0/0` | Ledger Live            |
| **Ledger Legacy** | `m/44'/60'/0'/i`   | Ledger Legacy          |

```rust
use kobe::Wallet;
use kobe_evm::{DerivationStyle, Deriver};

let wallet = Wallet::from_mnemonic("abandon … about", None)?;

let deriver = Deriver::new(wallet.seed(), DerivationStyle::Standard);
let addr = deriver.derive(0)?;

println!("Address: {}", addr.address);  // 0x9858EfFD…
```

## Solana (`kobe-svm`)

```bash
cargo add kobe kobe-svm
```

Four derivation styles using SLIP-10 Ed25519:

| Style           | Path Pattern       | Compatible With   |
| --------------- | ------------------ | ----------------- |
| **Standard**    | `m/44'/501'/i'/0'` | Phantom, Solflare |
| **Ledger Live** | `m/44'/501'/i'`    | Ledger Live       |
| **Trust**       | `m/44'/501'/0'`    | Trust Wallet      |
| **Legacy**      | `m/44'/501'`       | Legacy wallets    |

```rust
use kobe::Wallet;
use kobe_svm::{DerivationStyle, Deriver};

let wallet = Wallet::generate(24, None)?;

let deriver = Deriver::new(wallet.seed(), DerivationStyle::Standard);
let addr = deriver.derive(0)?;

println!("Address: {}", addr.address);
```

## Planned Chains

- **`kobe-sui`** — Sui blockchain
- **`kobe-xmr`** — Monero
- **`kobe-zec`** — Zcash
