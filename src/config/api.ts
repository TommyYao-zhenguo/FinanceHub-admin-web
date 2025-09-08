// API配置文件
interface ApiConfig {
  baseUrl: string;
  port?: number;
  timeout: number;
}

// sa-token 配置
export const SA_TOKEN_CONFIG = {
  tokenName: "token",
  tokenPrefix: "Bearer", // token前缀
};

// 根据环境变量配置API地址
const getApiConfig = (): ApiConfig => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const timeout = import.meta.env.VITE_API_TIMEOUT
    ? parseInt(import.meta.env.VITE_API_TIMEOUT)
    : 3000000;

  return {
    baseUrl,
    timeout,
  };
};

const apiConfig = getApiConfig();

// 构建完整的API基础URL
export const API_BASE_URL = apiConfig.baseUrl;

// API端点配置
export const API_ENDPOINTS = {
  // 系统用户相关接口
  SYS_USER: {
    LOGIN: "/api/v1/admin/sys/user/login/account",
    LOGOUT: "/api/v1/admin/sys/user/logout",
    INFO: "/api/v1/admin/sys/user/info",
    LIST: "/api/v1/admin/sys/user/list",
    CREATE: "/api/v1/admin/sys/user/create",
    UPDATE: "/api/v1/admin/sys/user/update",
    DELETE: "/api/v1/admin/sys/user/delete",
    CHANGE_PASSWORD: "/api/v1/admin/sys/user/changePassword",
  },

  // 客服用户相关接口
  CUSTOMER_SERVICE_USER: {
    LIST: "/api/v1/admin/customerServiceUser/list",
    CREATE: "/api/v1/admin/customerServiceUser/create",
    UPDATE: "/api/v1/admin/customerServiceUser/update",
    DELETE: "/api/v1/admin/customerServiceUser/delete",
    CHANGE_PASSWORD: "/api/v1/admin/customerServiceUser/changePassword",
  },

  // 公司相关接口
  COMPANY: {
    LIST: "/api/v1/company/list",
    CUSTOMER_SERVICE_LIST: "/api/v1/company/customer-service/list",
    CREATE: "/api/v1/company/create",
    UPDATE: "/api/v1/company/update",
    DELETE: "/api/v1/company/delete",
    DETAIL: "/api/v1/company/detail",
  },

  // 社保配置相关接口
  SOCIAL_INSURANCE_CONFIG: {
    LIST: "/api/v1/admin/social-insurance/configs/page",
    CREATE: "/api/v1/admin/social-insurance/configs",
    BATCH: "/api/v1/admin/social-insurance/configs/batch",
    UPDATE: "/api/v1/admin/social-insurance/configs",
    DELETE: "/api/v1/admin/social-insurance/configs",
  },

  // 公积金配置相关接口
  HOUSING_FUND_CONFIG: {
    LIST: "/api/v1/admin/housing-fund/configs/page",
    CREATE: "/api/v1/admin/housing-fund/configs",
    UPDATE: "/api/v1/admin/housing-fund/configs",
    DELETE: "/api/v1/admin/housing-fund/configs",
  },

  // 发票类型相关接口
  INVOICE_TYPE: {
    LIST: "/api/v1/invoice-type/page",
    CREATE: "/api/v1/invoice-type",
    UPDATE: "/api/v1/invoice-type",
    DELETE: "/api/v1/invoice-type",
    DETAIL: "/api/v1/invoice-type",
    ACTIVE: "/api/v1/invoice-type/active",
  },

  // 开票额度相关接口
  INVOICE_QUOTA: {
    LIST: "/api/v1/admin/invoice-quota/page",
    CREATE: "/api/v1/admin/invoice-quota",
    UPDATE: "/api/v1/admin/invoice-quota",
    DELETE: "/api/v1/admin/invoice-quota",
    DETAIL: "/api/v1/admin/invoice-quota",
  },
};

// 请求配置
export const REQUEST_CONFIG = {
  timeout: apiConfig.timeout,
  headers: {
    "Content-Type": "application/json",
  },
};

// 构建完整的API URL
export const buildApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};

// 导出配置信息（用于调试）
export const getConfigInfo = () => {
  return {
    baseUrl: apiConfig.baseUrl,
    port: apiConfig.port,
    fullUrl: API_BASE_URL,
    timeout: apiConfig.timeout,
    isDev: import.meta.env.DEV,
  };
};
