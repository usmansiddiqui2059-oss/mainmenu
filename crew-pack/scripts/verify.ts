import { readdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { loadImage } from "@napi-rs/canvas";
import { manifestSchema } from "../src/manifest";
const m = manifestSchema.parse(
  JSON.parse(await readFile("assets/manifest.json", "utf8")),
);
let frames = 0;
for (const a of m.atlases) {
  for (const [path, width, height] of [
    [a.master, 512, 1056],
    [a.detail, 1024, 2112],
    [a.gameplay, 128, 264],
  ] as const) {
    if (path.includes("..") || path.startsWith("/"))
      throw new Error("Unsafe path");
    const i = await loadImage("assets/" + path);
    if (i.width !== width || i.height !== height)
      throw new Error("Wrong atlas size " + path);
  }
  for (const r of a.rows) frames += r.frames.length;
}
async function files(dir: string): Promise<string[]> {
  const list: string[] = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (
      ["node_modules", ".git", "work", "FILES.sha256.json"].includes(e.name) ||
      e.name.endsWith(".tsbuildinfo")
    )
      continue;
    const p = dir === "." ? e.name : dir + "/" + e.name;
    if (e.isDirectory()) list.push(...(await files(p)));
    else list.push(p);
  }
  return list;
}
const hashes: Record<string, string> = {};
for (const p of (await files(".")).sort())
  hashes[p] = createHash("sha256")
    .update(await readFile(p))
    .digest("hex");
await writeFile("FILES.sha256.json", JSON.stringify(hashes, null, 2) + "\n");
console.log(
  `${frames} frames per resolution; ${Object.keys(hashes).length} checksummed files.`,
);
