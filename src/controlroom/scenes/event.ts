import { Pixels, type Point, suit as s } from "../pixels";
/** A physical orbital teaching sculpture replaces the discarded team-logo monument. */
export function drawEventRig(p: Pixels, t: number) {
  const center: Point = [365, 126];
  p.rect(359, 159, 15, 47, s.shadow);
  p.rect(359, 159, 5, 46, s.mid);
  p.ellipse(365, 205, 21, 7, s.outline);
  p.ellipse(center[0], center[1], 31, 31, s.shadow);
  p.ellipse(center[0] - 5, center[1] - 5, 27, 27, s.mid);
  p.ellipse(center[0] - 10, center[1] - 10, 19, 20, s.light);
  // Rings are physical moving elements, using one orientation per frame and clean integer lines.
  for (let ring = 0; ring < 3; ring++) {
    const a = t * 0.12 + ring * 0.9,
      points: Point[] = [];
    for (let i = 0; i <= 96; i++) {
      const angle = (i / 96) * Math.PI * 2,
        u = Math.cos(angle) * (46 + ring * 5),
        v = Math.sin(angle) * (12 + ring * 4);
      points.push([
        center[0] + u * Math.cos(a) - v * Math.sin(a),
        center[1] + u * Math.sin(a) * 0.7 + v * Math.cos(a),
      ]);
    }
    for (let i = 1; i < points.length; i++)
      p.line(points[i - 1], points[i], ring === 0 ? s.gold : s.mid, 2);
  }
  const theta = t * 0.2,
    px = center[0] + Math.cos(theta) * 66,
    py = center[1] + Math.sin(theta) * 25;
  p.ellipse(px, py, 5, 5, s.mid);
  p.ellipse(px - 1, py - 1, 3, 3, s.white);
}
