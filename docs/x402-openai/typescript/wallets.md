---
sidebar_position: 3
title: Wallets
---

# Wallets

The x402-openai TypeScript SDK supports multiple wallet types across EVM and Solana chains.

## EVM Wallet

### Private Key

```typescript
import { EvmWallet } from 'x402-openai/wallets';

const wallet = new EvmWallet({ privateKey: '0x…' });
```

### BIP-39 Mnemonic

Derive keys from a 12 or 24-word mnemonic phrase:

```typescript
// Default derivation path: m/44'/60'/0'/0/0
const wallet = new EvmWallet({ mnemonic: 'word1 word2 … word12' });

// Custom account index: m/44'/60'/0'/0/2
const wallet2 = new EvmWallet({ mnemonic: '…', accountIndex: 2 });

// Fully custom derivation path
const wallet3 = new EvmWallet({
  mnemonic: '…',
  derivationPath: "m/44'/60'/2'/0/0",
});
```

## Solana Wallet

```typescript
import { SvmWallet } from 'x402-openai/wallets';

const wallet = new SvmWallet({ privateKey: 'base58…' });
```

## Multi-chain

Register multiple wallets to support payments on any chain the server requires:

```typescript
import { X402OpenAI } from 'x402-openai';
import { EvmWallet, SvmWallet } from 'x402-openai/wallets';

const client = new X402OpenAI({
  wallets: [
    new EvmWallet({ privateKey: '0x…' }),
    new SvmWallet({ privateKey: 'base58…' }),
  ],
});
```

The SDK automatically selects the correct wallet based on the server's payment requirements.

## Custom Wallet Adapter

Implement the [`Wallet`](https://github.com/qntx/x402-openai-typescript/blob/main/src/wallets/base.ts) interface to add support for a new chain:

```typescript
import type { Wallet } from 'x402-openai/wallets';

class MyCustomWallet implements Wallet {
  // Implement the required methods
}
```

## Security Best Practices

:::warning
Never hardcode private keys or mnemonics in source code. Use environment variables or a secrets manager.
:::

```typescript
const wallet = new EvmWallet({ privateKey: process.env.EVM_PRIVATE_KEY! });
```
