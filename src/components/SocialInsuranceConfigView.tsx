import React, { useState, useEffect } from "react";
import {
  Shield,
  Save,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { SocialInsuranceConfigService } from "../utils/socialInsuranceConfigService";
import type { SocialInsuranceDetailConfig } from "../types/socialInsuranceConfig";
import {
  SocialInsuranceConfig,
} from "../types/socialInsuranceConfig";
import CompanySelector from "./CompanySelector";

// 定义公司配置数据类型
interface CompanyConfigData {
  companyNo: string;
  companyName: string;
  taxNumber?: string;
  configs: SocialInsuranceDetailConfig[];
}

// 保险类型配置
const INSURANCE_TYPES = [
  { value: "pension", label: "养老保险", color: "bg-blue-500" },
  { value: "medical", label: "医疗保险", color: "bg-green-500" },
  { value: "unemployment", label: "失业保险", color: "bg-yellow-500" },
  { value: "injury", label: "工伤保险", color: "bg-red-500" },
  { value: "maternity", label: "生育保险", color: "bg-purple-500" },
];

export default function SocialInsuranceConfigView() {
  const [configuredData, setConfiguredData] = useState<CompanyConfigData[]>([]);
  const [unconfiguredData, setUnconfiguredData] = useState<CompanyConfigData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchCompanyName, setSearchCompanyName] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [editingConfig, setEditingConfig] =
    useState<SocialInsuranceConfig | null>(null);
  const [activeTab, setActiveTab] = useState<'configured' | 'unconfigured'>('configured');

  // 已配置公司的分页状态
  const [configuredPagination, setConfiguredPagination] = useState({
    current: 1,
    size: 10,
    total: 0,
    pages: 0,
  });

  // 未配置公司的分页状态
  const [unconfiguredPagination, setUnconfiguredPagination] = useState({
    current: 1,
    size: 10,
    total: 0,
    pages: 0,
  });

  // 新的批量配置表单数据
  const [batchFormData, setBatchFormData] = useState({
    companyNo: "",
    companyName: "",
    configs: {
      pension: { personalRate: 8, companyRate: 16 },
      medical: { personalRate: 2, companyRate: 8 },
      unemployment: { personalRate: 0.5, companyRate: 0.5 },
      injury: { personalRate: 0, companyRate: 0.2 },
      maternity: { personalRate: 0, companyRate: 0.8 },
    },
  });

  useEffect(() => {
    loadAllData();
  }, []);

  // 当分页改变时重新加载数据
  useEffect(() => {
    if (configuredPagination.current > 1 || unconfiguredPagination.current > 1) {
      loadAllData(searchCompanyName || undefined, configuredPagination.current, unconfiguredPagination.current);
    }
  }, [configuredPagination.current, unconfiguredPagination.current]);

  const handleSearch = () => {
    setConfiguredPagination((prev) => ({ ...prev, current: 1 }));
    setUnconfiguredPagination((prev) => ({ ...prev, current: 1 }));
    loadAllData(searchCompanyName || undefined, 1, 1);
  };

  // 当切换tab时不需要重新加载数据，因为数据已经在前端分离了

  const fetchCompanyConfigs = async (companyNo: string) => {
    try {
      const configs = await SocialInsuranceConfigService.getCompanyConfigs(
        companyNo
      );
      // 将现有配置填充到表单中
      const updatedBatchFormData = { ...batchFormData };
      configs.forEach((config: SocialInsuranceConfig) => {
        const insuranceType = config.insuranceType;
        if (
          updatedBatchFormData.configs[
          insuranceType as keyof typeof updatedBatchFormData.configs
          ]
        ) {
          updatedBatchFormData.configs[
            insuranceType as keyof typeof updatedBatchFormData.configs
          ].personalRate = config.personalRate * 100; // 转换为百分比
          updatedBatchFormData.configs[
            insuranceType as keyof typeof updatedBatchFormData.configs
          ].companyRate = config.companyRate * 100; // 转换为百分比
        }
      });
      setBatchFormData(updatedBatchFormData);
    } catch (error) {
      console.error("获取公司配置失败:", error);
    }
  };

  // 加载所有数据并分离已配置和未配置
  const loadAllData = async (companyName?: string, configuredPage?: number, unconfiguredPage?: number) => {
    try {
      setLoading(true);
      
      // 获取足够大的页面来包含所有数据，然后在前端分离
      const params = {
        current: 1,
        size: 1000, // 获取大量数据
        ...(companyName && { companyName }),
      };
      const response = await SocialInsuranceConfigService.getConfigList(params);
      console.log("all social insurance configs: ", response);

      // 转换数据格式：将 SocialInsuranceConfig[] 转换为 CompanyConfigData[]
      const transformedRecords: CompanyConfigData[] = response.records.map(
        (config: SocialInsuranceConfig) => ({
          companyNo: config.companyNo || "",
          companyName: config.companyName || "",
          taxNumber: config.taxNumber || "",
          configs: config.configs || [],
        })
      );

      // 分离已配置和未配置的公司
      const configured = transformedRecords.filter(company => 
        company.configs && company.configs.length > 0
      );
      const unconfigured = transformedRecords.filter(company => 
        !company.configs || company.configs.length === 0
      );

      // 实现前端分页
      const configuredCurrentPage = configuredPage || configuredPagination.current;
      const unconfiguredCurrentPage = unconfiguredPage || unconfiguredPagination.current;
      
      const configuredStartIndex = (configuredCurrentPage - 1) * configuredPagination.size;
      const configuredEndIndex = configuredStartIndex + configuredPagination.size;
      const configuredPageData = configured.slice(configuredStartIndex, configuredEndIndex);
      
      const unconfiguredStartIndex = (unconfiguredCurrentPage - 1) * unconfiguredPagination.size;
      const unconfiguredEndIndex = unconfiguredStartIndex + unconfiguredPagination.size;
      const unconfiguredPageData = unconfigured.slice(unconfiguredStartIndex, unconfiguredEndIndex);

      setConfiguredData(configuredPageData);
      setConfiguredPagination((prev) => ({
        ...prev,
        current: configuredCurrentPage,
        total: configured.length,
        pages: Math.ceil(configured.length / prev.size),
      }));

      setUnconfiguredData(unconfiguredPageData);
      setUnconfiguredPagination((prev) => ({
        ...prev,
        current: unconfiguredCurrentPage,
        total: unconfigured.length,
        pages: Math.ceil(unconfigured.length / prev.size),
      }));
    } catch {
      toast.error("加载社保配置数据失败");
    } finally {
      setLoading(false);
    }
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!batchFormData.companyNo) {
      toast.error("请选择公司");
      return;
    }

    try {
      setLoading(true);

      // 构建批量配置数据
      const configs = Object.entries(batchFormData.configs).map(
        ([type, rates]) => ({
          insuranceType: type,
          insuranceName: getInsuranceNameByType(type),
          companyRate: rates.companyRate,
          personalRate: rates.personalRate,
          isActive: true,
        })
      );

      const batchRequest = {
        companyNo: batchFormData.companyNo,
        configs,
      };

      await SocialInsuranceConfigService.batchConfigRates(batchRequest);
      toast.success("配置保存成功");

      setShowForm(false);
      setEditingConfig(null);
      resetForm();
      // 重新加载数据
      loadAllData(searchCompanyName || undefined, configuredPagination.current, unconfiguredPagination.current);
    } catch {
      toast.error("配置保存失败");
    } finally {
      setLoading(false);
    }
  };

  // 根据险种类型获取险种名称
  const getInsuranceNameByType = (type: string): string => {
    const typeMap: Record<string, string> = {
      pension: "养老保险",
      medical: "医疗保险",
      unemployment: "失业保险",
      injury: "工伤保险",
      maternity: "生育保险",
    };
    return typeMap[type] || type;
  };

  // 计算合计比例
  const calculateTotal = (
    personalRate: number,
    companyRate: number
  ): string => {
    return (personalRate + companyRate).toFixed(1);
  };

  // 更新险种比例
  const updateInsuranceRate = (
    insuranceType: string,
    field: "personalRate" | "companyRate",
    value: number
  ) => {
    setBatchFormData((prev) => ({
      ...prev,
      configs: {
        ...prev.configs,
        [insuranceType]: {
          ...prev.configs[insuranceType as keyof typeof prev.configs],
          [field]: value,
        },
      },
    }));
  };

  const resetForm = () => {
    setBatchFormData({
      companyNo: "",
      companyName: "",
      configs: {
        pension: { personalRate: 8, companyRate: 16 },
        medical: { personalRate: 2, companyRate: 8 },
        unemployment: { personalRate: 0.5, companyRate: 0.5 },
        injury: { personalRate: 0, companyRate: 0.2 },
        maternity: { personalRate: 0, companyRate: 0.8 },
      },
    });
  };

  const handleEdit = (companyData: CompanyConfigData) => {
    // 使用公司数据而不是单个配置
    setEditingConfig({
      companyNo: companyData.companyNo,
      companyName: companyData.companyName,
      taxNumber: companyData.taxNumber,
    } as SocialInsuranceConfig);

    // 编辑时设置公司信息和已配置的比例
    const formConfigs = {
      pension: { personalRate: 8, companyRate: 16 },
      medical: { personalRate: 2, companyRate: 8 },
      unemployment: { personalRate: 0.5, companyRate: 0.5 },
      injury: { personalRate: 0, companyRate: 0.2 },
      maternity: { personalRate: 0, companyRate: 0.8 },
    };

    // 将已配置的数据填充到表单中
    companyData.configs.forEach((config) => {
      const insuranceType = config.insuranceType as keyof typeof formConfigs;
      if (formConfigs[insuranceType]) {
        formConfigs[insuranceType] = {
          personalRate: config.personalRate * 100, // 转换为百分比显示
          companyRate: config.companyRate * 100, // 转换为百分比显示
        };
      }
    });

    setBatchFormData({
      companyNo: companyData.companyNo,
      companyName: companyData.companyName,
      configs: formConfigs,
    });

    setShowForm(true);
  };

  const handleDelete = async (configId: string) => {
    if (!confirm("确定要删除这个配置吗？")) return;

    try {
      await SocialInsuranceConfigService.deleteConfig(configId);
      toast.success("删除成功");
      // 重新加载数据
      loadAllData(searchCompanyName || undefined, configuredPagination.current, unconfiguredPagination.current);
    } catch (error) {
      console.error("删除失败:", error);
      toast.error("删除失败，请重试");
    }
  };

  const getInsuranceTypeLabel = (type: string) => {
    return INSURANCE_TYPES.find((t) => t.value === type)?.label || type;
  };

  const getInsuranceTypeColor = (type: string) => {
    return (
      INSURANCE_TYPES.find((t) => t.value === type)?.color || "bg-gray-500"
    );
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">社保比例配置</h1>
            <p className="text-gray-600">管理各公司的社会保险缴费比例设置</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="搜索公司名称..."
              value={searchCompanyName}
              onChange={(e) => {
                setSearchCompanyName(e.target.value);
                handleSearch();
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Tab 切换 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('configured')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'configured'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              已配置公司
              <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                activeTab === 'configured'
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {configuredPagination.total}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('unconfigured')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'unconfigured'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              未配置公司
              <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                activeTab === 'unconfigured'
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {unconfiguredPagination.total}
              </span>
            </button>
          </nav>
        </div>

        {/* 配置列表 */}
        <div className="p-6">
          {loading ? (
            <div className="p-12 text-center text-gray-500">
              加载中...
            </div>
          ) : (() => {
            const currentData = activeTab === 'configured' ? configuredData : unconfiguredData;
            
            if (currentData.length === 0) {
              return (
                <div className="p-12 text-center text-gray-500">
                  {activeTab === 'configured' ? '暂无已配置的公司' : '暂无未配置的公司'}
                </div>
              );
            }
            
            const filteredGroupedConfigs = currentData.reduce((acc, company) => {
              const key = company.companyNo || "unknown";
              acc[key] = {
                companyInfo: {
                  companyNo: company.companyNo || "",
                  companyName: company.companyName || "",
                  taxNumber: company.taxNumber || "",
                },
                configs: company.configs || [],
              };
              return acc;
            }, {} as Record<string, { companyInfo: { companyNo: string; companyName: string; taxNumber: string }; configs: SocialInsuranceDetailConfig[] }>);
            
            return (
              <div className="space-y-6">
                {Object.entries(filteredGroupedConfigs).map(([companyNo, group]) => (
                  <div
                    key={companyNo}
                    className="bg-white rounded-xl shadow-sm border border-gray-200"
                  >
                    {/* 公司信息头部 */}
                    <div className="p-6 border-b border-gray-200 bg-gray-50 rounded-t-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {group.companyInfo.companyName || "未知公司"}
                          </h3>
                          <p className="text-sm text-gray-600">
                            税号: {group.companyInfo.taxNumber || "-"} | 公司编号:{" "}
                            {group.companyInfo.companyNo || "-"}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-sm text-gray-500">
                            {group.configs.length} 个险种配置
                          </div>
                          {group.configs.length > 0 ? (
                            <button
                              onClick={() =>
                                handleEdit({
                                  companyNo: group.companyInfo.companyNo || "",
                                  companyName: group.companyInfo.companyName || "",
                                  taxNumber: group.companyInfo.taxNumber,
                                  configs: group.configs,
                                })
                              }
                              className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                              title="编辑该公司的社保配置"
                            >
                              <Edit className="h-4 w-4" />
                              <span>编辑配置</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingConfig(null);
                                setBatchFormData({
                                  companyNo: group.companyInfo.companyNo || "",
                                  companyName: group.companyInfo.companyName || "",
                                  configs: {
                                    pension: { personalRate: 8, companyRate: 16 },
                                    medical: { personalRate: 2, companyRate: 8 },
                                    unemployment: {
                                      personalRate: 0.5,
                                      companyRate: 0.5,
                                    },
                                    injury: { personalRate: 0, companyRate: 0.2 },
                                    maternity: { personalRate: 0, companyRate: 0.8 },
                                  },
                                });
                                setShowForm(true);
                              }}
                              className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <Plus className="h-4 w-4" />
                              <span>去配置</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 险种配置表格 */}
                    {group.configs.length === 0 ? (
                      <div className="p-12 text-center">
                        <div className="text-gray-500 mb-4">
                          该公司尚未配置任何险种
                        </div>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                险种名称
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                个人缴费比例 (%)
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                公司缴费比例 (%)
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                合计缴费比例 (%)
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                状态
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                操作
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {group.configs.map((config) => (
                              <tr key={config.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div
                                      className={`w-3 h-3 rounded-full mr-2 ${
                                        getInsuranceTypeColor(config.insuranceType)
                                      }`}
                                    ></div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {getInsuranceTypeLabel(config.insuranceType)}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">
                                    {config.personalRate * 100}%
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">
                                    {config.companyRate * 100}%
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-blue-600">
                                    {
                                      (
                                        config.personalRate * 100 +
                                        config.companyRate * 100
                                      ).toFixed(1)
                                    }
                                    %
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span
                                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                      config.isActive
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {config.isActive ? "启用" : "禁用"}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={() => handleDelete(config.id!)}
                                      className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                                      title="删除"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </div>

      {/* 分页组件 */}
      {(() => {
        const currentPagination = activeTab === 'configured' ? configuredPagination : unconfiguredPagination;
        return currentPagination.total > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-4">
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  显示第 {(currentPagination.current - 1) * currentPagination.size + 1} 到{" "}
                  {Math.min(
                    currentPagination.current * currentPagination.size,
                    currentPagination.total
                  )}{" "}
                  条， 共 {currentPagination.total} 条记录
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      const newPage = currentPagination.current - 1;
                      if (activeTab === 'configured') {
                        setConfiguredPagination((prev) => ({ ...prev, current: newPage }));
                        loadAllData(searchCompanyName || undefined, newPage, unconfiguredPagination.current);
                      } else {
                        setUnconfiguredPagination((prev) => ({ ...prev, current: newPage }));
                        loadAllData(searchCompanyName || undefined, configuredPagination.current, newPage);
                      }
                    }}
                    disabled={currentPagination.current <= 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>上一页</span>
                  </button>

                  <div className="flex items-center space-x-1">
                    {Array.from(
                      { length: Math.min(5, currentPagination.pages) },
                      (_, i) => {
                        let pageNum;
                        if (currentPagination.pages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPagination.current <= 3) {
                          pageNum = i + 1;
                        } else if (currentPagination.current >= currentPagination.pages - 2) {
                          pageNum = currentPagination.pages - 4 + i;
                        } else {
                          pageNum = currentPagination.current - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => {
                              if (activeTab === 'configured') {
                                setConfiguredPagination((prev) => ({
                                  ...prev,
                                  current: pageNum,
                                }));
                                loadAllData(
                                  searchCompanyName || undefined,
                                  pageNum,
                                  unconfiguredPagination.current
                                );
                              } else {
                                setUnconfiguredPagination((prev) => ({
                                  ...prev,
                                  current: pageNum,
                                }));
                                loadAllData(
                                  searchCompanyName || undefined,
                                  configuredPagination.current,
                                  pageNum
                                );
                              }
                            }}
                            className={`px-3 py-1 text-sm border rounded-md ${
                              currentPagination.current === pageNum
                                ? "bg-blue-600 text-white border-blue-600"
                                : "border-gray-300 hover:bg-gray-100"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      }
                    )}
                  </div>

                  <button
                    onClick={() => {
                      const newPage = currentPagination.current + 1;
                      if (activeTab === 'configured') {
                        setConfiguredPagination((prev) => ({ ...prev, current: newPage }));
                        loadAllData(searchCompanyName || undefined, newPage, unconfiguredPagination.current);
                      } else {
                        setUnconfiguredPagination((prev) => ({ ...prev, current: newPage }));
                        loadAllData(searchCompanyName || undefined, configuredPagination.current, newPage);
                      }
                    }}
                    disabled={currentPagination.current >= currentPagination.pages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                  >
                    <span>下一页</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 配置表单弹窗 */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingConfig ? "编辑" : "新增"}社保配置
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingConfig(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {/* 公司选择 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  选择公司
                </label>
                {editingConfig ? (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium">{editingConfig.companyName}</div>
                    <div className="text-sm text-gray-600">
                      公司编号: {editingConfig.companyNo}
                    </div>
                    {editingConfig.taxNumber && (
                      <div className="text-sm text-gray-600">
                        税号: {editingConfig.taxNumber}
                      </div>
                    )}
                  </div>
                ) : (
                  <CompanySelector
                    value={batchFormData.companyNo}
                    onChange={(companyNo, companyName) => {
                      setBatchFormData((prev) => ({
                        ...prev,
                        companyNo,
                        companyName,
                      }));
                      if (companyNo) {
                        fetchCompanyConfigs(companyNo);
                      }
                    }}
                    placeholder="请选择公司"
                  />
                )}
              </div>

              {/* 险种配置 */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">险种配置</h3>
                <div className="grid grid-cols-1 gap-6">
                  {INSURANCE_TYPES.map((insuranceType) => {
                    const config =
                      batchFormData.configs[
                        insuranceType.value as keyof typeof batchFormData.configs
                      ];
                    return (
                      <div
                        key={insuranceType.value}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-center mb-4">
                          <div
                            className={`w-4 h-4 rounded-full mr-3 ${insuranceType.color}`}
                          ></div>
                          <h4 className="text-md font-medium text-gray-900">
                            {insuranceType.label}
                          </h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              个人缴费比例 (%)
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max="100"
                              value={config.personalRate}
                              onChange={(e) =>
                                updateInsuranceRate(
                                  insuranceType.value,
                                  "personalRate",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              公司缴费比例 (%)
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max="100"
                              value={config.companyRate}
                              onChange={(e) =>
                                updateInsuranceRate(
                                  insuranceType.value,
                                  "companyRate",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              合计比例 (%)
                            </label>
                            <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700">
                              {calculateTotal(
                                config.personalRate,
                                config.companyRate
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 表单按钮 */}
              <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingConfig(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="h-4 w-4" />
                  <span>{loading ? "保存中..." : "保存配置"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}