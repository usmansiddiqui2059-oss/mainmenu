import { Pixels, type Color, type Point, suit } from "../pixels";
const c = {
  black: [7, 11, 18],
  shadow: [59, 65, 75],
  mid: [141, 150, 158],
  white: [232, 233, 226],
  light: [250, 244, 223],
  tank: [180, 121, 82],
  tankDark: [116, 77, 62],
  tankLight: [210, 155, 102],
  metal: [81, 89, 102],
  fire: [232, 191, 113],
  core: [248, 221, 161],
  smoke: [81, 89, 102],
} as const;
const shifted = (points: Point[], x: number, y: number): Point[] =>
  points.map((p) => [p[0] + x, p[1] + y]);
export function drawShuttle(p: Pixels, x: number, y: number, t: number) {
  const q = (pts: Point[], color: Color) => p.poly(shifted(pts, x, y), color);
  // External propellant tank and two pressure-segmented boosters share one transform.
  q(
    [
      [-11, -130],
      [-10, -144],
      [-5, -157],
      [0, -165],
      [6, -155],
      [12, -140],
      [13, -8],
      [-12, -8],
    ],
    c.black,
  );
  q(
    [
      [-9, -130],
      [-8, -144],
      [-4, -156],
      [0, -161],
      [5, -151],
      [10, -137],
      [11, -9],
      [-10, -9],
    ],
    c.tank,
  );
  q(
    [
      [2, -157],
      [7, -145],
      [10, -131],
      [11, -9],
      [4, -9],
    ],
    c.tankDark,
  );
  p.line([x - 7, y - 139], [x - 8, y - 18], c.tankLight, 2);
  for (const h of [-125, -85, -44])
    p.line([x - 9, y + h], [x + 10, y + h], c.tankDark);
  for (const bx of [-23, 23]) {
    q(
      [
        [bx - 6, -106],
        [bx - 5, -122],
        [bx, -135],
        [bx + 5, -122],
        [bx + 6, -106],
        [bx + 6, -1],
        [bx + 4, 3],
        [bx - 5, 3],
        [bx - 7, -1],
      ],
      c.black,
    );
    q(
      [
        [bx - 4, -108],
        [bx - 3, -121],
        [bx, -131],
        [bx + 3, -121],
        [bx + 4, -108],
        [bx + 4, -1],
        [bx - 4, -1],
      ],
      c.white,
    );
    p.rect(x + bx + 2, y - 107, 3, 103, c.mid);
    p.line([x + bx - 3, y - 112], [x + bx - 3, y - 6], c.light);
    for (let h = -109; h < -7; h += 22) {
      p.rect(x + bx - 4, y + h, 9, 2, c.shadow);
      p.rect(x + bx - 3, y + h + 3, 7, 1, c.mid);
    }
    q(
      [
        [bx - 5, -3],
        [bx + 5, -3],
        [bx + 7, 3],
        [bx - 7, 3],
      ],
      c.metal,
    );
  }
  // The orbiter's black thermal tiles, delta wings, cargo bay and empennage.
  q(
    [
      [-7, -130],
      [-5, -143],
      [0, -150],
      [5, -142],
      [9, -127],
      [10, -70],
      [34, -15],
      [34, -8],
      [11, -14],
      [9, 0],
      [-10, 0],
      [-11, -14],
      [-36, -5],
      [-36, -13],
      [-11, -65],
      [-10, -125],
    ],
    c.black,
  );
  q(
    [
      [-6, -129],
      [-4, -141],
      [0, -147],
      [4, -139],
      [7, -125],
      [8, -68],
      [31, -15],
      [31, -11],
      [10, -17],
      [7, -1],
      [-7, -1],
      [-9, -17],
      [-33, -8],
      [-33, -12],
      [-9, -66],
      [-8, -125],
    ],
    c.white,
  );
  q(
    [
      [2, -144],
      [5, -136],
      [7, -125],
      [8, -68],
      [31, -15],
      [31, -11],
      [10, -17],
      [7, -1],
      [2, -1],
    ],
    c.mid,
  );
  q(
    [
      [-33, -12],
      [-10, -28],
      [-9, -18],
      [-33, -8],
    ],
    c.shadow,
  );
  q(
    [
      [10, -27],
      [30, -15],
      [31, -11],
      [10, -17],
    ],
    c.shadow,
  );
  q(
    [
      [-5, -128],
      [0, -131],
      [5, -127],
      [5, -121],
      [-5, -121],
    ],
    suit.visor,
  );
  p.line([x - 4, y - 128], [x - 1, y - 129], suit.reflect);
  p.line([x, y - 131], [x, y - 121], c.mid);
  p.line([x - 4, y - 114], [x - 4, y - 39], c.mid);
  p.line([x + 3, y - 113], [x + 3, y - 42], c.shadow);
  for (let h = -112; h < -42; h += 12) {
    p.line([x - 3, y + h], [x + 4, y + h + 2], c.mid);
    p.pixel(x - 6, y + h + 2, c.shadow);
  }
  q(
    [
      [-2, -25],
      [-1, -63],
      [2, -71],
      [5, -56],
      [7, -20],
    ],
    c.shadow,
  );
  q(
    [
      [-1, -26],
      [0, -62],
      [2, -68],
      [3, -56],
      [4, -23],
    ],
    c.white,
  );
  for (const bx of [-5, 3, 10]) {
    p.ellipse(x + bx, y, 4, 4, c.black);
    p.ellipse(x + bx, y + 1, 2, 2, c.metal);
  }
  // Specular hardware pixels stay attached to the fuselage, never float as independent effects.
  for (const h of [-119, -81, -46]) p.rect(x - 7, y + h, 2, 2, c.light);
}
export function drawLaunchRig(p: Pixels, t: number) {
  const phase = t;
  const ignition = Math.min(1, Math.max(0, (phase - 6) / 3));
  const ascent =
    phase < 11 ? 0 : Math.pow(Math.min(1, (phase - 11) / 8), 2) * 335;
  const visible = phase < 19;
  const x = 350,
    y = 243 - ascent;
  if (phase >= 6 && phase < 21) {
    // Shared engine mount positions tie plume, lit casing and ascent together.
    for (const bx of [-23, 23])
      for (let row = 0; row < Math.min(70, 24 + ignition * 45); row++) {
        const spread = (2 + row * 0.22) * (1 - row / 95),
          wave = Math.sin(t * 14 + row * 0.8 + bx) * 1.5;
        p.rect(
          x + bx - spread + wave,
          y + 4 + row,
          spread * 2,
          1,
          row < 15 ? c.core : c.fire,
        );
        if (row < 38)
          p.rect(
            x + bx - spread * 0.35 + wave,
            y + 4 + row,
            Math.max(1, spread * 0.7),
            1,
            c.light,
          );
      }
    if (phase > 9)
      for (let i = 0; i < 8; i++) {
        const age = (t * 0.3 + i * 0.13) % 1;
        p.ellipse(
          330 + i * 9 + (i % 2 ? 1 : -1) * age * 17,
          252 + age * 5,
          5 + age * 9,
          2 + age * 3,
          i % 2 ? c.shadow : c.smoke,
        );
      }
  }
  if (visible) {
    drawShuttle(
      p,
      x + (phase > 8 && phase < 11 ? Math.sin(t * 24) * 0.4 : 0),
      y,
      t,
    );
    if (ignition > 0 && phase < 19) {
      for (const bx of [-23, 23])
        p.line([x + bx - 3, y - 5], [x + bx + 4, y - 3], c.tankLight);
    }
  }
  // The mechanical access arm retracts before the vehicle leaves the pad.
  const retract = phase >= 8 ? Math.min(16, (phase - 8) * 5) : 0;
  p.line([397, 148], [379 + retract, 148], c.shadow, 3);
  p.line([397, 147], [379 + retract, 147], c.mid);
}
