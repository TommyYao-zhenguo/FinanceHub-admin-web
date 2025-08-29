import React, { useState, useEffect } from "react";
import {
  Users,
  Save,
  Edit,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import toast from "react-hot-toast";
import { EmployeeBaseConfigService } from "../utils/employeeBaseConfigService";
import {
  Employee,
  EmployeeBaseConfig,
  EmployeeQueryParams,
  BackendEmployeeData,
} from "../types/employeeBaseConfig";
import CompanyListStep from "./CompanyListStep";

interface EmployeeWithConfig extends Employee {
  baseConfig?: EmployeeBaseConfig;
  socialInsuranceBase?: number;
  housingFundBase?: number;
  effectiveDate?: string;
}

export default function EmployeeBaseConfigView() {
  const [currentStep, setCurrentStep] = useState<"company" | "employee">(
    "company"
  );
  const [selectedCompanyNo, setSelectedCompanyNo] = useState<string>("");
  const [selectedCompanyName, setSelectedCompanyName] = useState<string>("");
  const [employees, setEmployees] = useState<EmployeeWithConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchEmployeeName, setSearchEmployeeName] = useState<string>("");
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(
    null
  );
  const [editingData, setEditingData] = useState<{
    socialInsuranceBase?: number;
    housingFundBase?: number;
    effectiveDate: string;
  }>({ effectiveDate: new Date().toISOString().split("T")[0] });

  // 分页状态
  const [pagination, setPagination] = useState({
    current: 1,
    size: 10,
    total: 0,
    pages: 0,
  });

  // 加载员工列表和基数配置
  const loadEmployeesWithConfig = async () => {
    if (!selectedCompanyNo) return;

    try {
      setLoading(true);
      const params: EmployeeQueryParams = {
        current: pagination.current,
        size: pagination.size,
        companyNo: selectedCompanyNo,
        employeeName: searchEmployeeName || undefined,
        status: "ACTIVE",
      };

      const response = await EmployeeBaseConfigService.getEmployeeList(params);

      // 直接使用后端返回的基数信息，转换为前端需要的格式
      const employeesWithConfig: EmployeeWithConfig[] = response.records.map(
        (employee: BackendEmployeeData) => {
          return {
            id: employee.id.toString(), // 转换为字符串
            employeeNo: employee.employeeNo,
            employeeName: employee.employeeName,
            companyNo: employee.companyNo,
            companyName: employee.companyName || "",
            status:
              employee.status === 1
                ? "ACTIVE"
                : ("INACTIVE" as "ACTIVE" | "INACTIVE"),
            hireDate: employee.hireDate,
            phone: employee.phone,
            idCard: employee.idCard,
            createTime: employee.createTime,
            updateTime: employee.updateTime,
            socialInsuranceBase: employee.socialSecurityBase || 0,
            housingFundBase: employee.housingFundBase || 0,
            effectiveDate: new Date().toISOString().split("T")[0], // 默认当前日期
          };
        }
      );

      setEmployees(employeesWithConfig);

      setPagination({
        current: response.current,
        size: response.size,
        total: response.total,
        pages: response.pages,
      });
    } catch (error) {
      console.error("加载员工列表失败:", error);
      toast.error("加载员工列表失败");
    } finally {
      setLoading(false);
    }
  };

  // 公司选择变化
  const handleCompanySelect = (companyNo: string, companyName: string) => {
    setSelectedCompanyNo(companyNo);
    setSelectedCompanyName(companyName);
    setCurrentStep("employee");
    setPagination({ ...pagination, current: 1 });
  };

  // 返回公司选择
  const handleBackToCompanyList = () => {
    setCurrentStep("company");
    setSelectedCompanyNo("");
    setSelectedCompanyName("");
    setEmployees([]);
    setSearchEmployeeName("");
    setEditingEmployeeId(null);
  };

  // 搜索员工
  const handleSearch = () => {
    setPagination({ ...pagination, current: 1 });
    loadEmployeesWithConfig();
  };

  // 开始编辑
  const handleEdit = (employee: EmployeeWithConfig) => {
    setEditingEmployeeId(employee.employeeNo);
    setEditingData({
      socialInsuranceBase: employee.socialInsuranceBase || undefined,
      housingFundBase: employee.housingFundBase || undefined,
      effectiveDate:
        employee.effectiveDate || new Date().toISOString().split("T")[0],
    });
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setEditingEmployeeId(null);
    setEditingData({ effectiveDate: new Date().toISOString().split("T")[0] });
  };

  // 保存配置
  const handleSave = async (employee: EmployeeWithConfig) => {
    try {
      // 直接使用新的员工基数更新接口
      await EmployeeBaseConfigService.updateEmployeeBase(
        parseInt(employee.id), // 转换为数字ID
        {
          socialSecurityBase: editingData.socialInsuranceBase || 0,
          housingFundBase: editingData.housingFundBase || 0,
          effectiveDate: editingData.effectiveDate,
        }
      );

      toast.success("保存成功");
      handleCancelEdit();
      loadEmployeesWithConfig();
    } catch (error) {
      console.error("保存失败:", error);
      toast.error("保存失败");
    }
  };

  // 分页变化
  const handlePageChange = (page: number) => {
    setPagination({ ...pagination, current: page });
  };

  // 监听公司选择和分页变化
  useEffect(() => {
    if (selectedCompanyNo && currentStep === "employee") {
      loadEmployeesWithConfig();
    }
  }, [selectedCompanyNo, currentStep, pagination.current]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <Users className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">
            社保和公积金基数配置
          </h1>
        </div>
        <p className="text-gray-600">
          配置员工的社保基数和公积金基数，用于计算缴费金额
        </p>
      </div>

      {/* 公司选择步骤 */}
      {currentStep === "company" && (
        <CompanyListStep onCompanySelect={handleCompanySelect} />
      )}

      {/* 员工配置步骤 */}
      {currentStep === "employee" && selectedCompanyNo && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleBackToCompanyList}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-offset-2 focus:ring-blue-500"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  返回公司列表
                </button>
                <h2 className="text-lg font-semibold text-gray-900">
                  {selectedCompanyName} - 员工基数配置
                </h2>
              </div>
            </div>

            {/* 搜索栏 */}
            <div className="flex items-center space-x-4">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="搜索员工姓名"
                    value={searchEmployeeName}
                    onChange={(e) => setSearchEmployeeName(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                搜索
              </button>
            </div>
          </div>

          {/* 员工表格 */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    员工信息
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    社保基数
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    公积金基数
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
                      colSpan={5}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      加载中...
                    </td>
                  </tr>
                ) : employees.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      暂无员工数据
                    </td>
                  </tr>
                ) : (
                  employees.map((employee) => (
                    <tr key={employee.employeeNo} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            员工姓名：{employee.employeeName}
                          </div>
                          <div className="text-sm text-gray-500">
                            身份证号码：{employee.idCard}
                          </div>
                          {employee.department && (
                            <div className="text-sm text-gray-500">
                              {employee.department}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {editingEmployeeId === employee.employeeNo ? (
                          <div className="flex items-center space-x-2">
                            <input
                              value={editingData.socialInsuranceBase || 0}
                              onChange={(e) =>
                                setEditingData({
                                  ...editingData,
                                  socialInsuranceBase: e.target.value
                                    ? Number(e.target.value)
                                    : undefined,
                                })
                              }
                              className="w-24 px-2 py-1 border border-gray-300 rounded text-sm  focus:ring-blue-500 focus:border-transparent"
                              placeholder="基数"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-900">
                              {employee.socialInsuranceBase
                                ? `${employee.socialInsuranceBase.toLocaleString()}`
                                : "未配置"}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingEmployeeId === employee.employeeNo ? (
                          <div className="flex items-center space-x-2">
                            <input
                              value={editingData.housingFundBase || 0}
                              onChange={(e) =>
                                setEditingData({
                                  ...editingData,
                                  housingFundBase: e.target.value
                                    ? Number(e.target.value)
                                    : undefined,
                                })
                              }
                              className="w-24 px-2 py-1 border border-gray-300 rounded text-sm  focus:ring-blue-500 focus:border-transparent"
                              placeholder="基数"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-900">
                              {employee.housingFundBase
                                ? `${employee.housingFundBase.toLocaleString()}`
                                : "未配置"}
                            </span>
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {editingEmployeeId === employee.employeeNo ? (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleSave(employee)}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none   focus:ring-offset-2 focus:ring-green-500"
                            >
                              <Save className="h-4 w-4 mr-1" />
                              保存
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none   focus:ring-offset-2 focus:ring-blue-500"
                            >
                              取消
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEdit(employee)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200 focus:outline-none  focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            编辑
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 分页 */}
          {pagination.total > 0 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  显示 {(pagination.current - 1) * pagination.size + 1} 到{" "}
                  {Math.min(
                    pagination.current * pagination.size,
                    pagination.total
                  )}{" "}
                  条， 共 {pagination.total} 条记录
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.current - 1)}
                    disabled={pagination.current <= 1}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    上一页
                  </button>
                  <span className="text-sm text-gray-700">
                    第 {pagination.current} 页，共 {pagination.pages} 页
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.current + 1)}
                    disabled={pagination.current >= pagination.pages}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    下一页
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
