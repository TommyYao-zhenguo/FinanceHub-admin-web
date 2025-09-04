import React, { useState, useEffect } from "react";
import { X, Save, Calendar } from "lucide-react";
import toast from "react-hot-toast";
import { EmployeeBaseConfigService } from "../utils/employeeBaseConfigService";

interface Employee {
  id: string;
  employeeNo: string;
  employeeName: string;
  idCard?: string;
  socialInsuranceBase?: number;
  housingFundBase?: number;
}

interface EmployeeBaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  onSaveSuccess: () => void;
}

// 获取当前月份 (YYYY-MM 格式)
const getCurrentMonth = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

export default function EmployeeBaseConfigModal({
  isOpen,
  onClose,
  employee,
  onSaveSuccess,
}: EmployeeBaseConfigModalProps) {
  const [formData, setFormData] = useState({
    socialInsuranceBase: 0,
    housingFundBase: 0,
    effectiveMonth: getCurrentMonth(),
  });
  const [loading, setLoading] = useState(false);

  // 当员工信息变化时，更新表单数据
  useEffect(() => {
    if (employee) {
      setFormData({
        socialInsuranceBase: employee.socialInsuranceBase || 0,
        housingFundBase: employee.housingFundBase || 0,
        effectiveMonth: getCurrentMonth(),
      });
    }
  }, [employee]);

  // 处理保存
  const handleSave = async () => {
    if (!employee) return;

    try {
      setLoading(true);
      
      // 将归属期月份转换为日期格式 (YYYY-MM-01)
      const effectiveDate = `${formData.effectiveMonth}-01`;
      
      // 调用更新接口
      await EmployeeBaseConfigService.updateEmployeeBase(
        parseInt(employee.id),
        {
          socialSecurityBase: formData.socialInsuranceBase,
          housingFundBase: formData.housingFundBase,
          effectiveDate: effectiveDate,
        }
      );

      toast.success(`已保存${formData.effectiveMonth}月的基数配置`);
      onSaveSuccess();
      onClose();
    } catch (error) {
      console.error("保存失败:", error);
      toast.error("保存失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  // 处理关闭
  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!isOpen || !employee) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            配置社保和公积金基数
          </h3>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6 space-y-4">
          {/* 员工信息 */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">员工信息</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <div>姓名：{employee.employeeName}</div>
              <div>身份证：{employee.idCard}</div>
            </div>
          </div>

          {/* 归属期选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline h-4 w-4 mr-1" />
              归属期月份
            </label>
            <input
              type="month"
              value={formData.effectiveMonth}
              onChange={(e) =>
                setFormData({ ...formData, effectiveMonth: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            />
          </div>

          {/* 社保基数 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              社保基数
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.socialInsuranceBase}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  socialInsuranceBase: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="请输入社保基数"
              disabled={loading}
            />
          </div>

          {/* 公积金基数 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              公积金基数
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.housingFundBase}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  housingFundBase: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="请输入公积金基数"
              disabled={loading}
            />
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                保存中...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                保存
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}