import { httpClient } from "./http";
import { API_ENDPOINTS } from "../config/api";
import {
  SocialInsuranceConfig,
  CreateSocialInsuranceConfigRequest,
  SocialInsuranceConfigQueryParams,
  SocialInsuranceConfigListResponse,
} from "../types/socialInsuranceConfig";

export class SocialInsuranceConfigService {
  // 获取社保配置列表
  static async getConfigList(
    params: SocialInsuranceConfigQueryParams = {}
  ): Promise<SocialInsuranceConfigListResponse> {
    const queryParams = new URLSearchParams();

    if (params.current !== undefined)
      queryParams.append("page", params.current.toString());
    if (params.size !== undefined)
      queryParams.append("size", params.size.toString());
    if (params.insuranceType)
      queryParams.append("insuranceType", params.insuranceType);
    if (params.isActive !== undefined)
      queryParams.append("isActive", params.isActive.toString());

    const url = `${API_ENDPOINTS.SOCIAL_INSURANCE_CONFIG.LIST}?${queryParams.toString()}`;
    const response = await httpClient.get<SocialInsuranceConfigListResponse>(url);
    return response;
  }

  // 创建社保配置
  static async createConfig(data: CreateSocialInsuranceConfigRequest): Promise<void> {
    await httpClient.post(API_ENDPOINTS.SOCIAL_INSURANCE_CONFIG.CREATE, data);
  }

  // 更新社保配置
  static async updateConfig(id: string, data: CreateSocialInsuranceConfigRequest): Promise<void> {
    await httpClient.put(`${API_ENDPOINTS.SOCIAL_INSURANCE_CONFIG.UPDATE}/${id}`, data);
  }

  // 删除社保配置
  static async deleteConfig(id: string): Promise<void> {
    await httpClient.delete(`${API_ENDPOINTS.SOCIAL_INSURANCE_CONFIG.DELETE}/${id}`);
  }

  // 获取社保配置详情
  static async getConfigDetail(id: string): Promise<SocialInsuranceConfig> {
    const response = await httpClient.get<SocialInsuranceConfig>(
      `${API_ENDPOINTS.SOCIAL_INSURANCE_CONFIG.LIST}/${id}`
    );
    return response;
  }
}