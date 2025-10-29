import React, { useState, useEffect } from 'react';
import { Receipt, RefreshCw, ChevronLeft, ChevronRight, Eye, FileText, X } from 'lucide-react';
import {
  InvoiceIssueResponse,
  InvoiceIssuePageResponse,
  InvoiceManagementService,
} from "../services/invoiceManagementService";
import { useAlert } from '../hooks/useAlert';

export const InvoiceIssueList: React.FC = () => {
  const [invoices, setInvoices] = useState<InvoiceIssueResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    size: 10,
    total: 0,
    totalPages: 0
  });
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceIssueResponse | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const { showError } = useAlert();

  // 加载开具发票列表
  const loadIssueList = async (page: number = 1, size: number = 10) => {
    console.log('开始加载开具发票列表，页码:', page, '大小:', size);
    setLoading(true);
    try {
      const response: InvoiceIssuePageResponse =
        await InvoiceManagementService.getInvoiceIssueList(page, size);
      console.log('开具发票列表加载成功:', response);
      
      setInvoices(response.records || []);
      setPagination({
        current: response.current || 1,
        size: response.size || 10,
        total: response.total || 0,
        totalPages: response.pages || 0
      });
    } catch (error) {
      console.error('加载开具发票列表失败:', error);
      showError('加载开具发票列表失败');
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载时加载数据
  useEffect(() => {
    console.log('开具发票组件挂载，加载数据');
    loadIssueList(1, 10);
  }, []);

  // 处理分页变化
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      loadIssueList(newPage, pagination.size);
    }
  };

  // 刷新数据
  const handleRefresh = () => {
    loadIssueList(pagination.current, pagination.size);
  };

  // 格式化金额
  const formatAmount = (amount: number | null | undefined): string => {
    if (amount === null || amount === undefined) return '0.00';
    return amount.toLocaleString('zh-CN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // 格式化日期
  const formatDate = (dateStr: string | null | undefined): string => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('zh-CN');
    } catch {
      return dateStr;
    }
  };

  // 获取发票状态样式
  const getStatusStyle = (status: string | null | undefined) => {
    switch (status) {
      case '正常':
        return 'bg-green-100 text-green-800';
      case '作废':
        return 'bg-red-100 text-red-800';
      case '红冲':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* 头部操作栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Receipt className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">开具发票明细</h2>
          <span className="text-sm text-gray-500">
            共 {pagination.total} 条记录
          </span>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>刷新</span>
        </button>
      </div>

      {/* 发票列表 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2 text-gray-500">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>加载中...</span>
            </div>
          </div>
        ) : invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <FileText className="w-12 h-12 mb-4 text-gray-300" />
            <p className="text-lg font-medium">暂无开具发票数据</p>
            <p className="text-sm">请先上传开具发票Excel文件</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    发票信息
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    销方信息
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    购方信息
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    商品信息
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    金额信息
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.map((invoice, index) => (
                  <tr key={invoice.id || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900">
                          {invoice.invoiceCode || ''}
                        </div>
                        <div className="text-sm text-gray-500">
                          {invoice.invoiceNumber ? `号码: ${invoice.invoiceNumber}` : ''}
                        </div>
                        <div className="text-sm text-gray-500">
                          {invoice.digitalInvoiceNumber ? `数电: ${invoice.digitalInvoiceNumber}` : ''}
                        </div>
                        <div className="text-sm text-gray-500">
                          日期: {formatDate(invoice.invoiceDate)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900">
                          {invoice.sellerName || '-'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {invoice.sellerTaxNumber || '-'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900">
                          {invoice.buyerName || '-'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {invoice.buyerTaxNumber || '-'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900">
                          {invoice.goodsOrServiceName || '-'}
                        </div>
                        <div className="text-sm text-gray-500">
                          规格: {invoice.specification || '-'}
                        </div>
                        <div className="text-sm text-gray-500">
                          数量: {invoice.quantity || 0} {invoice.unit || ''}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900">
                          ¥{formatAmount(invoice.totalAmount)}
                        </div>
                        <div className="text-sm text-gray-500">
                          金额: ¥{formatAmount(invoice.amount)}
                        </div>
                        <div className="text-sm text-gray-500">
                          税额: ¥{formatAmount(invoice.taxAmount)}
                        </div>
                        <div className="text-sm text-gray-500">
                          税率: {invoice.taxRate ? `${(invoice.taxRate * 100).toFixed(0)}%` : '-'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="space-y-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyle(invoice.invoiceStatus)}`}>
                          {invoice.invoiceStatus || '未知'}
                        </span>
                        <div className="text-xs text-gray-500">
                          {invoice.riskLevel || '-'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        onClick={() => {
                          setSelectedInvoice(invoice);
                          setShowDetailModal(true);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        查看
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 分页组件 */}
      {!loading && invoices.length > 0 && (
        <div className="flex items-center justify-between bg-white px-6 py-3 border border-gray-200 rounded-lg">
          <div className="flex items-center text-sm text-gray-700">
            <span>
              显示第 {(pagination.current - 1) * pagination.size + 1} 到{' '}
              {Math.min(pagination.current * pagination.size, pagination.total)} 条，
              共 {pagination.total} 条记录
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(pagination.current - 1)}
              disabled={pagination.current <= 1}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              上一页
            </button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.current <= 3) {
                  pageNum = i + 1;
                } else if (pagination.current >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = pagination.current - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      pageNum === pagination.current
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(pagination.current + 1)}
              disabled={pagination.current >= pagination.totalPages}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一页
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* 发票详情弹窗 */}
      {showDetailModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* 弹窗头部 */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Receipt className="w-5 h-5 mr-2 text-blue-600" />
                发票详情
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* 弹窗内容 */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 基本信息 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">基本信息</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">发票代码</label>
                      <p className="text-sm text-gray-900">{selectedInvoice.invoiceCode || '-'}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">发票号码</label>
                      <p className="text-sm text-gray-900">{selectedInvoice.invoiceNumber || '-'}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">数电发票号码</label>
                      <p className="text-sm text-gray-900">{selectedInvoice.digitalInvoiceNumber || '-'}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">开票日期</label>
                      <p className="text-sm text-gray-900">
                        {selectedInvoice.invoiceDate ? new Date(selectedInvoice.invoiceDate).toLocaleDateString('zh-CN') : '-'}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">发票类型</label>
                      <p className="text-sm text-gray-900">{selectedInvoice.invoiceType || '-'}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">发票状态</label>
                      <p className="text-sm text-gray-900">{selectedInvoice.invoiceStatus || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* 销售方信息 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">销售方信息</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">销售方名称</label>
                      <p className="text-sm text-gray-900">{selectedInvoice.sellerName || '-'}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">销售方税号</label>
                      <p className="text-sm text-gray-900">{selectedInvoice.sellerTaxNumber || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* 购买方信息 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">购买方信息</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">购买方名称</label>
                      <p className="text-sm text-gray-900">{selectedInvoice.buyerName || '-'}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">购买方税号</label>
                      <p className="text-sm text-gray-900">{selectedInvoice.buyerTaxNumber || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* 商品信息 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">商品信息</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">货物或应税劳务名称</label>
                      <p className="text-sm text-gray-900">{selectedInvoice.goodsOrServiceName || '-'}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">规格型号</label>
                      <p className="text-sm text-gray-900">{selectedInvoice.specification || '-'}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">单位</label>
                      <p className="text-sm text-gray-900">{selectedInvoice.unit || '-'}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">数量</label>
                      <p className="text-sm text-gray-900">{selectedInvoice.quantity || '-'}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">单价</label>
                      <p className="text-sm text-gray-900">
                        {selectedInvoice.unitPrice ? `¥${selectedInvoice.unitPrice.toFixed(2)}` : '-'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 金额信息 */}
                <div className="space-y-4 md:col-span-2">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">金额信息</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">金额</label>
                      <p className="text-lg font-semibold text-gray-900">
                        {selectedInvoice.amount ? `¥${selectedInvoice.amount.toFixed(2)}` : '-'}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">税率</label>
                      <p className="text-lg font-semibold text-gray-900">
                        {selectedInvoice.taxRate ? `${(selectedInvoice.taxRate * 100).toFixed(2)}%` : '-'}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">税额</label>
                      <p className="text-lg font-semibold text-gray-900">
                        {selectedInvoice.taxAmount ? `¥${selectedInvoice.taxAmount.toFixed(2)}` : '-'}
                      </p>
                    </div>
                    
                    <div className="md:col-span-3">
                      <label className="text-sm font-medium text-gray-500">价税合计</label>
                      <p className="text-xl font-bold text-blue-600">
                        {selectedInvoice.totalAmount ? `¥${selectedInvoice.totalAmount.toFixed(2)}` : '-'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 其他信息 */}
                <div className="space-y-4 md:col-span-2">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">其他信息</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">税收分类编码</label>
                      <p className="text-sm text-gray-900">{selectedInvoice.taxClassificationCode || '-'}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">特定业务类型</label>
                      <p className="text-sm text-gray-900">{selectedInvoice.specificBusinessType || '-'}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">发票来源</label>
                      <p className="text-sm text-gray-900">{selectedInvoice.invoiceSource || '-'}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">是否正数发票</label>
                      <p className="text-sm text-gray-900">
                        {selectedInvoice.isPositiveInvoice !== undefined 
                          ? (selectedInvoice.isPositiveInvoice ? '是' : '否') 
                          : '-'}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">风险等级</label>
                      <p className="text-sm text-gray-900">{selectedInvoice.riskLevel || '-'}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">开票人</label>
                      <p className="text-sm text-gray-900">{selectedInvoice.issuer || '-'}</p>
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-500">备注</label>
                      <p className="text-sm text-gray-900">{selectedInvoice.remark || '-'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 弹窗底部 */}
            <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};