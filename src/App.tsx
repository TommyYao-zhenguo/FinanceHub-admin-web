import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import LoginPage from "./components/LoginPage";

import CompanyManagementView from "./components/client/CompanyManagementView";
import UserManagementView from "./components/client/UserManagementView";
import AdminUserManagementView from "./components/AdminUserManagementView";
import CustomerServiceView from "./components/CustomerServiceView";

import { UserProvider, useUserContext } from "./contexts/UserContext";
import { SA_TOKEN_CONFIG } from "./config/api";

// 路由映射配置
const routeMap = {
  "/": "dashboard",
  "/dashboard": "dashboard",
  "/users": "users",  // 修改为与侧边栏菜单项ID匹配
  "/customer-service": "customer-service",
  "/reports": "reports",
  "/client/company-management": "company-management",
  "/client/user-management": "user-management",
  "/settings": "settings",
  "/support": "support",
};

// tab到路由的映射
const tabToRouteMap = {
  users: "/users", // 添加这一行
  "users-management": "/users-management",
  "customer-service": "/customer-service",
  documents: "/documents",
  reports: "/reports",
  "company-management": "/client/company-management",
  "user-management": "/client/user-management",
  settings: "/settings",
  support: "/support",
};

// 创建一个内部组件来使用UserContext和Router hooks
function AppContent() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showBalances, setShowBalances] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const { userInfo, fetchUserInfo } = useUserContext();
  const location = useLocation();
  const navigate = useNavigate();

  // 根据当前路由获取activeTab
  const activeTab = routeMap[location.pathname] || "dashboard";

  // 检查认证状态
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem(SA_TOKEN_CONFIG.tokenName);

      if (!token) {
        setIsLoggedIn(false);
        setIsCheckingAuth(false);
        return;
      }

      try {
        await fetchUserInfo();
        setIsLoggedIn(true);
        console.log("用户已登录，token有效");
      } catch (error) {
        console.error("Token验证失败:", error);
        localStorage.removeItem(SA_TOKEN_CONFIG.tokenName);
        setIsLoggedIn(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuthStatus();
  }, [fetchUserInfo]);

  // 监听用户信息变化，同步登录状态
  useEffect(() => {
    if (userInfo) {
      setIsLoggedIn(true);
    } else {
      const token = localStorage.getItem(SA_TOKEN_CONFIG.tokenName);
      if (!token) {
        setIsLoggedIn(false);
      }
    }
  }, [userInfo]);

  const handleMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleTabChange = (tab: string) => {
    const route = tabToRouteMap[tab];
    if (route) {
      navigate(route);
    }
    setIsMobileMenuOpen(false);
  };

  const handleLoginSuccess = async () => {
    try {
      await fetchUserInfo();
      setIsLoggedIn(true);
      navigate("/dashboard"); // 登录成功后跳转到仪表板
      console.log("登录成功，已获取用户信息");
    } catch (error) {
      console.error("登录后获取用户信息失败:", error);
    }
  };

  // 如果正在检查认证状态，显示加载页面
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在验证登录状态...</p>
        </div>
      </div>
    );
  }

  // 如果未登录，显示登录页面
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LoginPage onLoginSuccess={handleLoginSuccess} />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#363636",
              color: "#fff",
            },
            success: {
              style: {
                background: "#10b981",
              },
            },
            error: {
              style: {
                background: "#ef4444",
              },
            },
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        isOpen={isMobileMenuOpen}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          onMenuToggle={handleMenuToggle}
          isMobileMenuOpen={isMobileMenuOpen}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 lg:p-6">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/users" element={<AdminUserManagementView />} />
            <Route path="/customer-service" element={<CustomerServiceView />} />

            <Route
              path="/client/company-management"
              element={<CompanyManagementView />}
            />
            <Route
              path="/client/user-management"
              element={<UserManagementView />}
            />
            <Route
              path="/settings"
              element={
                <div className="p-6">
                  <h1 className="text-2xl font-bold">设置</h1>
                </div>
              }
            />
            <Route
              path="/support"
              element={
                <div className="p-6">
                  <h1 className="text-2xl font-bold">帮助支持</h1>
                </div>
              }
            />
            {/* 404页面 */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            style: {
              background: "#10b981",
            },
          },
          error: {
            style: {
              background: "#ef4444",
            },
          },
        }}
      />
    </div>
  );
}

function App() {
  return (
    <UserProvider>
      <Router>
        <AppContent />
      </Router>
    </UserProvider>
  );
}

export default App;
