import React, { useState, useEffect } from "react";
import { Users, Plus, Edit, Trash2, Search, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { AdminUserService } from "../utils/adminUserService";
import {
  AdminUserInfo,
  CreateUserRequest,
  UpdateUserRequest,
  UserQueryParams,
  UserRole,
} from "../types/adminUser";

import { useAdminUserContext } from "../contexts/AdminUserContext";

export default function CustomerServiceManagementView() {
  const [users, setUsers] = useState<AdminUserInfo[]>([]);
  const { userInfo } = useAdminUserContext();
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUserInfo | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    user: AdminUserInfo | null;
  }>({ show: false, user: null });

  // 检查是否为超级管理员
  const isSuperAdmin = userInfo?.roleCode === "SUPER_ADMIN";

  // 搜索参数
  const [searchParams, setSearchParams] = useState<UserQueryParams>({
    current: 1,
    size: 10,
    username: "",
    roleCode: UserRole.CUSTOMER_SERVICE,
    status: undefined,
  });

  // 分页信息
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // 表单数据
  const [formData, setFormData] = useState<CreateUserRequest>({
    username: "",
    name: "",
    userNo: "",
    password: "",
    roleCode: UserRole.CUSTOMER_SERVICE,
  });

  // 表单错误状态
  const [formErrors, setFormErrors] = useState<{
    username?: string;
    name?: string;
    password?: string;
  }>({});

  // 加载用户列表
  const loadUsers = async (resetPage = false) => {
    setLoading(true);
    try {
      const params = resetPage ? { ...searchParams, page: 1 } : searchParams;
      if (resetPage) {
        setSearchParams(params);
      }
      const response = await AdminUserService.getCustomerServiceList(params);
      setUsers(response.records);
      setTotal(response.total);
      setTotalPages(response.pages);
    } catch (error) {
      console.error("加载客服列表失败:", error);
      toast.error("加载客服列表失败");
    } finally {
      setLoading(false);
    }
  };

  // 用户列表依赖搜索参数
  useEffect(() => {
    loadUsers();
  }, [searchParams]);

  //
  useEffect(() => {}, [isSuperAdmin]);

  // 搜索处理
  const handleSearch = () => {
    setSearchParams({ ...searchParams, current: 1 });
  };

  // 分页处理
  const handlePageChange = (page: number) => {
    setSearchParams({ ...searchParams, current: page });
  };

  // 打开添加用户模态框
  const handleAdd = () => {
    setEditingUser(null);
    setFormData({
      username: "",
      name: "",
      userNo: "",
      password: "",
      roleCode: UserRole.CUSTOMER_SERVICE,
    });
    setFormErrors({});
    setShowModal(true);
  };

  // 打开编辑用户模态框
  const handleEdit = (user: AdminUserInfo) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      userNo: user.userNo,
      name: user.name || "",
      password: "",
      roleCode: user.roleCode as UserRole,
    });
    setFormErrors({});
    setShowModal(true);
  };

  // 校验函数
  const validateForm = () => {
    const errors: { username?: string; name?: string; password?: string } = {};
    let isValid = true;

    // 校验登录账号
    if (!formData.username.trim()) {
      errors.username = "请输入客服登录账号";
      isValid = false;
    } else {
      // 登录账号格式校验：只能包含字母、数字、下划线，长度3-20位
      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
      if (!usernameRegex.test(formData.username)) {
        errors.username =
          "登录账号格式不正确，只能包含字母、数字、下划线，长度3-20位";
        isValid = false;
      }
    }

    // 校验客服名称
    if (!formData.name?.trim()) {
      errors.name = "请输入客服名称";
      isValid = false;
    } else if (formData.name && formData.name.length > 50) {
      errors.name = "客服名称长度不能超过50个字符";
      isValid = false;
    }

    // 校验密码
    if (!editingUser && !formData.password) {
      errors.password = "请输入登录密码";
      isValid = false;
    } else if (formData.password) {
      // 密码长度校验
      if (formData.password.length < 6 || formData.password.length > 16) {
        errors.password = "密码长度必须为6-16位";
        isValid = false;
      } else {
        // 密码复杂度校验：至少包含字母和数字
        const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,16}$/;
        if (!passwordRegex.test(formData.password)) {
          errors.password = "密码必须包含字母和数字，可包含特殊字符@$!%*?&";
          isValid = false;
        }
      }
    }

    setFormErrors(errors);
    return isValid;
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 表单校验
    if (!validateForm()) {
      return;
    }

    setFormLoading(true);
    try {
      if (editingUser) {
        const updateData: UpdateUserRequest = {
          userNo: editingUser.userNo,
          username: formData.username,
          name: formData.name,
          roleCode: formData.roleCode,
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        await AdminUserService.updateUser(updateData);
        toast.success("客服更新成功");
      } else {
        await AdminUserService.createCustomerServiceUser(formData);
        toast.success("客服创建成功");
      }
      setShowModal(false);
      loadUsers(true);
    } catch (error) {
      console.error("保存客服失败:", error);
      toast.error(editingUser ? "客服更新失败" : "客服创建失败");
    } finally {
      setFormLoading(false);
    }
  };

  // 删除用户
  const handleDelete = (user: AdminUserInfo) => {
    setDeleteConfirm({ show: true, user });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.user) return;
    setDeleteLoading(true);
    try {
      await AdminUserService.deleteUser(deleteConfirm.user.userNo);
      toast.success("客服删除成功");
      setDeleteConfirm({ show: false, user: null });
      loadUsers(true);
    } catch (error) {
      console.error("删除客服失败:", error);
      toast.error("客服删除失败");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Users className="w-6 h-6 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-900">客服管理</h2>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>添加客服</span>
        </button>
      </div>

      {/* 搜索栏 */}
      <div
        className={`grid grid-cols-1 md:grid-cols-${
          isSuperAdmin ? "4" : "3"
        } gap-4 mb-6`}
      >
        <div>
          <input
            type="text"
            placeholder="搜索客服名称"
            value={searchParams.username}
            onChange={(e) =>
              setSearchParams({ ...searchParams, username: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg  focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <div>
          <button
            onClick={handleSearch}
            className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Search className="w-4 h-4" />
            <span>搜索</span>
          </button>
        </div>
      </div>

      {/* 用户列表 */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">加载中...</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    客服姓名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    客服登陆账号
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
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.username}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.status === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.status === "ACTIVE" ? "正常" : "停用"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createTime).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
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
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-700">
              共 {total} 条记录，第 {searchParams.current} / {totalPages} 页
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(searchParams.current! - 1)}
                disabled={searchParams.current === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                上一页
              </button>
              <button
                onClick={() => handlePageChange(searchParams.current! + 1)}
                disabled={searchParams.current === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                下一页
              </button>
            </div>
          </div>
        </>
      )}

      {/* 添加/编辑用户模态框 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingUser ? "编辑客服" : "添加客服"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  客服登陆账号 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => {
                    setFormData({ ...formData, username: e.target.value });
                    if (formErrors.username) {
                      setFormErrors({ ...formErrors, username: undefined });
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-green-500 focus:border-transparent ${
                    formErrors.username ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="请输入登陆账号"
                />
                {formErrors.username ? (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.username}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-gray-500">
                    用于客服登录系统的账号，支持字母、数字、下划线，长度3-20位
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  客服名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (formErrors.name) {
                      setFormErrors({ ...formErrors, name: undefined });
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-green-500 focus:border-transparent ${
                    formErrors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="请输入客服名称"
                />
                {formErrors.name ? (
                  <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                ) : (
                  <p className="mt-1 text-xs text-gray-500">
                    客服的真实姓名，用于在系统中显示和识别客服身份
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  客服账号密码{" "}
                  {editingUser ? (
                    "(留空则不修改)"
                  ) : (
                    <span className="text-red-500">*</span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required={!editingUser}
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value });
                      if (formErrors.password) {
                        setFormErrors({ ...formErrors, password: undefined });
                      }
                    }}
                    className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-green-500 focus:border-transparent ${
                      formErrors.password ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="请输入登录密码"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {formErrors.password ? (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.password}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-gray-500">
                    {editingUser
                      ? "如需修改密码请输入新密码，留空则保持原密码不变"
                      : "密码长度6-16位，建议包含字母、数字和特殊字符以提高安全性"}
                  </p>
                )}
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {formLoading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  <span>{editingUser ? "更新" : "创建"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 删除确认模态框 */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">确认删除</h3>
            <p className="text-gray-600 mb-6">
              确定要删除客服 "{deleteConfirm.user?.username}"
              吗？此操作不可撤销。
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm({ show: false, user: null })}
                disabled={deleteLoading}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                取消
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {deleteLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <span>删除</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
