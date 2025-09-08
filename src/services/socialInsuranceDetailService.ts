import { httpClient } from '../utils/http';

// 社保明细响应接口
export interface SocialInsuranceDetailResponse {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeNo: string;
  phone: string;
  period: string;
  
  // 各险种企业缴费金额
  pensionCompanyAmount: number;
  medicalCompanyAmount: number;
  unemploymentCompanyAmount: number;
  injuryCompanyAmount: number;
  maternityCompanyAmount: number;
  
  // 各险种个人缴费金额
  pensionPersonalAmount: number;
  medicalPersonalAmount: number;
  unemploymentPersonalAmount: number;
  injuryPersonalAmount: number;
  maternityPersonalAmount: number;
  
  totalCompanyAmount: number;
  totalPersonalAmount: number;
  socialSecurityBase: number;
  status: string;
  dueDate: string;
}

// 分页响应接口
export interface SocialInsuranceDetailPageResponse {
  records: SocialInsuranceDetailResponse[];
  total: number;
  pages: number;
  size: number;
  current: number;
}

// 查询参数接口
export interface SocialInsuranceDetailQueryParams {
  period: string;
  employeeName?: string;
  companyNo: string;
  current: number;
  size: number;
}

/**
 * 获取社保明细分页列表
 */
export const getSocialInsuranceDetailPage = async (
  params: SocialInsuranceDetailQueryParams
): Promise<SocialInsuranceDetailPageResponse> => {
  const queryParams = new URLSearchParams();
  queryParams.append('period', params.period);
  queryParams.append('companyNo', params.companyNo);
  queryParams.append('current', params.current.toString());
  queryParams.append('size', params.size.toString());
  if (params.employeeName) {
    queryParams.append('employeeName', params.employeeName);
  }
  
  const response = await httpClient.get<SocialInsuranceDetailPageResponse>(
    `/api/v1/admin/social-insurance/page?${queryParams.toString()}`
  );
  return response;
};

/**
 * 更新社保缴费状态
 */
export const updateSocialInsuranceStatus = async (
  id: number,
  status: string
): Promise<void> => {
  const queryParams = new URLSearchParams();
  queryParams.append('status', status);
  
  await httpClient.put(
    `/api/v1/admin/social-insurance/update-status/${id}?${queryParams.toString()}`
  );
};