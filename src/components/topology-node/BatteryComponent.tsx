import { Position, type Node, type NodeProps } from "@xyflow/react";
import { Box, Text } from "@chakra-ui/react";
import type {
  ElectricalComponentData,
  ElectricalComponentKeysType,
} from "@/types";
import { default as BatteryIcon } from "@/icons/Battery";
import { getUnit } from "@/utils/";
import TerminalHandle from "./TerminalHandle";

type BatteryNode = Node<ElectricalComponentData, ElectricalComponentKeysType>;

const BatteryComponent = ({
  type,
  data: { value },
}: NodeProps<BatteryNode>) => {
  const unit = getUnit(type);
  return (
    <Box>
      <BatteryIcon height={48} />
      <Text
        fontSize="xx-small"
        position="absolute"
        top={"18px"}
        left={"11px"}
        color="white"
      >
        {value} {unit}
      </Text>
      <TerminalHandle
        style={{
          top: 2,
          left: 39,
        }}
        type="source"
        position={Position.Top}
        id="right"
      />
      <TerminalHandle
        style={{
          top: 2,
          left: 9,
        }}
        type="source"
        position={Position.Top}
        id="left"
      />
    </Box>
  );
};

export default BatteryComponent;
