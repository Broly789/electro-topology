import React, { useEffect, useRef } from "react";
import { drag } from "d3-drag";
import { select } from "d3-selection";
import { useReactFlow, useUpdateNodeInternals } from "@xyflow/react";

export default function Rotation({
  selected,
  id,
}: {
  selected: boolean | undefined;
  id: string;
}) {
  const rotatorRef = useRef<HTMLDivElement>(null);
  const dragInstanceRef = useRef<ReturnType<typeof drag> | null>(null);

  const { updateNodeData } = useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();

  useEffect(() => {
    if (!selected || !rotatorRef.current) return;

    const handleElement = rotatorRef.current;
    const node = handleElement.closest(".react-flow__node") as HTMLElement;
    if (!node) return;

    // 固定获取节点中心（只定位一次，不重复计算导致偏移）
    const nodeRect = node.getBoundingClientRect();
    const center = {
      x: nodeRect.left + nodeRect.width / 2,
      y: nodeRect.top + nodeRect.height / 2,
    };

    const dragHandler = drag<HTMLDivElement, unknown>()
      .on("start", (evt) => evt.sourceEvent.preventDefault())
      .on("drag", (evt) => {
        const mouseX = evt.sourceEvent.clientX;
        const mouseY = evt.sourceEvent.clientY;

        const deltaX = mouseX - center.x;
        const deltaY = mouseY - center.y;

        // 🔥 核心修复：正上方=0° 精准角度公式（彻底解决蹦到正下方）
        const radians = Math.atan2(deltaX, -deltaY);
        let rotation = radians * (180 / Math.PI);

        // 归一化 0~360°（无负数、无溢出）
        rotation = ((rotation % 360) + 360) % 360;

        updateNodeData(id, { rotation });
        updateNodeInternals(id);
      });

    const selection = select(handleElement);
    selection.call(dragHandler);
    dragInstanceRef.current = dragHandler;

    return () => {
      if (dragInstanceRef.current) {
        selection.on(".drag", null);
      }
    };
  }, [selected, id, updateNodeData, updateNodeInternals]);

  if (!selected) return null;

  return (
    <div
      ref={rotatorRef}
      style={{
        position: "absolute",
        width: 10,
        height: 10,
        background: "#3376d9",
        left: "50%",
        top: -30,
        borderRadius: "100%",
        transform: "translate(-50%, 120%)",
        cursor: "grab",
        zIndex: 9999,
      }}
    />
  );
}
