import { useState, useEffect } from "react";
import {
  Bell,
  User,
  Clock,
  CheckCircle,
  Search,
  FileText,
  MessageSquare,
  RefreshCw,
} from "lucide-react";
import { CustomerServiceService, CustomerServiceRequest, CustomerServiceStatistics } from "../utils/customerServiceService";
import toast from "react-hot-toast";

// 扩展接口以包含显示所需的额外字段
interface DisplayRequest extends CustomerServiceRequest {
  messageType: string;
  actionRequired: boolean;
  attachmentFileNames?: string[];
  processingNotes?: string;
}

export default function CustomerServiceView() {
  const [requests, setRequests] = useState<DisplayRequest[]>([]);
  const [statistics, setStatistics] = useState<CustomerServiceStatistics>({
    completedCount: 0,
    pendingCount: 0,
    processingCount: 0,
    urgentRequests: 0,
    highPriorityRequests: 0,
    requestsByType: {},
    requestsByStatus: {},
    requestsByPriority: {},
  });
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<DisplayRequest | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    size: 10,
    total: 0,
    pages: 0
  });

  // 移除实例化，使用静态方法

  // 获取消息类型
  const getMessageTypeFromRequestType = (requestType: string): string => {
    const typeMap: Record<string, string> = {
      'INVOICE': 'invoice',
      'PAYROLL': 'payroll', 
      'TAX': 'tax',
      'SOCIAL_INSURANCE': 'social_insurance',
      'HOUSING_FUND': 'housing_fund',
      'REPORT': 'report'
    };
    return typeMap[requestType] || 'other';
  };

  // 加载数据
  const loadData = async () => {
    try {
      setLoading(true);
      
      // 构建查询参数
      const queryParams = {
        page: pagination.current,
        size: pagination.size,
        keyword: searchTerm || undefined,
        requestType: selectedCategory !== 'all' ? selectedCategory : undefined
      };

      // 并行加载请求列表和统计信息
      const [listResponse, statsResponse] = await Promise.all([
        CustomerServiceService.queryRequests(queryParams),
        CustomerServiceService.getStatistics()
      ]);

      // 转换数据格式
      const displayRequests: DisplayRequest[] = listResponse.records.map((request: CustomerServiceRequest) => ({
        ...request,
        messageType: getMessageTypeFromRequestType(request.requestType),
        actionRequired: request.status === 'PENDING'
      }));

      setRequests(displayRequests);
      setStatistics(statsResponse);
      setPagination(prev => ({
        ...prev,
        total: listResponse.total,
        pages: listResponse.pages
      }));
    } catch (error) {
      console.error('加载数据失败:', error);
      toast.error('加载数据失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 更新请求状态
  const updateRequestStatus = async (requestId: number, status: string) => {
    try {
      await CustomerServiceService.updateRequest(requestId, { status });
      toast.success('状态更新成功');
      // 重新加载数据
      await loadData();
      // 如果当前选中的请求被更新，也要更新选中状态
      if (selectedMessage?.id === requestId) {
        setSelectedMessage(prev => prev ? { ...prev, status } : null);
      }
    } catch (error) {
      console.error('更新状态失败:', error);
      toast.error('更新状态失败，请稍后重试');
    }
  };

  // 刷新数据
  const refreshData = () => {
    loadData();
  };

  // 防抖搜索
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== undefined) {
        setPagination(prev => ({ ...prev, current: 1 }));
        loadData();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 分类变化时重新加载
  useEffect(() => {
    setPagination(prev => ({ ...prev, current: 1 }));
    loadData();
  }, [selectedCategory]);

  // 分页变化时重新加载
  useEffect(() => {
    loadData();
  }, [pagination.current, pagination.size]);

  // 初始加载
  useEffect(() => {
    loadData();
  }, []);

  const messageCategories = [
    {
      id: "all",
      label: "全部",
      count:
        statistics.processingCount +
        statistics.processingCount +
        statistics.completedCount,
    },
    { id: "PENDING", label: "待处理", count: statistics.processingCount },
    { id: "PROCESSING", label: "处理中", count: statistics.processingCount },
    { id: "COMPLETED", label: "已完成", count: statistics.completedCount },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-red-100 text-red-800';
      case 'PROCESSING':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '待处理';
      case 'PROCESSING':
        return '处理中';
      case 'COMPLETED':
        return '已完成';
      default:
        return status;
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return '高';
      case 'MEDIUM':
        return '中';
      case 'LOW':
        return '低';
      default:
        return priority;
    }
  };

  const sortedAndFilteredRequests = requests
    .filter(request => {
      if (selectedCategory === "all") return true;
      return request.status === selectedCategory;
    })
    .sort((a, b) => {
      // 优先级排序：HIGH > MEDIUM > LOW
      const priorityOrder = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      
      // 状态排序：PENDING > PROCESSING > COMPLETED
      const statusOrder = { 'PENDING': 3, 'PROCESSING': 2, 'COMPLETED': 1 };
      const aStatus = statusOrder[a.status as keyof typeof statusOrder] || 0;
      const bStatus = statusOrder[b.status as keyof typeof statusOrder] || 0;
      
      if (aStatus !== bStatus) {
        return bStatus - aStatus;
      }
      
      // 最后按创建时间排序
      return new Date(b.createTime).getTime() - new Date(a.createTime).getTime();
    });

  return (
    <div className="flex h-full bg-gray-50">
      {/* 左侧面板 */}
      <div className="w-1/2 bg-white border-r border-gray-200 flex flex-col">
        {/* 统计卡片 */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">客服中心</h2>
            <button
              onClick={refreshData}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="刷新数据"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-red-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {statistics.processingCount}
              </div>
              <div className="text-sm text-red-600">待处理</div>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {statistics.processingCount}
              </div>
              <div className="text-sm text-yellow-600">处理中</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {statistics.completedCount}
              </div>
              <div className="text-sm text-green-600">已完成</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {statistics.highPriorityRequests}
              </div>
              <div className="text-sm text-purple-600">重要优先级</div>
            </div>
          </div>
        </div>

        {/* 搜索框 */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="搜索客户姓名、公司或请求标题..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* 分类筛选 */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex space-x-2 overflow-x-auto">
            {messageCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? "bg-blue-100 text-blue-700 border border-blue-200"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <span>{category.label}</span>
                <span className="bg-white px-2 py-1 rounded-full text-xs font-medium">
                  {category.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 请求列表 */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : sortedAndFilteredRequests.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-500">
              暂无请求
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {sortedAndFilteredRequests.map((request) => (
                <div
                  key={request.id}
                  onClick={() => setSelectedMessage(request)}
                  className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                    selectedMessage?.id === request.id
                      ? "bg-blue-50 border-r-2 border-blue-500"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {request.customerName}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {request.companyName}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {request.requestTitle}
                      </p>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            request.status
                          )}`}
                        >
                          {getStatusText(request.status)}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                            request.priority
                          )}`}
                        >
                          {getPriorityText(request.priority)}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <span className="text-xs text-gray-500">
                        {new Date(request.createTime).toLocaleDateString()}
                      </span>
                      {request.actionRequired && (
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 分页控件 */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              显示{" "}
              {Math.min(
                (pagination.current - 1) * pagination.size + 1,
                pagination.total
              )}{" "}
              -{" "}
              {Math.min(pagination.current * pagination.size, pagination.total)}{" "}
              条，共 {pagination.total} 条
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    current: Math.max(1, prev.current - 1),
                  }))
                }
                disabled={pagination.current <= 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                上一页
              </button>
              <span className="text-sm text-gray-700">
                第 {pagination.current} / {pagination.pages} 页
              </span>
              <button
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    current: Math.min(prev.pages, prev.current + 1),
                  }))
                }
                disabled={pagination.current >= pagination.pages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                下一页
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 右侧详情面板 */}
      <div className="w-1/2 bg-white flex flex-col">
        {selectedMessage ? (
          <>
            {/* 详情头部 */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {selectedMessage.requestTitle}
                  </h2>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>{selectedMessage.customerName}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Bell className="h-4 w-4" />
                      <span>{selectedMessage.companyName}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>
                        {new Date(selectedMessage.createTime).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      selectedMessage.status
                    )}`}
                  >
                    {getStatusText(selectedMessage.status)}
                  </span>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(
                      selectedMessage.priority
                    )}`}
                  >
                    {getPriorityText(selectedMessage.priority)}
                  </span>
                </div>
              </div>
            </div>

            {/* 详情内容 */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* 基本信息 */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    基本信息
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          客户姓名
                        </label>
                        <p className="text-sm text-gray-900">
                          {selectedMessage.customerName}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          公司名称
                        </label>
                        <p className="text-sm text-gray-900">
                          {selectedMessage.companyName}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          联系电话
                        </label>
                        <p className="text-sm text-gray-900">
                          {selectedMessage.customerPhone || "未提供"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          邮箱地址
                        </label>
                        <p className="text-sm text-gray-900">
                          {selectedMessage.customerEmail || "未提供"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 请求内容 */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    请求内容
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">
                      {selectedMessage.requestContent}
                    </p>
                  </div>
                </div>

                {/* 处理备注 */}
                {selectedMessage.processRemark && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      处理备注
                    </h3>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedMessage.processingNotes ||
                          selectedMessage.processRemark ||
                          "暂无处理备注"}
                      </p>
                    </div>
                  </div>
                )}

                {/* 附件列表 */}
                {selectedMessage.attachmentFileNames &&
                  selectedMessage.attachmentFileNames.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">
                        相关附件
                      </h3>
                      <div className="space-y-2">
                        {selectedMessage.attachmentFileNames.map(
                          (fileName, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg"
                            >
                              <FileText className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-900">
                                {fileName}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="p-6 border-t border-gray-200">
              <div className="flex justify-between">
                <div className="flex space-x-2">
                  <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                    <MessageSquare className="h-4 w-4" />
                    <span>添加回复</span>
                  </button>
                  {selectedMessage.status === "PENDING" && (
                    <button
                      onClick={() =>
                        updateRequestStatus(selectedMessage.id, "PROCESSING")
                      }
                      className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                    >
                      <Clock className="h-4 w-4" />
                      <span>标记处理中</span>
                    </button>
                  )}
                </div>
                <div className="flex space-x-2">
                  {(selectedMessage.status === "PENDING" ||
                    selectedMessage.status === "PROCESSING") && (
                    <button
                      onClick={() =>
                        updateRequestStatus(selectedMessage.id, "COMPLETED")
                      }
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>标记完成</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>请选择一个请求查看详情</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
