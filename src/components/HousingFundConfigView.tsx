import React, { useState, useEffect } from "react";
import {
  Home,
  Save,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { HousingFundConfigService } from "../utils/housingFundConfigService";
import { HousingFundConfig } from "../types/housingFundConfig";
import CompanySelector from "./CompanySelector";

export default function HousingFundConfigView() {
  const [configuredData, setConfiguredData] = useState<HousingFundConfig[]>([]);
  const [unconfiguredData, setUnconfiguredData] = useState<HousingFundConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchCompanyName, setSearchCompanyName] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [editingConfig, setEditingConfig] = useState<HousingFundConfig | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<'configured' | 'unconfigured'>('configured');
  const [formData, setFormData] = useState({
    companyRate: "",
    personalRate: "",
    companyNo: "",
  });

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

  useEffect(() => {
    loadAllData();
  }, []);

  // 当分页改变时重新加载数据
  useEffect(() => {
    if (configuredPagination.current > 1 || unconfiguredPagination.current > 1) {
      loadAllData();
    }
  }, [configuredPagination.current, unconfiguredPagination.current]);

  const loadAllData = async (companyName?: string) => {
    try {
      setLoading(true);
      // 获取大量数据以包含所有公司
      const params = {
        current: 1,
        size: 1000, // 获取足够多的数据
        ...(companyName && { companyName }),
      };

      const data = await HousingFundConfigService.getConfigList(params);
      console.log("housing fund configs: ", data);
      
      // 在前端分离已配置和未配置的公司
      // 这里假设有配置记录的就是已配置，没有的就是未配置
      // 由于后端API限制，我们需要根据实际返回的数据结构来判断
      const allConfigs = data.records || [];
      
      // 已配置：有具体配置数据的公司
      const configured = allConfigs.filter(config => config.id && config.companyRate !== undefined);
      
      // 未配置：这里需要根据实际业务逻辑来获取未配置的公司列表
      // 由于API限制，暂时将未配置设为空数组，实际应该从公司列表中排除已配置的
      const unconfigured: HousingFundConfig[] = [];
      
      // 获取当前分页参数
      const configuredCurrentPage = configuredPagination.current;
      const unconfiguredCurrentPage = unconfiguredPagination.current;
      
      // 前端分页处理
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
      toast.error("加载公积金配置数据失败");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (companyName: string) => {
    // 重置分页到第一页
    setConfiguredPagination((prev) => ({ ...prev, current: 1 }));
    setUnconfiguredPagination((prev) => ({ ...prev, current: 1 }));
    loadAllData(companyName || undefined);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      console.log("formData: ", formData);
      const configData = {
        companyNo: formData.companyNo!,
        companyRate: parseFloat(formData.companyRate),
        personalRate: parseFloat(formData.personalRate),
        minBase: 0,
        maxBase: 999999,
      };

      if (editingConfig) {
        await HousingFundConfigService.updateConfig(
          editingConfig.id!,
          configData
        );
        toast.success("公积金配置更新成功！");
      } else {
        await HousingFundConfigService.createConfig(configData);
        toast.success("公积金配置创建成功！");
      }

      setShowForm(false);
      setEditingConfig(null);
      resetForm();
      await loadAllData();
    } catch (error) {
      console.error("操作失败:", error);
      toast.error("操作失败，请重试");
    }
  };

  const resetForm = () => {
    setFormData({
      companyRate: "",
      personalRate: "",
      companyNo: "",
    });
  };

  const handleEdit = (config: HousingFundConfig) => {
    setEditingConfig(config);
    setFormData({
      companyRate: config.companyRate.toString(),
      personalRate: config.personalRate.toString(),
      companyNo: config.companyNo,
    });
    setShowForm(true);
  };

  const handleDelete = async (configId: string) => {
    if (!confirm("确定要删除这个配置吗？")) return;

    try {
      await HousingFundConfigService.deleteConfig(configId);
      toast.success("删除成功");
      await loadAllData();
    } catch (error) {
      console.error("删除失败:", error);
      toast.error("删除失败，请重试");
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Home className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">公积金比例配置</h1>
            <p className="text-gray-600">管理各公司的公积金缴费比例设置</p>
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
                handleSearch(e.target.value);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            />
          </div>
          <button
            onClick={() => {
              setEditingConfig(null);
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>新增配置</span>
          </button>
        </div>
      </div>

      {/* 配置列表 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              公积金配置列表
            </h3>
          </div>
          
          {/* Tab 导航 */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('configured')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'configured'
                  ? 'bg-white text-green-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              已配置公司
              <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-600 rounded-full">
                {configuredPagination.total}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('unconfigured')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'unconfigured'
                  ? 'bg-white text-green-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              未配置公司
              <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                {unconfiguredPagination.total}
              </span>
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  公司名称
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  税号
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  公司比例
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  个人比例
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  创建时间
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    加载中...
                  </td>
                </tr>
              ) : (activeTab === 'configured' ? configuredData : unconfiguredData).length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    暂无配置数据
                  </td>
                </tr>
              ) : (
                (activeTab === 'configured' ? configuredData : unconfiguredData).map((config) => (
                  <tr key={config.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {config.companyName || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {config.taxNumber || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {config.companyRate}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {config.personalRate}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        启用
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date().toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(config)}
                          className="text-green-600 hover:text-green-900 p-1 rounded"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(config.id!)}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 分页组件 */}
        {((activeTab === 'configured' ? configuredPagination : unconfiguredPagination).total > 0) && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                显示第 {((activeTab === 'configured' ? configuredPagination : unconfiguredPagination).current - 1) * (activeTab === 'configured' ? configuredPagination : unconfiguredPagination).size + 1} 到{" "}
                {Math.min(
                  (activeTab === 'configured' ? configuredPagination : unconfiguredPagination).current * (activeTab === 'configured' ? configuredPagination : unconfiguredPagination).size,
                  (activeTab === 'configured' ? configuredPagination : unconfiguredPagination).total
                )}{" "}
                条， 共 {(activeTab === 'configured' ? configuredPagination : unconfiguredPagination).total} 条记录
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const newPage = (activeTab === 'configured' ? configuredPagination : unconfiguredPagination).current - 1;
                    if (activeTab === 'configured') {
                      setConfiguredPagination((prev) => ({ ...prev, current: newPage }));
                    } else {
                      setUnconfiguredPagination((prev) => ({ ...prev, current: newPage }));
                    }
                  }}
                  disabled={(activeTab === 'configured' ? configuredPagination : unconfiguredPagination).current <= 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>上一页</span>
                </button>

                <div className="flex items-center space-x-1">
                  {Array.from(
                    { length: Math.min(5, (activeTab === 'configured' ? configuredPagination : unconfiguredPagination).pages) },
                    (_, i) => {
                      const currentPagination = activeTab === 'configured' ? configuredPagination : unconfiguredPagination;
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
                            } else {
                              setUnconfiguredPagination((prev) => ({
                                ...prev,
                                current: pageNum,
                              }));
                            }
                          }}
                          className={`px-3 py-1 text-sm border rounded-md ${
                            pageNum === currentPagination.current
                              ? "bg-green-600 text-white border-green-600"
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
                    const newPage = (activeTab === 'configured' ? configuredPagination : unconfiguredPagination).current + 1;
                    if (activeTab === 'configured') {
                      setConfiguredPagination((prev) => ({ ...prev, current: newPage }));
                    } else {
                      setUnconfiguredPagination((prev) => ({ ...prev, current: newPage }));
                    }
                  }}
                  disabled={(activeTab === 'configured' ? configuredPagination : unconfiguredPagination).current >= (activeTab === 'configured' ? configuredPagination : unconfiguredPagination).pages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                >
                  <span>下一页</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 配置表单弹窗 */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingConfig ? "编辑公积金配置" : "新增公积金配置"}
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
              {!editingConfig && (
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      所属公司 <span className="text-red-500">*</span>
                    </label>
                    <CompanySelector
                      value={formData.companyNo}
                      onChange={(companyNo: string) => {
                        setFormData({
                          ...formData,
                          companyNo: companyNo,
                        });
                      }}
                      className="w-full"
                    />
                  </div>
                </div>
              )}

              {editingConfig && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">编辑配置：</span>
                    {editingConfig.companyName
                      ? `${editingConfig.companyName} (${
                          editingConfig.taxNumber
                            ? editingConfig.taxNumber
                            : editingConfig.companyNo
                        })`
                      : `公司编号: ${editingConfig.companyNo}`}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    公司缴费比例(%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.companyRate}
                    onChange={(e) =>
                      setFormData({ ...formData, companyRate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    个人缴费比例(%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.personalRate}
                    onChange={(e) =>
                      setFormData({ ...formData, personalRate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    required
                  />
                </div>
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
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
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
