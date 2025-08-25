import { httpClient } from "./http";

// 客服请求接口类型定义
export interface CustomerServiceRequest {
  id: number;
  requestNumber: string;
  companyId: number;
  companyName: string;
  customerName: string;
  taskType: string;
  requestTitle: string;
  requestContent: string;
  status: string;
  assignedTo?: number;
  assignedName?: string;
  processRemark?: string;
  completionTime?: string;
  processingTime?: string;
  createTime: string;
  updateTime: string;
}

export interface CustomerServiceCreateRequest {
  companyId: number;
  companyName: string;
  customerName: string;
  taskType: string;
  requestTitle: string;
  requestContent: string;
}

export interface CustomerServiceQueryParams {
  page?: number;
  size?: number;
  taskType?: string;
  status?: string;
  keyword?: string;
  startTime?: string;
  endTime?: string;
  assignedTo?: number;
}

export interface CustomerServiceListResponse {
  records: CustomerServiceRequest[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

export interface CustomerServiceStatistics {
  COMPLETED: number;
  PENDING: number;
  PROCESSING: number;
  urgentRequests: number;
  highPriorityRequests: number;
  requestsByType: Record<string, number>;
  requestsByStatus: Record<string, number>;
  requestsByPriority: Record<string, number>;
}

export class CustomerServiceService {
  // 创建客服请求
  static async createRequest(
    data: CustomerServiceCreateRequest
  ): Promise<CustomerServiceRequest> {
    const response = await httpClient.post<CustomerServiceRequest>(
      "/api/v1/admin/customer-service/requests",
      data
    );
    return response;
  }

  // 获取客服请求详情
  static async getRequest(id: number): Promise<CustomerServiceRequest> {
    const response = await httpClient.get<CustomerServiceRequest>(
      `/api/v1/admin/customer-service/requests/${id}`
    );
    return response;
  }

  // 分页查询客服请求
  static async queryRequests(
    params: CustomerServiceQueryParams = {}
  ): Promise<CustomerServiceListResponse> {
    const queryParams = new URLSearchParams();

    if (params.page !== undefined)
      queryParams.append("current", params.page.toString());
    if (params.size !== undefined)
      queryParams.append("size", params.size.toString());
    if (params.requestType)
      queryParams.append("requestType", params.requestType);
    if (params.status) queryParams.append("status", params.status);
    if (params.keyword) queryParams.append("keyword", params.keyword);
    if (params.startTime) queryParams.append("startTime", params.startTime);
    if (params.endTime) queryParams.append("endTime", params.endTime);

    const url = `/api/v1/admin/customer-service/requests?${queryParams.toString()}`;
    const response = await httpClient.get<CustomerServiceListResponse>(url);
    return response;
  }

  // 更新客服请求
  static async updateRequest(
    id: number,
    data: Partial<CustomerServiceRequest>
  ): Promise<CustomerServiceRequest> {
    const response = await httpClient.put<CustomerServiceRequest>(
      `/api/v1/admin/customer-service/requests/${id}`,
      data
    );
    return response;
  }

  // 获取统计信息
  static async getStatistics(): Promise<CustomerServiceStatistics> {
    const response = await httpClient.get<CustomerServiceStatistics>(
      "/api/v1/admin/customer-service/statistics"
    );
    return response;
  }

  // 批量更新状态
  static async batchUpdateStatus(ids: number[], status: string): Promise<void> {
    await httpClient.post(
      "/api/v1/admin/customer-service/requests/batch-status",
      {
        ids,
        status,
      }
    );
  }

  // 分配客服人员
  static async assignRequest(id: number, assignedTo: number): Promise<void> {
    await httpClient.post(
      `/api/v1/admin/customer-service/requests/${id}/assign`,
      {
        assignedTo,
      }
    );
  }
}
