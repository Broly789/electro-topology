import { Button, DatePicker } from "antd";
import Counter from "../../components/Counter";
import RxCounter from "../../components/RxCounter";
import ReactFlowCanvas from "../../components/Flow";
import { ReactFlowProvider } from "@xyflow/react";

const EditPage = () => {
  return (
    <ReactFlowProvider>
      <div style={{ width: "100%", height: "100%" }}>
        {/*<h1>Edit Page</h1>
      <h2>redux toolkit</h2>
      <RxCounter />
      <h2>zustand</h2>
      <Counter />
      <Button type="primary">保存</Button>
      <DatePicker />*/}
        <ReactFlowCanvas />
      </div>
    </ReactFlowProvider>
  );
};

export default EditPage;
