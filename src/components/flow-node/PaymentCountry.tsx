import { type Node, type NodeProps, Position } from "@xyflow/react";
import { Box, Flex, Text } from "@chakra-ui/react";
import ReactCountryFlag from "react-country-flag";
import CustomHandle from "./CustomHandle";

type PaymentCountryProps = Node<{
  currency: string;
  country: string;
  countryCode: string;
}>;

const PaymentCountry = ({
  data: { currency, country, countryCode },
}: NodeProps<PaymentCountryProps>) => {
  return (
    <Flex
      alignItems={"center"}
      borderRadius="8px"
      bg="#e2e8f0"
      border="2px solid #bbbdbf"
      p={2}
      gap={2}
      width="155px"
    >
      <Box>
        <ReactCountryFlag
          countryCode={countryCode}
          svg
          aria-label={country}
          style={{ fontSize: "2em", lineHeight: "2em" }}
        />
      </Box>
      <Flex grow="1">
        <Box fontSize="x-small">
          <Text>{country}</Text>
          <Text fontSize="x-small">{currency}</Text>
        </Box>
      </Flex>
      <CustomHandle type="source" position={Position.Right} />
      <CustomHandle type="target" position={Position.Left} />
    </Flex>
  );
};

export default PaymentCountry;
