import { createCanvas } from "@napi-rs/canvas";
import { writeFile } from "node:fs/promises";
import { players, directions } from "../src/data";
import { renderPlayer } from "../src/render";
import { canvasFor } from "./pixel-export";
for (const player of players) {
  const c = createCanvas(1536, 1728),
    x = c.getContext("2d");
  x.imageSmoothingEnabled = false;
  x.fillStyle = "#0b111c";
  x.fillRect(0, 0, c.width, c.height);
  for (let d = 0; d < 8; d++)
    for (let f = 0; f < 12; f++) {
      x.drawImage(
        canvasFor(
          renderPlayer(player, "cabin", directions[d], "walk", f / 12).pixels,
        ),
        f * 128,
        d * 216 + 20,
        128,
        192,
      );
      x.fillStyle = "#bdc8ce";
      x.font = "11px monospace";
      x.fillText(directions[d] + " / " + (f + 1), f * 128 + 4, d * 216 + 15);
    }
  await writeFile(
    `review/${player.id}-walk-cycles.png`,
    c.toBuffer("image/png"),
  );
}
