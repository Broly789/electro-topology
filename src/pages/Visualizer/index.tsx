import { Box } from "@chakra-ui/react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  useNodesState,
  type Node,
  type Edge,
  useEdgesState,
} from "@xyflow/react";
import { getInfoFromSchema } from "./utils";
import { schema } from "@/constants/schema-visualizer";
import ModelNode from "./ModelNode";
import type { Model } from "./types";

const VisualizerPage = () => {
  const { models, connections } = getInfoFromSchema(schema);

  // 计算网格行列（行优先：从左到右，再换行）
  const cols = Math.ceil(Math.sqrt(models.length));
  const itemWidth = 300;
  const itemHeight = 300;

  const initialNodes: Node<Model>[] = models.map((model, index) => ({
    id: model.name,
    type: "model",
    data: model,
    position: {
      // 先横排后竖排
      // x: (index % cols) * itemWidth,
      // y: Math.floor(index / cols) * itemHeight,
      // 先竖排后横排
      x: Math.floor(index / cols) * itemHeight,
      y: (index % cols) * itemWidth,
    },
  }));

  const initialEdges: Edge[] = connections.map((connection) => {
    const sourceId = `${connection.source}-${connection.name}`;
    return {
      id: sourceId,
      source: connection.source,
      target: connection.target,
      sourceHandle: sourceId, // 输出连接精确到字段和 Hanlde对应id={`${data.name}-${field.name}`}
      targetHandle: connection.target, // 精确到表即可
      animated: true,
    };
  });

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges] = useEdgesState(initialEdges);

  const nodeTypes = { model: ModelNode };

  return (
    <Box width="100%" height="calc(100vh - 64px)">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        fitView
        fitViewOptions={{ padding: 0.4 }}
      >
        <Background color="#f1f1f1" variant={BackgroundVariant.Lines} />
        <Controls />
      </ReactFlow>
    </Box>
  );
};

export default VisualizerPage;
