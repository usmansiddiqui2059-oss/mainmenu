import { vi, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
if (typeof window !== "undefined") {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
  window.requestAnimationFrame = (cb) =>
    window.setTimeout(() => cb(performance.now()), 16);
  window.cancelAnimationFrame = (id) => window.clearTimeout(id);
  class ReadyImage {
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    set src(_value: string) {
      queueMicrotask(() => this.onload?.());
    }
  }
  globalThis.Image = ReadyImage as unknown as typeof Image;
  const canvasContext = {
    imageSmoothingEnabled: false,
    globalAlpha: 1,
    drawImage: vi.fn(),
    createImageData: (w: number, h: number) => ({
      data: new Uint8ClampedArray(w * h * 4),
      width: w,
      height: h,
    }),
    putImageData: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    scale: vi.fn(),
    fillRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    ellipse: vi.fn(),
    fillText: vi.fn(),
    translate: vi.fn(),
    transform: vi.fn(),
    clip: vi.fn(),
    createRadialGradient: () => ({ addColorStop: vi.fn() }),
  };
  HTMLCanvasElement.prototype.getContext = vi.fn(
    () => canvasContext,
  ) as unknown as typeof HTMLCanvasElement.prototype.getContext;
}
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
