import { useState, useEffect } from "react";
import {
  Bell,
  User,
  Clock,
  CheckCircle,
  Search,
  MessageSquare,
  RefreshCw,
  AlarmClock,
  Upload,
  Paperclip,
  X,
} from "lucide-react";
import {
  CustomerServiceService,
  CustomerServiceRequest,
  CustomerServiceStatistics,
  CustomerServiceAttachment,
} from "../utils/customerServiceService";
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
    COMPLETED: 0,
    PENDING: 0,
    PROCESSING: 0,
    urgentRequests: 0,
    highPriorityRequests: 0,
    requestsByType: {},
    requestsByStatus: {},
    requestsByPriority: {},
  });
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<DisplayRequest | null>(
    null
  );
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<CustomerServiceAttachment[]>([]);
  const [attachmentLoading, setAttachmentLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    size: 10,
    total: 0,
    pages: 0,
  });

  // 移除实例化，使用静态方法

  // 获取消息类型
  const getMessageTypeFromTaskType = (taskType: string): string => {
    const typeMap: Record<string, string> = {
      INVOICE: "invoice",
      PAYROLL: "payroll",
      TAX: "tax",
      SOCIAL_INSURANCE: "social_insurance",
      HOUSING_FUND: "housing_fund",
      REPORT: "report",
    };
    return typeMap[taskType] || "other";
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
        status: selectedCategory !== "all" ? selectedCategory : undefined,
      };

      // 并行加载请求列表和统计信息
      const [listResponse, statsResponse] = await Promise.all([
        CustomerServiceService.queryRequests(queryParams),
        CustomerServiceService.getStatistics(),
      ]);

      // 转换数据格式
      const displayRequests: DisplayRequest[] = listResponse.records.map(
        (request: CustomerServiceRequest) => ({
          ...request,
          messageType: getMessageTypeFromTaskType(request.taskType),
          actionRequired: request.status === "PENDING",
        })
      );

      setRequests(displayRequests);
      setStatistics(statsResponse || {});
      setPagination((prev) => ({
        ...prev,
        total: listResponse.total,
        pages: listResponse.pages,
      }));

      // 更新刷新时间
      setLastRefreshTime(new Date());
    } catch (error) {
      console.error("加载数据失败:", error);
      toast.error("加载数据失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  // 更新请求状态
  const updateRequestStatus = async (requestId: number, status: string) => {
    try {
      await CustomerServiceService.updateRequest(requestId, { status });
      toast.success("状态更新成功");
      // 重新加载数据
      await loadData();
      // 如果当前选中的请求被更新，也要更新选中状态
      if (selectedMessage?.id === requestId) {
        setSelectedMessage((prev) => (prev ? { ...prev, status } : null));
      }
    } catch (error) {
      console.error("更新状态失败:", error);
      toast.error("更新状态失败，请稍后重试");
    }
  };

  // 刷新数据
  const refreshData = () => {
    loadData();
  };

  // 每秒钟刷新一次
  useEffect(() => {
    const interval = setInterval(refreshData, 1000 * 60 * 5);
    return () => clearInterval(interval);
  }, []);

  // 防抖搜索
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== undefined) {
        setPagination((prev) => ({ ...prev, current: 1 }));
        loadData();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 分类变化时重新加载
  useEffect(() => {
    setPagination((prev) => ({ ...prev, current: 1 }));
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

  // 当选中消息变化时，加载对应的附件
  useEffect(() => {
    if (selectedMessage) {
      loadExistingAttachments(selectedMessage.id);
    } else {
      setExistingAttachments([]);
    }
  }, [selectedMessage]);

  const messageCategories = [
    {
      id: "all",
      label: "全部",
      count: statistics
        ? statistics.PENDING + statistics.PROCESSING + statistics.COMPLETED
        : 0,
    },
    {
      id: "PENDING",
      label: "待处理",
      count: statistics.PENDING ? statistics.PENDING : 0,
    },
    {
      id: "PROCESSING",
      label: "处理中",
      count: statistics.PROCESSING ? statistics.PROCESSING : 0,
    },
    {
      id: "COMPLETED",
      label: "已完成",
      count: statistics.COMPLETED ? statistics.COMPLETED : 0,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-red-100 text-red-800";
      case "PROCESSING":
        return "bg-yellow-100 text-yellow-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTaskTypeColor = (taskType: string) => {
    switch (taskType) {
      case "INVOICE_APPLICATION":
        return "bg-red-100 text-red-800";
      case "EMPLOYEE_REMOVE":
        return "bg-yellow-100 text-yellow-800";
      case "EMPLOYEE_DELETE":
        return "bg-green-100 text-green-800";
      case "EMPLOYEE_ADD":
        return "bg-blue-100 text-blue-800";
      case "EMPLOYEE_EDIT":
        return "bg-purple-100 text-purple-800";
      case "COMPANY_CREATE":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "待处理";
      case "PROCESSING":
        return "处理中";
      case "COMPLETED":
        return "已完成";
      default:
        return status;
    }
  };

  const getTaskTypeText = (taskType: string) => {
    switch (taskType) {
      case "INVOICE_APPLICATION":
        return "申请开票";
      case "EMPLOYEE_REMOVE":
        return "员工离职";
      case "EMPLOYEE_DELETE":
        return "删除员工";
      case "EMPLOYEE_ADD":
        return "添加员工";
      case "EMPLOYEE_EDIT":
        return "修改员工";
      case "COMPANY_CREATE":
        return "新增公司";
      default:
        return taskType;
    }
  };

  // 处理文件上传
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setUploadedFiles((prev) => [...prev, ...newFiles]);
      toast.success(`已添加 ${newFiles.length} 个附件`);
    }
  };

  // 删除已上传的文件
  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    toast.success("已删除附件");
  };

  // 加载现有附件
  const loadExistingAttachments = async (taskId: number) => {
    try {
      setAttachmentLoading(true);
      const attachments = await CustomerServiceService.getAttachmentsByTaskId(taskId);
      setExistingAttachments(attachments);
    } catch (error) {
      console.error("加载附件失败:", error);
      toast.error("加载附件失败");
    } finally {
      setAttachmentLoading(false);
    }
  };

  // 提交附件
  const submitAttachments = async () => {
    if (!selectedMessage || uploadedFiles.length === 0) {
      toast.error("请先选择要上传的附件");
      return;
    }

    try {
      setAttachmentLoading(true);
      
      // 显示上传进度
      const totalFiles = uploadedFiles.length;
      let uploadedCount = 0;
      
      // 逐个上传文件到OSS
      for (const file of uploadedFiles) {
        try {
          uploadedCount++;
          toast.loading(`正在上传文件 ${uploadedCount}/${totalFiles}: ${file.name}`, {
            id: 'upload-progress'
          });
          
          await CustomerServiceService.uploadAttachment(
            file,
            selectedMessage.id,
            'RECEIPT',
            '客服回执附件'
          );
        } catch (fileError) {
          console.error(`上传文件 ${file.name} 失败:`, fileError);
          toast.error(`上传文件 ${file.name} 失败: ${fileError instanceof Error ? fileError.message : '未知错误'}`);
          throw fileError; // 重新抛出错误以停止后续上传
        }
      }
      
      toast.dismiss('upload-progress');
      toast.success(`成功上传 ${totalFiles} 个附件`);
      setUploadedFiles([]);
      
      // 重新加载附件列表
      await loadExistingAttachments(selectedMessage.id);
    } catch (error) {
      console.error("上传附件失败:", error);
      toast.dismiss('upload-progress');
      const errorMessage = error instanceof Error ? error.message : '上传失败，请重试';
      toast.error(errorMessage);
    } finally {
      setAttachmentLoading(false);
    }
  };

  // 删除现有附件
  const deleteExistingAttachment = async (attachmentId: number) => {
    if (!confirm('确定要删除这个附件吗？')) return;
    
    try {
      setAttachmentLoading(true);
      await CustomerServiceService.deleteAttachment(attachmentId);
      toast.success("附件删除成功");
      // 重新加载附件列表
      if (selectedMessage) {
        await loadExistingAttachments(selectedMessage.id);
      }
    } catch (error) {
      console.error("删除附件失败:", error);
      toast.error("删除附件失败，请重试");
    } finally {
      setAttachmentLoading(false);
    }
  };

  const sortedAndFilteredRequests = requests
    .filter((request) => {
      if (selectedCategory === "all") return true;
      return request.status === selectedCategory;
    })
    .sort((a, b) => {
      // 状态排序：PENDING > PROCESSING > COMPLETED
      const statusOrder = { PENDING: 3, PROCESSING: 2, COMPLETED: 1 };
      const aStatus = statusOrder[a.status as keyof typeof statusOrder] || 0;
      const bStatus = statusOrder[b.status as keyof typeof statusOrder] || 0;

      if (aStatus !== bStatus) {
        return bStatus - aStatus;
      }

      // 最后按创建时间排序
      return (
        new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
      );
    });

  return (
    <div className="flex h-full bg-gray-50">
      {/* 左侧面板 */}
      <div className="w-1/2 bg-white border-r border-gray-200 flex flex-col h-screen max-h-screen overflow-hidden">
        {/* 统计卡片 */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">任务中心</h2>
            <div className="flex items-center gap-3">
              {lastRefreshTime && (
                <span className="text-sm text-gray-500">
                  最近刷新:{" "}
                  {lastRefreshTime.toLocaleTimeString("zh-CN", {
                    hour12: false,
                  })}
                </span>
              )}
              <button
                onClick={refreshData}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="刷新数据"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-red-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {statistics.PENDING ? statistics.PENDING : 0}
              </div>
              <div className="text-sm text-red-600">待处理</div>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {statistics.PROCESSING ? statistics.PROCESSING : 0}
              </div>
              <div className="text-sm text-yellow-600">处理中</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {statistics.COMPLETED ? statistics.COMPLETED : 0}
              </div>
              <div className="text-sm text-green-600">已完成</div>
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
                  {category.count ? category.count : 0}
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
              暂无任务需要处理。
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
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTaskTypeColor(
                            request.taskType
                          )}`}
                        >
                          {getTaskTypeText(request.taskType)}
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
      <div className="w-1/2 bg-white flex flex-col h-screen max-h-screen overflow-hidden">
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
                </div>
              </div>
            </div>

            {/* 详情内容 */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* 基本信息 */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    客户信息
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
                    </div>
                  </div>
                </div>

                {/* 服务类型 */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    任务类型
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTaskTypeColor(
                        selectedMessage.taskType
                      )}`}
                    >
                      {getTaskTypeText(selectedMessage.taskType)}
                    </span>
                  </div>
                </div>

                {/* 任务内容 */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    任务内容
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div
                      className="text-sm text-gray-900 whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{
                        __html: selectedMessage.requestContent,
                      }}
                    />
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

                {/* 时间线信息 */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    时间线信息
                  </h3>
                  <div className="relative">
                    {/* 时间线连接线 */}
                    <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-200"></div>

                    <div className="space-y-6">
                      {/* 创建时间 */}
                      <div className="relative flex items-center space-x-3">
                        <div className="flex-shrink-0 relative z-10">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center border-2 border-white">
                            <Clock className="w-4 h-4 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            任务创建
                          </p>
                          <p className="text-sm text-gray-500">
                            {selectedMessage.createTime}
                          </p>
                        </div>
                      </div>

                      {/* 处理时间 */}
                      {selectedMessage.processingTime && (
                        <div className="relative flex items-center space-x-3">
                          <div className="flex-shrink-0 relative z-10">
                            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center border-2 border-white">
                              <RefreshCw className="w-4 h-4 text-yellow-600" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              开始处理
                            </p>
                            <p className="text-sm text-gray-500">
                              {selectedMessage.processingTime}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* 完成时间 */}
                      {selectedMessage.completionTime && (
                        <div className="relative flex items-center space-x-3">
                          <div className="flex-shrink-0 relative z-10">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center border-2 border-white">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              处理完成
                            </p>
                            <p className="text-sm text-gray-500">
                              {selectedMessage.completionTime}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 回执附件上传区域 */}

            <div className="p-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                上传回执附件
              </h3>

              {/* 文件上传区域 */}
              <div className="mb-4">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer transition-colors">
                    <Upload className="h-4 w-4" />
                    <span>选择文件</span>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                    />
                  </label>
                  {uploadedFiles.length > 0 && (
                    <button
                      onClick={submitAttachments}
                      disabled={attachmentLoading}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Paperclip className="h-4 w-4" />
                      <span>
                        {attachmentLoading ? '上传中...' : `提交附件 (${uploadedFiles.length})`}
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {/* 现有附件列表 */}
              {existingAttachments.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    已上传的附件:
                  </h4>
                  <div className="space-y-2">
                    {existingAttachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <Paperclip className="h-4 w-4 text-green-600" />
                          <div>
                            <span className="text-sm font-medium text-green-800">
                              {attachment.originalFileName}
                            </span>
                            <div className="text-xs text-green-600">
                              {(attachment.fileSize / 1024).toFixed(1)} KB • {attachment.uploaderName} • {attachment.createTime}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteExistingAttachment(attachment.id)}
                          disabled={attachmentLoading}
                          className="p-1 text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 已选择的文件列表 */}
              {uploadedFiles.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    待上传的文件:
                  </h4>
                  <div className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 p-2 rounded-lg"
                      >
                        <div className="flex items-center space-x-2">
                          <Paperclip className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-700">
                            {file.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="p-1 text-red-500 hover:text-red-700 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 操作按钮 */}
            <div className="p-6 border-t border-gray-200">
              <div className="flex justify-between">
                <div className="flex space-x-2">
                  {selectedMessage.status === "PENDING" && (
                    <button
                      onClick={() =>
                        updateRequestStatus(selectedMessage.id, "PROCESSING")
                      }
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <AlarmClock className="h-4 w-4" />
                      <span>开始处理</span>
                    </button>
                  )}
                </div>
                <div className="flex space-x-2">
                  {selectedMessage.status === "PROCESSING" && (
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
}
