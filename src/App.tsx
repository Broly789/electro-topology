// import "./App.css";
import { RouterProvider } from "react-router-dom";
import { Theme } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "@/components/ui/provider";
import router from "./routes";
import { useDarkMode } from "@/store/useDarkMode";
import { useEffect } from "react";
import { useColorMode } from "@/components/ui/color-mode";
import { useTheme } from "ahooks";

const queryClient = new QueryClient();

function App() {
  // Create a client
  const setIsDark = useDarkMode((state) => state.setIsDark);
  const { theme } = useTheme();

  useEffect(() => {
    setIsDark(theme === "dark");
  }, [theme, setIsDark]);

  return (
    <QueryClientProvider client={queryClient}>
      <Provider>
        <Theme appearance={"light"}>
          <section id="center">
            <RouterProvider router={router} />
          </section>
        </Theme>
      </Provider>
    </QueryClientProvider>
  );
}

export default App;
