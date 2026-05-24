import { type Node, type Edge, useReactFlow } from "@xyflow/react";
import { HistoryAction } from "@/types";
import { useState, useRef, useCallback } from "react";

type BatchData = { nodes: Node[]; edges: Edge[] };
type HistoryData = Node | Edge | BatchData | undefined;

type HistoryItem = {
  action: HistoryAction;
  data: HistoryData;
};

/**
 * 撤销/重做历史管理 hook。
 *
 * 核心思路：
 * - 每个操作都记录一条 HistoryItem
 * - currentIndex 指向「当前已应用的步骤」
 * - undo：从 currentIndex 读取记录 → 反向执行 → 指针回退
 * - redo：指针前进 → 从新位置读取记录 → 重新执行
 *
 * 批量操作（如删除节点+关联连线）会在一次写入中完成，
 * undo 时也一次恢复，避免多次按键。
 */
const useHistory = () => {
  // ── 状态 ───────────────────────────────────────────────

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const currentIndex = useRef(-1);
  const historyLengthRef = useRef(0);

  // ── 写入历史 ───────────────────────────────────────────

  const addToHistory = useCallback((newState: HistoryItem) => {
    setHistory((prev) => {
      const next = [...prev].slice(0, currentIndex.current + 1);
      next.push(newState);
      currentIndex.current += 1;
      historyLengthRef.current = next.length;
      return next;
    });
  }, []);

  const { setNodes, setEdges } = useReactFlow();

  // ── 增删操作 ───────────────────────────────────────────

  const addNode = useCallback(
    (node: Node | undefined, shouldAddToHistory: boolean = true) => {
      if (node === undefined) return;
      setNodes((nodes) => [...nodes, node]);
      if (shouldAddToHistory) {
        addToHistory({ action: HistoryAction.AddNode, data: node });
      }
    },
    [setNodes, addToHistory],
  );

  const addEdge = useCallback(
    (edge: Edge | undefined, shouldAddToHistory: boolean = true) => {
      if (edge === undefined) return;
      setEdges((edges) => [...edges, edge]);
      if (shouldAddToHistory) {
        addToHistory({ action: HistoryAction.AddEdge, data: edge });
      }
    },
    [setEdges, addToHistory],
  );

  const removeNode = useCallback(
    (node: Node | undefined, shouldAddToHistory: boolean = true) => {
      if (node === undefined) return;
      setNodes((nodes) => nodes.filter((n) => n.id !== node.id));
      if (shouldAddToHistory) {
        addToHistory({ action: HistoryAction.RemoveNode, data: node });
      }
    },
    [setNodes, addToHistory],
  );

  const removeEdge = useCallback(
    (edge: Edge | undefined, shouldAddToHistory: boolean = true) => {
      if (edge === undefined) return;
      setEdges((edges) => edges.filter((e) => e.id !== edge.id));
      if (shouldAddToHistory) {
        addToHistory({ action: HistoryAction.RemoveEdge, data: edge });
      }
    },
    [setEdges, addToHistory],
  );

  /**
   * 批量删除节点及关联连线，只写入一条历史记录。
   * undo 时一次恢复所有，无需反复按键。
   */
  const batchDelete = useCallback(
    (nodes: Node[], edges: Edge[]) => {
      if (nodes.length === 0 && edges.length === 0) return;
      const nodeIds = new Set(nodes.map((n) => n.id));
      const edgeIds = new Set(edges.map((e) => e.id));
      setNodes((prev) => prev.filter((n) => !nodeIds.has(n.id)));
      setEdges((prev) => prev.filter((e) => !edgeIds.has(e.id)));
      addToHistory({
        action: HistoryAction.BatchDelete,
        data: { nodes, edges },
      });
    },
    [setNodes, setEdges, addToHistory],
  );

  // ── 撤销 / 重做 ────────────────────────────────────────

  const undo = useCallback(() => {
    if (currentIndex.current < 0) return;
    const { action, data } = history[currentIndex.current] || {};
    switch (action) {
      case HistoryAction.AddNode:
        removeNode(data as Node, false);
        break;
      case HistoryAction.AddEdge:
        removeEdge(data as Edge, false);
        break;
      case HistoryAction.RemoveNode:
        addNode(data as Node, false);
        break;
      case HistoryAction.RemoveEdge:
        addEdge(data as Edge, false);
        break;
      case HistoryAction.BatchDelete: {
        const { nodes, edges } = data as BatchData;
        setNodes((prev) => [...prev, ...nodes]);
        setEdges((prev) => [...prev, ...edges]);
        break;
      }
    }
    currentIndex.current -= 1;
  }, [
    history,
    currentIndex,
    addNode,
    addEdge,
    removeNode,
    removeEdge,
    setNodes,
    setEdges,
  ]);

  const redo = useCallback(() => {
    if (currentIndex.current >= historyLengthRef.current - 1) return;
    currentIndex.current += 1;
    const { action, data } = history[currentIndex.current] || {};
    switch (action) {
      case HistoryAction.AddNode:
        addNode(data as Node, false);
        break;
      case HistoryAction.AddEdge:
        addEdge(data as Edge, false);
        break;
      case HistoryAction.RemoveNode:
        removeNode(data as Node, false);
        break;
      case HistoryAction.RemoveEdge:
        removeEdge(data as Edge, false);
        break;
      case HistoryAction.BatchDelete: {
        const { nodes, edges } = data as BatchData;
        const nodeIds = new Set(nodes.map((n) => n.id));
        const edgeIds = new Set(edges.map((e) => e.id));
        setNodes((prev) => prev.filter((n) => !nodeIds.has(n.id)));
        setEdges((prev) => prev.filter((e) => !edgeIds.has(e.id)));
        break;
      }
    }
  }, [
    history,
    currentIndex,
    historyLengthRef,
    addNode,
    addEdge,
    removeNode,
    removeEdge,
    setNodes,
    setEdges,
  ]);

  return {
    history,
    addToHistory,
    undo,
    redo,
    addNode,
    addEdge,
    removeNode,
    removeEdge,
    batchDelete,
  };
};

export default useHistory;
