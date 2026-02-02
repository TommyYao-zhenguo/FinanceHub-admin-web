import { httpClient } from "./http";
import { API_ENDPOINTS } from "../config/api";

export class ShuiHangService {
  /**
   * 登录税务局获取验证码
   * @param spid 企业ID
   */
  static async login(spid: string): Promise<string> {
    const formData = new FormData();
    formData.append("spid", spid);

    // Using post with FormData for @RequestParam
    // HttpClient handles FormData automatically and sets proper Content-Type
    const response = await httpClient.post<string>(
      API_ENDPOINTS.SHUIHANG.LOGIN,
      formData,
    );
    return response;
  }

  /**
   * 发送验证码
   * @param spid 企业ID
   * @param verifyCode 验证码
   */
  static async verify(spid: string, verifyCode: string): Promise<string> {
    const formData = new FormData();
    formData.append("spid", spid);
    formData.append("verifyCode", verifyCode);

    const response = await httpClient.post<string>(
      API_ENDPOINTS.SHUIHANG.VERIFY,
      formData,
    );
    return response;
  }

  /**
   * 同步全量发票
   * @param spid 企业ID
   * @param startDate 开始日期 yyyyMMdd
   * @param endDate 结束日期 yyyyMMdd
   */
  static async sync(
    spid: string,
    startDate: string,
    endDate: string,
  ): Promise<void> {
    const formData = new FormData();
    formData.append("spid", spid);
    formData.append("startDate", startDate);
    formData.append("endDate", endDate);

    await httpClient.post<void>(API_ENDPOINTS.SHUIHANG.SYNC, formData);
  }

  /**
   * 手动触发定时同步任务（一键同步所有）
   */
  static async syncAll(): Promise<string> {
    const response = await httpClient.post<string>(
      API_ENDPOINTS.SHUIHANG.SYNC_ALL,
      new FormData(), // Empty form data
    );
    return response;
  }
}
