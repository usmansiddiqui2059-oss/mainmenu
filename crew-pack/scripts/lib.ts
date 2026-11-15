import { createCanvas } from "@napi-rs/canvas";
import type { Pixels } from "../src/pixels";
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
