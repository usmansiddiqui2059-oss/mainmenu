import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
const html = await readFile("dist/Mission-Control-Preview.html", "utf8");
assert(!/<script[^>]+src=/.test(html), "Preview must not request script files");
assert(!/<link[^>]+href=/.test(html), "Preview must not request stylesheets");
const dom = new JSDOM(html, {
  url: "https://mission-control.local/",
  runScripts: "outside-only",
  pretendToBeVisual: true,
});
const { window } = dom;
window.matchMedia = (query) => ({
  matches: false,
  media: query,
  addListener() {},
  removeListener() {},
  addEventListener() {},
  removeEventListener() {},
});
const context = {
  imageSmoothingEnabled: false,
  globalAlpha: 1,
  drawImage() {},
  save() {},
  restore() {},
  scale() {},
  fillRect() {},
  beginPath() {},
  moveTo() {},
  lineTo() {},
  closePath() {},
  fill() {},
  stroke() {},
  ellipse() {},
  fillText() {},
  translate() {},
  transform() {},
  clip() {},
  createRadialGradient() {
    return { addColorStop() {} };
  },
};
class ReadyImage {
  onload = null;
  onerror = null;
  set src(value) {
    queueMicrotask(() => this.onload?.());
  }
}
window.Image = ReadyImage;
context.createImageData = (w, h) => ({
  data: new Uint8ClampedArray(w * h * 4),
  width: w,
  height: h,
});
context.putImageData = () => {};
window.HTMLCanvasElement.prototype.getContext = () => context;
const script = window.document.querySelector("script[type=module]");
assert(script?.textContent, "Preview has an embedded module");
const errors = [];
window.addEventListener("error", (e) => errors.push(e.message));
window.eval(script.textContent);
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const waitFor = async (predicate) => {
  const deadline = Date.now() + 1800;
  while (!predicate() && Date.now() < deadline) await pause(20);
  assert(predicate(), "UI transition completed");
};
await pause(900);
const button = (label) =>
  [...window.document.querySelectorAll("button")].find(
    (node) =>
      (node.getAttribute("aria-label") ?? node.textContent)
        .replace(/^\d+/, "")
        .trim() === label,
  );
for (const label of [
  "Play Game",
  "Continue Game",
  "Sandbox mode",
  "Settings",
  "About the event",
])
  assert(button(label), `Missing ${label}`);
assert.equal(
  window.document.querySelector("h1").textContent,
  "MISSION CONTROL",
);
assert.equal(window.document.querySelectorAll("button").length, 5);
assert(
  !window.document.querySelector(
    "header,footer,.menu-index,.scene-caption,.scene-grain",
  ),
);
assert(
  !/(backdrop-filter|filter:\s*blur|linear-gradient)/.test(
    await readFile("src/index.css", "utf8"),
  ),
  "No scene blur or gradient grade",
);
assert(
  !/url\((['"]?)(?!data:|#)[^)]*\.woff/.test(html),
  "Font must be embedded",
);
button("Settings").click();
await pause(100);
assert(
  window.document.querySelector("[role=dialog]"),
  "Settings dialog opens in the compiled preview",
);
const toggle = window.document.querySelector("[role=switch]");
toggle.click();
await pause(50);
assert.equal(toggle.getAttribute("aria-checked"), "false");
assert.equal(
  JSON.parse(window.localStorage.getItem("mission-control-menu-v1")).state
    .preferences.motion,
  false,
);
button("Close dialog").click();
await waitFor(() => !window.document.querySelector("[role=dialog]"));
assert(
  !window.document.querySelector("[role=dialog]"),
  "Compiled dialog closes",
);
button("Sandbox mode").click();
await pause(100);
button("Enter Sandbox").click();
await waitFor(() => window.document.body.textContent.includes("Mission ready"));
assert(
  window.document.body.textContent.includes("Mission ready"),
  "Compiled sandbox reaches mission staging",
);
assert.deepEqual(errors, [], "No runtime errors");
dom.window.close();
console.log(
  "Compiled standalone preview: boot, stripped-back menu, five options, settings, persistence, modal close and sandbox passed. Canvas is mocked; this is not browser visual QA.",
);
