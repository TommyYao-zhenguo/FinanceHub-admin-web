// 公司信息接口
export interface Company {
  id: string;
  companyId: string;
  companyName: string;
  legalPerson: string;
  registrationNumber: string;
  taxNumber: string;
  address: string;
  phone: string;
  email: string;
  status: "ACTIVE" | "INACTIVE";
  franchise: boolean; // 是否是加盟商
  customerServiceId?: string; // 绑定的客服ID
  customerServiceName?: string; // 绑定的客服姓名
  createTime: string;
  updateTime: string;
}

// 创建公司请求接口
export interface CreateCompanyRequest {
  companyName: string;
  taxNumber: string;
  isFranchise: boolean; // 是否是加盟商
  customerServiceId?: string; // 绑定的客服ID
}

// 更新公司请求接口
export interface UpdateCompanyRequest {
  companyId: string;
  companyName: string;
  taxNumber: string;
  isFranchise: boolean; // 是否是加盟商
  customerServiceId?: string; // 绑定的客服ID
}

// 公司列表查询参数
export interface CompanyQueryParams {
  current?: number;
  size?: number;
  companyName?: string;
  status?: "ACTIVE" | "INACTIVE";
}

// 公司列表响应接口
export interface CompanyListResponse {
  records: Company[];
  total: number;
  pages: number;
  size: number;
  current: number;
}
