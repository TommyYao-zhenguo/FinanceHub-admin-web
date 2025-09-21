import * as XLSX from "xlsx";

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
  // 下载导入模板（使用XLSX库生成真正的Excel文件）
  async downloadTemplate(): Promise<void> {
    try {
      // 创建Excel模板数据
      const templateData = [
        [
          "公司名称",
          "公司统一信用代码",
          "员工姓名",
          "身份证号",
          "入职时间",
          "手机号",
          "基本工资",
          "是否缴纳社保",
          "是否缴纳公积金",
          "备注",
        ],
        [
          "启苑科技有限公司",
          "91110000123456789X",
          "张三",
          "110101199001011234",
          "2024-01-15",
          "13800138000",
          "8000",
          "是",
          "是",
          "示例数据，请删除此行",
        ],
        [
          "启苑科技有限公司",
          "91110000123456789X",
          "李四",
          "110101199002022345",
          "2024-02-01",
          "13900139000",
          "9000",
          "否",
          "是",
          "兼职员工",
        ],
      ];

      // 创建工作簿
      const ws = XLSX.utils.aoa_to_sheet(templateData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "员工导入模板的的");

      // 设置列宽
      ws["!cols"] = [
        { wch: 20 }, // 公司名称
        { wch: 25 }, // 公司统一信用代码
        { wch: 15 }, // 员工姓名
        { wch: 20 }, // 身份证号
        { wch: 15 }, // 入职时间
        { wch: 15 }, // 手机号
        { wch: 15 }, // 基本工资
        { wch: 18 }, // 是否缴纳社保
        { wch: 18 }, // 是否缴纳公积金
        { wch: 20 }, // 备注
      ];

      // 下载文件
      XLSX.writeFile(wb, "员工导入模板的.xlsx");
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
