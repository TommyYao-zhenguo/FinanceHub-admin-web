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
import {
  InvoiceTypeService,
  InvoiceType,
  CreateInvoiceTypeRequest,
  UpdateInvoiceTypeRequest,
  InvoiceTypePageResponse,
} from "../utils/invoiceTypeService";
import { CompanyService } from "../utils/companyService";
import { Company } from "../types/company";

// 查询参数
interface InvoiceTypeQueryParams {
  page?: number;
  size?: number;
  name?: string;
  companyNo?: string;
}

export default function InvoiceTypeManagementView() {
  // 页面状态：'company-list' | 'invoice-type-list'
  const [currentView, setCurrentView] = useState<
    "company-list" | "invoice-type-list"
  >("company-list");
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

  // 发票类型列表相关状态
  const [invoiceTypes, setInvoiceTypes] = useState<InvoiceType[]>([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingInvoiceType, setEditingInvoiceType] =
    useState<InvoiceType | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    invoiceType: InvoiceType | null;
  }>({ show: false, invoiceType: null });

  // 发票类型搜索参数
  const [searchParams, setSearchParams] = useState<InvoiceTypeQueryParams>({
    page: 1,
    size: 10,
    name: "",
    companyNo: undefined,
  });

  // 发票类型分页信息
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // 加载公司列表
  const loadCompanies = async () => {
    try {
      setCompanyLoading(true);
      const params = {
        current: companyPagination.current,
        size: companyPagination.size,
        status: "ACTIVE" as const,
        ...(companySearchKeyword && { companyName: companySearchKeyword }),
      };

      const response = await CompanyService.getCompanyList(params);
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

  // 加载发票类型数据
  const loadInvoiceTypes = async () => {
    if (!selectedCompany) return;

    try {
      setLoading(true);

      const queryParams = {
        current: searchParams.page || 1,
        size: searchParams.size || 10,
        companyNo: selectedCompany.companyNo,
        ...(searchParams.name && { name: searchParams.name }),
      };

      const response: InvoiceTypePageResponse =
        await InvoiceTypeService.getInvoiceTypeList(
          queryParams.current,
          queryParams.size,
          queryParams.name,
          queryParams.companyNo
        );

      setInvoiceTypes(response.content || []);
      setTotalElements(response.totalElements || 0);
      setTotalPages(response.totalPages || 0);
    } catch (error) {
      console.error("加载发票类型列表失败:", error);
      toast.error("加载发票类型列表失败");
      // 确保在错误情况下重置状态
      setInvoiceTypes([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  // 监听公司分页和搜索变化
  useEffect(() => {
    if (currentView === "company-list") {
      loadCompanies();
    }
  }, [companyPagination.current, currentView]);

  // 监听公司搜索关键词变化
  useEffect(() => {
    if (currentView === "company-list") {
      const timer = setTimeout(() => {
        setCompanyPagination({ ...companyPagination, current: 1 });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [companySearchKeyword]);

  // 监听发票类型搜索参数变化
  useEffect(() => {
    if (currentView === "invoice-type-list" && selectedCompany) {
      loadInvoiceTypes();
    }
  }, [searchParams, selectedCompany, currentView]);

  // 选择公司
  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company);
    setCurrentView("invoice-type-list");
    setSearchParams({
      page: 1,
      size: 10,
      name: "",
      companyNo: company.companyNo,
    });
  };

  // 返回公司列表
  const handleBackToCompanyList = () => {
    setCurrentView("company-list");
    setSelectedCompany(null);
    setInvoiceTypes([]);
  };

  // 公司搜索
  const handleCompanySearch = () => {
    setCompanyPagination({ ...companyPagination, current: 1 });
  };

  // 公司分页处理
  const handleCompanyPageChange = (page: number) => {
    setCompanyPagination({ ...companyPagination, current: page });
  };

  // 添加发票类型
  const handleAdd = async (data: CreateInvoiceTypeRequest) => {
    if (!selectedCompany) {
      toast.error("请先选择公司");
      return;
    }

    try {
      setFormLoading(true);
      const requestData = {
        ...data,
        companyNo: selectedCompany.companyNo,
      };
      await InvoiceTypeService.createInvoiceType(requestData);
      toast.success("发票类型创建成功");
      setShowModal(false);
      setEditingInvoiceType(null);
      loadInvoiceTypes(); // 重新加载数据
    } catch (error) {
      console.error("创建发票类型失败:", error);
      toast.error("创建发票类型失败");
    } finally {
      setFormLoading(false);
    }
  };

  // 编辑发票类型
  const handleEdit = async (data: UpdateInvoiceTypeRequest) => {
    if (!editingInvoiceType || !selectedCompany) return;

    try {
      setFormLoading(true);
      const dataToUpdate = {
        ...data,
        companyNo: selectedCompany.companyNo,
        id: editingInvoiceType.id,
      };
      await InvoiceTypeService.updateInvoiceType(dataToUpdate);
      toast.success("发票类型更新成功");
      setShowModal(false);
      setEditingInvoiceType(null);
      loadInvoiceTypes(); // 重新加载数据
    } catch (error) {
      console.error("更新发票类型失败:", error);
      toast.error("更新发票类型失败");
    } finally {
      setFormLoading(false);
    }
  };

  // 删除发票类型
  const handleDelete = async (invoiceType: InvoiceType) => {
    if (!selectedCompany) return;

    try {
      setDeleteLoading(true);
      await InvoiceTypeService.deleteInvoiceType(
        invoiceType.id,
        selectedCompany.companyNo
      );
      toast.success("发票类型删除成功");
      setDeleteConfirm({ show: false, invoiceType: null });
      loadInvoiceTypes(); // 重新加载数据
    } catch (error) {
      console.error("删除发票类型失败:", error);
      toast.error("删除发票类型失败");
    } finally {
      setDeleteLoading(false);
    }
  };

  // 打开编辑模态框
  const openEditModal = (invoiceType: InvoiceType) => {
    setEditingInvoiceType(invoiceType);
    setShowModal(true);
  };

  // 打开删除确认模态框
  const openDeleteConfirm = (invoiceType: InvoiceType) => {
    setDeleteConfirm({ show: true, invoiceType });
  };

  // 渲染公司列表视图
  const renderCompanyListView = () => (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Building2 className="h-6 w-6 text-gray-600" />
          <h1 className="text-2xl font-bold text-gray-900">选择公司</h1>
        </div>
      </div>

      {/* 搜索栏 */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <input
              type="text"
              placeholder="输入公司名称进行搜索..."
              value={companySearchKeyword}
              onChange={(e) => setCompanySearchKeyword(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleCompanySearch()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>
        <button
          onClick={handleCompanySearch}
          className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
        >
          搜索
        </button>
      </div>

      {/* 公司列表 */}
      {companyLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          <p className="mt-2 text-gray-600">加载中...</p>
        </div>
      ) : companies.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            暂无公司数据
          </h3>
          <p className="text-gray-600">请联系管理员添加公司信息</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map((company) => (
              <div
                key={company.id}
                onClick={() => handleCompanySelect(company)}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-orange-300 cursor-pointer transition-all"
              >
                <div className="flex items-center space-x-3">
                  <Building2 className="h-8 w-8 text-orange-600" />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {company.companyName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      税号: {company.taxNumber}
                    </p>
                    <div className="flex items-center mt-1">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          company.status === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {company.status === "ACTIVE" ? "启用" : "禁用"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 分页 */}
          {companyPagination.pages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-6">
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
                第 {companyPagination.current} 页，共 {companyPagination.pages}{" "}
                页
              </span>
              <button
                onClick={() =>
                  handleCompanyPageChange(companyPagination.current + 1)
                }
                disabled={companyPagination.current >= companyPagination.pages}
                className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                下一页
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );

  // 渲染发票类型列表视图
  const renderInvoiceTypeListView = () => (
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
            {selectedCompany?.companyName} - 发票类型管理
          </h1>
        </div>
        <button
          onClick={() => {
            setEditingInvoiceType(null);
            setShowModal(true);
          }}
          className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>添加发票类型</span>
        </button>
      </div>

      {/* 搜索和筛选 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              发票类型名称
            </label>
            <input
              type="text"
              placeholder="请输入发票类型名称"
              value={searchParams.name || ""}
              onChange={(e) =>
                setSearchParams({
                  ...searchParams,
                  name: e.target.value,
                  page: 1,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => loadInvoiceTypes()}
              className="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
            >
              搜索
            </button>
          </div>
        </div>
      </div>

      {/* 发票类型列表 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            <span className="ml-2 text-gray-600">加载中...</span>
          </div>
        ) : !invoiceTypes || invoiceTypes.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">暂无发票类型数据</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      发票类型名称
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
                  {invoiceTypes.map((invoiceType) => (
                    <tr key={invoiceType.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {invoiceType.name}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {invoiceType.createTime
                          ? new Date(invoiceType.createTime).toLocaleString()
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openEditModal(invoiceType)}
                            className="text-orange-600 hover:text-orange-900"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openDeleteConfirm(invoiceType)}
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
        : renderInvoiceTypeListView()}

      {/* 添加/编辑模态框 */}
      {showModal && (
        <InvoiceTypeModal
          invoiceType={editingInvoiceType}
          onSave={(data) => {
            if (editingInvoiceType) {
              handleEdit(data as UpdateInvoiceTypeRequest);
            } else {
              handleAdd(data as CreateInvoiceTypeRequest);
            }
          }}
          onCancel={() => {
            setShowModal(false);
            setEditingInvoiceType(null);
          }}
          loading={formLoading}
        />
      )}

      {/* 删除确认模态框 */}
      {deleteConfirm.show && deleteConfirm.invoiceType && (
        <DeleteConfirmModal
          invoiceType={deleteConfirm.invoiceType}
          onConfirm={handleDelete}
          onCancel={() => setDeleteConfirm({ show: false, invoiceType: null })}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}

// 发票类型模态框组件
interface InvoiceTypeModalProps {
  invoiceType?: InvoiceType | null;
  onSave: (data: CreateInvoiceTypeRequest | UpdateInvoiceTypeRequest) => void;
  onCancel: () => void;
  loading: boolean;
}

function InvoiceTypeModal({
  invoiceType,
  onSave,
  onCancel,
  loading,
}: InvoiceTypeModalProps) {
  const [formData, setFormData] = useState<CreateInvoiceTypeRequest>({
    name: invoiceType?.name || "",
    description: invoiceType?.description || "",
    companyNo: invoiceType?.companyNo || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (invoiceType) {
      onSave({ ...formData, id: invoiceType.id } as UpdateInvoiceTypeRequest);
    } else {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">
          {invoiceType ? "编辑发票类型" : "添加发票类型"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              发票类型名称 *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
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
  invoiceType: InvoiceType;
  onConfirm: (invoiceType: InvoiceType) => void;
  onCancel: () => void;
  loading: boolean;
}

function DeleteConfirmModal({
  invoiceType,
  onConfirm,
  onCancel,
  loading,
}: DeleteConfirmModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">确认删除</h2>
        <p className="text-gray-600 mb-6">
          确定要删除发票类型 "{invoiceType.name}" 吗？此操作不可撤销。
        </p>
        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            取消
          </button>
          <button
            onClick={() => onConfirm(invoiceType)}
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
