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
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type DefaultEdgeOptions,
  BackgroundVariant,
  ConnectionMode,
} from "@xyflow/react";
import { ElectricalComponentType } from "@/types";
import { nodeTypes } from "./topology-node/register";
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
const initialEdges: Edge[] = [{ id: "n1-n2", source: "1", target: "2" }];

export default function FlowEditor() {
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

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      connectionMode={ConnectionMode.Loose}
      nodeTypes={nodeTypes}
      fitView
      defaultEdgeOptions={defaultEdgeOptions}
      proOptions={{
        hideAttribution: true,
      }}
    >
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
