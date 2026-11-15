import { createCanvas, loadImage } from "@napi-rs/canvas";
import { readFile } from "node:fs/promises";
import { crew } from "../src/data";
import type { Art } from "../src/render";
import type { Pixels } from "../src/pixels";
export async function loadArt() {
  const anchors = JSON.parse(
    await readFile("art-src/base-anchors.json", "utf8"),
  );
  const result: Record<string, Art> = {};
  for (const p of crew) {
    const image = await loadImage(`art-src/bases/${p.id}.png`),
      c = createCanvas(64, 96),
      x = c.getContext("2d");
    x.drawImage(image, 0, 0);
    result[p.id] = {
      texture: {
        width: 64,
        height: 96,
        data: x.getImageData(0, 0, 64, 96).data,
      },
      head: anchors[p.id].head,
    };
  }
  return result;
}
export function canvasFor(p: Pixels) {
  const c = createCanvas(p.width, p.height);
  p.flush(c.getContext("2d") as unknown as CanvasRenderingContext2D);
  return c;
}
export function svgFor(p: Pixels) {
  let body = "";
  for (let y = 0; y < p.height; y++) {
    let x = 0;
    while (x < p.width) {
      const i = (y * p.width + x) * 4;
      if (!p.data[i + 3]) {
        x++;
        continue;
      }
      const color = Array.from(p.data.slice(i, i + 3))
        .map((n) => n.toString(16).padStart(2, "0"))
        .join("");
      let end = x + 1;
      while (end < p.width) {
        const j = (y * p.width + end) * 4;
        if (
          !p.data[j + 3] ||
          p.data[j] !== p.data[i] ||
          p.data[j + 1] !== p.data[i + 1] ||
          p.data[j + 2] !== p.data[i + 2]
        )
          break;
        end++;
      }
      body += `<path fill="#${color}" d="M${x} ${y}h${end - x}v1H${x}z"/>`;
      x = end;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${p.width}" height="${p.height}" viewBox="0 0 ${p.width} ${p.height}" shape-rendering="crispEdges">${body}</svg>\n`;
}
