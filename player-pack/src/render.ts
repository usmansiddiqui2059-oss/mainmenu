import headSprites from "../art-src/head-sprites.json";
import paletteText from "../content/palette.json";
import { Raster, color, type Surface } from "./raster";
import {
  yawFor,
  suit,
  type Player,
  type Variant,
  type Direction,
  type Action,
} from "./data";
import { createPose } from "./pose";
import { add, sub, mul, mix, dot, clamp, norm, cross, type V3 } from "./math";
export const TAG = { eye: 1, skin: 2, hair: 3, visor: 4, backpack: 5, sole: 6 };
export function renderPlayer(
  player: Player,
  variant: Variant,
  direction: Direction,
  action: Action,
  phase: number,
) {
  const pose = createPose(player, action, phase),
    r = new Raster(yawFor(direction)),
    s = player.modelScale;
  const mat = (key: string, tag = 0): Surface => ({
    ramp: suit.materials[key].map(color),
    tag,
  });
  const navy = mat("navy"),
    ivory = mat("ivory"),
    copper = mat("copper"),
    rubber = mat("rubber"),
    metal = mat("metal");
  const delta = (x: number, y: number, z: number): V3 => [x * s, y * s, z * s],
    ell = (c: V3, rx: number, ry: number, rz: number, m: Surface) =>
      r.ellipsoid(c, delta(rx, ry, rz), m),
    box = (c: V3, x: number, y: number, z: number, m: Surface) =>
      r.box(c, delta(x, y, z), m);
  // Complete solid limb volumes, with dedicated cuffs and joint housings.
  for (let i = 0; i < 2; i++) {
    const leg = pose.legs[i],
      foot = pose.feet[i];
    r.bone(leg.root, leg.joint, 4.3 * s, 3.65 * s, navy);
    const axis = norm(sub(leg.root, leg.joint)),
      right: V3 = [1, 0, 0],
      front = norm(cross(right, axis)),
      pocket = add(mix(leg.root, leg.joint, 0.56), mul(front, 3.6 * s));
    r.orientedBox(pocket, right, front, axis, delta(2.7, 0.65, 3.6), rubber);
    r.orientedBox(
      add(pocket, mul(front, 0.6 * s)),
      right,
      front,
      axis,
      delta(2.3, 0.3, 3),
      navy,
    );
    r.orientedBox(
      add(add(pocket, mul(front, 0.85 * s)), mul(axis, 2.5 * s)),
      right,
      front,
      axis,
      delta(2.2, 0.1, 0.35),
      metal,
    );
    ell(leg.joint, 4, 3.8, 3.2, rubber);
    r.bone(leg.joint, leg.end, 3.5 * s, 2.8 * s, (p) => {
      const axis = sub(leg.end, leg.joint),
        t = clamp(dot(sub(p, leg.joint), axis) / dot(axis, axis), 0, 1),
        center = mix(leg.joint, leg.end, t);
      return p[1] < center[1] - 0.1 * s
        ? Math.abs(p[0] - center[0]) > 2.7 * s
          ? metal
          : ivory
        : navy;
    });
    for (const t of [0.1, 0.2, 0.3]) {
      const a = mix(leg.joint, leg.end, t),
        b = mix(leg.joint, leg.end, t + 0.045);
      r.bone(a, b, 3.7 * s, 3.6 * s, ivory, 12);
    }
    const g = foot.ground;
    box(add(g, delta(0, -1.5, 0.65)), 3.15, 4.8, 0.65, {
      ...rubber,
      tag: TAG.sole,
    });
    box(add(g, delta(0, -1.7, 2.5)), 3, 4.6, 1.4, rubber);
    box(add(g, delta(0, 0.1, 4.7)), 2.5, 2.5, 2.5, navy);
    box(add(g, delta(0, -5.65, 2.8)), 2, 0.55, 0.65, ivory);
    for (const z of [4, 5.2, 6.4])
      box(add(g, delta(0, -2.55, z)), 2.25, 0.25, 0.22, metal);
  }
  ell(pose.hip, player.hipHalfWidth + 1.1, 5.1, 5.7, navy);
  r.ellipsoid(
    pose.chest,
    delta(player.shoulderHalfWidth - 0.7, 0.1 * pose.breath + 5.5, 12.5),
    (p) => {
      const z = (p[2] - pose.chest[2]) / s,
        x = Math.abs((p[0] - pose.chest[0]) / s),
        front = p[1] < pose.chest[1] + 0.4 * s,
        chevron = -2 + x * 0.58;
      if (front && z > chevron - 1.25 && z < chevron + 1.25)
        return Math.abs(z - chevron) > 1.02 ? metal : copper;
      if (front && z >= chevron + 1.25) return ivory;
      return navy;
    },
  );
  box(add(pose.chest, delta(0, -5.3, 5.5)), 0.35, 0.4, 3.1, metal);
  // Compact pack, with proper depth, rear fittings and a player-only copper spine.
  const pack = add(pose.chest, delta(0, 6.8, -1));
  box(pack, 6.3, 3, 10.1, { ...ivory, tag: TAG.backpack });
  box(add(pack, delta(0, 3.15, 0)), 1.75, 0.35, 9.5, rubber);
  box(add(pack, delta(0, 3.55, 0)), 1.3, 0.15, 9.2, copper);
  for (const side of [-1, 1])
    for (const z of [-7.6, 7.6])
      box(add(pack, delta(side * 4.7, 3.2, z)), 0.4, 0.3, 0.4, metal);
  for (const side of [-1, 1]) {
    box(add(pack, delta(side * 4.6, 3.2, 0)), 0.7, 0.35, 5.4, metal);
    box(add(pack, delta(side * 4.6, 3.6, 4.2)), 0.8, 0.3, 0.65, rubber);
    box(add(pose.chest, delta(side * 6.2, -4.8, -8.7)), 0.7, 0.65, 3.4, metal);
  }
  box(add(pose.hip, delta(0, -0.1, 2.3)), 8.8, 5.35, 1.2, rubber);
  box(add(pose.hip, delta(0, -5.65, 2.3)), 1.6, 0.5, 1.35, metal);
  for (let i = 0; i < 2; i++) {
    const arm = pose.arms[i];
    ell(arm.root, 3.9, 3.8, 3.5, ivory);
    r.bone(arm.root, arm.joint, 3.3 * s, 2.8 * s, navy);
    ell(arm.joint, 2.9, 2.9, 2.6, rubber);
    for (const t of [0, 0.12, 0.24])
      r.bone(
        mix(arm.joint, arm.end, t),
        mix(arm.joint, arm.end, t + 0.065),
        3.05 * s,
        3.05 * s,
        ivory,
      );
    r.bone(mix(arm.joint, arm.end, 0.32), arm.end, 2.8 * s, 2.35 * s, ivory);
    ell(arm.end, 2.4, 2.1, 3.1, rubber);
    ell(
      add(arm.end, delta(i === 0 ? 1.6 : -1.6, -1.4, -0.25)),
      1.1,
      1.25,
      1.8,
      rubber,
    );
    if (i === 0)
      r.bone(
        mix(arm.root, arm.joint, 0.12),
        mix(arm.root, arm.joint, 0.26),
        3.4 * s,
        3.3 * s,
        copper,
      );
  }
  const collar = add(pose.neck, delta(0, 0, -0.4));
  ell(collar, 5.5, 4.8, 2.1, rubber);
  ell(add(collar, delta(0, 0, 0.8)), 5.1, 4.5, 1.1, ivory);
  if (variant === "eva") {
    r.ellipsoid(pose.head, delta(8, 7.3, 9.5), (p) => {
      const local = sub(p, pose.head),
        x = local[0] / s,
        y = local[1] / s,
        z = local[2] / s;
      if (y < -2.5 && z > -4 && z < 5.1 && Math.abs(x) < 6.7)
        return mat("visor", TAG.visor);
      if (Math.abs(x) < 1.2 && z > 5.7) return copper;
      return ivory;
    });
    for (const side of [-1, 1])
      ell(add(pose.head, delta(side * 7.3, 0, -1)), 1.3, 2.8, 3, metal);
  }
  const pixels = r.finish();
  if (variant === "cabin") {
    const head = headSprites[player.id][direction],
      anchor = importProjection(pose.neck, yawFor(direction));
    for (let y = 0; y < head.height; y++)
      for (let x = 0; x < head.width; x++) {
        const i = y * head.width + x,
          index = head.data[i];
        if (index < 0) continue;
        const xx = Math.round(anchor.x + (x - head.anchor.x) * s),
          yy = Math.round(anchor.y + (y - head.anchor.y) * s);
        pixels.pixel(xx, yy, color(paletteText[index]));
        if (xx >= 0 && xx < 128 && yy >= 0 && yy < 192)
          r.tags[yy * 128 + xx] = head.tags[i];
        r.bounds.minX = Math.min(r.bounds.minX, xx);
        r.bounds.maxX = Math.max(r.bounds.maxX, xx);
        r.bounds.minY = Math.min(r.bounds.minY, yy);
        r.bounds.maxY = Math.max(r.bounds.maxY, yy);
      }
  }
  return {
    pixels,
    pose,
    tags: r.tags,
    bounds: r.bounds,
    project: (p: V3) => {
      const q = importProjection(p, yawFor(direction));
      return { x: q.x, y: q.y };
    },
  };
}
import { project as importProjection } from "./raster";
