import type { Point } from "./pixels";
export function length(a: Point, b: Point) {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}
export function add(a: Point, x = 0, y = 0): [number, number] {
  return [a[0] + x, a[1] + y];
}
export function solveChain(
  root: Point,
  target: Point,
  upper: number,
  lower: number,
  bend: number,
) {
  const raw = length(root, target),
    d = Math.max(
      Math.abs(upper - lower) + 0.001,
      Math.min(upper + lower - 0.001, raw),
    );
  const a = Math.atan2(target[1] - root[1], target[0] - root[0]);
  const b =
    a +
    bend *
      Math.acos(
        Math.max(
          -1,
          Math.min(
            1,
            (upper * upper + d * d - lower * lower) / (2 * upper * d),
          ),
        ),
      );
  return {
    joint: [root[0] + Math.cos(b) * upper, root[1] + Math.sin(b) * upper] as [
      number,
      number,
    ],
    end: [root[0] + Math.cos(a) * d, root[1] + Math.sin(a) * d] as [
      number,
      number,
    ],
  };
}
