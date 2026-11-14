import { useState } from "react";
import { menu, type MissionSave } from "../schemas/menu";
import moonArt from "../../public/assets/backgrounds/dest-moon.png?inline";
import marsArt from "../../public/assets/backgrounds/dest-mars.png?inline";
import { Arrow } from "../ui/Icons";
export interface MissionCallbacks {
  savedMission?: MissionSave | null;
  onNewGame?: (mission: MissionSave) => void;
  onContinueGame?: (mission: MissionSave) => void;
  onSandbox?: (mission: MissionSave) => void;
}
export function Expedition({
  mode,
  onReady,
  hasSave,
}: {
  mode: "campaign" | "sandbox";
  hasSave: boolean;
  onReady: (save: MissionSave) => void;
}) {
  const [destination, setDestination] = useState<"moon" | "mars">("moon");
  return (
    <>
      <p className="dialog-intro">Choose your destination.</p>
      <div
        className="destination-options"
        role="group"
        aria-label="Destination"
      >
        {menu.destinations.map((d) => (
          <button
            key={d.id}
            className="destination"
            aria-pressed={destination === d.id}
            onClick={() => setDestination(d.id)}
          >
            <img
              src={d.id === "moon" ? moonArt : marsArt}
              width="200"
              height="125"
              alt=""
            />
            <span>
              <strong>{d.name}</strong>
            </span>
            <i aria-hidden="true">{destination === d.id ? "●" : "○"}</i>
          </button>
        ))}
      </div>
      <p className="fine-print">
        {hasSave
          ? "This replaces your previous local mission."
          : "Progress is saved on this device."}
      </p>
      <button
        className="primary-button"
        onClick={() =>
          onReady({ destination, mode, startedAt: new Date().toISOString() })
        }
      >
        {mode === "sandbox" ? "Enter Sandbox" : "Begin expedition"}
        <Arrow />
      </button>
    </>
  );
}
export function Ready({
  save,
  onBack,
}: {
  save: MissionSave;
  onBack: () => void;
}) {
  const destination = menu.destinations.find((d) => d.id === save.destination)!;
  return (
    <div className="ready-content">
      <img
        className="ready-art"
        src={save.destination === "moon" ? moonArt : marsArt}
        width="200"
        height="125"
        alt=""
      />
      <h3>{destination.name}</h3>
      <p>
        Your {save.mode === "sandbox" ? "sandbox" : "expedition"} is ready for
        mission design.
      </p>
      <div className="briefing-row">
        <span>Flight plan</span>
        <strong>
          {save.mode === "sandbox" ? "Free exploration" : "Campaign"}
        </strong>
      </div>
      <div className="briefing-row">
        <span>Departure</span>
        <strong>Earth</strong>
      </div>
      <div className="briefing-row">
        <span>Next phase</span>
        <strong>Mission planning</strong>
      </div>
      <button className="primary-button" onClick={onBack}>
        Return to main menu
        <Arrow />
      </button>
    </div>
  );
}
