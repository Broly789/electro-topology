import { useState, useCallback, useEffect, useTransition } from "react";
import { Box, Flex } from "@chakra-ui/react";
import useKeyBinding from "@/hooks/useKeyBinding";
import { useDarkMode } from "@/store/useDarkMode";
import { useColorMode } from "@/components/ui/color-mode";

import { ElectricalComponentType } from "@/types";

import {
  ReactFlow,
  Background,
  Controls,
  BackgroundVariant,
  MarkerType,
  Panel,
  useReactFlow,
  useEdgesState,
  useNodesState,
  type Node,
  type Edge,
  type Connection,
  type OnConnect,
  type DefaultEdgeOptions,
  type ReactFlowInstance,
} from "@xyflow/react";
import ConnectionLine from "@/components/topology-node/ConnectionLine";
import { v4 as uuid } from "uuid";

import { nodeTypes, edgeTypes } from "./topology-node/register";
import { useData } from "@/api/useData";
import { useUpdateData } from "@/api/useUpdateData";
import useHistory from "@/hooks/useHistory";
import { useEdgeReconnect } from "@/hooks/useEdgeReconnect";
import { useNodeSelection } from "@/hooks/useNodeSelection";
import { useDragDrop } from "@/hooks/useDragDrop";
import { useNodeAdsorption } from "@/hooks/useNodeAdsorption";
import { useZoomVisibility } from "@/hooks/useZoomVisibility";
import { ThemeToggle, ProjectPanel, ComponentsPanel } from "./EditorPanels";
import SelectedNodePanel from "./SelectedNodePanel";

const initialNodes: Node[] = [
  {
    id: "1",
    position: { x: 100, y: 100 },
    data: { type: ElectricalComponentType.Resistor, value: 1 },
    type: "electricalComponent",
  },
  {
    id: "2",
    position: { x: 200, y: 200 },
    data: { type: ElectricalComponentType.Capacitor, value: 2 },
    type: "electricalComponent",
  },
  {
    id: "3",
    position: { x: 300, y: 300 },
    data: { type: ElectricalComponentType.Inductor, value: 3 },
    type: "electricalComponent",
  },
];
const initialEdges: Edge[] = [];

export default function FlowEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const defaultEdgeOptions: DefaultEdgeOptions = {};

  // ── 历史记录 ──
  const { undo, redo, addNode, addEdge, batchDelete } = useHistory();

  // ── 边重连 ──
  const { onReconnectStart, onReconnect, onReconnectEnd } =
    useEdgeReconnect(setEdges);

  // ── 节点选中 ──
  const { selectedNode, onNodeClick, onPaneClick } = useNodeSelection();

  // ── 拖放创建节点 ──
  const { screenToFlowPosition, getIntersectingNodes, setViewport } =
    useReactFlow();
  const { onDragStart, onDragOver, onDrop } = useDragDrop(
    nodes,
    screenToFlowPosition,
    addNode,
  );

  // ── 缩放 → 显隐控制 ──
  const showContent = useZoomVisibility(setNodes);

  // ── 节点拖拽吸附 ──
  const { onNodeDrag, onNodeDragStop } = useNodeAdsorption(
    setNodes,
    getIntersectingNodes,
    showContent,
  );

  const isValidConnection = useCallback((connection: Connection | Edge) => {
    const { source, target } = connection;
    return source !== target;
  }, []);

  const onConnect: OnConnect = useCallback(
    (params) => {
      const edge = {
        ...params,
        id: uuid(),
        type: "wire",
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: "#ffc300",
        },
      };
      addEdge(edge);
    },
    [addEdge],
  );

  const handleDelete = useCallback(
    (params: { nodes: Node[]; edges: Edge[] }) => {
      batchDelete(params.nodes, params.edges);
    },
    [batchDelete],
  );

  useKeyBinding({ undo, redo });

  // ── 外部数据加载 ──
  const { data: reactFlowState } = useData();
  const [, startTransition] = useTransition();
  useEffect(() => {
    if (reactFlowState) {
      const {
        nodes,
        edges,
        viewport = { x: 0, y: 0, zoom: 1 },
      } = reactFlowState;
      startTransition(() => {
        setNodes(nodes);
        setEdges(edges);
        setViewport(viewport);
      });
    }
  }, [reactFlowState, setNodes, setEdges, setViewport]);

  // ── 保存 ──
  const { mutateAsync: updateData, isPending } = useUpdateData();
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const onSave = useCallback(() => {
    if (rfInstance) {
      updateData(rfInstance.toObject());
    }
  }, [rfInstance, updateData]);

  // ── 深色主题 ──
  const { colorMode, setColorMode } = useColorMode();
  const isDark = useDarkMode((state) => state.isDark);
  const toggleMode = useDarkMode((state) => state.toggleMode);
  const toggleDarkMode = useCallback(() => toggleMode(), [toggleMode]);
  useEffect(() => {
    setColorMode(isDark ? "dark" : "light");
  }, [isDark, setColorMode]);

  return (
    <Box
      height="100%"
      width="100vw"
      border="1px solid black"
      position="relative"
    >
      {selectedNode && (
        <SelectedNodePanel isDark={isDark} node={selectedNode} />
      )}
      <ReactFlow
        onInit={setRfInstance}
        nodes={nodes}
        edges={edges}
        fitView
        onlyRenderVisibleElements
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onDelete={handleDelete}
        onConnect={onConnect}
        edgeTypes={edgeTypes}
        nodeTypes={nodeTypes}
        connectionLineComponent={ConnectionLine}
        defaultEdgeOptions={defaultEdgeOptions}
        proOptions={{ hideAttribution: true }}
        isValidConnection={isValidConnection}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onReconnect={onReconnect}
        onReconnectStart={onReconnectStart}
        onReconnectEnd={onReconnectEnd}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        colorMode={colorMode}
        snapToGrid
        snapGrid={[50, 50]}
      >
        <ThemeToggle
          isDark={isDark}
          colorMode={colorMode}
          onToggle={toggleDarkMode}
        />
        <Panel
          position="top-right"
          className="border border-gray-200 p-4! rounded-lg bg-white w-37"
        >
          <Flex gap={2} direction="column">
            <ProjectPanel onSave={onSave} isPending={isPending} />
            <ComponentsPanel onDragStart={onDragStart} />
          </Flex>
        </Panel>
        <Controls />
        <Background
          gap={10}
          color="#f1f1f1"
          variant={BackgroundVariant.Lines}
          id="1"
        />
        <Background
          gap={100}
          color="#ccc"
          variant={BackgroundVariant.Lines}
          id="2"
        />
      </ReactFlow>
    </Box>
  );
}
