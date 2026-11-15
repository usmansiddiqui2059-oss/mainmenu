import { models } from "./human/data";
import { renderPlayer } from "./human/render";
import { project } from "./human/raster";
import { createCrewPose } from "./pose";
import { type Crew, type Action, type Direction, type Variant } from "./data";
import { Pixels } from "./pixels";
export function renderCrew(
  person: Crew,
  action: Action,
  phase: number,
  direction: Direction,
  variant: Variant,
) {
  const facing = ({ se: "SE", sw: "SW", ne: "NE", nw: "NW" } as const)[
      direction
    ],
    pose = createCrewPose(person, action, phase),
    result = renderPlayer(
      models[person.id],
      variant,
      facing,
      action === "walk" ? "walk" : "idle",
      phase,
      pose,
    ),
    detail = result.pixels,
    pixels = new Pixels(64, 96);
  for (let y = 0; y < 96; y++)
    for (let x = 0; x < 64; x++) {
      const i = ((y * 2 + 1) * 128 + x * 2 + 1) * 4;
      if (detail.data[i + 3])
        pixels.pixel(x, y, [
          detail.data[i],
          detail.data[i + 1],
          detail.data[i + 2],
        ]);
    }
  return {
    pixels,
    detailPixels: detail,
    pose,
    bounds: result.bounds,
    tags: result.tags,
    project: (p: readonly [number, number, number]) => {
      const q = result.project(p);
      return { x: q.x / 2, y: q.y / 2 };
    },
  };
}
