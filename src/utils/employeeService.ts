import { httpClient } from "./http";

// 月度工资确认响应接口
export interface EmployeeSalaryConfirmedResponse {
  employeeNo: string;
  employeeName: string;
  basicSalary: number;
  confirmSalary: number;
  idCard: string;
  socialSecurityFee: number;
  housingFundFee: number;
  personalTax: number;
  netSalary: number;
  overtimePay: number;
  bonus: number;
  allowance: number;
  deduction: number;
}

export class EmployeeService {
  // 月度工资确认
  static async confirmMonthlySalary(period: string): Promise<void> {
    await httpClient.post<void>(`/api/v1/employee/salary/confirm`, {
      period,
    });
  }

  // 获取确认后的月度工资
  static async getConfirmedSalary(
    statsDate: string,
    companyNo: string
  ): Promise<EmployeeSalaryConfirmedResponse[]> {
    const response = await httpClient.get<EmployeeSalaryConfirmedResponse[]>(
      `/api/v1/employee/salary/confirmed?statsDate=${statsDate}&companyNo=${companyNo}`
    );
    return response;
  }
}
