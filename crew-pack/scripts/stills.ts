import { createCanvas } from "@napi-rs/canvas";
import { writeFile, mkdir } from "node:fs/promises";
import { crew } from "../src/data";
import { renderCrew } from "../src/render";
import { Pixels } from "../src/pixels";
import { canvasFor, svgFor } from "./lib";
await mkdir("assets/sprites", { recursive: true });
for (const c of crew)
  for (let f = -1; f < 4; f++) {
    const p = renderCrew(
        c,
        f < 0 ? "idle" : "walk",
        f < 0 ? 0 : f / 4,
        "se",
        "cabin",
      ).pixels,
      canvas = createCanvas(16, 24),
      x = canvas.getContext("2d");
    x.imageSmoothingEnabled = false;
    x.drawImage(canvasFor(p), 0, 0, 16, 24);
    const low = new Pixels(16, 24);
    low.data.set(x.getImageData(0, 0, 16, 24).data);
    const stem = f < 0 ? `crew-${c.id}-idle` : `crew-${c.id}-walk-${f + 1}`;
    await writeFile(`assets/sprites/${stem}.svg`, svgFor(low));
    await writeFile(`assets/sprites/${stem}.png`, canvas.toBuffer("image/png"));
    if (c.id === "ayesha")
      await writeFile(
        `assets/sprites/${f < 0 ? "crew-base-idle" : `crew-base-walk-${f + 1}`}.svg`,
        svgFor(low),
      );
  }
for (let f = 0; f < 2; f++) {
  const p = renderCrew(crew[0], "eva_float", f / 2, "se", "eva").pixels,
    c = createCanvas(24, 32),
    x = c.getContext("2d");
  x.imageSmoothingEnabled = false;
  x.drawImage(canvasFor(p), 1, 0, 22, 32);
  const low = new Pixels(24, 32);
  low.data.set(x.getImageData(0, 0, 24, 32).data);
  await writeFile(`assets/sprites/eva-${f + 1}.svg`, svgFor(low));
}
