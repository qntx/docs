---
sidebar_position: 4
title: Streaming
---

# Streaming

The x402-openai TypeScript SDK supports streaming out of the box using async iterators.

## Basic Streaming

```typescript
import { X402OpenAI } from 'x402-openai';
import { EvmWallet } from 'x402-openai/wallets';

const client = new X402OpenAI({
  wallet: new EvmWallet({ privateKey: '0x…' }),
});

const stream = await client.chat.completions.create({
  model: 'openai/gpt-4o-mini',
  messages: [{ role: 'user', content: 'Explain x402' }],
  stream: true,
});

for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content;
  if (content) process.stdout.write(content);
}
```

## How Payment Works with Streaming

The payment flow happens **before** the stream begins:

1. The SDK sends the initial request.
2. If a `402` is returned, the SDK signs and retries with payment.
3. Once the payment is accepted, the server begins streaming chunks.
4. You receive chunks exactly as with the standard OpenAI client.

The payment negotiation is invisible — you only interact with the stream.

## Streaming with Policies

Combine streaming with [payment policies](/x402-openai/typescript/policies) to control chain selection:

```typescript
import { X402OpenAI, preferNetwork } from 'x402-openai';
import { EvmWallet } from 'x402-openai/wallets';

const client = new X402OpenAI({
  wallet: new EvmWallet({ privateKey: '0x…' }),
  policies: [preferNetwork('eip155:8453')],
});

const stream = await client.chat.completions.create({
  model: 'openai/gpt-4o-mini',
  messages: [{ role: 'user', content: 'Hello!' }],
  stream: true,
});

for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content;
  if (content) process.stdout.write(content);
}
```
