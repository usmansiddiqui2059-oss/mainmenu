import { it, expect } from "vitest";
import { readFile } from "node:fs/promises";
import { manifestSchema } from "../src/manifest";
import {
  getPlayerFrame,
  groundVelocity,
  facingFromScreenVector,
} from "../adapters/canvas";
import { directions } from "../src/data";
const m = manifestSchema.parse(
    JSON.parse(await readFile("assets/manifest.json", "utf8")),
  ),
  base = {
    player: "player_female",
    variant: "cabin",
    direction: "S",
    action: "walk",
    elapsedMs: 0,
  } as const;
it("uses all eight real rows and loops at the declared frame timing", () => {
  for (const direction of directions) {
    const r = getPlayerFrame(m, { ...base, direction, elapsedMs: 1250 });
    expect(r.index).toBe(0);
    expect(r.rect.y).toBe(directions.indexOf(direction) * 192);
  }
  expect(() => getPlayerFrame(m, { ...base, elapsedMs: NaN })).toThrow();
});
it("scales the pivot, frame and every anchor consistently", () => {
  const high = getPlayerFrame(m, base),
    low = getPlayerFrame(m, { ...base, resolution: "gameplay" });
  expect(low.rect.width).toBe(16);
  expect(low.origin).toEqual({ x: 8, y: 21 });
  expect(low.anchors.handL.x).toBe(high.anchors.handL.x / 8);
});
it("maps projected vectors to eight directions and keeps zero-input facing", () => {
  for (const d of directions) {
    const v = groundVelocity(m, d);
    expect(facingFromScreenVector(v.x, v.y)).toBe(d);
    const worldSpeed = Math.hypot(v.x, v.y * 2);
    expect(worldSpeed).toBeCloseTo(
      m.movement.worldUnitsPerSecond * m.projection.pixelsPerUnit,
      8,
    );
  }
  expect(facingFromScreenVector(0, 0, "NW")).toBe("NW");
});
