import { API_ENDPOINTS, buildApiUrl } from '../config/api';
import { httpClient } from './http';

// 发票类型接口定义
export interface InvoiceType {
  id: number;
  code: string;
  name: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
  sortOrder: number;
  createTime?: string;
  updateTime?: string;
  createTimeStr?: string;
  updateTimeStr?: string;
}

// 创建发票类型请求
export interface CreateInvoiceTypeRequest {
  code: string;
  name: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
  sortOrder: number;
}

// 更新发票类型请求
export interface UpdateInvoiceTypeRequest {
  id: number;
  code: string;
  name: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
  sortOrder: number;
}

// 发票类型列表响应
export interface InvoiceTypeListResponse {
  content: InvoiceType[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// 发票类型服务
export const invoiceTypeService = {
  // 获取发票类型列表（分页）
  async getInvoiceTypeList(
    current: number = 1,
    size: number = 10,
    name?: string,
    code?: string,
    status?: string
  ): Promise<InvoiceTypeListResponse> {
    const params = new URLSearchParams();
    params.append('current', current.toString());
    params.append('size', size.toString());
    if (name) params.append('name', name);
    if (code) params.append('code', code);
    if (status) params.append('status', status);

    const response = await httpClient.get(
      `${buildApiUrl(API_ENDPOINTS.INVOICE_TYPE.LIST)}?${params.toString()}`
    );
    return response as InvoiceTypeListResponse;
  },

  // 创建发票类型
  async createInvoiceType(data: CreateInvoiceTypeRequest): Promise<InvoiceType> {
    const response = await httpClient.post(
      buildApiUrl(API_ENDPOINTS.INVOICE_TYPE.CREATE),
      data as unknown as Record<string, unknown>
    );
    return response as InvoiceType;
  },

  // 更新发票类型
  async updateInvoiceType(data: UpdateInvoiceTypeRequest): Promise<InvoiceType> {
    const response = await httpClient.put(
      `${buildApiUrl(API_ENDPOINTS.INVOICE_TYPE.UPDATE)}/${data.id}`,
      data as unknown as Record<string, unknown>
    );
    return response as InvoiceType;
  },

  // 删除发票类型
  async deleteInvoiceType(id: number): Promise<void> {
    await httpClient.delete(
      `${buildApiUrl(API_ENDPOINTS.INVOICE_TYPE.DELETE)}/${id}`
    );
  },

  // 获取发票类型详情
  async getInvoiceTypeDetail(id: number): Promise<InvoiceType> {
    const response = await httpClient.get(
      `${buildApiUrl(API_ENDPOINTS.INVOICE_TYPE.DETAIL)}/${id}`
    );
    return response as InvoiceType;
  },

  // 获取所有启用的发票类型
  async getActiveInvoiceTypes(): Promise<InvoiceType[]> {
    const response = await httpClient.get(
      buildApiUrl(API_ENDPOINTS.INVOICE_TYPE.ACTIVE)
    );
    return response as InvoiceType[];
  },
};