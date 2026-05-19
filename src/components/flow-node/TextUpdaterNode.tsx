import { type NodeProps, type Node, Handle, Position } from "@xyflow/react";
import { useCallback, type ChangeEvent } from "react";

type NumberNode = Node<{ number: number }, "number">;
type TextNode = Node<{ text: string }, "text">;

type AppNode = NumberNode | TextNode;

export function TextUpdaterNode({ data }: NodeProps<AppNode>) {
  const onChange = useCallback((evt: ChangeEvent<HTMLInputElement>) => {
    console.log(evt.target.value);
  }, []);

  if (data.type === "text") {
    return (
      <div className="text-updater-node">
        <div>
          <label htmlFor="text">Text:</label>
          <input
            id="text"
            name="text"
            onChange={onChange}
            className="nodrag border px-2 py-1 rounded-md"
          />
        </div>
        <Handle type="source" position={Position.Top} />
        <Handle type="target" position={Position.Bottom} />
      </div>
    );
  }

  return (
    <div className="text-updater-node">
      <div>
        <label htmlFor="text">Text2:</label>
        <input
          id="text"
          name="text"
          onChange={onChange}
          className="nodrag border px-2 py-1 rounded-md"
        />
      </div>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
