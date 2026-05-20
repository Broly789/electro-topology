export enum ElectricalComponentType {
  Resistor = "resistor",
  Capacitor = "capacitor",
  Bulb = "bulb",
  Inductor = "inductor",
  Battery = "battery",
  Board = "board",
}
// 手动提取需要的部分
export const ELECTRICAL_COMPONENTS = [
  ElectricalComponentType.Resistor,
  ElectricalComponentType.Capacitor,
  ElectricalComponentType.Inductor,
] as const;

export type ElectricalPartialComponentType =
  (typeof ELECTRICAL_COMPONENTS)[number];

export type ElectricalComponentData = {
  value?: number;
  type?: ElectricalComponentType;
  // rotation?: number;
  // state?: ElectricalComponentState;
  // isAttachedToGroup?: boolean;
  // visible?: boolean;
  // connectable?: boolean;
};
