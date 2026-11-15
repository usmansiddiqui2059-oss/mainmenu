import { Pixels, suit as s, type Point, type Color } from "./pixels";
import {
  crew,
  roles,
  neutralRigs,
  FRAME,
  type Crew,
  type Action,
  type Direction,
  type Variant,
} from "./data";
import { createPose, type Pose } from "./pose";
import { skin } from "./skin";
import { add } from "./kinematics";
import { read, type Texture } from "./textures";
export interface Art {
  texture: Texture;
  head: { x: number; y: number; width: number; height: number };
}
const hex = (value: string): Color => [
  parseInt(value.slice(0, 2), 16),
  parseInt(value.slice(2, 4), 16),
  parseInt(value.slice(4, 6), 16),
];
function capsule(p: Pixels, a: Point, b: Point, r: number, color: Color) {
  const dx = b[0] - a[0],
    dy = b[1] - a[1],
    d = dx * dx + dy * dy;
  for (
    let y = Math.floor(Math.min(a[1], b[1]) - r);
    y <= Math.ceil(Math.max(a[1], b[1]) + r);
    y++
  )
    for (
      let x = Math.floor(Math.min(a[0], b[0]) - r);
      x <= Math.ceil(Math.max(a[0], b[0]) + r);
      x++
    ) {
      const u = d
        ? Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / d))
        : 0;
      if (Math.hypot(x - a[0] - u * dx, y - a[1] - u * dy) <= r)
        p.pixel(x, y, color);
    }
}
function limb(p: Pixels, a: Point, b: Point, r: number) {
  capsule(p, a, b, r + 1, s.outline);
  capsule(p, a, b, r, s.mid);
  capsule(p, add(a, -1, -1), add(b, -1, -1), Math.max(1, r - 1), s.light);
}
function glove(p: Pixels, a: Point, open = false) {
  p.ellipse(a[0], a[1], 3, 3, s.outline);
  p.ellipse(a[0] - 1, a[1] - 1, 2, 2, s.mid);
  p.pixel(a[0] - 1, a[1] - 2, s.white);
  if (open) p.line(add(a, 2, -3), add(a, 2, -6), s.light, 2);
}
function helmet(
  p: Pixels,
  head: Point,
  rear: boolean,
  accent: Color,
  person: Crew,
) {
  const [x, y] = head;
  p.ellipse(x, y, 12, 13, s.outline);
  p.ellipse(x - 1, y - 1, 10, 11, s.mid);
  p.ellipse(x - 2, y - 2, 9, 10, s.white);
  if (rear) {
    p.line([x + 2, y - 8], [x + 6, y - 3], s.mid);
    p.rect(x + 7, y - 2, 3, 4, s.shadow);
    p.poly(
      [
        [x - 10, y - 7],
        [x - 6, y - 9],
        [x - 8, y - 1],
        [x - 6, y + 4],
        [x - 10, y + 2],
      ],
      s.visor,
    );
  } else {
    p.poly(
      [
        [x - 8, y - 7],
        [x + 5, y - 8],
        [x + 9, y - 3],
        [x + 9, y + 5],
        [x + 4, y + 8],
        [x - 6, y + 6],
        [x - 10, y],
      ],
      s.shadow,
    );
    p.poly(
      [
        [x - 6, y - 6],
        [x + 4, y - 6],
        [x + 7, y - 2],
        [x + 7, y + 3],
        [x + 3, y + 5],
        [x - 5, y + 4],
        [x - 8, y],
      ],
      s.visor,
    );
    p.line([x - 5, y - 5], [x + 2, y - 5], s.reflect, 2);
    p.line([x + 3, y - 4], [x + 5, y - 1], s.reflect);
  }
  p.rect(x - 8, y + 10, 17, 2, s.shadow);
  p.rect(x - 7, y + 11, 15, 2, s.mid);
  p.rect(x - 3, y - 12, 6, 1, accent);
  const mark = crew.findIndex((c) => c.id === person.id);
  for (let i = 0; i < 1 + (mark % 4); i++)
    p.pixel(x + 7, y - 7 + i * 2, accent);
}
function bareHead(
  p: Pixels,
  art: Art,
  person: Crew,
  pose: Pose,
  rear: boolean,
) {
  const h = art.head,
    dx = Math.round(pose.headOffset[0]),
    dy = Math.round(pose.headOffset[1]);
  for (let y = 0; y < h.height; y++)
    for (let x = 0; x < h.width; x++) {
      const color = read(art.texture, h.x + x, h.y + y);
      if (!color) continue;
      let out = color;
      if (rear && y < h.height * 0.82) {
        const skin = color[0] > color[2] * 1.08 && color[0] > 35;
        if (skin) {
          if (person.id === "omar")
            out = y < h.height * 0.55 ? s.mid : hex("a87d60");
          else if (person.id === "kofi")
            out = y < h.height * 0.3 ? hex("241a16") : hex("563324");
          else if (person.id === "zara")
            out = y < h.height * 0.75 ? hex("593c35") : hex("9e6849");
          else out = y < h.height * 0.73 ? hex("181a20") : hex("9e6849");
        }
      }
      p.pixel(h.x + x + dx, h.y + y + dy, out);
    }
  if (!rear) {
    const eyeY = h.y + Math.round(h.height * 0.46) + dy,
      eyeX = h.x + Math.round(h.width * 0.59) + dx;
    if (pose.blink) {
      const skin = read(art.texture, eyeX, eyeY + 2) ?? hex("c38b62");
      p.rect(eyeX, eyeY, 2, 1, skin);
      p.rect(eyeX + 5, eyeY, 1, 1, skin);
    }
    if (pose.expression !== "neutral") {
      const y = eyeY + 6;
      p.line(
        [eyeX, y],
        [eyeX + 4, y + (pose.expression === "happy" ? -1 : 1)],
        hex("593c35"),
      );
    }
  }
  if (rear && person.id === "zara") {
    const x = h.x + 4 + dx,
      y = h.y + h.height - 5 + dy;
    p.line([x, y], [x - 2, y + 9], hex("593c35"), 3);
    for (let i = 0; i < 4; i++) p.pixel(x - 1, y + i * 2, hex("94614a"));
  }
}
function torso(p: Pixels, art: Art, person: Crew, pose: Pose, rear: boolean) {
  const j = pose.skeleton,
    n = neutralRigs[person.id],
    hx = j.hip[0],
    hy = j.hip[1],
    nx = j.neck[0],
    ny = j.neck[1];
  p.poly(
    [
      [j.shoulderL[0] - 3, j.shoulderL[1] - 3],
      [j.shoulderR[0] + 3, j.shoulderR[1] - 2],
      [hx + 11, hy + 4],
      [hx - 10, hy + 3],
    ],
    s.outline,
  );
  p.poly(
    [
      [j.shoulderL[0] - 1, j.shoulderL[1] - 2],
      [j.shoulderR[0] + 1, j.shoulderR[1]],
      [hx + 9, hy + 2],
      [hx - 8, hy + 1],
    ],
    s.light,
  );
  if (!rear) {
    const left = Math.round(n.hip[0] - 9),
      right = Math.round(n.hip[0] + 10),
      top = Math.round(n.neck[1]),
      bottom = Math.round(n.hip[1] + 4);
    for (let y = top; y < bottom; y++) {
      const u = (y - top) / (bottom - top),
        dx = (j.neck[0] - n.neck[0]) * (1 - u) + (hx - n.hip[0]) * u,
        dy = (j.neck[1] - n.neck[1]) * (1 - u) + (hy - n.hip[1]) * u;
      for (let x = left; x <= right; x++) {
        const c = read(art.texture, x, y);
        if (c) p.pixel(x + dx, y + dy, c);
      }
    }
  } else {
    p.poly(
      [
        [nx - 6, ny + 3],
        [nx + 12, ny + 5],
        [hx + 12, hy - 2],
        [hx - 5, hy + 1],
        [nx - 9, ny + 9],
      ],
      s.shadow,
    );
    p.poly(
      [
        [nx - 5, ny + 4],
        [nx + 9, ny + 6],
        [hx + 9, hy - 3],
        [hx - 4, hy - 1],
        [nx - 7, ny + 9],
      ],
      s.mid,
    );
    p.poly(
      [
        [nx - 4, ny + 5],
        [nx + 8, ny + 7],
        [hx + 5, hy - 1],
        [hx - 3, hy - 2],
      ],
      s.light,
    );
    for (let i = 0; i < 5; i++)
      p.line([nx - 2, ny + 10 + i * 2], [nx + 6, ny + 11 + i * 2], s.mid);
    p.rect(hx + 7, hy - 12, 3, 9, s.white);
    p.line([hx + 10, hy - 6], [hx + 13, hy - 2], s.hose, 2);
  }
  const role = roles[person.role];
  p.line([nx - 7, ny], [nx + 8, ny + 1], s.shadow, 3);
  p.line([nx - 6, ny - 1], [nx + 7, ny], s.white);
  p.rect(nx - 3, ny + 3, 5, 2, hex(role.accent));
  p.line([hx - 8, hy], [hx + 8, hy + 1], s.shadow, 3);
  p.rect(hx - 2, hy, 4, 2, s.mid);
}
function tools(p: Pixels, person: Crew, pose: Pose) {
  const j = pose.skeleton,
    accent = hex(roles[person.role].accent);
  if (pose.tool === "tablet" || pose.tool === "meter") {
    const h = j.handL,
      x = h[0] - 3,
      y = h[1] - 6;
    p.poly(
      [
        [x - 1, y - 1],
        [x + 10, y - 1],
        [x + 12, y + 8],
        [x, y + 9],
      ],
      s.outline,
    );
    p.poly(
      [
        [x, y],
        [x + 8, y],
        [x + 10, y + 6],
        [x + 1, y + 7],
      ],
      s.mid,
    );
    p.rect(x + 2, y + 1, 6, 4, s.visor);
    p.line([x + 3, y + 2], [x + 6, y + 2], accent);
    if (pose.tool === "meter") {
      p.rect(x + 3, y + 6, 3, 2, s.gold);
      const tip = pose.toolTip ?? j.handR;
      p.line([x + 9, y + 6], [j.hip[0] + 4, j.hip[1] + 3], s.shadow);
      p.line([j.hip[0] + 4, j.hip[1] + 3], j.handR, s.shadow);
      p.line(j.handR, tip, s.mid, 2);
    }
  } else if (pose.tool === "sample") {
    const h = j.handR;
    p.rect(h[0] - 2, h[1] - 8, 5, 8, s.outline);
    p.rect(h[0] - 1, h[1] - 7, 3, 6, s.mid);
    p.rect(h[0] - 1, h[1] - 8, 3, 2, accent);
    p.rect(h[0], h[1] - 4, 2, 2, hex("94614a"));
  } else if (pose.tool === "driver" && pose.toolTip) {
    p.line(j.handR, pose.toolTip, s.outline, 3);
    p.line(j.handR, pose.toolTip, s.mid);
    p.pixel(pose.toolTip[0], pose.toolTip[1], s.gold);
  }
}
export function renderCrew(
  person: Crew,
  art: Art,
  action: Action,
  phase: number,
  direction: Direction,
  variant: Variant,
) {
  const p = new Pixels(FRAME.width, FRAME.height),
    pose = createPose(person, action, phase, direction),
    j = pose.skeleton,
    n = neutralRigs[person.id],
    rear = direction === "ne" || direction === "nw";
  // Source silhouettes are skinned to the joint chains; neutral proportions remain intact.
  const headEnd = art.head.y + art.head.height;
  if (action !== "idle") {
    for (const [k, f, side] of [
      [j.kneeL, j.footL, -1],
      [j.kneeR, j.footR, 1],
    ] as const) {
      limb(p, add(j.hip, side * 5, 0), k, 3);
      limb(p, k, f, 2.5);
    }
  }
  for (const part of ["legL", "legR"] as const)
    skin(p, art.texture, person, j, part, headEnd);
  if (action !== "idle") {
    limb(p, j.shoulderL, j.elbowL, 2.5);
    limb(p, j.elbowL, j.handL, 2);
  }
  skin(p, art.texture, person, j, "armL", headEnd);
  if (rear) torso(p, art, person, pose, true);
  else skin(p, art.texture, person, j, "body", headEnd);
  if (action !== "idle") {
    limb(p, j.shoulderR, j.elbowR, 2.5);
    limb(p, j.elbowR, j.handR, 2);
  }
  skin(p, art.texture, person, j, "armR", headEnd);
  const accent = hex(roles[person.role].accent);
  p.line(add(j.shoulderL, -1, 2), add(j.shoulderL, 2, 4), accent, 3);
  p.line(add(j.shoulderR, -1, 2), add(j.shoulderR, 2, 4), accent, 2);
  if (variant === "cabin") bareHead(p, art, person, pose, rear);
  else helmet(p, [j.neck[0] + 1, j.neck[1] - 10], rear, accent, person);
  tools(p, person, pose);
  if (
    pose.tool !== "none" ||
    !["idle", "walk", "eva_float", "concern"].includes(action)
  ) {
    glove(p, j.handL);
    glove(
      p,
      j.handR,
      action === "point" || (action === "signature" && person.id === "maya"),
    );
  }
  if (action === "talk" && variant === "cabin" && !rear) {
    const h = art.head;
    p.rect(
      h.x + Math.round(h.width * 0.7) + pose.headOffset[0],
      h.y + Math.round(h.height * 0.75) + pose.headOffset[1],
      2,
      phase > 0.15 && phase < 0.55 ? 2 : 1,
      hex("593c35"),
    );
  }
  if (direction === "sw" || direction === "nw") {
    const mirror = new Pixels(FRAME.width, FRAME.height);
    for (let y = 0; y < FRAME.height; y++)
      for (let x = 0; x < FRAME.width; x++) {
        const i = (y * FRAME.width + x) * 4;
        if (p.data[i + 3])
          mirror.pixel(FRAME.origin.x * 2 - x, y, [
            p.data[i],
            p.data[i + 1],
            p.data[i + 2],
          ]);
      }
    mirror.clipped += p.clipped;
    return { pixels: mirror, pose };
  }
  return { pixels: p, pose };
}
