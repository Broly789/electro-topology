import ElectricalComponent from "./ElectricalComponent";
import WireEdge from "./WireEdge";
import BulbComponent from "./BulbComponent";
import BatteryComponent from "./BatteryComponent";

export const nodeTypes = {
  electricalComponent: ElectricalComponent,
  bulb: BulbComponent,
  battery: BatteryComponent,
};

export const edgeTypes = {
  wire: WireEdge,
};
