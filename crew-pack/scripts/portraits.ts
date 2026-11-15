import { createCanvas, loadImage } from "@napi-rs/canvas";
import { readFile, writeFile } from "node:fs/promises";
import { crew } from "../src/data";
import { Pixels } from "../src/pixels";
import { canvasFor, svgFor } from "./lib";
const image = await loadImage("art-src/crew-concept.png"),
  source = createCanvas(image.width, image.height),
  ctx = source.getContext("2d");
ctx.drawImage(image, 0, 0);
const raw = ctx.getImageData(0, 0, image.width, image.height).data,
  palette = (await readFile("art-src/palette.hex", "utf8"))
    .trim()
    .split(/\s+/)
    .map(
      (h) =>
        [
          parseInt(h.slice(0, 2), 16),
          parseInt(h.slice(2, 4), 16),
          parseInt(h.slice(4, 6), 16),
        ] as const,
    );
const eyes = [89, 103, 62, 89, 538, 485, 521, 493],
  mouths = [
    [276, 118],
    [688, 123],
    [1105, 84],
    [1540, 116],
    [276, 559],
    [687, 513],
    [1110, 546],
    [1538, 520],
  ];
const review = createCanvas(1024, 416),
  rc = review.getContext("2d");
rc.fillStyle = "#030508";
rc.fillRect(0, 0, 1024, 416);
rc.imageSmoothingEnabled = false;
for (let k = 0; k < crew.length; k++) {
  const person = crew[k],
    [sx, sy, sw] = person.headSource,
    scale = 44 / sw,
    x0 = 10,
    y0 = 24 - (eyes[k] - sy) * scale;
  for (const [expression, index] of [
    ["neutral", 0],
    ["worried", 1],
    ["happy", 2],
  ] as const) {
    const p = new Pixels(64, 64);
    for (let y = 0; y < 64; y++)
      for (let x = 0; x < 64; x++) {
        const rx = Math.round(sx + (x - x0) / scale),
          ry = Math.round(sy + (y - y0) / scale);
        if (rx < 0 || rx >= image.width || ry < sy || ry >= image.height)
          continue;
        const i = (ry * image.width + rx) * 4,
          r = raw[i],
          g = raw[i + 1],
          b = raw[i + 2];
        if (r * 0.3 + g * 0.5 + b * 0.2 < 24 && !(r > b * 1.08 && r > 35))
          continue;
        let distance = Infinity,
          color = palette[0];
        for (const c of palette) {
          const d =
            (r - c[0]) ** 2 * 0.3 +
            (g - c[1]) ** 2 * 0.45 +
            (b - c[2]) ** 2 * 0.25;
          if (d < distance) {
            distance = d;
            color = c;
          }
        }
        p.pixel(x, y, color);
      }
    if (expression !== "neutral") {
      const mx = Math.round(x0 + (mouths[k][0] - sx) * scale),
        my = Math.round(y0 + (mouths[k][1] - sy) * scale);
      p.line(
        [mx - 2, my],
        [mx + 1, my + (expression === "happy" ? -1 : 1)],
        [89, 60, 53],
      );
    }
    const c = canvasFor(p);
    await writeFile(
      `assets/portraits/crew-${person.id}${expression === "neutral" ? "" : "-" + expression}.png`,
      c.toBuffer("image/png"),
    );
    await writeFile(
      `assets/portraits/crew-${person.id}${expression === "neutral" ? "" : "-" + expression}.svg`,
      svgFor(p),
    );
    rc.drawImage(c, k * 128, index * 136, 128, 128);
  }
}
await writeFile("review/portraits.png", review.toBuffer("image/png"));
console.log("Built 24 portraits in PNG and editable pixel SVG.");
