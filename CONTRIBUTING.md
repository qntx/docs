# Contributing

This repository is the public MDX source for [docs.qntx.org](https://docs.qntx.org). Edit files here. Do not treat the publishing site as a second editorial source.

This tree is a **layout fixture**, not product documentation. Do not add endpoints, protocols, or CLI behavior as if they shipped. Read [DISCLAIMER.md](DISCLAIMER.md).

This repository has no preview server (`bun run dev` does not exist here). After a change lands on `main`, the site copies `content/docs` on an hourly schedule, or when a maintainer runs the sync workflow. The live site is not updated at merge time.

## Where to change files

Pages, images that belong with a page, and `meta.json` live under `content/docs`.

Each page should declare YAML frontmatter with `title` and `description`. The landing page also uses `full: true`.

Root-absolute assets such as `/examples/diagram.svg` are served by the site, not this repository. Add new images next to the page under `content/docs`.

## `meta.json`

`pages` is the sidebar order. Items not listed are omitted.

| Syntax | Meaning |
| --- | --- |
| `overview` | Page or folder slug |
| `---Label---` | Separator |
| `[Text](url)` | Extra page-tree link |

Folders with `"root": true` become the sidebar tab switcher (Getting Started, Writing, Reference, API). A URL must appear in the page tree once. Do not list another root folder's page as `[Text](/that/url)` — Fumadocs then attributes that URL to the wrong tab.

Syntax and constraints: [Fumadocs page conventions](https://www.fumadocs.dev/docs/headless/page-conventions).

## MDX components

Unknown tags fail the site build. This repository's linter does not catch that.

Use only components the site already registers:

- Fumadocs: `Callout`, `Card`, `Cards`, `Tabs`, `Tab`, `Accordions`, `Accordion`, `Files`, `Folder`, `File`, `ImageZoom`, `TypeTable`, `Steps`, `Step`
- Site: `Landing`, `UseCases`, `SectionTitle`, `ApiChrome`

Markdown features follow [Fumadocs markdown](https://www.fumadocs.dev/docs/markdown).

## Pull requests

1. Fork the repository and branch from current `main`.
2. Change one concern. Do not mix fixture copy, sidebar IA, and tooling.
3. Title the pull request as an imperative sentence. Example: `Add a nested page under Reference.`

```bash
git clone https://github.com/qntx/docs.git
cd docs
git checkout -b your-change
bun install
bun run lint
```

## Linting

```bash
bun install
bun run lint
```

`bun run check` is the same command. CI runs that after `bun install --frozen-lockfile`. There is no typecheck or site build in this repository.

The markdownlint extension reads the nearest `.markdownlint.jsonc`. Root files use `.markdownlint.jsonc`. MDX under `content/docs` also uses `content/docs/.markdownlint.jsonc` (heading increment and bare URLs allowed). File selection is `.markdownlint-cli2.jsonc`.

## Legal

By submitting a pull request you agree that your contribution is licensed under the [MIT License](LICENSE), without additional terms.
