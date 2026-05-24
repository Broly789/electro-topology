import { useCallback, useRef } from "react";
import { reconnectEdge, type Edge, type OnReconnect } from "@xyflow/react";

/**
 * 边重连逻辑封装。
 * 拖动边的端点连接到其他节点时，处理重连或删除失败的重连。
 */
export function useEdgeReconnect(
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>,
) {
  const edgeReconnectSuccessful = useRef(false);

  const onReconnectStart = useCallback(() => {
    edgeReconnectSuccessful.current = false;
  }, []);

  const onReconnect: OnReconnect = useCallback(
    (oldEdge, newConnection) => {
      edgeReconnectSuccessful.current = true;
      setEdges((prev) => reconnectEdge(oldEdge, newConnection, prev));
    },
    [setEdges],
  );

  const onReconnectEnd = useCallback(
    (_: MouseEvent | TouchEvent, edge: Edge) => {
      if (!edgeReconnectSuccessful.current) {
        setEdges((prev) => prev.filter((e) => e.id !== edge.id));
      }
    },
    [setEdges],
  );

  return { onReconnectStart, onReconnect, onReconnectEnd };
}
