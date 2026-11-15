import { createCanvas } from "@napi-rs/canvas";
import { writeFile } from "node:fs/promises";
import { crew } from "../src/data";
import { renderCrew } from "../src/render";
import { canvasFor } from "./lib";
const c = createCanvas(1536, 768),
  x = c.getContext("2d");
x.imageSmoothingEnabled = false;
x.fillStyle = "#0b111c";
x.fillRect(0, 0, c.width, c.height);
for (let i = 0; i < crew.length; i++)
  for (const [v, k] of [
    ["cabin", 0],
    ["eva", 1],
  ] as const) {
    const ox = (i % 4) * 384 + k * 192,
      oy = Math.floor(i / 4) * 384;
    x.drawImage(
      canvasFor(renderCrew(crew[i], "idle", 0, "se", v).detailPixels),
      ox,
      oy,
      192,
      288,
    );
    if (k === 0) {
      x.fillStyle = "#bdc8ce";
      x.font = "16px sans-serif";
      x.fillText(crew[i].name, ox + 10, oy + 320);
      x.fillStyle = "#72899e";
      x.font = "12px monospace";
      x.fillText(crew[i].role + " / " + crew[i].trait, ox + 10, oy + 342);
    }
  }
await writeFile("review/crew-designs.png", c.toBuffer("image/png"));
