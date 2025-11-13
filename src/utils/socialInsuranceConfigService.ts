import { httpClient } from "./http";
import { API_ENDPOINTS } from "../config/api";
import {
  SocialInsuranceConfig,
  SocialInsuranceConfigQueryParams,
  SocialInsuranceConfigListResponse,
  BatchSocialInsuranceConfigRequest,
} from "../types/socialInsuranceConfig";

export class SocialInsuranceConfigService {
  // 获取社保配置列表
  static async getConfigList(
    params: SocialInsuranceConfigQueryParams = {}
  ): Promise<SocialInsuranceConfigListResponse> {
    const queryParams = new URLSearchParams();

    if (params.current !== undefined)
      queryParams.append("current", params.current.toString());
    if (params.size !== undefined)
      queryParams.append("size", params.size.toString());
    if (params.insuranceType)
      queryParams.append("insuranceType", params.insuranceType);
    if (params.isActive !== undefined)
      queryParams.append("isActive", params.isActive.toString());
    if (params.companyName)
      queryParams.append("companyName", params.companyName);
    if (params.companyNo)
      queryParams.append("companyNo", params.companyNo);

    const url = `${API_ENDPOINTS.SOCIAL_INSURANCE_CONFIG.LIST}?${queryParams.toString()}`;
    const response = await httpClient.get<SocialInsuranceConfigListResponse>(url);
    return response;
  }

  // 删除社保配置
  static async deleteConfig(id: string): Promise<void> {
    await httpClient.delete(`${API_ENDPOINTS.SOCIAL_INSURANCE_CONFIG.DELETE}/${id}`);
  }


  // 批量配置社保比例
  static async batchConfigRates(request: BatchSocialInsuranceConfigRequest): Promise<void> {
    await httpClient.post(`${API_ENDPOINTS.SOCIAL_INSURANCE_CONFIG.BATCH}`, request);
  }

  // 获取公司的所有社保配置
  static async getCompanyConfigs(companyNo: string): Promise<SocialInsuranceConfig[]> {
    const response = await httpClient.get<SocialInsuranceConfig[]>(
      `${API_ENDPOINTS.SOCIAL_INSURANCE_CONFIG.LIST}/company/${companyNo}`
    );
    return response;
  }
}