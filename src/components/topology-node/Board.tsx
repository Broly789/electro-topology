import { Box } from "@chakra-ui/react";
import {
  type Node,
  type NodeProps,
  NodeResizer,
  useStore,
} from "@xyflow/react";
import type { ElectricalComponentData } from "@/types";
import Placeholder from "../Placeholder";
import { zoomSelector } from "@/utils";

type Board = Node<ElectricalComponentData, "string">;
const Board = ({ selected }: NodeProps<Board>) => {
  const showPlaceholder = useStore(zoomSelector);
  return (
    <Box
      border="2px solid black"
      borderRadius="8px"
      height="100%"
      width="100%"
      {...(selected && { boxShadow: "0 0 10px rgba(0, 0, 0, 0.5)" })}
    >
      {selected && <NodeResizer minWidth={150} minHeight={150} />}
      {!showPlaceholder && <Placeholder />}
    </Box>
  );
};

export default Board;
