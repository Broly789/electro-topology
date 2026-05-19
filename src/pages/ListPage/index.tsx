import { useQuery } from "@tanstack/react-query";

const ListPage = () => {
  const fetchCourses = async () => {
    console.log("fetching");
    const res = await fetch("http://jsonplaceholder.typicode.com/users");
    if (!res.ok) throw new Error("Failed to fetch courses");
    return res.json();
  };

  // const { data, isPending, isError, error } = useQuery({
  //   queryKey: ["users"],
  //   queryFn: fetchCourses,
  //   staleTime: 1000 * 10,
  //   gcTime: 1000 * 60,
  // });
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["users"],
    queryFn: fetchCourses,
    refetchOnWindowFocus: true,
    refetchInterval: 1000 * 30,
  });

  if (isError) return <div>Error: {error?.message}</div>;
  if (isPending) return <div>Loading...</div>;

  return (
    <div>
      <h1>List Page</h1>
      <ul>
        {data?.map(
          (user: { id: number; name: string; [index: string]: unknown }) => (
            <li key={user.id}>{user.name}</li>
          ),
        )}
      </ul>
    </div>
  );
};

export default ListPage;
