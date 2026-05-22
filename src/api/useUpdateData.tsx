import { useMutation } from "@tanstack/react-query";
import type { Node, Edge, ReactFlowJsonObject } from "@xyflow/react";

export const useUpdateData = () => {
  return useMutation({
    mutationFn: async (flowData: ReactFlowJsonObject<Node, Edge>) => {
      const res = await fetch("http://localhost:7000/data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: flowData,
        }),
      });
      return res.json();
    },
  });
};
