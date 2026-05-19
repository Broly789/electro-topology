import { createBrowserRouter } from "react-router-dom";
import EditPage from "./pages/EditPage";
import ListPage from "./pages/ListPage";
import Login from "./pages/Login";
import AuthRoute from "./AuthRoute";
import PublicRoute from "./pages/PublicRoute";
import RootLayout from "./layouts/RootLayout";

const router = createBrowserRouter([
  // ✅ 需要登录的页面
  {
    element: <AuthRoute />,
    children: [
      {
        element: <RootLayout />,
        children: [
          { index: true, element: <EditPage /> },
          { path: "list", element: <ListPage /> },
        ],
      },
    ],
  },

  // ✅ 公共页面（登录后不能访问）
  {
    element: <PublicRoute />,
    children: [{ path: "/login", element: <Login /> }],
  },
]);

export default router;
