// import "./App.css";
import { RouterProvider } from "react-router-dom";
import { Theme } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "@/components/ui/provider";
import router from "./routes";
import { useTheme } from "ahooks";
const queryClient = new QueryClient();

function App() {
  // Create a client
  const { theme } = useTheme();

  return (
    <QueryClientProvider client={queryClient}>
      <Provider>
        <Theme appearance={theme}>
          <section id="center">
            <RouterProvider router={router} />
          </section>
        </Theme>
      </Provider>
    </QueryClientProvider>
  );
}

export default App;
