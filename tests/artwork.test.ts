// @vitest-environment node
import { expect, it } from "vitest";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { Pixels } from "../src/controlroom/pixels";
import { animateScene } from "../src/controlroom/scenes/animate";
import { drawAstronaut } from "../src/controlroom/rig/astronaut";
import type { SceneId } from "../src/schemas/menu";
const paths = {
  launch: "title",
  orbit: "crew-cabin",
  mars: "mars-surface",
  workshop: "maintenance-bay",
  event: "event-observatory",
};
function pixelSvg(p: Pixels) {
  const runs: string[] = [];
  for (let y = 0; y < p.height; y++) {
    let x = 0;
    while (x < p.width) {
      const i = (y * p.width + x) * 4;
      if (!p.data[i + 3]) {
        x++;
        continue;
      }
      const rgb = [p.data[i], p.data[i + 1], p.data[i + 2]],
        start = x;
      while (x < p.width) {
        const j = (y * p.width + x) * 4;
        if (
          p.data[j] !== rgb[0] ||
          p.data[j + 1] !== rgb[1] ||
          p.data[j + 2] !== rgb[2] ||
          p.data[j + 3] !== 255
        )
          break;
        x++;
      }
      runs.push(
        `<rect x="${start}" y="${y}" width="${x - start}" height="1" fill="#${rgb.map((v) => v.toString(16).padStart(2, "0")).join("")}"/>`,
      );
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${p.width}" height="${p.height}" viewBox="0 0 ${p.width} ${p.height}" shape-rendering="crispEdges">${runs.join("")}</svg>`;
}
it("renders all five scenes on the same opaque 48-color pixel grid and exports review frames", async () => {
  const dir = process.env.MC_ARTIFACT_DIR ?? "work/artwork";
  await mkdir(dir, { recursive: true });
  const palette = new Set(
    (await readFile("art-src/palette.hex", "utf8"))
      .trim()
      .split(/\s+/)
      .map((s) => parseInt(s, 16)),
  );
  const sheet = createCanvas(1440, 810),
    sheetCtx = sheet.getContext("2d");
  sheetCtx.imageSmoothingEnabled = false;
  let index = 0;
  for (const [name, path] of Object.entries(paths)) {
    const image = await loadImage(`public/assets/backgrounds/${path}.png`);
    expect(image.width).toBe(480);
    expect(image.height).toBe(270);
    const canvas = createCanvas(480, 270),
      ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0);
    const layer = createCanvas(480, 270),
      lc = layer.getContext("2d"),
      pixels = new Pixels(480, 270);
    animateScene(pixels, name as SceneId, 3);
    pixels.flush(lc as unknown as CanvasRenderingContext2D);
    ctx.drawImage(layer, 0, 0);
    const data = ctx.getImageData(0, 0, 480, 270).data;
    let opaque = true,
      validPalette = true;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] !== 255) opaque = false;
      if (!palette.has((data[i] << 16) | (data[i + 1] << 8) | data[i + 2]))
        validPalette = false;
    }
    expect(opaque).toBe(true);
    expect(validPalette).toBe(true);
    await writeFile(`${dir}/${name}.png`, canvas.toBuffer("image/png"));
    sheetCtx.drawImage(canvas, (index % 3) * 480, Math.floor(index / 3) * 270);
    index++;
  }
  const frame = createCanvas(480, 270),
    fc = frame.getContext("2d"),
    layer = createCanvas(480, 270),
    lc = layer.getContext("2d"),
    p = new Pixels(480, 270);
  fc.drawImage(await loadImage("public/assets/backgrounds/title.png"), 0, 0);
  animateScene(p, "launch", 12);
  p.flush(lc as unknown as CanvasRenderingContext2D);
  fc.drawImage(layer, 0, 0);
  sheetCtx.drawImage(frame, 960, 270);
  sheetCtx.fillStyle = "#030508";
  sheetCtx.fillRect(0, 540, 1440, 270);
  sheetCtx.fillStyle = "#bdc8ce";
  sheetCtx.font = "18px sans-serif";
  sheetCtx.fillText("MISSION CONTROL / V2 ART REVIEW", 35, 595);
  sheetCtx.font = "13px monospace";
  sheetCtx.fillText(
    "Night launch · crew cabin · Mars · maintenance · orbital exhibit · launch ignition",
    35,
    630,
  );
  sheetCtx.fillText(
    "480 × 270 native · shared 48-color palette · articulated pressure-suit rig",
    35,
    660,
  );
  await writeFile(`${dir}/scene-artwork-v2.png`, sheet.toBuffer("image/png"));
  const rigSheet = createCanvas(528, 88),
    rigCtx = rigSheet.getContext("2d");
  rigCtx.imageSmoothingEnabled = false;
  rigCtx.fillStyle = "#030508";
  rigCtx.fillRect(0, 0, 528, 88);
  for (const [pose, k] of [
    ["float", 0],
    ["repair", 1],
    ["rest", 2],
  ] as const)
    for (let j = 0; j < 2; j++) {
      const rig = new Pixels(88, 88);
      drawAstronaut(rig, 44, pose === "repair" ? 72 : 76, j * 2, pose);
      const canvas = createCanvas(88, 88),
        ctx = canvas.getContext("2d");
      rig.flush(ctx as unknown as CanvasRenderingContext2D);
      rigCtx.drawImage(canvas, (k * 2 + j) * 88, 0);
      expect(
        Array.from(rig.data)
          .filter((_, i) => i % 4 === 3)
          .every((alpha) => alpha === 0 || alpha === 255),
      ).toBe(true);
      if (process.env.MC_WRITE_ASSETS === "1") {
        await mkdir("public/assets/sprites", { recursive: true });
        await writeFile(
          `public/assets/sprites/menu-suit-${pose}-${j + 1}.svg`,
          pixelSvg(rig),
        );
      }
    }
  await writeFile(`${dir}/suit-rig-review.png`, rigSheet.toBuffer("image/png"));
}, 30000);
