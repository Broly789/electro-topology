import React, { useMemo } from "react";
import NodeLayout from "./NodeLayout";
import type { Node, NodeProps } from "@xyflow/react";
import { NodeType } from "@/constants/order";
import { Box, Flex, Text } from "@chakra-ui/react";
import { ORDERS } from "@/constants/dummy";
import { useWatch } from "react-hook-form";
import ControlledInput from "@/components/Controlled/ControlledInput";
import ControlledSelect from "@/components/Controlled/ControlledSelect";
import ControlledTextArea from "@/components/Controlled/ControlledTextArea";
import ControlledSwitch from "@/components/Controlled/ControlledSwitch";

type OrderNode = Node<
  {
    quantity: number;
    orderId: string;
    details: string;
    enableDiscount: boolean;
  },
  "string"
>;

const Order = React.memo(function Order({ id }: NodeProps<OrderNode>) {
  const [orderId, quantity] = useWatch({
    name: [`${id}.orderId`, `${id}.quantity`],
  });

  const order = useMemo(
    () => ORDERS.find((order) => order.id === orderId),
    [orderId],
  );

  let display = "";
  if (order?.name) display += `Order ${order?.name}`;
  if (order && quantity) display += `, Q: ${quantity}`;
  if (!order) display += "Order";

  return (
    <NodeLayout type={NodeType.Order} display={display}>
      <Box>
        <ControlledSelect
          name={`${id}.orderId`}
          placeholder="Select Order"
          mt={2}
        >
          {ORDERS.map((order) => (
            <option key={order.id} value={order.id}>
              {order.name}
            </option>
          ))}
        </ControlledSelect>
        <ControlledInput
          name={`${id}.quantity`}
          placeholder="Enter Quantity"
          mt={4}
          type="number"
          step="any"
        />
        <ControlledTextArea
          name={`${id}.details`}
          placeholder="Enter Details"
          mt={4}
        />
        <Flex gap={2} alignItems={"center"} mt={4}>
          <Text fontSize="sm">Enable Discount?</Text>
          <ControlledSwitch name={`${id}.enableDiscount`} />
        </Flex>
      </Box>
    </NodeLayout>
  );
});

export default Order;
