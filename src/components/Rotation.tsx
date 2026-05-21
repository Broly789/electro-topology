import React, { useEffect, useRef } from "react";
import { drag } from "d3-drag";
import { select } from "d3-selection";
import { useReactFlow, useUpdateNodeInternals } from "@xyflow/react";

export default function Rotation({
  selected, // 节点是否选中，选中才显示旋转手柄
  id, // 节点唯一ID，用于更新节点数据
}: {
  selected: boolean | undefined;
  id: string;
}) {
  // 绑定旋转手柄DOM元素
  const rotatorRef = useRef<HTMLDivElement>(null);
  // 缓存拖拽实例，用于组件销毁时清理事件（防止蹦跶/卡顿）
  const dragInstanceRef = useRef<ReturnType<
    typeof drag<HTMLDivElement, unknown>
  > | null>(null);

  // React Flow 核心API：更新节点数据、刷新节点内部布局
  const { updateNodeData } = useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();

  useEffect(() => {
    // 未选中 或 手柄不存在 → 直接退出
    if (!selected || !rotatorRef.current) return;

    const handleElement = rotatorRef.current;
    // 找到当前手柄所属的 React Flow 节点（最外层节点DOM）
    const node = handleElement.closest(".react-flow__node") as HTMLElement;
    if (!node) return;

    // 🔥 动态计算节点【真实中心】（修复硬编码100导致的反向/偏移）
    const nodeRect = node.getBoundingClientRect();
    const center = {
      x: nodeRect.left + nodeRect.width / 2,
      y: nodeRect.top + nodeRect.height / 2,
    };

    // ✅ 完全保留你的原始吸附角度数组
    const perpendicularAngles = [0, 90, 180, 270, 360];

    // 初始化D3拖拽逻辑
    const dragHandler = drag<HTMLDivElement, unknown>()
      // 拖拽开始：阻止浏览器默认行为（解决第一下跳变）
      .on("start", (evt) => evt.sourceEvent.preventDefault())
      // 拖拽中：核心旋转 + 吸附计算
      .on("drag", (evt) => {
        // 获取鼠标在屏幕上的绝对坐标（精准计算）
        const mouseX = evt.sourceEvent.clientX;
        const mouseY = evt.sourceEvent.clientY;

        // 计算鼠标 相对 节点中心的偏移量
        const deltaX = mouseX - center.x;
        const deltaY = mouseY - center.y;

        // 🔥 终极正确角度公式：正上方=0°（解决所有旋转方向BUG）
        const radians = Math.atan2(deltaX, -deltaY);
        let rotation = radians * (180 / Math.PI);

        // 角度归一化：强制限制在 0~360°（解决负数/溢出BUG）
        rotation = ((rotation % 360) + 360) % 360;

        // ✅ 100% 还原你的原始吸附判断逻辑
        const perpendicularRotation = perpendicularAngles.find((deg) => {
          return Math.abs(deg - rotation) <= 45;
        });

        // 最优逻辑：有匹配角度才更新，360°自动转为0°（视觉一致，无CSS异常）
        if (perpendicularRotation) {
          const finalRotation =
            perpendicularRotation === 360 ? 0 : perpendicularRotation;
          updateNodeData(id, { rotation: finalRotation });
        }

        // 刷新节点布局（必须调用，防止连线/边框错位）
        updateNodeInternals(id);
      });

    // 将拖拽事件绑定到手柄
    const selection = select(handleElement);
    selection.call(dragHandler);
    dragInstanceRef.current = dragHandler;

    // 组件销毁/切换选中时：清理拖拽事件（防止重复绑定导致蹦跶）
    return () => {
      if (dragInstanceRef.current) {
        selection.on(".drag", null);
      }
    };
  }, [selected, id, updateNodeData, updateNodeInternals]);

  // 未选中节点 → 不渲染旋转手柄
  if (!selected) return null;

  // 旋转手柄UI（节点正上方蓝色小圆点）
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
        zIndex: 9999, // 置顶防止被遮挡
      }}
    />
  );
}
