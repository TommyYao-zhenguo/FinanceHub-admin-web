import React, { useState, useEffect } from "react";
import { FileText, Edit, Search, Building2 } from "lucide-react";
import toast from "react-hot-toast";
import {
  InvoiceQuotaService,
  CompanyQuotaQueryParams,
  InvoiceQuotaPageResponse,
  UpdateInvoiceQuotaAmountRequest,
  CreateInvoiceQuotaRequest,
  InvoiceQuota,
} from "../utils/invoiceQuotaService";

// 注意：现在直接使用从service导入的InvoiceQuota接口，包含companyNo字段

// 创建/更新开票额度请求
interface InvoiceQuotaRequest {
  taxNumber: string;
  maxAmount: number | string;
}

export default function InvoiceQuotaManagementView() {
  const [quotas, setQuotas] = useState<InvoiceQuota[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingQuota, setEditingQuota] = useState<InvoiceQuota | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // 搜索参数
  const [searchParams, setSearchParams] = useState({
    page: 1,
    size: 10,
    companyName: "",
  });

  // 分页信息
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // 表单数据
  const [formData, setFormData] = useState<InvoiceQuotaRequest>({
    taxNumber: "",
    maxAmount: 0,
  });

  // 表单验证错误
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // 加载开票额度数据
  const loadInvoiceQuotas = async () => {
    try {
      setLoading(true);

      // 构造查询参数
      const queryParams: CompanyQuotaQueryParams = {
        current: searchParams.page,
        size: searchParams.size,
        companyName: searchParams.companyName || undefined,
      };

      // 调用真实API
      const response: InvoiceQuotaPageResponse =
        await InvoiceQuotaService.getAllCompaniesWithQuota(queryParams);

      if (response && response.records) {
        // 转换数据格式
        const quotaData: InvoiceQuota[] = response.records.map((item) => ({
          id: item.id,
          taxNumber: item.taxNumber,
          companyName: item.companyName || "",
          maxAmount: item.maxAmount || 0,
          statsDate: item.statsDate || new Date().toISOString().slice(0, 7), // 添加statsDate字段
          companyNo: item.companyNo || item.taxNumber, // 添加companyNo字段，优先使用companyNo，否则使用taxNumber
          createTime: item.createTime,
          updateTime: item.updateTime,
        }));

        setQuotas(quotaData);
        setTotalElements(response.total);
        setTotalPages(response.pages);
      } else {
        setQuotas([]);
        setTotalElements(0);
        setTotalPages(0);
      }
    } catch (error) {
      console.error("加载开票额度列表失败:", error);
      toast.error("加载开票额度列表失败");
      setQuotas([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  // 初始化加载
  useEffect(() => {
    loadInvoiceQuotas();
  }, []);

  // 搜索参数变化时重新加载
  useEffect(() => {
    loadInvoiceQuotas();
  }, [searchParams]);

  // 搜索处理
  const handleSearch = () => {
    setSearchParams({ ...searchParams, page: 1 });
  };

  // 重置搜索
  const handleReset = () => {
    setSearchParams({ page: 1, size: 10, companyName: "" });
  };

  // 分页处理
  const handlePageChange = (page: number) => {
    setSearchParams({ ...searchParams, page });
  };

  // 表单验证
  const validateForm = (data: InvoiceQuotaRequest): boolean => {
    const errors: Record<string, string> = {};

    if (!data.taxNumber) {
      errors.taxNumber = "请输入统一社会信用代码";
    }

    const amount = Number(data.maxAmount);
    if (
      data.maxAmount === "" ||
      data.maxAmount === undefined ||
      data.maxAmount === null ||
      isNaN(amount) ||
      amount < 0
    ) {
      errors.maxAmount = "请输入有效的月度税务开票额度";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 编辑开票额度
  const handleEdit = async (data: InvoiceQuotaRequest) => {
    if (!validateForm(data) || !editingQuota) return;

    try {
      setFormLoading(true);

      // 如果ID为空，调用创建接口；否则调用更新接口
      if (!editingQuota.id) {
        // 调用创建接口
        const createData: CreateInvoiceQuotaRequest = {
          companyNo: editingQuota.companyNo || data.taxNumber, // 优先使用接口返回的companyNo，否则使用taxNumber
          taxNumber: data.taxNumber,
          statsDate: new Date().toISOString().slice(0, 7), // 当前年月，格式：YYYY-MM
          maxAmount: Number(data.maxAmount),
        };

        await InvoiceQuotaService.createInvoiceQuota(createData);
        toast.success("月度税务开票额度创建成功");
      } else {
        // 调用更新接口
        const updateData: UpdateInvoiceQuotaAmountRequest = {
          id: editingQuota.id,
          maxAmount: Number(data.maxAmount),
        };

        await InvoiceQuotaService.updateInvoiceQuotaAmount(updateData);
        toast.success("月度税务开票额度更新成功");
      }

      setShowModal(false);
      setEditingQuota(null);
      setFormData({ taxNumber: "", maxAmount: 0 });
      loadInvoiceQuotas();
    } catch (error) {
      console.error("保存月度税务开票额度失败:", error);
      toast.error("保存月度税务开票额度失败");
    } finally {
      setFormLoading(false);
    }
  };

  // 打开编辑模态框
  const openEditModal = (quota: InvoiceQuota) => {
    setEditingQuota(quota);
    setFormData({
      taxNumber: quota.taxNumber,
      maxAmount: quota.maxAmount,
    });
    setShowModal(true);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <FileText className="h-6 w-6 text-gray-600" />
          <h1 className="text-2xl font-bold text-gray-900">
            月度税务开票额度管理
          </h1>
        </div>
      </div>

      {/* 搜索 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="请输入公司名称或统一社会信用代码搜索"
              value={searchParams.companyName}
              onChange={(e) =>
                setSearchParams({
                  ...searchParams,
                  companyName: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
          >
            重置
          </button>
        </div>
      </div>

      {/* 开票额度列表 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            <span className="ml-2 text-gray-600">加载中...</span>
          </div>
        ) : quotas.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">暂无月度税务开票额度数据</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      公司名称
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      统一社会信用代码
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      月度税务开票额度
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      更新时间
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {quotas.map((quota) => (
                    <tr key={quota.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {quota.companyName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {quota.taxNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ¥{quota.maxAmount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {quota.updateTime
                          ? new Date(quota.updateTime).toLocaleString()
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openEditModal(quota)}
                            className="text-orange-600 hover:text-orange-900"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 分页 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  共 {totalElements} 条记录，第 {searchParams.page} /{" "}
                  {totalPages} 页
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(searchParams.page - 1)}
                    disabled={searchParams.page <= 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    上一页
                  </button>
                  <button
                    onClick={() => handlePageChange(searchParams.page + 1)}
                    disabled={searchParams.page >= totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    下一页
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* 编辑模态框 */}
      {showModal && (
        <InvoiceQuotaModal
          quota={editingQuota}
          formData={formData}
          formErrors={formErrors}
          onFormDataChange={setFormData}
          onSave={(data) => {
            if (editingQuota) {
              handleEdit(data);
            }
          }}
          onCancel={() => {
            setShowModal(false);
            setEditingQuota(null);
            setFormData({ taxNumber: "", maxAmount: 0 });
            setFormErrors({});
          }}
          loading={formLoading}
        />
      )}
    </div>
  );
}

// 编辑模态框组件
interface InvoiceQuotaModalProps {
  quota?: InvoiceQuota | null;
  formData: InvoiceQuotaRequest;
  formErrors: Record<string, string>;
  onFormDataChange: (data: InvoiceQuotaRequest) => void;
  onSave: (data: InvoiceQuotaRequest) => void;
  onCancel: () => void;
  loading: boolean;
}

function InvoiceQuotaModal({
  quota,
  formData,
  formErrors,
  onFormDataChange,
  onSave,
  onCancel,
  loading,
}: InvoiceQuotaModalProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">设置月度税务开票额度</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              公司名称
            </label>
            <input
              type="text"
              value={quota?.companyName || ""}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              统一社会信用代码
            </label>
            <input
              type="text"
              value={quota?.id ? quota?.taxNumber || "" : formData.taxNumber}
              disabled={!!quota?.id}
              onChange={
                !quota?.id
                  ? (e) =>
                      onFormDataChange({
                        ...formData,
                        taxNumber: e.target.value,
                      })
                  : undefined
              }
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 ${
                quota?.id ? "bg-gray-100 text-gray-600" : ""
              }`}
              placeholder={!quota?.id ? "请输入统一社会信用代码" : ""}
            />
            {formErrors.taxNumber && (
              <p className="text-red-500 text-xs mt-1">
                {formErrors.taxNumber}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              月度税务开票额度 (元) *
            </label>
            <input
              type="text"
              value={formData.maxAmount}
              onChange={(e) => {
                const val = e.target.value;
                if (/^\d*\.?\d*$/.test(val)) {
                  onFormDataChange({
                    ...formData,
                    maxAmount: val,
                  });
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              placeholder="请输入月度税务开票额度"
            />
            {formErrors.maxAmount && (
              <p className="text-red-500 text-xs mt-1">
                {formErrors.maxAmount}
              </p>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors disabled:opacity-50"
            >
              {loading ? "保存中..." : quota?.id ? "更新" : "创建"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
