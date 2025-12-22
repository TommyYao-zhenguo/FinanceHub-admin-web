import React, { useState } from "react";
import { Settings, LogOut, Menu, User, ChevronDown } from "lucide-react";
import { useAdminUserContext } from "../contexts/AdminUserContext";
import toast from "react-hot-toast";
import { AdminUserService } from "../utils/adminUserService";

interface HeaderProps {
  onMenuToggle: () => void;
  isMobileMenuOpen: boolean;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const { userInfo, logout } = useAdminUserContext();
  const [showUserMenu, setShowUserMenu] = useState(false);

  // 修改密码模态框状态
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const getUserDisplayName = () => {
    if (!userInfo) return "用户";
    return userInfo.name || userInfo.username || "用户";
  };

  const getCompanyName = () => {
    if (!userInfo) return "公司";
    return userInfo.companyName || "启创宝数字化财务中心"; // 修改这里的默认值
  };

  const getRoleDisplay = () => {
    if (!userInfo || !userInfo.roleName) return "普通用户";
    return userInfo.roleName;
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 px-4 py-4 lg:px-6 lg:pl-72 flex-shrink-0 shadow-sm z-20 h-20">
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
                src="/Print-数字化财务中心.jpg"
                alt="启创宝数字化财务中心"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-xl font-semibold text-gray-800 hidden sm:block">
              启创宝数字化财务中心
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-4">
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
                  <p className="text-xs text-gray-500">{getRoleDisplay()}</p>
                  <p className="text-xs text-gray-500">{getCompanyName()}</p>
                </div>

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    setIsChangePasswordModalOpen(true);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <Settings className="h-4 w-4" />
                  <span>修改密码</span>
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

      {/* 修改密码弹窗 */}
      {isChangePasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-96 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">修改密码</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  新密码
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入新密码"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  确认新密码
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请再次输入新密码"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsChangePasswordModalOpen(false);
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
              >
                取消
              </button>
              <button
                onClick={async () => {
                  if (!newPassword || !confirmPassword) {
                    toast.error("请输入密码");
                    return;
                  }
                  if (newPassword !== confirmPassword) {
                    toast.error("两次输入的密码不一致");
                    return;
                  }
                  if (newPassword.length < 6) {
                    toast.error("密码长度至少6位");
                    return;
                  }

                  setIsSubmittingPassword(true);
                  try {
                    await AdminUserService.changePassword(
                      newPassword,
                      confirmPassword
                    );
                    toast.success("密码修改成功，请重新登录");
                    setIsChangePasswordModalOpen(false);
                    setNewPassword("");
                    setConfirmPassword("");
                    logout();
                  } catch (error) {
                    console.error("修改密码失败:", error);
                    toast.error("修改密码失败");
                  } finally {
                    setIsSubmittingPassword(false);
                  }
                }}
                disabled={isSubmittingPassword}
                className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
              >
                {isSubmittingPassword ? "提交中..." : "确定"}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
