import { useEffect } from "react";
import { useReactFlow } from "@xyflow/react";
import { v4 as uuid } from "uuid";

const useKeyBinding = () => {
  const { setNodes, getNodes } = useReactFlow();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "delete":
          e.preventDefault();
          setNodes((prevNodes) => prevNodes.filter((node) => !node.selected));
          break;
        case "d":
          if (e.ctrlKey) {
            e.preventDefault();
            const node = getNodes().find((node) => node.selected);
            if (!node) return;
            setNodes((prevNodes) => {
              const { height = 100, width = 100 } = node.measured ?? {};
              return [
                ...prevNodes.map((node) =>
                  node.selected ? { ...node, selected: false } : node,
                ),
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
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [setNodes, getNodes]);
};

export default useKeyBinding;
