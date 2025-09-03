import { httpClient } from "../utils/http";

// 税费上传记录接口
export interface TaxUploadRecord {
  period: string;
  companyNo: string;
  companyName: string;
  creditCode: string;
  taxType: string;
  taxName: string;
  amount: number;
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

  // 获取税费上传记录列表（分页）
  async getUploadRecords(
    period: string,
    page: number = 1,
    size: number = 10,
    companyName?: string
  ): Promise<{
    records: TaxUploadRecord[];
    total: number;
    current: number;
    size: number;
    pages: number;
  }> {
    const params = new URLSearchParams({
      period,
      page: page.toString(),
      size: size.toString()
    });
    
    if (companyName) {
      params.append('companyName', companyName);
    }
    
    return await httpClient.get(
      `/api/v1/admin/tax/upload/records?${params.toString()}`
    );
  },
};
