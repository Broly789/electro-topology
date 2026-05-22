import { useState, useCallback, useRef, useEffect, useTransition } from "react";
import { Box, Text, Flex, IconButton } from "@chakra-ui/react";
import { useTheme } from "ahooks";
import ComponentDetail from "./ComponentDetail";
import { COMPONENTS } from "@/constants";
import { isPointInBox, zoomSelector } from "@/utils";
import useKeyBinding from "@/hooks/useKeyBinding";

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
import { Floppy } from "react-bootstrap-icons";
import { useData } from "@/api/useData";
import { useUpdateData } from "@/api/useUpdateData";
import DownloadBtn from "@/components/DownloadBtn";

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
  const { screenToFlowPosition, getIntersectingNodes, setViewport } =
    useReactFlow();
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
        data: { type, value: 3 },
        position,
        parentId: board?.id,
      };
    } else if (type === ElectricalComponentType.Bulb) {
      node = {
        id: uuid(),
        type,
        data: { value: 12 },
        position,
        parentId: board?.id,
      };
    } else if (type === ElectricalComponentType.Battery) {
      node = {
        id: uuid(),
        type,
        data: { value: 12 },
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
      setNodes((prevNodes) => [...prevNodes, node]);
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

  useKeyBinding();

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

  const onNodeDragStop: OnNodeDrag<Node<ElectricalComponentData>> = (
    event,
    dragNode,
  ) => {
    // 1. 拿到重叠节点（提前 return 防止空值）
    const overlappingNode = overlappingNodeRef.current;
    if (
      !overlappingNode ||
      (overlappingNode.type !== ElectricalComponentType.Board &&
        dragNode?.parentId)
    ) {
      setNodes((prevNodes) => {
        const parentNode = prevNodes.find(
          (node) => node.id === dragNode.parentId,
        );
        return prevNodes.map((node) => {
          if (node.id === dragNode.id) {
            const { x: px, y: py } = parentNode?.position || { x: 0, y: 0 };
            const { x: dx, y: dy } = dragNode?.position || { x: 0, y: 0 };
            return {
              ...node,
              parentId: undefined,
              position: {
                x: px + dx,
                y: py + dy,
              },
            };
          }
          return node;
        });
      });
    }

    if (!overlappingNode) return;

    const { id: overlappingNodeId, data: overlapData } = overlappingNode;
    const { value: overlapVal = 0, type } = overlapData;
    // 2. 类型校验（不满足直接退出）
    if (isElectricalComponent(type) && dragNode.data.type === type) {
      // 3. 开始更新节点
      setNodes((prevNodes) =>
        prevNodes
          .map((node) => {
            // 只更新重叠的那个节点
            if (node.id === overlappingNode.id) {
              return {
                ...node,
                data: {
                  ...node.data,
                  value: overlapVal + (dragNode.data.value ?? 0),
                },
              };
            }
            return node;
          })
          // 4. 删除被拖拽的节点
          .filter((node) => node.id !== dragNode.id),
      );
    } else if (overlappingNode.type === ElectricalComponentType.Board) {
      // 1. 判断：重叠的节点是不是【电路板】
      // 2. 更新节点列表
      setNodes((prevNodes) => [
        overlappingNode, // 3. 把电路板放在【最前面】（层级最高，盖住其他节点）
        ...prevNodes // 4. 处理剩下的所有节点 先把旧的电路板删掉（避免重复）
          .filter((node) => node.id !== overlappingNodeId)
          .map((node) => {
            // 6. 处理被拖拽的节点
            // 只修改当前拖拽中的节点
            if (node.id === dragNode.id) {
              // 7. 获取拖拽节点的坐标
              const { x: dragX, y: dragY } = dragNode?.position || {
                x: 0,
                y: 0,
              };

              // 8. 获取电路板的坐标
              const { x: overlapX, y: overlapY } =
                overlappingNode?.position || { x: 0, y: 0 };

              // 9. 计算【内部相对坐标】
              // 子节点在电路板内部的位置 = 拖拽位置 - 电路板位置
              let position;
              if (!dragNode.parentId) {
                position = {
                  x: dragX - overlapX,
                  y: dragY - overlapY,
                };
              } else if (
                dragNode.parentId &&
                dragNode.parentId !== overlappingNodeId
              ) {
                const prevParentNode = prevNodes.find(
                  (node) => node.id === dragNode.parentId,
                );
                const { x: px, y: py } = prevParentNode?.position || {
                  x: 0,
                  y: 0,
                };

                position = {
                  x: dragX + px - overlapX,
                  y: dragY + py - overlapY,
                };
              }

              // 10. 返回更新后的拖拽节点
              return {
                ...node,
                parentId: overlappingNodeId, // 把电路板设为父节点
                ...((!dragNode.parentId ||
                  dragNode.parentId !== overlappingNodeId) && { position }), // 只有原本无父节点才更新位置
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
      // 👇 所有 setState 包一层，警告彻底消失
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
        onInit={setRfInstance}
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
        onNodeDragStop={onNodeDragStop}
      >
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
                  variant={theme === "dark" ? "outline" : "subtle"}
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
        {/*<svg>
          <defs>
            <linearGradient id="wire">
              <stop offset="0%" stopColor="#ecff02" />
              <stop offset="100%" stopColor="#f69900" />
            </linearGradient>
          </defs>
        </svg>*/}
      </ReactFlow>
    </Box>
  );
}
