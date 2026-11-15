import { createCanvas, loadImage } from "@napi-rs/canvas";
import { writeFile } from "node:fs/promises";
import { crew, animations } from "../src/data";
import { renderCrew } from "../src/render";
import { loadArt, canvasFor } from "./lib";
const art = await loadArt(),
  c = createCanvas(1536, 1728),
  x = c.getContext("2d");
x.fillStyle = "#030508";
x.fillRect(0, 0, c.width, c.height);
x.imageSmoothingEnabled = false;
for (let i = 0; i < crew.length; i++) {
  const p = crew[i],
    y = i * 216;
  x.fillStyle = "#bdc8ce";
  x.font = "15px sans-serif";
  x.fillText(p.name, 6, y + 18);
  for (let a = 0; a < animations.length; a++) {
    const action = animations[a].id,
      variant = action.startsWith("eva_") ? "eva" : "cabin";
    const r = renderCrew(p, art[p.id], action, 0.375, "se", variant);
    x.drawImage(canvasFor(r.pixels), a * 136, y + 24, 128, 192);
    if (i === 0) {
      x.fillStyle = "#72899e";
      x.font = "10px monospace";
      x.fillText(action, a * 136 + 4, y + 32);
    }
  }
}
await writeFile("review/all-actions.png", c.toBuffer("image/png"));
const backs = createCanvas(1024, 416),
  bc = backs.getContext("2d");
bc.fillStyle = "#030508";
bc.fillRect(0, 0, 1024, 416);
bc.imageSmoothingEnabled = false;
for (let i = 0; i < crew.length; i++)
  for (const [variant, row] of [
    ["cabin", 0],
    ["eva", 1],
  ] as const)
    bc.drawImage(
      canvasFor(
        renderCrew(crew[i], art[crew[i].id], "idle", 0, "ne", variant).pixels,
      ),
      i * 128,
      row * 208,
      128,
      192,
    );
await writeFile("review/rear-views.png", backs.toBuffer("image/png"));
