import { httpClient } from "../utils/http";

export interface HousingFundSummary {
  totalCompanyAmount: number;
  totalPersonalAmount: number;
  totalAmount: number;
  totalAccountBalance: number;
  employeeCount: number;
  period: string;
}

export interface HousingFundEmployee {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeNo: string;
  department: string;
  position: string;
  period: string;
  fundBase: number;
  companyRate: number;
  personalRate: number;
  companyAmount: number;
  personalAmount: number;
  totalAmount: number;
  accountBalance: number;
  status: string;
  paymentDate?: string;
  remark?: string;
  createTime: string;
  updateTime: string;
  // 补充公积金相关字段
  supplementaryFundBase?: number;
  supplementaryFundRate?: number;
  supplementaryCompanyAmount?: number;
  supplementaryPersonalAmount?: number;
  supplementaryTotalAmount?: number;
  supplementaryFundAmount?: number;
}

export interface PageResponse<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

export interface PeriodOption {
  value: string;
  label: string;
}

export interface PeriodResponse {
  periods: PeriodOption[];
  currentPeriod: string;
}

export const HousingFundService = {
  /**
   * 获取住房公积金汇总信息
   */
  async getSummary(period: string = "2024-01"): Promise<HousingFundSummary> {
    return await httpClient.get(
      `/api/v1/housing-fund/summary?period=${period}`
    );
  },

  /**
   * 获取员工住房公积金明细列表
   */
  async getEmployeeList(
    period: string,
    employeeName?: string,
    current: number = 1,
    size: number = 10
  ): Promise<PageResponse<HousingFundEmployee>> {
    return await httpClient.get(
      `/api/v1/housing-fund/employees?current=${current}&size=${size}&period=${period}&employeeName=${employeeName}`
    );
  },

  /**
   * 生成住房公积金数据
   */
  async generateData(period: string = "2024-01"): Promise<void> {
    const params = {
      period,
    };
    return await httpClient.post("/api/v1/housing-fund/generate", params);
  },

  /**
   * 更新缴存状态
   */
  async updateStatus(id: string, status: string): Promise<void> {
    await httpClient.put(`/api/v1/housing-fund/${id}/status?status=${status}`);
  },

  /**
   * 获取可用的月份列表
   */
  async getAvailablePeriods(): Promise<PeriodResponse> {
    return await httpClient.get("/api/v1/housing-fund/periods");
  },

  /**
   * 分页获取公积金明细列表（按公司）
   */
  async getHousingFundListWithPage(
    companyNo: string,
    period: string,
    employeeName: string = "",
    current: number = 1,
    size: number = 10
  ): Promise<PageResponse<HousingFundEmployee>> {
    const params = new URLSearchParams({
      companyNo,
      period,
      employeeName,
      current: current.toString(),
      size: size.toString()
    });
    return await httpClient.get(`/api/v1/admin/housing-fund/page?${params}`);
  },
};