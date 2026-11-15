import { Pixels, type Point } from "./pixels";
import { neutralRigs, type Crew, type Skeleton } from "./data";
import { read, type Texture } from "./textures";
export type Part = "body" | "armL" | "armR" | "legL" | "legR";
function transform(p: Point, a: Point, b: Point, c: Point, d: Point): Point {
  const theta =
      Math.atan2(d[1] - c[1], d[0] - c[0]) -
      Math.atan2(b[1] - a[1], b[0] - a[0]),
    co = Math.cos(theta),
    si = Math.sin(theta),
    x = p[0] - a[0],
    y = p[1] - a[1];
  return [c[0] + co * x - si * y, c[1] + si * x + co * y];
}
export function skin(
  p: Pixels,
  texture: Texture,
  person: Crew,
  j: Skeleton,
  part: Part,
  headTop: number,
) {
  const n = neutralRigs[person.id];
  for (let y = headTop; y < 90; y++)
    for (let x = 10; x < 55; x++) {
      const color = read(texture, x, y);
      if (!color) continue;
      const actual: Part =
        y > n.shoulderL[1] - 4 && y < n.hip[1] + 13 && x < n.hip[0] - 9
          ? "armL"
          : y > n.shoulderR[1] - 4 && y < n.hip[1] + 13 && x > n.hip[0] + 10
            ? "armR"
            : y > n.hip[1] + 3
              ? x < n.hip[0]
                ? "legL"
                : "legR"
              : "body";
      if (actual !== part) continue;
      let target: Point;
      if (part === "body") {
        const u = Math.max(
          0,
          Math.min(1, (y - n.neck[1]) / (n.hip[1] - n.neck[1])),
        );
        target = [
          x + (j.neck[0] - n.neck[0]) * (1 - u) + (j.hip[0] - n.hip[0]) * u,
          y + (j.neck[1] - n.neck[1]) * (1 - u) + (j.hip[1] - n.hip[1]) * u,
        ];
      } else {
        const left = part.endsWith("L"),
          leg = part.startsWith("leg"),
          root: Point = leg
            ? [n.hip[0] + (left ? -5 : 5), n.hip[1]]
            : left
              ? n.shoulderL
              : n.shoulderR,
          joint = leg ? (left ? n.kneeL : n.kneeR) : left ? n.elbowL : n.elbowR,
          end = leg ? (left ? n.footL : n.footR) : left ? n.handL : n.handR,
          newRoot: Point = leg
            ? [j.hip[0] + (left ? -5 : 5), j.hip[1]]
            : left
              ? j.shoulderL
              : j.shoulderR,
          newJoint = leg
            ? left
              ? j.kneeL
              : j.kneeR
            : left
              ? j.elbowL
              : j.elbowR,
          newEnd = leg ? (left ? j.footL : j.footR) : left ? j.handL : j.handR;
        const a = transform([x, y], root, joint, newRoot, newJoint),
          b = transform([x, y], joint, end, newJoint, newEnd),
          u = Math.max(0, Math.min(1, (y - joint[1] + 3) / 6));
        target = [a[0] * (1 - u) + b[0] * u, a[1] * (1 - u) + b[1] * u];
      }
      p.pixel(target[0], target[1], color);
    }
}
