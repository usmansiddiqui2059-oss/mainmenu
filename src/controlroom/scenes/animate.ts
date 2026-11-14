import { drawWorkshopTechnician } from "../rig/workshop";
import { Pixels, suit as s, type Point } from "../pixels";
import { drawAstronaut } from "../rig/astronaut";
import { drawLaunchRig } from "../rig/shuttle";
import { drawEventRig } from "./event";
import type { SceneId } from "../../schemas/menu";
export function animateScene(p: Pixels, scene: SceneId, t: number) {
  if (scene === "launch") {
    drawLaunchRig(p, t);
    return;
  }
  if (scene === "event") {
    drawEventRig(p, t);
    return;
  }
  if (scene === "orbit") {
    // A slack tether is rooted to the cabin and follows the same floating crew transform.
    const y = 210 + Math.sin(t * 0.5) * 2;
    const points: Point[] = [
      [345, 215],
      [352, 223],
      [367, 230],
      [381, 225],
      [393, y - 24],
    ];
    for (let i = 1; i < points.length; i++)
      p.line(points[i - 1], points[i], s.mid);
    drawAstronaut(p, 393, 210, t, "float");
    return;
  }
  if (scene === "mars") {
    drawAstronaut(p, 404, 220, t, "rest");
    // A mast camera rotates slowly as one linked assembly; no decorative airborne particle layer.
    const a = Math.sin(t * 0.18);
    p.rect(264, 110, 3, 20, s.shadow);
    p.rect(260 + Math.round(a * 2), 108, 11, 5, s.mid);
    p.rect(261 + Math.round(a * 2), 109, 3, 3, s.visor);
    return;
  }
  drawWorkshopTechnician(p, t);
}
