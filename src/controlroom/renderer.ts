import { menu, type SceneId } from "../schemas/menu";
import { Pixels } from "./pixels";
import { animateScene } from "./scenes/animate";
import type { ScenePlates } from "./plates";
/** One owner for frame timing, scene transitions, sprite raster and disposal. No React state per frame. */
export class MenuRenderer {
  private context: CanvasRenderingContext2D;
  private frame = 0;
  private last = 0;
  private lastPaint = 0;
  private time = 0;
  private enteredAt = 0;
  private current: SceneId = "launch";
  private displayed: SceneId = "launch";
  private transitionStart: number | null = null;
  private snapshot: HTMLCanvasElement;
  private foreground: HTMLCanvasElement;
  private foregroundContext: CanvasRenderingContext2D;
  private pixels: Pixels;
  private motion = true;
  private disposed = false;
  constructor(
    private canvas: HTMLCanvasElement,
    private plates: ScenePlates,
    private onSceneVisible?: (scene: SceneId) => void,
  ) {
    canvas.width = menu.animation.width;
    canvas.height = menu.animation.height;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) throw new Error("Canvas is unavailable");
    this.context = context;
    context.imageSmoothingEnabled = false;
    this.snapshot = document.createElement("canvas");
    this.foreground = document.createElement("canvas");
    for (const item of [this.snapshot, this.foreground]) {
      item.width = canvas.width;
      item.height = canvas.height;
    }
    this.foregroundContext = this.foreground.getContext("2d")!;
    this.pixels = new Pixels(canvas.width, canvas.height);
    this.last = this.lastPaint = performance.now();
    this.paint(this.last);
    this.frame = requestAnimationFrame(this.tick);
    document.addEventListener("visibilitychange", this.visibility);
  }
  setScene(scene: SceneId) {
    if (scene === this.current) return;
    this.snapshot.getContext("2d")?.drawImage(this.canvas, 0, 0);
    this.current = scene;
    this.enteredAt = this.time;
    this.transitionStart = this.motion ? performance.now() : null;
    this.paint(performance.now());
  }
  setMotion(motion: boolean) {
    if (this.motion === motion) return;
    this.motion = motion;
    cancelAnimationFrame(this.frame);
    if (!motion) {
      this.transitionStart = null;
      this.paint(performance.now());
    } else if (!document.hidden) {
      this.last = this.lastPaint = performance.now();
      this.frame = requestAnimationFrame(this.tick);
    }
  }
  private paint(now: number) {
    const c = this.context,
      progress =
        this.transitionStart === null
          ? 1
          : Math.min(
              1,
              (now - this.transitionStart) / menu.animation.transitionMs,
            );
    c.globalAlpha = 1;
    if (progress < 0.35) {
      c.drawImage(this.snapshot, 0, 0);
    } else {
      if (this.displayed !== this.current) {
        this.displayed = this.current;
        this.onSceneVisible?.(this.current);
      }
      c.drawImage(
        this.plates[this.current],
        0,
        0,
        menu.animation.width,
        menu.animation.height,
      );
      this.pixels.clear();
      animateScene(
        this.pixels,
        this.current,
        this.motion ? this.time - this.enteredAt : 0,
      );
      this.pixels.flush(this.foregroundContext);
      c.drawImage(this.foreground, 0, 0);
    }
    // A short cut through darkness avoids ghosting, color mixing, and a slideshow crossfade.
    if (progress < 1) {
      c.globalAlpha =
        progress < 0.35 ? progress / 0.35 : 1 - (progress - 0.35) / 0.65;
      c.fillStyle = "#030508";
      c.fillRect(0, 0, this.canvas.width, this.canvas.height);
      c.globalAlpha = 1;
    } else this.transitionStart = null;
  }
  private tick = (now: number) => {
    if (this.disposed || !this.motion || document.hidden) return;
    const interval = 1000 / menu.animation.fps,
      elapsed = now - this.last;
    if (elapsed >= interval) {
      this.time += Math.min((now - this.lastPaint) / 1000, 0.1);
      this.paint(now);
      this.lastPaint = now;
      this.last = now - (elapsed % interval);
    }
    this.frame = requestAnimationFrame(this.tick);
  };
  private visibility = () => {
    cancelAnimationFrame(this.frame);
    if (!document.hidden && this.motion) {
      this.last = this.lastPaint = performance.now();
      this.frame = requestAnimationFrame(this.tick);
    }
  };
  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.frame);
    document.removeEventListener("visibilitychange", this.visibility);
  }
}
