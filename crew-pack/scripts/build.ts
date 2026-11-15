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
import { canvasFor, svgFor } from "./lib";
for (const d of [
  "assets/master",
  "assets/detail",
  "assets/gameplay",
  "assets/stills",
  "assets/detail-stills",
  "assets/portraits",
  "review",
])
  await mkdir(d, { recursive: true });
const manifest: Manifest = {
  version: "1.1.0",
  palette: (await readFile("art-src/palette.hex", "utf8")).trim().split(/\s+/),
  frame: FRAME,
  detailFrame: { width: 128, height: 192, origin: { x: 64, y: 176 } },
  gameplayFrame: { width: 16, height: 24, origin: { x: 8, y: 22 } },
  movement: { worldUnitsPerWalkCycle: 11 / 0.6, pixelsPerUnitMaster: 1 },
  directions: [...directions],
  variants: [...variants],
  roles,
  crew,
  animations,
  atlases: [],
};
let total = 0;
for (const person of crew) {
  for (const variant of variants)
    for (const direction of directions) {
      const name = `${person.id}-${variant}-${direction}`,
        master = createCanvas(512, 1056),
        mc = master.getContext("2d"),
        detail = createCanvas(1024, 2112),
        dc = detail.getContext("2d"),
        game = createCanvas(128, 264),
        gc = game.getContext("2d");
      gc.imageSmoothingEnabled = false;
      const rows: Manifest["atlases"][number]["rows"] = [];
      for (let a = 0; a < animations.length; a++) {
        const anim = animations[a],
          fps = Number((anim.fps * person.tempo).toFixed(3)),
          row: (typeof rows)[number] = {
            action: anim.id,
            fps,
            loop: anim.loop,
            frames: [],
          };
        for (let f = 0; f < 8; f++) {
          const phase = anim.loop ? f / 8 : f / 7,
            result = renderCrew(person, anim.id, phase, direction, variant),
            c = canvasFor(result.pixels),
            d = canvasFor(result.detailPixels);
          mc.drawImage(c, f * 64, a * 96);
          dc.drawImage(d, f * 128, a * 192);
          gc.drawImage(c, 0, 0, 64, 96, f * 16, a * 24, 16, 24);
          const anchor = (p: readonly [number, number, number]) => {
            const q = result.project(p);
            return {
              x: Math.round(q.x * 1000) / 1000,
              y: Math.round(q.y * 1000) / 1000,
            };
          };
          row.frames.push({
            x: f * 64,
            y: a * 96,
            width: 64,
            height: 96,
            durationMs: Math.round(1000000 / fps) / 1000,
            anchors: {
              handL: anchor(result.pose.arms[0].end),
              handR: anchor(result.pose.arms[1].end),
              footL: anchor(result.pose.feet[0].ground),
              footR: anchor(result.pose.feet[1].ground),
              toolTip: result.pose.toolTip ? anchor(result.pose.toolTip) : null,
              tether: anchor([
                0,
                (9 * person.heightCm) / 178,
                result.pose.chest[2],
              ]),
            },
            footPlant: [
              result.pose.feet[0].planted,
              result.pose.feet[1].planted,
            ],
          });
          total++;
          if (a === 0 && f === 0) {
            await writeFile(
              `assets/detail-stills/${name}.png`,
              d.toBuffer("image/png"),
            );
            await writeFile(
              `assets/detail-stills/${name}.svg`,
              svgFor(result.detailPixels),
            );
            if (direction === "se") {
              await writeFile(
                `assets/stills/${person.id}-${variant}.png`,
                c.toBuffer("image/png"),
              );
              await writeFile(
                `assets/stills/${person.id}-${variant}.svg`,
                svgFor(result.pixels),
              );
            }
          }
        }
        rows.push(row);
      }
      const entry = {
        crew: person.id,
        variant,
        direction,
        master: `master/${name}.png`,
        detail: `detail/${name}.png`,
        gameplay: `gameplay/${name}.png`,
        rows,
      };
      manifest.atlases.push(entry);
      await writeFile(`assets/${entry.master}`, master.toBuffer("image/png"));
      await writeFile(`assets/${entry.detail}`, detail.toBuffer("image/png"));
      await writeFile(`assets/${entry.gameplay}`, game.toBuffer("image/png"));
    }
  console.log("Exported " + person.name);
}
manifestSchema.parse(manifest);
await writeFile("assets/manifest.json", JSON.stringify(manifest) + "\n");
console.log(`${total} frames at each of three resolutions.`);
