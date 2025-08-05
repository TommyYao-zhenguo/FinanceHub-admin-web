import React, { useState } from "react";
import { Bell, Settings, LogOut, Menu, User, ChevronDown } from "lucide-react";
import { useAdminUserContext } from "../contexts/AdminUserContext";

interface HeaderProps {
  onMenuToggle: () => void;
  isMobileMenuOpen: boolean;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const { userInfo, logout } = useAdminUserContext();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const getUserDisplayName = () => {
    if (!userInfo) return "用户";
    return userInfo.username || "用户";
  };

  const getCompanyName = () => {
    if (!userInfo) return "公司";
    return userInfo.companyName || "启苑"; // 修改这里的默认值
  };

  const getRoleDisplay = () => {
    if (!userInfo || !userInfo.roleName) return "普通用户";
    return userInfo.roleName;
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 lg:px-6 flex-shrink-0 shadow-sm relative z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
              <img
                src="/qiyuan-logo.jpg"
                alt="启苑数字化财务管理后台"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-xl font-semibold text-gray-800 hidden sm:block">
              启苑数字化财务管理后台
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-orange-500 rounded-full text-xs text-white flex items-center justify-center">
              3
            </span>
          </button>

          {/* 用户信息区域 */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-800">
                  {getCompanyName()}
                </p>
                <p className="text-xs text-gray-500">
                  {getUserDisplayName()} • {getRoleDisplay()}
                </p>
              </div>
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center border border-gray-300">
                <User className="h-4 w-4 text-white" />
              </div>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </button>

            {/* 用户下拉菜单 */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">
                    {getUserDisplayName()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {userInfo?.mobile || "未设置手机号"}
                  </p>
                  <p className="text-xs text-gray-500">{getCompanyName()}</p>
                </div>

                <button
                  onClick={() => setShowUserMenu(false)}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <Settings className="h-4 w-4" />
                  <span>账户设置</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>退出登录</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 点击外部关闭下拉菜单 */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
}
