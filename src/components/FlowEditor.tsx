import { useState, useCallback, useRef } from "react";
import { Text, Flex, IconButton } from "@chakra-ui/react";
import { useTheme } from "ahooks";

import { COMPONENTS } from "@/constants";
import {
  ELECTRICAL_COMPONENTS,
  type ElectricalPartialComponentType,
} from "@/types";

import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Background,
  Controls,
  BackgroundVariant,
  ConnectionMode,
  MarkerType,
  Panel,
  type Node,
  type Edge,
  type Connection,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type DefaultEdgeOptions,
  useReactFlow,
} from "@xyflow/react";
import ConnectionLine from "@/components/topology-node/ConnectionLine";
import { v4 as uuid } from "uuid";
import { ElectricalComponentType } from "@/types";
import { nodeTypes, edgeTypes } from "./topology-node/register";
import "@xyflow/react/dist/style.css";

const initialNodes: Node[] = [
  {
    id: "1",
    position: { x: 100, y: 100 },
    data: { type: ElectricalComponentType.Resistor, value: 3 },
    type: "electricalComponent",
  },
  {
    id: "2",
    position: { x: 200, y: 200 },
    data: { type: ElectricalComponentType.Capacitor, value: 5 },
    type: "electricalComponent",
  },
  {
    id: "3",
    position: { x: 300, y: 300 },
    data: { type: ElectricalComponentType.Inductor, value: 2 },
    type: "electricalComponent",
  },
];
// const initialEdges: Edge[] = [{ id: "n1-n2", source: "1", target: "2" }];
const initialEdges: Edge[] = [];

export default function FlowEditor() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const defaultEdgeOptions: DefaultEdgeOptions = {
    // animated: true,
  };

  const isValidConnection = useCallback((connection: Connection | Edge) => {
    const { source, target } = connection;
    if (source === target) return false;
    return true;
  }, []);
  const onNodesChange: OnNodesChange = useCallback(
    (changes) =>
      setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  );
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) =>
      setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );
  const { theme } = useTheme();
  const { screenToFlowPosition } = useReactFlow();
  const onConnect: OnConnect = useCallback(
    (params) =>
      setEdges((edgesSnapshot) =>
        addEdge(
          {
            ...params,
            id: uuid(),
            type: "wire",
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 20,
              height: 20,
              color: "#ffc300",
            },
            // markerStart: {
            //   type: MarkerType.ArrowClosed, // 也使用封闭箭头
            //   orient: "auto-start-reverse", // 起点箭头方向自动翻转
            //   color: "#ffc300",
            //   width: 20,
            //   height: 20,
            // },
          },
          edgesSnapshot,
        ),
      ),
    [],
  );

  const dragOutsideRef = useRef<ElectricalPartialComponentType | null>(null);
  const onDragStart = (
    event: React.DragEvent<HTMLButtonElement>,
    type: ElectricalPartialComponentType,
  ) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("type", type);
    dragOutsideRef.current = type;
  };

  const onDragOver: React.DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const onDrop: React.DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    // const type = event.dataTransfer.getData(
    //   "type",
    // ) as ElectricalPartialComponentType;
    const type = dragOutsideRef.current;
    if (!type) return;

    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });
    let node: Node | undefined;
    if (ELECTRICAL_COMPONENTS.includes(type)) {
      node = {
        id: uuid(),
        type: "electricalComponent",
        data: { type, value: 3 },
        position,
      };
    }
    if (node) setNodes((prevNodes) => [...prevNodes, node]);
  };
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      connectionMode={ConnectionMode.Loose}
      edgeTypes={edgeTypes}
      nodeTypes={nodeTypes}
      connectionLineComponent={ConnectionLine}
      fitView
      defaultEdgeOptions={defaultEdgeOptions}
      proOptions={{
        hideAttribution: true,
      }}
      isValidConnection={isValidConnection}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <Panel
        position="top-right"
        className="border border-gray-200 p-4! rounded-lg bg-white w-37"
      >
        <Flex gap={2} direction="column">
          <div>
            <Text fontSize="sm">Components</Text>
            <Flex mt={1} gap={1} flexWrap="wrap">
              {COMPONENTS.map((component) => (
                <IconButton
                  key={component.label}
                  size="sm"
                  aria-label={component.label}
                  draggable
                  variant={theme === "dark" ? "outline" : "subtle"}
                  onDragStart={(event: React.DragEvent<HTMLButtonElement>) =>
                    onDragStart(event, component.type)
                  }
                >
                  {component.icon}
                </IconButton>
              ))}
            </Flex>
          </div>
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
  );
}
