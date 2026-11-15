import { type Crew, type Action, roles } from "./data";
import { models } from "./human/data";
import { createPose as basePose, type Pose } from "./human/pose";
import { add, mul, solve, type V3 } from "./human/math";
export type Tool = "none" | "meter" | "tablet" | "sample" | "driver";
export interface CrewPose extends Pose {
  tool: Tool;
  toolTip: V3 | null;
  openHand: boolean;
}
export function createCrewPose(
  person: Crew,
  action: Action,
  phase: number,
): CrewPose {
  const model = models[person.id],
    s = model.modelScale,
    p = Math.max(0, Math.min(1, phase)),
    u = Math.sin(p * Math.PI) ** 2,
    cycle = p * Math.PI * 2,
    pose = basePose(
      model,
      action === "walk" ? "walk" : "idle",
      action === "walk" ? phase : phase + person.phase / (Math.PI * 2),
    ) as CrewPose;
  pose.tool = "none";
  pose.toolTip = null;
  pose.openHand = false;
  const pt = (x: number, y: number, z: number): V3 => [x * s, y * s, z * s],
    hands = [pose.arms[0].end, pose.arms[1].end] as [V3, V3];
  if (action === "talk") hands[1] = pt(-13, -5 * u, 43 + 13 * u);
  if (action === "think") {
    hands[0] = pt(7, -10, 54);
    hands[1] = pt(-3, -6, 78);
    pose.tool = "tablet";
  }
  if (action === "concern") {
    hands[0] = pt(6, -10, 52);
    hands[1] = pt(-5, -10, 52 + 3 * u);
  }
  if (action === "celebrate") {
    hands[1] = add(hands[1], pt(0, -5 * u, 35 * u));
    hands[0] = add(hands[0], pt(0, -4 * u, 19 * u));
  }
  if (action === "point") {
    hands[1] = add(hands[1], pt(-12 * u, -9 * u, 23 * u));
    pose.openHand = true;
  }
  if (action === "work") {
    if (person.role === "power") {
      hands[0] = pt(6, -10, 54);
      hands[1] = pt(-1 + Math.sin(cycle) * 0.6, -12, 55);
      pose.tool = "meter";
    }
    if (person.role === "comms") {
      hands[0] = pt(7, -10, 54);
      hands[1] = pt(-5, -3, 80 + Math.sin(cycle) * 0.4);
      pose.tool = "tablet";
    }
    if (person.role === "science") {
      hands[0] = pt(7, -10, 53);
      hands[1] = pt(-6, -12, 56 + Math.sin(cycle));
      pose.tool = "sample";
    }
    if (person.role === "launch") {
      hands[0] = pt(6, -10, 54);
      hands[1] = pt(-0.5, -11, 55 + Math.sin(cycle) * 0.5);
      pose.tool = "tablet";
    }
  }
  if (action === "signature") {
    if (person.id === "ayesha") {
      hands[0] = pt(7, -8, 54);
      hands[1] = pt(7, -10, 55 + u);
    }
    if (person.id === "maya") {
      hands[1] = pt(-15, -5, 48 + 19 * u);
      pose.openHand = true;
    }
    if (person.id === "bilal") {
      hands[0] = pt(7, -10, 54);
      hands[1] = pt(-5, -3, 80);
      pose.tool = "tablet";
    }
    if (person.id === "lin") {
      hands[1] = pt(-5, -3, 80 + Math.sin(cycle) * 0.5);
    }
    if (person.id === "sana") {
      hands[0] = pt(7, -10, 54);
      hands[1] = pt(-3, -7, 86.5 + u * 0.2);
      pose.tool = "tablet";
    }
    if (person.id === "kofi") {
      hands[1] = pt(-7, -12, 55 + 3 * u);
      pose.tool = "sample";
    }
    if (person.id === "omar") {
      hands[0] = pt(6, -10, 54);
      hands[1] = pt(-1, -11, 54 + 2 * u);
      pose.tool = "tablet";
    }
    if (person.id === "zara") {
      hands[0] = pt(7, -10, 54);
      hands[1] = pt(-13 - 11 * u, -4 - 7 * u, 48 + 17 * u);
      pose.tool = "tablet";
      pose.openHand = true;
    }
  }
  if (action === "eva_repair") {
    hands[0] = pt(-9, -13, 61);
    const tip = pt(-20, -13, 62);
    hands[1] = add(tip, pt(3 + Math.sin(cycle) * 0.3, 1, -5));
    pose.tool = "driver";
    pose.toolTip = tip;
  }
  if (action === "eva_float") {
    const drift = Math.sin(cycle) * s;
    pose.hip = add(pose.hip, [0, 0, drift]);
    pose.chest = add(pose.chest, [0, 0, drift]);
    pose.neck = add(pose.neck, [0, 0, drift]);
    pose.head = add(pose.head, [0, 0, drift]);
    hands[0] = pt(18, -4, 57 + Math.sin(cycle));
    hands[1] = pt(-18, -3, 59 - Math.sin(cycle));
    for (let i = 0; i < 2; i++) {
      const side = i === 0 ? 1 : -1,
        root = add(pose.hip, pt(side * 5.2, 0, 0)),
        ground = pt(side * 6, i === 0 ? -4 : 3, i === 0 ? 6 : 10),
        ankle = add(ground, pt(0, 0, 5.4)),
        result = solve(
          root,
          ankle,
          pose.legs[i].upper,
          pose.legs[i].lower,
          [0, -1, 0],
        );
      pose.legs[i] = {
        ...pose.legs[i],
        root,
        joint: result.joint,
        end: result.end,
      };
      pose.feet[i] = { ground, ankle, planted: false, phase: p };
    }
  }
  if (action !== "walk") {
    for (let i = 0; i < 2; i++) {
      const root = add(
          pose.chest,
          pt((i === 0 ? 1 : -1) * model.shoulderHalfWidth, 0, 5),
        ),
        limb = pose.arms[i],
        result = solve(root, hands[i], limb.upper, limb.lower, [
          i === 0 ? 0.35 : -0.35,
          1,
          0,
        ]);
      pose.arms[i] = { ...limb, root, joint: result.joint, end: result.end };
    }
  }
  return pose;
}
