import { z } from "zod";
import raw from "../content/menu.json";
export const sceneSchema = z.enum([
  "launch",
  "orbit",
  "mars",
  "workshop",
  "event",
]);
export type SceneId = z.infer<typeof sceneSchema>;
export const actionSchema = z.enum([
  "play",
  "continue",
  "sandbox",
  "settings",
  "about",
]);
export type MenuAction = z.infer<typeof actionSchema>;
export const menuSchema = z.object({
  title: z.string(),
  version: z.string(),
  event: z.string(),
  items: z.array(
    z.object({
      id: actionSchema,
      label: z.string(),
      scene: sceneSchema,
    }),
  ),
  animation: z.object({
    width: z.number().positive(),
    height: z.number().positive(),
    fps: z.number().positive(),
    transitionMs: z.number().positive(),
    hoverDelayMs: z.number().nonnegative(),
    seed: z.number(),
  }),
  destinations: z.array(
    z.object({
      id: z.enum(["moon", "mars"]),
      name: z.string(),
      label: z.string(),
      description: z.string(),
    }),
  ),
});
export const menu = menuSchema.parse(raw);
export const preferencesSchema = z.object({
  motion: z.boolean(),
  scale: z.enum(["full", "compact"]),
});
export const saveSchema = z.object({
  destination: z.enum(["moon", "mars"]),
  mode: z.enum(["campaign", "sandbox"]),
  startedAt: z.string().datetime(),
});
export type Preferences = z.infer<typeof preferencesSchema>;
export type MissionSave = z.infer<typeof saveSchema>;
