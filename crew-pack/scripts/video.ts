import { createCanvas, loadImage } from "@napi-rs/canvas";
import { readFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { crew, animations, type Action, type Direction } from "../src/data";
import { manifestSchema } from "../src/manifest";
const m = manifestSchema.parse(
    JSON.parse(await readFile("assets/manifest.json", "utf8")),
  ),
  canvas = createCanvas(1280, 928),
  x = canvas.getContext("2d"),
  images = new Map();
const sections: { action: Action; direction: Direction }[] = [
  { action: "walk", direction: "se" },
  { action: "signature", direction: "se" },
  { action: "work", direction: "sw" },
  { action: "walk", direction: "ne" },
  { action: "idle", direction: "nw" },
  { action: "eva_float", direction: "se" },
  { action: "eva_repair", direction: "se" },
];
const encoder = spawn(
    "ffmpeg",
    [
      "-y",
      "-loglevel",
      "error",
      "-framerate",
      "16",
      "-f",
      "image2pipe",
      "-i",
      "pipe:0",
      "-an",
      "-c:v",
      "libx264",
      "-crf",
      "18",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      "review/crew-motion.mp4",
    ],
    { stdio: ["pipe", "inherit", "inherit"] },
  ),
  done = new Promise<void>((resolve, reject) => {
    encoder.on("error", reject);
    encoder.on("exit", (n) =>
      n === 0 ? resolve() : reject(new Error("ffmpeg " + n)),
    );
  });
for (let frame = 0; frame < 336; frame++) {
  const seconds = frame / 16,
    section = sections[Math.floor(seconds / 3)],
    variant = section.action.startsWith("eva_") ? "eva" : "cabin",
    local = seconds % 3;
  x.fillStyle = "#0b111c";
  x.fillRect(0, 0, 1280, 928);
  x.fillStyle = "#e8e9e2";
  x.font = "24px sans-serif";
  x.fillText(
    "MISSION CONTROL / " +
      section.action +
      " / " +
      section.direction.toUpperCase(),
    24,
    31,
  );
  x.imageSmoothingEnabled = false;
  for (let i = 0; i < crew.length; i++) {
    const p = crew[i],
      a = m.atlases.find(
        (a) =>
          a.crew === p.id &&
          a.variant === variant &&
          a.direction === section.direction,
      )!,
      r = a.rows.find((r) => r.action === section.action)!,
      tick = Math.floor(local * r.fps),
      f = r.frames[tick % 8],
      ox = (i % 4) * 320 + 32,
      oy = Math.floor(i / 4) * 432 + 48;
    if (!images.has(a.detail))
      images.set(a.detail, await loadImage("assets/" + a.detail));
    if (section.action === "walk") {
      x.save();
      x.beginPath();
      x.rect((i % 4) * 320, oy, 320, 400);
      x.clip();
      const yaw =
          ({ se: 45, sw: 315, ne: 135, nw: 225 }[section.direction] * Math.PI) /
          180,
        travel = (tick * m.movement.worldUnitsPerWalkCycle) / 8,
        dx = Math.sin(yaw) * travel,
        dy = -Math.cos(yaw) * travel,
        bx = Math.floor(((dx + dy) * Math.SQRT1_2) / 12) * 12,
        by = Math.floor(((dy - dx) * Math.SQRT1_2) / 12) * 12;
      x.strokeStyle = "#172438";
      const line = (a: number, b: number, c: number, d: number) => {
        x.beginPath();
        x.moveTo(
          ox + 128 + ((a - b) * Math.SQRT1_2 - dx) * 4,
          oy + 352 - ((a + b) * Math.SQRT1_2 - dy) * 2,
        );
        x.lineTo(
          ox + 128 + ((c - d) * Math.SQRT1_2 - dx) * 4,
          oy + 352 - ((c + d) * Math.SQRT1_2 - dy) * 2,
        );
        x.stroke();
      };
      for (let k = -12; k <= 12; k++) {
        line(bx + k * 12, by - 144, bx + k * 12, by + 144);
        line(bx - 144, by + k * 12, bx + 144, by + k * 12);
      }
      x.restore();
    }
    if (section.action === "eva_float") {
      const t = f.anchors.tether;
      x.strokeStyle = "#72899e";
      x.lineWidth = 2;
      x.beginPath();
      x.moveTo(ox, oy + t.y * 4 + 30);
      x.quadraticCurveTo(
        ox + t.x * 2,
        oy + t.y * 4 + 40,
        ox + t.x * 4,
        oy + t.y * 4,
      );
      x.stroke();
    }
    if (section.action === "eva_repair" && f.anchors.toolTip) {
      const t = f.anchors.toolTip,
        h = f.anchors.handL,
        l = Math.min(t.x, h.x) - 4,
        top = Math.min(t.y, h.y) - 5;
      x.fillStyle = "#20314a";
      x.fillRect(
        ox + l * 4,
        oy + top * 4,
        (Math.max(t.x, h.x) - l + 4) * 4,
        (Math.max(t.y, h.y) - top + 5) * 4,
      );
    }
    x.drawImage(
      images.get(a.detail),
      f.x * 2,
      f.y * 2,
      128,
      192,
      ox,
      oy,
      256,
      384,
    );
    x.fillStyle = "#bdc8ce";
    x.font = "16px sans-serif";
    x.fillText(p.name, ox + 16, oy + 404);
    x.fillStyle = "#72899e";
    x.font = "12px sans-serif";
    x.fillText(p.role + " / " + p.trait, ox + 16, oy + 422);
  }
  if (!encoder.stdin.write(canvas.toBuffer("image/png")))
    await once(encoder.stdin, "drain");
}
encoder.stdin.end();
await done;
