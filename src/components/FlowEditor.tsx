import { useState, useCallback, useRef } from "react";
import { Box, Text, Flex, IconButton } from "@chakra-ui/react";
import { useTheme } from "ahooks";
import ComponentDetail from "./ComponentDetail";
import { COMPONENTS } from "@/constants";
import {
  ELECTRICAL_COMPONENTS,
  ElectricalComponentState,
  ElectricalComponentType,
  type ElectricalComponentKeysType,
  type ElectricalComponentData,
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
  useReactFlow,
  reconnectEdge,
  type Node,
  type Edge,
  type Connection,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type DefaultEdgeOptions,
  type OnReconnect,
} from "@xyflow/react";
import ConnectionLine from "@/components/topology-node/ConnectionLine";
import { v4 as uuid } from "uuid";

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
  const { screenToFlowPosition, getIntersectingNodes } = useReactFlow();
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

  const dragOutsideRef = useRef<ElectricalComponentKeysType | null>(null);
  const onDragStart = (
    event: React.DragEvent<HTMLButtonElement>,
    type: ElectricalComponentKeysType,
  ) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("type", type);
    dragOutsideRef.current = type;
  };

  const onDragOver: React.DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const isElectricalComponent = (
    type: ElectricalComponentKeysType | undefined,
  ): type is ElectricalPartialComponentType => {
    return ELECTRICAL_COMPONENTS.includes(
      type as ElectricalPartialComponentType,
    );
  };

  const NODE_WIDTH = 50; // 你元件的宽度
  const NODE_HEIGHT = 25; // 你元件的高度
  const onDrop: React.DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    // const type = event.dataTransfer.getData(
    //   "type",
    // ) as ElectricalComponentKeysType;
    const type = dragOutsideRef.current;
    if (!type) return;

    const position = screenToFlowPosition({
      x: event.clientX - NODE_WIDTH,
      y: event.clientY - NODE_HEIGHT,
    });
    let node: Node | undefined;
    if (isElectricalComponent(type)) {
      node = {
        id: uuid(),
        type: "electricalComponent",
        data: { type, value: 3 },
        position,
      };
    } else if (type === ElectricalComponentType.Bulb) {
      node = {
        id: uuid(),
        type,
        data: { value: 12 },
        position,
      };
    } else if (type === ElectricalComponentType.Battery) {
      node = {
        id: uuid(),
        type,
        data: { value: 12 },
        position,
      };
    }
    if (node) setNodes((prevNodes) => [...prevNodes, node]);
  };
  const [selectedNode, setSelectedNode] = useState<Node | undefined>(undefined);
  const onNodeClick = (event: React.MouseEvent<Element>, node: Node) => {
    console.log(node);
    setSelectedNode(node);
  };
  const onPaneClick = () => {
    setSelectedNode(undefined);
  };

  const edgeReconnectSuccessful = useRef(false);

  const onReconnectStart = () => {
    edgeReconnectSuccessful.current = false;
  };

  const onReconnect: OnReconnect = (oldEdge, newConnection) => {
    edgeReconnectSuccessful.current = true;
    setEdges((prevEdges) => reconnectEdge(oldEdge, newConnection, prevEdges));
  };

  const onReconnectEnd = (_: MouseEvent | TouchEvent, edge: Edge) => {
    if (!edgeReconnectSuccessful.current) {
      setEdges((prevEdges) =>
        prevEdges.filter((prevEdge) => prevEdge.id !== edge.id),
      );
    }
  };

  const onNodeDrag = (evt: React.MouseEvent<Element>, dragNode: Node) => {
    const intersectingNode = getIntersectingNodes(
      dragNode,
    )?.[0] as Node<ElectricalComponentData>;

    setNodes((prevNodes) => {
      return prevNodes.map((node) => {
        if (node.id === dragNode.id) {
          return {
            ...node,
            data: {
              ...node.data,
              state:
                intersectingNode &&
                isElectricalComponent(intersectingNode.data?.type)
                  ? intersectingNode.data.type === dragNode.data?.type
                    ? ElectricalComponentState.Add
                    : ElectricalComponentState.NotAdd
                  : undefined,
            },
          };
        }
        return node;
      });
    });
  };

  return (
    <Box
      height="100%"
      width="100vw"
      border="1px solid black"
      position="relative"
    >
      {selectedNode && (
        <Flex
          position="absolute"
          top={0}
          left={0}
          width="150px"
          height="100%"
          alignItems="center"
          marginLeft="12px"
          bg="transparent"
        >
          <Box
            position="relative"
            width="100%"
            bg="white"
            height="150px"
            border="1px solid #ccc"
            borderRadius="12px"
            marginBottom="50px"
            padding="12px"
            zIndex={1000}
          >
            <ComponentDetail node={selectedNode} key={selectedNode.id} />
          </Box>
        </Flex>
      )}
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
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onReconnect={onReconnect}
        onReconnectStart={onReconnectStart}
        onReconnectEnd={onReconnectEnd}
        onNodeDrag={onNodeDrag}
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
    </Box>
  );
}
