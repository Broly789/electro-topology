import NodeLayout from "./NodeLayout";
import type { Node, NodeProps } from "@xyflow/react";
import { NodeType } from "@/constants/order";
import { Box } from "@chakra-ui/react";
import {
  PAYMENT_PROVIDER_IMAGE_MAP,
  PAYMENT_PROVIDERS,
} from "@/constants/dummy";
import React, { useMemo } from "react";
import { memoComparator } from "@/utils/memoComparator";
import { useWatch } from "react-hook-form";
import ControlledSelect from "@/components/Controlled/ControlledSelect";

type PaymentGatewayNode = Node<
  {
    gatewayId: string;
  },
  "string"
>;

const PaymentGateway = React.memo(({ id }: NodeProps<PaymentGatewayNode>) => {
  const gatewayId = useWatch({ name: `${id}.gatewayId` });

  const paymentGateway = useMemo(
    () => PAYMENT_PROVIDERS.find((gateway) => gateway.id === gatewayId),
    [gatewayId],
  );

  return (
    <NodeLayout
      type={NodeType.PaymentGateway}
      display={
        <Box>
          {paymentGateway ? (
            <img
              src={PAYMENT_PROVIDER_IMAGE_MAP[paymentGateway?.code]}
              width="20px"
              height="20px"
            />
          ) : (
            "Payment Gateway"
          )}
        </Box>
      }
    >
      <Box>
        <ControlledSelect
          name={`${id}.gatewayId`}
          placeholder="Select Payment Gateway"
          mt={2}
        >
          {PAYMENT_PROVIDERS.map((order) => (
            <option key={order.id} value={order.id}>
              {order.name}
            </option>
          ))}
        </ControlledSelect>
      </Box>
    </NodeLayout>
  );
}, memoComparator);

export default PaymentGateway;
