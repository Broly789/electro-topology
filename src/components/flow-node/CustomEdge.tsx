import { useState } from "react";
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
  ...props
}: EdgeProps) {
  const { deleteElements } = useReactFlow();
  const [isHovered, setIsHovered] = useState(false);

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
      {/* 🔥 关键：用 g 标签包裹，扩大 hover 区域（你的原版是对的） */}
      <g
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ cursor: "pointer" }}
      >
        {/* 正常渲染边，hover 变色 */}
        <BaseEdge
          id={id}
          path={edgePath}
          {...props}
          stroke={isHovered ? "#ff4d4f" : "#b1b1b7"}
          strokeWidth={isHovered ? 2 : 1}
        />
      </g>

      {/* 删除按钮（完全正常显示） */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: isHovered ? "auto" : "none",
            opacity: isHovered ? 1 : 0,
            transition: "opacity 0.2s ease",
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/*<button
            onClick={() => deleteElements({ edges: [{ id }] })}
            className="nodrag nopan"
            style={{
              background: "#ff4d4f",
              border: "none",
              color: "white",
              borderRadius: "50%",
              width: "20px",
              height: "20px",
              cursor: "pointer",
              fontSize: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>*/}
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
    </>
  );
}

export default CustomEdge;
