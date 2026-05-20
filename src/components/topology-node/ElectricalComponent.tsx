import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { Box, Text } from "@chakra-ui/react";
import { type ElectricalComponentData, ElectricalComponentType } from "@/types";
import Registor from "@/icons/Resistor";
import Capacitor from "@/icons/Capacitor";
import Bulb from "@/icons/Bulb";
import Inductor from "@/icons/Inductor";
import Battery from "@/icons/Battery";
import { getUnit } from "@/utils/";
import TerminalHandle from "./TerminalHandle";

type ElectricalComponentNode = Node<ElectricalComponentData, "string">;

const ElectricalComponent = ({
  data: { value, type },
}: NodeProps<ElectricalComponentNode>) => {
  const unit = getUnit(type!);
  return (
    <Box>
      {type === ElectricalComponentType.Resistor && <Registor height={24} />}
      {type === ElectricalComponentType.Capacitor && <Capacitor height={24} />}
      {type === ElectricalComponentType.Inductor && <Inductor height={24} />}
      <Text fontSize="sm" position="absolute">
        {value} {unit}
      </Text>
      <TerminalHandle type="source" position={Position.Right} id="right" />
      <TerminalHandle type="source" position={Position.Left} id="left" />
    </Box>
  );
};

export default ElectricalComponent;
