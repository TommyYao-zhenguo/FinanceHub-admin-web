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
import {
  SocialInsuranceConfig,
  SocialInsuranceDetailConfig,
} from "../types/socialInsuranceConfig";
import CompanySelector from "./CompanySelector";

// 定义公司配置数据类型
interface CompanyConfigData {
  companyId: string;
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
  const [groupedData, setGroupedData] = useState<CompanyConfigData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchCompanyName, setSearchCompanyName] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [editingConfig, setEditingConfig] =
    useState<SocialInsuranceConfig | null>(null);

  // 分页状态
  const [pagination, setPagination] = useState({
    current: 1,
    size: 10,
    total: 0,
    pages: 0,
  });

  // 新的批量配置表单数据
  const [batchFormData, setBatchFormData] = useState({
    companyId: "",
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
    loadConfigs();
  }, [pagination.current, pagination.size]);

  const fetchCompanyConfigs = async (companyId: string) => {
    try {
      const configs = await SocialInsuranceConfigService.getCompanyConfigs(
        companyId
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

  const loadConfigs = async (companyName?: string, page?: number) => {
    try {
      setLoading(true);
      const currentPage = page || pagination.current;
      const params = {
        current: currentPage,
        size: pagination.size,
        ...(companyName && { companyName }),
      };
      const response = await SocialInsuranceConfigService.getConfigList(params);
      console.log("social insurance configs: ", response);

      // 转换数据格式：将 SocialInsuranceConfig[] 转换为 CompanyConfigData[]
      const transformedRecords: CompanyConfigData[] = response.records.map(
        (config: SocialInsuranceConfig) => ({
          companyId: config.companyId || "",
          companyName: config.companyName || "",
          taxNumber: config.taxNumber || "",
          configs: config.configs || [],
        })
      );

      setGroupedData(transformedRecords);
      setPagination((prev) => ({
        ...prev,
        current: currentPage,
        total: response.total,
        pages: response.pages,
      }));
    } catch {
      toast.error("加载社保配置失败");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!batchFormData.companyId) {
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
        companyId: batchFormData.companyId,
        configs,
      };

      await SocialInsuranceConfigService.batchConfigRates(batchRequest);
      toast.success("配置保存成功");

      setShowForm(false);
      setEditingConfig(null);
      resetForm();
      loadConfigs(searchCompanyName || undefined, pagination.current);
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
      companyId: "",
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
      companyId: companyData.companyId,
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
      companyId: companyData.companyId,
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
      await loadConfigs(searchCompanyName || undefined, pagination.current);
    } catch (error) {
      console.error("删除失败:", error);
      toast.error("删除失败，请重试");
    }
  };

  // 使用接口返回的分组数据
  const groupedConfigs = groupedData.reduce((acc, company) => {
    const key = company.companyId || "unknown";
    acc[key] = {
      companyInfo: {
        companyId: company.companyId,
        companyName: company.companyName,
        taxNumber: company.taxNumber,
      },
      configs: company.configs || [],
    };
    return acc;
  }, {} as Record<string, { companyInfo: { companyId?: string; companyName?: string; taxNumber?: string }; configs: SocialInsuranceDetailConfig[] }>);

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
                setPagination((prev) => ({ ...prev, current: 1 }));
                loadConfigs(e.target.value || undefined, 1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* 配置列表 */}
      <div className="space-y-6">
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-500">
            加载中...
          </div>
        ) : groupedData.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-500">
            暂无配置数据
          </div>
        ) : (
          Object.entries(groupedConfigs).map(([companyId, group]) => (
            <div
              key={companyId}
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
                      税号: {group.companyInfo.taxNumber || "-"} | 公司ID:{" "}
                      {group.companyInfo.companyId || "-"}
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
                            companyId: group.companyInfo.companyId || "",
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
                            companyId: group.companyInfo.companyId || "",
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
                                className={`w-3 h-3 rounded-full mr-2 ${getInsuranceTypeColor(
                                  config.insuranceType
                                )}`}
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
                              {(
                                config.personalRate * 100 +
                                config.companyRate * 100
                              ).toFixed(1)}
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
          ))
        )}

        {/* 分页组件 */}
        {pagination.total > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-4">
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  显示第 {(pagination.current - 1) * pagination.size + 1} 到{" "}
                  {Math.min(
                    pagination.current * pagination.size,
                    pagination.total
                  )}{" "}
                  条， 共 {pagination.total} 条记录
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      const newPage = pagination.current - 1;
                      setPagination((prev) => ({ ...prev, current: newPage }));
                      loadConfigs(searchCompanyName || undefined, newPage);
                    }}
                    disabled={pagination.current <= 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>上一页</span>
                  </button>

                  <div className="flex items-center space-x-1">
                    {Array.from(
                      { length: Math.min(5, pagination.pages) },
                      (_, i) => {
                        let pageNum;
                        if (pagination.pages <= 5) {
                          pageNum = i + 1;
                        } else if (pagination.current <= 3) {
                          pageNum = i + 1;
                        } else if (pagination.current >= pagination.pages - 2) {
                          pageNum = pagination.pages - 4 + i;
                        } else {
                          pageNum = pagination.current - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => {
                              setPagination((prev) => ({
                                ...prev,
                                current: pageNum,
                              }));
                              loadConfigs(
                                searchCompanyName || undefined,
                                pageNum
                              );
                            }}
                            className={`px-3 py-1 text-sm border rounded-md ${
                              pageNum === pagination.current
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
                      const newPage = pagination.current + 1;
                      setPagination((prev) => ({ ...prev, current: newPage }));
                      loadConfigs(searchCompanyName || undefined, newPage);
                    }}
                    disabled={pagination.current >= pagination.pages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                  >
                    <span>下一页</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 配置表单弹窗 */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingConfig ? "编辑社保配置" : "新增社保配置"}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingConfig(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    所属公司 <span className="text-red-500">*</span>
                  </label>
                  {editingConfig ? (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="text-sm text-gray-900">
                        <span className="font-medium">
                          {editingConfig.companyName || ""}
                        </span>
                        {editingConfig.taxNumber && (
                          <span className="text-gray-600 ml-2">
                            ({editingConfig.taxNumber})
                          </span>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          公司ID: {editingConfig.companyId}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <CompanySelector
                      value={batchFormData.companyId}
                      onChange={(companyId: string) => {
                        setBatchFormData({
                          ...batchFormData,
                          companyId: companyId || "",
                        });
                        if (companyId) {
                          fetchCompanyConfigs(companyId);
                        }
                      }}
                      className="w-full"
                    />
                  )}
                </div>
              </div>

              {/* 社保比例配置表格 */}
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
                        备注
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* 养老保险 */}
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                          <div className="text-sm font-medium text-gray-900">
                            养老保险
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={batchFormData.configs.pension.personalRate}
                          onChange={(e) =>
                            updateInsuranceRate(
                              "pension",
                              "personalRate",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={batchFormData.configs.pension.companyRate}
                          onChange={(e) =>
                            updateInsuranceRate(
                              "pension",
                              "companyRate",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-blue-600">
                          {calculateTotal(
                            batchFormData.configs.pension.personalRate,
                            batchFormData.configs.pension.companyRate
                          )}
                          %
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs text-gray-500">固定比例</span>
                      </td>
                    </tr>

                    {/* 医疗保险 */}
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                          <div className="text-sm font-medium text-gray-900">
                            医疗保险
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={batchFormData.configs.medical.personalRate}
                          onChange={(e) =>
                            updateInsuranceRate(
                              "medical",
                              "personalRate",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={batchFormData.configs.medical.companyRate}
                          onChange={(e) =>
                            updateInsuranceRate(
                              "medical",
                              "companyRate",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-green-600">
                          {calculateTotal(
                            batchFormData.configs.medical.personalRate,
                            batchFormData.configs.medical.companyRate
                          )}
                          %
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs text-gray-500">固定比例</span>
                      </td>
                    </tr>

                    {/* 失业保险 */}
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                          <div className="text-sm font-medium text-gray-900">
                            失业保险
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={
                            batchFormData.configs.unemployment.personalRate
                          }
                          onChange={(e) =>
                            updateInsuranceRate(
                              "unemployment",
                              "personalRate",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={batchFormData.configs.unemployment.companyRate}
                          onChange={(e) =>
                            updateInsuranceRate(
                              "unemployment",
                              "companyRate",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-yellow-600">
                          {calculateTotal(
                            batchFormData.configs.unemployment.personalRate,
                            batchFormData.configs.unemployment.companyRate
                          )}
                          %
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs text-gray-500">固定比例</span>
                      </td>
                    </tr>

                    {/* 工伤保险 */}
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                          <div className="text-sm font-medium text-gray-900">
                            工伤保险
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={batchFormData.configs.injury.personalRate}
                          onChange={(e) =>
                            updateInsuranceRate(
                              "injury",
                              "personalRate",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={batchFormData.configs.injury.companyRate}
                          onChange={(e) =>
                            updateInsuranceRate(
                              "injury",
                              "companyRate",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-red-600">
                          {calculateTotal(
                            batchFormData.configs.injury.personalRate,
                            batchFormData.configs.injury.companyRate
                          )}
                          %
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs text-gray-500">固定比例</span>
                      </td>
                    </tr>

                    {/* 生育保险 */}
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                          <div className="text-sm font-medium text-gray-900">
                            生育保险
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={batchFormData.configs.maternity.personalRate}
                          onChange={(e) =>
                            updateInsuranceRate(
                              "maternity",
                              "personalRate",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={batchFormData.configs.maternity.companyRate}
                          onChange={(e) =>
                            updateInsuranceRate(
                              "maternity",
                              "companyRate",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-purple-600">
                          {calculateTotal(
                            batchFormData.configs.maternity.personalRate,
                            batchFormData.configs.maternity.companyRate
                          )}
                          %
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs text-gray-500">固定比例</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingConfig(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>{loading ? "保存中..." : "保存"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
