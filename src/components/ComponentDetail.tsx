import React from "react";
import { Box, Heading, InputGroup, NumberInput } from "@chakra-ui/react";
import { useReactFlow } from "@xyflow/react";
import { useDebounceFn } from "ahooks";
import type { Node } from "@xyflow/react";
import type {
  ElectricalComponentData,
  ElectricalComponentKeysType,
} from "@/types";
import { getUnit } from "@/utils";

const ComponentDetail = ({
  isDark,
  node,
}: {
  isDark: boolean;
  node: Node<ElectricalComponentData>;
}) => {
  const nodeType = node.data?.type ?? node.type;
  const { updateNodeData } = useReactFlow();
  const unit = getUnit(nodeType as ElectricalComponentKeysType);

  const { run: debouncedUpdate } = useDebounceFn(
    (value: number) => updateNodeData(node.id, { value }),
    { wait: 500 },
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const numValue = parseFloat(rawValue);
    if (!isNaN(numValue) && rawValue !== "") {
      debouncedUpdate(numValue);
    }
  };

  return (
    <Box
      position="relative"
      width="100%"
      bg="white"
      height="150px"
      border="1px solid #ccc"
      borderRadius="12px"
      marginBottom="50px"
      padding="12px"
      zIndex={10}
    >
      <Box _dark={{ bg: isDark ? "white" : "gray.800" }}>
        <Heading fontSize="xs">{nodeType?.toUpperCase()}</Heading>
        <InputGroup mt={2} endAddon={unit}>
          <NumberInput.Root
            defaultValue={String(node.data?.value ?? "")}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange(e)
            }
          >
            <NumberInput.Input borderEndRadius={"none"} />
          </NumberInput.Root>
        </InputGroup>
      </Box>
    </Box>
  );
};

export default React.memo(ComponentDetail);
