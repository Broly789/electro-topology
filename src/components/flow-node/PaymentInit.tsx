import { Box, Text } from "@chakra-ui/react";
import { Position, type Node, type NodeProps } from "@xyflow/react";
import CustomHandle from "./CustomHandle";

type PayNode = Node<{ amount: number }>;
const PaymentInit = ({ data: { amount } }: NodeProps<PayNode>) => {
  return (
    <Box bg="white" border="1px solid #aa1fff" borderRadius="md">
      <Box bg="pink" p="1" borderTopStartRadius="md" borderTopEndRadius="md">
        <Text fontSize="sm" color="white">
          Payment Initialzed
        </Text>
      </Box>
      <Box p="2">
        <Text fontSize="sm" color="teal">
          ${amount}
        </Text>
      </Box>
      <CustomHandle type="source" position={Position.Right} />
    </Box>
  );
};

export default PaymentInit;
