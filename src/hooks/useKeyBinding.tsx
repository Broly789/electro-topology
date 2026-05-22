import { useKeyPress } from "ahooks";
import { useReactFlow } from "@xyflow/react";
import { v4 as uuid } from "uuid";

const useKeyBinding = () => {
  const { setNodes, getNodes } = useReactFlow();

  // 1. Delete 键 → 删除选中节点
  useKeyPress("delete", () => {
    setNodes((prevNodes) => prevNodes.filter((node) => !node.selected));
  });

  // 2. Ctrl + D 键 → 复制选中节点
  useKeyPress(
    ["ctrl.d", "meta.d"],
    () => {
      const node = getNodes().find((node) => node.selected);
      if (!node) return;

      setNodes((prevNodes) => {
        const { height = 60, width = 100 } = node.measured ?? {};
        return [
          ...prevNodes.map((n) => (n.selected ? { ...n, selected: false } : n)),
          {
            ...node,
            id: uuid(),
            selected: true,
            position: {
              x: node.position.x + width / 2,
              y: node.position.y + height,
            },
          },
        ];
      });
    },
    {
      exactMatch: true,
    },
  );
};

export default useKeyBinding;
