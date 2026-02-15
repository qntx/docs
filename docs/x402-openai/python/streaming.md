---
sidebar_position: 4
title: Streaming
---

# Streaming

The x402-openai Python SDK supports both synchronous and asynchronous streaming.

## Async Streaming

```python
from x402_openai import AsyncX402OpenAI
from x402_openai.wallets import EvmWallet

client = AsyncX402OpenAI(wallet=EvmWallet(private_key="0x…"))

stream = await client.chat.completions.create(
    model="openai/gpt-4o-mini",
    messages=[{"role": "user", "content": "Explain x402"}],
    stream=True,
)

async for chunk in stream:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
```

## Synchronous Streaming

```python
from x402_openai import X402OpenAI
from x402_openai.wallets import EvmWallet

client = X402OpenAI(wallet=EvmWallet(private_key="0x…"))

stream = client.chat.completions.create(
    model="openai/gpt-4o-mini",
    messages=[{"role": "user", "content": "Explain x402"}],
    stream=True,
)

for chunk in stream:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
```

## How Payment Works with Streaming

The payment flow happens **before** the stream begins:

1. The SDK sends the initial request.
2. If a `402` is returned, the SDK signs and retries with payment.
3. Once the payment is accepted, the server begins streaming chunks.
4. You receive chunks exactly as with the standard OpenAI client.

The payment negotiation is invisible — you only interact with the stream.
