import { fitViewport } from "./viewport";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { MenuRenderer } from "./renderer";
import { loadScenePlates, plateUrls } from "./plates";
import { type SceneId } from "../schemas/menu";
export function MenuScene({
  scene,
  motion,
}: {
  scene: SceneId;
  motion: boolean;
}) {
  const canvas = useRef<HTMLCanvasElement>(null),
    renderer = useRef<MenuRenderer | null>(null),
    stage = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion(),
    latest = useRef({ scene, motion: motion && !reduced });
  latest.current = { scene, motion: motion && !reduced };
  const [cameraScene, setCameraScene] = useState<SceneId>("launch");
  const [ready, setReady] = useState(false),
    [viewport, setViewport] = useState({
      w: window.innerWidth,
      h: window.innerHeight,
    });
  useEffect(() => {
    let active = true;
    loadScenePlates()
      .then((plates) => {
        if (!active || !canvas.current) return;
        renderer.current = new MenuRenderer(canvas.current, plates, (value) => {
          if (active) setCameraScene(value);
        });
        renderer.current.setMotion(latest.current.motion);
        renderer.current.setScene(latest.current.scene);
        setReady(true);
      })
      .catch((error) => {
        console.error("Mission Control scene initialization failed", error);
      });
    return () => {
      active = false;
      renderer.current?.dispose();
    };
  }, []);
  useEffect(() => {
    const resize = () => {
      if (stage.current) {
        const rect = stage.current.getBoundingClientRect();
        setViewport({
          w: Math.round(rect.width) || window.innerWidth,
          h: Math.round(rect.height) || window.innerHeight,
        });
      }
    };
    resize();
    window.addEventListener("resize", resize);
    const observer =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(resize);
    if (stage.current) observer?.observe(stage.current);
    return () => {
      window.removeEventListener("resize", resize);
      observer?.disconnect();
    };
  }, []);
  useEffect(
    () => renderer.current?.setMotion(motion && !reduced),
    [motion, reduced],
  );
  useEffect(() => renderer.current?.setScene(scene), [scene]);
  const { scale: _, ...style } = fitViewport(
    viewport.w,
    viewport.h,
    cameraScene,
  );
  return (
    <div
      className="scene-stage"
      ref={stage}
      aria-hidden="true"
      data-ready={ready}
    >
      <img
        className="scene-poster"
        src={plateUrls.launch}
        style={style}
        alt=""
      />
      <canvas
        ref={canvas}
        style={{ ...style, visibility: ready ? "visible" : "hidden" }}
      />
    </div>
  );
}
