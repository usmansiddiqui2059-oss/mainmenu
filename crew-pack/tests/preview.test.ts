import { it, expect } from "vitest";
import { JSDOM } from "jsdom";
import { loadImage } from "@napi-rs/canvas";
import { readFile } from "node:fs/promises";
it("runs the embedded offline viewer and exercises crew, EVA, pause and resolution controls", async () => {
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
      w.requestAnimationFrame = (callback) => {
        pending.set(++id, callback);
        return id;
      };
      w.cancelAnimationFrame = (key) => {
        pending.delete(key);
      };
      w.addEventListener("error", (e) => errors.push(e.message));
      Object.defineProperty(w.HTMLCanvasElement.prototype, "getContext", {
        value: () => ({
          clearRect() {},
          drawImage(_image: unknown, ...args: number[]) {
            draws.push(args);
          },
          fillText() {},
          fillRect() {},
          strokeRect() {},
          beginPath() {},
          moveTo() {},
          quadraticCurveTo() {},
          stroke() {},
          imageSmoothingEnabled: false,
        }),
      });
      class DecodedImage {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        set src(value: string) {
          loadImage(value).then(
            () => this.onload?.(),
            () => this.onerror?.(),
          );
        }
      }
      Object.defineProperty(w, "Image", { value: DecodedImage });
    },
  });
  const w = dom.window,
    d = w.document,
    select = (id: string, value: string) => {
      const s = d.getElementById(id) as HTMLSelectElement;
      s.value = value;
      s.dispatchEvent(new w.Event("change", { bubbles: true }));
    };
  async function tick(time: number) {
    const callbacks = [...pending.values()];
    pending.clear();
    callbacks.forEach((fn) => fn(time));
    await new Promise((r) => setTimeout(r, 40));
  }
  expect(d.querySelectorAll("[data-crew]")).toHaveLength(8);
  await tick(0);
  await tick(16);
  expect(draws.length).toBeGreaterThan(0);
  (d.querySelector('[data-crew="sana"]') as HTMLButtonElement).click();
  expect(d.getElementById("name")!.textContent).toBe("Dr. Sana");
  select("action", "eva_repair");
  expect((d.getElementById("variant") as HTMLSelectElement).value).toBe("eva");
  select("resolution", "gameplay");
  await tick(33);
  expect(draws.some((args) => args[2] === 16 && args[3] === 24)).toBe(true);
  (d.getElementById("pause") as HTMLButtonElement).click();
  await tick(50);
  expect(pending.size).toBe(0);
  (d.getElementById("step") as HTMLButtonElement).click();
  await tick(66);
  expect(d.getElementById("status")!.textContent).toContain("Frame 2/8");
  expect(pending.size).toBe(0);
  expect(errors).toEqual([]);
  expect(html).not.toContain("https://");
  dom.window.close();
}, 20000);
