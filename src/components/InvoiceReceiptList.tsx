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
  InvoiceReceiptRecordResponse,
  InvoiceReceiptRecordPageResponse,
} from "../services/invoiceManagementService";
import { useAlert } from "../hooks/useAlert";

interface InvoiceReceiptListProps {
  className?: string;
}

export const InvoiceReceiptList: React.FC<InvoiceReceiptListProps> = ({
  className = "",
}) => {
  const [receipts, setReceipts] = useState<InvoiceReceiptRecordResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    size: 10,
    total: 0,
    pages: 0,
  });
  // 上传记录列表不需要详情弹窗

  const { showAlert } = useAlert();

  // 加载发票明细列表
  const loadReceiptList = async (current: number = 1, size: number = 10) => {
    try {
      setLoading(true);
      const response: InvoiceReceiptRecordPageResponse =
        await InvoiceManagementService.getInvoiceReceiptList(current, size);

      setReceipts(response.records || []);
      setPagination({
        current: response.current || current,
        size: response.size || size,
        total: response.total || 0,
        pages: response.pages || 0,
      });
    } catch (error) {
      console.error("加载上传记录失败:", error);
      showAlert({ message: "加载上传记录失败，请重试", type: "error" });
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

  // 上传记录无详情

  // 格式化日期
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("zh-CN");
    } catch {
      return dateString;
    }
  };

  // 上传记录不需要发票状态样式

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* 头部 */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Receipt className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              取得发票上传记录
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
                购方统一代码
              </th>

              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                是否成功
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                上传时间
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                失败原因
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
                <td colSpan={4} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center space-y-2">
                    <FileText className="w-12 h-12 text-gray-400" />
                    <span className="text-gray-500">暂无上传记录数据</span>
                  </div>
                </td>
              </tr>
            ) : (
              receipts.map((receipt) => (
                <tr key={receipt.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {receipt.buyerTaxNumber || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        receipt.success
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {receipt.success ? "成功" : "失败"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {receipt.createTime}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {receipt.failureReason || "-"}
                    </div>
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

      {/* 上传记录无详情模态框 */}
    </div>
  );
};
