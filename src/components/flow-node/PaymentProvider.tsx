import { Box, Flex, IconButton, Image, Text } from "@chakra-ui/react";
import { X } from "react-bootstrap-icons";
import applePayLogo from "@/assets/apple-pay.svg";

import {
  Position,
  useReactFlow,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import CustomHandle from "./CustomHandle";

const PAYMENT_PROVIDER_IMAGE_MAP: { [code: string]: string } = {
  St: "https://cdn.worldvectorlogo.com/logos/stripe-2.svg",
  Ap: applePayLogo,
  Gp: "https://cdn.worldvectorlogo.com/logos/google-g-2015.svg",
  Pp: "https://avatars.githubusercontent.com/u/476675?s=280&v=4",
  Am: "https://static.wixstatic.com/media/d2252d_4c1a1bda6a774bd68f789c0770fd16e5~mv2.png",
};

export default function PaymentProvider({
  data: { name, code },
  id,
}: NodeProps<Node<{ name: string; code: string }>>) {
  const { setNodes } = useReactFlow();

  return (
    <Flex
      borderRadius={"24px"}
      border="2px solid #5e5eff"
      alignItems={"center"}
      bg="white"
      p={1}
      pb={1}
      pl={"12px"}
      gap={2}
      width="140px"
    >
      <Box h={4} w={4}>
        <Image
          height="100%"
          width="100%"
          src={PAYMENT_PROVIDER_IMAGE_MAP[code]}
        />
      </Box>
      <Flex grow="1">
        <Text fontSize="small" mt={"-2px"}>
          {name}
        </Text>
      </Flex>
      <IconButton
        aria-label="Delete Payment Provider"
        pointerEvents="all"
        color="red"
        bg="transparent"
        size="sm"
        onClick={() =>
          setNodes((prevNodes) => prevNodes.filter((node) => node.id !== id))
        }
      >
        <X />
      </IconButton>
      <CustomHandle type="target" position={Position.Left} />
    </Flex>
  );
}
