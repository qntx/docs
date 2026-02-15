---
sidebar_position: 2
title: Reputation Registry
---

# Reputation Registry

The Reputation Registry allows clients to submit feedback about agents and query aggregated reputation scores.

## Submit Feedback

```rust
use alloy::primitives::U256;

let reputation = client.reputation()?;

// Submit positive feedback for agent #1
reputation.submit_feedback(
    U256::from(1),  // agent ID
    5,              // score (1-5)
    "Excellent weather forecasts, highly accurate.",
).await?;
```

## Revoke Feedback

```rust
// Revoke previously submitted feedback
reputation.revoke_feedback(U256::from(1)).await?;
```

## Query Reputation

### Aggregated Summary

```rust
let summary = reputation.get_summary(U256::from(1)).await?;

println!("Average score: {}", summary.average_score);
println!("Total reviews: {}", summary.total_reviews);
```

### List Feedback Entries

```rust
let entries = reputation.list_feedback(U256::from(1)).await?;

for entry in entries {
    println!("{}: {} — {}", entry.client, entry.score, entry.comment);
}
```

### List Clients Who Reviewed

```rust
let clients = reputation.list_clients(U256::from(1)).await?;
```

## Off-chain Feedback Type

The SDK includes an off-chain `Feedback` type for building and serializing feedback:

```rust
use erc8004::types::Feedback;

let feedback = Feedback {
    agent_id: 1,
    score: 5,
    comment: "Excellent service".to_owned(),
    timestamp: chrono::Utc::now(),
};
```

## Related

- [Identity](/erc8004/identity) — register agents on-chain
- [Networks](/erc8004/networks) — deployed contract addresses
