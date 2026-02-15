---
sidebar_position: 1
title: Installation
---

# Installation

## Requirements

- Python 3.11+
- A crypto wallet private key (EVM or Solana)

## Install via pip

```bash
# EVM chains (Ethereum, Base, Optimism, …)
pip install x402-openai[evm]

# Solana
pip install x402-openai[svm]

# All chains
pip install x402-openai[all]
```

## Install via uv

```bash
uv add "x402-openai[evm]"
```

## Verify Installation

```python
import x402_openai
print(x402_openai.__version__)
```

## Environment Variables

Store your private key in an environment variable rather than hardcoding it:

```bash
export EVM_PRIVATE_KEY="0x…"
# or
export SOLANA_PRIVATE_KEY="base58…"
```

```python
import os
from x402_openai import X402OpenAI
from x402_openai.wallets import EvmWallet

client = X402OpenAI(
    wallet=EvmWallet(private_key=os.environ["EVM_PRIVATE_KEY"]),
)
```

## Next Steps

- [Quickstart](/x402-openai/python/quickstart) — send your first paid request
- [Wallets](/x402-openai/python/wallets) — EVM, Solana, and BIP-39 mnemonic options
