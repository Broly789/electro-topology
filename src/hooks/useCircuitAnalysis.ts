import { useMemo } from "react";
import {
  useStore,
  useReactFlow,
  useNodesData,
  getOutgoers,
  type Node,
  type Edge,
  type ReactFlowState,
} from "@xyflow/react";
import {
  ElectricalComponentType,
  type ElectricalComponentData,
  type ElectricalComponentKeysType,
} from "@/types";

interface CircuitResult {
  isComplete: boolean;
  hasBattery: boolean;
  resistorNodeIds: string[];
}

/**
 * 从 nodeId 出发，沿出边遍历电路。
 * 一次遍历替代原来的三次独立递归（isCircuitComplete / isHasBattery / getCircuitResistors），
 * 消除重复的 getNodes() / getEdges() 调用。
 */
function traverseCircuit(
  nodeId: string,
  targetId: string,
  nodes: Node[],
  edges: Edge[],
): CircuitResult {
  let hasBattery = false;
  const resistorNodeIds: string[] = [];

  function check(currentId: string): boolean {
    const node = nodes.find((n) => n.id === currentId);
    if (!node) return false;

    const outgoer = getOutgoers(node, nodes, edges)?.[0];
    if (!outgoer) return false;

    // 回到了起点 → 回路闭合
    if (outgoer.id === targetId) return true;

    const reached = check(outgoer.id);
    if (!reached) return false;

    // 回溯时收集信息（与递归调用顺序无关的信息）
    if (outgoer.type === ElectricalComponentType.Battery) {
      hasBattery = true;
    }
    if (outgoer.data?.type === ElectricalComponentType.Resistor) {
      resistorNodeIds.push(outgoer.id);
    }

    return true;
  }

  const isComplete = check(nodeId);
  return { isComplete, hasBattery, resistorNodeIds };
}

const edgeSelector = (state: ReactFlowState) => ({
  edgesLength: state.edges.length,
  nodesLength: state.nodes.length,
});

/**
 * 分析电路状态：电路是否闭合、是否有电池、总电阻值、灯泡是否亮起。
 *
 * @param nodeId - 灯泡节点的 ID
 */
export function useCircuitAnalysis(nodeId: string) {
  const { getNodes, getEdges } = useReactFlow();
  const { edgesLength, nodesLength } = useStore(edgeSelector);

  // 一次遍历完成三个判断，替代原来的三次递归
  const { isComplete, hasBattery, resistorNodeIds } = useMemo(() => {
    return traverseCircuit(nodeId, nodeId, getNodes(), getEdges());
  }, [nodeId, nodesLength, edgesLength, getNodes, getEdges]);

  // 保持原有 useNodesData 订阅逻辑不变
  const componentsNodeData = useNodesData<
    Node<ElectricalComponentData, ElectricalComponentKeysType>
  >(resistorNodeIds);

  const totalResistanceValue = useMemo(
    () =>
      componentsNodeData.reduce(
        (acc, node) => acc + (node?.data?.value ?? 0),
        0,
      ),
    [componentsNodeData],
  );

  const isOn = useMemo(
    () => isComplete && hasBattery && totalResistanceValue < 12,
    [isComplete, hasBattery, totalResistanceValue],
  );

  return {
    isOn,
    isCircuitComplete: isComplete,
    isHasBattery: hasBattery,
    totalResistanceValue,
  } as const;
}
