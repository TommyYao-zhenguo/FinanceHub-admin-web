import { httpClient } from "../utils/http";

// 附件上传响应接口
export interface AttachmentUploadResponse {
  fileId: number;
  attachmentId: string;
  fileName: string;
  fileSize: number;
  attachmentUrl: string;
  createTime: string;
}

// 附件服务
export const AttachmentService = {
  // 根据发票ID获取附件列表
  async getAttachmentsByInvoiceId(
    invoiceId: string
  ): Promise<AttachmentUploadResponse[]> {
    return await httpClient.get<AttachmentUploadResponse[]>(
      `/api/v1/invoice/attachment/invoice/${invoiceId}`
    );
  },

  // 删除附件
  async deleteAttachment(attachmentId: string): Promise<void> {
    return await httpClient.delete(
      `/api/v1/invoice/attachment/${attachmentId}`
    );
  },

  // 下载附件
  async downloadAttachment(attachmentId: number): Promise<void> {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/invoice/attachment/download/${attachmentId}`,
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
      let filename = "attachment";
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
      console.error("下载失败:", error);
      throw error;
    }
  },
};