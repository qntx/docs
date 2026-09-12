import { afterEach, describe, expect, test } from "bun:test";
import { mkdirSync, rmSync, writeFileSync, existsSync, readFileSync, cpSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { runFanIn, spawnDocsTreeCli, type GitHub, type CloneFn, type ValidateFn } from "./fan-in";

const VID = "vid-1";
const temps: string[] = [];
const pass: ValidateFn = () => ({ ok: true, errors: [] });
const poison: ValidateFn = () => ({ ok: false, errors: ["poison"] });

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

function publicRepo(sha = "abc"): GitHub {
  return {
    getRepo: async () => ({ status: 200, private: false }),
    getDocsHead: async () => ({ status: 200, sha }),
  };
}

function refuseClone(): CloneFn {
  return async () => {
    throw new Error("should not clone");
  };
}

async function fanIn(
  ws: string,
  over: {
    github?: GitHub;
    clone?: CloneFn;
    validate?: ValidateFn;
    validatorId?: string;
    env?: NodeJS.ProcessEnv;
  } = {},
) {
  return runFanIn({
    workspace: ws,
    github: over.github ?? publicRepo(),
    clone: over.clone ?? refuseClone(),
    validate: over.validate ?? pass,
    validatorId: over.validatorId ?? VID,
    env: over.env ?? {},
    tmpRoot: tmp(),
  });
}

describe("runFanIn", () => {
  test("HTTP 404 unpublishes dest", async () => {
    const ws = seedWorkspace();
    mkdirSync(join(ws, "content/docs/libs/demo"), { recursive: true });
    writeFileSync(join(ws, "content/docs/libs/demo/stale.mdx"), "old");
    const r = await fanIn(ws, {
      github: {
        getRepo: async () => ({ status: 404 }),
        getDocsHead: async () => ({ status: 200, sha: "abc" }),
      },
    });
    expect(r.failed).toBe(true);
    expect(existsSync(join(ws, "content/docs/libs/demo"))).toBe(false);
  });

  test("503 keeps dest", async () => {
    const ws = seedWorkspace();
    mkdirSync(join(ws, "content/docs/libs/demo"), { recursive: true });
    writeFileSync(join(ws, "content/docs/libs/demo/keep.mdx"), "keep");
    const r = await fanIn(ws, {
      github: {
        getRepo: async () => ({ status: 503 }),
        getDocsHead: async () => ({ status: 200, sha: "abc" }),
      },
    });
    expect(r.failed).toBe(true);
    expect(existsSync(join(ws, "content/docs/libs/demo/keep.mdx"))).toBe(true);
  });

  test("empty docs unpublish writes commits-API SHA", async () => {
    const ws = seedWorkspace();
    const r = await fanIn(ws, {
      github: publicRepo("delete-sha"),
      clone: async (_repo, _ref, dest) => {
        mkdirSync(dest, { recursive: true });
        mkdirSync(join(dest, "docs"), { recursive: true });
      },
    });
    expect(r.failed).toBe(true);
    expect(r.state["qntx/demo"]?.commit).toBe("delete-sha");
    expect(r.state["qntx/demo"]?.validator).toBe(VID);
    expect(r.state["qntx/demo"]?.error).toBe("unpublished");
  });

  test("clone failure does not rsync", async () => {
    const ws = seedWorkspace();
    mkdirSync(join(ws, "content/docs/libs/demo"), { recursive: true });
    writeFileSync(join(ws, "content/docs/libs/demo/keep.mdx"), "keep");
    writeFileSync(
      join(ws, "fan-in/state.json"),
      `${JSON.stringify({ "qntx/demo": { commit: "old", validator: VID, ok: true } }, null, 2)}\n`,
    );
    const r = await fanIn(ws, {
      github: publicRepo("new-sha"),
      clone: async () => {
        throw new Error("clone down");
      },
    });
    expect(r.failed).toBe(true);
    expect(r.state["qntx/demo"]?.commit).toBe("old");
    expect(r.state["qntx/demo"]?.error).toContain("clone");
    expect(readFileSync(join(ws, "content/docs/libs/demo/keep.mdx"), "utf8")).toBe("keep");
  });

  test("validate fail does not advance commit", async () => {
    const ws = seedWorkspace();
    writeFileSync(
      join(ws, "fan-in/state.json"),
      `${JSON.stringify({ "qntx/demo": { commit: "old", validator: VID, ok: true } }, null, 2)}\n`,
    );
    const r = await fanIn(ws, {
      github: publicRepo("new-sha"),
      clone: async (_repo, _ref, dest) => {
        mkdirSync(join(dest, "docs"), { recursive: true });
        writeFileSync(join(dest, "docs/index.mdx"), "new\n");
      },
      validate: poison,
    });
    expect(r.failed).toBe(true);
    expect(r.state["qntx/demo"]?.commit).toBe("old");
    expect(r.state["qntx/demo"]?.error).toBe("poison");
  });

  test("SHA skip when state.commit and validator match", async () => {
    const ws = seedWorkspace();
    writeFileSync(
      join(ws, "fan-in/state.json"),
      `${JSON.stringify({ "qntx/demo": { commit: "same", validator: VID, ok: true } }, null, 2)}\n`,
    );
    let cloned = false;
    const r = await fanIn(ws, {
      github: publicRepo("same"),
      clone: async () => {
        cloned = true;
      },
    });
    expect(cloned).toBe(false);
    expect(r.failed).toBe(false);
  });

  test("no skip when validatorId changed", async () => {
    const ws = seedWorkspace();
    writeFileSync(
      join(ws, "fan-in/state.json"),
      `${JSON.stringify({ "qntx/demo": { commit: "same", validator: VID, ok: true } }, null, 2)}\n`,
    );
    let cloned = false;
    await fanIn(ws, {
      github: publicRepo("same"),
      clone: async (_repo, _ref, dest) => {
        cloned = true;
        mkdirSync(join(dest, "docs"), { recursive: true });
        writeFileSync(join(dest, "docs/index.mdx"), validIndex);
      },
      validatorId: "vid-2",
    });
    expect(cloned).toBe(true);
  });

  test("FAN_IN_FORCE true bypasses skip", async () => {
    const ws = seedWorkspace();
    writeFileSync(
      join(ws, "fan-in/state.json"),
      `${JSON.stringify({ "qntx/demo": { commit: "same", validator: VID, ok: true } }, null, 2)}\n`,
    );
    const src = validDocs();
    const r = await fanIn(ws, {
      github: publicRepo("same"),
      clone: async (_repo, _ref, dest) => {
        mkdirSync(dest, { recursive: true });
        cpSync(join(src, "docs"), join(dest, "docs"), { recursive: true });
      },
      env: { FAN_IN_FORCE: "true" },
    });
    expect(r.failed).toBe(false);
    expect(existsSync(join(ws, "content/docs/libs/demo/index.mdx"))).toBe(true);
  });

  test("FAN_IN_FORCE false string does not force", async () => {
    const ws = seedWorkspace();
    writeFileSync(
      join(ws, "fan-in/state.json"),
      `${JSON.stringify({ "qntx/demo": { commit: "same", validator: VID, ok: true } }, null, 2)}\n`,
    );
    let cloned = false;
    await fanIn(ws, {
      github: publicRepo("same"),
      clone: async () => {
        cloned = true;
      },
      env: { FAN_IN_FORCE: "false" },
    });
    expect(cloned).toBe(false);
  });

  test("successful rsync and meta pages", async () => {
    const ws = seedWorkspace();
    const src = validDocs();
    const r = await fanIn(ws, {
      github: publicRepo("good"),
      clone: async (_repo, _ref, dest) => {
        mkdirSync(dest, { recursive: true });
        cpSync(join(src, "docs"), join(dest, "docs"), { recursive: true });
      },
    });
    expect(r.failed).toBe(false);
    expect(r.state["qntx/demo"]?.commit).toBe("good");
    expect(r.state["qntx/demo"]?.validator).toBe(VID);
    expect(readFileSync(join(ws, "content/docs/libs/demo/index.mdx"), "utf8")).toContain("Hello");
    const meta = JSON.parse(readFileSync(join(ws, "content/docs/libs/meta.json"), "utf8"));
    expect(meta.pages).toEqual(["index", "demo"]);
    const refs = JSON.parse(readFileSync(join(ws, "content/docs/libs/.refs.json"), "utf8"));
    expect(refs.demo).toBe("main");
  });
});

describe("spawnDocsTreeCli", () => {
  test("treats non-zero CLI as failure", () => {
    const dir = tmp();
    const cli = join(dir, "cli.ts");
    writeFileSync(cli, 'console.error("cli-fail"); process.exit(1);\n');
    const r = spawnDocsTreeCli(resolve(cli))("/tmp/docs");
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.includes("cli-fail"))).toBe(true);
  });

  test("zero exit is ok", () => {
    const dir = tmp();
    const cli = join(dir, "cli.ts");
    writeFileSync(cli, "process.exit(0);\n");
    expect(spawnDocsTreeCli(resolve(cli))("/tmp/docs").ok).toBe(true);
  });

  test("rejects relative path", () => {
    expect(() => spawnDocsTreeCli("validate-docs-tree.ts")).toThrow("absolute");
  });

  test("rejects missing path", () => {
    expect(() => spawnDocsTreeCli("/no/such/validate-docs-tree.ts")).toThrow("missing");
  });
});
