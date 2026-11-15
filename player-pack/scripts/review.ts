import { createCanvas } from "@napi-rs/canvas";
import { writeFile, mkdir } from "node:fs/promises";
import { players, directions, variants } from "../src/data";
import { renderPlayer } from "../src/render";
await mkdir("review", { recursive: true });
const canvas = createCanvas(1536, 1536),
  x = canvas.getContext("2d");
x.fillStyle = "#0b111c";
x.fillRect(0, 0, canvas.width, canvas.height);
x.imageSmoothingEnabled = false;
for (let p = 0; p < 2; p++)
  for (let v = 0; v < 2; v++)
    for (let d = 0; d < 8; d++) {
      const result = renderPlayer(
          players[p],
          variants[v],
          directions[d],
          "idle",
          0,
        ),
        c = createCanvas(128, 192);
      result.pixels.flush(
        c.getContext("2d") as unknown as CanvasRenderingContext2D,
      );
      const xx = d * 192,
        yy = (p * 2 + v) * 384;
      x.drawImage(c, xx, yy + 30, 192, 288);
      x.fillStyle = "#bdc8ce";
      x.font = "16px sans-serif";
      x.fillText(
        `${players[p].gender} / ${variants[v]} / ${directions[d]}`,
        xx + 8,
        yy + 24,
      );
      x.fillStyle = "#72899e";
      x.font = "12px monospace";
      x.fillText(
        "eyes " + Array.from(result.tags).filter((t) => t === 1).length,
        xx + 8,
        yy + 340,
      );
    }
await writeFile("review/turnarounds.png", canvas.toBuffer("image/png"));
