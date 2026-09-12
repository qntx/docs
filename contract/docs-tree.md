# Fan-in docs tree

Source repositories that publish to [docs.qntx.org](https://docs.qntx.org) keep a Fumadocs tree at `docs/`. The aggregator copies public trees to `content/docs/libs/<repo>/`. Private repositories may use the same layout in-repo; they are never listed in `fan-in/manifest.json`.

Edit library pages in `qntx/<repo>/docs/`. Do not edit mirrored files under `content/docs/libs/<repo>/`.

## Layout

```text
docs/
  meta.json
  index.mdx
  *.mdx
```

`meta.json` must have a string `title` and a `pages` array. Do not set `"root": true`. Every `pages` slug that is not a separator or `[text](url)` must exist as `<slug>.mdx` or a folder.

Every `.mdx` file needs YAML frontmatter `title` and `description`. `full: true` is rejected.

Allowed files: `.mdx`, `meta.json`, colocated images (`.png` `.jpg` `.jpeg` `.gif` `.svg` `.webp`), `.txt` include snippets. **No `.md`.**

## MDX

Allowed tags: `Callout`, `Card`, `Cards`, `Tabs`, `Tab`, `Accordions`, `Accordion`, `Files`, `Folder`, `File`, `ImageZoom`, `TypeTable`, `Steps`, `Step`, `include`.

Forbidden: `Landing`, `UseCases`, `SectionTitle`, `ApiChrome`, ESM `import`/`export` outside fences, root-absolute `/examples/…` images, `<include>` targets outside `docs/`.

Prefer plain markdown. Unknown JSX fails the site build.

## Limits

Tree 20 MiB. File 2 MiB. No symlinks. No `.git` / `.github` path segments.

`CHANGELOG.md`, `SECURITY.md`, `CONTRIBUTING.md`, `LICENSE*`, and `demo.gif` stay at the repository root.

## Check

Source CI:

```yaml
jobs:
  docs:
    uses: qntx/workflows/.github/workflows/ci-docs.yml@v2
    permissions:
      contents: read
```

Local, from a clone of `qntx/workflows` at the same peel as `@v2`:

```bash
bun install --frozen-lockfile
bun scripts/validate-docs-tree.ts /path/to/repo/docs --lint
```
