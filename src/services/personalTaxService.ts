import { httpClient } from "../utils/http";

// 个税上传记录接口
export interface PersonalTaxUploadRecord {
  period: string;
  companyNo: string;
  companyName: string;
  creditCode: string;
  taxType: string;
  taxName: string;
  amount: number;
}

// 个税上传响应接口
export interface PersonalTaxUploadResponse {
  success: boolean;
  message: string;
}

// 个税服务
export const PersonalTaxService = {
  // 上传个税文件
  async uploadPersonalTaxFile(file: File, period: string): Promise<PersonalTaxUploadResponse> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("period", period);

    return await httpClient.post<PersonalTaxUploadResponse>(
      "/api/v1/admin/personal-tax/upload",
      formData
    );
  },

  // 获取个税上传记录列表（分页）
  async getUploadRecords(
    period: string,
    page: number = 1,
    size: number = 10,
    companyName?: string
  ): Promise<{
    records: PersonalTaxUploadRecord[];
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
      `/api/v1/admin/personal-tax/upload/records?${params.toString()}`
    );
  },
};