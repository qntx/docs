---
sidebar_position: 2
title: Docker
---

# Docker Deployment

The facilitator is available as a pre-built Docker image or can be built from source.

## Pre-built Image

```bash
docker run -p 8080:8080 \
  -v ./config.toml:/app/config.toml \
  -e EVM_SIGNER_PRIVATE_KEY="0x…" \
  ghcr.io/qntx/facilitator
```

## Build from Source

```bash
# Full build (all chains)
docker build -t facilitator .

# EVM-only build (smaller binary)
docker build -t facilitator --build-arg FEATURES=chain-eip155 .
```

## Run

```bash
docker run -p 8080:8080 \
  -v ./config.toml:/app/config.toml \
  -e EVM_SIGNER_PRIVATE_KEY="0x…" \
  -e SOLANA_SIGNER_PRIVATE_KEY="base58…" \
  facilitator
```

## Docker Compose

```yaml
version: '3.8'
services:
  facilitator:
    image: ghcr.io/qntx/facilitator
    ports:
      - '8080:8080'
    volumes:
      - ./config.toml:/app/config.toml:ro
    environment:
      - EVM_SIGNER_PRIVATE_KEY=${EVM_SIGNER_PRIVATE_KEY}
      - SOLANA_SIGNER_PRIVATE_KEY=${SOLANA_SIGNER_PRIVATE_KEY}
    restart: unless-stopped
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:8080/health']
      interval: 30s
      timeout: 10s
      retries: 3
```

## Environment Variables

Pass signer keys and configuration via environment variables:

```bash
# Required
EVM_SIGNER_PRIVATE_KEY=0x…        # hex, 0x-prefixed
SOLANA_SIGNER_PRIVATE_KEY=base58…  # base58, 64-byte keypair

# Optional
HOST=0.0.0.0                       # bind address
PORT=8080                           # listen port
```

## Health Check

The facilitator exposes a `/health` endpoint for container orchestration:

```bash
curl http://localhost:8080/health
```
