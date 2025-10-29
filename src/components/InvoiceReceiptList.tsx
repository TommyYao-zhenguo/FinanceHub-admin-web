import React, { useState, useEffect } from "react";
import {
  Receipt,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
} from "lucide-react";
import {
  InvoiceManagementService,
  InvoiceReceiptResponse,
  InvoiceReceiptPageResponse,
} from "../services/invoiceManagementService";
import { useAlert } from "../hooks/useAlert";

interface InvoiceReceiptListProps {
  className?: string;
}

export const InvoiceReceiptList: React.FC<InvoiceReceiptListProps> = ({
  className = "",
}) => {
  const [receipts, setReceipts] = useState<InvoiceReceiptResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    size: 10,
    total: 0,
    pages: 0,
  });
  const [selectedReceipt, setSelectedReceipt] =
    useState<InvoiceReceiptResponse | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const { showAlert } = useAlert();

  // 加载发票明细列表
  const loadReceiptList = async (current: number = 1, size: number = 10) => {
    try {
      setLoading(true);
      const response: InvoiceReceiptPageResponse =
        await InvoiceManagementService.getInvoiceReceiptList(current, size);

      setReceipts(response.records || []);
      setPagination({
        current: response.current || current,
        size: response.size || size,
        total: response.total || 0,
        pages: response.pages || 0,
      });
    } catch (error) {
      console.error("加载发票明细失败:", error);
      showAlert({ message: "加载发票明细失败，请重试", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载时加载数据
  useEffect(() => {
    console.log("组件挂载，加载发票明细列表...");
    loadReceiptList(1, 10); // 重置到第一页
  }, []);

  // 处理分页变化
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      loadReceiptList(newPage, pagination.size);
    }
  };

  // 处理每页大小变化
  const handlePageSizeChange = (newSize: number) => {
    loadReceiptList(1, newSize);
  };

  // 刷新数据
  const handleRefresh = () => {
    loadReceiptList(pagination.current, pagination.size);
  };

  // 查看详情
  const handleViewDetail = (receipt: InvoiceReceiptResponse) => {
    setSelectedReceipt(receipt);
    setShowDetailModal(true);
  };

  // 格式化金额
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("zh-CN", {
      style: "currency",
      currency: "CNY",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("zh-CN");
    } catch {
      return dateString;
    }
  };

  // 获取发票状态样式
  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case "normal":
        return "bg-green-100 text-green-800";
      case "invalid":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* 头部 */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Receipt className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              收到发票明细
            </h2>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              <span>刷新</span>
            </button>
          </div>
        </div>
      </div>

      {/* 表格内容 */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
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
                金额信息
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                状态
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                    <span className="text-gray-500">加载中...</span>
                  </div>
                </td>
              </tr>
            ) : receipts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center space-y-2">
                    <FileText className="w-12 h-12 text-gray-400" />
                    <span className="text-gray-500">暂无发票明细数据</span>
                  </div>
                </td>
              </tr>
            ) : (
              receipts.map((receipt) => (
                <tr key={receipt.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">
                        {receipt.invoiceNumber ||
                          receipt.digitalInvoiceNumber ||
                          "-"}
                      </div>
                      <div className="text-gray-500">
                        {receipt.invoiceCode && `代码: ${receipt.invoiceCode}`}
                      </div>
                      <div className="text-gray-500">
                        {formatDate(receipt.invoiceDate)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">
                        {receipt.sellerName || "-"}
                      </div>
                      <div className="text-gray-500">
                        {receipt.sellerTaxNumber || "-"}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">
                        {receipt.buyerName || "-"}
                      </div>
                      <div className="text-gray-500">
                        {receipt.buyerTaxNumber || "-"}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">
                        {formatAmount(receipt.totalAmount || 0)}
                      </div>
                      <div className="text-gray-500">
                        税额: {formatAmount(receipt.taxAmount || 0)}
                      </div>
                      <div className="text-gray-500">
                        税率: {((receipt.taxRate || 0) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyle(
                        receipt.invoiceStatus
                      )}`}
                    >
                      {receipt.invoiceStatus || "未知"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleViewDetail(receipt)}
                      className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                    >
                      <Eye className="w-4 h-4" />
                      <span>查看</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 分页 */}
      {!loading && receipts.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              显示 {(pagination.current - 1) * pagination.size + 1} 到{" "}
              {Math.min(pagination.current * pagination.size, pagination.total)}{" "}
              条， 共 {pagination.total} 条记录
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={pagination.size}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={10}>10条/页</option>
                <option value={20}>20条/页</option>
                <option value={50}>50条/页</option>
              </select>
              <button
                onClick={() => handlePageChange(pagination.current - 1)}
                disabled={pagination.current <= 1}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="px-3 py-1 text-sm text-gray-700">
                {pagination.current} / {pagination.pages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.current + 1)}
                disabled={pagination.current >= pagination.pages}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 详情模态框 */}
      {showDetailModal && selectedReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  发票详情
                </h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">关闭</span>
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    基本信息
                  </h4>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm text-gray-500">发票号码</dt>
                      <dd className="text-sm text-gray-900">
                        {selectedReceipt.invoiceNumber ||
                          selectedReceipt.digitalInvoiceNumber ||
                          "-"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">发票代码</dt>
                      <dd className="text-sm text-gray-900">
                        {selectedReceipt.invoiceCode || "-"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">开票日期</dt>
                      <dd className="text-sm text-gray-900">
                        {formatDate(selectedReceipt.invoiceDate)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">发票类型</dt>
                      <dd className="text-sm text-gray-900">
                        {selectedReceipt.invoiceType || "-"}
                      </dd>
                    </div>
                  </dl>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    销方信息
                  </h4>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm text-gray-500">销方名称</dt>
                      <dd className="text-sm text-gray-900">
                        {selectedReceipt.sellerName || "-"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">销方税号</dt>
                      <dd className="text-sm text-gray-900">
                        {selectedReceipt.sellerTaxNumber || "-"}
                      </dd>
                    </div>
                  </dl>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    购方信息
                  </h4>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm text-gray-500">购方名称</dt>
                      <dd className="text-sm text-gray-900">
                        {selectedReceipt.buyerName || "-"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">购方税号</dt>
                      <dd className="text-sm text-gray-900">
                        {selectedReceipt.buyerTaxNumber || "-"}
                      </dd>
                    </div>
                  </dl>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    商品信息
                  </h4>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm text-gray-500">商品名称</dt>
                      <dd className="text-sm text-gray-900">
                        {selectedReceipt.goodsOrServiceName || "-"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">规格型号</dt>
                      <dd className="text-sm text-gray-900">
                        {selectedReceipt.specification || "-"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">单位</dt>
                      <dd className="text-sm text-gray-900">
                        {selectedReceipt.unit || "-"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">数量</dt>
                      <dd className="text-sm text-gray-900">
                        {selectedReceipt.quantity || "-"}
                      </dd>
                    </div>
                  </dl>
                </div>
                <div className="md:col-span-2">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    金额信息
                  </h4>
                  <dl className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <dt className="text-sm text-gray-500">单价</dt>
                      <dd className="text-sm text-gray-900">
                        {formatAmount(selectedReceipt.unitPrice || 0)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">金额</dt>
                      <dd className="text-sm text-gray-900">
                        {formatAmount(selectedReceipt.amount || 0)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">税率</dt>
                      <dd className="text-sm text-gray-900">
                        {((selectedReceipt.taxRate || 0) * 100).toFixed(1)}%
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">税额</dt>
                      <dd className="text-sm text-gray-900">
                        {formatAmount(selectedReceipt.taxAmount || 0)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">价税合计</dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {formatAmount(selectedReceipt.totalAmount || 0)}
                      </dd>
                    </div>
                  </dl>
                </div>
                {selectedReceipt.remark && (
                  <div className="md:col-span-2">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      备注
                    </h4>
                    <p className="text-sm text-gray-900">
                      {selectedReceipt.remark}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
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
