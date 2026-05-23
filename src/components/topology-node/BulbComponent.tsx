import { Position, type Node, type NodeProps } from "@xyflow/react";
import { Box, Text } from "@chakra-ui/react";
import {
  type ElectricalComponentData,
  type ElectricalComponentKeysType,
} from "@/types";
import { default as BulbIcon } from "@/icons/Bulb";
import { getUnit } from "@/utils/";
import TerminalHandle from "./TerminalHandle";
import { useDarkMode } from "@/store/useDarkMode";

type BulbNode = Node<ElectricalComponentData, ElectricalComponentKeysType>;

const BulbComponent = ({ type, data: { value } }: NodeProps<BulbNode>) => {
  const unit = getUnit(type);
  const { isDark } = useDarkMode();
  const color = isDark ? "white" : "black";
  return (
    <Box>
      <BulbIcon color={color} isOn height={64} />
      <Text fontSize="xx-small" position="absolute">
        {value} {unit}
      </Text>
      <TerminalHandle
        style={{
          top: 50,
          right: 22,
        }}
        type="source"
        position={Position.Right}
        id="right"
      />
      <TerminalHandle
        style={{
          top: 50,
          left: 22,
        }}
        type="source"
        position={Position.Left}
        id="left"
      />
    </Box>
  );
};

export default BulbComponent;
