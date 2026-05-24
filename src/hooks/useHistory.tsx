import { type Node, type Edge, useReactFlow } from "@xyflow/react";
import { HistoryAction } from "@/types";
import { useState, useRef, useCallback } from "react";

type HistoryItem = {
  action: HistoryAction;
  data: Node | Edge | undefined;
};

/**
 * 撤销/重做历史管理 hook。
 *
 * 核心思路：
 * - 每个操作（增/删节点/边）都记录一条 HistoryItem
 * - currentIndex 指向「当前已应用的步骤」
 * - undo：从 currentIndex 读取记录 → 反向执行 → 指针回退
 * - redo：指针前进 → 从新位置读取记录 → 重新执行
 */
const useHistory = () => {
  // ── 状态 ───────────────────────────────────────────────

  /** 历史记录栈（仅用于 UI 展示，真正的 undo/redo 依赖于下方的 currentIndex） */
  const [history, setHistory] = useState<HistoryItem[]>([]);

  /**
   * 当前「已应用的步骤」索引。
   * - 初始为 -1，表示尚无操作
   * - 每次 addToHistory → +1
   * - undo → -1；redo → +1
   * 使用 ref 而非 state，避免 undo/redo 时触发额外渲染。
   */
  const currentIndex = useRef(-1);

  /**
   * 历史记录总长度（用于 redo 边界判断）。
   * 因为 history push 后可能触发 undo 回退，
   * redo 不能超出已记录的最大长度。
   */
  const historyLengthRef = useRef(0);

  // ── 写入历史 ───────────────────────────────────────────

  /**
   * 向历史栈追加一条记录。
   *
   * 关键行为「剪枝」：如果在某条记录之后做了新操作，
   * 则丢弃该记录之后的「未来」历史（因为回退不回去了）。
   * 例如：undo 3 步 → 做了新操作 → 那被 undo 的 3 步就扔掉。
   *
   * 使用 setState 函数式更新，不依赖闭包中的 history，
   * 因此依赖数组可以保持 []，引用永不变化。
   */
  const addToHistory = useCallback((newState: HistoryItem) => {
    setHistory((prev) => {
      // 截断 currentIndex 之后的记录（剪枝）
      const next = [...prev].slice(0, currentIndex.current + 1);
      next.push(newState);
      currentIndex.current += 1;
      historyLengthRef.current = next.length;
      return next;
    });
  }, []);

  const { setNodes, setEdges } = useReactFlow();

  // ── 增删操作（同时处理数据变更 + 是否记入历史）───────────

  /**
   * @param shouldAddToHistory - 调为 false 表示这是 undo/redo 触发的回放，
   *                             不需要再记入历史（否则死循环）。
   */
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

  // ── 撤销 / 重做 ────────────────────────────────────────

  /**
   * 撤销（Ctrl+Z）。
   *
   * 从 currentIndex 读取当前步骤的记录，
   * 反向执行该操作的逆操作，然后将指针回退。
   *
   * 例：记录是 AddNode → 逆操作是 removeNode(node, false)
   *    记录是 RemoveNode → 逆操作是 addNode(node, false)
   *
   * 反向执行时传 false 避免再次入栈。
   */
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
    }
    currentIndex.current -= 1;
  }, [history, currentIndex, addNode, addEdge, removeNode, removeEdge]);

  /**
   * 重做（Ctrl+Shift+Z）。
   *
   * 先试探能否前进（不超过 historyLengthRef），
   * 指针前进后读取新位置的记录，重新执行原操作。
   */
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
    }
  }, [history, currentIndex, addNode, addEdge, removeNode, removeEdge]);

  return {
    history,
    addToHistory,
    undo,
    redo,
    addNode,
    addEdge,
    removeNode,
    removeEdge,
  };
};

export default useHistory;
