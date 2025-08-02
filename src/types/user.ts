// 用户信息接口
export interface UserInfo {
  id: string;
  userId: string;
  username: string;
  mobile?: string;
  companyId: string;
  companyName: string;
  roleName: string;
  roleCode: string;
  status: "ACTIVE" | "INACTIVE";
  createTime: string;
  updateTime: string;
}

// 用户角色枚举
export enum UserRole {
  ADMIN = "ADMIN",
  EMPLOYEE = "COMMON",
  SUPER_ADMIN = "SUPER_ADMIN", // 添加超级管理员角色
}

// 用户角色选项
export interface UserRoleOption {
  value: UserRole;
  label: string;
}

// 创建用户请求接口
export interface CreateUserRequest {
  username: string;
  mobile?: string;
  password: string;
  roleCode: UserRole;
}

// 更新用户请求接口
export interface UpdateUserRequest extends Omit<CreateUserRequest, "password"> {
  id: string;
  password?: string; // 可选，用于修改密码
}

// 用户列表查询参数
export interface UserQueryParams {
  page?: number;
  size?: number;
  username?: string;
  companyId?: string;
  roleCode?: UserRole;
  status?: "ACTIVE" | "INACTIVE";
}

// 用户列表响应接口
export interface UserListResponse {
  content: UserInfo[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// 用户上下文类型
export interface UserContextType {
  userInfo: UserInfo | null;
  setUserInfo: (userInfo: UserInfo | null) => void;
  fetchUserInfo: () => Promise<void>;
  logout: () => Promise<void>;
}
