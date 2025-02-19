import React, { useEffect } from "react";
import {
  HomeOutlined,
  UserSwitchOutlined,
  MoneyCollectOutlined,
  CameraOutlined,
  LogoutOutlined,
  ShoppingCartOutlined,
  CheckCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Layout, Menu, theme } from "antd";
import "./Layout.css";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Spinner from "./Spinner";

const { Header, Content } = Layout;

const LayoutApp = ({ children }) => {
  const { cartItems, loading } = useSelector((state) => state.rootReducer);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("auth")) || {};
  const role = user.role || "user";
  const username = user.name || "Utilizator";

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  return (
    <Layout>
      {loading && <Spinner />}
      <Layout className='site-layout'>
        <Header
          style={{
            background: colorBgContainer,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 16px",
          }}>
          {/* Logo-ul */}
          <div className='logo'>
            <h2 className='logo-title'>Camera Shop</h2>
          </div>

          {/* Meniu */}
          <Menu
            theme='light'
            mode='horizontal'
            defaultSelectedKeys={[window.location.pathname]}
            style={{ flex: 1, justifyContent: "center" }}>
            <Menu.Item key='/' icon={<HomeOutlined />}>
              <Link to='/'>Home</Link>
            </Menu.Item>

            {role === "admin" ? (
              <>
                <Menu.Item key='/bills' icon={<MoneyCollectOutlined />}>
                  <Link to='/bills'>Comenzi</Link>
                </Menu.Item>
                <Menu.Item key='/products' icon={<CameraOutlined />}>
                  <Link to='/products'>Produse</Link>
                </Menu.Item>
                <Menu.Item key='/customers' icon={<UserSwitchOutlined />}>
                  <Link to='/customers'>Clienți</Link>
                </Menu.Item>
                <Menu.Item key='/users' icon={<UserOutlined />}>
                  <Link to='/users'>Utilizatori</Link>
                </Menu.Item>
              </>
            ) : (
              <>
                <Menu.Item key='/your-bills' icon={<MoneyCollectOutlined />}>
                  <Link to='/your-bills'>Comenzile tale</Link>
                </Menu.Item>
                <Menu.Item key='/purchased' icon={<CheckCircleOutlined />}>
                  <Link to='/purchased'>Produse cumpărate</Link>
                </Menu.Item>
              </>
            )}

            <Menu.Item
              key='/logout'
              icon={<LogoutOutlined />}
              onClick={() => {
                localStorage.removeItem("auth");
                navigate("/login");
              }}>
              LogOut
            </Menu.Item>
          </Menu>

          {/* Numele utilizatorului și coșul */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ marginRight: "18px", fontSize: "16px" }}>
              Salut, {username}
            </span>
            <div className='cart-items' onClick={() => navigate("/cart")}>
              <ShoppingCartOutlined />
              <span className='cart-badge'>{cartItems.length}</span>
            </div>
          </div>
        </Header>

        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
          }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default LayoutApp;
