import launch from "../../public/assets/backgrounds/title.png?inline";
import orbit from "../../public/assets/backgrounds/crew-cabin.png?inline";
import mars from "../../public/assets/backgrounds/mars-surface.png?inline";
import workshop from "../../public/assets/backgrounds/maintenance-bay.png?inline";
import event from "../../public/assets/backgrounds/event-observatory.png?inline";
import type { SceneId } from "../schemas/menu";
export const plateUrls = { launch, orbit, mars, workshop, event };
export type ScenePlates = Record<SceneId, CanvasImageSource>;
let pending: Promise<ScenePlates> | null = null;
export function loadScenePlates() {
  return (pending ??= Promise.all(
    Object.entries(plateUrls).map(
      ([key, url]) =>
        new Promise<[string, HTMLImageElement]>((resolve, reject) => {
          const image = new Image();
          image.onload = () => resolve([key, image]);
          image.onerror = () =>
            reject(new Error(`Could not load scene plate: ${key}`));
          image.src = url;
        }),
    ),
  ).then((entries) => Object.fromEntries(entries) as ScenePlates));
}
