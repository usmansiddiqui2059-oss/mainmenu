import { z } from "zod";
import { playerSchema, directions, variants, actions } from "./data";
const point = z.object({ x: z.number(), y: z.number() });
export const manifestSchema = z.object({
  version: z.literal("1.0.0"),
  frame: z.object({
    width: z.literal(128),
    height: z.literal(192),
    origin: point,
  }),
  compactFrame: z.object({
    width: z.literal(64),
    height: z.literal(96),
    origin: point,
  }),
  gameplayFrame: z.object({
    width: z.literal(16),
    height: z.literal(24),
    origin: point,
  }),
  palette: z.array(z.string()).length(64),
  players: z.array(playerSchema).length(2),
  directions: z.array(z.enum(directions)).length(8),
  projection: z.object({
    pixelsPerUnit: z.literal(2),
    groundYScale: z.literal(0.5),
    heightScale: z.number(),
    north: z.string(),
  }),
  movement: z.object({
    walkCycleSeconds: z.number(),
    worldUnitsPerCycle: z.number(),
    worldUnitsPerSecond: z.number(),
  }),
  sheets: z
    .array(
      z.object({
        player: playerSchema.shape.id,
        variant: z.enum(variants),
        action: z.enum(actions),
        path: z.string(),
        compactPath: z.string(),
        gameplayPath: z.string(),
        frameCount: z.number(),
        fps: z.number(),
        loop: z.literal(true),
        rows: z
          .array(
            z.object({
              direction: z.enum(directions),
              yawDegrees: z.number(),
              frames: z
                .array(
                  z.object({
                    rect: z.object({
                      x: z.number(),
                      y: z.number(),
                      width: z.number(),
                      height: z.number(),
                    }),
                    phase: z.number(),
                    footPlant: z.tuple([z.boolean(), z.boolean()]),
                    anchors: z.object({
                      footL: point,
                      footR: point,
                      handL: point,
                      handR: point,
                      tether: point,
                    }),
                    eyePixels: z.number(),
                  }),
                )
                .min(8)
                .max(12),
            }),
          )
          .length(8),
      }),
    )
    .length(8),
});
export type Manifest = z.infer<typeof manifestSchema>;
