import { Position, type Node, type NodeProps } from "@xyflow/react";
import { Box, Text } from "@chakra-ui/react";
import { type ElectricalComponentData, ElectricalComponentType } from "@/types";
import Registor from "@/icons/Resistor";
import Capacitor from "@/icons/Capacitor";
import Inductor from "@/icons/Inductor";
import { getUnit } from "@/utils/";
import TerminalHandle from "./TerminalHandle";
import Rotation from "@/components/Rotation";
import { ElectricalComponentState } from "@/types";
import { Plus, X } from "react-bootstrap-icons";

type ElectricalComponentNode = Node<ElectricalComponentData, "string">;

const ElectricalComponent = ({
  id,
  data: { value, type, rotation, state },
  selected,
}: NodeProps<ElectricalComponentNode>) => {
  const unit = getUnit(type!);
  const isAdditionValid = state === ElectricalComponentState.Add;
  const isNotAdditionValid = state === ElectricalComponentState.NotAdd;
  return (
    <Box
      position="relative"
      style={{
        transform: `rotate(${rotation}deg)`,
        ...(isAdditionValid && { backgroundColor: "#58ed58" }),
        ...(isNotAdditionValid && { backgroundColor: "#ff0505" }),
      }}
    >
      <Rotation id={id} selected={selected} />
      {type === ElectricalComponentType.Resistor && <Registor height={24} />}
      {type === ElectricalComponentType.Capacitor && <Capacitor height={24} />}
      {type === ElectricalComponentType.Inductor && <Inductor height={24} />}
      <Text fontSize="xx-small" position="absolute">
        {value} {unit}
      </Text>
      {isAdditionValid && (
        <Plus size={16} style={{ position: "absolute", top: -17, right: 2 }} />
      )}
      {isNotAdditionValid && (
        <X size={16} style={{ position: "absolute", top: -17, right: 2 }} />
      )}
      <TerminalHandle type="source" position={Position.Right} id="right" />
      <TerminalHandle type="source" position={Position.Left} id="left" />
    </Box>
  );
};

export default ElectricalComponent;
