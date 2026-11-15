import { readFile, writeFile } from "node:fs/promises";
import { crew } from "../src/data";
import { manifestSchema } from "../src/manifest";
const manifest = manifestSchema.parse(
    JSON.parse(await readFile("assets/manifest.json", "utf8")),
  ),
  images: Record<string, string> = {};
for (const a of manifest.atlases)
  for (const path of [a.master, a.gameplay])
    images[path] =
      "data:image/png;base64," +
      (await readFile(`assets/${path}`)).toString("base64");
for (const c of crew)
  for (const e of ["neutral", "worried", "happy"]) {
    const path = `portraits/crew-${c.id}${e === "neutral" ? "" : "-" + e}.png`;
    images[path] =
      "data:image/png;base64," +
      (await readFile(`assets/${path}`)).toString("base64");
  }
const html = (await readFile("preview/shell.html", "utf8"))
  .replace(
    "__FONT__",
    (await readFile("preview/barlow-condensed-latin-500.woff2")).toString(
      "base64",
    ),
  )
  .replace(
    "__DATA__",
    JSON.stringify({ manifest, images }).replace(/</g, "\\u003c"),
  )
  .replace("__SCRIPT__", await readFile("preview/viewer.js", "utf8"));
await writeFile("preview/index.html", html);
console.log("Offline preview embedded.");
