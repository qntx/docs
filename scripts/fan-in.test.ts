import { afterEach, describe, expect, test } from "bun:test";
import { mkdirSync, rmSync, writeFileSync, existsSync, readFileSync, cpSync, symlinkSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { runFanIn, type GitHub, type CloneFn, type ValidateFn } from "./fan-in";

const VID = "vid-1";
const lintConfig = "unused.jsonc";
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

function seedWorkspace(sources: { repo: string; ref?: string }[] = [{ repo: "qntx/demo" }]): string {
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
  writeFileSync(join(ws, "fan-in/manifest.json"), `${JSON.stringify({ version: 1, sources }, null, 2)}\n`);
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

function publicRepo(): GitHub {
  return {
    getRepo: async () => ({ status: 200, private: false }),
    getDocsHead: async () => ({ status: 200, sha: "abc" }),
  };
}

function cloneFrom(src: string): CloneFn {
  return async (_repo, _ref, dest) => {
    mkdirSync(dest, { recursive: true });
    cpSync(join(src, "docs"), join(dest, "docs"), { recursive: true });
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
    markdownlintConfig: lintConfig,
  });
}

function writeState(ws: string, row: Record<string, unknown>) {
  writeFileSync(join(ws, "fan-in/state.json"), `${JSON.stringify({ "qntx/demo": row }, null, 2)}\n`);
}

function seedDest(ws: string) {
  mkdirSync(join(ws, "content/docs/libs/demo"), { recursive: true });
  writeFileSync(join(ws, "content/docs/libs/demo/keep.mdx"), "keep");
}

describe("runFanIn", () => {
  test("HTTP 404 unpublishes dest", async () => {
    const ws = seedWorkspace();
    seedDest(ws);
    const r = await fanIn(ws, {
      github: {
        getRepo: async () => ({ status: 404 }),
        getDocsHead: async () => ({ status: 200, sha: "abc" }),
      },
    });
    expect(r.failed).toBe(true);
    expect(existsSync(join(ws, "content/docs/libs/demo"))).toBe(false);
    expect(r.state["qntx/demo"]?.sourceSha).toBeUndefined();
    expect(r.state["qntx/demo"]?.validator).toBeUndefined();
    expect(r.state["qntx/demo"]?.commit).toBeUndefined();
  });

  test("503 keeps dest and deletes sourceSha and validator", async () => {
    const ws = seedWorkspace();
    seedDest(ws);
    writeState(ws, { commit: "abc", sourceSha: "abc", validator: VID, ok: true });
    const r = await fanIn(ws, {
      github: {
        getRepo: async () => ({ status: 503 }),
        getDocsHead: async () => ({ status: 200, sha: "abc" }),
      },
    });
    expect(r.failed).toBe(true);
    expect(existsSync(join(ws, "content/docs/libs/demo/keep.mdx"))).toBe(true);
    expect(r.state["qntx/demo"]?.sourceSha).toBeUndefined();
    expect(r.state["qntx/demo"]?.validator).toBeUndefined();
    expect(r.state["qntx/demo"]?.commit).toBe("abc");

    let cloned = false;
    const r2 = await fanIn(ws, {
      github: {
        getRepo: async () => ({ status: 200, private: false }),
        getDocsHead: async () => ({ status: 200, sha: "abc" }),
      },
      clone: async (_repo, _ref, dest) => {
        cloned = true;
        mkdirSync(join(dest, "docs"), { recursive: true });
        writeFileSync(join(dest, "docs/index.mdx"), validIndex);
      },
    });
    expect(cloned).toBe(true);
    expect(r2.failed).toBe(false);
  });

  test("dest-missing then clone fail then retry", async () => {
    const ws = seedWorkspace();
    writeState(ws, { commit: "abc", sourceSha: "abc", validator: VID, ok: true });
    const r = await fanIn(ws, {
      github: {
        getRepo: async () => ({ status: 200, private: false }),
        getDocsHead: async () => ({ status: 200, sha: "abc" }),
      },
      clone: async () => {
        throw new Error("clone down");
      },
    });
    expect(r.failed).toBe(true);
    expect(r.state["qntx/demo"]?.sourceSha).toBeUndefined();
    expect(r.state["qntx/demo"]?.validator).toBeUndefined();
    expect(r.state["qntx/demo"]?.commit).toBe("abc");
    expect(existsSync(join(ws, "content/docs/libs/demo"))).toBe(false);

    let cloned = false;
    await fanIn(ws, {
      github: {
        getRepo: async () => ({ status: 200, private: false }),
        getDocsHead: async () => ({ status: 200, sha: "abc" }),
      },
      clone: async (_repo, _ref, dest) => {
        cloned = true;
        mkdirSync(join(dest, "docs"), { recursive: true });
        writeFileSync(join(dest, "docs/index.mdx"), validIndex);
      },
    });
    expect(cloned).toBe(true);
  });

  test("empty docs writes sourceSha not commit", async () => {
    const ws = seedWorkspace();
    writeState(ws, { commit: "old", sourceSha: "old", validator: VID, ok: true });
    seedDest(ws);
    let clones = 0;
    const github: GitHub = {
      getRepo: async () => ({ status: 200, private: false }),
      getDocsHead: async () => ({ status: 200, sha: "delete-sha" }),
    };
    const clone: CloneFn = async (_repo, _ref, dest) => {
      clones += 1;
      mkdirSync(dest, { recursive: true });
      mkdirSync(join(dest, "docs"), { recursive: true });
    };
    const r = await fanIn(ws, { github, clone });
    expect(r.failed).toBe(true);
    expect(r.state["qntx/demo"]?.sourceSha).toBe("delete-sha");
    expect(r.state["qntx/demo"]?.validator).toBe(VID);
    expect(r.state["qntx/demo"]?.commit).toBe("old");
    expect(r.state["qntx/demo"]?.error).toBe("unpublished");
    expect(existsSync(join(ws, "content/docs/libs/demo"))).toBe(false);
    expect(clones).toBe(1);

    const r2 = await fanIn(ws, { github, clone });
    expect(clones).toBe(1);
    expect(r2.state["qntx/demo"]?.sourceSha).toBe("delete-sha");
    expect(r2.state["qntx/demo"]?.commit).toBe("old");
  });

  test("validate fail records poison sourceSha and does not rsync", async () => {
    const ws = seedWorkspace();
    seedDest(ws);
    writeState(ws, { commit: "old", sourceSha: "old", validator: VID, ok: true });
    let clones = 0;
    const github: GitHub = {
      getRepo: async () => ({ status: 200, private: false }),
      getDocsHead: async () => ({ status: 200, sha: "new-sha" }),
    };
    const clone: CloneFn = async (_repo, _ref, dest) => {
      clones += 1;
      mkdirSync(join(dest, "docs"), { recursive: true });
      writeFileSync(join(dest, "docs/index.mdx"), "new\n");
    };
    const r = await fanIn(ws, { github, clone, validate: poison });
    expect(r.failed).toBe(true);
    expect(r.state["qntx/demo"]?.commit).toBe("old");
    expect(r.state["qntx/demo"]?.sourceSha).toBe("new-sha");
    expect(r.state["qntx/demo"]?.validator).toBe(VID);
    expect(r.state["qntx/demo"]?.ok).toBe(false);
    expect(readFileSync(join(ws, "content/docs/libs/demo/keep.mdx"), "utf8")).toBe("keep");
    expect(existsSync(join(ws, "content/docs/libs/demo/index.mdx"))).toBe(false);
    expect(clones).toBe(1);

    await fanIn(ws, { github, clone, validate: poison });
    expect(clones).toBe(1);

    const rForce = await fanIn(ws, {
      github,
      clone,
      validate: pass,
      env: { FAN_IN_FORCE: "true" },
    });
    expect(clones).toBe(2);
    expect(rForce.failed).toBe(false);
    expect(existsSync(join(ws, "content/docs/libs/demo/index.mdx"))).toBe(true);
  });

  test("skip when sourceSha validator match and dest exists", async () => {
    const ws = seedWorkspace();
    seedDest(ws);
    writeState(ws, { commit: "same", sourceSha: "same", validator: VID, ok: true });
    let cloned = false;
    const r = await fanIn(ws, {
      github: {
        getRepo: async () => ({ status: 200, private: false }),
        getDocsHead: async () => ({ status: 200, sha: "same" }),
      },
      clone: async () => {
        cloned = true;
      },
    });
    expect(cloned).toBe(false);
    expect(r.failed).toBe(false);
  });

  test("no skip when dest missing after success", async () => {
    const ws = seedWorkspace();
    writeState(ws, { commit: "same", sourceSha: "same", validator: VID, ok: true });
    let cloned = false;
    const r = await fanIn(ws, {
      github: {
        getRepo: async () => ({ status: 200, private: false }),
        getDocsHead: async () => ({ status: 200, sha: "same" }),
      },
      clone: async (_repo, _ref, dest) => {
        cloned = true;
        mkdirSync(join(dest, "docs"), { recursive: true });
        writeFileSync(join(dest, "docs/index.mdx"), validIndex);
      },
    });
    expect(cloned).toBe(true);
    expect(r.failed).toBe(false);
    expect(existsSync(join(ws, "content/docs/libs/demo/index.mdx"))).toBe(true);
  });

  test("no skip when validatorId changed", async () => {
    const ws = seedWorkspace();
    seedDest(ws);
    writeState(ws, { commit: "same", sourceSha: "same", validator: VID, ok: true });
    let cloned = false;
    await fanIn(ws, {
      github: {
        getRepo: async () => ({ status: 200, private: false }),
        getDocsHead: async () => ({ status: 200, sha: "same" }),
      },
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
    seedDest(ws);
    writeState(ws, { commit: "same", sourceSha: "same", validator: VID, ok: true });
    const src = validDocs();
    const r = await fanIn(ws, {
      github: {
        getRepo: async () => ({ status: 200, private: false }),
        getDocsHead: async () => ({ status: 200, sha: "same" }),
      },
      clone: cloneFrom(src),
      env: { FAN_IN_FORCE: "true" },
    });
    expect(r.failed).toBe(false);
    expect(existsSync(join(ws, "content/docs/libs/demo/index.mdx"))).toBe(true);
  });

  test("FAN_IN_FORCE false string does not force", async () => {
    const ws = seedWorkspace();
    seedDest(ws);
    writeState(ws, { commit: "same", sourceSha: "same", validator: VID, ok: true });
    let cloned = false;
    await fanIn(ws, {
      github: {
        getRepo: async () => ({ status: 200, private: false }),
        getDocsHead: async () => ({ status: 200, sha: "same" }),
      },
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
      github: {
        getRepo: async () => ({ status: 200, private: false }),
        getDocsHead: async () => ({ status: 200, sha: "good" }),
      },
      clone: cloneFrom(src),
    });
    expect(r.failed).toBe(false);
    expect(r.state["qntx/demo"]?.commit).toBe("good");
    expect(r.state["qntx/demo"]?.sourceSha).toBe("good");
    expect(r.state["qntx/demo"]?.validator).toBe(VID);
    expect(readFileSync(join(ws, "content/docs/libs/demo/index.mdx"), "utf8")).toContain("Hello");
    const meta = JSON.parse(readFileSync(join(ws, "content/docs/libs/meta.json"), "utf8"));
    expect(meta.pages).toEqual(["index", "demo"]);
    const refs = JSON.parse(readFileSync(join(ws, "content/docs/libs/.refs.json"), "utf8"));
    expect(refs.demo).toBe("main");
  });

  test("dest missing first rsync succeeds", async () => {
    const ws = seedWorkspace();
    const src = validDocs();
    expect(existsSync(join(ws, "content/docs/libs/demo"))).toBe(false);
    const r = await fanIn(ws, { clone: cloneFrom(src) });
    expect(r.failed).toBe(false);
    expect(existsSync(join(ws, "content/docs/libs/demo/index.mdx"))).toBe(true);
  });

  test("docs missing unsets sourceSha and does not clone", async () => {
    const ws = seedWorkspace();
    seedDest(ws);
    writeState(ws, { commit: "old", sourceSha: "old", validator: VID, ok: true });
    let cloned = false;
    const r = await fanIn(ws, {
      github: {
        getRepo: async () => ({ status: 200, private: false }),
        getDocsHead: async () => ({ status: 200, sha: null }),
      },
      clone: async () => {
        cloned = true;
      },
    });
    expect(cloned).toBe(false);
    expect(r.failed).toBe(true);
    expect(existsSync(join(ws, "content/docs/libs/demo"))).toBe(false);
    expect(r.state["qntx/demo"]?.sourceSha).toBeUndefined();
    expect(r.state["qntx/demo"]?.validator).toBeUndefined();
    expect(r.state["qntx/demo"]?.commit).toBe("old");
    expect(r.state["qntx/demo"]?.error).toBe("docs missing");
  });

  test("dest jail rejects libs symlink escaping workspace", async () => {
    const ws = seedWorkspace();
    rmSync(join(ws, "content/docs/libs"), { recursive: true, force: true });
    const outside = tmp();
    symlinkSync(outside, join(ws, "content/docs/libs"));
    await expect(fanIn(ws)).rejects.toThrow("content/docs/libs escapes workspace");
  });

  test("rejects qntx/.. dest name", async () => {
    const ws = seedWorkspace([{ repo: "qntx/.." }]);
    const r = await fanIn(ws);
    expect(r.failed).toBe(true);
    expect(r.state["qntx/.."]?.ok).toBe(false);
    expect(r.state["qntx/.."]?.error).toContain("rejected dest");
  });

  test("rejects qntx/docs as a source", async () => {
    const ws = seedWorkspace([{ repo: "qntx/docs" }]);
    const r = await fanIn(ws);
    expect(r.failed).toBe(true);
    expect(r.state["qntx/docs"]?.ok).toBe(false);
    expect(r.state["qntx/docs"]?.error).toContain("rejected dest qntx/docs");
  });

  test("empty sources deletes leftover dest and rewrites pages", async () => {
    const ws = seedWorkspace([]);
    seedDest(ws);
    const r = await fanIn(ws);
    expect(r.failed).toBe(false);
    expect(existsSync(join(ws, "content/docs/libs/demo"))).toBe(false);
    const meta = JSON.parse(readFileSync(join(ws, "content/docs/libs/meta.json"), "utf8"));
    expect(meta.pages).toEqual(["index"]);
  });
});
