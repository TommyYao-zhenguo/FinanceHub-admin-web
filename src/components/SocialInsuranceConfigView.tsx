import React, { useState, useEffect } from 'react';
import { Shield, Save, Plus, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { SocialInsuranceConfigService } from '../utils/socialInsuranceConfigService';
import { SocialInsuranceConfig } from '../types/socialInsuranceConfig';
import CompanySelector from './CompanySelector';

// 保险类型配置
const INSURANCE_TYPES = [
  { value: 'pension', label: '养老保险', color: 'bg-blue-500' },
  { value: 'medical', label: '医疗保险', color: 'bg-green-500' },
  { value: 'unemployment', label: '失业保险', color: 'bg-yellow-500' },
  { value: 'injury', label: '工伤保险', color: 'bg-red-500' },
  { value: 'maternity', label: '生育保险', color: 'bg-purple-500' },
];

export default function SocialInsuranceConfigView() {
  const [configs, setConfigs] = useState<SocialInsuranceConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchCompanyName, setSearchCompanyName] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [editingConfig, setEditingConfig] = useState<SocialInsuranceConfig | null>(null);


  // 新的批量配置表单数据
  const [batchFormData, setBatchFormData] = useState({
    companyId: '',
    configs: {
      pension: { personalRate: 8, companyRate: 16 },
      medical: { personalRate: 2, companyRate: 8 },
      unemployment: { personalRate: 0.5, companyRate: 0.5 },
      injury: { personalRate: 0, companyRate: 0.2 },
      maternity: { personalRate: 0, companyRate: 0.8 },
    }
  });

  useEffect(() => {
    loadConfigs();
  }, []);

  const fetchCompanyConfigs = async (companyId: string) => {
    try {
      const configs = await SocialInsuranceConfigService.getCompanyConfigs(companyId);
      // 将现有配置填充到表单中
      const updatedBatchFormData = { ...batchFormData };
      configs.forEach((config: SocialInsuranceConfig) => {
        const insuranceType = config.insuranceType;
        if (updatedBatchFormData.configs[insuranceType as keyof typeof updatedBatchFormData.configs]) {
          updatedBatchFormData.configs[insuranceType as keyof typeof updatedBatchFormData.configs].personalRate = config.personalRate * 100; // 转换为百分比
          updatedBatchFormData.configs[insuranceType as keyof typeof updatedBatchFormData.configs].companyRate = config.companyRate * 100; // 转换为百分比
        }
      });
      setBatchFormData(updatedBatchFormData);
    } catch (error) {
      console.error('获取公司配置失败:', error);
    }
  };

  const loadConfigs = async (companyName?: string) => {
    try {
      setLoading(true);
      const params = companyName ? { companyName } : {};
      const data = await SocialInsuranceConfigService.getConfigList(params);
      console.log('social insurance configs: ', data);
      setConfigs(data.records);
    } catch {
      toast.error('加载社保配置失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!batchFormData.companyId) {
      toast.error('请选择公司');
      return;
    }

    try {
      setLoading(true);
      
      // 构建批量配置数据
      const configs = Object.entries(batchFormData.configs).map(([type, rates]) => ({
        insuranceType: type,
        insuranceName: getInsuranceNameByType(type),
        companyRate: rates.companyRate,
        personalRate: rates.personalRate,
        isActive: true,
      }));

      const batchRequest = {
        companyId: batchFormData.companyId,
        configs,
      };

      await SocialInsuranceConfigService.batchConfigRates(batchRequest);
      toast.success('配置保存成功');

      setShowForm(false);
      setEditingConfig(null);
      resetForm();
      loadConfigs();
    } catch {
      toast.error('配置保存失败');
    } finally {
      setLoading(false);
    }
  };

  // 根据险种类型获取险种名称
  const getInsuranceNameByType = (type: string): string => {
    const typeMap: Record<string, string> = {
      pension: '养老保险',
      medical: '医疗保险',
      unemployment: '失业保险',
      injury: '工伤保险',
      maternity: '生育保险',
    };
    return typeMap[type] || type;
  };

  // 计算合计比例
  const calculateTotal = (personalRate: number, companyRate: number): string => {
    return (personalRate + companyRate).toFixed(1);
  };

  // 更新险种比例
  const updateInsuranceRate = (insuranceType: string, field: 'personalRate' | 'companyRate', value: number) => {
    setBatchFormData(prev => ({
      ...prev,
      configs: {
        ...prev.configs,
        [insuranceType]: {
          ...prev.configs[insuranceType as keyof typeof prev.configs],
          [field]: value,
        },
      },
    }));
  };

  const resetForm = () => {
    setBatchFormData({
      companyId: '',
      configs: {
        pension: { personalRate: 8, companyRate: 16 },
        medical: { personalRate: 2, companyRate: 8 },
        unemployment: { personalRate: 0.5, companyRate: 0.5 },
        injury: { personalRate: 0, companyRate: 0.2 },
        maternity: { personalRate: 0, companyRate: 0.8 },
      }
    });
  };

  const handleEdit = (config: SocialInsuranceConfig) => {
    setEditingConfig(config);
    // 编辑单个配置时，不需要设置批量表单数据
    setShowForm(true);
  };

  const handleDelete = async (configId: string) => {
    if (!confirm('确定要删除这个配置吗？')) return;

    try {
      await SocialInsuranceConfigService.deleteConfig(configId);
      toast.success('删除成功');
      await loadConfigs();
    } catch (error) {
      console.error('删除失败:', error);
      toast.error('删除失败，请重试');
    }
  };

  // 按公司分组配置
  const groupedConfigs = configs.reduce((acc, config) => {
    const key = config.companyId || 'unknown';
    if (!acc[key]) {
      acc[key] = {
        companyInfo: {
          companyId: config.companyId,
          companyName: config.companyName,
          taxNumber: config.taxNumber,
        },
        configs: [],
      };
    }
    acc[key].configs.push(config);
    return acc;
  }, {} as Record<string, { companyInfo: { companyId?: string; companyName?: string; taxNumber?: string }; configs: SocialInsuranceConfig[] }>);

  const getInsuranceTypeLabel = (type: string) => {
    return INSURANCE_TYPES.find(t => t.value === type)?.label || type;
  };

  const getInsuranceTypeColor = (type: string) => {
    return INSURANCE_TYPES.find(t => t.value === type)?.color || 'bg-gray-500';
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
            <p className="text-gray-600">管理各公司的社会保险缴费比例设置</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="搜索公司名称..."
              value={searchCompanyName}
              onChange={(e) => {
                setSearchCompanyName(e.target.value);
                loadConfigs(e.target.value || undefined);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
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
      <div className="space-y-6">
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-500">
            加载中...
          </div>
        ) : Object.keys(groupedConfigs).length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-500">
            暂无配置数据
          </div>
        ) : (
          Object.entries(groupedConfigs).map(([companyId, group]) => (
            <div key={companyId} className="bg-white rounded-xl shadow-sm border border-gray-200">
              {/* 公司信息头部 */}
              <div className="p-6 border-b border-gray-200 bg-gray-50 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {group.companyInfo.companyName || '未知公司'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      税号: {group.companyInfo.taxNumber || '-'} | 公司ID: {group.companyInfo.companyId || '-'}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {group.configs.length} 个险种配置
                  </div>
                </div>
              </div>

              {/* 险种配置列表 */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.configs.map((config) => (
                    <div key={config.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${getInsuranceTypeColor(config.insuranceType)}`}></div>
                          <h4 className="font-medium text-gray-900">
                            {getInsuranceTypeLabel(config.insuranceType)}
                          </h4>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleEdit(config)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(config.id!)}
                            className="text-red-600 hover:text-red-900 p-1 rounded"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">公司比例:</span>
                          <span className="font-medium">{config.companyRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">个人比例:</span>
                          <span className="font-medium">{config.personalRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">状态:</span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            config.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {config.isActive ? '启用' : '禁用'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 配置表单弹窗 */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingConfig ? '编辑社保配置' : '新增社保配置'}
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
              {!editingConfig && (
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      所属公司 <span className="text-red-500">*</span>
                    </label>
                    <CompanySelector
                      value={batchFormData.companyId}
                      onChange={(companyId: string) => {
                        setBatchFormData({ 
                          ...batchFormData, 
                          companyId: companyId || '' 
                        });
                        if (companyId) {
                          fetchCompanyConfigs(companyId);
                        }
                      }}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
              
              {editingConfig && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">编辑配置：</span>
                    {editingConfig.companyName ? `${editingConfig.companyName} (${editingConfig.taxNumber})` : `公司ID: ${editingConfig.companyId}`}
                    <span className="ml-4 font-medium">险种：</span>
                    {getInsuranceTypeLabel(editingConfig.insuranceType)}
                  </div>
                </div>
              )}
              
              {/* 社保比例配置卡片 */}
              <div className="space-y-4">
                {/* 养老保险 */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium text-gray-900">养老保险</h4>
                    <span className="text-sm text-gray-500">固定比例</span>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        个人缴费比例 (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={batchFormData.configs.pension.personalRate}
                        onChange={(e) => updateInsuranceRate('pension', 'personalRate', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        公司缴费比例 (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={batchFormData.configs.pension.companyRate}
                        onChange={(e) => updateInsuranceRate('pension', 'companyRate', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-gray-600">
                    合计缴费比例: {calculateTotal(batchFormData.configs.pension.personalRate, batchFormData.configs.pension.companyRate)}%
                  </div>
                </div>

                {/* 医疗保险 */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium text-gray-900">医疗保险</h4>
                    <span className="text-sm text-gray-500">固定比例</span>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        个人缴费比例 (%)
                      </label>
                      <input
                         type="number"
                         step="0.1"
                         min="0"
                         max="100"
                         value={batchFormData.configs.medical.personalRate}
                         onChange={(e) => updateInsuranceRate('medical', 'personalRate', parseFloat(e.target.value) || 0)}
                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                       />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        公司缴费比例 (%)
                      </label>
                      <input
                         type="number"
                         step="0.1"
                         min="0"
                         max="100"
                         value={batchFormData.configs.medical.companyRate}
                         onChange={(e) => updateInsuranceRate('medical', 'companyRate', parseFloat(e.target.value) || 0)}
                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                       />
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-gray-600">
                     合计缴费比例: {calculateTotal(batchFormData.configs.medical.personalRate, batchFormData.configs.medical.companyRate)}%
                   </div>
                </div>

                {/* 失业保险 */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium text-gray-900">失业保险</h4>
                    <span className="text-sm text-gray-500">固定比例</span>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        个人缴费比例 (%)
                      </label>
                      <input
                         type="number"
                         step="0.1"
                         min="0"
                         max="100"
                         value={batchFormData.configs.unemployment.personalRate}
                         onChange={(e) => updateInsuranceRate('unemployment', 'personalRate', parseFloat(e.target.value) || 0)}
                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                       />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        公司缴费比例 (%)
                      </label>
                      <input
                         type="number"
                         step="0.1"
                         min="0"
                         max="100"
                         value={batchFormData.configs.unemployment.companyRate}
                         onChange={(e) => updateInsuranceRate('unemployment', 'companyRate', parseFloat(e.target.value) || 0)}
                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                       />
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-gray-600">
                     合计缴费比例: {calculateTotal(batchFormData.configs.unemployment.personalRate, batchFormData.configs.unemployment.companyRate)}%
                   </div>
                </div>

                {/* 工伤保险 */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium text-gray-900">工伤保险</h4>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">固定比例</span>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        个人缴费比例 (%)
                      </label>
                      <input
                         type="number"
                         step="0.1"
                         min="0"
                         max="100"
                         value={batchFormData.configs.injury.personalRate}
                         onChange={(e) => updateInsuranceRate('injury', 'personalRate', parseFloat(e.target.value) || 0)}
                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                       />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        公司缴费比例 (%)
                      </label>
                      <input
                         type="number"
                         step="0.1"
                         min="0"
                         max="100"
                         value={batchFormData.configs.injury.companyRate}
                         onChange={(e) => updateInsuranceRate('injury', 'companyRate', parseFloat(e.target.value) || 0)}
                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                       />
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-gray-600">
                     合计缴费比例: {calculateTotal(batchFormData.configs.injury.personalRate, batchFormData.configs.injury.companyRate)}%
                   </div>
                </div>

                {/* 生育保险 */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium text-gray-900">生育保险</h4>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">固定比例</span>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        个人缴费比例 (%)
                      </label>
                      <input
                         type="number"
                         step="0.1"
                         min="0"
                         max="100"
                         value={batchFormData.configs.maternity.personalRate}
                         onChange={(e) => updateInsuranceRate('maternity', 'personalRate', parseFloat(e.target.value) || 0)}
                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                       />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        公司缴费比例 (%)
                      </label>
                      <input
                         type="number"
                         step="0.1"
                         min="0"
                         max="100"
                         value={batchFormData.configs.maternity.companyRate}
                         onChange={(e) => updateInsuranceRate('maternity', 'companyRate', parseFloat(e.target.value) || 0)}
                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                       />
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-gray-600">
                     合计缴费比例: {calculateTotal(batchFormData.configs.maternity.personalRate, batchFormData.configs.maternity.companyRate)}%
                   </div>
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
                  <span>{loading ? '保存中...' : '保存'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}