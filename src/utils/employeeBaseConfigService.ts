import { httpClient } from "./http";
import {
  EmployeeBaseConfig,
  EmployeeBaseConfigQueryParams,
  EmployeeQueryParams,
  EmployeeBaseConfigListResponse,
  EmployeeListResponse,
  CreateEmployeeBaseConfigRequest,
  UpdateEmployeeBaseConfigRequest,
  BatchUpdateEmployeeBaseConfigRequest,
} from "../types/employeeBaseConfig";

export class EmployeeBaseConfigService {
  // 获取员工列表
  static async getEmployeeList(
    params: EmployeeQueryParams
  ): Promise<EmployeeListResponse> {
    const queryParams = new URLSearchParams();

    if (params.current !== undefined)
      queryParams.append("page", params.current.toString());
    if (params.size !== undefined)
      queryParams.append("size", params.size.toString());
    if (params.companyNo) queryParams.append("companyNo", params.companyNo);
    if (params.employeeName)
      queryParams.append("employeeName", params.employeeName);
    if (params.status) queryParams.append("status", params.status);

    const url = `/api/v1/employee/active/page?${queryParams.toString()}`;
    const response = await httpClient.get<EmployeeListResponse>(url);
    return response;
  }

  // 获取员工基数配置列表
  static async getEmployeeBaseConfigList(
    params: EmployeeBaseConfigQueryParams
  ): Promise<EmployeeBaseConfigListResponse> {
    const queryParams = new URLSearchParams();

    if (params.current !== undefined)
      queryParams.append("page", params.current.toString());
    if (params.size !== undefined)
      queryParams.append("size", params.size.toString());
    if (params.companyNo) queryParams.append("companyNo", params.companyNo);
    if (params.employeeName)
      queryParams.append("employeeName", params.employeeName);
    if (params.status) queryParams.append("status", params.status);

    const url = `/api/v1/employee-base-config/list?${queryParams.toString()}`;
    const response = await httpClient.get<EmployeeBaseConfigListResponse>(url);
    return response;
  }

  // 根据员工ID获取基数配置
  static async getEmployeeBaseConfigByEmployeeId(
    employeeId: string
  ): Promise<EmployeeBaseConfig | null> {
    try {
      const response = await httpClient.get<EmployeeBaseConfig>(
        `/api/v1/employee-base-config/employee/${employeeId}`
      );
      return response;
    } catch (error: unknown) {
      if (
        (error as { response?: { status?: number } }).response?.status === 404
      ) {
        return null;
      }
      throw error;
    }
  }

  // 创建员工基数配置
  static async createEmployeeBaseConfig(
    data: CreateEmployeeBaseConfigRequest
  ): Promise<EmployeeBaseConfig> {
    const response = await httpClient.post<EmployeeBaseConfig>(
      "/api/v1/employee-base-config",
      data
    );
    return response;
  }

  // 更新员工基数配置
  static async updateEmployeeBaseConfig(
    data: UpdateEmployeeBaseConfigRequest
  ): Promise<EmployeeBaseConfig> {
    const response = await httpClient.put<EmployeeBaseConfig>(
      `/api/v1/employee-base-config/${data.id}`,
      data
    );
    return response;
  }

  // 删除员工基数配置
  static async deleteEmployeeBaseConfig(id: string): Promise<void> {
    await httpClient.delete(`/api/v1/employee-base-config/${id}`);
  }

  // 更新单个员工的社保和公积金基数
  static async updateEmployeeBase(
    employeeId: number,
    data: {
      socialSecurityBase: number;
      housingFundBase: number;
      effectiveDate?: string;
    }
  ): Promise<void> {
    await httpClient.put<void>(
      `/api/v1/employee/update-base/${employeeId}`,
      data
    );
  }

  // 批量更新员工基数配置
  static async batchUpdateEmployeeBaseConfig(
    data: BatchUpdateEmployeeBaseConfigRequest
  ): Promise<void> {
    // 使用新的员工基数更新接口进行批量更新
    const updatePromises = data.configs.map((config) => {
      // 需要根据employeeNo找到对应的员工ID
      // 这里假设我们有一个方法可以通过employeeNo获取员工ID
      return this.updateEmployeeBaseByEmployeeNo(config.employeeNo, {
        socialSecurityBase: config.socialInsuranceBase || 0,
        housingFundBase: config.housingFundBase || 0,
        effectiveDate: config.effectiveDate,
      });
    });

    await Promise.all(updatePromises);
  }

  // 通过员工工号更新基数（内部方法）
  private static async updateEmployeeBaseByEmployeeNo(
    employeeNo: string,
    data: {
      socialSecurityBase: number;
      housingFundBase: number;
      effectiveDate?: string;
    }
  ): Promise<void> {
    // 这里需要先通过employeeNo获取员工ID，然后调用更新接口
    // 由于当前的员工列表已经包含了ID，我们可以在调用时直接传递ID
    // 暂时保留原有的批量更新接口作为备用
    await httpClient.post<void>("/api/v1/employee-base-config/batch-update", {
      configs: [
        {
          employeeNo,
          socialInsuranceBase: data.socialSecurityBase,
          housingFundBase: data.housingFundBase,
          effectiveDate:
            data.effectiveDate || new Date().toISOString().split("T")[0],
        },
      ],
      companyNo: "", // 这个会在后端通过session获取
    });
  }

  // 根据公司编号获取员工基数配置统计
  static async getEmployeeBaseConfigStats(companyNo: string): Promise<{
    totalEmployees: number;
    configuredEmployees: number;
    unconfiguredEmployees: number;
  }> {
    const response = await httpClient.get<{
      totalEmployees: number;
      configuredEmployees: number;
      unconfiguredEmployees: number;
    }>(`/api/v1/employee-base-config/stats/${companyNo}`);
    return response;
  }

  // 检查公司是否已配置社保和公积金比例
  static async checkRateConfiged(companyNo: string): Promise<{
    itemDesc: string;
    itemHasConfig: boolean;
  }> {
    const url = `/api/v1/employee/check-rate-configed?companyNo=${companyNo}`;
    const response = await httpClient.get<{
      itemDesc: string;
      itemHasConfig: boolean;
    }>(url);
    return response;
  }
}
