import React, { useState, useEffect } from "react";
import { Shield, Save, Plus, Edit, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { SocialInsuranceConfigService } from "../utils/socialInsuranceConfigService";
import { SocialInsuranceConfig } from "../types/socialInsuranceConfig";
import CompanySelector from "./CompanySelector";

export default function SocialInsuranceConfigView() {
  const [configs, setConfigs] = useState<SocialInsuranceConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');

  // 加载配置数据
  const loadConfigs = async () => {
    try {
      setLoading(true);
      const data = await SocialInsuranceConfigService.getConfigList();
      setConfigs(data.records);
    } catch (error) {
      console.error('加载社保配置失败:', error);
      toast.error('加载配置失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfigs();
  }, []);
  const [showForm, setShowForm] = useState(false);
  const [editingConfig, setEditingConfig] = useState<SocialInsuranceConfig | null>(null);
  const [formData, setFormData] = useState({
    companyId: '',
    pensionCompanyRate: '',
    pensionPersonalRate: '',
    medicalCompanyRate: '',
    medicalPersonalRate: '',
    unemploymentCompanyRate: '',
    unemploymentPersonalRate: '',
    workInjuryCompanyRate: '',
    maternityCompanyRate: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // 创建多个配置项
      const configsToSave = [
        {
          insuranceType: 'pension',
          insuranceName: '养老保险',
          companyRate: parseFloat(formData.pensionCompanyRate),
          personalRate: parseFloat(formData.pensionPersonalRate),
          isActive: true
        },
        {
          insuranceType: 'medical',
          insuranceName: '医疗保险',
          companyRate: parseFloat(formData.medicalCompanyRate),
          personalRate: parseFloat(formData.medicalPersonalRate),
          isActive: true
        },
        {
          insuranceType: 'unemployment',
          insuranceName: '失业保险',
          companyRate: parseFloat(formData.unemploymentCompanyRate),
          personalRate: parseFloat(formData.unemploymentPersonalRate),
          isActive: true
        },
        {
          insuranceType: 'injury',
          insuranceName: '工伤保险',
          companyRate: parseFloat(formData.workInjuryCompanyRate),
          personalRate: 0,
          isActive: true
        },
        {
          insuranceType: 'maternity',
          insuranceName: '生育保险',
          companyRate: parseFloat(formData.maternityCompanyRate),
          personalRate: 0,
          isActive: true
        }
      ];

      // 保存所有配置
      for (const config of configsToSave) {
        await SocialInsuranceConfigService.createConfig(config);
      }
      
      await loadConfigs();
      toast.success(editingConfig ? "更新成功" : "创建成功");
      setShowForm(false);
      setEditingConfig(null);
      resetForm();
    } catch (error) {
      console.error("操作失败:", error);
      toast.error("操作失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      companyId: '',
      pensionCompanyRate: '',
      pensionPersonalRate: '',
      medicalCompanyRate: '',
      medicalPersonalRate: '',
      unemploymentCompanyRate: '',
      unemploymentPersonalRate: '',
      workInjuryCompanyRate: '',
      maternityCompanyRate: '',
    });
  };

  const handleEdit = (config: SocialInsuranceConfig) => {
    setEditingConfig(config);
    // 由于新的API结构，编辑功能需要重新设计
    // 暂时禁用编辑功能
    toast.error('编辑功能正在开发中');
  };

  const handleDelete = async (configId: string) => {
    if (!confirm("确定要删除这个配置吗？")) return;
    
    try {
      setLoading(true);
      await SocialInsuranceConfigService.deleteConfig(configId);
      await loadConfigs();
      toast.success("删除成功");
    } catch (error) {
      console.error("删除失败:", error);
      toast.error("删除失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">社保比例配置</h1>
            <p className="text-gray-600">管理各公司的社保缴费比例设置</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <CompanySelector
            value={selectedCompanyId}
            onChange={(id) => {
              setSelectedCompanyId(id);
            }}
            className="min-w-[200px]"
          />
          <button
            onClick={() => {
              setEditingConfig(null);
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>新增配置</span>
          </button>
        </div>
      </div>

      {/* 配置列表 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">社保配置列表</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  公司名称
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  养老保险
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  医疗保险
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  失业保险
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  工伤保险
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  生育保险
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {configs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    暂无配置数据
                  </td>
                </tr>
              ) : (
                configs.map((config) => (
                  <tr key={config.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {config.insuranceName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        公司: {config.insuranceType === 'pension' ? `${config.companyRate}%` : '-'}
                      </div>
                      <div className="text-sm text-gray-500">
                        个人: {config.insuranceType === 'pension' ? `${config.personalRate}%` : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        公司: {config.insuranceType === 'medical' ? `${config.companyRate}%` : '-'}
                      </div>
                      <div className="text-sm text-gray-500">
                        个人: {config.insuranceType === 'medical' ? `${config.personalRate}%` : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        公司: {config.insuranceType === 'unemployment' ? `${config.companyRate}%` : '-'}
                      </div>
                      <div className="text-sm text-gray-500">
                        个人: {config.insuranceType === 'unemployment' ? `${config.personalRate}%` : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        公司: {config.insuranceType === 'injury' ? `${config.companyRate}%` : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        公司: {config.insuranceType === 'maternity' ? `${config.companyRate}%` : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(config)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => config.id && handleDelete(config.id)}
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
      </div>

      {/* 配置表单弹窗 */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingConfig ? "编辑社保配置" : "新增社保配置"}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    公司ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.companyId}
                    onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    养老保险-公司比例(%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.pensionCompanyRate}
                    onChange={(e) => setFormData({ ...formData, pensionCompanyRate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    养老保险-个人比例(%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.pensionPersonalRate}
                    onChange={(e) => setFormData({ ...formData, pensionPersonalRate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    医疗保险-公司比例(%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.medicalCompanyRate}
                    onChange={(e) => setFormData({ ...formData, medicalCompanyRate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    医疗保险-个人比例(%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.medicalPersonalRate}
                    onChange={(e) => setFormData({ ...formData, medicalPersonalRate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    失业保险-公司比例(%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.unemploymentCompanyRate}
                    onChange={(e) => setFormData({ ...formData, unemploymentCompanyRate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    失业保险-个人比例(%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.unemploymentPersonalRate}
                    onChange={(e) => setFormData({ ...formData, unemploymentPersonalRate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    工伤保险-公司比例(%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.workInjuryCompanyRate}
                    onChange={(e) => setFormData({ ...formData, workInjuryCompanyRate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    生育保险-公司比例(%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.maternityCompanyRate}
                    onChange={(e) => setFormData({ ...formData, maternityCompanyRate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
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