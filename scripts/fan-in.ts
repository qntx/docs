import { mkdirSync, readFileSync, rmSync, writeFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, resolve } from "node:path";
import { validateDocsTree } from "./validate-docs-tree";

const REPO_RE = /^qntx\/([A-Za-z0-9._-]+)$/;
const NAME_RE = /^[A-Za-z0-9._-]+$/;

export type Source = { repo: string; ref?: string };
export type Manifest = { version: number; sources: Source[] };
export type SourceState = { commit?: string; synced_at?: string; ok: boolean; error?: string };
export type FanInState = Record<string, SourceState>;

export type GitHub = {
  getRepo: (repo: string) => Promise<{ status: number; private?: boolean }>;
  getDocsHead: (repo: string, ref: string) => Promise<{ status: number; sha: string | null }>;
};

export type CloneFn = (repo: string, ref: string, dest: string) => Promise<void>;

function loadJson<T>(path: string, fallback: T): T {
  if (!existsSync(path)) return fallback;
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

function destName(repo: string): string {
  const m = repo.match(REPO_RE);
  if (!m) throw new Error(`invalid repo ${repo}`);
  const name = m[1];
  if (name === ".github" || !NAME_RE.test(name)) throw new Error(`rejected dest ${name}`);
  return name;
}

export function githubFromToken(token: string): GitHub {
  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "qntx-docs-fan-in",
  };
  return {
    async getRepo(repo) {
      const r = await fetch(`https://api.github.com/repos/${repo}`, { headers });
      if (r.status !== 200) return { status: r.status };
      const body = (await r.json()) as { private?: boolean };
      return { status: 200, private: Boolean(body.private) };
    },
    async getDocsHead(repo, ref) {
      const url = `https://api.github.com/repos/${repo}/commits?sha=${encodeURIComponent(ref)}&path=docs&per_page=1`;
      const r = await fetch(url, { headers });
      if (r.status !== 200) return { status: r.status, sha: null };
      const body = (await r.json()) as { sha: string }[];
      if (!Array.isArray(body) || body.length === 0) return { status: 200, sha: null };
      return { status: 200, sha: body[0].sha };
    },
  };
}

export function gitSparseClone(): CloneFn {
  return async (repo, ref, dest) => {
    rmSync(dest, { recursive: true, force: true });
    mkdirSync(dest, { recursive: true });
    const url = `https://github.com/${repo}.git`;
    const clone = spawnSync(
      "git",
      ["clone", "--depth", "1", "--filter=blob:none", "--sparse", "--branch", ref, url, dest],
      { encoding: "utf8" },
    );
    if (clone.status !== 0) throw new Error(clone.stderr || "git clone failed");
    const sparse = spawnSync("git", ["-C", dest, "sparse-checkout", "set", "docs"], { encoding: "utf8" });
    if (sparse.status !== 0) throw new Error(sparse.stderr || "sparse-checkout failed");
  };
}

function docsNonEmpty(docsDir: string): boolean {
  if (!existsSync(docsDir) || !statSync(docsDir).isDirectory()) return false;
  const stack = [docsDir];
  while (stack.length) {
    const d = stack.pop()!;
    for (const name of readdirSync(d)) {
      if (name === ".DS_Store") continue;
      const p = join(d, name);
      const st = statSync(p);
      if (st.isDirectory()) stack.push(p);
      else return true;
    }
  }
  return false;
}

function rsyncDocs(src: string, dest: string): void {
  mkdirSync(dest, { recursive: true });
  const r = spawnSync(
    "rsync",
    ["-a", "--delete", "--exclude", ".git", "--exclude", ".github", "--exclude", ".DS_Store", "--exclude", "node_modules", `${src}/`, `${dest}/`],
    { encoding: "utf8" },
  );
  if (r.status !== 0) throw new Error(r.stderr || "rsync failed");
}

function rewriteLibsMeta(workspace: string, dests: string[]): void {
  const metaPath = join(workspace, "content/docs/libs/meta.json");
  const meta = loadJson<{ title: string; description?: string; root?: boolean; pages?: string[] }>(metaPath, {
    title: "Libraries",
    root: true,
    pages: ["index"],
  });
  const pages = ["index", ...dests.filter((n) => n !== "index").sort()];
  meta.pages = pages;
  writeFileSync(metaPath, `${JSON.stringify(meta, null, 2)}\n`);
}

function writeRefs(workspace: string, refs: Record<string, string>): void {
  writeFileSync(join(workspace, "content/docs/libs/.refs.json"), `${JSON.stringify(refs, null, 2)}\n`);
}

export async function runFanIn(opts: {
  workspace: string;
  github: GitHub;
  clone: CloneFn;
  env: NodeJS.ProcessEnv;
  now?: string;
  tmpRoot: string;
  markdownlintConfig: string;
}): Promise<{ failed: boolean; state: FanInState }> {
  const workspace = resolve(opts.workspace);
  const manifest = loadJson<Manifest>(join(workspace, "fan-in/manifest.json"), { version: 1, sources: [] });
  if (manifest.version !== 1) throw new Error("unsupported manifest version");
  let state = loadJson<FanInState>(join(workspace, "fan-in/state.json"), {});
  const force = opts.env.FAN_IN_FORCE === "true";
  const only = opts.env.FAN_IN_REPO || "";
  const sources = only ? manifest.sources.filter((s) => s.repo === only) : manifest.sources;
  let failed = false;
  const now = opts.now ?? new Date().toISOString();

  for (const src of sources) {
    const repo = src.repo;
    const ref = src.ref ?? "main";
    let name: string;
    try {
      name = destName(repo);
    } catch (e) {
      failed = true;
      state[repo] = { ok: false, error: String(e), synced_at: now };
      continue;
    }
    const dest = join(workspace, "content/docs/libs", name);
    const repoInfo = await opts.github.getRepo(repo);
    if (repoInfo.status === 404 || (repoInfo.status === 200 && repoInfo.private === true)) {
      rmSync(dest, { recursive: true, force: true });
      state[repo] = { ok: false, error: "unpublished", synced_at: now };
      failed = true;
      continue;
    }
    if (repoInfo.status !== 200) {
      state[repo] = { ...(state[repo] ?? { ok: false }), ok: false, error: `GET repo ${repoInfo.status}`, synced_at: now };
      failed = true;
      continue;
    }
    const head = await opts.github.getDocsHead(repo, ref);
    if (head.status !== 200) {
      state[repo] = { ...(state[repo] ?? { ok: false }), ok: false, error: `GET commits ${head.status}`, synced_at: now };
      failed = true;
      continue;
    }
    if (!force && head.sha && state[repo]?.commit === head.sha) {
      continue;
    }
    if (head.sha === null) {
      rmSync(dest, { recursive: true, force: true });
      const { commit: _c, ...rest } = state[repo] ?? { ok: false };
      state[repo] = { ...rest, ok: false, error: "docs missing", synced_at: now };
      failed = true;
      continue;
    }
    const tmp = join(opts.tmpRoot, name);
    try {
      await opts.clone(repo, ref, tmp);
    } catch (e) {
      state[repo] = { ...(state[repo] ?? { ok: false }), ok: false, error: `clone: ${e}`, synced_at: now };
      failed = true;
      continue;
    }
    const docsDir = join(tmp, "docs");
    if (!docsNonEmpty(docsDir)) {
      rmSync(dest, { recursive: true, force: true });
      state[repo] = { commit: head.sha, ok: false, error: "unpublished", synced_at: now };
      failed = true;
      continue;
    }
    const v = validateDocsTree(docsDir, { markdownlintConfig: opts.markdownlintConfig });
    if (!v.ok) {
      state[repo] = {
        ...(state[repo] ?? { ok: false }),
        ok: false,
        error: v.errors.join("; "),
        synced_at: now,
      };
      failed = true;
      continue;
    }
    rsyncDocs(docsDir, dest);
    state[repo] = { commit: head.sha, ok: true, synced_at: now };
  }

  const manifestNames = new Set(manifest.sources.map((s) => destName(s.repo)));
  const libs = join(workspace, "content/docs/libs");
  if (existsSync(libs)) {
    for (const ent of readdirSync(libs)) {
      if (ent === "index.mdx" || ent === "meta.json" || ent === ".refs.json") continue;
      const p = join(libs, ent);
      if (statSync(p).isDirectory() && !manifestNames.has(ent)) rmSync(p, { recursive: true, force: true });
    }
  }
  const dests = existsSync(libs)
    ? readdirSync(libs).filter((n) => statSync(join(libs, n)).isDirectory())
    : [];
  rewriteLibsMeta(workspace, dests);
  const refs: Record<string, string> = {};
  for (const s of manifest.sources) {
    const n = destName(s.repo);
    if (existsSync(join(libs, n))) refs[n] = s.ref ?? "main";
  }
  writeRefs(workspace, refs);
  mkdirSync(join(workspace, "fan-in"), { recursive: true });
  writeFileSync(join(workspace, "fan-in/state.json"), `${JSON.stringify(state, null, 2)}\n`);
  return { failed, state };
}

if (import.meta.main) {
  const workspace = resolve(import.meta.dir, "..");
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.error("GITHUB_TOKEN required");
    process.exit(2);
  }
  const out = await runFanIn({
    workspace,
    github: githubFromToken(token),
    clone: gitSparseClone(),
    env: process.env,
    tmpRoot: join(process.env.RUNNER_TEMP || "/tmp", "fan-in"),
    markdownlintConfig: join(workspace, "content/docs/.markdownlint.jsonc"),
  });
  const ghOut = process.env.GITHUB_OUTPUT;
  if (ghOut) writeFileSync(ghOut, `failed=${out.failed ? "true" : "false"}\n`, { flag: "a" });
  process.exit(0);
}
