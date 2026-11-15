export type V3 = readonly [number, number, number];
export const add = (a: V3, b: V3): V3 => [
  a[0] + b[0],
  a[1] + b[1],
  a[2] + b[2],
];
export const sub = (a: V3, b: V3): V3 => [
  a[0] - b[0],
  a[1] - b[1],
  a[2] - b[2],
];
export const mul = (a: V3, n: number): V3 => [a[0] * n, a[1] * n, a[2] * n];
export const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a: V3, b: V3): V3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
export const length = (v: V3) => Math.hypot(...v);
export const norm = (v: V3): V3 => mul(v, 1 / Math.max(0.000001, length(v)));
export const mix = (a: V3, b: V3, t: number): V3 =>
  add(mul(a, 1 - t), mul(b, t));
export const clamp = (x: number, a: number, b: number) =>
  Math.max(a, Math.min(b, x));
export const rotate = (p: V3, yaw: number): V3 => [
  p[0] * Math.cos(yaw) - p[1] * Math.sin(yaw),
  p[0] * Math.sin(yaw) + p[1] * Math.cos(yaw),
  p[2],
];
/** Two-segment IK in the plane established by the anatomical pole. */
export function solve(
  root: V3,
  target: V3,
  upper: number,
  lower: number,
  pole: V3,
) {
  const raw = sub(target, root),
    distance = clamp(
      length(raw),
      Math.abs(upper - lower) + 0.00001,
      upper + lower - 0.00001,
    ),
    axis = norm(raw),
    perp = norm(sub(pole, mul(axis, dot(pole, axis)))),
    along =
      (upper * upper - lower * lower + distance * distance) / (2 * distance),
    height = Math.sqrt(Math.max(0, upper * upper - along * along));
  return {
    joint: add(add(root, mul(axis, along)), mul(perp, height)),
    end: add(root, mul(axis, distance)),
  };
}
