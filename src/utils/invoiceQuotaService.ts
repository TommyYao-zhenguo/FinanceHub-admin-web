import { httpClient } from "./http";
import { API_ENDPOINTS } from "../config/api";

// 开票额度接口定义
export interface InvoiceQuota {
  id: number;
  companyNo: string;
  companyName?: string;
  statsDate: string; // 统计日期，格式：YYYY-MM
  maxAmount: number;
  createTime?: string;
  updateTime?: string;
}

// 创建开票额度请求
export interface CreateInvoiceQuotaRequest {
  companyNo: string;
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
}