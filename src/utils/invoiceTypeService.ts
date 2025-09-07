import { API_ENDPOINTS } from '../config/api';
import { httpClient } from './http';

// 发票类型接口定义
export interface InvoiceType {
  id: number;
  companyNo: string;
  name: string;
  description?: string;
  createTime?: string;
  updateTime?: string;
  createTimeStr?: string;
  updateTimeStr?: string;
}

// 创建发票类型请求
export interface CreateInvoiceTypeRequest {
  companyNo: string;
  name: string;
  description?: string;
}

// 更新发票类型请求
export interface UpdateInvoiceTypeRequest {
  id: number;
  companyNo: string;
  name: string;
  description?: string;
}

// 发票类型列表响应
export interface InvoiceTypePageResponse {
  content: InvoiceType[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// 发票类型服务
export const InvoiceTypeService = {
  // 获取发票类型列表（分页）
  async getInvoiceTypeList(
    current: number = 1,
    size: number = 10,
    name?: string,
    status?: string,
    companyNo?: string
  ): Promise<InvoiceTypePageResponse> {
    const params = new URLSearchParams();
    params.append('current', current.toString());
    params.append('size', size.toString());
    if (name) params.append('name', name);
    if (status) params.append('status', status);
    if (companyNo) params.append('companyNo', companyNo);

    const response = await httpClient.get(
      `${API_ENDPOINTS.INVOICE_TYPE.LIST}?${params.toString()}`
    );
    return response as InvoiceTypePageResponse;
  },

  // 创建发票类型
  async createInvoiceType(data: CreateInvoiceTypeRequest): Promise<InvoiceType> {
    const response = await httpClient.post(
      API_ENDPOINTS.INVOICE_TYPE.CREATE,
      data as unknown as Record<string, unknown>
    );
    return response as InvoiceType;
  },

  // 更新发票类型
  async updateInvoiceType(data: UpdateInvoiceTypeRequest): Promise<InvoiceType> {
    const response = await httpClient.put(
      `${API_ENDPOINTS.INVOICE_TYPE.UPDATE}/${data.id}`,
      data as unknown as Record<string, unknown>
    );
    return response as InvoiceType;
  },

  // 删除发票类型
  async deleteInvoiceType(id: number, companyNo: string): Promise<void> {
    await httpClient.delete(
      `${API_ENDPOINTS.INVOICE_TYPE.DELETE}/${companyNo}/${id}`
    );
  },

  // 获取发票类型详情
  async getInvoiceTypeDetail(id: number): Promise<InvoiceType> {
    const response = await httpClient.get(
      `${API_ENDPOINTS.INVOICE_TYPE.DETAIL}/${id}`
    );
    return response as InvoiceType;
  },

  // 获取所有启用的发票类型
  async getActiveInvoiceTypes(): Promise<InvoiceType[]> {
    const response = await httpClient.get(
      API_ENDPOINTS.INVOICE_TYPE.ACTIVE
    );
    return response as InvoiceType[];
  },
};