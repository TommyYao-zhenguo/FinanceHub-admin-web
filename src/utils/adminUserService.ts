import { httpClient } from "./http";
import { API_ENDPOINTS } from "../config/api";
import {
  AdminUserInfo,
  CreateUserRequest,
  UpdateUserRequest,
  UserQueryParams,
  UserListResponse,
} from "../types/adminUser";

export class AdminUserService {
  // 获取用户列表
  static async getUserList(
    params: UserQueryParams = {}
  ): Promise<UserListResponse> {
    const queryParams = new URLSearchParams();

    if (params.current !== undefined)
      queryParams.append("current", params.current.toString());
    if (params.size !== undefined)
      queryParams.append("size", params.size.toString());
    if (params.username) queryParams.append("username", params.username);
    if (params.roleCode) queryParams.append("roleCode", params.roleCode);

    if (params.status) queryParams.append("status", params.status);

    const url = `${API_ENDPOINTS.SYS_USER.LIST}?${queryParams.toString()}`;
    const response = await httpClient.get<UserListResponse>(url);
    return response.data || response;
  }

  static async getCustomerServiceList(
    params: UserQueryParams = {}
  ): Promise<UserListResponse> {
    const queryParams = new URLSearchParams();

    if (params.page !== undefined)
      queryParams.append("page", params.page.toString());
    if (params.size !== undefined)
      queryParams.append("size", params.size.toString());
    if (params.username) queryParams.append("username", params.username);
    if (params.roleCode) queryParams.append("roleCode", params.roleCode);

    if (params.status) queryParams.append("status", params.status);

    const url = `${
      API_ENDPOINTS.CUSTOMER_SERVICE_USER.LIST
    }?${queryParams.toString()}`;
    const response = await httpClient.get<UserListResponse>(url);
    return response.data || response;
  }

  // 创建用户
  static async createUser(data: CreateUserRequest): Promise<AdminUserInfo> {
    const response = await httpClient.post<AdminUserInfo>(
      API_ENDPOINTS.SYS_USER.CREATE,
      data
    );
    return response.data || response;
  }

  static async createCustomerServiceUser(data: CreateUserRequest): Promise<AdminUserInfo> {
    const response = await httpClient.post<AdminUserInfo>(
      API_ENDPOINTS.CUSTOMER_SERVICE_USER.CREATE,
      data
    );
    return response.data || response;
  }

  // 更新用户
  static async updateUser(data: UpdateUserRequest): Promise<AdminUserInfo> {
    await httpClient.post<AdminUserInfo>(
      API_ENDPOINTS.CUSTOMER_SERVICE_USER.UPDATE,
      data
    );
  }

  // 删除用户
  static async deleteUser(userNo: string): Promise<void> {
    await httpClient.post(
      `${API_ENDPOINTS.CUSTOMER_SERVICE_USER.DELETE}/${userNo}`
    );
  }

  // 修改密码
  static async changePassword(
    userId: string,
    newPassword: string
  ): Promise<void> {
    await httpClient.post(API_ENDPOINTS.CUSTOMER_SERVICE_USER.CHANGE_PASSWORD, {
      userId,
      newPassword,
    });
  }
}
