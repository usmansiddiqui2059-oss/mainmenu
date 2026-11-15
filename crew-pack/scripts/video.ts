import { createCanvas } from "@napi-rs/canvas";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { crew, animations, type Action } from "../src/data";
import { renderCrew } from "../src/render";
import { loadArt, canvasFor } from "./lib";
const art = await loadArt(),
  c = createCanvas(1280, 720),
  x = c.getContext("2d"),
  actions: Action[] = ["work", "signature", "walk", "eva_float", "eva_repair"];
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
);
const completion = new Promise<void>((resolve, reject) => {
  encoder.on("error", reject);
  encoder.on("exit", (code) =>
    code === 0 ? resolve() : reject(new Error("ffmpeg " + code)),
  );
});
for (let frame = 0; frame < 320; frame++) {
  const second = frame / 16,
    action = actions[Math.floor(second / 4)],
    local = second % 4,
    a = animations.find((a) => a.id === action)!;
  x.fillStyle = "#070b12";
  x.fillRect(0, 0, 1280, 720);
  x.fillStyle = "#e8e9e2";
  x.font = "26px sans-serif";
  x.fillText("MISSION CONTROL / " + a.label, 24, 35);
  x.imageSmoothingEnabled = false;
  for (let i = 0; i < crew.length; i++) {
    const p = crew[i],
      index = Math.floor(local * a.fps * p.tempo) % 8,
      render = renderCrew(
        p,
        art[p.id],
        action,
        index / 8,
        "se",
        action.startsWith("eva_") ? "eva" : "cabin",
      ),
      ox = (i % 4) * 320 + 64,
      oy = Math.floor(i / 4) * 330 + 42;
    x.drawImage(canvasFor(render.pixels), ox, oy, 192, 288);
    x.fillStyle = "#bdc8ce";
    x.font = "16px sans-serif";
    x.fillText(p.name, ox + 30, oy + 302);
    x.fillStyle = "#72899e";
    x.font = "12px sans-serif";
    x.fillText(p.role + " / " + p.trait, ox + 30, oy + 320);
  }
  if (!encoder.stdin.write(c.toBuffer("image/png")))
    await once(encoder.stdin, "drain");
}
encoder.stdin.end();
await completion;
console.log("20-second native motion review exported.");
