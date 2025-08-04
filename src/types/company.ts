// 公司信息接口
export interface Company {
  id: string;
  companyId: string;
  companyName: string;
  companyCode: string;
  legalPerson: string;
  registrationNumber: string;
  taxNumber: string;
  address: string;
  phone: string;
  email: string;
  status: "ACTIVE" | "INACTIVE";
  isFranchise: boolean; // 是否是加盟商
  createTime: string;
  updateTime: string;
}

// 创建公司请求接口
export interface CreateCompanyRequest {
  companyName: string;
  companyCode: string;
  legalPerson: string;
  registrationNumber: string;
  taxNumber: string;
  address: string;
  phone: string;
  email: string;
  franchise: boolean; // 是否是加盟商
}

// 更新公司请求接口
export interface UpdateCompanyRequest extends CreateCompanyRequest {
  id: string;
}

// 公司列表查询参数
export interface CompanyQueryParams {
  page?: number;
  size?: number;
  companyName?: string;
  status?: "ACTIVE" | "INACTIVE";
}

// 公司列表响应接口
export interface CompanyListResponse {
  records: Company[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
