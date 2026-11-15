import { createCanvas } from "@napi-rs/canvas";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import {
  players,
  directions,
  variants,
  actions,
  timing,
  yawFor,
  FRAME,
  ROOT_DISTANCE,
  WORLD_SPEED,
  round,
} from "../src/data";
import { renderPlayer } from "../src/render";
import { manifestSchema, type Manifest } from "../src/manifest";
import { Pixels } from "../src/pixels";
import { canvasFor, svgFor } from "./pixel-export";
import ts from "typescript";
for (const d of [
  "assets/master",
  "assets/compact",
  "assets/gameplay",
  "assets/strips",
  "assets/stills",
  "assets/portraits",
  "review",
  "adapters",
])
  await mkdir(d, { recursive: true });
const manifest: Manifest = {
  version: "1.0.0",
  frame: FRAME,
  compactFrame: { width: 64, height: 96, origin: { x: 32, y: 84 } },
  gameplayFrame: { width: 16, height: 24, origin: { x: 8, y: 21 } },
  palette: (await readFile("art-src/palette.hex", "utf8")).trim().split(/\s+/),
  players,
  directions: [...directions],
  projection: {
    pixelsPerUnit: 2,
    groundYScale: 0.5,
    heightScale: Math.sqrt(0.75),
    north: "N is screen-up. Ground diagonals use 2:1 projection.",
  },
  movement: {
    walkCycleSeconds: timing.walk.frames / timing.walk.fps,
    worldUnitsPerCycle: ROOT_DISTANCE,
    worldUnitsPerSecond: WORLD_SPEED,
  },
  sheets: [],
};
let count = 0;
for (const player of players)
  for (const variant of variants)
    for (const action of actions) {
      const config = timing[action],
        width = config.frames * 128,
        c = createCanvas(width, 1536),
        ctx = c.getContext("2d"),
        compact = createCanvas(width / 2, 768),
        cc = compact.getContext("2d"),
        g = createCanvas(width / 8, 192),
        gc = g.getContext("2d");
      gc.imageSmoothingEnabled = false;
      cc.imageSmoothingEnabled = false;
      const rows: Manifest["sheets"][number]["rows"] = [];
      for (let d = 0; d < directions.length; d++) {
        const direction = directions[d],
          row: (typeof rows)[number] = {
            direction,
            yawDegrees: round((yawFor(direction) * 180) / Math.PI),
            frames: [],
          },
          strip = createCanvas(width, 192),
          sc = strip.getContext("2d");
        for (let f = 0; f < config.frames; f++) {
          const phase = f / config.frames,
            result = renderPlayer(player, variant, direction, action, phase),
            canvas = canvasFor(result.pixels);
          if (result.pixels.clipped) throw new Error("Clipped sprite");
          ctx.drawImage(canvas, f * 128, d * 192);
          cc.drawImage(canvas, 0, 0, 128, 192, f * 64, d * 96, 64, 96);
          gc.drawImage(canvas, 0, 0, 128, 192, f * 16, d * 24, 16, 24);
          sc.drawImage(canvas, f * 128, 0);
          const anchor = (p: readonly [number, number, number]) => {
            const q = result.project(p);
            return { x: round(q.x), y: round(q.y) };
          };
          row.frames.push({
            rect: { x: f * 128, y: d * 192, width: 128, height: 192 },
            phase,
            footPlant: [
              result.pose.feet[0].planted,
              result.pose.feet[1].planted,
            ],
            anchors: {
              footL: anchor(result.pose.feet[0].ground),
              footR: anchor(result.pose.feet[1].ground),
              handL: anchor(result.pose.arms[0].end),
              handR: anchor(result.pose.arms[1].end),
              tether: anchor([0, 9 * player.modelScale, result.pose.chest[2]]),
            },
            eyePixels: Array.from(result.tags).filter((t) => t === 1).length,
          });
          count++;
          if (action === "idle" && f === 0) {
            await writeFile(
              `assets/stills/${player.id}-${variant}-${direction}.png`,
              canvas.toBuffer("image/png"),
            );
            await writeFile(
              `assets/stills/${player.id}-${variant}-${direction}.svg`,
              svgFor(result.pixels),
            );
          }
        }
        await writeFile(
          `assets/strips/${player.id}-${variant}-${action}-${direction}.png`,
          strip.toBuffer("image/png"),
        );
        rows.push(row);
      }
      const path = `master/${player.id}-${variant}-${action}.png`,
        compactPath = `compact/${player.id}-${variant}-${action}.png`,
        gameplayPath = `gameplay/${player.id}-${variant}-${action}.png`;
      await writeFile(`assets/${path}`, c.toBuffer("image/png"));
      await writeFile(`assets/${compactPath}`, compact.toBuffer("image/png"));
      await writeFile(`assets/${gameplayPath}`, g.toBuffer("image/png"));
      manifest.sheets.push({
        player: player.id,
        variant,
        action,
        path,
        compactPath,
        gameplayPath,
        frameCount: config.frames,
        fps: config.fps,
        loop: true,
        rows,
      });
    }
manifestSchema.parse(manifest);
await writeFile("assets/manifest.json", JSON.stringify(manifest) + "\n");
// Character-select portraits are crisp crops of the same rendered faces, not separate people.
for (const player of players) {
  const source = canvasFor(
      renderPlayer(player, "cabin", "SE", "idle", 0).pixels,
    ),
    portrait = createCanvas(128, 128),
    x = portrait.getContext("2d");
  x.imageSmoothingEnabled = false;
  x.drawImage(source, 32, 0, 64, 64, 0, 0, 128, 128);
  const pixels = new Pixels(128, 128);
  pixels.data.set(x.getImageData(0, 0, 128, 128).data);
  await writeFile(
    `assets/portraits/${player.id}.png`,
    portrait.toBuffer("image/png"),
  );
  await writeFile(`assets/portraits/${player.id}.svg`, svgFor(pixels));
}
await import("./review");
await import("./cycles");
await import("./preview");
const adapter = await readFile("adapters/canvas.ts", "utf8");
await writeFile(
  "adapters/canvas.js",
  ts.transpileModule(adapter, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
    },
  }).outputText,
);
console.log(
  `${count} frames per resolution, eight actual orientations for both choices/suits.`,
);
