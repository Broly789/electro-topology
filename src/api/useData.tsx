import { useQuery } from "@tanstack/react-query";

export const useData = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["GET_FLOW_DATA"],
    queryFn: async () => {
      const res = await fetch("http://localhost:7000/data");
      return res.json();
    },
  });
  return { data, isLoading, error };
};
