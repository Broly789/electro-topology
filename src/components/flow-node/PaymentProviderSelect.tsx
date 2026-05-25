import { useCallback } from "react";
import { Box, Flex, Menu, Button } from "@chakra-ui/react";
import { ChevronBarDown } from "react-bootstrap-icons";
import { useReactFlow } from "@xyflow/react";

const PAYMENT_PROVIDERS = [
  { code: "St", name: "Stripe" },
  { code: "Gp", name: "Google Pay" },
  { code: "Ap", name: "Apple Pay" },
  { code: "Pp", name: "Paypal" },
  { code: "Am", name: "Amazon Pay" },
];

/** 拖拽手柄：六点 grip 图案 */
function DragHandle() {
  return (
    <Flex
      direction="column"
      gap="2px"
      px={1}
      align="center"
      justify="center"
      cursor="grab"
      _active={{ cursor: "grabbing" }}
      color="gray.400"
      _hover={{ color: "gray.600" }}
      fontSize="10px"
      lineHeight="1"
      userSelect="none"
    >
      <Box borderRadius={2} bg="#ddd" width={1} height={2}></Box>
      <Box borderRadius={2} bg="#ddd" width={1} height={2}></Box>
      <Box borderRadius={2} bg="#ddd" width={1} height={2}></Box>
    </Flex>
  );
}

export default function PaymentProviderSelect() {
  const { setNodes } = useReactFlow();

  const onProviderClick = useCallback(
    ({ name, code }: { name: string; code: string }) => {
      const location = Math.random() * 500;

      setNodes((prevNodes) => [
        ...prevNodes,
        {
          id: `${prevNodes.length + 1}`,
          data: { name, code },
          type: "paymentProvider",
          position: { x: location, y: location },
        },
      ]);
    },
    [setNodes],
  );

  return (
    <Box p={2} minWidth="180px">
      <Flex align="center" gap={1}>
        <DragHandle />
        <Menu.Root lazyMount>
          <Menu.Trigger asChild>
            <Button
              className="nodrag"
              variant="outline"
              size="sm"
              bg="white"
              css={{ cursor: "pointer" }}
            >
              Add Payment Provider <ChevronBarDown />
            </Button>
          </Menu.Trigger>
          <Menu.Positioner>
            <Menu.Content>
              {PAYMENT_PROVIDERS.map((provider) => (
                <Menu.Item
                  value={provider.code}
                  onClick={() => onProviderClick(provider)}
                  key={provider.code}
                >
                  {provider.name}
                </Menu.Item>
              ))}
            </Menu.Content>
          </Menu.Positioner>
        </Menu.Root>
      </Flex>
    </Box>
  );
}
