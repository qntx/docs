---
sidebar_position: 3
title: API Reference
---

# API Reference

The facilitator exposes a REST API for payment verification and settlement.

## `GET /supported`

List all supported payment kinds (version, scheme, network combinations).

**Response:**

```json
{
  "kinds": [
    {
      "version": "v2",
      "scheme": "exact",
      "network": "eip155:8453"
    },
    {
      "version": "v2",
      "scheme": "exact",
      "network": "eip155:84532"
    },
    {
      "version": "v2",
      "scheme": "exact",
      "network": "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp"
    }
  ]
}
```

## `POST /verify`

Verify a payment payload against the server's requirements. Does **not** settle the payment.

**Request body:** the payment payload from the client's `X-PAYMENT` header, plus the server's price tag requirements.

**Response:**

- `200 OK` — payment is valid
- `400 Bad Request` — payment is invalid (signature mismatch, insufficient amount, wrong chain, etc.)

## `POST /settle`

Settle an accepted payment on-chain. Broadcasts the settlement transaction and returns the transaction hash.

**Request body:** the verified payment payload.

**Response:**

- `200 OK` — settlement transaction broadcast successfully
- `500 Internal Server Error` — settlement failed (explicit error, not silent)

:::info
r402 uses **explicit settlement errors** — if settlement fails, the server receives a `500` response rather than silently dropping the transaction.
:::

## `GET /health`

Health check endpoint for monitoring and container orchestration.

**Response:**

- `200 OK` — server is healthy

## Wire Format

The facilitator uses the **V2-only** wire format with [CAIP-2](https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-2.md) chain identifiers and `Payment-Signature` headers.

## Error Responses

All error responses follow a consistent format:

```json
{
  "error": {
    "code": "INVALID_SIGNATURE",
    "message": "Payment signature verification failed"
  }
}
```

## Related

- [Configuration](/facilitator/configuration) — TOML config file reference
- [Docker](/facilitator/docker) — container deployment
- [r402](/r402/overview) — the underlying Rust SDK
