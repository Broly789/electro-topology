import { useEffect, useTransition } from "react";
import { useStore, type Node } from "@xyflow/react";
import { zoomSelector } from "@/utils";

/**
 * 缩放级别 → 节点显隐/可交互控制。
 * 缩放到一定级别以下时，板内子节点隐藏以提升性能。
 */
export function useZoomVisibility(
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
) {
  const showContent = useStore(zoomSelector);
  const [, startTransition] = useTransition();

  useEffect(() => {
    startTransition(() => {
      setNodes((prevNodes) =>
        prevNodes.map((node) => {
          if (node.parentId) {
            return {
              ...node,
              draggable: showContent,
              selectable: showContent,
              data: {
                ...node.data,
                visible: showContent,
                connectable: showContent,
              },
            };
          }
          return {
            ...node,
            draggable: true,
            selectable: true,
            data: {
              ...node.data,
              visible: true,
              connectable: true,
            },
          };
        }),
      );
    });
  }, [showContent]);

  return showContent;
}
