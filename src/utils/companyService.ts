import { httpClient } from "./http";
import { API_ENDPOINTS } from "../config/api";
import {
  Company,
  CreateCompanyRequest,
  UpdateCompanyRequest,
  CompanyQueryParams,
  CompanyListResponse,
} from "../types/company";

export class CompanyService {
  // 获取公司列表
  static async getCompanyList(
    params: CompanyQueryParams = {}
  ): Promise<CompanyListResponse> {
    const queryParams = new URLSearchParams();

    if (params.page !== undefined)
      queryParams.append("page", params.page.toString());
    if (params.size !== undefined)
      queryParams.append("size", params.size.toString());
    if (params.companyName)
      queryParams.append("companyName", params.companyName);
    if (params.status) queryParams.append("status", params.status);

    const url = `${API_ENDPOINTS.COMPANY.LIST}?${queryParams.toString()}`;
    const response = await httpClient.get<CompanyListResponse>(url);
    // Check if response has data property, otherwise return response directly
    return response.data || response;
  }

  // 创建公司
  static async createCompany(data: CreateCompanyRequest): Promise<Company> {
    await httpClient.post<Company>(API_ENDPOINTS.COMPANY.CREATE, data);
  }

  // 更新公司
  static async updateCompany(data: UpdateCompanyRequest): Promise<Company> {
    await httpClient.put<Company>(API_ENDPOINTS.COMPANY.UPDATE, data);
  }

  // 删除公司
  static async deleteCompany(id: string): Promise<void> {
    await httpClient.delete(`${API_ENDPOINTS.COMPANY.DELETE}/${id}`);
  }

  // 获取公司详情
  static async getCompanyDetail(id: string): Promise<Company> {
    const response = await httpClient.get<Company>(
      `${API_ENDPOINTS.COMPANY.DETAIL}/${id}`
    );
    // Check if response has data property, otherwise return response directly
    return response.data || response;
  }
}
