// store/useDarkMode.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware"; // 👈 必须引入

interface ThemeState {
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
  toggleMode: () => void;
}

export const useDarkMode = create<ThemeState, [["zustand/devtools", unknown]]>(
  devtools((set) => ({
    isDark: false, // 临时默认值，后续由组件同步
    setIsDark: (isDark) => set({ isDark }),
    toggleMode: () => set((state) => ({ isDark: !state.isDark })),
  })),
);
