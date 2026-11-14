import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import { useMenuStore } from "../store/menuStore";
export function Settings() {
  const preferences = useMenuStore((s) => s.preferences),
    set = useMenuStore((s) => s.setPreference),
    reduced = useReducedMotion();
  const [full, setFull] = useState(!!document.fullscreenElement),
    [message, setMessage] = useState("");
  useEffect(() => {
    const changed = () => setFull(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", changed);
    return () => document.removeEventListener("fullscreenchange", changed);
  }, []);
  const fullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
      setMessage("");
    } catch {
      setMessage("Full screen is unavailable in this browser.");
    }
  };
  return (
    <div className="settings-content">
      <div className="setting-row">
        <div>
          <label id="animation-label">Scene animation</label>
          {reduced && <p>Your device uses reduced motion.</p>}
        </div>
        <button
          type="button"
          role="switch"
          aria-labelledby="animation-label"
          aria-checked={preferences.motion && !reduced}
          disabled={!!reduced}
          className="toggle"
          data-on={preferences.motion && !reduced}
          onClick={() => set("motion", !preferences.motion)}
        >
          <span />
        </button>
      </div>
      <div className="setting-row">
        <label htmlFor="scale">Menu text</label>
        <select
          id="scale"
          value={preferences.scale}
          onChange={(e) => set("scale", e.target.value as "full" | "compact")}
        >
          <option value="full">Standard</option>
          <option value="compact">Compact</option>
        </select>
      </div>
      <div className="setting-row">
        <span>Display mode</span>
        <button
          className="setting-action"
          disabled={!document.documentElement.requestFullscreen}
          onClick={fullscreen}
        >
          {full ? "Windowed" : "Full screen"}
        </button>
      </div>
      {message && (
        <p className="fine-print" role="status">
          {message}
        </p>
      )}
    </div>
  );
}
