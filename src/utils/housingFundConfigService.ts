import { httpClient } from "./http";
import { API_ENDPOINTS } from "../config/api";
import {
  HousingFundConfig,
  CreateHousingFundConfigRequest,
  HousingFundConfigQueryParams,
  HousingFundConfigListResponse,
} from "../types/housingFundConfig";

export class HousingFundConfigService {
  // 获取公积金配置列表
  static async getConfigList(
    params: HousingFundConfigQueryParams = {}
  ): Promise<HousingFundConfigListResponse> {
    const queryParams = new URLSearchParams();

    if (params.current !== undefined)
      queryParams.append("current", params.current.toString());
    if (params.size !== undefined)
      queryParams.append("size", params.size.toString());
    if (params.isActive !== undefined)
      queryParams.append("isActive", params.isActive.toString());
    if (params.configStatus !== undefined)
      queryParams.append("configStatus", params.configStatus.toString());
    if (params.companyName !== undefined)
      queryParams.append("companyName", params.companyName);

    const url = `${
      API_ENDPOINTS.HOUSING_FUND_CONFIG.LIST
    }?${queryParams.toString()}`;
    const response = await httpClient.get<HousingFundConfigListResponse>(url);
    return response;
  }

  // 创建公积金配置
  static async createConfig(
    data: CreateHousingFundConfigRequest
  ): Promise<void> {
    await httpClient.post(API_ENDPOINTS.HOUSING_FUND_CONFIG.CREATE, data);
  }

  // 更新公积金配置
  static async updateConfig(
    id: string,
    data: CreateHousingFundConfigRequest
  ): Promise<void> {
    await httpClient.put(
      `${API_ENDPOINTS.HOUSING_FUND_CONFIG.UPDATE}/${id}`,
      data
    );
  }

  // 删除公积金配置
  static async deleteConfig(id: string): Promise<void> {
    await httpClient.delete(
      `${API_ENDPOINTS.HOUSING_FUND_CONFIG.DELETE}/${id}`
    );
  }

  // 获取公积金配置详情
  static async getConfigDetail(id: string): Promise<HousingFundConfig> {
    const response = await httpClient.get<HousingFundConfig>(
      `${API_ENDPOINTS.HOUSING_FUND_CONFIG.LIST}/${id}`
    );
    return response;
  }
}
