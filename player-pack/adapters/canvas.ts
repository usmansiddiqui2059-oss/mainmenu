import type { Manifest } from "../src/manifest";
import type { Direction, PlayerId, Variant, Action } from "../src/data";
export interface PlayerFrameOptions {
  player: PlayerId;
  variant: Variant;
  direction: Direction;
  action: Action;
  elapsedMs: number;
  resolution?: "master" | "compact" | "gameplay";
}
/** Pure frame lookup. Keep elapsedMs when changing facing during a walk. */
export function getPlayerFrame(m: Manifest, o: PlayerFrameOptions) {
  if (!Number.isFinite(o.elapsedMs))
    throw new Error("elapsedMs must be finite");
  const sheet = m.sheets.find(
    (s) =>
      s.player === o.player && s.variant === o.variant && s.action === o.action,
  );
  if (!sheet) throw new Error("Unknown player sheet");
  const row = sheet.rows.find((r) => r.direction === o.direction);
  if (!row) throw new Error("Unknown direction");
  const index =
      Math.floor((Math.max(0, o.elapsedMs) * sheet.fps) / 1000) %
      sheet.frameCount,
    f = row.frames[index],
    scale =
      o.resolution === "gameplay"
        ? 0.125
        : o.resolution === "compact"
          ? 0.5
          : 1,
    point = (p: { x: number; y: number }) => ({
      x: p.x * scale,
      y: p.y * scale,
    });
  return {
    path:
      scale === 1
        ? sheet.path
        : scale === 0.5
          ? sheet.compactPath
          : sheet.gameplayPath,
    index,
    rect: {
      x: f.rect.x * scale,
      y: f.rect.y * scale,
      width: f.rect.width * scale,
      height: f.rect.height * scale,
    },
    origin: point(m.frame.origin),
    anchors: {
      footL: point(f.anchors.footL),
      footR: point(f.anchors.footR),
      handL: point(f.anchors.handL),
      handR: point(f.anchors.handR),
      tether: point(f.anchors.tether),
    },
    footPlant: f.footPlant,
  };
}
export function drawPlayerFrame(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  frame: ReturnType<typeof getPlayerFrame>,
  x: number,
  y: number,
  scale = 1,
) {
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  const r = frame.rect;
  ctx.drawImage(
    image,
    r.x,
    r.y,
    r.width,
    r.height,
    Math.round(x - frame.origin.x * scale),
    Math.round(y - frame.origin.y * scale),
    r.width * scale,
    r.height * scale,
  );
  ctx.restore();
}
const yaw: Record<Direction, number> = {
  S: 0,
  SE: 45,
  E: 90,
  NE: 135,
  N: 180,
  NW: 225,
  W: 270,
  SW: 315,
};
/** World speed is shared by both character choices; output is projected screen units/second. */
export function groundVelocity(m: Manifest, direction: Direction) {
  const a = (yaw[direction] * Math.PI) / 180,
    v = m.movement.worldUnitsPerSecond * m.projection.pixelsPerUnit;
  return { x: Math.sin(a) * v, y: Math.cos(a) * 0.5 * v };
}
/** Screen vector -> deprojected compass sector. Keep the previous facing for zero input. */
export function facingFromScreenVector(
  x: number,
  y: number,
  previous: Direction = "S",
): Direction {
  if (!Number.isFinite(x) || !Number.isFinite(y))
    throw new Error("Input vector must be finite");
  if (x === 0 && y === 0) return previous;
  const sector = Math.round(Math.atan2(x, y * 2) / (Math.PI / 4));
  return (["S", "SE", "E", "NE", "N", "NW", "W", "SW"] as const)[
    (sector + 8) % 8
  ];
}
