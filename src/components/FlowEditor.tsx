import { useState, useCallback, useRef, useEffect, useTransition } from "react";
import { Box, Text, Flex, IconButton } from "@chakra-ui/react";
import ComponentDetail from "./ComponentDetail";
import { COMPONENTS } from "@/constants";
import { isPointInBox, zoomSelector } from "@/utils";
import useKeyBinding from "@/hooks/useKeyBinding";
import { useDarkMode } from "@/store/useDarkMode";
import { useColorMode } from "@/components/ui/color-mode";

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
  Background,
  Controls,
  BackgroundVariant,
  MarkerType,
  Panel,
  useReactFlow,
  reconnectEdge,
  useStore,
  type Node,
  type Edge,
  type Connection,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type DefaultEdgeOptions,
  type OnReconnect,
  type OnNodeDrag,
  type ReactFlowInstance,
} from "@xyflow/react";
import ConnectionLine from "@/components/topology-node/ConnectionLine";
import { v4 as uuid } from "uuid";

import { nodeTypes, edgeTypes } from "./topology-node/register";
import "@xyflow/react/dist/style.css";
import { Floppy, Sun, Moon } from "react-bootstrap-icons";
import { useData } from "@/api/useData";
import { useUpdateData } from "@/api/useUpdateData";
import DownloadBtn from "@/components/DownloadBtn";
import useHistory from "@/hooks/useHistory";

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
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const defaultEdgeOptions: DefaultEdgeOptions = {
    // animated: true,
  };

  const { undo, redo, addNode, addEdge, removeNode, removeEdge } = useHistory();
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
  const { screenToFlowPosition, getIntersectingNodes, setViewport } =
    useReactFlow();
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

  // React Flow 删除节点/边后触发 → 写入历史记录
  const handleDelete = useCallback(
    (params: { nodes: Node[]; edges: Edge[] }) => {
      params.nodes.forEach((node) => removeNode(node));
      params.edges.forEach((edge) => removeEdge(edge));
    },
    [removeNode, removeEdge],
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

    // 计算拖放的画布位置
    let position = screenToFlowPosition({
      x: event.clientX - NODE_WIDTH,
      y: event.clientY - NODE_HEIGHT,
    });

    // 获取所有电路板，判断当前拖放位置是否在某个板子内
    const boards = nodes.filter(
      (node) => node.type === ElectricalComponentType.Board,
    );
    const board = boards.find((board) =>
      isPointInBox(position, {
        x: board.position.x,
        y: board.position.y,
        width: board.measured?.width ?? 0,
        height: board.measured?.height ?? 0,
      }),
    );

    // 如果拖放到板子上，计算相对坐标
    if (board) {
      const { x: overlapX = 0, y: overlapY = 0 } = board.position;
      const { x: dragX = 0, y: dragY = 0 } = position;
      // 子节点在电路板内部的位置 = 拖拽位置 - 电路板位置
      position = {
        x: dragX - overlapX,
        y: dragY - overlapY,
      };
    }

    // 根据类型创建节点
    let node: Node | undefined;
    if (isElectricalComponent(type)) {
      node = {
        id: uuid(),
        type: "electricalComponent",
        data: { type, value: 3, connectable: true },
        position,
        parentId: board?.id,
      };
    } else if (type === ElectricalComponentType.Bulb) {
      node = {
        id: uuid(),
        type,
        data: { value: 12, connectable: true },
        position,
        parentId: board?.id,
      };
    } else if (type === ElectricalComponentType.Battery) {
      node = {
        id: uuid(),
        type,
        data: { value: 12, connectable: true },
        position,
        parentId: board?.id,
      };
    } else if (type === ElectricalComponentType.Board) {
      node = {
        id: uuid(),
        type,
        data: {},
        style: { width: 180, height: 180 },
        position,
      };
    }

    if (node) {
      addNode(node);
    }
  };
  const [selectedNode, setSelectedNode] = useState<Node | undefined>(undefined);
  const onNodeClick = (event: React.MouseEvent<Element>, node: Node) => {
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

  useKeyBinding({ undo, redo });

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

  const overlappingNodeRef = useRef<Node<ElectricalComponentData> | null>(null);
  const onNodeDrag = (evt: React.MouseEvent<Element>, dragNode: Node) => {
    const intersectingNode = getIntersectingNodes(
      dragNode,
    )?.[0] as Node<ElectricalComponentData>;
    overlappingNodeRef.current = intersectingNode;
    if (intersectingNode) {
      setNodes((prevNodes) =>
        prevNodes.map((prevNode) => {
          if (
            prevNode.id === intersectingNode.id ||
            prevNode.id === dragNode.id
          ) {
            const isValid =
              intersectingNode &&
              isElectricalComponent(intersectingNode.data?.type)
                ? intersectingNode.data.type === dragNode.data?.type
                  ? ElectricalComponentState.Add
                  : ElectricalComponentState.NotAdd
                : prevNode.data.state;
            return {
              ...prevNode,
              data: {
                ...prevNode.data,
                state:
                  prevNode.id === intersectingNode.id ? isValid : undefined,
              },
            };
          }
          return prevNode;
        }),
      );
    } else {
      setNodes((prevNodes) =>
        prevNodes.map((prevNode) => ({
          ...prevNode,
          data: {
            ...prevNode.data,
            state: undefined,
          },
        })),
      );
    }
  };

  const onNodeDragStop: OnNodeDrag<Node<ElectricalComponentData>> = (
    event,
    dragNode,
  ) => {
    const overlappingNode = overlappingNodeRef.current;

    if (
      !overlappingNode ||
      (overlappingNode.type !== ElectricalComponentType.Board &&
        dragNode?.parentId)
    )
      return;

    const overlapData = overlappingNode.data;
    const { value: overlapVal = 0, type } = overlapData;
    if (isElectricalComponent(type) && dragNode.data.type === type) {
      setNodes((prevNodes) =>
        prevNodes
          .map((prevNode) => {
            if (prevNode.id === overlappingNode.id) {
              return {
                ...prevNode,
                data: {
                  ...prevNode.data,
                  value: overlapVal + (dragNode.data.value ?? 0),
                  state: undefined,
                },
              };
            }
            if (prevNode.id === dragNode.id) {
              return {
                ...prevNode,
                data: {
                  ...prevNode.data,
                  visible: false,
                  state: undefined,
                },
              };
            }
            return {
              ...prevNode,
              data: {
                ...prevNode.data,
                state: undefined,
              },
            };
          })
          .filter((node) => node.id !== dragNode.id),
      );
    } else if (overlappingNode.type === ElectricalComponentType.Board) {
      setNodes((prevNodes) => [
        overlappingNode,
        ...prevNodes
          .filter((node) => node.id !== overlappingNode.id)
          .map((node) => {
            if (node.id === dragNode.id) {
              const { x: dragX, y: dragY } = dragNode.position ?? {
                x: 0,
                y: 0,
              };
              const { x: overlapX = 0, y: overlapY = 0 } =
                overlappingNode.position ?? { x: 0, y: 0 };
              let position;
              if (!dragNode.parentId) {
                position = {
                  x: dragX - overlapX,
                  y: dragY - overlapY,
                };
              } else if (
                dragNode.parentId &&
                dragNode.parentId !== overlappingNode.id
              ) {
                const prevParentNode = prevNodes.find(
                  (n) => n.id === dragNode.parentId,
                );
                const { x: px = 0, y: py = 0 } = prevParentNode?.position ?? {};
                position = {
                  x: dragX + px - overlapX,
                  y: dragY + py - overlapY,
                };
              }
              return {
                ...node,
                parentId: overlappingNode.id,
                ...(position && { position }),
                draggable: showContent,
                selectable: showContent,
                data: {
                  ...node.data,
                  visible: showContent,
                  connectable: showContent,
                },
              };
            }
            return node;
          }),
      ]);
    }
  };

  const { data: reactFlowState } = useData();

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
  }, [reactFlowState, setViewport]);

  const { mutateAsync: updateData, isPending } = useUpdateData();
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const onSave = () => {
    if (rfInstance) {
      updateData(rfInstance.toObject());
    }
  };

  const { colorMode, setColorMode } = useColorMode();
  const isDark = useDarkMode((state) => state.isDark);
  const toggleMode = useDarkMode((state) => state.toggleMode);

  const toggleDarkMode = () => {
    toggleMode();
  };

  // OS 系统切换 或 手动点击 → Zustand isDark 变化 → 同步到 next-themes
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
            <ComponentDetail isDark node={selectedNode} key={selectedNode.id} />
          </Box>
        </Flex>
      )}
      <ReactFlow
        onInit={setRfInstance}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onDelete={handleDelete}
        onConnect={onConnect}
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
        onNodeDragStop={onNodeDragStop}
        colorMode={colorMode}
      >
        <Panel position="top-left">
          <IconButton
            onClick={toggleDarkMode}
            variant={"surface"}
            colorPalette={isDark ? "blackAlpha" : "orange"}
            size="sm"
          >
            {colorMode === "light" ? <Sun /> : <Moon />}
          </IconButton>
        </Panel>
        <Panel
          position="top-right"
          className="border border-gray-200 p-4! rounded-lg bg-white w-37"
        >
          <Flex gap={2} direction="column">
            <div>
              <Text fontSize="sm">Project</Text>
              <Flex mt={1} gap={1} flexWrap="wrap">
                <IconButton
                  aria-label="Save"
                  size="xs"
                  variant={"subtle"}
                  onClick={onSave}
                  loading={isPending}
                >
                  <Floppy />
                </IconButton>

                <DownloadBtn />
              </Flex>
            </div>
            <div>
              <Text fontSize="sm">Components</Text>
              <Flex mt={1} gap={1} flexWrap="wrap">
                {COMPONENTS.map((component) => (
                  <IconButton
                    key={component.label}
                    size="sm"
                    aria-label={component.label}
                    draggable
                    variant={"subtle"}
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
