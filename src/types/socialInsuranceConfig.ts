// 社保配置信息接口
export interface SocialInsuranceConfig {
  id?: string;
  insuranceType: string; // 保险类型：pension, medical, unemployment, injury, maternity
  insuranceName: string; // 保险名称
  companyRate: number; // 公司缴费比例
  personalRate: number; // 个人缴费比例
  isActive: boolean; // 是否启用
  createTime?: string;
  updateTime?: string;
  companyId?: string; // 公司ID
  companyName?: string; // 公司名称
  taxNumber?: string; // 税号
}

// 单个险种配置
export interface InsuranceRateConfig {
  insuranceType: string;
  insuranceName: string;
  companyRate: number;
  personalRate: number;
  isActive: boolean;
}

// 批量社保配置请求接口
export interface BatchSocialInsuranceConfigRequest {
  companyId: string;
  configs: InsuranceRateConfig[];
}

// 创建社保配置请求接口
export interface CreateSocialInsuranceConfigRequest {
  insuranceType: string;
  insuranceName: string;
  companyRate: number;
  personalRate: number;
  isActive: boolean;
  companyId?: string;
}

// 更新社保配置请求接口
export interface UpdateSocialInsuranceConfigRequest extends CreateSocialInsuranceConfigRequest {
  id: string;
}

// 社保配置列表查询参数
export interface SocialInsuranceConfigQueryParams {
  current?: number;
  size?: number;
  insuranceType?: string;
  isActive?: boolean;
  companyName?: string;
  companyId?: string;
}

// 社保配置列表响应接口
export interface SocialInsuranceConfigListResponse {
  records: SocialInsuranceConfig[];
  total: number;
  pages: number;
  size: number;
  current: number;
}