import { createCanvas } from "@napi-rs/canvas";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import {
  crew,
  roles,
  animations,
  directions,
  variants,
  FRAME,
} from "../src/data";
import { renderCrew } from "../src/render";
import { manifestSchema, type Manifest } from "../src/manifest";
import { canvasFor, loadArt, svgFor } from "./lib";
const art = await loadArt(),
  palette = (await readFile("art-src/palette.hex", "utf8")).trim().split(/\s+/);
for (const dir of [
  "assets/master",
  "assets/gameplay",
  "assets/stills",
  "assets/portraits",
  "review",
])
  await mkdir(dir, { recursive: true });
const manifest: Manifest = {
  version: "1.0.0",
  palette,
  frame: FRAME,
  gameplayFrame: { width: 16, height: 24, origin: { x: 8, y: 22 } },
  directions: [...directions],
  variants: [...variants],
  roles,
  crew,
  animations,
  atlases: [],
};
let frames = 0;
for (const person of crew)
  for (const variant of variants)
    for (const direction of directions) {
      const name = `${person.id}-${variant}-${direction}`,
        master = createCanvas(512, 1056),
        mc = master.getContext("2d"),
        game = createCanvas(128, 264),
        gc = game.getContext("2d");
      gc.imageSmoothingEnabled = false;
      const rows: Manifest["atlases"][number]["rows"] = [];
      for (let a = 0; a < animations.length; a++) {
        const animation = animations[a],
          fps = Number((animation.fps * person.tempo).toFixed(3)),
          row: (typeof rows)[number] = {
            action: animation.id,
            fps,
            loop: animation.loop,
            frames: [],
          };
        for (let f = 0; f < 8; f++) {
          const phase = animation.loop ? f / 8 : f / 7,
            { pixels, pose } = renderCrew(
              person,
              art[person.id],
              animation.id,
              phase,
              direction,
              variant,
            ),
            canvas = canvasFor(pixels);
          mc.drawImage(canvas, f * 64, a * 96);
          gc.drawImage(canvas, 0, 0, 64, 96, f * 16, a * 24, 16, 24);
          const anchor = (p: readonly [number, number]) => ({
            x: Math.round((direction === "sw" || direction === "nw" ? 64 - p[0] : p[0]) * 1000) / 1000,
            y: Math.round(p[1] * 1000) / 1000,
          });
          row.frames.push({
            x: f * 64,
            y: a * 96,
            width: 64,
            height: 96,
            durationMs: Math.round(1000000 / fps) / 1000,
            anchors: {
              handL: anchor(pose.skeleton.handL),
              handR: anchor(pose.skeleton.handR),
              footL: anchor(pose.skeleton.footL),
              footR: anchor(pose.skeleton.footR),
              toolTip: pose.toolTip ? anchor(pose.toolTip) : null,
              tether: anchor([
                pose.skeleton.neck[0] - 7,
                pose.skeleton.neck[1] + 8,
              ]),
            },
            footPlant: pose.footPlant,
          });
          frames++;
          if (a === 0 && f === 0 && direction === "se") {
            await writeFile(
              `assets/stills/${person.id}-${variant}.png`,
              canvas.toBuffer("image/png"),
            );
            await writeFile(
              `assets/stills/${person.id}-${variant}.svg`,
              svgFor(pixels),
            );
          }
        }
        rows.push(row);
      }
      const entry = {
        crew: person.id,
        variant,
        direction,
        master: `master/${name}.png`,
        gameplay: `gameplay/${name}.png`,
        rows,
      };
      manifest.atlases.push(entry);
      await writeFile(`assets/${entry.master}`, master.toBuffer("image/png"));
      await writeFile(`assets/${entry.gameplay}`, game.toBuffer("image/png"));
    }
manifestSchema.parse(manifest);
await writeFile(
  "assets/manifest.json",
  JSON.stringify(manifest) + "\n",
);
console.log(
  `Built ${frames} master frames, ${frames} gameplay frames and 32 stills.`,
);
