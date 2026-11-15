import { z } from "zod";
import crewInput from "../content/crew.json";
import roleInput from "../content/roles.json";
import animationInput from "../content/animations.json";
export const crewIds = [
  "ayesha",
  "maya",
  "bilal",
  "lin",
  "sana",
  "kofi",
  "omar",
  "zara",
] as const;
export const directions = ["se", "sw", "ne", "nw"] as const;
export const variants = ["cabin", "eva"] as const;
export const crewSchema = z.object({
  id: z.enum(crewIds),
  name: z.string(),
  role: z.enum(["power", "comms", "science", "launch"]),
  trait: z.enum(["Practical", "Leader", "Thinker"]),
  gender: z.enum(["woman", "man"]),
  ageBand: z.string(),
  heightCm: z.number(),
  heightPx: z.number().min(70).max(84),
  build: z.string(),
  appearance: z.object({
    skin: z.string(),
    hair: z.string(),
    detail: z.string(),
  }),
  personality: z.string(),
  signature: z.string(),
  tempo: z.number().positive(),
  phase: z.number(),
  headSource: z.tuple([z.number(), z.number(), z.number(), z.number()]),
  bodySource: z.tuple([z.number(), z.number(), z.number(), z.number()]),
});
export const roleSchema = z.object({
  name: z.string(),
  accent: z.string().regex(/^[0-9a-f]{6}$/),
  highlight: z.string().regex(/^[0-9a-f]{6}$/),
  tool: z.string(),
  work: z.string(),
});
export const animationSchema = z.object({
  id: z.enum([
    "idle",
    "walk",
    "work",
    "talk",
    "think",
    "concern",
    "celebrate",
    "point",
    "signature",
    "eva_float",
    "eva_repair",
  ]),
  label: z.string(),
  fps: z.number().positive(),
  frames: z.literal(8),
  loop: z.boolean(),
});
export const crew = z.array(crewSchema).length(8).parse(crewInput);
export const roles = z
  .object({
    power: roleSchema,
    comms: roleSchema,
    science: roleSchema,
    launch: roleSchema,
  })
  .parse(roleInput);
export const animations = z
  .array(animationSchema)
  .length(11)
  .parse(animationInput);
export type Crew = z.infer<typeof crewSchema>;
export type Direction = (typeof directions)[number];
export type Variant = (typeof variants)[number];
export type Action = z.infer<typeof animationSchema>["id"];
export const FRAME = {
  width: 64,
  height: 96,
  origin: { x: 32, y: 88 },
} as const;
import rigInput from "../content/rig.json";
const point = z.tuple([z.number(), z.number()]);
export const rigSchema = z.object({
  neck: point,
  hip: point,
  shoulderL: point,
  shoulderR: point,
  elbowL: point,
  elbowR: point,
  handL: point,
  handR: point,
  kneeL: point,
  kneeR: point,
  footL: point,
  footR: point,
});
export const neutralRigs = z.record(z.enum(crewIds), rigSchema).parse(rigInput);
export type Skeleton = z.infer<typeof rigSchema>;
