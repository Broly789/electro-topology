import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  useReactFlow,
  type EdgeProps,
} from "@xyflow/react";
import { IconButton } from "@chakra-ui/react";
import { X } from "react-bootstrap-icons";

function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data: { isHovered } = {},
  markerEnd,
  style,
  selected,
}: EdgeProps) {
  const { deleteElements } = useReactFlow();
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  return (
    <>
      <g style={{ cursor: "pointer" }}>
        <BaseEdge
          id={id}
          path={edgePath}
          markerEnd={markerEnd}
          style={{
            ...style,
            stroke: isHovered ? "#ff4d4f" : "#b1b1b7",
            strokeWidth: isHovered && !selected ? 2 : selected ? 3 : 1,
          }}
        />
      </g>

      {isHovered && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: "all",
              transition: "opacity 0.2s ease",
            }}
          >
            <IconButton
              aria-label="Delete Edge"
              color="red"
              size="lg"
              pointerEvents="all"
              borderRadius="full"
              bg="transparent"
              _hover={{ transform: "scale(1.1)" }}
              onClick={() => deleteElements({ edges: [{ id }] })}
            >
              <X />
            </IconButton>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export default CustomEdge;
