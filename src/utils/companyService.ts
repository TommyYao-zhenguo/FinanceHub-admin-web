import { httpClient } from "./http";
import { API_ENDPOINTS } from "../config/api";
import {
  Company,
  CreateCompanyRequest,
  UpdateCompanyRequest,
  CompanyQueryParams,
  CompanyListResponse,
  Province,
} from "../types/company";

export class CompanyService {
  // 获取省份列表
  static async getProvinces(): Promise<Province[]> {
    const response = await httpClient.get<Province[]>(
      API_ENDPOINTS.PROVINCE.LIST,
    );
    return response;
  }

  // 获取公司列表
  static async getCompanyList(
    params: CompanyQueryParams = {},
  ): Promise<CompanyListResponse> {
    const queryParams = new URLSearchParams();

    if (params.current !== undefined)
      queryParams.append("page", params.current.toString());
    if (params.size !== undefined)
      queryParams.append("size", params.size.toString());
    if (params.companyName)
      queryParams.append("companyName", params.companyName);
    if (params.status) queryParams.append("status", params.status);

    const url = `${API_ENDPOINTS.COMPANY.LIST}?${queryParams.toString()}`;
    const response = await httpClient.get<CompanyListResponse>(url);
    // Check if response has data property, otherwise return response directly
    return response;
  }

  // 获取客服绑定的公司列表
  static async getCustomerServiceCompanyList(
    params: CompanyQueryParams = {},
  ): Promise<CompanyListResponse> {
    const queryParams = new URLSearchParams();

    if (params.current !== undefined)
      queryParams.append("page", params.current.toString());
    if (params.size !== undefined)
      queryParams.append("size", params.size.toString());
    if (params.companyName)
      queryParams.append("companyName", params.companyName);
    if (params.status) queryParams.append("status", params.status);

    const url = `${API_ENDPOINTS.COMPANY.CUSTOMER_SERVICE_LIST}?${queryParams.toString()}`;
    const response = await httpClient.get<CompanyListResponse>(url);
    return response;
  }

  // 创建公司
  static async createCompany(data: CreateCompanyRequest): Promise<void> {
    await httpClient.post(API_ENDPOINTS.COMPANY.CREATE, data);
  }

  // 更新公司
  static async updateCompany(data: UpdateCompanyRequest): Promise<void> {
    await httpClient.put(API_ENDPOINTS.COMPANY.UPDATE, data);
  }

  // 删除公司
  static async deleteCompany(id: string): Promise<void> {
    await httpClient.delete(`${API_ENDPOINTS.COMPANY.DELETE}/${id}`);
  }

  // 获取公司详情
  static async getCompanyDetail(id: string): Promise<Company> {
    const response = await httpClient.get<Company>(
      `${API_ENDPOINTS.COMPANY.DETAIL}/${id}`,
    );
    // Check if response has data property, otherwise return response directly
    return response;
  }
}
