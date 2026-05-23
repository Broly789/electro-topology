import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface ThemeState {
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
  toggleMode: () => void;
}

export const useDarkMode = create<ThemeState, [["zustand/devtools", unknown]]>(
  devtools((set) => ({
    isDark: false,
    setIsDark: (isDark) => set({ isDark }),
    toggleMode: () => set((state) => ({ isDark: !state.isDark })),
  })),
);
