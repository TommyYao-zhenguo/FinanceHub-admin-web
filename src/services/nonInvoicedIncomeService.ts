import { httpClient } from "../../src/utils/http";

export interface NonInvoicedIncomeUploadResult {
  success: boolean;
  message: string;
}

export const NonInvoicedIncomeService = {
  // 批量上传不开票收入Excel（单次请求，List<file>）
  async uploadExcel(files: File[]): Promise<NonInvoicedIncomeUploadResult> {
    // 参考发票管理模块：使用 FormData 逐个追加同名字段 "files"
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    return await httpClient.post<NonInvoicedIncomeUploadResult>(
      "/api/v1/admin/non-invoiced-income/upload",
      formData
    );
  },
  // 下载模板（所有字段为 string），前端生成 .xls
  downloadTemplate(): void {
    const html = `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>不开票收入模板</title>
      </head>
      <body>
        <table border="1" cellspacing="0" cellpadding="4">
          <tr>
            <th>统一信用代码</th>
            <th>所属期间（YYYY-MM）</th>
            <th>金额</th>
          </tr>
          <tr>
            <td>9132XXXXXXXXXXXXX</td>
            <td>2024-12</td>
            <td>12345.67</td>
          </tr>
        </table>
      </body>
    </html>`;

    const blob = new Blob([html], {
      type: "application/vnd.ms-excel;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "不开票收入模板.xls";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};
