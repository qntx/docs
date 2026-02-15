---
sidebar_position: 0
title: Overview
---

# ra2a

Comprehensive Rust SDK for the [Agent2Agent (A2A) Protocol](https://google.github.io/A2A/) — client transport, server framework, streaming, gRPC, and multi-backend task storage.

## What is ra2a?

ra2a implements the full A2A protocol specification (v0.3.0) with an idiomatic Rust API. It provides everything you need to build agents that discover each other, exchange tasks, and stream results.

## Key Features

- **Axum server** — full A2A server with JSON-RPC endpoints, SSE streaming, and task lifecycle management.
- **reqwest client** — discover agents, send messages, and stream responses.
- **gRPC transport** — optional tonic/prost-based gRPC transport.
- **Task storage** — in-memory (default), PostgreSQL, MySQL, or SQLite.
- **Push notifications** — HMAC-SHA256 verified webhook push notifications.

## Quick Start

```bash
cargo add ra2a
```

```rust
use ra2a::client::{A2AClient, Client};

let client = A2AClient::new("https://agent.example.com")?;

// Discover agent capabilities
let card = client.get_agent_card().await?;
println!("Agent: {} — {}", card.name, card.description.unwrap_or_default());

// Send a message
let message = ra2a::types::Message::user_text("Hello!");
let mut stream = client.send_message(message).await?;

while let Some(event) = futures::StreamExt::next(&mut stream).await {
    println!("{:?}", event?);
}
```

## Feature Flags

| Flag         | Default | Description                                        |
| ------------ | :-----: | -------------------------------------------------- |
| `client`     | **yes** | HTTP/JSON-RPC client, SSE streaming, card resolver |
| `server`     | **yes** | Axum HTTP server, event queue, task lifecycle      |
| `grpc`       |    —    | gRPC transport via tonic/prost                     |
| `telemetry`  |    —    | OpenTelemetry tracing spans and metrics            |
| `postgresql` |    —    | PostgreSQL task store via sqlx                     |
| `mysql`      |    —    | MySQL task store via sqlx                          |
| `sqlite`     |    —    | SQLite task store via sqlx                         |
| `sql`        |    —    | All SQL backends                                   |
| `full`       |    —    | Everything                                         |

```toml
# Server with PostgreSQL and telemetry
ra2a = { version = "0.4", features = ["server", "postgresql", "telemetry"] }

# Client only
ra2a = { version = "0.4", default-features = false, features = ["client"] }

# Everything
ra2a = { version = "0.4", features = ["full"] }
```

## Source Code

- [qntx/ra2a](https://github.com/qntx/ra2a)
- [crates.io/crates/ra2a](https://crates.io/crates/ra2a)
- [docs.rs/ra2a](https://docs.rs/ra2a)
