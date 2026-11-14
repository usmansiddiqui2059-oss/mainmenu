import { useCallback, useState } from "react";
import { AnimatePresence } from "motion/react";
import {
  menu,
  type MenuAction,
  type MissionSave,
  type SceneId,
} from "../schemas/menu";
import { useMenuStore } from "../store/menuStore";
import { MenuScene } from "../controlroom/MenuScene";
import { MenuOptions } from "../ui/MenuOptions";
import { Modal } from "../ui/Modal";
import { Arrow } from "../ui/Icons";
import { Settings } from "./Settings";
import { About } from "./About";
import { Expedition, Ready, type MissionCallbacks } from "./Expedition";
export function Title(callbacks: MissionCallbacks) {
  const [selected, setSelected] = useState<MenuAction | null>(null),
    [dialog, setDialog] = useState<MenuAction | null>(null),
    [ready, setReady] = useState<MissionSave | null>(null);
  const preferences = useMenuStore((s) => s.preferences),
    demoSave = useMenuStore((s) => s.save),
    saveMission = useMenuStore((s) => s.saveMission);
  const save =
    callbacks.savedMission === undefined ? demoSave : callbacks.savedMission;
  const action =
    dialog ??
    (ready ? (ready.mode === "sandbox" ? "sandbox" : "play") : selected);
  const scene: SceneId = action
    ? menu.items.find((item) => item.id === action)!.scene
    : "launch";
  const close = useCallback(() => {
    setDialog(null);
    setReady(null);
  }, []);
  const activate = (id: MenuAction) => {
    setSelected(id);
    if (id === "continue" && save) {
      if (callbacks.onContinueGame) callbacks.onContinueGame(save);
      else setReady(save);
    } else setDialog(id);
  };
  const start = (mission: MissionSave) => {
    saveMission(mission);
    const callback =
      mission.mode === "sandbox" ? callbacks.onSandbox : callbacks.onNewGame;
    setDialog(null);
    if (callback) callback(mission);
    else setReady(mission);
  };
  const title = ready
    ? "Mission ready"
    : dialog === "settings"
      ? "Settings"
      : dialog === "about"
        ? "About the event"
        : dialog === "sandbox"
          ? "Sandbox mode"
          : dialog === "continue"
            ? "Continue Game"
            : "New Game";
  return (
    <div className={`mc-menu interface-${preferences.scale}`}>
      <MenuScene scene={scene} motion={preferences.motion} />
      <main
        className="title-menu"
        inert={!!dialog || !!ready}
        data-obscured={!!dialog || !!ready}
      >
        <h1>MISSION CONTROL</h1>
        <MenuOptions
          selected={selected}
          hasSave={!!save}
          onSelect={setSelected}
          onActivate={activate}
        />
      </main>
      <AnimatePresence>
        {(dialog || ready) && (
          <Modal
            key="submenu"
            title={title}
            viewKey={ready ? "ready" : dialog!}
            onClose={close}
          >
            {ready ? (
              <Ready save={ready} onBack={close} />
            ) : dialog === "settings" ? (
              <Settings />
            ) : dialog === "about" ? (
              <About />
            ) : dialog === "continue" ? (
              <>
                <p className="dialog-intro">No saved mission on this device.</p>
                <button
                  className="primary-button"
                  onClick={() => setDialog("play")}
                >
                  Start a new game
                  <Arrow />
                </button>
              </>
            ) : (
              <Expedition
                mode={dialog === "sandbox" ? "sandbox" : "campaign"}
                onReady={start}
                hasSave={!!save}
              />
            )}
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
