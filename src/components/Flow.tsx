import { useRef, useCallback } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Flex, Text, IconButton, Spinner } from "@chakra-ui/react";
import { Floppy } from "react-bootstrap-icons";
import { v4 as uuid } from "uuid";
import {
  ReactFlow,
  addEdge,
  Background,
  Controls,
  Panel,
  useReactFlow,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type OnConnect,
  type EdgeMouseHandler,
  type DefaultEdgeOptions,
} from "@xyflow/react";
import { nodeComponentsTypes, edgeComponentsTypes } from "./flow-node/register";
import { COMPONENTS, NodeType } from "@/constants/order";

const initialNodes: Node[] = [
  {
    id: "node-1",
    type: "paymentInit",
    position: { x: 0, y: 60 },
    data: { amount: 123, type: "text2" },
  },
  {
    id: "node-2",
    type: "paymentCountry",
    position: { x: 200, y: 0 },
    data: { currency: "¥", country: "China", countryCode: "CN" },
  },
  {
    id: "node-3",
    type: "paymentCountry",
    position: { x: 200, y: 100 },
    data: { currency: "$", country: "United States", countryCode: "US" },
  },
  // {
  //   id: "node-4",
  //   type: "paymentCountry",
  //   position: { x: 200, y: 160 },
  //   data: { currency: "£", country: "England", countryCode: "GB" },
  // },
  {
    id: "4",
    data: { name: "Google Pay", code: "Gp" },
    position: { x: 550, y: -50 },
    type: "paymentProvider",
  },
  {
    id: "5",
    data: { name: "Stripe", code: "St" },
    position: { x: 550, y: 125 },
    type: "paymentProvider",
  },
  {
    id: "6",
    data: { name: "Apple Pay", code: "Ap" },
    position: { x: 550, y: 325 },
    type: "paymentProvider",
  },
  {
    id: "7",
    data: {},
    position: { x: 275, y: -100 },
    type: "paymentProviderSelect",
  },
];
const initialEdges: Edge[] = [{ id: "n1-n2", source: "n1", target: "n2" }];

export default function ReactFlowCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const defaultEdgeOptions: DefaultEdgeOptions = {
    animated: true,
  };

  const onConnect: OnConnect = useCallback(
    (params) =>
      setEdges((edgesSnapshot) =>
        addEdge({ ...params, type: "customEdge" }, edgesSnapshot),
      ),
    [],
  );

  const onEdgeMouseEnter: EdgeMouseHandler = useCallback((_, edge) => {
    setEdges((edgesSnapshot) =>
      edgesSnapshot.map((e) =>
        e.id === edge.id ? { ...e, data: { ...e.data, isHovered: true } } : e,
      ),
    );
  }, []);

  const onEdgeMouseLeave: EdgeMouseHandler = useCallback((_, edge) => {
    setEdges((edgesSnapshot) =>
      edgesSnapshot.map((e) =>
        e.id === edge.id ? { ...e, data: { ...e.data, isHovered: false } } : e,
      ),
    );
  }, []);

  const { screenToFlowPosition } = useReactFlow();
  const dragOutSideRef = useRef<string>(null);

  const onDragStart = (
    event: React.DragEvent<HTMLButtonElement>,
    type: NodeType,
  ) => {
    dragOutSideRef.current = type;
    event.dataTransfer.effectAllowed = "move";
  };
  const onDragOver: React.DragEventHandler<HTMLDivElement> = useCallback(
    (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
    },
    [],
  );
  const onDrop: React.DragEventHandler<HTMLDivElement> = useCallback(
    (event) => {
      event.preventDefault();
      const type = dragOutSideRef.current;

      if (!type) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: uuid(),
        type,
        position,
        data: {},
      };

      setNodes((prevNodes) => [...prevNodes, newNode]);
    },
    [screenToFlowPosition, setNodes],
  );
  const form = useForm();

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <FormProvider {...form}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeComponentsTypes}
          edgeTypes={edgeComponentsTypes}
          fitView
          defaultEdgeOptions={defaultEdgeOptions}
          onEdgeMouseEnter={onEdgeMouseEnter}
          onEdgeMouseLeave={onEdgeMouseLeave}
          onDrop={onDrop}
          onDragOver={onDragOver}
        >
          <Panel
            position="top-right"
            style={{
              border: "1px solid #ccc",
              padding: 12,
              borderRadius: "12px",
              background: "white",
              width: 150,
            }}
          >
            <Flex direction="column" gap={3}>
              <div>
                <Text fontSize="x-small">Project</Text>
                <Flex gap={1} mt={1} flexWrap="wrap">
                  {/*<IconButton
                    aria-label="Save"
                    size="xs"
                    onClick={onSave}
                  >
                    {isPending ? <Spinner size="xs" /> : <Floppy />}
                  </IconButton>*/}
                </Flex>
              </div>
              <div>
                <Text fontSize="x-small">Components</Text>
                <Flex gap={1} mt={1} flexWrap="wrap">
                  {COMPONENTS.map((component) => (
                    <IconButton
                      key={component.type}
                      aria-label={component.label}
                      size="sm"
                      onDragStart={(event) =>
                        onDragStart(event, component.type)
                      }
                      draggable
                    >
                      {component.icon}
                    </IconButton>
                  ))}
                </Flex>
              </div>
            </Flex>
          </Panel>
          <Controls />
          <Background gap={12} size={1} />
        </ReactFlow>
      </FormProvider>
    </div>
  );
}
