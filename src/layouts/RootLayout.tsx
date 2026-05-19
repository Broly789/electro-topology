import { Outlet, NavLink } from "react-router-dom";
import { Layout } from "antd";

const { Header, Sider, Footer, Content } = Layout;

const headerStyle: React.CSSProperties = {
  textAlign: "center",
  color: "#fff",
  height: 64,
  paddingInline: 48,
  lineHeight: "64px",
  backgroundColor: "#4096ff",
};

// 关键修改：添加 minHeight
const layoutStyle = {
  borderRadius: 8,
  overflow: "hidden",
  minHeight: "100vh", // 让布局至少占满视口高度
};

const contentStyle: React.CSSProperties = {
  textAlign: "center",
  // color: "#fff",
  // backgroundColor: "#0958d9",
  // 移除 flex 相关，使用最简单的方式
};

const siderStyle: React.CSSProperties = {
  textAlign: "center",
  lineHeight: "120px",
  color: "#fff",
  backgroundColor: "#1677ff",
};

const footerStyle: React.CSSProperties = {
  textAlign: "center",
  color: "#fff",
  backgroundColor: "#4096ff",
};

// 公共布局：所有后台页面共用 头部/侧边栏
export default function RootLayout() {
  return (
    <Layout style={layoutStyle}>
      <Header style={headerStyle}>
        <nav>
          <NavLink
            to="/"
            style={({ isActive }) => ({
              color: isActive ? "#ff4d4f" : "white",
              fontWeight: isActive ? "bold" : "normal",
              textDecoration: "none",
            })}
          >
            首页
          </NavLink>
          <NavLink
            to="/list"
            style={({ isActive }) => ({
              color: isActive ? "#ff4d4f" : "white",
              fontWeight: isActive ? "bold" : "normal",
              textDecoration: "none",
            })}
          >
            列表
          </NavLink>
        </nav>
      </Header>
      <Layout>
        <Sider width="25%" style={siderStyle}>
          Sider
        </Sider>
        <Content style={contentStyle}>
          {/* 主内容区 → 子页面在这里渲染！ */}
          <Outlet />
        </Content>
        {/*<Sider width="25%" style={siderStyle}>
          Sider
        </Sider>*/}
      </Layout>
      {/*<Footer style={footerStyle}>Footer</Footer>*/}
    </Layout>
  );
}
