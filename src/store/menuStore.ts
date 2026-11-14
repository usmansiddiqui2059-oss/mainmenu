import { safeStorage } from "./storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  preferencesSchema,
  saveSchema,
  type MissionSave,
  type Preferences,
} from "../schemas/menu";
export const defaultPreferences: Preferences = {
  motion: true,
  scale: "full",
};
interface MenuState {
  preferences: Preferences;
  save: MissionSave | null;
  setPreference: <K extends keyof Preferences>(
    key: K,
    value: Preferences[K],
  ) => void;
  saveMission: (save: MissionSave) => void;
}
export const useMenuStore = create<MenuState>()(
  persist(
    (set) => ({
      preferences: defaultPreferences,
      save: null,
      setPreference: (key, value) =>
        set((s) => ({ preferences: { ...s.preferences, [key]: value } })),
      saveMission: (save) => set({ save: saveSchema.parse(save) }),
    }),
    {
      name: "mission-control-menu-v1",
      storage: createJSONStorage(() => safeStorage),
      partialize: (s) => ({ preferences: s.preferences, save: s.save }),
      merge: (stored, current) => {
        const persisted = stored as {
          preferences?: unknown;
          save?: unknown;
        } | null;
        const preferences = preferencesSchema.safeParse(persisted?.preferences);
        const save = saveSchema.safeParse(persisted?.save);
        return {
          ...current,
          preferences: preferences.success
            ? preferences.data
            : defaultPreferences,
          save: save.success ? save.data : null,
        };
      },
    },
  ),
);
