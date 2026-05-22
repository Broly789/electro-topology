import { Box } from "@chakra-ui/react";
import type { CSSProperties } from "react";

const cssProps = {
  flex: 1,
  position: "relative",
  width: "100%",
  backgroundColor: "#eee",
} satisfies CSSProperties;

const Placeholder = () => {
  return (
    <Box
      display="flex"
      pos="relative"
      flexDirection="column"
      gap={2}
      p={3}
      height="100%"
      borderRadius="8px"
      bg="white"
      zIndex={1}
    >
      <Box {...cssProps} />
      <Box {...cssProps} />
      <Box {...cssProps} />
      <Box {...cssProps} />
      <Box {...cssProps} />
      <Box {...cssProps} />
    </Box>
  );
};

export default Placeholder;
