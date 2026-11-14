import { Pixels, suit as s, type Point } from "../pixels";
import { drawAstronaut, solveSuitPose, repairToolTip } from "./astronaut";
/** Foreground perspective: the same suit is doubled to match this bench's human scale. */
export const workshopPlacement = {
  origin: [264, 70] as Point,
  scale: 2,
  root: [44, 72] as Point,
} as const;
const sprite = new Pixels(88, 88);
export function workshopContact(time: number): Point {
  const j = solveSuitPose(...workshopPlacement.root, time, "repair"),
    tip = repairToolTip(j);
  return [
    workshopPlacement.origin[0] + tip[0] * 2,
    workshopPlacement.origin[1] + tip[1] * 2,
  ];
}
export function drawWorkshopTechnician(p: Pixels, time: number) {
  sprite.clear();
  drawAstronaut(sprite, ...workshopPlacement.root, time, "repair");
  for (let y = 0; y < sprite.height; y++)
    for (let x = 0; x < sprite.width; x++) {
      const i = (y * sprite.width + x) * 4;
      if (!sprite.data[i + 3]) continue;
      p.rect(
        workshopPlacement.origin[0] + x * 2,
        workshopPlacement.origin[1] + y * 2,
        2,
        2,
        [sprite.data[i], sprite.data[i + 1], sprite.data[i + 2]],
      );
    }
  const tip = workshopContact(time);
  if (time % 11 > 5 && time % 11 < 5.1) {
    p.line([tip[0] - 2, tip[1]], [tip[0] + 2, tip[1] - 1], s.gold);
    p.pixel(tip[0], tip[1], s.highlight);
  }
}
