---
sidebar_position: 2
title: Quickstart
---

# Quickstart

Send your first paid AI request in under a minute.

## Basic Usage

```typescript
import { X402OpenAI } from 'x402-openai';
import { EvmWallet } from 'x402-openai/wallets';

const client = new X402OpenAI({
  wallet: new EvmWallet({ privateKey: '0x…' }),
});

const res = await client.chat.completions.create({
  model: 'openai/gpt-4o-mini',
  messages: [{ role: 'user', content: 'Hello!' }],
});
console.log(res.choices[0]?.message.content);
```

When the server returns `402 Payment Required`, the SDK automatically signs a payment and retries — you only see the final response.

## Custom Base URL

Point the client at any x402-compatible endpoint:

```typescript
const client = new X402OpenAI({
  wallet: new EvmWallet({ privateKey: '0x…' }),
  baseURL: 'https://your-server.example.com/v1',
});
```

## Using Solana

Swap the wallet adapter — the API is identical:

```typescript
import { SvmWallet } from 'x402-openai/wallets';

const client = new X402OpenAI({
  wallet: new SvmWallet({ privateKey: 'base58…' }),
});
```

## Next Steps

- [Wallets](/x402-openai/typescript/wallets) — BIP-39 mnemonics, multi-chain setups
- [Streaming](/x402-openai/typescript/streaming) — streaming responses
- [Policies](/x402-openai/typescript/policies) — control chain and amount preferences
