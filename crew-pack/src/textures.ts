import type { Point, Color } from "./pixels";
import { Pixels } from "./pixels";
export interface Texture {
  width: number;
  height: number;
  data: Uint8ClampedArray;
}
export function read(t: Texture, x: number, y: number): Color | null {
  x = Math.round(x);
  y = Math.round(y);
  if (x < 0 || y < 0 || x >= t.width || y >= t.height) return null;
  const i = (y * t.width + x) * 4;
  return t.data[i + 3] ? [t.data[i], t.data[i + 1], t.data[i + 2]] : null;
}
export function blit(
  p: Pixels,
  t: Texture,
  source: { x: number; y: number; width: number; height: number },
  x: number,
  y: number,
  scale = 1,
  mask?: (x: number, y: number) => boolean,
) {
  for (let j = 0; j < source.height; j++)
    for (let i = 0; i < source.width; i++) {
      if (mask && !mask(i, j)) continue;
      const c = read(t, source.x + i, source.y + j);
      if (c) p.rect(x + i * scale, y + j * scale, scale, scale, c);
    }
}
/** Re-sample a source limb in its local bone coordinates. No canvas rotation or partial alpha. */
export function boneTexture(
  p: Pixels,
  t: Texture,
  from: Point,
  to: Point,
  a: Point,
  b: Point,
  radius: number,
) {
  const sourceLength = Math.hypot(to[0] - from[0], to[1] - from[1]),
    length = Math.hypot(b[0] - a[0], b[1] - a[1]);
  if (length < 0.001) return;
  const ux = (b[0] - a[0]) / length,
    uy = (b[1] - a[1]) / length,
    sx = (to[0] - from[0]) / sourceLength,
    sy = (to[1] - from[1]) / sourceLength;
  for (let v = -radius; v <= radius; v++)
    for (let u = 0; u <= length; u++) {
      const c = read(
        t,
        from[0] + (sx * u * sourceLength) / length - sy * v,
        from[1] + (sy * u * sourceLength) / length + sx * v,
      );
      if (c) p.pixel(a[0] + ux * u - uy * v, a[1] + uy * u + ux * v, c);
    }
}
