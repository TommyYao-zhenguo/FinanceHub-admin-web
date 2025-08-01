import React, { useState } from "react";
import {
  Bell,
  User,
  Clock,
  CheckCircle,
  Search,
  MoreHorizontal,
  Receipt,
  FileText,
  Users,
  Shield,
  Home,
  CreditCard,
  MessageSquare,
  Archive,
  Trash2,
  CheckSquare,
  Square,
} from "lucide-react";

interface CustomerServiceViewProps {
  showBalances: boolean;
  onToggleBalances: () => void;
}

interface NotificationMessage {
  id: string;
  customerId: string;
  customerName: string;
  customerCompany: string;
  messageType:
    | "payroll"
    | "tax"
    | "social_insurance"
    | "housing_fund"
    | "invoice"
    | "appointment"
    | "report";
  title: string;
  content: string;
  timestamp: string;
  status: "unread" | "read" | "processing" | "completed";
  priority: "low" | "medium" | "high" | "urgent";
  actionRequired: boolean;
  relatedData?: any;
}

export default function CustomerServiceView({
  showBalances,
  onToggleBalances,
}: CustomerServiceViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedMessage, setSelectedMessage] =
    useState<NotificationMessage | null>(null);
  const [showMessageDetail, setShowMessageDetail] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(
    new Set()
  );

  // 模拟消息数据
  const notifications: NotificationMessage[] = [
    {
      id: "MSG001",
      customerId: "CUST001",
      customerName: "张先生",
      customerCompany: "北京科技有限公司",
      messageType: "invoice",
      title: "新的开票申请",
      content: "开票申请：¥113,000.00 - 增值税专用发票 - 技术服务费",
      timestamp: "2024-01-20 14:30:25",
      status: "unread",
      priority: "high",
      actionRequired: true,
      relatedData: {
        invoiceAmount: 113000,
        invoiceType: "增值税专用发票",
        content: "技术服务费",
      },
    },
    {
      id: "MSG008",
      customerId: "CUST006",
      customerName: "孙总",
      customerCompany: "杭州电商有限公司",
      messageType: "invoice",
      title: "开票申请修改",
      content: "修改开票：金额 ¥85,000.00 → 软件开发服务",
      timestamp: "2024-01-20 16:15:30",
      status: "unread",
      priority: "medium",
      actionRequired: true,
      relatedData: {
        invoiceAmount: 85000,
        invoiceType: "增值税专用发票",
        content: "软件开发服务",
      },
    },
    {
      id: "MSG002",
      customerId: "CUST002",
      customerName: "李女士",
      customerCompany: "上海贸易有限公司",
      messageType: "payroll",
      title: "员工信息更新",
      content: "新增员工：王五 - 会计师 - ¥10,000/月",
      timestamp: "2024-01-20 13:45:12",
      status: "read",
      priority: "medium",
      actionRequired: false,
      relatedData: {
        employeeName: "王五",
        position: "会计师",
        salary: 10000,
      },
    },
    {
      id: "MSG009",
      customerId: "CUST007",
      customerName: "周经理",
      customerCompany: "武汉制造有限公司",
      messageType: "payroll",
      title: "工资发放确认",
      content: "确认工资发放：12名员工 - 总计¥156,000.00",
      timestamp: "2024-01-20 11:20:45",
      status: "processing",
      priority: "high",
      actionRequired: true,
      relatedData: {
        employeeCount: 12,
        totalAmount: 156000,
      },
    },
    {
      id: "MSG003",
      customerId: "CUST001",
      customerName: "张先生",
      customerCompany: "北京科技有限公司",
      messageType: "tax",
      title: "税费缴纳完成",
      content: "完成缴税：增值税 ¥45,600.00",
      timestamp: "2024-01-20 12:35:08",
      status: "read",
      priority: "low",
      actionRequired: false,
      relatedData: {
        taxType: "增值税",
        amount: 45600,
      },
    },
    {
      id: "MSG010",
      customerId: "CUST008",
      customerName: "吴总",
      customerCompany: "南京服务有限公司",
      messageType: "tax",
      title: "企业所得税申报",
      content: "申报企业所得税：¥125,000.00 - 2024年Q1",
      timestamp: "2024-01-20 15:45:20",
      status: "unread",
      priority: "high",
      actionRequired: true,
      relatedData: {
        taxType: "企业所得税",
        amount: 125000,
        period: "2024年Q1",
      },
    },
    {
      id: "MSG004",
      customerId: "CUST003",
      customerName: "王总",
      customerCompany: "深圳制造有限公司",
      messageType: "social_insurance",
      title: "社保缴费提醒",
      content: "社保缴费到期提醒：¥28,500.00 - 截止2024-01-25",
      timestamp: "2024-01-20 11:20:45",
      status: "processing",
      priority: "medium",
      actionRequired: true,
      relatedData: {
        dueDate: "2024-01-25",
        amount: 28500,
      },
    },
    {
      id: "MSG011",
      customerId: "CUST009",
      customerName: "郑女士",
      customerCompany: "天津科技有限公司",
      messageType: "social_insurance",
      title: "社保基数调整",
      content: "调整社保基数：8名员工 - 新月缴费¥32,400.00",
      timestamp: "2024-01-20 09:30:15",
      status: "unread",
      priority: "medium",
      actionRequired: true,
      relatedData: {
        employeeCount: 8,
        newAmount: 32400,
      },
    },
    {
      id: "MSG005",
      customerId: "CUST004",
      customerName: "赵经理",
      customerCompany: "广州服务有限公司",
      messageType: "housing_fund",
      title: "公积金基数调整",
      content: "调整公积金基数：5名员工 - 新月缴存¥15,600.00",
      timestamp: "2024-01-20 10:15:30",
      status: "unread",
      priority: "medium",
      actionRequired: true,
      relatedData: {
        employeeCount: 5,
        newAmount: 15600,
      },
    },
    {
      id: "MSG012",
      customerId: "CUST010",
      customerName: "何总",
      customerCompany: "重庆建筑有限公司",
      messageType: "housing_fund",
      title: "公积金缴存完成",
      content: "完成公积金缴存：15名员工 - 总计¥24,000.00",
      timestamp: "2024-01-20 14:20:10",
      status: "read",
      priority: "low",
      actionRequired: false,
      relatedData: {
        employeeCount: 15,
        amount: 24000,
      },
    },
    {
      id: "MSG006",
      customerId: "CUST002",
      customerName: "李女士",
      customerCompany: "上海贸易有限公司",
      messageType: "report",
      title: "财务报表生成请求",
      content: "请求生成报表：2024年1月 - 损益表、资产负债表、现金流量表",
      timestamp: "2024-01-20 09:45:18",
      status: "completed",
      priority: "low",
      actionRequired: false,
      relatedData: {
        reportPeriod: "2024年1月",
        reportTypes: ["损益表", "资产负债表", "现金流量表"],
      },
    },
  ];

  const messageCategories = [
    {
      id: "all",
      name: "全部消息",
      icon: MessageSquare,
      color: "bg-gray-100 text-gray-600",
    },
    {
      id: "invoice",
      name: "开票",
      icon: CreditCard,
      color: "bg-green-100 text-green-600",
    },
    {
      id: "payroll",
      name: "人员工资",
      icon: Users,
      color: "bg-blue-100 text-blue-600",
    },
    {
      id: "tax",
      name: "税费",
      icon: Receipt,
      color: "bg-orange-100 text-orange-600",
    },
    {
      id: "social_insurance",
      name: "社会保险",
      icon: Shield,
      color: "bg-teal-100 text-teal-600",
    },
    {
      id: "housing_fund",
      name: "住房公积金",
      icon: Home,
      color: "bg-purple-100 text-purple-600",
    },
    {
      id: "report",
      name: "财务报表",
      icon: FileText,
      color: "bg-gray-100 text-gray-600",
    },
  ];

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case "payroll":
        return <Users className="h-4 w-4" />;
      case "tax":
        return <Receipt className="h-4 w-4" />;
      case "social_insurance":
        return <Shield className="h-4 w-4" />;
      case "housing_fund":
        return <Home className="h-4 w-4" />;
      case "invoice":
        return <CreditCard className="h-4 w-4" />;
      case "report":
        return <FileText className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case "payroll":
        return "bg-blue-100 text-blue-600 border-blue-200";
      case "tax":
        return "bg-orange-100 text-orange-600 border-orange-200";
      case "social_insurance":
        return "bg-teal-100 text-teal-600 border-teal-200";
      case "housing_fund":
        return "bg-purple-100 text-purple-600 border-purple-200";
      case "invoice":
        return "bg-green-100 text-green-600 border-green-200";
      case "report":
        return "bg-gray-100 text-gray-600 border-gray-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "unread":
        return "bg-red-100 text-red-800";
      case "read":
        return "bg-gray-100 text-gray-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "unread":
        return "未读";
      case "read":
        return "已读";
      case "processing":
        return "处理中";
      case "completed":
        return "已完成";
      default:
        return "未知";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "text-red-600";
      case "high":
        return "text-orange-600";
      case "medium":
        return "text-yellow-600";
      case "low":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "紧急";
      case "high":
        return "高";
      case "medium":
        return "中";
      case "low":
        return "低";
      default:
        return "普通";
    }
  };

  // 根据选中的分类过滤消息
  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.customerName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      notification.customerCompany
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      notification.title.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" ||
      notification.messageType === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // 按客户和时间排序
  const sortedNotifications = filteredNotifications.sort((a, b) => {
    // 首先按客户名称排序
    const customerCompare = a.customerName.localeCompare(b.customerName);
    if (customerCompare !== 0) return customerCompare;

    // 同一客户按时间倒序排序（最新的在前）
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  // 统计各分类的消息数量
  const getCategoryCount = (categoryId: string) => {
    if (categoryId === "all") return notifications.length;
    return notifications.filter((n) => n.messageType === categoryId).length;
  };

  const getCategoryUnreadCount = (categoryId: string) => {
    if (categoryId === "all")
      return notifications.filter((n) => n.status === "unread").length;
    return notifications.filter(
      (n) => n.messageType === categoryId && n.status === "unread"
    ).length;
  };

  const handleMessageClick = (message: NotificationMessage) => {
    setSelectedMessage(message);
    setShowMessageDetail(true);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return "刚刚";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}小时前`;
    } else {
      return (
        date.toLocaleDateString("zh-CN") +
        " " +
        date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })
      );
    }
  };

  const toggleMessageSelection = (messageId: string) => {
    const newSelected = new Set(selectedMessages);
    if (newSelected.has(messageId)) {
      newSelected.delete(messageId);
    } else {
      newSelected.add(messageId);
    }
    setSelectedMessages(newSelected);
  };

  const selectAllMessages = () => {
    const allSelected = sortedNotifications.every((msg) =>
      selectedMessages.has(msg.id)
    );

    if (allSelected) {
      // 取消选择所有消息
      setSelectedMessages(new Set());
    } else {
      // 选择所有消息
      const newSelected = new Set(sortedNotifications.map((msg) => msg.id));
      setSelectedMessages(newSelected);
    }
  };

  const handleBatchOperation = (operation: string) => {
    if (selectedMessages.size === 0) {
      alert("请先选择要操作的消息");
      return;
    }

    switch (operation) {
      case "mark_read":
        alert(`已将 ${selectedMessages.size} 条消息标记为已读`);
        break;
      case "mark_processing":
        alert(`已将 ${selectedMessages.size} 条消息标记为处理中`);
        break;
      case "mark_completed":
        alert(`已将 ${selectedMessages.size} 条消息标记为已完成`);
        break;
      case "archive":
        alert(`已归档 ${selectedMessages.size} 条消息`);
        break;
      case "delete":
        if (confirm(`确定要删除选中的 ${selectedMessages.size} 条消息吗？`)) {
          alert(`已删除 ${selectedMessages.size} 条消息`);
        }
        break;
    }
    setSelectedMessages(new Set());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">客服消息中心</h2>
          <p className="text-gray-600 mt-1">按类别管理客户操作通知和消息</p>
        </div>
      </div>

      {/* Main Content - Left Sidebar + Right Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex h-[650px]">
          {/* Left Sidebar - Categories */}
          <div className="w-56 border-r border-gray-200 bg-gray-50">
            <div className="p-5 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">
                消息分类
              </h3>
              <p className="text-sm text-gray-500 mt-1">按类别分组显示</p>
            </div>

            <div className="p-4 space-y-2">
              {messageCategories.map((category) => {
                const Icon = category.icon;
                const count = getCategoryCount(category.id);
                const unreadCount = getCategoryUnreadCount(category.id);
                const isActive = selectedCategory === category.id;

                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-blue-100 border border-blue-200 text-blue-700"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2.5 rounded-lg ${category.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-medium">
                          {category.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {count} 条消息
                        </div>
                      </div>
                    </div>
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Content - Messages */}
          <div className="flex-1 flex flex-col">
            {/* Search and Actions */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-900">
                  {messageCategories.find((c) => c.id === selectedCategory)
                    ?.name || "全部消息"}
                  <span className="text-sm text-gray-500 ml-2">
                    ({sortedNotifications.length} 条消息)
                  </span>
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={selectAllMessages}
                    className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800"
                  >
                    {sortedNotifications.length > 0 &&
                    sortedNotifications.every((msg) =>
                      selectedMessages.has(msg.id)
                    ) ? (
                      <CheckSquare className="h-4 w-4" />
                    ) : selectedMessages.size > 0 ? (
                      <div className="h-4 w-4 border border-gray-400 rounded bg-gray-200 flex items-center justify-center">
                        <div className="h-2 w-2 bg-blue-600 rounded"></div>
                      </div>
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                    <span>全选</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="搜索客户、公司或消息内容..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Batch Operations */}
            {selectedMessages.size > 0 && (
              <div className="bg-blue-50 border-b border-blue-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-blue-900">
                      已选择 {selectedMessages.size} 条消息
                    </span>
                    <button
                      onClick={() => setSelectedMessages(new Set())}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      取消选择
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleBatchOperation("mark_read")}
                      className="px-3 py-1 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
                    >
                      标记已读
                    </button>
                    <button
                      onClick={() => handleBatchOperation("mark_processing")}
                      className="px-3 py-1 text-sm bg-yellow-600 hover:bg-yellow-700 text-white rounded transition-colors"
                    >
                      标记处理中
                    </button>
                    <button
                      onClick={() => handleBatchOperation("mark_completed")}
                      className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                    >
                      标记完成
                    </button>
                    <button
                      onClick={() => handleBatchOperation("archive")}
                      className="px-3 py-1 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors"
                    >
                      归档
                    </button>
                    <button
                      onClick={() => handleBatchOperation("delete")}
                      className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto">
              {sortedNotifications.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {sortedNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 transition-colors ${
                        notification.status === "unread" ? "bg-blue-50" : ""
                      } ${
                        selectedMessages.has(notification.id)
                          ? "bg-blue-100"
                          : ""
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          {/* Checkbox */}
                          <button
                            onClick={() =>
                              toggleMessageSelection(notification.id)
                            }
                            className="mt-1 text-gray-400 hover:text-gray-600"
                          >
                            {selectedMessages.has(notification.id) ? (
                              <CheckSquare className="h-4 w-4 text-blue-600" />
                            ) : (
                              <Square className="h-4 w-4" />
                            )}
                          </button>

                          {/* Customer Avatar */}
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="h-4 w-4 text-gray-600" />
                          </div>

                          {/* Message Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="text-sm font-semibold text-gray-900">
                                {notification.customerName}
                              </h4>
                              <span className="text-xs text-gray-500">
                                {notification.customerCompany}
                              </span>
                              <div
                                className={`p-1 rounded ${getMessageTypeColor(
                                  notification.messageType
                                )}`}
                              >
                                {getMessageTypeIcon(notification.messageType)}
                              </div>
                            </div>

                            <h5 className="text-sm font-medium text-gray-900 mb-1">
                              {notification.title}
                            </h5>

                            <p className="text-sm text-gray-600 line-clamp-2">
                              {notification.content}
                            </p>

                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-xs text-gray-500">
                                {formatTimestamp(notification.timestamp)}
                              </span>
                              <span
                                className={`text-xs font-medium ${getPriorityColor(
                                  notification.priority
                                )}`}
                              >
                                优先级: {getPriorityText(notification.priority)}
                              </span>
                              {notification.actionRequired && (
                                <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
                                  需要操作
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Status and Actions */}
                        <div className="flex items-center space-x-3 ml-4">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              notification.status
                            )}`}
                          >
                            {getStatusText(notification.status)}
                          </span>
                          <button
                            onClick={() => handleMessageClick(notification)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            查看详情
                          </button>
                          <button className="text-gray-400 hover:text-gray-600 p-1 rounded">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    暂无消息
                  </h3>
                  <p className="text-gray-500">当前分类下没有消息</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Message Detail Modal */}
      {showMessageDetail && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div
                  className={`p-2 rounded-lg ${getMessageTypeColor(
                    selectedMessage.messageType
                  )}`}
                >
                  {getMessageTypeIcon(selectedMessage.messageType)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedMessage.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {selectedMessage.customerName} •{" "}
                    {selectedMessage.customerCompany}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowMessageDetail(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Message Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    优先级
                  </label>
                  <p
                    className={`text-sm font-medium ${getPriorityColor(
                      selectedMessage.priority
                    )}`}
                  >
                    {getPriorityText(selectedMessage.priority)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    状态
                  </label>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      selectedMessage.status
                    )}`}
                  >
                    {getStatusText(selectedMessage.status)}
                  </span>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    时间
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedMessage.timestamp}
                  </p>
                </div>
              </div>

              {/* Message Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  消息内容
                </label>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-900">
                    {selectedMessage.content}
                  </p>
                </div>
              </div>

              {/* Related Data */}
              {selectedMessage.relatedData && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    相关数据
                  </label>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                      {JSON.stringify(selectedMessage.relatedData, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="flex space-x-3">
                  <button className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors">
                    <Clock className="h-4 w-4" />
                    <span>标记为处理中</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                    <CheckCircle className="h-4 w-4" />
                    <span>标记为已完成</span>
                  </button>
                </div>
                <div className="flex space-x-2">
                  <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    <Archive className="h-4 w-4" />
                    <span>归档</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors">
                    <Trash2 className="h-4 w-4" />
                    <span>删除</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
