import { API_BASE_URL, REQUEST_CONFIG, SA_TOKEN_CONFIG } from "../config/api";
import toast from "react-hot-toast";

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  showErrorAlert?: boolean; // 是否显示错误弹窗
}

class HttpClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private timeout: number;

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.defaultHeaders = REQUEST_CONFIG.headers;
    this.timeout = REQUEST_CONFIG.timeout;
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const {
      method = "GET",
      headers = {},
      body,
      timeout = this.timeout,
      showErrorAlert = true, // 默认显示错误提示
    } = options;

    const url = `${this.baseUrl}${endpoint}`;

    // 合并默认headers和自定义headers
    const mergedHeaders = {
      ...this.defaultHeaders,
      "X-Requested-With": "XMLHttpRequest",
      Accept: "application/json, text/plain, */*",
      ...headers,
    };

    // 添加认证token（如果存在）
    const token = localStorage.getItem(SA_TOKEN_CONFIG.tokenName);
    if (token) {
      mergedHeaders["token"] = `${SA_TOKEN_CONFIG.tokenPrefix} ${token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: mergedHeaders,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        // 检查响应是否有内容
        const contentType = response.headers.get("content-type");
        const contentLength = response.headers.get("content-length");

        // 如果没有内容或内容长度为0，返回空对象
        if (
          contentLength === "0" ||
          !contentType?.includes("application/json")
        ) {
          return {} as T;
        }

        // 尝试获取响应文本
        const text = await response.text();

        if (!text.trim()) {
          return {} as T;
        }

        try {
          const parsed = JSON.parse(text) as T;
          return parsed;
        } catch (parseError) {
          console.warn("Failed to parse JSON response:", text);
          return {} as T;
        }
      }

      if (!response.ok) {
        console.error("HTTP请求失败，状态码:", response.status);
        const errorData = await response.json().catch(() => ({}));
        console.error("错误响应数据:", errorData);
        const errorMessage =
          errorData.message || `HTTP Error: ${response.status}`;

        // 根据状态码处理不同错误
        if (response.status === 401) {
          // 未授权，清除token并跳转到登录页
          localStorage.removeItem(SA_TOKEN_CONFIG.tokenName);
          // todo window.location.href = "/login";
        }

        if (response.status === 403) {
          // 403错误：访问被拒绝
          const forbiddenMessage = "访问被拒绝，请检查您的权限或联系管理员";

          if (showErrorAlert) {
            toast.error(forbiddenMessage, {
              duration: 2000,
              position: "top-center",
              style: {
                background: "#fee2e2",
                color: "#dc2626",
                border: "1px solid #fecaca",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "500",
                maxWidth: "500px",
              },
            });
          }

          throw new Error(forbiddenMessage);
        }

        if (response.status === 400) {
          // 400错误：显示后端返回的具体错误信息
          const businessErrorMessage =
            errorData.message || errorData.detail || "请求参数错误";

          if (showErrorAlert) {
            // 使用 toast 在页面顶部显示错误提示
            toast.error(businessErrorMessage, {
              duration: 2000,
              position: "top-center",
              style: {
                background: "#fee2e2",
                color: "#dc2626",
                border: "1px solid #fecaca",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "500",
                maxWidth: "500px",
              },
            });
          }

          throw new Error(businessErrorMessage);
        }

        // 其他错误状态码的处理
        if (showErrorAlert && response.status >= 500) {
          toast.error("服务器内部错误，请稍后重试", {
            duration: 4000,
            position: "top-center",
          });
        }

        throw new Error(errorMessage);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          const timeoutMessage = "请求超时，请稍后重试";
          if (showErrorAlert) {
            toast.error(timeoutMessage, {
              duration: 4000,
              position: "top-center",
            });
          }
          throw new Error(timeoutMessage);
        }
        throw error;
      }

      const networkErrorMessage = "网络请求失败";
      if (showErrorAlert) {
        toast.error(networkErrorMessage, {
          duration: 4000,
          position: "top-center",
        });
      }
      throw new Error(networkErrorMessage);
    }
  }

  async get<T>(
    endpoint: string,
    headers?: Record<string, string>,
    showErrorAlert?: boolean
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: "GET",
      headers,
      showErrorAlert,
    });
  }

  async post<T>(
    endpoint: string,
    body?: any,
    headers?: Record<string, string>,
    showErrorAlert?: boolean
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body,
      headers,
      showErrorAlert,
    });
  }

  async put<T>(
    endpoint: string,
    body?: any,
    headers?: Record<string, string>,
    showErrorAlert?: boolean
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body,
      headers,
      showErrorAlert,
    });
  }

  async delete<T>(
    endpoint: string,
    headers?: Record<string, string>,
    showErrorAlert?: boolean
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: "DELETE",
      headers,
      showErrorAlert,
    });
  }
}

export const httpClient = new HttpClient();
export default httpClient;
