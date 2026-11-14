import { workshopContact } from "../src/controlroom/rig/workshop";
import { Pixels } from "../src/controlroom/pixels";
import { fitViewport } from "../src/controlroom/viewport";
import { expect, it, vi } from "vitest";
import { MenuRenderer } from "../src/controlroom/renderer";
import { safeStorage } from "../src/store/storage";
import { solveSuitPose, repairToolTip } from "../src/controlroom/rig/astronaut";
import type { ScenePlates } from "../src/controlroom/plates";
function fixture() {
  const canvas = document.createElement("canvas");
  const plates = Object.fromEntries(
    ["launch", "orbit", "mars", "workshop", "event"].map((key) => [
      key,
      canvas,
    ]),
  ) as ScenePlates;
  return { canvas, plates };
}
it("stops all scene frame scheduling while paused, resumes and disposes without leaks", () => {
  vi.useFakeTimers();
  const { canvas, plates } = fixture();
  const context = canvas.getContext("2d")!;
  const writes = vi.mocked(context.putImageData);
  const renderer = new MenuRenderer(canvas, plates);
  renderer.setMotion(false);
  const paused = writes.mock.calls.length;
  vi.advanceTimersByTime(200);
  expect(writes).toHaveBeenCalledTimes(paused);
  renderer.setScene("orbit");
  const changed = writes.mock.calls.length;
  expect(changed).toBeGreaterThan(paused);
  vi.advanceTimersByTime(200);
  expect(writes).toHaveBeenCalledTimes(changed);
  renderer.setMotion(true);
  vi.advanceTimersByTime(150);
  expect(writes.mock.calls.length).toBeGreaterThan(changed);
  renderer.dispose();
  const final = writes.mock.calls.length;
  vi.advanceTimersByTime(150);
  expect(writes).toHaveBeenCalledTimes(final);
});
it("keeps both arm and leg segment lengths identical in all poses and breathing phases", () => {
  const distance = (a: readonly number[], b: readonly number[]) =>
    Math.hypot(a[0] - b[0], a[1] - b[1]);
  for (const pose of ["float", "rest", "repair"] as const)
    for (let t = 0; t < 12; t += 0.25) {
      const j = solveSuitPose(100, 120, t, pose);
      for (const [root, joint, end] of [
        [j.shoulderL, j.elbowL, j.handL],
        [j.shoulderR, j.elbowR, j.handR],
      ]) {
        expect(distance(root, joint)).toBeCloseTo(11, 5);
        expect(distance(joint, end)).toBeCloseTo(12, 5);
      }
      for (const [side, joint, end] of [
        [-1, j.kneeL, j.footL],
        [1, j.kneeR, j.footR],
      ] as const) {
        expect(distance([j.hip[0] + side * 5, j.hip[1]], joint)).toBeCloseTo(
          16,
          5,
        );
        expect(distance(joint, end)).toBeCloseTo(16, 5);
      }
    }
});
it("keeps the menu usable when browser storage is blocked", () => {
  const set = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new DOMException("Blocked", "SecurityError");
  });
  const get = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
    throw new DOMException("Blocked", "SecurityError");
  });
  expect(() => safeStorage.setItem("blocked-test", "saved")).not.toThrow();
  expect(safeStorage.getItem("blocked-test")).toBe("saved");
  set.mockRestore();
  get.mockRestore();
});

it("frames the subject at whole pixels and covers desktop and phone viewports", () => {
  for (const [w, h] of [
    [1920, 1080],
    [1440, 900],
    [1280, 720],
    [1024, 768],
    [390, 844],
    [320, 640],
  ])
    for (const scene of [
      "launch",
      "orbit",
      "mars",
      "workshop",
      "event",
    ] as const) {
      const fit = fitViewport(w, h, scene);
      expect(Number.isInteger(fit.scale)).toBe(true);
      expect(Number.isInteger(fit.left)).toBe(true);
      expect(Number.isInteger(fit.top)).toBe(true);
      expect(fit.left).toBeLessThanOrEqual(0);
      expect(fit.left + fit.width).toBeGreaterThanOrEqual(w);
      expect(fit.top + fit.height).toBeGreaterThanOrEqual(h);
      const subject =
        { launch: 350, orbit: 393, mars: 404, workshop: 352, event: 365 }[
          scene
        ] *
          fit.scale +
        fit.left;
      expect(subject).toBeGreaterThan(0);
      expect(subject).toBeLessThan(w);
    }
});

it("reuses the pixel upload allocation across animation frames", () => {
  const p = new Pixels(4, 4),
    create = vi.fn((w: number, h: number) => ({
      data: new Uint8ClampedArray(w * h * 4),
      width: w,
      height: h,
    })),
    put = vi.fn();
  const ctx = {
    createImageData: create,
    putImageData: put,
  } as unknown as CanvasRenderingContext2D;
  p.flush(ctx);
  p.pixel(1, 1, [232, 233, 226]);
  p.flush(ctx);
  p.clear();
  p.flush(ctx);
  expect(create).toHaveBeenCalledOnce();
  expect(put).toHaveBeenCalledTimes(3);
});

it("changes the mobile camera subject only at the black point of a scene cut", () => {
  vi.useFakeTimers();
  const { canvas, plates } = fixture(),
    visible = vi.fn();
  const renderer = new MenuRenderer(canvas, plates, visible);
  renderer.setScene("orbit");
  vi.advanceTimersByTime(40);
  expect(visible).not.toHaveBeenCalled();
  vi.advanceTimersByTime(120);
  expect(visible).toHaveBeenLastCalledWith("orbit");
  renderer.setMotion(false);
  renderer.setScene("mars");
  expect(visible).toHaveBeenLastCalledWith("mars");
  renderer.dispose();
});

it("keeps the repair contact, support hand and boots planted while the driver turns", () => {
  const base = solveSuitPose(44, 72, 0, "repair");
  let moving = false;
  for (let t = 0; t < 12; t += 0.1) {
    const pose = solveSuitPose(44, 72, t, "repair");
    expect(pose.handL[0]).toBeCloseTo(base.handL[0], 8);
    expect(pose.handL[1]).toBeCloseTo(base.handL[1], 8);
    for (const key of ["footL", "footR"] as const) {
      expect(pose[key][0]).toBeCloseTo(base[key][0], 8);
      expect(pose[key][1]).toBeCloseTo(base[key][1], 8);
    }
    const contact = repairToolTip(pose);
    expect(contact).toEqual([20, 22]);
    expect(
      Math.hypot(pose.handR[0] - contact[0], pose.handR[1] - contact[1]),
    ).toBeCloseTo(6, 8);
    expect(workshopContact(t)).toEqual([304, 114]);
    if (Math.abs(pose.handR[0] - base.handR[0]) > 0.1) moving = true;
  }
  expect(moving).toBe(true);
});
