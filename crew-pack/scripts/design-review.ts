import { createCanvas, loadImage } from "@napi-rs/canvas";
import { readFile, writeFile } from "node:fs/promises";
import { crew } from "../src/data";
import { renderCrew, type Art } from "../src/render";
const anchors = JSON.parse(await readFile("art-src/base-anchors.json", "utf8"));
const sheet = createCanvas(1536, 768),
  sc = sheet.getContext("2d");
sc.imageSmoothingEnabled = false;
sc.fillStyle = "#030508";
sc.fillRect(0, 0, sheet.width, sheet.height);
for (let i = 0; i < crew.length; i++) {
  const image = await loadImage(`art-src/bases/${crew[i].id}.png`),
    source = createCanvas(64, 96),
    x = source.getContext("2d");
  x.drawImage(image, 0, 0);
  const art: Art = {
    texture: { width: 64, height: 96, data: x.getImageData(0, 0, 64, 96).data },
    head: anchors[crew[i].id].head,
  };
  for (const [variant, k] of [
    ["cabin", 0],
    ["eva", 1],
  ] as const) {
    const canvas = createCanvas(64, 96),
      ctx = canvas.getContext("2d");
    renderCrew(crew[i], art, "idle", 0, "se", variant).pixels.flush(
      ctx as unknown as CanvasRenderingContext2D,
    );
    const ox = (i % 4) * 384 + k * 192,
      oy = Math.floor(i / 4) * 384;
    sc.drawImage(canvas, ox, oy, 192, 288);
    sc.fillStyle = "#bdc8ce";
    sc.font = "15px sans-serif";
    if (k === 0) {
      sc.fillText(crew[i].name, ox + 8, oy + 320);
      sc.fillStyle = "#72899e";
      sc.font = "12px monospace";
      sc.fillText(crew[i].role + " / " + crew[i].trait, ox + 8, oy + 342);
    }
  }
}
await writeFile("review/crew-designs.png", sheet.toBuffer("image/png"));
