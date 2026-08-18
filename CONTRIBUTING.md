# Contributing

Edit this repository, not the private site shell. The site mirrors `content/docs` and must not become a second editorial source.

## Where to change files

- Pages and `meta.json` live under `content/docs`.
- Sidebar order is `meta.json`.
- Each page needs YAML frontmatter with at least `title` and `description`.

## Preview

Clone the site shell, sync or copy `content/docs` into its `content/docs`, then run `bun run dev`. Published output is [docs.qntx.org](https://docs.qntx.org).

## Pull requests

One concern per pull request. Do not mix fixture copy, sidebar IA, and tooling in the same change.

Write the subject as an imperative sentence. Example: `Document the Echo health endpoint.`

## Linting

```bash
bun install
bun run lint
```

CI runs the same `bun run check`. The VS Code / Cursor **markdownlint** extension reads `.markdownlint.jsonc` and marks issues while you type.

Configuration is `.markdownlint.jsonc` plus `.markdownlint-cli2.jsonc`. MDX pages allow JSX components, frontmatter before the first heading, and bare URLs inside component props.

## Legal

By submitting a pull request you agree that your contribution is licensed under the [MIT License](LICENSE), without additional terms. Read [DISCLAIMER.md](DISCLAIMER.md) before relying on any page as product documentation.
