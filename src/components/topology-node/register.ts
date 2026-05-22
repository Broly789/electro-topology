import ElectricalComponent from "./ElectricalComponent";
import WireEdge from "./WireEdge";
import BulbComponent from "./BulbComponent";
import BatteryComponent from "./BatteryComponent";
import Board from "./Board";

export const nodeTypes = {
  electricalComponent: ElectricalComponent,
  bulb: BulbComponent,
  battery: BatteryComponent,
  board: Board,
};

export const edgeTypes = {
  wire: WireEdge,
};
