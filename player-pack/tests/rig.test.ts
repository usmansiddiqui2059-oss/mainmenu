import { it, expect } from "vitest";
import { readFile } from "node:fs/promises";
import {
  players,
  directions,
  variants,
  actions,
  timing,
  ROOT_DISTANCE,
} from "../src/data";
import { createPose } from "../src/pose";
import { renderPlayer, TAG } from "../src/render";
import { length, sub } from "../src/math";
it("holds solid limb lengths and stance contacts across the entire gait", () => {
  for (const p of players)
    for (const a of actions)
      for (let f = 0; f < 120; f++) {
        const pose = createPose(p, a, f / 120);
        for (const limb of [...pose.arms, ...pose.legs]) {
          expect(length(sub(limb.root, limb.joint))).toBeCloseTo(limb.upper, 8);
          expect(length(sub(limb.joint, limb.end))).toBeCloseTo(limb.lower, 8);
        }
        for (let i = 0; i < 2; i++) {
          expect(
            length(sub(pose.legs[i].end, pose.feet[i].ankle)),
          ).toBeLessThan(0.0001);
          if (pose.feet[i].planted) expect(pose.feet[i].ground[2]).toBe(0);
        }
      }
});
it("planted feet stay in the same world place at the declared root speed", () => {
  for (const player of players) {
    const a = 0.1,
      b = 0.4,
      p = createPose(player, "walk", a),
      q = createPose(player, "walk", b);
    const worldA = p.feet[0].ground[1] - ROOT_DISTANCE * a,
      worldB = q.feet[0].ground[1] - ROOT_DISTANCE * b;
    expect(worldA).toBeCloseTo(worldB, 8);
  }
});
it("loops without changing bone geometry, foot positions or head pose at the seam", () => {
  for (const p of players)
    for (const a of actions) {
      const first = createPose(p, a, 0),
        last = createPose(p, a, 1);
      expect(last).toEqual(first);
    }
});
it("all 640 frames have a safe frame margin, binary alpha, a single connected silhouette and only the shared palette", async () => {
  const palette = new Set(
    (await readFile("art-src/palette.hex", "utf8")).trim().split(/\s+/),
  );
  let count = 0;
  for (const p of players)
    for (const v of variants)
      for (const d of directions)
        for (const a of actions)
          for (let f = 0; f < timing[a].frames; f++) {
            const r = renderPlayer(p, v, d, a, f / timing[a].frames),
              px = r.pixels;
            expect(r.bounds.minX).toBeGreaterThan(1);
            expect(r.bounds.maxX).toBeLessThan(127);
            expect(r.bounds.minY).toBeGreaterThan(1);
            expect(r.bounds.maxY).toBeLessThan(191);
            expect(px.clipped).toBe(0);
            const occupied = new Set<number>();
            for (let i = 0; i < px.data.length; i += 4) {
              if (!px.data[i + 3]) continue;
              occupied.add(i / 4);
              expect(px.data[i + 3]).toBe(255);
              const h = Array.from(px.data.slice(i, i + 3))
                .map((x) => x.toString(16).padStart(2, "0"))
                .join("");
              if (!palette.has(h)) throw new Error("Foreign color " + h);
            }
            expect(occupied.size).toBeGreaterThan(600);
            const queue = [occupied.values().next().value!],
              seen = new Set(queue);
            for (let i = 0; i < queue.length; i++)
              for (const dx of [-1, 0, 1])
                for (const dy of [-1, 0, 1]) {
                  const q = queue[i] + dx + dy * 128;
                  if (occupied.has(q) && !seen.has(q)) {
                    seen.add(q);
                    queue.push(q);
                  }
                }
            expect(seen.size, `${p.id}/${v}/${d}/${a}/${f}`).toBe(
              occupied.size,
            );
            count++;
          }
  expect(count).toBe(640);
}, 90000);
it("uses eight distinct views, visible front/profile eyes, real rear heads and opaque EVA helmets", () => {
  for (const p of players) {
    const hashes = new Set();
    for (const d of directions) {
      const cabin = renderPlayer(p, "cabin", d, "idle", 0),
        eva = renderPlayer(p, "eva", d, "idle", 0);
      hashes.add(Buffer.from(cabin.pixels.data).toString("base64"));
      const eyes = Array.from(cabin.tags).filter((t) => t === TAG.eye).length;
      if (["N", "NE", "NW"].includes(d)) expect(eyes).toBe(0);
      else expect(eyes, `${p.id}/${d}`).toBeGreaterThan(0);
      expect(
        Array.from(eva.tags).filter((t) =>
          [TAG.eye, TAG.skin, TAG.hair].includes(t),
        ),
      ).toHaveLength(0);
    }
    expect(hashes.size).toBe(8);
  }
});
