import { httpClient } from "../utils/http";

// 税费上传记录接口
export interface TaxUploadRecord {
  id: number;
  companyNo: string;
  companyName: string;
  creditCode: string;
  period: string;
  taxType: string;
  taxName: string;
  amount: number;
  status: string;
  createTime: string;
  updateTime: string;
}

// 税费上传响应接口
export interface TaxUploadResponse {
  success: boolean;
  message: string;
}

// 税费服务
export const TaxService = {
  // 上传税费文件
  async uploadTaxFile(file: File, period: string): Promise<TaxUploadResponse> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("period", period);

    return await httpClient.post<TaxUploadResponse>(
      "/api/v1/admin/tax/upload",
      formData
    );
  },

  // 获取税费上传记录列表
  async getUploadRecords(period: string): Promise<TaxUploadRecord[]> {
    return await httpClient.get<TaxUploadRecord[]>(
      `/api/v1/admin/tax/upload/records?period=${period}`
    );
  },
};
