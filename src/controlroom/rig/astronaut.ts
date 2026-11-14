import { Pixels, suit as s, type Point, type Color } from "../pixels";
export type SuitPose = "float" | "repair" | "rest";
export interface JointPose {
  hip: Point;
  neck: Point;
  shoulderL: Point;
  shoulderR: Point;
  elbowL: Point;
  elbowR: Point;
  handL: Point;
  handR: Point;
  kneeL: Point;
  kneeR: Point;
  footL: Point;
  footR: Point;
}
const offset = (a: Point, x: number, y: number): Point => [a[0] + x, a[1] + y];
/** All children share the torso motion. Repair hands are constrained to the work surface. */
export function twoBone(
  root: Point,
  target: Point,
  upper: number,
  lower: number,
  bend = 1,
) {
  const dx = target[0] - root[0],
    dy = target[1] - root[1],
    raw = Math.hypot(dx, dy);
  const distance = Math.max(
    Math.abs(upper - lower) + 0.01,
    Math.min(upper + lower - 0.01, raw),
  );
  const angle = Math.atan2(dy, dx),
    jointAngle =
      angle +
      bend *
        Math.acos(
          Math.max(
            -1,
            Math.min(
              1,
              (upper * upper + distance * distance - lower * lower) /
                (2 * upper * distance),
            ),
          ),
        );
  return {
    joint: [
      root[0] + Math.cos(jointAngle) * upper,
      root[1] + Math.sin(jointAngle) * upper,
    ] as Point,
    end: [
      root[0] + Math.cos(angle) * distance,
      root[1] + Math.sin(angle) * distance,
    ] as Point,
  };
}
/** The driver rotates about one seated contact; the wrist follows that short arc. */
export function repairToolTip(j: Pick<JointPose, "hip">): Point {
  return offset(j.hip, -24, -28);
}
function repairGrip(hip: Point, time: number): Point {
  const tip = repairToolTip({ hip }),
    angle = 0.55 + Math.sin(time * 0.85) * 0.08;
  return [tip[0] + Math.sin(angle) * 6, tip[1] + Math.cos(angle) * 6];
}
export function solveSuitPose(
  x: number,
  y: number,
  time: number,
  pose: SuitPose,
): JointPose {
  const breathe = Math.sin(time * 1.25) * 0.55,
    drift = pose === "float" ? Math.sin(time * 0.5) * 2 : 0;
  const hip: Point = [x, y - 22 + drift],
    neck = offset(
      hip,
      pose === "rest" ? 14 : pose === "repair" ? -8 : -3,
      (pose === "repair" ? -24 : -27) + breathe,
    );
  const shoulderL = offset(neck, pose === "repair" ? -7 : -9, 8),
    shoulderR = offset(neck, pose === "repair" ? 6 : 10, 9);
  const work = Math.sin(time * 0.85);
  const handTargetL: Point =
    pose === "repair"
      ? offset(hip, -21, -8)
      : pose === "rest"
        ? offset(hip, -2, -7)
        : offset(hip, -23, -25 + work * 2);
  const handTargetR: Point =
    pose === "repair"
      ? repairGrip(hip, time)
      : pose === "rest"
        ? offset(hip, 6, 0)
        : offset(hip, 23, -17 - work * 2);
  const armL = twoBone(shoulderL, handTargetL, 11, 12, 1),
    armR = twoBone(shoulderR, handTargetR, 11, 12, -1);
  const targetL =
    pose === "rest"
      ? offset(hip, -30, 17)
      : pose === "repair"
        ? offset(hip, -6, 30)
        : offset(hip, -12, pose === "float" ? 20 : 24);
  const targetR =
    pose === "rest"
      ? offset(hip, -25, 11)
      : pose === "repair"
        ? offset(hip, 8, 29)
        : offset(hip, pose === "float" ? 21 : 13, pose === "float" ? 13 : 24);
  const legL = twoBone(offset(hip, -5, 0), targetL, 16, 16, 1),
    legR = twoBone(offset(hip, 5, 0), targetR, 16, 16, -1);
  return {
    hip,
    neck,
    shoulderL,
    shoulderR,
    elbowL: armL.joint,
    elbowR: armR.joint,
    handL: armL.end,
    handR: armR.end,
    kneeL: legL.joint,
    kneeR: legR.joint,
    footL: legL.end,
    footR: legR.end,
  };
}
function limb(p: Pixels, a: Point, b: Point, width: number) {
  p.line(a, b, s.outline, width + 2);
  p.line(a, b, s.mid, width);
  const direction: Point = [b[0] - a[0], b[1] - a[1]];
  p.line(
    [a[0] - 1, a[1] - 1],
    [b[0] - 1, b[1] - 1],
    s.light,
    Math.max(2, width - 3),
  );
  for (const u of [0.3, 0.45, 0.6]) {
    const x = a[0] + direction[0] * u,
      y = a[1] + direction[1] * u;
    p.line([x - width * 0.25, y], [x + width * 0.3, y + 1], s.shadow);
  }
}
function hose(p: Pixels, points: Point[]) {
  for (let i = 1; i < points.length; i++) {
    p.line(points[i - 1], points[i], s.outline, 4);
    p.line(points[i - 1], points[i], s.hose, 2);
  }
  for (const [x, y] of points) p.pixel(x, y, s.shadow);
}
/** Rear three-quarter construction: the helmet and backpack face the viewer, hands face the board. */
function drawRepairBack(p: Pixels, j: JointPose) {
  const [hx, hy] = j.hip,
    [nx, ny] = j.neck;
  p.ellipse(hx + 2, hy + 35, 20, 3, s.outline);
  for (const [side, knee, foot] of [
    [-1, j.kneeL, j.footL],
    [1, j.kneeR, j.footR],
  ] as const) {
    limb(p, [hx + side * 5, hy], knee, 9);
    p.ellipse(knee[0], knee[1], 4, 4, s.joint);
    limb(p, knee, foot, 8);
    p.poly(
      [
        [foot[0] - 6, foot[1] - 2],
        [foot[0] + 4, foot[1] - 2],
        [foot[0] + 6, foot[1] + 4],
        [foot[0] + 4, foot[1] + 6],
        [foot[0] - 7, foot[1] + 6],
      ],
      s.outline,
    );
    p.rect(foot[0] - 5, foot[1] - 1, 9, 5, s.mid);
    p.rect(foot[0] - 5, foot[1] - 1, 7, 2, s.light);
    p.rect(foot[0] - 6, foot[1] + 4, 11, 2, s.shadow);
  }
  // Far arm braces the work surface; the near arm is drawn last over the shoulder.
  limb(p, j.shoulderL, j.elbowL, 8);
  p.ellipse(j.elbowL[0], j.elbowL[1], 4, 4, s.joint);
  limb(p, j.elbowL, j.handL, 7);
  p.ellipse(j.handL[0], j.handL[1], 4, 3, s.shadow);
  p.ellipse(j.handL[0], j.handL[1] - 1, 3, 2, s.light);
  p.poly(
    [
      [nx - 9, ny + 5],
      [nx + 10, ny + 5],
      [hx + 12, hy - 5],
      [hx + 8, hy + 3],
      [hx - 9, hy + 2],
      [nx - 11, ny + 14],
    ],
    s.outline,
  );
  p.poly(
    [
      [nx - 8, ny + 6],
      [nx + 8, ny + 6],
      [hx + 10, hy - 5],
      [hx + 6, hy + 2],
      [hx - 7, hy],
      [nx - 9, ny + 14],
    ],
    s.light,
  );
  p.line([hx - 8, hy - 2], [hx + 8, hy], s.joint, 3);
  // Rigid life-support pack: top/side faces, hatch, heat-exchanger ribs and latched bottle.
  p.poly(
    [
      [hx - 10, hy - 25],
      [hx - 5, hy - 28],
      [hx + 12, hy - 23],
      [hx + 15, hy - 5],
      [hx + 8, hy + 1],
      [hx - 10, hy - 3],
    ],
    s.outline,
  );
  p.poly(
    [
      [hx - 8, hy - 24],
      [hx - 4, hy - 26],
      [hx + 10, hy - 22],
      [hx + 12, hy - 5],
      [hx + 7, hy - 1],
      [hx - 8, hy - 4],
    ],
    s.mid,
  );
  p.poly(
    [
      [hx - 8, hy - 24],
      [hx - 4, hy - 26],
      [hx + 10, hy - 22],
      [hx + 6, hy - 19],
      [hx - 8, hy - 21],
    ],
    s.white,
  );
  p.poly(
    [
      [hx + 7, hy - 20],
      [hx + 11, hy - 22],
      [hx + 12, hy - 5],
      [hx + 7, hy - 1],
    ],
    s.shadow,
  );
  p.rect(hx - 6, hy - 20, 12, 15, s.light);
  p.rect(hx - 5, hy - 19, 10, 2, s.red);
  for (let i = 0; i < 4; i++) p.rect(hx - 4, hy - 14 + i * 2, 8, 1, s.mid);
  p.rect(hx - 7, hy - 6, 3, 3, s.joint);
  p.rect(hx + 3, hy - 6, 3, 3, s.joint);
  p.rect(hx + 9, hy - 16, 3, 9, s.light);
  hose(p, [
    [hx + 11, hy - 14],
    [hx + 16, hy - 10],
    [hx + 16, hy - 3],
    [hx + 9, hy + 3],
    [hx + 5, hy],
  ]);
  // Rear helmet has an opaque shell and only a narrow visor edge toward the board.
  p.ellipse(nx, ny - 7, 12, 13, s.outline);
  p.ellipse(nx, ny - 8, 10, 11, s.mid);
  p.ellipse(nx - 2, ny - 9, 8, 9, s.white);
  p.poly(
    [
      [nx - 10, ny - 12],
      [nx - 6, ny - 13],
      [nx - 8, ny - 7],
      [nx - 7, ny - 2],
      [nx - 10, ny - 3],
      [nx - 12, ny - 7],
    ],
    s.visor,
  );
  p.line([nx - 5, ny - 15], [nx + 2, ny - 15], s.highlight, 2);
  p.line([nx + 3, ny - 14], [nx + 6, ny - 10], s.mid);
  p.line([nx + 6, ny - 10], [nx + 7, ny - 3], s.shadow);
  p.rect(nx + 7, ny - 8, 4, 5, s.joint);
  p.rect(nx + 8, ny - 7, 2, 3, s.mid);
  p.rect(nx - 8, ny + 4, 16, 2, s.shadow);
  p.rect(nx - 6, ny + 6, 13, 2, s.mid);
  limb(p, j.shoulderR, j.elbowR, 8);
  p.ellipse(j.elbowR[0], j.elbowR[1], 4, 4, s.joint);
  limb(p, j.elbowR, j.handR, 7);
  p.line(
    [j.shoulderR[0] - 2, j.shoulderR[1] + 1],
    [j.shoulderR[0] + 2, j.shoulderR[1] + 2],
    s.red,
    2,
  );
  const tip = repairToolTip(j);
  p.line(j.handR, tip, s.outline, 3);
  p.line(j.handR, tip, s.mid);
  p.ellipse(j.handR[0], j.handR[1], 3, 3, s.shadow);
  p.ellipse(j.handR[0] - 1, j.handR[1] - 1, 2, 2, s.light);
  p.pixel(tip[0], tip[1], s.gold);
}
export function drawAstronaut(
  p: Pixels,
  x: number,
  y: number,
  time: number,
  pose: SuitPose,
) {
  const j = solveSuitPose(x, y, time, pose);
  if (pose === "repair") {
    drawRepairBack(p, j);
    return;
  }
  const [hx, hy] = j.hip,
    [nx, ny] = j.neck;
  // The life-support pack is one solid assembly fixed to the torso.
  p.poly(
    [
      [hx - 15, hy - 25],
      [hx - 7, hy - 30],
      [hx + 9, hy - 23],
      [hx + 12, hy - 4],
      [hx - 6, hy + 2],
      [hx - 16, hy - 5],
    ],
    s.outline,
  );
  p.poly(
    [
      [hx - 13, hy - 24],
      [hx - 7, hy - 27],
      [hx + 7, hy - 21],
      [hx + 9, hy - 6],
      [hx - 6, hy],
      [hx - 14, hy - 6],
    ],
    s.mid,
  );
  p.rect(hx - 14, hy - 21, 5, 17, s.shadow);
  p.rect(hx - 12, hy - 23, 3, 15, s.light);
  // Thighs, knee bellows, shins and pressure boots retain the same proportions in every scene.
  for (const [knee, foot, side] of [
    [j.kneeL, j.footL, -1],
    [j.kneeR, j.footR, 1],
  ] as const) {
    limb(p, [hx + side * 5, hy], knee, 9);
    p.ellipse(knee[0], knee[1], 5, 4, s.joint);
    p.line([knee[0] - 3, knee[1] - 1], [knee[0] + 3, knee[1] + 1], s.mid);
    limb(p, knee, foot, 8);
    p.poly(
      [
        [foot[0] - 5, foot[1] - 2],
        [foot[0] + 4, foot[1] - 2],
        [foot[0] + 9, foot[1] + 3],
        [foot[0] + 9, foot[1] + 6],
        [foot[0] - 6, foot[1] + 6],
      ],
      s.outline,
    );
    p.rect(foot[0] - 4, foot[1] - 1, 9, 4, s.mid);
    p.rect(foot[0] - 4, foot[1] + 3, 12, 2, s.shadow);
    p.line([foot[0] - 3, foot[1] - 1], [foot[0] + 3, foot[1] - 1], s.light);
  }
  // Restrained breathing moves the torso, harness, collar, head and upper-arm roots together.
  p.poly(
    [
      [nx - 8, ny + 4],
      [nx + 9, ny + 5],
      [hx + 12, hy - 6],
      [hx + 8, hy + 4],
      [hx - 8, hy + 2],
      [nx - 10, ny + 14],
    ],
    s.outline,
  );
  p.poly(
    [
      [nx - 7, ny + 6],
      [nx + 7, ny + 6],
      [hx + 10, hy - 6],
      [hx + 6, hy + 2],
      [hx - 6, hy],
      [nx - 8, ny + 14],
    ],
    s.light,
  );
  p.poly(
    [
      [nx + 5, ny + 6],
      [hx + 10, hy - 6],
      [hx + 6, hy + 2],
      [hx + 2, hy],
      [nx + 3, ny + 13],
    ],
    s.mid,
  );
  p.line([nx - 5, ny + 8], [hx - 4, hy - 4], s.white, 2);
  p.line([nx + 4, ny + 8], [hx + 5, hy - 5], s.shadow);
  p.rect(nx - 5, ny + 11, 12, 10, s.shadow);
  p.rect(nx - 4, ny + 12, 10, 7, s.white);
  p.rect(nx - 3, ny + 13, 5, 3, s.red);
  p.rect(nx + 3, ny + 14, 2, 2, s.mid);
  p.rect(hx - 5, hy - 5, 12, 3, s.joint);
  p.rect(hx - 4, hy - 4, 3, 2, s.gold);
  p.rect(hx + 2, hy - 4, 3, 2, s.mid);
  for (const [shoulder, elbow, hand] of [
    [j.shoulderL, j.elbowL, j.handL],
    [j.shoulderR, j.elbowR, j.handR],
  ]) {
    limb(p, shoulder, elbow, 8);
    p.ellipse(elbow[0], elbow[1], 4, 4, s.joint);
    limb(p, elbow, hand, 7);
    p.ellipse(hand[0], hand[1], 4, 4, s.outline);
    p.ellipse(hand[0], hand[1] - 1, 3, 3, s.mid);
    p.line(
      [shoulder[0] - 2, shoulder[1] + 1],
      [shoulder[0] + 2, shoulder[1] + 2],
      s.red,
      2,
    );
  }
  // Pressure helmet: broad visor, layered locking ring, offset reflection, no exposed face.
  p.ellipse(nx, ny - 6, 12, 13, s.outline);
  p.ellipse(nx - 1, ny - 7, 10, 11, s.mid);
  p.ellipse(nx - 2, ny - 8, 9, 10, s.white);
  p.poly(
    [
      [nx - 8, ny - 14],
      [nx + 5, ny - 14],
      [nx + 9, ny - 9],
      [nx + 9, ny],
      [nx + 5, ny + 3],
      [nx - 7, ny + 2],
      [nx - 11, ny - 4],
      [nx - 11, ny - 10],
    ],
    s.shadow,
  );
  p.poly(
    [
      [nx - 7, ny - 12],
      [nx + 5, ny - 12],
      [nx + 7, ny - 8],
      [nx + 7, ny - 1],
      [nx + 3, ny + 1],
      [nx - 6, ny],
      [nx - 9, ny - 5],
      [nx - 9, ny - 9],
    ],
    s.visor,
  );
  p.poly(
    [
      [nx - 5, ny - 11],
      [nx + 4, ny - 11],
      [nx + 6, ny - 7],
      [nx + 3, ny - 7],
      [nx, ny - 10],
      [nx - 6, ny - 9],
    ],
    s.reflect,
  );
  p.line([nx - 7, ny - 14], [nx - 2, ny - 15], s.highlight, 2);
  p.rect(nx + 8, ny - 6, 3, 5, s.joint);
  p.rect(nx - 9, ny + 4, 17, 2, s.shadow);
  p.rect(nx - 8, ny + 5, 14, 2, s.mid);
  hose(p, [
    [hx - 12, hy - 15],
    [hx - 17, hy - 11],
    [hx - 16, hy - 2],
    [hx - 9, hy + 3],
    [hx + 1, hy - 1],
  ]);
}
