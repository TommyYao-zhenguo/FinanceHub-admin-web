import React, { createContext, useContext, useState, useCallback } from 'react';
import { httpClient } from '../utils/http';
import { API_ENDPOINTS } from '../config/api';
import { UserInfo, UserContextType } from '../types/user';
import toast from 'react-hot-toast';


const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: React.ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);


  const fetchUserInfo = useCallback(async () => {
    try {
      const response = await httpClient.get<UserInfo>(API_ENDPOINTS.SYS_USER.INFO);
      console.log('获取用户信息成功:', response);
      setUserInfo(response);
    } catch (error) {
      console.error('获取用户信息失败:', error);
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

  const value: UserContextType = {
    userInfo,
    setUserInfo,
    fetchUserInfo,
    logout,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};