import { useState, useCallback } from "react";
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Background,
  Controls,
  type Node,
  type Edge,
  type OnConnect,
  type OnNodesChange,
  type OnEdgesChange,
  type EdgeMouseHandler,
  type DefaultEdgeOptions,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { nodeComponentsTypes, edgeComponentsTypes } from "./flow-node/register";

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
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const defaultEdgeOptions: DefaultEdgeOptions = {
    animated: true,
  };
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

  return (
    <div style={{ width: "100%", height: "100%" }}>
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
      >
        <Controls />
        <Background gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}
