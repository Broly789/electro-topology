import { useRef, useCallback } from "react";
import { type Node, type OnNodeDrag } from "@xyflow/react";
import {
  ElectricalComponentState,
  ElectricalComponentType,
  type ElectricalComponentData,
} from "@/types";
import { isElectricalComponent } from "@/utils";

// ── 纯辅助函数 ──────────────────────────────────────

/** 计算拖拽悬停时的吸附状态 */
function getDragState(
  intersectingNode: Node<ElectricalComponentData>,
  dragNode: Node,
  prevState: ElectricalComponentState | undefined,
): ElectricalComponentState | undefined {
  if (!isElectricalComponent(intersectingNode.data?.type)) return prevState;
  return intersectingNode.data.type === dragNode.data?.type
    ? ElectricalComponentState.Add
    : ElectricalComponentState.NotAdd;
}

/** 同类型元件合并：累加值 + 移除被拖拽节点 */
function mergeComponentValues(
  prevNodes: Node[],
  overlappingNode: Node<ElectricalComponentData>,
  dragNode: Node<ElectricalComponentData>,
  overlapVal: number,
): Node[] {
  return prevNodes
    .map((prevNode) => {
      if (prevNode.id === overlappingNode.id) {
        return {
          ...prevNode,
          data: {
            ...prevNode.data,
            value: overlapVal + (dragNode.data.value ?? 0),
            state: undefined,
          },
        };
      }
      if (prevNode.id === dragNode.id) {
        return {
          ...prevNode,
          data: { ...prevNode.data, visible: false, state: undefined },
        };
      }
      return { ...prevNode, data: { ...prevNode.data, state: undefined } };
    })
    .filter((node) => node.id !== dragNode.id);
}

/** 将拖拽节点放入电路板（计算相对坐标 + 设置父节点） */
function dropNodeToBoard(
  prevNodes: Node[],
  overlappingNode: Node<ElectricalComponentData>,
  dragNode: Node<ElectricalComponentData>,
  showContent: boolean,
): Node[] {
  const { x: dragX = 0, y: dragY = 0 } = dragNode.position ?? {};
  const { x: overlapX = 0, y: overlapY = 0 } = overlappingNode.position ?? {};

  let position: { x: number; y: number } | undefined;
  if (!dragNode.parentId) {
    position = { x: dragX - overlapX, y: dragY - overlapY };
  } else if (dragNode.parentId !== overlappingNode.id) {
    const prevParent = prevNodes.find((n) => n.id === dragNode.parentId);
    const { x: px = 0, y: py = 0 } = prevParent?.position ?? {};
    position = { x: dragX + px - overlapX, y: dragY + py - overlapY };
  }

  return [
    overlappingNode,
    ...prevNodes
      .filter((node) => node.id !== overlappingNode.id)
      .map((node) => {
        if (node.id !== dragNode.id) return node;
        return {
          ...node,
          parentId: overlappingNode.id,
          ...(position && { position }),
          draggable: showContent,
          selectable: showContent,
          data: { ...node.data, visible: showContent, connectable: showContent },
        };
      }),
  ];
}

// ── Hook ─────────────────────────────────────────────

/**
 * 节点拖拽吸附逻辑：同类型合并 / 入板 / 出板
 */
export function useNodeAdsorption(
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
  getIntersectingNodes: (node: Node) => Node[],
  showContent: boolean,
) {
  const overlappingNodeRef = useRef<Node<ElectricalComponentData> | null>(null);

  const onNodeDrag = useCallback(
    (_evt: React.MouseEvent<Element>, dragNode: Node) => {
      const intersectingNode = getIntersectingNodes(
        dragNode,
      )?.[0] as Node<ElectricalComponentData>;
      overlappingNodeRef.current = intersectingNode;
      if (intersectingNode) {
        setNodes((prevNodes) =>
          prevNodes.map((prevNode) => {
            if (
              prevNode.id === intersectingNode.id ||
              prevNode.id === dragNode.id
            ) {
              const state =
                prevNode.id === intersectingNode.id
                  ? getDragState(
                      intersectingNode,
                      dragNode,
                      prevNode.data.state as
                        | ElectricalComponentState
                        | undefined,
                    )
                  : undefined;
              return { ...prevNode, data: { ...prevNode.data, state } };
            }
            return prevNode;
          }),
        );
      } else {
        setNodes((prevNodes) =>
          prevNodes.map((prevNode) => ({
            ...prevNode,
            data: { ...prevNode.data, state: undefined },
          })),
        );
      }
    },
    [getIntersectingNodes],
  );

  const onNodeDragStop: OnNodeDrag<Node<ElectricalComponentData>> = useCallback(
    (_event, dragNode) => {
      const overlappingNode = overlappingNodeRef.current;
      if (
        !overlappingNode ||
        (overlappingNode.type !== ElectricalComponentType.Board &&
          dragNode?.parentId)
      )
        return;

      const { value: overlapVal = 0, type } = overlappingNode.data;
      if (isElectricalComponent(type) && dragNode.data.type === type) {
        setNodes((prevNodes) =>
          mergeComponentValues(prevNodes, overlappingNode, dragNode, overlapVal),
        );
      } else if (overlappingNode.type === ElectricalComponentType.Board) {
        setNodes((prevNodes) =>
          dropNodeToBoard(prevNodes, overlappingNode, dragNode, showContent),
        );
      }
    },
    [showContent],
  );

  return { onNodeDrag, onNodeDragStop };
}
