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
  UserRoleOption,
} from "../types/adminUser";
import { useUserContext } from "../contexts/UserContext"; // 添加用户上下文

export default function AdminUserManagementView() {
  const { userInfo } = useUserContext(); // 获取当前用户信息
  const [users, setUsers] = useState<AdminUserInfo[]>([]);
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
    page: 1,
    size: 10,
    username: "",
    roleCode: UserRole.CUSTOMER_SERVICE,
    status: undefined,
  });

  // 分页信息
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // 表单数据
  const [formData, setFormData] = useState<CreateUserRequest>({
    username: "",
    password: "",
    roleCode: UserRole.CUSTOMER_SERVICE,
  });

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
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
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
    setSearchParams({ ...searchParams, page: 1 });
  };

  // 分页处理
  const handlePageChange = (page: number) => {
    setSearchParams({ ...searchParams, page });
  };

  // 打开添加用户模态框
  const handleAdd = () => {
    setEditingUser(null);
    setFormData({
      username: "",
      password: "",
      roleCode: UserRole.CUSTOMER_SERVICE,
    });
    setShowModal(true);
  };

  // 打开编辑用户模态框
  const handleEdit = (user: AdminUserInfo) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: "",
      roleCode: user.roleCode as UserRole,
    });
    setShowModal(true);
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editingUser) {
        const updateData: UpdateUserRequest = {
          id: editingUser.id,
          username: formData.username,
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                    客服信息
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
                          {user.username}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.status === "正常"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.status}
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
              共 {totalElements} 条记录，第 {searchParams.page} / {totalPages}{" "}
              页
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(searchParams.page! - 1)}
                disabled={searchParams.page === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                上一页
              </button>
              <button
                onClick={() => handlePageChange(searchParams.page! + 1)}
                disabled={searchParams.page === totalPages}
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
                  客服账号名称 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  客服账号密码 {editingUser ? "(留空则不修改)" : "*"}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required={!editingUser}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
