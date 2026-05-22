import type { ReactFlowState } from "@xyflow/react";
import { useSyncExternalStore } from "react";
import {
  ElectricalComponentType,
  type ElectricalComponentKeysType,
} from "../types";

export const zoomSelector = (s: ReactFlowState) => s.transform[2] >= 1.2;

export const isPointInBox = (
  point: { x: number; y: number },
  box: { x: number; y: number; height: number; width: number },
) => {
  return (
    point.x >= box.x &&
    point.x <= box.x + box.width &&
    point.y >= box.y &&
    point.y <= box.y + box.height
  );
};

export function getUnit(type: ElectricalComponentKeysType) {
  let unit;
  switch (type) {
    case ElectricalComponentType.Resistor: {
      unit = "kΩ";
      break;
    }
    case ElectricalComponentType.Inductor: {
      unit = "H";
      break;
    }
    case ElectricalComponentType.Capacitor: {
      unit = "μF";
      break;
    }
    case ElectricalComponentType.Battery: {
      unit = "V";
      break;
    }
    case ElectricalComponentType.Bulb: {
      unit = "W";
      break;
    }
  }
  return unit;
}

type SystemTheme = "dark" | "light";

// 1. 订阅函数：监听主题变化
const subscribe = (callback: () => void) => {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
};

// 2. 获取客户端当前系统主题
const getSnapshot = (): SystemTheme => {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

// 3. SSR 服务端默认值
const getServerSnapshot = (): SystemTheme => "light";

// 对外暴露自定义Hook
export function useSystemTheme(): SystemTheme {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
