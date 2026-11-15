import { describe, it, expect } from "vitest";
import {
  crew,
  animations,
  variants,
  directions,
  neutralRigs,
} from "../src/data";
import { createPose } from "../src/pose";
import { length, add } from "../src/kinematics";
import { renderCrew } from "../src/render";
import { loadArt } from "../scripts/lib";
import { readFile } from "node:fs/promises";
const art = await loadArt(),
  palette = new Set(
    (await readFile("art-src/palette.hex", "utf8")).trim().split(/\s+/),
  );
describe("Crew integrity", () => {
  it("contains eight distinct crew and exactly two people per role", () => {
    expect(new Set(crew.map((c) => c.id)).size).toBe(8);
    for (const role of ["power", "comms", "science", "launch"])
      expect(crew.filter((c) => c.role === role)).toHaveLength(2);
    expect(new Set(crew.map((c) => c.heightPx)).size).toBe(8);
  });
  it("holds bone lengths and standing foot targets through every action", () => {
    for (const c of crew)
      for (const a of animations)
        for (let f = 0; f <= 16; f++) {
          const p = createPose(c, a.id, f / 16),
            j = p.skeleton,
            n = neutralRigs[c.id];
          for (const [
            root,
            joint,
            end,
            originalRoot,
            originalJoint,
            originalEnd,
          ] of [
            [j.shoulderL, j.elbowL, j.handL, n.shoulderL, n.elbowL, n.handL],
            [j.shoulderR, j.elbowR, j.handR, n.shoulderR, n.elbowR, n.handR],
            [
              add(j.hip, -5),
              j.kneeL,
              j.footL,
              add(n.hip, -5),
              n.kneeL,
              n.footL,
            ],
            [add(j.hip, 5), j.kneeR, j.footR, add(n.hip, 5), n.kneeR, n.footR],
          ] as const) {
            expect(length(root, joint)).toBeCloseTo(
              length(originalRoot, originalJoint),
              7,
            );
            expect(length(joint, end)).toBeCloseTo(
              length(originalJoint, originalEnd),
              7,
            );
          }
          if (!["walk", "eva_float"].includes(a.id)) {
            expect(length(j.footL, n.footL)).toBeLessThan(0.002);
            expect(length(j.footR, n.footR)).toBeLessThan(0.002);
          }
        }
  });
  it("returns looping poses seamlessly at phase 1", () => {
    for (const c of crew)
      for (const a of animations.filter((a) => a.loop)) {
        const first = createPose(c, a.id, 0),
          last = createPose(c, a.id, 1);
        for (const key of Object.keys(
          first.skeleton,
        ) as (keyof typeof first.skeleton)[])
          expect(length(first.skeleton[key], last.skeleton[key])).toBeLessThan(
            0.00001,
          );
      }
  });
  it("exports no clipped pixels, partial alpha or foreign colors across all 5632 frames", () => {
    let count = 0;
    for (const c of crew)
      for (const v of variants)
        for (const d of directions)
          for (const a of animations)
            for (let f = 0; f < 8; f++) {
              const p = renderCrew(
                c,
                art[c.id],
                a.id,
                a.loop ? f / 8 : f / 7,
                d,
                v,
              ).pixels;
              expect(p.clipped, `${c.id}/${v}/${d}/${a.id}/${f}`).toBe(0);
              let visible = 0;
              for (let i = 0; i < p.data.length; i += 4) {
                const alpha = p.data[i + 3];
                if (!alpha) continue;
                visible++;
                if (alpha !== 255) throw new Error("Partial alpha");
                const h = Array.from(p.data.slice(i, i + 3))
                  .map((x) => x.toString(16).padStart(2, "0"))
                  .join("");
                if (!palette.has(h)) throw new Error("Foreign color " + h);
              }
              expect(visible).toBeGreaterThan(500);
              count++;
            }
    expect(count).toBe(5632);
  }, 90000);
  it("each person has visible breathing and a distinct signature sequence", () => {
    const signatures = new Set<string>();
    for (const c of crew) {
      const frames = Array.from({ length: 8 }, (_, f) =>
        Buffer.from(
          renderCrew(c, art[c.id], "idle", f / 8, "se", "cabin").pixels.data,
        ).toString("base64"),
      );
      expect(new Set(frames).size).toBeGreaterThan(2);
      signatures.add(
        Buffer.from(
          renderCrew(c, art[c.id], "signature", 0.375, "se", "cabin").pixels
            .data,
        ).toString("base64"),
      );
    }
    expect(signatures.size).toBe(8);
  });
});
