import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
let html = await readFile("dist/index.html", "utf8");
const script = html.match(/<script[^>]+src="([^"]+)"[^>]*><\/script>/);
const style = html.match(/<link[^>]+href="([^"]+\.css)"[^>]*>/);
if (!script || !style)
  throw new Error("Expected one Vite entry script and stylesheet.");
const js = await readFile(resolve("dist", script[1]), "utf8");
const css = await readFile(resolve("dist", style[1]), "utf8");
if (/\bimport\s*\(/.test(js))
  throw new Error("Standalone preview must have no dynamic imports.");
html = html.replace(
  script[0],
  () =>
    `<script type="module">${js.replace(/<\/script/gi, "<\\/script")}</script>`,
);
html = html.replace(style[0], () => `<style>${css}</style>`);
await writeFile("dist/Mission-Control-Preview.html", html);
console.log(
  "Self-contained preview created. No server or external assets required.",
);
