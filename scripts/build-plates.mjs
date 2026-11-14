import { createCanvas, loadImage } from "@napi-rs/canvas";
import { readFile, writeFile, mkdir } from "node:fs/promises";
const colors = (await readFile("art-src/palette.hex", "utf8"))
  .trim()
  .split(/\s+/)
  .map((hex) => [
    parseInt(hex.slice(0, 2), 16),
    parseInt(hex.slice(2, 4), 16),
    parseInt(hex.slice(4, 6), 16),
  ]);
const image = await loadImage("art-src/environment-concept-atlas.png");
const observatory = await loadImage("art-src/observatory-concept.png");
const width = 480,
  height = 270,
  hw = image.width / 2,
  hh = image.height / 2;
const entries = [
  ["title", 0, 0],
  ["crew-cabin", 1, 0],
  ["mars-surface", 0, 1],
  ["maintenance-bay", 1, 1],
  ["event-observatory", 0, 0],
];
await mkdir("public/assets/backgrounds", { recursive: true });
for (const [name, col, row] of entries) {
  const canvas = createCanvas(width, height),
    ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  if (name === "event-observatory")
    ctx.drawImage(
      observatory,
      0,
      0,
      observatory.width,
      observatory.height,
      0,
      0,
      width,
      height,
    );
  else ctx.drawImage(image, col * hw, row * hh, hw, hh, 0, 0, width, height);
  const pixels = ctx.getImageData(0, 0, width, height),
    cache = new Map();
  for (let i = 0; i < pixels.data.length; i += 4) {
    const r = pixels.data[i],
      g = pixels.data[i + 1],
      b = pixels.data[i + 2],
      key = (r << 16) | (g << 8) | b;
    let color = cache.get(key);
    if (!color) {
      let best = Infinity;
      for (const candidate of colors) {
        const dr = r - candidate[0],
          dg = g - candidate[1],
          db = b - candidate[2];
        const distance = dr * dr * 0.28 + dg * dg * 0.48 + db * db * 0.24;
        if (distance < best) {
          best = distance;
          color = candidate;
        }
      }
      cache.set(key, color);
    }
    pixels.data[i] = color[0];
    pixels.data[i + 1] = color[1];
    pixels.data[i + 2] = color[2];
    pixels.data[i + 3] = 255;
  }
  ctx.putImageData(pixels, 0, 0);
  // Deterministic cleanup: make the menu field a true ink black, without a blur or hue overlay.
  // Its last columns use sparse ordered pixels to avoid a visible rectangular seam.
  const imageData = ctx.getImageData(0, 0, width, height),
    ink = colors[0];
  for (let y = 0; y < height; y++)
    for (let x = 0; x < 132; x++) {
      const replace = x < 100 || (x * 13 + y * 7) % 32 > x - 100;
      if (replace) {
        const i = (y * width + x) * 4;
        imageData.data[i] = ink[0];
        imageData.data[i + 1] = ink[1];
        imageData.data[i + 2] = ink[2];
      }
    }
  ctx.putImageData(imageData, 0, 0);
  await writeFile(
    `public/assets/backgrounds/${name}.png`,
    canvas.toBuffer("image/png"),
  );
}
await writeFile(
  "art-src/plates.json",
  JSON.stringify(
    {
      native: { width, height },
      palette: "Mission Night 48",
      source: "environment-concept-atlas.png",
      eventSource: "observatory-concept.png",
      plates: {
        launch: "backgrounds/title.png",
        orbit: "backgrounds/crew-cabin.png",
        mars: "backgrounds/mars-surface.png",
        workshop: "backgrounds/maintenance-bay.png",
        event: "backgrounds/event-observatory.png",
      },
      anchors: {
        launch: { rocket: [350, 243] },
        event: { sculpture: [365, 126], base: [365, 205] },
        orbit: { astronaut: [393, 210] },
        mars: { astronaut: [404, 220] },
        workshop: {
          astronaut: [352, 214],
          spriteOrigin: [264, 70],
          nativeRoot: [44, 72],
          spriteScale: 2,
          contact: [304, 114],
        },
      },
    },
    null,
    2,
  ) + "\n",
);
console.log(
  "Five 480 × 270 opaque plates rebuilt on the shared 48-color grid.",
);
// Matching destination cards: genuine stepped pixel shading, never CSS gradient spheres.
{
  const moon = createCanvas(200, 125),
    ctx = moon.getContext("2d");
  ctx.fillStyle = "#030508";
  ctx.fillRect(0, 0, 200, 125);
  const ramp = [
    "#101a29",
    "#282c35",
    "#515966",
    "#6d7680",
    "#8d969e",
    "#b1b7b8",
    "#d4d5cd",
    "#e8e9e2",
  ];
  const craters = [
    [98, 37, 9],
    [130, 51, 13],
    [87, 75, 15],
    [121, 91, 8],
    [145, 73, 5],
    [106, 62, 5],
    [70, 54, 7],
  ];
  for (let y = 9; y < 115; y++)
    for (let x = 48; x < 163; x++) {
      const nx = (x - 106) / 51,
        ny = (y - 61) / 51,
        r2 = nx * nx + ny * ny;
      if (r2 > 1) continue;
      const nz = Math.sqrt(1 - r2),
        light = Math.max(0, -nx * 0.55 - ny * 0.5 + nz * 0.55);
      let step = Math.floor(light * 7);
      for (const [cx, cy, r] of craters) {
        const d = Math.hypot(x - cx, y - cy);
        if (d < r) step -= d < r - 2 ? 1 : -1;
      }
      if ((x * 17 + y * 13) % 23 < 2) step--;
      ctx.fillStyle = ramp[Math.max(0, Math.min(7, step))];
      ctx.fillRect(x, y, 1, 1);
    }
  await writeFile(
    "public/assets/backgrounds/dest-moon.png",
    moon.toBuffer("image/png"),
  );
  const source = await loadImage("public/assets/backgrounds/mars-surface.png"),
    mars = createCanvas(200, 125),
    mc = mars.getContext("2d");
  mc.imageSmoothingEnabled = false;
  mc.drawImage(source, 190, 15, 290, 181, 0, 0, 200, 125);
  await writeFile(
    "public/assets/backgrounds/dest-mars.png",
    mars.toBuffer("image/png"),
  );
}
