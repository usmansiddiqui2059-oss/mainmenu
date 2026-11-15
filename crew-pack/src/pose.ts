import {
  neutralRigs,
  type Crew,
  type Action,
  type Direction,
  type Skeleton,
} from "./data";
import { add, length, solveChain } from "./kinematics";
import type { Point } from "./pixels";
const tau = Math.PI * 2;
export interface Pose {
  skeleton: Skeleton;
  headOffset: [number, number];
  blink: boolean;
  expression: "neutral" | "worried" | "happy";
  tool: "none" | "meter" | "tablet" | "sample" | "driver";
  toolTip: [number, number] | null;
  footPlant: [boolean, boolean];
  zeroG: boolean;
}
export function createPose(
  person: Crew,
  action: Action,
  phase: number,
  direction: Direction = "se",
): Pose {
  const n = neutralRigs[person.id],
    p = Math.max(0, Math.min(1, phase)),
    cycle = p * tau,
    breathe = Math.sin(cycle + person.phase) * 0.85,
    u = Math.sin(p * Math.PI) ** 2;
  const s = JSON.parse(JSON.stringify(n)) as Skeleton;
  let headOffset: [number, number] = [0, breathe],
    handL: Point = n.handL,
    handR: Point = n.handR,
    footL: Point = n.footL,
    footR: Point = n.footR,
    tool: Pose["tool"] = "none",
    toolTip: [number, number] | null = null,
    expression: Pose["expression"] = "neutral";
  const footPlant: [boolean, boolean] = [true, true];
  const zeroG = action === "eva_float";
  s.neck = add(n.neck, 0, breathe);
  s.shoulderL = add(n.shoulderL, 0, breathe);
  s.shoulderR = add(n.shoulderR, 0, breathe);
  if (action === "walk") {
    for (const [key, index, offset] of [
      ["footL", 0, 0],
      ["footR", 1, 0.5],
    ] as const) {
      const a = (p + offset) % 1,
        stance = a < 0.5;
      footPlant[index] = stance;
      const v = stance
        ? (0.25 - a) * 14
        : (-0.25 + ((a - 0.5) * 2) ** 2 * (3 - 2 * (a - 0.5) * 2) * 0.5) * 14;
      const lift = stance ? 0 : Math.sin((a - 0.5) * tau) * 4;
      const original = n[key];
      const target = add(
        original,
        v * 0.894,
        v * 0.447 * (direction === "ne" || direction === "nw" ? -1 : 1) - lift,
      );
      if (index === 0) footL = target;
      else footR = target;
    }
    const bob = -Math.abs(Math.sin(cycle)) * 1;
    s.hip = add(n.hip, 0, bob);
    s.neck = add(n.neck, 0, bob);
    s.shoulderL = add(n.shoulderL, 0, bob);
    s.shoulderR = add(n.shoulderR, 0, bob);
    headOffset = [0, bob];
    handL = add(n.handL, Math.sin(cycle) * 3, Math.sin(cycle) * -2);
    handR = add(n.handR, -Math.sin(cycle) * 3, Math.sin(cycle) * 2);
  }
  if (action === "talk") {
    handR = add(n.handR, -3 * u, -8 * u);
    headOffset = [u * 0.5, breathe - u * 0.6];
  }
  if (action === "think") {
    handR = add(n.neck, 6, 8);
    handL = add(n.hip, -9, -2);
    headOffset = [Math.sin(cycle) * 0.5, breathe + 1];
    tool = "tablet";
  }
  if (action === "concern") {
    expression = "worried";
    handR = add(n.hip, 8, -8 * u);
    headOffset = [-0.6 * u, breathe + u];
  }
  if (action === "celebrate") {
    expression = "happy";
    handR = add(
      n.handR,
      (n.shoulderR[0] + 5 - n.handR[0]) * u,
      (n.shoulderR[1] - 12 - n.handR[1]) * u,
    );
    handL = add(n.handL, 0, -3 * u);
    headOffset = [0, breathe - u];
  }
  if (action === "point") {
    handR = add(
      n.handR,
      (n.shoulderR[0] + 15 - n.handR[0]) * u,
      (n.shoulderR[1] - 5 - n.handR[1]) * u,
    );
    headOffset = [u, breathe - 0.5 * u];
  }
  if (action === "work") {
    if (person.role === "power") {
      handL = add(n.hip, -7, -7);
      handR = add(n.hip, -1 + Math.sin(cycle) * 1.2, -10);
      tool = "meter";
      toolTip = add(n.hip, -1, -12);
    }
    if (person.role === "comms") {
      handL = add(n.hip, -9, -4);
      handR = add(n.neck, 9, 1 + Math.sin(cycle) * 0.5);
      tool = "tablet";
      headOffset = [0, breathe + Math.sin(cycle) * 1.1];
    }
    if (person.role === "science") {
      handL = add(n.hip, -9, -5);
      handR = add(n.hip, 8, -12 + Math.sin(cycle) * 1);
      tool = "sample";
      headOffset = [Math.sin(cycle) * 0.7, breathe];
    }
    if (person.role === "launch") {
      handL = add(n.hip, -7, -7);
      handR = add(n.hip, 4, -11 + Math.sin(cycle) * 0.6);
      tool = "tablet";
      headOffset = [0, breathe + Math.sin(cycle) * 1.1];
    }
  }
  if (action === "signature") {
    if (person.id === "ayesha") {
      handL = add(n.hip, -8, -6);
      handR = add(n.hip, -5, -8 + u);
      headOffset = [0, breathe + u];
    }
    if (person.id === "maya") {
      handR = add(n.shoulderR, 9, -3 * u);
      handL = n.handL;
      headOffset = [0, breathe - u * 0.7];
    }
    if (person.id === "bilal") {
      handR = add(n.neck, 10, 2);
      handL = add(n.hip, -8, -4);
      headOffset = [Math.sin(cycle) * 0.7, breathe + u * 0.7];
      tool = "tablet";
    }
    if (person.id === "lin") {
      handR = add(n.neck, 9, 2);
      headOffset = [0, breathe + Math.sin(cycle) * 0.65];
    }
    if (person.id === "sana") {
      handR = add(n.neck, 6, -11);
      handL = add(n.hip, -9, -3);
      headOffset = [u * 0.6, breathe + u * 0.5];
      tool = "tablet";
    }
    if (person.id === "kofi") {
      handR = add(n.hip, 8, -10 - u * 3);
      handL = add(n.hip, -9, -4);
      tool = "sample";
      expression = "happy";
    }
    if (person.id === "omar") {
      handL = add(n.hip, -8, -5);
      handR = add(n.hip, -1, -7 - u * 2);
      tool = "tablet";
      headOffset = [0, breathe + u];
    }
    if (person.id === "zara") {
      handL = add(n.hip, -8, -4);
      handR = add(n.shoulderR, 13 * u, 5 - 7 * u);
      tool = "tablet";
      headOffset = [u * 0.5, breathe - u * 0.5];
    }
  }
  if (action === "eva_float") {
    const drift = Math.sin(cycle) * 1.5;
    s.hip = add(n.hip, 0, drift);
    s.neck = add(n.neck, 0, drift);
    s.shoulderL = add(n.shoulderL, 0, drift);
    s.shoulderR = add(n.shoulderR, 0, drift);
    headOffset = [0, drift];
    handL = add(n.shoulderL, -9, 9 + Math.sin(cycle));
    handR = add(n.shoulderR, 10, 6 - Math.sin(cycle));
    footL = add(n.footL, -3, -6 + Math.sin(cycle));
    footR = add(n.footR, 5, -13);
    footPlant[0] = footPlant[1] = false;
  }
  if (action === "eva_repair") {
    handL = add(n.hip, -10, -10);
    toolTip = add(n.hip, 22, -15);
    const angle = -0.4 + Math.sin(cycle) * 0.1;
    handR = add(toolTip, Math.sin(angle) * 6, Math.cos(angle) * 6);
    headOffset = [-1, breathe + 1];
    tool = "driver";
  }
  const armL = solveChain(
      s.shoulderL,
      handL,
      length(n.shoulderL, n.elbowL),
      length(n.elbowL, n.handL),
      1,
    ),
    armR = solveChain(
      s.shoulderR,
      handR,
      length(n.shoulderR, n.elbowR),
      length(n.elbowR, n.handR),
      -1,
    );
  s.elbowL = armL.joint;
  s.elbowR = armR.joint;
  s.handL = armL.end;
  s.handR = armR.end;
  const legL = solveChain(
      add(s.hip, -5, 0),
      footL,
      length(add(n.hip, -5, 0), n.kneeL),
      length(n.kneeL, n.footL),
      1,
    ),
    legR = solveChain(
      add(s.hip, 5, 0),
      footR,
      length(add(n.hip, 5, 0), n.kneeR),
      length(n.kneeR, n.footR),
      -1,
    );
  s.kneeL = legL.joint;
  s.kneeR = legR.joint;
  s.footL = legL.end;
  s.footR = legR.end;
  return {
    skeleton: s,
    headOffset,
    blink: Math.floor(p * 8) === Math.floor(person.phase * 2) % 8,
    expression,
    tool,
    toolTip,
    footPlant,
    zeroG,
  };
}
