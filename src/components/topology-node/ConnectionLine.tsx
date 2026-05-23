import {
  getSimpleBezierPath,
  type ConnectionLineComponentProps,
} from "@xyflow/react";
import { useDarkMode } from "@/store/useDarkMode";

const ConnectionLine = ({
  fromX,
  fromY,
  toX,
  toY,
  connectionStatus,
}: ConnectionLineComponentProps) => {
  const [path] = getSimpleBezierPath({
    sourceX: fromX,
    sourceY: fromY,
    targetX: toX,
    targetY: toY,
  });
  const { isDark } = useDarkMode();

  let color = isDark ? "white" : "black";
  if (connectionStatus === "valid") color = "#55dd99";
  if (connectionStatus === "invalid") color = "#ff6060";
  return <path fill="none" d={path} stroke={color} strokeWidth={1} />;
};

export default ConnectionLine;
