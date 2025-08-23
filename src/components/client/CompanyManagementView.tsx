import React, { useState, useEffect } from "react";
import { Building2, Plus, Edit, Trash2, Search, X } from "lucide-react";
import { CompanyService } from "../../utils/companyService";
import { Company, CompanyQueryParams } from "../../types/company";
import { useAlert } from "../../hooks/useAlert";
import { AdminUserService } from "../../utils/adminUserService";
import { AdminUserInfo, UserRole } from "../../types/adminUser";

import toast from "react-hot-toast";
import { useAdminUserContext } from "../../contexts/AdminUserContext"; // 添加用户上下文

// 简化的创建公司请求接口
interface SimpleCreateCompanyRequest {
  companyName: string;
  taxNumber: string;
  isFranchise: boolean; // 是否是加盟商
  customerServiceId?: string; // 绑定的客服ID
}

export default function CompanyManagementView() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const { userInfo } = useAdminUserContext(); // 获取当前用户信息
  const isSuperAdmin = userInfo?.roleCode === "SUPER_ADMIN";

  const [loading, setLoading] = useState(false);
  // 初始化时页码为1
  const [searchParams, setSearchParams] = useState<CompanyQueryParams>({
    current: 1,
    size: 10,
  });
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchName, setSearchName] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // 添加删除加载状态
  const [deleteLoading, setDeleteLoading] = useState(false);

  // 客服列表状态
  const [customerServices, setCustomerServices] = useState<AdminUserInfo[]>([]);

  const { showAlert } = useAlert();

  // 简化的表单数据状态
  const [formData, setFormData] = useState<SimpleCreateCompanyRequest>({
    companyName: "",
    taxNumber: "",
    isFranchise: false, // 默认不是加盟商
    customerServiceId: "",
  });

  // 表单验证错误
  const [formErrors, setFormErrors] = useState<
    Partial<SimpleCreateCompanyRequest>
  >({});

  // 加载客服列表
  const loadCustomerServices = async () => {
    try {
      const response = await AdminUserService.getCustomerServiceList({
        page: 1,
        size: 100, // 获取所有客服
        roleCode: UserRole.CUSTOMER_SERVICE,
      });
      setCustomerServices(response.records);
    } catch (error) {
      console.error("加载客服列表失败:", error);
    }
  };

  // 加载公司列表
  // 修改 loadCompanies 函数，添加重置页码的选项
  const loadCompanies = async (resetToFirstPage = false) => {
    try {
      setLoading(true);

      // 如果需要重置到第一页，先更新 searchParams
      const params = resetToFirstPage
        ? { ...searchParams, current: 1 }
        : searchParams;

      const response = await CompanyService.getCompanyList(params);
      console.log("Companies:", response);
      setCompanies(response?.records || []);
      setCompanies(response?.records || []);
      setTotalPages(response?.pages || 0);
      setTotalElements(response?.total || 0);

      setSearchParams(params);
      // 如果重置到第一页，同时更新状态
      if (resetToFirstPage && searchParams.current !== 1) {
        setSearchParams(params);
      }
    } catch (error) {
      showAlert({ message: "加载公司列表失败" });
      console.error("Failed to load companies:", error);
      setCompanies([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  // 搜索公司
  // 搜索时重置为第1页
  const handleSearch = () => {
    setSearchParams({
      ...searchParams,
      current: 1,
      companyName: searchName || undefined,
    });
  };

  // 分页处理
  const handlePageChange = (page: number) => {
    setSearchParams({ ...searchParams, current: page });
  };

  // 打开创建模态框
  const handleOpenCreateModal = () => {
    setFormData({
      companyName: "",
      taxNumber: "",
      isFranchise: false,
      customerServiceId: "",
    });
    setFormErrors({});
    setShowCreateModal(true);
  };

  // 打开编辑模态框
  const handleOpenEditModal = (company: Company) => {
    setFormData({
      companyName: company.companyName,
      taxNumber: company.taxNumber,
      isFranchise: company.franchise || false,
      customerServiceId: company.customerServiceId || "",
    });
    setFormErrors({});
    setEditingCompany(company);
  };

  // 关闭模态框
  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingCompany(null);
    setFormData({
      companyName: "",
      taxNumber: "",
      isFranchise: false,
      customerServiceId: "",
    });
    setFormErrors({});
  };

  // 表单输入处理
  const handleInputChange = (
    field: keyof SimpleCreateCompanyRequest,
    value: string | boolean
  ) => {
    setFormData({ ...formData, [field]: value });
    // 清除对应字段的错误
    if (formErrors[field]) {
      setFormErrors({ ...formErrors, [field]: undefined });
    }
  };

  // 表单验证
  const validateForm = (): boolean => {
    const errors: Partial<SimpleCreateCompanyRequest> = {};

    if (!formData.companyName.trim()) {
      errors.companyName = "公司名称不能为空";
    }

    if (!formData.taxNumber.trim()) {
      errors.taxNumber = "公司税号不能为空";
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

      if (editingCompany) {
        // 编辑公司 - 构建完整的更新数据，保留原有字段
        await CompanyService.updateCompany({
          companyId: editingCompany.companyId,
          companyName: formData.companyName,
          taxNumber: formData.taxNumber,
          franchise: formData.isFranchise,
          customerServiceId: formData.customerServiceId,
        });
        toast.success("公司信息更新成功");
      } else {
        // 创建公司 - 使用默认值填充其他必需字段
        const createData = {
          companyName: formData.companyName,
          taxNumber: formData.taxNumber,
          franchise: formData.isFranchise, // 添加加盟商属性
          customerServiceId: formData.customerServiceId,
        };
        await CompanyService.createCompany(createData);
        toast.success("公司创建成功");
      }

      handleCloseModal();
      // 创建或更新后重置到第一页
      loadCompanies(true);
    } catch (error) {
      console.error("Failed to save company:", error);
    } finally {
      setFormLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
    loadCustomerServices();
  }, [searchParams]);

  // 在组件状态中添加
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // 删除公司
  const handleDelete = (id: string, companyName: string) => {
    setDeleteConfirm({ id, name: companyName });
  };

  // 确认删除
  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      setDeleteLoading(true);
      await CompanyService.deleteCompany(deleteConfirm.id);
      toast.success("删除成功");
      // 删除后重置到第一页
      loadCompanies(true);
    } catch (error) {
      toast.error("删除失败");
      console.error("Failed to delete company:", error);
    } finally {
      setDeleteLoading(false);
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Building2 className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">公司管理</h2>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>添加公司</span>
        </button>
      </div>
      {/* 搜索栏 */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="搜索公司名称..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          搜索
        </button>
      </div>
      {/* 公司列表 */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">加载中...</p>
        </div>
      ) : !companies || companies.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            暂无公司数据
          </h3>
          <p className="text-gray-600">点击上方"添加公司"按钮创建第一个公司</p>
        </div>
      ) : (
        <>
          {/* 表格 */}
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                    公司名称
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                    公司税号
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                    类型
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                    专属客服
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                    状态
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                    创建时间
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {companies?.map((company) => (
                  <tr key={company.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {company.companyName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {company.taxNumber}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          company.franchise
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {company.franchise ? "加盟商" : "非加盟商"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {company.customerServiceName || "未绑定"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          company.status === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {company.status === "ACTIVE" ? "正常" : "停用"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(company.createTime).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(company)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="编辑"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(company.companyId, company.companyName)
                          }
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="删除"
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

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-600">
                共 {totalElements} 条记录，第 {searchParams.current} /{" "}
                {totalPages} 页
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() =>
                    handlePageChange((searchParams.current ?? 1) - 1)
                  }
                  disabled={searchParams.current === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  上一页
                </button>
                <button
                  onClick={() =>
                    handlePageChange((searchParams.current ?? 1) + 1)
                  }
                  disabled={(searchParams.current ?? 1) >= totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  下一页
                </button>
              </div>
            </div>
          )}
        </>
      )}
      {/* 创建/编辑公司模态框 - 简化版 */}
      {(showCreateModal || editingCompany) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                {editingCompany ? "编辑公司" : "添加公司"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 公司名称 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  公司名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) =>
                    handleInputChange("companyName", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                    formErrors.companyName
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="请输入公司名称"
                  autoFocus
                />

                {formErrors.companyName && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.companyName}
                  </p>
                )}
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  公司税号 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.taxNumber}
                  onChange={(e) =>
                    handleInputChange("taxNumber", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                    formErrors.taxNumber ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="请输入公司税号"
                  autoFocus
                />

                {formErrors.taxNumber && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.taxNumber}
                  </p>
                )}
              </div>

              {/* 是否是加盟商 */}
              {isSuperAdmin && (
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.isFranchise}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isFranchise: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      是否是加盟商
                    </span>
                  </label>
                  <p className="mt-1 text-xs text-gray-500">
                    勾选此项表示该公司为加盟商，否则为直营公司
                  </p>
                </div>
              )}

              {/* 绑定客服 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  绑定客服
                </label>
                <select
                  value={formData.customerServiceId || ""}
                  onChange={(e) =>
                    handleInputChange("customerServiceId", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">请选择客服</option>
                  {customerServices.map((service) => (
                    <option key={service.userNo} value={service.userNo}>
                      {service.username}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  选择负责该公司的客服人员
                </p>
              </div>

              {/* 提示信息 */}
              {!editingCompany && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-700">
                    💡
                    其他信息（如公司代码、法人代表等）将使用默认值，您可以稍后完善。
                  </p>
                </div>
              )}

              {/* 按钮 */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {formLoading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  <span>{editingCompany ? "更新" : "创建"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">确认删除</h3>
            <p className="text-gray-600 mb-6">
              确定要删除公司 "{deleteConfirm.name}" 吗？此操作不可撤销。
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleteLoading}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                取消
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {deleteLoading && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                <span>{deleteLoading ? "删除中..." : "确认删除"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
