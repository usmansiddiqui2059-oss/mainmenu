import { timing, type Player, type Action } from "./data";
import { add, mul, solve, type V3 } from "./math";
export interface Limb {
  root: V3;
  joint: V3;
  end: V3;
  upper: number;
  lower: number;
}
export interface Foot {
  ground: V3;
  ankle: V3;
  planted: boolean;
  phase: number;
}
export interface Pose {
  hip: V3;
  chest: V3;
  neck: V3;
  head: V3;
  arms: [Limb, Limb];
  legs: [Limb, Limb];
  feet: [Foot, Foot];
  breath: number;
  blink: boolean;
  bodyYaw: number;
}
const tau = Math.PI * 2;
export function createPose(
  player: Player,
  action: Action,
  phase: number,
): Pose {
  const p = ((phase % 1) + 1) % 1,
    scale = player.modelScale,
    walk = action === "walk",
    breath = walk ? 0 : Math.sin(p * tau),
    bob = walk ? -0.65 - Math.cos(p * tau * 2) * 0.45 : 0,
    sway = walk ? Math.sin(p * tau) * 0.45 : Math.sin(p * tau) * 0.18;
  const point = (x: number, y: number, z: number): V3 => [
    x * scale,
    y * scale,
    z * scale,
  ];
  const hip = point(sway, 0, 44 + bob),
    chest = point(sway * 0.6, 0, 63 + bob + breath * 0.3),
    neck = point(sway * 0.4, 0, 74 + bob * 0.6 + breath * 0.55),
    head = point(sway * 0.3, 0, 82.5 + bob * 0.35 + breath * 0.55);
  const feet: Foot[] = [],
    legs: Limb[] = [],
    arms: Limb[] = [];
  for (const [index, side] of [
    [0, 1],
    [1, -1],
  ] as const) {
    const a = (p + (index === 0 ? 0 : 0.5)) % 1,
      stance = !walk || a < timing.walk.stanceFraction,
      t = walk
        ? Math.max(
            0,
            (a - timing.walk.stanceFraction) / (1 - timing.walk.stanceFraction),
          )
        : 0;
    const y = walk
        ? stance
          ? -timing.walk.footTravel / 2 +
            (timing.walk.footTravel * a) / timing.walk.stanceFraction
          : timing.walk.footTravel / 2 -
            timing.walk.footTravel * (t * t * (3 - 2 * t))
        : 0,
      z =
        walk && !stance
          ? Math.sin(t * Math.PI) * timing.walk.swingClearance
          : 0;
    // Gait stride and cadence are shared by both visual choices. Only bone dimensions differ.
    const ground: V3 = [side * 5.3 * scale, y, z],
      ankle: V3 = add(ground, [0, 0, 5.4 * scale]),
      root: V3 = add(hip, point(side * 5.2, 0, 0)),
      upper = 20.5 * scale,
      lower = 18.5 * scale,
      leg = solve(root, ankle, upper, lower, [0, -1, 0]);
    feet.push({ ground, ankle, planted: stance, phase: a });
    legs.push({ root, joint: leg.joint, end: leg.end, upper, lower });
    const shoulder = add(chest, point(side * player.shoulderHalfWidth, 0, 5)),
      armSwing = walk ? -y * 0.64 : 0,
      hand: V3 = point(
        side * (player.shoulderHalfWidth + 2.7),
        armSwing,
        43 + bob * 0.2,
      ),
      armUpper = 13.5 * scale,
      armLower = 12.0 * scale,
      result = solve(shoulder, hand, armUpper, armLower, [side * 0.35, 1, 0]);
    arms.push({
      root: shoulder,
      joint: result.joint,
      end: result.end,
      upper: armUpper,
      lower: armLower,
    });
  }
  return {
    hip,
    chest,
    neck,
    head,
    arms: arms as [Limb, Limb],
    legs: legs as [Limb, Limb],
    feet: feet as [Foot, Foot],
    breath,
    blink: false,
    bodyYaw: walk ? Math.sin(p * tau) * 0.025 : 0,
  };
}
