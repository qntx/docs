---
sidebar_position: 1
title: Server
---

# Building an A2A Server

Use ra2a to build an agent that exposes the A2A protocol over HTTP.

## Installation

```bash
cargo add ra2a --features server
```

## Minimal Example

```rust
use async_trait::async_trait;
use ra2a::{
    error::Result,
    server::{A2AServerBuilder, AgentExecutor, ExecutionContext},
    types::{AgentCard, AgentSkill, Message, Part, Task, TaskState, TaskStatus},
};

struct MyAgent {
    card: AgentCard,
}

#[async_trait]
impl AgentExecutor for MyAgent {
    async fn execute(&self, ctx: &ExecutionContext, message: &Message) -> Result<Task> {
        let reply = Message::agent(vec![Part::text("Hello from ra2a!")]);
        Ok(Task::new(&ctx.task_id, &ctx.context_id)
            .with_status(TaskStatus::with_message(TaskState::Completed, reply)))
    }

    async fn cancel(&self, ctx: &ExecutionContext, task_id: &str) -> Result<Task> {
        Ok(Task::new(task_id, &ctx.context_id)
            .with_status(TaskStatus::new(TaskState::Canceled)))
    }

    fn agent_card(&self) -> &AgentCard {
        &self.card
    }
}

#[tokio::main]
async fn main() -> std::io::Result<()> {
    let card = AgentCard::builder("My Agent", "http://localhost:8080")
        .description("A minimal A2A agent")
        .version("1.0.0")
        .skill(AgentSkill::new("chat", "Chat", "General chat", vec![]))
        .build();

    A2AServerBuilder::new()
        .executor(MyAgent { card })
        .host("0.0.0.0")
        .port(8080)
        .cors(true)
        .build()
        .serve()
        .await
}
```

## Agent Card

Every A2A agent publishes an **Agent Card** at `/.well-known/agent.json`. The card describes the agent's capabilities, skills, and endpoint:

```rust
let card = AgentCard::builder("Weather Bot", "https://weather.example.com")
    .description("Provides real-time weather forecasts")
    .version("1.0.0")
    .skill(AgentSkill::new(
        "forecast",
        "Weather Forecast",
        "Get weather forecasts for any location",
        vec!["weather", "forecast", "temperature"],
    ))
    .build();
```

## Server Configuration

```rust
A2AServerBuilder::new()
    .executor(my_agent)
    .host("0.0.0.0")     // Bind address
    .port(8080)           // Listen port
    .cors(true)           // Enable CORS
    .build()
    .serve()
    .await?;
```

## Task Lifecycle

A2A tasks progress through these states:

| State           | Description                                  |
| --------------- | -------------------------------------------- |
| `Submitted`     | Task received, not yet processing            |
| `Working`       | Agent is actively processing                 |
| `InputRequired` | Agent needs more information from the caller |
| `Completed`     | Task finished successfully                   |
| `Canceled`      | Task was canceled                            |
| `Failed`        | Task encountered an error                    |

## Related

- [Client](/ra2a/client) — connect to A2A agents
- [Storage](/ra2a/storage) — configure task persistence
