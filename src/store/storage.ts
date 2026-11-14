import type { StateStorage } from "zustand/middleware";
const memory = new Map<string, string>();
/** Storage-denied / private-file previews stay usable for the current session. */
export const safeStorage: StateStorage = {
  getItem(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return memory.get(key) ?? null;
    }
  },
  setItem(key, value) {
    memory.set(key, value);
    try {
      localStorage.setItem(key, value);
    } catch {
      /* Session-only fallback. */
    }
  },
  removeItem(key) {
    memory.delete(key);
    try {
      localStorage.removeItem(key);
    } catch {
      /* Session-only fallback. */
    }
  },
};
