import { BaseEdge, getSmoothStepPath, type EdgeProps } from "@xyflow/react";
const Wire = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  markerEnd,
  markerStart,
  sourcePosition,
  targetPosition,
}: EdgeProps) => {
  const [path] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  return (
    <>
      <svg>
        <defs>
          <linearGradient id="wire-gradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ecff02" />
            <stop offset="100%" stopColor="#f69900" />
          </linearGradient>
        </defs>
      </svg>
      <BaseEdge
        style={{ stroke: "url(#wire-gradient)" }}
        markerEnd={markerEnd}
        markerStart={markerStart}
        path={path}
      />
      <circle
        r="4"
        fill="yellow"
        style={{ filter: "drop-shadow(0 0 2px #ffc300)" }}
      >
        <animateMotion dur="5s" repeatCount="indefinite" path={path} />
        {/*<animateMotion
          dur="6s"
          repeatCount="indefinite"
          path={path}
          keyPoints="0;1;0" // ✅ 类型支持：起点→终点→起点 来回动画
          keyTimes="0;0.5;1"
          keySplines="0.4 0 0.6 1;0.4 0 0.6 1"
        />*/}
      </circle>
      {/* 粒子2：脉冲波纹尾迹 */}
      <circle fill="transparent" stroke="#ffc300" strokeWidth="2">
        <animate
          attributeName="r"
          values="4;7"
          dur="2s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.8;0"
          dur="2s"
          repeatCount="indefinite"
        />
        <animateMotion dur="5s" repeatCount="indefinite" path={path} />
      </circle>
      {/*<circle fill="transparent" stroke="yellow" strokeWidth="2">
        <animate
          attributeName="r"
          values="2;6"
          dur="2s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="1;0"
          dur="2s"
          repeatCount="indefinite"
        />
        <animateMotion dur="5s" repeatCount="indefinite" path={path} />
      </circle>*/}
    </>
  );
};

export default Wire;
