import {
  getSimpleBezierPath,
  type ConnectionLineComponentProps,
} from "@xyflow/react";

// 颜色常量
const CONNECTION_COLORS = {
  valid: "#22c55e", // 绿色
  invalid: "#ef4444", // 红色
  default: "black",
} as const;
// 状态映射表（性能更好）
const getConnectionColor = (
  status: ConnectionLineComponentProps["connectionStatus"],
): string => {
  switch (status) {
    case "valid":
      return CONNECTION_COLORS.valid;
    case "invalid":
      return CONNECTION_COLORS.invalid;
    default:
      return CONNECTION_COLORS.default;
  }
};

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
  const color = getConnectionColor(connectionStatus);
  return <path fill="none" d={path} stroke={color} strokeWidth={1} />;
};

export default ConnectionLine;
