import { afterEach, describe, expect, test } from "bun:test";
import { mkdirSync, rmSync, writeFileSync, existsSync, readFileSync, cpSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { runFanIn, type GitHub } from "./fan-in";

const lintConfig = resolve(import.meta.dir, "..", "content", "docs", ".markdownlint.jsonc");
const temps: string[] = [];

function tmp(): string {
  const d = join(tmpdir(), `fan-in-${crypto.randomUUID()}`);
  mkdirSync(d, { recursive: true });
  temps.push(d);
  return d;
}

afterEach(() => {
  for (const d of temps.splice(0)) rmSync(d, { recursive: true, force: true });
});

const validIndex = `---
title: Demo
description: A valid tree.
---

Hello.
`;

function seedWorkspace(): string {
  const ws = tmp();
  mkdirSync(join(ws, "fan-in"), { recursive: true });
  mkdirSync(join(ws, "content/docs/libs"), { recursive: true });
  writeFileSync(
    join(ws, "content/docs/libs/meta.json"),
    `${JSON.stringify({ title: "Libraries", description: "x", root: true, pages: ["index"] }, null, 2)}\n`,
  );
  writeFileSync(
    join(ws, "content/docs/libs/index.mdx"),
    `---
title: Libraries
description: Editorial.
---

Editorial.
`,
  );
  writeFileSync(join(ws, "fan-in/manifest.json"), `${JSON.stringify({ version: 1, sources: [{ repo: "qntx/demo" }] }, null, 2)}\n`);
  writeFileSync(join(ws, "fan-in/state.json"), "{}\n");
  return ws;
}

function validDocs(): string {
  const d = tmp();
  mkdirSync(join(d, "docs"), { recursive: true });
  writeFileSync(join(d, "docs/meta.json"), `${JSON.stringify({ title: "demo", pages: ["index"] }, null, 2)}\n`);
  writeFileSync(join(d, "docs/index.mdx"), validIndex);
  return d;
}

describe("runFanIn", () => {
  test("HTTP 404 unpublishes dest", async () => {
    const ws = seedWorkspace();
    mkdirSync(join(ws, "content/docs/libs/demo"), { recursive: true });
    writeFileSync(join(ws, "content/docs/libs/demo/stale.mdx"), "old");
    const github: GitHub = {
      getRepo: async () => ({ status: 404 }),
      getDocsHead: async () => ({ status: 200, sha: "abc" }),
    };
    const r = await runFanIn({
      workspace: ws,
      github,
      clone: async () => {
        throw new Error("should not clone");
      },
      env: {},
      tmpRoot: tmp(),
      markdownlintConfig: lintConfig,
    });
    expect(r.failed).toBe(true);
    expect(existsSync(join(ws, "content/docs/libs/demo"))).toBe(false);
  });

  test("503 keeps dest", async () => {
    const ws = seedWorkspace();
    mkdirSync(join(ws, "content/docs/libs/demo"), { recursive: true });
    writeFileSync(join(ws, "content/docs/libs/demo/keep.mdx"), "keep");
    const github: GitHub = {
      getRepo: async () => ({ status: 503 }),
      getDocsHead: async () => ({ status: 200, sha: "abc" }),
    };
    const r = await runFanIn({
      workspace: ws,
      github,
      clone: async () => {
        throw new Error("should not clone");
      },
      env: {},
      tmpRoot: tmp(),
      markdownlintConfig: lintConfig,
    });
    expect(r.failed).toBe(true);
    expect(existsSync(join(ws, "content/docs/libs/demo/keep.mdx"))).toBe(true);
  });

  test("empty docs unpublish writes commits-API SHA", async () => {
    const ws = seedWorkspace();
    const github: GitHub = {
      getRepo: async () => ({ status: 200, private: false }),
      getDocsHead: async () => ({ status: 200, sha: "delete-sha" }),
    };
    const empty = tmp();
    mkdirSync(join(empty, "docs"), { recursive: true });
    const r = await runFanIn({
      workspace: ws,
      github,
      clone: async (_repo, _ref, dest) => {
        mkdirSync(dest, { recursive: true });
        mkdirSync(join(dest, "docs"), { recursive: true });
      },
      env: {},
      tmpRoot: tmp(),
      markdownlintConfig: lintConfig,
    });
    expect(r.failed).toBe(true);
    expect(r.state["qntx/demo"]?.commit).toBe("delete-sha");
    expect(r.state["qntx/demo"]?.error).toBe("unpublished");
  });

  test("validate fail does not advance commit", async () => {
    const ws = seedWorkspace();
    writeFileSync(
      join(ws, "fan-in/state.json"),
      `${JSON.stringify({ "qntx/demo": { commit: "old", ok: true } }, null, 2)}\n`,
    );
    const github: GitHub = {
      getRepo: async () => ({ status: 200, private: false }),
      getDocsHead: async () => ({ status: 200, sha: "new-sha" }),
    };
    const r = await runFanIn({
      workspace: ws,
      github,
      clone: async (_repo, _ref, dest) => {
        mkdirSync(join(dest, "docs"), { recursive: true });
        writeFileSync(join(dest, "docs/meta.json"), JSON.stringify({ title: "demo", pages: ["index"] }));
        writeFileSync(join(dest, "docs/index.mdx"), "no frontmatter\n");
      },
      env: {},
      tmpRoot: tmp(),
      markdownlintConfig: lintConfig,
    });
    expect(r.failed).toBe(true);
    expect(r.state["qntx/demo"]?.commit).toBe("old");
  });

  test("SHA skip when state.commit matches", async () => {
    const ws = seedWorkspace();
    writeFileSync(
      join(ws, "fan-in/state.json"),
      `${JSON.stringify({ "qntx/demo": { commit: "same", ok: true } }, null, 2)}\n`,
    );
    let cloned = false;
    const github: GitHub = {
      getRepo: async () => ({ status: 200, private: false }),
      getDocsHead: async () => ({ status: 200, sha: "same" }),
    };
    const r = await runFanIn({
      workspace: ws,
      github,
      clone: async () => {
        cloned = true;
      },
      env: {},
      tmpRoot: tmp(),
      markdownlintConfig: lintConfig,
    });
    expect(cloned).toBe(false);
    expect(r.failed).toBe(false);
  });

  test("FAN_IN_FORCE true bypasses skip", async () => {
    const ws = seedWorkspace();
    writeFileSync(
      join(ws, "fan-in/state.json"),
      `${JSON.stringify({ "qntx/demo": { commit: "same", ok: true } }, null, 2)}\n`,
    );
    const src = validDocs();
    const github: GitHub = {
      getRepo: async () => ({ status: 200, private: false }),
      getDocsHead: async () => ({ status: 200, sha: "same" }),
    };
    const r = await runFanIn({
      workspace: ws,
      github,
      clone: async (_repo, _ref, dest) => {
        mkdirSync(dest, { recursive: true });
        cpSync(join(src, "docs"), join(dest, "docs"), { recursive: true });
      },
      env: { FAN_IN_FORCE: "true" },
      tmpRoot: tmp(),
      markdownlintConfig: lintConfig,
    });
    expect(r.failed).toBe(false);
    expect(existsSync(join(ws, "content/docs/libs/demo/index.mdx"))).toBe(true);
  });

  test("FAN_IN_FORCE false string does not force", async () => {
    const ws = seedWorkspace();
    writeFileSync(
      join(ws, "fan-in/state.json"),
      `${JSON.stringify({ "qntx/demo": { commit: "same", ok: true } }, null, 2)}\n`,
    );
    let cloned = false;
    const github: GitHub = {
      getRepo: async () => ({ status: 200, private: false }),
      getDocsHead: async () => ({ status: 200, sha: "same" }),
    };
    await runFanIn({
      workspace: ws,
      github,
      clone: async () => {
        cloned = true;
      },
      env: { FAN_IN_FORCE: "false" },
      tmpRoot: tmp(),
      markdownlintConfig: lintConfig,
    });
    expect(cloned).toBe(false);
  });

  test("successful rsync and meta pages", async () => {
    const ws = seedWorkspace();
    const src = validDocs();
    const github: GitHub = {
      getRepo: async () => ({ status: 200, private: false }),
      getDocsHead: async () => ({ status: 200, sha: "good" }),
    };
    const r = await runFanIn({
      workspace: ws,
      github,
      clone: async (_repo, _ref, dest) => {
        mkdirSync(dest, { recursive: true });
        cpSync(join(src, "docs"), join(dest, "docs"), { recursive: true });
      },
      env: {},
      tmpRoot: tmp(),
      markdownlintConfig: lintConfig,
    });
    expect(r.failed).toBe(false);
    expect(readFileSync(join(ws, "content/docs/libs/demo/index.mdx"), "utf8")).toContain("Hello");
    const meta = JSON.parse(readFileSync(join(ws, "content/docs/libs/meta.json"), "utf8"));
    expect(meta.pages).toEqual(["index", "demo"]);
    const refs = JSON.parse(readFileSync(join(ws, "content/docs/libs/.refs.json"), "utf8"));
    expect(refs.demo).toBe("main");
  });
});
