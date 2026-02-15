---
sidebar_position: 3
title: Supported Networks
---

# Supported Networks

ERC-8004 contracts are deployed via CREATE2, so all mainnets share the same addresses and all testnets share the same addresses.

## Mainnets

| Network         | Chain ID | CAIP-2 ID       |
| --------------- | -------- | --------------- |
| Ethereum        | 1        | `eip155:1`      |
| Base            | 8453     | `eip155:8453`   |
| Polygon         | 137      | `eip155:137`    |
| Arbitrum One    | 42161    | `eip155:42161`  |
| Celo            | 42220    | `eip155:42220`  |
| Gnosis          | 100      | `eip155:100`    |
| Scroll          | 534352   | `eip155:534352` |
| Taiko (Alethia) | 167000   | `eip155:167000` |
| Monad           | 143      | `eip155:143`    |
| BNB Smart Chain | 56       | `eip155:56`     |

## Testnets

| Network                 | Chain ID | CAIP-2 ID         |
| ----------------------- | -------- | ----------------- |
| Ethereum Sepolia        | 11155111 | `eip155:11155111` |
| Base Sepolia            | 84532    | `eip155:84532`    |
| Polygon Amoy            | 80002    | `eip155:80002`    |
| Arbitrum Sepolia        | 421614   | `eip155:421614`   |
| Celo Alfajores          | 44787    | `eip155:44787`    |
| Scroll Sepolia          | 534351   | `eip155:534351`   |
| Monad Testnet           | 10143    | `eip155:10143`    |
| BNB Smart Chain Testnet | 97       | `eip155:97`       |

## Usage

Select a network when creating the client:

```rust
use erc8004::{Erc8004, Network};

// Mainnet
let client = Erc8004::new(provider).with_network(Network::EthereumMainnet);
let client = Erc8004::new(provider).with_network(Network::Base);
let client = Erc8004::new(provider).with_network(Network::Polygon);

// Testnet
let client = Erc8004::new(provider).with_network(Network::BaseSepolia);
let client = Erc8004::new(provider).with_network(Network::EthereumSepolia);
```

## Multi-network Queries

Query the same registry across multiple chains:

```rust
use erc8004::{Erc8004, Network};
use alloy::primitives::U256;

let networks = [Network::EthereumMainnet, Network::Base, Network::Polygon];

for network in networks {
    let provider = create_provider_for(network);
    let client = Erc8004::new(provider).with_network(network);
    let identity = client.identity()?;

    match identity.token_uri(U256::from(1)).await {
        Ok(uri) => println!("{network:?}: {uri}"),
        Err(_) => println!("{network:?}: not found"),
    }
}
```

## Custom Network

For networks not in the built-in list, provide contract addresses manually:

```rust
use alloy::primitives::address;

let client = Erc8004::new(provider)
    .with_identity_address(address!("0x…"))
    .with_reputation_address(address!("0x…"))
    .with_validation_address(address!("0x…"));
```
