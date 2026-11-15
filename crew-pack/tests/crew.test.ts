import { it, expect } from "vitest";
import { readFile } from "node:fs/promises";
import { crew, animations, directions, variants } from "../src/data";
import { models, timing } from "../src/human/data";
import { createCrewPose } from "../src/pose";
import { renderCrew } from "../src/render";
import { length, sub } from "../src/human/math";
it("retains eight distinct people, heights and role pairings", () => {
  expect(new Set(crew.map((c) => c.id)).size).toBe(8);
  expect(new Set(crew.map((c) => c.heightCm)).size).toBe(8);
  for (const role of ["power", "comms", "science", "launch"])
    expect(crew.filter((c) => c.role === role)).toHaveLength(2);
  expect(models.maya.shoulderHalfWidth).toBeGreaterThan(
    models.bilal.shoulderHalfWidth,
  );
  expect(models.omar.hipHalfWidth).toBeGreaterThan(models.bilal.hipHalfWidth);
});
it("keeps every arm/leg segment at its fixed length and all standing soles planted", () => {
  for (const c of crew)
    for (const a of animations)
      for (let f = 0; f <= 24; f++) {
        const p = createCrewPose(c, a.id, f / 24);
        for (const b of [...p.arms, ...p.legs]) {
          expect(length(sub(b.root, b.joint))).toBeCloseTo(b.upper, 7);
          expect(length(sub(b.joint, b.end))).toBeCloseTo(b.lower, 7);
        }
        for (let i = 0; i < 2; i++) {
          expect(length(sub(p.legs[i].end, p.feet[i].ankle))).toBeLessThan(
            0.0001,
          );
          if (!["walk", "eva_float"].includes(a.id))
            expect(p.feet[i].ground[2]).toBe(0);
        }
      }
});
it("returns every looping joint to its starting position", () => {
  for (const c of crew)
    for (const a of animations.filter((a) => a.loop)) {
      const p = createCrewPose(c, a.id, 0),
        q = createCrewPose(c, a.id, 1);
      for (let i = 0; i < 2; i++)
        for (const key of ["root", "joint", "end"] as const)
          expect(length(sub(p.arms[i][key], q.arms[i][key]))).toBeLessThan(
            0.00001,
          );
    }
});
it("cancels root travel during a planted stance, preventing the old sliding gait", () => {
  for (const c of crew) {
    const p = createCrewPose(c, "walk", 0.1),
      q = createCrewPose(c, "walk", 0.4),
      distance = timing.walk.footTravel / timing.walk.stanceFraction;
    expect(p.feet[0].ground[1] - distance * 0.1).toBeCloseTo(
      q.feet[0].ground[1] - distance * 0.4,
      8,
    );
  }
});
it("renders all 5632 combinations inside the frame, with connected solid silhouettes and palette-only opaque pixels", async () => {
  const palette = new Set(
    (await readFile("art-src/palette.hex", "utf8")).trim().split(/\s+/),
  );
  let count = 0;
  for (const c of crew)
    for (const v of variants)
      for (const d of directions)
        for (const a of animations)
          for (let f = 0; f < 8; f++) {
            const r = renderCrew(c, a.id, a.loop ? f / 8 : f / 7, d, v),
              p = r.detailPixels,
              label = `${c.id}/${v}/${d}/${a.id}/${f}`;
            if (
              p.clipped ||
              r.bounds.minX <= 1 ||
              r.bounds.maxX >= 127 ||
              r.bounds.minY <= 1 ||
              r.bounds.maxY >= 191
            )
              throw new Error(
                "Frame margin " + label + " " + JSON.stringify(r.bounds),
              );
            const occupied = new Set<number>();
            for (let i = 0; i < p.data.length; i += 4) {
              const alpha = p.data[i + 3];
              if (!alpha) continue;
              if (alpha !== 255) throw new Error("Partial alpha " + label);
              occupied.add(i / 4);
              const h =
                p.data[i].toString(16).padStart(2, "0") +
                p.data[i + 1].toString(16).padStart(2, "0") +
                p.data[i + 2].toString(16).padStart(2, "0");
              if (!palette.has(h)) throw new Error("Palette " + label);
            }
            if (occupied.size < 600) throw new Error("Empty frame");
            const queue = [occupied.values().next().value!],
              seen = new Set(queue);
            for (let k = 0; k < queue.length; k++)
              for (const dx of [-1, 0, 1])
                for (const dy of [-1, 0, 1]) {
                  const n = queue[k] + dx + dy * 128;
                  if (occupied.has(n) && !seen.has(n)) {
                    seen.add(n);
                    queue.push(n);
                  }
                }
            if (seen.size !== occupied.size)
              throw new Error(
                "Detached pixels " + label + " " + (occupied.size - seen.size),
              );
            count++;
          }
  expect(count).toBe(5632);
}, 240000);
it("draws clear front eyes, actual rear hair/nape and sealed EVA helmets for everyone", () => {
  for (const c of crew)
    for (const d of directions) {
      const r = renderCrew(c, "idle", 0, d, "cabin"),
        eyes = Array.from(r.tags).filter((x) => x === 1).length;
      if (d === "ne" || d === "nw") expect(eyes).toBe(0);
      else expect(eyes, c.id + "/" + d).toBeGreaterThan(0);
      const eva = renderCrew(c, "idle", 0, d, "eva");
      expect(
        Array.from(eva.tags).filter((x) => [1, 2, 3].includes(x)),
      ).toHaveLength(0);
    }
});
