import { Box, Flex } from "@chakra-ui/react";
import React from "react";
import { createPortal } from "react-dom";

import {
  Drawer,
  DrawerBody,
  DrawerBackdrop,
  DrawerContent,
  DrawerCloseTrigger,
  DrawerPositioner,
  useDisclosure,
} from "@chakra-ui/react";
import { NodeType, NodeTypeIconMap } from "@/constants/order";

export default function NodeLayout({
  children,
  type,
  display,
}: {
  children: React.ReactNode;
  type: NodeType;
  display: React.ReactNode;
}) {
  const { open, onOpen, onClose } = useDisclosure();

  let border;
  switch (type) {
    case NodeType.Order: {
      border = "#5454ff";
      break;
    }
    case NodeType.PaymentGateway: {
      border = "#06e506";
      break;
    }
  }

  return (
    <>
      <Flex
        onClick={onOpen}
        pl={2}
        pr={2}
        bg="white"
        border={`2px solid ${border}`}
        borderRadius="8px"
        boxShadow="sm"
        alignItems={"center"}
        gap={2}
        minWidth={"240px"}
        height="40px"
      >
        {NodeTypeIconMap[type]}
        <Box fontSize="sm" flex="1">
          {display}
        </Box>
      </Flex>

      {/* Portal 到 body 顶层，避免被 ReactFlow 的 transform 影响 */}
      {open &&
        createPortal(
          <Drawer.Root
            open={open}
            placement="end"
            onOpenChange={(e) => !e.open && onClose()}
          >
            <DrawerBackdrop />
            <DrawerPositioner>
              <DrawerContent>
                <DrawerCloseTrigger />
                <DrawerBody>{children}</DrawerBody>
              </DrawerContent>
            </DrawerPositioner>
          </Drawer.Root>,
          document.body,
        )}
    </>
  );
}
