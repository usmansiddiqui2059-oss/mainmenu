import { z } from "zod";
import { crew } from "../data";
import modelInput from "../../content/models.json";
export const directions = ["SE", "SW", "NE", "NW"] as const;
export type Direction = (typeof directions)[number];
export type Variant = "cabin" | "eva";
export type Action = "idle" | "walk";
export const FRAME = {
  width: 128,
  height: 192,
  origin: { x: 64, y: 176 },
} as const;
export const yawFor = (d: Direction) =>
  (({ S: 0, SE: 45, E: 90, NE: 135, N: 180, NW: 225, W: 270, SW: 315 })[d] *
    Math.PI) /
  180;
export const timing = {
  idle: { frames: 8, fps: 2 },
  walk: {
    frames: 8,
    fps: 10,
    stanceFraction: 0.6,
    footTravel: 11,
    swingClearance: 5,
  },
};
const dimensions = z.object({
  shoulderHalfWidth: z.number().positive(),
  hipHalfWidth: z.number().positive(),
  headHeightPx: z.number().positive(),
});
const parsed = z.record(z.string(), dimensions).parse(modelInput);
export const models = Object.fromEntries(
  crew.map((c) => [
    c.id,
    { id: c.id, modelScale: c.heightCm / 178, ...parsed[c.id], role: c.role },
  ]),
) as Record<
  (typeof crew)[number]["id"],
  {
    id: (typeof crew)[number]["id"];
    modelScale: number;
    shoulderHalfWidth: number;
    hipHalfWidth: number;
    headHeightPx: number;
    role: (typeof crew)[number]["role"];
  }
>;
export type Player = (typeof models)[keyof typeof models];
export const suit = {
  materials: {
    navy: ["282c35", "515966", "b1b7b8", "e8e9e2"],
    ivory: ["515966", "8d969e", "d4d5cd", "faf4df"],
    copper: ["3b414b", "515966", "8d969e", "bdc8ce"],
    rubber: ["070b12", "181a20", "3b414b", "515966"],
    metal: ["282c35", "515966", "8d969e", "bdc8ce"],
    visor: ["070b12", "101a29", "20314a", "365471"],
    dark: ["070b12", "070b12", "181a20", "282c35"],
  } as Record<string, string[]>,
};
