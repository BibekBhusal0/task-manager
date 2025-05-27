import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsState {
  theme: "light" | "dark";
  toggleTheme: () => void;
  animationsEnabled: boolean;
  toggleAnimations: () => void;
  compactMode: boolean;
  toggleCompactMode: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "light",
      animationsEnabled: true,
      compactMode: false,

      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === "light" ? "dark" : "light",
        })),

      toggleAnimations: () =>
        set((state) => ({
          animationsEnabled: !state.animationsEnabled,
        })),

      toggleCompactMode: () =>
        set((state) => ({
          compactMode: !state.compactMode,
        })),
    }),
    {
      name: "settings-store",
    }
  )
);
