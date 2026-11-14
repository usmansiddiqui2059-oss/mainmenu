import { menu, type SceneId } from "../schemas/menu";
const subjects = {
  launch: 350,
  orbit: 393,
  mars: 404,
  workshop: 352,
  event: 365,
} as const;
/** Overscan at an integer scale; subject framing also lands on whole screen pixels. */
export function fitViewport(
  viewportWidth: number,
  viewportHeight: number,
  scene: SceneId,
) {
  const scale = Math.max(
    1,
    Math.ceil(viewportWidth / menu.animation.width),
    Math.ceil(viewportHeight / menu.animation.height),
  );
  const width = menu.animation.width * scale,
    height = menu.animation.height * scale;
  const left =
    viewportWidth < 650
      ? Math.max(
          viewportWidth - width,
          Math.min(
            0,
            Math.round(viewportWidth * 0.5 - subjects[scene] * scale),
          ),
        )
      : Math.floor((viewportWidth - width) * 0.7);
  return {
    scale,
    width,
    height,
    left,
    top: Math.floor((viewportHeight - height) / 2),
  };
}
