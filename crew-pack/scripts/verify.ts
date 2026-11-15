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
    [a.gameplay, 128, 264],
  ] as const) {
    if (path.includes("..") || path.startsWith("/"))
      throw new Error("Unsafe path " + path);
    const img = await loadImage(`assets/${path}`);
    if (img.width !== width || img.height !== height)
      throw new Error("Atlas size " + path);
  }
  for (const r of a.rows) {
    frames += r.frames.length;
    if (
      r.frames.some(
        (f) =>
          f.x < 0 || f.y < 0 || f.x + f.width > 512 || f.y + f.height > 1056,
      )
    )
      throw new Error("Frame outside atlas");
  }
}
async function files(dir: string): Promise<string[]> {
  const result: string[] = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (
      ["node_modules", "work", ".git"].includes(e.name) ||
      e.name === "FILES.sha256.json"
    )
      continue;
    const p = dir === "." ? e.name : `${dir}/${e.name}`;
    if (e.isDirectory()) result.push(...(await files(p)));
    else result.push(p);
  }
  return result;
}
const hashes: Record<string, string> = {};
for (const path of (await files(".")).sort())
  hashes[path] = createHash("sha256")
    .update(await readFile(path))
    .digest("hex");
await writeFile("FILES.sha256.json", JSON.stringify(hashes, null, 2) + "\n");
console.log(
  `${m.crew.length} crew / ${m.atlases.length} atlases per resolution / ${frames} frames per resolution / ${Object.keys(hashes).length} checksummed files.`,
);
