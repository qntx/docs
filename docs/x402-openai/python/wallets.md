---
sidebar_position: 3
title: Wallets
---

# Wallets

The x402-openai Python SDK supports multiple wallet types across EVM and Solana chains.

## EVM Wallet

### Private Key

```python
from x402_openai.wallets import EvmWallet

wallet = EvmWallet(private_key="0x…")
```

### BIP-39 Mnemonic

Derive keys from a 12 or 24-word mnemonic phrase:

```python
# Default derivation path: m/44'/60'/0'/0/0
wallet = EvmWallet(mnemonic="word1 word2 … word12")

# Custom account index: m/44'/60'/0'/0/2
wallet = EvmWallet(mnemonic="…", account_index=2)

# Fully custom derivation path
wallet = EvmWallet(mnemonic="…", derivation_path="m/44'/60'/2'/0/0")
```

## Solana Wallet

```python
from x402_openai.wallets import SvmWallet

wallet = SvmWallet(private_key="base58…")
```

## Multi-chain

Register multiple wallets to support payments on any chain the server requires:

```python
from x402_openai import X402OpenAI
from x402_openai.wallets import EvmWallet, SvmWallet

client = X402OpenAI(wallets=[
    EvmWallet(private_key="0x…"),
    SvmWallet(private_key="base58…"),
])
```

The SDK automatically selects the correct wallet based on the server's payment requirements.

## Custom Wallet Adapter

Implement the [`Wallet`](https://github.com/qntx/x402-openai-python/blob/main/src/x402_openai/wallets/_base.py) protocol to add support for a new chain:

```python
from x402_openai.wallets import Wallet

class MyCustomWallet(Wallet):
    # Implement the required methods
    ...
```

## Security Best Practices

:::warning
Never hardcode private keys or mnemonics in source code. Use environment variables or a secrets manager.
:::

```python
import os

wallet = EvmWallet(private_key=os.environ["EVM_PRIVATE_KEY"])
```
