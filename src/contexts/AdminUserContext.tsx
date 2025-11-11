import React, { createContext, useContext, useState, useCallback } from 'react';
import { httpClient } from '../utils/http';
import { API_ENDPOINTS } from '../config/api';
import { AdminUserInfo, AdminUserContextType } from '../types/adminUser';
import toast from 'react-hot-toast';


const AdminUserContext = createContext<AdminUserContextType | undefined>(undefined);

export const useAdminUserContext = () => {
  const context = useContext(AdminUserContext);
  if (context === undefined) {
    throw new Error('useAdminUserContext must be used within a AdminUserProvider');
  }
  return context;
};

interface AdminUserProviderProps {
  children: React.ReactNode;
}

export const AdminUserProvider: React.FC<AdminUserProviderProps> = ({ children }) => {
  const [userInfo, setUserInfo] = useState<AdminUserInfo | null>(null);


  const fetchUserInfo = useCallback(async () => {
    try {
      const response = await httpClient.get<AdminUserInfo>(API_ENDPOINTS.SYS_USER.INFO);
      setUserInfo(response);
    } catch (error) {
      toast.error('获取用户信息失败');
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await httpClient.post(API_ENDPOINTS.SYS_USER.LOGOUT, {});
    } catch (error) {
      console.error('退出登录请求失败:', error);
    } finally {
      // 清除本地存储的token和用户信息
      localStorage.removeItem('token');
      setUserInfo(null);
      // 刷新页面回到登录状态
      window.location.reload();
    }
  }, []);

  const value: AdminUserContextType = {
    userInfo,
    setUserInfo,
    fetchUserInfo,
    logout,
  };

  return <AdminUserContext.Provider value={value}>{children}</AdminUserContext.Provider>;
};
