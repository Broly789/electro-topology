// import "./App.css";
import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "@/components/ui/provider";
import router from "./routes";
const queryClient = new QueryClient();

function App() {
  // Create a client
  return (
    <QueryClientProvider client={queryClient}>
      <Provider>
        <section id="center">
          <RouterProvider router={router} />
        </section>
      </Provider>
    </QueryClientProvider>
  );
}

export default App;
