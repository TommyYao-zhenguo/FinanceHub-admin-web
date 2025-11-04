import { httpClient } from "../utils/http";

// 发票管理相关接口类型定义
export interface InvoiceFileUploadRequest {
  files: File[];
  invoiceType: "issued" | "received";
}

export interface InvoiceFileUploadResponse {
  fileId: string;
  fileName: string;
  originalFileName: string;
  fileSize: number;
  filePath: string;
  invoiceType: string;
  status: "uploading" | "processing" | "success" | "error";
  uploadTime: string;
  userId?: number;
  processedCount?: number;
  totalCount?: number;
  errorMessage?: string;
}

export interface InvoiceFileValidationResult {
  valid: boolean;
  sheetNames?: string[];
  hasMultipleSheets?: boolean;
  hasSummarySheet?: boolean;
  errorMessage?: string;
}

export interface InvoiceFileListResponse {
  files: InvoiceFileUploadResponse[];
  totalCount: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface InvoiceFileDeleteRequest {
  fileIds: string[];
  userId?: number;
}

export interface InvoiceFileProcessRequest {
  fileIds: string[];
  userId?: number;
  processType: "validate" | "process";
}

export interface InvoiceFileProcessResponse {
  processId: string;
  status: "processing" | "completed" | "error";
  totalFiles: number;
  processedFiles: number;
  successCount: number;
  errorCount: number;
  startTime: string;
}

export interface InvoiceStatistics {
  totalFiles: number;
  successFiles: number;
  errorFiles: number;
  processingFiles: number;
  totalInvoices: number;
  totalAmount: number;
}

// 发票明细相关接口类型定义
export interface InvoiceReceiptResponse {
  id: string;
  invoiceCode: string;
  invoiceNumber: string;
  digitalInvoiceNumber: string;
  sellerTaxNumber: string;
  sellerName: string;
  buyerTaxNumber: string;
  buyerName: string;
  invoiceDate: string;
  taxClassificationCode: string;
  specificBusinessType: string;
  goodsOrServiceName: string;
  specification: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  invoiceSource: string;
  invoiceType: string;
  invoiceStatus: string;
  isPositiveInvoice: boolean;
  riskLevel: string;
  issuer: string;
  remark: string;
  uploaderNo: string;
}

// 开具发票相关接口类型定义
export interface InvoiceIssueResponse {
  id?: string;
  sequenceNumber?: string;
  invoiceCode?: string;
  invoiceNumber?: string;
  digitalInvoiceNumber?: string;
  sellerTaxNumber?: string;
  sellerName?: string;
  buyerTaxNumber?: string;
  buyerName?: string;
  invoiceDate?: string;
  taxClassificationCode?: string;
  specificBusinessType?: string;
  goodsOrServiceName?: string;
  specification?: string;
  unit?: string;
  quantity?: number;
  unitPrice?: number;
  amount?: number;
  taxRate?: number;
  taxAmount?: number;
  totalAmount?: number;
  invoiceSource?: string;
  invoiceType?: string;
  invoiceStatus?: string;
  isPositiveInvoice?: boolean;
  riskLevel?: string;
  issuer?: string;
  remark?: string;
  uploaderNo?: string;
  companyNo?: string;
  createTime?: string;
  updateTime?: string;
}

export interface InvoiceIssuePageResponse {
  records: InvoiceIssueResponse[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

export interface InvoiceReceiptPageResponse {
  records: InvoiceReceiptResponse[];
  total: number;
  current: number;
  size: number;
  pages: number;
}

// 上传记录响应（取得发票）
export interface InvoiceReceiptRecordResponse {
  id: string;
  buyerTaxNumber: string;
  success: boolean;
  failureReason?: string;
  createTime: string;
}

export interface InvoiceReceiptRecordPageResponse {
  records: InvoiceReceiptRecordResponse[];
  total: number;
  current: number;
  size: number;
  pages: number;
}

// 上传记录响应（开具发票）
export interface InvoiceIssueUploadRecordResponse {
  id: string;
  sellerTaxNumber: string;
  success: boolean;
  failureReason?: string;
  createTime: string;
}

export interface InvoiceIssueUploadRecordPageResponse {
  records: InvoiceIssueUploadRecordResponse[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

/**
 * 发票管理服务类
 */
export class InvoiceManagementService {
  /**
   * 上传发票文件
   */
  static async uploadInvoiceFile(
    request: InvoiceFileUploadRequest
  ): Promise<InvoiceFileUploadResponse> {
    const formData = new FormData();

    // 添加多个文件到FormData
    request.files.forEach((file) => {
      formData.append("files", file);
    });

    formData.append("invoiceType", request.invoiceType);

    const response = await httpClient.post<InvoiceFileUploadResponse>(
      "/api/v1/admin/invoice-management/upload",
      formData
    );
    return response;
  }

  /**
   * 下载发票模板
   */
  static async downloadInvoiceTemplate(
    invoiceType: "issued" | "received"
  ): Promise<void> {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/api/admin/invoice-management/template?invoiceType=${invoiceType}`,
        {
          method: "GET",
          headers: {
            token: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`下载失败: ${response.status}`);
      }

      // 获取文件名
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = `${invoiceType}_invoice_template.xlsx`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(
          /filename[^;=\n]*=(['"]?)([^'"\n]*?)\1/
        );
        if (filenameMatch && filenameMatch[2]) {
          filename = decodeURIComponent(filenameMatch[2]);
        }
      }

      // 处理blob数据流
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // 创建下载链接
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      // 清理
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("下载模板失败:", error);
      throw error;
    }
  }

  /**
   * 获取发票明细列表（分页）
   */
  static async getInvoiceReceiptList(
    current: number = 1,
    size: number = 10
  ): Promise<InvoiceReceiptRecordPageResponse> {
    const response = await httpClient.get<InvoiceReceiptRecordPageResponse>(
      `/api/v1/admin/invoice-management/receipt/list/record?current=${current}&size=${size}`
    );
    return response;
  }

  /**
   * 获取发票明细列表（分页）
   */
  static async getInvoiceIssueList(
    current: number = 1,
    size: number = 10
  ): Promise<InvoiceIssueUploadRecordPageResponse> {
    const response = await httpClient.get<InvoiceIssueUploadRecordPageResponse>(
      `/api/v1/admin/invoice-management/issue/list/record?current=${current}&size=${size}`
    );
    return response;
  }
}
