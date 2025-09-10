import { httpClient } from "./http";
import { API_ENDPOINTS } from "../config/api";

// 开票额度接口定义
export interface InvoiceQuota {
  id: number;
  companyNo?: string;
  taxNumber: string;
  companyName?: string;
  statsDate: string; // 统计日期，格式：YYYY-MM
  maxAmount: number;
  createTime?: string;
  updateTime?: string;
}

// 创建开票额度请求
export interface CreateInvoiceQuotaRequest {
  companyNo: string;
  taxNumber: string;
  statsDate: string;
  maxAmount: number;
}

// 更新开票额度请求
export interface UpdateInvoiceQuotaRequest {
  id: number;
  companyNo: string;
  statsDate: string;
  maxAmount: number;
}

// 简化的更新开票额度请求（仅更新额度）
export interface UpdateInvoiceQuotaAmountRequest {
  id: number;
  maxAmount: number;
}

// 开票额度分页响应
export interface InvoiceQuotaPageResponse {
  records: InvoiceQuota[];
  total: number;
  pages: number;
  size: number;
  current: number;
}

// 查询参数
export interface InvoiceQuotaQueryParams {
  page?: number;
  size?: number;
  companyNo?: string;
  statsDate?: string;
}

// 公司和额度关联查询参数
export interface CompanyQuotaQueryParams {
  current?: number;
  size?: number;
  companyName?: string;
}

export class InvoiceQuotaService {
  // 获取开票额度列表
  static async getInvoiceQuotaList(
    params: InvoiceQuotaQueryParams = {}
  ): Promise<InvoiceQuotaPageResponse> {
    const queryParams = new URLSearchParams();

    if (params.page !== undefined)
      queryParams.append("page", (params.page - 1).toString());
    if (params.size !== undefined)
      queryParams.append("size", params.size.toString());
    if (params.companyNo)
      queryParams.append("companyNo", params.companyNo);
    if (params.statsDate)
      queryParams.append("statsDate", params.statsDate);

    const url = `${API_ENDPOINTS.INVOICE_QUOTA.LIST}?${queryParams.toString()}`;
    return await httpClient.get<InvoiceQuotaPageResponse>(url);
  }

  // 创建开票额度
  static async createInvoiceQuota(
    data: CreateInvoiceQuotaRequest
  ): Promise<InvoiceQuota> {
    return await httpClient.post<InvoiceQuota>(
      API_ENDPOINTS.INVOICE_QUOTA.CREATE,
      data
    );
  }

  // 更新开票额度
  static async updateInvoiceQuota(
    data: UpdateInvoiceQuotaRequest
  ): Promise<InvoiceQuota> {
    return await httpClient.put<InvoiceQuota>(
      `${API_ENDPOINTS.INVOICE_QUOTA.UPDATE}/${data.id}`,
      data
    );
  }

  // 更新开票额度（仅更新maxAmount）
  static async updateInvoiceQuotaAmount(
    data: UpdateInvoiceQuotaAmountRequest
  ): Promise<InvoiceQuota> {
    return await httpClient.put<InvoiceQuota>(
      `${API_ENDPOINTS.INVOICE_QUOTA.UPDATE_AMOUNT}/${data.id}`,
      { maxAmount: data.maxAmount }
    );
  }

  // 删除开票额度
  static async deleteInvoiceQuota(id: number): Promise<void> {
    return await httpClient.delete<void>(
      `${API_ENDPOINTS.INVOICE_QUOTA.DELETE}/${id}`
    );
  }

  // 获取开票额度详情
  static async getInvoiceQuotaDetail(id: number): Promise<InvoiceQuota> {
    return await httpClient.get<InvoiceQuota>(
      `${API_ENDPOINTS.INVOICE_QUOTA.DETAIL}/${id}`
    );
  }

  // 获取所有公司及其开票额度（左连接查询）
  static async getAllCompaniesWithQuota(
    params: CompanyQuotaQueryParams = {}
  ): Promise<InvoiceQuotaPageResponse> {
    const queryParams = new URLSearchParams();

    if (params.current !== undefined)
      queryParams.append("current", params.current.toString());
    if (params.size !== undefined)
      queryParams.append("size", params.size.toString());
    if (params.companyName)
      queryParams.append("companyName", params.companyName);

    const url = `${API_ENDPOINTS.INVOICE_QUOTA.ALL_COMPANIES}?${queryParams.toString()}`;
    return await httpClient.get<InvoiceQuotaPageResponse>(url);
  }
}