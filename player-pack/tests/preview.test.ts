import { it, expect } from "vitest";
import { JSDOM } from "jsdom";
import { loadImage } from "@napi-rs/canvas";
import { readFile } from "node:fs/promises";
it("runs the downloadable preview and switches choices, all directions, suits, pause, step and low resolution", async () => {
  const html = await readFile("preview/index.html", "utf8"),
    pending = new Map<number, FrameRequestCallback>(),
    errors: string[] = [],
    draws: number[][] = [];
  let id = 0;
  const dom = new JSDOM(html, {
    runScripts: "dangerously",
    pretendToBeVisual: true,
    beforeParse(w) {
      Object.defineProperty(w, "matchMedia", {
        value: () => ({ matches: false }),
      });
      w.requestAnimationFrame = (fn) => {
        pending.set(++id, fn);
        return id;
      };
      w.cancelAnimationFrame = (n) => {
        pending.delete(n);
      };
      w.addEventListener("error", (e) => errors.push(e.message));
      Object.defineProperty(w.HTMLCanvasElement.prototype, "getContext", {
        value: () => ({
          clearRect() {},
          drawImage(_im: unknown, ...args: number[]) {
            draws.push(args);
          },
          fillText() {},
          beginPath() {},
          moveTo() {},
          lineTo() {},
          stroke() {},
        }),
      });
      class DecodedImage {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        set src(v: string) {
          loadImage(v).then(
            () => this.onload?.(),
            () => this.onerror?.(),
          );
        }
      }
      Object.defineProperty(w, "Image", { value: DecodedImage });
    },
  });
  const d = dom.window.document,
    tick = async (t: number) => {
      const q = [...pending.values()];
      pending.clear();
      q.forEach((f) => f(t));
      await new Promise((r) => setTimeout(r, 40));
    },
    select = (id: string, value: string) => {
      const el = d.getElementById(id) as HTMLSelectElement;
      el.value = value;
      el.dispatchEvent(new dom.window.Event("change"));
    };
  expect(d.querySelectorAll("[data-player]")).toHaveLength(2);
  expect(d.querySelectorAll("[data-direction]")).toHaveLength(8);
  await tick(10);
  expect(draws.length).toBeGreaterThan(0);
  (d.querySelector('[data-player="player_male"]') as HTMLButtonElement).click();
  select("action", "walk");
  select("variant", "eva");
  select("resolution", "gameplay");
  for (const b of d.querySelectorAll("[data-direction]"))
    (b as HTMLButtonElement).click();
  await tick(20);
  expect(d.getElementById("status")!.textContent).toContain("player_male");
  expect(draws.some((a) => a[2] === 16 && a[3] === 24)).toBe(true);
  (d.getElementById("pause") as HTMLButtonElement).click();
  await tick(30);
  expect(pending.size).toBe(0);
  (d.getElementById("step") as HTMLButtonElement).click();
  await tick(40);
  expect(d.getElementById("status")!.textContent).toContain("Frame 2/12");
  expect(errors).toEqual([]);
  expect(html).not.toContain("https://");
  dom.window.close();
}, 20000);
