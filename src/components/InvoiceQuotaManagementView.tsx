import React, { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Search,
  Building2,
  ArrowLeft,
} from "lucide-react";
import toast from "react-hot-toast";
import { CompanyService } from "../utils/companyService";
import { Company } from "../types/company";
import {
  InvoiceQuotaService,
  InvoiceQuota,
  CreateInvoiceQuotaRequest,
  UpdateInvoiceQuotaRequest,
  InvoiceQuotaPageResponse,
  InvoiceQuotaQueryParams,
} from "../utils/invoiceQuotaService";

export default function InvoiceQuotaManagementView() {
  // 页面状态：'company-list' | 'quota-list'
  const [currentView, setCurrentView] = useState<"company-list" | "quota-list">(
    "company-list"
  );
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  // 公司列表相关状态
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyLoading, setCompanyLoading] = useState(false);
  const [companySearchKeyword, setCompanySearchKeyword] = useState("");
  const [companyPagination, setCompanyPagination] = useState({
    current: 1,
    size: 10,
    total: 0,
    pages: 0,
  });

  // 开票额度列表相关状态
  const [invoiceQuotas, setInvoiceQuotas] = useState<InvoiceQuota[]>([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingQuota, setEditingQuota] = useState<InvoiceQuota | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    quota: InvoiceQuota | null;
  }>({ show: false, quota: null });

  // 开票额度搜索参数
  const [searchParams, setSearchParams] = useState<InvoiceQuotaQueryParams>({
    page: 1,
    size: 10,
    companyNo: undefined,
    statsDate: "",
  });

  // 分页信息
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // 加载公司列表
  const loadCompanies = async () => {
    try {
      setCompanyLoading(true);
      const response = await CompanyService.getCompanyList({
        current: companyPagination.current,
        size: companyPagination.size,
        companyName: companySearchKeyword,
      });
      setCompanies(response.records || []);
      setCompanyPagination({
        ...companyPagination,
        total: response.total || 0,
        pages: response.pages || 0,
      });
    } catch (error) {
      console.error("加载公司列表失败:", error);
      toast.error("加载公司列表失败");
    } finally {
      setCompanyLoading(false);
    }
  };

  // 加载开票额度数据
  const loadInvoiceQuotas = async () => {
    if (!selectedCompany) return;

    try {
      setLoading(true);

      const response: InvoiceQuotaPageResponse =
        await InvoiceQuotaService.getInvoiceQuotaList({
          page: searchParams.page || 1,
          size: searchParams.size || 10,
          companyNo: selectedCompany.companyNo,
          statsDate: searchParams.statsDate,
        });

      setInvoiceQuotas(response.records || []);
      setTotalElements(response.total || 0);
      setTotalPages(response.pages || 0);
    } catch (error) {
      console.error("加载开票额度列表失败:", error);
      toast.error("加载开票额度列表失败");
      setInvoiceQuotas([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  // 初始化加载公司列表
  useEffect(() => {
    loadCompanies();
  }, [companyPagination.current, companySearchKeyword]);

  // 当选择公司或搜索参数变化时加载开票额度
  useEffect(() => {
    if (selectedCompany && currentView === "quota-list") {
      loadInvoiceQuotas();
    }
  }, [selectedCompany, searchParams, currentView]);

  // 选择公司
  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company);
    setCurrentView("quota-list");
    setSearchParams({
      page: 1,
      size: 10,
      companyNo: company.companyNo,
      statsDate: "",
    });
  };

  // 返回公司列表
  const handleBackToCompanyList = () => {
    setCurrentView("company-list");
    setSelectedCompany(null);
    setInvoiceQuotas([]);
  };

  // 公司分页处理
  const handleCompanyPageChange = (page: number) => {
    setCompanyPagination({ ...companyPagination, current: page });
  };

  // 添加开票额度
  const handleAdd = async (data: CreateInvoiceQuotaRequest) => {
    try {
      setFormLoading(true);
      await InvoiceQuotaService.createInvoiceQuota({
        ...data,
        companyNo: selectedCompany!.companyNo,
      });
      toast.success("开票额度添加成功");
      setShowModal(false);
      loadInvoiceQuotas();
    } catch (error) {
      console.error("添加开票额度失败:", error);
      toast.error("添加开票额度失败");
    } finally {
      setFormLoading(false);
    }
  };

  // 编辑开票额度
  const handleEdit = async (data: UpdateInvoiceQuotaRequest) => {
    try {
      setFormLoading(true);
      await InvoiceQuotaService.updateInvoiceQuota(data);
      toast.success("开票额度更新成功");
      setShowModal(false);
      loadInvoiceQuotas();
    } catch (error) {
      console.error("更新开票额度失败:", error);
      toast.error("更新开票额度失败");
    } finally {
      setFormLoading(false);
    }
  };

  // 删除开票额度
  const handleDelete = async (quota: InvoiceQuota) => {
    if (!quota.id) {
      console.error('删除失败：记录ID为空');
      toast.error('删除失败：数据异常');
      setDeleteConfirm({ show: false, quota: null });
      return;
    }
    
    try {
      setDeleteLoading(true);
      await InvoiceQuotaService.deleteInvoiceQuota(quota.id);
      toast.success("开票额度删除成功");
      setDeleteConfirm({ show: false, quota: null });
      loadInvoiceQuotas();
    } catch (error) {
      console.error("删除开票额度失败:", error);
      toast.error("删除开票额度失败");
    } finally {
      setDeleteLoading(false);
    }
  };

  // 打开编辑模态框
  const openEditModal = (quota: InvoiceQuota) => {
    if (!quota.id) {
      console.error('无法编辑：记录ID为空');
      toast.error('编辑失败：数据异常，请刷新页面重试');
      return;
    }
    setEditingQuota(quota);
    setShowModal(true);
  };

  // 打开删除确认模态框
  const openDeleteConfirm = (quota: InvoiceQuota) => {
    if (!quota.id) {
      console.error('无法删除：记录ID为空');
      toast.error('删除失败：数据异常，请刷新页面重试');
      return;
    }
    setDeleteConfirm({ show: true, quota });
  };

  // 渲染公司列表视图
  const renderCompanyListView = () => (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <FileText className="h-6 w-6 text-gray-600" />
          <h1 className="text-2xl font-bold text-gray-900">开票额度管理</h1>
        </div>
      </div>

      {/* 搜索 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="请输入公司名称搜索"
              value={companySearchKeyword}
              onChange={(e) => setCompanySearchKeyword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <button
            onClick={() => loadCompanies()}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 公司列表 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {companyLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            <span className="ml-2 text-gray-600">加载中...</span>
          </div>
        ) : companies.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">暂无公司数据</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
              {companies.map((company) => (
                <div
                  key={company.id}
                  onClick={() => handleCompanySelect(company)}
                  className="p-4 border border-gray-200 rounded-lg hover:border-orange-500 hover:shadow-md cursor-pointer transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <Building2 className="w-8 h-8 text-orange-600" />
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {company.companyName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {company.companyNo}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 分页 */}
            {companyPagination.pages > 1 && (
              <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  共 {companyPagination.total} 家公司
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() =>
                      handleCompanyPageChange(companyPagination.current - 1)
                    }
                    disabled={companyPagination.current <= 1}
                    className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    上一页
                  </button>
                  <span className="text-sm text-gray-600">
                    第 {companyPagination.current} 页，共{" "}
                    {companyPagination.pages} 页
                  </span>
                  <button
                    onClick={() =>
                      handleCompanyPageChange(companyPagination.current + 1)
                    }
                    disabled={
                      companyPagination.current >= companyPagination.pages
                    }
                    className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    下一页
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  // 渲染开票额度列表视图
  const renderQuotaListView = () => (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleBackToCompanyList}
            className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 mr-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>返回</span>
          </button>
          <FileText className="h-6 w-6 text-gray-600" />
          <h1 className="text-2xl font-bold text-gray-900">
            {selectedCompany?.companyName} - 月度税务开票额度
          </h1>
        </div>
        <button
          onClick={() => {
            setEditingQuota(null);
            setShowModal(true);
          }}
          className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>添加开票额度</span>
        </button>
      </div>

      {/* 搜索和筛选 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              所属月份
            </label>
            <input
              type="month"
              value={searchParams.statsDate || ""}
              onChange={(e) =>
                setSearchParams({
                  ...searchParams,
                  statsDate: e.target.value,
                  page: 1,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => loadInvoiceQuotas()}
              className="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
            >
              搜索
            </button>
          </div>
        </div>
      </div>

      {/* 开票额度列表 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            <span className="ml-2 text-gray-600">加载中...</span>
          </div>
        ) : !invoiceQuotas || invoiceQuotas.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">暂无开票额度数据</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      所属月份
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      最大开票额度
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      创建时间
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
                  {invoiceQuotas.map((quota) => (
                    <tr key={quota.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {quota.statsDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ¥{quota.maxAmount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {quota.createTime
                          ? new Date(quota.createTime).toLocaleString()
                          : "-"}
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
                          <button
                            onClick={() => openDeleteConfirm(quota)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
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
                    onClick={() =>
                      setSearchParams({
                        ...searchParams,
                        page: (searchParams.page || 1) - 1,
                      })
                    }
                    disabled={(searchParams.page || 1) <= 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    上一页
                  </button>
                  <button
                    onClick={() =>
                      setSearchParams({
                        ...searchParams,
                        page: (searchParams.page || 1) + 1,
                      })
                    }
                    disabled={(searchParams.page || 1) >= totalPages}
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
    </div>
  );

  return (
    <div>
      {currentView === "company-list"
        ? renderCompanyListView()
        : renderQuotaListView()}

      {/* 添加/编辑模态框 */}
      {showModal && (
        <InvoiceQuotaModal
          quota={editingQuota}
          companyNo={selectedCompany?.companyNo || ""}
          onSave={(data) => {
            if (editingQuota) {
              handleEdit(data as UpdateInvoiceQuotaRequest);
            } else {
              handleAdd(data as CreateInvoiceQuotaRequest);
            }
          }}
          onCancel={() => {
            setShowModal(false);
            setEditingQuota(null);
          }}
          loading={formLoading}
        />
      )}

      {/* 删除确认模态框 */}
      {deleteConfirm.show && deleteConfirm.quota && (
        <DeleteConfirmModal
          quota={deleteConfirm.quota}
          onConfirm={handleDelete}
          onCancel={() => setDeleteConfirm({ show: false, quota: null })}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}

// 开票额度模态框组件
interface InvoiceQuotaModalProps {
  quota?: InvoiceQuota | null;
  companyNo: string;
  onSave: (data: CreateInvoiceQuotaRequest | UpdateInvoiceQuotaRequest) => void;
  onCancel: () => void;
  loading: boolean;
}

function InvoiceQuotaModal({
  quota,
  companyNo,
  onSave,
  onCancel,
  loading,
}: InvoiceQuotaModalProps) {
  const [formData, setFormData] = useState<CreateInvoiceQuotaRequest>({
    companyNo: quota?.companyNo || companyNo,
    statsDate: quota?.statsDate || "",
    maxAmount: quota?.maxAmount || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quota && quota.id) {
      onSave({ ...formData, id: quota.id } as UpdateInvoiceQuotaRequest);
    } else if (quota && !quota.id) {
      console.error('编辑模式下quota.id不能为空');
      alert('编辑失败：数据异常，请刷新页面重试');
      return;
    } else {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">
          {quota ? "编辑开票额度" : "添加开票额度"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              统计月份 *
            </label>
            <input
              type="month"
              required
              value={formData.statsDate}
              onChange={(e) =>
                setFormData({ ...formData, statsDate: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              最大开票额度 *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={formData.maxAmount}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  maxAmount: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
            >
              {loading ? "保存中..." : "保存"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 删除确认模态框组件
interface DeleteConfirmModalProps {
  quota: InvoiceQuota;
  onConfirm: (quota: InvoiceQuota) => void;
  onCancel: () => void;
  loading: boolean;
}

function DeleteConfirmModal({
  quota,
  onConfirm,
  onCancel,
  loading,
}: DeleteConfirmModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">确认删除</h2>
        <p className="text-gray-600 mb-6">
          确定要删除 {quota.statsDate} 的开票额度配置吗？此操作不可撤销。
        </p>
        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            取消
          </button>
          <button
            onClick={() => onConfirm(quota)}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "删除中..." : "确认删除"}
          </button>
        </div>
      </div>
    </div>
  );
}
