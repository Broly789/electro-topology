import {
  Position,
  useStore,
  useReactFlow,
  useNodesData,
  getOutgoers,
  type Node,
  type NodeProps,
  type ReactFlowState,
} from "@xyflow/react";
import { Box, Text } from "@chakra-ui/react";
import {
  ElectricalComponentType,
  type ElectricalComponentData,
  type ElectricalComponentKeysType,
} from "@/types";
import { default as BulbIcon } from "@/icons/Bulb";
import { getUnit } from "@/utils/";
import TerminalHandle from "./TerminalHandle";
import { useDarkMode } from "@/store/useDarkMode";
import { useMemo, useCallback } from "react";

type BulbNode = Node<ElectricalComponentData, ElectricalComponentKeysType>;
const edgeSelector = (state: ReactFlowState) => ({
  edgesLength: state.edges.length,
  nodesLength: state.nodes.length,
});
const BulbComponent = ({ id, type, data: { value } }: NodeProps<BulbNode>) => {
  const unit = getUnit(type);
  const { isDark } = useDarkMode();
  const color = isDark ? "white" : "black";
  const { getNodes, getEdges } = useReactFlow();
  const { edgesLength, nodesLength } = useStore(edgeSelector);

  const isCircuitComplete = useCallback(
    function checkCircuit(nodeId: string, targetId: string): boolean {
      const nodes = getNodes();
      const edges = getEdges();
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return false;
      const outgoer = getOutgoers(node, nodes, edges)?.[0];
      if (!outgoer) return false;
      if (outgoer.id === targetId) return true;
      return checkCircuit(outgoer.id, targetId);
    },
    [getNodes, getEdges],
  );

  const isHasBattery = useCallback(
    function checkHasBattery(nodeId: string, targetId: string): boolean {
      const nodes = getNodes();
      const edges = getEdges();
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return false;
      const outgoer = getOutgoers(node, nodes, edges)?.[0];
      if (!outgoer) return false;
      if (outgoer.id === targetId) return false;
      if (outgoer.type === ElectricalComponentType.Battery) return true;
      return checkHasBattery(outgoer.id, targetId);
    },
    [getNodes, getEdges],
  );

  const getCircuitResistors = useCallback(
    function getCircuitResistors(
      nodeId: string,
      targetId: string,
      components: Node[] = [],
    ): Node[] {
      const nodes = getNodes();
      const edges = getEdges();
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return components;
      const outgoer = getOutgoers(node, nodes, edges)?.[0];
      if (!outgoer) return components;
      if (outgoer.id === targetId) return components;
      if (outgoer.data.type === ElectricalComponentType.Resistor)
        components.push(outgoer);
      return getCircuitResistors(outgoer.id, targetId, components);
    },
    [getNodes, getEdges],
  );

  const resistorNodeIds = useMemo(() => {
    return getCircuitResistors(id, id).map((node) => node.id);
  }, [id, nodesLength, edgesLength, getCircuitResistors]);

  const componentsNodeData =
    useNodesData<Node<ElectricalComponentData, ElectricalComponentKeysType>>(
      resistorNodeIds,
    );

  const totalResistanceValue = useMemo(() => {
    return componentsNodeData.reduce(
      (acc, node) => acc + (node?.data?.value ?? 0),
      0,
    );
  }, [componentsNodeData]);

  const isOn = useMemo(() => {
    return (
      isCircuitComplete(id, id) &&
      isHasBattery(id, id) &&
      totalResistanceValue < 12
    );
  }, [
    id,
    edgesLength,
    isCircuitComplete,
    isHasBattery,
    totalResistanceValue,
    componentsNodeData,
  ]);

  return (
    <Box>
      <BulbIcon color={color} isOn={isOn} height={64} />
      <Text fontSize="xx-small" position="absolute">
        {value} {unit}
      </Text>
      <TerminalHandle
        style={{
          top: 50,
          right: 22,
        }}
        type="target"
        position={Position.Right}
        id="right"
      />
      <TerminalHandle
        style={{
          top: 50,
          left: 22,
        }}
        type="source"
        position={Position.Left}
        id="left"
      />
    </Box>
  );
};

export default BulbComponent;
