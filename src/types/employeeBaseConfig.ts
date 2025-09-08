// 员工基数配置接口
export interface EmployeeBaseConfig {
  id?: string;
  employeeNo: string;
  employeeName: string;
  companyNo: string;
  companyName: string;
  socialInsuranceBase?: number; // 社保基数
  housingFundBase?: number; // 公积金基数
  supplementaryHousingFundBase?: number; // 补充公积金基数
  supplementaryHousingFundRate?: number; // 补充公积金比例
  supplementaryHousingFundPersonalRate?: number; // 补充公积金个人缴纳比例
  effectiveDate: string; // 生效日期
  status: "ACTIVE" | "INACTIVE";
  createTime?: string;
  updateTime?: string;
}

// 员工信息接口
export interface Employee {
  id: string;
  employeeNo: string;
  employeeName: string;
  companyNo: string;
  companyName: string;
  basicSalary: number;
  position?: string;
  status: "ACTIVE" | "INACTIVE";
  hireDate?: string;
  phone?: string;
  idCard?: string;
  email?: string;
  remarks?: string;
  createTime?: string;
  updateTime?: string;
}

// 创建/更新员工基数配置请求接口
export interface CreateEmployeeBaseConfigRequest {
  employeeNo: string;
  companyNo: string;
  socialInsuranceBase?: number;
  housingFundBase?: number;
  supplementaryHousingFundBase?: number;
  supplementaryHousingFundRate?: number;
  supplementaryHousingFundPersonalRate?: number;
  effectiveDate: string;
}

export interface UpdateEmployeeBaseConfigRequest {
  id: string;
  socialInsuranceBase?: number;
  housingFundBase?: number;
  supplementaryHousingFundBase?: number;
  supplementaryHousingFundRate?: number;
  supplementaryHousingFundPersonalRate?: number;
  effectiveDate: string;
}

// 员工基数配置查询参数
export interface EmployeeBaseConfigQueryParams {
  current?: number;
  size?: number;
  companyNo?: string;
  employeeName?: string;
  status?: "ACTIVE" | "INACTIVE";
}

// 员工查询参数
export interface EmployeeQueryParams {
  current?: number;
  size?: number;
  companyNo: string;
  employeeName?: string;
  status?: "ACTIVE" | "INACTIVE";
}

// 员工基数配置列表响应接口
export interface EmployeeBaseConfigListResponse {
  records: EmployeeBaseConfig[];
  total: number;
  pages: number;
  size: number;
  current: number;
}

// 员工列表响应接口
export interface EmployeeListResponse {
  records: BackendEmployeeData[];
  total: number;
  pages: number;
  size: number;
  current: number;
}

// 后端返回的员工数据结构
export interface BackendEmployeeData {
  id: number;
  employeeNo: string;
  employeeUsername?: string;
  employeeName: string;
  companyNo: string;
  companyName?: string;
  status: number;
  statusName?: string;
  idCard: string;
  phone: string;
  hireDate: string;
  remarks?: string;
  basicSalary: number;
  socialSecurityBase: number;
  housingFundBase: number;
  supplementaryHousingFundBase?: number;
  supplementaryHousingFundRate?: number;
  supplementaryHousingFundPersonalRate?: number; // 补充公积金个人缴纳比例
  socialInsurance?: boolean; // 是否缴纳社保
  housingFund?: boolean; // 是否缴纳公积金
  socialSecurityFee?: number;
  housingFundFee?: number;
  personalTax?: number;
  netSalary: number;
  resignationDate?: string;
  createTime: string;
  updateTime: string;
}

// 批量更新员工基数配置请求接口
export interface BatchUpdateEmployeeBaseConfigRequest {
  configs: {
    employeeNo: string;
    socialInsuranceBase?: number;
    housingFundBase?: number;
    supplementaryHousingFundBase?: number;
    supplementaryHousingFundRate?: number;
    supplementaryHousingFundPersonalRate?: number;
    effectiveDate: string;
  }[];
  companyNo: string;
}
