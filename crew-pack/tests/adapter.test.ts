import { it, expect } from "vitest";
import { readFile } from "node:fs/promises";
import { manifestSchema } from "../src/manifest";
import { getCrewFrame } from "../adapters/canvas";
const m = manifestSchema.parse(
    JSON.parse(await readFile("assets/manifest.json", "utf8")),
  ),
  base = {
    crew: "ayesha",
    variant: "cabin",
    direction: "se",
    action: "idle",
    elapsedMs: 0,
  } as const;
it("uses metadata timings and keeps one-shots on their last frame", () => {
  const a = m.atlases[0].rows[0];
  expect(
    getCrewFrame(m, { ...base, elapsedMs: (8 / a.fps) * 1000 + 0.01 }).index,
  ).toBe(0);
  const end = getCrewFrame(m, { ...base, action: "point", elapsedMs: 100000 });
  expect(end.index).toBe(7);
  expect(end.complete).toBe(true);
});
it("scales rectangles and all attachment anchors together", () => {
  const high = getCrewFrame(m, base),
    low = getCrewFrame(m, { ...base, resolution: "gameplay" });
  expect(low.rect).toEqual({ x: 0, y: 0, width: 16, height: 24 });
  expect(low.origin).toEqual({ x: 8, y: 22 });
  expect(low.anchors.handR.x).toBe(high.anchors.handR.x / 4);
  expect(low.anchors.tether.y).toBe(high.anchors.tether.y / 4);
});
it("requires sealed suits for EVA actions and rejects invalid clocks", () => {
  expect(() => getCrewFrame(m, { ...base, action: "eva_float" })).toThrow(
    "sealed",
  );
  expect(() => getCrewFrame(m, { ...base, elapsedMs: NaN })).toThrow("finite");
});

it("exposes a detailed frame without changing the legacy pivot", () => {
  const high = getCrewFrame(m, { ...base, resolution: "detail" });
  expect(high.rect).toEqual({ x: 0, y: 0, width: 128, height: 192 });
  expect(high.origin).toEqual({ x: 64, y: 176 });
  expect(high.path).toContain("detail/");
});
