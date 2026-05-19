import { create } from "zustand";

interface InitalState {
  count: number;
  increment: () => void;
  decrement: () => void;
}

export const useStore = create<InitalState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}));
