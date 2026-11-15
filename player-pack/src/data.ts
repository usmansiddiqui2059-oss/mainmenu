import { z } from "zod";
import playersInput from "../content/players.json";
import suitInput from "../content/suit.json";
import timingInput from "../content/animations.json";
export const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"] as const;
export type Direction = (typeof directions)[number];
export const variants = ["cabin", "eva"] as const;
export type Variant = (typeof variants)[number];
export const actions = ["idle", "walk"] as const;
export type Action = (typeof actions)[number];
export const playerIds = ["player_female", "player_male"] as const;
export type PlayerId = (typeof playerIds)[number];
const hex = z.string().regex(/^[0-9a-f]{6}$/);
export const playerSchema = z.object({
  id: z.enum(playerIds),
  label: z.string(),
  gender: z.enum(["woman", "man"]),
  heightCm: z.number(),
  modelScale: z.number().positive(),
  shoulderHalfWidth: z.number().positive(),
  hipHalfWidth: z.number().positive(),
  headHeightPx: z.number().positive(),
  appearance: z.string(),
  stance: z.string(),
});
export const players = z.array(playerSchema).length(2).parse(playersInput);
export type Player = z.infer<typeof playerSchema>;
export const suit = z
  .object({
    name: z.string(),
    description: z.string(),
    paletteName: z.string(),
    materials: z.record(z.string(), z.array(hex).min(3).max(4)),
  })
  .parse(suitInput);
export const timing = z
  .object({
    idle: z.object({
      frames: z.literal(8),
      fps: z.number().positive(),
      loop: z.literal(true),
      description: z.string(),
    }),
    walk: z.object({
      frames: z.literal(12),
      fps: z.number().positive(),
      loop: z.literal(true),
      description: z.string(),
      stanceFraction: z.number().min(0.5).max(0.8),
      footTravel: z.number().positive(),
      swingClearance: z.number().positive(),
    }),
  })
  .parse(timingInput);
export const FRAME = {
  width: 128,
  height: 192,
  origin: { x: 64, y: 168 },
} as const;
export const yawFor = (d: Direction) =>
  (({ S: 0, SE: 45, E: 90, NE: 135, N: 180, NW: 225, W: 270, SW: 315 })[d] *
    Math.PI) /
  180;
export const round = (n: number) => Math.round(n * 1000) / 1000;
export const ROOT_DISTANCE =
  timing.walk.footTravel / timing.walk.stanceFraction;
export const WORLD_SPEED =
  (ROOT_DISTANCE * timing.walk.fps) / timing.walk.frames;
