import { z } from "zod";
import {
  crewSchema,
  crewIds,
  animationSchema,
  directions,
  variants,
  roleSchema,
} from "./data";
const point = z.object({ x: z.number(), y: z.number() });
export const manifestSchema = z.object({
  version: z.literal("1.1.0"),
  palette: z.array(z.string()).length(64),
  frame: z.object({
    width: z.literal(64),
    height: z.literal(96),
    origin: point,
  }),
  detailFrame: z.object({
    width: z.literal(128),
    height: z.literal(192),
    origin: point,
  }),
  movement: z.object({
    worldUnitsPerWalkCycle: z.number(),
    pixelsPerUnitMaster: z.literal(1),
  }),
  gameplayFrame: z.object({
    width: z.literal(16),
    height: z.literal(24),
    origin: point,
  }),
  directions: z.array(z.enum(directions)).length(4),
  variants: z.array(z.enum(variants)).length(2),
  roles: z.object({
    power: roleSchema,
    comms: roleSchema,
    science: roleSchema,
    launch: roleSchema,
  }),
  crew: z.array(crewSchema).length(8),
  animations: z.array(animationSchema).length(11),
  atlases: z
    .array(
      z.object({
        crew: z.enum(crewIds),
        variant: z.enum(variants),
        direction: z.enum(directions),
        master: z.string(),
        detail: z.string(),
        gameplay: z.string(),
        rows: z
          .array(
            z.object({
              action: animationSchema.shape.id,
              fps: z.number(),
              loop: z.boolean(),
              frames: z
                .array(
                  z.object({
                    x: z.number(),
                    y: z.number(),
                    width: z.number(),
                    height: z.number(),
                    durationMs: z.number(),
                    anchors: z.object({
                      handL: point,
                      handR: point,
                      footL: point,
                      footR: point,
                      toolTip: point.nullable(),
                      tether: point,
                    }),
                    footPlant: z.tuple([z.boolean(), z.boolean()]),
                  }),
                )
                .length(8),
            }),
          )
          .length(11),
      }),
    )
    .length(64),
});
export type Manifest = z.infer<typeof manifestSchema>;
