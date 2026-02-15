---
sidebar_position: 1
title: CLI
---

# Kobe CLI

A command-line tool for generating, importing, and deriving wallets across all supported chains.

## Installation

```bash
cargo install kobe-cli
```

## Commands

### Generate a New Wallet

#### Bitcoin

```bash
# Native SegWit (P2WPKH) — default
kobe btc new

# Taproot (P2TR)
kobe btc new --address-type taproot

# Legacy (P2PKH)
kobe btc new --address-type legacy

# SegWit wrapped (P2SH-P2WPKH)
kobe btc new --address-type nested-segwit

# 24-word mnemonic with 5 addresses
kobe btc new --words 24 --address-type taproot --count 5
```

#### Ethereum

```bash
# Standard derivation (MetaMask compatible)
kobe eth new

# Ledger Live style
kobe eth new --derivation-style ledger-live --count 3

# Ledger Legacy style
kobe eth new --derivation-style ledger-legacy
```

#### Solana

```bash
# Standard derivation (Phantom compatible)
kobe sol new --derivation-style standard

# Trust Wallet style
kobe sol new --derivation-style trust

# Ledger Live style
kobe sol new --derivation-style ledger-live
```

### Import from Mnemonic

```bash
# Import and derive Ethereum addresses
kobe eth import --mnemonic "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"

# Import and derive Bitcoin Taproot addresses
kobe btc import --mnemonic "word1 word2 … word12" --address-type taproot --count 5
```

## Derivation Styles

Different wallet applications use different derivation paths from the same mnemonic:

| Style             | Ethereum Path      | Solana Path        |
| ----------------- | ------------------ | ------------------ |
| **Standard**      | `m/44'/60'/0'/0/i` | `m/44'/501'/i'/0'` |
| **Ledger Live**   | `m/44'/60'/i'/0/0` | `m/44'/501'/i'`    |
| **Ledger Legacy** | `m/44'/60'/0'/i`   | —                  |
| **Trust Wallet**  | —                  | `m/44'/501'/0'`    |
| **Legacy**        | —                  | `m/44'/501'`       |

## Output

The CLI outputs wallet information in a structured format:

```text
Mnemonic: abandon abandon … about
Seed: 5eb00bbdd…

Address #0:
  Path:    m/44'/60'/0'/0/0
  Address: 0x9858EfFD232B4033E47d90003D41EC34EcaEda94
```

## Security

:::warning
The CLI displays private keys and mnemonics in the terminal. Use it in a secure environment and clear your terminal history after use.
:::
