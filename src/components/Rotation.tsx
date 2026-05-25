import { useEffect, useRef } from "react";
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
  const dragInstanceRef = useRef<ReturnType<
    typeof drag<HTMLDivElement, unknown>
  > | null>(null);

  const { updateNodeData } = useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();

  useEffect(() => {
    if (!selected || !rotatorRef.current) return;

    const handleElement = rotatorRef.current;
    const perpendicularAngles = [0, 90, 180, 270, 360];

    const dragHandler = drag<HTMLDivElement, unknown>()
      .on("start", (evt) => evt.sourceEvent.preventDefault())
      .on("drag", (evt) => {
        // 每次拖拽都重新计算节点当前中心位置
        // 解决移动节点后旋转中心仍为旧位置导致的跳变
        const node = handleElement.closest(".react-flow__node") as HTMLElement;
        if (!node) return;

        const rect = node.getBoundingClientRect();
        const center = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };

        const mouseX = evt.sourceEvent.clientX;
        const mouseY = evt.sourceEvent.clientY;
        const deltaX = mouseX - center.x;
        const deltaY = mouseY - center.y;

        const radians = Math.atan2(deltaX, -deltaY);
        let rotation = radians * (180 / Math.PI);
        rotation = ((rotation % 360) + 360) % 360;

        const perp = perpendicularAngles.find(
          (deg) => Math.abs(deg - rotation) <= 45,
        );

        if (perp !== undefined) {
          updateNodeData(id, { rotation: perp === 360 ? 0 : perp });
        }

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
