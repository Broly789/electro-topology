import { useState, useCallback } from "react";
import type { Node } from "@xyflow/react";

/**
 * 节点选中状态管理。
 */
export function useNodeSelection() {
  const [selectedNode, setSelectedNode] = useState<Node | undefined>();

  const onNodeClick = useCallback(
    (_: React.MouseEvent<Element>, node: Node) => setSelectedNode(node),
    [],
  );

  const onPaneClick = useCallback(() => setSelectedNode(undefined), []);

  return { selectedNode, onNodeClick, onPaneClick };
}
