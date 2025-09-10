// 公积金配置信息接口
export interface HousingFundConfig {
  id?: string;
  companyNo: string; // 公司编号
  companyName?: string; // 公司名称
  taxNumber?: string; // 统一社会信用代码
  companyRate: number; // 公司缴存比例
  personalRate: number; // 个人缴存比例
  minBase: number; // 最低缴存基数
  maxBase: number; // 最高缴存基数
  isActive?: boolean; // 是否启用
  createTime?: string;
  updateTime?: string;
}

// 创建公积金配置请求接口
export interface CreateHousingFundConfigRequest {
  companyNo: string; // 公司编号
  companyRate: number;
  personalRate: number;
  minBase: number;
  maxBase: number;
}

// 更新公积金配置请求接口
export interface UpdateHousingFundConfigRequest extends CreateHousingFundConfigRequest {
  id: string;
}

// 公积金配置列表查询参数
export interface HousingFundConfigQueryParams {
  current?: number;
  size?: number;
  isActive?: boolean;
  companyName?: string; // 公司名称搜索
}

// 公积金配置列表响应接口
export interface HousingFundConfigListResponse {
  records: HousingFundConfig[];
  total: number;
  pages: number;
  size: number;
  current: number;
}