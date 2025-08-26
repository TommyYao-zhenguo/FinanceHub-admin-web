// 用户信息接口
export interface AdminUserInfo {
  id: string;
  userNo: string;
  username: string;
  companyNo: string;
  companyName: string;
  roleName: string;
  roleCode: string;
  status: "ACTIVE" | "INACTIVE";
  createTime: string;
  updateTime: string;
  franchise : boolean;
  customerServiceId?: string; // 绑定的客服ID
  customerServiceName?: string; // 绑定的客服姓名
}

// 用户角色枚举
export enum UserRole {
  ADMIN = "ADMIN",
  EMPLOYEE = "COMMON",
  CUSTOMER_SERVICE= "CUSTOMER_SERVICE",
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
  password: string;
  companyNo?: string;
  roleCode: UserRole;
  customerServiceId?: string; // 绑定的客服ID
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
  companyNo?: string;
  roleCode?: UserRole;
  status?: "ACTIVE" | "INACTIVE";
}

// 用户列表响应接口
export interface UserListResponse {
  records: AdminUserInfo[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// 用户上下文类型
export interface AdminUserContextType {
  userInfo: AdminUserInfo | null;
  setUserInfo: (userInfo: AdminUserInfo | null) => void;
  fetchUserInfo: () => Promise<void>;
  logout: () => Promise<void>;
}
