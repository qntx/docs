---
sidebar_position: 2
title: Quickstart
---

# Quickstart

Send your first paid AI request in under a minute.

## Basic Usage

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

That's it. If the server returns `402 Payment Required`, the SDK automatically signs a payment and retries — you only see the final response.

## What Happens Under the Hood

1. The SDK sends your request to `https://llm.qntx.fun/v1` (default).
2. The server responds with `402` and includes payment requirements in the headers.
3. The SDK parses the requirements and finds a compatible wallet.
4. A payment payload is signed using your wallet's private key.
5. The request is retried with the `X-PAYMENT` header attached.
6. The server verifies the payment via a facilitator and returns the content.

## Custom Base URL

Point the client at any x402-compatible endpoint:

```python
client = X402OpenAI(
    wallet=EvmWallet(private_key="0x…"),
    base_url="https://your-server.example.com/v1",
)
```

## Using Solana

Swap the wallet adapter — the API is identical:

```python
from x402_openai.wallets import SvmWallet

client = X402OpenAI(wallet=SvmWallet(private_key="base58…"))
```

## Next Steps

- [Wallets](/x402-openai/python/wallets) — BIP-39 mnemonics, multi-chain setups
- [Streaming](/x402-openai/python/streaming) — async streaming responses
- [Policies](/x402-openai/python/policies) — control chain and amount preferences
