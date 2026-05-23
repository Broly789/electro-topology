import { RouterProvider } from "react-router-dom";
import { Theme } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "@/components/ui/provider";
import { useDarkMode } from "@/store/useDarkMode";
import { useTheme } from "ahooks";
import { useEffect } from "react";
import router from "./routes";

const queryClient = new QueryClient();

/**
 * 监听 OS 系统深浅色偏好 → 同步到 Zustand
 * 必须放在 Provider 内部才能使用 ahooks useTheme()（需浏览器上下文）
 */
function SystemThemeSync() {
  const setIsDark = useDarkMode((state) => state.setIsDark);
  const { theme } = useTheme();

  useEffect(() => {
    if (theme !== "dark" && theme !== "light") return;
    setIsDark(theme === "dark");
  }, [theme, setIsDark]);

  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider>
        <SystemThemeSync />
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
