import React, { useState, useEffect } from "react";
import { Receipt, Plus, Edit, Search, X, Calendar } from "lucide-react";
import { Company } from "../../types/company";
import { CompanyService } from "../../utils/companyService";
import toast from "react-hot-toast";

// 开票额度接口定义
interface InvoiceQuota {
  id?: number;
  companyId: string;
  companyName: string;
  year: number;
  month: number;
  maxAmount: number;
  usedAmount: number;
  remainingAmount: number;
  createTime?: string;
  updateTime?: string;
}

// 创建/更新开票额度请求
interface InvoiceQuotaRequest {
  companyId: string;
  year: number;
  month: number;
  maxAmount: number;
}

export default function InvoiceQuotaManagementView() {
  const [quotas, setQuotas] = useState<InvoiceQuota[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingQuota, setEditingQuota] = useState<InvoiceQuota | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  
  // 搜索参数
  const [searchParams, setSearchParams] = useState({
    companyName: "",
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  });
  
  // 表单数据
  const [formData, setFormData] = useState<InvoiceQuotaRequest>({
    companyId: "",
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    maxAmount: 0,
  });
  
  // 表单验证错误
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // 加载公司列表
  const loadCompanies = async () => {
    try {
      const response = await CompanyService.getCompanyList({
        current: 1,
        size: 1000, // 获取所有公司
      });
      setCompanies(response?.records || []);
    } catch (error) {
      console.error("加载公司列表失败:", error);
      toast.error("加载公司列表失败");
    }
  };

  // 加载开票额度列表 (模拟数据，实际需要调用API)
  const loadQuotas = async () => {
    try {
      setLoading(true);
      // TODO: 实际调用API
      // const response = await InvoiceQuotaService.getQuotaList(searchParams);
      
      // 模拟数据
      const mockData: InvoiceQuota[] = [
        {
          id: 1,
          companyId: "COMP001",
          companyName: "测试公司A",
          year: 2024,
          month: 12,
          maxAmount: 1000000,
          usedAmount: 350000,
          remainingAmount: 650000,
          createTime: "2024-12-01 10:00:00",
          updateTime: "2024-12-15 14:30:00",
        },
        {
          id: 2,
          companyId: "COMP002",
          companyName: "测试公司B",
          year: 2024,
          month: 12,
          maxAmount: 500000,
          usedAmount: 200000,
          remainingAmount: 300000,
          createTime: "2024-12-01 10:00:00",
          updateTime: "2024-12-10 16:20:00",
        },
      ];
      
      // 根据搜索条件过滤
      const filteredData = mockData.filter(quota => {
        const matchCompany = !searchParams.companyName || 
          quota.companyName.toLowerCase().includes(searchParams.companyName.toLowerCase());
        const matchYear = quota.year === searchParams.year;
        const matchMonth = quota.month === searchParams.month;
        return matchCompany && matchYear && matchMonth;
      });
      
      setQuotas(filteredData);
    } catch (error) {
      console.error("加载开票额度失败:", error);
      toast.error("加载开票额度失败");
    } finally {
      setLoading(false);
    }
  };

  // 搜索
  const handleSearch = () => {
    loadQuotas();
  };

  // 重置搜索
  const handleReset = () => {
    setSearchParams({
      companyName: "",
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
    });
  };

  // 打开创建模态框
  const handleOpenCreateModal = () => {
    setFormData({
      companyId: "",
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      maxAmount: 0,
    });
    setFormErrors({});
    setShowCreateModal(true);
  };

  // 打开编辑模态框
  const handleEdit = (quota: InvoiceQuota) => {
    setFormData({
      companyId: quota.companyId,
      year: quota.year,
      month: quota.month,
      maxAmount: quota.maxAmount,
    });
    setFormErrors({});
    setEditingQuota(quota);
  };

  // 关闭模态框
  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingQuota(null);
    setFormData({
      companyId: "",
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      maxAmount: 0,
    });
    setFormErrors({});
  };

  // 表单输入处理
  const handleInputChange = (field: keyof InvoiceQuotaRequest, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 清除对应字段的错误
    if (formErrors[field]) {
      const newErrors = { ...formErrors };
      delete newErrors[field];
      setFormErrors(newErrors);
    }
  };

  // 表单验证
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.companyId) {
      errors.companyId = "请选择公司";
    }
    if (!formData.year || formData.year < 2020 || formData.year > 2030) {
      errors.year = "请输入有效年份(2020-2030)";
    }
    if (!formData.month || formData.month < 1 || formData.month > 12) {
      errors.month = "请输入有效月份(1-12)";
    }
    if (!formData.maxAmount || formData.maxAmount <= 0) {
      errors.maxAmount = "请输入有效的最大开票额度";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setFormLoading(true);
      
      // TODO: 实际调用API
      if (editingQuota) {
        // await InvoiceQuotaService.updateQuota(editingQuota.id, formData);
        toast.success("开票额度更新成功");
      } else {
        // await InvoiceQuotaService.createQuota(formData);
        toast.success("开票额度创建成功");
      }
      
      handleCloseModal();
      loadQuotas();
    } catch (error) {
      console.error("保存开票额度失败:", error);
      toast.error("保存开票额度失败");
    } finally {
      setFormLoading(false);
    }
  };

  // 格式化金额显示
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // 计算使用率
  const getUsageRate = (used: number, max: number) => {
    if (max === 0) return 0;
    return Math.round((used / max) * 100);
  };

  // 获取使用率颜色
  const getUsageColor = (rate: number) => {
    if (rate >= 90) return "text-red-600 bg-red-100";
    if (rate >= 70) return "text-yellow-600 bg-yellow-100";
    return "text-green-600 bg-green-100";
  };

  useEffect(() => {
    loadCompanies();
    loadQuotas();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Receipt className="w-6 h-6 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-900">开票额度管理</h2>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>设置额度</span>
        </button>
      </div>

      {/* 搜索栏 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            公司名称
          </label>
          <input
            type="text"
            placeholder="搜索公司名称..."
            value={searchParams.companyName}
            onChange={(e) => setSearchParams(prev => ({ ...prev, companyName: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            年份
          </label>
          <select
            value={searchParams.year}
            onChange={(e) => setSearchParams(prev => ({ ...prev, year: parseInt(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
          >
            {Array.from({ length: 11 }, (_, i) => 2020 + i).map(year => (
              <option key={year} value={year}>{year}年</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            月份
          </label>
          <select
            value={searchParams.month}
            onChange={(e) => setSearchParams(prev => ({ ...prev, month: parseInt(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
              <option key={month} value={month}>{month}月</option>
            ))}
          </select>
        </div>
        <div className="flex items-end space-x-2">
          <button
            onClick={handleSearch}
            className="flex-1 flex items-center justify-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Search className="w-4 h-4" />
            <span>搜索</span>
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            重置
          </button>
        </div>
      </div>

      {/* 数据表格 */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    公司名称
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    时间
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">
                    最大额度
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">
                    已用额度
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">
                    剩余额度
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">
                    使用率
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                {quotas.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-500">
                      暂无数据
                    </td>
                  </tr>
                ) : (
                  quotas.map((quota) => {
                    const usageRate = getUsageRate(quota.usedAmount, quota.maxAmount);
                    return (
                      <tr key={quota.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">
                            {quota.companyName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {quota.companyId}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-1 text-gray-900">
                            <Calendar className="w-4 h-4" />
                            <span>{quota.year}年{quota.month}月</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-gray-900">
                          {formatAmount(quota.maxAmount)}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-900">
                          {formatAmount(quota.usedAmount)}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-900">
                          {formatAmount(quota.remainingAmount)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUsageColor(usageRate)}`}>
                            {usageRate}%
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => handleEdit(quota)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              title="编辑"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* 创建/编辑模态框 */}
      {(showCreateModal || editingQuota) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                {editingQuota ? "编辑开票额度" : "设置开票额度"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 公司选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  选择公司 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.companyId}
                  onChange={(e) => handleInputChange("companyId", e.target.value)}
                  disabled={!!editingQuota}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none ${
                    formErrors.companyId ? "border-red-500" : "border-gray-300"
                  } ${editingQuota ? "bg-gray-100" : ""}`}
                >
                  <option value="">请选择公司</option>
                  {companies.map((company) => (
                    <option key={company.companyNo} value={company.companyNo}>
                      {company.companyName}
                    </option>
                  ))}
                </select>
                {formErrors.companyId && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.companyId}</p>
                )}
              </div>

              {/* 年份 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  年份 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.year}
                  onChange={(e) => handleInputChange("year", parseInt(e.target.value))}
                  disabled={!!editingQuota}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none ${
                    formErrors.year ? "border-red-500" : "border-gray-300"
                  } ${editingQuota ? "bg-gray-100" : ""}`}
                >
                  {Array.from({ length: 11 }, (_, i) => 2020 + i).map(year => (
                    <option key={year} value={year}>{year}年</option>
                  ))}
                </select>
                {formErrors.year && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.year}</p>
                )}
              </div>

              {/* 月份 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  月份 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.month}
                  onChange={(e) => handleInputChange("month", parseInt(e.target.value))}
                  disabled={!!editingQuota}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none ${
                    formErrors.month ? "border-red-500" : "border-gray-300"
                  } ${editingQuota ? "bg-gray-100" : ""}`}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                    <option key={month} value={month}>{month}月</option>
                  ))}
                </select>
                {formErrors.month && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.month}</p>
                )}
              </div>

              {/* 最大开票额度 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  最大开票额度 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.maxAmount}
                  onChange={(e) => handleInputChange("maxAmount", parseFloat(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none ${
                    formErrors.maxAmount ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="请输入最大开票额度"
                />
                {formErrors.maxAmount && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.maxAmount}</p>
                )}
              </div>

              {/* 按钮 */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {formLoading ? "保存中..." : editingQuota ? "更新" : "创建"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}