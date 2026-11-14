// @vitest-environment node
import { it } from "vitest";
import { createCanvas, loadImage, GlobalFonts } from "@napi-rs/canvas";
import { mkdir, writeFile } from "node:fs/promises";
import { Pixels } from "../src/controlroom/pixels";
import { animateScene } from "../src/controlroom/scenes/animate";
import type { SceneId } from "../src/schemas/menu";
it.skipIf(process.env.MC_REVIEW_EXPORT !== "1")(
  "exports native motion frames and a typography layout study (not a browser screenshot)",
  async () => {
    const dir = process.env.MC_ARTIFACT_DIR ?? "work/artwork";
    await mkdir(`${dir}/frames`, { recursive: true });
    GlobalFonts.registerFromPath(
      "public/assets/fonts/barlow-condensed-latin-500.woff2",
      "Mission Condensed",
    );
    const scenes = ["launch", "orbit", "mars", "workshop"] as const,
      paths = ["title", "crew-cabin", "mars-surface", "maintenance-bay"];
    const plates = await Promise.all(
      paths.map((path) => loadImage(`public/assets/backgrounds/${path}.png`)),
    );
    function render(scene: SceneId, index: number, time: number) {
      const canvas = createCanvas(480, 270),
        ctx = canvas.getContext("2d"),
        overlay = createCanvas(480, 270),
        oc = overlay.getContext("2d"),
        p = new Pixels(480, 270);
      ctx.drawImage(plates[index], 0, 0);
      animateScene(p, scene, time);
      p.flush(oc as unknown as CanvasRenderingContext2D);
      ctx.drawImage(overlay, 0, 0);
      return canvas;
    }
    for (const [scene, index] of [
      ["launch", 0],
      ["orbit", 1],
    ] as const) {
      const canvas = createCanvas(1440, 900),
        ctx = canvas.getContext("2d");
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(render(scene, index, 0), -336, -90, 1920, 1080);
      ctx.fillStyle = "#e8e9e2";
      ctx.font = '500 50.4px "Mission Condensed"';
      ctx.letterSpacing = "11.09px";
      ctx.fillText("MISSION CONTROL", 101, 283);
      ctx.font = '500 19px "Mission Condensed"';
      ctx.letterSpacing = "1.2px";
      const labels = [
        "PLAY GAME",
        "CONTINUE GAME",
        "SANDBOX MODE",
        "SETTINGS",
        "ABOUT THE EVENT",
      ];
      labels.forEach((label, i) => {
        ctx.fillStyle =
          index === 1 && i === 0 ? "#faf4df" : i === 1 ? "#72899e" : "#bdc8ce";
        ctx.fillText(label, 101, 360 + i * 36.6);
      });
      if (index === 1) {
        ctx.strokeStyle = "#faf4df";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(353, 354);
        ctx.lineTo(367, 354);
        ctx.lineTo(362, 349);
        ctx.moveTo(367, 354);
        ctx.lineTo(362, 359);
        ctx.stroke();
      }
      await writeFile(
        `${dir}/Menu-${scene}-Layout-Study.png`,
        canvas.toBuffer("image/png"),
      );
    }
    if (process.env.MC_VIDEO_FRAMES === "1")
      for (let frame = 0; frame < 120; frame++) {
        const canvas = createCanvas(960, 540),
          ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = false;
        for (let i = 0; i < 4; i++)
          ctx.drawImage(
            render(scenes[i], i, frame / 10 + (i === 0 ? 4 : 0)),
            (i % 2) * 480,
            Math.floor(i / 2) * 270,
          );
        await writeFile(
          `${dir}/frames/frame-${String(frame).padStart(3, "0")}.png`,
          canvas.toBuffer("image/png"),
        );
      }
  },
  90000,
);
