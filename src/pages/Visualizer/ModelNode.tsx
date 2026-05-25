import { type NodeProps, type Node, Position, Handle } from "@xyflow/react";
import type { Model } from "./types";
import { Box, Flex, Text } from "@chakra-ui/react";

const ModelNode = ({ data }: NodeProps<Node<Model, "string">>) => {
  return (
    <Box borderRadius="8px" minWidth="250px" position="relative" bg="#2a2a2a">
      {/* 表顶部的输入点（target） */}
      {data.isChild && (
        <Handle id={data.name} position={Position.Top} type="target" />
      )}

      {/* 表标题 */}
      <Box p={2} textAlign="center" borderRadius="8px 8px 0 0" bg="#3d5787">
        <Text fontWeight="bold" color="white">
          {data.name}
        </Text>
      </Box>

      {/* 字段列表 */}
      {data.fields.map(({ name, type, hasConnections }) => (
        <Flex
          key={name}
          _even={{ bg: "#2D2D3F" }}
          _odd={{ bg: "#1A1A2E" }}
          justifyContent="space-between"
          py={2}
          px={3}
          color="white"
          position="relative" // 👈 关键：相对定位
        >
          <Text>{name}</Text>
          <Text>{type}</Text>

          {/* 🔥 每个字段右侧输出点：自动垂直居中 */}
          {hasConnections && (
            <Handle
              type="source"
              position={Position.Right}
              id={`${data.name}-${name}`}
              style={{
                position: "absolute",
                right: 0,
                top: "50%", // 👈 垂直居中
                transform: "translateY(-50%)",
              }}
            />
          )}
        </Flex>
      ))}
    </Box>
  );
};

export default ModelNode;
