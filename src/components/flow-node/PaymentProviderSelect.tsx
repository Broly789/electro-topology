import { useCallback } from "react";
import { Menu, Button } from "@chakra-ui/react";
import { ChevronBarDown } from "react-bootstrap-icons";
import { useReactFlow } from "@xyflow/react";

const PAYMENT_PROVIDERS = [
  { code: "St", name: "Stripe" },
  { code: "Gp", name: "Google Pay" },
  { code: "Ap", name: "Apple Pay" },
  { code: "Pp", name: "Paypal" },
  { code: "Am", name: "Amazon Pay" },
];

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
    <Menu.Root>
      <Menu.Trigger asChild>
        <Button variant="outline" size="sm" bg="white">
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
  );
}
