import { Handle, type HandleProps } from "@xyflow/react";
import { css } from "@emotion/css";

const TerminalHandle = (props: HandleProps) => {
  return (
    <Handle
      {...props}
      className={css({
        width: 8,
        height: 8,
        backgroundColor: "white",
        border: "1px solid black",
      })}
    />
  );
};

export default TerminalHandle;
