import { createCanvas, loadImage } from "@napi-rs/canvas";
import { spawn } from "node:child_process";
import { once } from "node:events";
import {
  players,
  variants,
  directions,
  timing,
  yawFor,
  WORLD_SPEED,
  FRAME,
} from "../src/data";
const c = createCanvas(1280, 480),
  x = c.getContext("2d"),
  sheets = new Map();
for (const p of players)
  for (const v of variants)
    sheets.set(
      `${p.id}-${v}`,
      await loadImage(`assets/master/${p.id}-${v}-walk.png`),
    );
const encoder = spawn(
    "ffmpeg",
    [
      "-y",
      "-loglevel",
      "error",
      "-framerate",
      "20",
      "-f",
      "image2pipe",
      "-i",
      "pipe:0",
      "-an",
      "-c:v",
      "libx264",
      "-crf",
      "17",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      "review/Player-Animation-Study.mp4",
    ],
    { stdio: ["pipe", "inherit", "inherit"] },
  ),
  done = new Promise<void>((resolve, reject) => {
    encoder.on("error", reject);
    encoder.on("exit", (n) =>
      n === 0 ? resolve() : reject(new Error("ffmpeg exit " + n)),
    );
  });
for (let f = 0; f < 320; f++) {
  const seconds = f / 20,
    d = Math.floor(seconds / 2),
    direction = directions[d],
    index = Math.floor(seconds * timing.walk.fps) % 12;
  x.fillStyle = "#0b111c";
  x.fillRect(0, 0, 1280, 480);
  x.imageSmoothingEnabled = false;
  let cell = 0;
  for (const p of players)
    for (const v of variants) {
      const ox = cell * 320 + 32,
        oy = 30,
        originX = ox + FRAME.origin.x * 2,
        originY = oy + FRAME.origin.y * 2,
        yaw = yawFor(direction),
        dx =
          Math.sin(yaw) *
          WORLD_SPEED *
          (Math.floor(seconds * timing.walk.fps) / timing.walk.fps),
        dy =
          -Math.cos(yaw) *
          WORLD_SPEED *
          (Math.floor(seconds * timing.walk.fps) / timing.walk.fps);
      x.save();
      x.beginPath();
      x.rect(cell * 320, 0, 320, 480);
      x.clip();
      x.strokeStyle = "#172438";
      x.lineWidth = 1;
      const bx = Math.floor(((dx + dy) * Math.SQRT1_2) / 12) * 12,
        by = Math.floor(((dy - dx) * Math.SQRT1_2) / 12) * 12;
      const line = (a: number, b: number, c: number, d: number) => {
        x.beginPath();
        x.moveTo(
          originX + ((a - b) * Math.SQRT1_2 - dx) * 4,
          originY - ((a + b) * Math.SQRT1_2 - dy) * 2,
        );
        x.lineTo(
          originX + ((c - d) * Math.SQRT1_2 - dx) * 4,
          originY - ((c + d) * Math.SQRT1_2 - dy) * 2,
        );
        x.stroke();
      };
      for (let k = -12; k <= 12; k++) {
        line(bx + k * 12, by - 144, bx + k * 12, by + 144);
        line(bx - 144, by + k * 12, bx + 144, by + k * 12);
      }
      x.drawImage(
        sheets.get(`${p.id}-${v}`),
        index * 128,
        d * 192,
        128,
        192,
        ox,
        oy,
        256,
        384,
      );
      x.fillStyle = "#e8e9e2";
      x.font = "17px sans-serif";
      x.fillText(`${p.gender} / ${v} / ${direction}`, cell * 320 + 24, 448);
      x.restore();
      cell++;
    }
  if (!encoder.stdin.write(c.toBuffer("image/png")))
    await once(encoder.stdin, "drain");
}
encoder.stdin.end();
await done;
