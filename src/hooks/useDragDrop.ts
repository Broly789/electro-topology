import { useRef, useCallback } from "react";
import { type Node } from "@xyflow/react";
import { v4 as uuid } from "uuid";
import { isPointInBox, isElectricalComponent } from "@/utils";
import {
  ElectricalComponentType,
  type ElectricalComponentKeysType,
} from "@/types";

const NODE_WIDTH = 50;
const NODE_HEIGHT = 25;

/**
 * 面板拖放创建节点逻辑封装。
 *
 * @param nodes          - 当前画布中所有节点（用于判断是否拖到电路板内）
 * @param screenToFlowPosition - ReactFlow 坐标转换函数
 * @param addNode        - useHistory.addNode，创建节点并写入历史
 */
export function useDragDrop(
  nodes: Node[],
  screenToFlowPosition: (pos: { x: number; y: number }) => {
    x: number;
    y: number;
  },
  addNode: (node: Node, shouldAddToHistory?: boolean) => void,
) {
  const dragOutsideRef = useRef<ElectricalComponentKeysType | null>(null);

  const onDragStart = useCallback(
    (
      event: React.DragEvent<HTMLButtonElement>,
      type: ElectricalComponentKeysType,
    ) => {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("type", type);
      dragOutsideRef.current = type;
    },
    [],
  );

  const onDragOver: React.DragEventHandler<HTMLDivElement> = useCallback(
    (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
    },
    [],
  );

  const onDrop: React.DragEventHandler<HTMLDivElement> = useCallback(
    (event) => {
      event.preventDefault();
      const type = dragOutsideRef.current;
      if (!type) return;

      let position = screenToFlowPosition({
        x: event.clientX - NODE_WIDTH,
        y: event.clientY - NODE_HEIGHT,
      });

      const boards = nodes.filter(
        (node) => node.type === ElectricalComponentType.Board,
      );
      const board = boards.find((b) =>
        isPointInBox(position, {
          x: b.position.x,
          y: b.position.y,
          width: b.measured?.width ?? 0,
          height: b.measured?.height ?? 0,
        }),
      );

      if (board) {
        const { x: overlapX = 0, y: overlapY = 0 } = board.position;
        const { x: dragX = 0, y: dragY = 0 } = position;
        position = {
          x: dragX - overlapX,
          y: dragY - overlapY,
        };
      }

      const node = createNode(type, position, board?.id);
      if (node) addNode(node);
    },
    [nodes, screenToFlowPosition, addNode],
  );

  return { dragOutsideRef, onDragStart, onDragOver, onDrop };
}

/** 根据类型创建节点对象 */
function createNode(
  type: ElectricalComponentKeysType,
  position: { x: number; y: number },
  parentId?: string,
): Node | undefined {
  if (isElectricalComponent(type)) {
    return {
      id: uuid(),
      type: "electricalComponent",
      data: { type, value: 3, connectable: true },
      position,
      parentId,
    };
  }
  if (type === ElectricalComponentType.Bulb) {
    return {
      id: uuid(),
      type,
      data: { value: 12, connectable: true },
      position,
      parentId,
    };
  }
  if (type === ElectricalComponentType.Battery) {
    return {
      id: uuid(),
      type,
      data: { value: 12, connectable: true },
      position,
      parentId,
    };
  }
  if (type === ElectricalComponentType.Board) {
    return {
      id: uuid(),
      type,
      data: {},
      style: { width: 180, height: 180 },
      position,
    };
  }
}
