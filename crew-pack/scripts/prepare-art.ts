import { createCanvas, loadImage } from "@napi-rs/canvas";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { crew, FRAME } from "../src/data";
const image = await loadImage("art-src/crew-concept.png");
const palette = (await readFile("art-src/palette.hex", "utf8"))
  .trim()
  .split(/\s+/)
  .map((h) => [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ]);
const master = createCanvas(image.width, image.height),
  mc = master.getContext("2d");
mc.drawImage(image, 0, 0);
const raw = mc.getImageData(0, 0, image.width, image.height).data;
function source(x: number, y: number) {
  const i =
    (Math.max(0, Math.min(image.height - 1, y)) * image.width +
      Math.max(0, Math.min(image.width - 1, x))) *
    4;
  return [raw[i], raw[i + 1], raw[i + 2]];
}
function closest(rgb: number[]) {
  let best = Infinity,
    result = palette[0];
  for (const c of palette) {
    const distance =
      (rgb[0] - c[0]) ** 2 * 0.3 +
      (rgb[1] - c[1]) ** 2 * 0.45 +
      (rgb[2] - c[2]) ** 2 * 0.25;
    if (distance < best) {
      best = distance;
      result = c;
    }
  }
  return result;
}
await mkdir("art-src/bases", { recursive: true });
const entries: Record<string, unknown> = {};
for (const person of crew) {
  const [sx, sy, sw, sh] = person.bodySource,
    scale = person.heightPx / sh,
    tw = Math.round(sw * scale),
    th = person.heightPx;
  const canvas = createCanvas(FRAME.width, FRAME.height),
    ctx = canvas.getContext("2d"),
    pixels = ctx.createImageData(FRAME.width, FRAME.height);
  const x0 = Math.round((FRAME.width - tw) / 2),
    y0 = FRAME.origin.y - th;
  for (let y = 0; y < th; y++)
    for (let x = 0; x < tw; x++) {
      const rgb = source(
        Math.round(sx + x / scale),
        Math.round(sy + y / scale),
      );
      // Dark studio pixels are removed before the shared palette pass; light fabric and skin remain.
      const brightness = rgb[0] * 0.3 + rgb[1] * 0.5 + rgb[2] * 0.2;
      const warm = rgb[0] > rgb[2] * 1.08 && rgb[0] > 35;
      if (brightness < 24 && !warm) continue;
      const c = closest(rgb),
        i = ((y + y0) * FRAME.width + x + x0) * 4;
      pixels.data[i] = c[0];
      pixels.data[i + 1] = c[1];
      pixels.data[i + 2] = c[2];
      pixels.data[i + 3] = 255;
    }
  // Preserve enclosed dark fabric; discard isolated studio specks.
  const copy = pixels.data.slice();
  for (let y = 1; y < FRAME.height - 1; y++)
    for (let x = 1; x < FRAME.width - 1; x++) {
      const i = (y * FRAME.width + x) * 4;
      if (copy[i + 3]) continue;
      const neighbors = [
        i - 4,
        i + 4,
        i - FRAME.width * 4,
        i + FRAME.width * 4,
      ];
      if (neighbors.filter((j) => copy[j + 3]).length === 4) {
        pixels.data.set([7, 11, 18, 255], i);
      }
    }
  const visited = new Set<number>();
  for (let q = 0; q < FRAME.width * FRAME.height; q++) {
    if (visited.has(q) || !pixels.data[q * 4 + 3]) continue;
    const component = [q];
    visited.add(q);
    for (let z = 0; z < component.length; z++) {
      const a = component[z],
        ax = a % FRAME.width;
      for (const b of [
        a - FRAME.width,
        a + FRAME.width,
        ...(ax > 0 ? [a - 1] : []),
        ...(ax < FRAME.width - 1 ? [a + 1] : []),
      ])
        if (
          b >= 0 &&
          b < FRAME.width * FRAME.height &&
          !visited.has(b) &&
          pixels.data[b * 4 + 3]
        ) {
          visited.add(b);
          component.push(b);
        }
    }
    if (component.length < 5)
      for (const a of component) pixels.data.fill(0, a * 4, a * 4 + 4);
  }
  ctx.putImageData(pixels, 0, 0);
  await writeFile(
    `art-src/bases/${person.id}.png`,
    canvas.toBuffer("image/png"),
  );
  const [hx, hy, hw, hh] = person.headSource;
  entries[person.id] = {
    head: {
      x: Math.round((hx - sx) * scale + x0),
      y: Math.round((hy - sy) * scale + y0),
      width: Math.round(hw * scale),
      height: Math.round(hh * scale),
    },
    scale,
    x0,
    y0,
    source: person.bodySource,
  };
}
await writeFile(
  "art-src/base-anchors.json",
  JSON.stringify(entries, null, 2) + "\n",
);
const sheet = createCanvas(1024, 384),
  sc = sheet.getContext("2d");
sc.imageSmoothingEnabled = false;
sc.fillStyle = "#030508";
sc.fillRect(0, 0, 1024, 384);
for (let i = 0; i < crew.length; i++) {
  const img = await loadImage(`art-src/bases/${crew[i].id}.png`);
  sc.drawImage(img, i * 128, 0, 128, 192);
  sc.fillStyle = "#bdc8ce";
  sc.font = "12px sans-serif";
  sc.fillText(crew[i].name, i * 128 + 5, 212);
}
await mkdir("review", { recursive: true });
await writeFile("review/base-designs.png", sheet.toBuffer("image/png"));
console.log("Eight palette-constrained base sprites prepared.");
