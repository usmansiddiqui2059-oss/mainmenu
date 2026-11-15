/** Runtime adapter: consumes exported PNGs and metadata; no art-generation dependencies. */
import type { Manifest } from "../src/manifest";
export interface FrameOptions {
  crew: Manifest["crew"][number]["id"];
  action: Manifest["animations"][number]["id"];
  variant: "cabin" | "eva";
  direction: "se" | "sw" | "ne" | "nw";
  elapsedMs: number;
  resolution?: "master" | "detail" | "gameplay";
}
export function getCrewFrame(manifest: Manifest, options: FrameOptions) {
  if (!Number.isFinite(options.elapsedMs))
    throw new Error("elapsedMs must be finite");
  if (options.action.startsWith("eva_") && options.variant !== "eva")
    throw new Error("EVA actions require a sealed EVA suit");
  const atlas = manifest.atlases.find(
    (a) =>
      a.crew === options.crew &&
      a.variant === options.variant &&
      a.direction === options.direction,
  );
  if (!atlas) throw new Error(`Unknown crew atlas: ${options.crew}`);
  const row = atlas.rows.find((r) => r.action === options.action);
  if (!row) throw new Error(`Unknown animation: ${options.action}`);
  const tick = Math.floor((Math.max(0, options.elapsedMs) * row.fps) / 1000),
    index = row.loop
      ? tick % row.frames.length
      : Math.min(tick, row.frames.length - 1),
    frame = row.frames[index],
    factor =
      options.resolution === "gameplay"
        ? 0.25
        : options.resolution === "detail"
          ? 2
          : 1;
  const point = (p: { x: number; y: number } | null) =>
    p ? { x: p.x * factor, y: p.y * factor } : null;
  return {
    path:
      factor === 1
        ? atlas.master
        : factor === 2
          ? atlas.detail
          : atlas.gameplay,
    index,
    complete: !row.loop && tick >= row.frames.length,
    rect: {
      x: frame.x * factor,
      y: frame.y * factor,
      width: frame.width * factor,
      height: frame.height * factor,
    },
    origin: {
      x: manifest.frame.origin.x * factor,
      y: manifest.frame.origin.y * factor,
    },
    anchors: {
      handL: point(frame.anchors.handL)!,
      handR: point(frame.anchors.handR)!,
      footL: point(frame.anchors.footL)!,
      footR: point(frame.anchors.footR)!,
      toolTip: point(frame.anchors.toolTip),
      tether: point(frame.anchors.tether)!,
    },
    footPlant: frame.footPlant,
  };
}
export function drawCrewFrame(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  frame: ReturnType<typeof getCrewFrame>,
  worldX: number,
  worldY: number,
  scale = 1,
) {
  const r = frame.rect;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    image,
    r.x,
    r.y,
    r.width,
    r.height,
    Math.round(worldX - frame.origin.x * scale),
    Math.round(worldY - frame.origin.y * scale),
    r.width * scale,
    r.height * scale,
  );
  ctx.restore();
}

export function getCrewWalkVelocity(
  manifest: Manifest,
  crew: FrameOptions["crew"],
  direction: FrameOptions["direction"],
  resolution: NonNullable<FrameOptions["resolution"]> = "master",
) {
  const atlas = manifest.atlases.find(
    (a) => a.crew === crew && a.direction === direction,
  );
  if (!atlas) throw new Error("Unknown crew");
  const row = atlas.rows.find((r) => r.action === "walk")!;
  const yaw =
      ({ se: 45, sw: 315, ne: 135, nw: 225 }[direction] * Math.PI) / 180,
    scale = resolution === "detail" ? 2 : resolution === "gameplay" ? 0.25 : 1,
    speed =
      ((manifest.movement.worldUnitsPerWalkCycle * row.fps) /
        row.frames.length) *
      scale;
  return { x: Math.sin(yaw) * speed, y: Math.cos(yaw) * 0.5 * speed };
}
