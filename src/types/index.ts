export enum ElectricalComponentType {
  Resistor = "resistor",
  Capacitor = "capacitor",
  Bulb = "bulb",
  Inductor = "inductor",
  Battery = "battery",
  Board = "board",
}

export type ElectricalComponentData = {
  value?: number;
  type?: ElectricalComponentType;
  // rotation?: number;
  // state?: ElectricalComponentState;
  // isAttachedToGroup?: boolean;
  // visible?: boolean;
  // connectable?: boolean;
};
