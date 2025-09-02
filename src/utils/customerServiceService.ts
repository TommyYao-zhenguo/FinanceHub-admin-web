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

// 客服回执附件接口类型定义
export interface CustomerServiceAttachment {
  id: number;
  customerServiceTaskId: number;
  fileName: string;
  originalFileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  attachmentType: string;
  uploaderId: number;
  uploaderName: string;
  remark?: string;
  createTime: string;
  updateTime: string;
}

export interface CustomerServiceAttachmentCreateRequest {
  customerServiceTaskId: number;
  fileName: string;
  originalFileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  attachmentType: string;
  uploaderId: number;
  uploaderName: string;
  ossFileId: string;
  remark?: string;
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
    if (params.taskType) queryParams.append("taskType", params.taskType);
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

  // 附件相关API
  // 上传附件到OSS
  static async uploadFileToOSS(file: File): Promise<{
    fileId: string;
    fileName: string;
    fileSize: number;
    fileUrl: string;
  }> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await httpClient.post<{
      success: boolean;
      fileId: string;
      fileName: string;
      fileSize: number;
      fileUrl: string;
      message: string;
    }>("/api/v1/oss/upload", formData);

    if (!response.success) {
      throw new Error(response.message || "文件上传失败");
    }

    return {
      fileId: response.fileId,
      fileName: response.fileName,
      fileSize: response.fileSize,
      fileUrl: response.fileUrl,
    };
  }

  // 上传附件（直接调用后端的upload端点）
  static async uploadAttachment(
    file: File,
    customerServiceTaskId: number,
    attachmentType: string = "RECEIPT",
    remark?: string
  ): Promise<CustomerServiceAttachment> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("customerServiceTaskId", customerServiceTaskId.toString());
    formData.append("attachmentType", attachmentType);
    if (remark) {
      formData.append("remark", remark);
    }

    const response = await httpClient.post<CustomerServiceAttachment>(
      "/api/v1/admin/customer-service/attachments/upload",
      formData
    );
    return response;
  }

  // 批量创建附件
  static async createAttachments(
    attachments: CustomerServiceAttachmentCreateRequest[]
  ): Promise<CustomerServiceAttachment[]> {
    const response = await httpClient.post<CustomerServiceAttachment[]>(
      "/api/v1/admin/customer-service/attachments/batch",
      attachments
    );
    return response;
  }

  // 根据客服请求ID查询附件列表
  static async getAttachmentsByTaskId(
    customerServiceTaskId: number
  ): Promise<CustomerServiceAttachment[]> {
    const response = await httpClient.get<CustomerServiceAttachment[]>(
      `/api/v1/admin/customer-service/attachments/task/${customerServiceTaskId}`
    );
    return response;
  }

  // 根据ID查询附件详情
  static async getAttachmentById(
    id: number
  ): Promise<CustomerServiceAttachment> {
    const response = await httpClient.get<CustomerServiceAttachment>(
      `/api/v1/admin/customer-service/attachments/${id}`
    );
    return response;
  }

  // 删除附件
  static async deleteAttachment(id: number): Promise<void> {
    await httpClient.delete(`/api/v1/admin/customer-service/attachments/${id}`);
  }

  // 根据客服请求ID删除所有附件
  static async deleteAttachmentsByTaskId(
    customerServiceTaskId: number
  ): Promise<void> {
    await httpClient.delete(
      `/api/v1/admin/customer-service/attachments/task/${customerServiceTaskId}`
    );
  }

  // 批量删除附件
  static async deleteAttachments(ids: number[]): Promise<void> {
    await httpClient.post(
      "/api/v1/admin/customer-service/attachments/batch-delete",
      { ids }
    );
  }
}
