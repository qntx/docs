---
sidebar_position: 1
title: Configuration
---

# Configuration

The facilitator loads configuration from a TOML file (default: `config.toml`). Run `facilitator init` to generate a fully commented template.

## Generate Config

```bash
facilitator init                    # creates config.toml
facilitator init -o custom.toml    # custom output path
facilitator init --force            # overwrite existing file
```

## Example Configuration

```toml
host = "0.0.0.0"
port = 8080

# Global signers — shared across all chains of the same type.
# Env-var references ("$VAR" or "${VAR}") are resolved at startup.
[signers]
evm    = ["$EVM_SIGNER_PRIVATE_KEY"]       # hex, 0x-prefixed
solana = "$SOLANA_SIGNER_PRIVATE_KEY"       # base58, 64-byte keypair

# EVM chains (CAIP-2 key format: "eip155:<chain_id>")
[chains."eip155:8453"]
rpc = [{ http = "https://mainnet.base.org" }]

[chains."eip155:84532"]
rpc = [{ http = "https://sepolia.base.org" }]

# Solana chains
[chains."solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp"]
rpc = "https://api.mainnet-beta.solana.com"

# Scheme registrations (optional — auto-generated from configured chains)
# [[schemes]]
# id = "v2-eip155-exact"
# chains = "eip155:{8453,84532}"
```

## Environment Variables

The configuration supports environment variable references using `$VAR` or `${VAR}` syntax. Variables are resolved at startup.

| Variable | Default       | Description                    |
| -------- | ------------- | ------------------------------ |
| `HOST`   | `0.0.0.0`     | Bind address                   |
| `PORT`   | `8080`        | Listen port                    |
| `CONFIG` | `config.toml` | Config file path (for `serve`) |
| `OTEL_*` | —             | OpenTelemetry configuration    |

## Signers

Signers are the private keys used to broadcast settlement transactions. They are configured globally per chain family:

```toml
[signers]
evm    = ["$EVM_SIGNER_PRIVATE_KEY"]       # hex, 0x-prefixed
solana = "$SOLANA_SIGNER_PRIVATE_KEY"       # base58, 64-byte keypair
```

:::warning
Signer keys should **always** be provided via environment variables. Never hardcode private keys in the config file.
:::

Multiple EVM signers are supported for load distribution:

```toml
[signers]
evm = ["$SIGNER_1", "$SIGNER_2", "$SIGNER_3"]
```

## Chain Configuration

Each chain is identified by its [CAIP-2](https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-2.md) identifier:

```toml
# Single RPC endpoint
[chains."eip155:8453"]
rpc = [{ http = "https://mainnet.base.org" }]

# Multiple RPC endpoints (failover)
[chains."eip155:1"]
rpc = [
  { http = "https://eth.llamarpc.com" },
  { http = "https://rpc.ankr.com/eth" },
]
```

## CLI Reference

```text
facilitator <COMMAND>

Commands:
  init   Generate a default TOML configuration file
  serve  Start the facilitator HTTP server

Options:
  -h, --help     Print help
  -V, --version  Print version
```

### `serve`

```text
facilitator serve [OPTIONS]

Options:
  -c, --config <PATH>  Path to TOML config file [default: config.toml]
```
