export interface EmployeeImportData {
  companyName: string;
  companyCreditCode: string;
  employeeName: string;
  idCard: string;
  hireDate: string;
  phone: string;
  basicSalary: number;
  socialInsurance: boolean;
  housingFund: boolean;
  remarks?: string;
}

export interface ImportResult {
  success: boolean;
  total: number;
  successCount: number;
  failureCount: number;
  errorDetails?: string[];
}

export const EmployeeImportService = {
  // 下载导入模板
  async downloadTemplate(): Promise<void> {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/employee/import/template`,
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
      let filename = "员工导入模板.xlsx";
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
  },

  // 导入员工信息
  async importEmployees(file: File): Promise<ImportResult> {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/employee/import`,
        {
          method: "POST",
          headers: {
            token: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`导入失败: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("导入员工信息失败:", error);
      throw error;
    }
  },

  // 验证员工数据（可选，用于前端预校验）
  validateEmployeeData(data: EmployeeImportData[]): string[] {
    const errors: string[] = [];

    data.forEach((employee, index) => {
      const row = index + 2; // Excel行号（从第2行开始）

      // 验证必填字段
      if (!employee.companyName?.trim()) {
        errors.push(`第${row}行：公司名称不能为空`);
      }
      if (!employee.companyCreditCode?.trim()) {
        errors.push(`第${row}行：公司统一信用代码不能为空`);
      }
      if (!employee.employeeName?.trim()) {
        errors.push(`第${row}行：员工姓名不能为空`);
      }
      if (!employee.idCard?.trim()) {
        errors.push(`第${row}行：身份证号不能为空`);
      } else if (!/^\d{18}$/.test(employee.idCard.trim())) {
        errors.push(`第${row}行：身份证号格式不正确`);
      }
      if (!employee.hireDate?.trim()) {
        errors.push(`第${row}行：入职时间不能为空`);
      } else if (!/^\d{4}-\d{2}-\d{2}$/.test(employee.hireDate.trim())) {
        errors.push(`第${row}行：入职时间格式不正确，请使用YYYY-MM-DD格式`);
      }
      if (!employee.phone?.trim()) {
        errors.push(`第${row}行：手机号不能为空`);
      } else if (!/^1[3-9]\d{9}$/.test(employee.phone.trim())) {
        errors.push(`第${row}行：手机号格式不正确`);
      }
      if (!employee.basicSalary || employee.basicSalary <= 0) {
        errors.push(`第${row}行：基本工资必须大于0`);
      }

      // 验证统一信用代码格式（18位）
      if (
        employee.companyCreditCode?.trim() &&
        !/^[0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}$/.test(
          employee.companyCreditCode.trim()
        )
      ) {
        errors.push(`第${row}行：公司统一信用代码格式不正确`);
      }
    });

    return errors;
  },
};
