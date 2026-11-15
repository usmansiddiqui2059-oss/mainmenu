import { readFile, writeFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { loadImage } from "@napi-rs/canvas";
import { manifestSchema } from "../src/manifest";
const m = manifestSchema.parse(
  JSON.parse(await readFile("assets/manifest.json", "utf8")),
);
let frames = 0;
for (const s of m.sheets) {
  for (const [path, factor] of [
    [s.path, 1],
    [s.compactPath, 0.5],
    [s.gameplayPath, 0.125],
  ] as const) {
    if (path.includes("..") || path.startsWith("/"))
      throw new Error("Invalid asset path");
    const i = await loadImage(`assets/${path}`);
    if (i.width !== s.frameCount * 128 * factor || i.height !== 1536 * factor)
      throw new Error("Atlas dimensions " + path);
  }
  for (const r of s.rows) {
    if (r.frames.length !== s.frameCount) throw new Error("Frame count");
    frames += r.frames.length;
    for (const f of r.frames)
      if (
        f.rect.x + f.rect.width > s.frameCount * 128 ||
        f.rect.y + f.rect.height > 1536
      )
        throw new Error("Frame bounds");
  }
}
async function files(dir: string): Promise<string[]> {
  const list: string[] = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (
      ["node_modules", ".git", "work", "FILES.sha256.json"].includes(e.name) ||
      e.name.endsWith(".tsbuildinfo")
    )
      continue;
    const p = dir === "." ? e.name : `${dir}/${e.name}`;
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
  `${m.players.length} player choices, 8 directions, ${frames} frames at each of 3 resolutions, ${Object.keys(hashes).length} checksummed files.`,
);
