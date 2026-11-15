import { createCanvas, loadImage } from "@napi-rs/canvas";
import { readFile, writeFile } from "node:fs/promises";
const hex = (await readFile("art-src/palette.hex", "utf8")).trim().split(/\s+/),
  palette = hex.map((h) => [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ]),
  models = JSON.parse(await readFile("content/models.json", "utf8")),
  result: Record<string, unknown> = {};
for (const [path, ids] of [
  ["art-src/crew-heads-a.png", ["ayesha", "maya", "bilal", "lin"]],
  ["art-src/crew-heads-b.png", ["sana", "kofi", "omar", "zara"]],
] as const) {
  const im = await loadImage(path),
    c = createCanvas(im.width, im.height),
    ctx = c.getContext("2d");
  ctx.drawImage(im, 0, 0);
  const raw = ctx.getImageData(0, 0, im.width, im.height).data;
  const opaque = (x: number, y: number) => {
    const i = (y * im.width + x) * 4,
      r = raw[i],
      g = raw[i + 1],
      b = raw[i + 2];
    return (
      raw[i + 3] > 245 &&
      !(g > r * 1.6 && g > b * 1.6) &&
      !(r > 120 && g < 35 && b < 35)
    );
  };
  for (let row = 0; row < 4; row++) {
    const id = ids[row],
      entries: Record<string, unknown> = {};
    for (let col = 0; col < 4; col++) {
      const x0 = Math.floor((col * im.width) / 4),
        x1 = Math.floor(((col + 1) * im.width) / 4),
        y0 = Math.floor((row * im.height) / 4),
        y1 = Math.floor(((row + 1) * im.height) / 4);
      let minX = x1,
        maxX = x0,
        minY = y1,
        maxY = y0;
      for (let y = y0; y < y1; y++)
        for (let x = x0; x < x1; x++)
          if (opaque(x, y)) {
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
          }
      const sw = maxX - minX + 1;
      let neckY = maxY;
      if (id === "zara") {
        for (let y = maxY; y >= minY; y--) {
          let n = 0;
          for (let x = minX; x <= maxX; x++) {
            const i = (y * im.width + x) * 4;
            if (
              opaque(x, y) &&
              raw[i] > raw[i + 2] * 1.18 &&
              raw[i] > 55 &&
              raw[i] * 0.3 + raw[i + 1] * 0.5 + raw[i + 2] * 0.2 > 65
            )
              n++;
          }
          if (n >= sw * 0.15) {
            neckY = y;
            break;
          }
        }
      }
      let sum = 0,
        n = 0;
      for (let y = neckY - 2; y <= neckY; y++)
        for (let x = minX; x <= maxX; x++)
          if (opaque(x, y)) {
            sum += x;
            n++;
          }
      const neckX = n ? sum / n : (minX + maxX) / 2,
        scale = models[id].headHeightPx / (neckY - minY + 1),
        left = Math.round(32 - (neckX - minX) * scale),
        top = 42 - models[id].headHeightPx,
        data = Array(64 * 64).fill(-1),
        tags = Array(64 * 64).fill(0);
      for (let y = 0; y < Math.ceil((maxY - minY + 1) * scale); y++)
        for (let x = 0; x < Math.ceil(sw * scale); x++) {
          const sx = Math.min(maxX, Math.round(minX + x / scale)),
            sy = Math.min(maxY, Math.round(minY + y / scale));
          if (!opaque(sx, sy)) continue;
          const i = (sy * im.width + sx) * 4,
            r = raw[i],
            g = raw[i + 1],
            b = raw[i + 2];
          let best = 0,
            dist = Infinity;
          for (let k = 0; k < palette.length; k++) {
            const p = palette[k],
              d =
                (r - p[0]) ** 2 * 0.3 +
                (g - p[1]) ** 2 * 0.45 +
                (b - p[2]) ** 2 * 0.25;
            if (d < dist) {
              dist = d;
              best = k;
            }
          }
          const xx = left + x,
            yy = top + y;
          if (xx < 0 || xx >= 64 || yy < 0 || yy >= 64)
            throw new Error("Head crop clipping " + id);
          const dest = yy * 64 + xx;
          data[dest] = best;
          const fy = y / models[id].headHeightPx,
            fx = x / (sw * scale),
            eye = col < 2 && fy > 0.4 && fy < 0.65 && fx > 0.28 && fx < 0.84;
          tags[dest] = eye
            ? 1
            : r > b * 1.15 && r * 0.3 + g * 0.5 + b * 0.2 > 55
              ? 2
              : 3;
        }
      const visited = new Set<number>(),
        parts: number[][] = [];
      for (let i = 0; i < data.length; i++) {
        if (data[i] < 0 || visited.has(i)) continue;
        const q = [i];
        visited.add(i);
        for (let p = 0; p < q.length; p++)
          for (const dx of [-1, 0, 1])
            for (const dy of [-1, 0, 1]) {
              const x = (q[p] % 64) + dx,
                y = Math.floor(q[p] / 64) + dy,
                a = y * 64 + x;
              if (
                x >= 0 &&
                x < 64 &&
                y >= 0 &&
                y < 64 &&
                data[a] >= 0 &&
                !visited.has(a)
              ) {
                visited.add(a);
                q.push(a);
              }
            }
        parts.push(q);
      }
      parts.sort((a, b) => b.length - a.length);
      for (const part of parts.slice(1))
        for (const i of part) {
          data[i] = -1;
          tags[i] = 0;
        }
      entries[["SE", "SW", "NE", "NW"][col]] = {
        width: 64,
        height: 64,
        anchor: { x: 32, y: 42 },
        data,
        tags,
        source: {
          path,
          x: minX,
          y: minY,
          width: sw,
          height: maxY - minY + 1,
          neckX,
          neckY,
        },
      };
    }
    result[id] = entries;
  }
}
await writeFile("art-src/head-sprites.json", JSON.stringify(result) + "\n");
await writeFile("content/palette.json", JSON.stringify(hex) + "\n");
