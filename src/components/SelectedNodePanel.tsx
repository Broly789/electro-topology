import React from "react";
import { Flex } from "@chakra-ui/react";
import type { Node } from "@xyflow/react";
import type { ElectricalComponentData } from "@/types";
import ComponentDetail from "./ComponentDetail";

interface Props {
  isDark: boolean;
  node: Node<ElectricalComponentData>;
}

/** 选中节点的详情面板（左侧浮层），memo 防止拖拽时无关重渲染 */
const SelectedNodePanel = React.memo(function SelectedNodePanel({
  isDark,
  node,
}: Props) {
  return (
    <Flex
      position="absolute"
      top={0}
      left={0}
      width="150px"
      height="100%"
      alignItems="center"
      marginLeft="12px"
      bg="transparent"
    >
      <ComponentDetail isDark={isDark} node={node} key={node.id} />
    </Flex>
  );
});

export default SelectedNodePanel;
