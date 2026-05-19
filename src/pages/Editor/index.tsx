import FlowEditor from "../../components/FlowEditor";
import { ReactFlowProvider } from "@xyflow/react";

const EditorPage = () => {
  return (
    <ReactFlowProvider>
      <div className="w-full" style={{ height: "calc(100vh - 64px)" }}>
        <FlowEditor />
      </div>
    </ReactFlowProvider>
  );
};

export default EditorPage;
