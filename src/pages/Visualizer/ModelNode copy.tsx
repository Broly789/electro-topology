import { type NodeProps, type Node, Position, Handle } from "@xyflow/react";
import type { Model } from "./types";
import { Box, Flex, Text } from "@chakra-ui/react";

const ModelNode = ({ data }: NodeProps<Node<Model, "string">>) => {
  return (
    <Box borderRadius="8px" minWidth="250px">
      {data.isChild && (
        <Handle id={data.name} position={Position.Top} type="target" />
      )}
      <Box p={1} textAlign="center" borderRadius="8px 8px 0 0" bg="#3d5787">
        <pre>
          <Text fontWeight={"bold"} color="white">
            {data.name}
          </Text>
        </pre>
      </Box>
      {data.fields.map(({ type, name, hasConnections }, index) => (
        <Flex
          _even={{ bg: "#282828" }}
          _odd={{ bg: "#232323" }}
          justifyContent={"space-between"}
          py={1}
          px={2}
          color="white"
          key={name}
        >
          <pre>
            <Text>{name}</Text>
          </pre>
          <pre>
            <Text>{type}</Text>
          </pre>
          {hasConnections && (
            <Handle
              position={Position.Right}
              id={`${data.name}-${name}`}
              type="source"
              style={{ top: 32 + 16 + 32 * index }}
            />
          )}
        </Flex>
      ))}
    </Box>
  );
};

export default ModelNode;
