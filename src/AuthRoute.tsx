import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  // 👇 改成 true 就能看见页面！false 自动跳 /login
  const isLogin = true;

  if (!isLogin) {
    console.log("未登录，跳转到 login");
    return <Navigate to="/login" replace />;
  }

  // 如果已经登录 并且当前访问的是login路由 则重定向到home
  if (isLogin && window.location.pathname === "/login") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
