import { Navigate, Outlet } from "react-router-dom";

export default function PublicRoute() {
  // 你的登录状态（后期换成 token、zustand、redux 都行）
  const isLogin = true;

  // ✅ 已登录 → 访问登录页时，直接重定向到首页
  if (isLogin) {
    return <Navigate to="/" replace />;
  }

  // ✅ 未登录 → 正常显示登录页面
  return <Outlet />;
}
