---
sidebar_position: 0
title: x402-openai SDK
---

# x402-openai SDK

Drop-in replacement for the OpenAI client with transparent [x402](https://www.x402.org/) payment support. Available for **Python** and **TypeScript**.

When the server responds with **HTTP 402**, the library automatically signs a crypto payment and retries the request — zero code changes needed.

## How It Works

1. You create an `X402OpenAI` client with a crypto wallet.
2. You call `client.chat.completions.create(...)` as usual.
3. If the server returns `402 Payment Required`, the SDK:
   - Parses the payment requirements from the response headers.
   - Selects a compatible wallet and chain.
   - Signs a payment payload.
   - Retries the request with the payment attached.
4. You receive the response as if the payment never happened.

## Supported Chains

| Chain                   | Python Extra       | TypeScript Package          |
| ----------------------- | ------------------ | --------------------------- |
| EVM (Ethereum, Base, …) | `x402-openai[evm]` | `@x402/evm` + `viem`        |
| Solana                  | `x402-openai[svm]` | `@x402/svm` + `@solana/kit` |
| All chains              | `x402-openai[all]` | Both of the above           |

## Default Endpoint

Both SDKs default to `https://llm.qntx.fun/v1` as the base URL. You can override this with any OpenAI-compatible endpoint that supports x402.

## Choose Your Language

- **[Python](/x402-openai/python/installation)** — `pip install x402-openai[evm]`
- **[TypeScript](/x402-openai/typescript/installation)** — `bun add x402-openai @x402/evm viem`

## Source Code

- [qntx/x402-openai-python](https://github.com/qntx/x402-openai-python)
- [qntx/x402-openai-typescript](https://github.com/qntx/x402-openai-typescript)
