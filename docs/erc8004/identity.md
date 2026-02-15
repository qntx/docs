---
sidebar_position: 1
title: Identity Registry
---

# Identity Registry

The Identity Registry is an ERC-721 contract that mints agent identities as NFTs. Each agent gets a unique on-chain ID, a metadata URI, and an optional embedded wallet address.

## Register an Agent

```rust
use alloy::{network::EthereumWallet, providers::ProviderBuilder, signers::local::PrivateKeySigner};
use erc8004::{Erc8004, Network};

let signer: PrivateKeySigner = std::env::var("PRIVATE_KEY")?.parse()?;
let wallet = EthereumWallet::from(signer);

let provider = ProviderBuilder::new()
    .wallet(wallet)
    .connect_http("https://sepolia.base.org".parse()?);

let client = Erc8004::new(provider).with_network(Network::BaseSepolia);

// Register with a metadata URI pointing to your registration file
let agent_id = client.identity()?
    .register_with_uri("https://my-agent.example.com/erc8004.json")
    .await?;

println!("Agent ID: {agent_id}");
```

## Query an Agent

```rust
use alloy::primitives::U256;

let identity = client.identity()?;

// Get the owner address
let owner = identity.owner_of(U256::from(1)).await?;

// Get the metadata URI
let uri = identity.token_uri(U256::from(1)).await?;

// Get the agent's embedded wallet
let wallet = identity.get_agent_wallet(U256::from(1)).await?;
```

## Registration File

The metadata URI should point to a JSON file conforming to the ERC-8004 registration schema:

```rust
use erc8004::types::{RegistrationFile, ServiceEndpoint};

let mut reg = RegistrationFile::new(
    "WeatherBot",
    "An AI agent that provides real-time weather forecasts.",
);

reg.services.push(ServiceEndpoint {
    name: "A2A".to_owned(),
    endpoint: "https://weather-bot.example.com/.well-known/agent.json".to_owned(),
    version: Some("0.2".to_owned()),
    skills: None,
    domains: None,
});

reg.x402_support = true;

let json = reg.to_json()?;
println!("{json}");
```

## EIP-712 Signatures

The Identity Registry supports EIP-712 typed signatures for gasless registration and delegation:

```rust
// Sign a registration message off-chain
// Submit the signature to a relayer for on-chain execution
```

## Related

- [Reputation](/erc8004/reputation) — submit and query feedback
- [Networks](/erc8004/networks) — deployed contract addresses
