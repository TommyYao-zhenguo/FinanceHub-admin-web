import React, { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Settings,
  HelpCircle,
  Users,
  ChevronDown,
  ChevronRight,
  UserCog,
  Building2,
  Shield,
  Home,
  Upload,
  Calculator,
  FileText,
  Receipt,
  UserPlus,
  DollarSign,
  RefreshCw,
} from "lucide-react";
import { useAdminUserContext } from "../contexts/AdminUserContext";

interface SidebarProps {
  isOpen: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

type SidebarLink = { id: string; label: string; icon: LucideIcon };
type SubLink = { id: string; label: string; icon: LucideIcon; badge?: string };

// 将用户管理菜单项移除，改为动态生成
const menuItems: SidebarLink[] = [
  { id: "customer-service", label: "客服中心", icon: HelpCircle },
];

export default function Sidebar({
  isOpen,
  activeTab,
  onTabChange,
}: SidebarProps) {
  const [isSystemMenuOpen, setIsSystemMenuOpen] = useState(false);
  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false);
  const [isCustomerInfoOpen, setIsCustomerInfoOpen] = useState(false);
  const [isMonthlyUploadOpen, setIsMonthlyUploadOpen] = useState(false);
  const { userInfo } = useAdminUserContext();

  const handleItemClick = (item: { id: string }) => {
    onTabChange(item.id);
  };

  // 检查用户是否有权限查看用户管理菜单
  const hasAdminUserManagementAccess = () => {
    if (!userInfo?.roleCode) return false;
    return userInfo.roleCode === "SUPER_ADMIN" || userInfo.roleCode === "ADMIN";
  };

  const isCustomerServiceUser = () => {
    if (!userInfo?.roleCode) return false;
    return userInfo.roleCode === "CUSTOMER_SERVICE";
  };

  // 检查用户是否有权限查看公司管理
  const hasCompanyManagementAccess = () => {
    if (!userInfo?.roleCode) return false;
    return (
      userInfo.roleCode === "SUPER_ADMIN" ||
      (userInfo.roleCode === "ADMIN" && userInfo?.franchise)
    );
  };

  // 获取顶部菜单项，根据权限动态生成
  const getTopMenuItems = () => {
    const items = [...menuItems]; // 复制基本菜单项

    // 只有 SUPER_ADMIN 或 ADMIN 才能看到用户管理
    if (hasAdminUserManagementAccess()) {
      items.unshift({
        id: "customer-service-users",
        label: "客服管理",
        icon: Users,
      });
    }

    // 只有 SUPER_ADMIN 才能看到税航数据同步
    if (userInfo?.roleCode === "SUPER_ADMIN") {
      items.push({
        id: "shuihang-sync",
        label: "开票数据同步",
        icon: RefreshCw,
      });
    }

    return items;
  };

  // 系统管理子菜单项（管理员入口）
  const getSystemMenuItems = () => {
    const items: SidebarLink[] = [];

    if (hasCompanyManagementAccess()) {
      items.push({
        id: "company-management",
        label: "公司管理",
        icon: Building2,
      });
    }
    if (hasAdminUserManagementAccess()) {
      items.push({ id: "user-management", label: "用户管理", icon: UserCog });
    }
    return items;
  };

  const topMenuItems = getTopMenuItems(); // 获取动态生成的顶部菜单项
  const systemMenuItems = getSystemMenuItems();
  const showSystemMenu = systemMenuItems.length > 0 || isCustomerServiceUser();

  // 分组：新客户配置、客户信息查看、月度上传
  const newCustomerItems: SubLink[] = [
    { id: "social-insurance-config", label: "社保比例配置", icon: Shield },
    { id: "housing-fund-config", label: "公积金比例配置", icon: Home },
    {
      id: "employee-base-config",
      label: "社保和公积金基数配置",
      icon: Calculator,
    },
    { id: "employee-import", label: "客户人员信息批量配置", icon: UserPlus },
    { id: "invoice-type-management", label: "发票类型配置", icon: FileText },
    { id: "invoice-quota-management", label: "开票额度配置", icon: Receipt },
  ];

  const customerInfoItems: SubLink[] = [
    {
      id: "company-social-insurance-list",
      label: "公司社保明细",
      icon: Shield,
    },
    {
      id: "company-housing-fund-list",
      label: "公司公积金明细",
      icon: Building2,
    },
  ];

  const monthlyUploadItems: SubLink[] = [
    { id: "invoice-management", label: "进销项发票上传", icon: FileText },
    { id: "tax-upload", label: "税费上传", icon: Upload },
    { id: "personal-tax-upload", label: "个税上传", icon: Upload },
    { id: "non-invoiced-income", label: "不开票收入上传", icon: DollarSign },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => onTabChange(activeTab)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-30
        w-72 bg-gradient-to-b from-gray-800 to-gray-900 text-white transform transition-transform duration-300 ease-in-out flex-shrink-0
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        <div className="h-full px-4 py-6 overflow-y-auto">
          <div className="space-y-2">
            {/* 常规菜单项 - 使用动态生成的菜单项 */}
            {topMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors
                    ${
                      activeTab === item.id
                        ? "bg-orange-600 text-white shadow-lg"
                        : "text-gray-300 hover:text-white hover:bg-gray-700"
                    }
                  `}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}

            {/* 系统管理菜单 */}
            {showSystemMenu && (
              <div className="space-y-1">
                {/* 系统管理主菜单 */}
                <button
                  onClick={() => setIsSystemMenuOpen(!isSystemMenuOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors text-gray-300 hover:text-white hover:bg-gray-700"
                >
                  <div className="flex items-center space-x-3">
                    <Settings className="h-5 w-5 flex-shrink-0" />
                    <span className="font-medium">客户管理</span>
                  </div>
                  {isSystemMenuOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>

                {/* 系统管理子菜单（管理员入口 + 三个分组） */}
                {isSystemMenuOpen && (
                  <div className="ml-4 space-y-3">
                    {/* 管理员入口 */}
                    {systemMenuItems.length > 0 && (
                      <div className="space-y-1">
                        {systemMenuItems.map((item) => {
                          const Icon = item.icon;
                          return (
                            <button
                              key={item.id}
                              onClick={() => handleItemClick(item)}
                              className={`
                                w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-left transition-colors
                                ${
                                  activeTab === item.id
                                    ? "bg-orange-600 text-white shadow-lg"
                                    : "text-gray-400 hover:text-white hover:bg-gray-700"
                                }
                              `}
                            >
                              <Icon className="h-4 w-4 flex-shrink-0" />
                              <span className="text-sm font-medium">
                                {item.label}
                              </span>
                            </button>
                          );
                        })}
                        <div className="border-t border-gray-700 my-2" />
                      </div>
                    )}

                    {/* 新客户配置 */}
                    {isCustomerServiceUser() && (
                      <div>
                        <button
                          onClick={() =>
                            setIsNewCustomerOpen(!isNewCustomerOpen)
                          }
                          className="w-full flex items-center justify-between px-4 py-2 rounded-lg text-left transition-colors text-gray-300 hover:text-white hover:bg-gray-700"
                        >
                          <div className="flex items-center space-x-3">
                            <UserPlus className="h-4 w-4 flex-shrink-0" />
                            <span className="text-sm font-semibold">
                              新客户配置
                            </span>
                          </div>
                          {isNewCustomerOpen ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>

                        {isNewCustomerOpen && (
                          <div className="mt-1 ml-3 space-y-1">
                            {newCustomerItems.map((item) => {
                              const Icon = item.icon;
                              return (
                                <button
                                  key={item.id}
                                  onClick={() => onTabChange(item.id)}
                                  className={`
                                    w-full flex items-center justify-between px-4 py-2 rounded-lg text-left transition-colors
                                    ${
                                      activeTab === item.id
                                        ? "bg-orange-600 text-white shadow-lg"
                                        : "text-gray-400 hover:text-white hover:bg-gray-700"
                                    }
                                  `}
                                >
                                  <span className="flex items-center space-x-3">
                                    <Icon className="h-4 w-4 flex-shrink-0" />
                                    <span className="text-sm font-medium">
                                      {item.label}
                                    </span>
                                  </span>
                                  {item.badge ? (
                                    <span className="ml-2 text-[10px] px-2 py-0.5 rounded bg-red-600 text-white">
                                      {item.badge}
                                    </span>
                                  ) : null}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* 客户信息查看 */}
                    {isCustomerServiceUser() && (
                      <div>
                        <button
                          onClick={() =>
                            setIsCustomerInfoOpen(!isCustomerInfoOpen)
                          }
                          className="w-full flex items-center justify-between px-4 py-2 rounded-lg text-left transition-colors text-gray-300 hover:text-white hover:bg-gray-700"
                        >
                          <div className="flex items-center space-x-3">
                            <Building2 className="h-4 w-4 flex-shrink-0" />
                            <span className="text-sm font-semibold">
                              客户信息查看
                            </span>
                          </div>
                          {isCustomerInfoOpen ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>

                        {isCustomerInfoOpen && (
                          <div className="mt-1 ml-3 space-y-1">
                            {customerInfoItems.map((item) => {
                              const Icon = item.icon;
                              return (
                                <button
                                  key={item.id}
                                  onClick={() => onTabChange(item.id)}
                                  className={`
                                    w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-left transition-colors
                                    ${
                                      activeTab === item.id
                                        ? "bg-orange-600 text-white shadow-lg"
                                        : "text-gray-400 hover:text-white hover:bg-gray-700"
                                    }
                                  `}
                                >
                                  <Icon className="h-4 w-4 flex-shrink-0" />
                                  <span className="text-sm font-medium">
                                    {item.label}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* 月度上传 */}
                    {isCustomerServiceUser() && (
                      <div>
                        <button
                          onClick={() =>
                            setIsMonthlyUploadOpen(!isMonthlyUploadOpen)
                          }
                          className="w-full flex items-center justify-between px-4 py-2 rounded-lg text-left transition-colors text-gray-300 hover:text-white hover:bg-gray-700"
                        >
                          <div className="flex items-center space-x-3">
                            <Upload className="h-4 w-4 flex-shrink-0" />
                            <span className="text-sm font-semibold">
                              月度上传
                            </span>
                          </div>
                          {isMonthlyUploadOpen ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>

                        {isMonthlyUploadOpen && (
                          <div className="mt-1 ml-3 space-y-1">
                            {monthlyUploadItems.map((item) => {
                              const Icon = item.icon;
                              return (
                                <button
                                  key={item.id}
                                  onClick={() => onTabChange(item.id)}
                                  className={`
                                    w-full flex items-center justify-between px-4 py-2 rounded-lg text-left transition-colors
                                    ${
                                      activeTab === item.id
                                        ? "bg-orange-600 text-white shadow-lg"
                                        : "text-gray-400 hover:text-white hover:bg-gray-700"
                                    }
                                  `}
                                >
                                  <span className="flex items-center space-x-3">
                                    <Icon className="h-4 w-4 flex-shrink-0" />
                                    <span className="text-sm font-medium">
                                      {item.label}
                                    </span>
                                  </span>
                                  {item.badge ? (
                                    <span className="ml-2 text-[10px] px-2 py-0.5 rounded bg-red-600 text-white">
                                      {item.badge}
                                    </span>
                                  ) : null}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 分隔线 */}
            <div className="border-t border-gray-700 my-4"></div>
          </div>
        </div>
      </aside>
    </>
  );
}
