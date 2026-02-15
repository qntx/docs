---
sidebar_position: 3
title: Task Storage
---

# Task Storage

ra2a supports multiple storage backends for persisting task state. By default, tasks are stored in-memory and lost on restart.

## In-Memory (Default)

No configuration needed — tasks are stored in a `DashMap` and lost when the server stops:

```rust
A2AServerBuilder::new()
    .executor(my_agent)
    .build()
    .serve()
    .await?;
```

## PostgreSQL

```bash
cargo add ra2a --features postgresql
```

```rust
use ra2a::storage::PostgresTaskStore;

let store = PostgresTaskStore::new("postgres://user:pass@localhost/a2a").await?;

A2AServerBuilder::new()
    .executor(my_agent)
    .task_store(store)
    .build()
    .serve()
    .await?;
```

## MySQL

```bash
cargo add ra2a --features mysql
```

```rust
use ra2a::storage::MysqlTaskStore;

let store = MysqlTaskStore::new("mysql://user:pass@localhost/a2a").await?;
```

## SQLite

```bash
cargo add ra2a --features sqlite
```

```rust
use ra2a::storage::SqliteTaskStore;

let store = SqliteTaskStore::new("sqlite://tasks.db").await?;
```

## All SQL Backends

Enable all SQL backends at once:

```bash
cargo add ra2a --features sql
```

## Feature Flag Summary

| Flag         | Backend          | Use case                                  |
| ------------ | ---------------- | ----------------------------------------- |
| _(default)_  | In-memory        | Development, stateless agents             |
| `postgresql` | PostgreSQL       | Production, distributed deployments       |
| `mysql`      | MySQL            | Production, existing MySQL infrastructure |
| `sqlite`     | SQLite           | Single-server deployments, edge           |
| `sql`        | All of the above | Maximum flexibility                       |

## Schema Migration

SQL backends automatically run migrations on startup. No manual schema setup is required.
