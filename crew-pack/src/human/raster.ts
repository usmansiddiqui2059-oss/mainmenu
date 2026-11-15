import { Pixels, type Color } from "./pixels";
import { FRAME } from "./data";
import { add, sub, mul, cross, dot, norm, mix, rotate, type V3 } from "./math";
export interface Surface {
  ramp: readonly Color[];
  tag?: number;
  paint?: (p: V3) => { color: Color; tag?: number };
}
export type Material = Surface | ((p: V3) => Surface);
export interface Projected {
  x: number;
  y: number;
  depth: number;
}
export function project(p: V3, yaw: number): Projected {
  const q = rotate(p, yaw);
  return {
    x: FRAME.origin.x + q[0] * 2,
    y: FRAME.origin.y - (q[1] * 0.5 + q[2] * Math.sqrt(0.75)) * 2,
    depth: -q[1] * Math.sqrt(0.75) + q[2] * 0.5,
  };
}
const W = FRAME.width,
  H = FRAME.height;
const light = norm([-0.55, -0.55, 0.8]);
export class Raster {
  readonly pixels = new Pixels(W, H);
  readonly depth = new Float32Array(W * H).fill(-Infinity);
  readonly tags = new Uint8Array(W * H);
  readonly bounds = {
    minX: Infinity,
    minY: Infinity,
    maxX: -Infinity,
    maxY: -Infinity,
  };
  constructor(readonly yaw: number) {}
  triangle(a: V3, b: V3, c: V3, material: Material) {
    const normal = norm(rotate(cross(sub(b, a), sub(c, a)), this.yaw)),
      center = mul(add(add(a, b), c), 1 / 3),
      surface = typeof material === "function" ? material(center) : material;
    const intensity = dot(normal, light),
      level =
        intensity < -0.12 ? 0 : intensity < 0.25 ? 1 : intensity < 0.65 ? 2 : 3,
      color = surface.ramp[Math.min(level, surface.ramp.length - 1)],
      pa = project(a, this.yaw),
      pb = project(b, this.yaw),
      pc = project(c, this.yaw),
      area = (pb.x - pa.x) * (pc.y - pa.y) - (pb.y - pa.y) * (pc.x - pa.x);
    for (const q of [pa, pb, pc]) {
      this.bounds.minX = Math.min(this.bounds.minX, q.x);
      this.bounds.maxX = Math.max(this.bounds.maxX, q.x);
      this.bounds.minY = Math.min(this.bounds.minY, q.y);
      this.bounds.maxY = Math.max(this.bounds.maxY, q.y);
    }
    if (Math.abs(area) < 0.00001) return;
    const minx = Math.max(0, Math.floor(Math.min(pa.x, pb.x, pc.x))),
      maxx = Math.min(W - 1, Math.ceil(Math.max(pa.x, pb.x, pc.x))),
      miny = Math.max(0, Math.floor(Math.min(pa.y, pb.y, pc.y))),
      maxy = Math.min(H - 1, Math.ceil(Math.max(pa.y, pb.y, pc.y)));
    for (let y = miny; y <= maxy; y++)
      for (let x = minx; x <= maxx; x++) {
        const px = x + 0.5,
          py = y + 0.5,
          u = ((pb.x - px) * (pc.y - py) - (pb.y - py) * (pc.x - px)) / area,
          v = ((pc.x - px) * (pa.y - py) - (pc.y - py) * (pa.x - px)) / area,
          w = 1 - u - v;
        if (u < -0.00001 || v < -0.00001 || w < -0.00001) continue;
        const z = pa.depth * u + pb.depth * v + pc.depth * w,
          i = y * W + x;
        if (z > this.depth[i]) {
          this.depth[i] = z;
          const point = add(add(mul(a, u), mul(b, v)), mul(c, w)),
            sample = typeof material === "function" ? material(point) : surface,
            painted = sample.paint?.(point),
            shade = sample.ramp[Math.min(level, sample.ramp.length - 1)];
          this.pixels.pixel(x, y, painted?.color ?? shade);
          this.tags[i] = painted?.tag ?? sample.tag ?? 0;
        }
      }
  }
  quad(a: V3, b: V3, c: V3, d: V3, material: Material) {
    this.triangle(a, b, c, material);
    this.triangle(a, c, d, material);
  }
  ellipsoid(
    center: V3,
    radius: V3,
    material: Material,
    sides = 16,
    rings = 10,
  ) {
    const point = (i: number, j: number): V3 => {
      const lat = -Math.PI / 2 + (i * Math.PI) / rings,
        lon = (j * Math.PI * 2) / sides;
      return add(center, [
        radius[0] * Math.cos(lat) * Math.cos(lon),
        radius[1] * Math.cos(lat) * Math.sin(lon),
        radius[2] * Math.sin(lat),
      ]);
    };
    for (let i = 0; i < rings; i++)
      for (let j = 0; j < sides; j++)
        this.quad(
          point(i, j),
          point(i, j + 1),
          point(i + 1, j + 1),
          point(i + 1, j),
          material,
        );
  }
  box(center: V3, size: V3, material: Material) {
    const p = (x: number, y: number, z: number) =>
      add(center, [size[0] * x, size[1] * y, size[2] * z]);
    this.quad(p(-1, -1, -1), p(1, -1, -1), p(1, -1, 1), p(-1, -1, 1), material);
    this.quad(p(1, 1, -1), p(-1, 1, -1), p(-1, 1, 1), p(1, 1, 1), material);
    this.quad(p(-1, 1, -1), p(-1, -1, -1), p(-1, -1, 1), p(-1, 1, 1), material);
    this.quad(p(1, -1, -1), p(1, 1, -1), p(1, 1, 1), p(1, -1, 1), material);
    this.quad(p(-1, -1, 1), p(1, -1, 1), p(1, 1, 1), p(-1, 1, 1), material);
    this.quad(p(-1, 1, -1), p(1, 1, -1), p(1, -1, -1), p(-1, -1, -1), material);
  }
  orientedBox(
    center: V3,
    right: V3,
    front: V3,
    up: V3,
    size: V3,
    material: Material,
  ) {
    const p = (x: number, y: number, z: number) =>
      add(
        center,
        add(
          add(mul(right, x * size[0]), mul(front, y * size[1])),
          mul(up, z * size[2]),
        ),
      );
    this.quad(p(-1, 1, -1), p(1, 1, -1), p(1, 1, 1), p(-1, 1, 1), material);
    this.quad(p(1, -1, -1), p(-1, -1, -1), p(-1, -1, 1), p(1, -1, 1), material);
    this.quad(p(-1, -1, -1), p(-1, 1, -1), p(-1, 1, 1), p(-1, -1, 1), material);
    this.quad(p(1, 1, -1), p(1, -1, -1), p(1, -1, 1), p(1, 1, 1), material);
    this.quad(p(-1, -1, 1), p(-1, 1, 1), p(1, 1, 1), p(1, -1, 1), material);
    this.quad(p(-1, 1, -1), p(-1, -1, -1), p(1, -1, -1), p(1, 1, -1), material);
  }
  bone(a: V3, b: V3, r0: number, r1: number, material: Material, sides = 12) {
    const axis = norm(sub(b, a)),
      right = norm(
        cross(axis, Math.abs(axis[2]) > 0.9 ? [0, 1, 0] : [0, 0, 1]),
      ),
      front = norm(cross(axis, right)),
      steps = [0, 0.15, 0.5, 0.85, 1],
      fat = [0.85, 1, 0.97, 0.9, 0.78];
    const point = (i: number, j: number): V3 => {
      const t = steps[i],
        angle = (j * Math.PI * 2) / sides,
        radius = (r0 * (1 - t) + r1 * t) * fat[i];
      return add(
        mix(a, b, t),
        add(
          mul(right, Math.cos(angle) * radius),
          mul(front, Math.sin(angle) * radius),
        ),
      );
    };
    for (let i = 0; i < 4; i++)
      for (let j = 0; j < sides; j++)
        this.quad(
          point(i, j),
          point(i, j + 1),
          point(i + 1, j + 1),
          point(i + 1, j),
          material,
        );
    for (let j = 0; j < sides; j++) {
      this.triangle(a, point(0, j + 1), point(0, j), material);
      this.triangle(b, point(4, j), point(4, j + 1), material);
    }
  }
  stamp(p: V3, color: Color, tag: number, width = 1, height = 1) {
    const q = project(p, this.yaw),
      x = Math.round(q.x - 0.5),
      y = Math.round(q.y - 0.5);
    for (let j = 0; j < height * 2; j++)
      for (let k = 0; k < width * 2; k++) {
        const xx = x + k,
          yy = y + j;
        if (xx < 0 || xx >= W || yy < 0 || yy >= H) {
          this.pixels.clipped++;
          continue;
        }
        const i = yy * W + xx;
        if (q.depth + 0.06 >= this.depth[i]) {
          this.depth[i] = q.depth + 0.06;
          this.pixels.pixel(xx, yy, color);
          this.tags[i] = tag;
        }
      }
  }
  finish() {
    const data = this.pixels.data.slice();
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4;
        if (data[i + 3]) continue;
        let edge = false;
        for (const [dx, dy] of [
          [-1, 0],
          [1, 0],
          [0, -1],
          [0, 1],
        ]) {
          const xx = x + dx,
            yy = y + dy;
          if (
            xx >= 0 &&
            xx < W &&
            yy >= 0 &&
            yy < H &&
            data[(yy * W + xx) * 4 + 3]
          )
            edge = true;
        }
        if (edge) this.pixels.pixel(x, y, [7, 11, 18]);
      }
    return this.pixels;
  }
}
export const color = (hex: string): Color => [
  parseInt(hex.slice(0, 2), 16),
  parseInt(hex.slice(2, 4), 16),
  parseInt(hex.slice(4, 6), 16),
];
