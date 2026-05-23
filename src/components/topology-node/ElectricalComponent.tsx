import {
  Position,
  useReactFlow,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import { Box, Text } from "@chakra-ui/react";
import { type ElectricalComponentData, ElectricalComponentType } from "@/types";
import Registor from "@/icons/Resistor";
import Capacitor from "@/icons/Capacitor";
import Inductor from "@/icons/Inductor";
import { getUnit } from "@/utils/";
import TerminalHandle from "./TerminalHandle";
import Rotation from "@/components/Rotation";
import { ElectricalComponentState } from "@/types";
import { Lock, Plus, Unlock, X } from "react-bootstrap-icons";
import { useDarkMode } from "@/store/useDarkMode";

type ElectricalComponentNode = Node<ElectricalComponentData, "string">;

const ElectricalComponent = ({
  id,
  data: {
    value,
    type,
    rotation,
    state,
    isAttachedToGroup,
    visible,
    connectable,
  },
  selected,
  parentId,
}: NodeProps<ElectricalComponentNode>) => {
  const unit = getUnit(type!);
  const isAdditionValid = state === ElectricalComponentState.Add;
  const isNotAdditionValid = state === ElectricalComponentState.NotAdd;
  const { updateNode } = useReactFlow();

  const { isDark } = useDarkMode();
  const color = isDark ? "white" : "black";

  return (
    <Box
      position="relative"
      style={{
        transform: `rotate(${rotation}deg)`,
        ...(isAdditionValid && { backgroundColor: "#58ed58" }),
        ...(isNotAdditionValid && { backgroundColor: "#ff0505" }),
        visibility: visible ? "visible" : "hidden",
      }}
    >
      <Rotation id={id} selected={selected} />
      {selected && parentId && (
        <div
          className={`absolute top-[-20px] -right-1 text-${color}`}
          onClick={() => {
            updateNode(id, (prevNode) => ({
              extent: prevNode.extent === "parent" ? undefined : "parent",
              data: {
                ...prevNode.data,
                isAttachedToGroup: !prevNode.data.isAttachedToGroup,
              },
            }));
          }}
        >
          {isAttachedToGroup ? (
            <Lock color={color} size={12} />
          ) : (
            <Unlock color={color} size={12} />
          )}
        </div>
      )}
      {type === ElectricalComponentType.Resistor && (
        <Registor color={color} height={24} />
      )}
      {type === ElectricalComponentType.Capacitor && (
        <Capacitor color={color} height={24} />
      )}
      {type === ElectricalComponentType.Inductor && (
        <Inductor color={color} height={24} />
      )}
      <Text fontSize="xx-small" position="absolute">
        {value} {unit}
      </Text>
      {isAdditionValid && (
        <Plus
          color={color}
          size={16}
          style={{ position: "absolute", top: -17, right: 2 }}
        />
      )}
      {isNotAdditionValid && (
        <X
          color={color}
          size={16}
          style={{ position: "absolute", top: -17, right: 2 }}
        />
      )}
      <TerminalHandle
        isConnectable={connectable}
        type="source"
        position={Position.Right}
        id="right"
      />
      <TerminalHandle
        isConnectable={connectable}
        type="source"
        position={Position.Left}
        id="left"
      />
    </Box>
  );
};

export default ElectricalComponent;
