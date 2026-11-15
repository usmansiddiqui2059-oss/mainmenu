export type Color = readonly [number, number, number];
export type Point = readonly [number, number];
/** Integer raster primitives. Dynamic sprites contain no anti-aliased or translucent pixels. */
export class Pixels {
  readonly data: Uint8ClampedArray;
  clipped = 0;
  private uploads = new WeakMap<CanvasRenderingContext2D, ImageData>();
  constructor(
    readonly width: number,
    readonly height: number,
  ) {
    this.data = new Uint8ClampedArray(width * height * 4);
  }
  clear() {
    this.data.fill(0);
  }
  pixel(x: number, y: number, color: Color) {
    x = Math.round(x);
    y = Math.round(y);
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
      this.clipped++;
      return;
    }
    const i = (y * this.width + x) * 4;
    this.data[i] = color[0];
    this.data[i + 1] = color[1];
    this.data[i + 2] = color[2];
    this.data[i + 3] = 255;
  }
  rect(x: number, y: number, w: number, h: number, color: Color) {
    x = Math.round(x);
    y = Math.round(y);
    w = Math.round(w);
    h = Math.round(h);
    for (let j = Math.max(0, y); j < Math.min(this.height, y + h); j++)
      for (let i = Math.max(0, x); i < Math.min(this.width, x + w); i++)
        this.pixel(i, j, color);
  }
  line(a: Point, b: Point, color: Color, width = 1) {
    let x = Math.round(a[0]),
      y = Math.round(a[1]);
    const tx = Math.round(b[0]),
      ty = Math.round(b[1]),
      dx = Math.abs(tx - x),
      dy = -Math.abs(ty - y),
      sx = x < tx ? 1 : -1,
      sy = y < ty ? 1 : -1;
    let error = dx + dy;
    for (;;) {
      this.rect(
        x - Math.floor(width / 2),
        y - Math.floor(width / 2),
        width,
        width,
        color,
      );
      if (x === tx && y === ty) break;
      const e = 2 * error;
      if (e >= dy) {
        error += dy;
        x += sx;
      }
      if (e <= dx) {
        error += dx;
        y += sy;
      }
    }
  }
  ellipse(cx: number, cy: number, rx: number, ry: number, color: Color) {
    cx = Math.round(cx);
    cy = Math.round(cy);
    for (let y = -Math.ceil(ry); y <= ry; y++) {
      const extent = Math.floor(
        rx * Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry))),
      );
      this.rect(cx - extent, cy + y, extent * 2 + 1, 1, color);
    }
  }
  poly(points: readonly Point[], color: Color) {
    const lo = Math.round(Math.min(...points.map((p) => p[1]))),
      hi = Math.round(Math.max(...points.map((p) => p[1])));
    for (let y = lo; y <= hi; y++) {
      const crossings: number[] = [];
      for (let i = 0; i < points.length; i++) {
        const a = points[i],
          b = points[(i + 1) % points.length];
        if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y))
          crossings.push(a[0] + ((y - a[1]) * (b[0] - a[0])) / (b[1] - a[1]));
      }
      crossings.sort((a, b) => a - b);
      for (let i = 0; i < crossings.length; i += 2)
        this.rect(
          Math.ceil(crossings[i]),
          y,
          Math.floor(crossings[i + 1]) - Math.ceil(crossings[i]) + 1,
          1,
          color,
        );
    }
  }
  flush(ctx: CanvasRenderingContext2D) {
    let image = this.uploads.get(ctx);
    if (!image) {
      image = ctx.createImageData(this.width, this.height);
      this.uploads.set(ctx, image);
    }
    image.data.set(this.data);
    ctx.putImageData(image, 0, 0);
  }
}
export const suit = {
  outline: [7, 11, 18],
  shadow: [59, 65, 75],
  mid: [141, 150, 158],
  light: [212, 213, 205],
  white: [232, 233, 226],
  highlight: [250, 244, 223],
  visor: [16, 26, 41],
  reflect: [54, 84, 113],
  gold: [201, 157, 85],
  red: [145, 75, 70],
  joint: [81, 89, 102],
  hose: [177, 183, 184],
} as const;
