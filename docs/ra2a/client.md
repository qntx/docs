---
sidebar_position: 2
title: Client
---

# A2A Client

Use the ra2a client to discover agents, send messages, and stream responses.

## Installation

```bash
cargo add ra2a --features client
```

## Discover an Agent

Every A2A agent publishes an Agent Card. Use the client to fetch it:

```rust
use ra2a::client::{A2AClient, Client};

let client = A2AClient::new("https://agent.example.com")?;
let card = client.get_agent_card().await?;

println!("Name: {}", card.name);
println!("Skills: {:?}", card.skills);
```

## Send a Message

```rust
use ra2a::types::Message;

let message = Message::user_text("What is the weather in Tokyo?");
let mut stream = client.send_message(message).await?;

while let Some(event) = futures::StreamExt::next(&mut stream).await {
    match event? {
        // Handle task updates, artifacts, etc.
        event => println!("{:?}", event),
    }
}
```

## Get a Task

Retrieve a previously submitted task by ID:

```rust
let task = client.get_task("task-id-123").await?;
println!("Status: {:?}", task.status.state);
```

## Cancel a Task

```rust
let task = client.cancel_task("task-id-123").await?;
println!("Canceled: {:?}", task.status.state);
```

## SSE Streaming

The client automatically handles Server-Sent Events (SSE) streaming. When you call `send_message`, the response is streamed as a series of events:

- **TaskStatusUpdate** — the task's state changed
- **TaskArtifactUpdate** — a new artifact (text, file, etc.) was produced
- **TaskComplete** — the task finished

## Error Handling

```rust
use ra2a::error::Error;

match client.send_message(message).await {
    Ok(stream) => { /* process stream */ }
    Err(Error::Transport(e)) => eprintln!("Network error: {e}"),
    Err(Error::Protocol(e)) => eprintln!("Protocol error: {e}"),
    Err(e) => eprintln!("Other error: {e}"),
}
```

## Related

- [Server](/ra2a/server) — build an A2A agent
- [Storage](/ra2a/storage) — configure task persistence
