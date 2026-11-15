import { createCanvas, loadImage } from "@napi-rs/canvas";
import { readFile, writeFile } from "node:fs/promises";
const im = await loadImage("art-src/player-heads.png"),
  canvas = createCanvas(im.width, im.height),
  ctx = canvas.getContext("2d");
ctx.drawImage(im, 0, 0);
const raw = ctx.getImageData(0, 0, im.width, im.height).data,
  hex = (await readFile("art-src/palette.hex", "utf8")).trim().split(/\s+/),
  palette = hex.map((h) => [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ]),
  directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"],
  result: Record<string, unknown> = {};
const transparentInput = raw[3] < 200,
  players = JSON.parse(await readFile("content/players.json", "utf8"));
function opaque(x: number, y: number) {
  const i = (y * im.width + x) * 4,
    r = raw[i],
    g = raw[i + 1],
    b = raw[i + 2];
  return (
    raw[i + 3] > 200 &&
    (transparentInput || r + g + b > 36) &&
    !(g > r * 1.6 && g > b * 1.6) &&
    !(r > 120 && g < 35 && b < 35)
  );
}
for (let row = 0; row < 2; row++) {
  const id = row === 0 ? "player_female" : "player_male",
    entries: Record<string, unknown> = {};
  for (let col = 0; col < 8; col++) {
    const x0 = Math.floor((col * im.width) / 8),
      x1 = Math.floor(((col + 1) * im.width) / 8),
      y0 = Math.floor((row * im.height) / 2),
      y1 = Math.floor(((row + 1) * im.height) / 2);
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
    const sourceWidth = maxX - minX + 1,
      sourceHeight = maxY - minY + 1,
      targetHeight = players[row].headHeightPx,
      scale = targetHeight / sourceHeight;
    let neckSum = 0,
      neckCount = 0;
    for (let y = maxY - 4; y <= maxY; y++)
      for (let x = minX; x <= maxX; x++)
        if (opaque(x, y)) {
          neckSum += x;
          neckCount++;
        }
    const neckX = neckCount ? neckSum / neckCount : (minX + maxX) / 2,
      left = Math.round(32 - (neckX - minX) * scale),
      top = 42 - targetHeight,
      data = Array(64 * 48).fill(-1),
      tags = Array(64 * 48).fill(0);
    for (let y = 0; y < targetHeight; y++)
      for (let x = 0; x < Math.ceil(sourceWidth * scale); x++) {
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
        if (xx < 0 || xx >= 64 || yy < 0 || yy >= 48)
          throw new Error("Head crop clipping");
        const dest = yy * 64 + xx;
        data[dest] = best;
        const fx = x / (sourceWidth * scale),
          fy = y / targetHeight,
          direction = directions[col],
          eyeY = row === 0 ? 0.6 : 0.51,
          eyeX =
            direction === "E"
              ? [0.81]
              : direction === "W"
                ? [0.18]
                : direction === "SE"
                  ? [0.63, 0.83]
                  : direction === "SW"
                    ? [0.18, 0.4]
                    : [0.36, 0.64];
        const eye =
          ["S", "SE", "SW", "E", "W"].includes(direction) &&
          Math.abs(fy - eyeY) < 0.075 &&
          eyeX.some((u) => Math.abs(fx - u) < 0.07);
        tags[dest] = eye
          ? 1
          : r > b * 1.15 && r * 0.3 + g * 0.5 + b * 0.2 > 55
            ? 2
            : 3;
      }
    // Keep the connected head; alpha fringe specks must not become floating pixels.
    const visited = new Set<number>(),
      components: number[][] = [];
    for (let i = 0; i < data.length; i++) {
      if (data[i] < 0 || visited.has(i)) continue;
      const list = [i];
      visited.add(i);
      for (let q = 0; q < list.length; q++)
        for (const dx of [-1, 0, 1])
          for (const dy of [-1, 0, 1]) {
            const x = (list[q] % 64) + dx,
              y = Math.floor(list[q] / 64) + dy,
              n = y * 64 + x;
            if (
              x >= 0 &&
              x < 64 &&
              y >= 0 &&
              y < 48 &&
              data[n] >= 0 &&
              !visited.has(n)
            ) {
              visited.add(n);
              list.push(n);
            }
          }
      components.push(list);
    }
    components.sort((a, b) => b.length - a.length);
    for (const part of components.slice(1))
      for (const i of part) {
        data[i] = -1;
        tags[i] = 0;
      }
    entries[directions[col]] = {
      width: 64,
      height: 48,
      anchor: { x: 32, y: 42 },
      data,
      tags,
      source: {
        x: minX,
        y: minY,
        width: sourceWidth,
        height: sourceHeight,
        neckX,
      },
    };
  }
  result[id] = entries;
}
await writeFile("art-src/head-sprites.json", JSON.stringify(result) + "\n");
await writeFile("content/palette.json", JSON.stringify(hex) + "\n");
