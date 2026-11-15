import { createCanvas } from "@napi-rs/canvas";
import { writeFile } from "node:fs/promises";
import { crew, animations } from "../src/data";
import { renderCrew } from "../src/render";
import { canvasFor } from "./lib";
const c = createCanvas(1536, 1728),
  x = c.getContext("2d");
x.fillStyle = "#0b111c";
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
      v = action.startsWith("eva_") ? "eva" : "cabin";
    x.drawImage(
      canvasFor(renderCrew(p, action, 0.375, "se", v).detailPixels),
      a * 136,
      y + 24,
      128,
      192,
    );
    if (i === 0) {
      x.fillStyle = "#72899e";
      x.font = "10px monospace";
      x.fillText(action, a * 136 + 4, y + 32);
    }
  }
}
await writeFile("review/all-actions.png", c.toBuffer("image/png"));
const b = createCanvas(1024, 832),
  bc = b.getContext("2d");
bc.fillStyle = "#0b111c";
bc.fillRect(0, 0, b.width, b.height);
for (let i = 0; i < crew.length; i++)
  for (let d = 0; d < 2; d++)
    for (let v = 0; v < 2; v++) {
      bc.drawImage(
        canvasFor(
          renderCrew(
            crew[i],
            "idle",
            0,
            d === 0 ? "ne" : "nw",
            v === 0 ? "cabin" : "eva",
          ).detailPixels,
        ),
        i * 128,
        (d * 2 + v) * 208,
      );
    }
await writeFile("review/rear-views.png", b.toBuffer("image/png"));
const walk = createCanvas(1024, 1664),
  wc = walk.getContext("2d");
wc.fillStyle = "#0b111c";
wc.fillRect(0, 0, walk.width, walk.height);
for (let i = 0; i < crew.length; i++)
  for (let f = 0; f < 8; f++) {
    wc.drawImage(
      canvasFor(renderCrew(crew[i], "walk", f / 8, "se", "cabin").detailPixels),
      f * 128,
      i * 208,
    );
    wc.fillStyle = "#98a9b7";
    wc.font = "11px sans-serif";
    wc.fillText(crew[i].name + " / " + (f + 1), f * 128 + 6, i * 208 + 204);
  }
await writeFile("review/walk-cycles.png", walk.toBuffer("image/png"));
